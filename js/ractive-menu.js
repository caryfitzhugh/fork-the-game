Ractive.events.menu = function ( node, fire ) {
  var longpressDuration = 500, threshold = 5, contextmenuHandler, touchstartHandler;

  // intercept contextmenu events and suppress them
  contextmenuHandler = function ( event ) {
    event.preventDefault();

    // we'll pass along some coordinates. This will make more sense below
    fire({
          node: node,
          original: event,
          x: event.clientX,
          y: event.clientY
          });
  };

  node.addEventListener( 'contextmenu', contextmenuHandler );

  // return an object with a teardown method, so we can unbind everything when the
  // element is removed from the DOM
  return {
  teardown: function () {
  node.removeEventListener( 'contexmenu', contextmenuHandler );
  }
};
                                                                                                                                                                                                                                                                                                                                                                                                                    };
