// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

import { MoveQuality, type StateDetails, TubeHighlight, StateManager, StateUsefulness, computeMove } from "./graphystuffs.js";
import { initSettings } from "./settings.js";
import { assert, sleep, WorkerWrapper } from "./commonHelpers.js";

/**
 * alias to string, represents a serialized and normalized game state
 */
export type SerializedState = string & SerializedState_;
interface SerializedState_ {}
/**
 * this is the type used to represent a tube content
 * it will just be a string where each character represents a single block
 * there is no handling for empty space, the capacity of the tube is not stored with the data
 * this may change in the future to be an array if there is a compelling 
 * reason to use more than one character to represent colours
 */
export type TubeContent = string & TubeContent_;
interface TubeContent_ {}
/**
 * return type of `Tube.valueOf()` 
 * encodes the contents and the capacity.
 */
export type SerializedTube = string & SerializedTube_;
interface SerializedTube_ {}
/**
 * type of a single colour, is an alias to string to make code that refers to a colour a little clearer.
 */
export type Color = TubeContent[number]

export class Tube {
    public static loadFromSerial(serial: SerializedTube){

        // Use a regular expression to separate the number and the rest of the string (non-numeric content)
        const match = serial.match(/^(\d+)(.*)$/);
        if (!match) {
            throw new Error("Invalid serialized tube format");
        }

        // Extract the capacity as an integer and the rest as content
        const capacity = parseInt(match[1], 10);
        const content = match[2];  // This can contain any non-numeric characters

        // Create and return a new Tube instance
        return new Tube(content, capacity);
    }
    constructor(public readonly content: TubeContent, public readonly capacity: number){}
    /** returns a string with the content of the tube and the capacity. */
    public valueOf(): SerializedTube{return this.capacity.toString().concat(this.content);}
    /** returns a string similar to valueOf but with duplicate entries of the top removed */
    public valueOfStripped(): SerializedTube { return this.withTopRemoved(this.topCount-1).valueOf();}
    /**
     * returns the colour at the top of the tube
     * or undefined if the tube is empty
     */
    public get topColor(): Color | undefined{
        return this.content.at(-1);
    }
    /**
     * returns the number of elements of the same colour at the top of the tube.
     * is 0 for an empty tube, the length of the whole tube if it is pure, otherwise between 1 and that length
     */
    public get topCount(){
        const col = this.topColor;
        if(col === undefined){
            return 0; // the tube is empty
        }
        for(let idx=this.content.length-2;idx>=0;idx--){
            if(this.content[idx]!==col){
                // for the index of the last ball of the same colour the count is len - idx
                // since this is the ball below it we - 1 as well.
                return this.content.length - idx - 1;
            }
        }
        // all the colours are the same as the top colour
        return this.content.length;
    }
    /**
     * returns true if every ball in this tube is the same colour or tube is empty
     */
    public get isPure(){
        return this.topCount === this.content.length;
    }
    /**
     * returns true if the tube is empty
     */
    public get isEmpty(){
        return this.content.length === 0;
    }
    /**
     * returns the amount of space in this tube given a capacity
     * this is how many balls of the same colour this.topColor could be added to this tube
     * @param capacity the total capacity of the tube
     * @returns the empty space at the top of the tube
     */
    public get slack(){
        return this.capacity - this.content.length;
    }
    public get shroud(){
        return this.capacity - this.slack - this.topCount;
    }
    /**
     * @returns a new Tube with the specified amount of elements removed
     * */
    public withTopRemoved(count_of_removal:number){
        //if(count_of_removal == this.content.length){return Tube.EMPTY;}
        return new Tube(this.content.slice(0, this.content.length - count_of_removal), this.capacity);
    }
    /**
     * returns a new tube with the given addition to the top.
     * Note this function doesn't validate that it matches the colour or stays within the capacity
     * @param addition new contents to put at the top of this tube
     * @returns a tube with the addition added to the top
     */
    public withAdded(addition: TubeContent, repetitions=1){
        return new Tube(this.content.concat(addition.repeat(repetitions)), this.capacity);
    }
    public moveToEmpty(capacityOfDest:number){
        const {topColor, topCount} = this;
        if(capacityOfDest < topCount){
            throw new Error("tried to move to a tube that doesn't have enough space for the balls trying to move to it");
        } else if(topColor===undefined){
            throw new Error("you tried to move the contents of an empty tube to another empty tube?");
            // console.error("moving empty to empty???");
            // return [this, new Tube("", capacityOfDest)];
        }
        const thingy = new Tube(topColor.repeat(topCount), capacityOfDest);
        return [this.withTopRemoved(topCount), thingy];
    }
    /**
     * returns a modified version of this tube and modifies the list of tubes passed in place
     *  corresponds to moving balls from this tube into others until it is cleared of the top colour
     * or we run out of destination tubes
     * 
     * note that if this tube is present in the list of other tubes it is skipped, 
     * you must set that element to the return value of this function to maintain a valid state.
     * 
     * returns `this` by reference if nothing is done, either there are no viable destinations with slack or this is empty.
     * @param others list of tubes to move colours into, is modified in place
     * @returns the new contents of this tube after moving the top colour into the other tubes
     */
    private moveToOthers(others: Tube[], ignoreEmpty = true){
        const color = this.topColor;
        if(color === undefined){return this;} // this tube is empty, nothing to do
        const topCount = this.topCount;
        let ballsLeftToMove = topCount;
        for(let idx=0; idx<others.length && ballsLeftToMove>0; idx++){
            const dest = others[idx];
            // skip if destination is this tube or if it contains another colour
            // note that dest.topColor would be undefined if it is empty so we only skip
            // if it isn't empty (has another colour) or we are ignoring empty, otherwise this is a totally valid target.
            if(dest === this || (dest.topColor!==color && (ignoreEmpty || !dest.isEmpty))){continue;} // the tube is another colour
            const slack = dest.slack;
            if(slack === 0){continue;} // tube has no space
            const movedToThisDest = slack < ballsLeftToMove ? slack : ballsLeftToMove;
            others[idx] = dest.withAdded(color, movedToThisDest);
            ballsLeftToMove -= movedToThisDest;
        }
        if(ballsLeftToMove === topCount){return this;}//nothing happened
        return this.withTopRemoved(topCount - ballsLeftToMove);
    }
    /**
     * collects a colour from the tops of all tubes into an empty tube
     * modifies the list of tubes passed as argument and returns a new tube with the balls that were removed from there
     * @param tubes game state to take balls from
     * @param color the color to take
     * @returns a pure tube with all the balls taken from the rest of the tubes
     */
    private static collect(tubes: Tube[], color: Color, capacity: number){
        let nCollected = 0;
        for(const [idx,tube] of tubes.entries()){
            if(tube.topColor !== color){continue;}
            let count = tube.topCount;
            if(nCollected + count > capacity){
                count = capacity - nCollected;
            }
            tubes[idx] = tube.withTopRemoved(count);
            nCollected += count;
        }
        return new Tube(color.repeat(nCollected), capacity);
    }
    /** 
     * modifies the list of tubes in place to normalize it.
     * this reorders the tubes and redistributes some of the amounts at the tops of tubes
     */
    public static normalize(tubes: Tube[]){
        const colorsToRedistribute = new Map<Color,number>();
        for(const [idx,t] of tubes.entries()){
            const count = t.topCount;
            if(count > 1){
                const col = t.topColor!;
                colorsToRedistribute.set(col, (count-1)+(colorsToRedistribute.get(col)??0));
                tubes[idx] = t.withTopRemoved(count-1);
            }
        }
        tubes.sort((a,b)=>{
            if(a.valueOf() < b.valueOf()){
                return -1;
            } else if (a.valueOf() === b.valueOf()){
                return 0;
            } else if(a.valueOf() > b.valueOf()){
                return 1;
            } else {
		// if the function is not run with class instances which override the valueOf method this can be hit
                throw new Error("everything is broken. abandon hope");
            }
        });
        // redistribute in reverse order, I feel like at some point I thought this seemed like the best option over forwards
        // but I can't at time of writing remember what the reason was.
        for(let idx=tubes.length-1;idx>=0;idx--){
            const t = tubes[idx], col = t.topColor;
            if(col === undefined){// this tube is empty, 
                continue; //could probably safely put a break here but possible failure isn't worth micro-optimization
            }
            const toDist = colorsToRedistribute.get(col), slack = t.slack;
            if(toDist === undefined || toDist === 0 || slack === 0){continue;} // this colour isn't problematic or doesn't have room
            const toGive = toDist < slack ? toDist : slack;
            tubes[idx] = t.withAdded(col, toGive);
            colorsToRedistribute.set(col, toDist - toGive);
        }
        for(const count of colorsToRedistribute.values()){
            if(count > 0){
                throw new Error("couldn't redistribute all the extra bubbles that were shaved off??");
            }
        }
    }
}
// note that the length of this string is needed in the html form for max size of tubes
const COLORS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*=+/";
function makeSolvedGameBoard(n_colours: number, balls_per_colour: number, empty_tubes: number, empty_tube_capacity: number = balls_per_colour, extraSlack=0){
    const board: Tube[] = []
    for(let idx=0;idx<n_colours;idx++){
        board.push(new Tube(COLORS[idx].repeat(balls_per_colour), balls_per_colour+extraSlack));
    }
    for(let idx=0;idx<empty_tubes;idx++){
        board.push(new Tube("", empty_tube_capacity))
    }
    return board
}
/**
 * makes a new gameboard / the initial state for a game
 * n_colours, balls_per_colour, extraSlack directly correspond to their user options in the UI,
 * empty_tubes is a list of capacities in the format of emptyList hidden option
 * which is normally `balls_per_colour-emptyPenalty` repeated `empties` times.
 */
function newGameBoard(n_colours: number, balls_per_colour: number, empty_tubes: number[] = [balls_per_colour,balls_per_colour], extraSlack = 0){
    const flatboard: Color[] = [];
    for(let idx1=0;idx1<n_colours;idx1++){
        const color = COLORS[idx1];
        for(let idx2=0;idx2<balls_per_colour;idx2++){
            flatboard.push(color);
        }
    }
    shuffleList(flatboard);
    shuffleList(flatboard); // second time is almost certainly unnecessary but it makes me feel better.
    const result: Tube[] = []

    while(flatboard.length > 0){
        result.push(new Tube(flatboard.splice(0, balls_per_colour).join(""), balls_per_colour+extraSlack))
    }
    for(const empCap of empty_tubes){
	result.push(new Tube("", empCap));
    }
    return result
}
/** uses Fisher-Yates shuffle on the list in place */
function shuffleList(colorList: any[]){
    for (let i = colorList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap colorList[i] with the element at random index j
        [colorList[i], colorList[j]] = [colorList[j], colorList[i]];
    }
}
// UI CODE STARTS HERE

/**
 * either an HTMLElement or a UIElement, is the parent argument to UIElement constructor
 * and is referenced enough by subclasses that it is useful to have an alias.
 */
type UIParent = HTMLElement | UIElement<null | keyof HTMLElementTagNameMap>;
/**
 * represents an element in the DOM
 * if the tag is specified to the constructor it creates a new element that is a child of the parent
 * if `null` is passed as the tag it uses the parent as this objects element.
 *
 * if subclasses define a static className attribute it is added as a css class,
 * otherwise the name of the class is added as a css class.
 */
class UIElement<tag extends null | keyof HTMLElementTagNameMap> {

    // The DOM element created by this instance
    protected element: tag extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[tag] : HTMLElement;

    constructor(tag: tag, parent: UIParent) {
	// Determine the parent element: it can either be an HTMLElement or a UIElement (in which case, we take its element)
	const parentElement = parent instanceof UIElement ? parent.element : parent;
	if(tag === null){
            this.element = (parentElement as typeof this.element);
	} else {
            // Create a new DOM element of the type defined by the instance property
            this.element = (document.createElement(tag) as typeof this.element);  
            // Append the new element to the parent element
            parentElement.appendChild(this.element);
	}
	this.element.classList.add((this.constructor as {className?:string}).className ?? this.constructor.name);
    }

    // Method to delete the created DOM element
    delete(): void {
        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
    changeParent(newParent: UIElement<any>){
        newParent.element.appendChild(this.element);
    }
}
/**
 * simple button with plain text label.
 * @param label text label for the button
 * @param callback a callback to run when the button is invoked,
 *      if the callback returns a promise the button is disabled until the promise resolves (async function returns)
 *      once the promise resolves the button is re-enabled unless the promise returns "disabled"
 *      the button itself is passed as the second argument so changing label or disabling yourself without doing async can be done.
 */
class ActionButton extends UIElement<"button"> {
    constructor(parent: UIParent, label: string, callback: ((ev: MouseEvent,button: ActionButton) => void | Promise<void|undefined|"disabled">)){
        super("button", parent);
        this.element.onclick = async (ev: MouseEvent)=>{
	    const res = callback(ev, this);
	    if(!isPromise(res)){
		return; // non async function, no disabled handling
	    }
	    this.disabled = true;
	    const awaited = await res;
	    if(awaited !== "disabled"){
		this.disabled = false;
	    }
	};
        this.element.type = "button";
        this.label = label;
    }
    public get disabled(){
        return this.element.disabled;
    }
    public set disabled(val:boolean){
        this.element.disabled = val;
    }
    public get label(){
	return this.element.innerText;
    }
    public set label(text:string){
	this.element.innerText = text;
    }
}
class InfoBox extends UIElement<"p">{
    constructor(parent: UIParent, initialContent: string){
        super("p", parent);
        this.content = initialContent
    }
    public get content(){
        return this.element.innerText;
    }
    public set content(val:string){
        this.element.innerText = val;
    }
}
class BallDiv extends UIElement<"div"> {
    public static className = "Ball";
    public readonly color: Color;
    constructor(parent: UIParent, color: Color, shroud=false) {
        // Call the UIElement constructor with the tag 'div'
        super('div', parent);
        const label = document.createElement("span")
        label.innerText = color
        this.element.appendChild(label)
        this.element.classList.add(color)
        this.color = color;
        this.shroud = shroud;
    }
    public get shroud() {
        return this.element.classList.contains("shroud")
    }
    public set shroud(val: boolean){
        if(val){
            this.element.classList.add("shroud");
        } else{
            this.element.classList.remove("shroud");
        }
    }
}
class TubeDiv extends UIElement<"div">{
    public static className = "Tube"
    private balls: BallDiv[] = []
    private readonly capacity: number
    private highlight: TubeHighlight = [MoveQuality.DRAIN, StateUsefulness.UNKNOWN];
    constructor(parent: UIParent, tube: Tube, clickCallback: (this: HTMLDivElement, ev: MouseEvent) => void){
        super("div", parent);
        this.capacity = tube.capacity;
        this.element.style.setProperty("--capacity", tube.capacity.toString());
        this.element.classList.add(...this.highlight);
        if(tube.isEmpty){this.element.classList.add("empty")}
        this.element.addEventListener("click", clickCallback)
        for(let idx=0; idx<tube.content.length; idx++){
            this.balls.push(new BallDiv(this, tube.content[idx], idx<tube.shroud))
        }
    }
    public setState(tube: Tube, shroud: number, details?: StateDetails){
        if(tube.isEmpty){
            this.element.classList.add("empty")
        } else{
            this.element.classList.remove("empty")
        }
        const {content, capacity} = tube;
        assert(capacity == this.capacity, "cannot change tube size with setState")
        
        const min_length = this.balls.length < content.length ? this.balls.length : content.length;
        let diff_idx = 0;
        // look for the first index where the colour has changed
        while(diff_idx < min_length && content[diff_idx] == this.balls[diff_idx].color){
            diff_idx += 1;
        }
        // remove (delete) all balls from diff_idx and up (won't enter loop if unchanged or only new balls are added)
        while(this.balls.length > diff_idx){
            this.balls.pop()!.delete();
        }
        // add changed balls (won't run if unchanged or only balls are removed)
        for(;diff_idx<content.length;diff_idx++){
            this.balls.push(new BallDiv(this, content[diff_idx]))
        }
        if(JSON.stringify(this.getContent()) !== JSON.stringify(content)){
            throw new Error("set contents didn't match the actual contents")
        }
        for(let idx=shroud; idx<this.balls.length;idx++){
            if(this.balls[idx].shroud){
                this.balls[idx].shroud = false;
            } else{
                break;
            }
        }
        this.element.classList.remove(...this.highlight)
        if(details){
            this.highlight = details.getMoveStat(tube);
            this.element.classList.add(...this.highlight);
            // if(!worked){
            //     console.error("tube highlight failed to be replaced", this)
            // }
        } 
    }
    private getContent(){
        return this.balls.map(div=>div.color).join("")
    }
}
class AuxStuff extends UIElement<null>{
    public undoButton: ActionButton;
    public undoTilLiveButton: ActionButton;
    public resetButton: ActionButton;
    public cheatButton: ActionButton;
    public serialBox: InfoBox;
    constructor(parent: UIParent, game: GameUI, initialSerializedState:SerializedState){
        super(null, parent);
	// without css put the serial first so it shows above the buttons
	// with styling we set it to use the same line as the buttons if there is room.
	this.serialBox = new InfoBox(this, "");
        this.undoButton = new ActionButton(this, "undo", ()=>game.undo())
        this.undoButton.disabled = true;
        this.resetButton = new ActionButton(this, "reset", ()=>{game.reset()})
        this.resetButton.disabled = true;
	this.cheatButton = new ActionButton(this, "cheat", ()=> game.checkPaths());
	this.undoTilLiveButton = new ActionButton(this, "undo to live (0)", ()=>game.undoUntilLive());
	this.undoTilLiveButton.disabled = true;
    }
}
class GameUI extends UIElement<null>{
    public static className = "GameBoard"
    /** the collection of UI elements for the tubes */
    private tubes: TubeDiv[] = []
    /** list of previous states that undo goes through */
    private undoStack: Tube[][] = [];
    /** the current logical game state */
    private state: Tube[];
    /** the box containing undo and redo buttons */
    private aux: AuxStuff;
    /** optional state manager if the optional module is loaded */
    private stateManager?: StateManager;
    private shroudHeights: number[] = [];
    /** the 'usefulness' of the current state, used to mark when you have won or lost
      note that the initial value is */
    private _usefulness = StateUsefulness.UNKNOWN;
    private get usefulness(){return this._usefulness;}
    private set usefulness(val: StateUsefulness){
	this.element.classList.remove(this._usefulness);
	this._usefulness = val;
	this.element.classList.add(val);
    }
    constructor(mainElem: HTMLElement, controlsElem: UIParent, private readonly initialState: Tube[]){
        super(null, mainElem);
	this.element.classList.add(this._usefulness);
        this.state = initialState.slice();
        for(const [idx,tube] of initialState.entries()){
            this.tubes.push(new TubeDiv(mainElem, tube, ev=>{
                this.doAction(idx);
            }))
            this.shroudHeights.push(tube.shroud)
        }
        this.updateNRowsCSSVariableBasedOnMeasuredRows();
        const resizeObserver = new ResizeObserver(() => {
            // Recalculate row count when the container's size changes
            this.updateNRowsCSSVariableBasedOnMeasuredRows();
        });
        resizeObserver.observe(this.element);
        this.aux = new AuxStuff(controlsElem, this, serializeGameState(initialState))

        import("./graphystuffs.js").then(module=>{
            this.stateManager = new module.StateManager();
            this.setState(this.state); // do this to update highlighting
        })
    }
    /** callback for resize, inspects the actually used number of rows and sets it as css property to fit the screen well */
    private updateNRowsCSSVariableBasedOnMeasuredRows(){
        const nRows = getComputedStyle(this.element).getPropertyValue("grid-template-rows").split(" ");
        // console.log(nRows);
        this.element.style.setProperty("--n-rows", nRows.length.toString());
    }
    /** updates all the ui elements from changing the game state, most public methods call this */
    private setState(newState: Tube[]){
        assert(newState.length == this.tubes.length, "cannot change number of tubes with setState");
	const details = this.stateManager?.visitState(newState);
	
	this.info("")
        for(const [idx, div] of this.tubes.entries()){
            if(newState[idx].shroud < this.shroudHeights[idx]){
                this.shroudHeights[idx] = newState[idx].shroud;
            }
            div.setState(newState[idx], this.shroudHeights[idx], details);
        }
        this.state = newState;
	this.aux.undoButton.disabled = this.isActivelyDoingLiveUndo || this.undoStack.length === 0;
	// update live undo label if we are in dead state.
	if(details?.isDead()){
	    if(!this.isActivelyDoingLiveUndo){
		this.aux.undoTilLiveButton.disabled = false;
	    }
	    let countOfUndosToLiveState = 1; // start with current state
	    for(let idx=this.undoStack.length-1;idx>=0;idx--){
		// state manager must exist if details exists
		if(this.stateManager!.isStateDead(this.undoStack[idx])){
		    countOfUndosToLiveState += 1;
		} else{
		    break;
		}
	    }
	    this.aux.undoTilLiveButton.label = `undo to live (${countOfUndosToLiveState})`;
	} else{
	    this.aux.undoTilLiveButton.label = `undo to live (0)`;
	    this.aux.undoTilLiveButton.disabled = true;
	    
	}
        this.aux.resetButton.disabled = this.state.every((tube,idx)=>(this.initialState[idx].content === tube.content));
	if(details !== undefined){
	    this.usefulness = details.usefulness;
	    if(details.isEnd){
		this.element.classList.add("ended");
	    } else {
		this.element.classList.remove("ended");
	    }
	}
	return details;
    }
    /** callback for clicking on a tube, checks result state, pushes current state to undo stack, and updates state. */
    private doAction(idx: number){
        this.undoStack.push(this.state);
	const newState = this.state.slice()
        const quality =  computeMove(newState, idx);
        if(quality === MoveQuality.UNMOVABLE){
            this.undoStack.pop(); // nothing changed so don't clutter the undo stack
            return;
        }
        const details = this.setState(newState);
        
        const isEnded = this.checkEnded(details);
        if(isEnded === StateUsefulness.DEAD){
	    this.info("no moves available, undo or reset.")
        } else if(isEnded === StateUsefulness.WINNING){
            this.alert("YOU WIN! <3");
        }
    }
    /** fallback if state manager is not available, computes every move from current state and yields the quality of each move */
    private *generateMoveQualities(){
        for(let idx=0;idx<this.state.length;idx++){
            yield computeMove(this.state.slice(), idx);
        }
        
    }
    /**
     * returns either ALIVE, DEAD, or WINNING, to indicate not ended, lost, or won state respectively.
     */
    private checkEnded(details?: StateDetails): StateUsefulness {
	if(details){
	    return details.isEnd ? details.usefulness : StateUsefulness.ALIVE;
	}
	// fallback if we don't have state manager
	// TODO implement this simpler logic into StateDetails.computeMoves as it is easier to follow

	// if all tubes are pure we ignore SHIFT moves as that is possible from a win state
	// otherwise 
	const winning = this.state.every((t=>t.isPure));
        for(const q of this.generateMoveQualities()){
            if(q === MoveQuality.UNMOVABLE){
		continue; // unmovable so not an indicator of alive
	    }else if(winning && q === MoveQuality.SHIFT){
		continue; // if all tubes are pure shift moves are ignored for win check
            }
	    // otherwise we have a viable move so we are in alive state.
	    return StateUsefulness.ALIVE;
        }
	// either we have no moves or we have shift moves but all tubes are pure so we have won, either way this is the end
	return winning ? StateUsefulness.WINNING : StateUsefulness.DEAD;
    }
    /**
     * performs an undo, popping a state off the undo stack and going to that state.
     * if the undoStack is empty gives an alert that it is not possible but in proper
     * operation the undo button should be disabled if this would fail.
     */
    public undo(){
        const state = this.undoStack.pop();
	// shouldn't happen as setState disables the undo button when undoStack is empty
        if(state === undefined){
            this.alert("you are at the initial state")
            return;
        }
        this.setState(state);
    }
    private isActivelyDoingLiveUndo = false;
    /**
     * undo in a loop until reaching a live state
     */
    public async undoUntilLive(): Promise<"disabled"|undefined>{
	assert(!this.isActivelyDoingLiveUndo, "assumption that action button disable logic prevents multiple undo chains is broken");
	this.isActivelyDoingLiveUndo = true;
	try{
	    this.undo();
	    while(this.usefulness === StateUsefulness.DEAD && this.undoStack.length > 0){
		const currentState = this.state;
		await sleep(400);
		if(currentState !== this.state){
		    return; // user changed state mid undo, just stop trying to undo
		    // this also implies that the undo button will be clickable again, it is possible this is wrong but should be fine
		}
		this.undo();
	    }
	    return "disabled" //(this.undoStack.length === 0) ? "disabled" : undefined;
	} finally {
	    this.isActivelyDoingLiveUndo = false;
	}
    }
    /**
     * resets to the initial state, adding the current state to the undo stack so it can be undone
     *
     * if we are currently in the initial state give an alert indicating although normally the reset button should be
     * disabled if it wouldn't be a valid operation.
     */
    public reset(){
        if(this.state.some((tube,idx)=>{
            const val = (tube.content !== this.initialState[idx].content);
            return val;
        })){
            // state has changed so actually perform reset
            const newState = this.initialState.slice();
            this.undoStack.push(this.state);
            this.setState(newState);
        } else {
	    // shouldn't happen as setState disables reset button when we are in the initial state.
            this.alert ("you are at the initial state".concat(this.undoStack.length>0 ? " (you can still undo the reset)" : ""))
        }
    }
    /**
       uses the state manager to compute the states of all children of this state, or if they are already all computed all their children etc
       can lead to finding the winning or dead paths without the user explicitly visiting them.
       */
    public async checkPaths(){
	if(this.stateManager === undefined){
	    this.alert ("check paths only works if the state manager module is loaded");
	    return;
	}
	let stateToAnalyse = this.state;
	const {details, msg} = await this.stateManager.analyseState(stateToAnalyse);
	// call setState to potentially update classes based on new info if details changes
	// but only if the state didn't change
	if(this.state === stateToAnalyse){
	    this.setState(this.state);
	}
	this.info(msg)
	
    }
    /**
     * reorders the tubes according to the normalization that identifies common states.
     * performs this in place without affecting the undo stack
     */
    public reorderTubes(){
        // note this doesn't touch undo stack, it just normalizes the stuff in place.
        Tube.normalize(this.state);
        this.setState(this.state);
    }
    /** gives a user alert with a small delay to allow UI to update before it is frozen by the dialog */
    private alert(msg:string){
        // set a small timeout so printing a message about a new state gives the dom time to update the display before printing the message
        setTimeout(()=>{alert(msg)}, 200)
    }
    /** shows some transient message on the screen where it can be easily ignored */
    private info(msg: string){
	this.aux.serialBox.content = msg;
    }
}
export let game: GameUI;
function loadWorker(){
    return new WorkerWrapper<typeof import("./worker.js")["handlers"]>(new URL("./worker.js", import.meta.url));
}
export function initGame(levelCodeOverride?: SerializedState){
    const worker = loadWorker();
    let {nColors, ballsPerColor, empties, emptyPenalty, extraSlack, levelCode, emptyList} = initSettings();
    if(nColors > COLORS.length){
        nColors = COLORS.length;
    }
    if(levelCodeOverride){
        levelCode = levelCodeOverride;
    }
    let initialState: Tube[];
    if(levelCode){
        initialState = levelCode.split(",").map(Tube.loadFromSerial);
    } else{
	let listOfEmpties: number[];
	if(typeof emptyList === "string"){
	    listOfEmpties = emptyList.split(",").map(x=>parseInt(x));
	} else{
	    listOfEmpties = Array(empties).fill(ballsPerColor-emptyPenalty);
	}
        initialState = newGameBoard(nColors, ballsPerColor, listOfEmpties, extraSlack);
    }
    const gameDiv = document.getElementById("game")!;
    worker.delegate("checkSolvability", initialState.map(x=>x.valueOf())).then((v)=>{
	if(v.solvable){
	    gameDiv.classList.add("solvable");
	    console.log("the game is solvable");
	} else{
	    gameDiv.classList.add("impossible");
	    alert(`This game is not solvable, refresh the page for a new one. (game has ${v.states} states.)`);
	}
    });
    game = new GameUI(gameDiv, document.getElementById("controls")!, initialState);

    // set level code link
    const link = document.getElementById("linkToThisExactLevelCode") as HTMLAnchorElement | null;
    if(link !== null){
	const lvlCodeParam = new URLSearchParams();
	lvlCodeParam.set("levelCode", serializeGameState(initialState, false));
	link.href = "?" + lvlCodeParam.toString();
    }
}
export function serializeGameState(state: readonly Tube[], normalize=true): SerializedState{
    if(normalize){
	const mutableStateCopy = state.slice();
	Tube.normalize(mutableStateCopy);
	return mutableStateCopy.map(x=>`${x.capacity}${x.content}`).join(",");
    } else{
	return state.map(x=>`${x.capacity}${x.content}`).join(",");
    }
}
function isPromise(val:unknown): val is Promise<unknown>{
    return "object" === typeof val && val !== null && "function" === typeof (val as Partial<Promise<unknown>>).then;
}
// @license-end
