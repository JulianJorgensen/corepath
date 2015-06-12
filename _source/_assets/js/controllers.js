// MAIN CONTROLLER
avenueApp.controller('mainController', ['$scope', 'pageInfo', function($scope, pageInfo) {
  $scope.pageInfo = pageInfo.info;
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
  pageInfo.info.updateName('how');
}]);


// INTAKE CONTROLLER
avenueApp.controller('intakeController', ['$scope', 'pageInfo', function($scope, pageInfo) {
  pageInfo.info.updateName('intake');
}]);
