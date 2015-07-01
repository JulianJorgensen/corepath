// MAIN CONTROLLER
avenueApp.controller('mainController', ['$scope', 'pageInfo', 'skrollrService', 'styleResponseCalculator', function($scope, pageInfo, skrollrService, styleResponseCalculator) {
  $scope.pageInfo = pageInfo.info;

  // contact pull down
  $scope.contactActivated = false;

  $scope.toggleContact = function() {
    $scope.contactActivated = $scope.contactActivated === false ? true: false;
  };

  // answer response calculator
  $scope.$watch(function () {
    return styleResponseCalculator.currentAnswer();
  }, function(newVal, oldVal) {
    $scope.answer = newVal;
    $scope.answerFull = styleResponseCalculator.currentAnswerFull();
    $scope.answerDescription = styleResponseCalculator.currentAnswerDescription();
  }, true);


  // on page change
  $scope.$on("$routeChangeSuccess", function (newRoute, oldRoute) {

    // deactivate contact pulldown
    $scope.contactActivated = false;

    // refresh skrollr
    skrollrService.skrollr().then(function(skrollr){
      skrollr.refresh();
    });
  })

}]);


// INDEX CONTROLLER
avenueApp.controller('indexController', ['$scope', 'pageInfo', function($scope, pageInfo) {

  pageInfo.info.updateName('index');

  // cta links (divs that are clickable)
  $('[data-href]').click(function(e){
    var href = $(this).attr('data-href');
    window.location.href = href;
  });

}]);



// MARQUEE CONTROLLER
avenueApp.controller('marqueeAccordionCtrl', ['$scope', function($scope) {
  $scope.oneAtATime = true;
}]);

// TABS CONTROLLER
avenueApp.controller('tabsController', ['$scope', function ($scope){
  this.tab = 1;

  this.selectTab = function (setTab){
  	this.tab = setTab;
  };
  this.isSelected = function(checkTab){
  	return this.tab === checkTab;
  };
}]);


// IMAGE SELECTOR CONTROLLER
avenueApp.controller('imageController', ['$scope', '$element', function ($scope, $element){

  $scope.currImage = 1;

  $scope.setImage = function(imageNumber){
    $scope.currImage = imageNumber;
    $scope.currImageElement = $element.find('.images-grid li:nth-child(' + (imageNumber) + ')');
    $scope.currImageSrc = $scope.currImageElement.find('img').attr('data-large-src');
    console.log(imageNumber, '.images-grid li:nth-child(' + (imageNumber) + ')', $scope.currImageElement);
  };

  $scope.setImage($scope.currImage);
}]);




// ABOUT CONTROLLER
avenueApp.controller('aboutController', ['$scope', 'pageInfo', function($scope, pageInfo) {
  pageInfo.info.updateName('about');
}]);


// HOW CONTROLLER
avenueApp.controller('howController', ['$scope', 'pageInfo', function($scope, pageInfo) {
  window.scrollTo(0, 0);

  pageInfo.info.updateName('how');
}]);


// INTAKE CONTROLLER
avenueApp.controller('intakeController', ['$scope', 'pageInfo', '$http', 'styleResponseCalculator', function($scope, pageInfo, $http, styleResponseCalculator) {
  window.scrollTo(0, 0);
  $http.get('https://avenue-spaces.herokuapp.com/'); // Ping the server to wake up Heroku.

  pageInfo.info.updateName('intake');

  $scope.lifestyle = {};
  $scope.place = {};
  $scope.project = {};
  $scope.contact = {};


  $scope.isInvalid = function(field){
    return ($scope.intakeForm[field].$invalid && $scope.intakeForm[field].blur && $scope.intakeForm[field].$dirty) || $scope.validated;
  };

  $scope.validateInput = function(field){
    $scope.intakeForm[field].blur = true;
  };

  $scope.validateForm = function(newUrl){
    if (!$scope.intakeForm.$invalid){
      window.location.href = newUrl;
    }else{
      $scope.validated = true;
    }
  }

  $scope.formSubmitted = false;
  $scope.formSuccess = false;
  $scope.formFailure = false;

  $scope.sendForm = function() {
    var params = {
      lifestyle: $scope.lifestyle,
      place: $scope.place,
      project: $scope.project,
      contact: $scope.contact,
    }
    if ($scope.answer) {
      params.quiz_answer = styleResponseCalculator.currentAnswerFull();
      params.quiz_answers = styleResponseCalculator.getAnswers();
    }
    $http.post('https://avenue-spaces.herokuapp.com/email', params).
    success(function(data, status, headers, config) {
      $scope.formSubmitted = true;
      $scope.formSuccess = true;
    }).
    error(function(data, status, headers, config) {
      $scope.formSubmitted = true;
      $scope.formFailure = true;
    });

  };

  $scope.resetForm = function() {
    $scope.formSubmitted = false;
  };
}]);
