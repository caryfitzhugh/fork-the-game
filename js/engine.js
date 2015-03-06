var Engine = {
    move_rate: 1,
    initial: {
      player: {x: 50, y: 50},
      forks: [{x: 10, y:20, path: []}] ,
      playing_field:  Levels.basic
    },
    is_open_space: function (game_state, pos) {
      var on_field = (pos.x <= 100 && pos.x >= 0 && pos.y <= 100 && pos.y >= 0);
      var on_player = (pos.x === game_state.player.x && pos.y === game_state.player.y);
      var on_fork = _.find(game_state.forks, function (fork) {
        return pos.x === fork.x && pos.y === fork.y;
      });
      var on_structure = game_state.playing_field[pos.x][pos.y] > 0;
      return on_field && !on_fork && !on_player && !on_structure;
    },
    try_to_move: function (current_game_state, current, vector) {
      var valid_vector = {};
      // Returns the appropriate / valid new position, based on the vector and collisions
      // Try to move by X
      var x_mod = {x: current.x + vector.x,
          y: current.y};
      if (Engine.is_open_space(current_game_state, x_mod)) {
        valid_vector.x = vector.x;
      } else {
        valid_vector.x = 0;
      }

      var y_mod = {y:
        current.y + vector.y,
        x: current.x
        };

      if (Engine.is_open_space(current_game_state, y_mod)) {
        valid_vector.y = vector.y;
      } else {
        valid_vector.y = 0;
      }

      return valid_vector;
    },
    move: function (pos, vector) {
      return {x: pos.x + vector.x, y: pos.y + vector.y};
    },
    move_forks : function (current_game_state, inputs) {
      var game_state = _.cloneDeep(current_game_state);

      var forks = _.compact(_.map(game_state.forks, function (old_fork) {
        var fork = _.cloneDeep(old_fork);
        var move_vector = {x: 0, y: 0};
        // Inputs move the fork.
        var next_move = fork.path.shift();
        if (next_move) {
          // Where do we want to be in X direction?
          if (next_move.x < fork.x) {
            move_vector.x = -1;
          } else if (next_move.x > fork.x) {
            move_vector.x = 1;
          }

          // And now the Y direction
          if (next_move.y < fork.y) {
            move_vector.y = -1;
          } else if (next_move.y > fork.y) {
            move_vector.y = 1;
          }

          var valid_vector =  Engine.try_to_move(current_game_state, fork, move_vector);
          fork = _.merge({}, fork, Engine.move(fork, valid_vector));
        } else {
          fork = null;
        }
        return fork;
      }));

      game_state.forks = forks;

      return game_state;
    },
    move_player: function (current_game_state, inputs) {
      var game_state = _.cloneDeep(current_game_state);

      var player = game_state.player;
      var move_vector = {x: 0, y: 0};

      if (inputs.left) {
        move_vector.x = -1;
      }
      if (inputs.right) {
        move_vector.x = 1;
      }
      if (inputs.up) {
        move_vector.y = -1;
      }
      if (inputs.down) {
        move_vector.y = 1;
      }

      var valid_vector =  Engine.try_to_move(current_game_state, player, move_vector);
      var new_player = _.merge({}, player, Engine.move(player, valid_vector));
      game_state.player = new_player;

      return game_state;
   }
};

Engine.tick = function (current_game_state, inputs) {
  var game_state = _.cloneDeep(current_game_state);
  new_game_state = Engine.move_player(game_state, inputs);
  // Move Forks
  new_game_state = Engine.move_forks(new_game_state, inputs);


  // Perform Environment Actions

  return new_game_state;
};
