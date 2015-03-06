var Game = {
  game_loaded: false,
  game_running: true,
  start_game: function (initial_state) {
    History.init(initial_state);
    Game.game_loaded = true;
  },
  stop_game: function() {
    Game.game_loaded = false;
  },
  enter_pause_mode: function () {
    Game.game_running = false;
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
    Game.game_running = true;
    History.hide();
    $("body").addClass("play-mode");
    $("body").removeClass("pause-mode");
  },

  tick: function () {
    if (Game.game_loaded) {
      inputs =  Input.current(); // Gets all the user inputs
      if (Game.game_running) {

        var new_state = Engine.tick(History.present_state(), inputs);

        Render.draw(History.game_history(), new_state);

        History.save(new_state);

        if (inputs.esc) {
          Notify.show("Pausing...");
          Game.enter_pause_mode();
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
          Game.continue_play_mode();
        }

        if (inputs.space) {
          Game.rewind_play_mode();
        } else if (inputs.enter) {
          Game.fork_play_mode();
        }
        if (!Game.game_running) {
          Render.draw(History.game_history());
        }
      }
    }
  }
};

setInterval(Game.tick, 50);
