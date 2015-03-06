// Add control view - and let you change the tick rate, report FPS, etc.
var game_history = [Engine.initial];

var play_mode = true;
var history_index = 0;

var enter_pause_mode = function () {
  play_mode = false;
  History.show();
  $("body").removeClass("play-mode");
  $("body").addClass("pause-mode");
};

var continue_play_mode = function () {
  Notify.show("Continuing...");
  enter_play_mode();
};

var rewind_play_mode = function () {
  Notify.show("Rewind...");
  History.erase_future();
  enter_play_mode();
};

var fork_play_mode = function () {
  Notify.show("Forking...");
  History.fork();
  enter_play_mode();
};

var enter_play_mode = function () {
  play_mode = true;
  History.hide();
  $("body").addClass("play-mode");
  $("body").removeClass("pause-mode");
};

setInterval(function () {
  inputs =  Input.current(); // Gets all the user inputs
  if (play_mode) {

    new_state = Engine.tick(History.present_state(), inputs);

    Render.draw(History.game_history(), new_state);

    History.save(new_state);

    if (inputs.esc) {
      Notify.show("Pausing...");
      enter_pause_mode();
    }

  } else {

    if (inputs.left) {
      if (inputs.shift) {
        History.backward(10);
      } else {
        History.backward();
      }
    } else if (inputs.right) {
      if (inputs.shift) {
        History.forward(10);
      } else {
        History.forward();
      }
    }

    if (History.play_mode()) {
      continue_play_mode();
    }

    if (inputs.space) {
      rewind_play_mode();
    } else if (inputs.enter) {
      fork_play_mode();
    }
    if (!play_mode) {
      Render.draw(History.game_history());
    }
  }

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
