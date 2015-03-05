var Notify = {
  show: function (msg) {
    $("#notification").
      removeClass('show').
      html(msg).
      addClass('show');

    _.delay(function() { $("#notification").removeClass('show'); }, 2000);
  }
};
