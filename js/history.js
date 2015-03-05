var History = {
  initial: { index: 0 },
  sequence: [],
  start_pause_mode: function () {
    return {index: History.sequence.length};
  },
  view: new Ractive({
      el: $("#rewind"),
      template: "" +
"{{#visible}} "+
"     <div id='time-slider'> " +
"       <span>{{current_index}} / {{history_length}}</span> " +
"       <div class='line'></div> " +
"       <div class='notch' style='left: {{current_index * 100.0 / history_length}}%'></div> " +
"     </div> " +
"{{/visible}} "+
"     ",
      data: {index: 0, history_length: 0 }
  })
};
History.clear = function () {
  History.view.set('visible', false);
  History.view.set('history_length', 0);
  History.view.set('current_index', 0);
};

History.tick = function (history,index) {
  History.view.set('visible', true);
  History.view.set('history_length', history.length);
  History.view.set('current_index', index);
  console.log('history.length', index);
};
