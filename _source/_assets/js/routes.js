// ROUTES
avenueApp.config(function ($routeProvider) {

    $routeProvider

    .when('/', {
        templateUrl: 'pages/index.html',
        controller: 'indexController'
    })

    .when('/about', {
        templateUrl: 'pages/about.html',
        controller: 'aboutController'
    })

    .when('/how', {
        templateUrl: 'pages/how.html',
        controller: 'howController'
    })

    .when('/fast-track', {
        templateUrl: 'pages/fast-track.html',
        controller: 'howController'
    })
});
