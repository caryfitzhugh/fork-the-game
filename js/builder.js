var Builder = {
  new_view: function () {
    return new Ractive({
      el: $("#builder"),
      template: "#builder_template",

      data: {
        is_active: function (nm, current_tool) {
          return nm === current_tool ? "active"  : "";
        },
        is_selected: function (sp, x, y) {
          if (sp && sp.x === x && sp.y === y) {
            return "start-pos";
          }
        },
        tiles: ['win','wall', 'fire', 'blank', 'crate', 'player'],
        width: new Array(30),
        height: new Array(30),
        tile_data: {},
        description: "",
        tile_data_get: function (x,y, data) {
          return _.invert(Levels.tile)[Builder.get_tile(x,y).type];
        },
        maps: function() {
          var names = [];
          for (var i = 0; i < localStorage.length; i++){
            names.push(localStorage.key(i));
          }
          return names;
        },
        is_player_here: function (y, x, player) {
          return (y === player.y &&
                 x === player.x);
        },
        name: "",
        current_tool: "wall",
        player: null,
        selected: null
      }
    });
   },
  load_map: function (name) {
    Builder.view.set(
      JSON.parse(localStorage.getItem(name))
    );

  },
  delete_map: function () {
    localStorage.removeItem(Builder.view.get('name'));

    Builder.view = Builder.new_view();
  },
  save_map: function () {
    localStorage.setItem(Builder.view.get('name'),
                         JSON.stringify(Builder.view.get()));
    Builder.view.update();
  },
  set_player: function (x, y) {
    Builder.view.set('player', {x: x, y: y });
  },
  set_tile: function (x, y, v) {
    var tile_data = Builder.view.get("tile_data");
    if (! tile_data[y]) {
      tile_data[y] = {};
    }
    tile_data[y][x] = {type: Levels.tile[v]}

    Builder.view.set("tile_data", tile_data);
  },
  get_tile: function (x, y) {
    return Builder.view.get("tile_data."+y+"."+x);
  },
  to_field_data: function() {
    return Builder.view.get("tile_data");
  }
};

Builder.view = Builder.new_view();

Builder.view.on('select-tool', function (evt) {
  Builder.view.set('current_tool', evt.context);
});

Builder.view.on('set-block', function (evt) {
    var x = parseInt(evt.keypath.split('.')[1], 10);
    var y = parseInt($(evt.node).data('row'),10);
  if (Builder.view.get("current_tool") === 'player') {
    console.log('setting player', x, y);
    Builder.set_player(x,y);
  } else {
    if (Input.current().shift) {
      Builder.view.set("selected", {"x": x,"y":y});
    } else {
      var selected = Builder.view.get('selected');
      if (selected) {
        // Go from that place to here.
        // And set everything in between
        if (x === selected.x) {
          var from_y = _.min([selected.y, y]);
          var to_y = _.max([selected.y, y]);
          for (var the_y = from_y; the_y <= to_y; the_y += 1) {
            Builder.set_tile(x,the_y, Builder.view.get("current_tool"));
          }
        } else if (y === selected.y) {
          var from_x = _.min([selected.x, x]);
          var to_x = _.max([selected.x, x]);
          for (var the_x = from_x; the_x <= to_x; the_x += 1) {
            Builder.set_tile(the_x, y, Builder.view.get("current_tool"));
          }

        }
      Builder.view.set('selected', null);
      } else {
        Builder.set_tile(x,y, Builder.view.get("current_tool"));
      }
    }
  }
});

Builder.view.on('clear-block', function (evt) {
  var x = evt.keypath.split('.')[1];
  var y = $(evt.node).data('row');
  Builder.set_tile(x,y, null);
  return false;
});

Builder.view.on('close-export', function (evt) {
  Builder.view.set('export_data', null);
});

Builder.view.on('export', function (evt) {
  Builder.view.set('export_data',"Levels.games[\"" + Builder.view.get('name') + "\"] = " +
      JSON.stringify(
                    {
      player: Builder.view.get('player'),
      description: Builder.view.get('description'),
      actions: [],
      forks: [],
      items: [],
      "playing_field": {
        w: Builder.view.get('width').length,
        h: Builder.view.get('height').length,
        data: Builder.to_field_data()
      }
  }, null, 2));
});

Builder.view.on('delete-map', function (evt) {
  if (confirm ("Delete for sure?") ) {
    Builder.delete_map();
  }
});
Builder.view.on('save-map', function (evt) {
  Builder.save_map();
});

Builder.view.on('load-map', function (evt) {
  Builder.load_map($(evt.node).val());
});

Builder.view.on('new-map', function (evt) {
  Builder.view = Builder.new_view();
});

Builder.view.on('import', function (evt) {
  console.log("Import view with JSON / Javascript!: ");
});
