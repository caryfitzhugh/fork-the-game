var Engine = {
    move_rate: 1,
    is_open_space: function (game_state, pos) {
      var on_field = (pos.x <= game_state.playing_field.w && pos.x >= 0 && pos.y <= game_state.playing_field.h && pos.y >= 0);
      var on_player = (pos.x === game_state.player.x && pos.y === game_state.player.y);
      var on_fork = _.find(game_state.forks, function (fork) {
        return pos.x === fork.x && pos.y === fork.y;
      });
      var move_to_tile = Levels.get_safe(game_state.playing_field, pos);

      var on_structure = move_to_tile && _.includes([Levels.tile.wall, Levels.tile.crate], move_to_tile.type);

      var has_crate = _.find(move_to_tile.items, function (i) { return i.type === 'crate';});

      return on_field && !on_fork && !on_player && !on_structure && !has_crate;
    },
    is_valid_move: function (game_state, pos, vector) {
      var is_open_space = Engine.is_open_space(game_state, pos);
      var valid_crate_move = Engine.crate_move_valid(game_state, pos, vector)
      // if it's an open space OR
      return is_open_space ||
        // The crate move is valid (the create is moving
        valid_crate_move ||  is_open_space;
    },
    crate_move_valid: function (game_state, pos, vector) {
      // If there is a crate here, we look if it can move
      var here = Levels.get_safe(game_state.playing_field, pos)
      var crate_here = _.find(here.items, function (i) { return i.type === "crate";});
      var not_a_wall = here.type !== Levels.tile.wall;
      var crate_target = {x: pos.x + vector.x, y: pos.y + vector.y};

      var magnet_here = _.find(here.items, function (i) { return i.type === "magnet";});
      return (crate_here && !magnet_here) && not_a_wall && Engine.is_open_space(game_state, crate_target);
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
    try_to_move: function (current_game_state, current, vector) {
      var valid_vector = {};

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
    occupied_by_weighty_thing: function (gs, pos) {
      // If any of the player or forks are at pos
      return Engine.occupied_by_player(gs,pos) ||
        _.find(gs.forks, function (fork) {
        return fork.x === pos.x && fork.y === pos.y;
        }) ||
        _.find(Levels.get_safe(gs.playing_field, pos).items, function (i) { return i.type === 'crate';});
    },
    perform_player_actions: function (current_game_state, inputs) {
      var new_game_state = _.cloneDeep(current_game_state);
      if (inputs.space) {
        var in_front = Engine.in_front(current_game_state.player);
        var picked_up =
          Levels.put_item(new_game_state.playing_field,
                          in_front,
                          new_game_state.player.holding);

        new_game_state.player.holding = picked_up;
      }

      return new_game_state;
    },
    perform_tile_actions: function (current_game_state, inputs) {
      var game_state = _.cloneDeep(current_game_state);
      game_state.flags = game_state.flags || {};

      _.each(game_state.playing_field.data, function (vals , y) {
        _.each(vals, function (data, x) {
          _.each(data.actions, function (action) {
            var pos = {x: parseInt(x,10), y:parseInt(y,10) };
            if (action.type === "switch") {
              // Because then you don't need to also say "2" in the field data... <shrug> not a great solution - CF
              var condition = Engine.occupied_by_weighty_thing(game_state, pos);

              _.each(action.sets_flags, function (flag) {
                game_state.flags[flag] = condition;
              });
            } else if (action.type === 'changeblock') {
              var condition = true;
              _.each(action.required_flags, function (flag) {
                if (!game_state.flags[flag]) { condition=false; }
              });
              if (condition) {

                Levels.set_block_type(game_state.playing_field,pos, action.active);
              } else {
                Levels.set_block_type(game_state.playing_field,pos, action.inactive);
              }
            } else if (action.type === 'logic_block') {
              Levels.set_block_type(game_state.playing_field,pos, Levels.tile.logic_block);
              Levels.set_block_type(game_state.playing_field,pos, action.triggered(game_state.flags) ? action.active : action.inactive);
            } else {
              console.log("Unknown action!", action);
            }
          });
        });
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
          game_state = Engine.move_crates(game_state, fork, valid_vector);
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
      game_state = Engine.move_crates(game_state, new_player, valid_vector);
      game_state.player = new_player;

      return game_state;
   },

   move_crates: function (current_game_state, pos, vector) {
     if (vector.x !== 0 || vector.y !== 0) {
      var new_game_state = _.cloneDeep(current_game_state);
      var block = Levels.get_safe(new_game_state.playing_field, pos);

      if (_.find(block.items, function (i) { return i.type === "crate";})) {
        var new_pos = Engine.move(pos, vector);

        // Need to move objects (put)
        Levels.move_crate(new_game_state.playing_field,
                          pos,
                          new_pos);
        if (_.contains(block.items, undefined)) {
          console.log('doh');
        }
      }
      return new_game_state;
     } else {
       return current_game_state;
     }
   },
   test_conditions: function (game_state) {
     var run_state = null;
      _.each([game_state.player].concat(game_state.forks), function (p) {
        if (Levels.get_safe(game_state.playing_field, p).type === Levels.tile.fire) {
          Notify.show("You Melted! -- rewind and try again!!!");
          run_state = "pause";
        }

        if (Levels.get_safe(game_state.playing_field, p).type === Levels.tile.win) {
          Notify.show("You WON!!!");
          run_state = "win";
        }
      });
    return run_state;
  }
};

Engine.tick = function (current_game_state, inputs) {
  // Perform Renderer changes, does not affect game state
  Render.tick(inputs);

  // Perform Environment Actions
  var new_game_state = Engine.perform_tile_actions(current_game_state, inputs);
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
