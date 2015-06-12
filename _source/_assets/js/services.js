angular.module('avenueApp', ['ngRoute', 'ngResource'])
  .service('pageName', function () {
    var name = 'default';
    getName: function() {
      return name;
    }
    
    setName: function(newName) {
      name = newName;
    }
});
