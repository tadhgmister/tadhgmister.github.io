function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg);
    }
}
class Tube {
    //public static readonly EMPTY = new Tube("");
    constructor(content, capacity) {
        this.content = content;
        this.capacity = capacity;
    }
    valueOf() { return this.content.concat(this.capacity.toString()); }
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
    slack() {
        return this.capacity - this.content.length;
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
    moveToOthers(others) {
        const color = this.topColor;
        if (color === undefined) {
            return this;
        } // this tube is empty, nothing to do
        const topCount = this.topCount;
        let ballsLeftToMove = topCount;
        for (let idx = 0; idx < others.length && ballsLeftToMove > 0; idx++) {
            const dest = others[idx];
            if (dest === this || dest.topColor !== color) {
                continue;
            } // the tube is another colour
            const slack = dest.slack();
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
            if (a.content < b.content) {
                return -1;
            }
            else if (a.content === b.content) {
                return 0;
            }
            else if (a.content > b.content) {
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
            const toDist = colorsToRedistribute.get(col), slack = t.slack();
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
 * executes a move on a game state.
 * This modifies the list of tubes in place even if the movement didn't accomplish anything
 * returns whether the top color of the selected tube changed.
 * @param tubes set of tubes to modify
 * @param capacity capacity of each tube
 * @param idx index of tube to empty
 * @returns true if the move removed enough balls to be useful, false otherwise
 */
export function computeMove(tubes, idx) {
    // TODO: right now this tries to move to partial tubes, if it fails it moves ALL exposed balls of the colour to an empty tube
    // which is probably undesirable but not strictly invalid game design choice. Will want to come back and change
    // but may not bother until I have it working well on a touch screen where I care about the tappy taps.
    const { topColor: col, topCount } = tubes[idx];
    if (col === undefined) {
        return false; // you tried to do a move from an empty tube, there is nothing to be done.
    }
    const backupState = tubes.slice();
    tubes[idx] = tubes[idx].moveToOthers(tubes);
    if (tubes[idx].topColor === col) {
        let idxOfEmpty;
        // try to collect the colour in an empty tube if there are any
        for (const [ii, candidate] of backupState.entries()) {
            tubes[ii] = backupState[ii];
            if (candidate.isEmpty && candidate.capacity >= topCount) {
                idxOfEmpty = ii;
            }
        }
        if (idxOfEmpty !== undefined) {
            [tubes[idx], tubes[idxOfEmpty]] = tubes[idx].moveToEmpty(tubes[idxOfEmpty].capacity);
        }
    }
    return tubes[idx].topColor == col;
}
const COLORS = "ABCDEFGHIJKLMNOP";
function makeSolvedGameBoard(n_colours, balls_per_colour, empty_tubes, empty_tube_capacity = balls_per_colour) {
    const board = [];
    for (let idx = 0; idx < n_colours; idx++) {
        board.push(new Tube(COLORS[idx].repeat(balls_per_colour), balls_per_colour));
    }
    for (let idx = 0; idx < empty_tubes; idx++) {
        board.push(new Tube("", empty_tube_capacity));
    }
    return board;
}
function newGameBoard(n_colours, balls_per_colour, empty_tubes, empty_tube_capacity = balls_per_colour) {
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
        result.push(new Tube(flatboard.splice(0, balls_per_colour).join(""), balls_per_colour));
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
class UIElement {
    constructor(tag, parent) {
        var _a;
        // Determine the parent element: it can either be an HTMLElement or a UIElement (in which case, we take its element)
        const parentElement = parent instanceof UIElement ? parent.element : parent;
        // Create a new DOM element of the type defined by the instance property
        this.element = document.createElement(tag);
        this.element.classList.add((_a = this.constructor.className) !== null && _a !== void 0 ? _a : this.constructor.name);
        // Append the new element to the parent element
        parentElement.appendChild(this.element);
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
    constructor(parent, color) {
        // Call the UIElement constructor with the tag 'div'
        super('div', parent);
        const label = document.createElement("span");
        label.innerText = color;
        this.element.appendChild(label);
        this.element.classList.add(color);
        this.color = color;
    }
}
BallDiv.className = "Ball";
class TubeDiv extends UIElement {
    constructor(parent, tube, clickCallback) {
        super("div", parent);
        this.balls = [];
        this.capacity = tube.capacity;
        this.element.style.setProperty("--balls-per-tube", tube.capacity.toString());
        this.element.addEventListener("click", clickCallback);
        for (const col of tube.content) {
            this.balls.push(new BallDiv(this, col));
        }
    }
    setState({ content, capacity }) {
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
    }
    getContent() {
        return this.balls.map(div => div.color).join("");
    }
}
TubeDiv.className = "Tube";
class GameUI extends UIElement {
    constructor(parent, initialState, solved) {
        super("main", parent);
        this.initialState = initialState;
        this.solved = solved;
        this.tubes = [];
        this.undoStack = [];
        this.state = initialState.slice();
        for (const [idx, tube] of initialState.entries()) {
            this.tubes.push(new TubeDiv(this, tube, ev => {
                this.doAction(idx);
            }));
        }
        this.undoButton = new ActionButton(parent, "undo", () => { this.undo(); });
        this.resetButton = new ActionButton(parent, "reset", () => { this.reset(); });
        this.undoButton.disabled = true;
        this.resetButton.disabled = true;
        this.serialBox = new InfoBox(parent, serializeGameState(initialState));
        if (initialState.every(x => (x.capacity === initialState[0].capacity))) {
            this.normalizeButton = new ActionButton(parent, "reorder tubes", () => { this.reorderTubes(); });
        }
    }
    setState(newState) {
        assert(newState.length == this.tubes.length, "cannot change number of tubes with setState");
        for (const [idx, div] of this.tubes.entries()) {
            div.setState(newState[idx]);
        }
        this.state = newState;
        this.undoButton.disabled = this.undoStack.length === 0;
        this.resetButton.disabled = this.state.every((tube, idx) => (this.initialState[idx].content === tube.content));
    }
    doAction(idx) {
        this.undoStack.push(this.state.slice());
        const isSameState = computeMove(this.state, idx);
        if (isSameState) {
            this.undoStack.pop(); // nothing changed so don't clutter the undo stack
        }
        this.setState(this.state);
        this.checkIfWonAndUpdateSerialBox();
        this.checkIfLost();
    }
    checkIfWonAndUpdateSerialBox() {
        const serial = serializeGameState(this.state);
        if (this.serialBox.content === serial) {
            return; // if reordering stuff from solved state do not alert the user every time
        }
        this.serialBox.content = serial;
        if (serial === this.solved) {
            this.alert("YOU WIN!");
        }
    }
    checkIfLost() {
        for (let idx = 0; idx < this.state.length; idx++) {
            if (!computeMove(this.state.slice(), idx)) {
                return; // a move changes the state, have not lost yet
            }
        }
        // every move did nothing, tell the user
        this.alert("no moves available, undo or reset.");
    }
    undo() {
        const state = this.undoStack.pop();
        if (state === undefined) {
            this.alert("you are at the initial state");
            return;
        }
        this.setState(state);
    }
    reset() {
        if (this.state.some((tube, idx) => {
            const val = (tube.content !== this.initialState[idx].content);
            return val;
        })) {
            // state has changed so actually perform reset
            const newState = this.initialState.slice();
            this.undoStack.push(this.state);
            this.setState(newState);
        }
        else {
            alert("you are at the initial state".concat(this.undoStack.length > 0 ? " (you can still undo the reset)" : ""));
        }
    }
    reorderTubes() {
        // note this doesn't touch undo stack, it just normalizes the stuff in place.
        Tube.normalize(this.state);
        this.setState(this.state);
    }
    alert(msg) {
        // set a small timeout so printing a message about a new state gives the dom time to update the display before printing the message
        setTimeout(() => { alert(msg); }, 2);
    }
}
GameUI.className = "GameBoard";
function getUrlParameters() {
    var _a, _b, _c, _d;
    const urlParams = new URLSearchParams(window.location.search);
    // Get ncolours from query, or default to 7 if not present
    let ncolours = parseInt((_a = urlParams.get('ncolors')) !== null && _a !== void 0 ? _a : "") || 8;
    if (ncolours > COLORS.length) {
        ncolours = COLORS.length;
    }
    // Get ballspercolour from query, or default to 4 if not present
    const ballsPerColour = parseInt((_b = urlParams.get('ballspercolor')) !== null && _b !== void 0 ? _b : "") || 4;
    const emptyTubes = parseInt((_c = urlParams.get("empties")) !== null && _c !== void 0 ? _c : "") || 2;
    const tubeCapacity = parseInt((_d = urlParams.get('emptysize')) !== null && _d !== void 0 ? _d : "") || ballsPerColour;
    return { ncolours, ballsPerColour, emptyTubes, tubeCapacity };
}
export function initGame() {
    const { ncolours, ballsPerColour, emptyTubes, tubeCapacity } = getUrlParameters();
    const initialState = newGameBoard(ncolours, ballsPerColour, emptyTubes, tubeCapacity);
    const solvedState = serializeGameState(makeSolvedGameBoard(ncolours, ballsPerColour, emptyTubes, tubeCapacity));
    const game = new GameUI(document.body, initialState, solvedState);
}
function serializeGameState(state) {
    const mutableStateCopy = state.slice();
    Tube.normalize(mutableStateCopy);
    return mutableStateCopy.map(x => x.content.concat(x.capacity.toString())).join(",");
}