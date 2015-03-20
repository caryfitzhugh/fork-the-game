
var Render = {
  renderer : null,
  mini_renderer : null,
  init: function () {
    renderer = new Renderer(document.getElementById('canvas_gameboard'), { x:600, y:600 }, 
      {
        "grid"   :{ stroke: { color: '#CFC291', width: .1 }},
        "player" :{ fill: { color: '#A1E8D9' }, stroke: { color: 'rgba(161, 232, 217, .5)', width: 1.5 }},
        "fork"   :{ fill: { color: '#FF712C' }, stroke: { color: 'rgba(255, 113, 44, .5)', width: 1 }},
        "floor"  :{ fill: { color: '#695D46' }},
        "magnet" :{ fill: { color: '#FF2222' }, stroke: { color: 'rgba(255, 50, 50, .5)', width: 0.25 }},
        "forklift" :{ fill: { color: '#22FF22' }, stroke: { color: 'rgba(50, 255, 50, .5)', width: 0.75 }},
        "crate"  :{ fill: { color: 'darkkhaki' }, stroke: { color: 'khaki', width: 0.2 }},
        "switch"  :{ fill: { color: 'goldenrod' }, stroke: { color: 'white', width: 0.1 }},
        "1"  :{ fill: { color: 'gray' }, stroke: { color: 'dimgray', width: 0.1 }},       // wall
        "3"  :{ fill: { color: 'green' }, stroke: { color: 'lawngreen', width: 0.1 }},    // win
        "4"  :{ fill: { color: 'orange' }, stroke: { color: 'red', width: 0.1 }}          // fire
      }
    );
    mini_renderer = new Renderer(document.getElementById('canvas_minimap'), { x:200, y:200 }, 
      {
        // well, this is a start. General problem I have found with JS is that there's no easy way to
        // handle colors if you use both rgba() and #RGB. Delegating conversions to sugar functions is
        // generally a very bad idea in a render loop. :) So good luck below.
        "grid"   :{ stroke: { color: 'rgba(207,194,145,.3)', width: .1 }},
        "player" :{ fill: { color: '#A1E8D9' }, stroke: { color: 'rgba(161, 232, 217, .5) ', width: 1.5 }},
        "fork"   :{ fill: { color: '#FF712C' }, stroke: { color: 'rgba(255, 113, 44, .5) ', width: 1 }},
        "floor"  :{},
        "magnet" :{ fill: { color: '#FF2222' }, stroke: { color: 'rgba(255, 50, 50, 1) ', width: 0.25 }},
        "forklift" :{ fill: { color: '#22FF22' }, stroke: { color: 'rgba(50, 255, 50, .5) ', width: 0.75 }},
        "crate"  :{ fill: { color: 'rgba(240,230,140,.8) ' }},
        "switch"  :{ fill: { color: 'goldenrod' }, stroke: { color: 'white', width: 0.1 }},
        "1"  :{ fill: { color: 'rgba(190,190,190, .5) ' }, stroke: { color: 'rgba(105,105,105,.5) ', width: 0.1 }},   // wall
        "3"  :{ fill: { color: 'green' }, stroke: { color: 'lawngreen', width: 0.1 }},                                // win
        "4"  :{ fill: { color: 'orange' }, stroke: { color: 'red', width: 0.1 }}                                      // fire
      }
    );
    renderer.init();
    mini_renderer.init();
    mini_renderer.set_zoom(1.0);
  }
};

Render.draw = function (game_history) {
  if (game_history && game_history.length > 0) {
    renderer.draw(game_history);
    mini_renderer.draw(game_history);
  }
};

// the thinking with Render.tick is to perform display settings outside of the game state
// and to do some one-time stuff I will add later :-)
Render.tick = function (inputs) {
  if (inputs.pageup) {
    renderer.set_zoom(renderer.get_zoom()+.1);
  } else if (inputs.pagedown) {
    renderer.set_zoom(renderer.get_zoom()-.1);
  }
  Animate.tick();
}

// this should come from game (or level) instance data
var board_size = { width:30, height:30 }; // this should be global to the game (or at least to the level), it is the grid on which the players and objects are placed

function Renderer(canvas_element, canvas_dimensions, the_styles) {
  var self = this;    // because ECMAScript
  var canvas = canvas_element;  // DOM object
  var canvas_size = canvas_dimensions;  // could clone, but it does work if the values change
  var ctx = canvas.getContext('2d');
  var current_turn = null;
  var zoom = 2.0;             // initial zoom level
  var styles =  _.cloneDeep(the_styles);

  function reset_board() {
    var style;

    ctx.clearRect(0, 0, board_size.width, board_size.height);

    ctx.save();

    // draw the board "floor"
    style = styles['floor'];
    if (style && style.fill) {
      ctx.beginPath();
      ctx.rect(0, 0, board_size.width, board_size.height);
      ctx.fillStyle = style.fill.color;
      ctx.fill();
    }

    // draw the gameboard grid
    style = styles['grid'];
    if (style && style.stroke) {
      ctx.strokeStyle = style.stroke.color;
      ctx.lineWidth = style.stroke.width;

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
    }

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
      var type = space_data.type;
      if (type && type != Levels.tile.floor) {
        // these are all the floor tiles that are not "items" or "actions"
        // since this excludes the floor, walls, win & fire come through here
        ctx.save();
        ctx.translate(xposn, yposn);

        // draw the structural elements of the board
        ctx.beginPath();
        ctx.rect(.05, .05, .9, .9);

        ctx.strokeStyle = styles[type].stroke.color;
        ctx.lineWidth = styles[type].stroke.width;
        ctx.fillStyle = styles[type].fill.color;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      if (space_data.actions) {
        _.each(space_data.actions, function (action) {
          if (action.type === 'switch') {
              ctx.save();
              ctx.translate(xposn, yposn);

              // draw the structural elements of the board
              ctx.beginPath();
              ctx.rect(0.1, 0.1, .8, .8);

              ctx.strokeStyle = styles.switch.stroke.color;
              ctx.lineWidth = styles.switch.stroke.width;
              ctx.fillStyle = styles.switch.fill.color;
              ctx.fill();
              ctx.stroke();
              ctx.restore();
          } else if (action.type === 'changeblock') {
              ctx.save();
              ctx.translate(xposn, yposn);

              // draw the structural elements of the board
              ctx.beginPath();
              ctx.rect(0.49, 0.49, 0.02,0.02);

              ctx.strokeStyle = "white";
              ctx.lineWidth = 0.1;
              ctx.fillStyle = "rgba(0,0,0,0.3)";
              ctx.fill();
              ctx.stroke();
              ctx.restore();
          }
        });
      }

      if (space_data.items) {
        for (var i=0; i < space_data.items.length; i++) {
          if (space_data.items[i]) {
            render_item(xposn, yposn, space_data.items[i]);
          } else {
            debugger;
            console.log('blargle, bad item!', space_data);
          }
        }
      }
    }
  };

  function render_item(xposn, yposn, item) {
    var type = item.type,
        style = styles[type],
        has_fill = false,
        has_stroke = false;
    
    if (style && (style.fill)) has_fill = true;
    if (style && (style.stroke)) has_stroke = true;
    
    if (has_fill || has_stroke) {
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
      } else if (type === 'forklift') {
        var arcs = 0;
        // Middle part
        ctx.rect(0.35, 0.35, 0.3, 0.3);
        if (item.heading === 0) {
          ctx.rect(0.75, 0.35, 0.25, 0.1);
          ctx.rect(0.75, 0.55, 0.25, 0.1);
        } else if (item.heading === 1) {
          ctx.rect(0.35, 0.75, 0.1, 0.25);
          ctx.rect(0.55, 0.75, 0.1, 0.25);
        } else if (item.heading === 2) {
          ctx.rect(0.0, 0.35, 0.25, 0.1);
          ctx.rect(0.0, 0.55, 0.25, 0.1);
        } else if (item.heading === 3) {
          ctx.rect(0.35, 0.0, 0.1, 0.25);
          ctx.rect(0.55, 0.0, 0.1, 0.25);
        }
      }

      if (has_fill) {
        ctx.fillStyle = style.fill.color;
        ctx.fill();
      }

      if (has_stroke) {
        ctx.strokeStyle = style.stroke.color;
        ctx.lineWidth = style.stroke.width;
        ctx.stroke();
      }

      ctx.restore();
    }
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
    ctx.lineWidth = style.stroke.width * Animate.pulse();
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
  
  // I may make some more of these animators and generalize them, but for now...
  var orientation_animator = (function() {
    var current_heading = null;
    return {
      get_orientation: function(target_heading) {
        if (current_heading == null) current_heading = target_heading;
        else {
          var delta_heading = target_heading - current_heading; // how far off are we?
          if (delta_heading != 0) {
            // shortest way to get there?
            delta_heading += (delta_heading > Math.PI) ? -2 * Math.PI : (delta_heading < -Math.PI) ? 2 * Math.PI : 0;
            // animate our way closer to the target
            if (Math.abs(delta_heading) < Math.PI / 100) {  // lower numbers increase the distance at which the orientation "snaps" to the target
              current_heading = target_heading;
            } else {
              current_heading = current_heading + (delta_heading / 3);  // smaller number increases speed of orientation change
            }
          }
        }
        return current_heading;
      }
    }
  })();

  function orient_view(player) {
    // translate the center of the board to the origin
    ctx.translate(board_size.width / 2.0, board_size.height / 2.0);

    // zoom the view here
    ctx.scale(zoom,zoom);

    var angle = (3 * Math.PI) / 2;  // when you have no orientation, you face to the right (270d rotation)
    if (player.heading) {
      // rotate the canvas to orient the player
      angle = Math.abs(player.heading - 3) * (Math.PI / 2);
    }
    ctx.rotate(orientation_animator.get_orientation(angle));

    // now translate the view over the player
    ctx.translate(-(player.x + .5), -(player.y + .5));
  };

  // public members
  this.init = function(canvas_document) {
    //canvas = document.getElementById(canvas_element);
    //ctx = canvas.getContext('2d');
  };

  this.get_zoom = function() {
    return zoom;
  };

  this.set_zoom = function(new_zoom) {
    return zoom = new_zoom;
  };

  this.draw = function(game_history) {

    // clear the canvas to the background color
    ctx.clearRect(0, 0, canvas_size.x, canvas_size.y);
    // save current state and transform for game display
    ctx.save();

    // updatenew_state., new_state.player.y
    current_turn = game_history[game_history.length - 1];

    ctx.scale(canvas_size.x / board_size.width, canvas_size.y / board_size.height);
    orient_view(current_turn.player);
    // clear
    reset_board();
    render_board();

    render_player(current_turn.player, styles['player']);

    for (var i=0; i < current_turn.forks.length; i++) {
      var fork = current_turn.forks[i];
      render_player(fork, styles['fork']);
    }

    ctx.restore();
    //self.show_me_the_center();
  };

  this.show_me_the_center = function() {
    // draw the gameboard grid
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo((canvas_size.x)/2, 0);
    ctx.lineTo((canvas_size.x)/2, canvas_size.y-1);
    ctx.moveTo(0, (canvas_size.y)/2);
    ctx.lineTo(canvas_size.x-1, (canvas_size.y)/2);
    ctx.stroke();
  };
};
