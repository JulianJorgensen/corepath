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


// initialize the angular app
var avenueApp = angular.module('avenueApp', ['ngRoute', 'ngResource'])
  .config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[').endSymbol(']}');
  });
