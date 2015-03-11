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
    ],
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
  "one switch" :  {
    player: {x: 10, y:10},
    forks: [],
    actions: [
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
        "19": 1,"20": Levels.tile.win,"21":1
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
        "19": Levels.tile.fire,"21":Levels.tile.fire
      },
      "19":{
        "19": Levels.tile.fire,"20": Levels.tile.win, "21": Levels.tile.fire
      },
      "20": {
        "19": Levels.tile.fire,"20": Levels.tile.fire, "21":Levels.tile.fire
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
      {type: "switch",
       position: {x: 15, y:15},
       sets: 0
      },
      {type: "switch",
       position: {x: 25, y:15},
       sets: 1
      },
      {type: "changeblock",
       position: {x: 20, y: 18},
       required_flags: [0, 1],
       active: 0,
       inactive: 1
      }
    ],
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

    }},
		flags: [ false, false ]
  },
  "You will need timing" :  {
    player: {x: 14, y:1},
    forks: [],
    actions: [
      {type: "switch",	// inner (top) button
       position: {x: 15, y:10},
       sets: 0
      },
      {type: "switch",	// outer (bottom) button
       position: {x: 14, y:11},
       sets: 1
      },
      {type: "switch",	// secret button
       position: {x: 12, y:12},
       sets: 2
      },
      {type: "changeblock",	// inner door
       position: {x: 12, y:10},
       required_flags: [1],
       active: 0,
       inactive: 4
			},
      {type: "changeblock",	// outer door
       position: {x: 13, y:10},
       required_flags: [0],
       active: 0,
       inactive: 1
			},
      {type: "changeblock",	// secret door
       position: {x: 12, y:13},
       required_flags: [1],
       active: 0,
       inactive: 1
			},
      {type: "changeblock",	// hidey space
       position: {x: 16, y:13},
       required_flags: [2],
       active: 0,
       inactive: 1
			},
      {type: "changeblock",	// fire trap top
       position: {x: 14, y:8},
       required_flags: [0],
       active: 4,
       inactive: 0
			},
      {type: "changeblock",	// fire trap bottom
       position: {x: 14, y:10},
       required_flags: [1],
       active: 4,
       inactive: 0
			}
		],
		playing_field: {
			w: 30,
			h: 30,
			data: {
			"0": {
				"13": 1,
				"14": 1,
				"15": 1
			},
			"1": {
				"13": 1,
				"15": 1
			},
			"2": {
				"13": 1,
				"15": 1
			},
			"3": {},
			"4": {
				"12": 1,
				"13": 1,
				"15": 1,
				"16": 1
			},
			"5": {
				"13": 1,
				"15": 1
			},
			"6": {
				"12": 1,
				"13": 1,
				"15": 1,
				"16": 1
			},
			"7": {
				"13": 1,
				"15": 1
			},
			"8": {
				"12": 1,
				"13": 1,
				"15": 1,
				"16": 1
			},
			"9": {
				"10": 1,
				"11": 1,
				"12": 1,
				"13": 1,
				"15": 1,
				"16": 1,
				"17": 1,
				"18": 1
			},
			"10": {
				"10": 1,
				"11": 3,
				"12": 1,
				"13": 1,
				"16": 1,
				"17": 1,
				"18": 1
			},
			"11": {
				"10": 1,
				"11": 1,
				"12": 1,
				"13": 1,
				"15": 1,
				"16": 1,
				"17": 1,
				"18": 1
			},
			"12": {
				"10": 1,
				"11": 1,
				"13": 1,
				"14": 1,
				"15": 1,
				"16": 1,
				"17": 1,
				"18": 1
			},
			"13": {
				"11": 1,
				"12": 1,
				"13": 1,
				"14": 1,
				"15": 1,
				"16": 1,
				"17": 1
			}
		}},
		flags: [ false, false, false ]
	},
	"Simple Future Logic" :  {
    player: {x: 10, y:1},
    forks: [],
    actions: [
      {type: "switch",
       position: {x: 12, y: 4},
       sets: 0
      },
      {type: "switch",
       position: {x: 16, y: 4},
       sets: 1
      },
      {type: "changeblock",
       position: {x: 14, y: 6},
       required_flags: [0],
       active: 0,
       inactive: 1
      },
      {type: "changeblock",
       position: {x: 14, y: 8},
       required_flags: [1],
       active: 0,
       inactive: 1
      }
    ],
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
		},
		flags: [ false, false ]
	}
};
Levels.view.set('game_names', _.keys(Levels.games));
