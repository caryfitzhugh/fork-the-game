
var Render = {
  init: function () {
    renderer.init();
  }
};

Render.draw = function (game_history) {
  if (game_history && game_history.length > 0) {
    renderer.draw(game_history);
  }
};

Render.tick = function (inputs) {
  if (inputs.pageup) {
    renderer.set_zoom(renderer.get_zoom()+.1);
  } else if (inputs.pagedown) {
    renderer.set_zoom(renderer.get_zoom()-.1);
  }
}

// this should be a member variable of any view instance, initialized with the canvas element ID and desired canvas size.
// This can be changed to an element pointer, but at load time here, the element does not yet exist.
// You can have more than one view, for a mini-map or something.
var renderer = new Renderer('canvas_gameboard', 600, 600);
// I can make the size dynamic if we want, but we'll need to call a function

// this should come from game (or level) instance data
var board_size = { width:30, height:30 }; // this should be global to the game (or at least to the level), it is the grid on which the players and objects are placed

function Renderer(canvas_element, canvas_width, canvas_height) {
  var self = this;    // because ECMAScript
  var canvas = null;
  var width = canvas_width;
  var height = canvas_height;
  var ctx = null;
  var current_turn = null;
  var zoom = 1.0;             // initial zoom level
  var style_grid = { color: '#CFC291', width: .1 };
  var style_player = { fill: { color: '#A1E8D9' }, stroke: { color: 'rgba(161, 232, 217, .5)', width: 1.5 }};
  var style_fork = { fill: { color: '#FF712C' }, stroke: { color: 'rgba(255, 113, 44, .5)', width: 1 }};
  var style_item =  {
    "floor"  :{ fill: { color: '#695D46' }},
    "magnet" :{ fill: { color: '#FF2222' }, stroke: { color: 'rgba(255, 50, 50, .5)', width: 0.25 }},
    "crate"  :{ fill: { color: 'darkkhaki' }, stroke: { color: 'khaki', width: 0.25 }}
  };
  var style_structure = {}; // this is initialized in init_styles()

  // private members
  function init_styles() {
    // e.g., { fill: { color: '#FF712C' }, stroke: { color: 'rgba(255, 113, 44, .5)', width: 1 }}
    style_structure[Levels.tile.wall] =  { fill: { color: 'gray' }, stroke: { color: 'dimgray', width: 0.1 }};
    style_structure[Levels.tile.switch] =  { fill: { color: 'goldenrod' }, stroke: { color: 'white', width: 0.1 }};
    style_structure[Levels.tile.win] =  { fill: { color: 'green' }, stroke: { color: 'lawngreen', width: 0.1 }};
    style_structure[Levels.tile.fire] =  { fill: { color: 'orange' }, stroke: { color: 'red', width: 0.1 }};
  }

  function reset_board() {
    ctx.clearRect(0, 0, board_size.width, board_size.height);

    ctx.save();

    // draw the board "floor"
    ctx.beginPath();
    ctx.rect(0, 0, board_size.width, board_size.height);
    ctx.fillStyle = style_item['floor'].fill.color;
    ctx.fill();

    // draw the gameboard grid
    ctx.strokeStyle = style_grid.color;
    ctx.lineWidth = style_grid.width;

    ctx.beginPath();
    for (var i=0; i<board_size.width+1; i++) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i, board_size.height);
    }
    ctx.stroke();

    ctx.beginPath();
    for (var i=0; i<board_size.height+1; i++) {
      ctx.moveTo(0, i);
      ctx.lineTo(board_size.width, i);
    }
    ctx.stroke();

    ctx.restore();
  };

  function render_board() {

    for (var x = 0 ; x < board_size.width; x += 1) {
      for (var y = 0; y < board_size.height; y+=1) {
        render_position(x, y, Levels.get_safe(current_turn.playing_field,{x:x , y:y}));
      }
    }
  };

  function render_position(xposn, yposn, space_data) {
    if (space_data) {
      var style_index = space_data.type;
      if (style_index > 0) {
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
      }

      if (space_data.items) {
        for (var i=0; i < space_data.items.length; i++) {
          render_item(xposn, yposn, space_data.items[i], style_item);
        }
      }
    }
  };

  function render_item(xposn, yposn, item, styles) {
    var type = item.type,
        style = styles[type];

    ctx.save();
    ctx.translate(xposn, yposn);

      // draw an item
      ctx.beginPath();
      if (type === 'magnet') {
        if (!item.position || item.position === 'floor') {
          var arcs = 0;
          var arce = 2 * Math.PI;
          ctx.arc(0.5, 0.5, 0.1, arcs, arce, false);
        } else if (item.position === 'left') {
          ctx.rect(0, 0.25, 0.25, 0.5);
        } else if (item.position === 'right') {
          ctx.rect(0.75, 0.25, 0.25, 0.5);
        } else if (item.position === 'top') {
          ctx.rect(0.25, 0, 0.5, 0.25);
        } else if (item.position === 'bottom') {
          ctx.rect(0.25, 0.75, 0.5, 0.25);
        }
      } else if (type === 'crate') {
        ctx.rect(0.25, 0.25, 0.5, 0.5);
      }

      ctx.strokeStyle = style.stroke.color;
      ctx.lineWidth = 0.1; //style.stroke.width;// * Math.sin((new Date().getMilliseconds() / 1000) * Math.PI);
      ctx.fillStyle = style.fill.color;
      ctx.fill();
      ctx.stroke();

    ctx.restore();
  };

  function render_player(player, style) {
    var xposn = player.x,
        yposn = player.y,
        heading = player.heading,
        holding = player.holding;
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

    // Now show viewfinder
    ctx.beginPath();
    ctx.arc(0.5, 0.5, 0.5, ((heading / 2) - 0.25) * Math.PI,
                     ((heading / 2) + 0.25) * Math.PI, false);
    ctx.strokeStyle = "rgba(10,10,10,0.5)";
    ctx.lineWidth = 0.2;
    ctx.fillStyle = "rgba(10,10,10,0.5)";
    ctx.fill();
    ctx.stroke();

    // Draw "holding"
    if (holding) {
      ctx.beginPath();
      ctx.arc(0.5, 0.5, 0.1, 0, 2 * Math.PI, false);
      ctx.strokeStyle = "rgba(0,200,0,0.5)";
      ctx.lineWidth = 0.1;
      ctx.fillStyle = "rgba(0,200,0,0.5)";
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  };
  
  function center_and_zoom(x, y) {
    // scale up
    ctx.scale(zoom,zoom);
    // center view on x,y
    var tx = -Math.round((x - (board_size.width / (2 * zoom))));
    var ty = -Math.round((y - (board_size.height / (2 * zoom))));
    ctx.translate(tx,ty);
  };

  // public members
  this.init = function(canvas_document) {
    canvas = document.getElementById(canvas_element);
    init_styles();
    ctx = canvas.getContext('2d');
  };
  
  this.get_zoom = function() {
    return zoom;
  };

  this.set_zoom = function(new_zoom) {
    return zoom = new_zoom;
  };

  this.draw = function(game_history) {

    // clear the canvas to the background color
    ctx.clearRect(0, 0, width, height);
    // save current state and transform for game display
    ctx.save();

    // updatenew_state., new_state.player.y
    current_turn = game_history[game_history.length - 1];

    ctx.scale(width / board_size.width, height / board_size.height);
    center_and_zoom(current_turn.player.x, current_turn.player.y);
    // clear
    reset_board();
    render_board();

    render_player(current_turn.player, style_player);  // translucent green disc

    for (var i=0; i < current_turn.forks.length; i++) {
      var fork = current_turn.forks[i];
      render_player(fork, style_fork);  // translucent green disc
    }

    ctx.restore();
  };
};
