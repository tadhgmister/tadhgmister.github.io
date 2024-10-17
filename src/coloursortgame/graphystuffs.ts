// @license magnet:?xt=urn:btih:1f739d935676111cfff4b4693e3816e664797050&dn=gpl-3.0.txt GPL-v3-or-Later

import { SerializedState, SerializedTube, Tube, assert, computeMove, serializeGameState } from "./v2.js";
// Import the types from the installed Cytoscape package
import type { Core } from 'cytoscape';

// Dynamically import Cytoscape from the CDN
const loadCytoscape = (): Promise<typeof import('cytoscape')> => {
  return import('https://cdn.jsdelivr.net/npm/cytoscape@3.23.0/dist/cytoscape.min.js' as 'cytoscape');
};

/*
Notes:
the graphing logic should be entirely optional for the game.
It should play just fine with this module just not included. 

The graphing logic will mainly consist of a hashmap of serialized states with details about that state
the details should include child states keyed by the .valueOf() of the tube being acted on
as if there are multiple tubes with identical contents acting on either of them will perform the same thing
for the sake of UI highlighting and solver additional info the child states should also hold a flag for whether an empty tube is used for the movement

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

/**
 * object stored in child state map, holds a serialized new state, optionally a sample state
 * and whether the move filled an empty tube or just moved to other partially full tubes.
 */
interface MoveDetails {
    /** the state resulting from this move */
    result: SerializedState;
    sampleState?: Tube[];
    quality: MoveQuality;
}
/**
 * represents the "quality" of a move in terms of how much options it leaves open
 * - NORMAL means the move involves moving balls to already partially full and mixed tubes
 * - PURE means it moved to a tube that already only contained the colour in question
 * - DRAIN means it moved to a previously empty tube
 * - SHIFT is moving a pure tube to an empty tube.
 */
export const enum MoveQuality {
    NORMAL="normal",
    PURE="pure",
    DRAIN="drain",
    SHIFT="shift",
    UNMOVABLE="unmovable"
}
export type TubeHighlight = MoveQuality | "unmovable";
// type is exported as it is used by others but do not export constructor, these should only be managed
// by the StateManager and retrieved and created through that exclusively.
export type { StateDetails };
class StateDetails {
    /** 
     * holds possible moves that can be executed from this state
     * is computed on demand so the master list of states can create an entry for every state
     * 
     */
    private childStates?: Map<SerializedTube, MoveDetails>;
    public readonly parentStates: Set<SerializedState> = new Set();
    public visited: boolean = false;
    /**
     * @param id the serialized version of this state
     * @param lastSeen a sample real state to compute children states with instead of loading the serialized string
     * @param callWhenComputingChildren this is a callback that passes this details own id and the id of a child state when computing of child states is initiated
     *          this can be used to update parent associations when children are computed on demand.
     */
    constructor(
        public readonly id: SerializedState, 
        private lastSeen: readonly Tube[], 
        private readonly callWhenComputingChildren: (parent:SerializedState, child:SerializedTube, refChildState: Tube[])=>void
    ){ }
    
    public getChildren(){
        if(this.childStates !== undefined){
            return this.childStates;
        }
        this.childStates = new Map();
        for(const [idx,tube] of this.lastSeen.entries()){
            const content = tube.valueOf();
            if(this.childStates.has(content)){
                continue;
            }
            const refState = this.lastSeen.slice();
            const quality = computeMove(refState, idx);
            if(quality === MoveQuality.UNMOVABLE){continue;} // move didn't do anything
            const result = serializeGameState(refState);
            this.childStates.set(content, {result, sampleState: refState, quality});
            this.callWhenComputingChildren(this.id, result, refState);
        }
        return this.childStates;
    }
    /**
     * gets the quality of the move resulting from the given tube
     * will return undefined if the tube doesn't produce any valid move
     * and the TubeHighlight otherwise 
     * @param tube the tube that could be clicked on
     */
    public getMoveStat(tube: Tube): TubeHighlight {
        return this.getChildren().get(tube.valueOf())?.quality ?? "unmovable";
    }
    public visit(state: readonly Tube[]){
        this.visited = true;
        this.lastSeen = state;
    }
}

export class StateManager{
    private readonly states: Map<SerializedState, StateDetails> = new Map();
    constructor(private readonly visitCallback: (state: readonly Tube[], details: StateDetails)=>void){}
    
    public visitState(state: readonly Tube[]){
        const id = serializeGameState(state);
        const details = this.getOrCreateEntry(id, state);
        details.visit(state);
        this.visitCallback(state, details);
        return details;
    }
    private getOrCreateEntry(id: SerializedState, sampleState: readonly Tube[]){
        let details = this.states.get(id);
        if(details === undefined){
            details = new StateDetails(id, sampleState, this.newParentInfoCallback);
            this.states.set(id, details);
        }
        return details;
    }
    private newParentInfoCallback = (source:SerializedState, target:SerializedState, sampleState: Tube[]) => {
        let targetDetails = this.getOrCreateEntry(target, sampleState);
        targetDetails.parentStates.add(source);
    }
}

// @license-end