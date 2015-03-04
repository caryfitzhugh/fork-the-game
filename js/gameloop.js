setInterval(function () {
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
, 1000);
