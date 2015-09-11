$(document).ready(function(){

  var marqueeSlider = $('#marquee-slider').royalSlider({
    addActiveClass: true,
    autoScaleSlider: true,
    loop: true,
    imageScaleMode: 'fill',
    fadeinLoadedSlide: false,
    keyboardNavEnabled: true
  }).data('royalSlider');


  var solutionsSlider = $('#solutions-slider').royalSlider({
    addActiveClass: true,
    autoScaleSlider: true,
    loop: true,
    imageScaleMode: 'fill',
    fadeinLoadedSlide: false,
    keyboardNavEnabled: true
  }).data('royalSlider');

});
