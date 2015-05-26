avenueApp.controller('marqueeAccordionCtrl', ['$scope', function($scope) {
  $scope.oneAtATime = true;
}]);


// INDEX CONTROLLER
avenueApp.controller('indexController', ['$scope', function($scope) {
}]);


// TABS CONTROLLER
avenueApp.controller('tabsController', ['$scope', function ($scope){
  this.tab = 1;

  this.selectTab = function (setTab){
  	this.tab = setTab;
  };
  this.isSelected = function(checkTab) {
  	return this.tab === checkTab;
  };
}]);


// ABOUT CONTROLLER
avenueApp.controller('aboutController', ['$scope', function($scope) {

}]);


// HOW CONTROLLER
avenueApp.controller('howController', ['$scope', function($scope) {

}]);
