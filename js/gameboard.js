window.gameboard = new Ractive({
  el: $("#gameboard"),
  template: "#gameboard_template",
  data: {
    player: { top: 50, left: 50},
    forks: [],
    internal: {
      game_mode: 'play',
      total_frames: 0,
      rewind_frame: 0
    }
  }
});
