// MAIN CONTROLLER
avenueApp.controller('mainController', ['$scope', 'pageInfo', 'skrollrService', 'styleResponseCalculator', function($scope, pageInfo, skrollrService, styleResponseCalculator) {
  $scope.pageInfo = pageInfo.info;


  $scope.$watch(function () {
    return styleResponseCalculator.currentAnswer();
  }, function(newVal, oldVal) {
    $scope.answer = newVal;
  }, true);


  $scope.$on("$routeChangeSuccess", function () {
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
    $scope.currImageElement = $element.find('.images-grid li:nth-child(' + (imageNumber - 1) + ')');
    $scope.currImageSrc = $scope.currImageElement.find('img').attr('data-large-src');
  };

  $scope.setImage($scope.currImage);

}]);




// ABOUT CONTROLLER
avenueApp.controller('aboutController', ['$scope', 'pageInfo', function($scope, pageInfo) {
  pageInfo.info.updateName('about');
}]);


// HOW CONTROLLER
avenueApp.controller('howController', ['$scope', 'pageInfo', function($scope, pageInfo) {
  window.scrollTo(0);

  pageInfo.info.updateName('how');
}]);


// INTAKE CONTROLLER
avenueApp.controller('intakeController', ['$scope', 'pageInfo', function($scope, pageInfo) {
  window.scrollTo(0);

  pageInfo.info.updateName('intake');

  $scope.lifestyle = {};
  $scope.place = {};
  $scope.project = {};
  $scope.contact = {};

}]);
