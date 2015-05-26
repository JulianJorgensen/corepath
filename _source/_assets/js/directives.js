// CHOICES BUTTONS DIRECTIVE
// ============================
avenueApp.directive('choices', function() {
    return {
        restrict: 'E',
        templateUrl: '/pages/templates/choices.html',
        scope: {
            first: '@',
            firstDescription: '@',
            second: '@',
            secondDescription: '@',
            third: '@',
            thirdDescription: '@',
            activateContent: '@'
        },
        controller: function($scope) {
            $scope.selectChoice = function (setChoice){
                this.choice = setChoice;
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
