var Animate = {
  _time: 0,
  _milliseconds: 0,
  _loop: 0,
  _pulse: 0,
  _sine: 0,
  init: function () {
    // maybe do something here
  }
};

Animate.tick = function () {
  var date = new Date();
  this._time = date.getTime();
  this._milliseconds = date.getMilliseconds();
  this._loop = this._milliseconds / 1000;
  this._pulse = Math.sin(this._loop * Math.PI);
  this._sine = Math.sin(this._loop * 2 * Math.PI);
}

Animate.pulse = function () {
  return this._pulse;
}
