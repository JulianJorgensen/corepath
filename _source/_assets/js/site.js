// --------------------------------------------------
// SITE.JS
// --------------------------------------------------

// SMOOTH SCROLLING
$(function() {
  $('a[href*=\\#]:not([href=\\#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});

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
  $(window).on("scroll", function(e) {
    $(".mobile-nav-content").removeClass("active");

    if ($(window).scrollTop() > 10) {
      nav.addClass("nav-fixed");
    } else {
      nav.removeClass("nav-fixed");
    }
  });

  var marqueeSlider = $('#marquee-slider').royalSlider({
    addActiveClass: true,
    autoScaleSlider: true,
    loop: true,
    imageScaleMode: 'fill',
    fadeinLoadedSlide: false,
    keyboardNavEnabled: true
  }).data('royalSlider');

});
