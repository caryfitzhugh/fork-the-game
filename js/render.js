
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
var board_size = { width:30, height:30 };	// this should be global to the game (or at least to the level), it is the grid on which the players and objects are placed

function Renderer(canvas_element, canvas_width, canvas_height) {
	var self = this;		// because ECMAScript
	var canvas = null;
	var width = canvas_width;
	var height = canvas_height;
	var ctx = null;
	var current_turn = null;
	var style_grid = { color: '#CFC291', width: 1 };
	var style_player = { fill: { color: '#A1E8D9' }, stroke: { color: 'rgba(161, 232, 217, .5)', width: 1.5 }};
	var style_fork = { fill: { color: '#FF712C' }, stroke: { color: 'rgba(255, 113, 44, .5)', width: 1 }};
	var style_structure = {};	// this is initialized in init_styles()

	// private members
	function init_styles() {
		// e.g., { fill: { color: '#FF712C' }, stroke: { color: 'rgba(255, 113, 44, .5)', width: 1 }}
		style_structure[Levels.tile.wall] =  { fill: { color: 'black' }, stroke: { color: 'grey', width: .1 }};
		style_structure[Levels.tile.switch] =  { fill: { color: 'grey' }, stroke: { color: 'white', width: .1 }};
		style_structure[Levels.tile.win] =  { fill: { color: 'green' }, stroke: { color: 'lawngreen', width: .1 }};
		style_structure[Levels.tile.fire] =  { fill: { color: 'orange' }, stroke: { color: 'red', width: .1 }};
	}

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

	function render_board() {

    for (var x = 0 ; x < board_size.width; x += 1) {
      for (var y = 0; y < board_size.height; y+=1) {
        if (Levels.get(current_turn.playing_field, y,x) != 0) {
          render_structure(x,y, Levels.get(current_turn.playing_field,y,x));
        }
      }
    }
	};

	function render_structure(xposn, yposn, style_index) {
		ctx.save();
		ctx.translate(xposn, yposn);

		// draw the structural elements of the board
		ctx.beginPath();
		ctx.rect(.05, .05, .9, .9);

		ctx.strokeStyle = style_structure[style_index].stroke.color;
		ctx.lineWidth = style_structure[style_index].stroke.width;
		ctx.fillStyle = style_structure[style_index].fill.color;
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	};

	function render_player(xposn, yposn, style) {
		ctx.save();
		ctx.translate(xposn, yposn);

		// draw a player (or fork)
		ctx.beginPath();
		ctx.arc(0.5, 0.5, 0.5, 0, 2 * Math.PI, false);
		ctx.strokeStyle = style.stroke.color;
		ctx.lineWidth = style.stroke.width * Math.sin((new Date().getMilliseconds() / 1000) * Math.PI);
		ctx.fillStyle = style.fill.color;
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	};

	// public members
	this.init = function(canvas_document) {	// it would be nice to init things, but this is never called?
		canvas = canvas_document.getElementById(canvas_element);
		console.log('Renderer.init() is never called)');
		init_styles(); // too bad
	};

	this.draw = function(game_history) {
		if (!canvas) {	// Boo! Boo, I say. See above note about this.init()
			canvas = document.getElementById(canvas_element);
			init_styles();
		}

		ctx = canvas.getContext('2d');

		// clear
		reset_board();

		// save current state and transform for game display
		ctx.save();
		ctx.scale(width / board_size.width, height / board_size.height);
		//console.log('scale: ', width / board_size.width, height / board_size.height);

		// updatenew_state., new_state.player.y
		current_turn = game_history[game_history.length - 1];
		
		render_board();

		render_player(current_turn.player.x, current_turn.player.y, style_player);	// translucent green disc

		for (var i=0; i < current_turn.forks.length; i++) {
			var fork = current_turn.forks[i];
			render_player(fork.x, fork.y, style_fork);	// translucent green disc
		}

		ctx.restore();
	};
};
