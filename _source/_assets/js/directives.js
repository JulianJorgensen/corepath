// CHOICES BUTTONS DIRECTIVE
// ============================
avenueApp.directive('choices', function() {
    return {
        restrict: 'E',
        scope: {
            defaultImage: '@',
            question: '@',
            questionId: '@',
            first: '@',
            firstDescription: '@',
            firstImage: '@',
            firstIcon: '@',
            firstThumb: '@',
            second: '@',
            secondDescription: '@',
            secondImage: '@',
            secondIcon: '@',
            secondThumb: '@',
            third: '@',
            thirdDescription: '@',
            thirdImage: '@',
            thirdIcon: '@',
            thirdThumb: '@',
            activateContent: '@',
            template: '@',
            align: '@',
            currentImage: '@',
            choicesColor: '@',
            bleed: '@'
        },
        templateUrl: function(elem,attrs) {
          if (attrs.templateUrl){
            return 'pages/templates/' + attrs.templateUrl + '.html';
          }else{
            return 'pages/templates/choices-horizontal.html';
          }
        },
        link: function(scope, element, attrs) {
          scope.currentImage = scope.defaultImage;
        },
        controller: function($scope, skrollrService, styleResponseCalculator) {
            $scope.selectChoice = function (setChoice){
                $scope.choice = setChoice;

                // change the image accordingly
                if (setChoice == '1'){
                  $scope.currentImage = $scope.firstImage;

                  // update answer
                  styleResponseCalculator.updateAnswers($scope.questionId, 'a');

                }else if (setChoice == '2'){
                  $scope.currentImage = $scope.secondImage;

                  // update answer
                  styleResponseCalculator.updateAnswers($scope.questionId, 'b');

                }else{
                  $scope.currentImage = $scope.thirdImage;

                  // update answer
                  styleResponseCalculator.updateAnswers($scope.questionId, 'c');
                }

                if ($($scope.activateContent).hasClass('hide')){
                  $($scope.activateContent).show();

                  skrollrService.skrollr().then(function(skrollr){
                    skrollr.refresh();
                  });
                }
            };
            $scope.isSelected = function(checkChoice) {
                return $scope.choice === checkChoice;
            };
            $scope.anyIsSelected = function() {
                return ($scope.choice === 1 || $scope.choice === 2 || $scope.choice === 3);
            };
        }
    };
});


// choices buttons directive
avenueApp.directive('choicesButtons', function() {
  return {
    restrict: 'E',
    templateUrl: 'pages/templates/choices-buttons.html'
  }
});



// skrollr service
avenueApp.directive('skrollr', ['skrollrService', function(skrollrService) {
  return {
    link: function(scope, element, attrs){
      skrollrService.skrollr().then(function(skrollr){
        skrollr.refresh();
      });
    }
  };
}]);
