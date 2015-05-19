//= require './vendor/jquery'
//= require './vendor/foundation'
//= require './vendor/placeholder'
//= require './main'




// MODULE
var avenueApp = angular.module('avenueApp', ['ngRoute', 'ngResource']);

// ROUTES
avenueApp.config(function ($routeProvider) {

    $routeProvider

    .when('/', {
        templateUrl: 'pages/home.html',
        controller: 'homeController'
    })

    .when('/forecast', {
        templateUrl: 'pages/forecast.html',
        controller: 'forecastController'
    })

});

// CONTROLLERS
avenueApp.controller('homeController', ['$scope', function($scope) {

}]);

avenueApp.controller('forecastController', ['$scope', function($scope) {

}]);
