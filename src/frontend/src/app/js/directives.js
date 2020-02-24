"use strict";

angular.module('GLDirectives', []).
  directive('spinner', function(){
    return function(scope, element, attrs) {
      var opts = {
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent in px
        left: '50%' // Left position relative to parent in px
      }, spinner = new Spinner(opts).spin(element[0]);
  };
}).
  directive('fadeout', function(){
    return function(scope, element, attrs) {
      var fadeout_delay = 3000;

      element.mouseenter(function() {
        element.stop().animate({opacity:'100'});
      });
      element.mouseleave(function() {
        element.fadeOut(fadeout_delay);
      });

      element.fadeOut(fadeout_delay);
    };
}).
  directive('inputPrefix', [function() {
    return {
      require: 'ngModel',
      link: function(scope, elem, attrs, controller) {
        function inputPrefix(value) {
          var prefix = attrs.prefix;

          var result = prefix;

          if (value.length >= prefix.length) {
            if (value.slice(0, prefix.length) != prefix) {
              result = prefix + value;
            } else {
              result = value;
            }
          }

          controller.$setViewValue(result);
          controller.$render();

          return result;
        }

        controller.$formatters.push(inputPrefix);
        controller.$parsers.push(inputPrefix);
      }
    };
}]).
  directive('keycodevalidator', [function() {
    return {
      require: 'ngModel',
      link: function(scope, elem, attrs, ngModel) {
        ngModel.$setValidity('keycodevalidator', false);
        ngModel.$parsers.unshift(function(viewValue) {
          var result = '';
          ngModel.$setValidity('keycodevalidator', false);
          viewValue = viewValue.replace(/\D/g,'');
          while (viewValue.length > 0) {
            result += viewValue.substring(0, 4);
            if(viewValue.length >= 4) {
              if (result.length < 19) {
                result += ' ';
              }
              viewValue = viewValue.substring(4);
            } else {
              break;
            }
          }
          angular.element(elem).val(result);
          if (result.length === 19) {
            ngModel.$setValidity('keycodevalidator', true);
          }
          return result;
        });
      }
    };
}]).
  directive('creditCard', ['$filter', function($filter){
    return {
      scope: {
        "creditCard": "&"
      },
      link: function(scope, elem, attrs) {
        var svgItem = angular.element(elem)[0];
        svgItem.addEventListener("load",function() {
          var creditcard = svgItem.contentDocument.getElementById('credit_card');
          var yourname = svgItem.contentDocument.getElementById('your_name');
          var ccnumber = svgItem.contentDocument.getElementById('cc_number');
          creditcard.innerHTML =  $filter('translate')('CREDIT CARD');
          yourname.innerHTML =  $filter('translate')('YOUR NAME');
          ccnumber.innerHTML = scope.creditCard();
        });
      }
    };
}]).
 directive("fileread", [function () {
   return {
     scope: {
       fileread: "="
     },
     link: function (scope, element, attributes) {
       element.bind('click', function(){
         element.val('');
       });

       element.bind("change", function (changeEvent) {
         var reader = new FileReader();
         reader.onload = function (e) {
           scope.$apply(function () {
             scope.fileread(e.target.result);
           });
         };
         reader.readAsText(changeEvent.target.files[0]);
       });
     }
   };
}]);
