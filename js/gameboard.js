window.gameboard = new Ractive({
  el: $("#gameboard"),
  template: "#gameboard_template",
  data: {
    player: { top: 50, left: 50},

    forks: [
      {top: 1, left: 5},
      {top: 30, left: 45},
      {top: 70, left: 25},
      {top: 100, left: 85}
    ]
  }
});
