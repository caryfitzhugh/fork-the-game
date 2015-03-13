var Engine = {
    move_rate: 1,
    is_open_space: function (game_state, pos) {
      var on_field = (pos.x <= game_state.playing_field.w && pos.x >= 0 && pos.y <= game_state.playing_field.h && pos.y >= 0);
      var on_player = (pos.x === game_state.player.x && pos.y === game_state.player.y);
      var on_fork = _.find(game_state.forks, function (fork) {
        return pos.x === fork.x && pos.y === fork.y;
      });
      var move_to_tile = Levels.get(game_state.playing_field, pos.y, pos.x);
      var on_structure = _.includes([Levels.tile.wall, Levels.tile.crate], move_to_tile);
      return on_field && !on_fork && !on_player && !on_structure;
    },
    is_valid_move: function (game_state, pos, vector) {
      return (Engine.is_open_space(game_state, pos) || Engine.crate_move_valid(game_state, pos, vector));
    },
    crate_move_valid: function (game_state, pos, vector) {
      var crate_here = Levels.get(game_state.playing_field, pos.y, pos.x) === Levels.tile.crate;
      var crate_target = {x: pos.x + vector.x, y: pos.y + vector.y};
      var magnet_underneath = _.find(Levels.items_at(game_state.items, pos.x, pos.y), function (item) {
        return item.type === "magnet" && (item.position || "floor") === "floor";
      });


      return crate_here && Engine.is_open_space(game_state, crate_target) && !magnet_underneath;
    },
    in_front: function (player) {
      var res = {x: player.x, y: player.y};
      if (player.heading === 0) {
        res.x = player.x + 1;
      } else if (player.heading === 1) {
        res.y = player.y + 1;
      } else if (player.heading === 2) {
        res.x = player.x - 1;
      } else if (player.heading === 3) {
        res.y = player.y - 1;
      }

      return res;
    },
    pickup: function (current_game_state, location, position) {
      // Get any item at the location and pull it from the items.
      return _.remove(current_game_state.items, function (item) {
        return item.x === location.x &&
               item.y === location.y &&
               (item.position || "floor") === position;
      })[0];
    },
    try_to_move: function (current_game_state, current, vector) {
      var valid_vector = {};

      // if ((Math.abs(vector.x)+Math.abs(vector.y)) > 1) {
        // console.log("Such large moves are not allowed!");
        // return {x:0, y:0};
      // }

      // Returns the appropriate / valid new position, based on the vector and collisions
      // Try to move by X
      var x_mod = {x: current.x + vector.x,
          y: current.y};
      if (Engine.is_valid_move(current_game_state, x_mod, vector)) {
        valid_vector.x = vector.x;
      } else {
        valid_vector.x = 0;
      }

      var y_mod = {y:
        current.y + vector.y,
        x: current.x
        };

      if (Engine.is_valid_move(current_game_state, y_mod, vector)) {
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
    perform_player_actions: function (current_game_state, inputs) {
      var new_game_state = _.cloneDeep(current_game_state);
      if (inputs.space) {
        var in_front = Engine.in_front(current_game_state.player);
        // If there is something there to target -- target it!
        var placeable_target = Levels.magnet_targets[
                                  Levels.get(current_game_state.playing_field,
                                       in_front.y,
                                       in_front.x)];

        var target_position = "floor"
        // We place on the floor UNLESS it's a wall / crate, etc)
        if (placeable_target) {
          // If we are on the left, we place it "on the right"
          target_position = {
            0: "left",
            1: "top",
            2: "right",
            3: "bottom"
          }[current_game_state.player.heading];
        }

        // Is there something there already?
        var already_there = Engine.pickup(new_game_state, in_front, target_position);

        // put the item in your new "holding" spot
        new_game_state.player.holding = already_there;

        // If we have something in hand - put it down "in front of you"
        // Pull from current, and put into "new"
        if (current_game_state.player.holding &&
            current_game_state.player.holding.type === "magnet") {
          // put the magnet at the position
          new_game_state.items.push(
            _.merge(_.cloneDeep(current_game_state.player.holding),
                    in_front,
                    {'position': target_position}));
        }
      }
      return new_game_state;
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
          game_state = _.merge({}, game_state, Engine.move_crates(game_state, fork, move_vector));
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
        player.heading = Math.abs((player.heading + 3) % 4);
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
      game_state = _.merge({}, game_state, Engine.move_crates(game_state, new_player, move_vector));
      game_state.player = new_player;

      return game_state;
   },
   move_crates: function (current_game_state, pos, vector) {
      var game_state = _.cloneDeep(current_game_state);
      if (Levels.get(game_state.playing_field, pos.y, pos.x) == Levels.tile.crate) {
        var new_pos = Engine.move(pos, vector);
        // Move the crate
        Levels.set(game_state.playing_field,new_pos.y,new_pos.x, Levels.tile.crate);
        Levels.set(game_state.playing_field,pos.y,pos.x, Levels.tile.floor);
        // Move attached objects
        _.each(game_state.items, function (item) {
          if (item.x === pos.x && item.y === pos.y) {
            item.x = new_pos.x;
            item.y = new_pos.y;
          }
        });
      }
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
  new_run_state = Engine.test_conditions(new_game_state, inputs);

  // Move player
  new_game_state =  Engine.move_player(new_game_state, inputs);

  new_game_state = Engine.perform_player_actions(new_game_state, inputs);
  // Move Forks
  new_game_state = Engine.move_forks(new_game_state, inputs);

  return {new_game_state: new_game_state,
          new_run_state: new_run_state};
};
