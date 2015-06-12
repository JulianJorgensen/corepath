// ROUTES
avenueApp.config(function ($routeSegmentProvider, $routeProvider) {

  $routeSegmentProvider

      .when('/', 'index')

      .when('/about', 'about')

      .when('/how', 'how')

      .when('/intake', 'intake')
      .when('/intake/lifestyle', 'intake.lifestyle')
      .when('/intake/place', 'intake.place')
      .when('/intake/project', 'intake.project')
      .when('/intake/contact', 'intake.contact')
      .when('/intake/ready', 'intake.ready')


      .segment('index', {
          templateUrl: 'pages/index.html',
          controller: 'indexController'})

      .segment('about', {
          templateUrl: 'pages/about.html',
          controller: 'aboutController'})

      .segment('how', {
          templateUrl: 'pages/how.html',
          controller: 'howController'})


      .segment('intake', {
          templateUrl: 'pages/intake.html',
          controller: 'intakeController'})

      .within()

          .segment('lifestyle', {
              default: true,
              templateUrl: 'pages/intake/lifestyle.html'})

          .segment('place', {
              templateUrl: 'pages/intake/place.html'})

          .segment('project', {
              templateUrl: 'pages/intake/project.html'})

          .segment('contact', {
              templateUrl: 'pages/intake/contact.html'})

          .segment('ready', {
              templateUrl: 'pages/intake/ready.html'})

});
