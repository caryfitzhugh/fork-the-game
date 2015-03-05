var player_delta = {top:0, left: 0};
var move_rate = 0.5;

Mousetrap.bind('left', function() { player_delta.left -= move_rate; return false;});
Mousetrap.bind('right', function() { player_delta.left += move_rate; return false;});
Mousetrap.bind('up', function() { player_delta.top -= move_rate; return false;});
Mousetrap.bind('down', function() { player_delta.top += move_rate; return false;});

// Moves the player
var move_player = function (player) {
  var current = window.gameboard.get('player');
  player.top += player_delta.top;
  player.left += player_delta.left;

  player_delta = {top:0, left: 0};
  return player;
};


setInterval(function () {
  window.gameboard.set('player', move_player(window.gameboard.get('player') ));

  var forks = window.gameboard.get('forks');

  // Set the vars
  window.gameboard.set('forks',
    _.map(forks, function (fork) {
      fork.left = fork.left + _.random(2) - 1;
      fork.top = fork.top + _.random(2) - 1;
      return fork;
    })
  );
}
, 100);
