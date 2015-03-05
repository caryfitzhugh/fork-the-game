// Add control view - and let you change the tick rate, report FPS, etc.
var game_history = [Engine.initial];

var play_mode = true;
var history_index = 0;

var enter_pause_mode = function () {
  play_mode = false;

  history_index = game_history.length;
  $("body").removeClass("play-mode");
  $("body").addClass("pause-mode");
};

var enter_play_mode = function () {
  play_mode = true;
  History.clear();
  history_index = 0;
  $("body").addClass("play-mode");
  $("body").removeClass("pause-mode");
};

setInterval(function () {
  inputs =  Input.current(); // Gets all the user inputs

  if (play_mode) {

    new_state = Engine.tick(_.last(game_history), inputs);

    Render.draw(game_history, new_state);

    game_history.push(new_state);

    if (inputs.esc) {
      Notify.show("Pausing...");
      enter_pause_mode();
    }

  } else {
console.log('asdf', inputs, history_index);
    if (inputs.left) {
      history_index -= 1;
    } else if (inputs.right) {
      history_index += 1;
    }

    if (history_index > game_history.length) {
      enter_play_mode();
    }

    if (history_index < 0) {
      history_index = 0;
    }

    History.tick(game_history, history_index);

    if (inputs.space) {
      Notify.show("Resuming...");
      enter_play_mode();
    } else if (inputs.enter) {
      Notify.show("Forking...");
      enter_play_mode();
    }
  }


  /*
  if (play) {
    // Does the engine tick, returns a new "desired" state
    new_state = Engine.tick(inputs)

    //
    collision_free_state = Collisions.resolve(current_game_state, new_state);

    // Render
    Render.update(collision_free_state);

    //History
    History.save_state(collision_free_state);
  } else {
    // Rewind mode
    history_index = 0;
    History.update(inputs);

    // Reutrns the new game history index and new game state (for forks, etc).
  }
  */
}, 100);
/*
  var running = window.gameboard.get('internal.game_mode') === 'play';

  if (running) {
    //
    // WE ARE IN RUNNING MODE!
    //
    // BE SAFE!
    history_index(0);

    // Move the player
    window.gameboard.set('player', move_player(window.gameboard.get('player') ));

    // Move the forks.
    var forks = window.gameboard.get('forks');

    var new_forks = _.compact(_.map(forks, function(fork, i) {
      return move_fork(fork);
    }));

    window.gameboard.set('forks', new_forks);

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
      history_index(history_index() - 5);

      if (history_index() < 0) {
        history_index(0);
      }

      // Go "back" in time one step
      set_game_state(history_index());


    } else if (player_delta.left > 0) {

      history_index(history_index() + 5);

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
*/
