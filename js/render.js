
var Render = {
  board: new Ractive({
      el: $("#gameboard"),
      template: "" +
" <div id='gameboard_inner' class='{{internal.game_mode}}'> "+
" "+
"   {{#each forks}} "+
"     <div class='fork {{fork-number}}' style='left: {{x}}%; top: {{y}}%'></div> "+
"   {{/each}} "+
"   {{#player}} "+
"     <div class='player' style='left: {{x}}%; top: {{y}}%;'></div> "+
"   {{/player}} "+
" </div> "+
" "+
"     ",
      data: { }
    })
};

Render.draw = function (game_history, new_state) {
  Render.board.set(_.last(game_history));
};
