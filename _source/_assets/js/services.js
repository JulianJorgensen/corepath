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

  this.updateAnswers = function(question, answer) {
    questions[question-1] = answer;
  }

  this.currentAnswer = function() {
    return mode(questions);
  }

  this.currentAnswerFull = function() {
    return responseStrings[mode(questions)];
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
    s.appendChild(scriptTag);

    return {
      skrollr: function() { return defer.promise; }
    };

  }
]);
