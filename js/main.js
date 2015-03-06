// Add control view - and let you change the tick rate, report FPS, etc.
var game_history = [Engine.initial];
game_history[0].playing_field[50][50] = 2;

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
