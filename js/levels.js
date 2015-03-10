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
console.log("Levels", Levels.select);
Levels.view.on('select', Levels.select);
Levels.view.on('start-game', Levels.start_game);
Levels.view.on('close', Levels.close);

Levels.tile = {	// this MUST agree with the game engine's definition of the game board and probably should be defined there?
  'wall': 1,
  'switch': 2,
  'win' : 3,
  'fire': 4,
	'changeblock': 5
};

Levels.games = {
  "basic" :  {
    player: {x: 10, y:10},
    forks: [],
    actions: [
      {type: "win",
       position: {x: 20, y:19}
      }
    ],
    playing_field: {w: 30, h: 30, data: {
      "18":{
        "19": 1,"21":1
      },
      "19":{
        "19": 1,"21":1
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
      {type: "win",
       position: {x: 20, y:19},
      },
      {type: "switch",
       position: {x: 10, y:10},
       sets: 0
      },
      {type: "changeblock",
       position: {x: 20, y:18},
       required_flags: [0],
       active: 0,
       inactive: 1
      }
    ],
    playing_field: {w: 30, h: 30, data: {

      "18":{
        "19": 1,"21":1
      },
      "19":{
        "19": 1,"21":1
      },
      "20": {
        "19": 1,"20":1,"21":1
      }

    }},
		flags: [ false ]
  },
  "one switch with FIRE" :  {
  // This manages what leves to display (and return).
  // Proivdes a level id - returns level info to the engine, etc.
    player: {x: 10, y:10},
    forks: [],
    actions: [
      {type: "win",
       position: {x: 20, y:19},
      },
      {type: "fire", position: {x: 21, y:19} },
      {type: "fire", position: {x: 19, y:19} },
      {type: "fire", position: {x: 21, y:20} },
      {type: "fire", position: {x: 20, y:20} },
      {type: "fire", position: {x: 19, y:20} },
      {type: "switch",
       position: {x: 15, y:15},
       sets: 0
      },
      {type: "changeblock",
       position: {x: 20, y:18},
       required_flags: [0],
       active: 0,
       inactive: 1
      }
    ],
    playing_field: {w: 30, h: 30, data: {

      "18":{
        "19": 1,"21":1
      },
      "19":{
        "19": 1,"21":1
      },
      "20": {
        "19": 1,"21":1
      }

    }},
		flags: [ false ]
  },
  "two switches with FIRE" :  {
  // This manages what leves to display (and return).
  // Proivdes a level id - returns level info to the engine, etc.
    player: {x: 10, y:10},
    forks: [],
    actions: [
      {type: "win",
       position: {x: 20, y:19},
      },
      {type: "fire", position: {x: 21, y:19} },
      {type: "fire", position: {x: 19, y:19} },
      {type: "fire", position: {x: 21, y:20} },
      {type: "fire", position: {x: 20, y:20} },
      {type: "fire", position: {x: 19, y:20} },
      {type: "switch",
       position: {x: 15, y:15},
       sets: 0
      },
      {type: "switch",
       position: {x: 25, y:15},
       sets: 1
      },
      {type: "changeblock",
       position: {x: 20, y:18},
       required_flags: [0, 1],
       active: 0,
       inactive: 1
      }
    ],
    playing_field: {w: 30, h: 30, data: {

      "18":{
        "19": 1,"21":1
      },
      "19":{
        "19": 1,"21":1
      },
      "20": {
        "19": 1,"21":1
      }

    }},
		flags: [ false, false ]
  },
  "You will need timing" :  {

    player: {x: 8, y:1},
    forks: [],
    actions: [
      {type: "win",
       position: {x: 6, y:11}
      },
      {type: "switch",
       position: {x: 8, y:13},
       sets: 0
      },
      {type: "changeblock",
       position: {x: 7, y:11},
       required_flags: [0],
       active: 0,
       inactive: 1
			},
      {type: "changeblock",
       position: {x: 8, y:10},
       required_flags: [0],
       active: 4,
       inactive: 0
			},
      {type: "changeblock",
       position: {x: 8, y:12},
       required_flags: [0],
       active: 4,
       inactive: 0
			}
		],
		playing_field: {w: 30, h: 30, data: {
      "3": {
        "7": 4,
        "9": 4
      },
      "4": {
        "7": 4,
        "9": 4
      },
      "5": {
        "7": 4,
        "9": 4
      },
      "6": {
        "7": 4,
        "9": 4
      },
      "7": {
        "7": 4,
        "9": 4
      },
      "8": {
        "7": 4,
        "9": 4
      },
      "9": {
        "7": 4,
        "9": 4
      },
      "10": {
        "5": 1,
        "6": 1,
        "7": 1,
        "9": 1
      },
      "11": {
        "5": 1,
        "6": 1,
        "7": 1,
        "9": 1
      },
      "12": {
        "5": 1,
        "6": 1,
        "7": 1,
        "9": 1,
				"10": 1
      },
      "13": {
        "7": 1,
        "10": 1
      },
      "14": {
        "7": 1,
        "8": 1,
        "9": 1,
				"10": 1
      }
    }},
		flags: [ false ]
	}
};
Levels.view.set('game_names', _.keys(Levels.games));
