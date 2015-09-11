$(document).ready(function(){

  $('.nav-handle').click(function(){
    $('.nav').toggleClass('active');
  });

});


// INIT ANGULAR APP
var haztechApp = angular.module('haztechApp', ['ngRoute', 'ngAnimate']);


// HOME CONTROLLER
haztechApp.controller('homeController', function($scope) {
  var slider = $('#home-slider').royalSlider({
    addActiveClass: true,
    autoScaleSlider: true,
    loop: true,
    imageScaleMode: 'fill',
    fadeinLoadedSlide: false,
    keyboardNavEnabled: true
  }).data('royalSlider');
});
