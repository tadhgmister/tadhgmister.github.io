/**
 * asserts a condition, useful for typesafety
 */
export function assert(condition:boolean, msg:string): asserts condition {
    if(!condition){
        throw new Error(msg);
    }
}
/**
 * if executed this throws a runtime error with the given message, if
 * typescript believes this function can be reached with a value
 * (first argument) that has a useful value.
 */
export function assert_never(_val: never, message:string){
    throw Error(message);
}
/** returns a promise that resolves after the specified number of milliseconds */
export function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve)=>{setTimeout(resolve, milliseconds);});
}

export type JSONValue = undefined
    | null
    | boolean
    | number
    | string
    | JSONValue[]
    | {[k:string]: JSONValue}
// TODO figure out how to get the input to conform to json
export type HandlerConstraint = Record<string, (...args:unknown[])=>Promise<JSONValue>>;
type HandlerOutputs<H extends HandlerConstraint> = Awaited<ReturnType<H[keyof H]>>;
type HandlerInputs<H extends HandlerConstraint> = Parameters<H[keyof H]>;
export interface InMsg<H extends HandlerConstraint> {
    id: number;
    input: HandlerInputs<H>;
    type: keyof H;
}
export interface OutMsgSuccess<H extends HandlerConstraint> {
    id: number;
    err: false;
    value: HandlerOutputs<H>;
}
export interface OutMsgFail {
    id: number;
    err: true;
    value: unknown;
}
export type OutMsg<H extends HandlerConstraint> = OutMsgFail | OutMsgSuccess<H>;
/**
 * wrapper around a Worker object to convert basic post message API to promise handling
 *
 * should be used like:
 * `new WorkerWrapper<typeof import("./RELATIVE_FILE.js")["handlers"]>(new URL("./RELATIVE_FILE.js", import.meta.url))`
 *
 * where "./RELATIVE_FILE.js" is a relative path to a worker module that exports a `handlers` variable made with `workerSideRegisterHandlers`.
 *
 * To invoke one of the functions defined by the handlers, call `this.delegate` with the name of the function as the first argument and the arguments to the function as the rest of arguments.
 * They will be serialized and passed to the function on the worker side and the result passed back similarly serialized.
 * If the handler function throws an error the error is serialized and thrown by the delegate function.
 *
 * @see{workerSideRegisterHandlers}
 *
 * the generic doesn't have to directly use `typeof
 * import("...")["handlers"]`, if there is any way to import the
 * interface corresponding to the handler object passed to
 * `workerSideRegisterHandlers` it can be used instead, using `typeof
 * import` is recommended so if the module moves or otherwise path
 * becomes invalid the error is reported by the type import on the
 * same line that the uncheckable string passed to the url is
 * specified.
 */
export class WorkerWrapper<H extends HandlerConstraint> {
    /** TODO: this is stored as floating point so incrementing can 'fail' when we get high enough */
    private nextId = 0;
    /** record of outstanding requests */
    private readonly promisesMap = new Map<number, (a:OutMsg<H>)=>void>();
    /** holds the error to get delegate to throw if we can't delegate */
    private failedToLoadErr?: Error;
    /** TODO: identify if we can subclass Worker instead of being a wrapper, if not put the reasoning in this comment or a more relevant place.*/
    private readonly worker: Worker;
    constructor(private readonly url: URL){
	this.worker = new Worker(url, {type:"module"});
	this.worker.onmessage = ({data}: MessageEvent<OutMsg<H>>)=>{
	    const resolve = this.promisesMap.get(data.id);
	    if(resolve === undefined){
		throw new Error(`got message from worker for unexpected id: ${data.id}`)
	    }
	    resolve(data);
	};
	this.worker.onerror = (_ev)=>{
	    this.crashAllTasks(new ReferenceError(
		`${this.url} failed to load`, {cause:this.worker}));
	}
    }
    /** wrapper for calling worker.postMessage to aid with typesafety */
    private postMsgToWorker<T extends keyof H>(id: number, type: T, input: HandlerInputs<Pick<H,T>>){
	const msg: InMsg<Pick<H,T>> = {id, input, type};
	this.worker.postMessage(msg);
    }
    /**
     * calls the specified function on the worker
     * The inputs and result are serialized with standard worker data transfer, but otherwise
     * this has the same call semantics as invoking the function locally, if the handler throws an error this function throws the same (serialized) error.
     *
     * If the worker has been terminated or failed to load this throws a corresponding error.
     */
    public async delegate<T extends keyof H>(type: T, ...input: HandlerInputs<Pick<H,T>>): Promise<HandlerOutputs<Pick<H,T>>> {
	if(this.failedToLoadErr !== undefined){
	    throw this.failedToLoadErr;
	}
	const id = this.nextId++;
	const p = new Promise<OutMsg<Pick<H,T>>>((resolve)=>{
	    this.promisesMap.set(id, resolve);
	});
	this.postMsgToWorker(id, type, input);
	const ret = await p;
	this.promisesMap.delete(id);
	if(ret.err){
	    throw ret.value;
	} else {
	    return ret.value;
	}
    }
    /** terminates the worker and causes all outstanding calls to delegate to error */
    public terminate(){
	this.worker.terminate();
	this.crashAllTasks(new Error(`worker terminated ${this.url}`));
	
    }
    /** causes all calls to delegate that have not already returned (including future ones) to throw the given error */
    private crashAllTasks(err: Error){
	this.failedToLoadErr = err;
	for(const [id,resolve] of this.promisesMap.entries()){
	    resolve({id,err:true, value: this.failedToLoadErr});
	}
	this.promisesMap.clear();
    }
}
/**
 * use this in conjunction with `WorkerWrapper` to simplify worker message passing interface.
 *
 * should be used like this in a module intended to be used as a worker object:
 * ```ts
 * export const handlers = workerSideRegisterHandlers({
 *    async FUNC1(...ARGS){...},
 *    async FUNC2(...ARGS){...},
 * });
 * ```
 *
 * where the object passed has all asynchronous functions that should
 * be capable of being invoked from the main thread. This sets a
 * `onmessage` handler that matches with `WorkerWrapper.delegate` to
 * allow the main thread to call the handler functions pretty much as
 * if they were local functions.
 *
 * @param rethrowErrorsForDebugging when set to true errors from
 * handlers are both sent back to main thread and also left as an
 * uncaught error so the stack can be more accurately inspected
 *
 * @see{WorkerWrapper}
 */
export function workerSideRegisterHandlers<H extends HandlerConstraint>(handlers: H, rethrowErrorsForDebugging=false){

    addEventListener('message',  async <T extends keyof H>({data}: MessageEvent<InMsg<Pick<H,T>>>)=>{
	const meth = handlers[data.type];
	type TheTypeWeExpectResultToBe = OutMsgSuccess<Pick<H,T>>["value"]; //Awaited<ReturnType<typeof meth>>;
	let result: TheTypeWeExpectResultToBe ;
	try {
	    result = (await meth(...data.input)) as TheTypeWeExpectResultToBe;
	} catch (err){
	    const out: OutMsgFail = {id: data.id, value: err, err: true}
	    postMessage(out);
	    if(rethrowErrorsForDebugging){
		throw err;
	    }else{
		return;
	    }
	}
	const out: OutMsgSuccess<Pick<H,T>> = {id: data.id, value: result, err: false};
	postMessage(out);
	
    });
    return handlers;
}



/**
   gets the state manager to compute the child states one level down when visiting a state, meaning you get warned if a move will immidiately lead to a dead state even if you can't tell because of shroud
   TODO make this UI configurable
 */
export const COMPUTE_CHILDREN_ON_VISIT = true;
