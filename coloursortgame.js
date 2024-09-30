"use strict";
// //import 'cytoscape';
// declare var cytoscape: any;
// // Initialize the Cytoscape graph in a container (div element)
// const cy = cytoscape({
//     container: document.getElementById('cy'), // Reference to HTML container element
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//     elements: [
//         { data: { id: 'move1', label: 'Move 1' } },
//         { data: { id: 'move2', label: 'Move 2' } },
//         { data: { id: 'move3', label: 'Move 3' } },
//         { data: { id: 'move4', label: 'Move 4' } },
//         // Define edges between moves
//         { data: { source: 'move1', target: 'move2' } },
//         { data: { source: 'move2', target: 'move3' } },
//         { data: { source: 'move3', target: 'move4' } },
//     ],
//     layout: {
//         name: 'breadthfirst',  // Layout type, suited for trees
//     },
//     style: [
//         {
//             selector: 'node',
//             style: {
//                 'background-color': '#0074D9',
//                 'label': 'data(label)',
//                 'color': '#000',
//                 'text-valign': 'center',
//                 'text-halign': 'center',
//             }
//         },
//         {
//             selector: 'edge',
//             style: {
//                 'width': 2,
//                 'line-color': '#999',
//                 'target-arrow-color': '#999',
//                 'target-arrow-shape': 'triangle',
//             }
//         }
//     ]
// });
// enum Color {
//     RED = "red",
//     BLUE = "blue",
//     GREEN = "green",
//     YELLOW = "yellow",
// }
var COLORS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];
function initgame() {
    var _a, _b, _c;
    var urlParams = new URLSearchParams(window.location.search);
    // Get ncolours from query, or default to 7 if not present
    var ncolours = parseInt((_a = urlParams.get('ncolors')) !== null && _a !== void 0 ? _a : "") || 8;
    if (ncolours > COLORS.length) {
        ncolours = COLORS.length;
    }
    // Get ballspercolour from query, or default to 4 if not present
    var ballsPerColour = parseInt((_b = urlParams.get('ballspercolor')) !== null && _b !== void 0 ? _b : "") || 4;
    var EMPTY_TUBES = parseInt((_c = urlParams.get("empties")) !== null && _c !== void 0 ? _c : "") || 2;
    setCSSVariables(ballsPerColour);
    var game = new GameBoard(document.body, newGameBoard(ncolours, ballsPerColour, EMPTY_TUBES), ballsPerColour);
}
var UIElement = /** @class */ (function () {
    function UIElement(tag, parent) {
        // Determine the parent element: it can either be an HTMLElement or a UIElement (in which case, we take its element)
        var parentElement = parent instanceof UIElement ? parent.element : parent;
        // Create a new DOM element of the type defined by the instance property
        this.element = document.createElement(tag);
        this.element.classList.add(this.constructor.name);
        // Append the new element to the parent element
        parentElement.appendChild(this.element);
    }
    // Method to delete the created DOM element
    UIElement.prototype.delete = function () {
        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    };
    UIElement.prototype.changeParent = function (newParent) {
        newParent.element.appendChild(this.element);
    };
    return UIElement;
}());
var ActionButton = /** @class */ (function (_super) {
    __extends(ActionButton, _super);
    function ActionButton(parent, label, callback) {
        var _this = _super.call(this, "button", parent) || this;
        _this.element.onclick = callback;
        _this.element.innerText = label;
        _this.element.type = "button";
        return _this;
    }
    return ActionButton;
}(UIElement));
/**
 * main game board class, is a container of tubes
 */
var GameBoard = /** @class */ (function (_super) {
    __extends(GameBoard, _super);
    function GameBoard(parent, state, balls_per_tube) {
        var _this = _super.call(this, "main", parent) || this;
        _this.tubes = [];
        /** list of states the level has traversed, does not contain the current state */
        _this.undo_stack = [];
        for (var _i = 0, state_1 = state; _i < state_1.length; _i++) {
            var tube_content = state_1[_i];
            _this.tubes.push(new Tube(_this, tube_content, balls_per_tube));
        }
        _this.undoButton = new ActionButton(parent, "undo", function () {
            try {
                _this.undo();
            }
            catch (e) {
                _this.alert(e);
            }
        });
        _this.resetButton = new ActionButton(parent, "reset", function () {
            try {
                _this.reset();
            }
            catch (e) {
                _this.alert(e);
            }
        });
        _this.after_move_upkeep(false);
        return _this;
    }
    GameBoard.prototype.alert = function (msg) {
        alert(msg);
    };
    /** inserts a new board state into the existing board, used by the undo function */
    GameBoard.prototype.set_board_state = function (new_contents) {
        if (new_contents.length !== this.tubes.length) {
            throw new Error("changing number of tubes with set_board_state is not supported");
        }
        for (var idx = 0; idx < new_contents.length; idx++) {
            this.tubes[idx].set_contents(new_contents[idx]);
        }
    };
    GameBoard.prototype.get_board_state = function () {
        var val = [];
        for (var _i = 0, _a = this.tubes; _i < _a.length; _i++) {
            var tube = _a[_i];
            val.push(tube.get_contents());
        }
        return val;
    };
    GameBoard.prototype.do_action = function (tube) {
        var _this = this;
        try {
            this.do_action_internal(tube);
        }
        catch (e) {
            this.alert(e);
            return;
        }
        window.setTimeout(function () { _this.after_move_upkeep(true); }, 1);
    };
    GameBoard.prototype.after_move_upkeep = function (doalert) {
        // otherwise movement was just performed, update game stats
        var all_pure = true;
        var any_possible_move = false;
        for (var _i = 0, _a = this.tubes; _i < _a.length; _i++) {
            var tube = _a[_i];
            // win condition is that everything is pure and either full or empty
            // if we just checked for pure it would indicate a win before the last few obvious moves are done
            if (!tube.pure || !(tube.is_empty || tube.slack === 0)) {
                all_pure = false;
            }
            var col = tube.top_color;
            if (col === undefined) {
                // this tube is empty, reset active status and indicate there are possible moves
                any_possible_move = true;
                tube.set_active(2); // mark them as "free" 
                continue;
            }
            var viable = this.get_possible_tubes(col, tube);
            if (viable.length == 0 || viable[0].is_empty) {
                tube.set_active(0);
            }
            else {
                tube.set_active(viable[0].pure ? 2 : 1);
                any_possible_move = true;
            }
        }
        if (doalert && all_pure) {
            this.alert("YOU WIN!!");
        }
        else if (doalert && !any_possible_move) {
            this.alert("NO MOVES LEFT, undo or restart");
        }
    };
    GameBoard.prototype.do_action_internal = function (tube) {
        var color = tube.top_color;
        if (color === undefined) {
            throw new Error("tried to move balls out of an empty tube");
        }
        var viableTubes = this.get_possible_tubes(color, tube);
        if (viableTubes.length <= 0) {
            throw new Error("no where for those balls to go");
        }
        // push current state onto undo stack then update position
        this.undo_stack.push(this.get_board_state());
        this.perform_movement(color, tube, viableTubes);
    };
    GameBoard.prototype.undo = function () {
        var _this = this;
        var restored_state = this.undo_stack.pop();
        if (restored_state === undefined) {
            throw new Error("there is nothing in undo stack");
        }
        this.set_board_state(restored_state);
        window.setTimeout(function () { _this.after_move_upkeep(false); }, 1);
    };
    /**
     * goes back to initial state in the level, this gets added to the undo stack so it can be undone
     */
    GameBoard.prototype.reset = function () {
        var _this = this;
        var initial_state = this.undo_stack.at(0);
        if (initial_state === undefined) {
            throw new Error("currently at initial state already");
        }
        this.undo_stack.push(this.get_board_state());
        this.set_board_state(initial_state);
        window.setTimeout(function () { _this.after_move_upkeep(false); }, 1);
    };
    /**
     * returns a list of tubes the given tube could be emptied into to clear it to another colour
     * may return an empty list if no movement could move all balls of the same colour from the top of this one
     * if there is partially filled tubes that can take the balls the list will include those,
     * if there is insufficient space in partially filled tubes
     * @param tube the tube to remove balls from
     * @returns list of viable tubes to move to (with same colour and sufficient space or a list of empty tubes or empty if no movement is possible)
     */
    GameBoard.prototype.get_possible_tubes = function (color, tube) {
        var viableTubes = [];
        var empty_dest = [];
        var total_slack = 0;
        var empty_slack = 0;
        for (var _i = 0, _a = this.tubes; _i < _a.length; _i++) {
            var dest = _a[_i];
            if (dest === tube) {
                continue; // do not consider the source tube as a destination candidate
            }
            else if (dest.is_empty) {
                empty_dest.push(dest);
                empty_slack += dest.slack;
            }
            else if (dest.top_color === color) {
                if (dest.pure && dest.slack >= tube.top_count) {
                    // if the destination only has the given colour just move to there
                    return [dest];
                }
                viableTubes.push(dest);
                total_slack += dest.slack;
            }
        }
        if (total_slack >= tube.top_count) {
            return viableTubes; // if there is enough space of partial move to those
        }
        // otherwise can't move to partial, if there are empty tubes return that
        // if there are no empty tubes return the empty list
        return empty_dest;
    };
    /**
     * internal function to actually move balls from a given tube to other tubes in the viableTubes list
     * was originally baked into do_action but extracted so the viableTubes lists could be used for analysis
     * without actually changing board state.
     */
    GameBoard.prototype.perform_movement = function (color, tube, viableTubes) {
        // move balls to other tubes
        for (var _i = 0, viableTubes_1 = viableTubes; _i < viableTubes_1.length; _i++) {
            var dest = viableTubes_1[_i];
            while (dest.slack > 0 && tube.top_color == color) {
                dest.add_ball_from(tube);
                if (tube.top_color !== color) {
                    return;
                }
            }
        }
        throw new Error("programatic logic thought there was enough room to move out balls but it didn't work");
    };
    return GameBoard;
}(UIElement));
/**
 * a container of balls
 */
var Tube = /** @class */ (function (_super) {
    __extends(Tube, _super);
    function Tube(parent, balls, capacity) {
        var _this = _super.call(this, "div", parent) || this;
        _this.balls = [];
        _this.capacity = capacity;
        _this.element.addEventListener("click", function () {
            parent.do_action(_this);
        });
        for (var _i = 0, balls_1 = balls; _i < balls_1.length; _i++) {
            var ballcolour = balls_1[_i];
            _this.balls.push(new Ball(_this, ballcolour));
        }
        return _this;
    }
    Tube.prototype.add_ball_from = function (other, enforceColor) {
        if (enforceColor === void 0) { enforceColor = true; }
        if (this.slack <= 0) {
            throw new Error("cannot fit more balls in this tube");
        }
        var moved_ball = other.balls.pop();
        if (moved_ball === undefined) {
            throw new Error("tried to take a ball from an empty tube");
        }
        if (enforceColor && !this.is_empty && moved_ball.color !== this.top_color) {
            throw new Error("moved ball to tube with non matching colour");
        }
        moved_ball.changeParent(this);
        this.balls.push(moved_ball);
    };
    /** overrides the current ball contents with new ones. Used by the undo function */
    Tube.prototype.set_contents = function (new_contents) {
        if (new_contents.length > this.capacity) {
            throw new Error("trying to set contents that exceed tube capacity");
        }
        var min_length = this.balls.length < new_contents.length ? this.balls.length : new_contents.length;
        var diff_idx = 0;
        // look for the first index where the colour has changed
        while (diff_idx < min_length && new_contents[diff_idx] !== this.balls[diff_idx].color) {
            diff_idx += 1;
        }
        // remove (delete) all balls from diff_idx and up (won't enter loop if unchanged or only new balls are added)
        while (this.balls.length > diff_idx) {
            this.balls.pop().delete();
        }
        // add changed balls (won't run if unchanged or only balls are removed)
        for (; diff_idx < new_contents.length; diff_idx++) {
            this.balls.push(new Ball(this, new_contents[diff_idx]));
        }
    };
    Tube.prototype.get_contents = function () {
        var val = [];
        for (var _i = 0, _a = this.balls; _i < _a.length; _i++) {
            var ball = _a[_i];
            val.push(ball.color);
        }
        return val;
    };
    Tube.prototype.set_active = function (level) {
        this.element.classList.remove("active", "free");
        if (level > 0) {
            this.element.classList.add(level > 1 ? "free" : "active");
        }
    };
    Object.defineProperty(Tube.prototype, "top_color", {
        /**
         * returns the colour of the top ball in this tube
         */
        get: function () {
            var _a;
            return (_a = this.balls.at(-1)) === null || _a === void 0 ? void 0 : _a.color;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tube.prototype, "pure", {
        /**
         * returns true if every ball in this tube is the same colour or tube is empty
         * returns false if there are more than one ball and they are not all the same colour
         */
        get: function () {
            return this.top_count == this.balls.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tube.prototype, "top_count", {
        /**
         * returns the number of balls that have the same colour at the top of this tube
         * returns 0 if the tube is empty and returns this.balls.length if `this.pure`
         */
        get: function () {
            var top_color = this.top_color;
            if (top_color === undefined) {
                return 0; // tube is empty
            }
            for (var idx = this.balls.length - 2; idx >= 0; idx--) {
                if (this.balls[idx].color !== top_color) {
                    // this is the ball that is different
                    // so return number of balls between this index and the length
                    // not including either idx or the length
                    // hence -1
                    return this.balls.length - idx - 1;
                }
            }
            // they are all the same, return the length
            return this.balls.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tube.prototype, "slack", {
        /** returns the number of balls that can be fit into this tube */
        get: function () {
            return this.capacity - this.balls.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Tube.prototype, "is_empty", {
        /** returns true if there are no balls in this tube */
        get: function () {
            return this.balls.length === 0;
        },
        enumerable: false,
        configurable: true
    });
    return Tube;
}(UIElement));
var Ball = /** @class */ (function (_super) {
    __extends(Ball, _super);
    function Ball(parent, color) {
        // Call the UIElement constructor with the tag 'div'
        var _this = _super.call(this, 'div', parent) || this;
        var label = document.createElement("span");
        label.innerText = color;
        _this.element.appendChild(label);
        _this.element.classList.add(color);
        _this.color = color;
        return _this;
    }
    return Ball;
}(UIElement));
function setCSSVariables(ballsPerTube) {
    var styleId = "javascript-created-style-sheet-to-set-tube-height-variable";
    // Try to retrieve the style element by ID
    var style = document.getElementById(styleId);
    // If the style element does not exist, create it
    if (!style) {
        style = document.createElement('style');
        style.id = styleId; // Set the ID for the style element
        document.head.appendChild(style); // Append the new style element to the head
    }
    // Set the CSS variables using template literals
    style.innerHTML = "\n        :root {\n            --balls-per-tube: ".concat(ballsPerTube, ";       /* Set balls per tube */\n        }\n    ");
}
function newGameBoard(n_colours, balls_per_colour, empty_tubes) {
    var flatboard = [];
    for (var idx1 = 0; idx1 < n_colours; idx1++) {
        var color = COLORS[idx1];
        for (var idx2 = 0; idx2 < balls_per_colour; idx2++) {
            flatboard.push(color);
        }
    }
    shuffleList(flatboard);
    shuffleList(flatboard); // second time is almost certainly unnecessary but it makes me feel better.
    var result = [];
    while (flatboard.length > 0) {
        result.push(flatboard.splice(0, balls_per_colour));
    }
    for (var idx = 0; idx < empty_tubes; idx++) {
        result.push([]);
    }
    return result;
}
/** uses Fisher-Yates shuffle on the list in place */
function shuffleList(colorList) {
    var _a;
    for (var i = colorList.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        // Swap colorList[i] with the element at random index j
        _a = [colorList[j], colorList[i]], colorList[i] = _a[0], colorList[j] = _a[1];
    }
}
