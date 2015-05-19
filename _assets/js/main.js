// INITIALIZE FOUNDATION

$(document).foundation({
  reveal : {
    animation_speed: 50
  }
});

// DOCUMENT READY
$(document).ready(function() {

  var Modernizr = window.Modernizr;

  // Hide address bar on mobile devices (except if #hash present, so we don't mess up deep linking).
  if (Modernizr.touch && !window.location.hash) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }

});
