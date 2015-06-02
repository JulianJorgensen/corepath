// CHOICES BUTTONS DIRECTIVE
// ============================
avenueApp.directive('choices', function() {
    return {
        restrict: 'E',
        scope: {
            question: '@',
            first: '@',
            firstDescription: '@',
            firstImage: '@',
            second: '@',
            secondDescription: '@',
            secondImage: '@',
            third: '@',
            thirdDescription: '@',
            thirdImage: '@',
            activateContent: '@',
            template: '@',
            align: '@',
            currentImage: '@',
            marqueeBleed: '@',
            choicesColor: '@'
        },
        templateUrl: function(elem,attrs) {
          if (attrs.templateUrl){
            return 'pages/templates/' + attrs.templateUrl + '.html';
          }else{
            return 'pages/templates/choices-horizontal.html';
          }
        },
        link: function(scope, element, attrs){
          scope.currentImage = scope.firstImage;
        },
        controller: function($scope) {
            $scope.selectChoice = function (setChoice){
                this.choice = setChoice;

                // change the image accordingly
                if (setChoice == '1'){
                  this.currentImage = this.firstImage;
                }else if (setChoice == '2'){
                  this.currentImage = this.secondImage;
                }else{
                  this.currentImage = this.thirdImage;
                }

                if ($(this.activateContent).hasClass('hide')){
                    $(this.activateContent).show();
                }
            };
            $scope.isSelected = function(checkChoice) {
                return this.choice === checkChoice;
            };
            $scope.anyIsSelected = function() {
                return (this.choice === 1 || this.choice === 2 || this.choice === 3);
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
