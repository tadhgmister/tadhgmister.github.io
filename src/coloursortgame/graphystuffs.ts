// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

import {serializeGameState} from "./v2.js";
import type { Color, SerializedState, SerializedTube, Tube } from "./v2.js";

import { assert, assert_never, COMPUTE_CHILDREN_ON_VISIT } from "./commonHelpers.js";

// Import the types from the installed Cytoscape package
// import type { Core } from 'cytoscape';

// Dynamically import Cytoscape from the CDN
// const loadCytoscape = (): Promise<typeof import('cytoscape')> => {
//   return import('https://cdn.jsdelivr.net/npm/cytoscape@3.23.0/dist/cytoscape.min.js' as 'cytoscape');
// };


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
    /** number of elements moved */
    let successfullyMoved = 0;
    /** number of tubes shifted to */
    let candidatesUsed: Array<number> = [];
    // sort in ascending order of slack so ones with most available space are at the end
    candidateIdxs.sort((a,b)=>tubes[a].slack - tubes[b].slack);
    // as long as the one with most space can't fit all the balls we need to move:
    while(tubes[candidateIdxs.at(-1)!].slack < minElemsToMove-successfullyMoved){
        // pop it out of the list and fill it with balls
        const idx = candidateIdxs.pop()!;
        const slack = tubes[idx].slack;
        successfullyMoved += slack;
	candidatesUsed.push(idx);
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
	    candidatesUsed.push(idx);
            return [successfullyMoved, candidatesUsed] as const;
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
	// we need to move more than there is space in partial tubes so some needs to go to empty tubes
	// move as little as needed to empty tubes and the rest to partials
        const minNeededToGoToEmpties = toMoveCount - partialsSlack;
        if(minNeededToGoToEmpties > emptySlack){
            // there is insufficient room in empty or partial tubes to hold all the balls we are trying to move
            // most likely there are just no viable targets and no empty tubes
            return MoveQuality.UNMOVABLE;
        } else if(isSourcePure && partialsSlack == 0){
	    // if we are just moving from one pure tube to another try to move to the tube with a bit more capacity than we start with
	    // so moving balls around tubes with different heights can actually be accomplished
	    // if this succeeds we return right away, otherwise fallthrough to full algorithm
	    // inevitably with a SHIFT move to split into shorter tubes
	    for(const candidateIdx of empties.sort((a,b)=>(tubes[a].capacity-tubes[b].capacity))){
		if(tubes[candidateIdx].capacity > toMoveCount){
		    const [elemsMoved, tubesUsed] = moveHelper(tubes, [candidateIdx], col, toMoveCount, toMoveCount);
		    assert(tubesUsed.length == 1 && elemsMoved == toMoveCount, "trying to move from one pure tube to the next higher capacity failed spectacularly");
		    tubes[idxToDrain] = source.withTopRemoved(topCount);
		    return MoveQuality.PURE;
		}
	    }
	}
        result = MoveQuality.DRAIN;
        const [elemsMoved,tubesUsed] =  moveHelper(tubes, empties, col, minNeededToGoToEmpties, toMoveCount);
	toMoveCount -= elemsMoved;
        if(isSourcePure && toMoveCount === 0){
	    // we moved from a pure tube to just empties, this
	    // necessarily implies we have tubes with different sizes.
	    // if we moved to a single other tube with larger capacity call it a PURE move where as
	    // to a shorter or splitting up as a SHIFT in order to identify the winning condition.
	    if(tubesUsed.length === 1 && tubes[tubesUsed[0]].capacity > source.capacity){
		// this can still happen when there is partial tubes to move to as well as empties
		result = MoveQuality.PURE;
	    } else {
		// if we split to multiple shorter tubes or to a single shorter tube call this a SHIFT move,
		// this is the only move type that is allowed from the win state.
		result = MoveQuality.SHIFT;
	    }
        }
    }
    // if there is still stuff to move after possibly consulting empty tubes (could be in addition or instead of)
    // then move everything else to partials
    // we should be certain there is enough room as if there wasn't the toMoveCount would be lowered by empties
    // and if there wasn't enough space in the empties then UNMOVABLE should have already been returned.
    if(toMoveCount > 0){
        assert(toMoveCount === moveHelper(tubes, partials, col, toMoveCount, toMoveCount)[0], "move failed somehow");
    }
    tubes[idxToDrain] = source.withTopRemoved(topCount);
    return result;
}
/*
Notes:
the graphing logic should be entirely optional for the game.
It should play just fine with this module just not included. 

The graphing logic will mainly consist of a hashmap of serialized
states with details about that state the details should include child
states keyed by the .valueOfStripped() of the tube being acted on as
if there are multiple tubes with identical contents (possibly varying
in how many balls they have at the top due to normalization) acting on
either of them will perform the same thing for the sake of UI
highlighting and solver additional info the child states should also
hold a flag for whether an empty tube is used for the movement

Useful graph node properties:
- dead or leading to only dead states
- has not obviously dead states that have not been explored
- has empty tubes

available styling:
- shape of node (definitely make dead states an x)
- border colour
- border thickness
- node size
- text label
- background colour
*/

function idleWait(timeout = 100): Promise<IdleDeadline | unknown> {
    if(window.requestIdleCallback === undefined){
	return new Promise((resolve)=>{window.setTimeout(resolve, timeout)});
    } else{
	return new Promise((resolve)=>{window.requestIdleCallback(resolve, {timeout})});
    }
}
/** wrapper around another generator so it is not closed by a for loop allowing it to be continued later */
function *genNoCloseWrapper<T,R,S>(generator: Generator<T,R,S>, firstSend: S): Generator<T,R,S>{
    let sent: S = firstSend;
    while(true){
	const result = generator.next(sent)
	if(result.done){
	    return result.value
	}
	sent = yield result.value;
    }
}

/**
 * represents the "quality" of a move as returned by computeMove
 * documentation on each symbol describes the specific behaviours
 * @see computeMove
 */
export const enum MoveQuality {
    /** moves balls to other partially filled and mixed tubes */
    NORMAL="normal",
    /** moves balls to a previously empty tube */
    DRAIN="drain",
    /** there is no viable move */
    UNMOVABLE="unmovable",
    /** moves balls from a pure tube to an empty with higher capacity, only used when there are tubes of different sizes */
    PURE="pure",
    /** move from pure tube to smaller tubes, this is only relevant if there are different sized tubes and the only move possible from the win state. */
    SHIFT="shift",
}
/**
 * the "state" of a game state in terms of its viable moves.
 * All StateDetails start with UNKNOWN and can be modified when child states are computed.
 * see documentation of each symbol for specific meaning.
 */
export const enum StateUsefulness {
    /** this state hasn't had the children computed yet */
    UNKNOWN="notComputed",
    /** this state has at least one move that leads to an alive or unknown state */
    ALIVE="alive",
    /** all possible moves lead to dead states or no legal moves and is not the won state */
    DEAD="dead",
    /** this state has a move that leads to the final win state */
    WINNING="winning",
}

/** pair of move quality and state usefulness of resulting state
from a move these are both used as css classes on the tubes, can also
have a third element "visited" to mark the state the move goes to as
already visited by the user.
 */
export type TubeHighlight = readonly [MoveQuality, StateUsefulness, ...([] | ["visited"])];

/**
 * structure for a game move, this stores a reference to the target
 * state and the quality of the move from the previous state. The previous state is not stored 
 */
class MoveDetails {
    /** special value that is not a full MoveDetails as it lacks a valid result state
     * but has a highlight property that is UNMOVABLE to be put into child state mapping
       target state is marked as dead to simplify logic to check if any child state is not dead*/
    public static readonly UNMOVABLE = {highlight: [MoveQuality.UNMOVABLE, StateUsefulness.DEAD] as const, resultState:undefined };
    constructor(
	/** the id of the original state this move can be made from */
	public readonly parentId: SerializedState,
	/** the full state details of the state gone to by this move */
	public readonly resultState: StateDetails,
	/** the raw usefulness of the move, does not consider dead or winning criteria, @see this.quality */
	public readonly _moveQuality: MoveQuality){};
    /** the id of the gamestate this move goes to */
    public get targetId() {
	return this.resultState.id;
    }
    /** the type of move this is, can also return StateUsefulness.DEAD or .WINNING if the resulting state is known to be winning or dead */
    public get highlight(): TubeHighlight {
	if(this.resultState.visited){
	    
	    return [this._moveQuality, this.resultState.usefulness, "visited"] as const;
	}
	return [this._moveQuality, this.resultState.usefulness] as const;
    }
}


// type is exported as it is used by others but do not export constructor, these should only be managed
// by the StateManager and retrieved and created through that exclusively.
//export type { StateDetails };
/**
 * stores info about a state, the last seen variant of it and the child states.
 * The states are always using normalized version so lastSeen indicates the specific viewed game state that was visible to the user.
 */
export class StateDetails {
    /** 
     * holds possible moves that can be executed from this state
     * is computed on demand so the master list of states can create an entry for every state
     * NOTE:
     *  as a corner case, the new states are computed by the last seen and then not recomputed for newly visited variants of this state
     *  As such it is possible the number of cubes at the top of the tube does not match different variants and thus cannot be relied on
     *  as such the serializedTube keys have all but one of the top most element stripped out and getMoveStat expects this.
     */
    private moveMap?: Map<SerializedTube, MoveDetails | typeof MoveDetails.UNMOVABLE>;
    /** set of state ids that are parents to this one, note this is not filled in internally relying on the state manager to add entries */
    public readonly parentStates: Set<SerializedState> = new Set();
    /** whether the user has explicitly visited this state*/
    public visited: boolean = false;
    /**
     * the usefulness of this state, see StateUsefulness for description of each one.
     * broadly, this will be UNKNOWN before the state is analysed/moves are computed.
     * will be ALIVE/WINNING if we know this state can lead to other useful/won states, or DEAD if this state only leads to other dead states.
     */
    public usefulness: StateUsefulness = StateUsefulness.UNKNOWN;
    /** whether this is an ending state, either dead or won, is undefined if the state has not been fully computed */
    public isEnd?: boolean;
    /**
     * @param id the serialized version of this state
     * @param lastSeen a sample real state to compute children states with instead of loading the serialized string
     * @param callWhenComputingChildren this is a callback that passes this details own id and the id of a
     *          child state when computing of child states is initiated
     *          this can be used to update parent associations when children are computed on demand.
     */
    constructor(
        public readonly id: SerializedState, 
        private lastSeen: readonly Tube[],
	/** callback that is invoked to retrieve a child state while they are being computed, @see{StateManager.newParentInfoCallback} */
        private readonly callWhenComputingChildren: (parent: StateDetails, move: SerializedTube, refChildState: Tube[])=>StateDetails,
	/** callback invoked when a state which is dead or the won state  */
	private readonly callWhenStateHasNoLiveChildren: (parents: StateDetails["parentStates"], dead_or_won: StateUsefulness.DEAD | StateUsefulness.WINNING) => void
    ){ }
    /** shorthand to check if usefulness is dead */
    public isDead(): this is {usefulness: StateUsefulness.DEAD} {
	return this.usefulness === StateUsefulness.DEAD;
    }
    /** shorthand to check if this is an end state and is winning */
    public isWon(): this is {usefulness: StateUsefulness.WINNING, isEnd:true} {
	return this.isEnd===true && this.usefulness === StateUsefulness.WINNING;
    }
    /**
     * returns this.moveMap after computing it if not already computed.
     *
     * during the first time the moves are computed the following occurs:
     * - this.usefulness will not be left as UNKNOWN
     * - this.isEnd will be set to true or false not undefined
     * - this.callWhenComputingChildren will be called for each child state
     * - this.callWhenStateHasNoLiveChildren will be called if this state is found to be dead or won
     *
     * see documentation of this.moveMap for how to interpret it
     */
    private computeMoves(){
	// note the implementation of this function relies on lastSeen
	// being a actual usable state that can be given to
	// computeMove but the stored entries only use serialized strings.

	// note we make the assumption here that if there are tubes
	// that only differ by how many cubes are at the top of the
	// tube then all of them can make equivelent moves and lead to
	// the same normalized state, as moving cubes between tubes is
	// abstracted out and handled as part of normalization
	
        if(this.moveMap !== undefined){
            return this.moveMap;
        }
	// overriden to false if there is at least one move that is not a shift
	// used to detect winning state
	let onlyShiftMoves = true;
	this.isEnd = true; // overriden in loop unless every option is UNMOVABLE
	let viableLiveMoves = 0;
        this.moveMap = new Map();
        for(const [idx,tube] of this.lastSeen.entries()){
            const normed_content = tube.valueOfStripped();
            if(this.moveMap.has(normed_content)){
                continue;
            }
	    // refState is modified in place by computeMove so it becomes the result 
            const refState = this.lastSeen.slice();
            const quality = computeMove(refState, idx);
            if(quality === MoveQuality.UNMOVABLE){
		this.moveMap.set(normed_content, MoveDetails.UNMOVABLE);
		continue;
	    }
	    // there is at least one viable move regardless of what kind it is.
	    // this may be set back to true if we detect the won state below.
	    this.isEnd = false; 
	    if(quality !== MoveQuality.SHIFT){
		onlyShiftMoves = false;
		// if we have at least one move that is not a shift then we can't be in won state.
	    }
            const result = serializeGameState(refState);
            const childState = this.callWhenComputingChildren(this, result, refState);
            this.moveMap.set(normed_content, new MoveDetails(this.id, childState, quality));
	    if(childState.usefulness !== StateUsefulness.DEAD){
		viableLiveMoves += 1;
	    }
        }
	// in the case of a game like 6CAAAA,6CBBBB,6CCC,3 the only
	// viable move is to shift the pure tube of Cs to the shorter
	// empty tube and then the others can make use of the taller
	// tube to continue the game. So only having shift moves doesn't imply an end state.
	if(onlyShiftMoves && this.lastSeen.every((t)=>t.isPure)){
	    // we are in the end state and every tube is pure, therefore this is the won state.
	    this.usefulness = StateUsefulness.WINNING;
	    // set isEnd back to true, as even though there may be shift moves they will just lead back to the won state.
	    // this is also important for the isWon getter.
	    this.isEnd = true;
	} else if (viableLiveMoves === 0){
	    // we have no moves to live states and aren't the won
	    // state, so we are dead. It should not be possible for this branch to be hit unless the usefulness is still found to be unknown but an assert seems warrented.
	    assert( this.usefulness === StateUsefulness.UNKNOWN, "no viable live moves, not won state, but usefulness was already overriden from unknown?? " + this.usefulness);
	    this.usefulness = StateUsefulness.DEAD;
		
	} else if( this.usefulness !== StateUsefulness.WINNING ){
	    // we have a move and aren't the won state, so unless we have already been marked as winning we should be identified as alive
	    this.usefulness = StateUsefulness.ALIVE;
	} 
	// inform parents we are either a win final state or in a dead state if applicable.
	if(this.isDead() || this.isWon()){
	    this.callWhenStateHasNoLiveChildren(this.parentStates, this.usefulness);
	}
        return this.moveMap;
    }
    /**
     * gets the quality of the move resulting from the given tube
     * throws an error if the tube doesn't exist in this state.
     * @param tube the tube that could be clicked on
     */
    public getMoveStat(tube: Tube): TubeHighlight {
        const val =  this.computeMoves().get(tube.valueOfStripped());
	if(val !== undefined) {return val.highlight;}
	throw new Error("tube does not correspond to this state");
    }
    /**
     * marks this state as visited and may perform some analysis of its children.
     */
    public visit(state: readonly Tube[]){
        this.visited = true;
        this.lastSeen = state;
	if(COMPUTE_CHILDREN_ON_VISIT){
	    for (const {resultState} of this.computeMoves().values()){
		resultState?.computeMoves();
	    }
	}
    }
    /**
     * iterates over "useful" children, meaning:
     * - if this state is a won state yield itself
     * - if there is only one legal move (whether or not
     *   there are other moves that go to known dead states)
     *   yield the children of that state, potentially
     *   recursively walking down several forced moves to give
     *   the children of the last forced move or the won state at the end
     * - otherwise yield all non dead child states of this state.
     *
     * as such this may yield no children if it is found to be dead, may be one
     * if there are other options that are known to be dead or may be multiple
     * and they may not be direct children of this state but children of the first
     * non forced move from this state.
     *
     * if the argument is passed as true then this state not being marked as dead but all children being dead makes this return true
     * instead of throwing an error.
     */
    public *getChildren(inProcessOfDeterminingIfThisStateIsNowDead=false): Generator<StateDetails, StateUsefulness.DEAD|undefined>{
	// compute moves before checking if this is end or dead
	const moves = this.computeMoves().values();
	if(this.isEnd || this.isDead()){
	    // early return if we are an end state dead or not, only yield self
	    // if we are the won state though, so if a forced sequence leads to the winning state we do see it as a child.
	    if(this.isWon()){
		yield this;
	    }
	    return;
	}
	let hasADeadChildState = false;
	const children: StateDetails[] = [];
	for(const {resultState} of moves){
	    if(resultState === undefined){
		// unmovable entry
		continue;
	    } else if (resultState.isDead()){
		// dead state which we skip but keep track of so we don't
		// walk down "the only" live state if there is a choice here.
		hasADeadChildState = true;
		continue;
	    } //else add this to the list of viable children
	    children.push(resultState);
	}
	if(children.length === 0){
	    if (inProcessOfDeterminingIfThisStateIsNowDead){
		return StateUsefulness.DEAD;
	    }
	    throw new Error("state had no viable children but was not marked as end or dead");
	} else if (children.length === 1 && !hasADeadChildState){
	    // only go to the child if it is the ONLY legal move, if there are other children that are known to be dead we just return the one live child.
	    yield* children[0].getChildren();
	} else {
	    // yield all of the children of this state as there are choices
	    yield* children;
	}
    }
    /**
     * walks recursively over all non dead child states in a breadth
     * first search.  "depth" increments with each level of the breath
     * first search, where sequences of moves that are the only option
     * are considered one step. Each call to walk never yields the
     * same state multiple times and will not yield any known dead states, although unanalysed states may be produced which upon the next depth level will be analysed and may be found to be dead.
     */
    public *walk(depth=1, continueForeverSoCheatButtonBehavesUsefully=true): Generator<[number, Generator<StateDetails>], void, void>{
	const alreadyVisited: Set<SerializedState> = new Set();
	let nextRound: StateDetails[] = [this];
	while(nextRound.length > 0){
	    // note that helper visits all children of the states in our working list
	    // so this is the list of parents we are going to visit the children of
	    const thisRound = nextRound;
	    // and we will keep a list of states we visit this round for the next round
	    nextRound = [];
	    const gen = helper(thisRound, nextRound);
	    yield [depth, gen];
	    // helper exausts thisRound, if it isn't completely use up the sequence exaust it ourselves.
	    for(const _s of helper(thisRound, nextRound)){}
	    depth += 1;
	}
	// if we want to continue giving details about depth for the cheat button then do this
	// otherwise just let the function return
	while(continueForeverSoCheatButtonBehavesUsefully){
	    // for the sake of simplifying cheat button logic, it is desirable to be able to read the depth value multiple times
	    // so keep giving it and an empty generator
	    yield [depth, helper([],[])];
	}
	function *helper(thisRound: StateDetails[], toSeeChildren: StateDetails[]){
	    while(thisRound.length > 0){
		// RIGHT HERE IS WHERE THE CHILDREN ARE ACTUALLY CALCULATED BY THE WALK FUNCTION
		for(const state of thisRound.pop()!.getChildren()){
		    // by the nature of independent moves in different
		    // orders leading to the same state we often may
		    // re-visit the same state multiple times.  as well as
		    // by the nature of this function being a coroutine a
		    // state may be marked as dead after being added to
		    // viable children to traverse so recheck before yielding it.
		    if(alreadyVisited.has(state.id) || state.isDead()){continue;}
		    try{
			yield state;
		    }finally{
			// if the loop is broken do not lose this info.
			alreadyVisited.add(state.id);
			toSeeChildren.push(state);
		    }
		}
	    }
	}
    }
}

export class StateManager{
    /** master record of all states for a game */
    private readonly states: Map<SerializedState, StateDetails> = new Map();
    /** the state that most recently was being analysed by user (cheat button) */
    private stateBeingAnalysed?: StateDetails;
    /** generator for messages that is advanced when the same state is analysed multiple times */
    private analysisGenerator?: ReturnType<StateManager["analyseHelper"]>;
    constructor(
	/** a callback that is called whenever this.visitState is invoked to pass back the details of the state. */
	private readonly visitCallback: (state: readonly Tube[], details: StateDetails)=>void = (_s)=>{}
    ){}
    /**
     * calls visitCallback with the given state and a StateDetails
     * object that can lazy load details about viable children states.
     */
    public visitState(state: readonly Tube[]){
        const id = serializeGameState(state);
	
        const details = this.getOrCreateEntry(id, state);
        details.visit(state);
        this.visitCallback(state, details);
        return details;
    }
    /** helper for analyseState, yields a string message every time the cheat button should stop analysing
     * it is assumed that this.stateBeingAnalysed will not be changed during the handling of this generator
     */
    private async *analyseHelper(maxDepth = Infinity){
	let firstTime = true;
	for(const [depth, generator] of this.stateBeingAnalysed!.walk()){
	    if(depth > maxDepth){
		yield `analysed to hard capped maximum depth of ${maxDepth}`;
	    }
	    let hasAnyState = false;
	    let hasUnknownState = false;
	    let hasWonState = false;
	    let visitedCount = 0;
	    for(const state of generator){
		hasAnyState = true;
		if(!hasUnknownState && state.usefulness === StateUsefulness.UNKNOWN){
		    hasUnknownState = true;
		} else if(state.isWon()){
		    hasWonState = true;
		}
		if(++visitedCount % 100 == 0){
		    console.log("WAITING")
		    console.log("DONE:", await idleWait(50));
		}
	    }
	    if(hasWonState){
		yield `there exists a winning state ${depth} choices away`;
	    }else if(!hasAnyState){
		// the walk has reached all ends so it is just looping over empty lists at the same depth
		yield `nothing new to analyse at depth ${depth}`;
	    }else if(hasUnknownState){
		// the first time the cheat button is pushed on a given state we just iterate until we see an unknown state
		// so this just reports how far away it is, on subsequent uses of cheat button it says how far the analysis goes.
		if(firstTime){
		    firstTime = false;
		    yield `there is an unexplored state ${depth} choices away, press cheat again to analyse further`;
		} else{
		    yield `analysed to depth ${depth} checked ${visitedCount} states`;
		}
	    }
	    // otherwise we walked a layer where nothing was unknown, continue to another layer.
	}
	throw new Error("analyseHelper assumption that StateDetails.walk never returns was wrong");
    }
    /** computes info about navigable states from the given state and return the details similar to visitState but does not invoke the visit callback */
    public async analyseState(state: readonly Tube[], maxDepth=Infinity): Promise<{details:StateDetails, msg:string}>{
	const id = serializeGameState(state);
	const details = this.getOrCreateEntry(id, state);
	if(this.stateBeingAnalysed === undefined || this.analysisGenerator === undefined || this.stateBeingAnalysed.id !== details.id){
	    // moving to a new state, close generator if it exists
	    this.analysisGenerator?.return(undefined);
	    this.stateBeingAnalysed = details;
	    this.analysisGenerator = this.analyseHelper(maxDepth);
	}
	const result = await this.analysisGenerator.next();
	assert(!result.done, "analyseState assumption that the analyse helper never returns is incorrect")
	return {details, msg:result.value};
    }
    /**
     * if the given serialized gamestate hasn't been allocated in the
     * map of states create a new entry and return the entry, this
     * relies on visitState to call the visit method to supply a
     * reference actual usable gamestate for the sake of computing
     * children, which doesn't happen until called upon by the core game logic.
     */
    private getOrCreateEntry(id: SerializedState, sampleState: readonly Tube[]){
        let details = this.states.get(id);
        if(details === undefined){
            details = new StateDetails(id, sampleState, this.newParentInfoCallback, this.noChildrenCallback);
            this.states.set(id, details);
        }
        return details;
    }
    private newParentInfoCallback = (source: StateDetails, targetId: SerializedState, sampleState: Tube[]) => {
        let target = this.getOrCreateEntry(targetId, sampleState);
        target.parentStates.add(source.id);
	// this is maybe a weird place to put this but if we compute a new child relationship and the child is winning
	// then the parent should also be labeled as winning as the parent hierarchy
	if(source.usefulness === StateUsefulness.UNKNOWN && target.usefulness === StateUsefulness.WINNING){
	    source.usefulness = StateUsefulness.WINNING;
	    this.labeledAsWonCallback(source.parentStates);
	}
	return target;
    }
    private noChildrenCallback = (parents: StateDetails["parentStates"], wonOrDead: StateUsefulness.WINNING | StateUsefulness.DEAD)=>{
	if(wonOrDead == StateUsefulness.WINNING){
	    return this.labeledAsWonCallback(parents);
	}else if (wonOrDead == StateUsefulness.DEAD){
	    return this.labeledAsDeadCallback(parents);
	} else {
	    assert_never(wonOrDead, "noChildrenCallback got a value other than won or dead: " + wonOrDead);
	}
    }
    /** callback when a state is marked as dead or winning to inform all parents, may be called recursively as a result of updating more states */
    private labeledAsDeadCallback(parents: StateDetails["parentStates"]){
	// will recursively go up grandparent states until no more are being labeled as dead
	while(parents.size > 0){
	    // keep track of parents to these parents to visit 
	    let grandparents = new Set<SerializedState>();
	    parentsloop: for(const parentId of parents){
		const parent = this.states.get(parentId);
		if(parent === undefined || parent.usefulness == StateUsefulness.UNKNOWN){
		    throw new Error("parent state not initialized???");}
		if(parent.usefulness == StateUsefulness.DEAD){continue;} // don't recheck already marked states
		// check if all child states are dead, if so continue outer loop (skip this one)
		const {done, value} =  parent.getChildren(true).next();
		if(!done){
		    continue; // there was a live child
		}
		assert(value === StateUsefulness.DEAD, "getChildren(true) did not yield any live children but did not return DEAD");
		// all child states were DEAD states, so this parent is now going to be a dead state
		parent.usefulness = StateUsefulness.DEAD;
		for(const grandp of parent.parentStates){
		    grandparents.add(grandp);
		}
	    }
	    parents = grandparents;
	}
    }
    protected labeledAsWonCallback(parents: StateDetails["parentStates"]){
	const toVisit = new Array(...parents);
	while (true){
	    const id = toVisit.pop();
	    // idk if there is a clearer way to pack this loop into a 'for' so pop is typeschecked correctly
	    // I want to loop until the array is out of items and be able to add items within the loop
	    // if I put while(toVisit.length > 0) typescript still complains that pop may return undefined
	    if(id === undefined){return;}
	    const state = this.states.get(id);
	    if(state === undefined){
		throw new Error("walking up parents to mark as winning hit a missing state");
	    }
	    if(state.usefulness === StateUsefulness.WINNING){
		continue; // multiple paths through states is common, just skip duplicates
	    }
	    state.usefulness = StateUsefulness.WINNING;
	    toVisit.push(...state.parentStates)
	}
    }
}

// @license-end
