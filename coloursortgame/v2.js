// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later
import { gameSettings } from "./settings.js";
export function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg);
    }
}
export class Tube {
    //public static readonly EMPTY = new Tube("");
    constructor(content, capacity) {
        this.content = content;
        this.capacity = capacity;
    }
    /** returns a string with the content of the tube and the capacity. */
    valueOf() { return this.capacity.toString().concat(this.content); }
    /**
     * returns the colour at the top of the tube
     * or undefined if the tube is empty
     */
    get topColor() {
        return this.content.at(-1);
    }
    /**
     * returns the number of elements of the same colour at the top of the tube.
     * is 0 for an empty tube, the length of the whole tube if it is pure, otherwise between 1 and that length
     */
    get topCount() {
        const col = this.topColor;
        if (col === undefined) {
            return 0; // the tube is empty
        }
        for (let idx = this.content.length - 2; idx >= 0; idx--) {
            if (this.content[idx] !== col) {
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
    get isPure() {
        return this.topCount === this.content.length;
    }
    /**
     * returns true if the tube is empty
     */
    get isEmpty() {
        return this.content.length === 0;
    }
    /**
     * returns the amount of space in this tube given a capacity
     * this is how many balls of the same colour this.topColor could be added to this tube
     * @param capacity the total capacity of the tube
     * @returns the empty space at the top of the tube
     */
    get slack() {
        return this.capacity - this.content.length;
    }
    get shroud() {
        return this.capacity - this.slack - this.topCount;
    }
    /**
     * @returns a new Tube with the specified amount of elements removed
     * */
    withTopRemoved(count_of_removal) {
        //if(count_of_removal == this.content.length){return Tube.EMPTY;}
        return new Tube(this.content.slice(0, this.content.length - count_of_removal), this.capacity);
    }
    /**
     * returns a new tube with the given addition to the top.
     * Note this function doesn't validate that it matches the colour or stays within the capacity
     * @param addition new contents to put at the top of this tube
     * @returns a tube with the addition added to the top
     */
    withAdded(addition, repetitions = 1) {
        return new Tube(this.content.concat(addition.repeat(repetitions)), this.capacity);
    }
    moveToEmpty(capacityOfDest) {
        const { topColor, topCount } = this;
        if (capacityOfDest < topCount) {
            throw new Error("tried to move to a tube that doesn't have enough space for the balls trying to move to it");
        }
        else if (topColor === undefined) {
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
    moveToOthers(others, ignoreEmpty = true) {
        const color = this.topColor;
        if (color === undefined) {
            return this;
        } // this tube is empty, nothing to do
        const topCount = this.topCount;
        let ballsLeftToMove = topCount;
        for (let idx = 0; idx < others.length && ballsLeftToMove > 0; idx++) {
            const dest = others[idx];
            // skip if destination is this tube or if it contains another colour
            // note that dest.topColor would be undefined if it is empty so we only skip
            // if it isn't empty (has another colour) or we are ignoring empty, otherwise this is a totally valid target.
            if (dest === this || (dest.topColor !== color && (ignoreEmpty || !dest.isEmpty))) {
                continue;
            } // the tube is another colour
            const slack = dest.slack;
            if (slack === 0) {
                continue;
            } // tube has no space
            const movedToThisDest = slack < ballsLeftToMove ? slack : ballsLeftToMove;
            others[idx] = dest.withAdded(color, movedToThisDest);
            ballsLeftToMove -= movedToThisDest;
        }
        if (ballsLeftToMove === topCount) {
            return this;
        } //nothing happened
        return this.withTopRemoved(topCount - ballsLeftToMove);
    }
    /**
     * collects a colour from the tops of all tubes into an empty tube
     * modifies the list of tubes passed as argument and returns a new tube with the balls that were removed from there
     * @param tubes game state to take balls from
     * @param color the color to take
     * @returns a pure tube with all the balls taken from the rest of the tubes
     */
    static collect(tubes, color, capacity) {
        let nCollected = 0;
        for (const [idx, tube] of tubes.entries()) {
            if (tube.topColor !== color) {
                continue;
            }
            let count = tube.topCount;
            if (nCollected + count > capacity) {
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
    static normalize(tubes) {
        var _a;
        const colorsToRedistribute = new Map();
        for (const [idx, t] of tubes.entries()) {
            const count = t.topCount;
            if (count > 1) {
                const col = t.topColor;
                colorsToRedistribute.set(col, (count - 1) + ((_a = colorsToRedistribute.get(col)) !== null && _a !== void 0 ? _a : 0));
                tubes[idx] = t.withTopRemoved(count - 1);
            }
        }
        tubes.sort((a, b) => {
            if (a.valueOf() < b.valueOf()) {
                return -1;
            }
            else if (a.valueOf() === b.valueOf()) {
                return 0;
            }
            else if (a.valueOf() > b.valueOf()) {
                return 1;
            }
            else {
                throw new Error("everything is broken. abandon hope");
            }
        });
        // redistribute in reverse order, I feel like at some point I thought this seemed like the best option over forwards
        // but I can't at time of writing remember what the reason was.
        for (let idx = tubes.length - 1; idx >= 0; idx--) {
            const t = tubes[idx], col = t.topColor;
            if (col === undefined) { // this tube is empty, 
                continue; //could probably safely put a break here but possible failure isn't worth micro-optimization
            }
            const toDist = colorsToRedistribute.get(col), slack = t.slack;
            if (toDist === undefined || toDist === 0 || slack === 0) {
                continue;
            } // this colour isn't problematic or doesn't have room
            const toGive = toDist < slack ? toDist : slack;
            tubes[idx] = t.withAdded(col, toGive);
            colorsToRedistribute.set(col, toDist - toGive);
        }
        for (const count of colorsToRedistribute.values()) {
            if (count > 0) {
                throw new Error("couldn't redistribute all the extra bubbles that were shaved off??");
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
function moveHelper(tubes, candidateIdxs, color, minElemsToMove, maxElemsToMove) {
    let successfullyMoved = 0;
    // sort in ascending order of slack so ones with most available space are at the end
    candidateIdxs.sort((a, b) => tubes[a].slack - tubes[b].slack);
    // as long as the one with most space can't fit all the balls we need to move:
    while (tubes[candidateIdxs.at(-1)].slack < minElemsToMove - successfullyMoved) {
        // pop it out of the list and fill it with balls
        const idx = candidateIdxs.pop();
        const slack = tubes[idx].slack;
        successfullyMoved += slack;
        tubes[idx] = tubes[idx].withAdded(color, slack);
    }
    // at this point we know the most slack candidate can hold the remaining balls,
    // just go through the candidates and choose the first (least slack) that fits the remaining
    for (const idx of candidateIdxs) {
        if (tubes[idx].slack >= minElemsToMove - successfullyMoved) {
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
export function computeMove(tubes, idxToDrain) {
    const source = tubes[idxToDrain];
    const col = source.topColor;
    if (col === undefined) {
        return "unmovable" /* MoveQuality.UNMOVABLE */; // tried to move an empty tube
    }
    const isSourcePure = source.isPure;
    // first collect lists of partial tubes with slack and empties
    const empties = [];
    const partials = [];
    // will count the total slack in the available partials
    let partialsSlack = 0;
    let emptySlack = 0;
    for (const [idx, candidate] of tubes.entries()) {
        if (idx === idxToDrain) {
            continue;
        } // skip own tube as possible candidate
        // if the candidate is empty and the source is pure only consider the candidate if it has a different capacity
        // this is because if you have several shorter empties you may need to move balls from a short empty to a taller one
        // and if there is another short empty available the level is effectively softlocked as the algorithm will always prefer
        // moving to an equivalent short empty instead of going to the necessary taller one to combine balls of the same colour
        // in a single tube.
        if (candidate.isEmpty && (!isSourcePure || candidate.capacity != source.capacity)) {
            empties.push(idx);
            emptySlack += candidate.capacity;
        }
        else if (candidate.topColor === col) {
            const slack = candidate.slack;
            if (slack > 0) {
                partials.push(idx);
                partialsSlack += slack;
            }
        }
    }
    let result = "normal" /* MoveQuality.NORMAL */;
    const topCount = source.topCount;
    let toMoveCount = topCount;
    if (toMoveCount > partialsSlack) {
        const minNeededToGoToEmpties = toMoveCount - partialsSlack;
        if (minNeededToGoToEmpties > emptySlack) {
            // there is insufficient room in empty or partial tubes to hold all the balls we are trying to move
            // most likely there are just no viable targets and no empty tubes
            return "unmovable" /* MoveQuality.UNMOVABLE */;
        }
        result = "drain" /* MoveQuality.DRAIN */;
        toMoveCount -= moveHelper(tubes, empties, col, minNeededToGoToEmpties, toMoveCount);
    }
    // if there is still stuff to move after possibly consulting empty tubes (could be in addition or instead of)
    // then move everything else to partials
    // we should be certain there is enough room as if there wasn't the toMoveCount would be lowered by empties
    // and if there wasn't enough space in the empties then UNMOVABLE should have already been returned.
    if (toMoveCount > 0) {
        assert(toMoveCount === moveHelper(tubes, partials, col, toMoveCount, toMoveCount), "move failed somehow");
    }
    tubes[idxToDrain] = source.withTopRemoved(topCount);
    return result;
}
const COLORS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*=+/";
function makeSolvedGameBoard(n_colours, balls_per_colour, empty_tubes, empty_tube_capacity = balls_per_colour, extraSlack = 0) {
    const board = [];
    for (let idx = 0; idx < n_colours; idx++) {
        board.push(new Tube(COLORS[idx].repeat(balls_per_colour), balls_per_colour + extraSlack));
    }
    for (let idx = 0; idx < empty_tubes; idx++) {
        board.push(new Tube("", empty_tube_capacity));
    }
    return board;
}
function newGameBoard(n_colours, balls_per_colour, empty_tubes, empty_tube_capacity = balls_per_colour, extraSlack = 0) {
    const flatboard = [];
    for (let idx1 = 0; idx1 < n_colours; idx1++) {
        const color = COLORS[idx1];
        for (let idx2 = 0; idx2 < balls_per_colour; idx2++) {
            flatboard.push(color);
        }
    }
    shuffleList(flatboard);
    shuffleList(flatboard); // second time is almost certainly unnecessary but it makes me feel better.
    const result = [];
    while (flatboard.length > 0) {
        result.push(new Tube(flatboard.splice(0, balls_per_colour).join(""), balls_per_colour + extraSlack));
    }
    const empty = new Tube("", empty_tube_capacity);
    for (let idx = 0; idx < empty_tubes; idx++) {
        result.push(empty);
    }
    return result;
}
/** uses Fisher-Yates shuffle on the list in place */
function shuffleList(colorList) {
    for (let i = colorList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap colorList[i] with the element at random index j
        [colorList[i], colorList[j]] = [colorList[j], colorList[i]];
    }
}
/**
 * represents an element in the DOM
 * if the tag is specified to the constructor it creates a new element that is a child of the parent
 * if `null` is passed as the tag it uses the parent as this objects element.
 */
class UIElement {
    constructor(tag, parent) {
        var _a;
        // Determine the parent element: it can either be an HTMLElement or a UIElement (in which case, we take its element)
        const parentElement = parent instanceof UIElement ? parent.element : parent;
        if (tag === null) {
            this.element = parentElement;
        }
        else {
            // Create a new DOM element of the type defined by the instance property
            this.element = document.createElement(tag);
            // Append the new element to the parent element
            parentElement.appendChild(this.element);
        }
        this.element.classList.add((_a = this.constructor.className) !== null && _a !== void 0 ? _a : this.constructor.name);
    }
    // Method to delete the created DOM element
    delete() {
        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }
    changeParent(newParent) {
        newParent.element.appendChild(this.element);
    }
}
class ActionButton extends UIElement {
    constructor(parent, label, callback) {
        super("button", parent);
        this.element.onclick = callback;
        this.element.innerText = label;
        this.element.type = "button";
    }
    get disabled() {
        return this.element.disabled;
    }
    set disabled(val) {
        this.element.disabled = val;
    }
}
class InfoBox extends UIElement {
    constructor(parent, initialContent) {
        super("p", parent);
        this.content = initialContent;
    }
    get content() {
        return this.element.innerText;
    }
    set content(val) {
        this.element.innerText = val;
    }
}
class BallDiv extends UIElement {
    constructor(parent, color, shroud = false) {
        // Call the UIElement constructor with the tag 'div'
        super('div', parent);
        const label = document.createElement("span");
        label.innerText = color;
        this.element.appendChild(label);
        this.element.classList.add(color);
        this.color = color;
        this.shroud = shroud;
    }
    get shroud() {
        return this.element.classList.contains("shroud");
    }
    set shroud(val) {
        if (val) {
            this.element.classList.add("shroud");
        }
        else {
            this.element.classList.remove("shroud");
        }
    }
}
BallDiv.className = "Ball";
class TubeDiv extends UIElement {
    constructor(parent, tube, clickCallback) {
        super("div", parent);
        this.balls = [];
        this.highlight = "drain" /* MoveQuality.DRAIN */;
        this.capacity = tube.capacity;
        this.element.classList.add(this.highlight);
        if (tube.isEmpty) {
            this.element.classList.add("empty");
        }
        this.element.style.setProperty("--capacity", tube.capacity.toString());
        this.element.addEventListener("click", clickCallback);
        for (let idx = 0; idx < tube.content.length; idx++) {
            this.balls.push(new BallDiv(this, tube.content[idx], idx < tube.shroud));
        }
    }
    setState(tube, shroud, details) {
        if (tube.isEmpty) {
            this.element.classList.add("empty");
        }
        else {
            this.element.classList.remove("empty");
        }
        const { content, capacity } = tube;
        assert(capacity == this.capacity, "cannot change tube size with setState");
        const min_length = this.balls.length < content.length ? this.balls.length : content.length;
        let diff_idx = 0;
        // look for the first index where the colour has changed
        while (diff_idx < min_length && content[diff_idx] == this.balls[diff_idx].color) {
            diff_idx += 1;
        }
        // remove (delete) all balls from diff_idx and up (won't enter loop if unchanged or only new balls are added)
        while (this.balls.length > diff_idx) {
            this.balls.pop().delete();
        }
        // add changed balls (won't run if unchanged or only balls are removed)
        for (; diff_idx < content.length; diff_idx++) {
            this.balls.push(new BallDiv(this, content[diff_idx]));
        }
        if (JSON.stringify(this.getContent()) !== JSON.stringify(content)) {
            throw new Error("set contents didn't match the actual contents");
        }
        for (let idx = shroud; idx < this.balls.length; idx++) {
            if (this.balls[idx].shroud) {
                this.balls[idx].shroud = false;
            }
            else {
                break;
            }
        }
        this.element.classList.remove(this.highlight);
        if (details) {
            this.highlight = details.getMoveStat(tube);
            this.element.classList.add(this.highlight);
            // if(!worked){
            //     console.error("tube highlight failed to be replaced", this)
            // }
        }
    }
    getContent() {
        return this.balls.map(div => div.color).join("");
    }
}
TubeDiv.className = "Tube";
class AuxStuff extends UIElement {
    constructor(parent, game, initialSerializedState) {
        super(null, parent);
        this.undoButton = new ActionButton(this, "undo", () => { game.undo(); });
        this.undoButton.disabled = true;
        this.resetButton = new ActionButton(this, "reset", () => { game.reset(); });
        this.resetButton.disabled = true;
        this.serialBox = new InfoBox(this, initialSerializedState);
        this.serialBox.delete(); // TODO: remove this line
    }
}
class GameUI extends UIElement {
    constructor(mainElem, controlsElem, initialState, solved) {
        super(null, mainElem);
        this.initialState = initialState;
        this.solved = solved;
        this.tubes = [];
        this.undoStack = [];
        this.shroudHeights = [];
        this.state = initialState.slice();
        for (const [idx, tube] of initialState.entries()) {
            this.tubes.push(new TubeDiv(mainElem, tube, ev => {
                this.doAction(idx);
            }));
            this.shroudHeights.push(tube.shroud);
        }
        this.updateNRowsCSSVariableBasedOnMeasuredRows();
        const resizeObserver = new ResizeObserver(() => {
            // Recalculate row count when the container's size changes
            this.updateNRowsCSSVariableBasedOnMeasuredRows();
        });
        resizeObserver.observe(this.element);
        this.aux = new AuxStuff(controlsElem, this, serializeGameState(initialState));
        import("./graphystuffs.js").then(module => {
            this.stateManager = new module.StateManager((s, d) => {
                this.setState(s.slice(), d);
            });
            this.stateManager.visitState(this.state); // do this to update highlighting
        });
    }
    updateNRowsCSSVariableBasedOnMeasuredRows() {
        const nRows = getComputedStyle(this.element).getPropertyValue("grid-template-rows").split(" ");
        console.log(nRows);
        this.element.style.setProperty("--n-rows", nRows.length.toString());
    }
    setState(newState, details) {
        assert(newState.length == this.tubes.length, "cannot change number of tubes with setState");
        for (const [idx, div] of this.tubes.entries()) {
            if (newState[idx].shroud < this.shroudHeights[idx]) {
                this.shroudHeights[idx] = newState[idx].shroud;
            }
            div.setState(newState[idx], this.shroudHeights[idx], details);
        }
        this.state = newState;
        this.aux.undoButton.disabled = this.undoStack.length === 0;
        this.aux.resetButton.disabled = this.state.every((tube, idx) => (this.initialState[idx].content === tube.content));
    }
    doAction(idx) {
        this.undoStack.push(this.state.slice());
        const quality = computeMove(this.state, idx);
        if (quality === "unmovable" /* MoveQuality.UNMOVABLE */) {
            this.undoStack.pop(); // nothing changed so don't clutter the undo stack
            return;
        }
        const skipLoseCheck = this.checkIfWonAndUpdateSerialBox();
        if (this.stateManager) {
            const details = this.stateManager.visitState(this.state);
            if (!skipLoseCheck && details.getChildren().size <= 0) {
                this.indicateLost();
            }
        }
        else {
            this.setState(this.state);
            if (!skipLoseCheck) {
                this.checkIfLost();
            }
        }
    }
    /**
     *
     * @returns true if the check for lost condition should be skipped
     */
    checkIfWonAndUpdateSerialBox() {
        const serial = serializeGameState(this.state);
        if (this.aux.serialBox.content === serial) {
            return true; // if reordering stuff from solved state do not alert the user every time
        }
        this.aux.serialBox.content = serial;
        if (serial === this.solved) {
            this.alert("YOU WIN!");
            return true;
        }
        return false;
    }
    checkIfLost() {
        for (let idx = 0; idx < this.state.length; idx++) {
            if ("unmovable" /* MoveQuality.UNMOVABLE */ !== computeMove(this.state.slice(), idx)) {
                return; // a move changes the state, have not lost yet
            }
        }
        this.indicateLost();
    }
    indicateLost() {
        // every move did nothing, tell the user
        this.alert("no moves available, undo or reset.");
    }
    undo() {
        const state = this.undoStack.pop();
        if (state === undefined) {
            this.alert("you are at the initial state");
            return;
        }
        if (this.stateManager) {
            this.stateManager.visitState(state);
        }
        else {
            this.setState(state);
        }
    }
    reset() {
        if (this.state.some((tube, idx) => {
            const val = (tube.content !== this.initialState[idx].content);
            return val;
        })) {
            // state has changed so actually perform reset
            const newState = this.initialState.slice();
            this.undoStack.push(this.state);
            if (this.stateManager) {
                this.stateManager.visitState(newState);
            }
            else {
                this.setState(newState);
            }
        }
        else {
            this.alert("you are at the initial state".concat(this.undoStack.length > 0 ? " (you can still undo the reset)" : ""));
        }
    }
    reorderTubes() {
        // note this doesn't touch undo stack, it just normalizes the stuff in place.
        Tube.normalize(this.state);
        this.setState(this.state);
    }
    alert(msg) {
        // set a small timeout so printing a message about a new state gives the dom time to update the display before printing the message
        setTimeout(() => { alert(msg); }, 200);
    }
}
GameUI.className = "GameBoard";
export let game;
export function initGame() {
    let { nColors, ballsPerColor, empties, emptyPenalty, extraSlack } = gameSettings;
    if (nColors > COLORS.length) {
        nColors = COLORS.length;
    }
    const initialState = newGameBoard(nColors, ballsPerColor, empties, ballsPerColor - emptyPenalty, extraSlack);
    const solvedState = serializeGameState(makeSolvedGameBoard(nColors, ballsPerColor, empties, ballsPerColor - emptyPenalty, extraSlack));
    game = new GameUI(document.getElementById("game"), document.getElementById("controls"), initialState, solvedState);
}
export function serializeGameState(state) {
    const mutableStateCopy = state.slice();
    Tube.normalize(mutableStateCopy);
    return mutableStateCopy.map(x => x.content.concat(x.capacity.toString())).join(",");
}
// @license-end
