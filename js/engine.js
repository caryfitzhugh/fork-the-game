var Engine = {
    move_rate: 1,
    is_open_space: function (game_state, pos) {
      var on_field = (pos.x <= game_state.playing_field.w && pos.x >= 0 && pos.y <= game_state.playing_field.h && pos.y >= 0);
      var on_player = (pos.x === game_state.player.x && pos.y === game_state.player.y);
      var on_fork = _.find(game_state.forks, function (fork) {
        return pos.x === fork.x && pos.y === fork.y;
      });
      var on_structure = Levels.get(game_state.playing_field, pos.y, pos.x) === 1;
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
    occupied_by_player: function (gs, pos) {
      return gs.player.x === pos.x && gs.player.y === pos.y;
    },
    occupied_by_player_or_fork: function (gs, pos) {
      // If any of the player or forks are at pos
      return Engine.occupied_by_player(gs,pos) ||
        _.find(gs.forks, function (fork) {
        return fork.x === pos.x && fork.y === pos.y;
        });
    },
    perform_actions: function (current_game_state, inputs) {
      var game_state = _.cloneDeep(current_game_state);
      _.each(game_state.actions, function (action) {
        if (action.type === "switch") {
          Levels.set(game_state.playing_field, action.position.y, action.position.x, Levels.tile.switch); // Why do we do this? -DC
          var condition = Engine.occupied_by_player_or_fork(game_state, action.position);
          _.each(action.sets_flags, function (flag) {
            game_state.flags[flag] = condition;
          });
        } else if (action.type === 'changeblock') {
          Levels.set(game_state.playing_field,action.position.y,action.position.x, Levels.tile.changeblock);
          var condition = true;
          _.each(action.required_flags, function (flag) {
            if (!game_state.flags[flag]) { condition=false; }
          });
          if (condition) {
            Levels.set(game_state.playing_field,action.position.y,action.position.x, action.active);
          } else {
            Levels.set(game_state.playing_field,action.position.y,action.position.x, action.inactive);
          }
        } else if (action.type === 'logic_block') {
          Levels.set(game_state.playing_field,action.position.y,action.position.x, Levels.tile.logic_block);
          Levels.set(game_state.playing_field,action.position.y,action.position.x, action.triggered(game_state.flags) ? action.active : action.inactive);
        } else {
          console.log("Unknown action!", action);
        }
      });
      return game_state;
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

      var player = _.merge({}, {heading: 0, x: 0, y: 0, holding: null},
                                game_state.player);

      if (inputs.left) {
        player.heading = Math.abs((player.heading - 1) % 4);
      }
      if (inputs.right) {
        player.heading = Math.abs((player.heading + 1) % 4);
      }

      var move_vector = {x: 0, y: 0};
      if (inputs.up) {
        move_vector = {
          0: {x: 1, y: 0},
          1: {x: 0, y: 1},
          2: {x: -1 , y: 0},
          3: {x: 0 , y: -1}
        }[player.heading];
      }

      if (inputs.down) {
        move_vector = {
          0: {x: -1, y: 0},
          1: {x: 0, y: -1},
          2: {x: 1 , y: 0},
          3: {x: 0 , y: 1}
        }[player.heading];
      }


      var valid_vector =  Engine.try_to_move(current_game_state, player, move_vector);
      var new_player = _.merge({}, player, Engine.move(player, valid_vector));
      game_state.player = new_player;

      return game_state;
   },
   test_conditions: function (game_state) {
     var run_state = null;
      _.each([game_state.player].concat(game_state.forks), function (p) {
        if (Levels.get(game_state.playing_field, p.y, p.x) === Levels.tile.fire) {
          Notify.show("You Melted! -- rewind and try again!!!");
          run_state = "pause";
        }

        if (Levels.get(game_state.playing_field, p.y, p.x) === Levels.tile.win) {
          Notify.show("You WON!!!");
          run_state = "win";
        }
      });
    return run_state;
  }
};

Engine.tick = function (current_game_state, inputs) {
  // Perform Environment Actions
  var new_game_state = Engine.perform_actions(current_game_state, inputs);

  // Fire / win / etc
  new_run_state = Engine.test_conditions(new_game_state);

  // Move player
  new_game_state =  Engine.move_player(new_game_state, inputs);
  // Move Forks
  new_game_state = Engine.move_forks(new_game_state, inputs);

  return {new_game_state: new_game_state,
          new_run_state: new_run_state};
};
