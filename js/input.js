var Input = {
  inputs: {},
  one_time_inputs: {},
  _MAP: {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    16: 'shift',
    17: 'ctrl',
    18: 'alt',
    20: 'capslock',
    27: 'esc',
    32: 'space',
    33: 'pageup',
    34: 'pagedown',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    45: 'ins',
    46: 'del',
    91: 'meta',
    93: 'meta',
    224: 'meta'
   }
};
Input.map_key = function (chr) {
  if (Input._MAP[chr]){
    return Input._MAP[chr];
  } else {
    return String.fromCharCode(chr);
  }
};

Input.current = function () {
  var res = _.merge({},
                    Input.inputs,
                    Input.one_time_inputs);
  Input.one_time_inputs = {};
  return res;
};

$(document).keydown(function (e) {
  if (!Input.map_key(e.keyCode)) {
    Input.one_time_inputs[Input.map_key(e.keyCode)] = true;
  }
  Input.inputs[Input.map_key(e.keyCode)] = true;

 // return false;
});

$(document).keyup(function (e) {
  delete Input.inputs[Input.map_key(e.keyCode)];
//  return false;
});
