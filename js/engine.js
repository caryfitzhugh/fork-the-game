var Engine = {
    move_rate: 1,
    initial: {
      player: {x: 50, y: 50},
      forks: [{x: 10, y:20, path: []}] ,
      playing_field:  Levels.basic
    },
    is_open_space: function (game_state, x, y) {
      var on_field = (x <= 100 && x >= 0 && y <= 100 && y >= 0);
      var on_player = false;
      var on_structure = false;
      return on_field && !on_player && !on_structure;
    },
    move_player: function (current_game_state, inputs) {
      var game_state = _.cloneDeep(current_game_state);

      var player = game_state.player;
      var new_player = _.cloneDeep(player);

      if (inputs.left) {
        new_player.x = player.x - 1;
      }
      if (inputs.right) {
        new_player.x = player.x + 1;
      }
      if (inputs.up) {
        new_player.y = player.y - 1;
      }
      if (inputs.down) {
        new_player.y = player.y + 1;
      }

      if (Engine.is_open_space(current_game_state, new_player.x, new_player.y)) {
        game_state.player = new_player;
      }

      return game_state;
   }
};

Engine.tick = function (current_game_state, inputs) {
  var game_state = _.cloneDeep(current_game_state);
  new_game_state = Engine.move_player(game_state, inputs);

  // Move Forks

  // Perform Actions Actions

  return new_game_state;
};
