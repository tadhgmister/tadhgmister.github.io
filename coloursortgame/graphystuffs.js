import { computeMove, serializeGameState } from "./v2.js";
class StateDetails {
    /**
     * @param id the serialized version of this state
     * @param lastSeen a sample real state to compute children states with instead of loading the serialized string
     * @param callWhenComputingChildren this is a callback that passes this details own id and the id of a child state when computing of child states is initiated
     *          this can be used to update parent associations when children are computed on demand.
     */
    constructor(id, lastSeen, callWhenComputingChildren) {
        this.id = id;
        this.lastSeen = lastSeen;
        this.callWhenComputingChildren = callWhenComputingChildren;
        this.parentStates = new Set();
        this.visited = false;
    }
    getChildren() {
        if (this.childStates !== undefined) {
            return this.childStates;
        }
        this.childStates = new Map();
        for (const [idx, tube] of this.lastSeen.entries()) {
            const content = tube.valueOf();
            if (this.childStates.has(content)) {
                continue;
            }
            const refState = this.lastSeen.slice();
            const quality = computeMove(refState, idx);
            if (quality === "unmovable" /* MoveQuality.UNMOVABLE */) {
                continue;
            } // move didn't do anything
            const result = serializeGameState(refState);
            this.childStates.set(content, { result, sampleState: refState, quality });
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
    getMoveStat(tube) {
        var _a, _b;
        return (_b = (_a = this.getChildren().get(tube.valueOf())) === null || _a === void 0 ? void 0 : _a.quality) !== null && _b !== void 0 ? _b : "unmovable";
    }
    visit(state) {
        this.visited = true;
        this.lastSeen = state;
    }
}
// function moveQuality(oldState: readonly Tube[], newState: readonly Tube[], triggerIdx:number): MoveQuality{
//     const col = oldState[triggerIdx].topColor;
//     assert(col !== undefined, "tried to get the quality of a move out of an empty tube")
//     for(const [idx, newTube] of newState.entries()){
//         if(idx===triggerIdx){continue;}
//         if(newTube.topColor === col && newTube.isPure){
//             if(oldState[idx].isEmpty){
//                 // moved to a previously empty tube
//                 return MoveQuality.DRAIN
//             } else if(oldState[idx].topCount < newState[idx].topCount){
//                 // moved to a previously pure tube, note that if there are tubes of different heights
//                 // then it is possible to need to split the contents between a pure tube and another
//                 // as long as one pure tube increased in quantity we consider this a pure move
//                 // I don't think this can happen unless the tubes are at least 2 units different in size but I haven't thought it through thoroughly enough to be sure.
//                 assert(oldState[idx].isPure, "newState is pure but old state isn't????")
//                 return MoveQuality.PURE
//             }
//         }
//     }
//     // otherwise we moved to partially full tubes
//     return MoveQuality.NORMAL;
// }
export class StateManager {
    constructor(visitCallback) {
        this.visitCallback = visitCallback;
        this.states = new Map();
        this.newParentInfoCallback = (source, target, sampleState) => {
            let targetDetails = this.getOrCreateEntry(target, sampleState);
            targetDetails.parentStates.add(source);
        };
    }
    visitState(state) {
        const id = serializeGameState(state);
        const details = this.getOrCreateEntry(id, state);
        details.visit(state);
        this.visitCallback(state, details);
        return details;
    }
    getOrCreateEntry(id, sampleState) {
        let details = this.states.get(id);
        if (details === undefined) {
            details = new StateDetails(id, sampleState, this.newParentInfoCallback);
            this.states.set(id, details);
        }
        return details;
    }
}
