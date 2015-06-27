function mode(array){
  if(array.length == 0)
  	return null;
  var modeMap = {};
  var maxEl = array[0], maxCount = 1;
  for(var i = 0; i < array.length; i++) {
  	var el = array[i];
  	if(modeMap[el] == null)
  		modeMap[el] = 1;
  	else
  		modeMap[el]++;
  	if(modeMap[el] > maxCount) {
  		maxEl = el;
  		maxCount = modeMap[el];
  	}
  }
  return maxEl;
}


avenueApp.service('styleResponseCalculator', function() {

  var questions = [];
  var responseStrings = {
    a: 'Old World Charm',
    b: 'New World Glamour',
    c: 'Design Classics',
  };

  var responseDescriptionStrings = {
    a: 'You know how to relax and take time to enjoy life. Art should be an integral part of any design to satisfy your creative and/or possible eccentric side. Incorporating colour and unique items would help define you and your space. Antiques and classic furniture designs are preferred to new modern trends, making your home welcoming and comfortable.',
    b: 'You have an appreciation for the finer things in life and a good eye for design. You like elegance and simplicity and definitely prefer new furniture. Everything needs to be clean, uncluttered and perfectly organized. Neutral colours (white, grey, black, brown) form the main colour palette for your space. You prefer going out to staying in and your home is (or should be) a hot spot for after-work cocktails, dinners and weekend brunch.',
    c: 'Your demeanor is likely to be more laid back and casual (while still very professional when you need to be) and your space is designed with purpose in mind. You appreciate simplicity but would also like to add an element of fun into your space. You tend to favour neutral colours but incorporate a splash of colour here and there. Both new and old furniture pieces work for you (with a preference towards the new) and you are more likely to focus on practicality, functionality and affordability to style.',
  };

  this.updateAnswers = function(question, answer) {
    questions[question-1] = answer;
  }

  this.currentAnswer = function() {
    return mode(questions);
  }

  this.currentAnswerFull = function() {
    return responseStrings[mode(questions)];
  };

  this.currentAnswerDescription = function() {
    return responseDescriptionStrings[mode(questions)];
  };

  this.getAnswers = function() {
    return questions;
  };

});



avenueApp.service('skrollrService', ['$document', '$q', '$rootScope', '$window',
  function($document, $q, $rootScope, $window){
    var defer = $q.defer();

    function onScriptLoad() {
      // Load client in the browser
      $rootScope.$apply(function() {
        var s = $window.skrollr.init({
          forceHeight: false
        });
        defer.resolve(s);
      });
    }

    // Create a script tag with skrollr as the source
    // and call our onScriptLoad callback when it
    // has been loaded

    var scriptTag = $document[0].createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.src = 'https://cdnjs.cloudflare.com/ajax/libs/skrollr/0.6.29/skrollr.min.js';

    scriptTag.onreadystatechange = function () {
      if (this.readyState === 'complete') onScriptLoad();
    };

    scriptTag.onload = onScriptLoad;

    var s = $document[0].getElementsByTagName('body')[0];
    if (!navigator.userAgent.match(/mobile/gi)) {
      s.appendChild(scriptTag);
    }

    return {
      skrollr: function() { return defer.promise; }
    };

  }
]);
