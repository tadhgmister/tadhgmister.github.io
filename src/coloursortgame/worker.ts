import {StateDetails, StateManager, StateUsefulness} from "./graphystuffs.js";
import {workerSideRegisterHandlers} from "./commonHelpers.js";
import { SerializedState, SerializedTube, serializeGameState, Tube } from "./v2.js";
////// type stuff
// these define the types of the handlers based on the handers variable below
export type Handlers = typeof handlers;
//////// handlers for messages
const handlers = workerSideRegisterHandlers({
    /**
     * checks whether the given initial state is solvable by walking over all states
     * returns true if solvable, false otherwise.
     */
    async checkSolvability(initialStateSerial: SerializedTube[]): Promise<{solvable:true} | {solvable:false, states:number}> {
	const initialState = initialStateSerial.map(Tube.loadFromSerial);
	const setOfSeen = new Set<SerializedState>();
	// the callback to run when found a winning state will throw setOfSeen like an error
	// as a sentinel value to signal we found the winning state
	// if we wanted to count the number of moves or how many states were checked
	// some other system would be needed
	// but otherwise we just walk over all the nodes until one of them triggers the win callback
	// and if not and we visit all the nodes then just give up.
	const callbackWhenSeenWonState = ()=>{throw setOfSeen}
	const initDets = makeStateDetailsForSolvabilityChecker(initialState,
							       setOfSeen,
							       callbackWhenSeenWonState);
	const statesToCheck = [initDets];
	try{
	    while(true){ // break when statesToCheck is empty or a won state is found leading to catch
		const dets = statesToCheck.pop();
		// if we run out of non dead states to check then the level is not solvable
		if(dets === undefined){
		    return {solvable:false, states:setOfSeen.size};
		}
		for(const child of dets.getChildren()){
		    // getChildren is setup to never yield dead states and we expect to
		    // exit this while loop from finding a won state before we end up here
		    // so these children should never be seen as dead or won, only live states
		    if(child.isDead() || child.isWon()){
			throw new Error("assumption that checkSolvability loop only sees live states is broken");
		    }
		    statesToCheck.push(child);
		}
	    }
	} catch (e){
	    if (e === setOfSeen){
		return {solvable:true}; // the callback we set to throw m triggered, so there exists a win state.
	    } // other errors should be propogated
	    throw e;
	}
	// typescript correctly marks this as unreachable,
	// if an edit allows code to get to here it will be a type error due to explicit return type
	// replace this comment with a description of the case this represents if the code is restructured
	//return false; 
	    
    }
});

///////// extra helper stuff needed for the callbacks to actually do their jobs
/**
 * helper for solvability checker, makes a StateDetails object such that when it needs new children
 * it reuses this function to generate the actual child detail objects
 * particularly, if it gives a state that has already been seen it returns a dummy dead state
 * and doesn't actually keep track of the state details like the normal StateManager does
 * in an effort to reduce memory usage during solvability checking.
 * as revisiting states is not important but avoiding checking the same states multiple times is important.
 */
function makeStateDetailsForSolvabilityChecker(
    state: readonly Tube[],
    setOfSeenStates: Set<SerializedState>,
    callWhenWonFound: ()=>void,
    id = serializeGameState(state)
): StateDetails{
    if(setOfSeenStates.has(id)){
	const deadProxy = new StateDetails(id,state,()=>{throw new Error("already visited state was analysed again")}, ()=>null);
	deadProxy.usefulness = StateUsefulness.DEAD;
	return deadProxy;
    }
    setOfSeenStates.add(id);
    return new StateDetails(id,state,
			    (_parent,_move,child)=>makeStateDetailsForSolvabilityChecker(child, setOfSeenStates, callWhenWonFound),
			    (_parents, use)=>{
				if(use === StateUsefulness.WINNING){
				    callWhenWonFound();
				}
			    });
    
}
/** walks over every child node of this one depth first so the callbacks triggered by StateDetails are called as the children are computed */
function walkNodeDepthFirst(node: StateDetails){
    for(const child of node.getChildren()){
	if(child.usefulness !== StateUsefulness.DEAD){
	    walkNodeDepthFirst(child);
	}
    }
}

class statemanagerwithwindetectshortcut extends StateManager{
    constructor(private detectedAWonState: ()=>void){
	super()
    }
    protected labeledAsWonCallback(parents: StateDetails["parentStates"]){
	this.detectedAWonState();
	super.labeledAsWonCallback(parents);
    }
}
