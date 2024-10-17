// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

import { MoveQuality, type StateDetails, TubeHighlight, StateManager } from "./graphystuffs.js";
import { gameSettings } from "./settings.js";

export function assert(condition:boolean, msg:string): asserts condition{
    if(!condition){
        throw new Error(msg)
    }
}
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
        return this.capacity - this.slack - this.topCount
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
        return new Tube(this.content.concat(addition.repeat(repetitions)), this.capacity)
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
        const thingy = new Tube(topColor.repeat(topCount), capacityOfDest)
        return [this.withTopRemoved(topCount), thingy]
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
        return this.withTopRemoved(topCount - ballsLeftToMove)
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
                throw new Error("everything is broken. abandon hope")
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
                throw new Error("couldn't redistribute all the extra bubbles that were shaved off??")
            }
        }
    }
}
/**
 * helper called by computeMove, this is called twice, once with empty tubes and once with partially filled tubes
 * so it is extracted to a helper. Being intended as a helper it sorts and removes items from candidateIdxs as is convinient for the algorithm
 * also if the candidates don't have enough capacity this function will just throw un-useful errors as it is expected to be called within proper conditions
 * @param tubes list of tubes to modify
 * @param candidateIdxs list of indices to consider as targets, is mangled in the process of this function
 * @param color the colour to add to candidates
 * @param minElemsToMove the minimum number of balls to move to candidates
 * @param maxElemsToMove the maximum number of balls to move
 * @returns the number of balls successfully moved, when allowOverfill=false this should always be equal to minElemsToMove
 */
function moveHelper(tubes: Tube[], candidateIdxs: number[], color: Color, minElemsToMove: number, maxElemsToMove: number){
    let successfullyMoved = 0;
    // sort in ascending order of slack so ones with most available space are at the end
    candidateIdxs.sort((a,b)=>tubes[a].slack - tubes[b].slack);
    // as long as the one with most space can't fit all the balls we need to move:
    while(tubes[candidateIdxs.at(-1)!].slack < minElemsToMove-successfullyMoved){
        // pop it out of the list and fill it with balls
        const idx = candidateIdxs.pop()!;
        const slack = tubes[idx].slack;
        successfullyMoved += slack;
        tubes[idx] = tubes[idx].withAdded(color, slack);
    }
    // at this point we know the most slack candidate can hold the remaining balls,
    // just go through the candidates and choose the first (least slack) that fits the remaining
    for(const idx of candidateIdxs){
        if(tubes[idx].slack >= minElemsToMove - successfullyMoved){
            const countWeWantToMove = maxElemsToMove - successfullyMoved;
            const countToActuallyMove = tubes[idx].slack < countWeWantToMove ? tubes[idx].slack : countWeWantToMove; 
            tubes[idx] = tubes[idx].withAdded(color, countToActuallyMove);
            successfullyMoved += countToActuallyMove;
            return successfullyMoved;
        }
    }
    throw new Error("moveHelper was called with invalid state");
}
/**
 * this movement algorithm uses the following goals:
 * - use the fewest number of empty tubes required
 * - make the fewest number of splits needed (distribute the balls amongst fewer tubes)
 * - make the highest stacks, I.E. in case of multiple candidates for equal number of splits put it on the tallest one
 * 
 * This modifies the list of tubes in place and returns the quality of the move:
 * - UNMOVABLE if the list of tubes is unchanged and the move can't result in useful progress
 * - NORMAL if the top colour of the selected tube can be shifted to other partially full tubes
 * - DRAIN if at least one empty tube needed to be used for the contents being moved
 * 
 * @param tubes list of tubes to modify in place as result of the computed move 
 * @param idxToDrain index of tube to try to shift into other tubes
 * @returns the quality of move, see above for the cases
 */
export function computeMove(tubes: Tube[], idxToDrain: number): MoveQuality {
    const source = tubes[idxToDrain];
    const col = source.topColor;
    if(col === undefined){
        return MoveQuality.UNMOVABLE; // tried to move an empty tube
    }
    const isSourcePure = source.isPure;
    // first collect lists of partial tubes with slack and empties
    const empties: number[] = [];
    const partials: number[] = [];
    // will count the total slack in the available partials
    let partialsSlack = 0;
    let emptySlack = 0;
    for(const [idx, candidate] of tubes.entries()){
        if(idx === idxToDrain){continue;} // skip own tube as possible candidate
        // if the candidate is empty and the source is pure only consider the candidate if it has a different capacity
        // this is because if you have several shorter empties you may need to move balls from a short empty to a taller one
        // and if there is another short empty available the level is effectively softlocked as the algorithm will always prefer
        // moving to an equivalent short empty instead of going to the necessary taller one to combine balls of the same colour
        // in a single tube.
        if(candidate.isEmpty && (!isSourcePure || candidate.capacity != source.capacity)){
            empties.push(idx);
            emptySlack += candidate.capacity;
        } else if(candidate.topColor === col){
            const slack = candidate.slack;
            if(slack > 0){
                partials.push(idx);
                partialsSlack += slack;
            }
        }
    }
    let result = MoveQuality.NORMAL;
    const topCount = source.topCount;
    let toMoveCount = topCount;
    if(toMoveCount > partialsSlack){
        const minNeededToGoToEmpties = toMoveCount - partialsSlack;
        if(minNeededToGoToEmpties > emptySlack){
            // there is insufficient room in empty or partial tubes to hold all the balls we are trying to move
            // most likely there are just no viable targets and no empty tubes
            return MoveQuality.UNMOVABLE;
        }
        result = MoveQuality.DRAIN;
        toMoveCount -= moveHelper(tubes, empties, col, minNeededToGoToEmpties, toMoveCount);
        if(isSourcePure && toMoveCount === 0){
            // all balls were moved to an empty tube
            result = MoveQuality.SHIFT;
        }
    }
    // if there is still stuff to move after possibly consulting empty tubes (could be in addition or instead of)
    // then move everything else to partials
    // we should be certain there is enough room as if there wasn't the toMoveCount would be lowered by empties
    // and if there wasn't enough space in the empties then UNMOVABLE should have already been returned.
    if(toMoveCount > 0){
        assert(toMoveCount === moveHelper(tubes, partials, col, toMoveCount, toMoveCount), "move failed somehow");
    }
    tubes[idxToDrain] = source.withTopRemoved(topCount);
    return result;
}
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
function newGameBoard(n_colours: number, balls_per_colour: number, empty_tubes: number, empty_tube_capacity: number = balls_per_colour, extraSlack = 0){
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
    const empty = new Tube("", empty_tube_capacity);
    for(let idx=0;idx<empty_tubes;idx++){
        result.push(empty)
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
class ActionButton extends UIElement<"button"> {
    constructor(parent: UIParent, label: string, callback: ((this: GlobalEventHandlers, ev: MouseEvent) => void)){
        super("button", parent);
        this.element.onclick = callback;
        this.element.innerText = label;
        this.element.type = "button"
    }
    public get disabled(){
        return this.element.disabled;
    }
    public set disabled(val:boolean){
        this.element.disabled = val;
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
    constructor(parent: UIElement<any>, color: Color, shroud=false) {
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
    private highlight: TubeHighlight = MoveQuality.DRAIN;
    constructor(parent: UIParent, tube: Tube, clickCallback: (this: HTMLDivElement, ev: MouseEvent) => void){
        super("div", parent);
        this.capacity = tube.capacity;
        this.element.classList.add(this.highlight);
        if(tube.isEmpty){this.element.classList.add("empty")}
        this.element.style.setProperty("--capacity", tube.capacity.toString());
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
        this.element.classList.remove(this.highlight)
        if(details){
            this.highlight = details.getMoveStat(tube);
            this.element.classList.add(this.highlight);
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
    public resetButton: ActionButton;
    // public serialBox: InfoBox;
    constructor(parent: UIParent, game: GameUI, initialSerializedState:SerializedState){
        super(null, parent);
        this.undoButton = new ActionButton(this, "undo", ()=>{game.undo()})
        this.undoButton.disabled = true;
        this.resetButton = new ActionButton(this, "reset", ()=>{game.reset()})
        this.resetButton.disabled = true;
        // this.serialBox = new InfoBox(this, initialSerializedState);
        // this.serialBox.delete(); // TODO: remove this line
    }
}
class GameUI extends UIElement<null>{
    public static className = "GameBoard"
    private tubes: TubeDiv[] = []
    private undoStack: Tube[][] = [];
    private state: Tube[];
    private aux: AuxStuff;
    private stateManager?: StateManager;
    private shroudHeights: number[] = [];
    constructor(mainElem: HTMLElement, controlsElem: UIParent, private readonly initialState: Tube[]){
        super(null, mainElem);
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
            this.stateManager = new module.StateManager((s,d)=>{
                this.setState(s.slice(), d);
            })
            this.stateManager.visitState(this.state); // do this to update highlighting
        })
    }
    private updateNRowsCSSVariableBasedOnMeasuredRows(){
        const nRows = getComputedStyle(this.element).getPropertyValue("grid-template-rows").split(" ");
        // console.log(nRows);
        this.element.style.setProperty("--n-rows", nRows.length.toString());
    }
    private setState(newState: Tube[], details?: StateDetails){
        assert(newState.length == this.tubes.length, "cannot change number of tubes with setState")
        for(const [idx, div] of this.tubes.entries()){
            if(newState[idx].shroud < this.shroudHeights[idx]){
                this.shroudHeights[idx] = newState[idx].shroud;
            }
            div.setState(newState[idx], this.shroudHeights[idx], details);
        }
        this.state = newState;
        this.aux.undoButton.disabled = this.undoStack.length === 0;
        this.aux.resetButton.disabled = this.state.every((tube,idx)=>(this.initialState[idx].content === tube.content));
    }
    private doAction(idx: number){
        this.undoStack.push(this.state.slice());
        const quality =  computeMove(this.state, idx);
        if(quality === MoveQuality.UNMOVABLE){
            this.undoStack.pop(); // nothing changed so don't clutter the undo stack
            return;
        }
        let details: StateDetails | undefined = undefined;
        if(this.stateManager){
            details = this.stateManager.visitState(this.state);
        } else {
            this.setState(this.state);
        }
        const isEnded = this.checkEnded(details);
        if(isEnded === "lose"){
            this.alert("no moves available, undo or reset.");
        } else if(isEnded === "win"){
            this.alert("YOU WIN! <3");
        }
    }
    private *generateMoveQualities(details?: StateDetails){
        if(details){
            for(const t of details.getChildren().values()){
                yield t.quality;
            }
        } else{
            for(let idx=0;idx<this.state.length;idx++){
                yield computeMove(this.state.slice(), idx);
            }
        }
    }
    private checkEnded(details?: StateDetails): false | "win" | "lose"{
        for(const q of this.generateMoveQualities(details)){
            if(q!==MoveQuality.SHIFT && q!== MoveQuality.UNMOVABLE){
                return false;
            }
        }
        // every move is not possible or a shift of pure tube to another empty tube, we are dsonaied
        for(const tube of this.state){
            if(!tube.isPure){
                return "lose"; // no moves and there are mixed tubes
            }
        }
        return "win"; // all tubes are pure and no moves meaningfully change the state
    }
    public undo(){
        const state = this.undoStack.pop();
        if(state === undefined){
            this.alert("you are at the initial state")
            return;
        }
        if(this.stateManager){
            this.stateManager.visitState(state);
        } else{
            this.setState(state)
        }
    }
    public reset(){
        if(this.state.some((tube,idx)=>{
            const val = (tube.content !== this.initialState[idx].content);
            return val;
        })){
            // state has changed so actually perform reset
            const newState = this.initialState.slice();
            this.undoStack.push(this.state);
            if(this.stateManager){
                this.stateManager.visitState(newState);
            } else{
                this.setState(newState)
            }
        } else {
            this.alert ("you are at the initial state".concat(this.undoStack.length>0 ? " (you can still undo the reset)" : ""))
        }
    }
    private reorderTubes(){
        // note this doesn't touch undo stack, it just normalizes the stuff in place.
        Tube.normalize(this.state);
        this.setState(this.state);
    }
    private alert(msg:string){
        // set a small timeout so printing a message about a new state gives the dom time to update the display before printing the message
        setTimeout(()=>{alert(msg)}, 200)
    }
}
export let game: GameUI;
export function initGame(levelCodeOverride?: SerializedState){
    let {nColors, ballsPerColor, empties, emptyPenalty, extraSlack, levelCode} = gameSettings;
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
        initialState = newGameBoard(nColors, ballsPerColor, empties, ballsPerColor-emptyPenalty, extraSlack);
    }
    game = new GameUI(document.getElementById("game")!, document.getElementById("controls")!, initialState);
}
export function serializeGameState(state: readonly Tube[]): SerializedState{
    const mutableStateCopy = state.slice();
    Tube.normalize(mutableStateCopy);
    return mutableStateCopy.map(x=>`${x.capacity}${x.content}`).join(",");
}
// @license-end