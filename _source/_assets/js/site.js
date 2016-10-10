// --------------------------------------------------
// SITE.JS
// --------------------------------------------------

// initialize skrollr
$(function () {
  // initialize skrollr if the window width is large enough
  if ($(window).width() > 767) {
    skrollr.init({forceHeight: false});
  }
});


$(document).ready(function(){

  $('[data-trigger-mobile-nav]').on('click', function(){
    $('.mobile-nav-content').toggleClass('active');
  });

  // Initialize Foundation
  $(document).foundation();

  // Email protector
  $('a[data-email-protector]').emailProtector()

  // INITIALIZE SLIDERS
  var nav = $(".nav");
  if ($("body").hasClass("page-home")){
    $(window).on("scroll", function(e) {
      $(".mobile-nav-content").removeClass("active");

      if ($(window).scrollTop() > 300) {
        nav.addClass("nav-fixed");
      } else {
        nav.removeClass("nav-fixed");
      }
    });
  }

  var marqueeSlider = $('#marquee-slider').royalSlider({
    addActiveClass: true,
    autoScaleSlider: true,
    loop: true,
    imageScaleMode: 'fill',
    fadeinLoadedSlide: false,
    keyboardNavEnabled: true
  }).data('royalSlider');


  // initialize headroom menu (disappear on scroll)
  $(".top-bar").headroom({
    // vertical offset in px before element is first unpinned
    offset : 60,
    // scroll tolerance in px before state changes
    tolerance : 0,
    // or you can specify tolerance individually for up/down scroll
    tolerance : {
        up : 0,
        down : 25
    }
  });

});
