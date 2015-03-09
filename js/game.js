var Game = {
  game_loaded: false,
  // "run", "pause", "resuming", ""
  game_state: "pause",
  ignore_shift: false,
  start_game: function (initial_state) {
    History.init(initial_state);
    Game.game_loaded = true;
    Game.game_state = "run";
  },
  stop_game: function() {
    Game.game_state = "pause";
    Game.game_loaded = false;
  },
  enter_pause_mode: function () {
    Game.game_state = "pause";
    History.show();
    $("body").removeClass("play-mode");
    $("body").addClass("pause-mode");
  },
  continue_play_mode: function () {
    Notify.show("Continuing...");
    Game.enter_play_mode();
  },
  rewind_play_mode: function () {
    Notify.show("Rewind...");
    History.erase_future();
    Game.enter_play_mode();
  },
  fork_play_mode: function () {
    Notify.show("Forking...");
    History.fork();
    Game.enter_play_mode();
  },
  enter_play_mode: function () {
    Game.game_state = "run";
    History.hide();
    $("body").addClass("play-mode");
    $("body").removeClass("pause-mode");
  },

  tick: function () {
    if (Game.game_loaded) {
      inputs =  Input.current(); // Gets all the user inputs
      switch (Game.game_state ) {
      case "run":
        // Do these things:
        var new_state = Engine.tick(History.present_state(), inputs);
        Render.draw(History.game_history(), new_state);

        if (Game.game_state === 'run') {
          // You may have died -- don't save state then!
          History.save(new_state);
        }

        // Test for these state change inputs
        if (inputs.shift && !Game.ignore_shift) {
          Game.enter_pause_mode();
        }
        break;
      case "pause":
        // We rewind in rewind mode.
        History.backward(2);
        Render.draw(History.game_history());

        if (inputs.enter) {
          Game.fork_play_mode();
          Notify.show("Forking");

          Game.ignore_shift = true;

          // Allow for time to let go of the shift key
          // before going back into reverse mode.
          setTimeout(function() { Game.ignore_shift = false;} , 1000);
        } else if (!inputs.shift) {
          // We are no longer in rewind mode.
          Game.rewind_play_mode();
        }

        break;
      }
    }
  }
};

var game_tick_interval = setInterval(Game.tick, 50);
