var Levels = {
  view: new Ractive({
      el: $("#levels"),
      template: "" +
"{{#visible}}" +
" <div on-click='close' class='closer'> CLOSE </div>" +
" <ul class='level-select'>"+
"   {{#game_names}}" +
"    <li> <a on-click='start-game'>{{.}}</a></li>"+
"   {{/games}}" +
" </ul>" +
" "+
" "+
"{{/visible}} "+
" Level: {{current_level}} <a on-click='select'> Select </a>"+
"     ",
      data: {
        visible:false,
        current_level: "None"
      }
  }),
  close: function () {
    Levels.view.set("visible", false);
  },
  start_game: function(evt) {
    Game.start_game(Levels.games[evt.context]);
    history.pushState(null,null, '#'+evt.context);
    Levels.view.set({
      "visible": false,
      "current_level": evt.context});
  },
  select: function () {
    Levels.view.set("visible", true);
  },

  path: function(obj, path, def){
    for(var i = 0,path = path.split('.'),len = path.length; i < len; i++){
     if(!obj || typeof obj !== 'object') return def;
       obj = obj[path[i]];
     }
     if(obj === undefined) return def;
     return obj;
  },
  items_at: function (items, x, y) {
    return _.select(items, function (item) {
      return item.x === x && item.y === y;
    });
  },
  move_crate: function (playing_field, from, to) {
    var from_data = Levels.get_and_create(playing_field, from);
    var to_data = Levels.get_and_create(playing_field, to);

    //Overwrite!
    var new_to = _.cloneDeep(to_data);
    new_to.items = _.cloneDeep(from_data.items.concat(to_data.items));

    var new_from = _.cloneDeep(from_data);
    new_from.items = [];

    Levels.set(playing_field, to, new_to);
    Levels.set(playing_field, from,new_from);
  },
  put_item: function (playing_field, pos, item) {
    // Returns what was there before
    // Get any item at the location and pull it from the items.
    var square = Levels.get(playing_field, pos);
    var already_there = null;
    // If the square exists, look in it
    if (square) {
      already_there = _.remove(square.items, function (item) {
        return _.contains(['magnet','transport'], item.type);
      })[0];
    }

    // Don't add this if... it doesn't exist!
    if (item) {
      if (!square) {
        var empty_tile = Levels.get_safe(playing_field, pos);
        empty_tile.items.push(item);
        Levels.set(playing_field,
                   pos,
                   empty_tile);
      } else {
        square.items = square.items || [];
        square.items.push(item);
      }
    }
    return already_there;
  },
  get_safe: function (field, pos) {
    return Levels.get(field, pos) ||  {type: 0, items: []};
  },
  get_and_create: function (field, pos) {
    if (!Levels.get(field, pos)) {
      Levels.set(field, pos, {type: 0, items: []});
    }
    return Levels.get(field, pos);
  },
  get: function(field, pos) {
    var path = ""+ pos.y +"."+pos.x;
    var at =  Levels.path(field.data, path, null);
    return at;
  },
  set_block_type: function (field, pos, type) {
    var got = Levels.get_safe(field, pos);
    got.type = type;
    Levels.set(field, pos, got);
  },
  set: function(field, pos, v) {
    var x = pos.x;
    var y = pos.y;
    var path = ""+y+"."+x;
    var obj = field.data || {};

    for(var i = 0,path = path.split('.'),len = path.length; i < len - 1; i++){
      if (!obj[path[i]]) {
        obj[path[i]] = {};
      }
      obj = obj[path[i]];
    }
    obj[path[i]] = v;

    return v;
  }
};

Levels.view.on('select', Levels.select);
Levels.view.on('start-game', Levels.start_game);
Levels.view.on('close', Levels.close);

Levels.tile = { // this MUST agree with the game engine's definition of the game board and probably should be defined there?
  'floor': 0,
  'wall': 1,
  'switch': 2,
  'win' : 3,
  'fire': 4,
  'changeblock': 5,
  'logic_block': 6,
  'crate': 7
};
Levels.magnet_targets = {};
Levels.magnet_targets[Levels.tile.wall] = true;
Levels.magnet_targets[Levels.tile.crate] = true;

Levels.games = {
  "basic" :  {
    player: {x: 11, y:9, heading: 2},
    forks: [],
    actions: [
    ],
    playing_field: {w: 30, h: 30, data: {
      7: { 9 : {type: 0, items: [{type: 'magnet'}] }},
      8: { 9 : {type: 0, items: [{type: 'crate'}] }},
      9: {
        8: {type: 0, items: [{type: 'crate'}]},
        10:{type: 0, items: [{type: 'crate'}]}
      },
      10: { 9 : {type: 0, items: [{type: 'crate'}] }},
      18:{
        19: {type: 1},21: {type: 1}
      },
      19:{
        19: {type: 1},20: {type: Levels.tile.win}, 21:{type: 1}
      },
      "20": {
        "19": {type: 1},"20":{type: 1},"21":{type: 1}
      }

    }}
  },
  "one switch" :  {
    player: {x: 10, y:10},
    forks: [],
    actions: [
      {type: "switch",
       position: {x: 10, y:10},
       sets_flags: [ "door_open" ]
      },
      {type: "changeblock",
       position: {x: 20, y:18},
       required_flags: [ "door_open" ],
       active: 0,
       inactive: 1
      }
    ],
    flags: [],
    playing_field: {w: 30, h: 30, data: {

      "17":{
        "10": {type: 0, items: [{type: 'crate'}]},"21":{type: 1, items: []}
      },
      "18":{
        "19": {type: 1, items: []},"21":{type: 1, items: []}
      },
      "19":{
        "19": {type: 1},"20": {type: Levels.tile.win},"21":{type: 1}
      },
      "20": {
        "19": {type: 1},"20":{type: 1},"21":{type: 1}
      }

    }}
  },
  "one switch with FIRE" :  {
  // This manages what leves to display (and return).
  // Proivdes a level id - returns level info to the engine, etc.
    player: {x: 10, y:10},
    forks: [],
    actions: [
      {type: "switch",
       position: {x: 15, y:15},
       sets_flags: [ "door_open" ]
      },
      {type: "changeblock",
       position: {x: 20, y:18},
       required_flags: [ "door_open" ],
       active: 0,
       inactive: 1
      }
    ],
    flags: [],
    playing_field: {w: 30, h: 30, data: {

      "17":{
        "10": {type: 0, items: [{type: 'crate'}]}
      },
      "18":{
        "19": {type: Levels.tile.fire},"21":{type: Levels.tile.fire}
      },
      "19":{
        "19": {type: Levels.tile.fire},"20": {type: Levels.tile.win}, "21": {type: Levels.tile.fire}
      },
      "20": {
        "19": {type: Levels.tile.fire},"20": {type: Levels.tile.fire}, "21":{type: Levels.tile.fire}
      }
    }}
  },
  "two switches with FIRE" :  {
  // This manages what leves to display (and return).
  // Proivdes a level id - returns level info to the engine, etc.
    player: {x: 10, y:10},
    forks: [],
    actions: [
      {type: "switch",
       position: {x: 15, y:15},
       sets_flags: [ "door_open_A" ]
      },
      {type: "switch",
       position: {x: 25, y:15},
       sets_flags: [ "door_open_B" ]
      },
      {type: "changeblock",
       position: {x: 20, y: 18},
       required_flags: ["door_open_A", "door_open_B"],
       active: 0,
       inactive: 1
      }
    ],
    flags: [],
    playing_field: {
      w: 30,
      h: 30,
      data: {


      "17":{
        "10": {type: 0, items: [{type: 'crate'}]},
        "11": {type: 0, items: [{type: 'crate'}]}
      },
      "18":{
        "21":{type: Levels.tile.fire},
        "19":{type:Levels.tile.fire}
      },
      "19":{
        "19": {type: Levels.tile.fire},
        "20": {type: Levels.tile.win},
        "21": {type: Levels.tile.fire}
      },
      "20": {
        "19": {type: Levels.tile.fire},
        "20": {type: Levels.tile.fire},
        "21": {type: Levels.tile.fire}
      }

    }}
  },
  "Simple Future Logic" :  {
    player: {x: 14, y:1},
    forks: [],
    actions: [
      {type: "switch",
       position: {x: 12, y: 4},
       sets_flags: ["outer_door"]
      },
      {type: "switch",
       position: {x: 16, y: 4},
       sets_flags: ["inner_door"]
      },
      {type: "changeblock",
       position: {x: 14, y: 6},
       required_flags: ["outer_door"],
       active: 0,
       inactive: 1
      },
      {type: "changeblock",
       position: {x: 14, y: 8},
       required_flags: ["inner_door"],
       active: 0,
       inactive: 1
      }
    ],
    flags: [],
    playing_field: {
      w: 30,
      h: 30,
      data: {
        "6": {
          "13": {type: Levels.tile.wall},
          "14": {type: Levels.tile.wall},
          "15": {type: Levels.tile.wall}
        },
        "7": {
          "13": {type: Levels.tile.wall},
          "15": {type: Levels.tile.wall}
        },
        "8": {
          "13": {type: Levels.tile.wall},
          "14": {type: Levels.tile.wall},
          "15": {type: Levels.tile.wall}
        },
        "9": {
          "13": {type: Levels.tile.wall},
          "15": {type: Levels.tile.wall}
        },
        "10": {
          "13": {type: Levels.tile.wall},
          "14": {type: Levels.tile.win},
          "15": {type: Levels.tile.wall}
        },
        "11": {
          "13": {type: Levels.tile.wall},
          "14": {type: Levels.tile.wall},
          "15": {type: Levels.tile.wall}
        }
      }
    }
  },
  "More Simple Future Logic" :  {
    player: {x: 14, y:1},
    forks: [],
    actions: [
      {type: "switch",
       position: {x: 12, y: 3},
       sets_flags: ["first_door"]
      },
      {type: "switch",
       position: {x: 16, y: 3},
       sets_flags: ["second_door_fire"]
      },
      {type: "switch",
       position: {x: 12, y: 4},
       sets_flags: ["third_door"]
      },
      {type: "changeblock",
       position: {x: 14, y: 6},
       required_flags: ["first_door"],
       active: 0,
       inactive: 1
      },
      {type: "changeblock",
       position: {x: 14, y: 7},
       required_flags: ["second_door_fire"],
       active: 0,
       inactive: 1
      },
      {type: "changeblock",
       position: {x: 14, y: 9},
       required_flags: ["third_door"],
       active: 0,
       inactive: 1
      },
      {type: "changeblock",
       position: {x: 14, y: 11},
       required_flags: ["second_door_fire"],
       active: 4,
       inactive: 0
      }
    ],
    flags: [],
    playing_field: {
      w: 30,
      h: 30,
      data: {
        "6": {
          "13": {type: 1},
          "14": {type: 1},
          "15": {type: 1}
        },
        "7": {
          "13": {type: 1},
          "14": {type: 1},
          "15": {type: 1}
        },
        "8": {
          "13": {type: 1},
          "15": {type: 1}
        },
        "9": {
          "13": {type: 1},
          "15": {type: 1}
        },
        "10": {
          "13": {type: 1},
          "15": {type: 1}
        },
        "11": {
          "13": {type: 1},
          "15": {type: 1}
        },
        "12": {
          "13": {type: 1},
          "14": {type: 3},
          "15": {type: 1}
        },
        "13": {
          "13": {type: 1},
          "14": {type: 1},
          "15": {type: 1}
        }
      }
    }
  },
  "Logic blocks of FIRE" :  {
  // A logical reprise of the popular "two switches with FIRE" level
    player: {x: 10, y:10},
    forks: [],
    actions: [
      {type: "switch",
       position: {x: 15, y:15},
       sets_flags: [ "LOGIC_A" ]
      },
      {type: "switch",
       position: {x: 25, y:15},
       sets_flags: [ "LOGIC_B" ]
      },
      {type: "logic_block",
       position: {x: 20, y: 16},
       triggered: function (flags) { return flags["LOGIC_A"] && flags["LOGIC_B"]; },
       active: 0,
       inactive: 1
      },
      {type: "logic_block",
       position: {x: 20, y: 17},
       triggered: function (flags) { return flags["LOGIC_A"] || flags["LOGIC_B"]; },
       active: 0,
       inactive: 1
      },
      {type: "logic_block",
       position: {x: 20, y: 18},
       triggered: function (flags) { return !flags["LOGIC_A"] != !flags["LOGIC_B"]; },
       active: 0,
       inactive: 1
      }
    ],
    flags: [],
    playing_field: {
      w: 30,
      h: 30,
      data: {

      "18":{
        "19": {type: Levels.tile.fire},
        "21": {type: Levels.tile.fire}
      },
      "19":{
        "19": {type: Levels.tile.fire},
        "20": {type: Levels.tile.win},
        "21": {type: Levels.tile.fire}
      },
      "20": {
        "19": {type: Levels.tile.fire},
        "20": {type: Levels.tile.fire},
        "21": {type: Levels.tile.fire}
      }
    }}
  }
};
