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


// BUTTONS CONTROLLER
avenueApp.controller('choicesController', ['$scope', function ($scope){
  this.selectChoice = function (setChoice){
  	this.choice = setChoice;
  };
  this.isSelected = function(checkChoice) {
  	return this.choice === checkChoice;
  };
  this.anyIsSelected = function() {
    return (this.choice === 1 || this.choice === 2 || this.choice === 3);
  };
}]);


avenueApp.controller('buttonSelector', ['$scope', function($scope) {

}]);


// ABOUT CONTROLLER
avenueApp.controller('aboutController', ['$scope', function($scope) {

}]);


// HOW CONTROLLER
avenueApp.controller('howController', ['$scope', function($scope) {

}]);
