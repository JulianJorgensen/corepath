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
var avenueApp = angular.module('avenueApp', ['ngRoute', 'ngResource', 'route-segment', 'view-segment'])

  .config(function($interpolateProvider){
    $interpolateProvider.startSymbol('{[').endSymbol(']}');
  });


avenueApp.run(function($rootScope, $location, $anchorScroll, $routeParams) {
  //when the route is changed scroll to the proper element.
  $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
    $location.hash($routeParams.scrollTo);
    $anchorScroll();
  });
});


avenueApp.factory('pageInfo', function($timeout) {
  var info = { name: 'default' };

  info.updateName = function(newName) {
    this.name = newName;
  }

  return {
    info: info
  };
});
