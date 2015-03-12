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
  get: function(field, x, y) {
    var path = ""+x+"."+y;
    return Levels.path(field.data, path, 0);
  },
  set: function(field, x, y, v) {
    var path = ""+x+"."+y;
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
    items: [
      {type: "magnet", x: 8, y:9, position: "left"},
      {type: "magnet", x: 10, y:9, position: "right"},
      {type: "magnet", x: 9, y:8, position: "top"},
      {type: "magnet", x: 9, y:10, position: "bottom"}
    ],
    playing_field: {w: 30, h: 30, data: {
      8: { 9 : Levels.tile.crate },
      9: {
        8: Levels.tile.crate,
        10: Levels.tile.crate
      },
      10: { 9 : Levels.tile.crate },
      "18":{
        "19": 1,"21":1
      },
      "19":{
        "19": 1,"20": Levels.tile.win,"21":1
      },
      "20": {
        "19": 1,"20":1,"21":1
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

      "18":{
        "19": 1,"21":1
      },
      "19":{
        "19": 1,"20": Levels.tile.win,"21":1
      },
      "20": {
        "19": 1,"20":1,"21":1
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

      "18":{
        "19": Levels.tile.fire,"21":Levels.tile.fire
      },
      "19":{
        "19": Levels.tile.fire,"20": Levels.tile.win, "21": Levels.tile.fire
      },
      "20": {
        "19": Levels.tile.fire,"20": Levels.tile.fire, "21":Levels.tile.fire
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

      "18":{
        "19": Levels.tile.fire,
        "21": Levels.tile.fire
      },
      "19":{
        "19": Levels.tile.fire,
        "20": Levels.tile.win,
        "21": Levels.tile.fire
      },
      "20": {
        "19": Levels.tile.fire,
        "20": Levels.tile.fire,
        "21": Levels.tile.fire
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
          "13": 1,
          "14": 1,
          "15": 1
        },
        "7": {
          "13": 1,
          "15": 1
        },
        "8": {
          "13": 1,
          "14": 1,
          "15": 1
        },
        "9": {
          "13": 1,
          "15": 1
        },
        "10": {
          "13": 1,
          "14": 3,
          "15": 1
        },
        "11": {
          "13": 1,
          "14": 1,
          "15": 1
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
          "13": 1,
          "14": 1,
          "15": 1
        },
        "7": {
          "13": 1,
          "14": 1,
          "15": 1
        },
        "8": {
          "13": 1,
          "15": 1
        },
        "9": {
          "13": 1,
          "15": 1
        },
        "10": {
          "13": 1,
          "15": 1
        },
        "11": {
          "13": 1,
          "15": 1
        },
        "12": {
          "13": 1,
          "14": 3,
          "15": 1
        },
        "13": {
          "13": 1,
          "14": 1,
          "15": 1
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
        "19": Levels.tile.fire,
        "21": Levels.tile.fire
      },
      "19":{
        "19": Levels.tile.fire,
        "20": Levels.tile.win,
        "21": Levels.tile.fire
      },
      "20": {
        "19": Levels.tile.fire,
        "20": Levels.tile.fire,
        "21": Levels.tile.fire
      }
    }}
  }
};
Levels.view.set('game_names', _.keys(Levels.games));
