var History = {
  index: function (v) {
    if (!_.isUndefined(v)) {
      History.view.set('current_index', v);
    }
    return History.view.get('current_index');
  },
  view: new Ractive({
      el: $("#rewind"),
      template: "" +
"{{#(current_index != history.length)}} "+
"     <div id='time-slider'> " +
"       <span>{{current_index}} / {{history.length}}</span> " +
"       <div class='line'></div> " +
"       <div class='notch' style='left: {{current_index * 100.0 / history.length}}%'></div> " +
"     </div> " +
"{{/(current_index != history.length)}} "+
"     ",
      data: {
        current_index: 1,
        history: [] }
  }),
  init: function (initial_state) {
    History.view.set("history", []);
    History.save(initial_state);
  },
  show: function () { History.view.set('current_index', History.view.get('history').length - 1); },
  hide: function () { History.view.set('current_index', History.view.get('history').length);},
  forward: function (multiple) {
    History.view.set('current_index', _.min([History.view.get("history").length, History.view.get('current_index') + (multiple || 1)]));
  },
  backward: function (multiple) { History.view.set('current_index', _.max([1, History.view.get('current_index') - (multiple || 1)]));}

};

History.play_mode = function () {
  return History.view.get('history').length === History.view.get('current_index');
};

History.erase_future = function () {
  History.view.set('history', History.game_history());
};

History.game_history = function () {
  return _.slice(History.view.get('history'), 0, History.view.get('current_index'));
};

History.present_state = function () {
  return _.cloneDeep(History.view.get("history")[History.view.get('current_index') - 1]);
};

History.save = function (state) {
  var history = History.view.get('history');
  history.push(state);
  History.view.set({
    'history': history,
    current_index: history.length
  });
};

History.future = function () {
  return _.slice(History.view.get('history'), History.view.get('current_index')- 1 /* TO END BY DEFAULT */);
};

History.fork = function () {
  // We want to take the player's "future" positions
  //  and add them to a fork.
  var future = History.future();

  // Add another Fork to the current state
  var current = History.present_state();

  current.forks = current.forks || [];
  current.forks.push({
    x: current.player.x,
    y: current.player.y,
    path : _.pluck(future, 'player')
  });

  console.log('forked', current.forks);

  History.erase_future();
  console.log('svae current');
  History.save(current);
  console.log(History.view.get('history'));
}
