var Builder = {
  view: new Ractive({
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
        tiles: ['win','wall', 'fire', 'blank'],
        width: new Array(30),
        height: new Array(30),
        tile_data: {},
        tile_data_get: function (x,y, data) {
          return _.invert(Levels.tile)[Builder.get_tile(x,y)];
        },
        current_tool: "wall",
        selected: null
      }
  }),
  set_tile: function (x, y, v) {
    var tile_data = Builder.view.get("tile_data");
    if (! tile_data[y]) {
      tile_data[y] = {};
    }
    tile_data[y][x] = Levels.tile[v];

    Builder.view.set("tile_data", tile_data);
  },
  get_tile: function (x, y) {
    return Builder.view.get("tile_data."+y+"."+x);
  },
  to_field_data: function() {
    return Builder.view.get("tile_data");
  }
};

Builder.view.on('select-tool', function (evt) {
  Builder.view.set('current_tool', evt.context);
});

Builder.view.on('set-block', function (evt) {
  var x = parseInt(evt.keypath.split('.')[1], 10);
  var y = parseInt($(evt.node).data('row'),10);

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
               console.log(Builder.to_field_data())
  Builder.view.set('export_data',JSON.stringify(
                    {"playing_field": {
                      w: Builder.view.get('width').length,
                      h: Builder.view.get('height').length,
                      data: Builder.to_field_data()
                    }}, null, 2));
});

Builder.view.on('import', function (evt) {
  console.log("Import view with JSON / Javascript!: ");
});
