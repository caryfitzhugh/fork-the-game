
var Render = {
  board: new Ractive({
      el: $("#gameboard"),
      template: "" +
" <div id='gameboard_inner' class='{{internal.game_mode}}'> "+
" "+
"   {{#each forks}} "+
"     <div class='fork {{fork-number}}' style='left: {{x}}%; top: {{y}}%'></div> "+
"   {{/each}} "+
"   {{#player}} "+
"     <div class='player' style='left: {{x}}%; top: {{y}}%;'></div> "+
"   {{/player}} "+
" </div> "+
" "+
"     ",
			oninit: function() {
				console.log("init!");
			},
			onchange: function() {
				//console.log("render!");
			},
      data: { }
    })
};

Render.draw = function (game_history) {
  if (game_history && game_history.length > 0) {
    Render.board.set(_.last(game_history));
    renderer.draw(game_history);
  }
};

// this should be a member variable of any view instance, initialized with the canvas element ID and desired canvas size.
// This can be changed to an element pointer, but at load time here, the element does not yet exist.
// You can have more than one view, for a mini-map or something.
var renderer = new Renderer('temp_gameboard', 600, 600);
// I can make the size dynamic if we want, but we'll need to call a function

// this should come from game (or level) instance data
var board_size = { width:100, height:100 };	// this should be global to the game (or at least to the level), it is the grid on which the players and objects are placed

// these are here for now but should be canvas styles, I think
var style_grid = { color: '#CFC291', width: 1};	// White
var style_player = { fill_color: '#A1E8D9', stroke: { color: 'rgba(161, 232, 217, .5)', width: 1.5 }};
var style_fork = { fill_color: '#FF712C', stroke: { color: 'rgba(255, 113, 44, .5)', width: 1 }};

function Renderer(canvas_element, canvas_width, canvas_height) {
	var self = this;		// because ECMAScript
	var canvas = null;
	var width = canvas_width;
	var height = canvas_height;
	var ctx = null;

	// private members
	function reset_board() {
		ctx.clearRect(0, 0, width, height);

		ctx.save();
		ctx.strokeStyle = style_grid.color;
		ctx.lineWidth = style_grid.width;

		var x_intvl = width / board_size.width;
		var y_intvl = height / board_size.height;

		ctx.beginPath();
		for (var i=0; i<board_size.width+1; i++) {
			ctx.moveTo(i*x_intvl, 0);
			ctx.lineTo(i*x_intvl, height);
		}
		ctx.stroke();

		ctx.beginPath();
		for (var i=0; i<board_size.height+1; i++) {
			ctx.moveTo(0, i*y_intvl);
			ctx.lineTo(width, i*y_intvl);
		}
		ctx.stroke();

		ctx.restore();
	};

	function render_structure(xposn, yposn, val) {
		ctx.save();
		ctx.translate(xposn, yposn);

		// draw stuff
		ctx.beginPath();
		ctx.rect(0.25, 0.25, 0.5,0.5);
		ctx.strokeStyle = val === 1 ? "black" : "white";
		ctx.lineWidth = 0.5;
		ctx.fillStyle = val === 1 ? "black" : "white";
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	};


	function render_player(xposn, yposn, style) {
		ctx.save();
		ctx.translate(xposn, yposn);

		// draw stuff
		ctx.beginPath();
		ctx.arc(0.5, 0.5, 0.5, 0, 2 * Math.PI, false);
		ctx.strokeStyle = style.stroke.color;
		ctx.lineWidth = style.stroke.width * Math.sin((new Date().getMilliseconds() / 1000) * Math.PI);
		ctx.fillStyle = style.fill_color;
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	};

	// public members
	this.init = function(canvas_document) {	// not sure this is needed, can self-init, I suppose...
		canvas = canvas_document.getElementById(canvas_element);
	};

	this.draw = function(game_history) {
		if (!canvas)
			canvas = document.getElementById(canvas_element); // better on some post-DOM init or whatever

		ctx = canvas.getContext('2d');

		// clear
		reset_board();

		// save current state and transform for game display
		ctx.save();
		ctx.scale(width / board_size.width, height / board_size.height);
		//console.log('scale: ', width / board_size.width, height / board_size.height);

		// updatenew_state., new_state.player.y
		var current_turn = game_history[game_history.length - 1];

    /// TEMP CODE BY CARY TO SEE THE BOARD!
    for (var x = 0 ; x < board_size.width; x += 1) {
      for (var y = 0; y < board_size.height; y+=1) {
        if (current_turn.playing_field[y][x] != 0) {
          render_structure(x,y, current_turn.playing_field[y][x]);
        }
      }
    }
		render_player(current_turn.player.x, current_turn.player.y, style_player);	// translucent green disc

		for (var i=0; i < current_turn.forks.length; i++) {
			var fork = current_turn.forks[i];
			render_player(fork.x, fork.y, style_fork);	// translucent green disc
		}

		ctx.restore();
	};
};
