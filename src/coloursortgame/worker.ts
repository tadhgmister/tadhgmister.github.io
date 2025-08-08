import {StateDetails, StateManager} from "./graphystuffs.js";
import {workerSideRegisterHandlers} from "./commonHelpers.js";
import { SerializedTube, Tube } from "./v2.js";
////// type stuff
// these define the types of the handlers based on the handers variable below
export type Handlers = typeof handlers;
//////// handlers for messages
const handlers = workerSideRegisterHandlers({
    /**
     * checks whether the given initial state is solvable by walking over all states
     * returns true if solvable, false otherwise.
     */
    async checkSolvability(initialStateSerial: SerializedTube[]){
	const initialState = initialStateSerial.map(Tube.loadFromSerial);
	const m = new StateManagerWithWinDetectShortcut(()=>{throw m;});
	const dets = m.visitState(initialState);
	try{
	    for(const _i of dets.walk(0,false)){}
	} catch (e){
	    if (e === m){
		return true; // the callback we set to throw m triggered, so there exists a win state.
	    }
	    throw e;
	}
	return false; // walk terminated
    }
});

///////// extra helper stuff needed for the callbacks to actually do their jobs

class StateManagerWithWinDetectShortcut extends StateManager{
    constructor(private detectedAWonState: ()=>void){
	super()
    }
    protected labeledAsWonCallback(parents: StateDetails["parentStates"]){
	this.detectedAWonState();
	super.labeledAsWonCallback(parents);
    }
}
