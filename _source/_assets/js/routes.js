haztechApp.config(function($interpolateProvider){
  $interpolateProvider.startSymbol('{[').endSymbol(']}');
});

// configure our routes
haztechApp.config(function($routeProvider) {
  $routeProvider

  // HOMEPAGE
  .when('/', {
    templateUrl: '/pages/index.html',
    controller: 'homeController'
  })

  // WHO WE ARE PAGES
  .when('/who-we-are', {
    templateUrl: '/pages/who-we-are/index.html'
  })
  .when('/who-we-are/values', {
    templateUrl: '/pages/who-we-are/values.html'
  })
  .when('/who-we-are/safety', {
    templateUrl: '/pages/who-we-are/safety.html'
  })
  .when('/who-we-are/team', {
    templateUrl: '/pages/who-we-are/team.html'
  })
  .when('/who-we-are/partnerships', {
    templateUrl: '/pages/who-we-are/partnerships.html'
  })


  // WHAT WE DO PAGES
  .when('/what-we-do', {
    templateUrl: '/pages/what-we-do.html'
  })


  // CAREERS
  .when('/careers', {
    templateUrl: '/pages/careers.html'
  })

  .when('/contact', {
    templateUrl: '/pages/contact.html'
  })

  .otherwise( { redirectTo: "/" });
});


haztechApp.run(function($rootScope, $location, $animate) {
  $rootScope.$on( '$routeChangeStart', function(event, next, current) {
    // $('.nav').removeClass('active');
  });
});
