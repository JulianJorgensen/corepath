// CHOICES BUTTONS DIRECTIVE
// ============================
avenueApp.directive('choices', ['styleResponseCalculator', 'skrollrService', function(styleResponseCalculator, skrollrService) {
    return {
        restrict: 'E',
        scope: {
            defaultImage: '@',
            question: '@',
            questionId: '@',
            size: '@',
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
            bleed: '@',
            shape: '@'
        },
        templateUrl: function(elem,attrs) {
          if (attrs.templateUrl){
            return 'pages/templates/' + attrs.templateUrl + '.html';
          }else{
            return 'pages/templates/choices-horizontal.html';
          }
        },
        link: function(scope, elem, attrs) {

          // show default image
          elem.find('.choices-image-default').addClass('active');

          scope.selectChoice = function (choice){

              scope.choice = choice;

              // set button
              elem.find('.choices .choice').removeClass('active');
              elem.find('.choices .choice:nth-child(' + choice + ')').addClass('active');

              // update image
              elem.find('.choices-image, .choices-marquee-image, .choices-thumb-image, .choices-background-image').removeClass('active');
              elem.find('.choices-image-' + choice).addClass('active');

              // update description
              elem.find('.choice-description').removeClass('active');
              elem.find('.choice-description-' + choice).addClass('active');

              // update answer
              if (scope.choice == '1'){
                styleResponseCalculator.updateAnswers(scope.questionId, 'a');
              }else if (scope.choice == '2'){
                styleResponseCalculator.updateAnswers(scope.questionId, 'b');
              }else{
                styleResponseCalculator.updateAnswers(scope.questionId, 'c');
              }

              // show next section
              if ($(scope.activateContent).hasClass('hide')){
                $(scope.activateContent).show();

                skrollrService.skrollr().then(function(skrollr){
                  skrollr.refresh();
                });
              }
          };

        }
    };
}]);


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
