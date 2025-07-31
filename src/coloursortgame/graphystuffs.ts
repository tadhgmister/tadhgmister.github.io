// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

import { SerializedState, SerializedTube, Tube, assert, assert_never, computeMove, serializeGameState } from "./v2.js";
import { COMPUTE_CHILDREN_ON_VISIT } from "./settings.js";

// Import the types from the installed Cytoscape package
import type { Core } from 'cytoscape';

// Dynamically import Cytoscape from the CDN
// const loadCytoscape = (): Promise<typeof import('cytoscape')> => {
//   return import('https://cdn.jsdelivr.net/npm/cytoscape@3.23.0/dist/cytoscape.min.js' as 'cytoscape');
// };

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

export const enum LOOKAHEAD {
    /** if there is only one viable move of a computed state compute that state as well (recursively) */
    followPaths = 1,
    /** if a child has a reference state that is different from the current one - meaning it was reachable from a different state - expand that child */
    exploreMutual = 2,
    
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
export type { StateDetails };
/**
 * stores info about a state, the last seen variant of it and the child states.
 * The states are always using normalized version so lastSeen indicates the specific viewed game state that was visible to the user.
 */
class StateDetails {
    /** 
     * holds possible moves that can be executed from this state
     * is computed on demand so the master list of states can create an entry for every state
     * NOTE:
     *  as a corner case, the new states are computed by the last seen and then not recomputed for newly visited variants of this state
     *  As such it is possible the number of cubes at the top of the tube does not match different variants and thus cannot be relied on
     *  as such the serializedTube keys have all but one of the top most element stripped out and getMoveStat expects this.
     */
    private childStates?: Map<SerializedTube, MoveDetails | typeof MoveDetails.UNMOVABLE>;
    /** set of state ids that are parents to this one, note this is not filled in internally relying on the state manager to add entries */
    public readonly parentStates: Set<SerializedState> = new Set();
    /** whether the user has explicitly visited this state*/
    public visited: boolean = false;
    /**
     * updated when children are computed, if this state has no legal
     * moves (no children) it is marked as dead otherwise as alive.
     * 
     */
    public usefulness: StateUsefulness = StateUsefulness.UNKNOWN;
    /** whether this is an ending state, either dead or won, is undefined if the state has not been fully computed */
    public isEnd?: boolean;
    /**
     * @param id the serialized version of this state
     * @param lastSeen a sample real state to compute children states with instead of loading the serialized string
     * @param callWhenComputingChildren this is a callback that passes this details own id and the id of a child state when computing of child states is initiated
     *          this can be used to update parent associations when children are computed on demand.
     */
    constructor(
        public readonly id: SerializedState, 
        private lastSeen: readonly Tube[],
	/** callback that is invoked to retrieve a child state while they are being computed, @see{StateManager.newParentInfoCallback} */
        private readonly callWhenComputingChildren: (parent: StateDetails, child: SerializedTube, refChildState: Tube[])=>StateDetails,
	/** */
	private readonly callWhenStateHasNoLiveChildren: (parents: StateDetails["parentStates"], dead_or_won: StateUsefulness.DEAD | StateUsefulness.WINNING) => void
    ){ }
    
    public getChildren(){
	// note the implementation of this function relies on lastSeen
	// being a actual usable state that can be given to
	// computeMove but the stored entries only use serialized strings.

	// note we make the assumption here that if there are tubes
	// that only differ by how many cubes are at the top of the
	// tube then all of them can make equivelent moves and lead to
	// the same normalized state, as moving cubes between tubes is
	// abstracted out and handled as part of normalization
	
        if(this.childStates !== undefined){
            return this.childStates;
        }
	this.isEnd = true; // overriden in loop unless every option is UNMOVABLE
	let viableLiveMoves = 0;
        this.childStates = new Map();
        for(const [idx,tube] of this.lastSeen.entries()){
            const normed_content = tube.valueOfStripped();
            if(this.childStates.has(normed_content)){
                continue;
            }
	    // refState is modified in place by computeMove so it becomes the result 
            const refState = this.lastSeen.slice();
            const quality = computeMove(refState, idx);
            if(quality === MoveQuality.UNMOVABLE){
		this.childStates.set(normed_content, MoveDetails.UNMOVABLE);
		continue;
	    }
	    if(quality !== MoveQuality.SHIFT){
		this.isEnd = false;
		// we have a valid move so we aren't at the end.
	    }
            const result = serializeGameState(refState);
            const childState = this.callWhenComputingChildren(this, result, refState);
            this.childStates.set(normed_content, new MoveDetails(this.id, childState, quality));
	    if(childState.usefulness !== StateUsefulness.DEAD){
		viableLiveMoves += 1;
	    }
        }
	// we may get our usefulness overriden by callWhenComputingChildren, specifically if one of our children were determined to be winning then we are set to winning as well.
	if(this.usefulness === StateUsefulness.UNKNOWN){
	    if(this.isEnd && this.lastSeen.every((t)=>t.isPure)){
		// we are in the end state and every tube is pure, therefore this is the won state.
		this.usefulness = StateUsefulness.WINNING;
	    } else if(viableLiveMoves > 0){
		// we have a move so this is an alive state
		this.usefulness = StateUsefulness.ALIVE;
		// if all viable moves were shifts then we'd consider
		// it an end state and I'm fairly certain the only way
		// that could happen is for every tube to be pure and
		// thus be identified as the win state above but if I
		// am incorrect the error should originate from here
		// and not some misformed behaviour from being in an
		// alive end state.
		assert(!this.isEnd, "assumption that having viable live moves implies we are not in the end state is incorrect");
	    } else {
		// we have no moves to live states so this is a dead state, whether or not we are in an end state.
		this.usefulness = StateUsefulness.DEAD;
	    }
	}
	// inform parents we are either a win final state or in a dead state.
	if(viableLiveMoves === 0){
	    assert(this.usefulness === StateUsefulness.DEAD || this.usefulness === StateUsefulness.WINNING,
		   "logic to inform parents of state ended up with an invalid usefulness calculated.");
	    this.callWhenStateHasNoLiveChildren(this.parentStates, this.usefulness);
	} else if (viableLiveMoves === 1){
	    // if there is only one viable move explore its children to potentially update this states usefulness if it is dead or winning
	    for(const t of this.childStates.values()){
		t.resultState?.getChildren();
	    }
	}
        return this.childStates;
    }
    /**
     * gets the quality of the move resulting from the given tube
     * throws an error if the tube doesn't exist in this state.
     * @param tube the tube that could be clicked on
     */
    public getMoveStat(tube: Tube): TubeHighlight {
        const val =  this.getChildren().get(tube.valueOfStripped())?.highlight;
	if(val !== undefined) {return val;}
	throw new Error("tube does not correspond to this state");
    }
    public visit(state: readonly Tube[]){
        this.visited = true;
        this.lastSeen = state;
	if(COMPUTE_CHILDREN_ON_VISIT){
	    for (const [t,move] of this.getChildren()){
		move.resultState?.getChildren();
	    }
	}
    }
}

export class StateManager{
    private readonly states: Map<SerializedState, StateDetails> = new Map();
    constructor(private readonly visitCallback: (state: readonly Tube[], details: StateDetails)=>void){}
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
    /** computes info about navigable states from the given state and return the details similar to visitState but does not invoke the visit callback */
    public analyseState(state: readonly Tube[]): {details:StateDetails, depth:number}{
	const id = serializeGameState(state);
	const details = this.getOrCreateEntry(id, state);
	let depth = 0;
	if (details.usefulness === StateUsefulness.UNKNOWN){
	    details.getChildren();
	    return {details, depth}; // if the state wasn't analysed before just analyse it and return
	}
	let substatesToAnalyse: StateDetails[] = [details];
	let needToGoDeeper = true;
	while (needToGoDeeper && substatesToAnalyse.length > 0){
	    depth += 1;
	    // take a copy of the substates we identified and reset the substates list
	    const thisRound = substatesToAnalyse;
	    substatesToAnalyse = [];
	    for(const stateToIterateChildren of thisRound){
		for(const move of stateToIterateChildren.getChildren().values()){
		    const substate = move.resultState;
		    if(substate === undefined){
			// non move, can skip
			continue;
		    }
		    if(substate.usefulness === StateUsefulness.UNKNOWN){
			// if this state was unknown then just enumerate its children
			needToGoDeeper = false;
			substate.getChildren();
		    } else if (needToGoDeeper){
			// if this state and all the others are identified we will need to enumerate all their children
			substatesToAnalyse.push(substate);
		    }
		}
	    }
	}
	return {details, depth}
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
		for(const [t, {highlight}] of parent.getChildren()){
		    if(highlight[1] !== StateUsefulness.DEAD){
			continue parentsloop;
		    }
		}
		// all states were DEAD states, so this parent is now going to be a dead state
		parent.usefulness = StateUsefulness.DEAD;
		for(const grandp of parent.parentStates){
		    grandparents.add(grandp);
		}
	    }
	    parents = grandparents;
	}
    }
    private labeledAsWonCallback(parents: StateDetails["parentStates"]){
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
