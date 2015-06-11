// CHOICES BUTTONS DIRECTIVE
// ============================
avenueApp.directive('choices', function() {
    return {
        restrict: 'E',
        scope: {
            defaultImage: '@',
            question: '@',
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
        link: function(scope, element, attrs){
          scope.currentImage = scope.defaultImage;
        },
        controller: function($scope) {
            $scope.selectChoice = function (setChoice){
                $scope.choice = setChoice;

                // change the image accordingly
                if (setChoice == '1'){
                  $scope.currentImage = $scope.firstImage;
                }else if (setChoice == '2'){
                  $scope.currentImage = $scope.secondImage;
                }else{
                  $scope.currentImage = $scope.thirdImage;
                }

                if ($($scope.activateContent).hasClass('hide')){
                    $($scope.activateContent).show();
                    skrollr.refresh();
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
