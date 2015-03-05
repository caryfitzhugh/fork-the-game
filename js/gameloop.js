var player_delta = {top:0, left: 0};
var move_rate = 1;
var game_history = [];

// How far "back" in history are we operating?
var history_index = function (v) {
  if (!_.isUndefined(v)) {
    window.gameboard.set('internal.rewind_frame', v);
  }
  return window.gameboard.get('internal.rewind_frame');
};

var set_game_state = function (i) {
  var state = game_history[i];
  _.each( state, function (v, name) {
    window.gameboard.set(name, v);
  });
};

var stop_game = function () {
  window.gameboard.set('internal.game_mode' ,'rewind')
  history_index(game_history.length)
};

var resume_game =  function() {
  window.gameboard.set('internal.game_mode' ,'play')
  // Delete any future history from this point onward.
  game_history = _.slice(game_history, 0, history_index());
  history_index(0);
};

// Moves the player
var move_player = function (player) {
  var current = window.gameboard.get('player');
  player.top += player_delta.top;
  player.left += player_delta.left;
  return player;
};

setInterval(function () {
  var running = window.gameboard.get('internal.game_mode') === 'play';

  if (running) {
    //
    // WE ARE IN RUNNING MODE!
    //
    // BE SAFE!
    history_index(0);

    // Move the player
    window.gameboard.set('player', move_player(window.gameboard.get('player') ));

    // Save history
    var state = _.cloneDeep(window.gameboard.get());
    delete state.internal;
    game_history.push(state);
    window.gameboard.set('internal.total_frames', game_history.length);

  } else {

    // IF WE ARE IN "META-TIME MODE"
    // Where you can go fwd / back in time
    //
    if (player_delta.left < 0) {
      history_index(history_index() - 1);

      if (history_index() < 0) {
        history_index(0);
      }

      // Go "back" in time one step
      set_game_state(history_index());


    } else if (player_delta.left > 0) {

      history_index(history_index() + 1);

      // Go forward (or resume)
      if (history_index() >= game_history.length) {
        resume_game();
      } else {
        set_game_state(history_index());
      }
    }
  }

  // Reset player inputs
  player_delta = {top:0, left: 0};

}
, 100);


Mousetrap.bind('left', function() { player_delta.left -= move_rate; return false;});
Mousetrap.bind('right', function() { player_delta.left += move_rate; return false;});
Mousetrap.bind('up', function() { player_delta.top -= move_rate; return false;});
Mousetrap.bind('down', function() { player_delta.top += move_rate; return false;});

Mousetrap.bind('esc', function() { stop_game();});
Mousetrap.bind('space', function() { resume_game();});
