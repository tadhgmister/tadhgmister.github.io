// //import cytoscape from 'cytoscape';

// //declare var cytoscape: typeof import("cytoscape");
// declare const cytoscapeDagre: cytoscape.Ext;

// const COLORS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N"] as const
//     //"red","blue","green","yellow", "magenta","cyan", "orange", "lime", "pink", "mediumpurple", "grey"
// type Color = typeof COLORS[number];
// function initgame(){
//     cytoscape.use(cytoscapeDagre);
//     const urlParams = new URLSearchParams(window.location.search);
    
//     // Get ncolours from query, or default to 7 if not present
//     let ncolours = parseInt(urlParams.get('ncolors') ?? "") || 8;
//     if(ncolours > COLORS.length){
//         ncolours = COLORS.length;
//     }

//     // Get ballspercolour from query, or default to 4 if not present
//     const ballsPerColour = parseInt(urlParams.get('ballspercolor') ?? "") || 4;

//     const EMPTY_TUBES = parseInt(urlParams.get("empties") ?? "") || 2;
//     setCSSVariables(ballsPerColour)
//     const game = new GameBoard(
//         document.body, 
//         newGameBoard(ncolours, ballsPerColour, EMPTY_TUBES), 
//         ballsPerColour 
//     );
// }

// class UIElement<tag extends keyof HTMLElementTagNameMap> {

//     // The DOM element created by this instance
//     protected element: HTMLElementTagNameMap[tag];

//     constructor(tag: tag, parent: HTMLElement | UIElement<keyof HTMLElementTagNameMap>) {
//     // Determine the parent element: it can either be an HTMLElement or a UIElement (in which case, we take its element)
//     const parentElement = parent instanceof UIElement ? parent.element : parent;

//     // Create a new DOM element of the type defined by the instance property
//     this.element = document.createElement(tag);
//     this.element.classList.add(this.constructor.name);
//     // Append the new element to the parent element
//     parentElement.appendChild(this.element);
    
//     }

//     // Method to delete the created DOM element
//     delete(): void {
//         if (this.element.parentElement) {
//             this.element.parentElement.removeChild(this.element);
//         }
//     }
//     changeParent(newParent: UIElement<any>){
//         newParent.element.appendChild(this.element);
//     }
// }
// class ActionButton extends UIElement<"button"> {
//     constructor(parent: UIElement<any> | HTMLElement, label: string, callback: ()=>void){
//         super("button", parent);
//         this.element.onclick = callback;
//         this.element.innerText = label;
//         this.element.type = "button"
//     }
// }
// /**
//  * main game board class, is a container of tubes
//  */
// class GameBoard extends UIElement<"main"> {
//     private readonly undoButton: ActionButton;
//     private readonly resetButton: ActionButton;
//     private readonly graph: GraphManager;
//     protected readonly tubes: Tube[] = []
//     /** list of states the level has traversed, does not contain the current state */
//     protected readonly undo_stack: SerializedState[] = [];
//     constructor(parent: HTMLElement | UIElement<any>, state: Color[][], balls_per_tube: number){
//         super("main", parent)
//         for(const tube_content of state){
//             this.tubes.push(new Tube(this, tube_content, balls_per_tube));
//         }
//         this.undoButton = new ActionButton(parent, "undo", ()=>{
//             try{
//                 this.undo()
//             } catch(e){
//                 this.alert(e)
//             }
//         });
//         this.resetButton = new ActionButton(parent, "reset", ()=>{
//             try{
//                 this.reset();
//             }catch(e){
//                 this.alert(e);
//             }
//         })
//         this.graph = new GraphManager(parent)
//         this.graph.cy.on("select", (ev)=>{
//             const selected_state: SerializedState = ev.target._private.data.id;
//             const current_state = serializeGameState(this.get_board_state());
//             if(selected_state!=current_state){
//                 this.undo_stack.push(current_state);
//                 this.set_board_state(loadGameState(selected_state));
//                 this.after_move_upkeep(false)
//             }
//         })
//         this.after_move_upkeep(false)
//     }
//     private alert(msg: unknown){
//         alert(msg)
//     }
//     /** inserts a new board state into the existing board, used by the undo function */
//     public set_board_state(new_contents: Color[][]){
//         if(new_contents.length !== this.tubes.length){
//             throw new Error("changing number of tubes with set_board_state is not supported")
//         }
//         for(let idx=0; idx<new_contents.length;idx++){
//             this.tubes[idx].set_contents(new_contents[idx]);
//         }

//     }
//     public get_board_state(){
//         const val: Color[][] = []
//         for(const tube of this.tubes){
//             val.push(tube.get_contents());
//         }
//         return val;
//     }
//     public do_action(tube: Tube){
//         try{
//             this.do_action_internal(tube);
//         } catch (e){
//            this.alert(e)
//            return;
//         }
//         window.setTimeout(()=>{this.after_move_upkeep(true)}, 1)
        
//     }
//     private after_move_upkeep(doalert:boolean){
//         // otherwise movement was just performed, update game stats
//         let all_pure = true;
//         let any_possible_move = false;
//         for(const tube of this.tubes){
//             // win condition is that everything is pure and either full or empty
//             // if we just checked for pure it would indicate a win before the last few obvious moves are done
//             if(!tube.pure || !(tube.is_empty || tube.slack === 0)){
//                 all_pure = false;
//             }
//             const col = tube.top_color;
//             if(col === undefined){
//                 // this tube is empty, reset active status and indicate there are possible moves
//                 any_possible_move = true;
//                 tube.set_active(2); // mark them as "free" 
//                 continue;
//             }
//             const viable = this.get_possible_tubes(col, tube);
//             if(viable.length==0 || viable[0].is_empty){
//                 tube.set_active(0);
//             } else {
//                 tube.set_active(viable[0].pure ? 2 : 1);
//                 any_possible_move = true;
//             }
//         }
//         if(doalert && all_pure){
//             this.alert("YOU WIN!!")
//         } else if(doalert && !any_possible_move){
//             this.alert("NO MOVES LEFT, undo or restart")
//         }
//         const current_state = this.get_board_state();
//         if(!this.graph.selectNode(current_state)){
//             const childstates = this.hackySolutionToGetAllPossibleMoves();
//             this.graph.addnode(current_state, childstates, true)
//         }
//     }
//     private do_action_internal(tube: Tube){
//         const color = tube.top_color;
//         if(color === undefined){
//             throw new Error("tried to move balls out of an empty tube");
//         }
//         const viableTubes = this.get_possible_tubes(color, tube);
//         if(viableTubes.length <= 0){
//             throw new Error("no where for those balls to go")
//         }
//         // push current state onto undo stack then update position
//         this.undo_stack.push(serializeGameState(this.get_board_state()));
//         this.perform_movement(color, tube, viableTubes);
//     }
//     public undo(doupkeep=true){
//         const restored_state = this.undo_stack.pop();
//         if(restored_state === undefined){
//             throw new Error("there is nothing in undo stack");
//         }
//         this.set_board_state(loadGameState(restored_state));
//         if(doupkeep){
//             window.setTimeout(()=>{this.after_move_upkeep(false)}, 1);
//         }
//     }
//     /**
//      * goes back to initial state in the level, this gets added to the undo stack so it can be undone
//      */
//     public reset(){
//         const initial_state = this.undo_stack.at(0);
//         if(initial_state === undefined){
//             throw new Error("currently at initial state already")
//         }
//         this.undo_stack.push(serializeGameState(this.get_board_state()));
//         this.set_board_state(loadGameState(initial_state));
//         window.setTimeout(()=>{this.after_move_upkeep(false)}, 1)
//     }
//     /**
//      * returns a list of tubes the given tube could be emptied into to clear it to another colour
//      * may return an empty list if no movement could move all balls of the same colour from the top of this one
//      * if there is partially filled tubes that can take the balls the list will include those,
//      * if there is insufficient space in partially filled tubes 
//      * @param tube the tube to remove balls from
//      * @returns list of viable tubes to move to (with same colour and sufficient space or a list of empty tubes or empty if no movement is possible)
//      */
//     private get_possible_tubes(color: Color, tube: Tube){
//         let viableTubes: Tube[] = []
//         let empty_dest: Tube[] = [];
//         let total_slack = 0;
//         let empty_slack = 0;
//         for(const dest of this.tubes){
//             if(dest === tube){
//                 continue; // do not consider the source tube as a destination candidate
//             } else if(dest.is_empty){
//                 empty_dest.push(dest);
//                 empty_slack += dest.slack;
//             } else if (dest.top_color === color){
//                 if(dest.pure && dest.slack >= tube.top_count){
//                     // if the destination only has the given colour just move to there
//                     return [dest];
//                 }
//                 viableTubes.push(dest);
//                 total_slack += dest.slack;
//             }
//         }

//         if(total_slack >= tube.top_count){
//             return viableTubes; // if there is enough space of partial move to those
//         }
//         // otherwise can't move to partial, if there are empty tubes return that
//         // if there are no empty tubes return the empty list
//         return empty_dest;
//     }
//     /**
//      * internal function to actually move balls from a given tube to other tubes in the viableTubes list
//      * was originally baked into do_action but extracted so the viableTubes lists could be used for analysis 
//      * without actually changing board state.
//      */
//     private perform_movement(color: Color, tube: Tube, viableTubes: Tube[]){
//         // move balls to other tubes
//         for(const dest of viableTubes){
//             while(dest.slack > 0 && tube.top_color == color){
//                 dest.add_ball_from(tube);
//                 if(tube.top_color !== color){
//                     return;
//                 }
//             }
//         }
//         throw new Error("programatic logic thought there was enough room to move out balls but it didn't work")
        
//     }
//     private hackySolutionToGetAllPossibleMoves(){
//         const result: GameState[] = [];
//         for(const tube of this.tubes){
//             try {
//                 this.do_action_internal(tube);
//             } catch(e){
//                 continue;
//             }
//             result.push(this.get_board_state())
//             this.undo(false);
//         }
//         return result;
//     }
// }
// /**
//  * a container of balls 
//  */
// class Tube extends UIElement<"div"> {
//     /** maximum capacity of the tube, could maybe be variable in a future version */
//     public readonly capacity: number;
//     protected balls: Ball[] = [];
//     constructor(parent: GameBoard, balls: Color[], capacity: number){
//         super("div", parent);
//         this.capacity = capacity;
//         this.element.addEventListener("click", ()=>{
//             parent.do_action(this);
//         });
//         for(const ballcolour of balls){
//             this.balls.push(new Ball(this, ballcolour))
//         }
//     }
//     public add_ball_from(other: Tube, enforceColor=true){
//         if(this.slack <= 0){
//             throw new Error("cannot fit more balls in this tube");
//         }
//         const moved_ball = other.balls.pop()
//         if(moved_ball === undefined){
//             throw new Error("tried to take a ball from an empty tube");
//         }
//         if(enforceColor && !this.is_empty && moved_ball.color !== this.top_color){
//             throw new Error("moved ball to tube with non matching colour");
//         }
//         moved_ball.changeParent(this);
//         this.balls.push(moved_ball);
//     }
//     /** overrides the current ball contents with new ones. Used by the undo function */
//     public set_contents(new_contents: Color[]){
//         if(new_contents.length > this.capacity){
//             throw new Error("trying to set contents that exceed tube capacity")
//         }
//         const min_length = this.balls.length < new_contents.length ? this.balls.length : new_contents.length;
//         let diff_idx = 0;
//         // look for the first index where the colour has changed
//         while(diff_idx < min_length && new_contents[diff_idx] == this.balls[diff_idx].color){
//             diff_idx += 1;
//         }
//         // remove (delete) all balls from diff_idx and up (won't enter loop if unchanged or only new balls are added)
//         while(this.balls.length > diff_idx){
//             this.balls.pop()!.delete();
//         }
//         // add changed balls (won't run if unchanged or only balls are removed)
//         for(;diff_idx<new_contents.length;diff_idx++){
//             this.balls.push(new Ball(this, new_contents[diff_idx]))
//         }
//         if(JSON.stringify(this.get_contents()) !== JSON.stringify(new_contents)){
//             throw new Error("set contents didn't match the actual contents")
//         }
//     }
//     public get_contents(){
//         const val: Color[] = []
//         for(const ball of this.balls){
//             val.push(ball.color)
//         }
//         return val;
//     }
//     public set_active(level: 0|1|2){
//         this.element.classList.remove("active", "free");
//         if(level > 0){
//             this.element.classList.add(level>1 ? "free" : "active");
//         }
//     }
//     /**
//      * returns the colour of the top ball in this tube
//      */
//     public get top_color(){
//         return this.balls.at(-1)?.color;
//     }
//     /**
//      * returns true if every ball in this tube is the same colour or tube is empty
//      * returns false if there are more than one ball and they are not all the same colour
//      */
//     public get pure(){
//         return this.top_count == this.balls.length;
//     }
//     /**
//      * returns the number of balls that have the same colour at the top of this tube
//      * returns 0 if the tube is empty and returns this.balls.length if `this.pure`
//      */
//     public get top_count(){
//         const top_color = this.top_color;
//         if(top_color===undefined){
//             return 0; // tube is empty
//         }
//         for(let idx=this.balls.length-2; idx>=0;idx--){
//             if(this.balls[idx].color !== top_color){
//                 // this is the ball that is different
//                 // so return number of balls between this index and the length
//                 // not including either idx or the length
//                 // hence -1
//                 return this.balls.length - idx - 1;
//             }
//         }
//         // they are all the same, return the length
//         return this.balls.length;
//     }
//     /** returns the number of balls that can be fit into this tube */
//     public get slack(){
//         return this.capacity - this.balls.length;
//     }
//     /** returns true if there are no balls in this tube */
//     public get is_empty(){
//         return this.balls.length === 0;
//     }
// }
// class Ball extends UIElement<"div"> {
//     public readonly color: Color;
//     constructor(parent: UIElement<any>, color: Color) {
//         // Call the UIElement constructor with the tag 'div'
//         super('div', parent);
//         const label = document.createElement("span")
//         label.innerText = color
//         this.element.appendChild(label)
//         this.element.classList.add(color)
//         this.color = color;
//     }
// }
// function setCSSVariables(ballsPerTube:number) {
//     const styleId = "javascript-created-style-sheet-to-set-tube-height-variable"
//     // Try to retrieve the style element by ID
//     let style = document.getElementById(styleId);
    
//     // If the style element does not exist, create it
//     if (!style) {
//         style = document.createElement('style');
//         style.id = styleId; // Set the ID for the style element
//         document.head.appendChild(style); // Append the new style element to the head
//     }
    
//     // Set the CSS variables using template literals
//     style.innerHTML = `
//         :root {
//             --balls-per-tube: ${ballsPerTube};       /* Set balls per tube */
//         }
//     `;
// }

// function newGameBoard(n_colours: number, balls_per_colour: number, empty_tubes: number){
//     const flatboard: Color[] = [];
//     for(let idx1=0;idx1<n_colours;idx1++){
//         const color = COLORS[idx1];
//         for(let idx2=0;idx2<balls_per_colour;idx2++){
//             flatboard.push(color);
//         }
//     }
//     shuffleList(flatboard);
//     shuffleList(flatboard); // second time is almost certainly unnecessary but it makes me feel better.
//     const result: Color[][] = []
//     while(flatboard.length > 0){
//         result.push(flatboard.splice(0, balls_per_colour))
//     }
//     for(let idx=0;idx<empty_tubes;idx++){
//         result.push([])
//     }
//     return result

// }
// /** uses Fisher-Yates shuffle on the list in place */
// function shuffleList(colorList: any[]){
//     for (let i = colorList.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         // Swap colorList[i] with the element at random index j
//         [colorList[i], colorList[j]] = [colorList[j], colorList[i]];
//     }
// }

// type GameState = Color[][];
// type SerializedState = string;
// const serializeGameState = JSON.stringify;
// const loadGameState = JSON.parse;
// ////// graph related stuff
// class GraphManager extends UIElement<"div">{
//     public readonly cy: cytoscape.Core;
//     public readonly data: Map<SerializedState, cytoscape.CollectionReturnValue>;
//     private selected?: cytoscape.CollectionReturnValue;
//     public readonly parentMap: Map<SerializedState, SerializedState[]>
//     constructor(parent: HTMLElement | UIElement<any>){
//         super("div", parent);
//         this.cy = cytoscape({
//             container: this.element,
//             layout: {
//                 name: "dagre"
//             },
//             style: [ // the stylesheet for the graph
//             {
//                 selector: 'node',
//                 style: {
//                     //'background-color': '#666',
//                     'label': 'hi'
//                 }
//             },
//             {
//                 selector: 'edge',
//                 style: {
//                     //'width': 3,
//                     'line-color': '#ccc',
//                     'target-arrow-color': '#ccc',
//                     'target-arrow-shape': 'triangle',
//                     "target-arrow-fill": 'filled',
//                     "arrow-scale": 5
//                 }
//             }
//         ],
//         });
//         this.cy.on("select", function(event){
            
//         })
//         this.data = new Map();
//         this.parentMap = new Map();
//     }
//     /** returns a string representation of the game state to be used as a key in a mapping */
//     public static serializeGameState(data: GameState): SerializedState{
//         return JSON.stringify(data);
//     }
//     /** selects the given node if it exists, returns whether it exists */
//     public selectNode(existingNode: GameState){
//         const node = this.data.get(GraphManager.serializeGameState(existingNode))
//         if(node !== undefined){
//             this.cy.elements().unselect();
//             node.select();
//             return true;
//         } else {
//             return false;
//         }
//     }
//     public addnode(new_node_data: GameState, possibleChildStates: GameState[], select=true){
//         const datakey = GraphManager.serializeGameState(new_node_data);
//         if(this.data.has(datakey)){
//             return; // already added
//         }
//         const newnode = this.cy.add({data:{
//             id:datakey,
//             state:new_node_data,
//         }});
//         this.data.set(datakey, newnode)
//         for(const child of possibleChildStates){
//             const destkey = GraphManager.serializeGameState(child);
//             if(this.data.has(destkey)){
//                 this.cy.add({data:{
//                     id: `edge${datakey}${destkey}`,
//                     source: datakey,
//                     target: destkey
//                 }});
//             } else {
//                 let parents = this.parentMap.get(destkey);
//                 if(parents === undefined){
//                     parents = [];
//                     this.parentMap.set(destkey, parents)
//                 }
//                 parents.push(datakey)
//             }
//         }
//         const ownParents = this.parentMap.get(datakey);
//         if(ownParents !== undefined){
//             for(const par of ownParents){
//                 this.cy.add({data:{
//                     id: `edge${par}${datakey}`,
//                     source: par,
//                     target: datakey
//                 }})
//             }
//         }
//         this.cy.layout({name: "dagre", rankDir: 'LR'} as any).run();
//         if(select){
//             this.cy.elements().unselect();
//             newnode.select()
//         }
//     }

// }
