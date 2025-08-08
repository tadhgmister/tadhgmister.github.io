export function assert(condition:boolean, msg:string): asserts condition {
    if(!condition){
        throw new Error(msg);
    }
}
export function assert_never(val: never, message:string){
    throw Error(message);
}

export type JSONValue = undefined
    | null
    | boolean
    | number
    | string
    | JSONValue[]
    | {[k:string]: JSONValue}
// TODO figure out how to get the input to conform to json
export type HandlerConstraint = Record<string, (inp: any)=>Promise<JSONValue>>;
type HandlerOutputs<H extends HandlerConstraint> = Awaited<ReturnType<H[keyof H]>>;
type HandlerInputs<H extends HandlerConstraint> = Parameters<H[keyof H]>[0];
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

export class WorkerWrapper<H extends HandlerConstraint> {
    private nextId = 0;
    private promisesMap = new Map<number, (a:OutMsg<H>)=>void>();
    constructor(private readonly worker: Worker){
	this.worker.onmessage = ({data}: MessageEvent<OutMsg<H>>)=>{
	    const resolve = this.promisesMap.get(data.id);
	    if(resolve === undefined){
		throw new Error(`got message from worker for unexpected id: ${data.id}`)
	    }
	    resolve(data);
	};
	this.worker.onerror = (err)=>{
	    console.log(err);
	}
    }
    private postMsgToWorker<T extends keyof H>(id: number, type: T, input: HandlerInputs<Pick<H,T>>){
	const msg: InMsg<Pick<H,T>> = {id, input, type};
	this.worker.postMessage(msg);
    }
    public async delegate<T extends keyof H>(type: T, input: HandlerInputs<Pick<H,T>>): Promise<HandlerOutputs<Pick<H,T>>> {
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
}

export function workerSideRegisterHandlers<H extends HandlerConstraint>(handlers: H){

    addEventListener('message',  async <T extends keyof H>({data}: MessageEvent<InMsg<Pick<H,T>>>)=>{
	const meth = handlers[data.type];
	type TheTypeWeExpectResultToBe = OutMsgSuccess<Pick<H,T>>["value"]; //Awaited<ReturnType<typeof meth>>;
	let result: TheTypeWeExpectResultToBe ;
	try {
	    result = (await meth(data.input)) as TheTypeWeExpectResultToBe;
	} catch (err){
	    const out: OutMsgFail = {id: data.id, value: err, err: true}
	    postMessage(out);
	    return;
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
