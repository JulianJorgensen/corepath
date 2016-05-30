;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return factory();
    });
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.whatInput = factory();
  }
})(this, function () {
  'use strict';

  /*
    ---------------
    variables
    ---------------
  */

  // array of actively pressed keys

  var activeKeys = [];

  // cache document.body
  var body = document.body;

  // boolean: true if touch buffer timer is running
  var buffer = false;

  // the last used input type
  var currentInput = null;

  // array of form elements that take keyboard input
  var formInputs = ['input', 'select', 'textarea'];

  // user-set flag to allow typing in form fields to be recorded
  var formTyping = body.hasAttribute('data-whatinput-formtyping');

  // mapping of events to input types
  var inputMap = {
    'keydown': 'keyboard',
    'mousedown': 'mouse',
    'mouseenter': 'mouse',
    'touchstart': 'touch',
    'pointerdown': 'pointer',
    'MSPointerDown': 'pointer'
  };

  // array of all used input types
  var inputTypes = [];

  // mapping of key codes to common name
  var keyMap = {
    9: 'tab',
    13: 'enter',
    16: 'shift',
    27: 'esc',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  // map of IE 10 pointer events
  var pointerMap = {
    2: 'touch',
    3: 'touch', // treat pen like touch
    4: 'mouse'
  };

  // touch buffer timer
  var timer;

  /*
    ---------------
    functions
    ---------------
  */

  function bufferInput(event) {
    clearTimeout(timer);

    setInput(event);

    buffer = true;
    timer = setTimeout(function () {
      buffer = false;
    }, 1000);
  }

  function immediateInput(event) {
    if (!buffer) setInput(event);
  }

  function setInput(event) {
    var eventKey = key(event);
    var eventTarget = target(event);
    var value = inputMap[event.type];
    if (value === 'pointer') value = pointerType(event);

    if (currentInput !== value) {
      if (
      // only if the user flag isn't set
      !formTyping &&

      // only if currentInput has a value
      currentInput &&

      // only if the input is `keyboard`
      value === 'keyboard' &&

      // not if the key is `TAB`
      keyMap[eventKey] !== 'tab' &&

      // only if the target is one of the elements in `formInputs`
      formInputs.indexOf(eventTarget.nodeName.toLowerCase()) >= 0) {
        // ignore keyboard typing on form elements
      } else {
          currentInput = value;
          body.setAttribute('data-whatinput', currentInput);

          if (inputTypes.indexOf(currentInput) === -1) inputTypes.push(currentInput);
        }
    }

    if (value === 'keyboard') logKeys(eventKey);
  }

  function key(event) {
    return event.keyCode ? event.keyCode : event.which;
  }

  function target(event) {
    return event.target || event.srcElement;
  }

  function pointerType(event) {
    return typeof event.pointerType === 'number' ? pointerMap[event.pointerType] : event.pointerType;
  }

  // keyboard logging
  function logKeys(eventKey) {
    if (activeKeys.indexOf(keyMap[eventKey]) === -1 && keyMap[eventKey]) activeKeys.push(keyMap[eventKey]);
  }

  function unLogKeys(event) {
    var eventKey = key(event);
    var arrayPos = activeKeys.indexOf(keyMap[eventKey]);

    if (arrayPos !== -1) activeKeys.splice(arrayPos, 1);
  }

  function bindEvents() {

    // pointer/mouse
    var mouseEvent = 'mousedown';

    if (window.PointerEvent) {
      mouseEvent = 'pointerdown';
    } else if (window.MSPointerEvent) {
      mouseEvent = 'MSPointerDown';
    }

    body.addEventListener(mouseEvent, immediateInput);
    body.addEventListener('mouseenter', immediateInput);

    // touch
    if ('ontouchstart' in window) {
      body.addEventListener('touchstart', bufferInput);
    }

    // keyboard
    body.addEventListener('keydown', immediateInput);
    document.addEventListener('keyup', unLogKeys);
  }

  /*
    ---------------
    init
     don't start script unless browser cuts the mustard,
    also passes if polyfills are used
    ---------------
  */

  if ('addEventListener' in window && Array.prototype.indexOf) {
    bindEvents();
  }

  /*
    ---------------
    api
    ---------------
  */

  return {

    // returns string: the current input type
    ask: function () {
      return currentInput;
    },

    // returns array: currently pressed keys
    keys: function () {
      return activeKeys;
    },

    // returns array: all the detected input types
    types: function () {
      return inputTypes;
    },

    // accepts string: manually set the input type
    set: setInput
  };
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Abide module.
   * @module foundation.abide
   */

  var Abide = function () {
    /**
     * Creates a new instance of Abide.
     * @class
     * @fires Abide#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Abide(element) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      _classCallCheck(this, Abide);

      this.$element = element;
      this.options = $.extend({}, Abide.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Abide');
    }

    /**
     * Initializes the Abide plugin and calls functions to get Abide functioning on load.
     * @private
     */


    _createClass(Abide, [{
      key: '_init',
      value: function _init() {
        this.$inputs = this.$element.find('input, textarea, select').not('[data-abide-ignore]');

        this._events();
      }

      /**
       * Initializes events for Abide.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        this.$element.off('.abide').on('reset.zf.abide', function () {
          _this2.resetForm();
        }).on('submit.zf.abide', function () {
          return _this2.validateForm();
        });

        if (this.options.validateOn === 'fieldChange') {
          this.$inputs.off('change.zf.abide').on('change.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }

        if (this.options.liveValidate) {
          this.$inputs.off('input.zf.abide').on('input.zf.abide', function (e) {
            _this2.validateInput($(e.target));
          });
        }
      }

      /**
       * Calls necessary functions to update Abide upon DOM change
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        this._init();
      }

      /**
       * Checks whether or not a form element has the required attribute and if it's checked or not
       * @param {Object} element - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'requiredCheck',
      value: function requiredCheck($el) {
        if (!$el.attr('required')) return true;

        var isGood = true;

        switch ($el[0].type) {
          case 'checkbox':
          case 'radio':
            isGood = $el[0].checked;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            var opt = $el.find('option:selected');
            if (!opt.length || !opt.val()) isGood = false;
            break;

          default:
            if (!$el.val() || !$el.val().length) isGood = false;
        }

        return isGood;
      }

      /**
       * Based on $el, get the first element with selector in this order:
       * 1. The element's direct sibling('s).
       * 3. The element's parent's children.
       *
       * This allows for multiple form errors per input, though if none are found, no form errors will be shown.
       *
       * @param {Object} $el - jQuery object to use as reference to find the form error selector.
       * @returns {Object} jQuery object with the selector.
       */

    }, {
      key: 'findFormError',
      value: function findFormError($el) {
        var $error = $el.siblings(this.options.formErrorSelector);

        if (!$error.length) {
          $error = $el.parent().find(this.options.formErrorSelector);
        }

        return $error;
      }

      /**
       * Get the first element in this order:
       * 2. The <label> with the attribute `[for="someInputId"]`
       * 3. The `.closest()` <label>
       *
       * @param {Object} $el - jQuery object to check for required attribute
       * @returns {Boolean} Boolean value depends on whether or not attribute is checked or empty
       */

    }, {
      key: 'findLabel',
      value: function findLabel($el) {
        var id = $el[0].id;
        var $label = this.$element.find('label[for="' + id + '"]');

        if (!$label.length) {
          return $el.closest('label');
        }

        return $label;
      }

      /**
       * Adds the CSS error class as specified by the Abide settings to the label, input, and the form
       * @param {Object} $el - jQuery object to add the class to
       */

    }, {
      key: 'addErrorClasses',
      value: function addErrorClasses($el) {
        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.addClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.addClass(this.options.formErrorClass);
        }

        $el.addClass(this.options.inputErrorClass).attr('data-invalid', '');
      }

      /**
       * Removes CSS error class as specified by the Abide settings from the label, input, and the form
       * @param {Object} $el - jQuery object to remove the class from
       */

    }, {
      key: 'removeErrorClasses',
      value: function removeErrorClasses($el) {
        var $label = this.findLabel($el);
        var $formError = this.findFormError($el);

        if ($label.length) {
          $label.removeClass(this.options.labelErrorClass);
        }

        if ($formError.length) {
          $formError.removeClass(this.options.formErrorClass);
        }

        $el.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
      }

      /**
       * Goes through a form to find inputs and proceeds to validate them in ways specific to their type
       * @fires Abide#invalid
       * @fires Abide#valid
       * @param {Object} element - jQuery object to validate, should be an HTML input
       * @returns {Boolean} goodToGo - If the input is valid or not.
       */

    }, {
      key: 'validateInput',
      value: function validateInput($el) {
        var clearRequire = this.requiredCheck($el),
            validated = false,
            customValidator = true,
            validator = $el.attr('data-validator'),
            equalTo = true;

        switch ($el[0].type) {
          case 'radio':
            validated = this.validateRadio($el.attr('name'));
            break;

          case 'checkbox':
            validated = clearRequire;
            break;

          case 'select':
          case 'select-one':
          case 'select-multiple':
            validated = clearRequire;
            break;

          default:
            validated = this.validateText($el);
        }

        if (validator) {
          customValidator = this.matchValidation($el, validator, $el.attr('required'));
        }

        if ($el.attr('data-equalto')) {
          equalTo = this.options.validators.equalTo($el);
        }

        var goodToGo = [clearRequire, validated, customValidator, equalTo].indexOf(false) === -1;
        var message = (goodToGo ? 'valid' : 'invalid') + '.zf.abide';

        this[goodToGo ? 'removeErrorClasses' : 'addErrorClasses']($el);

        /**
         * Fires when the input is done checking for validation. Event trigger is either `valid.zf.abide` or `invalid.zf.abide`
         * Trigger includes the DOM element of the input.
         * @event Abide#valid
         * @event Abide#invalid
         */
        $el.trigger(message, [$el]);

        return goodToGo;
      }

      /**
       * Goes through a form and if there are any invalid inputs, it will display the form error element
       * @returns {Boolean} noError - true if no errors were detected...
       * @fires Abide#formvalid
       * @fires Abide#forminvalid
       */

    }, {
      key: 'validateForm',
      value: function validateForm() {
        var acc = [];
        var _this = this;

        this.$inputs.each(function () {
          acc.push(_this.validateInput($(this)));
        });

        var noError = acc.indexOf(false) === -1;

        this.$element.find('[data-abide-error]').css('display', noError ? 'none' : 'block');

        /**
         * Fires when the form is finished validating. Event trigger is either `formvalid.zf.abide` or `forminvalid.zf.abide`.
         * Trigger includes the element of the form.
         * @event Abide#formvalid
         * @event Abide#forminvalid
         */
        this.$element.trigger((noError ? 'formvalid' : 'forminvalid') + '.zf.abide', [this.$element]);

        return noError;
      }

      /**
       * Determines whether or a not a text input is valid based on the pattern specified in the attribute. If no matching pattern is found, returns true.
       * @param {Object} $el - jQuery object to validate, should be a text input HTML element
       * @param {String} pattern - string value of one of the RegEx patterns in Abide.options.patterns
       * @returns {Boolean} Boolean value depends on whether or not the input value matches the pattern specified
       */

    }, {
      key: 'validateText',
      value: function validateText($el, pattern) {
        // pattern = pattern ? pattern : $el.attr('pattern') ? $el.attr('pattern') : $el.attr('type');
        pattern = pattern || $el.attr('pattern') || $el.attr('type');
        var inputText = $el.val();

        // if text, check if the pattern exists, if so, test it, if no text or no pattern, return true.
        return inputText.length ? this.options.patterns.hasOwnProperty(pattern) ? this.options.patterns[pattern].test(inputText) : pattern && pattern !== $el.attr('type') ? new RegExp(pattern).test(inputText) : true : true;
      }

      /**
       * Determines whether or a not a radio input is valid based on whether or not it is required and selected
       * @param {String} groupName - A string that specifies the name of a radio button group
       * @returns {Boolean} Boolean value depends on whether or not at least one radio input has been selected (if it's required)
       */

    }, {
      key: 'validateRadio',
      value: function validateRadio(groupName) {
        var $group = this.$element.find(':radio[name="' + groupName + '"]'),
            counter = [],
            _this = this;

        $group.each(function () {
          var rdio = $(this),
              clear = _this.requiredCheck(rdio);
          counter.push(clear);
          if (clear) _this.removeErrorClasses(rdio);
        });

        return counter.indexOf(false) === -1;
      }

      /**
       * Determines if a selected input passes a custom validation function. Multiple validations can be used, if passed to the element with `data-validator="foo bar baz"` in a space separated listed.
       * @param {Object} $el - jQuery input element.
       * @param {String} validators - a string of function names matching functions in the Abide.options.validators object.
       * @param {Boolean} required - self explanatory?
       * @returns {Boolean} - true if validations passed.
       */

    }, {
      key: 'matchValidation',
      value: function matchValidation($el, validators, required) {
        var _this3 = this;

        required = required ? true : false;

        var clear = validators.split(' ').map(function (v) {
          return _this3.options.validators[v]($el, required, $el.parent());
        });
        return clear.indexOf(false) === -1;
      }

      /**
       * Resets form inputs and styles
       * @fires Abide#formreset
       */

    }, {
      key: 'resetForm',
      value: function resetForm() {
        var $form = this.$element,
            opts = this.options;

        $('.' + opts.labelErrorClass, $form).not('small').removeClass(opts.labelErrorClass);
        $('.' + opts.inputErrorClass, $form).not('small').removeClass(opts.inputErrorClass);
        $(opts.formErrorSelector + '.' + opts.formErrorClass).removeClass(opts.formErrorClass);
        $form.find('[data-abide-error]').css('display', 'none');
        $(':input', $form).not(':button, :submit, :reset, :hidden, [data-abide-ignore]').val('').removeAttr('data-invalid');
        /**
         * Fires when the form has been reset.
         * @event Abide#formreset
         */
        $form.trigger('formreset.zf.abide', [$form]);
      }

      /**
       * Destroys an instance of Abide.
       * Removes error styles and classes from elements, without resetting their values.
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        var _this = this;
        this.$element.off('.abide').find('[data-abide-error]').css('display', 'none');

        this.$inputs.off('.abide').each(function () {
          _this.removeErrorClasses($(this));
        });

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Abide;
  }();

  /**
   * Default settings for plugin
   */


  Abide.defaults = {
    /**
     * The default event to validate inputs. Checkboxes and radios validate immediately.
     * Remove or change this value for manual validation.
     * @option
     * @example 'fieldChange'
     */
    validateOn: 'fieldChange',

    /**
     * Class to be applied to input labels on failed validation.
     * @option
     * @example 'is-invalid-label'
     */
    labelErrorClass: 'is-invalid-label',

    /**
     * Class to be applied to inputs on failed validation.
     * @option
     * @example 'is-invalid-input'
     */
    inputErrorClass: 'is-invalid-input',

    /**
     * Class selector to use to target Form Errors for show/hide.
     * @option
     * @example '.form-error'
     */
    formErrorSelector: '.form-error',

    /**
     * Class added to Form Errors on failed validation.
     * @option
     * @example 'is-visible'
     */
    formErrorClass: 'is-visible',

    /**
     * Set to true to validate text inputs on any value change.
     * @option
     * @example false
     */
    liveValidate: false,

    patterns: {
      alpha: /^[a-zA-Z]+$/,
      alpha_numeric: /^[a-zA-Z0-9]+$/,
      integer: /^[-+]?\d+$/,
      number: /^[-+]?\d*(?:[\.\,]\d+)?$/,

      // amex, visa, diners
      card: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/,
      cvv: /^([0-9]){3,4}$/,

      // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
      email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

      url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
      // abc.de
      domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8}$/,

      datetime: /^([0-2][0-9]{3})\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
      // YYYY-MM-DD
      date: /(?:19|20)[0-9]{2}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
      // HH:MM:SS
      time: /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2}$/,
      dateISO: /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/,
      // MM/DD/YYYY
      month_day_year: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4}$/,
      // DD/MM/YYYY
      day_month_year: /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4}$/,

      // #FFF or #FFFFFF
      color: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    },

    /**
     * Optional validation functions to be used. `equalTo` being the only default included function.
     * Functions should return only a boolean if the input is valid or not. Functions are given the following arguments:
     * el : The jQuery element to validate.
     * required : Boolean value of the required attribute be present or not.
     * parent : The direct parent of the input.
     * @option
     */
    validators: {
      equalTo: function (el, required, parent) {
        return $('#' + el.attr('data-equalto')).val() === el.val();
      }
    }
  };

  // Window exports
  Foundation.plugin(Abide, 'Abide');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Accordion module.
   * @module foundation.accordion
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   */

  var Accordion = function () {
    /**
     * Creates a new instance of an accordion.
     * @class
     * @fires Accordion#init
     * @param {jQuery} element - jQuery object to make into an accordion.
     * @param {Object} options - a plain object with settings to override the default options.
     */

    function Accordion(element, options) {
      _classCallCheck(this, Accordion);

      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */


    _createClass(Accordion, [{
      key: '_init',
      value: function _init() {
        this.$element.attr('role', 'tablist');
        this.$tabs = this.$element.children('li');
        if (this.$tabs.length === 0) {
          this.$tabs = this.$element.children('[data-accordion-item]');
        }
        this.$tabs.each(function (idx, el) {

          var $el = $(el),
              $content = $el.find('[data-tab-content]'),
              id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
              linkId = el.id || id + '-label';

          $el.find('a:first').attr({
            'aria-controls': id,
            'role': 'tab',
            'id': linkId,
            'aria-expanded': false,
            'aria-selected': false
          });
          $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
        });
        var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
        if ($initActive.length) {
          this.down($initActive, true);
        }
        this._events();
      }

      /**
       * Adds event handlers for items within the accordion.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$tabs.each(function () {
          var $elem = $(this);
          var $tabContent = $elem.children('[data-tab-content]');
          if ($tabContent.length) {
            $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
              // $(this).children('a').on('click.zf.accordion', function(e) {
              e.preventDefault();
              if ($elem.hasClass('is-active')) {
                if (_this.options.allowAllClosed || $elem.siblings().hasClass('is-active')) {
                  _this.up($tabContent);
                }
              } else {
                _this.down($tabContent);
              }
            }).on('keydown.zf.accordion', function (e) {
              Foundation.Keyboard.handleKey(e, 'Accordion', {
                toggle: function () {
                  _this.toggle($tabContent);
                },
                next: function () {
                  $elem.next().find('a').focus().trigger('click.zf.accordion');
                },
                previous: function () {
                  $elem.prev().find('a').focus().trigger('click.zf.accordion');
                },
                handled: function () {
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            });
          }
        });
      }

      /**
       * Toggles the selected content pane's open/close state.
       * @param {jQuery} $target - jQuery object of the pane to toggle.
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if ($target.parent().hasClass('is-active')) {
          if (this.options.allowAllClosed || $target.parent().siblings().hasClass('is-active')) {
            this.up($target);
          } else {
            return;
          }
        } else {
          this.down($target);
        }
      }

      /**
       * Opens the accordion tab defined by `$target`.
       * @param {jQuery} $target - Accordion pane to open.
       * @param {Boolean} firstTime - flag to determine if reflow should happen.
       * @fires Accordion#down
       * @function
       */

    }, {
      key: 'down',
      value: function down($target, firstTime) {
        var _this = this;
        if (!this.options.multiExpand && !firstTime) {
          var $currentActive = this.$element.find('.is-active').children('[data-tab-content]');
          if ($currentActive.length) {
            this.up($currentActive);
          }
        }

        $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

        // Foundation.Move(_this.options.slideSpeed, $target, function(){
        $target.slideDown(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done opening.
           * @event Accordion#down
           */
          _this.$element.trigger('down.zf.accordion', [$target]);
        });
        // });

        // if(!firstTime){
        //   Foundation._reflow(this.$element.attr('data-accordion'));
        // }
        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': true,
          'aria-selected': true
        });
      }

      /**
       * Closes the tab defined by `$target`.
       * @param {jQuery} $target - Accordion tab to close.
       * @fires Accordion#up
       * @function
       */

    }, {
      key: 'up',
      value: function up($target) {
        var $aunts = $target.parent().siblings(),
            _this = this;
        var canClose = this.options.multiExpand ? $aunts.hasClass('is-active') : $target.parent().hasClass('is-active');

        if (!this.options.allowAllClosed && !canClose) {
          return;
        }

        // Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done collapsing up.
           * @event Accordion#up
           */
          _this.$element.trigger('up.zf.accordion', [$target]);
        });
        // });

        $target.attr('aria-hidden', true).parent().removeClass('is-active');

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': false,
          'aria-selected': false
        });
      }

      /**
       * Destroys an instance of an accordion.
       * @fires Accordion#destroyed
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-tab-content]').slideUp(0).css('display', '');
        this.$element.find('a').off('.zf.accordion');

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Accordion;
  }();

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @example 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @example false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @example false
     */
    allowAllClosed: false
  };

  // Window exports
  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Reveal module.
   * @module foundation.reveal
   * @requires foundation.util.keyboard
   * @requires foundation.util.box
   * @requires foundation.util.triggers
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.motion if using animations
   */

  var Reveal = function () {
    /**
     * Creates a new instance of Reveal.
     * @class
     * @param {jQuery} element - jQuery object to use for the modal.
     * @param {Object} options - optional parameters.
     */

    function Reveal(element, options) {
      _classCallCheck(this, Reveal);

      this.$element = element;
      this.options = $.extend({}, Reveal.defaults, this.$element.data(), options);
      this._init();

      Foundation.registerPlugin(this, 'Reveal');
      Foundation.Keyboard.register('Reveal', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ESCAPE': 'close',
        'TAB': 'tab_forward',
        'SHIFT_TAB': 'tab_backward'
      });
    }

    /**
     * Initializes the modal by adding the overlay and close buttons, (if selected).
     * @private
     */


    _createClass(Reveal, [{
      key: '_init',
      value: function _init() {
        this.id = this.$element.attr('id');
        this.isActive = false;
        this.cached = { mq: Foundation.MediaQuery.current };
        this.isiOS = iPhoneSniff();

        if (this.isiOS) {
          this.$element.addClass('is-ios');
        }

        this.$anchor = $('[data-open="' + this.id + '"]').length ? $('[data-open="' + this.id + '"]') : $('[data-toggle="' + this.id + '"]');

        if (this.$anchor.length) {
          var anchorId = this.$anchor[0].id || Foundation.GetYoDigits(6, 'reveal');

          this.$anchor.attr({
            'aria-controls': this.id,
            'id': anchorId,
            'aria-haspopup': true,
            'tabindex': 0
          });
          this.$element.attr({ 'aria-labelledby': anchorId });
        }

        if (this.options.fullScreen || this.$element.hasClass('full')) {
          this.options.fullScreen = true;
          this.options.overlay = false;
        }
        if (this.options.overlay && !this.$overlay) {
          this.$overlay = this._makeOverlay(this.id);
        }

        this.$element.attr({
          'role': 'dialog',
          'aria-hidden': true,
          'data-yeti-box': this.id,
          'data-resize': this.id
        });

        if (this.$overlay) {
          this.$element.detach().appendTo(this.$overlay);
        } else {
          this.$element.detach().appendTo($('body'));
          this.$element.addClass('without-overlay');
        }
        this._events();
        if (this.options.deepLink && window.location.hash === '#' + this.id) {
          $(window).one('load.zf.reveal', this.open.bind(this));
        }
      }

      /**
       * Creates an overlay div to display behind the modal.
       * @private
       */

    }, {
      key: '_makeOverlay',
      value: function _makeOverlay(id) {
        var $overlay = $('<div></div>').addClass('reveal-overlay').attr({ 'tabindex': -1, 'aria-hidden': true }).appendTo('body');
        return $overlay;
      }

      /**
       * Updates position of modal
       * TODO:  Figure out if we actually need to cache these values or if it doesn't matter
       * @private
       */

    }, {
      key: '_updatePosition',
      value: function _updatePosition() {
        var width = this.$element.outerWidth();
        var outerWidth = $(window).width();
        var height = this.$element.outerHeight();
        var outerHeight = $(window).height();
        var left = parseInt((outerWidth - width) / 2, 10);
        var top;
        if (height > outerHeight) {
          top = parseInt(Math.min(100, outerHeight / 10), 10);
        } else {
          top = parseInt((outerHeight - height) / 4, 10);
        }
        this.$element.css({ top: top + 'px' });
        // only worry about left if we don't have an overlay, otherwise we're perfectly in the middle
        if (!this.$overlay) {
          this.$element.css({ left: left + 'px' });
        }
      }

      /**
       * Adds event handlers for the modal.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$element.on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'resizeme.zf.trigger': function () {
            _this._updatePosition();
          }
        });

        if (this.$anchor.length) {
          this.$anchor.on('keydown.zf.reveal', function (e) {
            if (e.which === 13 || e.which === 32) {
              e.stopPropagation();
              e.preventDefault();
              _this.open();
            }
          });
        }

        if (this.options.closeOnClick && this.options.overlay) {
          this.$overlay.off('.zf.reveal').on('click.zf.reveal', function (e) {
            if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {
              return;
            }
            _this.close();
          });
        }
        if (this.options.deepLink) {
          $(window).on('popstate.zf.reveal:' + this.id, this._handleState.bind(this));
        }
      }

      /**
       * Handles modal methods on back/forward button clicks or any other event that triggers popstate.
       * @private
       */

    }, {
      key: '_handleState',
      value: function _handleState(e) {
        if (window.location.hash === '#' + this.id && !this.isActive) {
          this.open();
        } else {
          this.close();
        }
      }

      /**
       * Opens the modal controlled by `this.$anchor`, and closes all others by default.
       * @function
       * @fires Reveal#closeme
       * @fires Reveal#open
       */

    }, {
      key: 'open',
      value: function open() {
        var _this2 = this;

        if (this.options.deepLink) {
          var hash = '#' + this.id;

          if (window.history.pushState) {
            window.history.pushState(null, null, hash);
          } else {
            window.location.hash = hash;
          }
        }

        this.isActive = true;

        // Make elements invisible, but remove display: none so we can get size and positioning
        this.$element.css({ 'visibility': 'hidden' }).show().scrollTop(0);
        if (this.options.overlay) {
          this.$overlay.css({ 'visibility': 'hidden' }).show();
        }

        this._updatePosition();

        this.$element.hide().css({ 'visibility': '' });

        if (this.$overlay) {
          this.$overlay.css({ 'visibility': '' }).hide();
        }

        if (!this.options.multipleOpened) {
          /**
           * Fires immediately before the modal opens.
           * Closes any other modals that are currently open
           * @event Reveal#closeme
           */
          this.$element.trigger('closeme.zf.reveal', this.id);
        }

        // Motion UI method of reveal
        if (this.options.animationIn) {
          if (this.options.overlay) {
            Foundation.Motion.animateIn(this.$overlay, 'fade-in');
          }
          Foundation.Motion.animateIn(this.$element, this.options.animationIn, function () {
            this.focusableElements = Foundation.Keyboard.findFocusable(this.$element);
          });
        }
        // jQuery method of reveal
        else {
            if (this.options.overlay) {
              this.$overlay.show(0);
            }
            this.$element.show(this.options.showDelay);
          }

        // handle accessibility
        this.$element.attr({
          'aria-hidden': false,
          'tabindex': -1
        }).focus();

        /**
         * Fires when the modal has successfully opened.
         * @event Reveal#open
         */
        this.$element.trigger('open.zf.reveal');

        if (this.isiOS) {
          var scrollPos = window.pageYOffset;
          $('html, body').addClass('is-reveal-open').scrollTop(scrollPos);
        } else {
          $('body').addClass('is-reveal-open');
        }

        $('body').addClass('is-reveal-open').attr('aria-hidden', this.options.overlay || this.options.fullScreen ? true : false);

        setTimeout(function () {
          _this2._extraHandlers();
        }, 0);
      }

      /**
       * Adds extra event handlers for the body and window if necessary.
       * @private
       */

    }, {
      key: '_extraHandlers',
      value: function _extraHandlers() {
        var _this = this;
        this.focusableElements = Foundation.Keyboard.findFocusable(this.$element);

        if (!this.options.overlay && this.options.closeOnClick && !this.options.fullScreen) {
          $('body').on('click.zf.reveal', function (e) {
            if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {
              return;
            }
            _this.close();
          });
        }

        if (this.options.closeOnEsc) {
          $(window).on('keydown.zf.reveal', function (e) {
            Foundation.Keyboard.handleKey(e, 'Reveal', {
              close: function () {
                if (_this.options.closeOnEsc) {
                  _this.close();
                  _this.$anchor.focus();
                }
              }
            });
            if (_this.focusableElements.length === 0) {
              // no focusable elements inside the modal at all, prevent tabbing in general
              e.preventDefault();
            }
          });
        }

        // lock focus within modal while tabbing
        this.$element.on('keydown.zf.reveal', function (e) {
          var $target = $(this);
          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Reveal', {
            tab_forward: function () {
              if (_this.$element.find(':focus').is(_this.focusableElements.eq(-1))) {
                // left modal downwards, setting focus to first element
                _this.focusableElements.eq(0).focus();
                e.preventDefault();
              }
            },
            tab_backward: function () {
              if (_this.$element.find(':focus').is(_this.focusableElements.eq(0)) || _this.$element.is(':focus')) {
                // left modal upwards, setting focus to last element
                _this.focusableElements.eq(-1).focus();
                e.preventDefault();
              }
            },
            open: function () {
              if (_this.$element.find(':focus').is(_this.$element.find('[data-close]'))) {
                setTimeout(function () {
                  // set focus back to anchor if close button has been activated
                  _this.$anchor.focus();
                }, 1);
              } else if ($target.is(_this.focusableElements)) {
                // dont't trigger if acual element has focus (i.e. inputs, links, ...)
                _this.open();
              }
            },
            close: function () {
              if (_this.options.closeOnEsc) {
                _this.close();
                _this.$anchor.focus();
              }
            }
          });
        });
      }

      /**
       * Closes the modal.
       * @function
       * @fires Reveal#closed
       */

    }, {
      key: 'close',
      value: function close() {
        if (!this.isActive || !this.$element.is(':visible')) {
          return false;
        }
        var _this = this;

        // Motion UI method of hiding
        if (this.options.animationOut) {
          if (this.options.overlay) {
            Foundation.Motion.animateOut(this.$overlay, 'fade-out', finishUp);
          } else {
            finishUp();
          }

          Foundation.Motion.animateOut(this.$element, this.options.animationOut);
        }
        // jQuery method of hiding
        else {
            if (this.options.overlay) {
              this.$overlay.hide(0, finishUp);
            } else {
              finishUp();
            }

            this.$element.hide(this.options.hideDelay);
          }

        // Conditionals to remove extra event listeners added on open
        if (this.options.closeOnEsc) {
          $(window).off('keydown.zf.reveal');
        }

        if (!this.options.overlay && this.options.closeOnClick) {
          $('body').off('click.zf.reveal');
        }

        this.$element.off('keydown.zf.reveal');

        function finishUp() {
          if (_this.isiOS) {
            $('html, body').removeClass('is-reveal-open');
          } else {
            $('body').removeClass('is-reveal-open');
          }

          $('body').attr({
            'aria-hidden': false,
            'tabindex': ''
          });

          _this.$element.attr('aria-hidden', true);

          /**
          * Fires when the modal is done closing.
          * @event Reveal#closed
          */
          _this.$element.trigger('closed.zf.reveal');
        }

        /**
        * Resets the modal content
        * This prevents a running video to keep going in the background
        */
        if (this.options.resetOnClose) {
          this.$element.html(this.$element.html());
        }

        this.isActive = false;
        if (_this.options.deepLink) {
          if (window.history.replaceState) {
            window.history.replaceState("", document.title, window.location.pathname);
          } else {
            window.location.hash = '';
          }
        }
      }

      /**
       * Toggles the open/closed state of a modal.
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isActive) {
          this.close();
        } else {
          this.open();
        }
      }
    }, {
      key: 'destroy',


      /**
       * Destroys an instance of a modal.
       * @function
       */
      value: function destroy() {
        if (this.options.overlay) {
          this.$overlay.hide().off().remove();
        }
        this.$element.hide().off();
        this.$anchor.off('.zf');
        $(window).off('.zf.reveal:' + this.id);

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Reveal;
  }();

  Reveal.defaults = {
    /**
     * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
     * @option
     * @example 'slide-in-left'
     */
    animationIn: '',
    /**
     * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
     * @option
     * @example 'slide-out-right'
     */
    animationOut: '',
    /**
     * Time, in ms, to delay the opening of a modal after a click if no animation used.
     * @option
     * @example 10
     */
    showDelay: 0,
    /**
     * Time, in ms, to delay the closing of a modal after a click if no animation used.
     * @option
     * @example 10
     */
    hideDelay: 0,
    /**
     * Allows a click on the body/overlay to close the modal.
     * @option
     * @example true
     */
    closeOnClick: true,
    /**
     * Allows the modal to close if the user presses the `ESCAPE` key.
     * @option
     * @example true
     */
    closeOnEsc: true,
    /**
     * If true, allows multiple modals to be displayed at once.
     * @option
     * @example false
     */
    multipleOpened: false,
    /**
     * Distance, in pixels, the modal should push down from the top of the screen.
     * @option
     * @example 100
     */
    vOffset: 100,
    /**
     * Distance, in pixels, the modal should push in from the side of the screen.
     * @option
     * @example 0
     */
    hOffset: 0,
    /**
     * Allows the modal to be fullscreen, completely blocking out the rest of the view. JS checks for this as well.
     * @option
     * @example false
     */
    fullScreen: false,
    /**
     * Percentage of screen height the modal should push up from the bottom of the view.
     * @option
     * @example 10
     */
    btmOffsetPct: 10,
    /**
     * Allows the modal to generate an overlay div, which will cover the view when modal opens.
     * @option
     * @example true
     */
    overlay: true,
    /**
     * Allows the modal to remove and reinject markup on close. Should be true if using video elements w/o using provider's api, otherwise, videos will continue to play in the background.
     * @option
     * @example false
     */
    resetOnClose: false,
    /**
     * Allows the modal to alter the url on open/close, and allows the use of the `back` button to close modals. ALSO, allows a modal to auto-maniacally open on page load IF the hash === the modal's user-set id.
     * @option
     * @example false
     */
    deepLink: false
  };

  // Window exports
  Foundation.plugin(Reveal, 'Reveal');

  function iPhoneSniff() {
    return (/iP(ad|hone|od).*OS/.test(window.navigator.userAgent)
    );
  }
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tabs module.
   * @module foundation.tabs
   * @requires foundation.util.keyboard
   * @requires foundation.util.timerAndImageLoader if tabs contain images
   */

  var Tabs = function () {
    /**
     * Creates a new instance of tabs.
     * @class
     * @fires Tabs#init
     * @param {jQuery} element - jQuery object to make into tabs.
     * @param {Object} options - Overrides to the default plugin settings.
     */

    function Tabs(element, options) {
      _classCallCheck(this, Tabs);

      this.$element = element;
      this.options = $.extend({}, Tabs.defaults, this.$element.data(), options);

      this._init();
      Foundation.registerPlugin(this, 'Tabs');
      Foundation.Keyboard.register('Tabs', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'previous',
        'ARROW_DOWN': 'next',
        'ARROW_LEFT': 'previous'
        // 'TAB': 'next',
        // 'SHIFT_TAB': 'previous'
      });
    }

    /**
     * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
     * @private
     */


    _createClass(Tabs, [{
      key: '_init',
      value: function _init() {
        var _this = this;

        this.$tabTitles = this.$element.find('.' + this.options.linkClass);
        this.$tabContent = $('[data-tabs-content="' + this.$element[0].id + '"]');

        this.$tabTitles.each(function () {
          var $elem = $(this),
              $link = $elem.find('a'),
              isActive = $elem.hasClass('is-active'),
              hash = $link[0].hash.slice(1),
              linkId = $link[0].id ? $link[0].id : hash + '-label',
              $tabContent = $('#' + hash);

          $elem.attr({ 'role': 'presentation' });

          $link.attr({
            'role': 'tab',
            'aria-controls': hash,
            'aria-selected': isActive,
            'id': linkId
          });

          $tabContent.attr({
            'role': 'tabpanel',
            'aria-hidden': !isActive,
            'aria-labelledby': linkId
          });

          if (isActive && _this.options.autoFocus) {
            $link.focus();
          }
        });

        if (this.options.matchHeight) {
          var $images = this.$tabContent.find('img');

          if ($images.length) {
            Foundation.onImagesLoaded($images, this._setHeight.bind(this));
          } else {
            this._setHeight();
          }
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this._addKeyHandler();
        this._addClickHandler();

        if (this.options.matchHeight) {
          $(window).on('changed.zf.mediaquery', this._setHeight.bind(this));
        }
      }

      /**
       * Adds click handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addClickHandler',
      value: function _addClickHandler() {
        var _this = this;

        this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e) {
          e.preventDefault();
          e.stopPropagation();
          if ($(this).hasClass('is-active')) {
            return;
          }
          _this._handleTabChange($(this));
        });
      }

      /**
       * Adds keyboard event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addKeyHandler',
      value: function _addKeyHandler() {
        var _this = this;
        var $firstTab = _this.$element.find('li:first-of-type');
        var $lastTab = _this.$element.find('li:last-of-type');

        this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e) {
          if (e.which === 9) return;
          e.stopPropagation();
          e.preventDefault();

          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              if (_this.options.wrapOnKeys) {
                $prevElement = i === 0 ? $elements.last() : $elements.eq(i - 1);
                $nextElement = i === $elements.length - 1 ? $elements.first() : $elements.eq(i + 1);
              } else {
                $prevElement = $elements.eq(Math.max(0, i - 1));
                $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              }
              return;
            }
          });

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Tabs', {
            open: function () {
              $element.find('[role="tab"]').focus();
              _this._handleTabChange($element);
            },
            previous: function () {
              $prevElement.find('[role="tab"]').focus();
              _this._handleTabChange($prevElement);
            },
            next: function () {
              $nextElement.find('[role="tab"]').focus();
              _this._handleTabChange($nextElement);
            }
          });
        });
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to open.
       * @fires Tabs#change
       * @function
       */

    }, {
      key: '_handleTabChange',
      value: function _handleTabChange($target) {
        var $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash),
            $oldTab = this.$element.find('.' + this.options.linkClass + '.is-active').removeClass('is-active').find('[role="tab"]').attr({ 'aria-selected': 'false' });

        $('#' + $oldTab.attr('aria-controls')).removeClass('is-active').attr({ 'aria-hidden': 'true' });

        $target.addClass('is-active');

        $tabLink.attr({ 'aria-selected': 'true' });

        $targetContent.addClass('is-active').attr({ 'aria-hidden': 'false' });

        /**
         * Fires when the plugin has successfully changed tabs.
         * @event Tabs#change
         */
        this.$element.trigger('change.zf.tabs', [$target]);
      }

      /**
       * Public method for selecting a content pane to display.
       * @param {jQuery | String} elem - jQuery object or string of the id of the pane to display.
       * @function
       */

    }, {
      key: 'selectTab',
      value: function selectTab(elem) {
        var idStr;

        if (typeof elem === 'object') {
          idStr = elem[0].id;
        } else {
          idStr = elem;
        }

        if (idStr.indexOf('#') < 0) {
          idStr = '#' + idStr;
        }

        var $target = this.$tabTitles.find('[href="' + idStr + '"]').parent('.' + this.options.linkClass);

        this._handleTabChange($target);
      }
    }, {
      key: '_setHeight',

      /**
       * Sets the height of each panel to the height of the tallest panel.
       * If enabled in options, gets called on media query change.
       * If loading content via external source, can be called directly or with _reflow.
       * @function
       * @private
       */
      value: function _setHeight() {
        var max = 0;
        this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function () {
          var panel = $(this),
              isActive = panel.hasClass('is-active');

          if (!isActive) {
            panel.css({ 'visibility': 'hidden', 'display': 'block' });
          }

          var temp = this.getBoundingClientRect().height;

          if (!isActive) {
            panel.css({
              'visibility': '',
              'display': ''
            });
          }

          max = temp > max ? temp : max;
        }).css('height', max + 'px');
      }

      /**
       * Destroys an instance of an tabs.
       * @fires Tabs#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();

        if (this.options.matchHeight) {
          $(window).off('changed.zf.mediaquery');
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tabs;
  }();

  Tabs.defaults = {
    /**
     * Allows the window to scroll to content of active pane on load if set to true.
     * @option
     * @example false
     */
    autoFocus: false,

    /**
     * Allows keyboard input to 'wrap' around the tab links.
     * @option
     * @example true
     */
    wrapOnKeys: true,

    /**
     * Allows the tab content panes to match heights if set to true.
     * @option
     * @example false
     */
    matchHeight: false,

    /**
     * Class applied to `li`'s in tab link list.
     * @option
     * @example 'tabs-title'
     */
    linkClass: 'tabs-title',

    /**
     * Class applied to the content containers.
     * @option
     * @example 'tabs-panel'
     */
    panelClass: 'tabs-panel'
  };

  function checkClass($elem) {
    return $elem.hasClass('is-active');
  }

  // Window exports
  Foundation.plugin(Tabs, 'Tabs');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tooltip module.
   * @module foundation.tooltip
   * @requires foundation.util.box
   * @requires foundation.util.triggers
   */

  var Tooltip = function () {
    /**
     * Creates a new instance of a Tooltip.
     * @class
     * @fires Tooltip#init
     * @param {jQuery} element - jQuery object to attach a tooltip to.
     * @param {Object} options - object to extend the default configuration.
     */

    function Tooltip(element, options) {
      _classCallCheck(this, Tooltip);

      this.$element = element;
      this.options = $.extend({}, Tooltip.defaults, this.$element.data(), options);

      this.isActive = false;
      this.isClick = false;
      this._init();

      Foundation.registerPlugin(this, 'Tooltip');
    }

    /**
     * Initializes the tooltip by setting the creating the tip element, adding it's text, setting private variables and setting attributes on the anchor.
     * @private
     */


    _createClass(Tooltip, [{
      key: '_init',
      value: function _init() {
        var elemId = this.$element.attr('aria-describedby') || Foundation.GetYoDigits(6, 'tooltip');

        this.options.positionClass = this._getPositionClass(this.$element);
        this.options.tipText = this.options.tipText || this.$element.attr('title');
        this.template = this.options.template ? $(this.options.template) : this._buildTemplate(elemId);

        this.template.appendTo(document.body).text(this.options.tipText).hide();

        this.$element.attr({
          'title': '',
          'aria-describedby': elemId,
          'data-yeti-box': elemId,
          'data-toggle': elemId,
          'data-resize': elemId
        }).addClass(this.triggerClass);

        //helper variables to track movement on collisions
        this.usedPositions = [];
        this.counter = 4;
        this.classChanged = false;

        this._events();
      }

      /**
       * Grabs the current positioning class, if present, and returns the value or an empty string.
       * @private
       */

    }, {
      key: '_getPositionClass',
      value: function _getPositionClass(element) {
        if (!element) {
          return '';
        }
        // var position = element.attr('class').match(/top|left|right/g);
        var position = element[0].className.match(/\b(top|left|right)\b/g);
        position = position ? position[0] : '';
        return position;
      }
    }, {
      key: '_buildTemplate',

      /**
       * builds the tooltip element, adds attributes, and returns the template.
       * @private
       */
      value: function _buildTemplate(id) {
        var templateClasses = (this.options.tooltipClass + ' ' + this.options.positionClass + ' ' + this.options.templateClasses).trim();
        var $template = $('<div></div>').addClass(templateClasses).attr({
          'role': 'tooltip',
          'aria-hidden': true,
          'data-is-active': false,
          'data-is-focus': false,
          'id': id
        });
        return $template;
      }

      /**
       * Function that gets called if a collision event is detected.
       * @param {String} position - positioning class to try
       * @private
       */

    }, {
      key: '_reposition',
      value: function _reposition(position) {
        this.usedPositions.push(position ? position : 'bottom');

        //default, try switching to opposite side
        if (!position && this.usedPositions.indexOf('top') < 0) {
          this.template.addClass('top');
        } else if (position === 'top' && this.usedPositions.indexOf('bottom') < 0) {
          this.template.removeClass(position);
        } else if (position === 'left' && this.usedPositions.indexOf('right') < 0) {
          this.template.removeClass(position).addClass('right');
        } else if (position === 'right' && this.usedPositions.indexOf('left') < 0) {
          this.template.removeClass(position).addClass('left');
        }

        //if default change didn't work, try bottom or left first
        else if (!position && this.usedPositions.indexOf('top') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.template.addClass('left');
          } else if (position === 'top' && this.usedPositions.indexOf('bottom') > -1 && this.usedPositions.indexOf('left') < 0) {
            this.template.removeClass(position).addClass('left');
          } else if (position === 'left' && this.usedPositions.indexOf('right') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.template.removeClass(position);
          } else if (position === 'right' && this.usedPositions.indexOf('left') > -1 && this.usedPositions.indexOf('bottom') < 0) {
            this.template.removeClass(position);
          }
          //if nothing cleared, set to bottom
          else {
              this.template.removeClass(position);
            }
        this.classChanged = true;
        this.counter--;
      }

      /**
       * sets the position class of an element and recursively calls itself until there are no more possible positions to attempt, or the tooltip element is no longer colliding.
       * if the tooltip is larger than the screen width, default to full width - any user selected margin
       * @private
       */

    }, {
      key: '_setPosition',
      value: function _setPosition() {
        var position = this._getPositionClass(this.template),
            $tipDims = Foundation.Box.GetDimensions(this.template),
            $anchorDims = Foundation.Box.GetDimensions(this.$element),
            direction = position === 'left' ? 'left' : position === 'right' ? 'left' : 'top',
            param = direction === 'top' ? 'height' : 'width',
            offset = param === 'height' ? this.options.vOffset : this.options.hOffset,
            _this = this;

        if ($tipDims.width >= $tipDims.windowDims.width || !this.counter && !Foundation.Box.ImNotTouchingYou(this.template)) {
          this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            // this.$element.offset(Foundation.GetOffsets(this.template, this.$element, 'center bottom', this.options.vOffset, this.options.hOffset, true)).css({
            'width': $anchorDims.windowDims.width - this.options.hOffset * 2,
            'height': 'auto'
          });
          return false;
        }

        this.template.offset(Foundation.Box.GetOffsets(this.template, this.$element, 'center ' + (position || 'bottom'), this.options.vOffset, this.options.hOffset));

        while (!Foundation.Box.ImNotTouchingYou(this.template) && this.counter) {
          this._reposition(position);
          this._setPosition();
        }
      }

      /**
       * reveals the tooltip, and fires an event to close any other open tooltips on the page
       * @fires Tooltip#closeme
       * @fires Tooltip#show
       * @function
       */

    }, {
      key: 'show',
      value: function show() {
        if (this.options.showOn !== 'all' && !Foundation.MediaQuery.atLeast(this.options.showOn)) {
          // console.error('The screen is too small to display this tooltip');
          return false;
        }

        var _this = this;
        this.template.css('visibility', 'hidden').show();
        this._setPosition();

        /**
         * Fires to close all other open tooltips on the page
         * @event Closeme#tooltip
         */
        this.$element.trigger('closeme.zf.tooltip', this.template.attr('id'));

        this.template.attr({
          'data-is-active': true,
          'aria-hidden': false
        });
        _this.isActive = true;
        // console.log(this.template);
        this.template.stop().hide().css('visibility', '').fadeIn(this.options.fadeInDuration, function () {
          //maybe do stuff?
        });
        /**
         * Fires when the tooltip is shown
         * @event Tooltip#show
         */
        this.$element.trigger('show.zf.tooltip');
      }

      /**
       * Hides the current tooltip, and resets the positioning class if it was changed due to collision
       * @fires Tooltip#hide
       * @function
       */

    }, {
      key: 'hide',
      value: function hide() {
        // console.log('hiding', this.$element.data('yeti-box'));
        var _this = this;
        this.template.stop().attr({
          'aria-hidden': true,
          'data-is-active': false
        }).fadeOut(this.options.fadeOutDuration, function () {
          _this.isActive = false;
          _this.isClick = false;
          if (_this.classChanged) {
            _this.template.removeClass(_this._getPositionClass(_this.template)).addClass(_this.options.positionClass);

            _this.usedPositions = [];
            _this.counter = 4;
            _this.classChanged = false;
          }
        });
        /**
         * fires when the tooltip is hidden
         * @event Tooltip#hide
         */
        this.$element.trigger('hide.zf.tooltip');
      }

      /**
       * adds event listeners for the tooltip and its anchor
       * TODO combine some of the listeners like focus and mouseenter, etc.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;
        var $template = this.template;
        var isFocus = false;

        if (!this.options.disableHover) {

          this.$element.on('mouseenter.zf.tooltip', function (e) {
            if (!_this.isActive) {
              _this.timeout = setTimeout(function () {
                _this.show();
              }, _this.options.hoverDelay);
            }
          }).on('mouseleave.zf.tooltip', function (e) {
            clearTimeout(_this.timeout);
            if (!isFocus || !_this.isClick && _this.options.clickOpen) {
              _this.hide();
            }
          });
        }

        if (this.options.clickOpen) {
          this.$element.on('mousedown.zf.tooltip', function (e) {
            e.stopImmediatePropagation();
            if (_this.isClick) {
              _this.hide();
              // _this.isClick = false;
            } else {
                _this.isClick = true;
                if ((_this.options.disableHover || !_this.$element.attr('tabindex')) && !_this.isActive) {
                  _this.show();
                }
              }
          });
        }

        if (!this.options.disableForTouch) {
          this.$element.on('tap.zf.tooltip touchend.zf.tooltip', function (e) {
            _this.isActive ? _this.hide() : _this.show();
          });
        }

        this.$element.on({
          // 'toggle.zf.trigger': this.toggle.bind(this),
          // 'close.zf.trigger': this.hide.bind(this)
          'close.zf.trigger': this.hide.bind(this)
        });

        this.$element.on('focus.zf.tooltip', function (e) {
          isFocus = true;
          // console.log(_this.isClick);
          if (_this.isClick) {
            return false;
          } else {
            // $(window)
            _this.show();
          }
        }).on('focusout.zf.tooltip', function (e) {
          isFocus = false;
          _this.isClick = false;
          _this.hide();
        }).on('resizeme.zf.trigger', function () {
          if (_this.isActive) {
            _this._setPosition();
          }
        });
      }

      /**
       * adds a toggle method, in addition to the static show() & hide() functions
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle() {
        if (this.isActive) {
          this.hide();
        } else {
          this.show();
        }
      }

      /**
       * Destroys an instance of tooltip, removes template element from the view.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.attr('title', this.template.text()).off('.zf.trigger .zf.tootip')
        //  .removeClass('has-tip')
        .removeAttr('aria-describedby').removeAttr('data-yeti-box').removeAttr('data-toggle').removeAttr('data-resize');

        this.template.remove();

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tooltip;
  }();

  Tooltip.defaults = {
    disableForTouch: false,
    /**
     * Time, in ms, before a tooltip should open on hover.
     * @option
     * @example 200
     */
    hoverDelay: 200,
    /**
     * Time, in ms, a tooltip should take to fade into view.
     * @option
     * @example 150
     */
    fadeInDuration: 150,
    /**
     * Time, in ms, a tooltip should take to fade out of view.
     * @option
     * @example 150
     */
    fadeOutDuration: 150,
    /**
     * Disables hover events from opening the tooltip if set to true
     * @option
     * @example false
     */
    disableHover: false,
    /**
     * Optional addtional classes to apply to the tooltip template on init.
     * @option
     * @example 'my-cool-tip-class'
     */
    templateClasses: '',
    /**
     * Non-optional class added to tooltip templates. Foundation default is 'tooltip'.
     * @option
     * @example 'tooltip'
     */
    tooltipClass: 'tooltip',
    /**
     * Class applied to the tooltip anchor element.
     * @option
     * @example 'has-tip'
     */
    triggerClass: 'has-tip',
    /**
     * Minimum breakpoint size at which to open the tooltip.
     * @option
     * @example 'small'
     */
    showOn: 'small',
    /**
     * Custom template to be used to generate markup for tooltip.
     * @option
     * @example '&lt;div class="tooltip"&gt;&lt;/div&gt;'
     */
    template: '',
    /**
     * Text displayed in the tooltip template on open.
     * @option
     * @example 'Some cool space fact here.'
     */
    tipText: '',
    touchCloseText: 'Tap to close.',
    /**
     * Allows the tooltip to remain open if triggered with a click or touch event.
     * @option
     * @example true
     */
    clickOpen: true,
    /**
     * Additional positioning classes, set by the JS
     * @option
     * @example 'top'
     */
    positionClass: '',
    /**
     * Distance, in pixels, the template should push away from the anchor on the Y axis.
     * @option
     * @example 10
     */
    vOffset: 10,
    /**
     * Distance, in pixels, the template should push away from the anchor on the X axis, if aligned to a side.
     * @option
     * @example 12
     */
    hOffset: 12
  };

  /**
   * TODO utilize resize event trigger
   */

  // Window exports
  Foundation.plugin(Tooltip, 'Tooltip');
}(jQuery);
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function (event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();
      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;
      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function (event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
          // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
          if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
        }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled.apply();
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled.apply();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function ($element) {
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function (componentName, cmds) {
      commands[componentName] = cmds;
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
'use strict';

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function () {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        self.queries.push({
          name: key,
          value: 'only screen and (min-width: ' + namedQueries[key] + ')'
        });
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function (size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function (size) {
      for (var i in this.queries) {
        var query = this.queries[i];
        if (size === query.name) return query.value;
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function () {
      var matched;

      for (var i in this.queries) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if (typeof matched === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function () {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize();

        if (newSize !== _this.current) {
          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, _this.current]);

          // Change the current media query
          _this.current = newSize;
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function (media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function (element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function (element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    function move(ts) {
      if (!start) start = window.performance.now();
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
'use strict';

!function ($) {

  var Nest = {
    Feather: function (menu) {
      var type = arguments.length <= 1 || arguments[1] === undefined ? 'zf' : arguments[1];

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('a:first').attr('tabindex', 0);

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-expanded': false,
            'aria-label': $item.children('a:first').text()
          });

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'aria-hidden': true,
            'role': 'menu'
          });
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function (menu, type) {
      var items = menu.find('li').removeAttr('tabindex'),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('*').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        cb();
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      if (this.complete) {
        singleImageLoaded();
      } else if (typeof this.naturalWidth !== 'undefined' && this.naturalWidth > 0) {
        singleImageLoaded();
      } else {
        $(this).one('load', function () {
          singleImageLoaded();
        });
      }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
'use strict';

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function (el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    triggers($(this), 'toggle');
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).load(function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if (typeof pluginName === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function (mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);
      //trigger the event handler for the element depending on type
      switch ($target.attr("data-events")) {

        case "resize":
          $target.triggerHandler('resizeme.zf.trigger', [$target]);
          break;

        case "scroll":
          $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          break;

        // case "mutate" :
        // console.log('mutate', $target);
        // $target.triggerHandler('mutate.zf.trigger');
        //
        // //make sure we don't get stuck in an infinite loop from sloppy codeing
        // if ($target.index('[data-mutate]') == $("[data-mutate]").length-1) {
        //   domMutationObserver();
        // }
        // break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, (or coming soon mutation) add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: false, characterData: false, subtree: false, attributeFilter: ["data-events"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }
(function () {
  var a;a = jQuery, a.fn.extend({ emailProtector: function (b) {
      var c;return c = { "preserve-text": !1 }, c = a.extend(c, b), this.each(function () {
        var b, d, e, f, g;return b = a(this), d = b.attr("data-email-protector").split("|"), e = b.attr("data-email-protector-preserve-text") ? "false" !== b.attr("data-email-protector-preserve-text") : c["preserve-text"], 2 === d.length ? ((g = d[1].match(/(\?.+)/)) && (f = g[1], d[1] = d[1].substring(0, d[1].indexOf("?"))), e || b.text(d[0] + "@" + d[1]), b.attr("href", "mailto:" + d[0] + "@" + d[1] + (null != f ? f : ""))) : b.text('Invalid format. eg. <a data-email-protector="foo|bar.com"></a> will become <a href="mailto:foo@bar.com"></a>.');
      });
    } });
}).call(this);
// jQuery RoyalSlider plugin. Custom build. Copyright 2011-2015 Dmitry Semenov http://dimsemenov.com
// http://dimsemenov.com/private/home.php?build=bullets_autoplay_auto-height_active-class_visible-nearby
// jquery.royalslider v9.5.7
(function (n) {
  function v(b, f) {
    var c,
        a = this,
        e = window.navigator,
        g = e.userAgent.toLowerCase();a.uid = n.rsModules.uid++;a.ns = ".rs" + a.uid;var d = document.createElement("div").style,
        h = ["webkit", "Moz", "ms", "O"],
        k = "",
        l = 0,
        q;for (c = 0; c < h.length; c++) q = h[c], !k && q + "Transform" in d && (k = q), q = q.toLowerCase(), window.requestAnimationFrame || (window.requestAnimationFrame = window[q + "RequestAnimationFrame"], window.cancelAnimationFrame = window[q + "CancelAnimationFrame"] || window[q + "CancelRequestAnimationFrame"]);window.requestAnimationFrame || (window.requestAnimationFrame = function (a, b) {
      var c = new Date().getTime(),
          d = Math.max(0, 16 - (c - l)),
          e = window.setTimeout(function () {
        a(c + d);
      }, d);l = c + d;return e;
    });window.cancelAnimationFrame || (window.cancelAnimationFrame = function (a) {
      clearTimeout(a);
    });a.isIPAD = g.match(/(ipad)/);a.isIOS = a.isIPAD || g.match(/(iphone|ipod)/);c = function (a) {
      a = /(chrome)[ \/]([\w.]+)/.exec(a) || /(webkit)[ \/]([\w.]+)/.exec(a) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a) || /(msie) ([\w.]+)/.exec(a) || 0 > a.indexOf("compatible") && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a) || [];return { browser: a[1] || "", version: a[2] || "0" };
    }(g);h = {};c.browser && (h[c.browser] = !0, h.version = c.version);h.chrome && (h.webkit = !0);a._a = h;a.isAndroid = -1 < g.indexOf("android");a.slider = n(b);a.ev = n(a);a._b = n(document);a.st = n.extend({}, n.fn.royalSlider.defaults, f);a._c = a.st.transitionSpeed;a._d = 0;!a.st.allowCSS3 || h.webkit && !a.st.allowCSS3OnWebkit || (c = k + (k ? "T" : "t"), a._e = c + "ransform" in d && c + "ransition" in d, a._e && (a._f = k + (k ? "P" : "p") + "erspective" in d));k = k.toLowerCase();a._g = "-" + k + "-";a._h = "vertical" === a.st.slidesOrientation ? !1 : !0;a._i = a._h ? "left" : "top";a._j = a._h ? "width" : "height";a._k = -1;a._l = "fade" === a.st.transitionType ? !1 : !0;a._l || (a.st.sliderDrag = !1, a._m = 10);a._n = "z-index:0; display:none; opacity:0;";a._o = 0;a._p = 0;a._q = 0;n.each(n.rsModules, function (b, c) {
      "uid" !== b && c.call(a);
    });a.slides = [];a._r = 0;(a.st.slides ? n(a.st.slides) : a.slider.children().detach()).each(function () {
      a._s(this, !0);
    });a.st.randomizeSlides && a.slides.sort(function () {
      return .5 - Math.random();
    });a.numSlides = a.slides.length;a._t();a.st.startSlideId ? a.st.startSlideId > a.numSlides - 1 && (a.st.startSlideId = a.numSlides - 1) : a.st.startSlideId = 0;a._o = a.staticSlideId = a.currSlideId = a._u = a.st.startSlideId;a.currSlide = a.slides[a.currSlideId];a._v = 0;a.pointerMultitouch = !1;a.slider.addClass((a._h ? "rsHor" : "rsVer") + (a._l ? "" : " rsFade"));d = '<div class="rsOverflow"><div class="rsContainer">';a.slidesSpacing = a.st.slidesSpacing;a._w = (a._h ? a.slider.width() : a.slider.height()) + a.st.slidesSpacing;a._x = Boolean(0 < a._y);1 >= a.numSlides && (a._z = !1);a._a1 = a._z && a._l ? 2 === a.numSlides ? 1 : 2 : 0;a._b1 = 6 > a.numSlides ? a.numSlides : 6;a._c1 = 0;a._d1 = 0;a.slidesJQ = [];for (c = 0; c < a.numSlides; c++) a.slidesJQ.push(n('<div style="' + (a._l ? "" : c !== a.currSlideId ? a._n : "z-index:0;") + '" class="rsSlide "></div>'));a._e1 = d = n(d + "</div></div>");var m = a.ns,
        k = function (b, c, d, e, f) {
      a._j1 = b + c + m;a._k1 = b + d + m;a._l1 = b + e + m;f && (a._m1 = b + f + m);
    };c = e.pointerEnabled;a.pointerEnabled = c || e.msPointerEnabled;a.pointerEnabled ? (a.hasTouch = !1, a._n1 = .2, a.pointerMultitouch = Boolean(1 < e[(c ? "m" : "msM") + "axTouchPoints"]), c ? k("pointer", "down", "move", "up", "cancel") : k("MSPointer", "Down", "Move", "Up", "Cancel")) : (a.isIOS ? a._j1 = a._k1 = a._l1 = a._m1 = "" : k("mouse", "down", "move", "up"), "ontouchstart" in window || "createTouch" in document ? (a.hasTouch = !0, a._j1 += " touchstart" + m, a._k1 += " touchmove" + m, a._l1 += " touchend" + m, a._m1 += " touchcancel" + m, a._n1 = .5, a.st.sliderTouch && (a._f1 = !0)) : (a.hasTouch = !1, a._n1 = .2));a.st.sliderDrag && (a._f1 = !0, h.msie || h.opera ? a._g1 = a._h1 = "move" : h.mozilla ? (a._g1 = "-moz-grab", a._h1 = "-moz-grabbing") : h.webkit && -1 != e.platform.indexOf("Mac") && (a._g1 = "-webkit-grab", a._h1 = "-webkit-grabbing"), a._i1());a.slider.html(d);a._o1 = a.st.controlsInside ? a._e1 : a.slider;a._p1 = a._e1.children(".rsContainer");a.pointerEnabled && a._p1.css((c ? "" : "-ms-") + "touch-action", a._h ? "pan-y" : "pan-x");a._q1 = n('<div class="rsPreloader"></div>');e = a._p1.children(".rsSlide");a._r1 = a.slidesJQ[a.currSlideId];a._s1 = 0;a._e ? (a._t1 = "transition-property", a._u1 = "transition-duration", a._v1 = "transition-timing-function", a._w1 = a._x1 = a._g + "transform", a._f ? (h.webkit && !h.chrome && a.slider.addClass("rsWebkit3d"), a._y1 = "translate3d(", a._z1 = "px, ", a._a2 = "px, 0px)") : (a._y1 = "translate(", a._z1 = "px, ", a._a2 = "px)"), a._l ? a._p1[a._g + a._t1] = a._g + "transform" : (h = {}, h[a._g + a._t1] = "opacity", h[a._g + a._u1] = a.st.transitionSpeed + "ms", h[a._g + a._v1] = a.st.css3easeInOut, e.css(h))) : (a._x1 = "left", a._w1 = "top");var p;n(window).on("resize" + a.ns, function () {
      p && clearTimeout(p);p = setTimeout(function () {
        a.updateSliderSize();
      }, 50);
    });a.ev.trigger("rsAfterPropsSetup");a.updateSliderSize();a.st.keyboardNavEnabled && a._b2();a.st.arrowsNavHideOnTouch && (a.hasTouch || a.pointerMultitouch) && (a.st.arrowsNav = !1);a.st.arrowsNav && (e = a._o1, n('<div class="rsArrow rsArrowLeft"><div class="rsArrowIcn"></div></div><div class="rsArrow rsArrowRight"><div class="rsArrowIcn"></div></div>').appendTo(e), a._c2 = e.children(".rsArrowLeft").click(function (b) {
      b.preventDefault();a.prev();
    }), a._d2 = e.children(".rsArrowRight").click(function (b) {
      b.preventDefault();a.next();
    }), a.st.arrowsNavAutoHide && !a.hasTouch && (a._c2.addClass("rsHidden"), a._d2.addClass("rsHidden"), e.one("mousemove.arrowshover", function () {
      a._c2.removeClass("rsHidden");a._d2.removeClass("rsHidden");
    }), e.hover(function () {
      a._e2 || (a._c2.removeClass("rsHidden"), a._d2.removeClass("rsHidden"));
    }, function () {
      a._e2 || (a._c2.addClass("rsHidden"), a._d2.addClass("rsHidden"));
    })), a.ev.on("rsOnUpdateNav", function () {
      a._f2();
    }), a._f2());if (a.hasTouch && a.st.sliderTouch || !a.hasTouch && a.st.sliderDrag) a._p1.on(a._j1, function (b) {
      a._g2(b);
    });else a.dragSuccess = !1;var r = ["rsPlayBtnIcon", "rsPlayBtn", "rsCloseVideoBtn", "rsCloseVideoIcn"];a._p1.click(function (b) {
      if (!a.dragSuccess) {
        var c = n(b.target).attr("class");if (-1 !== n.inArray(c, r) && a.toggleVideo()) return !1;if (a.st.navigateByClick && !a._h2) {
          if (n(b.target).closest(".rsNoDrag", a._r1).length) return !0;a._i2(b);
        }a.ev.trigger("rsSlideClick", b);
      }
    }).on("click.rs", "a", function (b) {
      if (a.dragSuccess) return !1;a._h2 = !0;setTimeout(function () {
        a._h2 = !1;
      }, 3);
    });a.ev.trigger("rsAfterInit");
  }n.rsModules || (n.rsModules = { uid: 0 });v.prototype = { constructor: v, _i2: function (b) {
      b = b[this._h ? "pageX" : "pageY"] - this._j2;b >= this._q ? this.next() : 0 > b && this.prev();
    }, _t: function () {
      var b;
      b = this.st.numImagesToPreload;if (this._z = this.st.loop) 2 === this.numSlides ? (this._z = !1, this.st.loopRewind = !0) : 2 > this.numSlides && (this.st.loopRewind = this._z = !1);this._z && 0 < b && (4 >= this.numSlides ? b = 1 : this.st.numImagesToPreload > (this.numSlides - 1) / 2 && (b = Math.floor((this.numSlides - 1) / 2)));this._y = b;
    }, _s: function (b, f) {
      function c(b, c) {
        c ? g.images.push(b.attr(c)) : g.images.push(b.text());if (h) {
          h = !1;g.caption = "src" === c ? b.attr("alt") : b.contents();g.image = g.images[0];g.videoURL = b.attr("data-rsVideo");var d = b.attr("data-rsw"),
              e = b.attr("data-rsh");"undefined" !== typeof d && !1 !== d && "undefined" !== typeof e && !1 !== e ? (g.iW = parseInt(d, 10), g.iH = parseInt(e, 10)) : a.st.imgWidth && a.st.imgHeight && (g.iW = a.st.imgWidth, g.iH = a.st.imgHeight);
        }
      }var a = this,
          e,
          g = {},
          d,
          h = !0;b = n(b);a._k2 = b;a.ev.trigger("rsBeforeParseNode", [b, g]);if (!g.stopParsing) return b = a._k2, g.id = a._r, g.contentAdded = !1, a._r++, g.images = [], g.isBig = !1, g.hasCover || (b.hasClass("rsImg") ? (d = b, e = !0) : (d = b.find(".rsImg"), d.length && (e = !0)), e ? (g.bigImage = d.eq(0).attr("data-rsBigImg"), d.each(function () {
        var a = n(this);a.is("a") ? c(a, "href") : a.is("img") ? c(a, "src") : c(a);
      })) : b.is("img") && (b.addClass("rsImg rsMainSlideImage"), c(b, "src"))), d = b.find(".rsCaption"), d.length && (g.caption = d.remove()), g.content = b, a.ev.trigger("rsAfterParseNode", [b, g]), f && a.slides.push(g), 0 === g.images.length && (g.isLoaded = !0, g.isRendered = !1, g.isLoading = !1, g.images = null), g;
    }, _b2: function () {
      var b = this,
          f,
          c,
          a = function (a) {
        37 === a ? b.prev() : 39 === a && b.next();
      };b._b.on("keydown" + b.ns, function (e) {
        if (!b.st.keyboardNavEnabled) return !0;if (!(b._l2 || (c = e.keyCode, 37 !== c && 39 !== c || f))) {
          if (document.activeElement && /(INPUT|SELECT|TEXTAREA)/i.test(document.activeElement.tagName)) return !0;b.isFullscreen && e.preventDefault();a(c);f = setInterval(function () {
            a(c);
          }, 700);
        }
      }).on("keyup" + b.ns, function (a) {
        f && (clearInterval(f), f = null);
      });
    }, goTo: function (b, f) {
      b !== this.currSlideId && this._m2(b, this.st.transitionSpeed, !0, !f);
    }, destroy: function (b) {
      this.ev.trigger("rsBeforeDestroy");this._b.off("keydown" + this.ns + " keyup" + this.ns + " " + this._k1 + " " + this._l1);this._p1.off(this._j1 + " click");this.slider.data("royalSlider", null);n.removeData(this.slider, "royalSlider");n(window).off("resize" + this.ns);this.loadingTimeout && clearTimeout(this.loadingTimeout);b && this.slider.remove();this.ev = this.slider = this.slides = null;
    }, _n2: function (b, f) {
      function c(c, f, g) {
        c.isAdded ? (a(f, c), e(f, c)) : (g || (g = d.slidesJQ[f]), c.holder ? g = c.holder : (g = d.slidesJQ[f] = n(g), c.holder = g), c.appendOnLoaded = !1, e(f, c, g), a(f, c), d._p2(c, g, b), c.isAdded = !0);
      }function a(a, c) {
        c.contentAdded || (d.setItemHtml(c, b), b || (c.contentAdded = !0));
      }function e(a, b, c) {
        d._l && (c || (c = d.slidesJQ[a]), c.css(d._i, (a + d._d1 + p) * d._w));
      }function g(a) {
        if (l) {
          if (a > q - 1) return g(a - q);if (0 > a) return g(q + a);
        }return a;
      }var d = this,
          h,
          k,
          l = d._z,
          q = d.numSlides;if (!isNaN(f)) return g(f);var m = d.currSlideId,
          p,
          r = b ? Math.abs(d._o2 - d.currSlideId) >= d.numSlides - 1 ? 0 : 1 : d._y,
          t = Math.min(2, r),
          w = !1,
          v = !1,
          u;for (k = m; k < m + 1 + t; k++) if (u = g(k), (h = d.slides[u]) && (!h.isAdded || !h.positionSet)) {
        w = !0;break;
      }for (k = m - 1; k > m - 1 - t; k--) if (u = g(k), (h = d.slides[u]) && (!h.isAdded || !h.positionSet)) {
        v = !0;break;
      }if (w) for (k = m; k < m + r + 1; k++) u = g(k), p = Math.floor((d._u - (m - k)) / d.numSlides) * d.numSlides, (h = d.slides[u]) && c(h, u);if (v) for (k = m - 1; k > m - 1 - r; k--) u = g(k), p = Math.floor((d._u - (m - k)) / q) * q, (h = d.slides[u]) && c(h, u);if (!b) for (t = g(m - r), m = g(m + r), r = t > m ? 0 : t, k = 0; k < q; k++) t > m && k > t - 1 || !(k < r || k > m) || (h = d.slides[k]) && h.holder && (h.holder.detach(), h.isAdded = !1);
    }, setItemHtml: function (b, f) {
      var c = this,
          a = function () {
        if (!b.images) b.isRendered = !0, b.isLoaded = !0, b.isLoading = !1, d(!0);else if (!b.isLoading) {
          var a, f;b.content.hasClass("rsImg") ? (a = b.content, f = !0) : a = b.content.find(".rsImg:not(img)");a && !a.is("img") && a.each(function () {
            var a = n(this),
                c = '<img class="rsImg" src="' + (a.is("a") ? a.attr("href") : a.text()) + '" />';f ? b.content = n(c) : a.replaceWith(c);
          });a = f ? b.content : b.content.find("img.rsImg");k();a.eq(0).addClass("rsMainSlideImage");b.iW && b.iH && (b.isLoaded || c._q2(b), d());b.isLoading = !0;if (b.isBig) n("<img />").on("load.rs error.rs", function (a) {
            n(this).off("load.rs error.rs");e([this], !0);
          }).attr("src", b.image);else {
            b.loaded = [];b.numStartedLoad = 0;a = function (a) {
              n(this).off("load.rs error.rs");
              b.loaded.push(this);b.loaded.length === b.numStartedLoad && e(b.loaded, !1);
            };for (var g = 0; g < b.images.length; g++) {
              var h = n("<img />");b.numStartedLoad++;h.on("load.rs error.rs", a).attr("src", b.images[g]);
            }
          }
        }
      },
          e = function (a, c) {
        if (a.length) {
          var d = a[0];if (c !== b.isBig) (d = b.holder.children()) && 1 < d.length && l();else if (b.iW && b.iH) g();else if (b.iW = d.width, b.iH = d.height, b.iW && b.iH) g();else {
            var e = new Image();e.onload = function () {
              e.width ? (b.iW = e.width, b.iH = e.height, g()) : setTimeout(function () {
                e.width && (b.iW = e.width, b.iH = e.height);g();
              }, 1E3);
            };e.src = d.src;
          }
        } else g();
      },
          g = function () {
        b.isLoaded = !0;b.isLoading = !1;d();l();h();
      },
          d = function () {
        if (!b.isAppended && c.ev) {
          var a = c.st.visibleNearby,
              d = b.id - c._o;f || b.appendOnLoaded || !c.st.fadeinLoadedSlide || 0 !== d && (!(a || c._r2 || c._l2) || -1 !== d && 1 !== d) || (a = { visibility: "visible", opacity: 0 }, a[c._g + "transition"] = "opacity 400ms ease-in-out", b.content.css(a), setTimeout(function () {
            b.content.css("opacity", 1);
          }, 16));b.holder.find(".rsPreloader").length ? b.holder.append(b.content) : b.holder.html(b.content);
          b.isAppended = !0;b.isLoaded && (c._q2(b), h());b.sizeReady || (b.sizeReady = !0, setTimeout(function () {
            c.ev.trigger("rsMaybeSizeReady", b);
          }, 100));
        }
      },
          h = function () {
        !b.loadedTriggered && c.ev && (b.isLoaded = b.loadedTriggered = !0, b.holder.trigger("rsAfterContentSet"), c.ev.trigger("rsAfterContentSet", b));
      },
          k = function () {
        c.st.usePreloader && b.holder.html(c._q1.clone());
      },
          l = function (a) {
        c.st.usePreloader && (a = b.holder.find(".rsPreloader"), a.length && a.remove());
      };b.isLoaded ? d() : f ? !c._l && b.images && b.iW && b.iH ? a() : (b.holder.isWaiting = !0, k(), b.holder.slideId = -99) : a();
    }, _p2: function (b, f, c) {
      this._p1.append(b.holder);b.appendOnLoaded = !1;
    }, _g2: function (b, f) {
      var c = this,
          a,
          e = "touchstart" === b.type;c._s2 = e;c.ev.trigger("rsDragStart");if (n(b.target).closest(".rsNoDrag", c._r1).length) return c.dragSuccess = !1, !0;!f && c._r2 && (c._t2 = !0, c._u2());c.dragSuccess = !1;if (c._l2) e && (c._v2 = !0);else {
        e && (c._v2 = !1);c._w2();if (e) {
          var g = b.originalEvent.touches;if (g && 0 < g.length) a = g[0], 1 < g.length && (c._v2 = !0);else return;
        } else b.preventDefault(), a = b, c.pointerEnabled && (a = a.originalEvent);c._l2 = !0;c._b.on(c._k1, function (a) {
          c._x2(a, f);
        }).on(c._l1, function (a) {
          c._y2(a, f);
        });c._z2 = "";c._a3 = !1;c._b3 = a.pageX;c._c3 = a.pageY;c._d3 = c._v = (f ? c._e3 : c._h) ? a.pageX : a.pageY;c._f3 = 0;c._g3 = 0;c._h3 = f ? c._i3 : c._p;c._j3 = new Date().getTime();if (e) c._e1.on(c._m1, function (a) {
          c._y2(a, f);
        });
      }
    }, _k3: function (b, f) {
      if (this._l3) {
        var c = this._m3,
            a = b.pageX - this._b3,
            e = b.pageY - this._c3,
            g = this._h3 + a,
            d = this._h3 + e,
            h = f ? this._e3 : this._h,
            g = h ? g : d,
            d = this._z2;this._a3 = !0;this._b3 = b.pageX;this._c3 = b.pageY;"x" === d && 0 !== a ? this._f3 = 0 < a ? 1 : -1 : "y" === d && 0 !== e && (this._g3 = 0 < e ? 1 : -1);d = h ? this._b3 : this._c3;a = h ? a : e;f ? g > this._n3 ? g = this._h3 + a * this._n1 : g < this._o3 && (g = this._h3 + a * this._n1) : this._z || (0 >= this.currSlideId && 0 < d - this._d3 && (g = this._h3 + a * this._n1), this.currSlideId >= this.numSlides - 1 && 0 > d - this._d3 && (g = this._h3 + a * this._n1));this._h3 = g;200 < c - this._j3 && (this._j3 = c, this._v = d);f ? this._q3(this._h3) : this._l && this._p3(this._h3);
      }
    }, _x2: function (b, f) {
      var c = this,
          a,
          e = "touchmove" === b.type;if (!c._s2 || e) {
        if (e) {
          if (c._r3) return;var g = b.originalEvent.touches;if (g) {
            if (1 < g.length) return;a = g[0];
          } else return;
        } else a = b, c.pointerEnabled && (a = a.originalEvent);c._a3 || (c._e && (f ? c._s3 : c._p1).css(c._g + c._u1, "0s"), function h() {
          c._l2 && (c._t3 = requestAnimationFrame(h), c._u3 && c._k3(c._u3, f));
        }());if (c._l3) b.preventDefault(), c._m3 = new Date().getTime(), c._u3 = a;else if (g = f ? c._e3 : c._h, a = Math.abs(a.pageX - c._b3) - Math.abs(a.pageY - c._c3) - (g ? -7 : 7), 7 < a) {
          if (g) b.preventDefault(), c._z2 = "x";else if (e) {
            c._v3(b);return;
          }c._l3 = !0;
        } else if (-7 > a) {
          if (!g) b.preventDefault(), c._z2 = "y";else if (e) {
            c._v3(b);return;
          }c._l3 = !0;
        }
      }
    }, _v3: function (b, f) {
      this._r3 = !0;this._a3 = this._l2 = !1;this._y2(b);
    }, _y2: function (b, f) {
      function c(a) {
        return 100 > a ? 100 : 500 < a ? 500 : a;
      }function a(a, b) {
        if (e._l || f) h = (-e._u - e._d1) * e._w, k = Math.abs(e._p - h), e._c = k / b, a && (e._c += 250), e._c = c(e._c), e._x3(h, !1);
      }var e = this,
          g,
          d,
          h,
          k;g = -1 < b.type.indexOf("touch");if (!e._s2 || g) if (e._s2 = !1, e.ev.trigger("rsDragRelease"), e._u3 = null, e._l2 = !1, e._r3 = !1, e._l3 = !1, e._m3 = 0, cancelAnimationFrame(e._t3), e._a3 && (f ? e._q3(e._h3) : e._l && e._p3(e._h3)), e._b.off(e._k1).off(e._l1), g && e._e1.off(e._m1), e._i1(), !e._a3 && !e._v2 && f && e._w3) {
        var l = n(b.target).closest(".rsNavItem");l.length && e.goTo(l.index());
      } else {
        d = f ? e._e3 : e._h;if (!e._a3 || "y" === e._z2 && d || "x" === e._z2 && !d) {
          if (!f && e._t2) {
            e._t2 = !1;if (e.st.navigateByClick) {
              e._i2(e.pointerEnabled ? b.originalEvent : b);e.dragSuccess = !0;return;
            }e.dragSuccess = !0;
          } else {
            e._t2 = !1;e.dragSuccess = !1;return;
          }
        } else e.dragSuccess = !0;e._t2 = !1;e._z2 = "";var q = e.st.minSlideOffset;g = g ? b.originalEvent.changedTouches[0] : e.pointerEnabled ? b.originalEvent : b;var m = d ? g.pageX : g.pageY,
            p = e._d3;g = e._v;var r = e.currSlideId,
            t = e.numSlides,
            w = d ? e._f3 : e._g3,
            v = e._z;Math.abs(m - p);g = m - g;d = new Date().getTime() - e._j3;d = Math.abs(g) / d;if (0 === w || 1 >= t) a(!0, d);else {
          if (!v && !f) if (0 >= r) {
            if (0 < w) {
              a(!0, d);return;
            }
          } else if (r >= t - 1 && 0 > w) {
            a(!0, d);return;
          }if (f) {
            h = e._i3;if (h > e._n3) h = e._n3;else if (h < e._o3) h = e._o3;else {
              m = d * d / .006;l = -e._i3;p = e._y3 - e._z3 + e._i3;0 < g && m > l ? (l += e._z3 / (15 / (m / d * .003)), d = d * l / m, m = l) : 0 > g && m > p && (p += e._z3 / (15 / (m / d * .003)), d = d * p / m, m = p);l = Math.max(Math.round(d / .003), 50);h += m * (0 > g ? -1 : 1);if (h > e._n3) {
                e._a4(h, l, !0, e._n3, 200);return;
              }if (h < e._o3) {
                e._a4(h, l, !0, e._o3, 200);return;
              }
            }e._a4(h, l, !0);
          } else l = function (a) {
            var b = Math.floor(a / e._w);a - b * e._w > q && b++;return b;
          }, p + q < m ? 0 > w ? a(!1, d) : (l = l(m - p), e._m2(e.currSlideId - l, c(Math.abs(e._p - (-e._u - e._d1 + l) * e._w) / d), !1, !0, !0)) : p - q > m ? 0 < w ? a(!1, d) : (l = l(p - m), e._m2(e.currSlideId + l, c(Math.abs(e._p - (-e._u - e._d1 - l) * e._w) / d), !1, !0, !0)) : a(!1, d);
        }
      }
    }, _p3: function (b) {
      b = this._p = b;this._e ? this._p1.css(this._x1, this._y1 + (this._h ? b + this._z1 + 0 : 0 + this._z1 + b) + this._a2) : this._p1.css(this._h ? this._x1 : this._w1, b);
    }, updateSliderSize: function (b) {
      var f, c;if (this.slider) {
        if (this.st.autoScaleSlider) {
          var a = this.st.autoScaleSliderWidth,
              e = this.st.autoScaleSliderHeight;this.st.autoScaleHeight ? (f = this.slider.width(), f != this.width && (this.slider.css("height", e / a * f), f = this.slider.width()), c = this.slider.height()) : (c = this.slider.height(), c != this.height && (this.slider.css("width", a / e * c), c = this.slider.height()), f = this.slider.width());
        } else f = this.slider.width(), c = this.slider.height();if (b || f != this.width || c != this.height) {
          this.width = f;this.height = c;this._b4 = f;this._c4 = c;this.ev.trigger("rsBeforeSizeSet");this.ev.trigger("rsAfterSizePropSet");this._e1.css({ width: this._b4, height: this._c4 });this._w = (this._h ? this._b4 : this._c4) + this.st.slidesSpacing;this._d4 = this.st.imageScalePadding;for (f = 0; f < this.slides.length; f++) b = this.slides[f], b.positionSet = !1, b && b.images && b.isLoaded && (b.isRendered = !1, this._q2(b));if (this._e4) for (f = 0; f < this._e4.length; f++) b = this._e4[f], b.holder.css(this._i, (b.id + this._d1) * this._w);this._n2();this._l && (this._e && this._p1.css(this._g + "transition-duration", "0s"), this._p3((-this._u - this._d1) * this._w));this.ev.trigger("rsOnUpdateNav");
        }this._j2 = this._e1.offset();this._j2 = this._j2[this._i];
      }
    }, appendSlide: function (b, f) {
      var c = this._s(b);if (isNaN(f) || f > this.numSlides) f = this.numSlides;this.slides.splice(f, 0, c);this.slidesJQ.splice(f, 0, n('<div style="' + (this._l ? "position:absolute;" : this._n) + '" class="rsSlide"></div>'));f <= this.currSlideId && this.currSlideId++;this.ev.trigger("rsOnAppendSlide", [c, f]);this._f4(f);f === this.currSlideId && this.ev.trigger("rsAfterSlideChange");
    }, removeSlide: function (b) {
      var f = this.slides[b];f && (f.holder && f.holder.remove(), b < this.currSlideId && this.currSlideId--, this.slides.splice(b, 1), this.slidesJQ.splice(b, 1), this.ev.trigger("rsOnRemoveSlide", [b]), this._f4(b), b === this.currSlideId && this.ev.trigger("rsAfterSlideChange"));
    }, _f4: function (b) {
      var f = this;b = f.numSlides;b = 0 >= f._u ? 0 : Math.floor(f._u / b);f.numSlides = f.slides.length;0 === f.numSlides ? (f.currSlideId = f._d1 = f._u = 0, f.currSlide = f._g4 = null) : f._u = b * f.numSlides + f.currSlideId;for (b = 0; b < f.numSlides; b++) f.slides[b].id = b;f.currSlide = f.slides[f.currSlideId];f._r1 = f.slidesJQ[f.currSlideId];f.currSlideId >= f.numSlides ? f.goTo(f.numSlides - 1) : 0 > f.currSlideId && f.goTo(0);f._t();f._l && f._p1.css(f._g + f._u1, "0ms");f._h4 && clearTimeout(f._h4);f._h4 = setTimeout(function () {
        f._l && f._p3((-f._u - f._d1) * f._w);f._n2();f._l || f._r1.css({ display: "block", opacity: 1 });
      }, 14);f.ev.trigger("rsOnUpdateNav");
    }, _i1: function () {
      this._f1 && this._l && (this._g1 ? this._e1.css("cursor", this._g1) : (this._e1.removeClass("grabbing-cursor"), this._e1.addClass("grab-cursor")));
    }, _w2: function () {
      this._f1 && this._l && (this._h1 ? this._e1.css("cursor", this._h1) : (this._e1.removeClass("grab-cursor"), this._e1.addClass("grabbing-cursor")));
    }, next: function (b) {
      this._m2("next", this.st.transitionSpeed, !0, !b);
    }, prev: function (b) {
      this._m2("prev", this.st.transitionSpeed, !0, !b);
    }, _m2: function (b, f, c, a, e) {
      var g = this,
          d,
          h,
          k;g.ev.trigger("rsBeforeMove", [b, a]);k = "next" === b ? g.currSlideId + 1 : "prev" === b ? g.currSlideId - 1 : b = parseInt(b, 10);if (!g._z) {
        if (0 > k) {
          g._i4("left", !a);return;
        }if (k >= g.numSlides) {
          g._i4("right", !a);return;
        }
      }g._r2 && (g._u2(!0), c = !1);h = k - g.currSlideId;k = g._o2 = g.currSlideId;var l = g.currSlideId + h;a = g._u;var n;g._z ? (l = g._n2(!1, l), a += h) : a = l;g._o = l;g._g4 = g.slidesJQ[g.currSlideId];g._u = a;g.currSlideId = g._o;g.currSlide = g.slides[g.currSlideId];g._r1 = g.slidesJQ[g.currSlideId];var l = g.st.slidesDiff,
          m = Boolean(0 < h);h = Math.abs(h);var p = Math.floor(k / g._y),
          r = Math.floor((k + (m ? l : -l)) / g._y),
          p = (m ? Math.max(p, r) : Math.min(p, r)) * g._y + (m ? g._y - 1 : 0);p > g.numSlides - 1 ? p = g.numSlides - 1 : 0 > p && (p = 0);k = m ? p - k : k - p;k > g._y && (k = g._y);if (h > k + l) for (g._d1 += (h - (k + l)) * (m ? -1 : 1), f *= 1.4, k = 0; k < g.numSlides; k++) g.slides[k].positionSet = !1;g._c = f;g._n2(!0);e || (n = !0);d = (-a - g._d1) * g._w;n ? setTimeout(function () {
        g._j4 = !1;g._x3(d, b, !1, c);g.ev.trigger("rsOnUpdateNav");
      }, 0) : (g._x3(d, b, !1, c), g.ev.trigger("rsOnUpdateNav"));
    }, _f2: function () {
      this.st.arrowsNav && (1 >= this.numSlides ? (this._c2.css("display", "none"), this._d2.css("display", "none")) : (this._c2.css("display", "block"), this._d2.css("display", "block"), this._z || this.st.loopRewind || (0 === this.currSlideId ? this._c2.addClass("rsArrowDisabled") : this._c2.removeClass("rsArrowDisabled"), this.currSlideId === this.numSlides - 1 ? this._d2.addClass("rsArrowDisabled") : this._d2.removeClass("rsArrowDisabled"))));
    }, _x3: function (b, f, c, a, e) {
      function g() {
        var a;h && (a = h.data("rsTimeout")) && (h !== k && h.css({ opacity: 0, display: "none", zIndex: 0 }), clearTimeout(a), h.data("rsTimeout", ""));if (a = k.data("rsTimeout")) clearTimeout(a), k.data("rsTimeout", "");
      }var d = this,
          h,
          k,
          l = {};isNaN(d._c) && (d._c = 400);d._p = d._h3 = b;d.ev.trigger("rsBeforeAnimStart");d._e ? d._l ? (d._c = parseInt(d._c, 10), c = d._g + d._v1, l[d._g + d._u1] = d._c + "ms", l[c] = a ? n.rsCSS3Easing[d.st.easeInOut] : n.rsCSS3Easing[d.st.easeOut], d._p1.css(l), a || !d.hasTouch ? setTimeout(function () {
        d._p3(b);
      }, 5) : d._p3(b)) : (d._c = d.st.transitionSpeed, h = d._g4, k = d._r1, k.data("rsTimeout") && k.css("opacity", 0), g(), h && h.data("rsTimeout", setTimeout(function () {
        l[d._g + d._u1] = "0ms";l.zIndex = 0;l.display = "none";h.data("rsTimeout", "");h.css(l);setTimeout(function () {
          h.css("opacity", 0);
        }, 16);
      }, d._c + 60)), l.display = "block", l.zIndex = d._m, l.opacity = 0, l[d._g + d._u1] = "0ms", l[d._g + d._v1] = n.rsCSS3Easing[d.st.easeInOut], k.css(l), k.data("rsTimeout", setTimeout(function () {
        k.css(d._g + d._u1, d._c + "ms");k.data("rsTimeout", setTimeout(function () {
          k.css("opacity", 1);k.data("rsTimeout", "");
        }, 20));
      }, 20))) : d._l ? (l[d._h ? d._x1 : d._w1] = b + "px", d._p1.animate(l, d._c, a ? d.st.easeInOut : d.st.easeOut)) : (h = d._g4, k = d._r1, k.stop(!0, !0).css({ opacity: 0, display: "block",
        zIndex: d._m }), d._c = d.st.transitionSpeed, k.animate({ opacity: 1 }, d._c, d.st.easeInOut), g(), h && h.data("rsTimeout", setTimeout(function () {
        h.stop(!0, !0).css({ opacity: 0, display: "none", zIndex: 0 });
      }, d._c + 60)));d._r2 = !0;d.loadingTimeout && clearTimeout(d.loadingTimeout);d.loadingTimeout = e ? setTimeout(function () {
        d.loadingTimeout = null;e.call();
      }, d._c + 60) : setTimeout(function () {
        d.loadingTimeout = null;d._k4(f);
      }, d._c + 60);
    }, _u2: function (b) {
      this._r2 = !1;clearTimeout(this.loadingTimeout);if (this._l) {
        if (!this._e) this._p1.stop(!0), this._p = parseInt(this._p1.css(this._h ? this._x1 : this._w1), 10);else {
          if (!b) {
            b = this._p;var f = this._h3 = this._l4();this._p1.css(this._g + this._u1, "0ms");b !== f && this._p3(f);
          }
        }
      } else 20 < this._m ? this._m = 10 : this._m++;
    }, _l4: function () {
      var b = window.getComputedStyle(this._p1.get(0), null).getPropertyValue(this._g + "transform").replace(/^matrix\(/i, "").split(/, |\)$/g),
          f = 0 === b[0].indexOf("matrix3d");return parseInt(b[this._h ? f ? 12 : 4 : f ? 13 : 5], 10);
    }, _m4: function (b, f) {
      return this._e ? this._y1 + (f ? b + this._z1 + 0 : 0 + this._z1 + b) + this._a2 : b;
    }, _k4: function (b) {
      this._l || (this._r1.css("z-index", 0), this._m = 10);this._r2 = !1;this.staticSlideId = this.currSlideId;this._n2();this._n4 = !1;this.ev.trigger("rsAfterSlideChange");
    }, _i4: function (b, f) {
      var c = this,
          a = (-c._u - c._d1) * c._w;if (0 !== c.numSlides && !c._r2) if (c.st.loopRewind) c.goTo("left" === b ? c.numSlides - 1 : 0, f);else if (c._l) {
        c._c = 200;var e = function () {
          c._r2 = !1;
        };c._x3(a + ("left" === b ? 30 : -30), "", !1, !0, function () {
          c._r2 = !1;c._x3(a, "", !1, !0, e);
        });
      }
    }, _q2: function (b, f) {
      if (!b.isRendered) {
        var c = b.content,
            a = "rsMainSlideImage",
            e,
            g = n.isFunction(this.st.imageAlignCenter) ? this.st.imageAlignCenter(b) : this.st.imageAlignCenter,
            d = n.isFunction(this.st.imageScaleMode) ? this.st.imageScaleMode(b) : this.st.imageScaleMode,
            h;b.videoURL && (a = "rsVideoContainer", "fill" !== d ? e = !0 : (h = c, h.hasClass(a) || (h = h.find("." + a)), h.css({ width: "100%", height: "100%" }), a = "rsMainSlideImage"));c.hasClass(a) || (c = c.find("." + a));if (c) {
          var k = b.iW,
              l = b.iH;b.isRendered = !0;if ("none" !== d || g) {
            a = "fill" !== d ? this._d4 : 0;h = this._b4 - 2 * a;var q = this._c4 - 2 * a,
                m,
                p,
                r = {};"fit-if-smaller" === d && (k > h || l > q) && (d = "fit");if ("fill" === d || "fit" === d) m = h / k, p = q / l, m = "fill" == d ? m > p ? m : p : "fit" == d ? m < p ? m : p : 1, k = Math.ceil(k * m, 10), l = Math.ceil(l * m, 10);"none" !== d && (r.width = k, r.height = l, e && c.find(".rsImg").css({ width: "100%", height: "100%" }));g && (r.marginLeft = Math.floor((h - k) / 2) + a, r.marginTop = Math.floor((q - l) / 2) + a);c.css(r);
          }
        }
      }
    } };n.rsProto = v.prototype;n.fn.royalSlider = function (b) {
    var f = arguments;return this.each(function () {
      var c = n(this);if ("object" !== typeof b && b) {
        if ((c = c.data("royalSlider")) && c[b]) return c[b].apply(c, Array.prototype.slice.call(f, 1));
      } else c.data("royalSlider") || c.data("royalSlider", new v(c, b));
    });
  };n.fn.royalSlider.defaults = { slidesSpacing: 8, startSlideId: 0, loop: !1, loopRewind: !1, numImagesToPreload: 4, fadeinLoadedSlide: !0, slidesOrientation: "horizontal", transitionType: "move", transitionSpeed: 600, controlNavigation: "bullets", controlsInside: !0, arrowsNav: !0, arrowsNavAutoHide: !0, navigateByClick: !0, randomizeSlides: !1, sliderDrag: !0, sliderTouch: !0, keyboardNavEnabled: !1, fadeInAfterLoaded: !0, allowCSS3: !0, allowCSS3OnWebkit: !0,
    addActiveClass: !1, autoHeight: !1, easeOut: "easeOutSine", easeInOut: "easeInOutSine", minSlideOffset: 10, imageScaleMode: "fit-if-smaller", imageAlignCenter: !0, imageScalePadding: 4, usePreloader: !0, autoScaleSlider: !1, autoScaleSliderWidth: 800, autoScaleSliderHeight: 400, autoScaleHeight: !0, arrowsNavHideOnTouch: !1, globalCaption: !1, slidesDiff: 2 };n.rsCSS3Easing = { easeOutSine: "cubic-bezier(0.390, 0.575, 0.565, 1.000)", easeInOutSine: "cubic-bezier(0.445, 0.050, 0.550, 0.950)" };n.extend(jQuery.easing, { easeInOutSine: function (b, f, c, a, e) {
      return -a / 2 * (Math.cos(Math.PI * f / e) - 1) + c;
    }, easeOutSine: function (b, f, c, a, e) {
      return a * Math.sin(f / e * (Math.PI / 2)) + c;
    }, easeOutCubic: function (b, f, c, a, e) {
      return a * ((f = f / e - 1) * f * f + 1) + c;
    } });
})(jQuery, window);
// jquery.rs.bullets v1.0.1
(function (c) {
  c.extend(c.rsProto, { _i5: function () {
      var a = this;"bullets" === a.st.controlNavigation && (a.ev.one("rsAfterPropsSetup", function () {
        a._j5 = !0;a.slider.addClass("rsWithBullets");for (var b = '<div class="rsNav rsBullets">', e = 0; e < a.numSlides; e++) b += '<div class="rsNavItem rsBullet"><span></span></div>';a._k5 = b = c(b + "</div>");a._l5 = b.appendTo(a.slider).children();a._k5.on("click.rs", ".rsNavItem", function (b) {
          a._m5 || a.goTo(c(this).index());
        });
      }), a.ev.on("rsOnAppendSlide", function (b, c, d) {
        d >= a.numSlides ? a._k5.append('<div class="rsNavItem rsBullet"><span></span></div>') : a._l5.eq(d).before('<div class="rsNavItem rsBullet"><span></span></div>');a._l5 = a._k5.children();
      }), a.ev.on("rsOnRemoveSlide", function (b, c) {
        var d = a._l5.eq(c);d && d.length && (d.remove(), a._l5 = a._k5.children());
      }), a.ev.on("rsOnUpdateNav", function () {
        var b = a.currSlideId;a._n5 && a._n5.removeClass("rsNavSelected");b = a._l5.eq(b);b.addClass("rsNavSelected");a._n5 = b;
      }));
    } });c.rsModules.bullets = c.rsProto._i5;
})(jQuery);
// jquery.rs.autoplay v1.0.5
(function (b) {
  b.extend(b.rsProto, { _x4: function () {
      var a = this,
          d;a._y4 = { enabled: !1, stopAtAction: !0, pauseOnHover: !0, delay: 2E3 };!a.st.autoPlay && a.st.autoplay && (a.st.autoPlay = a.st.autoplay);a.st.autoPlay = b.extend({}, a._y4, a.st.autoPlay);a.st.autoPlay.enabled && (a.ev.on("rsBeforeParseNode", function (a, c, f) {
        c = b(c);if (d = c.attr("data-rsDelay")) f.customDelay = parseInt(d, 10);
      }), a.ev.one("rsAfterInit", function () {
        a._z4();
      }), a.ev.on("rsBeforeDestroy", function () {
        a.stopAutoPlay();a.slider.off("mouseenter mouseleave");b(window).off("blur" + a.ns + " focus" + a.ns);
      }));
    }, _z4: function () {
      var a = this;a.startAutoPlay();a.ev.on("rsAfterContentSet", function (b, e) {
        a._l2 || a._r2 || !a._a5 || e !== a.currSlide || a._b5();
      });a.ev.on("rsDragRelease", function () {
        a._a5 && a._c5 && (a._c5 = !1, a._b5());
      });a.ev.on("rsAfterSlideChange", function () {
        a._a5 && a._c5 && (a._c5 = !1, a.currSlide.isLoaded && a._b5());
      });a.ev.on("rsDragStart", function () {
        a._a5 && (a.st.autoPlay.stopAtAction ? a.stopAutoPlay() : (a._c5 = !0, a._d5()));
      });a.ev.on("rsBeforeMove", function (b, e, c) {
        a._a5 && (c && a.st.autoPlay.stopAtAction ? a.stopAutoPlay() : (a._c5 = !0, a._d5()));
      });a._e5 = !1;a.ev.on("rsVideoStop", function () {
        a._a5 && (a._e5 = !1, a._b5());
      });a.ev.on("rsVideoPlay", function () {
        a._a5 && (a._c5 = !1, a._d5(), a._e5 = !0);
      });b(window).on("blur" + a.ns, function () {
        a._a5 && (a._c5 = !0, a._d5());
      }).on("focus" + a.ns, function () {
        a._a5 && a._c5 && (a._c5 = !1, a._b5());
      });a.st.autoPlay.pauseOnHover && (a._f5 = !1, a.slider.hover(function () {
        a._a5 && (a._c5 = !1, a._d5(), a._f5 = !0);
      }, function () {
        a._a5 && (a._f5 = !1, a._b5());
      }));
    }, toggleAutoPlay: function () {
      this._a5 ? this.stopAutoPlay() : this.startAutoPlay();
    }, startAutoPlay: function () {
      this._a5 = !0;this.currSlide.isLoaded && this._b5();
    }, stopAutoPlay: function () {
      this._e5 = this._f5 = this._c5 = this._a5 = !1;this._d5();
    }, _b5: function () {
      var a = this;a._f5 || a._e5 || (a._g5 = !0, a._h5 && clearTimeout(a._h5), a._h5 = setTimeout(function () {
        var b;a._z || a.st.loopRewind || (b = !0, a.st.loopRewind = !0);a.next(!0);b && (a.st.loopRewind = !1);
      }, a.currSlide.customDelay ? a.currSlide.customDelay : a.st.autoPlay.delay));
    }, _d5: function () {
      this._f5 || this._e5 || (this._g5 = !1, this._h5 && (clearTimeout(this._h5), this._h5 = null));
    } });b.rsModules.autoplay = b.rsProto._x4;
})(jQuery);
// jquery.rs.auto-height v1.0.3
(function (b) {
  b.extend(b.rsProto, { _w4: function () {
      var a = this;if (a.st.autoHeight) {
        var b,
            c,
            e,
            f = !0,
            d = function (d) {
          e = a.slides[a.currSlideId];(b = e.holder) && (c = b.height()) && void 0 !== c && c > (a.st.minAutoHeight || 30) && (a._c4 = c, a._e || !d ? a._e1.css("height", c) : a._e1.stop(!0, !0).animate({ height: c }, a.st.transitionSpeed), a.ev.trigger("rsAutoHeightChange", c), f && (a._e && setTimeout(function () {
            a._e1.css(a._g + "transition", "height " + a.st.transitionSpeed + "ms ease-in-out");
          }, 16), f = !1));
        };a.ev.on("rsMaybeSizeReady.rsAutoHeight", function (a, b) {
          e === b && d();
        });a.ev.on("rsAfterContentSet.rsAutoHeight", function (a, b) {
          e === b && d();
        });a.slider.addClass("rsAutoHeight");a.ev.one("rsAfterInit", function () {
          setTimeout(function () {
            d(!1);setTimeout(function () {
              a.slider.append('<div style="clear:both; float: none;"></div>');
            }, 16);
          }, 16);
        });a.ev.on("rsBeforeAnimStart", function () {
          d(!0);
        });a.ev.on("rsBeforeSizeSet", function () {
          setTimeout(function () {
            d(!1);
          }, 16);
        });
      }
    } });b.rsModules.autoHeight = b.rsProto._w4;
})(jQuery);
// jquery.rs.active-class v1.0.1
(function (c) {
  c.rsProto._o4 = function () {
    var b,
        a = this;if (a.st.addActiveClass) a.ev.on("rsOnUpdateNav", function () {
      b && clearTimeout(b);b = setTimeout(function () {
        a._g4 && a._g4.removeClass("rsActiveSlide");a._r1 && a._r1.addClass("rsActiveSlide");b = null;
      }, 50);
    });
  };c.rsModules.activeClass = c.rsProto._o4;
})(jQuery);
// jquery.rs.visible-nearby v1.0.2
(function (d) {
  d.rsProto._g7 = function () {
    var a = this;a.st.visibleNearby && a.st.visibleNearby.enabled && (a._h7 = { enabled: !0, centerArea: .6, center: !0, breakpoint: 0, breakpointCenterArea: .8, hiddenOverflow: !0, navigateByCenterClick: !1 }, a.st.visibleNearby = d.extend({}, a._h7, a.st.visibleNearby), a.ev.one("rsAfterPropsSetup", function () {
      a._i7 = a._e1.css("overflow", "visible").wrap('<div class="rsVisibleNearbyWrap"></div>').parent();a.st.visibleNearby.hiddenOverflow || a._i7.css("overflow", "visible");a._o1 = a.st.controlsInside ? a._i7 : a.slider;
    }), a.ev.on("rsAfterSizePropSet", function () {
      var b,
          c = a.st.visibleNearby;b = c.breakpoint && a.width < c.breakpoint ? c.breakpointCenterArea : c.centerArea;a._h ? (a._b4 *= b, a._i7.css({ height: a._c4, width: a._b4 / b }), a._d = a._b4 * (1 - b) / 2 / b) : (a._c4 *= b, a._i7.css({ height: a._c4 / b, width: a._b4 }), a._d = a._c4 * (1 - b) / 2 / b);c.navigateByCenterClick || (a._q = a._h ? a._b4 : a._c4);c.center && a._e1.css("margin-" + (a._h ? "left" : "top"), a._d);
    }));
  };d.rsModules.visibleNearby = d.rsProto._g7;
})(jQuery);
/*!
 * skrollr core
 *
 * Alexander Prinzhorn - https://github.com/Prinzhorn/skrollr
 *
 * Free to use under terms of MIT license
 */

(function (window, document, undefined) {
	'use strict';

	/*
  * Global api.
  */

	var skrollr = {
		get: function () {
			return _instance;
		},
		//Main entry point.
		init: function (options) {
			return _instance || new Skrollr(options);
		},
		VERSION: '0.6.29'
	};

	//Minify optimization.
	var hasProp = Object.prototype.hasOwnProperty;
	var Math = window.Math;
	var getStyle = window.getComputedStyle;

	//They will be filled when skrollr gets initialized.
	var documentElement;
	var body;

	var EVENT_TOUCHSTART = 'touchstart';
	var EVENT_TOUCHMOVE = 'touchmove';
	var EVENT_TOUCHCANCEL = 'touchcancel';
	var EVENT_TOUCHEND = 'touchend';

	var SKROLLABLE_CLASS = 'skrollable';
	var SKROLLABLE_BEFORE_CLASS = SKROLLABLE_CLASS + '-before';
	var SKROLLABLE_BETWEEN_CLASS = SKROLLABLE_CLASS + '-between';
	var SKROLLABLE_AFTER_CLASS = SKROLLABLE_CLASS + '-after';

	var SKROLLR_CLASS = 'skrollr';
	var NO_SKROLLR_CLASS = 'no-' + SKROLLR_CLASS;
	var SKROLLR_DESKTOP_CLASS = SKROLLR_CLASS + '-desktop';
	var SKROLLR_MOBILE_CLASS = SKROLLR_CLASS + '-mobile';

	var DEFAULT_EASING = 'linear';
	var DEFAULT_DURATION = 1000; //ms
	var DEFAULT_MOBILE_DECELERATION = 0.004; //pixel/msÂ²

	var DEFAULT_SKROLLRBODY = 'skrollr-body';

	var DEFAULT_SMOOTH_SCROLLING_DURATION = 200; //ms

	var ANCHOR_START = 'start';
	var ANCHOR_END = 'end';
	var ANCHOR_CENTER = 'center';
	var ANCHOR_BOTTOM = 'bottom';

	//The property which will be added to the DOM element to hold the ID of the skrollable.
	var SKROLLABLE_ID_DOM_PROPERTY = '___skrollable_id';

	var rxTouchIgnoreTags = /^(?:input|textarea|button|select)$/i;

	var rxTrim = /^\s+|\s+$/g;

	//Find all data-attributes. data-[_constant]-[offset]-[anchor]-[anchor].
	var rxKeyframeAttribute = /^data(?:-(_\w+))?(?:-?(-?\d*\.?\d+p?))?(?:-?(start|end|top|center|bottom))?(?:-?(top|center|bottom))?$/;

	var rxPropValue = /\s*(@?[\w\-\[\]]+)\s*:\s*(.+?)\s*(?:;|$)/gi;

	//Easing function names follow the property in square brackets.
	var rxPropEasing = /^(@?[a-z\-]+)\[(\w+)\]$/;

	var rxCamelCase = /-([a-z0-9_])/g;
	var rxCamelCaseFn = function (str, letter) {
		return letter.toUpperCase();
	};

	//Numeric values with optional sign.
	var rxNumericValue = /[\-+]?[\d]*\.?[\d]+/g;

	//Used to replace occurences of {?} with a number.
	var rxInterpolateString = /\{\?\}/g;

	//Finds rgb(a) colors, which don't use the percentage notation.
	var rxRGBAIntegerColor = /rgba?\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+/g;

	//Finds all gradients.
	var rxGradient = /[a-z\-]+-gradient/g;

	//Vendor prefix. Will be set once skrollr gets initialized.
	var theCSSPrefix = '';
	var theDashedCSSPrefix = '';

	//Will be called once (when skrollr gets initialized).
	var detectCSSPrefix = function () {
		//Only relevant prefixes. May be extended.
		//Could be dangerous if there will ever be a CSS property which actually starts with "ms". Don't hope so.
		var rxPrefixes = /^(?:O|Moz|webkit|ms)|(?:-(?:o|moz|webkit|ms)-)/;

		//Detect prefix for current browser by finding the first property using a prefix.
		if (!getStyle) {
			return;
		}

		var style = getStyle(body, null);

		for (var k in style) {
			//We check the key and if the key is a number, we check the value as well, because safari's getComputedStyle returns some weird array-like thingy.
			theCSSPrefix = k.match(rxPrefixes) || +k == k && style[k].match(rxPrefixes);

			if (theCSSPrefix) {
				break;
			}
		}

		//Did we even detect a prefix?
		if (!theCSSPrefix) {
			theCSSPrefix = theDashedCSSPrefix = '';

			return;
		}

		theCSSPrefix = theCSSPrefix[0];

		//We could have detected either a dashed prefix or this camelCaseish-inconsistent stuff.
		if (theCSSPrefix.slice(0, 1) === '-') {
			theDashedCSSPrefix = theCSSPrefix;

			//There's no logic behind these. Need a look up.
			theCSSPrefix = {
				'-webkit-': 'webkit',
				'-moz-': 'Moz',
				'-ms-': 'ms',
				'-o-': 'O'
			}[theCSSPrefix];
		} else {
			theDashedCSSPrefix = '-' + theCSSPrefix.toLowerCase() + '-';
		}
	};

	var polyfillRAF = function () {
		var requestAnimFrame = window.requestAnimationFrame || window[theCSSPrefix.toLowerCase() + 'RequestAnimationFrame'];

		var lastTime = _now();

		if (_isMobile || !requestAnimFrame) {
			requestAnimFrame = function (callback) {
				//How long did it take to render?
				var deltaTime = _now() - lastTime;
				var delay = Math.max(0, 1000 / 60 - deltaTime);

				return window.setTimeout(function () {
					lastTime = _now();
					callback();
				}, delay);
			};
		}

		return requestAnimFrame;
	};

	var polyfillCAF = function () {
		var cancelAnimFrame = window.cancelAnimationFrame || window[theCSSPrefix.toLowerCase() + 'CancelAnimationFrame'];

		if (_isMobile || !cancelAnimFrame) {
			cancelAnimFrame = function (timeout) {
				return window.clearTimeout(timeout);
			};
		}

		return cancelAnimFrame;
	};

	//Built-in easing functions.
	var easings = {
		begin: function () {
			return 0;
		},
		end: function () {
			return 1;
		},
		linear: function (p) {
			return p;
		},
		quadratic: function (p) {
			return p * p;
		},
		cubic: function (p) {
			return p * p * p;
		},
		swing: function (p) {
			return -Math.cos(p * Math.PI) / 2 + 0.5;
		},
		sqrt: function (p) {
			return Math.sqrt(p);
		},
		outCubic: function (p) {
			return Math.pow(p - 1, 3) + 1;
		},
		//see https://www.desmos.com/calculator/tbr20s8vd2 for how I did this
		bounce: function (p) {
			var a;

			if (p <= 0.5083) {
				a = 3;
			} else if (p <= 0.8489) {
				a = 9;
			} else if (p <= 0.96208) {
				a = 27;
			} else if (p <= 0.99981) {
				a = 91;
			} else {
				return 1;
			}

			return 1 - Math.abs(3 * Math.cos(p * a * 1.028) / a);
		}
	};

	/**
  * Constructor.
  */
	function Skrollr(options) {
		documentElement = document.documentElement;
		body = document.body;

		detectCSSPrefix();

		_instance = this;

		options = options || {};

		_constants = options.constants || {};

		//We allow defining custom easings or overwrite existing.
		if (options.easing) {
			for (var e in options.easing) {
				easings[e] = options.easing[e];
			}
		}

		_edgeStrategy = options.edgeStrategy || 'set';

		_listeners = {
			//Function to be called right before rendering.
			beforerender: options.beforerender,

			//Function to be called right after finishing rendering.
			render: options.render,

			//Function to be called whenever an element with the `data-emit-events` attribute passes a keyframe.
			keyframe: options.keyframe
		};

		//forceHeight is true by default
		_forceHeight = options.forceHeight !== false;

		if (_forceHeight) {
			_scale = options.scale || 1;
		}

		_mobileDeceleration = options.mobileDeceleration || DEFAULT_MOBILE_DECELERATION;

		_smoothScrollingEnabled = options.smoothScrolling !== false;
		_smoothScrollingDuration = options.smoothScrollingDuration || DEFAULT_SMOOTH_SCROLLING_DURATION;

		//Dummy object. Will be overwritten in the _render method when smooth scrolling is calculated.
		_smoothScrolling = {
			targetTop: _instance.getScrollTop()
		};

		//A custom check function may be passed.
		_isMobile = (options.mobileCheck || function () {
			return (/Android|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent || navigator.vendor || window.opera)
			);
		})();

		if (_isMobile) {
			_skrollrBody = document.getElementById(options.skrollrBody || DEFAULT_SKROLLRBODY);

			//Detect 3d transform if there's a skrollr-body (only needed for #skrollr-body).
			if (_skrollrBody) {
				_detect3DTransforms();
			}

			_initMobile();
			_updateClass(documentElement, [SKROLLR_CLASS, SKROLLR_MOBILE_CLASS], [NO_SKROLLR_CLASS]);
		} else {
			_updateClass(documentElement, [SKROLLR_CLASS, SKROLLR_DESKTOP_CLASS], [NO_SKROLLR_CLASS]);
		}

		//Triggers parsing of elements and a first reflow.
		_instance.refresh();

		_addEvent(window, 'resize orientationchange', function () {
			var width = documentElement.clientWidth;
			var height = documentElement.clientHeight;

			//Only reflow if the size actually changed (#271).
			if (height !== _lastViewportHeight || width !== _lastViewportWidth) {
				_lastViewportHeight = height;
				_lastViewportWidth = width;

				_requestReflow = true;
			}
		});

		var requestAnimFrame = polyfillRAF();

		//Let's go.
		(function animloop() {
			_render();
			_animFrame = requestAnimFrame(animloop);
		})();

		return _instance;
	}

	/**
  * (Re)parses some or all elements.
  */
	Skrollr.prototype.refresh = function (elements) {
		var elementIndex;
		var elementsLength;
		var ignoreID = false;

		//Completely reparse anything without argument.
		if (elements === undefined) {
			//Ignore that some elements may already have a skrollable ID.
			ignoreID = true;

			_skrollables = [];
			_skrollableIdCounter = 0;

			elements = document.getElementsByTagName('*');
		} else if (elements.length === undefined) {
			//We also accept a single element as parameter.
			elements = [elements];
		}

		elementIndex = 0;
		elementsLength = elements.length;

		for (; elementIndex < elementsLength; elementIndex++) {
			var el = elements[elementIndex];
			var anchorTarget = el;
			var keyFrames = [];

			//If this particular element should be smooth scrolled.
			var smoothScrollThis = _smoothScrollingEnabled;

			//The edge strategy for this particular element.
			var edgeStrategy = _edgeStrategy;

			//If this particular element should emit keyframe events.
			var emitEvents = false;

			//If we're reseting the counter, remove any old element ids that may be hanging around.
			if (ignoreID && SKROLLABLE_ID_DOM_PROPERTY in el) {
				delete el[SKROLLABLE_ID_DOM_PROPERTY];
			}

			if (!el.attributes) {
				continue;
			}

			//Iterate over all attributes and search for key frame attributes.
			var attributeIndex = 0;
			var attributesLength = el.attributes.length;

			for (; attributeIndex < attributesLength; attributeIndex++) {
				var attr = el.attributes[attributeIndex];

				if (attr.name === 'data-anchor-target') {
					anchorTarget = document.querySelector(attr.value);

					if (anchorTarget === null) {
						throw 'Unable to find anchor target "' + attr.value + '"';
					}

					continue;
				}

				//Global smooth scrolling can be overridden by the element attribute.
				if (attr.name === 'data-smooth-scrolling') {
					smoothScrollThis = attr.value !== 'off';

					continue;
				}

				//Global edge strategy can be overridden by the element attribute.
				if (attr.name === 'data-edge-strategy') {
					edgeStrategy = attr.value;

					continue;
				}

				//Is this element tagged with the `data-emit-events` attribute?
				if (attr.name === 'data-emit-events') {
					emitEvents = true;

					continue;
				}

				var match = attr.name.match(rxKeyframeAttribute);

				if (match === null) {
					continue;
				}

				var kf = {
					props: attr.value,
					//Point back to the element as well.
					element: el,
					//The name of the event which this keyframe will fire, if emitEvents is
					eventType: attr.name.replace(rxCamelCase, rxCamelCaseFn)
				};

				keyFrames.push(kf);

				var constant = match[1];

				if (constant) {
					//Strip the underscore prefix.
					kf.constant = constant.substr(1);
				}

				//Get the key frame offset.
				var offset = match[2];

				//Is it a percentage offset?
				if (/p$/.test(offset)) {
					kf.isPercentage = true;
					kf.offset = (offset.slice(0, -1) | 0) / 100;
				} else {
					kf.offset = offset | 0;
				}

				var anchor1 = match[3];

				//If second anchor is not set, the first will be taken for both.
				var anchor2 = match[4] || anchor1;

				//"absolute" (or "classic") mode, where numbers mean absolute scroll offset.
				if (!anchor1 || anchor1 === ANCHOR_START || anchor1 === ANCHOR_END) {
					kf.mode = 'absolute';

					//data-end needs to be calculated after all key frames are known.
					if (anchor1 === ANCHOR_END) {
						kf.isEnd = true;
					} else if (!kf.isPercentage) {
						//For data-start we can already set the key frame w/o calculations.
						//#59: "scale" options should only affect absolute mode.
						kf.offset = kf.offset * _scale;
					}
				}
				//"relative" mode, where numbers are relative to anchors.
				else {
						kf.mode = 'relative';
						kf.anchors = [anchor1, anchor2];
					}
			}

			//Does this element have key frames?
			if (!keyFrames.length) {
				continue;
			}

			//Will hold the original style and class attributes before we controlled the element (see #80).
			var styleAttr, classAttr;

			var id;

			if (!ignoreID && SKROLLABLE_ID_DOM_PROPERTY in el) {
				//We already have this element under control. Grab the corresponding skrollable id.
				id = el[SKROLLABLE_ID_DOM_PROPERTY];
				styleAttr = _skrollables[id].styleAttr;
				classAttr = _skrollables[id].classAttr;
			} else {
				//It's an unknown element. Asign it a new skrollable id.
				id = el[SKROLLABLE_ID_DOM_PROPERTY] = _skrollableIdCounter++;
				styleAttr = el.style.cssText;
				classAttr = _getClass(el);
			}

			_skrollables[id] = {
				element: el,
				styleAttr: styleAttr,
				classAttr: classAttr,
				anchorTarget: anchorTarget,
				keyFrames: keyFrames,
				smoothScrolling: smoothScrollThis,
				edgeStrategy: edgeStrategy,
				emitEvents: emitEvents,
				lastFrameIndex: -1
			};

			_updateClass(el, [SKROLLABLE_CLASS], []);
		}

		//Reflow for the first time.
		_reflow();

		//Now that we got all key frame numbers right, actually parse the properties.
		elementIndex = 0;
		elementsLength = elements.length;

		for (; elementIndex < elementsLength; elementIndex++) {
			var sk = _skrollables[elements[elementIndex][SKROLLABLE_ID_DOM_PROPERTY]];

			if (sk === undefined) {
				continue;
			}

			//Parse the property string to objects
			_parseProps(sk);

			//Fill key frames with missing properties from left and right
			_fillProps(sk);
		}

		return _instance;
	};

	/**
  * Transform "relative" mode to "absolute" mode.
  * That is, calculate anchor position and offset of element.
  */
	Skrollr.prototype.relativeToAbsolute = function (element, viewportAnchor, elementAnchor) {
		var viewportHeight = documentElement.clientHeight;
		var box = element.getBoundingClientRect();
		var absolute = box.top;

		//#100: IE doesn't supply "height" with getBoundingClientRect.
		var boxHeight = box.bottom - box.top;

		if (viewportAnchor === ANCHOR_BOTTOM) {
			absolute -= viewportHeight;
		} else if (viewportAnchor === ANCHOR_CENTER) {
			absolute -= viewportHeight / 2;
		}

		if (elementAnchor === ANCHOR_BOTTOM) {
			absolute += boxHeight;
		} else if (elementAnchor === ANCHOR_CENTER) {
			absolute += boxHeight / 2;
		}

		//Compensate scrolling since getBoundingClientRect is relative to viewport.
		absolute += _instance.getScrollTop();

		return absolute + 0.5 | 0;
	};

	/**
  * Animates scroll top to new position.
  */
	Skrollr.prototype.animateTo = function (top, options) {
		options = options || {};

		var now = _now();
		var scrollTop = _instance.getScrollTop();
		var duration = options.duration === undefined ? DEFAULT_DURATION : options.duration;

		//Setting this to a new value will automatically cause the current animation to stop, if any.
		_scrollAnimation = {
			startTop: scrollTop,
			topDiff: top - scrollTop,
			targetTop: top,
			duration: duration,
			startTime: now,
			endTime: now + duration,
			easing: easings[options.easing || DEFAULT_EASING],
			done: options.done
		};

		//Don't queue the animation if there's nothing to animate.
		if (!_scrollAnimation.topDiff) {
			if (_scrollAnimation.done) {
				_scrollAnimation.done.call(_instance, false);
			}

			_scrollAnimation = undefined;
		}

		return _instance;
	};

	/**
  * Stops animateTo animation.
  */
	Skrollr.prototype.stopAnimateTo = function () {
		if (_scrollAnimation && _scrollAnimation.done) {
			_scrollAnimation.done.call(_instance, true);
		}

		_scrollAnimation = undefined;
	};

	/**
  * Returns if an animation caused by animateTo is currently running.
  */
	Skrollr.prototype.isAnimatingTo = function () {
		return !!_scrollAnimation;
	};

	Skrollr.prototype.isMobile = function () {
		return _isMobile;
	};

	Skrollr.prototype.setScrollTop = function (top, force) {
		_forceRender = force === true;

		if (_isMobile) {
			_mobileOffset = Math.min(Math.max(top, 0), _maxKeyFrame);
		} else {
			window.scrollTo(0, top);
		}

		return _instance;
	};

	Skrollr.prototype.getScrollTop = function () {
		if (_isMobile) {
			return _mobileOffset;
		} else {
			return window.pageYOffset || documentElement.scrollTop || body.scrollTop || 0;
		}
	};

	Skrollr.prototype.getMaxScrollTop = function () {
		return _maxKeyFrame;
	};

	Skrollr.prototype.on = function (name, fn) {
		_listeners[name] = fn;

		return _instance;
	};

	Skrollr.prototype.off = function (name) {
		delete _listeners[name];

		return _instance;
	};

	Skrollr.prototype.destroy = function () {
		var cancelAnimFrame = polyfillCAF();
		cancelAnimFrame(_animFrame);
		_removeAllEvents();

		_updateClass(documentElement, [NO_SKROLLR_CLASS], [SKROLLR_CLASS, SKROLLR_DESKTOP_CLASS, SKROLLR_MOBILE_CLASS]);

		var skrollableIndex = 0;
		var skrollablesLength = _skrollables.length;

		for (; skrollableIndex < skrollablesLength; skrollableIndex++) {
			_reset(_skrollables[skrollableIndex].element);
		}

		documentElement.style.overflow = body.style.overflow = '';
		documentElement.style.height = body.style.height = '';

		if (_skrollrBody) {
			skrollr.setStyle(_skrollrBody, 'transform', 'none');
		}

		_instance = undefined;
		_skrollrBody = undefined;
		_listeners = undefined;
		_forceHeight = undefined;
		_maxKeyFrame = 0;
		_scale = 1;
		_constants = undefined;
		_mobileDeceleration = undefined;
		_direction = 'down';
		_lastTop = -1;
		_lastViewportWidth = 0;
		_lastViewportHeight = 0;
		_requestReflow = false;
		_scrollAnimation = undefined;
		_smoothScrollingEnabled = undefined;
		_smoothScrollingDuration = undefined;
		_smoothScrolling = undefined;
		_forceRender = undefined;
		_skrollableIdCounter = 0;
		_edgeStrategy = undefined;
		_isMobile = false;
		_mobileOffset = 0;
		_translateZ = undefined;
	};

	/*
 	Private methods.
 */

	var _initMobile = function () {
		var initialElement;
		var initialTouchY;
		var initialTouchX;
		var currentElement;
		var currentTouchY;
		var currentTouchX;
		var lastTouchY;
		var deltaY;

		var initialTouchTime;
		var currentTouchTime;
		var lastTouchTime;
		var deltaTime;

		_addEvent(documentElement, [EVENT_TOUCHSTART, EVENT_TOUCHMOVE, EVENT_TOUCHCANCEL, EVENT_TOUCHEND].join(' '), function (e) {
			var touch = e.changedTouches[0];

			currentElement = e.target;

			//We don't want text nodes.
			while (currentElement.nodeType === 3) {
				currentElement = currentElement.parentNode;
			}

			currentTouchY = touch.clientY;
			currentTouchX = touch.clientX;
			currentTouchTime = e.timeStamp;

			if (!rxTouchIgnoreTags.test(currentElement.tagName)) {
				e.preventDefault();
			}

			switch (e.type) {
				case EVENT_TOUCHSTART:
					//The last element we tapped on.
					if (initialElement) {
						initialElement.blur();
					}

					_instance.stopAnimateTo();

					initialElement = currentElement;

					initialTouchY = lastTouchY = currentTouchY;
					initialTouchX = currentTouchX;
					initialTouchTime = currentTouchTime;

					break;
				case EVENT_TOUCHMOVE:
					//Prevent default event on touchIgnore elements in case they don't have focus yet.
					if (rxTouchIgnoreTags.test(currentElement.tagName) && document.activeElement !== currentElement) {
						e.preventDefault();
					}

					deltaY = currentTouchY - lastTouchY;
					deltaTime = currentTouchTime - lastTouchTime;

					_instance.setScrollTop(_mobileOffset - deltaY, true);

					lastTouchY = currentTouchY;
					lastTouchTime = currentTouchTime;
					break;
				default:
				case EVENT_TOUCHCANCEL:
				case EVENT_TOUCHEND:
					var distanceY = initialTouchY - currentTouchY;
					var distanceX = initialTouchX - currentTouchX;
					var distance2 = distanceX * distanceX + distanceY * distanceY;

					//Check if it was more like a tap (moved less than 7px).
					if (distance2 < 49) {
						if (!rxTouchIgnoreTags.test(initialElement.tagName)) {
							initialElement.focus();

							//It was a tap, click the element.
							var clickEvent = document.createEvent('MouseEvents');
							clickEvent.initMouseEvent('click', true, true, e.view, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
							initialElement.dispatchEvent(clickEvent);
						}

						return;
					}

					initialElement = undefined;

					var speed = deltaY / deltaTime;

					//Cap speed at 3 pixel/ms.
					speed = Math.max(Math.min(speed, 3), -3);

					var duration = Math.abs(speed / _mobileDeceleration);
					var targetOffset = speed * duration + 0.5 * _mobileDeceleration * duration * duration;
					var targetTop = _instance.getScrollTop() - targetOffset;

					//Relative duration change for when scrolling above bounds.
					var targetRatio = 0;

					//Change duration proportionally when scrolling would leave bounds.
					if (targetTop > _maxKeyFrame) {
						targetRatio = (_maxKeyFrame - targetTop) / targetOffset;

						targetTop = _maxKeyFrame;
					} else if (targetTop < 0) {
						targetRatio = -targetTop / targetOffset;

						targetTop = 0;
					}

					duration = duration * (1 - targetRatio);

					_instance.animateTo(targetTop + 0.5 | 0, { easing: 'outCubic', duration: duration });
					break;
			}
		});

		//Just in case there has already been some native scrolling, reset it.
		window.scrollTo(0, 0);
		documentElement.style.overflow = body.style.overflow = 'hidden';
	};

	/**
  * Updates key frames which depend on others / need to be updated on resize.
  * That is "end" in "absolute" mode and all key frames in "relative" mode.
  * Also handles constants, because they may change on resize.
  */
	var _updateDependentKeyFrames = function () {
		var viewportHeight = documentElement.clientHeight;
		var processedConstants = _processConstants();
		var skrollable;
		var element;
		var anchorTarget;
		var keyFrames;
		var keyFrameIndex;
		var keyFramesLength;
		var kf;
		var skrollableIndex;
		var skrollablesLength;
		var offset;
		var constantValue;

		//First process all relative-mode elements and find the max key frame.
		skrollableIndex = 0;
		skrollablesLength = _skrollables.length;

		for (; skrollableIndex < skrollablesLength; skrollableIndex++) {
			skrollable = _skrollables[skrollableIndex];
			element = skrollable.element;
			anchorTarget = skrollable.anchorTarget;
			keyFrames = skrollable.keyFrames;

			keyFrameIndex = 0;
			keyFramesLength = keyFrames.length;

			for (; keyFrameIndex < keyFramesLength; keyFrameIndex++) {
				kf = keyFrames[keyFrameIndex];

				offset = kf.offset;
				constantValue = processedConstants[kf.constant] || 0;

				kf.frame = offset;

				if (kf.isPercentage) {
					//Convert the offset to percentage of the viewport height.
					offset = offset * viewportHeight;

					//Absolute + percentage mode.
					kf.frame = offset;
				}

				if (kf.mode === 'relative') {
					_reset(element);

					kf.frame = _instance.relativeToAbsolute(anchorTarget, kf.anchors[0], kf.anchors[1]) - offset;

					_reset(element, true);
				}

				kf.frame += constantValue;

				//Only search for max key frame when forceHeight is enabled.
				if (_forceHeight) {
					//Find the max key frame, but don't use one of the data-end ones for comparison.
					if (!kf.isEnd && kf.frame > _maxKeyFrame) {
						_maxKeyFrame = kf.frame;
					}
				}
			}
		}

		//#133: The document can be larger than the maxKeyFrame we found.
		_maxKeyFrame = Math.max(_maxKeyFrame, _getDocumentHeight());

		//Now process all data-end keyframes.
		skrollableIndex = 0;
		skrollablesLength = _skrollables.length;

		for (; skrollableIndex < skrollablesLength; skrollableIndex++) {
			skrollable = _skrollables[skrollableIndex];
			keyFrames = skrollable.keyFrames;

			keyFrameIndex = 0;
			keyFramesLength = keyFrames.length;

			for (; keyFrameIndex < keyFramesLength; keyFrameIndex++) {
				kf = keyFrames[keyFrameIndex];

				constantValue = processedConstants[kf.constant] || 0;

				if (kf.isEnd) {
					kf.frame = _maxKeyFrame - kf.offset + constantValue;
				}
			}

			skrollable.keyFrames.sort(_keyFrameComparator);
		}
	};

	/**
  * Calculates and sets the style properties for the element at the given frame.
  * @param fakeFrame The frame to render at when smooth scrolling is enabled.
  * @param actualFrame The actual frame we are at.
  */
	var _calcSteps = function (fakeFrame, actualFrame) {
		//Iterate over all skrollables.
		var skrollableIndex = 0;
		var skrollablesLength = _skrollables.length;

		for (; skrollableIndex < skrollablesLength; skrollableIndex++) {
			var skrollable = _skrollables[skrollableIndex];
			var element = skrollable.element;
			var frame = skrollable.smoothScrolling ? fakeFrame : actualFrame;
			var frames = skrollable.keyFrames;
			var framesLength = frames.length;
			var firstFrame = frames[0];
			var lastFrame = frames[frames.length - 1];
			var beforeFirst = frame < firstFrame.frame;
			var afterLast = frame > lastFrame.frame;
			var firstOrLastFrame = beforeFirst ? firstFrame : lastFrame;
			var emitEvents = skrollable.emitEvents;
			var lastFrameIndex = skrollable.lastFrameIndex;
			var key;
			var value;

			//If we are before/after the first/last frame, set the styles according to the given edge strategy.
			if (beforeFirst || afterLast) {
				//Check if we already handled this edge case last time.
				//Note: using setScrollTop it's possible that we jumped from one edge to the other.
				if (beforeFirst && skrollable.edge === -1 || afterLast && skrollable.edge === 1) {
					continue;
				}

				//Add the skrollr-before or -after class.
				if (beforeFirst) {
					_updateClass(element, [SKROLLABLE_BEFORE_CLASS], [SKROLLABLE_AFTER_CLASS, SKROLLABLE_BETWEEN_CLASS]);

					//This handles the special case where we exit the first keyframe.
					if (emitEvents && lastFrameIndex > -1) {
						_emitEvent(element, firstFrame.eventType, _direction);
						skrollable.lastFrameIndex = -1;
					}
				} else {
					_updateClass(element, [SKROLLABLE_AFTER_CLASS], [SKROLLABLE_BEFORE_CLASS, SKROLLABLE_BETWEEN_CLASS]);

					//This handles the special case where we exit the last keyframe.
					if (emitEvents && lastFrameIndex < framesLength) {
						_emitEvent(element, lastFrame.eventType, _direction);
						skrollable.lastFrameIndex = framesLength;
					}
				}

				//Remember that we handled the edge case (before/after the first/last keyframe).
				skrollable.edge = beforeFirst ? -1 : 1;

				switch (skrollable.edgeStrategy) {
					case 'reset':
						_reset(element);
						continue;
					case 'ease':
						//Handle this case like it would be exactly at first/last keyframe and just pass it on.
						frame = firstOrLastFrame.frame;
						break;
					default:
					case 'set':
						var props = firstOrLastFrame.props;

						for (key in props) {
							if (hasProp.call(props, key)) {
								value = _interpolateString(props[key].value);

								//Set style or attribute.
								if (key.indexOf('@') === 0) {
									element.setAttribute(key.substr(1), value);
								} else {
									skrollr.setStyle(element, key, value);
								}
							}
						}

						continue;
				}
			} else {
				//Did we handle an edge last time?
				if (skrollable.edge !== 0) {
					_updateClass(element, [SKROLLABLE_CLASS, SKROLLABLE_BETWEEN_CLASS], [SKROLLABLE_BEFORE_CLASS, SKROLLABLE_AFTER_CLASS]);
					skrollable.edge = 0;
				}
			}

			//Find out between which two key frames we are right now.
			var keyFrameIndex = 0;

			for (; keyFrameIndex < framesLength - 1; keyFrameIndex++) {
				if (frame >= frames[keyFrameIndex].frame && frame <= frames[keyFrameIndex + 1].frame) {
					var left = frames[keyFrameIndex];
					var right = frames[keyFrameIndex + 1];

					for (key in left.props) {
						if (hasProp.call(left.props, key)) {
							var progress = (frame - left.frame) / (right.frame - left.frame);

							//Transform the current progress using the given easing function.
							progress = left.props[key].easing(progress);

							//Interpolate between the two values
							value = _calcInterpolation(left.props[key].value, right.props[key].value, progress);

							value = _interpolateString(value);

							//Set style or attribute.
							if (key.indexOf('@') === 0) {
								element.setAttribute(key.substr(1), value);
							} else {
								skrollr.setStyle(element, key, value);
							}
						}
					}

					//Are events enabled on this element?
					//This code handles the usual cases of scrolling through different keyframes.
					//The special cases of before first and after last keyframe are handled above.
					if (emitEvents) {
						//Did we pass a new keyframe?
						if (lastFrameIndex !== keyFrameIndex) {
							if (_direction === 'down') {
								_emitEvent(element, left.eventType, _direction);
							} else {
								_emitEvent(element, right.eventType, _direction);
							}

							skrollable.lastFrameIndex = keyFrameIndex;
						}
					}

					break;
				}
			}
		}
	};

	/**
  * Renders all elements.
  */
	var _render = function () {
		if (_requestReflow) {
			_requestReflow = false;
			_reflow();
		}

		//We may render something else than the actual scrollbar position.
		var renderTop = _instance.getScrollTop();

		//If there's an animation, which ends in current render call, call the callback after rendering.
		var afterAnimationCallback;
		var now = _now();
		var progress;

		//Before actually rendering handle the scroll animation, if any.
		if (_scrollAnimation) {
			//It's over
			if (now >= _scrollAnimation.endTime) {
				renderTop = _scrollAnimation.targetTop;
				afterAnimationCallback = _scrollAnimation.done;
				_scrollAnimation = undefined;
			} else {
				//Map the current progress to the new progress using given easing function.
				progress = _scrollAnimation.easing((now - _scrollAnimation.startTime) / _scrollAnimation.duration);

				renderTop = _scrollAnimation.startTop + progress * _scrollAnimation.topDiff | 0;
			}

			_instance.setScrollTop(renderTop, true);
		}
		//Smooth scrolling only if there's no animation running and if we're not forcing the rendering.
		else if (!_forceRender) {
				var smoothScrollingDiff = _smoothScrolling.targetTop - renderTop;

				//The user scrolled, start new smooth scrolling.
				if (smoothScrollingDiff) {
					_smoothScrolling = {
						startTop: _lastTop,
						topDiff: renderTop - _lastTop,
						targetTop: renderTop,
						startTime: _lastRenderCall,
						endTime: _lastRenderCall + _smoothScrollingDuration
					};
				}

				//Interpolate the internal scroll position (not the actual scrollbar).
				if (now <= _smoothScrolling.endTime) {
					//Map the current progress to the new progress using easing function.
					progress = easings.sqrt((now - _smoothScrolling.startTime) / _smoothScrollingDuration);

					renderTop = _smoothScrolling.startTop + progress * _smoothScrolling.topDiff | 0;
				}
			}

		//Did the scroll position even change?
		if (_forceRender || _lastTop !== renderTop) {
			//Remember in which direction are we scrolling?
			_direction = renderTop > _lastTop ? 'down' : renderTop < _lastTop ? 'up' : _direction;

			_forceRender = false;

			var listenerParams = {
				curTop: renderTop,
				lastTop: _lastTop,
				maxTop: _maxKeyFrame,
				direction: _direction
			};

			//Tell the listener we are about to render.
			var continueRendering = _listeners.beforerender && _listeners.beforerender.call(_instance, listenerParams);

			//The beforerender listener function is able the cancel rendering.
			if (continueRendering !== false) {
				//Now actually interpolate all the styles.
				_calcSteps(renderTop, _instance.getScrollTop());

				//That's were we actually "scroll" on mobile.
				if (_isMobile && _skrollrBody) {
					//Set the transform ("scroll it").
					skrollr.setStyle(_skrollrBody, 'transform', 'translate(0, ' + -_mobileOffset + 'px) ' + _translateZ);
				}

				//Remember when we last rendered.
				_lastTop = renderTop;

				if (_listeners.render) {
					_listeners.render.call(_instance, listenerParams);
				}
			}

			if (afterAnimationCallback) {
				afterAnimationCallback.call(_instance, false);
			}
		}

		_lastRenderCall = now;
	};

	/**
  * Parses the properties for each key frame of the given skrollable.
  */
	var _parseProps = function (skrollable) {
		//Iterate over all key frames
		var keyFrameIndex = 0;
		var keyFramesLength = skrollable.keyFrames.length;

		for (; keyFrameIndex < keyFramesLength; keyFrameIndex++) {
			var frame = skrollable.keyFrames[keyFrameIndex];
			var easing;
			var value;
			var prop;
			var props = {};

			var match;

			while ((match = rxPropValue.exec(frame.props)) !== null) {
				prop = match[1];
				value = match[2];

				easing = prop.match(rxPropEasing);

				//Is there an easing specified for this prop?
				if (easing !== null) {
					prop = easing[1];
					easing = easing[2];
				} else {
					easing = DEFAULT_EASING;
				}

				//Exclamation point at first position forces the value to be taken literal.
				value = value.indexOf('!') ? _parseProp(value) : [value.slice(1)];

				//Save the prop for this key frame with his value and easing function
				props[prop] = {
					value: value,
					easing: easings[easing]
				};
			}

			frame.props = props;
		}
	};

	/**
  * Parses a value extracting numeric values and generating a format string
  * for later interpolation of the new values in old string.
  *
  * @param val The CSS value to be parsed.
  * @return Something like ["rgba(?%,?%, ?%,?)", 100, 50, 0, .7]
  * where the first element is the format string later used
  * and all following elements are the numeric value.
  */
	var _parseProp = function (val) {
		var numbers = [];

		//One special case, where floats don't work.
		//We replace all occurences of rgba colors
		//which don't use percentage notation with the percentage notation.
		rxRGBAIntegerColor.lastIndex = 0;
		val = val.replace(rxRGBAIntegerColor, function (rgba) {
			return rgba.replace(rxNumericValue, function (n) {
				return n / 255 * 100 + '%';
			});
		});

		//Handle prefixing of "gradient" values.
		//For now only the prefixed value will be set. Unprefixed isn't supported anyway.
		if (theDashedCSSPrefix) {
			rxGradient.lastIndex = 0;
			val = val.replace(rxGradient, function (s) {
				return theDashedCSSPrefix + s;
			});
		}

		//Now parse ANY number inside this string and create a format string.
		val = val.replace(rxNumericValue, function (n) {
			numbers.push(+n);
			return '{?}';
		});

		//Add the formatstring as first value.
		numbers.unshift(val);

		return numbers;
	};

	/**
  * Fills the key frames with missing left and right hand properties.
  * If key frame 1 has property X and key frame 2 is missing X,
  * but key frame 3 has X again, then we need to assign X to key frame 2 too.
  *
  * @param sk A skrollable.
  */
	var _fillProps = function (sk) {
		//Will collect the properties key frame by key frame
		var propList = {};
		var keyFrameIndex;
		var keyFramesLength;

		//Iterate over all key frames from left to right
		keyFrameIndex = 0;
		keyFramesLength = sk.keyFrames.length;

		for (; keyFrameIndex < keyFramesLength; keyFrameIndex++) {
			_fillPropForFrame(sk.keyFrames[keyFrameIndex], propList);
		}

		//Now do the same from right to fill the last gaps

		propList = {};

		//Iterate over all key frames from right to left
		keyFrameIndex = sk.keyFrames.length - 1;

		for (; keyFrameIndex >= 0; keyFrameIndex--) {
			_fillPropForFrame(sk.keyFrames[keyFrameIndex], propList);
		}
	};

	var _fillPropForFrame = function (frame, propList) {
		var key;

		//For each key frame iterate over all right hand properties and assign them,
		//but only if the current key frame doesn't have the property by itself
		for (key in propList) {
			//The current frame misses this property, so assign it.
			if (!hasProp.call(frame.props, key)) {
				frame.props[key] = propList[key];
			}
		}

		//Iterate over all props of the current frame and collect them
		for (key in frame.props) {
			propList[key] = frame.props[key];
		}
	};

	/**
  * Calculates the new values for two given values array.
  */
	var _calcInterpolation = function (val1, val2, progress) {
		var valueIndex;
		var val1Length = val1.length;

		//They both need to have the same length
		if (val1Length !== val2.length) {
			throw 'Can\'t interpolate between "' + val1[0] + '" and "' + val2[0] + '"';
		}

		//Add the format string as first element.
		var interpolated = [val1[0]];

		valueIndex = 1;

		for (; valueIndex < val1Length; valueIndex++) {
			//That's the line where the two numbers are actually interpolated.
			interpolated[valueIndex] = val1[valueIndex] + (val2[valueIndex] - val1[valueIndex]) * progress;
		}

		return interpolated;
	};

	/**
  * Interpolates the numeric values into the format string.
  */
	var _interpolateString = function (val) {
		var valueIndex = 1;

		rxInterpolateString.lastIndex = 0;

		return val[0].replace(rxInterpolateString, function () {
			return val[valueIndex++];
		});
	};

	/**
  * Resets the class and style attribute to what it was before skrollr manipulated the element.
  * Also remembers the values it had before reseting, in order to undo the reset.
  */
	var _reset = function (elements, undo) {
		//We accept a single element or an array of elements.
		elements = [].concat(elements);

		var skrollable;
		var element;
		var elementsIndex = 0;
		var elementsLength = elements.length;

		for (; elementsIndex < elementsLength; elementsIndex++) {
			element = elements[elementsIndex];
			skrollable = _skrollables[element[SKROLLABLE_ID_DOM_PROPERTY]];

			//Couldn't find the skrollable for this DOM element.
			if (!skrollable) {
				continue;
			}

			if (undo) {
				//Reset class and style to the "dirty" (set by skrollr) values.
				element.style.cssText = skrollable.dirtyStyleAttr;
				_updateClass(element, skrollable.dirtyClassAttr);
			} else {
				//Remember the "dirty" (set by skrollr) class and style.
				skrollable.dirtyStyleAttr = element.style.cssText;
				skrollable.dirtyClassAttr = _getClass(element);

				//Reset class and style to what it originally was.
				element.style.cssText = skrollable.styleAttr;
				_updateClass(element, skrollable.classAttr);
			}
		}
	};

	/**
  * Detects support for 3d transforms by applying it to the skrollr-body.
  */
	var _detect3DTransforms = function () {
		_translateZ = 'translateZ(0)';
		skrollr.setStyle(_skrollrBody, 'transform', _translateZ);

		var computedStyle = getStyle(_skrollrBody);
		var computedTransform = computedStyle.getPropertyValue('transform');
		var computedTransformWithPrefix = computedStyle.getPropertyValue(theDashedCSSPrefix + 'transform');
		var has3D = computedTransform && computedTransform !== 'none' || computedTransformWithPrefix && computedTransformWithPrefix !== 'none';

		if (!has3D) {
			_translateZ = '';
		}
	};

	/**
  * Set the CSS property on the given element. Sets prefixed properties as well.
  */
	skrollr.setStyle = function (el, prop, val) {
		var style = el.style;

		//Camel case.
		prop = prop.replace(rxCamelCase, rxCamelCaseFn).replace('-', '');

		//Make sure z-index gets a <integer>.
		//This is the only <integer> case we need to handle.
		if (prop === 'zIndex') {
			if (isNaN(val)) {
				//If it's not a number, don't touch it.
				//It could for example be "auto" (#351).
				style[prop] = val;
			} else {
				//Floor the number.
				style[prop] = '' + (val | 0);
			}
		}
		//#64: "float" can't be set across browsers. Needs to use "cssFloat" for all except IE.
		else if (prop === 'float') {
				style.styleFloat = style.cssFloat = val;
			} else {
				//Need try-catch for old IE.
				try {
					//Set prefixed property if there's a prefix.
					if (theCSSPrefix) {
						style[theCSSPrefix + prop.slice(0, 1).toUpperCase() + prop.slice(1)] = val;
					}

					//Set unprefixed.
					style[prop] = val;
				} catch (ignore) {}
			}
	};

	/**
  * Cross browser event handling.
  */
	var _addEvent = skrollr.addEvent = function (element, names, callback) {
		var intermediate = function (e) {
			//Normalize IE event stuff.
			e = e || window.event;

			if (!e.target) {
				e.target = e.srcElement;
			}

			if (!e.preventDefault) {
				e.preventDefault = function () {
					e.returnValue = false;
					e.defaultPrevented = true;
				};
			}

			return callback.call(this, e);
		};

		names = names.split(' ');

		var name;
		var nameCounter = 0;
		var namesLength = names.length;

		for (; nameCounter < namesLength; nameCounter++) {
			name = names[nameCounter];

			if (element.addEventListener) {
				element.addEventListener(name, callback, false);
			} else {
				element.attachEvent('on' + name, intermediate);
			}

			//Remember the events to be able to flush them later.
			_registeredEvents.push({
				element: element,
				name: name,
				listener: callback
			});
		}
	};

	var _removeEvent = skrollr.removeEvent = function (element, names, callback) {
		names = names.split(' ');

		var nameCounter = 0;
		var namesLength = names.length;

		for (; nameCounter < namesLength; nameCounter++) {
			if (element.removeEventListener) {
				element.removeEventListener(names[nameCounter], callback, false);
			} else {
				element.detachEvent('on' + names[nameCounter], callback);
			}
		}
	};

	var _removeAllEvents = function () {
		var eventData;
		var eventCounter = 0;
		var eventsLength = _registeredEvents.length;

		for (; eventCounter < eventsLength; eventCounter++) {
			eventData = _registeredEvents[eventCounter];

			_removeEvent(eventData.element, eventData.name, eventData.listener);
		}

		_registeredEvents = [];
	};

	var _emitEvent = function (element, name, direction) {
		if (_listeners.keyframe) {
			_listeners.keyframe.call(_instance, element, name, direction);
		}
	};

	var _reflow = function () {
		var pos = _instance.getScrollTop();

		//Will be recalculated by _updateDependentKeyFrames.
		_maxKeyFrame = 0;

		if (_forceHeight && !_isMobile) {
			//un-"force" the height to not mess with the calculations in _updateDependentKeyFrames (#216).
			body.style.height = '';
		}

		_updateDependentKeyFrames();

		if (_forceHeight && !_isMobile) {
			//"force" the height.
			body.style.height = _maxKeyFrame + documentElement.clientHeight + 'px';
		}

		//The scroll offset may now be larger than needed (on desktop the browser/os prevents scrolling farther than the bottom).
		if (_isMobile) {
			_instance.setScrollTop(Math.min(_instance.getScrollTop(), _maxKeyFrame));
		} else {
			//Remember and reset the scroll pos (#217).
			_instance.setScrollTop(pos, true);
		}

		_forceRender = true;
	};

	/*
  * Returns a copy of the constants object where all functions and strings have been evaluated.
  */
	var _processConstants = function () {
		var viewportHeight = documentElement.clientHeight;
		var copy = {};
		var prop;
		var value;

		for (prop in _constants) {
			value = _constants[prop];

			if (typeof value === 'function') {
				value = value.call(_instance);
			}
			//Percentage offset.
			else if (/p$/.test(value)) {
					value = value.slice(0, -1) / 100 * viewportHeight;
				}

			copy[prop] = value;
		}

		return copy;
	};

	/*
  * Returns the height of the document.
  */
	var _getDocumentHeight = function () {
		var skrollrBodyHeight = 0;
		var bodyHeight;

		if (_skrollrBody) {
			skrollrBodyHeight = Math.max(_skrollrBody.offsetHeight, _skrollrBody.scrollHeight);
		}

		bodyHeight = Math.max(skrollrBodyHeight, body.scrollHeight, body.offsetHeight, documentElement.scrollHeight, documentElement.offsetHeight, documentElement.clientHeight);

		return bodyHeight - documentElement.clientHeight;
	};

	/**
  * Returns a string of space separated classnames for the current element.
  * Works with SVG as well.
  */
	var _getClass = function (element) {
		var prop = 'className';

		//SVG support by using className.baseVal instead of just className.
		if (window.SVGElement && element instanceof window.SVGElement) {
			element = element[prop];
			prop = 'baseVal';
		}

		return element[prop];
	};

	/**
  * Adds and removes a CSS classes.
  * Works with SVG as well.
  * add and remove are arrays of strings,
  * or if remove is ommited add is a string and overwrites all classes.
  */
	var _updateClass = function (element, add, remove) {
		var prop = 'className';

		//SVG support by using className.baseVal instead of just className.
		if (window.SVGElement && element instanceof window.SVGElement) {
			element = element[prop];
			prop = 'baseVal';
		}

		//When remove is ommited, we want to overwrite/set the classes.
		if (remove === undefined) {
			element[prop] = add;
			return;
		}

		//Cache current classes. We will work on a string before passing back to DOM.
		var val = element[prop];

		//All classes to be removed.
		var classRemoveIndex = 0;
		var removeLength = remove.length;

		for (; classRemoveIndex < removeLength; classRemoveIndex++) {
			val = _untrim(val).replace(_untrim(remove[classRemoveIndex]), ' ');
		}

		val = _trim(val);

		//All classes to be added.
		var classAddIndex = 0;
		var addLength = add.length;

		for (; classAddIndex < addLength; classAddIndex++) {
			//Only add if el not already has class.
			if (_untrim(val).indexOf(_untrim(add[classAddIndex])) === -1) {
				val += ' ' + add[classAddIndex];
			}
		}

		element[prop] = _trim(val);
	};

	var _trim = function (a) {
		return a.replace(rxTrim, '');
	};

	/**
  * Adds a space before and after the string.
  */
	var _untrim = function (a) {
		return ' ' + a + ' ';
	};

	var _now = Date.now || function () {
		return +new Date();
	};

	var _keyFrameComparator = function (a, b) {
		return a.frame - b.frame;
	};

	/*
  * Private variables.
  */

	//Singleton
	var _instance;

	/*
 	A list of all elements which should be animated associated with their the metadata.
 	Exmaple skrollable with two key frames animating from 100px width to 20px:
 		skrollable = {
 		element: <the DOM element>,
 		styleAttr: <style attribute of the element before skrollr>,
 		classAttr: <class attribute of the element before skrollr>,
 		keyFrames: [
 			{
 				frame: 100,
 				props: {
 					width: {
 						value: ['{?}px', 100],
 						easing: <reference to easing function>
 					}
 				},
 				mode: "absolute"
 			},
 			{
 				frame: 200,
 				props: {
 					width: {
 						value: ['{?}px', 20],
 						easing: <reference to easing function>
 					}
 				},
 				mode: "absolute"
 			}
 		]
 	};
 */
	var _skrollables;

	var _skrollrBody;

	var _listeners;
	var _forceHeight;
	var _maxKeyFrame = 0;

	var _scale = 1;
	var _constants;

	var _mobileDeceleration;

	//Current direction (up/down).
	var _direction = 'down';

	//The last top offset value. Needed to determine direction.
	var _lastTop = -1;

	//The last time we called the render method (doesn't mean we rendered!).
	var _lastRenderCall = _now();

	//For detecting if it actually resized (#271).
	var _lastViewportWidth = 0;
	var _lastViewportHeight = 0;

	var _requestReflow = false;

	//Will contain data about a running scrollbar animation, if any.
	var _scrollAnimation;

	var _smoothScrollingEnabled;

	var _smoothScrollingDuration;

	//Will contain settins for smooth scrolling if enabled.
	var _smoothScrolling;

	//Can be set by any operation/event to force rendering even if the scrollbar didn't move.
	var _forceRender;

	//Each skrollable gets an unique ID incremented for each skrollable.
	//The ID is the index in the _skrollables array.
	var _skrollableIdCounter = 0;

	var _edgeStrategy;

	//Mobile specific vars. Will be stripped by UglifyJS when not in use.
	var _isMobile = false;

	//The virtual scroll offset when using mobile scrolling.
	var _mobileOffset = 0;

	//If the browser supports 3d transforms, this will be filled with 'translateZ(0)' (empty string otherwise).
	var _translateZ;

	//Will contain data about registered events by skrollr.
	var _registeredEvents = [];

	//Animation frame id returned by RequestAnimationFrame (or timeout when RAF is not supported).
	var _animFrame;

	//Expose skrollr as either a global variable or a require.js module.
	if (typeof define === 'function' && define.amd) {
		define([], function () {
			return skrollr;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = skrollr;
	} else {
		window.skrollr = skrollr;
	}
})(window, document);
/*!
 * skrollr stylesheets.
 * Parses stylesheets and searches for skrollr keyframe declarations.
 * Converts them to data-attributes.
 * Doesn't expose any globals.
 */

(function (window, document, undefined) {
	'use strict';

	var content;
	var contents = [];

	//Finds the declaration of an animation block.
	var rxAnimation = /@-skrollr-keyframes\s+([\w-]+)/g;

	//Finds the block of keyframes inside an animation block.
	//http://regexpal.com/ saves your ass with stuff like this.
	var rxKeyframes = /\s*\{\s*((?:[^{]+\{[^}]*\}\s*)+?)\s*\}/g;

	//Gets a single keyframe and the properties inside.
	var rxSingleKeyframe = /([\w\-]+)\s*\{([^}]+)\}/g;

	//Optional keyframe name prefix to work around SASS (>3.4) issues
	var keyframeNameOptionalPrefix = 'skrollr-';

	//Finds usages of the animation.
	var rxAnimationUsage = /-skrollr-animation-name\s*:\s*([\w-]+)/g;

	//Finds usages of attribute setters.
	var rxAttributeSetter = /-skrollr-(anchor-target|smooth-scrolling|emit-events|menu-offset)\s*:\s*['"]([^'"]+)['"]/g;

	var fetchRemote = function (url) {
		var xhr = new XMLHttpRequest();

		/*
   * Yes, these are SYNCHRONOUS requests.
   * Simply because skrollr stylesheets should run while the page is loaded.
   * Get over it.
   */
		try {
			xhr.open('GET', url, false);
			xhr.send(null);
		} catch (e) {
			//Fallback to XDomainRequest if available
			if (window.XDomainRequest) {
				xhr = new XDomainRequest();
				xhr.open('GET', url, false);
				xhr.send(null);
			}
		}

		return xhr.responseText;
	};

	//"main"
	var kickstart = function (stylesheets) {
		//Iterate over all stylesheets, embedded and remote.
		for (var stylesheetIndex = 0; stylesheetIndex < stylesheets.length; stylesheetIndex++) {
			var sheet = stylesheets[stylesheetIndex];

			if (sheet.tagName === 'LINK') {
				if (sheet.getAttribute('data-skrollr-stylesheet') === null) {
					continue;
				}

				//Test media attribute if matchMedia available.
				if (window.matchMedia) {
					var media = sheet.getAttribute('media');

					if (media && !matchMedia(media).matches) {
						continue;
					}
				}

				//Remote stylesheet, fetch it (synchrnonous).
				content = fetchRemote(sheet.href);
			} else {
				//Embedded stylesheet, grab the node content.
				content = sheet.textContent || sheet.innerText || sheet.innerHTML;
			}

			if (content) {
				contents.push(content);
			}
		}

		//We take the stylesheets in reverse order.
		//This is needed to ensure correct order of stylesheets and inline styles.
		contents.reverse();

		var animations = {};
		var selectors = [];
		var attributes = [];

		//Now parse all stylesheets.
		for (var contentIndex = 0; contentIndex < contents.length; contentIndex++) {
			content = contents[contentIndex];

			parseAnimationDeclarations(content, animations);
			parseAnimationUsage(content, selectors);
			parseAttributeSetters(content, attributes);
		}

		applyKeyframeAttributes(animations, selectors);
		applyAttributeSetters(attributes);
	};

	//Finds animation declarations and puts them into the output map.
	var parseAnimationDeclarations = function (input, output) {
		rxAnimation.lastIndex = 0;

		var animation;
		var rawKeyframes;
		var keyframe;
		var curAnimation;

		while ((animation = rxAnimation.exec(input)) !== null) {
			//Grab the keyframes inside this animation.
			rxKeyframes.lastIndex = rxAnimation.lastIndex;
			rawKeyframes = rxKeyframes.exec(input);

			//Grab the single keyframes with their CSS properties.
			rxSingleKeyframe.lastIndex = 0;

			//Save the animation in an object using it's name as key.
			curAnimation = output[animation[1]] = {};

			while ((keyframe = rxSingleKeyframe.exec(rawKeyframes[1])) !== null) {
				//Put all keyframes inside the animation using the keyframe (like botttom-top, or 100) as key
				//and the properties as value (just the raw string, newline stripped).
				curAnimation[keyframe[1]] = keyframe[2].replace(/[\n\r\t]/g, '');
			}
		}
	};

	//Extracts the selector of the given block by walking backwards to the start of the block.
	var extractSelector = function (input, startIndex) {
		var begin;
		var end = startIndex;

		//First find the curly bracket that opens this block.
		while (end-- && input.charAt(end) !== '{') {}

		//The end is now fixed to the right of the selector.
		//Now start there to find the begin of the selector.
		begin = end;

		//Now walk farther backwards until we grabbed the whole selector.
		//This either ends at beginning of string or at end of next block.
		while (begin-- && input.charAt(begin - 1) !== '}') {}

		//Return the cleaned selector.
		return input.substring(begin, end).replace(/[\n\r\t]/g, '');
	};

	//Finds usage of animations and puts the selectors into the output array.
	var parseAnimationUsage = function (input, output) {
		var match;
		var selector;

		rxAnimationUsage.lastIndex = 0;

		while ((match = rxAnimationUsage.exec(input)) !== null) {
			//Extract the selector of the block we found the animation in.
			selector = extractSelector(input, rxAnimationUsage.lastIndex);

			//Associate this selector with the animation name.
			output.push([selector, match[1]]);
		}
	};

	//Finds usage of attribute setters and puts the selector and attribute data into the output array.
	var parseAttributeSetters = function (input, output) {
		var match;
		var selector;

		rxAttributeSetter.lastIndex = 0;

		while ((match = rxAttributeSetter.exec(input)) !== null) {
			//Extract the selector of the block we found the animation in.
			selector = extractSelector(input, rxAttributeSetter.lastIndex);

			//Associate this selector with the attribute name and value.
			output.push([selector, match[1], match[2]]);
		}
	};

	//Applies the keyframes (as data-attributes) to the elements.
	var applyKeyframeAttributes = function (animations, selectors) {
		var elements;
		var keyframes;
		var keyframeName;
		var cleanKeyframeName;
		var elementIndex;
		var attributeName;
		var attributeValue;
		var curElement;

		for (var selectorIndex = 0; selectorIndex < selectors.length; selectorIndex++) {
			elements = document.querySelectorAll(selectors[selectorIndex][0]);

			if (!elements) {
				continue;
			}

			keyframes = animations[selectors[selectorIndex][1]];

			for (keyframeName in keyframes) {
				if (keyframeName.indexOf(keyframeNameOptionalPrefix) === 0) {
					cleanKeyframeName = keyframeName.substring(keyframeNameOptionalPrefix.length);
				} else {
					cleanKeyframeName = keyframeName;
				}

				for (elementIndex = 0; elementIndex < elements.length; elementIndex++) {
					curElement = elements[elementIndex];
					attributeName = 'data-' + cleanKeyframeName;
					attributeValue = keyframes[keyframeName];

					//If the element already has this keyframe inline, give the inline one precedence by putting it on the right side.
					//The inline one may actually be the result of the keyframes from another stylesheet.
					//Since we reversed the order of the stylesheets, everything comes together correctly here.
					if (curElement.hasAttribute(attributeName)) {
						attributeValue += curElement.getAttribute(attributeName);
					}

					curElement.setAttribute(attributeName, attributeValue);
				}
			}
		}
	};

	//Applies the keyframes (as data-attributes) to the elements.
	var applyAttributeSetters = function (selectors) {
		var curSelector;
		var elements;
		var attributeName;
		var attributeValue;
		var elementIndex;

		for (var selectorIndex = 0; selectorIndex < selectors.length; selectorIndex++) {
			curSelector = selectors[selectorIndex];
			elements = document.querySelectorAll(curSelector[0]);
			attributeName = 'data-' + curSelector[1];
			attributeValue = curSelector[2];

			if (!elements) {
				continue;
			}

			for (elementIndex = 0; elementIndex < elements.length; elementIndex++) {
				elements[elementIndex].setAttribute(attributeName, attributeValue);
			}
		}
	};

	kickstart(document.querySelectorAll('link, style'));
})(window, document);
// --------------------------------------------------
// SITE.JS
// --------------------------------------------------

// SMOOTH SCROLLING
$(function () {
  $('a[href*=\\#]:not([href=\\#])').click(function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});

// initialize skrollr
$(function () {
  // initialize skrollr if the window width is large enough
  if ($(window).width() > 767) {
    skrollr.init({ forceHeight: false });
  }
});

$(document).ready(function () {

  $('[data-trigger-mobile-nav]').on('click', function () {
    $('.mobile-nav-content').toggleClass('active');
  });

  // Initialize Foundation
  $(document).foundation();

  // Email protector
  $('a[data-email-protector]').emailProtector();

  // INITIALIZE SLIDERS
  var nav = $(".nav");
  $(window).on("scroll", function (e) {
    $(".mobile-nav-content").removeClass("active");

    if ($(window).scrollTop() > 10) {
      nav.addClass("nav-fixed");
    } else {
      nav.removeClass("nav-fixed");
    }
  });

  var marqueeSlider = $('#marquee-slider').royalSlider({
    addActiveClass: true,
    autoScaleSlider: true,
    loop: true,
    imageScaleMode: 'fill',
    fadeinLoadedSlide: false,
    keyboardNavEnabled: true
  }).data('royalSlider');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmFiaWRlLmpzIiwiZm91bmRhdGlvbi5hY2NvcmRpb24uanMiLCJmb3VuZGF0aW9uLnJldmVhbC5qcyIsImZvdW5kYXRpb24udGFicy5qcyIsImZvdW5kYXRpb24udG9vbHRpcC5qcyIsImZvdW5kYXRpb24udXRpbC5ib3guanMiLCJmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmQuanMiLCJmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5qcyIsImZvdW5kYXRpb24udXRpbC5tb3Rpb24uanMiLCJmb3VuZGF0aW9uLnV0aWwubmVzdC5qcyIsImZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzIiwiZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzLmpzIiwianF1ZXJ5LmVtYWlsLXByb3RlY3Rvci5qcyIsImpxdWVyeS5yb3lhbHNsaWRlci5jdXN0b20ubWluLmpzIiwic2tyb2xsci5qcyIsInNrcm9sbHIuc3R5bGVzaGVldHMuanMiLCJzaXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLENBQUMsQ0FBQyxVQUFTLElBQVQsRUFBZSxPQUFmLEVBQXdCO0FBQ3hCLE1BQUksT0FBTyxNQUFQLEtBQWtCLFVBQWxCLElBQWdDLE9BQU8sR0FBUCxFQUFZO0FBQzlDLFdBQU8sRUFBUCxFQUFXLFlBQVc7QUFDcEIsYUFBUSxTQUFSLENBRG9CO0tBQVgsQ0FBWCxDQUQ4QztHQUFoRCxNQUlPLElBQUksT0FBTyxPQUFQLEtBQW1CLFFBQW5CLEVBQTZCO0FBQ3RDLFdBQU8sT0FBUCxHQUFpQixTQUFqQixDQURzQztHQUFqQyxNQUVBO0FBQ0wsU0FBSyxTQUFMLEdBQWlCLFNBQWpCLENBREs7R0FGQTtDQUxQLEVBVUMsSUFWRCxFQVVPLFlBQVc7QUFDbEI7Ozs7Ozs7OztBQURrQjtBQVdsQixNQUFJLGFBQWEsRUFBYjs7O0FBWGMsTUFjZCxPQUFPLFNBQVMsSUFBVDs7O0FBZE8sTUFpQmQsU0FBUyxL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QW1CLEtBQW5CO0FBQ0Esd0JBQW9CLElBQXBCO0dBTmtCLEVBT2pCLElBUGlCLENBT1osYUFQWSxDQUFoQixDQXhCc0I7Q0FBVixDQUFsQiIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyI7KGZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKGZhY3RvcnkoKSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgcm9vdC53aGF0SW5wdXQgPSBmYWN0b3J5KCk7XG4gIH1cbn0gKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cblxuICAvKlxuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAgIHZhcmlhYmxlc1xuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAqL1xuXG4gIC8vIGFycmF5IG9mIGFjdGl2ZWx5IHByZXNzZWQga2V5c1xuICB2YXIgYWN0aXZlS2V5cyA9IFtdO1xuXG4gIC8vIGNhY2hlIGRvY3VtZW50LmJvZHlcbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuXG4gIC8vIGJvb2xlYW46IHRydWUgaWYgdG91Y2ggYnVmZmVyIHRpbWVyIGlzIHJ1bm5pbmdcbiAgdmFyIGJ1ZmZlciA9IGZhbHNlO1xuXG4gIC8vIHRoZSBsYXN0IHVzZWQgaW5wdXQgdHlwZVxuICB2YXIgY3VycmVudElucHV0ID0gbnVsbDtcblxuICAvLyBhcnJheSBvZiBmb3JtIGVsZW1lbnRzIHRoYXQgdGFrZSBrZXlib2FyZCBpbnB1dFxuICB2YXIgZm9ybUlucHV0cyA9IFtcbiAgICAnaW5wdXQnLFxuICAgICdzZWxlY3QnLFxuICAgICd0ZXh0YXJlYSdcbiAgXTtcblxuICAvLyB1c2VyLXNldCBmbGFnIHRvIGFsbG93IHR5cGluZyBpbiBmb3JtIGZpZWxkcyB0byBiZSByZWNvcmRlZFxuICB2YXIgZm9ybVR5cGluZyA9IGJvZHkuaGFzQXR0cmlidXRlKCdkYXRhLXdoYXRpbnB1dC1mb3JtdHlwaW5nJyk7XG5cbiAgLy8gbWFwcGluZyBvZiBldmVudHMgdG8gaW5wdXQgdHlwZXNcbiAgdmFyIGlucHV0TWFwID0ge1xuICAgICdrZXlkb3duJzogJ2tleWJvYXJkJyxcbiAgICAnbW91c2Vkb3duJzogJ21vdXNlJyxcbiAgICAnbW91c2VlbnRlcic6ICdtb3VzZScsXG4gICAgJ3RvdWNoc3RhcnQnOiAndG91Y2gnLFxuICAgICdwb2ludGVyZG93bic6ICdwb2ludGVyJyxcbiAgICAnTVNQb2ludGVyRG93bic6ICdwb2ludGVyJ1xuICB9O1xuXG4gIC8vIGFycmF5IG9mIGFsbCB1c2VkIGlucHV0IHR5cGVzXG4gIHZhciBpbnB1dFR5cGVzID0gW107XG5cbiAgLy8gbWFwcGluZyBvZiBrZXkgY29kZXMgdG8gY29tbW9uIG5hbWVcbiAgdmFyIGtleU1hcCA9IHtcbiAgICA5OiAndGFiJyxcbiAgICAxMzogJ2VudGVyJyxcbiAgICAxNjogJ3NoaWZ0JyxcbiAgICAyNzogJ2VzYycsXG4gICAgMzI6ICdzcGFjZScsXG4gICAgMzc6ICdsZWZ0JyxcbiAgICAzODogJ3VwJyxcbiAgICAzOTogJ3JpZ2h0JyxcbiAgICA0MDogJ2Rvd24nXG4gIH07XG5cbiAgLy8gbWFwIG9mIElFIDEwIHBvaW50ZXIgZXZlbnRzXG4gIHZhciBwb2ludGVyTWFwID0ge1xuICAgIDI6ICd0b3VjaCcsXG4gICAgMzogJ3RvdWNoJywgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcbiAgICA0OiAnbW91c2UnXG4gIH07XG5cbiAgLy8gdG91Y2ggYnVmZmVyIHRpbWVyXG4gIHZhciB0aW1lcjtcblxuXG4gIC8qXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICAgZnVuY3Rpb25zXG4gICAgLS0tLS0tLS0tLS0tLS0tXG4gICovXG5cbiAgZnVuY3Rpb24gYnVmZmVySW5wdXQoZXZlbnQpIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuXG4gICAgc2V0SW5wdXQoZXZlbnQpO1xuXG4gICAgYnVmZmVyID0gdHJ1ZTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBidWZmZXIgPSBmYWxzZTtcbiAgICB9LCAxMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGltbWVkaWF0ZUlucHV0KGV2ZW50KSB7XG4gICAgaWYgKCFidWZmZXIpIHNldElucHV0KGV2ZW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldElucHV0KGV2ZW50KSB7XG4gICAgdmFyIGV2ZW50S2V5ID0ga2V5KGV2ZW50KTtcbiAgICB2YXIgZXZlbnRUYXJnZXQgPSB0YXJnZXQoZXZlbnQpO1xuICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuICAgIGlmIChjdXJyZW50SW5wdXQgIT09IHZhbHVlKSB7XG4gICAgICBpZiAoXG4gICAgICAgIC8vIG9ubHkgaWYgdGhlIHVzZXIgZmxhZyBpc24ndCBzZXRcbiAgICAgICAgIWZvcm1UeXBpbmcgJiZcblxuICAgICAgICAvLyBvbmx5IGlmIGN1cnJlbnRJbnB1dCBoYXMgYSB2YWx1ZVxuICAgICAgICBjdXJyZW50SW5wdXQgJiZcblxuICAgICAgICAvLyBvbmx5IGlmIHRoZSBpbnB1dCBpcyBga2V5Ym9hcmRgXG4gICAgICAgIHZhbHVlID09PSAna2V5Ym9hcmQnICYmXG5cbiAgICAgICAgLy8gbm90IGlmIHRoZSBrZXkgaXMgYFRBQmBcbiAgICAgICAga2V5TWFwW2V2ZW50S2V5XSAhPT0gJ3RhYicgJiZcblxuICAgICAgICAvLyBvbmx5IGlmIHRoZSB0YXJnZXQgaXMgb25lIG9mIHRoZSBlbGVtZW50cyBpbiBgZm9ybUlucHV0c2BcbiAgICAgICAgZm9ybUlucHV0cy5pbmRleE9mKGV2ZW50VGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpID49IDBcbiAgICAgICkge1xuICAgICAgICAvLyBpZ25vcmUga2V5Ym9hcmQgdHlwaW5nIG9uIGZvcm0gZWxlbWVudHNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN1cnJlbnRJbnB1dCA9IHZhbHVlO1xuICAgICAgICBib2R5LnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQnLCBjdXJyZW50SW5wdXQpO1xuXG4gICAgICAgIGlmIChpbnB1dFR5cGVzLmluZGV4T2YoY3VycmVudElucHV0KSA9PT0gLTEpIGlucHV0VHlwZXMucHVzaChjdXJyZW50SW5wdXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh2YWx1ZSA9PT0gJ2tleWJvYXJkJykgbG9nS2V5cyhldmVudEtleSk7XG4gIH1cblxuICBmdW5jdGlvbiBrZXkoZXZlbnQpIHtcbiAgICByZXR1cm4gKGV2ZW50LmtleUNvZGUpID8gZXZlbnQua2V5Q29kZSA6IGV2ZW50LndoaWNoO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFyZ2V0KGV2ZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50LnRhcmdldCB8fCBldmVudC5zcmNFbGVtZW50O1xuICB9XG5cbiAgZnVuY3Rpb24gcG9pbnRlclR5cGUoZXZlbnQpIHtcbiAgICByZXR1cm4gKHR5cGVvZiBldmVudC5wb2ludGVyVHlwZSA9PT0gJ251bWJlcicpID8gcG9pbnRlck1hcFtldmVudC5wb2ludGVyVHlwZV0gOiBldmVudC5wb2ludGVyVHlwZTtcbiAgfVxuXG4gIC8vIGtleWJvYXJkIGxvZ2dpbmdcbiAgZnVuY3Rpb24gbG9nS2V5cyhldmVudEtleSkge1xuICAgIGlmIChhY3RpdmVLZXlzLmluZGV4T2Yoa2V5TWFwW2V2ZW50S2V5XSkgPT09IC0xICYmIGtleU1hcFtldmVudEtleV0pIGFjdGl2ZUtleXMucHVzaChrZXlNYXBbZXZlbnRLZXldKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVuTG9nS2V5cyhldmVudCkge1xuICAgIHZhciBldmVudEtleSA9IGtleShldmVudCk7XG4gICAgdmFyIGFycmF5UG9zID0gYWN0aXZlS2V5cy5pbmRleE9mKGtleU1hcFtldmVudEtleV0pO1xuXG4gICAgaWYgKGFycmF5UG9zICE9PSAtMSkgYWN0aXZlS2V5cy5zcGxpY2UoYXJyYXlQb3MsIDEpO1xuICB9XG5cbiAgZnVuY3Rpb24gYmluZEV2ZW50cygpIHtcblxuICAgIC8vIHBvaW50ZXIvbW91c2VcbiAgICB2YXIgbW91c2VFdmVudCA9ICdtb3VzZWRvd24nO1xuXG4gICAgaWYgKHdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcbiAgICAgIG1vdXNlRXZlbnQgPSAncG9pbnRlcmRvd24nO1xuICAgIH0gZWxzZSBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XG4gICAgICBtb3VzZUV2ZW50ID0gJ01TUG9pbnRlckRvd24nO1xuICAgIH1cblxuICAgIGJvZHkuYWRkRXZlbnRMaXN0ZW5lcihtb3VzZUV2ZW50LCBpbW1lZGlhdGVJbnB1dCk7XG4gICAgYm9keS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgaW1tZWRpYXRlSW5wdXQpO1xuXG4gICAgLy8gdG91Y2hcbiAgICBpZiAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB7XG4gICAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBidWZmZXJJbnB1dCk7XG4gICAgfVxuXG4gICAgLy8ga2V5Ym9hcmRcbiAgICBib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBpbW1lZGlhdGVJbnB1dCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1bkxvZ0tleXMpO1xuICB9XG5cblxuICAvKlxuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAgIGluaXRcblxuICAgIGRvbid0IHN0YXJ0IHNjcmlwdCB1bmxlc3MgYnJvd3NlciBjdXRzIHRoZSBtdXN0YXJkLFxuICAgIGFsc28gcGFzc2VzIGlmIHBvbHlmaWxscyBhcmUgdXNlZFxuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAqL1xuXG4gIGlmICgnYWRkRXZlbnRMaXN0ZW5lcicgaW4gd2luZG93ICYmIEFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgYmluZEV2ZW50cygpO1xuICB9XG5cblxuICAvKlxuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAgIGFwaVxuICAgIC0tLS0tLS0tLS0tLS0tLVxuICAqL1xuXG4gIHJldHVybiB7XG5cbiAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnQgaW5wdXQgdHlwZVxuICAgIGFzazogZnVuY3Rpb24oKSB7IHJldHVybiBjdXJyZW50SW5wdXQ7IH0sXG5cbiAgICAvLyByZXR1cm5zIGFycmF5OiBjdXJyZW50bHkgcHJlc3NlZCBrZXlzXG4gICAga2V5czogZnVuY3Rpb24oKSB7IHJldHVybiBhY3RpdmVLZXlzOyB9LFxuXG4gICAgLy8gcmV0dXJucyBhcnJheTogYWxsIHRoZSBkZXRlY3RlZCBpbnB1dCB0eXBlc1xuICAgIHR5cGVzOiBmdW5jdGlvbigpIHsgcmV0dXJuIGlucHV0VHlwZXM7IH0sXG5cbiAgICAvLyBhY2NlcHRzIHN0cmluZzogbWFudWFsbHkgc2V0IHRoZSBpbnB1dCB0eXBlXG4gICAgc2V0OiBzZXRJbnB1dFxuICB9O1xuXG59KSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogQWJpZGUgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmFiaWRlXG4gKi9cblxuY2xhc3MgQWJpZGUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBBYmlkZS5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBBYmlkZSNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIHRyaWdnZXIgdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyAgPSAkLmV4dGVuZCh7fSwgQWJpZGUuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0FiaWRlJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIEFiaWRlIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBBYmlkZSBmdW5jdGlvbmluZyBvbiBsb2FkLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy4kaW5wdXRzID0gdGhpcy4kZWxlbWVudC5maW5kKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcpLm5vdCgnW2RhdGEtYWJpZGUtaWdub3JlXScpO1xuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBBYmlkZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy5hYmlkZScpXG4gICAgICAub24oJ3Jlc2V0LnpmLmFiaWRlJywgKCkgPT4ge1xuICAgICAgICB0aGlzLnJlc2V0Rm9ybSgpO1xuICAgICAgfSlcbiAgICAgIC5vbignc3VibWl0LnpmLmFiaWRlJywgKCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZUZvcm0oKTtcbiAgICAgIH0pO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy52YWxpZGF0ZU9uID09PSAnZmllbGRDaGFuZ2UnKSB7XG4gICAgICB0aGlzLiRpbnB1dHNcbiAgICAgICAgLm9mZignY2hhbmdlLnpmLmFiaWRlJylcbiAgICAgICAgLm9uKCdjaGFuZ2UuemYuYWJpZGUnLCAoZSkgPT4ge1xuICAgICAgICAgIHRoaXMudmFsaWRhdGVJbnB1dCgkKGUudGFyZ2V0KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMubGl2ZVZhbGlkYXRlKSB7XG4gICAgICB0aGlzLiRpbnB1dHNcbiAgICAgICAgLm9mZignaW5wdXQuemYuYWJpZGUnKVxuICAgICAgICAub24oJ2lucHV0LnpmLmFiaWRlJywgKGUpID0+IHtcbiAgICAgICAgICB0aGlzLnZhbGlkYXRlSW5wdXQoJChlLnRhcmdldCkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgQWJpZGUgdXBvbiBET00gY2hhbmdlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVmbG93KCkge1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciBvciBub3QgYSBmb3JtIGVsZW1lbnQgaGFzIHRoZSByZXF1aXJlZCBhdHRyaWJ1dGUgYW5kIGlmIGl0J3MgY2hlY2tlZCBvciBub3RcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxuICAgKi9cbiAgcmVxdWlyZWRDaGVjaygkZWwpIHtcbiAgICBpZiAoISRlbC5hdHRyKCdyZXF1aXJlZCcpKSByZXR1cm4gdHJ1ZTtcblxuICAgIHZhciBpc0dvb2QgPSB0cnVlO1xuXG4gICAgc3dpdGNoICgkZWxbMF0udHlwZSkge1xuICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgY2FzZSAncmFkaW8nOlxuICAgICAgICBpc0dvb2QgPSAkZWxbMF0uY2hlY2tlZDtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBjYXNlICdzZWxlY3Qtb25lJzpcbiAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XG4gICAgICAgIHZhciBvcHQgPSAkZWwuZmluZCgnb3B0aW9uOnNlbGVjdGVkJyk7XG4gICAgICAgIGlmICghb3B0Lmxlbmd0aCB8fCAhb3B0LnZhbCgpKSBpc0dvb2QgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmKCEkZWwudmFsKCkgfHwgISRlbC52YWwoKS5sZW5ndGgpIGlzR29vZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBpc0dvb2Q7XG4gIH1cblxuICAvKipcbiAgICogQmFzZWQgb24gJGVsLCBnZXQgdGhlIGZpcnN0IGVsZW1lbnQgd2l0aCBzZWxlY3RvciBpbiB0aGlzIG9yZGVyOlxuICAgKiAxLiBUaGUgZWxlbWVudCdzIGRpcmVjdCBzaWJsaW5nKCdzKS5cbiAgICogMy4gVGhlIGVsZW1lbnQncyBwYXJlbnQncyBjaGlsZHJlbi5cbiAgICpcbiAgICogVGhpcyBhbGxvd3MgZm9yIG11bHRpcGxlIGZvcm0gZXJyb3JzIHBlciBpbnB1dCwgdGhvdWdoIGlmIG5vbmUgYXJlIGZvdW5kLCBubyBmb3JtIGVycm9ycyB3aWxsIGJlIHNob3duLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgcmVmZXJlbmNlIHRvIGZpbmQgdGhlIGZvcm0gZXJyb3Igc2VsZWN0b3IuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IGpRdWVyeSBvYmplY3Qgd2l0aCB0aGUgc2VsZWN0b3IuXG4gICAqL1xuICBmaW5kRm9ybUVycm9yKCRlbCkge1xuICAgIHZhciAkZXJyb3IgPSAkZWwuc2libGluZ3ModGhpcy5vcHRpb25zLmZvcm1FcnJvclNlbGVjdG9yKTtcblxuICAgIGlmICghJGVycm9yLmxlbmd0aCkge1xuICAgICAgJGVycm9yID0gJGVsLnBhcmVudCgpLmZpbmQodGhpcy5vcHRpb25zLmZvcm1FcnJvclNlbGVjdG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gJGVycm9yO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGlzIG9yZGVyOlxuICAgKiAyLiBUaGUgPGxhYmVsPiB3aXRoIHRoZSBhdHRyaWJ1dGUgYFtmb3I9XCJzb21lSW5wdXRJZFwiXWBcbiAgICogMy4gVGhlIGAuY2xvc2VzdCgpYCA8bGFiZWw+XG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSAkZWwgLSBqUXVlcnkgb2JqZWN0IHRvIGNoZWNrIGZvciByZXF1aXJlZCBhdHRyaWJ1dGVcbiAgICogQHJldHVybnMge0Jvb2xlYW59IEJvb2xlYW4gdmFsdWUgZGVwZW5kcyBvbiB3aGV0aGVyIG9yIG5vdCBhdHRyaWJ1dGUgaXMgY2hlY2tlZCBvciBlbXB0eVxuICAgKi9cbiAgZmluZExhYmVsKCRlbCkge1xuICAgIHZhciBpZCA9ICRlbFswXS5pZDtcbiAgICB2YXIgJGxhYmVsID0gdGhpcy4kZWxlbWVudC5maW5kKGBsYWJlbFtmb3I9XCIke2lkfVwiXWApO1xuXG4gICAgaWYgKCEkbGFiZWwubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gJGVsLmNsb3Nlc3QoJ2xhYmVsJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuICRsYWJlbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBDU1MgZXJyb3IgY2xhc3MgYXMgc3BlY2lmaWVkIGJ5IHRoZSBBYmlkZSBzZXR0aW5ncyB0byB0aGUgbGFiZWwsIGlucHV0LCBhbmQgdGhlIGZvcm1cbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSBjbGFzcyB0b1xuICAgKi9cbiAgYWRkRXJyb3JDbGFzc2VzKCRlbCkge1xuICAgIHZhciAkbGFiZWwgPSB0aGlzLmZpbmRMYWJlbCgkZWwpO1xuICAgIHZhciAkZm9ybUVycm9yID0gdGhpcy5maW5kRm9ybUVycm9yKCRlbCk7XG5cbiAgICBpZiAoJGxhYmVsLmxlbmd0aCkge1xuICAgICAgJGxhYmVsLmFkZENsYXNzKHRoaXMub3B0aW9ucy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgIGlmICgkZm9ybUVycm9yLmxlbmd0aCkge1xuICAgICAgJGZvcm1FcnJvci5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuZm9ybUVycm9yQ2xhc3MpO1xuICAgIH1cblxuICAgICRlbC5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuaW5wdXRFcnJvckNsYXNzKS5hdHRyKCdkYXRhLWludmFsaWQnLCAnJyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBDU1MgZXJyb3IgY2xhc3MgYXMgc3BlY2lmaWVkIGJ5IHRoZSBBYmlkZSBzZXR0aW5ncyBmcm9tIHRoZSBsYWJlbCwgaW5wdXQsIGFuZCB0aGUgZm9ybVxuICAgKiBAcGFyYW0ge09iamVjdH0gJGVsIC0galF1ZXJ5IG9iamVjdCB0byByZW1vdmUgdGhlIGNsYXNzIGZyb21cbiAgICovXG4gIHJlbW92ZUVycm9yQ2xhc3NlcygkZWwpIHtcbiAgICB2YXIgJGxhYmVsID0gdGhpcy5maW5kTGFiZWwoJGVsKTtcbiAgICB2YXIgJGZvcm1FcnJvciA9IHRoaXMuZmluZEZvcm1FcnJvcigkZWwpO1xuXG4gICAgaWYgKCRsYWJlbC5sZW5ndGgpIHtcbiAgICAgICRsYWJlbC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMubGFiZWxFcnJvckNsYXNzKTtcbiAgICB9XG5cbiAgICBpZiAoJGZvcm1FcnJvci5sZW5ndGgpIHtcbiAgICAgICRmb3JtRXJyb3IucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmZvcm1FcnJvckNsYXNzKTtcbiAgICB9XG5cbiAgICAkZWwucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmlucHV0RXJyb3JDbGFzcykucmVtb3ZlQXR0cignZGF0YS1pbnZhbGlkJyk7XG4gIH1cblxuICAvKipcbiAgICogR29lcyB0aHJvdWdoIGEgZm9ybSB0byBmaW5kIGlucHV0cyBhbmQgcHJvY2VlZHMgdG8gdmFsaWRhdGUgdGhlbSBpbiB3YXlzIHNwZWNpZmljIHRvIHRoZWlyIHR5cGVcbiAgICogQGZpcmVzIEFiaWRlI2ludmFsaWRcbiAgICogQGZpcmVzIEFiaWRlI3ZhbGlkXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB2YWxpZGF0ZSwgc2hvdWxkIGJlIGFuIEhUTUwgaW5wdXRcbiAgICogQHJldHVybnMge0Jvb2xlYW59IGdvb2RUb0dvIC0gSWYgdGhlIGlucHV0IGlzIHZhbGlkIG9yIG5vdC5cbiAgICovXG4gIHZhbGlkYXRlSW5wdXQoJGVsKSB7XG4gICAgdmFyIGNsZWFyUmVxdWlyZSA9IHRoaXMucmVxdWlyZWRDaGVjaygkZWwpLFxuICAgICAgICB2YWxpZGF0ZWQgPSBmYWxzZSxcbiAgICAgICAgY3VzdG9tVmFsaWRhdG9yID0gdHJ1ZSxcbiAgICAgICAgdmFsaWRhdG9yID0gJGVsLmF0dHIoJ2RhdGEtdmFsaWRhdG9yJyksXG4gICAgICAgIGVxdWFsVG8gPSB0cnVlO1xuXG4gICAgc3dpdGNoICgkZWxbMF0udHlwZSkge1xuICAgICAgY2FzZSAncmFkaW8nOlxuICAgICAgICB2YWxpZGF0ZWQgPSB0aGlzLnZhbGlkYXRlUmFkaW8oJGVsLmF0dHIoJ25hbWUnKSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdjaGVja2JveCc6XG4gICAgICAgIHZhbGlkYXRlZCA9IGNsZWFyUmVxdWlyZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3NlbGVjdCc6XG4gICAgICBjYXNlICdzZWxlY3Qtb25lJzpcbiAgICAgIGNhc2UgJ3NlbGVjdC1tdWx0aXBsZSc6XG4gICAgICAgIHZhbGlkYXRlZCA9IGNsZWFyUmVxdWlyZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhbGlkYXRlZCA9IHRoaXMudmFsaWRhdGVUZXh0KCRlbCk7XG4gICAgfVxuXG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgY3VzdG9tVmFsaWRhdG9yID0gdGhpcy5tYXRjaFZhbGlkYXRpb24oJGVsLCB2YWxpZGF0b3IsICRlbC5hdHRyKCdyZXF1aXJlZCcpKTtcbiAgICB9XG5cbiAgICBpZiAoJGVsLmF0dHIoJ2RhdGEtZXF1YWx0bycpKSB7XG4gICAgICBlcXVhbFRvID0gdGhpcy5vcHRpb25zLnZhbGlkYXRvcnMuZXF1YWxUbygkZWwpO1xuICAgIH1cblxuICAgIHZhciBnb29kVG9HbyA9IFtjbGVhclJlcXVpcmUsIHZhbGlkYXRlZCwgY3VzdG9tVmFsaWRhdG9yLCBlcXVhbFRvXS5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG4gICAgdmFyIG1lc3NhZ2UgPSAoZ29vZFRvR28gPyAndmFsaWQnIDogJ2ludmFsaWQnKSArICcuemYuYWJpZGUnO1xuXG4gICAgdGhpc1tnb29kVG9HbyA/ICdyZW1vdmVFcnJvckNsYXNzZXMnIDogJ2FkZEVycm9yQ2xhc3NlcyddKCRlbCk7XG5cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBpbnB1dCBpcyBkb25lIGNoZWNraW5nIGZvciB2YWxpZGF0aW9uLiBFdmVudCB0cmlnZ2VyIGlzIGVpdGhlciBgdmFsaWQuemYuYWJpZGVgIG9yIGBpbnZhbGlkLnpmLmFiaWRlYFxuICAgICAqIFRyaWdnZXIgaW5jbHVkZXMgdGhlIERPTSBlbGVtZW50IG9mIHRoZSBpbnB1dC5cbiAgICAgKiBAZXZlbnQgQWJpZGUjdmFsaWRcbiAgICAgKiBAZXZlbnQgQWJpZGUjaW52YWxpZFxuICAgICAqL1xuICAgICRlbC50cmlnZ2VyKG1lc3NhZ2UsIFskZWxdKTtcblxuICAgIHJldHVybiBnb29kVG9HbztcbiAgfVxuXG4gIC8qKlxuICAgKiBHb2VzIHRocm91Z2ggYSBmb3JtIGFuZCBpZiB0aGVyZSBhcmUgYW55IGludmFsaWQgaW5wdXRzLCBpdCB3aWxsIGRpc3BsYXkgdGhlIGZvcm0gZXJyb3IgZWxlbWVudFxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gbm9FcnJvciAtIHRydWUgaWYgbm8gZXJyb3JzIHdlcmUgZGV0ZWN0ZWQuLi5cbiAgICogQGZpcmVzIEFiaWRlI2Zvcm12YWxpZFxuICAgKiBAZmlyZXMgQWJpZGUjZm9ybWludmFsaWRcbiAgICovXG4gIHZhbGlkYXRlRm9ybSgpIHtcbiAgICB2YXIgYWNjID0gW107XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGlucHV0cy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgYWNjLnB1c2goX3RoaXMudmFsaWRhdGVJbnB1dCgkKHRoaXMpKSk7XG4gICAgfSk7XG5cbiAgICB2YXIgbm9FcnJvciA9IGFjYy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG5cbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWFiaWRlLWVycm9yXScpLmNzcygnZGlzcGxheScsIChub0Vycm9yID8gJ25vbmUnIDogJ2Jsb2NrJykpO1xuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgZm9ybSBpcyBmaW5pc2hlZCB2YWxpZGF0aW5nLiBFdmVudCB0cmlnZ2VyIGlzIGVpdGhlciBgZm9ybXZhbGlkLnpmLmFiaWRlYCBvciBgZm9ybWludmFsaWQuemYuYWJpZGVgLlxuICAgICAqIFRyaWdnZXIgaW5jbHVkZXMgdGhlIGVsZW1lbnQgb2YgdGhlIGZvcm0uXG4gICAgICogQGV2ZW50IEFiaWRlI2Zvcm12YWxpZFxuICAgICAqIEBldmVudCBBYmlkZSNmb3JtaW52YWxpZFxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigobm9FcnJvciA/ICdmb3JtdmFsaWQnIDogJ2Zvcm1pbnZhbGlkJykgKyAnLnpmLmFiaWRlJywgW3RoaXMuJGVsZW1lbnRdKTtcblxuICAgIHJldHVybiBub0Vycm9yO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hldGhlciBvciBhIG5vdCBhIHRleHQgaW5wdXQgaXMgdmFsaWQgYmFzZWQgb24gdGhlIHBhdHRlcm4gc3BlY2lmaWVkIGluIHRoZSBhdHRyaWJ1dGUuIElmIG5vIG1hdGNoaW5nIHBhdHRlcm4gaXMgZm91bmQsIHJldHVybnMgdHJ1ZS5cbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBvYmplY3QgdG8gdmFsaWRhdGUsIHNob3VsZCBiZSBhIHRleHQgaW5wdXQgSFRNTCBlbGVtZW50XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXR0ZXJuIC0gc3RyaW5nIHZhbHVlIG9mIG9uZSBvZiB0aGUgUmVnRXggcGF0dGVybnMgaW4gQWJpZGUub3B0aW9ucy5wYXR0ZXJuc1xuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IHRoZSBpbnB1dCB2YWx1ZSBtYXRjaGVzIHRoZSBwYXR0ZXJuIHNwZWNpZmllZFxuICAgKi9cbiAgdmFsaWRhdGVUZXh0KCRlbCwgcGF0dGVybikge1xuICAgIC8vIHBhdHRlcm4gPSBwYXR0ZXJuID8gcGF0dGVybiA6ICRlbC5hdHRyKCdwYXR0ZXJuJykgPyAkZWwuYXR0cigncGF0dGVybicpIDogJGVsLmF0dHIoJ3R5cGUnKTtcbiAgICBwYXR0ZXJuID0gKHBhdHRlcm4gfHwgJGVsLmF0dHIoJ3BhdHRlcm4nKSB8fCAkZWwuYXR0cigndHlwZScpKTtcbiAgICB2YXIgaW5wdXRUZXh0ID0gJGVsLnZhbCgpO1xuXG4gICAgLy8gaWYgdGV4dCwgY2hlY2sgaWYgdGhlIHBhdHRlcm4gZXhpc3RzLCBpZiBzbywgdGVzdCBpdCwgaWYgbm8gdGV4dCBvciBubyBwYXR0ZXJuLCByZXR1cm4gdHJ1ZS5cbiAgICByZXR1cm4gaW5wdXRUZXh0Lmxlbmd0aCA/XG4gICAgICB0aGlzLm9wdGlvbnMucGF0dGVybnMuaGFzT3duUHJvcGVydHkocGF0dGVybikgPyB0aGlzLm9wdGlvbnMucGF0dGVybnNbcGF0dGVybl0udGVzdChpbnB1dFRleHQpIDpcbiAgICAgICAgcGF0dGVybiAmJiBwYXR0ZXJuICE9PSAkZWwuYXR0cigndHlwZScpID9cbiAgICAgICAgICBuZXcgUmVnRXhwKHBhdHRlcm4pLnRlc3QoaW5wdXRUZXh0KSA6XG4gICAgICAgIHRydWUgOlxuICAgICAgdHJ1ZTtcbiAgIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIGEgbm90IGEgcmFkaW8gaW5wdXQgaXMgdmFsaWQgYmFzZWQgb24gd2hldGhlciBvciBub3QgaXQgaXMgcmVxdWlyZWQgYW5kIHNlbGVjdGVkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBncm91cE5hbWUgLSBBIHN0cmluZyB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZSBvZiBhIHJhZGlvIGJ1dHRvbiBncm91cFxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gQm9vbGVhbiB2YWx1ZSBkZXBlbmRzIG9uIHdoZXRoZXIgb3Igbm90IGF0IGxlYXN0IG9uZSByYWRpbyBpbnB1dCBoYXMgYmVlbiBzZWxlY3RlZCAoaWYgaXQncyByZXF1aXJlZClcbiAgICovXG4gIHZhbGlkYXRlUmFkaW8oZ3JvdXBOYW1lKSB7XG4gICAgdmFyICRncm91cCA9IHRoaXMuJGVsZW1lbnQuZmluZChgOnJhZGlvW25hbWU9XCIke2dyb3VwTmFtZX1cIl1gKSxcbiAgICAgICAgY291bnRlciA9IFtdLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICAkZ3JvdXAuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyIHJkaW8gPSAkKHRoaXMpLFxuICAgICAgICAgIGNsZWFyID0gX3RoaXMucmVxdWlyZWRDaGVjayhyZGlvKTtcbiAgICAgIGNvdW50ZXIucHVzaChjbGVhcik7XG4gICAgICBpZihjbGVhcikgX3RoaXMucmVtb3ZlRXJyb3JDbGFzc2VzKHJkaW8pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvdW50ZXIuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYSBzZWxlY3RlZCBpbnB1dCBwYXNzZXMgYSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvbi4gTXVsdGlwbGUgdmFsaWRhdGlvbnMgY2FuIGJlIHVzZWQsIGlmIHBhc3NlZCB0byB0aGUgZWxlbWVudCB3aXRoIGBkYXRhLXZhbGlkYXRvcj1cImZvbyBiYXIgYmF6XCJgIGluIGEgc3BhY2Ugc2VwYXJhdGVkIGxpc3RlZC5cbiAgICogQHBhcmFtIHtPYmplY3R9ICRlbCAtIGpRdWVyeSBpbnB1dCBlbGVtZW50LlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsaWRhdG9ycyAtIGEgc3RyaW5nIG9mIGZ1bmN0aW9uIG5hbWVzIG1hdGNoaW5nIGZ1bmN0aW9ucyBpbiB0aGUgQWJpZGUub3B0aW9ucy52YWxpZGF0b3JzIG9iamVjdC5cbiAgICogQHBhcmFtIHtCb29sZWFufSByZXF1aXJlZCAtIHNlbGYgZXhwbGFuYXRvcnk/XG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgdmFsaWRhdGlvbnMgcGFzc2VkLlxuICAgKi9cbiAgbWF0Y2hWYWxpZGF0aW9uKCRlbCwgdmFsaWRhdG9ycywgcmVxdWlyZWQpIHtcbiAgICByZXF1aXJlZCA9IHJlcXVpcmVkID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgdmFyIGNsZWFyID0gdmFsaWRhdG9ycy5zcGxpdCgnICcpLm1hcCgodikgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy52YWxpZGF0b3JzW3ZdKCRlbCwgcmVxdWlyZWQsICRlbC5wYXJlbnQoKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNsZWFyLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgZm9ybSBpbnB1dHMgYW5kIHN0eWxlc1xuICAgKiBAZmlyZXMgQWJpZGUjZm9ybXJlc2V0XG4gICAqL1xuICByZXNldEZvcm0oKSB7XG4gICAgdmFyICRmb3JtID0gdGhpcy4kZWxlbWVudCxcbiAgICAgICAgb3B0cyA9IHRoaXMub3B0aW9ucztcblxuICAgICQoYC4ke29wdHMubGFiZWxFcnJvckNsYXNzfWAsICRmb3JtKS5ub3QoJ3NtYWxsJykucmVtb3ZlQ2xhc3Mob3B0cy5sYWJlbEVycm9yQ2xhc3MpO1xuICAgICQoYC4ke29wdHMuaW5wdXRFcnJvckNsYXNzfWAsICRmb3JtKS5ub3QoJ3NtYWxsJykucmVtb3ZlQ2xhc3Mob3B0cy5pbnB1dEVycm9yQ2xhc3MpO1xuICAgICQoYCR7b3B0cy5mb3JtRXJyb3JTZWxlY3Rvcn0uJHtvcHRzLmZvcm1FcnJvckNsYXNzfWApLnJlbW92ZUNsYXNzKG9wdHMuZm9ybUVycm9yQ2xhc3MpO1xuICAgICRmb3JtLmZpbmQoJ1tkYXRhLWFiaWRlLWVycm9yXScpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgJCgnOmlucHV0JywgJGZvcm0pLm5vdCgnOmJ1dHRvbiwgOnN1Ym1pdCwgOnJlc2V0LCA6aGlkZGVuLCBbZGF0YS1hYmlkZS1pZ25vcmVdJykudmFsKCcnKS5yZW1vdmVBdHRyKCdkYXRhLWludmFsaWQnKTtcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBmb3JtIGhhcyBiZWVuIHJlc2V0LlxuICAgICAqIEBldmVudCBBYmlkZSNmb3JtcmVzZXRcbiAgICAgKi9cbiAgICAkZm9ybS50cmlnZ2VyKCdmb3JtcmVzZXQuemYuYWJpZGUnLCBbJGZvcm1dKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBBYmlkZS5cbiAgICogUmVtb3ZlcyBlcnJvciBzdHlsZXMgYW5kIGNsYXNzZXMgZnJvbSBlbGVtZW50cywgd2l0aG91dCByZXNldHRpbmcgdGhlaXIgdmFsdWVzLlxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vZmYoJy5hYmlkZScpXG4gICAgICAuZmluZCgnW2RhdGEtYWJpZGUtZXJyb3JdJylcbiAgICAgICAgLmNzcygnZGlzcGxheScsICdub25lJyk7XG5cbiAgICB0aGlzLiRpbnB1dHNcbiAgICAgIC5vZmYoJy5hYmlkZScpXG4gICAgICAuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMucmVtb3ZlRXJyb3JDbGFzc2VzKCQodGhpcykpO1xuICAgICAgfSk7XG5cbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAqL1xuQWJpZGUuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBUaGUgZGVmYXVsdCBldmVudCB0byB2YWxpZGF0ZSBpbnB1dHMuIENoZWNrYm94ZXMgYW5kIHJhZGlvcyB2YWxpZGF0ZSBpbW1lZGlhdGVseS5cbiAgICogUmVtb3ZlIG9yIGNoYW5nZSB0aGlzIHZhbHVlIGZvciBtYW51YWwgdmFsaWRhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnZmllbGRDaGFuZ2UnXG4gICAqL1xuICB2YWxpZGF0ZU9uOiAnZmllbGRDaGFuZ2UnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyB0byBiZSBhcHBsaWVkIHRvIGlucHV0IGxhYmVscyBvbiBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnaXMtaW52YWxpZC1sYWJlbCdcbiAgICovXG4gIGxhYmVsRXJyb3JDbGFzczogJ2lzLWludmFsaWQtbGFiZWwnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyB0byBiZSBhcHBsaWVkIHRvIGlucHV0cyBvbiBmYWlsZWQgdmFsaWRhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnaXMtaW52YWxpZC1pbnB1dCdcbiAgICovXG4gIGlucHV0RXJyb3JDbGFzczogJ2lzLWludmFsaWQtaW5wdXQnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBzZWxlY3RvciB0byB1c2UgdG8gdGFyZ2V0IEZvcm0gRXJyb3JzIGZvciBzaG93L2hpZGUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJy5mb3JtLWVycm9yJ1xuICAgKi9cbiAgZm9ybUVycm9yU2VsZWN0b3I6ICcuZm9ybS1lcnJvcicsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFkZGVkIHRvIEZvcm0gRXJyb3JzIG9uIGZhaWxlZCB2YWxpZGF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdpcy12aXNpYmxlJ1xuICAgKi9cbiAgZm9ybUVycm9yQ2xhc3M6ICdpcy12aXNpYmxlJyxcblxuICAvKipcbiAgICogU2V0IHRvIHRydWUgdG8gdmFsaWRhdGUgdGV4dCBpbnB1dHMgb24gYW55IHZhbHVlIGNoYW5nZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgbGl2ZVZhbGlkYXRlOiBmYWxzZSxcblxuICBwYXR0ZXJuczoge1xuICAgIGFscGhhIDogL15bYS16QS1aXSskLyxcbiAgICBhbHBoYV9udW1lcmljIDogL15bYS16QS1aMC05XSskLyxcbiAgICBpbnRlZ2VyIDogL15bLStdP1xcZCskLyxcbiAgICBudW1iZXIgOiAvXlstK10/XFxkKig/OltcXC5cXCxdXFxkKyk/JC8sXG5cbiAgICAvLyBhbWV4LCB2aXNhLCBkaW5lcnNcbiAgICBjYXJkIDogL14oPzo0WzAtOV17MTJ9KD86WzAtOV17M30pP3w1WzEtNV1bMC05XXsxNH18Nig/OjAxMXw1WzAtOV1bMC05XSlbMC05XXsxMn18M1s0N11bMC05XXsxM318Myg/OjBbMC01XXxbNjhdWzAtOV0pWzAtOV17MTF9fCg/OjIxMzF8MTgwMHwzNVxcZHszfSlcXGR7MTF9KSQvLFxuICAgIGN2diA6IC9eKFswLTldKXszLDR9JC8sXG5cbiAgICAvLyBodHRwOi8vd3d3LndoYXR3Zy5vcmcvc3BlY3Mvd2ViLWFwcHMvY3VycmVudC13b3JrL211bHRpcGFnZS9zdGF0ZXMtb2YtdGhlLXR5cGUtYXR0cmlidXRlLmh0bWwjdmFsaWQtZS1tYWlsLWFkZHJlc3NcbiAgICBlbWFpbCA6IC9eW2EtekEtWjAtOS4hIyQlJicqK1xcLz0/Xl9ge3x9fi1dK0BbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyQvLFxuXG4gICAgdXJsIDogL14oaHR0cHM/fGZ0cHxmaWxlfHNzaCk6XFwvXFwvKCgoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDopKkApPygoKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKSl8KCgoW2EtekEtWl18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpBLVpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16QS1aXXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpBLVpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuPykoOlxcZCopPykoXFwvKCgoW2EtekEtWl18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSsoXFwvKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKikqKT8pPyhcXD8oKChbYS16QS1aXXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFtcXHVFMDAwLVxcdUY4RkZdfFxcL3xcXD8pKik/KFxcIygoKFthLXpBLVpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8XFwvfFxcPykqKT8kLyxcbiAgICAvLyBhYmMuZGVcbiAgICBkb21haW4gOiAvXihbYS16QS1aMC05XShbYS16QS1aMC05XFwtXXswLDYxfVthLXpBLVowLTldKT9cXC4pK1thLXpBLVpdezIsOH0kLyxcblxuICAgIGRhdGV0aW1lIDogL14oWzAtMl1bMC05XXszfSlcXC0oWzAtMV1bMC05XSlcXC0oWzAtM11bMC05XSlUKFswLTVdWzAtOV0pXFw6KFswLTVdWzAtOV0pXFw6KFswLTVdWzAtOV0pKFp8KFtcXC1cXCtdKFswLTFdWzAtOV0pXFw6MDApKSQvLFxuICAgIC8vIFlZWVktTU0tRERcbiAgICBkYXRlIDogLyg/OjE5fDIwKVswLTldezJ9LSg/Oig/OjBbMS05XXwxWzAtMl0pLSg/OjBbMS05XXwxWzAtOV18MlswLTldKXwoPzooPyEwMikoPzowWzEtOV18MVswLTJdKS0oPzozMCkpfCg/Oig/OjBbMTM1NzhdfDFbMDJdKS0zMSkpJC8sXG4gICAgLy8gSEg6TU06U1NcbiAgICB0aW1lIDogL14oMFswLTldfDFbMC05XXwyWzAtM10pKDpbMC01XVswLTldKXsyfSQvLFxuICAgIGRhdGVJU08gOiAvXlxcZHs0fVtcXC9cXC1dXFxkezEsMn1bXFwvXFwtXVxcZHsxLDJ9JC8sXG4gICAgLy8gTU0vREQvWVlZWVxuICAgIG1vbnRoX2RheV95ZWFyIDogL14oMFsxLTldfDFbMDEyXSlbLSBcXC8uXSgwWzEtOV18WzEyXVswLTldfDNbMDFdKVstIFxcLy5dXFxkezR9JC8sXG4gICAgLy8gREQvTU0vWVlZWVxuICAgIGRheV9tb250aF95ZWFyIDogL14oMFsxLTldfFsxMl1bMC05XXwzWzAxXSlbLSBcXC8uXSgwWzEtOV18MVswMTJdKVstIFxcLy5dXFxkezR9JC8sXG5cbiAgICAvLyAjRkZGIG9yICNGRkZGRkZcbiAgICBjb2xvciA6IC9eIz8oW2EtZkEtRjAtOV17Nn18W2EtZkEtRjAtOV17M30pJC9cbiAgfSxcblxuICAvKipcbiAgICogT3B0aW9uYWwgdmFsaWRhdGlvbiBmdW5jdGlvbnMgdG8gYmUgdXNlZC4gYGVxdWFsVG9gIGJlaW5nIHRoZSBvbmx5IGRlZmF1bHQgaW5jbHVkZWQgZnVuY3Rpb24uXG4gICAqIEZ1bmN0aW9ucyBzaG91bGQgcmV0dXJuIG9ubHkgYSBib29sZWFuIGlmIHRoZSBpbnB1dCBpcyB2YWxpZCBvciBub3QuIEZ1bmN0aW9ucyBhcmUgZ2l2ZW4gdGhlIGZvbGxvd2luZyBhcmd1bWVudHM6XG4gICAqIGVsIDogVGhlIGpRdWVyeSBlbGVtZW50IHRvIHZhbGlkYXRlLlxuICAgKiByZXF1aXJlZCA6IEJvb2xlYW4gdmFsdWUgb2YgdGhlIHJlcXVpcmVkIGF0dHJpYnV0ZSBiZSBwcmVzZW50IG9yIG5vdC5cbiAgICogcGFyZW50IDogVGhlIGRpcmVjdCBwYXJlbnQgb2YgdGhlIGlucHV0LlxuICAgKiBAb3B0aW9uXG4gICAqL1xuICB2YWxpZGF0b3JzOiB7XG4gICAgZXF1YWxUbzogZnVuY3Rpb24gKGVsLCByZXF1aXJlZCwgcGFyZW50KSB7XG4gICAgICByZXR1cm4gJChgIyR7ZWwuYXR0cignZGF0YS1lcXVhbHRvJyl9YCkudmFsKCkgPT09IGVsLnZhbCgpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oQWJpZGUsICdBYmlkZScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogQWNjb3JkaW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5hY2NvcmRpb25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKi9cblxuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEFjY29yZGlvbiNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIGEgcGxhaW4gb2JqZWN0IHdpdGggc2V0dGluZ3MgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWNjb3JkaW9uLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdBY2NvcmRpb24nKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdBY2NvcmRpb24nLCB7XG4gICAgICAnRU5URVInOiAndG9nZ2xlJyxcbiAgICAgICdTUEFDRSc6ICd0b2dnbGUnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY29yZGlvbiBieSBhbmltYXRpbmcgdGhlIHByZXNldCBhY3RpdmUgcGFuZShzKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cigncm9sZScsICd0YWJsaXN0Jyk7XG4gICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ2xpJyk7XG4gICAgaWYgKHRoaXMuJHRhYnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW2RhdGEtYWNjb3JkaW9uLWl0ZW1dJyk7XG4gICAgfVxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbihpZHgsIGVsKXtcblxuICAgICAgdmFyICRlbCA9ICQoZWwpLFxuICAgICAgICAgICRjb250ZW50ID0gJGVsLmZpbmQoJ1tkYXRhLXRhYi1jb250ZW50XScpLFxuICAgICAgICAgIGlkID0gJGNvbnRlbnRbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnYWNjb3JkaW9uJyksXG4gICAgICAgICAgbGlua0lkID0gZWwuaWQgfHwgYCR7aWR9LWxhYmVsYDtcblxuICAgICAgJGVsLmZpbmQoJ2E6Zmlyc3QnKS5hdHRyKHtcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBpZCxcbiAgICAgICAgJ3JvbGUnOiAndGFiJyxcbiAgICAgICAgJ2lkJzogbGlua0lkLFxuICAgICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXG4gICAgICB9KTtcbiAgICAgICRjb250ZW50LmF0dHIoeydyb2xlJzogJ3RhYnBhbmVsJywgJ2FyaWEtbGFiZWxsZWRieSc6IGxpbmtJZCwgJ2FyaWEtaGlkZGVuJzogdHJ1ZSwgJ2lkJzogaWR9KTtcbiAgICB9KTtcbiAgICB2YXIgJGluaXRBY3RpdmUgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pcy1hY3RpdmUnKS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgaWYoJGluaXRBY3RpdmUubGVuZ3RoKXtcbiAgICAgIHRoaXMuZG93bigkaW5pdEFjdGl2ZSwgdHJ1ZSk7XG4gICAgfVxuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgYWNjb3JkaW9uLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRlbGVtID0gJCh0aGlzKTtcbiAgICAgIHZhciAkdGFiQ29udGVudCA9ICRlbGVtLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICAgIGlmICgkdGFiQ29udGVudC5sZW5ndGgpIHtcbiAgICAgICAgJGVsZW0uY2hpbGRyZW4oJ2EnKS5vZmYoJ2NsaWNrLnpmLmFjY29yZGlvbiBrZXlkb3duLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgLy8gJCh0aGlzKS5jaGlsZHJlbignYScpLm9uKCdjbGljay56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIGlmICgkZWxlbS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgIGlmKF90aGlzLm9wdGlvbnMuYWxsb3dBbGxDbG9zZWQgfHwgJGVsZW0uc2libGluZ3MoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpe1xuICAgICAgICAgICAgICBfdGhpcy51cCgkdGFiQ29udGVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMuZG93bigkdGFiQ29udGVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KS5vbigna2V5ZG93bi56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnQWNjb3JkaW9uJywge1xuICAgICAgICAgICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgX3RoaXMudG9nZ2xlKCR0YWJDb250ZW50KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgJGVsZW0ubmV4dCgpLmZpbmQoJ2EnKS5mb2N1cygpLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByZXZpb3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgJGVsZW0ucHJldigpLmZpbmQoJ2EnKS5mb2N1cygpLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIGNvbnRlbnQgcGFuZSdzIG9wZW4vY2xvc2Ugc3RhdGUuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0galF1ZXJ5IG9iamVjdCBvZiB0aGUgcGFuZSB0byB0b2dnbGUuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdG9nZ2xlKCR0YXJnZXQpIHtcbiAgICBpZigkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgaWYodGhpcy5vcHRpb25zLmFsbG93QWxsQ2xvc2VkIHx8ICR0YXJnZXQucGFyZW50KCkuc2libGluZ3MoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpe1xuICAgICAgICB0aGlzLnVwKCR0YXJnZXQpO1xuICAgICAgfSBlbHNlIHsgcmV0dXJuOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZG93bigkdGFyZ2V0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIGFjY29yZGlvbiB0YWIgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gQWNjb3JkaW9uIHBhbmUgdG8gb3Blbi5cbiAgICogQHBhcmFtIHtCb29sZWFufSBmaXJzdFRpbWUgLSBmbGFnIHRvIGRldGVybWluZSBpZiByZWZsb3cgc2hvdWxkIGhhcHBlbi5cbiAgICogQGZpcmVzIEFjY29yZGlvbiNkb3duXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZG93bigkdGFyZ2V0LCBmaXJzdFRpbWUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIGlmKCF0aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQgJiYgIWZpcnN0VGltZSl7XG4gICAgICB2YXIgJGN1cnJlbnRBY3RpdmUgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pcy1hY3RpdmUnKS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZigkY3VycmVudEFjdGl2ZS5sZW5ndGgpe1xuICAgICAgICB0aGlzLnVwKCRjdXJyZW50QWN0aXZlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkdGFyZ2V0XG4gICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSlcbiAgICAgIC5wYXJlbnQoJ1tkYXRhLXRhYi1jb250ZW50XScpXG4gICAgICAuYWRkQmFjaygpXG4gICAgICAucGFyZW50KCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgLy8gRm91bmRhdGlvbi5Nb3ZlKF90aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKXtcbiAgICAgICR0YXJnZXQuc2xpZGVEb3duKF90aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgb3BlbmluZy5cbiAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbiNkb3duXG4gICAgICAgICAqL1xuICAgICAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkb3duLnpmLmFjY29yZGlvbicsIFskdGFyZ2V0XSk7XG4gICAgICB9KTtcbiAgICAvLyB9KTtcblxuICAgIC8vIGlmKCFmaXJzdFRpbWUpe1xuICAgIC8vICAgRm91bmRhdGlvbi5fcmVmbG93KHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1hY2NvcmRpb24nKSk7XG4gICAgLy8gfVxuICAgICQoYCMkeyR0YXJnZXQuYXR0cignYXJpYS1sYWJlbGxlZGJ5Jyl9YCkuYXR0cih7XG4gICAgICAnYXJpYS1leHBhbmRlZCc6IHRydWUsXG4gICAgICAnYXJpYS1zZWxlY3RlZCc6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gdGFiIHRvIGNsb3NlLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI3VwXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdXAoJHRhcmdldCkge1xuICAgIHZhciAkYXVudHMgPSAkdGFyZ2V0LnBhcmVudCgpLnNpYmxpbmdzKCksXG4gICAgICAgIF90aGlzID0gdGhpcztcbiAgICB2YXIgY2FuQ2xvc2UgPSB0aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQgPyAkYXVudHMuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpIDogJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICBpZighdGhpcy5vcHRpb25zLmFsbG93QWxsQ2xvc2VkICYmICFjYW5DbG9zZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZvdW5kYXRpb24uTW92ZSh0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgJHRhcmdldCwgZnVuY3Rpb24oKXtcbiAgICAgICR0YXJnZXQuc2xpZGVVcChfdGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHRhYiBpcyBkb25lIGNvbGxhcHNpbmcgdXAuXG4gICAgICAgICAqIEBldmVudCBBY2NvcmRpb24jdXBcbiAgICAgICAgICovXG4gICAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ3VwLnpmLmFjY29yZGlvbicsIFskdGFyZ2V0XSk7XG4gICAgICB9KTtcbiAgICAvLyB9KTtcblxuICAgICR0YXJnZXQuYXR0cignYXJpYS1oaWRkZW4nLCB0cnVlKVxuICAgICAgICAgICAucGFyZW50KCkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBmYWxzZVxuICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2Rlc3Ryb3llZFxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS10YWItY29udGVudF0nKS5zbGlkZVVwKDApLmNzcygnZGlzcGxheScsICcnKTtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2EnKS5vZmYoJy56Zi5hY2NvcmRpb24nKTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5BY2NvcmRpb24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSB0byBhbmltYXRlIHRoZSBvcGVuaW5nIG9mIGFuIGFjY29yZGlvbiBwYW5lLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDI1MFxuICAgKi9cbiAgc2xpZGVTcGVlZDogMjUwLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBoYXZlIG11bHRpcGxlIG9wZW4gcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIG11bHRpRXhwYW5kOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBhY2NvcmRpb24gdG8gY2xvc2UgYWxsIHBhbmVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBhbGxvd0FsbENsb3NlZDogZmFsc2Vcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihBY2NvcmRpb24sICdBY2NvcmRpb24nKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFJldmVhbCBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ucmV2ZWFsXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmJveFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50cmlnZ2Vyc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvbiBpZiB1c2luZyBhbmltYXRpb25zXG4gKi9cblxuY2xhc3MgUmV2ZWFsIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgUmV2ZWFsLlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBmb3IgdGhlIG1vZGFsLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIG9wdGlvbmFsIHBhcmFtZXRlcnMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJldmVhbC5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1JldmVhbCcpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1JldmVhbCcsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdFU0NBUEUnOiAnY2xvc2UnLFxuICAgICAgJ1RBQic6ICd0YWJfZm9yd2FyZCcsXG4gICAgICAnU0hJRlRfVEFCJzogJ3RhYl9iYWNrd2FyZCdcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbW9kYWwgYnkgYWRkaW5nIHRoZSBvdmVybGF5IGFuZCBjbG9zZSBidXR0b25zLCAoaWYgc2VsZWN0ZWQpLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy5pZCA9IHRoaXMuJGVsZW1lbnQuYXR0cignaWQnKTtcbiAgICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gICAgdGhpcy5jYWNoZWQgPSB7bXE6IEZvdW5kYXRpb24uTWVkaWFRdWVyeS5jdXJyZW50fTtcbiAgICB0aGlzLmlzaU9TID0gaVBob25lU25pZmYoKTtcblxuICAgIGlmKHRoaXMuaXNpT1MpeyB0aGlzLiRlbGVtZW50LmFkZENsYXNzKCdpcy1pb3MnKTsgfVxuXG4gICAgdGhpcy4kYW5jaG9yID0gJChgW2RhdGEtb3Blbj1cIiR7dGhpcy5pZH1cIl1gKS5sZW5ndGggPyAkKGBbZGF0YS1vcGVuPVwiJHt0aGlzLmlkfVwiXWApIDogJChgW2RhdGEtdG9nZ2xlPVwiJHt0aGlzLmlkfVwiXWApO1xuXG4gICAgaWYgKHRoaXMuJGFuY2hvci5sZW5ndGgpIHtcbiAgICAgIHZhciBhbmNob3JJZCA9IHRoaXMuJGFuY2hvclswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdyZXZlYWwnKTtcblxuICAgICAgdGhpcy4kYW5jaG9yLmF0dHIoe1xuICAgICAgICAnYXJpYS1jb250cm9scyc6IHRoaXMuaWQsXG4gICAgICAgICdpZCc6IGFuY2hvcklkLFxuICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICd0YWJpbmRleCc6IDBcbiAgICAgIH0pO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKHsnYXJpYS1sYWJlbGxlZGJ5JzogYW5jaG9ySWR9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmZ1bGxTY3JlZW4gfHwgdGhpcy4kZWxlbWVudC5oYXNDbGFzcygnZnVsbCcpKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZnVsbFNjcmVlbiA9IHRydWU7XG4gICAgICB0aGlzLm9wdGlvbnMub3ZlcmxheSA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJsYXkgJiYgIXRoaXMuJG92ZXJsYXkpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkgPSB0aGlzLl9tYWtlT3ZlcmxheSh0aGlzLmlkKTtcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoe1xuICAgICAgICAncm9sZSc6ICdkaWFsb2cnLFxuICAgICAgICAnYXJpYS1oaWRkZW4nOiB0cnVlLFxuICAgICAgICAnZGF0YS15ZXRpLWJveCc6IHRoaXMuaWQsXG4gICAgICAgICdkYXRhLXJlc2l6ZSc6IHRoaXMuaWRcbiAgICB9KTtcblxuICAgIGlmKHRoaXMuJG92ZXJsYXkpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuZGV0YWNoKCkuYXBwZW5kVG8odGhpcy4kb3ZlcmxheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuZGV0YWNoKCkuYXBwZW5kVG8oJCgnYm9keScpKTtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ3dpdGhvdXQtb3ZlcmxheScpO1xuICAgIH1cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rICYmIHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSAoIGAjJHt0aGlzLmlkfWApKSB7XG4gICAgICAkKHdpbmRvdykub25lKCdsb2FkLnpmLnJldmVhbCcsIHRoaXMub3Blbi5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvdmVybGF5IGRpdiB0byBkaXNwbGF5IGJlaGluZCB0aGUgbW9kYWwuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfbWFrZU92ZXJsYXkoaWQpIHtcbiAgICB2YXIgJG92ZXJsYXkgPSAkKCc8ZGl2PjwvZGl2PicpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDbGFzcygncmV2ZWFsLW92ZXJsYXknKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cih7J3RhYmluZGV4JzogLTEsICdhcmlhLWhpZGRlbic6IHRydWV9KVxuICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oJ2JvZHknKTtcbiAgICByZXR1cm4gJG92ZXJsYXk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBwb3NpdGlvbiBvZiBtb2RhbFxuICAgKiBUT0RPOiAgRmlndXJlIG91dCBpZiB3ZSBhY3R1YWxseSBuZWVkIHRvIGNhY2hlIHRoZXNlIHZhbHVlcyBvciBpZiBpdCBkb2Vzbid0IG1hdHRlclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3VwZGF0ZVBvc2l0aW9uKCkge1xuICAgIHZhciB3aWR0aCA9IHRoaXMuJGVsZW1lbnQub3V0ZXJXaWR0aCgpO1xuICAgIHZhciBvdXRlcldpZHRoID0gJCh3aW5kb3cpLndpZHRoKCk7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMuJGVsZW1lbnQub3V0ZXJIZWlnaHQoKTtcbiAgICB2YXIgb3V0ZXJIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCk7XG4gICAgdmFyIGxlZnQgPSBwYXJzZUludCgob3V0ZXJXaWR0aCAtIHdpZHRoKSAvIDIsIDEwKTtcbiAgICB2YXIgdG9wO1xuICAgIGlmIChoZWlnaHQgPiBvdXRlckhlaWdodCkge1xuICAgICAgdG9wID0gcGFyc2VJbnQoTWF0aC5taW4oMTAwLCBvdXRlckhlaWdodCAvIDEwKSwgMTApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0b3AgPSBwYXJzZUludCgob3V0ZXJIZWlnaHQgLSBoZWlnaHQpIC8gNCwgMTApO1xuICAgIH1cbiAgICB0aGlzLiRlbGVtZW50LmNzcyh7dG9wOiB0b3AgKyAncHgnfSk7XG4gICAgLy8gb25seSB3b3JyeSBhYm91dCBsZWZ0IGlmIHdlIGRvbid0IGhhdmUgYW4gb3ZlcmxheSwgb3RoZXJ3aXNlIHdlJ3JlIHBlcmZlY3RseSBpbiB0aGUgbWlkZGxlXG4gICAgaWYoIXRoaXMuJG92ZXJsYXkpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHtsZWZ0OiBsZWZ0ICsgJ3B4J30pO1xuICAgIH1cblxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIHRoZSBtb2RhbC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnQub24oe1xuICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmNsb3NlLmJpbmQodGhpcyksXG4gICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInOiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuX3VwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy4kYW5jaG9yLmxlbmd0aCkge1xuICAgICAgdGhpcy4kYW5jaG9yLm9uKCdrZXlkb3duLnpmLnJldmVhbCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUud2hpY2ggPT09IDEzIHx8IGUud2hpY2ggPT09IDMyKSB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgX3RoaXMub3BlbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayAmJiB0aGlzLm9wdGlvbnMub3ZlcmxheSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5vZmYoJy56Zi5yZXZlYWwnKS5vbignY2xpY2suemYucmV2ZWFsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQgPT09IF90aGlzLiRlbGVtZW50WzBdIHx8ICQuY29udGFpbnMoX3RoaXMuJGVsZW1lbnRbMF0sIGUudGFyZ2V0KSkgeyByZXR1cm47IH1cbiAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub24oYHBvcHN0YXRlLnpmLnJldmVhbDoke3RoaXMuaWR9YCwgdGhpcy5faGFuZGxlU3RhdGUuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgbW9kYWwgbWV0aG9kcyBvbiBiYWNrL2ZvcndhcmQgYnV0dG9uIGNsaWNrcyBvciBhbnkgb3RoZXIgZXZlbnQgdGhhdCB0cmlnZ2VycyBwb3BzdGF0ZS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9oYW5kbGVTdGF0ZShlKSB7XG4gICAgaWYod2luZG93LmxvY2F0aW9uLmhhc2ggPT09ICggJyMnICsgdGhpcy5pZCkgJiYgIXRoaXMuaXNBY3RpdmUpeyB0aGlzLm9wZW4oKTsgfVxuICAgIGVsc2V7IHRoaXMuY2xvc2UoKTsgfVxuICB9XG5cblxuICAvKipcbiAgICogT3BlbnMgdGhlIG1vZGFsIGNvbnRyb2xsZWQgYnkgYHRoaXMuJGFuY2hvcmAsIGFuZCBjbG9zZXMgYWxsIG90aGVycyBieSBkZWZhdWx0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIFJldmVhbCNjbG9zZW1lXG4gICAqIEBmaXJlcyBSZXZlYWwjb3BlblxuICAgKi9cbiAgb3BlbigpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB2YXIgaGFzaCA9IGAjJHt0aGlzLmlkfWA7XG5cbiAgICAgIGlmICh3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIGhhc2gpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaXNBY3RpdmUgPSB0cnVlO1xuXG4gICAgLy8gTWFrZSBlbGVtZW50cyBpbnZpc2libGUsIGJ1dCByZW1vdmUgZGlzcGxheTogbm9uZSBzbyB3ZSBjYW4gZ2V0IHNpemUgYW5kIHBvc2l0aW9uaW5nXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgICAuY3NzKHsgJ3Zpc2liaWxpdHknOiAnaGlkZGVuJyB9KVxuICAgICAgICAuc2hvdygpXG4gICAgICAgIC5zY3JvbGxUb3AoMCk7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5vdmVybGF5KSB7XG4gICAgICB0aGlzLiRvdmVybGF5LmNzcyh7J3Zpc2liaWxpdHknOiAnaGlkZGVuJ30pLnNob3coKTtcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbigpO1xuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmhpZGUoKVxuICAgICAgLmNzcyh7ICd2aXNpYmlsaXR5JzogJycgfSk7XG5cbiAgICBpZih0aGlzLiRvdmVybGF5KSB7XG4gICAgICB0aGlzLiRvdmVybGF5LmNzcyh7J3Zpc2liaWxpdHknOiAnJ30pLmhpZGUoKTtcbiAgICB9XG5cblxuICAgIGlmICghdGhpcy5vcHRpb25zLm11bHRpcGxlT3BlbmVkKSB7XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgbW9kYWwgb3BlbnMuXG4gICAgICAgKiBDbG9zZXMgYW55IG90aGVyIG1vZGFscyB0aGF0IGFyZSBjdXJyZW50bHkgb3BlblxuICAgICAgICogQGV2ZW50IFJldmVhbCNjbG9zZW1lXG4gICAgICAgKi9cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2xvc2VtZS56Zi5yZXZlYWwnLCB0aGlzLmlkKTtcbiAgICB9XG5cbiAgICAvLyBNb3Rpb24gVUkgbWV0aG9kIG9mIHJldmVhbFxuICAgIGlmICh0aGlzLm9wdGlvbnMuYW5pbWF0aW9uSW4pIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMub3ZlcmxheSkge1xuICAgICAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlSW4odGhpcy4kb3ZlcmxheSwgJ2ZhZGUtaW4nKTtcbiAgICAgIH1cbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVJbih0aGlzLiRlbGVtZW50LCB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uSW4sIGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmZvY3VzYWJsZUVsZW1lbnRzID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGpRdWVyeSBtZXRob2Qgb2YgcmV2ZWFsXG4gICAgZWxzZSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJsYXkpIHtcbiAgICAgICAgdGhpcy4kb3ZlcmxheS5zaG93KDApO1xuICAgICAgfVxuICAgICAgdGhpcy4kZWxlbWVudC5zaG93KHRoaXMub3B0aW9ucy5zaG93RGVsYXkpO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBhY2Nlc3NpYmlsaXR5XG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLmF0dHIoe1xuICAgICAgICAnYXJpYS1oaWRkZW4nOiBmYWxzZSxcbiAgICAgICAgJ3RhYmluZGV4JzogLTFcbiAgICAgIH0pXG4gICAgICAuZm9jdXMoKTtcblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vZGFsIGhhcyBzdWNjZXNzZnVsbHkgb3BlbmVkLlxuICAgICAqIEBldmVudCBSZXZlYWwjb3BlblxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignb3Blbi56Zi5yZXZlYWwnKTtcblxuICAgIGlmICh0aGlzLmlzaU9TKSB7XG4gICAgICB2YXIgc2Nyb2xsUG9zID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuICAgICAgJCgnaHRtbCwgYm9keScpLmFkZENsYXNzKCdpcy1yZXZlYWwtb3BlbicpLnNjcm9sbFRvcChzY3JvbGxQb3MpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKTtcbiAgICB9XG5cbiAgICAkKCdib2R5JylcbiAgICAgIC5hZGRDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKVxuICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgKHRoaXMub3B0aW9ucy5vdmVybGF5IHx8IHRoaXMub3B0aW9ucy5mdWxsU2NyZWVuKSA/IHRydWUgOiBmYWxzZSk7XG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX2V4dHJhSGFuZGxlcnMoKTtcbiAgICB9LCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV4dHJhIGV2ZW50IGhhbmRsZXJzIGZvciB0aGUgYm9keSBhbmQgd2luZG93IGlmIG5lY2Vzc2FyeS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9leHRyYUhhbmRsZXJzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5mb2N1c2FibGVFbGVtZW50cyA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSh0aGlzLiRlbGVtZW50KTtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLm92ZXJsYXkgJiYgdGhpcy5vcHRpb25zLmNsb3NlT25DbGljayAmJiAhdGhpcy5vcHRpb25zLmZ1bGxTY3JlZW4pIHtcbiAgICAgICQoJ2JvZHknKS5vbignY2xpY2suemYucmV2ZWFsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQgPT09IF90aGlzLiRlbGVtZW50WzBdIHx8ICQuY29udGFpbnMoX3RoaXMuJGVsZW1lbnRbMF0sIGUudGFyZ2V0KSkgeyByZXR1cm47IH1cbiAgICAgICAgX3RoaXMuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkVzYykge1xuICAgICAgJCh3aW5kb3cpLm9uKCdrZXlkb3duLnpmLnJldmVhbCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1JldmVhbCcsIHtcbiAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy5jbG9zZU9uRXNjKSB7XG4gICAgICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICAgIF90aGlzLiRhbmNob3IuZm9jdXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7IC8vIG5vIGZvY3VzYWJsZSBlbGVtZW50cyBpbnNpZGUgdGhlIG1vZGFsIGF0IGFsbCwgcHJldmVudCB0YWJiaW5nIGluIGdlbmVyYWxcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGxvY2sgZm9jdXMgd2l0aGluIG1vZGFsIHdoaWxlIHRhYmJpbmdcbiAgICB0aGlzLiRlbGVtZW50Lm9uKCdrZXlkb3duLnpmLnJldmVhbCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJCh0aGlzKTtcbiAgICAgIC8vIGhhbmRsZSBrZXlib2FyZCBldmVudCB3aXRoIGtleWJvYXJkIHV0aWxcbiAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdSZXZlYWwnLCB7XG4gICAgICAgIHRhYl9mb3J3YXJkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuJGVsZW1lbnQuZmluZCgnOmZvY3VzJykuaXMoX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMuZXEoLTEpKSkgeyAvLyBsZWZ0IG1vZGFsIGRvd253YXJkcywgc2V0dGluZyBmb2N1cyB0byBmaXJzdCBlbGVtZW50XG4gICAgICAgICAgICBfdGhpcy5mb2N1c2FibGVFbGVtZW50cy5lcSgwKS5mb2N1cygpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdGFiX2JhY2t3YXJkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoX3RoaXMuJGVsZW1lbnQuZmluZCgnOmZvY3VzJykuaXMoX3RoaXMuZm9jdXNhYmxlRWxlbWVudHMuZXEoMCkpIHx8IF90aGlzLiRlbGVtZW50LmlzKCc6Zm9jdXMnKSkgeyAvLyBsZWZ0IG1vZGFsIHVwd2FyZHMsIHNldHRpbmcgZm9jdXMgdG8gbGFzdCBlbGVtZW50XG4gICAgICAgICAgICBfdGhpcy5mb2N1c2FibGVFbGVtZW50cy5lcSgtMSkuZm9jdXMoKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChfdGhpcy4kZWxlbWVudC5maW5kKCc6Zm9jdXMnKS5pcyhfdGhpcy4kZWxlbWVudC5maW5kKCdbZGF0YS1jbG9zZV0nKSkpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IC8vIHNldCBmb2N1cyBiYWNrIHRvIGFuY2hvciBpZiBjbG9zZSBidXR0b24gaGFzIGJlZW4gYWN0aXZhdGVkXG4gICAgICAgICAgICAgIF90aGlzLiRhbmNob3IuZm9jdXMoKTtcbiAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJHRhcmdldC5pcyhfdGhpcy5mb2N1c2FibGVFbGVtZW50cykpIHsgLy8gZG9udCd0IHRyaWdnZXIgaWYgYWN1YWwgZWxlbWVudCBoYXMgZm9jdXMgKGkuZS4gaW5wdXRzLCBsaW5rcywgLi4uKVxuICAgICAgICAgICAgX3RoaXMub3BlbigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmIChfdGhpcy5vcHRpb25zLmNsb3NlT25Fc2MpIHtcbiAgICAgICAgICAgIF90aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICBfdGhpcy4kYW5jaG9yLmZvY3VzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbG9zZXMgdGhlIG1vZGFsLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIFJldmVhbCNjbG9zZWRcbiAgICovXG4gIGNsb3NlKCkge1xuICAgIGlmICghdGhpcy5pc0FjdGl2ZSB8fCAhdGhpcy4kZWxlbWVudC5pcygnOnZpc2libGUnKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gTW90aW9uIFVJIG1ldGhvZCBvZiBoaWRpbmdcbiAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbk91dCkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5vdmVybGF5KSB7XG4gICAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQodGhpcy4kb3ZlcmxheSwgJ2ZhZGUtb3V0JywgZmluaXNoVXApO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGZpbmlzaFVwKCk7XG4gICAgICB9XG5cbiAgICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQodGhpcy4kZWxlbWVudCwgdGhpcy5vcHRpb25zLmFuaW1hdGlvbk91dCk7XG4gICAgfVxuICAgIC8vIGpRdWVyeSBtZXRob2Qgb2YgaGlkaW5nXG4gICAgZWxzZSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJsYXkpIHtcbiAgICAgICAgdGhpcy4kb3ZlcmxheS5oaWRlKDAsIGZpbmlzaFVwKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBmaW5pc2hVcCgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiRlbGVtZW50LmhpZGUodGhpcy5vcHRpb25zLmhpZGVEZWxheSk7XG4gICAgfVxuXG4gICAgLy8gQ29uZGl0aW9uYWxzIHRvIHJlbW92ZSBleHRyYSBldmVudCBsaXN0ZW5lcnMgYWRkZWQgb24gb3BlblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkVzYykge1xuICAgICAgJCh3aW5kb3cpLm9mZigna2V5ZG93bi56Zi5yZXZlYWwnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5vdmVybGF5ICYmIHRoaXMub3B0aW9ucy5jbG9zZU9uQ2xpY2spIHtcbiAgICAgICQoJ2JvZHknKS5vZmYoJ2NsaWNrLnpmLnJldmVhbCcpO1xuICAgIH1cblxuICAgIHRoaXMuJGVsZW1lbnQub2ZmKCdrZXlkb3duLnpmLnJldmVhbCcpO1xuXG4gICAgZnVuY3Rpb24gZmluaXNoVXAoKSB7XG4gICAgICBpZiAoX3RoaXMuaXNpT1MpIHtcbiAgICAgICAgJCgnaHRtbCwgYm9keScpLnJlbW92ZUNsYXNzKCdpcy1yZXZlYWwtb3BlbicpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnaXMtcmV2ZWFsLW9wZW4nKTtcbiAgICAgIH1cblxuICAgICAgJCgnYm9keScpLmF0dHIoe1xuICAgICAgICAnYXJpYS1oaWRkZW4nOiBmYWxzZSxcbiAgICAgICAgJ3RhYmluZGV4JzogJydcbiAgICAgIH0pO1xuXG4gICAgICBfdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuXG4gICAgICAvKipcbiAgICAgICogRmlyZXMgd2hlbiB0aGUgbW9kYWwgaXMgZG9uZSBjbG9zaW5nLlxuICAgICAgKiBAZXZlbnQgUmV2ZWFsI2Nsb3NlZFxuICAgICAgKi9cbiAgICAgIF90aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2Nsb3NlZC56Zi5yZXZlYWwnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIFJlc2V0cyB0aGUgbW9kYWwgY29udGVudFxuICAgICogVGhpcyBwcmV2ZW50cyBhIHJ1bm5pbmcgdmlkZW8gdG8ga2VlcCBnb2luZyBpbiB0aGUgYmFja2dyb3VuZFxuICAgICovXG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZXNldE9uQ2xvc2UpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuaHRtbCh0aGlzLiRlbGVtZW50Lmh0bWwoKSk7XG4gICAgfVxuXG4gICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgICBpZiAoX3RoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgIGlmICh3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUpIHtcbiAgICAgICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShcIlwiLCBkb2N1bWVudC50aXRsZSwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgICAgICB9IGVsc2Uge1xuICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcbiAgICAgICB9XG4gICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBvcGVuL2Nsb3NlZCBzdGF0ZSBvZiBhIG1vZGFsLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5pc0FjdGl2ZSkge1xuICAgICAgdGhpcy5jbG9zZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9wZW4oKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGEgbW9kYWwuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJsYXkpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuaGlkZSgpLm9mZigpLnJlbW92ZSgpO1xuICAgIH1cbiAgICB0aGlzLiRlbGVtZW50LmhpZGUoKS5vZmYoKTtcbiAgICB0aGlzLiRhbmNob3Iub2ZmKCcuemYnKTtcbiAgICAkKHdpbmRvdykub2ZmKGAuemYucmV2ZWFsOiR7dGhpcy5pZH1gKTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfTtcbn1cblxuUmV2ZWFsLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogTW90aW9uLVVJIGNsYXNzIHRvIHVzZSBmb3IgYW5pbWF0ZWQgZWxlbWVudHMuIElmIG5vbmUgdXNlZCwgZGVmYXVsdHMgdG8gc2ltcGxlIHNob3cvaGlkZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnc2xpZGUtaW4tbGVmdCdcbiAgICovXG4gIGFuaW1hdGlvbkluOiAnJyxcbiAgLyoqXG4gICAqIE1vdGlvbi1VSSBjbGFzcyB0byB1c2UgZm9yIGFuaW1hdGVkIGVsZW1lbnRzLiBJZiBub25lIHVzZWQsIGRlZmF1bHRzIHRvIHNpbXBsZSBzaG93L2hpZGUuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ3NsaWRlLW91dC1yaWdodCdcbiAgICovXG4gIGFuaW1hdGlvbk91dDogJycsXG4gIC8qKlxuICAgKiBUaW1lLCBpbiBtcywgdG8gZGVsYXkgdGhlIG9wZW5pbmcgb2YgYSBtb2RhbCBhZnRlciBhIGNsaWNrIGlmIG5vIGFuaW1hdGlvbiB1c2VkLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDEwXG4gICAqL1xuICBzaG93RGVsYXk6IDAsXG4gIC8qKlxuICAgKiBUaW1lLCBpbiBtcywgdG8gZGVsYXkgdGhlIGNsb3Npbmcgb2YgYSBtb2RhbCBhZnRlciBhIGNsaWNrIGlmIG5vIGFuaW1hdGlvbiB1c2VkLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDEwXG4gICAqL1xuICBoaWRlRGVsYXk6IDAsXG4gIC8qKlxuICAgKiBBbGxvd3MgYSBjbGljayBvbiB0aGUgYm9keS9vdmVybGF5IHRvIGNsb3NlIHRoZSBtb2RhbC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IHRydWUsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIG1vZGFsIHRvIGNsb3NlIGlmIHRoZSB1c2VyIHByZXNzZXMgdGhlIGBFU0NBUEVgIGtleS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBjbG9zZU9uRXNjOiB0cnVlLFxuICAvKipcbiAgICogSWYgdHJ1ZSwgYWxsb3dzIG11bHRpcGxlIG1vZGFscyB0byBiZSBkaXNwbGF5ZWQgYXQgb25jZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgbXVsdGlwbGVPcGVuZWQ6IGZhbHNlLFxuICAvKipcbiAgICogRGlzdGFuY2UsIGluIHBpeGVscywgdGhlIG1vZGFsIHNob3VsZCBwdXNoIGRvd24gZnJvbSB0aGUgdG9wIG9mIHRoZSBzY3JlZW4uXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMTAwXG4gICAqL1xuICB2T2Zmc2V0OiAxMDAsXG4gIC8qKlxuICAgKiBEaXN0YW5jZSwgaW4gcGl4ZWxzLCB0aGUgbW9kYWwgc2hvdWxkIHB1c2ggaW4gZnJvbSB0aGUgc2lkZSBvZiB0aGUgc2NyZWVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDBcbiAgICovXG4gIGhPZmZzZXQ6IDAsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIG1vZGFsIHRvIGJlIGZ1bGxzY3JlZW4sIGNvbXBsZXRlbHkgYmxvY2tpbmcgb3V0IHRoZSByZXN0IG9mIHRoZSB2aWV3LiBKUyBjaGVja3MgZm9yIHRoaXMgYXMgd2VsbC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgZnVsbFNjcmVlbjogZmFsc2UsXG4gIC8qKlxuICAgKiBQZXJjZW50YWdlIG9mIHNjcmVlbiBoZWlnaHQgdGhlIG1vZGFsIHNob3VsZCBwdXNoIHVwIGZyb20gdGhlIGJvdHRvbSBvZiB0aGUgdmlldy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxMFxuICAgKi9cbiAgYnRtT2Zmc2V0UGN0OiAxMCxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgbW9kYWwgdG8gZ2VuZXJhdGUgYW4gb3ZlcmxheSBkaXYsIHdoaWNoIHdpbGwgY292ZXIgdGhlIHZpZXcgd2hlbiBtb2RhbCBvcGVucy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSB0cnVlXG4gICAqL1xuICBvdmVybGF5OiB0cnVlLFxuICAvKipcbiAgICogQWxsb3dzIHRoZSBtb2RhbCB0byByZW1vdmUgYW5kIHJlaW5qZWN0IG1hcmt1cCBvbiBjbG9zZS4gU2hvdWxkIGJlIHRydWUgaWYgdXNpbmcgdmlkZW8gZWxlbWVudHMgdy9vIHVzaW5nIHByb3ZpZGVyJ3MgYXBpLCBvdGhlcndpc2UsIHZpZGVvcyB3aWxsIGNvbnRpbnVlIHRvIHBsYXkgaW4gdGhlIGJhY2tncm91bmQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgZmFsc2VcbiAgICovXG4gIHJlc2V0T25DbG9zZTogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIG1vZGFsIHRvIGFsdGVyIHRoZSB1cmwgb24gb3Blbi9jbG9zZSwgYW5kIGFsbG93cyB0aGUgdXNlIG9mIHRoZSBgYmFja2AgYnV0dG9uIHRvIGNsb3NlIG1vZGFscy4gQUxTTywgYWxsb3dzIGEgbW9kYWwgdG8gYXV0by1tYW5pYWNhbGx5IG9wZW4gb24gcGFnZSBsb2FkIElGIHRoZSBoYXNoID09PSB0aGUgbW9kYWwncyB1c2VyLXNldCBpZC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgZGVlcExpbms6IGZhbHNlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oUmV2ZWFsLCAnUmV2ZWFsJyk7XG5cbmZ1bmN0aW9uIGlQaG9uZVNuaWZmKCkge1xuICByZXR1cm4gL2lQKGFkfGhvbmV8b2QpLipPUy8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCk7XG59XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBUYWJzIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi50YWJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIgaWYgdGFicyBjb250YWluIGltYWdlc1xuICovXG5cbmNsYXNzIFRhYnMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiB0YWJzLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIFRhYnMjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIHRhYnMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgVGFicy5kZWZhdWx0cywgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ1RhYnMnKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdUYWJzJywge1xuICAgICAgJ0VOVEVSJzogJ29wZW4nLFxuICAgICAgJ1NQQUNFJzogJ29wZW4nLFxuICAgICAgJ0FSUk9XX1JJR0hUJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX1VQJzogJ3ByZXZpb3VzJyxcbiAgICAgICdBUlJPV19ET1dOJzogJ25leHQnLFxuICAgICAgJ0FSUk9XX0xFRlQnOiAncHJldmlvdXMnXG4gICAgICAvLyAnVEFCJzogJ25leHQnLFxuICAgICAgLy8gJ1NISUZUX1RBQic6ICdwcmV2aW91cydcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgdGFicyBieSBzaG93aW5nIGFuZCBmb2N1c2luZyAoaWYgYXV0b0ZvY3VzPXRydWUpIHRoZSBwcmVzZXQgYWN0aXZlIHRhYi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJUaXRsZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCk7XG4gICAgdGhpcy4kdGFiQ29udGVudCA9ICQoYFtkYXRhLXRhYnMtY29udGVudD1cIiR7dGhpcy4kZWxlbWVudFswXS5pZH1cIl1gKTtcblxuICAgIHRoaXMuJHRhYlRpdGxlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRsaW5rID0gJGVsZW0uZmluZCgnYScpLFxuICAgICAgICAgIGlzQWN0aXZlID0gJGVsZW0uaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpLFxuICAgICAgICAgIGhhc2ggPSAkbGlua1swXS5oYXNoLnNsaWNlKDEpLFxuICAgICAgICAgIGxpbmtJZCA9ICRsaW5rWzBdLmlkID8gJGxpbmtbMF0uaWQgOiBgJHtoYXNofS1sYWJlbGAsXG4gICAgICAgICAgJHRhYkNvbnRlbnQgPSAkKGAjJHtoYXNofWApO1xuXG4gICAgICAkZWxlbS5hdHRyKHsncm9sZSc6ICdwcmVzZW50YXRpb24nfSk7XG5cbiAgICAgICRsaW5rLmF0dHIoe1xuICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAnYXJpYS1jb250cm9scyc6IGhhc2gsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogaXNBY3RpdmUsXG4gICAgICAgICdpZCc6IGxpbmtJZFxuICAgICAgfSk7XG5cbiAgICAgICR0YWJDb250ZW50LmF0dHIoe1xuICAgICAgICAncm9sZSc6ICd0YWJwYW5lbCcsXG4gICAgICAgICdhcmlhLWhpZGRlbic6ICFpc0FjdGl2ZSxcbiAgICAgICAgJ2FyaWEtbGFiZWxsZWRieSc6IGxpbmtJZFxuICAgICAgfSk7XG5cbiAgICAgIGlmKGlzQWN0aXZlICYmIF90aGlzLm9wdGlvbnMuYXV0b0ZvY3VzKXtcbiAgICAgICAgJGxpbmsuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgdmFyICRpbWFnZXMgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoJ2ltZycpO1xuXG4gICAgICBpZiAoJGltYWdlcy5sZW5ndGgpIHtcbiAgICAgICAgRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCgkaW1hZ2VzLCB0aGlzLl9zZXRIZWlnaHQuYmluZCh0aGlzKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZXRIZWlnaHQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHRoaXMuX2FkZEtleUhhbmRsZXIoKTtcbiAgICB0aGlzLl9hZGRDbGlja0hhbmRsZXIoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fc2V0SGVpZ2h0LmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGNsaWNrIGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYWRkQ2xpY2tIYW5kbGVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub2ZmKCdjbGljay56Zi50YWJzJylcbiAgICAgIC5vbignY2xpY2suemYudGFicycsIGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWAsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCQodGhpcykpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBrZXlib2FyZCBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZEtleUhhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgJGZpcnN0VGFiID0gX3RoaXMuJGVsZW1lbnQuZmluZCgnbGk6Zmlyc3Qtb2YtdHlwZScpO1xuICAgIHZhciAkbGFzdFRhYiA9IF90aGlzLiRlbGVtZW50LmZpbmQoJ2xpOmxhc3Qtb2YtdHlwZScpO1xuXG4gICAgdGhpcy4kdGFiVGl0bGVzLm9mZigna2V5ZG93bi56Zi50YWJzJykub24oJ2tleWRvd24uemYudGFicycsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYgKGUud2hpY2ggPT09IDkpIHJldHVybjtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5jaGlsZHJlbignbGknKSxcbiAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMud3JhcE9uS2V5cykge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gaSA9PT0gMCA/ICRlbGVtZW50cy5sYXN0KCkgOiAkZWxlbWVudHMuZXEoaS0xKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9IGkgPT09ICRlbGVtZW50cy5sZW5ndGggLTEgPyAkZWxlbWVudHMuZmlyc3QoKSA6ICRlbGVtZW50cy5lcShpKzEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5taW4oaSsxLCAkZWxlbWVudHMubGVuZ3RoLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1RhYnMnLCB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRlbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRlbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkcHJldkVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJG5leHRFbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIHRhYiBgJHRhcmdldENvbnRlbnRgIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIFRhYiB0byBvcGVuLlxuICAgKiBAZmlyZXMgVGFicyNjaGFuZ2VcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfaGFuZGxlVGFiQ2hhbmdlKCR0YXJnZXQpIHtcbiAgICB2YXIgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgIGhhc2ggPSAkdGFiTGlua1swXS5oYXNoLFxuICAgICAgICAkdGFyZ2V0Q29udGVudCA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZChoYXNoKSxcbiAgICAgICAgJG9sZFRhYiA9IHRoaXMuJGVsZW1lbnQuXG4gICAgICAgICAgZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc30uaXMtYWN0aXZlYClcbiAgICAgICAgICAucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpXG4gICAgICAgICAgLmZpbmQoJ1tyb2xlPVwidGFiXCJdJylcbiAgICAgICAgICAuYXR0cih7ICdhcmlhLXNlbGVjdGVkJzogJ2ZhbHNlJyB9KTtcblxuICAgICQoYCMkeyRvbGRUYWIuYXR0cignYXJpYS1jb250cm9scycpfWApXG4gICAgICAucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpXG4gICAgICAuYXR0cih7ICdhcmlhLWhpZGRlbic6ICd0cnVlJyB9KTtcblxuICAgICR0YXJnZXQuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgJHRhYkxpbmsuYXR0cih7J2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZSd9KTtcblxuICAgICR0YXJnZXRDb250ZW50XG4gICAgICAuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpXG4gICAgICAuYXR0cih7J2FyaWEtaGlkZGVuJzogJ2ZhbHNlJ30pO1xuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBzdWNjZXNzZnVsbHkgY2hhbmdlZCB0YWJzLlxuICAgICAqIEBldmVudCBUYWJzI2NoYW5nZVxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2hhbmdlLnpmLnRhYnMnLCBbJHRhcmdldF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpYyBtZXRob2QgZm9yIHNlbGVjdGluZyBhIGNvbnRlbnQgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2pRdWVyeSB8IFN0cmluZ30gZWxlbSAtIGpRdWVyeSBvYmplY3Qgb3Igc3RyaW5nIG9mIHRoZSBpZCBvZiB0aGUgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHNlbGVjdFRhYihlbGVtKSB7XG4gICAgdmFyIGlkU3RyO1xuXG4gICAgaWYgKHR5cGVvZiBlbGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgaWRTdHIgPSBlbGVtWzBdLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZFN0ciA9IGVsZW07XG4gICAgfVxuXG4gICAgaWYgKGlkU3RyLmluZGV4T2YoJyMnKSA8IDApIHtcbiAgICAgIGlkU3RyID0gYCMke2lkU3RyfWA7XG4gICAgfVxuXG4gICAgdmFyICR0YXJnZXQgPSB0aGlzLiR0YWJUaXRsZXMuZmluZChgW2hyZWY9XCIke2lkU3RyfVwiXWApLnBhcmVudChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcblxuICAgIHRoaXMuX2hhbmRsZVRhYkNoYW5nZSgkdGFyZ2V0KTtcbiAgfTtcbiAgLyoqXG4gICAqIFNldHMgdGhlIGhlaWdodCBvZiBlYWNoIHBhbmVsIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHRhbGxlc3QgcGFuZWwuXG4gICAqIElmIGVuYWJsZWQgaW4gb3B0aW9ucywgZ2V0cyBjYWxsZWQgb24gbWVkaWEgcXVlcnkgY2hhbmdlLlxuICAgKiBJZiBsb2FkaW5nIGNvbnRlbnQgdmlhIGV4dGVybmFsIHNvdXJjZSwgY2FuIGJlIGNhbGxlZCBkaXJlY3RseSBvciB3aXRoIF9yZWZsb3cuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldEhlaWdodCgpIHtcbiAgICB2YXIgbWF4ID0gMDtcbiAgICB0aGlzLiR0YWJDb250ZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5jc3MoJ2hlaWdodCcsICcnKVxuICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYW5lbCA9ICQodGhpcyksXG4gICAgICAgICAgICBpc0FjdGl2ZSA9IHBhbmVsLmhhc0NsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICAgcGFuZWwuY3NzKHsndmlzaWJpbGl0eSc6ICdoaWRkZW4nLCAnZGlzcGxheSc6ICdibG9jayd9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZW1wID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgICAgIHBhbmVsLmNzcyh7XG4gICAgICAgICAgICAndmlzaWJpbGl0eSc6ICcnLFxuICAgICAgICAgICAgJ2Rpc3BsYXknOiAnJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbWF4ID0gdGVtcCA+IG1heCA/IHRlbXAgOiBtYXg7XG4gICAgICB9KVxuICAgICAgLmNzcygnaGVpZ2h0JywgYCR7bWF4fXB4YCk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYW4gdGFicy5cbiAgICogQGZpcmVzIFRhYnMjZGVzdHJveWVkXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApXG4gICAgICAub2ZmKCcuemYudGFicycpLmhpZGUoKS5lbmQoKVxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5wYW5lbENsYXNzfWApXG4gICAgICAuaGlkZSgpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgJCh3aW5kb3cpLm9mZignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5Jyk7XG4gICAgfVxuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblRhYnMuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBhY3RpdmUgcGFuZSBvbiBsb2FkIGlmIHNldCB0byB0cnVlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBhdXRvRm9jdXM6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3Mga2V5Ym9hcmQgaW5wdXQgdG8gJ3dyYXAnIGFyb3VuZCB0aGUgdGFiIGxpbmtzLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIHRydWVcbiAgICovXG4gIHdyYXBPbktleXM6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgdGFiIGNvbnRlbnQgcGFuZXMgdG8gbWF0Y2ggaGVpZ2h0cyBpZiBzZXQgdG8gdHJ1ZS5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSBmYWxzZVxuICAgKi9cbiAgbWF0Y2hIZWlnaHQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIGBsaWAncyBpbiB0YWIgbGluayBsaXN0LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICd0YWJzLXRpdGxlJ1xuICAgKi9cbiAgbGlua0NsYXNzOiAndGFicy10aXRsZScsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGNvbnRlbnQgY29udGFpbmVycy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAndGFicy1wYW5lbCdcbiAgICovXG4gIHBhbmVsQ2xhc3M6ICd0YWJzLXBhbmVsJ1xufTtcblxuZnVuY3Rpb24gY2hlY2tDbGFzcygkZWxlbSl7XG4gIHJldHVybiAkZWxlbS5oYXNDbGFzcygnaXMtYWN0aXZlJyk7XG59XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihUYWJzLCAnVGFicycpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogVG9vbHRpcCBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24udG9vbHRpcFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5ib3hcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqL1xuXG5jbGFzcyBUb29sdGlwIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSBUb29sdGlwLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIFRvb2x0aXAjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYXR0YWNoIGEgdG9vbHRpcCB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBvYmplY3QgdG8gZXh0ZW5kIHRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRvb2x0aXAuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICB0aGlzLmlzQ2xpY2sgPSBmYWxzZTtcbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdUb29sdGlwJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHRvb2x0aXAgYnkgc2V0dGluZyB0aGUgY3JlYXRpbmcgdGhlIHRpcCBlbGVtZW50LCBhZGRpbmcgaXQncyB0ZXh0LCBzZXR0aW5nIHByaXZhdGUgdmFyaWFibGVzIGFuZCBzZXR0aW5nIGF0dHJpYnV0ZXMgb24gdGhlIGFuY2hvci5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBlbGVtSWQgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKSB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICd0b29sdGlwJyk7XG5cbiAgICB0aGlzLm9wdGlvbnMucG9zaXRpb25DbGFzcyA9IHRoaXMuX2dldFBvc2l0aW9uQ2xhc3ModGhpcy4kZWxlbWVudCk7XG4gICAgdGhpcy5vcHRpb25zLnRpcFRleHQgPSB0aGlzLm9wdGlvbnMudGlwVGV4dCB8fCB0aGlzLiRlbGVtZW50LmF0dHIoJ3RpdGxlJyk7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRoaXMub3B0aW9ucy50ZW1wbGF0ZSA/ICQodGhpcy5vcHRpb25zLnRlbXBsYXRlKSA6IHRoaXMuX2J1aWxkVGVtcGxhdGUoZWxlbUlkKTtcblxuICAgIHRoaXMudGVtcGxhdGUuYXBwZW5kVG8oZG9jdW1lbnQuYm9keSlcbiAgICAgICAgLnRleHQodGhpcy5vcHRpb25zLnRpcFRleHQpXG4gICAgICAgIC5oaWRlKCk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoe1xuICAgICAgJ3RpdGxlJzogJycsXG4gICAgICAnYXJpYS1kZXNjcmliZWRieSc6IGVsZW1JZCxcbiAgICAgICdkYXRhLXlldGktYm94JzogZWxlbUlkLFxuICAgICAgJ2RhdGEtdG9nZ2xlJzogZWxlbUlkLFxuICAgICAgJ2RhdGEtcmVzaXplJzogZWxlbUlkXG4gICAgfSkuYWRkQ2xhc3ModGhpcy50cmlnZ2VyQ2xhc3MpO1xuXG4gICAgLy9oZWxwZXIgdmFyaWFibGVzIHRvIHRyYWNrIG1vdmVtZW50IG9uIGNvbGxpc2lvbnNcbiAgICB0aGlzLnVzZWRQb3NpdGlvbnMgPSBbXTtcbiAgICB0aGlzLmNvdW50ZXIgPSA0O1xuICAgIHRoaXMuY2xhc3NDaGFuZ2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHcmFicyB0aGUgY3VycmVudCBwb3NpdGlvbmluZyBjbGFzcywgaWYgcHJlc2VudCwgYW5kIHJldHVybnMgdGhlIHZhbHVlIG9yIGFuIGVtcHR5IHN0cmluZy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9nZXRQb3NpdGlvbkNsYXNzKGVsZW1lbnQpIHtcbiAgICBpZiAoIWVsZW1lbnQpIHsgcmV0dXJuICcnOyB9XG4gICAgLy8gdmFyIHBvc2l0aW9uID0gZWxlbWVudC5hdHRyKCdjbGFzcycpLm1hdGNoKC90b3B8bGVmdHxyaWdodC9nKTtcbiAgICB2YXIgcG9zaXRpb24gPSBlbGVtZW50WzBdLmNsYXNzTmFtZS5tYXRjaCgvXFxiKHRvcHxsZWZ0fHJpZ2h0KVxcYi9nKTtcbiAgICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbiA/IHBvc2l0aW9uWzBdIDogJyc7XG4gICAgcmV0dXJuIHBvc2l0aW9uO1xuICB9O1xuICAvKipcbiAgICogYnVpbGRzIHRoZSB0b29sdGlwIGVsZW1lbnQsIGFkZHMgYXR0cmlidXRlcywgYW5kIHJldHVybnMgdGhlIHRlbXBsYXRlLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2J1aWxkVGVtcGxhdGUoaWQpIHtcbiAgICB2YXIgdGVtcGxhdGVDbGFzc2VzID0gKGAke3RoaXMub3B0aW9ucy50b29sdGlwQ2xhc3N9ICR7dGhpcy5vcHRpb25zLnBvc2l0aW9uQ2xhc3N9ICR7dGhpcy5vcHRpb25zLnRlbXBsYXRlQ2xhc3Nlc31gKS50cmltKCk7XG4gICAgdmFyICR0ZW1wbGF0ZSA9ICAkKCc8ZGl2PjwvZGl2PicpLmFkZENsYXNzKHRlbXBsYXRlQ2xhc3NlcykuYXR0cih7XG4gICAgICAncm9sZSc6ICd0b29sdGlwJyxcbiAgICAgICdhcmlhLWhpZGRlbic6IHRydWUsXG4gICAgICAnZGF0YS1pcy1hY3RpdmUnOiBmYWxzZSxcbiAgICAgICdkYXRhLWlzLWZvY3VzJzogZmFsc2UsXG4gICAgICAnaWQnOiBpZFxuICAgIH0pO1xuICAgIHJldHVybiAkdGVtcGxhdGU7XG4gIH1cblxuICAvKipcbiAgICogRnVuY3Rpb24gdGhhdCBnZXRzIGNhbGxlZCBpZiBhIGNvbGxpc2lvbiBldmVudCBpcyBkZXRlY3RlZC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gcG9zaXRpb25pbmcgY2xhc3MgdG8gdHJ5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVwb3NpdGlvbihwb3NpdGlvbikge1xuICAgIHRoaXMudXNlZFBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uID8gcG9zaXRpb24gOiAnYm90dG9tJyk7XG5cbiAgICAvL2RlZmF1bHQsIHRyeSBzd2l0Y2hpbmcgdG8gb3Bwb3NpdGUgc2lkZVxuICAgIGlmICghcG9zaXRpb24gJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCd0b3AnKSA8IDApKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLmFkZENsYXNzKCd0b3AnKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpIDwgMCkpIHtcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdsZWZ0JyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3JpZ2h0JykgPCAwKSkge1xuICAgICAgdGhpcy50ZW1wbGF0ZS5yZW1vdmVDbGFzcyhwb3NpdGlvbilcbiAgICAgICAgICAuYWRkQ2xhc3MoJ3JpZ2h0Jyk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ3JpZ2h0JyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2xlZnQnKSA8IDApKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKVxuICAgICAgICAgIC5hZGRDbGFzcygnbGVmdCcpO1xuICAgIH1cblxuICAgIC8vaWYgZGVmYXVsdCBjaGFuZ2UgZGlkbid0IHdvcmssIHRyeSBib3R0b20gb3IgbGVmdCBmaXJzdFxuICAgIGVsc2UgaWYgKCFwb3NpdGlvbiAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ3RvcCcpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpIDwgMCkpIHtcbiAgICAgIHRoaXMudGVtcGxhdGUuYWRkQ2xhc3MoJ2xlZnQnKTtcbiAgICB9IGVsc2UgaWYgKHBvc2l0aW9uID09PSAndG9wJyAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpID4gLTEpICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZignbGVmdCcpIDwgMCkpIHtcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pXG4gICAgICAgICAgLmFkZENsYXNzKCdsZWZ0Jyk7XG4gICAgfSBlbHNlIGlmIChwb3NpdGlvbiA9PT0gJ2xlZnQnICYmICh0aGlzLnVzZWRQb3NpdGlvbnMuaW5kZXhPZigncmlnaHQnKSA+IC0xKSAmJiAodGhpcy51c2VkUG9zaXRpb25zLmluZGV4T2YoJ2JvdHRvbScpIDwgMCkpIHtcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xuICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPT09ICdyaWdodCcgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdsZWZ0JykgPiAtMSkgJiYgKHRoaXMudXNlZFBvc2l0aW9ucy5pbmRleE9mKCdib3R0b20nKSA8IDApKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlLnJlbW92ZUNsYXNzKHBvc2l0aW9uKTtcbiAgICB9XG4gICAgLy9pZiBub3RoaW5nIGNsZWFyZWQsIHNldCB0byBib3R0b21cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMudGVtcGxhdGUucmVtb3ZlQ2xhc3MocG9zaXRpb24pO1xuICAgIH1cbiAgICB0aGlzLmNsYXNzQ2hhbmdlZCA9IHRydWU7XG4gICAgdGhpcy5jb3VudGVyLS07XG4gIH1cblxuICAvKipcbiAgICogc2V0cyB0aGUgcG9zaXRpb24gY2xhc3Mgb2YgYW4gZWxlbWVudCBhbmQgcmVjdXJzaXZlbHkgY2FsbHMgaXRzZWxmIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIHBvc3NpYmxlIHBvc2l0aW9ucyB0byBhdHRlbXB0LCBvciB0aGUgdG9vbHRpcCBlbGVtZW50IGlzIG5vIGxvbmdlciBjb2xsaWRpbmcuXG4gICAqIGlmIHRoZSB0b29sdGlwIGlzIGxhcmdlciB0aGFuIHRoZSBzY3JlZW4gd2lkdGgsIGRlZmF1bHQgdG8gZnVsbCB3aWR0aCAtIGFueSB1c2VyIHNlbGVjdGVkIG1hcmdpblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldFBvc2l0aW9uKCkge1xuICAgIHZhciBwb3NpdGlvbiA9IHRoaXMuX2dldFBvc2l0aW9uQ2xhc3ModGhpcy50ZW1wbGF0ZSksXG4gICAgICAgICR0aXBEaW1zID0gRm91bmRhdGlvbi5Cb3guR2V0RGltZW5zaW9ucyh0aGlzLnRlbXBsYXRlKSxcbiAgICAgICAgJGFuY2hvckRpbXMgPSBGb3VuZGF0aW9uLkJveC5HZXREaW1lbnNpb25zKHRoaXMuJGVsZW1lbnQpLFxuICAgICAgICBkaXJlY3Rpb24gPSAocG9zaXRpb24gPT09ICdsZWZ0JyA/ICdsZWZ0JyA6ICgocG9zaXRpb24gPT09ICdyaWdodCcpID8gJ2xlZnQnIDogJ3RvcCcpKSxcbiAgICAgICAgcGFyYW0gPSAoZGlyZWN0aW9uID09PSAndG9wJykgPyAnaGVpZ2h0JyA6ICd3aWR0aCcsXG4gICAgICAgIG9mZnNldCA9IChwYXJhbSA9PT0gJ2hlaWdodCcpID8gdGhpcy5vcHRpb25zLnZPZmZzZXQgOiB0aGlzLm9wdGlvbnMuaE9mZnNldCxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuXG4gICAgaWYgKCgkdGlwRGltcy53aWR0aCA+PSAkdGlwRGltcy53aW5kb3dEaW1zLndpZHRoKSB8fCAoIXRoaXMuY291bnRlciAmJiAhRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSh0aGlzLnRlbXBsYXRlKSkpIHtcbiAgICAgIHRoaXMudGVtcGxhdGUub2Zmc2V0KEZvdW5kYXRpb24uQm94LkdldE9mZnNldHModGhpcy50ZW1wbGF0ZSwgdGhpcy4kZWxlbWVudCwgJ2NlbnRlciBib3R0b20nLCB0aGlzLm9wdGlvbnMudk9mZnNldCwgdGhpcy5vcHRpb25zLmhPZmZzZXQsIHRydWUpKS5jc3Moe1xuICAgICAgLy8gdGhpcy4kZWxlbWVudC5vZmZzZXQoRm91bmRhdGlvbi5HZXRPZmZzZXRzKHRoaXMudGVtcGxhdGUsIHRoaXMuJGVsZW1lbnQsICdjZW50ZXIgYm90dG9tJywgdGhpcy5vcHRpb25zLnZPZmZzZXQsIHRoaXMub3B0aW9ucy5oT2Zmc2V0LCB0cnVlKSkuY3NzKHtcbiAgICAgICAgJ3dpZHRoJzogJGFuY2hvckRpbXMud2luZG93RGltcy53aWR0aCAtICh0aGlzLm9wdGlvbnMuaE9mZnNldCAqIDIpLFxuICAgICAgICAnaGVpZ2h0JzogJ2F1dG8nXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnRlbXBsYXRlLm9mZnNldChGb3VuZGF0aW9uLkJveC5HZXRPZmZzZXRzKHRoaXMudGVtcGxhdGUsIHRoaXMuJGVsZW1lbnQsJ2NlbnRlciAnICsgKHBvc2l0aW9uIHx8ICdib3R0b20nKSwgdGhpcy5vcHRpb25zLnZPZmZzZXQsIHRoaXMub3B0aW9ucy5oT2Zmc2V0KSk7XG5cbiAgICB3aGlsZSghRm91bmRhdGlvbi5Cb3guSW1Ob3RUb3VjaGluZ1lvdSh0aGlzLnRlbXBsYXRlKSAmJiB0aGlzLmNvdW50ZXIpIHtcbiAgICAgIHRoaXMuX3JlcG9zaXRpb24ocG9zaXRpb24pO1xuICAgICAgdGhpcy5fc2V0UG9zaXRpb24oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcmV2ZWFscyB0aGUgdG9vbHRpcCwgYW5kIGZpcmVzIGFuIGV2ZW50IHRvIGNsb3NlIGFueSBvdGhlciBvcGVuIHRvb2x0aXBzIG9uIHRoZSBwYWdlXG4gICAqIEBmaXJlcyBUb29sdGlwI2Nsb3NlbWVcbiAgICogQGZpcmVzIFRvb2x0aXAjc2hvd1xuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHNob3coKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5zaG93T24gIT09ICdhbGwnICYmICFGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdCh0aGlzLm9wdGlvbnMuc2hvd09uKSkge1xuICAgICAgLy8gY29uc29sZS5lcnJvcignVGhlIHNjcmVlbiBpcyB0b28gc21hbGwgdG8gZGlzcGxheSB0aGlzIHRvb2x0aXAnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMudGVtcGxhdGUuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpLnNob3coKTtcbiAgICB0aGlzLl9zZXRQb3NpdGlvbigpO1xuXG4gICAgLyoqXG4gICAgICogRmlyZXMgdG8gY2xvc2UgYWxsIG90aGVyIG9wZW4gdG9vbHRpcHMgb24gdGhlIHBhZ2VcbiAgICAgKiBAZXZlbnQgQ2xvc2VtZSN0b29sdGlwXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjbG9zZW1lLnpmLnRvb2x0aXAnLCB0aGlzLnRlbXBsYXRlLmF0dHIoJ2lkJykpO1xuXG5cbiAgICB0aGlzLnRlbXBsYXRlLmF0dHIoe1xuICAgICAgJ2RhdGEtaXMtYWN0aXZlJzogdHJ1ZSxcbiAgICAgICdhcmlhLWhpZGRlbic6IGZhbHNlXG4gICAgfSk7XG4gICAgX3RoaXMuaXNBY3RpdmUgPSB0cnVlO1xuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMudGVtcGxhdGUpO1xuICAgIHRoaXMudGVtcGxhdGUuc3RvcCgpLmhpZGUoKS5jc3MoJ3Zpc2liaWxpdHknLCAnJykuZmFkZUluKHRoaXMub3B0aW9ucy5mYWRlSW5EdXJhdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICAvL21heWJlIGRvIHN0dWZmP1xuICAgIH0pO1xuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHRvb2x0aXAgaXMgc2hvd25cbiAgICAgKiBAZXZlbnQgVG9vbHRpcCNzaG93XG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzaG93LnpmLnRvb2x0aXAnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIaWRlcyB0aGUgY3VycmVudCB0b29sdGlwLCBhbmQgcmVzZXRzIHRoZSBwb3NpdGlvbmluZyBjbGFzcyBpZiBpdCB3YXMgY2hhbmdlZCBkdWUgdG8gY29sbGlzaW9uXG4gICAqIEBmaXJlcyBUb29sdGlwI2hpZGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBoaWRlKCkge1xuICAgIC8vIGNvbnNvbGUubG9nKCdoaWRpbmcnLCB0aGlzLiRlbGVtZW50LmRhdGEoJ3lldGktYm94JykpO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy50ZW1wbGF0ZS5zdG9wKCkuYXR0cih7XG4gICAgICAnYXJpYS1oaWRkZW4nOiB0cnVlLFxuICAgICAgJ2RhdGEtaXMtYWN0aXZlJzogZmFsc2VcbiAgICB9KS5mYWRlT3V0KHRoaXMub3B0aW9ucy5mYWRlT3V0RHVyYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgX3RoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgIF90aGlzLmlzQ2xpY2sgPSBmYWxzZTtcbiAgICAgIGlmIChfdGhpcy5jbGFzc0NoYW5nZWQpIHtcbiAgICAgICAgX3RoaXMudGVtcGxhdGVcbiAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MoX3RoaXMuX2dldFBvc2l0aW9uQ2xhc3MoX3RoaXMudGVtcGxhdGUpKVxuICAgICAgICAgICAgIC5hZGRDbGFzcyhfdGhpcy5vcHRpb25zLnBvc2l0aW9uQ2xhc3MpO1xuXG4gICAgICAgX3RoaXMudXNlZFBvc2l0aW9ucyA9IFtdO1xuICAgICAgIF90aGlzLmNvdW50ZXIgPSA0O1xuICAgICAgIF90aGlzLmNsYXNzQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIC8qKlxuICAgICAqIGZpcmVzIHdoZW4gdGhlIHRvb2x0aXAgaXMgaGlkZGVuXG4gICAgICogQGV2ZW50IFRvb2x0aXAjaGlkZVxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignaGlkZS56Zi50b29sdGlwJyk7XG4gIH1cblxuICAvKipcbiAgICogYWRkcyBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSB0b29sdGlwIGFuZCBpdHMgYW5jaG9yXG4gICAqIFRPRE8gY29tYmluZSBzb21lIG9mIHRoZSBsaXN0ZW5lcnMgbGlrZSBmb2N1cyBhbmQgbW91c2VlbnRlciwgZXRjLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciAkdGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlO1xuICAgIHZhciBpc0ZvY3VzID0gZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXNhYmxlSG92ZXIpIHtcblxuICAgICAgdGhpcy4kZWxlbWVudFxuICAgICAgLm9uKCdtb3VzZWVudGVyLnpmLnRvb2x0aXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICghX3RoaXMuaXNBY3RpdmUpIHtcbiAgICAgICAgICBfdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLnNob3coKTtcbiAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLm9uKCdtb3VzZWxlYXZlLnpmLnRvb2x0aXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChfdGhpcy50aW1lb3V0KTtcbiAgICAgICAgaWYgKCFpc0ZvY3VzIHx8ICghX3RoaXMuaXNDbGljayAmJiBfdGhpcy5vcHRpb25zLmNsaWNrT3BlbikpIHtcbiAgICAgICAgICBfdGhpcy5oaWRlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xpY2tPcGVuKSB7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdtb3VzZWRvd24uemYudG9vbHRpcCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgaWYgKF90aGlzLmlzQ2xpY2spIHtcbiAgICAgICAgICBfdGhpcy5oaWRlKCk7XG4gICAgICAgICAgLy8gX3RoaXMuaXNDbGljayA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF90aGlzLmlzQ2xpY2sgPSB0cnVlO1xuICAgICAgICAgIGlmICgoX3RoaXMub3B0aW9ucy5kaXNhYmxlSG92ZXIgfHwgIV90aGlzLiRlbGVtZW50LmF0dHIoJ3RhYmluZGV4JykpICYmICFfdGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICAgICAgX3RoaXMuc2hvdygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuZGlzYWJsZUZvclRvdWNoKSB7XG4gICAgICB0aGlzLiRlbGVtZW50XG4gICAgICAub24oJ3RhcC56Zi50b29sdGlwIHRvdWNoZW5kLnpmLnRvb2x0aXAnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIF90aGlzLmlzQWN0aXZlID8gX3RoaXMuaGlkZSgpIDogX3RoaXMuc2hvdygpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC5vbih7XG4gICAgICAvLyAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpLFxuICAgICAgLy8gJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmhpZGUuYmluZCh0aGlzKVxuICAgICAgJ2Nsb3NlLnpmLnRyaWdnZXInOiB0aGlzLmhpZGUuYmluZCh0aGlzKVxuICAgIH0pO1xuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLm9uKCdmb2N1cy56Zi50b29sdGlwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpc0ZvY3VzID0gdHJ1ZTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coX3RoaXMuaXNDbGljayk7XG4gICAgICAgIGlmIChfdGhpcy5pc0NsaWNrKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vICQod2luZG93KVxuICAgICAgICAgIF90aGlzLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgLm9uKCdmb2N1c291dC56Zi50b29sdGlwJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpc0ZvY3VzID0gZmFsc2U7XG4gICAgICAgIF90aGlzLmlzQ2xpY2sgPSBmYWxzZTtcbiAgICAgICAgX3RoaXMuaGlkZSgpO1xuICAgICAgfSlcblxuICAgICAgLm9uKCdyZXNpemVtZS56Zi50cmlnZ2VyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfdGhpcy5pc0FjdGl2ZSkge1xuICAgICAgICAgIF90aGlzLl9zZXRQb3NpdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBhZGRzIGEgdG9nZ2xlIG1ldGhvZCwgaW4gYWRkaXRpb24gdG8gdGhlIHN0YXRpYyBzaG93KCkgJiBoaWRlKCkgZnVuY3Rpb25zXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLmlzQWN0aXZlKSB7XG4gICAgICB0aGlzLmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zaG93KCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIHRvb2x0aXAsIHJlbW92ZXMgdGVtcGxhdGUgZWxlbWVudCBmcm9tIHRoZSB2aWV3LlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCd0aXRsZScsIHRoaXMudGVtcGxhdGUudGV4dCgpKVxuICAgICAgICAgICAgICAgICAub2ZmKCcuemYudHJpZ2dlciAuemYudG9vdGlwJylcbiAgICAgICAgICAgICAgICAvLyAgLnJlbW92ZUNsYXNzKCdoYXMtdGlwJylcbiAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKVxuICAgICAgICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS15ZXRpLWJveCcpXG4gICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXRvZ2dsZScpXG4gICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXJlc2l6ZScpO1xuXG4gICAgdGhpcy50ZW1wbGF0ZS5yZW1vdmUoKTtcblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5Ub29sdGlwLmRlZmF1bHRzID0ge1xuICBkaXNhYmxlRm9yVG91Y2g6IGZhbHNlLFxuICAvKipcbiAgICogVGltZSwgaW4gbXMsIGJlZm9yZSBhIHRvb2x0aXAgc2hvdWxkIG9wZW4gb24gaG92ZXIuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMjAwXG4gICAqL1xuICBob3ZlckRlbGF5OiAyMDAsXG4gIC8qKlxuICAgKiBUaW1lLCBpbiBtcywgYSB0b29sdGlwIHNob3VsZCB0YWtlIHRvIGZhZGUgaW50byB2aWV3LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDE1MFxuICAgKi9cbiAgZmFkZUluRHVyYXRpb246IDE1MCxcbiAgLyoqXG4gICAqIFRpbWUsIGluIG1zLCBhIHRvb2x0aXAgc2hvdWxkIHRha2UgdG8gZmFkZSBvdXQgb2Ygdmlldy5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAxNTBcbiAgICovXG4gIGZhZGVPdXREdXJhdGlvbjogMTUwLFxuICAvKipcbiAgICogRGlzYWJsZXMgaG92ZXIgZXZlbnRzIGZyb20gb3BlbmluZyB0aGUgdG9vbHRpcCBpZiBzZXQgdG8gdHJ1ZVxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIGZhbHNlXG4gICAqL1xuICBkaXNhYmxlSG92ZXI6IGZhbHNlLFxuICAvKipcbiAgICogT3B0aW9uYWwgYWRkdGlvbmFsIGNsYXNzZXMgdG8gYXBwbHkgdG8gdGhlIHRvb2x0aXAgdGVtcGxhdGUgb24gaW5pdC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnbXktY29vbC10aXAtY2xhc3MnXG4gICAqL1xuICB0ZW1wbGF0ZUNsYXNzZXM6ICcnLFxuICAvKipcbiAgICogTm9uLW9wdGlvbmFsIGNsYXNzIGFkZGVkIHRvIHRvb2x0aXAgdGVtcGxhdGVzLiBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgJ3Rvb2x0aXAnLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICd0b29sdGlwJ1xuICAgKi9cbiAgdG9vbHRpcENsYXNzOiAndG9vbHRpcCcsXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSB0b29sdGlwIGFuY2hvciBlbGVtZW50LlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdoYXMtdGlwJ1xuICAgKi9cbiAgdHJpZ2dlckNsYXNzOiAnaGFzLXRpcCcsXG4gIC8qKlxuICAgKiBNaW5pbXVtIGJyZWFrcG9pbnQgc2l6ZSBhdCB3aGljaCB0byBvcGVuIHRoZSB0b29sdGlwLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdzbWFsbCdcbiAgICovXG4gIHNob3dPbjogJ3NtYWxsJyxcbiAgLyoqXG4gICAqIEN1c3RvbSB0ZW1wbGF0ZSB0byBiZSB1c2VkIHRvIGdlbmVyYXRlIG1hcmt1cCBmb3IgdG9vbHRpcC5cbiAgICogQG9wdGlvblxuICAgKiBAZXhhbXBsZSAnJmx0O2RpdiBjbGFzcz1cInRvb2x0aXBcIiZndDsmbHQ7L2RpdiZndDsnXG4gICAqL1xuICB0ZW1wbGF0ZTogJycsXG4gIC8qKlxuICAgKiBUZXh0IGRpc3BsYXllZCBpbiB0aGUgdG9vbHRpcCB0ZW1wbGF0ZSBvbiBvcGVuLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlICdTb21lIGNvb2wgc3BhY2UgZmFjdCBoZXJlLidcbiAgICovXG4gIHRpcFRleHQ6ICcnLFxuICB0b3VjaENsb3NlVGV4dDogJ1RhcCB0byBjbG9zZS4nLFxuICAvKipcbiAgICogQWxsb3dzIHRoZSB0b29sdGlwIHRvIHJlbWFpbiBvcGVuIGlmIHRyaWdnZXJlZCB3aXRoIGEgY2xpY2sgb3IgdG91Y2ggZXZlbnQuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgdHJ1ZVxuICAgKi9cbiAgY2xpY2tPcGVuOiB0cnVlLFxuICAvKipcbiAgICogQWRkaXRpb25hbCBwb3NpdGlvbmluZyBjbGFzc2VzLCBzZXQgYnkgdGhlIEpTXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgJ3RvcCdcbiAgICovXG4gIHBvc2l0aW9uQ2xhc3M6ICcnLFxuICAvKipcbiAgICogRGlzdGFuY2UsIGluIHBpeGVscywgdGhlIHRlbXBsYXRlIHNob3VsZCBwdXNoIGF3YXkgZnJvbSB0aGUgYW5jaG9yIG9uIHRoZSBZIGF4aXMuXG4gICAqIEBvcHRpb25cbiAgICogQGV4YW1wbGUgMTBcbiAgICovXG4gIHZPZmZzZXQ6IDEwLFxuICAvKipcbiAgICogRGlzdGFuY2UsIGluIHBpeGVscywgdGhlIHRlbXBsYXRlIHNob3VsZCBwdXNoIGF3YXkgZnJvbSB0aGUgYW5jaG9yIG9uIHRoZSBYIGF4aXMsIGlmIGFsaWduZWQgdG8gYSBzaWRlLlxuICAgKiBAb3B0aW9uXG4gICAqIEBleGFtcGxlIDEyXG4gICAqL1xuICBoT2Zmc2V0OiAxMlxufTtcblxuLyoqXG4gKiBUT0RPIHV0aWxpemUgcmVzaXplIGV2ZW50IHRyaWdnZXJcbiAqL1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oVG9vbHRpcCwgJ1Rvb2x0aXAnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5Gb3VuZGF0aW9uLkJveCA9IHtcbiAgSW1Ob3RUb3VjaGluZ1lvdTogSW1Ob3RUb3VjaGluZ1lvdSxcbiAgR2V0RGltZW5zaW9uczogR2V0RGltZW5zaW9ucyxcbiAgR2V0T2Zmc2V0czogR2V0T2Zmc2V0c1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHRoZSBkaW1lbnNpb25zIG9mIGFuIGVsZW1lbnQgdG8gYSBjb250YWluZXIgYW5kIGRldGVybWluZXMgY29sbGlzaW9uIGV2ZW50cyB3aXRoIGNvbnRhaW5lci5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHRlc3QgZm9yIGNvbGxpc2lvbnMuXG4gKiBAcGFyYW0ge2pRdWVyeX0gcGFyZW50IC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgYm91bmRpbmcgY29udGFpbmVyLlxuICogQHBhcmFtIHtCb29sZWFufSBsck9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayBsZWZ0IGFuZCByaWdodCB2YWx1ZXMgb25seS5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgdG9wIGFuZCBib3R0b20gdmFsdWVzIG9ubHkuXG4gKiBAZGVmYXVsdCBpZiBubyBwYXJlbnQgb2JqZWN0IHBhc3NlZCwgZGV0ZWN0cyBjb2xsaXNpb25zIHdpdGggYHdpbmRvd2AuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gLSB0cnVlIGlmIGNvbGxpc2lvbiBmcmVlLCBmYWxzZSBpZiBhIGNvbGxpc2lvbiBpbiBhbnkgZGlyZWN0aW9uLlxuICovXG5mdW5jdGlvbiBJbU5vdFRvdWNoaW5nWW91KGVsZW1lbnQsIHBhcmVudCwgbHJPbmx5LCB0Yk9ubHkpIHtcbiAgdmFyIGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgdG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0O1xuXG4gIGlmIChwYXJlbnQpIHtcbiAgICB2YXIgcGFyRGltcyA9IEdldERpbWVuc2lvbnMocGFyZW50KTtcblxuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBwYXJEaW1zLmhlaWdodCArIHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgdG9wICAgID0gKGVsZURpbXMub2Zmc2V0LnRvcCA+PSBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBwYXJEaW1zLndpZHRoKTtcbiAgfVxuICBlbHNlIHtcbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCArIGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBlbGVEaW1zLndpbmRvd0RpbXMud2lkdGgpO1xuICB9XG5cbiAgdmFyIGFsbERpcnMgPSBbYm90dG9tLCB0b3AsIGxlZnQsIHJpZ2h0XTtcblxuICBpZiAobHJPbmx5KSB7XG4gICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0ID09PSB0cnVlO1xuICB9XG5cbiAgaWYgKHRiT25seSkge1xuICAgIHJldHVybiB0b3AgPT09IGJvdHRvbSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBhbGxEaXJzLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbn07XG5cbi8qKlxuICogVXNlcyBuYXRpdmUgbWV0aG9kcyB0byByZXR1cm4gYW4gb2JqZWN0IG9mIGRpbWVuc2lvbiB2YWx1ZXMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5IHx8IEhUTUx9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IG9yIERPTSBlbGVtZW50IGZvciB3aGljaCB0byBnZXQgdGhlIGRpbWVuc2lvbnMuIENhbiBiZSBhbnkgZWxlbWVudCBvdGhlciB0aGF0IGRvY3VtZW50IG9yIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gbmVzdGVkIG9iamVjdCBvZiBpbnRlZ2VyIHBpeGVsIHZhbHVlc1xuICogVE9ETyAtIGlmIGVsZW1lbnQgaXMgd2luZG93LCByZXR1cm4gb25seSB0aG9zZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIEdldERpbWVuc2lvbnMoZWxlbSwgdGVzdCl7XG4gIGVsZW0gPSBlbGVtLmxlbmd0aCA/IGVsZW1bMF0gOiBlbGVtO1xuXG4gIGlmIChlbGVtID09PSB3aW5kb3cgfHwgZWxlbSA9PT0gZG9jdW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTtcbiAgfVxuXG4gIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHBhclJlY3QgPSBlbGVtLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3aW5SZWN0ID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG4gICAgICB3aW5YID0gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICBvZmZzZXQ6IHtcbiAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5ZLFxuICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luWFxuICAgIH0sXG4gICAgcGFyZW50RGltczoge1xuICAgICAgd2lkdGg6IHBhclJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHBhclJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogcGFyUmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICBsZWZ0OiBwYXJSZWN0LmxlZnQgKyB3aW5YXG4gICAgICB9XG4gICAgfSxcbiAgICB3aW5kb3dEaW1zOiB7XG4gICAgICB3aWR0aDogd2luUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogd2luUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiB3aW5ZLFxuICAgICAgICBsZWZ0OiB3aW5YXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcbiAqIHN1Y2ggYXM6IFRvb2x0aXAsIFJldmVhbCwgYW5kIERyb3Bkb3duXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQgYmVpbmcgcG9zaXRpb25lZC5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBhbmNob3IgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCdzIGFuY2hvciBwb2ludC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiAtIGEgc3RyaW5nIHJlbGF0aW5nIHRvIHRoZSBkZXNpcmVkIHBvc2l0aW9uIG9mIHRoZSBlbGVtZW50LCByZWxhdGl2ZSB0byBpdCdzIGFuY2hvclxuICogQHBhcmFtIHtOdW1iZXJ9IHZPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgdmVydGljYWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBoT2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIGhvcml6b250YWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNPdmVyZmxvdyAtIGlmIGEgY29sbGlzaW9uIGV2ZW50IGlzIGRldGVjdGVkLCBzZXRzIHRvIHRydWUgdG8gZGVmYXVsdCB0aGUgZWxlbWVudCB0byBmdWxsIHdpZHRoIC0gYW55IGRlc2lyZWQgb2Zmc2V0LlxuICogVE9ETyBhbHRlci9yZXdyaXRlIHRvIHdvcmsgd2l0aCBgZW1gIHZhbHVlcyBhcyB3ZWxsL2luc3RlYWQgb2YgcGl4ZWxzXG4gKi9cbmZ1bmN0aW9uIEdldE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCBwb3NpdGlvbiwgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykge1xuICB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgJGFuY2hvckRpbXMgPSBhbmNob3IgPyBHZXREaW1lbnNpb25zKGFuY2hvcikgOiBudWxsO1xuXG4gIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICBjYXNlICd0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciB0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgKCRhbmNob3JEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMiksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBpc092ZXJmbG93ID8gaE9mZnNldCA6ICgoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciBsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgKyAxLFxuICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0ICsgKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAoJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgKCRlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZXZlYWwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLSAkZWxlRGltcy53aWR0aCkgLyAyLFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICBjYXNlICdyZXZlYWwgZnVsbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9XG4gIH1cbn1cblxufShqUXVlcnkpO1xuIiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKiBUaGlzIHV0aWwgd2FzIGNyZWF0ZWQgYnkgTWFyaXVzIE9sYmVydHogKlxuICogUGxlYXNlIHRoYW5rIE1hcml1cyBvbiBHaXRIdWIgL293bGJlcnR6ICpcbiAqIG9yIHRoZSB3ZWIgaHR0cDovL3d3dy5tYXJpdXNvbGJlcnR6LmRlLyAqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBrZXlDb2RlcyA9IHtcbiAgOTogJ1RBQicsXG4gIDEzOiAnRU5URVInLFxuICAyNzogJ0VTQ0FQRScsXG4gIDMyOiAnU1BBQ0UnLFxuICAzNzogJ0FSUk9XX0xFRlQnLFxuICAzODogJ0FSUk9XX1VQJyxcbiAgMzk6ICdBUlJPV19SSUdIVCcsXG4gIDQwOiAnQVJST1dfRE9XTidcbn1cblxudmFyIGNvbW1hbmRzID0ge31cblxudmFyIEtleWJvYXJkID0ge1xuICBrZXlzOiBnZXRLZXlDb2RlcyhrZXlDb2RlcyksXG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgKGtleWJvYXJkKSBldmVudCBhbmQgcmV0dXJucyBhIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgaXRzIGtleVxuICAgKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEByZXR1cm4gU3RyaW5nIGtleSAtIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIGtleSBwcmVzc2VkXG4gICAqL1xuICBwYXJzZUtleShldmVudCkge1xuICAgIHZhciBrZXkgPSBrZXlDb2Rlc1tldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKS50b1VwcGVyQ2FzZSgpO1xuICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gYFNISUZUXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9IGBDVFJMXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gYEFMVF8ke2tleX1gO1xuICAgIHJldHVybiBrZXk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGdpdmVuIChrZXlib2FyZCkgZXZlbnRcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCdzIG5hbWUsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgKiBAcGFyYW0ge09iamVjdHN9IGZ1bmN0aW9ucyAtIGNvbGxlY3Rpb24gb2YgZnVuY3Rpb25zIHRoYXQgYXJlIHRvIGJlIGV4ZWN1dGVkXG4gICAqL1xuICBoYW5kbGVLZXkoZXZlbnQsIGNvbXBvbmVudCwgZnVuY3Rpb25zKSB7XG4gICAgdmFyIGNvbW1hbmRMaXN0ID0gY29tbWFuZHNbY29tcG9uZW50XSxcbiAgICAgIGtleUNvZGUgPSB0aGlzLnBhcnNlS2V5KGV2ZW50KSxcbiAgICAgIGNtZHMsXG4gICAgICBjb21tYW5kLFxuICAgICAgZm47XG5cbiAgICBpZiAoIWNvbW1hbmRMaXN0KSByZXR1cm4gY29uc29sZS53YXJuKCdDb21wb25lbnQgbm90IGRlZmluZWQhJyk7XG5cbiAgICBpZiAodHlwZW9mIGNvbW1hbmRMaXN0Lmx0ciA9PT0gJ3VuZGVmaW5lZCcpIHsgLy8gdGhpcyBjb21wb25lbnQgZG9lcyBub3QgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGx0ciBhbmQgcnRsXG4gICAgICAgIGNtZHMgPSBjb21tYW5kTGlzdDsgLy8gdXNlIHBsYWluIGxpc3RcbiAgICB9IGVsc2UgeyAvLyBtZXJnZSBsdHIgYW5kIHJ0bDogaWYgZG9jdW1lbnQgaXMgcnRsLCBydGwgb3ZlcndyaXRlcyBsdHIgYW5kIHZpY2UgdmVyc2FcbiAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QubHRyLCBjb21tYW5kTGlzdC5ydGwpO1xuXG4gICAgICAgIGVsc2UgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5ydGwsIGNvbW1hbmRMaXN0Lmx0cik7XG4gICAgfVxuICAgIGNvbW1hbmQgPSBjbWRzW2tleUNvZGVdO1xuXG4gICAgZm4gPSBmdW5jdGlvbnNbY29tbWFuZF07XG4gICAgaWYgKGZuICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uICBpZiBleGlzdHNcbiAgICAgIGZuLmFwcGx5KCk7XG4gICAgICBpZiAoZnVuY3Rpb25zLmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy5oYW5kbGVkLmFwcGx5KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMudW5oYW5kbGVkLmFwcGx5KCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHNlYXJjaCB3aXRoaW5cbiAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgKi9cbiAgZmluZEZvY3VzYWJsZSgkZWxlbWVudCkge1xuICAgIHJldHVybiAkZWxlbWVudC5maW5kKCdhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdJykuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkKHRoaXMpLmlzKCc6dmlzaWJsZScpIHx8ICQodGhpcykuYXR0cigndGFiaW5kZXgnKSA8IDApIHsgcmV0dXJuIGZhbHNlOyB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBuYW1lIG5hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50LCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHJldHVybiBTdHJpbmcgY29tcG9uZW50TmFtZVxuICAgKi9cblxuICByZWdpc3Rlcihjb21wb25lbnROYW1lLCBjbWRzKSB7XG4gICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICB9XG59XG5cbi8qXG4gKiBDb25zdGFudHMgZm9yIGVhc2llciBjb21wYXJpbmcuXG4gKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAqL1xuZnVuY3Rpb24gZ2V0S2V5Q29kZXMoa2NzKSB7XG4gIHZhciBrID0ge307XG4gIGZvciAodmFyIGtjIGluIGtjcykga1trY3Nba2NdXSA9IGtjc1trY107XG4gIHJldHVybiBrO1xufVxuXG5Gb3VuZGF0aW9uLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xuY29uc3QgZGVmYXVsdFF1ZXJpZXMgPSB7XG4gICdkZWZhdWx0JyA6ICdvbmx5IHNjcmVlbicsXG4gIGxhbmRzY2FwZSA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgcG9ydHJhaXQgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgcmV0aW5hIDogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbnZhciBNZWRpYVF1ZXJ5ID0ge1xuICBxdWVyaWVzOiBbXSxcblxuICBjdXJyZW50OiAnJyxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZXh0cmFjdGVkU3R5bGVzID0gJCgnLmZvdW5kYXRpb24tbXEnKS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgdmFyIG5hbWVkUXVlcmllcztcblxuICAgIG5hbWVkUXVlcmllcyA9IHBhcnNlU3R5bGVUb09iamVjdChleHRyYWN0ZWRTdHlsZXMpO1xuXG4gICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xuICAgICAgc2VsZi5xdWVyaWVzLnB1c2goe1xuICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgIHZhbHVlOiBgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICR7bmFtZWRRdWVyaWVzW2tleV19KWBcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuY3VycmVudCA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICB0aGlzLl93YXRjaGVyKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgKi9cbiAgYXRMZWFzdChzaXplKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdGhpcy5nZXQoc2l6ZSk7XG5cbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSkubWF0Y2hlcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgZ2V0KHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXIoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYubWVkaWFxdWVyeScsICgpID0+IHtcbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgICAgaWYgKG5ld1NpemUgIT09IHRoaXMuY3VycmVudCkge1xuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgdGhpcy5jdXJyZW50XSk7XG5cbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5ld1NpemU7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbi8vIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy5cbi8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICB2YXIgc3R5bGUgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgIG1hdGNoTWVkaXVtKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gYEBtZWRpYSAke21lZGlhfXsgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9YDtcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfVxufSgpKTtcblxuLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gIGlmICghc3RyKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24ocmV0LCBwYXJhbSkge1xuICAgIHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG4gICAgdmFyIGtleSA9IHBhcnRzWzBdO1xuICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcbiAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblxuICAgIC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG4gICAgLy8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgIHZhbCA9IHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXG4gICAgaWYgKCFyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0W2tleV0gPSB2YWw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuICAgICAgcmV0W2tleV0ucHVzaCh2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSwge30pO1xuXG4gIHJldHVybiBzdHlsZU9iamVjdDtcbn1cblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE1vdGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ubW90aW9uXG4gKi9cblxuY29uc3QgaW5pdENsYXNzZXMgICA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xuY29uc3QgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbmNvbnN0IE1vdGlvbiA9IHtcbiAgYW5pbWF0ZUluOiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfSxcblxuICBhbmltYXRlT3V0OiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZShmYWxzZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW92ZShkdXJhdGlvbiwgZWxlbSwgZm4pe1xuICB2YXIgYW5pbSwgcHJvZywgc3RhcnQgPSBudWxsO1xuICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XG5cbiAgZnVuY3Rpb24gbW92ZSh0cyl7XG4gICAgaWYoIXN0YXJ0KSBzdGFydCA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAvLyBjb25zb2xlLmxvZyhzdGFydCwgdHMpO1xuICAgIHByb2cgPSB0cyAtIHN0YXJ0O1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuXG4gICAgaWYocHJvZyA8IGR1cmF0aW9uKXsgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSwgZWxlbSk7IH1cbiAgICBlbHNle1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW0pO1xuICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgfVxuICB9XG4gIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUpO1xufVxuXG4vKipcbiAqIEFuaW1hdGVzIGFuIGVsZW1lbnQgaW4gb3Igb3V0IHVzaW5nIGEgQ1NTIHRyYW5zaXRpb24gY2xhc3MuXG4gKiBAZnVuY3Rpb25cbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW4gLSBEZWZpbmVzIGlmIHRoZSBhbmltYXRpb24gaXMgaW4gb3Igb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb3IgSFRNTCBvYmplY3QgdG8gYW5pbWF0ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBhbmltYXRpb24gLSBDU1MgY2xhc3MgdG8gdXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBDYWxsYmFjayB0byBydW4gd2hlbiBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gKi9cbmZ1bmN0aW9uIGFuaW1hdGUoaXNJbiwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcblxuICBpZiAoIWVsZW1lbnQubGVuZ3RoKSByZXR1cm47XG5cbiAgdmFyIGluaXRDbGFzcyA9IGlzSW4gPyBpbml0Q2xhc3Nlc1swXSA6IGluaXRDbGFzc2VzWzFdO1xuICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0luID8gYWN0aXZlQ2xhc3Nlc1swXSA6IGFjdGl2ZUNsYXNzZXNbMV07XG5cbiAgLy8gU2V0IHVwIHRoZSBhbmltYXRpb25cbiAgcmVzZXQoKTtcblxuICBlbGVtZW50XG4gICAgLmFkZENsYXNzKGFuaW1hdGlvbilcbiAgICAuY3NzKCd0cmFuc2l0aW9uJywgJ25vbmUnKTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoaW5pdENsYXNzKTtcbiAgICBpZiAoaXNJbikgZWxlbWVudC5zaG93KCk7XG4gIH0pO1xuXG4gIC8vIFN0YXJ0IHRoZSBhbmltYXRpb25cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoO1xuICAgIGVsZW1lbnRcbiAgICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnJylcbiAgICAgIC5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XG4gIH0pO1xuXG4gIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xuICBlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZWxlbWVudCksIGZpbmlzaCk7XG5cbiAgLy8gSGlkZXMgdGhlIGVsZW1lbnQgKGZvciBvdXQgYW5pbWF0aW9ucyksIHJlc2V0cyB0aGUgZWxlbWVudCwgYW5kIHJ1bnMgYSBjYWxsYmFja1xuICBmdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcbiAgICByZXNldCgpO1xuICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XG4gIH1cblxuICAvLyBSZXNldHMgdHJhbnNpdGlvbnMgYW5kIHJlbW92ZXMgbW90aW9uLXNwZWNpZmljIGNsYXNzZXNcbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgZWxlbWVudFswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAwO1xuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoYCR7aW5pdENsYXNzfSAke2FjdGl2ZUNsYXNzfSAke2FuaW1hdGlvbn1gKTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk1vdmUgPSBNb3ZlO1xuRm91bmRhdGlvbi5Nb3Rpb24gPSBNb3Rpb247XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTmVzdCA9IHtcbiAgRmVhdGhlcihtZW51LCB0eXBlID0gJ3pmJykge1xuICAgIG1lbnUuYXR0cigncm9sZScsICdtZW51YmFyJyk7XG5cbiAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykuYXR0cih7J3JvbGUnOiAnbWVudWl0ZW0nfSksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIG1lbnUuZmluZCgnYTpmaXJzdCcpLmF0dHIoJ3RhYmluZGV4JywgMCk7XG5cbiAgICBpdGVtcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG5cbiAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAkaXRlbVxuICAgICAgICAgIC5hZGRDbGFzcyhoYXNTdWJDbGFzcylcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiAkaXRlbS5jaGlsZHJlbignYTpmaXJzdCcpLnRleHQoKVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICRzdWJcbiAgICAgICAgICAuYWRkQ2xhc3MoYHN1Ym1lbnUgJHtzdWJNZW51Q2xhc3N9YClcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiB0cnVlLFxuICAgICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoYGlzLXN1Ym1lbnUtaXRlbSAke3N1Ykl0ZW1DbGFzc31gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybjtcbiAgfSxcblxuICBCdXJuKG1lbnUsIHR5cGUpIHtcbiAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykucmVtb3ZlQXR0cigndGFiaW5kZXgnKSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgbWVudVxuICAgICAgLmZpbmQoJyonKVxuICAgICAgLnJlbW92ZUNsYXNzKGAke3N1Yk1lbnVDbGFzc30gJHtzdWJJdGVtQ2xhc3N9ICR7aGFzU3ViQ2xhc3N9IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51IGlzLWFjdGl2ZWApXG4gICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykuY3NzKCdkaXNwbGF5JywgJycpO1xuXG4gICAgLy8gY29uc29sZS5sb2coICAgICAgbWVudS5maW5kKCcuJyArIHN1Yk1lbnVDbGFzcyArICcsIC4nICsgc3ViSXRlbUNsYXNzICsgJywgLmhhcy1zdWJtZW51LCAuaXMtc3VibWVudS1pdGVtLCAuc3VibWVudSwgW2RhdGEtc3VibWVudV0nKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQ2xhc3Moc3ViTWVudUNsYXNzICsgJyAnICsgc3ViSXRlbUNsYXNzICsgJyBoYXMtc3VibWVudSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKSk7XG4gICAgLy8gaXRlbXMuZWFjaChmdW5jdGlvbigpe1xuICAgIC8vICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAvLyAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG4gICAgLy8gICBpZigkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKXtcbiAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2lzLXN1Ym1lbnUtaXRlbSAnICsgc3ViSXRlbUNsYXNzKTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIGlmKCRzdWIubGVuZ3RoKXtcbiAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2hhcy1zdWJtZW51Jyk7XG4gICAgLy8gICAgICRzdWIucmVtb3ZlQ2xhc3MoJ3N1Ym1lbnUgJyArIHN1Yk1lbnVDbGFzcykucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51Jyk7XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gIH1cbn1cblxuRm91bmRhdGlvbi5OZXN0ID0gTmVzdDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5mdW5jdGlvbiBUaW1lcihlbGVtLCBvcHRpb25zLCBjYikge1xuICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uLC8vb3B0aW9ucyBpcyBhbiBvYmplY3QgZm9yIGVhc2lseSBhZGRpbmcgZmVhdHVyZXMgbGF0ZXIuXG4gICAgICBuYW1lU3BhY2UgPSBPYmplY3Qua2V5cyhlbGVtLmRhdGEoKSlbMF0gfHwgJ3RpbWVyJyxcbiAgICAgIHJlbWFpbiA9IC0xLFxuICAgICAgc3RhcnQsXG4gICAgICB0aW1lcjtcblxuICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG5cbiAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmVtYWluID0gLTE7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgIC8vIGlmKCFlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgcmVtYWluID0gcmVtYWluIDw9IDAgPyBkdXJhdGlvbiA6IHJlbWFpbjtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIGZhbHNlKTtcbiAgICBzdGFydCA9IERhdGUubm93KCk7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBpZihvcHRpb25zLmluZmluaXRlKXtcbiAgICAgICAgX3RoaXMucmVzdGFydCgpOy8vcmVydW4gdGhlIHRpbWVyLlxuICAgICAgfVxuICAgICAgY2IoKTtcbiAgICB9LCByZW1haW4pO1xuICAgIGVsZW0udHJpZ2dlcihgdGltZXJzdGFydC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxuXG4gIHRoaXMucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAvL2lmKGVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIHRydWUpO1xuICAgIHZhciBlbmQgPSBEYXRlLm5vdygpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiAtIChlbmQgLSBzdGFydCk7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnBhdXNlZC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJ1bnMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLlxuICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAqIEBwYXJhbSB7RnVuY30gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gaW1hZ2UgaXMgZnVsbHkgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBvbkltYWdlc0xvYWRlZChpbWFnZXMsIGNhbGxiYWNrKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdW5sb2FkZWQgPSBpbWFnZXMubGVuZ3RoO1xuXG4gIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBpbWFnZXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5jb21wbGV0ZSkge1xuICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIHRoaXMubmF0dXJhbFdpZHRoICE9PSAndW5kZWZpbmVkJyAmJiB0aGlzLm5hdHVyYWxXaWR0aCA+IDApIHtcbiAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2luZ2xlSW1hZ2VMb2FkZWQoKSB7XG4gICAgdW5sb2FkZWQtLTtcbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG59XG5cbkZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcbkZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4gIGZvciAodmFyIGk9MDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGAke3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgIGluIHdpbmRvdykge1xuICAgICAgcmV0dXJuIHdpbmRvd1tgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYF07XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn0oKSk7XG5cbmNvbnN0IHRyaWdnZXJzID0gKGVsLCB0eXBlKSA9PiB7XG4gIGVsLmRhdGEodHlwZSkuc3BsaXQoJyAnKS5mb3JFYWNoKGlkID0+IHtcbiAgICAkKGAjJHtpZH1gKVsgdHlwZSA9PT0gJ2Nsb3NlJyA/ICd0cmlnZ2VyJyA6ICd0cmlnZ2VySGFuZGxlciddKGAke3R5cGV9LnpmLnRyaWdnZXJgLCBbZWxdKTtcbiAgfSk7XG59O1xuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1vcGVuXSB3aWxsIHJldmVhbCBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLW9wZW5dJywgZnVuY3Rpb24oKSB7XG4gIHRyaWdnZXJzKCQodGhpcyksICdvcGVuJyk7XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zZV0gd2lsbCBjbG9zZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbi8vIElmIHVzZWQgd2l0aG91dCBhIHZhbHVlIG9uIFtkYXRhLWNsb3NlXSwgdGhlIGV2ZW50IHdpbGwgYnViYmxlLCBhbGxvd2luZyBpdCB0byBjbG9zZSBhIHBhcmVudCBjb21wb25lbnQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1jbG9zZV0nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCdjbG9zZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAnY2xvc2UnKTtcbiAgfVxuICBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlLnpmLnRyaWdnZXInKTtcbiAgfVxufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtdG9nZ2xlXSB3aWxsIHRvZ2dsZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZV0nLCBmdW5jdGlvbigpIHtcbiAgdHJpZ2dlcnMoJCh0aGlzKSwgJ3RvZ2dsZScpO1xufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2FibGVdIHdpbGwgcmVzcG9uZCB0byBjbG9zZS56Zi50cmlnZ2VyIGV2ZW50cy5cbiQoZG9jdW1lbnQpLm9uKCdjbG9zZS56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NhYmxlXScsIGZ1bmN0aW9uKGUpe1xuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBsZXQgYW5pbWF0aW9uID0gJCh0aGlzKS5kYXRhKCdjbG9zYWJsZScpO1xuXG4gIGlmKGFuaW1hdGlvbiAhPT0gJycpe1xuICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQoJCh0aGlzKSwgYW5pbWF0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gICAgfSk7XG4gIH1lbHNle1xuICAgICQodGhpcykuZmFkZU91dCgpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICB9XG59KTtcblxuJChkb2N1bWVudCkub24oJ2ZvY3VzLnpmLnRyaWdnZXIgYmx1ci56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZS1mb2N1c10nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCd0b2dnbGUtZm9jdXMnKTtcbiAgJChgIyR7aWR9YCkudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJywgWyQodGhpcyldKTtcbn0pO1xuXG4vKipcbiogRmlyZXMgb25jZSBhZnRlciBhbGwgb3RoZXIgc2NyaXB0cyBoYXZlIGxvYWRlZFxuKiBAZnVuY3Rpb25cbiogQHByaXZhdGVcbiovXG4kKHdpbmRvdykubG9hZCgoKSA9PiB7XG4gIGNoZWNrTGlzdGVuZXJzKCk7XG59KTtcblxuZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcnMoKSB7XG4gIGV2ZW50c0xpc3RlbmVyKCk7XG4gIHJlc2l6ZUxpc3RlbmVyKCk7XG4gIHNjcm9sbExpc3RlbmVyKCk7XG4gIGNsb3NlbWVMaXN0ZW5lcigpO1xufVxuXG4vLyoqKioqKioqIG9ubHkgZmlyZXMgdGhpcyBmdW5jdGlvbiBvbmNlIG9uIGxvYWQsIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHRvIHdhdGNoICoqKioqKioqXG5mdW5jdGlvbiBjbG9zZW1lTGlzdGVuZXIocGx1Z2luTmFtZSkge1xuICB2YXIgeWV0aUJveGVzID0gJCgnW2RhdGEteWV0aS1ib3hdJyksXG4gICAgICBwbHVnTmFtZXMgPSBbJ2Ryb3Bkb3duJywgJ3Rvb2x0aXAnLCAncmV2ZWFsJ107XG5cbiAgaWYocGx1Z2luTmFtZSl7XG4gICAgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5wdXNoKHBsdWdpbk5hbWUpO1xuICAgIH1lbHNlIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcGx1Z2luTmFtZVswXSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLmNvbmNhdChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1BsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gIH1cbiAgaWYoeWV0aUJveGVzLmxlbmd0aCl7XG4gICAgbGV0IGxpc3RlbmVycyA9IHBsdWdOYW1lcy5tYXAoKG5hbWUpID0+IHtcbiAgICAgIHJldHVybiBgY2xvc2VtZS56Zi4ke25hbWV9YDtcbiAgICB9KS5qb2luKCcgJyk7XG5cbiAgICAkKHdpbmRvdykub2ZmKGxpc3RlbmVycykub24obGlzdGVuZXJzLCBmdW5jdGlvbihlLCBwbHVnaW5JZCl7XG4gICAgICBsZXQgcGx1Z2luID0gZS5uYW1lc3BhY2Uuc3BsaXQoJy4nKVswXTtcbiAgICAgIGxldCBwbHVnaW5zID0gJChgW2RhdGEtJHtwbHVnaW59XWApLm5vdChgW2RhdGEteWV0aS1ib3g9XCIke3BsdWdpbklkfVwiXWApO1xuXG4gICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IF90aGlzID0gJCh0aGlzKTtcblxuICAgICAgICBfdGhpcy50cmlnZ2VySGFuZGxlcignY2xvc2UuemYudHJpZ2dlcicsIFtfdGhpc10pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzaXplTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1yZXNpemVdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Jlc2l6ZS56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRpbWVyKSB7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSByZXNpemUgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJyZXNpemVcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCByZXNpemUgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzY3JvbGxMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXNjcm9sbF0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsLnpmLnRyaWdnZXInKVxuICAgIC5vbignc2Nyb2xsLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmKHRpbWVyKXsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHNjcm9sbCBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInNjcm9sbFwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHNjcm9sbCBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50c0xpc3RlbmVyKCkge1xuICBpZighTXV0YXRpb25PYnNlcnZlcil7IHJldHVybiBmYWxzZTsgfVxuICBsZXQgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yZXNpemVdLCBbZGF0YS1zY3JvbGxdLCBbZGF0YS1tdXRhdGVdJyk7XG5cbiAgLy9lbGVtZW50IGNhbGxiYWNrXG4gIHZhciBsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uID0gZnVuY3Rpb24obXV0YXRpb25SZWNvcmRzTGlzdCkge1xuICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG4gICAgLy90cmlnZ2VyIHRoZSBldmVudCBoYW5kbGVyIGZvciB0aGUgZWxlbWVudCBkZXBlbmRpbmcgb24gdHlwZVxuICAgIHN3aXRjaCAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikpIHtcblxuICAgICAgY2FzZSBcInJlc2l6ZVwiIDpcbiAgICAgICR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldF0pO1xuICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgXCJzY3JvbGxcIiA6XG4gICAgICAkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQsIHdpbmRvdy5wYWdlWU9mZnNldF0pO1xuICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIGNhc2UgXCJtdXRhdGVcIiA6XG4gICAgICAvLyBjb25zb2xlLmxvZygnbXV0YXRlJywgJHRhcmdldCk7XG4gICAgICAvLyAkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdtdXRhdGUuemYudHJpZ2dlcicpO1xuICAgICAgLy9cbiAgICAgIC8vIC8vbWFrZSBzdXJlIHdlIGRvbid0IGdldCBzdHVjayBpbiBhbiBpbmZpbml0ZSBsb29wIGZyb20gc2xvcHB5IGNvZGVpbmdcbiAgICAgIC8vIGlmICgkdGFyZ2V0LmluZGV4KCdbZGF0YS1tdXRhdGVdJykgPT0gJChcIltkYXRhLW11dGF0ZV1cIikubGVuZ3RoLTEpIHtcbiAgICAgIC8vICAgZG9tTXV0YXRpb25PYnNlcnZlcigpO1xuICAgICAgLy8gfVxuICAgICAgLy8gYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQgOlxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgLy9ub3RoaW5nXG4gICAgfVxuICB9XG5cbiAgaWYobm9kZXMubGVuZ3RoKXtcbiAgICAvL2ZvciBlYWNoIGVsZW1lbnQgdGhhdCBuZWVkcyB0byBsaXN0ZW4gZm9yIHJlc2l6aW5nLCBzY3JvbGxpbmcsIChvciBjb21pbmcgc29vbiBtdXRhdGlvbikgYWRkIGEgc2luZ2xlIG9ic2VydmVyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gbm9kZXMubGVuZ3RoLTE7IGkrKykge1xuICAgICAgbGV0IGVsZW1lbnRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24pO1xuICAgICAgZWxlbWVudE9ic2VydmVyLm9ic2VydmUobm9kZXNbaV0sIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiBmYWxzZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6ZmFsc2UsIGF0dHJpYnV0ZUZpbHRlcjpbXCJkYXRhLWV2ZW50c1wiXX0pO1xuICAgIH1cbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLy8gW1BIXVxuLy8gRm91bmRhdGlvbi5DaGVja1dhdGNoZXJzID0gY2hlY2tXYXRjaGVycztcbkZvdW5kYXRpb24uSUhlYXJZb3UgPSBjaGVja0xpc3RlbmVycztcbi8vIEZvdW5kYXRpb24uSVNlZVlvdSA9IHNjcm9sbExpc3RlbmVyO1xuLy8gRm91bmRhdGlvbi5JRmVlbFlvdSA9IGNsb3NlbWVMaXN0ZW5lcjtcblxufShqUXVlcnkpO1xuXG4vLyBmdW5jdGlvbiBkb21NdXRhdGlvbk9ic2VydmVyKGRlYm91bmNlKSB7XG4vLyAgIC8vICEhISBUaGlzIGlzIGNvbWluZyBzb29uIGFuZCBuZWVkcyBtb3JlIHdvcms7IG5vdCBhY3RpdmUgICEhISAvL1xuLy8gICB2YXIgdGltZXIsXG4vLyAgIG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtbXV0YXRlXScpO1xuLy8gICAvL1xuLy8gICBpZiAobm9kZXMubGVuZ3RoKSB7XG4vLyAgICAgLy8gdmFyIE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuLy8gICAgIC8vICAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4vLyAgICAgLy8gICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuLy8gICAgIC8vICAgICBpZiAocHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlcicgaW4gd2luZG93KSB7XG4vLyAgICAgLy8gICAgICAgcmV0dXJuIHdpbmRvd1twcmVmaXhlc1tpXSArICdNdXRhdGlvbk9ic2VydmVyJ107XG4vLyAgICAgLy8gICAgIH1cbi8vICAgICAvLyAgIH1cbi8vICAgICAvLyAgIHJldHVybiBmYWxzZTtcbi8vICAgICAvLyB9KCkpO1xuLy9cbi8vXG4vLyAgICAgLy9mb3IgdGhlIGJvZHksIHdlIG5lZWQgdG8gbGlzdGVuIGZvciBhbGwgY2hhbmdlcyBlZmZlY3RpbmcgdGhlIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzXG4vLyAgICAgdmFyIGJvZHlPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGJvZHlNdXRhdGlvbik7XG4vLyAgICAgYm9keU9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQuYm9keSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOnRydWUsIGF0dHJpYnV0ZUZpbHRlcjpbXCJzdHlsZVwiLCBcImNsYXNzXCJdfSk7XG4vL1xuLy9cbi8vICAgICAvL2JvZHkgY2FsbGJhY2tcbi8vICAgICBmdW5jdGlvbiBib2R5TXV0YXRpb24obXV0YXRlKSB7XG4vLyAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgbXV0YXRpb24gZXZlbnRcbi8vICAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG4vL1xuLy8gICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuLy8gICAgICAgICBib2R5T2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuLy8gICAgICAgICAkKCdbZGF0YS1tdXRhdGVdJykuYXR0cignZGF0YS1ldmVudHMnLFwibXV0YXRlXCIpO1xuLy8gICAgICAgfSwgZGVib3VuY2UgfHwgMTUwKTtcbi8vICAgICB9XG4vLyAgIH1cbi8vIH1cbiIsIihmdW5jdGlvbigpe3ZhciBhO2E9alF1ZXJ5LGEuZm4uZXh0ZW5kKHtlbWFpbFByb3RlY3RvcjpmdW5jdGlvbihiKXt2YXIgYztyZXR1cm4gYz17XCJwcmVzZXJ2ZS10ZXh0XCI6ITF9LGM9YS5leHRlbmQoYyxiKSx0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgYixkLGUsZixnO3JldHVybiBiPWEodGhpcyksZD1iLmF0dHIoXCJkYXRhLWVtYWlsLXByb3RlY3RvclwiKS5zcGxpdChcInxcIiksZT1iLmF0dHIoXCJkYXRhLWVtYWlsLXByb3RlY3Rvci1wcmVzZXJ2ZS10ZXh0XCIpP1wiZmFsc2VcIiE9PWIuYXR0cihcImRhdGEtZW1haWwtcHJvdGVjdG9yLXByZXNlcnZlLXRleHRcIik6Y1tcInByZXNlcnZlLXRleHRcIl0sMj09PWQubGVuZ3RoPygoZz1kWzFdLm1hdGNoKC8oXFw/LispLykpJiYoZj1nWzFdLGRbMV09ZFsxXS5zdWJzdHJpbmcoMCxkWzFdLmluZGV4T2YoXCI/XCIpKSksZXx8Yi50ZXh0KGRbMF0rXCJAXCIrZFsxXSksYi5hdHRyKFwiaHJlZlwiLFwibWFpbHRvOlwiK2RbMF0rXCJAXCIrZFsxXSsobnVsbCE9Zj9mOlwiXCIpKSk6Yi50ZXh0KCdJbnZhbGlkIGZvcm1hdC4gZWcuIDxhIGRhdGEtZW1haWwtcHJvdGVjdG9yPVwiZm9vfGJhci5jb21cIj48L2E+IHdpbGwgYmVjb21lIDxhIGhyZWY9XCJtYWlsdG86Zm9vQGJhci5jb21cIj48L2E+LicpfSl9fSl9KS5jYWxsKHRoaXMpOyIsIi8vIGpRdWVyeSBSb3lhbFNsaWRlciBwbHVnaW4uIEN1c3RvbSBidWlsZC4gQ29weXJpZ2h0IDIwMTEtMjAxNSBEbWl0cnkgU2VtZW5vdiBodHRwOi8vZGltc2VtZW5vdi5jb20gXG4vLyBodHRwOi8vZGltc2VtZW5vdi5jb20vcHJpdmF0ZS9ob21lLnBocD9idWlsZD1idWxsZXRzX2F1dG9wbGF5X2F1dG8taGVpZ2h0X2FjdGl2ZS1jbGFzc192aXNpYmxlLW5lYXJieSBcbi8vIGpxdWVyeS5yb3lhbHNsaWRlciB2OS41LjdcbihmdW5jdGlvbihuKXtmdW5jdGlvbiB2KGIsZil7dmFyIGMsYT10aGlzLGU9d2luZG93Lm5hdmlnYXRvcixnPWUudXNlckFnZW50LnRvTG93ZXJDYXNlKCk7YS51aWQ9bi5yc01vZHVsZXMudWlkKys7YS5ucz1cIi5yc1wiK2EudWlkO3ZhciBkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikuc3R5bGUsaD1bXCJ3ZWJraXRcIixcIk1velwiLFwibXNcIixcIk9cIl0saz1cIlwiLGw9MCxxO2ZvcihjPTA7YzxoLmxlbmd0aDtjKyspcT1oW2NdLCFrJiZxK1wiVHJhbnNmb3JtXCJpbiBkJiYoaz1xKSxxPXEudG9Mb3dlckNhc2UoKSx3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lfHwod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZT13aW5kb3dbcStcIlJlcXVlc3RBbmltYXRpb25GcmFtZVwiXSx3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWU9d2luZG93W3ErXCJDYW5jZWxBbmltYXRpb25GcmFtZVwiXXx8d2luZG93W3ErXCJDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIl0pO3dpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fFxuKHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU9ZnVuY3Rpb24oYSxiKXt2YXIgYz0obmV3IERhdGUpLmdldFRpbWUoKSxkPU1hdGgubWF4KDAsMTYtKGMtbCkpLGU9d2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKXthKGMrZCl9LGQpO2w9YytkO3JldHVybiBlfSk7d2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lfHwod2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lPWZ1bmN0aW9uKGEpe2NsZWFyVGltZW91dChhKX0pO2EuaXNJUEFEPWcubWF0Y2goLyhpcGFkKS8pO2EuaXNJT1M9YS5pc0lQQUR8fGcubWF0Y2goLyhpcGhvbmV8aXBvZCkvKTtjPWZ1bmN0aW9uKGEpe2E9LyhjaHJvbWUpWyBcXC9dKFtcXHcuXSspLy5leGVjKGEpfHwvKHdlYmtpdClbIFxcL10oW1xcdy5dKykvLmV4ZWMoYSl8fC8ob3BlcmEpKD86Lip2ZXJzaW9ufClbIFxcL10oW1xcdy5dKykvLmV4ZWMoYSl8fC8obXNpZSkgKFtcXHcuXSspLy5leGVjKGEpfHwwPmEuaW5kZXhPZihcImNvbXBhdGlibGVcIikmJi8obW96aWxsYSkoPzouKj8gcnY6KFtcXHcuXSspfCkvLmV4ZWMoYSl8fFxuW107cmV0dXJue2Jyb3dzZXI6YVsxXXx8XCJcIix2ZXJzaW9uOmFbMl18fFwiMFwifX0oZyk7aD17fTtjLmJyb3dzZXImJihoW2MuYnJvd3Nlcl09ITAsaC52ZXJzaW9uPWMudmVyc2lvbik7aC5jaHJvbWUmJihoLndlYmtpdD0hMCk7YS5fYT1oO2EuaXNBbmRyb2lkPS0xPGcuaW5kZXhPZihcImFuZHJvaWRcIik7YS5zbGlkZXI9bihiKTthLmV2PW4oYSk7YS5fYj1uKGRvY3VtZW50KTthLnN0PW4uZXh0ZW5kKHt9LG4uZm4ucm95YWxTbGlkZXIuZGVmYXVsdHMsZik7YS5fYz1hLnN0LnRyYW5zaXRpb25TcGVlZDthLl9kPTA7IWEuc3QuYWxsb3dDU1MzfHxoLndlYmtpdCYmIWEuc3QuYWxsb3dDU1MzT25XZWJraXR8fChjPWsrKGs/XCJUXCI6XCJ0XCIpLGEuX2U9YytcInJhbnNmb3JtXCJpbiBkJiZjK1wicmFuc2l0aW9uXCJpbiBkLGEuX2UmJihhLl9mPWsrKGs/XCJQXCI6XCJwXCIpK1wiZXJzcGVjdGl2ZVwiaW4gZCkpO2s9ay50b0xvd2VyQ2FzZSgpO2EuX2c9XCItXCIraytcIi1cIjthLl9oPVwidmVydGljYWxcIj09PWEuc3Quc2xpZGVzT3JpZW50YXRpb24/XG4hMTohMDthLl9pPWEuX2g/XCJsZWZ0XCI6XCJ0b3BcIjthLl9qPWEuX2g/XCJ3aWR0aFwiOlwiaGVpZ2h0XCI7YS5faz0tMTthLl9sPVwiZmFkZVwiPT09YS5zdC50cmFuc2l0aW9uVHlwZT8hMTohMDthLl9sfHwoYS5zdC5zbGlkZXJEcmFnPSExLGEuX209MTApO2EuX249XCJ6LWluZGV4OjA7IGRpc3BsYXk6bm9uZTsgb3BhY2l0eTowO1wiO2EuX289MDthLl9wPTA7YS5fcT0wO24uZWFjaChuLnJzTW9kdWxlcyxmdW5jdGlvbihiLGMpe1widWlkXCIhPT1iJiZjLmNhbGwoYSl9KTthLnNsaWRlcz1bXTthLl9yPTA7KGEuc3Quc2xpZGVzP24oYS5zdC5zbGlkZXMpOmEuc2xpZGVyLmNoaWxkcmVuKCkuZGV0YWNoKCkpLmVhY2goZnVuY3Rpb24oKXthLl9zKHRoaXMsITApfSk7YS5zdC5yYW5kb21pemVTbGlkZXMmJmEuc2xpZGVzLnNvcnQoZnVuY3Rpb24oKXtyZXR1cm4uNS1NYXRoLnJhbmRvbSgpfSk7YS5udW1TbGlkZXM9YS5zbGlkZXMubGVuZ3RoO2EuX3QoKTthLnN0LnN0YXJ0U2xpZGVJZD9hLnN0LnN0YXJ0U2xpZGVJZD5cbmEubnVtU2xpZGVzLTEmJihhLnN0LnN0YXJ0U2xpZGVJZD1hLm51bVNsaWRlcy0xKTphLnN0LnN0YXJ0U2xpZGVJZD0wO2EuX289YS5zdGF0aWNTbGlkZUlkPWEuY3VyclNsaWRlSWQ9YS5fdT1hLnN0LnN0YXJ0U2xpZGVJZDthLmN1cnJTbGlkZT1hLnNsaWRlc1thLmN1cnJTbGlkZUlkXTthLl92PTA7YS5wb2ludGVyTXVsdGl0b3VjaD0hMTthLnNsaWRlci5hZGRDbGFzcygoYS5faD9cInJzSG9yXCI6XCJyc1ZlclwiKSsoYS5fbD9cIlwiOlwiIHJzRmFkZVwiKSk7ZD0nPGRpdiBjbGFzcz1cInJzT3ZlcmZsb3dcIj48ZGl2IGNsYXNzPVwicnNDb250YWluZXJcIj4nO2Euc2xpZGVzU3BhY2luZz1hLnN0LnNsaWRlc1NwYWNpbmc7YS5fdz0oYS5faD9hLnNsaWRlci53aWR0aCgpOmEuc2xpZGVyLmhlaWdodCgpKSthLnN0LnNsaWRlc1NwYWNpbmc7YS5feD1Cb29sZWFuKDA8YS5feSk7MT49YS5udW1TbGlkZXMmJihhLl96PSExKTthLl9hMT1hLl96JiZhLl9sPzI9PT1hLm51bVNsaWRlcz8xOjI6MDthLl9iMT1cbjY+YS5udW1TbGlkZXM/YS5udW1TbGlkZXM6NjthLl9jMT0wO2EuX2QxPTA7YS5zbGlkZXNKUT1bXTtmb3IoYz0wO2M8YS5udW1TbGlkZXM7YysrKWEuc2xpZGVzSlEucHVzaChuKCc8ZGl2IHN0eWxlPVwiJysoYS5fbD9cIlwiOmMhPT1hLmN1cnJTbGlkZUlkP2EuX246XCJ6LWluZGV4OjA7XCIpKydcIiBjbGFzcz1cInJzU2xpZGUgXCI+PC9kaXY+JykpO2EuX2UxPWQ9bihkK1wiPC9kaXY+PC9kaXY+XCIpO3ZhciBtPWEubnMsaz1mdW5jdGlvbihiLGMsZCxlLGYpe2EuX2oxPWIrYyttO2EuX2sxPWIrZCttO2EuX2wxPWIrZSttO2YmJihhLl9tMT1iK2YrbSl9O2M9ZS5wb2ludGVyRW5hYmxlZDthLnBvaW50ZXJFbmFibGVkPWN8fGUubXNQb2ludGVyRW5hYmxlZDthLnBvaW50ZXJFbmFibGVkPyhhLmhhc1RvdWNoPSExLGEuX24xPS4yLGEucG9pbnRlck11bHRpdG91Y2g9Qm9vbGVhbigxPGVbKGM/XCJtXCI6XCJtc01cIikrXCJheFRvdWNoUG9pbnRzXCJdKSxjP2soXCJwb2ludGVyXCIsXCJkb3duXCIsXCJtb3ZlXCIsXCJ1cFwiLFxuXCJjYW5jZWxcIik6ayhcIk1TUG9pbnRlclwiLFwiRG93blwiLFwiTW92ZVwiLFwiVXBcIixcIkNhbmNlbFwiKSk6KGEuaXNJT1M/YS5fajE9YS5fazE9YS5fbDE9YS5fbTE9XCJcIjprKFwibW91c2VcIixcImRvd25cIixcIm1vdmVcIixcInVwXCIpLFwib250b3VjaHN0YXJ0XCJpbiB3aW5kb3d8fFwiY3JlYXRlVG91Y2hcImluIGRvY3VtZW50PyhhLmhhc1RvdWNoPSEwLGEuX2oxKz1cIiB0b3VjaHN0YXJ0XCIrbSxhLl9rMSs9XCIgdG91Y2htb3ZlXCIrbSxhLl9sMSs9XCIgdG91Y2hlbmRcIittLGEuX20xKz1cIiB0b3VjaGNhbmNlbFwiK20sYS5fbjE9LjUsYS5zdC5zbGlkZXJUb3VjaCYmKGEuX2YxPSEwKSk6KGEuaGFzVG91Y2g9ITEsYS5fbjE9LjIpKTthLnN0LnNsaWRlckRyYWcmJihhLl9mMT0hMCxoLm1zaWV8fGgub3BlcmE/YS5fZzE9YS5faDE9XCJtb3ZlXCI6aC5tb3ppbGxhPyhhLl9nMT1cIi1tb3otZ3JhYlwiLGEuX2gxPVwiLW1vei1ncmFiYmluZ1wiKTpoLndlYmtpdCYmLTEhPWUucGxhdGZvcm0uaW5kZXhPZihcIk1hY1wiKSYmKGEuX2cxPVxuXCItd2Via2l0LWdyYWJcIixhLl9oMT1cIi13ZWJraXQtZ3JhYmJpbmdcIiksYS5faTEoKSk7YS5zbGlkZXIuaHRtbChkKTthLl9vMT1hLnN0LmNvbnRyb2xzSW5zaWRlP2EuX2UxOmEuc2xpZGVyO2EuX3AxPWEuX2UxLmNoaWxkcmVuKFwiLnJzQ29udGFpbmVyXCIpO2EucG9pbnRlckVuYWJsZWQmJmEuX3AxLmNzcygoYz9cIlwiOlwiLW1zLVwiKStcInRvdWNoLWFjdGlvblwiLGEuX2g/XCJwYW4teVwiOlwicGFuLXhcIik7YS5fcTE9bignPGRpdiBjbGFzcz1cInJzUHJlbG9hZGVyXCI+PC9kaXY+Jyk7ZT1hLl9wMS5jaGlsZHJlbihcIi5yc1NsaWRlXCIpO2EuX3IxPWEuc2xpZGVzSlFbYS5jdXJyU2xpZGVJZF07YS5fczE9MDthLl9lPyhhLl90MT1cInRyYW5zaXRpb24tcHJvcGVydHlcIixhLl91MT1cInRyYW5zaXRpb24tZHVyYXRpb25cIixhLl92MT1cInRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uXCIsYS5fdzE9YS5feDE9YS5fZytcInRyYW5zZm9ybVwiLGEuX2Y/KGgud2Via2l0JiYhaC5jaHJvbWUmJmEuc2xpZGVyLmFkZENsYXNzKFwicnNXZWJraXQzZFwiKSxcbmEuX3kxPVwidHJhbnNsYXRlM2QoXCIsYS5fejE9XCJweCwgXCIsYS5fYTI9XCJweCwgMHB4KVwiKTooYS5feTE9XCJ0cmFuc2xhdGUoXCIsYS5fejE9XCJweCwgXCIsYS5fYTI9XCJweClcIiksYS5fbD9hLl9wMVthLl9nK2EuX3QxXT1hLl9nK1widHJhbnNmb3JtXCI6KGg9e30saFthLl9nK2EuX3QxXT1cIm9wYWNpdHlcIixoW2EuX2crYS5fdTFdPWEuc3QudHJhbnNpdGlvblNwZWVkK1wibXNcIixoW2EuX2crYS5fdjFdPWEuc3QuY3NzM2Vhc2VJbk91dCxlLmNzcyhoKSkpOihhLl94MT1cImxlZnRcIixhLl93MT1cInRvcFwiKTt2YXIgcDtuKHdpbmRvdykub24oXCJyZXNpemVcIithLm5zLGZ1bmN0aW9uKCl7cCYmY2xlYXJUaW1lb3V0KHApO3A9c2V0VGltZW91dChmdW5jdGlvbigpe2EudXBkYXRlU2xpZGVyU2l6ZSgpfSw1MCl9KTthLmV2LnRyaWdnZXIoXCJyc0FmdGVyUHJvcHNTZXR1cFwiKTthLnVwZGF0ZVNsaWRlclNpemUoKTthLnN0LmtleWJvYXJkTmF2RW5hYmxlZCYmYS5fYjIoKTthLnN0LmFycm93c05hdkhpZGVPblRvdWNoJiZcbihhLmhhc1RvdWNofHxhLnBvaW50ZXJNdWx0aXRvdWNoKSYmKGEuc3QuYXJyb3dzTmF2PSExKTthLnN0LmFycm93c05hdiYmKGU9YS5fbzEsbignPGRpdiBjbGFzcz1cInJzQXJyb3cgcnNBcnJvd0xlZnRcIj48ZGl2IGNsYXNzPVwicnNBcnJvd0ljblwiPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJyc0Fycm93IHJzQXJyb3dSaWdodFwiPjxkaXYgY2xhc3M9XCJyc0Fycm93SWNuXCI+PC9kaXY+PC9kaXY+JykuYXBwZW5kVG8oZSksYS5fYzI9ZS5jaGlsZHJlbihcIi5yc0Fycm93TGVmdFwiKS5jbGljayhmdW5jdGlvbihiKXtiLnByZXZlbnREZWZhdWx0KCk7YS5wcmV2KCl9KSxhLl9kMj1lLmNoaWxkcmVuKFwiLnJzQXJyb3dSaWdodFwiKS5jbGljayhmdW5jdGlvbihiKXtiLnByZXZlbnREZWZhdWx0KCk7YS5uZXh0KCl9KSxhLnN0LmFycm93c05hdkF1dG9IaWRlJiYhYS5oYXNUb3VjaCYmKGEuX2MyLmFkZENsYXNzKFwicnNIaWRkZW5cIiksYS5fZDIuYWRkQ2xhc3MoXCJyc0hpZGRlblwiKSxlLm9uZShcIm1vdXNlbW92ZS5hcnJvd3Nob3ZlclwiLFxuZnVuY3Rpb24oKXthLl9jMi5yZW1vdmVDbGFzcyhcInJzSGlkZGVuXCIpO2EuX2QyLnJlbW92ZUNsYXNzKFwicnNIaWRkZW5cIil9KSxlLmhvdmVyKGZ1bmN0aW9uKCl7YS5fZTJ8fChhLl9jMi5yZW1vdmVDbGFzcyhcInJzSGlkZGVuXCIpLGEuX2QyLnJlbW92ZUNsYXNzKFwicnNIaWRkZW5cIikpfSxmdW5jdGlvbigpe2EuX2UyfHwoYS5fYzIuYWRkQ2xhc3MoXCJyc0hpZGRlblwiKSxhLl9kMi5hZGRDbGFzcyhcInJzSGlkZGVuXCIpKX0pKSxhLmV2Lm9uKFwicnNPblVwZGF0ZU5hdlwiLGZ1bmN0aW9uKCl7YS5fZjIoKX0pLGEuX2YyKCkpO2lmKGEuaGFzVG91Y2gmJmEuc3Quc2xpZGVyVG91Y2h8fCFhLmhhc1RvdWNoJiZhLnN0LnNsaWRlckRyYWcpYS5fcDEub24oYS5fajEsZnVuY3Rpb24oYil7YS5fZzIoYil9KTtlbHNlIGEuZHJhZ1N1Y2Nlc3M9ITE7dmFyIHI9W1wicnNQbGF5QnRuSWNvblwiLFwicnNQbGF5QnRuXCIsXCJyc0Nsb3NlVmlkZW9CdG5cIixcInJzQ2xvc2VWaWRlb0ljblwiXTthLl9wMS5jbGljayhmdW5jdGlvbihiKXtpZighYS5kcmFnU3VjY2Vzcyl7dmFyIGM9XG5uKGIudGFyZ2V0KS5hdHRyKFwiY2xhc3NcIik7aWYoLTEhPT1uLmluQXJyYXkoYyxyKSYmYS50b2dnbGVWaWRlbygpKXJldHVybiExO2lmKGEuc3QubmF2aWdhdGVCeUNsaWNrJiYhYS5faDIpe2lmKG4oYi50YXJnZXQpLmNsb3Nlc3QoXCIucnNOb0RyYWdcIixhLl9yMSkubGVuZ3RoKXJldHVybiEwO2EuX2kyKGIpfWEuZXYudHJpZ2dlcihcInJzU2xpZGVDbGlja1wiLGIpfX0pLm9uKFwiY2xpY2sucnNcIixcImFcIixmdW5jdGlvbihiKXtpZihhLmRyYWdTdWNjZXNzKXJldHVybiExO2EuX2gyPSEwO3NldFRpbWVvdXQoZnVuY3Rpb24oKXthLl9oMj0hMX0sMyl9KTthLmV2LnRyaWdnZXIoXCJyc0FmdGVySW5pdFwiKX1uLnJzTW9kdWxlc3x8KG4ucnNNb2R1bGVzPXt1aWQ6MH0pO3YucHJvdG90eXBlPXtjb25zdHJ1Y3Rvcjp2LF9pMjpmdW5jdGlvbihiKXtiPWJbdGhpcy5faD9cInBhZ2VYXCI6XCJwYWdlWVwiXS10aGlzLl9qMjtiPj10aGlzLl9xP3RoaXMubmV4dCgpOjA+YiYmdGhpcy5wcmV2KCl9LF90OmZ1bmN0aW9uKCl7dmFyIGI7XG5iPXRoaXMuc3QubnVtSW1hZ2VzVG9QcmVsb2FkO2lmKHRoaXMuX3o9dGhpcy5zdC5sb29wKTI9PT10aGlzLm51bVNsaWRlcz8odGhpcy5fej0hMSx0aGlzLnN0Lmxvb3BSZXdpbmQ9ITApOjI+dGhpcy5udW1TbGlkZXMmJih0aGlzLnN0Lmxvb3BSZXdpbmQ9dGhpcy5fej0hMSk7dGhpcy5feiYmMDxiJiYoND49dGhpcy5udW1TbGlkZXM/Yj0xOnRoaXMuc3QubnVtSW1hZ2VzVG9QcmVsb2FkPih0aGlzLm51bVNsaWRlcy0xKS8yJiYoYj1NYXRoLmZsb29yKCh0aGlzLm51bVNsaWRlcy0xKS8yKSkpO3RoaXMuX3k9Yn0sX3M6ZnVuY3Rpb24oYixmKXtmdW5jdGlvbiBjKGIsYyl7Yz9nLmltYWdlcy5wdXNoKGIuYXR0cihjKSk6Zy5pbWFnZXMucHVzaChiLnRleHQoKSk7aWYoaCl7aD0hMTtnLmNhcHRpb249XCJzcmNcIj09PWM/Yi5hdHRyKFwiYWx0XCIpOmIuY29udGVudHMoKTtnLmltYWdlPWcuaW1hZ2VzWzBdO2cudmlkZW9VUkw9Yi5hdHRyKFwiZGF0YS1yc1ZpZGVvXCIpO3ZhciBkPWIuYXR0cihcImRhdGEtcnN3XCIpLFxuZT1iLmF0dHIoXCJkYXRhLXJzaFwiKTtcInVuZGVmaW5lZFwiIT09dHlwZW9mIGQmJiExIT09ZCYmXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBlJiYhMSE9PWU/KGcuaVc9cGFyc2VJbnQoZCwxMCksZy5pSD1wYXJzZUludChlLDEwKSk6YS5zdC5pbWdXaWR0aCYmYS5zdC5pbWdIZWlnaHQmJihnLmlXPWEuc3QuaW1nV2lkdGgsZy5pSD1hLnN0LmltZ0hlaWdodCl9fXZhciBhPXRoaXMsZSxnPXt9LGQsaD0hMDtiPW4oYik7YS5fazI9YjthLmV2LnRyaWdnZXIoXCJyc0JlZm9yZVBhcnNlTm9kZVwiLFtiLGddKTtpZighZy5zdG9wUGFyc2luZylyZXR1cm4gYj1hLl9rMixnLmlkPWEuX3IsZy5jb250ZW50QWRkZWQ9ITEsYS5fcisrLGcuaW1hZ2VzPVtdLGcuaXNCaWc9ITEsZy5oYXNDb3Zlcnx8KGIuaGFzQ2xhc3MoXCJyc0ltZ1wiKT8oZD1iLGU9ITApOihkPWIuZmluZChcIi5yc0ltZ1wiKSxkLmxlbmd0aCYmKGU9ITApKSxlPyhnLmJpZ0ltYWdlPWQuZXEoMCkuYXR0cihcImRhdGEtcnNCaWdJbWdcIiksZC5lYWNoKGZ1bmN0aW9uKCl7dmFyIGE9XG5uKHRoaXMpO2EuaXMoXCJhXCIpP2MoYSxcImhyZWZcIik6YS5pcyhcImltZ1wiKT9jKGEsXCJzcmNcIik6YyhhKX0pKTpiLmlzKFwiaW1nXCIpJiYoYi5hZGRDbGFzcyhcInJzSW1nIHJzTWFpblNsaWRlSW1hZ2VcIiksYyhiLFwic3JjXCIpKSksZD1iLmZpbmQoXCIucnNDYXB0aW9uXCIpLGQubGVuZ3RoJiYoZy5jYXB0aW9uPWQucmVtb3ZlKCkpLGcuY29udGVudD1iLGEuZXYudHJpZ2dlcihcInJzQWZ0ZXJQYXJzZU5vZGVcIixbYixnXSksZiYmYS5zbGlkZXMucHVzaChnKSwwPT09Zy5pbWFnZXMubGVuZ3RoJiYoZy5pc0xvYWRlZD0hMCxnLmlzUmVuZGVyZWQ9ITEsZy5pc0xvYWRpbmc9ITEsZy5pbWFnZXM9bnVsbCksZ30sX2IyOmZ1bmN0aW9uKCl7dmFyIGI9dGhpcyxmLGMsYT1mdW5jdGlvbihhKXszNz09PWE/Yi5wcmV2KCk6Mzk9PT1hJiZiLm5leHQoKX07Yi5fYi5vbihcImtleWRvd25cIitiLm5zLGZ1bmN0aW9uKGUpe2lmKCFiLnN0LmtleWJvYXJkTmF2RW5hYmxlZClyZXR1cm4hMDtpZighKGIuX2wyfHwoYz1cbmUua2V5Q29kZSwzNyE9PWMmJjM5IT09Y3x8ZikpKXtpZihkb2N1bWVudC5hY3RpdmVFbGVtZW50JiYvKElOUFVUfFNFTEVDVHxURVhUQVJFQSkvaS50ZXN0KGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQudGFnTmFtZSkpcmV0dXJuITA7Yi5pc0Z1bGxzY3JlZW4mJmUucHJldmVudERlZmF1bHQoKTthKGMpO2Y9c2V0SW50ZXJ2YWwoZnVuY3Rpb24oKXthKGMpfSw3MDApfX0pLm9uKFwia2V5dXBcIitiLm5zLGZ1bmN0aW9uKGEpe2YmJihjbGVhckludGVydmFsKGYpLGY9bnVsbCl9KX0sZ29UbzpmdW5jdGlvbihiLGYpe2IhPT10aGlzLmN1cnJTbGlkZUlkJiZ0aGlzLl9tMihiLHRoaXMuc3QudHJhbnNpdGlvblNwZWVkLCEwLCFmKX0sZGVzdHJveTpmdW5jdGlvbihiKXt0aGlzLmV2LnRyaWdnZXIoXCJyc0JlZm9yZURlc3Ryb3lcIik7dGhpcy5fYi5vZmYoXCJrZXlkb3duXCIrdGhpcy5ucytcIiBrZXl1cFwiK3RoaXMubnMrXCIgXCIrdGhpcy5fazErXCIgXCIrdGhpcy5fbDEpO3RoaXMuX3AxLm9mZih0aGlzLl9qMStcblwiIGNsaWNrXCIpO3RoaXMuc2xpZGVyLmRhdGEoXCJyb3lhbFNsaWRlclwiLG51bGwpO24ucmVtb3ZlRGF0YSh0aGlzLnNsaWRlcixcInJveWFsU2xpZGVyXCIpO24od2luZG93KS5vZmYoXCJyZXNpemVcIit0aGlzLm5zKTt0aGlzLmxvYWRpbmdUaW1lb3V0JiZjbGVhclRpbWVvdXQodGhpcy5sb2FkaW5nVGltZW91dCk7YiYmdGhpcy5zbGlkZXIucmVtb3ZlKCk7dGhpcy5ldj10aGlzLnNsaWRlcj10aGlzLnNsaWRlcz1udWxsfSxfbjI6ZnVuY3Rpb24oYixmKXtmdW5jdGlvbiBjKGMsZixnKXtjLmlzQWRkZWQ/KGEoZixjKSxlKGYsYykpOihnfHwoZz1kLnNsaWRlc0pRW2ZdKSxjLmhvbGRlcj9nPWMuaG9sZGVyOihnPWQuc2xpZGVzSlFbZl09bihnKSxjLmhvbGRlcj1nKSxjLmFwcGVuZE9uTG9hZGVkPSExLGUoZixjLGcpLGEoZixjKSxkLl9wMihjLGcsYiksYy5pc0FkZGVkPSEwKX1mdW5jdGlvbiBhKGEsYyl7Yy5jb250ZW50QWRkZWR8fChkLnNldEl0ZW1IdG1sKGMsYiksYnx8KGMuY29udGVudEFkZGVkPVxuITApKX1mdW5jdGlvbiBlKGEsYixjKXtkLl9sJiYoY3x8KGM9ZC5zbGlkZXNKUVthXSksYy5jc3MoZC5faSwoYStkLl9kMStwKSpkLl93KSl9ZnVuY3Rpb24gZyhhKXtpZihsKXtpZihhPnEtMSlyZXR1cm4gZyhhLXEpO2lmKDA+YSlyZXR1cm4gZyhxK2EpfXJldHVybiBhfXZhciBkPXRoaXMsaCxrLGw9ZC5feixxPWQubnVtU2xpZGVzO2lmKCFpc05hTihmKSlyZXR1cm4gZyhmKTt2YXIgbT1kLmN1cnJTbGlkZUlkLHAscj1iP01hdGguYWJzKGQuX28yLWQuY3VyclNsaWRlSWQpPj1kLm51bVNsaWRlcy0xPzA6MTpkLl95LHQ9TWF0aC5taW4oMixyKSx3PSExLHY9ITEsdTtmb3Ioaz1tO2s8bSsxK3Q7aysrKWlmKHU9ZyhrKSwoaD1kLnNsaWRlc1t1XSkmJighaC5pc0FkZGVkfHwhaC5wb3NpdGlvblNldCkpe3c9ITA7YnJlYWt9Zm9yKGs9bS0xO2s+bS0xLXQ7ay0tKWlmKHU9ZyhrKSwoaD1kLnNsaWRlc1t1XSkmJighaC5pc0FkZGVkfHwhaC5wb3NpdGlvblNldCkpe3Y9ITA7YnJlYWt9aWYodylmb3Ioaz1cbm07azxtK3IrMTtrKyspdT1nKGspLHA9TWF0aC5mbG9vcigoZC5fdS0obS1rKSkvZC5udW1TbGlkZXMpKmQubnVtU2xpZGVzLChoPWQuc2xpZGVzW3VdKSYmYyhoLHUpO2lmKHYpZm9yKGs9bS0xO2s+bS0xLXI7ay0tKXU9ZyhrKSxwPU1hdGguZmxvb3IoKGQuX3UtKG0taykpL3EpKnEsKGg9ZC5zbGlkZXNbdV0pJiZjKGgsdSk7aWYoIWIpZm9yKHQ9ZyhtLXIpLG09ZyhtK3IpLHI9dD5tPzA6dCxrPTA7azxxO2srKyl0Pm0mJms+dC0xfHwhKGs8cnx8az5tKXx8KGg9ZC5zbGlkZXNba10pJiZoLmhvbGRlciYmKGguaG9sZGVyLmRldGFjaCgpLGguaXNBZGRlZD0hMSl9LHNldEl0ZW1IdG1sOmZ1bmN0aW9uKGIsZil7dmFyIGM9dGhpcyxhPWZ1bmN0aW9uKCl7aWYoIWIuaW1hZ2VzKWIuaXNSZW5kZXJlZD0hMCxiLmlzTG9hZGVkPSEwLGIuaXNMb2FkaW5nPSExLGQoITApO2Vsc2UgaWYoIWIuaXNMb2FkaW5nKXt2YXIgYSxmO2IuY29udGVudC5oYXNDbGFzcyhcInJzSW1nXCIpPyhhPWIuY29udGVudCxcbmY9ITApOmE9Yi5jb250ZW50LmZpbmQoXCIucnNJbWc6bm90KGltZylcIik7YSYmIWEuaXMoXCJpbWdcIikmJmEuZWFjaChmdW5jdGlvbigpe3ZhciBhPW4odGhpcyksYz0nPGltZyBjbGFzcz1cInJzSW1nXCIgc3JjPVwiJysoYS5pcyhcImFcIik/YS5hdHRyKFwiaHJlZlwiKTphLnRleHQoKSkrJ1wiIC8+JztmP2IuY29udGVudD1uKGMpOmEucmVwbGFjZVdpdGgoYyl9KTthPWY/Yi5jb250ZW50OmIuY29udGVudC5maW5kKFwiaW1nLnJzSW1nXCIpO2soKTthLmVxKDApLmFkZENsYXNzKFwicnNNYWluU2xpZGVJbWFnZVwiKTtiLmlXJiZiLmlIJiYoYi5pc0xvYWRlZHx8Yy5fcTIoYiksZCgpKTtiLmlzTG9hZGluZz0hMDtpZihiLmlzQmlnKW4oXCI8aW1nIC8+XCIpLm9uKFwibG9hZC5ycyBlcnJvci5yc1wiLGZ1bmN0aW9uKGEpe24odGhpcykub2ZmKFwibG9hZC5ycyBlcnJvci5yc1wiKTtlKFt0aGlzXSwhMCl9KS5hdHRyKFwic3JjXCIsYi5pbWFnZSk7ZWxzZXtiLmxvYWRlZD1bXTtiLm51bVN0YXJ0ZWRMb2FkPTA7YT1mdW5jdGlvbihhKXtuKHRoaXMpLm9mZihcImxvYWQucnMgZXJyb3IucnNcIik7XG5iLmxvYWRlZC5wdXNoKHRoaXMpO2IubG9hZGVkLmxlbmd0aD09PWIubnVtU3RhcnRlZExvYWQmJmUoYi5sb2FkZWQsITEpfTtmb3IodmFyIGc9MDtnPGIuaW1hZ2VzLmxlbmd0aDtnKyspe3ZhciBoPW4oXCI8aW1nIC8+XCIpO2IubnVtU3RhcnRlZExvYWQrKztoLm9uKFwibG9hZC5ycyBlcnJvci5yc1wiLGEpLmF0dHIoXCJzcmNcIixiLmltYWdlc1tnXSl9fX19LGU9ZnVuY3Rpb24oYSxjKXtpZihhLmxlbmd0aCl7dmFyIGQ9YVswXTtpZihjIT09Yi5pc0JpZykoZD1iLmhvbGRlci5jaGlsZHJlbigpKSYmMTxkLmxlbmd0aCYmbCgpO2Vsc2UgaWYoYi5pVyYmYi5pSClnKCk7ZWxzZSBpZihiLmlXPWQud2lkdGgsYi5pSD1kLmhlaWdodCxiLmlXJiZiLmlIKWcoKTtlbHNle3ZhciBlPW5ldyBJbWFnZTtlLm9ubG9hZD1mdW5jdGlvbigpe2Uud2lkdGg/KGIuaVc9ZS53aWR0aCxiLmlIPWUuaGVpZ2h0LGcoKSk6c2V0VGltZW91dChmdW5jdGlvbigpe2Uud2lkdGgmJihiLmlXPWUud2lkdGgsYi5pSD1cbmUuaGVpZ2h0KTtnKCl9LDFFMyl9O2Uuc3JjPWQuc3JjfX1lbHNlIGcoKX0sZz1mdW5jdGlvbigpe2IuaXNMb2FkZWQ9ITA7Yi5pc0xvYWRpbmc9ITE7ZCgpO2woKTtoKCl9LGQ9ZnVuY3Rpb24oKXtpZighYi5pc0FwcGVuZGVkJiZjLmV2KXt2YXIgYT1jLnN0LnZpc2libGVOZWFyYnksZD1iLmlkLWMuX287Znx8Yi5hcHBlbmRPbkxvYWRlZHx8IWMuc3QuZmFkZWluTG9hZGVkU2xpZGV8fDAhPT1kJiYoIShhfHxjLl9yMnx8Yy5fbDIpfHwtMSE9PWQmJjEhPT1kKXx8KGE9e3Zpc2liaWxpdHk6XCJ2aXNpYmxlXCIsb3BhY2l0eTowfSxhW2MuX2crXCJ0cmFuc2l0aW9uXCJdPVwib3BhY2l0eSA0MDBtcyBlYXNlLWluLW91dFwiLGIuY29udGVudC5jc3MoYSksc2V0VGltZW91dChmdW5jdGlvbigpe2IuY29udGVudC5jc3MoXCJvcGFjaXR5XCIsMSl9LDE2KSk7Yi5ob2xkZXIuZmluZChcIi5yc1ByZWxvYWRlclwiKS5sZW5ndGg/Yi5ob2xkZXIuYXBwZW5kKGIuY29udGVudCk6Yi5ob2xkZXIuaHRtbChiLmNvbnRlbnQpO1xuYi5pc0FwcGVuZGVkPSEwO2IuaXNMb2FkZWQmJihjLl9xMihiKSxoKCkpO2Iuc2l6ZVJlYWR5fHwoYi5zaXplUmVhZHk9ITAsc2V0VGltZW91dChmdW5jdGlvbigpe2MuZXYudHJpZ2dlcihcInJzTWF5YmVTaXplUmVhZHlcIixiKX0sMTAwKSl9fSxoPWZ1bmN0aW9uKCl7IWIubG9hZGVkVHJpZ2dlcmVkJiZjLmV2JiYoYi5pc0xvYWRlZD1iLmxvYWRlZFRyaWdnZXJlZD0hMCxiLmhvbGRlci50cmlnZ2VyKFwicnNBZnRlckNvbnRlbnRTZXRcIiksYy5ldi50cmlnZ2VyKFwicnNBZnRlckNvbnRlbnRTZXRcIixiKSl9LGs9ZnVuY3Rpb24oKXtjLnN0LnVzZVByZWxvYWRlciYmYi5ob2xkZXIuaHRtbChjLl9xMS5jbG9uZSgpKX0sbD1mdW5jdGlvbihhKXtjLnN0LnVzZVByZWxvYWRlciYmKGE9Yi5ob2xkZXIuZmluZChcIi5yc1ByZWxvYWRlclwiKSxhLmxlbmd0aCYmYS5yZW1vdmUoKSl9O2IuaXNMb2FkZWQ/ZCgpOmY/IWMuX2wmJmIuaW1hZ2VzJiZiLmlXJiZiLmlIP2EoKTooYi5ob2xkZXIuaXNXYWl0aW5nPVxuITAsaygpLGIuaG9sZGVyLnNsaWRlSWQ9LTk5KTphKCl9LF9wMjpmdW5jdGlvbihiLGYsYyl7dGhpcy5fcDEuYXBwZW5kKGIuaG9sZGVyKTtiLmFwcGVuZE9uTG9hZGVkPSExfSxfZzI6ZnVuY3Rpb24oYixmKXt2YXIgYz10aGlzLGEsZT1cInRvdWNoc3RhcnRcIj09PWIudHlwZTtjLl9zMj1lO2MuZXYudHJpZ2dlcihcInJzRHJhZ1N0YXJ0XCIpO2lmKG4oYi50YXJnZXQpLmNsb3Nlc3QoXCIucnNOb0RyYWdcIixjLl9yMSkubGVuZ3RoKXJldHVybiBjLmRyYWdTdWNjZXNzPSExLCEwOyFmJiZjLl9yMiYmKGMuX3QyPSEwLGMuX3UyKCkpO2MuZHJhZ1N1Y2Nlc3M9ITE7aWYoYy5fbDIpZSYmKGMuX3YyPSEwKTtlbHNle2UmJihjLl92Mj0hMSk7Yy5fdzIoKTtpZihlKXt2YXIgZz1iLm9yaWdpbmFsRXZlbnQudG91Y2hlcztpZihnJiYwPGcubGVuZ3RoKWE9Z1swXSwxPGcubGVuZ3RoJiYoYy5fdjI9ITApO2Vsc2UgcmV0dXJufWVsc2UgYi5wcmV2ZW50RGVmYXVsdCgpLGE9YixjLnBvaW50ZXJFbmFibGVkJiZcbihhPWEub3JpZ2luYWxFdmVudCk7Yy5fbDI9ITA7Yy5fYi5vbihjLl9rMSxmdW5jdGlvbihhKXtjLl94MihhLGYpfSkub24oYy5fbDEsZnVuY3Rpb24oYSl7Yy5feTIoYSxmKX0pO2MuX3oyPVwiXCI7Yy5fYTM9ITE7Yy5fYjM9YS5wYWdlWDtjLl9jMz1hLnBhZ2VZO2MuX2QzPWMuX3Y9KGY/Yy5fZTM6Yy5faCk/YS5wYWdlWDphLnBhZ2VZO2MuX2YzPTA7Yy5fZzM9MDtjLl9oMz1mP2MuX2kzOmMuX3A7Yy5fajM9KG5ldyBEYXRlKS5nZXRUaW1lKCk7aWYoZSljLl9lMS5vbihjLl9tMSxmdW5jdGlvbihhKXtjLl95MihhLGYpfSl9fSxfazM6ZnVuY3Rpb24oYixmKXtpZih0aGlzLl9sMyl7dmFyIGM9dGhpcy5fbTMsYT1iLnBhZ2VYLXRoaXMuX2IzLGU9Yi5wYWdlWS10aGlzLl9jMyxnPXRoaXMuX2gzK2EsZD10aGlzLl9oMytlLGg9Zj90aGlzLl9lMzp0aGlzLl9oLGc9aD9nOmQsZD10aGlzLl96Mjt0aGlzLl9hMz0hMDt0aGlzLl9iMz1iLnBhZ2VYO3RoaXMuX2MzPWIucGFnZVk7XCJ4XCI9PT1cbmQmJjAhPT1hP3RoaXMuX2YzPTA8YT8xOi0xOlwieVwiPT09ZCYmMCE9PWUmJih0aGlzLl9nMz0wPGU/MTotMSk7ZD1oP3RoaXMuX2IzOnRoaXMuX2MzO2E9aD9hOmU7Zj9nPnRoaXMuX24zP2c9dGhpcy5faDMrYSp0aGlzLl9uMTpnPHRoaXMuX28zJiYoZz10aGlzLl9oMythKnRoaXMuX24xKTp0aGlzLl96fHwoMD49dGhpcy5jdXJyU2xpZGVJZCYmMDxkLXRoaXMuX2QzJiYoZz10aGlzLl9oMythKnRoaXMuX24xKSx0aGlzLmN1cnJTbGlkZUlkPj10aGlzLm51bVNsaWRlcy0xJiYwPmQtdGhpcy5fZDMmJihnPXRoaXMuX2gzK2EqdGhpcy5fbjEpKTt0aGlzLl9oMz1nOzIwMDxjLXRoaXMuX2ozJiYodGhpcy5fajM9Yyx0aGlzLl92PWQpO2Y/dGhpcy5fcTModGhpcy5faDMpOnRoaXMuX2wmJnRoaXMuX3AzKHRoaXMuX2gzKX19LF94MjpmdW5jdGlvbihiLGYpe3ZhciBjPXRoaXMsYSxlPVwidG91Y2htb3ZlXCI9PT1iLnR5cGU7aWYoIWMuX3MyfHxlKXtpZihlKXtpZihjLl9yMylyZXR1cm47dmFyIGc9XG5iLm9yaWdpbmFsRXZlbnQudG91Y2hlcztpZihnKXtpZigxPGcubGVuZ3RoKXJldHVybjthPWdbMF19ZWxzZSByZXR1cm59ZWxzZSBhPWIsYy5wb2ludGVyRW5hYmxlZCYmKGE9YS5vcmlnaW5hbEV2ZW50KTtjLl9hM3x8KGMuX2UmJihmP2MuX3MzOmMuX3AxKS5jc3MoYy5fZytjLl91MSxcIjBzXCIpLGZ1bmN0aW9uIGgoKXtjLl9sMiYmKGMuX3QzPXJlcXVlc3RBbmltYXRpb25GcmFtZShoKSxjLl91MyYmYy5fazMoYy5fdTMsZikpfSgpKTtpZihjLl9sMyliLnByZXZlbnREZWZhdWx0KCksYy5fbTM9KG5ldyBEYXRlKS5nZXRUaW1lKCksYy5fdTM9YTtlbHNlIGlmKGc9Zj9jLl9lMzpjLl9oLGE9TWF0aC5hYnMoYS5wYWdlWC1jLl9iMyktTWF0aC5hYnMoYS5wYWdlWS1jLl9jMyktKGc/LTc6NyksNzxhKXtpZihnKWIucHJldmVudERlZmF1bHQoKSxjLl96Mj1cInhcIjtlbHNlIGlmKGUpe2MuX3YzKGIpO3JldHVybn1jLl9sMz0hMH1lbHNlIGlmKC03PmEpe2lmKCFnKWIucHJldmVudERlZmF1bHQoKSxcbmMuX3oyPVwieVwiO2Vsc2UgaWYoZSl7Yy5fdjMoYik7cmV0dXJufWMuX2wzPSEwfX19LF92MzpmdW5jdGlvbihiLGYpe3RoaXMuX3IzPSEwO3RoaXMuX2EzPXRoaXMuX2wyPSExO3RoaXMuX3kyKGIpfSxfeTI6ZnVuY3Rpb24oYixmKXtmdW5jdGlvbiBjKGEpe3JldHVybiAxMDA+YT8xMDA6NTAwPGE/NTAwOmF9ZnVuY3Rpb24gYShhLGIpe2lmKGUuX2x8fGYpaD0oLWUuX3UtZS5fZDEpKmUuX3csaz1NYXRoLmFicyhlLl9wLWgpLGUuX2M9ay9iLGEmJihlLl9jKz0yNTApLGUuX2M9YyhlLl9jKSxlLl94MyhoLCExKX12YXIgZT10aGlzLGcsZCxoLGs7Zz0tMTxiLnR5cGUuaW5kZXhPZihcInRvdWNoXCIpO2lmKCFlLl9zMnx8ZylpZihlLl9zMj0hMSxlLmV2LnRyaWdnZXIoXCJyc0RyYWdSZWxlYXNlXCIpLGUuX3UzPW51bGwsZS5fbDI9ITEsZS5fcjM9ITEsZS5fbDM9ITEsZS5fbTM9MCxjYW5jZWxBbmltYXRpb25GcmFtZShlLl90MyksZS5fYTMmJihmP2UuX3EzKGUuX2gzKTplLl9sJiZlLl9wMyhlLl9oMykpLFxuZS5fYi5vZmYoZS5fazEpLm9mZihlLl9sMSksZyYmZS5fZTEub2ZmKGUuX20xKSxlLl9pMSgpLCFlLl9hMyYmIWUuX3YyJiZmJiZlLl93Myl7dmFyIGw9bihiLnRhcmdldCkuY2xvc2VzdChcIi5yc05hdkl0ZW1cIik7bC5sZW5ndGgmJmUuZ29UbyhsLmluZGV4KCkpfWVsc2V7ZD1mP2UuX2UzOmUuX2g7aWYoIWUuX2EzfHxcInlcIj09PWUuX3oyJiZkfHxcInhcIj09PWUuX3oyJiYhZClpZighZiYmZS5fdDIpe2UuX3QyPSExO2lmKGUuc3QubmF2aWdhdGVCeUNsaWNrKXtlLl9pMihlLnBvaW50ZXJFbmFibGVkP2Iub3JpZ2luYWxFdmVudDpiKTtlLmRyYWdTdWNjZXNzPSEwO3JldHVybn1lLmRyYWdTdWNjZXNzPSEwfWVsc2V7ZS5fdDI9ITE7ZS5kcmFnU3VjY2Vzcz0hMTtyZXR1cm59ZWxzZSBlLmRyYWdTdWNjZXNzPSEwO2UuX3QyPSExO2UuX3oyPVwiXCI7dmFyIHE9ZS5zdC5taW5TbGlkZU9mZnNldDtnPWc/Yi5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdOmUucG9pbnRlckVuYWJsZWQ/XG5iLm9yaWdpbmFsRXZlbnQ6Yjt2YXIgbT1kP2cucGFnZVg6Zy5wYWdlWSxwPWUuX2QzO2c9ZS5fdjt2YXIgcj1lLmN1cnJTbGlkZUlkLHQ9ZS5udW1TbGlkZXMsdz1kP2UuX2YzOmUuX2czLHY9ZS5fejtNYXRoLmFicyhtLXApO2c9bS1nO2Q9KG5ldyBEYXRlKS5nZXRUaW1lKCktZS5fajM7ZD1NYXRoLmFicyhnKS9kO2lmKDA9PT13fHwxPj10KWEoITAsZCk7ZWxzZXtpZighdiYmIWYpaWYoMD49cil7aWYoMDx3KXthKCEwLGQpO3JldHVybn19ZWxzZSBpZihyPj10LTEmJjA+dyl7YSghMCxkKTtyZXR1cm59aWYoZil7aD1lLl9pMztpZihoPmUuX24zKWg9ZS5fbjM7ZWxzZSBpZihoPGUuX28zKWg9ZS5fbzM7ZWxzZXttPWQqZC8uMDA2O2w9LWUuX2kzO3A9ZS5feTMtZS5fejMrZS5faTM7MDxnJiZtPmw/KGwrPWUuX3ozLygxNS8obS9kKi4wMDMpKSxkPWQqbC9tLG09bCk6MD5nJiZtPnAmJihwKz1lLl96My8oMTUvKG0vZCouMDAzKSksZD1kKnAvbSxtPXApO2w9TWF0aC5tYXgoTWF0aC5yb3VuZChkL1xuLjAwMyksNTApO2grPW0qKDA+Zz8tMToxKTtpZihoPmUuX24zKXtlLl9hNChoLGwsITAsZS5fbjMsMjAwKTtyZXR1cm59aWYoaDxlLl9vMyl7ZS5fYTQoaCxsLCEwLGUuX28zLDIwMCk7cmV0dXJufX1lLl9hNChoLGwsITApfWVsc2UgbD1mdW5jdGlvbihhKXt2YXIgYj1NYXRoLmZsb29yKGEvZS5fdyk7YS1iKmUuX3c+cSYmYisrO3JldHVybiBifSxwK3E8bT8wPnc/YSghMSxkKToobD1sKG0tcCksZS5fbTIoZS5jdXJyU2xpZGVJZC1sLGMoTWF0aC5hYnMoZS5fcC0oLWUuX3UtZS5fZDErbCkqZS5fdykvZCksITEsITAsITApKTpwLXE+bT8wPHc/YSghMSxkKToobD1sKHAtbSksZS5fbTIoZS5jdXJyU2xpZGVJZCtsLGMoTWF0aC5hYnMoZS5fcC0oLWUuX3UtZS5fZDEtbCkqZS5fdykvZCksITEsITAsITApKTphKCExLGQpfX19LF9wMzpmdW5jdGlvbihiKXtiPXRoaXMuX3A9Yjt0aGlzLl9lP3RoaXMuX3AxLmNzcyh0aGlzLl94MSx0aGlzLl95MSsodGhpcy5faD9iK3RoaXMuX3oxKzA6XG4wK3RoaXMuX3oxK2IpK3RoaXMuX2EyKTp0aGlzLl9wMS5jc3ModGhpcy5faD90aGlzLl94MTp0aGlzLl93MSxiKX0sdXBkYXRlU2xpZGVyU2l6ZTpmdW5jdGlvbihiKXt2YXIgZixjO2lmKHRoaXMuc2xpZGVyKXtpZih0aGlzLnN0LmF1dG9TY2FsZVNsaWRlcil7dmFyIGE9dGhpcy5zdC5hdXRvU2NhbGVTbGlkZXJXaWR0aCxlPXRoaXMuc3QuYXV0b1NjYWxlU2xpZGVySGVpZ2h0O3RoaXMuc3QuYXV0b1NjYWxlSGVpZ2h0PyhmPXRoaXMuc2xpZGVyLndpZHRoKCksZiE9dGhpcy53aWR0aCYmKHRoaXMuc2xpZGVyLmNzcyhcImhlaWdodFwiLGUvYSpmKSxmPXRoaXMuc2xpZGVyLndpZHRoKCkpLGM9dGhpcy5zbGlkZXIuaGVpZ2h0KCkpOihjPXRoaXMuc2xpZGVyLmhlaWdodCgpLGMhPXRoaXMuaGVpZ2h0JiYodGhpcy5zbGlkZXIuY3NzKFwid2lkdGhcIixhL2UqYyksYz10aGlzLnNsaWRlci5oZWlnaHQoKSksZj10aGlzLnNsaWRlci53aWR0aCgpKX1lbHNlIGY9dGhpcy5zbGlkZXIud2lkdGgoKSxcbmM9dGhpcy5zbGlkZXIuaGVpZ2h0KCk7aWYoYnx8ZiE9dGhpcy53aWR0aHx8YyE9dGhpcy5oZWlnaHQpe3RoaXMud2lkdGg9Zjt0aGlzLmhlaWdodD1jO3RoaXMuX2I0PWY7dGhpcy5fYzQ9Yzt0aGlzLmV2LnRyaWdnZXIoXCJyc0JlZm9yZVNpemVTZXRcIik7dGhpcy5ldi50cmlnZ2VyKFwicnNBZnRlclNpemVQcm9wU2V0XCIpO3RoaXMuX2UxLmNzcyh7d2lkdGg6dGhpcy5fYjQsaGVpZ2h0OnRoaXMuX2M0fSk7dGhpcy5fdz0odGhpcy5faD90aGlzLl9iNDp0aGlzLl9jNCkrdGhpcy5zdC5zbGlkZXNTcGFjaW5nO3RoaXMuX2Q0PXRoaXMuc3QuaW1hZ2VTY2FsZVBhZGRpbmc7Zm9yKGY9MDtmPHRoaXMuc2xpZGVzLmxlbmd0aDtmKyspYj10aGlzLnNsaWRlc1tmXSxiLnBvc2l0aW9uU2V0PSExLGImJmIuaW1hZ2VzJiZiLmlzTG9hZGVkJiYoYi5pc1JlbmRlcmVkPSExLHRoaXMuX3EyKGIpKTtpZih0aGlzLl9lNClmb3IoZj0wO2Y8dGhpcy5fZTQubGVuZ3RoO2YrKyliPXRoaXMuX2U0W2ZdLGIuaG9sZGVyLmNzcyh0aGlzLl9pLFxuKGIuaWQrdGhpcy5fZDEpKnRoaXMuX3cpO3RoaXMuX24yKCk7dGhpcy5fbCYmKHRoaXMuX2UmJnRoaXMuX3AxLmNzcyh0aGlzLl9nK1widHJhbnNpdGlvbi1kdXJhdGlvblwiLFwiMHNcIiksdGhpcy5fcDMoKC10aGlzLl91LXRoaXMuX2QxKSp0aGlzLl93KSk7dGhpcy5ldi50cmlnZ2VyKFwicnNPblVwZGF0ZU5hdlwiKX10aGlzLl9qMj10aGlzLl9lMS5vZmZzZXQoKTt0aGlzLl9qMj10aGlzLl9qMlt0aGlzLl9pXX19LGFwcGVuZFNsaWRlOmZ1bmN0aW9uKGIsZil7dmFyIGM9dGhpcy5fcyhiKTtpZihpc05hTihmKXx8Zj50aGlzLm51bVNsaWRlcylmPXRoaXMubnVtU2xpZGVzO3RoaXMuc2xpZGVzLnNwbGljZShmLDAsYyk7dGhpcy5zbGlkZXNKUS5zcGxpY2UoZiwwLG4oJzxkaXYgc3R5bGU9XCInKyh0aGlzLl9sP1wicG9zaXRpb246YWJzb2x1dGU7XCI6dGhpcy5fbikrJ1wiIGNsYXNzPVwicnNTbGlkZVwiPjwvZGl2PicpKTtmPD10aGlzLmN1cnJTbGlkZUlkJiZ0aGlzLmN1cnJTbGlkZUlkKys7dGhpcy5ldi50cmlnZ2VyKFwicnNPbkFwcGVuZFNsaWRlXCIsXG5bYyxmXSk7dGhpcy5fZjQoZik7Zj09PXRoaXMuY3VyclNsaWRlSWQmJnRoaXMuZXYudHJpZ2dlcihcInJzQWZ0ZXJTbGlkZUNoYW5nZVwiKX0scmVtb3ZlU2xpZGU6ZnVuY3Rpb24oYil7dmFyIGY9dGhpcy5zbGlkZXNbYl07ZiYmKGYuaG9sZGVyJiZmLmhvbGRlci5yZW1vdmUoKSxiPHRoaXMuY3VyclNsaWRlSWQmJnRoaXMuY3VyclNsaWRlSWQtLSx0aGlzLnNsaWRlcy5zcGxpY2UoYiwxKSx0aGlzLnNsaWRlc0pRLnNwbGljZShiLDEpLHRoaXMuZXYudHJpZ2dlcihcInJzT25SZW1vdmVTbGlkZVwiLFtiXSksdGhpcy5fZjQoYiksYj09PXRoaXMuY3VyclNsaWRlSWQmJnRoaXMuZXYudHJpZ2dlcihcInJzQWZ0ZXJTbGlkZUNoYW5nZVwiKSl9LF9mNDpmdW5jdGlvbihiKXt2YXIgZj10aGlzO2I9Zi5udW1TbGlkZXM7Yj0wPj1mLl91PzA6TWF0aC5mbG9vcihmLl91L2IpO2YubnVtU2xpZGVzPWYuc2xpZGVzLmxlbmd0aDswPT09Zi5udW1TbGlkZXM/KGYuY3VyclNsaWRlSWQ9Zi5fZDE9Zi5fdT1cbjAsZi5jdXJyU2xpZGU9Zi5fZzQ9bnVsbCk6Zi5fdT1iKmYubnVtU2xpZGVzK2YuY3VyclNsaWRlSWQ7Zm9yKGI9MDtiPGYubnVtU2xpZGVzO2IrKylmLnNsaWRlc1tiXS5pZD1iO2YuY3VyclNsaWRlPWYuc2xpZGVzW2YuY3VyclNsaWRlSWRdO2YuX3IxPWYuc2xpZGVzSlFbZi5jdXJyU2xpZGVJZF07Zi5jdXJyU2xpZGVJZD49Zi5udW1TbGlkZXM/Zi5nb1RvKGYubnVtU2xpZGVzLTEpOjA+Zi5jdXJyU2xpZGVJZCYmZi5nb1RvKDApO2YuX3QoKTtmLl9sJiZmLl9wMS5jc3MoZi5fZytmLl91MSxcIjBtc1wiKTtmLl9oNCYmY2xlYXJUaW1lb3V0KGYuX2g0KTtmLl9oND1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7Zi5fbCYmZi5fcDMoKC1mLl91LWYuX2QxKSpmLl93KTtmLl9uMigpO2YuX2x8fGYuX3IxLmNzcyh7ZGlzcGxheTpcImJsb2NrXCIsb3BhY2l0eToxfSl9LDE0KTtmLmV2LnRyaWdnZXIoXCJyc09uVXBkYXRlTmF2XCIpfSxfaTE6ZnVuY3Rpb24oKXt0aGlzLl9mMSYmdGhpcy5fbCYmKHRoaXMuX2cxP1xudGhpcy5fZTEuY3NzKFwiY3Vyc29yXCIsdGhpcy5fZzEpOih0aGlzLl9lMS5yZW1vdmVDbGFzcyhcImdyYWJiaW5nLWN1cnNvclwiKSx0aGlzLl9lMS5hZGRDbGFzcyhcImdyYWItY3Vyc29yXCIpKSl9LF93MjpmdW5jdGlvbigpe3RoaXMuX2YxJiZ0aGlzLl9sJiYodGhpcy5faDE/dGhpcy5fZTEuY3NzKFwiY3Vyc29yXCIsdGhpcy5faDEpOih0aGlzLl9lMS5yZW1vdmVDbGFzcyhcImdyYWItY3Vyc29yXCIpLHRoaXMuX2UxLmFkZENsYXNzKFwiZ3JhYmJpbmctY3Vyc29yXCIpKSl9LG5leHQ6ZnVuY3Rpb24oYil7dGhpcy5fbTIoXCJuZXh0XCIsdGhpcy5zdC50cmFuc2l0aW9uU3BlZWQsITAsIWIpfSxwcmV2OmZ1bmN0aW9uKGIpe3RoaXMuX20yKFwicHJldlwiLHRoaXMuc3QudHJhbnNpdGlvblNwZWVkLCEwLCFiKX0sX20yOmZ1bmN0aW9uKGIsZixjLGEsZSl7dmFyIGc9dGhpcyxkLGgsaztnLmV2LnRyaWdnZXIoXCJyc0JlZm9yZU1vdmVcIixbYixhXSk7az1cIm5leHRcIj09PWI/Zy5jdXJyU2xpZGVJZCsxOlwicHJldlwiPT09XG5iP2cuY3VyclNsaWRlSWQtMTpiPXBhcnNlSW50KGIsMTApO2lmKCFnLl96KXtpZigwPmspe2cuX2k0KFwibGVmdFwiLCFhKTtyZXR1cm59aWYoaz49Zy5udW1TbGlkZXMpe2cuX2k0KFwicmlnaHRcIiwhYSk7cmV0dXJufX1nLl9yMiYmKGcuX3UyKCEwKSxjPSExKTtoPWstZy5jdXJyU2xpZGVJZDtrPWcuX28yPWcuY3VyclNsaWRlSWQ7dmFyIGw9Zy5jdXJyU2xpZGVJZCtoO2E9Zy5fdTt2YXIgbjtnLl96PyhsPWcuX24yKCExLGwpLGErPWgpOmE9bDtnLl9vPWw7Zy5fZzQ9Zy5zbGlkZXNKUVtnLmN1cnJTbGlkZUlkXTtnLl91PWE7Zy5jdXJyU2xpZGVJZD1nLl9vO2cuY3VyclNsaWRlPWcuc2xpZGVzW2cuY3VyclNsaWRlSWRdO2cuX3IxPWcuc2xpZGVzSlFbZy5jdXJyU2xpZGVJZF07dmFyIGw9Zy5zdC5zbGlkZXNEaWZmLG09Qm9vbGVhbigwPGgpO2g9TWF0aC5hYnMoaCk7dmFyIHA9TWF0aC5mbG9vcihrL2cuX3kpLHI9TWF0aC5mbG9vcigoaysobT9sOi1sKSkvZy5feSkscD0obT9NYXRoLm1heChwLFxucik6TWF0aC5taW4ocCxyKSkqZy5feSsobT9nLl95LTE6MCk7cD5nLm51bVNsaWRlcy0xP3A9Zy5udW1TbGlkZXMtMTowPnAmJihwPTApO2s9bT9wLWs6ay1wO2s+Zy5feSYmKGs9Zy5feSk7aWYoaD5rK2wpZm9yKGcuX2QxKz0oaC0oaytsKSkqKG0/LTE6MSksZio9MS40LGs9MDtrPGcubnVtU2xpZGVzO2srKylnLnNsaWRlc1trXS5wb3NpdGlvblNldD0hMTtnLl9jPWY7Zy5fbjIoITApO2V8fChuPSEwKTtkPSgtYS1nLl9kMSkqZy5fdztuP3NldFRpbWVvdXQoZnVuY3Rpb24oKXtnLl9qND0hMTtnLl94MyhkLGIsITEsYyk7Zy5ldi50cmlnZ2VyKFwicnNPblVwZGF0ZU5hdlwiKX0sMCk6KGcuX3gzKGQsYiwhMSxjKSxnLmV2LnRyaWdnZXIoXCJyc09uVXBkYXRlTmF2XCIpKX0sX2YyOmZ1bmN0aW9uKCl7dGhpcy5zdC5hcnJvd3NOYXYmJigxPj10aGlzLm51bVNsaWRlcz8odGhpcy5fYzIuY3NzKFwiZGlzcGxheVwiLFwibm9uZVwiKSx0aGlzLl9kMi5jc3MoXCJkaXNwbGF5XCIsXCJub25lXCIpKToodGhpcy5fYzIuY3NzKFwiZGlzcGxheVwiLFxuXCJibG9ja1wiKSx0aGlzLl9kMi5jc3MoXCJkaXNwbGF5XCIsXCJibG9ja1wiKSx0aGlzLl96fHx0aGlzLnN0Lmxvb3BSZXdpbmR8fCgwPT09dGhpcy5jdXJyU2xpZGVJZD90aGlzLl9jMi5hZGRDbGFzcyhcInJzQXJyb3dEaXNhYmxlZFwiKTp0aGlzLl9jMi5yZW1vdmVDbGFzcyhcInJzQXJyb3dEaXNhYmxlZFwiKSx0aGlzLmN1cnJTbGlkZUlkPT09dGhpcy5udW1TbGlkZXMtMT90aGlzLl9kMi5hZGRDbGFzcyhcInJzQXJyb3dEaXNhYmxlZFwiKTp0aGlzLl9kMi5yZW1vdmVDbGFzcyhcInJzQXJyb3dEaXNhYmxlZFwiKSkpKX0sX3gzOmZ1bmN0aW9uKGIsZixjLGEsZSl7ZnVuY3Rpb24gZygpe3ZhciBhO2gmJihhPWguZGF0YShcInJzVGltZW91dFwiKSkmJihoIT09ayYmaC5jc3Moe29wYWNpdHk6MCxkaXNwbGF5Olwibm9uZVwiLHpJbmRleDowfSksY2xlYXJUaW1lb3V0KGEpLGguZGF0YShcInJzVGltZW91dFwiLFwiXCIpKTtpZihhPWsuZGF0YShcInJzVGltZW91dFwiKSljbGVhclRpbWVvdXQoYSksay5kYXRhKFwicnNUaW1lb3V0XCIsXG5cIlwiKX12YXIgZD10aGlzLGgsayxsPXt9O2lzTmFOKGQuX2MpJiYoZC5fYz00MDApO2QuX3A9ZC5faDM9YjtkLmV2LnRyaWdnZXIoXCJyc0JlZm9yZUFuaW1TdGFydFwiKTtkLl9lP2QuX2w/KGQuX2M9cGFyc2VJbnQoZC5fYywxMCksYz1kLl9nK2QuX3YxLGxbZC5fZytkLl91MV09ZC5fYytcIm1zXCIsbFtjXT1hP24ucnNDU1MzRWFzaW5nW2Quc3QuZWFzZUluT3V0XTpuLnJzQ1NTM0Vhc2luZ1tkLnN0LmVhc2VPdXRdLGQuX3AxLmNzcyhsKSxhfHwhZC5oYXNUb3VjaD9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZC5fcDMoYil9LDUpOmQuX3AzKGIpKTooZC5fYz1kLnN0LnRyYW5zaXRpb25TcGVlZCxoPWQuX2c0LGs9ZC5fcjEsay5kYXRhKFwicnNUaW1lb3V0XCIpJiZrLmNzcyhcIm9wYWNpdHlcIiwwKSxnKCksaCYmaC5kYXRhKFwicnNUaW1lb3V0XCIsc2V0VGltZW91dChmdW5jdGlvbigpe2xbZC5fZytkLl91MV09XCIwbXNcIjtsLnpJbmRleD0wO2wuZGlzcGxheT1cIm5vbmVcIjtoLmRhdGEoXCJyc1RpbWVvdXRcIixcblwiXCIpO2guY3NzKGwpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtoLmNzcyhcIm9wYWNpdHlcIiwwKX0sMTYpfSxkLl9jKzYwKSksbC5kaXNwbGF5PVwiYmxvY2tcIixsLnpJbmRleD1kLl9tLGwub3BhY2l0eT0wLGxbZC5fZytkLl91MV09XCIwbXNcIixsW2QuX2crZC5fdjFdPW4ucnNDU1MzRWFzaW5nW2Quc3QuZWFzZUluT3V0XSxrLmNzcyhsKSxrLmRhdGEoXCJyc1RpbWVvdXRcIixzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ay5jc3MoZC5fZytkLl91MSxkLl9jK1wibXNcIik7ay5kYXRhKFwicnNUaW1lb3V0XCIsc2V0VGltZW91dChmdW5jdGlvbigpe2suY3NzKFwib3BhY2l0eVwiLDEpO2suZGF0YShcInJzVGltZW91dFwiLFwiXCIpfSwyMCkpfSwyMCkpKTpkLl9sPyhsW2QuX2g/ZC5feDE6ZC5fdzFdPWIrXCJweFwiLGQuX3AxLmFuaW1hdGUobCxkLl9jLGE/ZC5zdC5lYXNlSW5PdXQ6ZC5zdC5lYXNlT3V0KSk6KGg9ZC5fZzQsaz1kLl9yMSxrLnN0b3AoITAsITApLmNzcyh7b3BhY2l0eTowLGRpc3BsYXk6XCJibG9ja1wiLFxuekluZGV4OmQuX219KSxkLl9jPWQuc3QudHJhbnNpdGlvblNwZWVkLGsuYW5pbWF0ZSh7b3BhY2l0eToxfSxkLl9jLGQuc3QuZWFzZUluT3V0KSxnKCksaCYmaC5kYXRhKFwicnNUaW1lb3V0XCIsc2V0VGltZW91dChmdW5jdGlvbigpe2guc3RvcCghMCwhMCkuY3NzKHtvcGFjaXR5OjAsZGlzcGxheTpcIm5vbmVcIix6SW5kZXg6MH0pfSxkLl9jKzYwKSkpO2QuX3IyPSEwO2QubG9hZGluZ1RpbWVvdXQmJmNsZWFyVGltZW91dChkLmxvYWRpbmdUaW1lb3V0KTtkLmxvYWRpbmdUaW1lb3V0PWU/c2V0VGltZW91dChmdW5jdGlvbigpe2QubG9hZGluZ1RpbWVvdXQ9bnVsbDtlLmNhbGwoKX0sZC5fYys2MCk6c2V0VGltZW91dChmdW5jdGlvbigpe2QubG9hZGluZ1RpbWVvdXQ9bnVsbDtkLl9rNChmKX0sZC5fYys2MCl9LF91MjpmdW5jdGlvbihiKXt0aGlzLl9yMj0hMTtjbGVhclRpbWVvdXQodGhpcy5sb2FkaW5nVGltZW91dCk7aWYodGhpcy5fbClpZighdGhpcy5fZSl0aGlzLl9wMS5zdG9wKCEwKSxcbnRoaXMuX3A9cGFyc2VJbnQodGhpcy5fcDEuY3NzKHRoaXMuX2g/dGhpcy5feDE6dGhpcy5fdzEpLDEwKTtlbHNle2lmKCFiKXtiPXRoaXMuX3A7dmFyIGY9dGhpcy5faDM9dGhpcy5fbDQoKTt0aGlzLl9wMS5jc3ModGhpcy5fZyt0aGlzLl91MSxcIjBtc1wiKTtiIT09ZiYmdGhpcy5fcDMoZil9fWVsc2UgMjA8dGhpcy5fbT90aGlzLl9tPTEwOnRoaXMuX20rK30sX2w0OmZ1bmN0aW9uKCl7dmFyIGI9d2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5fcDEuZ2V0KDApLG51bGwpLmdldFByb3BlcnR5VmFsdWUodGhpcy5fZytcInRyYW5zZm9ybVwiKS5yZXBsYWNlKC9ebWF0cml4XFwoL2ksXCJcIikuc3BsaXQoLywgfFxcKSQvZyksZj0wPT09YlswXS5pbmRleE9mKFwibWF0cml4M2RcIik7cmV0dXJuIHBhcnNlSW50KGJbdGhpcy5faD9mPzEyOjQ6Zj8xMzo1XSwxMCl9LF9tNDpmdW5jdGlvbihiLGYpe3JldHVybiB0aGlzLl9lP3RoaXMuX3kxKyhmP2IrdGhpcy5fejErMDowK3RoaXMuX3oxK2IpK3RoaXMuX2EyOlxuYn0sX2s0OmZ1bmN0aW9uKGIpe3RoaXMuX2x8fCh0aGlzLl9yMS5jc3MoXCJ6LWluZGV4XCIsMCksdGhpcy5fbT0xMCk7dGhpcy5fcjI9ITE7dGhpcy5zdGF0aWNTbGlkZUlkPXRoaXMuY3VyclNsaWRlSWQ7dGhpcy5fbjIoKTt0aGlzLl9uND0hMTt0aGlzLmV2LnRyaWdnZXIoXCJyc0FmdGVyU2xpZGVDaGFuZ2VcIil9LF9pNDpmdW5jdGlvbihiLGYpe3ZhciBjPXRoaXMsYT0oLWMuX3UtYy5fZDEpKmMuX3c7aWYoMCE9PWMubnVtU2xpZGVzJiYhYy5fcjIpaWYoYy5zdC5sb29wUmV3aW5kKWMuZ29UbyhcImxlZnRcIj09PWI/Yy5udW1TbGlkZXMtMTowLGYpO2Vsc2UgaWYoYy5fbCl7Yy5fYz0yMDA7dmFyIGU9ZnVuY3Rpb24oKXtjLl9yMj0hMX07Yy5feDMoYSsoXCJsZWZ0XCI9PT1iPzMwOi0zMCksXCJcIiwhMSwhMCxmdW5jdGlvbigpe2MuX3IyPSExO2MuX3gzKGEsXCJcIiwhMSwhMCxlKX0pfX0sX3EyOmZ1bmN0aW9uKGIsZil7aWYoIWIuaXNSZW5kZXJlZCl7dmFyIGM9Yi5jb250ZW50LGE9XCJyc01haW5TbGlkZUltYWdlXCIsXG5lLGc9bi5pc0Z1bmN0aW9uKHRoaXMuc3QuaW1hZ2VBbGlnbkNlbnRlcik/dGhpcy5zdC5pbWFnZUFsaWduQ2VudGVyKGIpOnRoaXMuc3QuaW1hZ2VBbGlnbkNlbnRlcixkPW4uaXNGdW5jdGlvbih0aGlzLnN0LmltYWdlU2NhbGVNb2RlKT90aGlzLnN0LmltYWdlU2NhbGVNb2RlKGIpOnRoaXMuc3QuaW1hZ2VTY2FsZU1vZGUsaDtiLnZpZGVvVVJMJiYoYT1cInJzVmlkZW9Db250YWluZXJcIixcImZpbGxcIiE9PWQ/ZT0hMDooaD1jLGguaGFzQ2xhc3MoYSl8fChoPWguZmluZChcIi5cIithKSksaC5jc3Moe3dpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIn0pLGE9XCJyc01haW5TbGlkZUltYWdlXCIpKTtjLmhhc0NsYXNzKGEpfHwoYz1jLmZpbmQoXCIuXCIrYSkpO2lmKGMpe3ZhciBrPWIuaVcsbD1iLmlIO2IuaXNSZW5kZXJlZD0hMDtpZihcIm5vbmVcIiE9PWR8fGcpe2E9XCJmaWxsXCIhPT1kP3RoaXMuX2Q0OjA7aD10aGlzLl9iNC0yKmE7dmFyIHE9dGhpcy5fYzQtMiphLG0scCxyPXt9O1wiZml0LWlmLXNtYWxsZXJcIj09PVxuZCYmKGs+aHx8bD5xKSYmKGQ9XCJmaXRcIik7aWYoXCJmaWxsXCI9PT1kfHxcImZpdFwiPT09ZCltPWgvayxwPXEvbCxtPVwiZmlsbFwiPT1kP20+cD9tOnA6XCJmaXRcIj09ZD9tPHA/bTpwOjEsaz1NYXRoLmNlaWwoayptLDEwKSxsPU1hdGguY2VpbChsKm0sMTApO1wibm9uZVwiIT09ZCYmKHIud2lkdGg9ayxyLmhlaWdodD1sLGUmJmMuZmluZChcIi5yc0ltZ1wiKS5jc3Moe3dpZHRoOlwiMTAwJVwiLGhlaWdodDpcIjEwMCVcIn0pKTtnJiYoci5tYXJnaW5MZWZ0PU1hdGguZmxvb3IoKGgtaykvMikrYSxyLm1hcmdpblRvcD1NYXRoLmZsb29yKChxLWwpLzIpK2EpO2MuY3NzKHIpfX19fX07bi5yc1Byb3RvPXYucHJvdG90eXBlO24uZm4ucm95YWxTbGlkZXI9ZnVuY3Rpb24oYil7dmFyIGY9YXJndW1lbnRzO3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgYz1uKHRoaXMpO2lmKFwib2JqZWN0XCIhPT10eXBlb2YgYiYmYil7aWYoKGM9Yy5kYXRhKFwicm95YWxTbGlkZXJcIikpJiZjW2JdKXJldHVybiBjW2JdLmFwcGx5KGMsXG5BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmLDEpKX1lbHNlIGMuZGF0YShcInJveWFsU2xpZGVyXCIpfHxjLmRhdGEoXCJyb3lhbFNsaWRlclwiLG5ldyB2KGMsYikpfSl9O24uZm4ucm95YWxTbGlkZXIuZGVmYXVsdHM9e3NsaWRlc1NwYWNpbmc6OCxzdGFydFNsaWRlSWQ6MCxsb29wOiExLGxvb3BSZXdpbmQ6ITEsbnVtSW1hZ2VzVG9QcmVsb2FkOjQsZmFkZWluTG9hZGVkU2xpZGU6ITAsc2xpZGVzT3JpZW50YXRpb246XCJob3Jpem9udGFsXCIsdHJhbnNpdGlvblR5cGU6XCJtb3ZlXCIsdHJhbnNpdGlvblNwZWVkOjYwMCxjb250cm9sTmF2aWdhdGlvbjpcImJ1bGxldHNcIixjb250cm9sc0luc2lkZTohMCxhcnJvd3NOYXY6ITAsYXJyb3dzTmF2QXV0b0hpZGU6ITAsbmF2aWdhdGVCeUNsaWNrOiEwLHJhbmRvbWl6ZVNsaWRlczohMSxzbGlkZXJEcmFnOiEwLHNsaWRlclRvdWNoOiEwLGtleWJvYXJkTmF2RW5hYmxlZDohMSxmYWRlSW5BZnRlckxvYWRlZDohMCxhbGxvd0NTUzM6ITAsYWxsb3dDU1MzT25XZWJraXQ6ITAsXG5hZGRBY3RpdmVDbGFzczohMSxhdXRvSGVpZ2h0OiExLGVhc2VPdXQ6XCJlYXNlT3V0U2luZVwiLGVhc2VJbk91dDpcImVhc2VJbk91dFNpbmVcIixtaW5TbGlkZU9mZnNldDoxMCxpbWFnZVNjYWxlTW9kZTpcImZpdC1pZi1zbWFsbGVyXCIsaW1hZ2VBbGlnbkNlbnRlcjohMCxpbWFnZVNjYWxlUGFkZGluZzo0LHVzZVByZWxvYWRlcjohMCxhdXRvU2NhbGVTbGlkZXI6ITEsYXV0b1NjYWxlU2xpZGVyV2lkdGg6ODAwLGF1dG9TY2FsZVNsaWRlckhlaWdodDo0MDAsYXV0b1NjYWxlSGVpZ2h0OiEwLGFycm93c05hdkhpZGVPblRvdWNoOiExLGdsb2JhbENhcHRpb246ITEsc2xpZGVzRGlmZjoyfTtuLnJzQ1NTM0Vhc2luZz17ZWFzZU91dFNpbmU6XCJjdWJpYy1iZXppZXIoMC4zOTAsIDAuNTc1LCAwLjU2NSwgMS4wMDApXCIsZWFzZUluT3V0U2luZTpcImN1YmljLWJlemllcigwLjQ0NSwgMC4wNTAsIDAuNTUwLCAwLjk1MClcIn07bi5leHRlbmQoalF1ZXJ5LmVhc2luZyx7ZWFzZUluT3V0U2luZTpmdW5jdGlvbihiLFxuZixjLGEsZSl7cmV0dXJuLWEvMiooTWF0aC5jb3MoTWF0aC5QSSpmL2UpLTEpK2N9LGVhc2VPdXRTaW5lOmZ1bmN0aW9uKGIsZixjLGEsZSl7cmV0dXJuIGEqTWF0aC5zaW4oZi9lKihNYXRoLlBJLzIpKStjfSxlYXNlT3V0Q3ViaWM6ZnVuY3Rpb24oYixmLGMsYSxlKXtyZXR1cm4gYSooKGY9Zi9lLTEpKmYqZisxKStjfX0pfSkoalF1ZXJ5LHdpbmRvdyk7XG4vLyBqcXVlcnkucnMuYnVsbGV0cyB2MS4wLjFcbihmdW5jdGlvbihjKXtjLmV4dGVuZChjLnJzUHJvdG8se19pNTpmdW5jdGlvbigpe3ZhciBhPXRoaXM7XCJidWxsZXRzXCI9PT1hLnN0LmNvbnRyb2xOYXZpZ2F0aW9uJiYoYS5ldi5vbmUoXCJyc0FmdGVyUHJvcHNTZXR1cFwiLGZ1bmN0aW9uKCl7YS5fajU9ITA7YS5zbGlkZXIuYWRkQ2xhc3MoXCJyc1dpdGhCdWxsZXRzXCIpO2Zvcih2YXIgYj0nPGRpdiBjbGFzcz1cInJzTmF2IHJzQnVsbGV0c1wiPicsZT0wO2U8YS5udW1TbGlkZXM7ZSsrKWIrPSc8ZGl2IGNsYXNzPVwicnNOYXZJdGVtIHJzQnVsbGV0XCI+PHNwYW4+PC9zcGFuPjwvZGl2Pic7YS5fazU9Yj1jKGIrXCI8L2Rpdj5cIik7YS5fbDU9Yi5hcHBlbmRUbyhhLnNsaWRlcikuY2hpbGRyZW4oKTthLl9rNS5vbihcImNsaWNrLnJzXCIsXCIucnNOYXZJdGVtXCIsZnVuY3Rpb24oYil7YS5fbTV8fGEuZ29UbyhjKHRoaXMpLmluZGV4KCkpfSl9KSxhLmV2Lm9uKFwicnNPbkFwcGVuZFNsaWRlXCIsZnVuY3Rpb24oYixjLGQpe2Q+PWEubnVtU2xpZGVzP2EuX2s1LmFwcGVuZCgnPGRpdiBjbGFzcz1cInJzTmF2SXRlbSByc0J1bGxldFwiPjxzcGFuPjwvc3Bhbj48L2Rpdj4nKTpcbmEuX2w1LmVxKGQpLmJlZm9yZSgnPGRpdiBjbGFzcz1cInJzTmF2SXRlbSByc0J1bGxldFwiPjxzcGFuPjwvc3Bhbj48L2Rpdj4nKTthLl9sNT1hLl9rNS5jaGlsZHJlbigpfSksYS5ldi5vbihcInJzT25SZW1vdmVTbGlkZVwiLGZ1bmN0aW9uKGIsYyl7dmFyIGQ9YS5fbDUuZXEoYyk7ZCYmZC5sZW5ndGgmJihkLnJlbW92ZSgpLGEuX2w1PWEuX2s1LmNoaWxkcmVuKCkpfSksYS5ldi5vbihcInJzT25VcGRhdGVOYXZcIixmdW5jdGlvbigpe3ZhciBiPWEuY3VyclNsaWRlSWQ7YS5fbjUmJmEuX241LnJlbW92ZUNsYXNzKFwicnNOYXZTZWxlY3RlZFwiKTtiPWEuX2w1LmVxKGIpO2IuYWRkQ2xhc3MoXCJyc05hdlNlbGVjdGVkXCIpO2EuX241PWJ9KSl9fSk7Yy5yc01vZHVsZXMuYnVsbGV0cz1jLnJzUHJvdG8uX2k1fSkoalF1ZXJ5KTtcbi8vIGpxdWVyeS5ycy5hdXRvcGxheSB2MS4wLjVcbihmdW5jdGlvbihiKXtiLmV4dGVuZChiLnJzUHJvdG8se194NDpmdW5jdGlvbigpe3ZhciBhPXRoaXMsZDthLl95ND17ZW5hYmxlZDohMSxzdG9wQXRBY3Rpb246ITAscGF1c2VPbkhvdmVyOiEwLGRlbGF5OjJFM307IWEuc3QuYXV0b1BsYXkmJmEuc3QuYXV0b3BsYXkmJihhLnN0LmF1dG9QbGF5PWEuc3QuYXV0b3BsYXkpO2Euc3QuYXV0b1BsYXk9Yi5leHRlbmQoe30sYS5feTQsYS5zdC5hdXRvUGxheSk7YS5zdC5hdXRvUGxheS5lbmFibGVkJiYoYS5ldi5vbihcInJzQmVmb3JlUGFyc2VOb2RlXCIsZnVuY3Rpb24oYSxjLGYpe2M9YihjKTtpZihkPWMuYXR0cihcImRhdGEtcnNEZWxheVwiKSlmLmN1c3RvbURlbGF5PXBhcnNlSW50KGQsMTApfSksYS5ldi5vbmUoXCJyc0FmdGVySW5pdFwiLGZ1bmN0aW9uKCl7YS5fejQoKX0pLGEuZXYub24oXCJyc0JlZm9yZURlc3Ryb3lcIixmdW5jdGlvbigpe2Euc3RvcEF1dG9QbGF5KCk7YS5zbGlkZXIub2ZmKFwibW91c2VlbnRlciBtb3VzZWxlYXZlXCIpO2Iod2luZG93KS5vZmYoXCJibHVyXCIrXG5hLm5zK1wiIGZvY3VzXCIrYS5ucyl9KSl9LF96NDpmdW5jdGlvbigpe3ZhciBhPXRoaXM7YS5zdGFydEF1dG9QbGF5KCk7YS5ldi5vbihcInJzQWZ0ZXJDb250ZW50U2V0XCIsZnVuY3Rpb24oYixlKXthLl9sMnx8YS5fcjJ8fCFhLl9hNXx8ZSE9PWEuY3VyclNsaWRlfHxhLl9iNSgpfSk7YS5ldi5vbihcInJzRHJhZ1JlbGVhc2VcIixmdW5jdGlvbigpe2EuX2E1JiZhLl9jNSYmKGEuX2M1PSExLGEuX2I1KCkpfSk7YS5ldi5vbihcInJzQWZ0ZXJTbGlkZUNoYW5nZVwiLGZ1bmN0aW9uKCl7YS5fYTUmJmEuX2M1JiYoYS5fYzU9ITEsYS5jdXJyU2xpZGUuaXNMb2FkZWQmJmEuX2I1KCkpfSk7YS5ldi5vbihcInJzRHJhZ1N0YXJ0XCIsZnVuY3Rpb24oKXthLl9hNSYmKGEuc3QuYXV0b1BsYXkuc3RvcEF0QWN0aW9uP2Euc3RvcEF1dG9QbGF5KCk6KGEuX2M1PSEwLGEuX2Q1KCkpKX0pO2EuZXYub24oXCJyc0JlZm9yZU1vdmVcIixmdW5jdGlvbihiLGUsYyl7YS5fYTUmJihjJiZhLnN0LmF1dG9QbGF5LnN0b3BBdEFjdGlvbj9cbmEuc3RvcEF1dG9QbGF5KCk6KGEuX2M1PSEwLGEuX2Q1KCkpKX0pO2EuX2U1PSExO2EuZXYub24oXCJyc1ZpZGVvU3RvcFwiLGZ1bmN0aW9uKCl7YS5fYTUmJihhLl9lNT0hMSxhLl9iNSgpKX0pO2EuZXYub24oXCJyc1ZpZGVvUGxheVwiLGZ1bmN0aW9uKCl7YS5fYTUmJihhLl9jNT0hMSxhLl9kNSgpLGEuX2U1PSEwKX0pO2Iod2luZG93KS5vbihcImJsdXJcIithLm5zLGZ1bmN0aW9uKCl7YS5fYTUmJihhLl9jNT0hMCxhLl9kNSgpKX0pLm9uKFwiZm9jdXNcIithLm5zLGZ1bmN0aW9uKCl7YS5fYTUmJmEuX2M1JiYoYS5fYzU9ITEsYS5fYjUoKSl9KTthLnN0LmF1dG9QbGF5LnBhdXNlT25Ib3ZlciYmKGEuX2Y1PSExLGEuc2xpZGVyLmhvdmVyKGZ1bmN0aW9uKCl7YS5fYTUmJihhLl9jNT0hMSxhLl9kNSgpLGEuX2Y1PSEwKX0sZnVuY3Rpb24oKXthLl9hNSYmKGEuX2Y1PSExLGEuX2I1KCkpfSkpfSx0b2dnbGVBdXRvUGxheTpmdW5jdGlvbigpe3RoaXMuX2E1P3RoaXMuc3RvcEF1dG9QbGF5KCk6XG50aGlzLnN0YXJ0QXV0b1BsYXkoKX0sc3RhcnRBdXRvUGxheTpmdW5jdGlvbigpe3RoaXMuX2E1PSEwO3RoaXMuY3VyclNsaWRlLmlzTG9hZGVkJiZ0aGlzLl9iNSgpfSxzdG9wQXV0b1BsYXk6ZnVuY3Rpb24oKXt0aGlzLl9lNT10aGlzLl9mNT10aGlzLl9jNT10aGlzLl9hNT0hMTt0aGlzLl9kNSgpfSxfYjU6ZnVuY3Rpb24oKXt2YXIgYT10aGlzO2EuX2Y1fHxhLl9lNXx8KGEuX2c1PSEwLGEuX2g1JiZjbGVhclRpbWVvdXQoYS5faDUpLGEuX2g1PXNldFRpbWVvdXQoZnVuY3Rpb24oKXt2YXIgYjthLl96fHxhLnN0Lmxvb3BSZXdpbmR8fChiPSEwLGEuc3QubG9vcFJld2luZD0hMCk7YS5uZXh0KCEwKTtiJiYoYS5zdC5sb29wUmV3aW5kPSExKX0sYS5jdXJyU2xpZGUuY3VzdG9tRGVsYXk/YS5jdXJyU2xpZGUuY3VzdG9tRGVsYXk6YS5zdC5hdXRvUGxheS5kZWxheSkpfSxfZDU6ZnVuY3Rpb24oKXt0aGlzLl9mNXx8dGhpcy5fZTV8fCh0aGlzLl9nNT0hMSx0aGlzLl9oNSYmKGNsZWFyVGltZW91dCh0aGlzLl9oNSksXG50aGlzLl9oNT1udWxsKSl9fSk7Yi5yc01vZHVsZXMuYXV0b3BsYXk9Yi5yc1Byb3RvLl94NH0pKGpRdWVyeSk7XG4vLyBqcXVlcnkucnMuYXV0by1oZWlnaHQgdjEuMC4zXG4oZnVuY3Rpb24oYil7Yi5leHRlbmQoYi5yc1Byb3RvLHtfdzQ6ZnVuY3Rpb24oKXt2YXIgYT10aGlzO2lmKGEuc3QuYXV0b0hlaWdodCl7dmFyIGIsYyxlLGY9ITAsZD1mdW5jdGlvbihkKXtlPWEuc2xpZGVzW2EuY3VyclNsaWRlSWRdOyhiPWUuaG9sZGVyKSYmKGM9Yi5oZWlnaHQoKSkmJnZvaWQgMCE9PWMmJmM+KGEuc3QubWluQXV0b0hlaWdodHx8MzApJiYoYS5fYzQ9YyxhLl9lfHwhZD9hLl9lMS5jc3MoXCJoZWlnaHRcIixjKTphLl9lMS5zdG9wKCEwLCEwKS5hbmltYXRlKHtoZWlnaHQ6Y30sYS5zdC50cmFuc2l0aW9uU3BlZWQpLGEuZXYudHJpZ2dlcihcInJzQXV0b0hlaWdodENoYW5nZVwiLGMpLGYmJihhLl9lJiZzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5fZTEuY3NzKGEuX2crXCJ0cmFuc2l0aW9uXCIsXCJoZWlnaHQgXCIrYS5zdC50cmFuc2l0aW9uU3BlZWQrXCJtcyBlYXNlLWluLW91dFwiKX0sMTYpLGY9ITEpKX07YS5ldi5vbihcInJzTWF5YmVTaXplUmVhZHkucnNBdXRvSGVpZ2h0XCIsXG5mdW5jdGlvbihhLGIpe2U9PT1iJiZkKCl9KTthLmV2Lm9uKFwicnNBZnRlckNvbnRlbnRTZXQucnNBdXRvSGVpZ2h0XCIsZnVuY3Rpb24oYSxiKXtlPT09YiYmZCgpfSk7YS5zbGlkZXIuYWRkQ2xhc3MoXCJyc0F1dG9IZWlnaHRcIik7YS5ldi5vbmUoXCJyc0FmdGVySW5pdFwiLGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe2QoITEpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXthLnNsaWRlci5hcHBlbmQoJzxkaXYgc3R5bGU9XCJjbGVhcjpib3RoOyBmbG9hdDogbm9uZTtcIj48L2Rpdj4nKX0sMTYpfSwxNil9KTthLmV2Lm9uKFwicnNCZWZvcmVBbmltU3RhcnRcIixmdW5jdGlvbigpe2QoITApfSk7YS5ldi5vbihcInJzQmVmb3JlU2l6ZVNldFwiLGZ1bmN0aW9uKCl7c2V0VGltZW91dChmdW5jdGlvbigpe2QoITEpfSwxNil9KX19fSk7Yi5yc01vZHVsZXMuYXV0b0hlaWdodD1iLnJzUHJvdG8uX3c0fSkoalF1ZXJ5KTtcbi8vIGpxdWVyeS5ycy5hY3RpdmUtY2xhc3MgdjEuMC4xXG4oZnVuY3Rpb24oYyl7Yy5yc1Byb3RvLl9vND1mdW5jdGlvbigpe3ZhciBiLGE9dGhpcztpZihhLnN0LmFkZEFjdGl2ZUNsYXNzKWEuZXYub24oXCJyc09uVXBkYXRlTmF2XCIsZnVuY3Rpb24oKXtiJiZjbGVhclRpbWVvdXQoYik7Yj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5fZzQmJmEuX2c0LnJlbW92ZUNsYXNzKFwicnNBY3RpdmVTbGlkZVwiKTthLl9yMSYmYS5fcjEuYWRkQ2xhc3MoXCJyc0FjdGl2ZVNsaWRlXCIpO2I9bnVsbH0sNTApfSl9O2MucnNNb2R1bGVzLmFjdGl2ZUNsYXNzPWMucnNQcm90by5fbzR9KShqUXVlcnkpO1xuLy8ganF1ZXJ5LnJzLnZpc2libGUtbmVhcmJ5IHYxLjAuMlxuKGZ1bmN0aW9uKGQpe2QucnNQcm90by5fZzc9ZnVuY3Rpb24oKXt2YXIgYT10aGlzO2Euc3QudmlzaWJsZU5lYXJieSYmYS5zdC52aXNpYmxlTmVhcmJ5LmVuYWJsZWQmJihhLl9oNz17ZW5hYmxlZDohMCxjZW50ZXJBcmVhOi42LGNlbnRlcjohMCxicmVha3BvaW50OjAsYnJlYWtwb2ludENlbnRlckFyZWE6LjgsaGlkZGVuT3ZlcmZsb3c6ITAsbmF2aWdhdGVCeUNlbnRlckNsaWNrOiExfSxhLnN0LnZpc2libGVOZWFyYnk9ZC5leHRlbmQoe30sYS5faDcsYS5zdC52aXNpYmxlTmVhcmJ5KSxhLmV2Lm9uZShcInJzQWZ0ZXJQcm9wc1NldHVwXCIsZnVuY3Rpb24oKXthLl9pNz1hLl9lMS5jc3MoXCJvdmVyZmxvd1wiLFwidmlzaWJsZVwiKS53cmFwKCc8ZGl2IGNsYXNzPVwicnNWaXNpYmxlTmVhcmJ5V3JhcFwiPjwvZGl2PicpLnBhcmVudCgpO2Euc3QudmlzaWJsZU5lYXJieS5oaWRkZW5PdmVyZmxvd3x8YS5faTcuY3NzKFwib3ZlcmZsb3dcIixcInZpc2libGVcIik7YS5fbzE9YS5zdC5jb250cm9sc0luc2lkZT9cbmEuX2k3OmEuc2xpZGVyfSksYS5ldi5vbihcInJzQWZ0ZXJTaXplUHJvcFNldFwiLGZ1bmN0aW9uKCl7dmFyIGIsYz1hLnN0LnZpc2libGVOZWFyYnk7Yj1jLmJyZWFrcG9pbnQmJmEud2lkdGg8Yy5icmVha3BvaW50P2MuYnJlYWtwb2ludENlbnRlckFyZWE6Yy5jZW50ZXJBcmVhO2EuX2g/KGEuX2I0Kj1iLGEuX2k3LmNzcyh7aGVpZ2h0OmEuX2M0LHdpZHRoOmEuX2I0L2J9KSxhLl9kPWEuX2I0KigxLWIpLzIvYik6KGEuX2M0Kj1iLGEuX2k3LmNzcyh7aGVpZ2h0OmEuX2M0L2Isd2lkdGg6YS5fYjR9KSxhLl9kPWEuX2M0KigxLWIpLzIvYik7Yy5uYXZpZ2F0ZUJ5Q2VudGVyQ2xpY2t8fChhLl9xPWEuX2g/YS5fYjQ6YS5fYzQpO2MuY2VudGVyJiZhLl9lMS5jc3MoXCJtYXJnaW4tXCIrKGEuX2g/XCJsZWZ0XCI6XCJ0b3BcIiksYS5fZCl9KSl9O2QucnNNb2R1bGVzLnZpc2libGVOZWFyYnk9ZC5yc1Byb3RvLl9nN30pKGpRdWVyeSk7XG4iLCIvKiFcbiAqIHNrcm9sbHIgY29yZVxuICpcbiAqIEFsZXhhbmRlciBQcmluemhvcm4gLSBodHRwczovL2dpdGh1Yi5jb20vUHJpbnpob3JuL3Nrcm9sbHJcbiAqXG4gKiBGcmVlIHRvIHVzZSB1bmRlciB0ZXJtcyBvZiBNSVQgbGljZW5zZVxuICovXG5cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8qXG5cdCAqIEdsb2JhbCBhcGkuXG5cdCAqL1xuXHR2YXIgc2tyb2xsciA9IHtcblx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIF9pbnN0YW5jZTtcblx0XHR9LFxuXHRcdC8vTWFpbiBlbnRyeSBwb2ludC5cblx0XHRpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gX2luc3RhbmNlIHx8IG5ldyBTa3JvbGxyKG9wdGlvbnMpO1xuXHRcdH0sXG5cdFx0VkVSU0lPTjogJzAuNi4yOSdcblx0fTtcblxuXHQvL01pbmlmeSBvcHRpbWl6YXRpb24uXG5cdHZhciBoYXNQcm9wID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblx0dmFyIE1hdGggPSB3aW5kb3cuTWF0aDtcblx0dmFyIGdldFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGU7XG5cblx0Ly9UaGV5IHdpbGwgYmUgZmlsbGVkIHdoZW4gc2tyb2xsciBnZXRzIGluaXRpYWxpemVkLlxuXHR2YXIgZG9jdW1lbnRFbGVtZW50O1xuXHR2YXIgYm9keTtcblxuXHR2YXIgRVZFTlRfVE9VQ0hTVEFSVCA9ICd0b3VjaHN0YXJ0Jztcblx0dmFyIEVWRU5UX1RPVUNITU9WRSA9ICd0b3VjaG1vdmUnO1xuXHR2YXIgRVZFTlRfVE9VQ0hDQU5DRUwgPSAndG91Y2hjYW5jZWwnO1xuXHR2YXIgRVZFTlRfVE9VQ0hFTkQgPSAndG91Y2hlbmQnO1xuXG5cdHZhciBTS1JPTExBQkxFX0NMQVNTID0gJ3Nrcm9sbGFibGUnO1xuXHR2YXIgU0tST0xMQUJMRV9CRUZPUkVfQ0xBU1MgPSBTS1JPTExBQkxFX0NMQVNTICsgJy1iZWZvcmUnO1xuXHR2YXIgU0tST0xMQUJMRV9CRVRXRUVOX0NMQVNTID0gU0tST0xMQUJMRV9DTEFTUyArICctYmV0d2Vlbic7XG5cdHZhciBTS1JPTExBQkxFX0FGVEVSX0NMQVNTID0gU0tST0xMQUJMRV9DTEFTUyArICctYWZ0ZXInO1xuXG5cdHZhciBTS1JPTExSX0NMQVNTID0gJ3Nrcm9sbHInO1xuXHR2YXIgTk9fU0tST0xMUl9DTEFTUyA9ICduby0nICsgU0tST0xMUl9DTEFTUztcblx0dmFyIFNLUk9MTFJfREVTS1RPUF9DTEFTUyA9IFNLUk9MTFJfQ0xBU1MgKyAnLWRlc2t0b3AnO1xuXHR2YXIgU0tST0xMUl9NT0JJTEVfQ0xBU1MgPSBTS1JPTExSX0NMQVNTICsgJy1tb2JpbGUnO1xuXG5cdHZhciBERUZBVUxUX0VBU0lORyA9ICdsaW5lYXInO1xuXHR2YXIgREVGQVVMVF9EVVJBVElPTiA9IDEwMDA7Ly9tc1xuXHR2YXIgREVGQVVMVF9NT0JJTEVfREVDRUxFUkFUSU9OID0gMC4wMDQ7Ly9waXhlbC9tc8OCwrJcblxuXHR2YXIgREVGQVVMVF9TS1JPTExSQk9EWSA9ICdza3JvbGxyLWJvZHknO1xuXG5cdHZhciBERUZBVUxUX1NNT09USF9TQ1JPTExJTkdfRFVSQVRJT04gPSAyMDA7Ly9tc1xuXG5cdHZhciBBTkNIT1JfU1RBUlQgPSAnc3RhcnQnO1xuXHR2YXIgQU5DSE9SX0VORCA9ICdlbmQnO1xuXHR2YXIgQU5DSE9SX0NFTlRFUiA9ICdjZW50ZXInO1xuXHR2YXIgQU5DSE9SX0JPVFRPTSA9ICdib3R0b20nO1xuXG5cdC8vVGhlIHByb3BlcnR5IHdoaWNoIHdpbGwgYmUgYWRkZWQgdG8gdGhlIERPTSBlbGVtZW50IHRvIGhvbGQgdGhlIElEIG9mIHRoZSBza3JvbGxhYmxlLlxuXHR2YXIgU0tST0xMQUJMRV9JRF9ET01fUFJPUEVSVFkgPSAnX19fc2tyb2xsYWJsZV9pZCc7XG5cblx0dmFyIHJ4VG91Y2hJZ25vcmVUYWdzID0gL14oPzppbnB1dHx0ZXh0YXJlYXxidXR0b258c2VsZWN0KSQvaTtcblxuXHR2YXIgcnhUcmltID0gL15cXHMrfFxccyskL2c7XG5cblx0Ly9GaW5kIGFsbCBkYXRhLWF0dHJpYnV0ZXMuIGRhdGEtW19jb25zdGFudF0tW29mZnNldF0tW2FuY2hvcl0tW2FuY2hvcl0uXG5cdHZhciByeEtleWZyYW1lQXR0cmlidXRlID0gL15kYXRhKD86LShfXFx3KykpPyg/Oi0/KC0/XFxkKlxcLj9cXGQrcD8pKT8oPzotPyhzdGFydHxlbmR8dG9wfGNlbnRlcnxib3R0b20pKT8oPzotPyh0b3B8Y2VudGVyfGJvdHRvbSkpPyQvO1xuXG5cdHZhciByeFByb3BWYWx1ZSA9IC9cXHMqKEA/W1xcd1xcLVxcW1xcXV0rKVxccyo6XFxzKiguKz8pXFxzKig/Ojt8JCkvZ2k7XG5cblx0Ly9FYXNpbmcgZnVuY3Rpb24gbmFtZXMgZm9sbG93IHRoZSBwcm9wZXJ0eSBpbiBzcXVhcmUgYnJhY2tldHMuXG5cdHZhciByeFByb3BFYXNpbmcgPSAvXihAP1thLXpcXC1dKylcXFsoXFx3KylcXF0kLztcblxuXHR2YXIgcnhDYW1lbENhc2UgPSAvLShbYS16MC05X10pL2c7XG5cdHZhciByeENhbWVsQ2FzZUZuID0gZnVuY3Rpb24oc3RyLCBsZXR0ZXIpIHtcblx0XHRyZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKCk7XG5cdH07XG5cblx0Ly9OdW1lcmljIHZhbHVlcyB3aXRoIG9wdGlvbmFsIHNpZ24uXG5cdHZhciByeE51bWVyaWNWYWx1ZSA9IC9bXFwtK10/W1xcZF0qXFwuP1tcXGRdKy9nO1xuXG5cdC8vVXNlZCB0byByZXBsYWNlIG9jY3VyZW5jZXMgb2Ygez99IHdpdGggYSBudW1iZXIuXG5cdHZhciByeEludGVycG9sYXRlU3RyaW5nID0gL1xce1xcP1xcfS9nO1xuXG5cdC8vRmluZHMgcmdiKGEpIGNvbG9ycywgd2hpY2ggZG9uJ3QgdXNlIHRoZSBwZXJjZW50YWdlIG5vdGF0aW9uLlxuXHR2YXIgcnhSR0JBSW50ZWdlckNvbG9yID0gL3JnYmE/XFwoXFxzKi0/XFxkK1xccyosXFxzKi0/XFxkK1xccyosXFxzKi0/XFxkKy9nO1xuXG5cdC8vRmluZHMgYWxsIGdyYWRpZW50cy5cblx0dmFyIHJ4R3JhZGllbnQgPSAvW2EtelxcLV0rLWdyYWRpZW50L2c7XG5cblx0Ly9WZW5kb3IgcHJlZml4LiBXaWxsIGJlIHNldCBvbmNlIHNrcm9sbHIgZ2V0cyBpbml0aWFsaXplZC5cblx0dmFyIHRoZUNTU1ByZWZpeCA9ICcnO1xuXHR2YXIgdGhlRGFzaGVkQ1NTUHJlZml4ID0gJyc7XG5cblx0Ly9XaWxsIGJlIGNhbGxlZCBvbmNlICh3aGVuIHNrcm9sbHIgZ2V0cyBpbml0aWFsaXplZCkuXG5cdHZhciBkZXRlY3RDU1NQcmVmaXggPSBmdW5jdGlvbigpIHtcblx0XHQvL09ubHkgcmVsZXZhbnQgcHJlZml4ZXMuIE1heSBiZSBleHRlbmRlZC5cblx0XHQvL0NvdWxkIGJlIGRhbmdlcm91cyBpZiB0aGVyZSB3aWxsIGV2ZXIgYmUgYSBDU1MgcHJvcGVydHkgd2hpY2ggYWN0dWFsbHkgc3RhcnRzIHdpdGggXCJtc1wiLiBEb24ndCBob3BlIHNvLlxuXHRcdHZhciByeFByZWZpeGVzID0gL14oPzpPfE1venx3ZWJraXR8bXMpfCg/Oi0oPzpvfG1venx3ZWJraXR8bXMpLSkvO1xuXG5cdFx0Ly9EZXRlY3QgcHJlZml4IGZvciBjdXJyZW50IGJyb3dzZXIgYnkgZmluZGluZyB0aGUgZmlyc3QgcHJvcGVydHkgdXNpbmcgYSBwcmVmaXguXG5cdFx0aWYoIWdldFN0eWxlKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIHN0eWxlID0gZ2V0U3R5bGUoYm9keSwgbnVsbCk7XG5cblx0XHRmb3IodmFyIGsgaW4gc3R5bGUpIHtcblx0XHRcdC8vV2UgY2hlY2sgdGhlIGtleSBhbmQgaWYgdGhlIGtleSBpcyBhIG51bWJlciwgd2UgY2hlY2sgdGhlIHZhbHVlIGFzIHdlbGwsIGJlY2F1c2Ugc2FmYXJpJ3MgZ2V0Q29tcHV0ZWRTdHlsZSByZXR1cm5zIHNvbWUgd2VpcmQgYXJyYXktbGlrZSB0aGluZ3kuXG5cdFx0XHR0aGVDU1NQcmVmaXggPSAoay5tYXRjaChyeFByZWZpeGVzKSB8fCAoK2sgPT0gayAmJiBzdHlsZVtrXS5tYXRjaChyeFByZWZpeGVzKSkpO1xuXG5cdFx0XHRpZih0aGVDU1NQcmVmaXgpIHtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9EaWQgd2UgZXZlbiBkZXRlY3QgYSBwcmVmaXg/XG5cdFx0aWYoIXRoZUNTU1ByZWZpeCkge1xuXHRcdFx0dGhlQ1NTUHJlZml4ID0gdGhlRGFzaGVkQ1NTUHJlZml4ID0gJyc7XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGVDU1NQcmVmaXggPSB0aGVDU1NQcmVmaXhbMF07XG5cblx0XHQvL1dlIGNvdWxkIGhhdmUgZGV0ZWN0ZWQgZWl0aGVyIGEgZGFzaGVkIHByZWZpeCBvciB0aGlzIGNhbWVsQ2FzZWlzaC1pbmNvbnNpc3RlbnQgc3R1ZmYuXG5cdFx0aWYodGhlQ1NTUHJlZml4LnNsaWNlKDAsMSkgPT09ICctJykge1xuXHRcdFx0dGhlRGFzaGVkQ1NTUHJlZml4ID0gdGhlQ1NTUHJlZml4O1xuXG5cdFx0XHQvL1RoZXJlJ3Mgbm8gbG9naWMgYmVoaW5kIHRoZXNlLiBOZWVkIGEgbG9vayB1cC5cblx0XHRcdHRoZUNTU1ByZWZpeCA9ICh7XG5cdFx0XHRcdCctd2Via2l0LSc6ICd3ZWJraXQnLFxuXHRcdFx0XHQnLW1vei0nOiAnTW96Jyxcblx0XHRcdFx0Jy1tcy0nOiAnbXMnLFxuXHRcdFx0XHQnLW8tJzogJ08nXG5cdFx0XHR9KVt0aGVDU1NQcmVmaXhdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGVEYXNoZWRDU1NQcmVmaXggPSAnLScgKyB0aGVDU1NQcmVmaXgudG9Mb3dlckNhc2UoKSArICctJztcblx0XHR9XG5cdH07XG5cblx0dmFyIHBvbHlmaWxsUkFGID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHJlcXVlc3RBbmltRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvd1t0aGVDU1NQcmVmaXgudG9Mb3dlckNhc2UoKSArICdSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcblxuXHRcdHZhciBsYXN0VGltZSA9IF9ub3coKTtcblxuXHRcdGlmKF9pc01vYmlsZSB8fCAhcmVxdWVzdEFuaW1GcmFtZSkge1xuXHRcdFx0cmVxdWVzdEFuaW1GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHRcdC8vSG93IGxvbmcgZGlkIGl0IHRha2UgdG8gcmVuZGVyP1xuXHRcdFx0XHR2YXIgZGVsdGFUaW1lID0gX25vdygpIC0gbGFzdFRpbWU7XG5cdFx0XHRcdHZhciBkZWxheSA9IE1hdGgubWF4KDAsIDEwMDAgLyA2MCAtIGRlbHRhVGltZSk7XG5cblx0XHRcdFx0cmV0dXJuIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGxhc3RUaW1lID0gX25vdygpO1xuXHRcdFx0XHRcdGNhbGxiYWNrKCk7XG5cdFx0XHRcdH0sIGRlbGF5KTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlcXVlc3RBbmltRnJhbWU7XG5cdH07XG5cblx0dmFyIHBvbHlmaWxsQ0FGID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNhbmNlbEFuaW1GcmFtZSA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSB8fCB3aW5kb3dbdGhlQ1NTUHJlZml4LnRvTG93ZXJDYXNlKCkgKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXTtcblxuXHRcdGlmKF9pc01vYmlsZSB8fCAhY2FuY2VsQW5pbUZyYW1lKSB7XG5cdFx0XHRjYW5jZWxBbmltRnJhbWUgPSBmdW5jdGlvbih0aW1lb3V0KSB7XG5cdFx0XHRcdHJldHVybiB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2FuY2VsQW5pbUZyYW1lO1xuXHR9O1xuXG5cdC8vQnVpbHQtaW4gZWFzaW5nIGZ1bmN0aW9ucy5cblx0dmFyIGVhc2luZ3MgPSB7XG5cdFx0YmVnaW46IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIDA7XG5cdFx0fSxcblx0XHRlbmQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fSxcblx0XHRsaW5lYXI6IGZ1bmN0aW9uKHApIHtcblx0XHRcdHJldHVybiBwO1xuXHRcdH0sXG5cdFx0cXVhZHJhdGljOiBmdW5jdGlvbihwKSB7XG5cdFx0XHRyZXR1cm4gcCAqIHA7XG5cdFx0fSxcblx0XHRjdWJpYzogZnVuY3Rpb24ocCkge1xuXHRcdFx0cmV0dXJuIHAgKiBwICogcDtcblx0XHR9LFxuXHRcdHN3aW5nOiBmdW5jdGlvbihwKSB7XG5cdFx0XHRyZXR1cm4gKC1NYXRoLmNvcyhwICogTWF0aC5QSSkgLyAyKSArIDAuNTtcblx0XHR9LFxuXHRcdHNxcnQ6IGZ1bmN0aW9uKHApIHtcblx0XHRcdHJldHVybiBNYXRoLnNxcnQocCk7XG5cdFx0fSxcblx0XHRvdXRDdWJpYzogZnVuY3Rpb24ocCkge1xuXHRcdFx0cmV0dXJuIChNYXRoLnBvdygocCAtIDEpLCAzKSArIDEpO1xuXHRcdH0sXG5cdFx0Ly9zZWUgaHR0cHM6Ly93d3cuZGVzbW9zLmNvbS9jYWxjdWxhdG9yL3RicjIwczh2ZDIgZm9yIGhvdyBJIGRpZCB0aGlzXG5cdFx0Ym91bmNlOiBmdW5jdGlvbihwKSB7XG5cdFx0XHR2YXIgYTtcblxuXHRcdFx0aWYocCA8PSAwLjUwODMpIHtcblx0XHRcdFx0YSA9IDM7XG5cdFx0XHR9IGVsc2UgaWYocCA8PSAwLjg0ODkpIHtcblx0XHRcdFx0YSA9IDk7XG5cdFx0XHR9IGVsc2UgaWYocCA8PSAwLjk2MjA4KSB7XG5cdFx0XHRcdGEgPSAyNztcblx0XHRcdH0gZWxzZSBpZihwIDw9IDAuOTk5ODEpIHtcblx0XHRcdFx0YSA9IDkxO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAxIC0gTWF0aC5hYnMoMyAqIE1hdGguY29zKHAgKiBhICogMS4wMjgpIC8gYSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci5cblx0ICovXG5cdGZ1bmN0aW9uIFNrcm9sbHIob3B0aW9ucykge1xuXHRcdGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblx0XHRib2R5ID0gZG9jdW1lbnQuYm9keTtcblxuXHRcdGRldGVjdENTU1ByZWZpeCgpO1xuXG5cdFx0X2luc3RhbmNlID0gdGhpcztcblxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0X2NvbnN0YW50cyA9IG9wdGlvbnMuY29uc3RhbnRzIHx8IHt9O1xuXG5cdFx0Ly9XZSBhbGxvdyBkZWZpbmluZyBjdXN0b20gZWFzaW5ncyBvciBvdmVyd3JpdGUgZXhpc3RpbmcuXG5cdFx0aWYob3B0aW9ucy5lYXNpbmcpIHtcblx0XHRcdGZvcih2YXIgZSBpbiBvcHRpb25zLmVhc2luZykge1xuXHRcdFx0XHRlYXNpbmdzW2VdID0gb3B0aW9ucy5lYXNpbmdbZV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2VkZ2VTdHJhdGVneSA9IG9wdGlvbnMuZWRnZVN0cmF0ZWd5IHx8ICdzZXQnO1xuXG5cdFx0X2xpc3RlbmVycyA9IHtcblx0XHRcdC8vRnVuY3Rpb24gdG8gYmUgY2FsbGVkIHJpZ2h0IGJlZm9yZSByZW5kZXJpbmcuXG5cdFx0XHRiZWZvcmVyZW5kZXI6IG9wdGlvbnMuYmVmb3JlcmVuZGVyLFxuXG5cdFx0XHQvL0Z1bmN0aW9uIHRvIGJlIGNhbGxlZCByaWdodCBhZnRlciBmaW5pc2hpbmcgcmVuZGVyaW5nLlxuXHRcdFx0cmVuZGVyOiBvcHRpb25zLnJlbmRlcixcblxuXHRcdFx0Ly9GdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbmV2ZXIgYW4gZWxlbWVudCB3aXRoIHRoZSBgZGF0YS1lbWl0LWV2ZW50c2AgYXR0cmlidXRlIHBhc3NlcyBhIGtleWZyYW1lLlxuXHRcdFx0a2V5ZnJhbWU6IG9wdGlvbnMua2V5ZnJhbWVcblx0XHR9O1xuXG5cdFx0Ly9mb3JjZUhlaWdodCBpcyB0cnVlIGJ5IGRlZmF1bHRcblx0XHRfZm9yY2VIZWlnaHQgPSBvcHRpb25zLmZvcmNlSGVpZ2h0ICE9PSBmYWxzZTtcblxuXHRcdGlmKF9mb3JjZUhlaWdodCkge1xuXHRcdFx0X3NjYWxlID0gb3B0aW9ucy5zY2FsZSB8fCAxO1xuXHRcdH1cblxuXHRcdF9tb2JpbGVEZWNlbGVyYXRpb24gPSBvcHRpb25zLm1vYmlsZURlY2VsZXJhdGlvbiB8fCBERUZBVUxUX01PQklMRV9ERUNFTEVSQVRJT047XG5cblx0XHRfc21vb3RoU2Nyb2xsaW5nRW5hYmxlZCA9IG9wdGlvbnMuc21vb3RoU2Nyb2xsaW5nICE9PSBmYWxzZTtcblx0XHRfc21vb3RoU2Nyb2xsaW5nRHVyYXRpb24gPSBvcHRpb25zLnNtb290aFNjcm9sbGluZ0R1cmF0aW9uIHx8IERFRkFVTFRfU01PT1RIX1NDUk9MTElOR19EVVJBVElPTjtcblxuXHRcdC8vRHVtbXkgb2JqZWN0LiBXaWxsIGJlIG92ZXJ3cml0dGVuIGluIHRoZSBfcmVuZGVyIG1ldGhvZCB3aGVuIHNtb290aCBzY3JvbGxpbmcgaXMgY2FsY3VsYXRlZC5cblx0XHRfc21vb3RoU2Nyb2xsaW5nID0ge1xuXHRcdFx0dGFyZ2V0VG9wOiBfaW5zdGFuY2UuZ2V0U2Nyb2xsVG9wKClcblx0XHR9O1xuXG5cdFx0Ly9BIGN1c3RvbSBjaGVjayBmdW5jdGlvbiBtYXkgYmUgcGFzc2VkLlxuXHRcdF9pc01vYmlsZSA9ICgob3B0aW9ucy5tb2JpbGVDaGVjayB8fCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAoL0FuZHJvaWR8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5L2kpLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCB8fCBuYXZpZ2F0b3IudmVuZG9yIHx8IHdpbmRvdy5vcGVyYSk7XG5cdFx0fSkoKSk7XG5cblx0XHRpZihfaXNNb2JpbGUpIHtcblx0XHRcdF9za3JvbGxyQm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9wdGlvbnMuc2tyb2xsckJvZHkgfHwgREVGQVVMVF9TS1JPTExSQk9EWSk7XG5cblx0XHRcdC8vRGV0ZWN0IDNkIHRyYW5zZm9ybSBpZiB0aGVyZSdzIGEgc2tyb2xsci1ib2R5IChvbmx5IG5lZWRlZCBmb3IgI3Nrcm9sbHItYm9keSkuXG5cdFx0XHRpZihfc2tyb2xsckJvZHkpIHtcblx0XHRcdFx0X2RldGVjdDNEVHJhbnNmb3JtcygpO1xuXHRcdFx0fVxuXG5cdFx0XHRfaW5pdE1vYmlsZSgpO1xuXHRcdFx0X3VwZGF0ZUNsYXNzKGRvY3VtZW50RWxlbWVudCwgW1NLUk9MTFJfQ0xBU1MsIFNLUk9MTFJfTU9CSUxFX0NMQVNTXSwgW05PX1NLUk9MTFJfQ0xBU1NdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0X3VwZGF0ZUNsYXNzKGRvY3VtZW50RWxlbWVudCwgW1NLUk9MTFJfQ0xBU1MsIFNLUk9MTFJfREVTS1RPUF9DTEFTU10sIFtOT19TS1JPTExSX0NMQVNTXSk7XG5cdFx0fVxuXG5cdFx0Ly9UcmlnZ2VycyBwYXJzaW5nIG9mIGVsZW1lbnRzIGFuZCBhIGZpcnN0IHJlZmxvdy5cblx0XHRfaW5zdGFuY2UucmVmcmVzaCgpO1xuXG5cdFx0X2FkZEV2ZW50KHdpbmRvdywgJ3Jlc2l6ZSBvcmllbnRhdGlvbmNoYW5nZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHdpZHRoID0gZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXHRcdFx0dmFyIGhlaWdodCA9IGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG5cblx0XHRcdC8vT25seSByZWZsb3cgaWYgdGhlIHNpemUgYWN0dWFsbHkgY2hhbmdlZCAoIzI3MSkuXG5cdFx0XHRpZihoZWlnaHQgIT09IF9sYXN0Vmlld3BvcnRIZWlnaHQgfHwgd2lkdGggIT09IF9sYXN0Vmlld3BvcnRXaWR0aCkge1xuXHRcdFx0XHRfbGFzdFZpZXdwb3J0SGVpZ2h0ID0gaGVpZ2h0O1xuXHRcdFx0XHRfbGFzdFZpZXdwb3J0V2lkdGggPSB3aWR0aDtcblxuXHRcdFx0XHRfcmVxdWVzdFJlZmxvdyA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR2YXIgcmVxdWVzdEFuaW1GcmFtZSA9IHBvbHlmaWxsUkFGKCk7XG5cblx0XHQvL0xldCdzIGdvLlxuXHRcdChmdW5jdGlvbiBhbmltbG9vcCgpe1xuXHRcdFx0X3JlbmRlcigpO1xuXHRcdFx0X2FuaW1GcmFtZSA9IHJlcXVlc3RBbmltRnJhbWUoYW5pbWxvb3ApO1xuXHRcdH0oKSk7XG5cblx0XHRyZXR1cm4gX2luc3RhbmNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIChSZSlwYXJzZXMgc29tZSBvciBhbGwgZWxlbWVudHMuXG5cdCAqL1xuXHRTa3JvbGxyLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oZWxlbWVudHMpIHtcblx0XHR2YXIgZWxlbWVudEluZGV4O1xuXHRcdHZhciBlbGVtZW50c0xlbmd0aDtcblx0XHR2YXIgaWdub3JlSUQgPSBmYWxzZTtcblxuXHRcdC8vQ29tcGxldGVseSByZXBhcnNlIGFueXRoaW5nIHdpdGhvdXQgYXJndW1lbnQuXG5cdFx0aWYoZWxlbWVudHMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly9JZ25vcmUgdGhhdCBzb21lIGVsZW1lbnRzIG1heSBhbHJlYWR5IGhhdmUgYSBza3JvbGxhYmxlIElELlxuXHRcdFx0aWdub3JlSUQgPSB0cnVlO1xuXG5cdFx0XHRfc2tyb2xsYWJsZXMgPSBbXTtcblx0XHRcdF9za3JvbGxhYmxlSWRDb3VudGVyID0gMDtcblxuXHRcdFx0ZWxlbWVudHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpO1xuXHRcdH0gZWxzZSBpZihlbGVtZW50cy5sZW5ndGggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly9XZSBhbHNvIGFjY2VwdCBhIHNpbmdsZSBlbGVtZW50IGFzIHBhcmFtZXRlci5cblx0XHRcdGVsZW1lbnRzID0gW2VsZW1lbnRzXTtcblx0XHR9XG5cblx0XHRlbGVtZW50SW5kZXggPSAwO1xuXHRcdGVsZW1lbnRzTGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuXG5cdFx0Zm9yKDsgZWxlbWVudEluZGV4IDwgZWxlbWVudHNMZW5ndGg7IGVsZW1lbnRJbmRleCsrKSB7XG5cdFx0XHR2YXIgZWwgPSBlbGVtZW50c1tlbGVtZW50SW5kZXhdO1xuXHRcdFx0dmFyIGFuY2hvclRhcmdldCA9IGVsO1xuXHRcdFx0dmFyIGtleUZyYW1lcyA9IFtdO1xuXG5cdFx0XHQvL0lmIHRoaXMgcGFydGljdWxhciBlbGVtZW50IHNob3VsZCBiZSBzbW9vdGggc2Nyb2xsZWQuXG5cdFx0XHR2YXIgc21vb3RoU2Nyb2xsVGhpcyA9IF9zbW9vdGhTY3JvbGxpbmdFbmFibGVkO1xuXG5cdFx0XHQvL1RoZSBlZGdlIHN0cmF0ZWd5IGZvciB0aGlzIHBhcnRpY3VsYXIgZWxlbWVudC5cblx0XHRcdHZhciBlZGdlU3RyYXRlZ3kgPSBfZWRnZVN0cmF0ZWd5O1xuXG5cdFx0XHQvL0lmIHRoaXMgcGFydGljdWxhciBlbGVtZW50IHNob3VsZCBlbWl0IGtleWZyYW1lIGV2ZW50cy5cblx0XHRcdHZhciBlbWl0RXZlbnRzID0gZmFsc2U7XG5cblx0XHRcdC8vSWYgd2UncmUgcmVzZXRpbmcgdGhlIGNvdW50ZXIsIHJlbW92ZSBhbnkgb2xkIGVsZW1lbnQgaWRzIHRoYXQgbWF5IGJlIGhhbmdpbmcgYXJvdW5kLlxuXHRcdFx0aWYoaWdub3JlSUQgJiYgU0tST0xMQUJMRV9JRF9ET01fUFJPUEVSVFkgaW4gZWwpIHtcblx0XHRcdFx0ZGVsZXRlIGVsW1NLUk9MTEFCTEVfSURfRE9NX1BST1BFUlRZXTtcblx0XHRcdH1cblxuXHRcdFx0aWYoIWVsLmF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vSXRlcmF0ZSBvdmVyIGFsbCBhdHRyaWJ1dGVzIGFuZCBzZWFyY2ggZm9yIGtleSBmcmFtZSBhdHRyaWJ1dGVzLlxuXHRcdFx0dmFyIGF0dHJpYnV0ZUluZGV4ID0gMDtcblx0XHRcdHZhciBhdHRyaWJ1dGVzTGVuZ3RoID0gZWwuYXR0cmlidXRlcy5sZW5ndGg7XG5cblx0XHRcdGZvciAoOyBhdHRyaWJ1dGVJbmRleCA8IGF0dHJpYnV0ZXNMZW5ndGg7IGF0dHJpYnV0ZUluZGV4KyspIHtcblx0XHRcdFx0dmFyIGF0dHIgPSBlbC5hdHRyaWJ1dGVzW2F0dHJpYnV0ZUluZGV4XTtcblxuXHRcdFx0XHRpZihhdHRyLm5hbWUgPT09ICdkYXRhLWFuY2hvci10YXJnZXQnKSB7XG5cdFx0XHRcdFx0YW5jaG9yVGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihhdHRyLnZhbHVlKTtcblxuXHRcdFx0XHRcdGlmKGFuY2hvclRhcmdldCA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0dGhyb3cgJ1VuYWJsZSB0byBmaW5kIGFuY2hvciB0YXJnZXQgXCInICsgYXR0ci52YWx1ZSArICdcIic7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL0dsb2JhbCBzbW9vdGggc2Nyb2xsaW5nIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHRoZSBlbGVtZW50IGF0dHJpYnV0ZS5cblx0XHRcdFx0aWYoYXR0ci5uYW1lID09PSAnZGF0YS1zbW9vdGgtc2Nyb2xsaW5nJykge1xuXHRcdFx0XHRcdHNtb290aFNjcm9sbFRoaXMgPSBhdHRyLnZhbHVlICE9PSAnb2ZmJztcblxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9HbG9iYWwgZWRnZSBzdHJhdGVneSBjYW4gYmUgb3ZlcnJpZGRlbiBieSB0aGUgZWxlbWVudCBhdHRyaWJ1dGUuXG5cdFx0XHRcdGlmKGF0dHIubmFtZSA9PT0gJ2RhdGEtZWRnZS1zdHJhdGVneScpIHtcblx0XHRcdFx0XHRlZGdlU3RyYXRlZ3kgPSBhdHRyLnZhbHVlO1xuXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL0lzIHRoaXMgZWxlbWVudCB0YWdnZWQgd2l0aCB0aGUgYGRhdGEtZW1pdC1ldmVudHNgIGF0dHJpYnV0ZT9cblx0XHRcdFx0aWYoYXR0ci5uYW1lID09PSAnZGF0YS1lbWl0LWV2ZW50cycpIHtcblx0XHRcdFx0XHRlbWl0RXZlbnRzID0gdHJ1ZTtcblxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIG1hdGNoID0gYXR0ci5uYW1lLm1hdGNoKHJ4S2V5ZnJhbWVBdHRyaWJ1dGUpO1xuXG5cdFx0XHRcdGlmKG1hdGNoID09PSBudWxsKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIga2YgPSB7XG5cdFx0XHRcdFx0cHJvcHM6IGF0dHIudmFsdWUsXG5cdFx0XHRcdFx0Ly9Qb2ludCBiYWNrIHRvIHRoZSBlbGVtZW50IGFzIHdlbGwuXG5cdFx0XHRcdFx0ZWxlbWVudDogZWwsXG5cdFx0XHRcdFx0Ly9UaGUgbmFtZSBvZiB0aGUgZXZlbnQgd2hpY2ggdGhpcyBrZXlmcmFtZSB3aWxsIGZpcmUsIGlmIGVtaXRFdmVudHMgaXNcblx0XHRcdFx0XHRldmVudFR5cGU6IGF0dHIubmFtZS5yZXBsYWNlKHJ4Q2FtZWxDYXNlLCByeENhbWVsQ2FzZUZuKVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGtleUZyYW1lcy5wdXNoKGtmKTtcblxuXHRcdFx0XHR2YXIgY29uc3RhbnQgPSBtYXRjaFsxXTtcblxuXHRcdFx0XHRpZihjb25zdGFudCkge1xuXHRcdFx0XHRcdC8vU3RyaXAgdGhlIHVuZGVyc2NvcmUgcHJlZml4LlxuXHRcdFx0XHRcdGtmLmNvbnN0YW50ID0gY29uc3RhbnQuc3Vic3RyKDEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9HZXQgdGhlIGtleSBmcmFtZSBvZmZzZXQuXG5cdFx0XHRcdHZhciBvZmZzZXQgPSBtYXRjaFsyXTtcblxuXHRcdFx0XHQvL0lzIGl0IGEgcGVyY2VudGFnZSBvZmZzZXQ/XG5cdFx0XHRcdGlmKC9wJC8udGVzdChvZmZzZXQpKSB7XG5cdFx0XHRcdFx0a2YuaXNQZXJjZW50YWdlID0gdHJ1ZTtcblx0XHRcdFx0XHRrZi5vZmZzZXQgPSAob2Zmc2V0LnNsaWNlKDAsIC0xKSB8IDApIC8gMTAwO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGtmLm9mZnNldCA9IChvZmZzZXQgfCAwKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBhbmNob3IxID0gbWF0Y2hbM107XG5cblx0XHRcdFx0Ly9JZiBzZWNvbmQgYW5jaG9yIGlzIG5vdCBzZXQsIHRoZSBmaXJzdCB3aWxsIGJlIHRha2VuIGZvciBib3RoLlxuXHRcdFx0XHR2YXIgYW5jaG9yMiA9IG1hdGNoWzRdIHx8IGFuY2hvcjE7XG5cblx0XHRcdFx0Ly9cImFic29sdXRlXCIgKG9yIFwiY2xhc3NpY1wiKSBtb2RlLCB3aGVyZSBudW1iZXJzIG1lYW4gYWJzb2x1dGUgc2Nyb2xsIG9mZnNldC5cblx0XHRcdFx0aWYoIWFuY2hvcjEgfHwgYW5jaG9yMSA9PT0gQU5DSE9SX1NUQVJUIHx8IGFuY2hvcjEgPT09IEFOQ0hPUl9FTkQpIHtcblx0XHRcdFx0XHRrZi5tb2RlID0gJ2Fic29sdXRlJztcblxuXHRcdFx0XHRcdC8vZGF0YS1lbmQgbmVlZHMgdG8gYmUgY2FsY3VsYXRlZCBhZnRlciBhbGwga2V5IGZyYW1lcyBhcmUga25vd24uXG5cdFx0XHRcdFx0aWYoYW5jaG9yMSA9PT0gQU5DSE9SX0VORCkge1xuXHRcdFx0XHRcdFx0a2YuaXNFbmQgPSB0cnVlO1xuXHRcdFx0XHRcdH0gZWxzZSBpZigha2YuaXNQZXJjZW50YWdlKSB7XG5cdFx0XHRcdFx0XHQvL0ZvciBkYXRhLXN0YXJ0IHdlIGNhbiBhbHJlYWR5IHNldCB0aGUga2V5IGZyYW1lIHcvbyBjYWxjdWxhdGlvbnMuXG5cdFx0XHRcdFx0XHQvLyM1OTogXCJzY2FsZVwiIG9wdGlvbnMgc2hvdWxkIG9ubHkgYWZmZWN0IGFic29sdXRlIG1vZGUuXG5cdFx0XHRcdFx0XHRrZi5vZmZzZXQgPSBrZi5vZmZzZXQgKiBfc2NhbGU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vXCJyZWxhdGl2ZVwiIG1vZGUsIHdoZXJlIG51bWJlcnMgYXJlIHJlbGF0aXZlIHRvIGFuY2hvcnMuXG5cdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdGtmLm1vZGUgPSAncmVsYXRpdmUnO1xuXHRcdFx0XHRcdGtmLmFuY2hvcnMgPSBbYW5jaG9yMSwgYW5jaG9yMl07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9Eb2VzIHRoaXMgZWxlbWVudCBoYXZlIGtleSBmcmFtZXM/XG5cdFx0XHRpZigha2V5RnJhbWVzLmxlbmd0aCkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly9XaWxsIGhvbGQgdGhlIG9yaWdpbmFsIHN0eWxlIGFuZCBjbGFzcyBhdHRyaWJ1dGVzIGJlZm9yZSB3ZSBjb250cm9sbGVkIHRoZSBlbGVtZW50IChzZWUgIzgwKS5cblx0XHRcdHZhciBzdHlsZUF0dHIsIGNsYXNzQXR0cjtcblxuXHRcdFx0dmFyIGlkO1xuXG5cdFx0XHRpZighaWdub3JlSUQgJiYgU0tST0xMQUJMRV9JRF9ET01fUFJPUEVSVFkgaW4gZWwpIHtcblx0XHRcdFx0Ly9XZSBhbHJlYWR5IGhhdmUgdGhpcyBlbGVtZW50IHVuZGVyIGNvbnRyb2wuIEdyYWIgdGhlIGNvcnJlc3BvbmRpbmcgc2tyb2xsYWJsZSBpZC5cblx0XHRcdFx0aWQgPSBlbFtTS1JPTExBQkxFX0lEX0RPTV9QUk9QRVJUWV07XG5cdFx0XHRcdHN0eWxlQXR0ciA9IF9za3JvbGxhYmxlc1tpZF0uc3R5bGVBdHRyO1xuXHRcdFx0XHRjbGFzc0F0dHIgPSBfc2tyb2xsYWJsZXNbaWRdLmNsYXNzQXR0cjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vSXQncyBhbiB1bmtub3duIGVsZW1lbnQuIEFzaWduIGl0IGEgbmV3IHNrcm9sbGFibGUgaWQuXG5cdFx0XHRcdGlkID0gKGVsW1NLUk9MTEFCTEVfSURfRE9NX1BST1BFUlRZXSA9IF9za3JvbGxhYmxlSWRDb3VudGVyKyspO1xuXHRcdFx0XHRzdHlsZUF0dHIgPSBlbC5zdHlsZS5jc3NUZXh0O1xuXHRcdFx0XHRjbGFzc0F0dHIgPSBfZ2V0Q2xhc3MoZWwpO1xuXHRcdFx0fVxuXG5cdFx0XHRfc2tyb2xsYWJsZXNbaWRdID0ge1xuXHRcdFx0XHRlbGVtZW50OiBlbCxcblx0XHRcdFx0c3R5bGVBdHRyOiBzdHlsZUF0dHIsXG5cdFx0XHRcdGNsYXNzQXR0cjogY2xhc3NBdHRyLFxuXHRcdFx0XHRhbmNob3JUYXJnZXQ6IGFuY2hvclRhcmdldCxcblx0XHRcdFx0a2V5RnJhbWVzOiBrZXlGcmFtZXMsXG5cdFx0XHRcdHNtb290aFNjcm9sbGluZzogc21vb3RoU2Nyb2xsVGhpcyxcblx0XHRcdFx0ZWRnZVN0cmF0ZWd5OiBlZGdlU3RyYXRlZ3ksXG5cdFx0XHRcdGVtaXRFdmVudHM6IGVtaXRFdmVudHMsXG5cdFx0XHRcdGxhc3RGcmFtZUluZGV4OiAtMVxuXHRcdFx0fTtcblxuXHRcdFx0X3VwZGF0ZUNsYXNzKGVsLCBbU0tST0xMQUJMRV9DTEFTU10sIFtdKTtcblx0XHR9XG5cblx0XHQvL1JlZmxvdyBmb3IgdGhlIGZpcnN0IHRpbWUuXG5cdFx0X3JlZmxvdygpO1xuXG5cdFx0Ly9Ob3cgdGhhdCB3ZSBnb3QgYWxsIGtleSBmcmFtZSBudW1iZXJzIHJpZ2h0LCBhY3R1YWxseSBwYXJzZSB0aGUgcHJvcGVydGllcy5cblx0XHRlbGVtZW50SW5kZXggPSAwO1xuXHRcdGVsZW1lbnRzTGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuXG5cdFx0Zm9yKDsgZWxlbWVudEluZGV4IDwgZWxlbWVudHNMZW5ndGg7IGVsZW1lbnRJbmRleCsrKSB7XG5cdFx0XHR2YXIgc2sgPSBfc2tyb2xsYWJsZXNbZWxlbWVudHNbZWxlbWVudEluZGV4XVtTS1JPTExBQkxFX0lEX0RPTV9QUk9QRVJUWV1dO1xuXG5cdFx0XHRpZihzayA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvL1BhcnNlIHRoZSBwcm9wZXJ0eSBzdHJpbmcgdG8gb2JqZWN0c1xuXHRcdFx0X3BhcnNlUHJvcHMoc2spO1xuXG5cdFx0XHQvL0ZpbGwga2V5IGZyYW1lcyB3aXRoIG1pc3NpbmcgcHJvcGVydGllcyBmcm9tIGxlZnQgYW5kIHJpZ2h0XG5cdFx0XHRfZmlsbFByb3BzKHNrKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gX2luc3RhbmNlO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBUcmFuc2Zvcm0gXCJyZWxhdGl2ZVwiIG1vZGUgdG8gXCJhYnNvbHV0ZVwiIG1vZGUuXG5cdCAqIFRoYXQgaXMsIGNhbGN1bGF0ZSBhbmNob3IgcG9zaXRpb24gYW5kIG9mZnNldCBvZiBlbGVtZW50LlxuXHQgKi9cblx0U2tyb2xsci5wcm90b3R5cGUucmVsYXRpdmVUb0Fic29sdXRlID0gZnVuY3Rpb24oZWxlbWVudCwgdmlld3BvcnRBbmNob3IsIGVsZW1lbnRBbmNob3IpIHtcblx0XHR2YXIgdmlld3BvcnRIZWlnaHQgPSBkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXHRcdHZhciBib3ggPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdHZhciBhYnNvbHV0ZSA9IGJveC50b3A7XG5cblx0XHQvLyMxMDA6IElFIGRvZXNuJ3Qgc3VwcGx5IFwiaGVpZ2h0XCIgd2l0aCBnZXRCb3VuZGluZ0NsaWVudFJlY3QuXG5cdFx0dmFyIGJveEhlaWdodCA9IGJveC5ib3R0b20gLSBib3gudG9wO1xuXG5cdFx0aWYodmlld3BvcnRBbmNob3IgPT09IEFOQ0hPUl9CT1RUT00pIHtcblx0XHRcdGFic29sdXRlIC09IHZpZXdwb3J0SGVpZ2h0O1xuXHRcdH0gZWxzZSBpZih2aWV3cG9ydEFuY2hvciA9PT0gQU5DSE9SX0NFTlRFUikge1xuXHRcdFx0YWJzb2x1dGUgLT0gdmlld3BvcnRIZWlnaHQgLyAyO1xuXHRcdH1cblxuXHRcdGlmKGVsZW1lbnRBbmNob3IgPT09IEFOQ0hPUl9CT1RUT00pIHtcblx0XHRcdGFic29sdXRlICs9IGJveEhlaWdodDtcblx0XHR9IGVsc2UgaWYoZWxlbWVudEFuY2hvciA9PT0gQU5DSE9SX0NFTlRFUikge1xuXHRcdFx0YWJzb2x1dGUgKz0gYm94SGVpZ2h0IC8gMjtcblx0XHR9XG5cblx0XHQvL0NvbXBlbnNhdGUgc2Nyb2xsaW5nIHNpbmNlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBpcyByZWxhdGl2ZSB0byB2aWV3cG9ydC5cblx0XHRhYnNvbHV0ZSArPSBfaW5zdGFuY2UuZ2V0U2Nyb2xsVG9wKCk7XG5cblx0XHRyZXR1cm4gKGFic29sdXRlICsgMC41KSB8IDA7XG5cdH07XG5cblx0LyoqXG5cdCAqIEFuaW1hdGVzIHNjcm9sbCB0b3AgdG8gbmV3IHBvc2l0aW9uLlxuXHQgKi9cblx0U2tyb2xsci5wcm90b3R5cGUuYW5pbWF0ZVRvID0gZnVuY3Rpb24odG9wLCBvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHR2YXIgbm93ID0gX25vdygpO1xuXHRcdHZhciBzY3JvbGxUb3AgPSBfaW5zdGFuY2UuZ2V0U2Nyb2xsVG9wKCk7XG5cdFx0dmFyIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiA9PT0gdW5kZWZpbmVkID8gREVGQVVMVF9EVVJBVElPTiA6IG9wdGlvbnMuZHVyYXRpb247XG5cblx0XHQvL1NldHRpbmcgdGhpcyB0byBhIG5ldyB2YWx1ZSB3aWxsIGF1dG9tYXRpY2FsbHkgY2F1c2UgdGhlIGN1cnJlbnQgYW5pbWF0aW9uIHRvIHN0b3AsIGlmIGFueS5cblx0XHRfc2Nyb2xsQW5pbWF0aW9uID0ge1xuXHRcdFx0c3RhcnRUb3A6IHNjcm9sbFRvcCxcblx0XHRcdHRvcERpZmY6IHRvcCAtIHNjcm9sbFRvcCxcblx0XHRcdHRhcmdldFRvcDogdG9wLFxuXHRcdFx0ZHVyYXRpb246IGR1cmF0aW9uLFxuXHRcdFx0c3RhcnRUaW1lOiBub3csXG5cdFx0XHRlbmRUaW1lOiBub3cgKyBkdXJhdGlvbixcblx0XHRcdGVhc2luZzogZWFzaW5nc1tvcHRpb25zLmVhc2luZyB8fCBERUZBVUxUX0VBU0lOR10sXG5cdFx0XHRkb25lOiBvcHRpb25zLmRvbmVcblx0XHR9O1xuXG5cdFx0Ly9Eb24ndCBxdWV1ZSB0aGUgYW5pbWF0aW9uIGlmIHRoZXJlJ3Mgbm90aGluZyB0byBhbmltYXRlLlxuXHRcdGlmKCFfc2Nyb2xsQW5pbWF0aW9uLnRvcERpZmYpIHtcblx0XHRcdGlmKF9zY3JvbGxBbmltYXRpb24uZG9uZSkge1xuXHRcdFx0XHRfc2Nyb2xsQW5pbWF0aW9uLmRvbmUuY2FsbChfaW5zdGFuY2UsIGZhbHNlKTtcblx0XHRcdH1cblxuXHRcdFx0X3Njcm9sbEFuaW1hdGlvbiA9IHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRyZXR1cm4gX2luc3RhbmNlO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBTdG9wcyBhbmltYXRlVG8gYW5pbWF0aW9uLlxuXHQgKi9cblx0U2tyb2xsci5wcm90b3R5cGUuc3RvcEFuaW1hdGVUbyA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmKF9zY3JvbGxBbmltYXRpb24gJiYgX3Njcm9sbEFuaW1hdGlvbi5kb25lKSB7XG5cdFx0XHRfc2Nyb2xsQW5pbWF0aW9uLmRvbmUuY2FsbChfaW5zdGFuY2UsIHRydWUpO1xuXHRcdH1cblxuXHRcdF9zY3JvbGxBbmltYXRpb24gPSB1bmRlZmluZWQ7XG5cdH07XG5cblx0LyoqXG5cdCAqIFJldHVybnMgaWYgYW4gYW5pbWF0aW9uIGNhdXNlZCBieSBhbmltYXRlVG8gaXMgY3VycmVudGx5IHJ1bm5pbmcuXG5cdCAqL1xuXHRTa3JvbGxyLnByb3RvdHlwZS5pc0FuaW1hdGluZ1RvID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICEhX3Njcm9sbEFuaW1hdGlvbjtcblx0fTtcblxuXHRTa3JvbGxyLnByb3RvdHlwZS5pc01vYmlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBfaXNNb2JpbGU7XG5cdH07XG5cblx0U2tyb2xsci5wcm90b3R5cGUuc2V0U2Nyb2xsVG9wID0gZnVuY3Rpb24odG9wLCBmb3JjZSkge1xuXHRcdF9mb3JjZVJlbmRlciA9IChmb3JjZSA9PT0gdHJ1ZSk7XG5cblx0XHRpZihfaXNNb2JpbGUpIHtcblx0XHRcdF9tb2JpbGVPZmZzZXQgPSBNYXRoLm1pbihNYXRoLm1heCh0b3AsIDApLCBfbWF4S2V5RnJhbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR3aW5kb3cuc2Nyb2xsVG8oMCwgdG9wKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gX2luc3RhbmNlO1xuXHR9O1xuXG5cdFNrcm9sbHIucHJvdG90eXBlLmdldFNjcm9sbFRvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmKF9pc01vYmlsZSkge1xuXHRcdFx0cmV0dXJuIF9tb2JpbGVPZmZzZXQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBib2R5LnNjcm9sbFRvcCB8fCAwO1xuXHRcdH1cblx0fTtcblxuXHRTa3JvbGxyLnByb3RvdHlwZS5nZXRNYXhTY3JvbGxUb3AgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gX21heEtleUZyYW1lO1xuXHR9O1xuXG5cdFNrcm9sbHIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24obmFtZSwgZm4pIHtcblx0XHRfbGlzdGVuZXJzW25hbWVdID0gZm47XG5cblx0XHRyZXR1cm4gX2luc3RhbmNlO1xuXHR9O1xuXG5cdFNrcm9sbHIucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKG5hbWUpIHtcblx0XHRkZWxldGUgX2xpc3RlbmVyc1tuYW1lXTtcblxuXHRcdHJldHVybiBfaW5zdGFuY2U7XG5cdH07XG5cblx0U2tyb2xsci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjYW5jZWxBbmltRnJhbWUgPSBwb2x5ZmlsbENBRigpO1xuXHRcdGNhbmNlbEFuaW1GcmFtZShfYW5pbUZyYW1lKTtcblx0XHRfcmVtb3ZlQWxsRXZlbnRzKCk7XG5cblx0XHRfdXBkYXRlQ2xhc3MoZG9jdW1lbnRFbGVtZW50LCBbTk9fU0tST0xMUl9DTEFTU10sIFtTS1JPTExSX0NMQVNTLCBTS1JPTExSX0RFU0tUT1BfQ0xBU1MsIFNLUk9MTFJfTU9CSUxFX0NMQVNTXSk7XG5cblx0XHR2YXIgc2tyb2xsYWJsZUluZGV4ID0gMDtcblx0XHR2YXIgc2tyb2xsYWJsZXNMZW5ndGggPSBfc2tyb2xsYWJsZXMubGVuZ3RoO1xuXG5cdFx0Zm9yKDsgc2tyb2xsYWJsZUluZGV4IDwgc2tyb2xsYWJsZXNMZW5ndGg7IHNrcm9sbGFibGVJbmRleCsrKSB7XG5cdFx0XHRfcmVzZXQoX3Nrcm9sbGFibGVzW3Nrcm9sbGFibGVJbmRleF0uZWxlbWVudCk7XG5cdFx0fVxuXG5cdFx0ZG9jdW1lbnRFbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gYm9keS5zdHlsZS5vdmVyZmxvdyA9ICcnO1xuXHRcdGRvY3VtZW50RWxlbWVudC5zdHlsZS5oZWlnaHQgPSBib2R5LnN0eWxlLmhlaWdodCA9ICcnO1xuXG5cdFx0aWYoX3Nrcm9sbHJCb2R5KSB7XG5cdFx0XHRza3JvbGxyLnNldFN0eWxlKF9za3JvbGxyQm9keSwgJ3RyYW5zZm9ybScsICdub25lJyk7XG5cdFx0fVxuXG5cdFx0X2luc3RhbmNlID0gdW5kZWZpbmVkO1xuXHRcdF9za3JvbGxyQm9keSA9IHVuZGVmaW5lZDtcblx0XHRfbGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXHRcdF9mb3JjZUhlaWdodCA9IHVuZGVmaW5lZDtcblx0XHRfbWF4S2V5RnJhbWUgPSAwO1xuXHRcdF9zY2FsZSA9IDE7XG5cdFx0X2NvbnN0YW50cyA9IHVuZGVmaW5lZDtcblx0XHRfbW9iaWxlRGVjZWxlcmF0aW9uID0gdW5kZWZpbmVkO1xuXHRcdF9kaXJlY3Rpb24gPSAnZG93bic7XG5cdFx0X2xhc3RUb3AgPSAtMTtcblx0XHRfbGFzdFZpZXdwb3J0V2lkdGggPSAwO1xuXHRcdF9sYXN0Vmlld3BvcnRIZWlnaHQgPSAwO1xuXHRcdF9yZXF1ZXN0UmVmbG93ID0gZmFsc2U7XG5cdFx0X3Njcm9sbEFuaW1hdGlvbiA9IHVuZGVmaW5lZDtcblx0XHRfc21vb3RoU2Nyb2xsaW5nRW5hYmxlZCA9IHVuZGVmaW5lZDtcblx0XHRfc21vb3RoU2Nyb2xsaW5nRHVyYXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0X3Ntb290aFNjcm9sbGluZyA9IHVuZGVmaW5lZDtcblx0XHRfZm9yY2VSZW5kZXIgPSB1bmRlZmluZWQ7XG5cdFx0X3Nrcm9sbGFibGVJZENvdW50ZXIgPSAwO1xuXHRcdF9lZGdlU3RyYXRlZ3kgPSB1bmRlZmluZWQ7XG5cdFx0X2lzTW9iaWxlID0gZmFsc2U7XG5cdFx0X21vYmlsZU9mZnNldCA9IDA7XG5cdFx0X3RyYW5zbGF0ZVogPSB1bmRlZmluZWQ7XG5cdH07XG5cblx0Lypcblx0XHRQcml2YXRlIG1ldGhvZHMuXG5cdCovXG5cblx0dmFyIF9pbml0TW9iaWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGluaXRpYWxFbGVtZW50O1xuXHRcdHZhciBpbml0aWFsVG91Y2hZO1xuXHRcdHZhciBpbml0aWFsVG91Y2hYO1xuXHRcdHZhciBjdXJyZW50RWxlbWVudDtcblx0XHR2YXIgY3VycmVudFRvdWNoWTtcblx0XHR2YXIgY3VycmVudFRvdWNoWDtcblx0XHR2YXIgbGFzdFRvdWNoWTtcblx0XHR2YXIgZGVsdGFZO1xuXG5cdFx0dmFyIGluaXRpYWxUb3VjaFRpbWU7XG5cdFx0dmFyIGN1cnJlbnRUb3VjaFRpbWU7XG5cdFx0dmFyIGxhc3RUb3VjaFRpbWU7XG5cdFx0dmFyIGRlbHRhVGltZTtcblxuXHRcdF9hZGRFdmVudChkb2N1bWVudEVsZW1lbnQsIFtFVkVOVF9UT1VDSFNUQVJULCBFVkVOVF9UT1VDSE1PVkUsIEVWRU5UX1RPVUNIQ0FOQ0VMLCBFVkVOVF9UT1VDSEVORF0uam9pbignICcpLCBmdW5jdGlvbihlKSB7XG5cdFx0XHR2YXIgdG91Y2ggPSBlLmNoYW5nZWRUb3VjaGVzWzBdO1xuXG5cdFx0XHRjdXJyZW50RWxlbWVudCA9IGUudGFyZ2V0O1xuXG5cdFx0XHQvL1dlIGRvbid0IHdhbnQgdGV4dCBub2Rlcy5cblx0XHRcdHdoaWxlKGN1cnJlbnRFbGVtZW50Lm5vZGVUeXBlID09PSAzKSB7XG5cdFx0XHRcdGN1cnJlbnRFbGVtZW50ID0gY3VycmVudEVsZW1lbnQucGFyZW50Tm9kZTtcblx0XHRcdH1cblxuXHRcdFx0Y3VycmVudFRvdWNoWSA9IHRvdWNoLmNsaWVudFk7XG5cdFx0XHRjdXJyZW50VG91Y2hYID0gdG91Y2guY2xpZW50WDtcblx0XHRcdGN1cnJlbnRUb3VjaFRpbWUgPSBlLnRpbWVTdGFtcDtcblxuXHRcdFx0aWYoIXJ4VG91Y2hJZ25vcmVUYWdzLnRlc3QoY3VycmVudEVsZW1lbnQudGFnTmFtZSkpIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRzd2l0Y2goZS50eXBlKSB7XG5cdFx0XHRcdGNhc2UgRVZFTlRfVE9VQ0hTVEFSVDpcblx0XHRcdFx0XHQvL1RoZSBsYXN0IGVsZW1lbnQgd2UgdGFwcGVkIG9uLlxuXHRcdFx0XHRcdGlmKGluaXRpYWxFbGVtZW50KSB7XG5cdFx0XHRcdFx0XHRpbml0aWFsRWxlbWVudC5ibHVyKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0X2luc3RhbmNlLnN0b3BBbmltYXRlVG8oKTtcblxuXHRcdFx0XHRcdGluaXRpYWxFbGVtZW50ID0gY3VycmVudEVsZW1lbnQ7XG5cblx0XHRcdFx0XHRpbml0aWFsVG91Y2hZID0gbGFzdFRvdWNoWSA9IGN1cnJlbnRUb3VjaFk7XG5cdFx0XHRcdFx0aW5pdGlhbFRvdWNoWCA9IGN1cnJlbnRUb3VjaFg7XG5cdFx0XHRcdFx0aW5pdGlhbFRvdWNoVGltZSA9IGN1cnJlbnRUb3VjaFRpbWU7XG5cblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBFVkVOVF9UT1VDSE1PVkU6XG5cdFx0XHRcdFx0Ly9QcmV2ZW50IGRlZmF1bHQgZXZlbnQgb24gdG91Y2hJZ25vcmUgZWxlbWVudHMgaW4gY2FzZSB0aGV5IGRvbid0IGhhdmUgZm9jdXMgeWV0LlxuXHRcdFx0XHRcdGlmKHJ4VG91Y2hJZ25vcmVUYWdzLnRlc3QoY3VycmVudEVsZW1lbnQudGFnTmFtZSkgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gY3VycmVudEVsZW1lbnQpIHtcblx0XHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRkZWx0YVkgPSBjdXJyZW50VG91Y2hZIC0gbGFzdFRvdWNoWTtcblx0XHRcdFx0XHRkZWx0YVRpbWUgPSBjdXJyZW50VG91Y2hUaW1lIC0gbGFzdFRvdWNoVGltZTtcblxuXHRcdFx0XHRcdF9pbnN0YW5jZS5zZXRTY3JvbGxUb3AoX21vYmlsZU9mZnNldCAtIGRlbHRhWSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRsYXN0VG91Y2hZID0gY3VycmVudFRvdWNoWTtcblx0XHRcdFx0XHRsYXN0VG91Y2hUaW1lID0gY3VycmVudFRvdWNoVGltZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y2FzZSBFVkVOVF9UT1VDSENBTkNFTDpcblx0XHRcdFx0Y2FzZSBFVkVOVF9UT1VDSEVORDpcblx0XHRcdFx0XHR2YXIgZGlzdGFuY2VZID0gaW5pdGlhbFRvdWNoWSAtIGN1cnJlbnRUb3VjaFk7XG5cdFx0XHRcdFx0dmFyIGRpc3RhbmNlWCA9IGluaXRpYWxUb3VjaFggLSBjdXJyZW50VG91Y2hYO1xuXHRcdFx0XHRcdHZhciBkaXN0YW5jZTIgPSBkaXN0YW5jZVggKiBkaXN0YW5jZVggKyBkaXN0YW5jZVkgKiBkaXN0YW5jZVk7XG5cblx0XHRcdFx0XHQvL0NoZWNrIGlmIGl0IHdhcyBtb3JlIGxpa2UgYSB0YXAgKG1vdmVkIGxlc3MgdGhhbiA3cHgpLlxuXHRcdFx0XHRcdGlmKGRpc3RhbmNlMiA8IDQ5KSB7XG5cdFx0XHRcdFx0XHRpZighcnhUb3VjaElnbm9yZVRhZ3MudGVzdChpbml0aWFsRWxlbWVudC50YWdOYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRpbml0aWFsRWxlbWVudC5mb2N1cygpO1xuXG5cdFx0XHRcdFx0XHRcdC8vSXQgd2FzIGEgdGFwLCBjbGljayB0aGUgZWxlbWVudC5cblx0XHRcdFx0XHRcdFx0dmFyIGNsaWNrRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcblx0XHRcdFx0XHRcdFx0Y2xpY2tFdmVudC5pbml0TW91c2VFdmVudCgnY2xpY2snLCB0cnVlLCB0cnVlLCBlLnZpZXcsIDEsIHRvdWNoLnNjcmVlblgsIHRvdWNoLnNjcmVlblksIHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFksIGUuY3RybEtleSwgZS5hbHRLZXksIGUuc2hpZnRLZXksIGUubWV0YUtleSwgMCwgbnVsbCk7XG5cdFx0XHRcdFx0XHRcdGluaXRpYWxFbGVtZW50LmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpbml0aWFsRWxlbWVudCA9IHVuZGVmaW5lZDtcblxuXHRcdFx0XHRcdHZhciBzcGVlZCA9IGRlbHRhWSAvIGRlbHRhVGltZTtcblxuXHRcdFx0XHRcdC8vQ2FwIHNwZWVkIGF0IDMgcGl4ZWwvbXMuXG5cdFx0XHRcdFx0c3BlZWQgPSBNYXRoLm1heChNYXRoLm1pbihzcGVlZCwgMyksIC0zKTtcblxuXHRcdFx0XHRcdHZhciBkdXJhdGlvbiA9IE1hdGguYWJzKHNwZWVkIC8gX21vYmlsZURlY2VsZXJhdGlvbik7XG5cdFx0XHRcdFx0dmFyIHRhcmdldE9mZnNldCA9IHNwZWVkICogZHVyYXRpb24gKyAwLjUgKiBfbW9iaWxlRGVjZWxlcmF0aW9uICogZHVyYXRpb24gKiBkdXJhdGlvbjtcblx0XHRcdFx0XHR2YXIgdGFyZ2V0VG9wID0gX2luc3RhbmNlLmdldFNjcm9sbFRvcCgpIC0gdGFyZ2V0T2Zmc2V0O1xuXG5cdFx0XHRcdFx0Ly9SZWxhdGl2ZSBkdXJhdGlvbiBjaGFuZ2UgZm9yIHdoZW4gc2Nyb2xsaW5nIGFib3ZlIGJvdW5kcy5cblx0XHRcdFx0XHR2YXIgdGFyZ2V0UmF0aW8gPSAwO1xuXG5cdFx0XHRcdFx0Ly9DaGFuZ2UgZHVyYXRpb24gcHJvcG9ydGlvbmFsbHkgd2hlbiBzY3JvbGxpbmcgd291bGQgbGVhdmUgYm91bmRzLlxuXHRcdFx0XHRcdGlmKHRhcmdldFRvcCA+IF9tYXhLZXlGcmFtZSkge1xuXHRcdFx0XHRcdFx0dGFyZ2V0UmF0aW8gPSAoX21heEtleUZyYW1lIC0gdGFyZ2V0VG9wKSAvIHRhcmdldE9mZnNldDtcblxuXHRcdFx0XHRcdFx0dGFyZ2V0VG9wID0gX21heEtleUZyYW1lO1xuXHRcdFx0XHRcdH0gZWxzZSBpZih0YXJnZXRUb3AgPCAwKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRSYXRpbyA9IC10YXJnZXRUb3AgLyB0YXJnZXRPZmZzZXQ7XG5cblx0XHRcdFx0XHRcdHRhcmdldFRvcCA9IDA7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZHVyYXRpb24gPSBkdXJhdGlvbiAqICgxIC0gdGFyZ2V0UmF0aW8pO1xuXG5cdFx0XHRcdFx0X2luc3RhbmNlLmFuaW1hdGVUbygodGFyZ2V0VG9wICsgMC41KSB8IDAsIHtlYXNpbmc6ICdvdXRDdWJpYycsIGR1cmF0aW9uOiBkdXJhdGlvbn0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly9KdXN0IGluIGNhc2UgdGhlcmUgaGFzIGFscmVhZHkgYmVlbiBzb21lIG5hdGl2ZSBzY3JvbGxpbmcsIHJlc2V0IGl0LlxuXHRcdHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcblx0XHRkb2N1bWVudEVsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSBib2R5LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG5cdH07XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMga2V5IGZyYW1lcyB3aGljaCBkZXBlbmQgb24gb3RoZXJzIC8gbmVlZCB0byBiZSB1cGRhdGVkIG9uIHJlc2l6ZS5cblx0ICogVGhhdCBpcyBcImVuZFwiIGluIFwiYWJzb2x1dGVcIiBtb2RlIGFuZCBhbGwga2V5IGZyYW1lcyBpbiBcInJlbGF0aXZlXCIgbW9kZS5cblx0ICogQWxzbyBoYW5kbGVzIGNvbnN0YW50cywgYmVjYXVzZSB0aGV5IG1heSBjaGFuZ2Ugb24gcmVzaXplLlxuXHQgKi9cblx0dmFyIF91cGRhdGVEZXBlbmRlbnRLZXlGcmFtZXMgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgdmlld3BvcnRIZWlnaHQgPSBkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuXHRcdHZhciBwcm9jZXNzZWRDb25zdGFudHMgPSBfcHJvY2Vzc0NvbnN0YW50cygpO1xuXHRcdHZhciBza3JvbGxhYmxlO1xuXHRcdHZhciBlbGVtZW50O1xuXHRcdHZhciBhbmNob3JUYXJnZXQ7XG5cdFx0dmFyIGtleUZyYW1lcztcblx0XHR2YXIga2V5RnJhbWVJbmRleDtcblx0XHR2YXIga2V5RnJhbWVzTGVuZ3RoO1xuXHRcdHZhciBrZjtcblx0XHR2YXIgc2tyb2xsYWJsZUluZGV4O1xuXHRcdHZhciBza3JvbGxhYmxlc0xlbmd0aDtcblx0XHR2YXIgb2Zmc2V0O1xuXHRcdHZhciBjb25zdGFudFZhbHVlO1xuXG5cdFx0Ly9GaXJzdCBwcm9jZXNzIGFsbCByZWxhdGl2ZS1tb2RlIGVsZW1lbnRzIGFuZCBmaW5kIHRoZSBtYXgga2V5IGZyYW1lLlxuXHRcdHNrcm9sbGFibGVJbmRleCA9IDA7XG5cdFx0c2tyb2xsYWJsZXNMZW5ndGggPSBfc2tyb2xsYWJsZXMubGVuZ3RoO1xuXG5cdFx0Zm9yKDsgc2tyb2xsYWJsZUluZGV4IDwgc2tyb2xsYWJsZXNMZW5ndGg7IHNrcm9sbGFibGVJbmRleCsrKSB7XG5cdFx0XHRza3JvbGxhYmxlID0gX3Nrcm9sbGFibGVzW3Nrcm9sbGFibGVJbmRleF07XG5cdFx0XHRlbGVtZW50ID0gc2tyb2xsYWJsZS5lbGVtZW50O1xuXHRcdFx0YW5jaG9yVGFyZ2V0ID0gc2tyb2xsYWJsZS5hbmNob3JUYXJnZXQ7XG5cdFx0XHRrZXlGcmFtZXMgPSBza3JvbGxhYmxlLmtleUZyYW1lcztcblxuXHRcdFx0a2V5RnJhbWVJbmRleCA9IDA7XG5cdFx0XHRrZXlGcmFtZXNMZW5ndGggPSBrZXlGcmFtZXMubGVuZ3RoO1xuXG5cdFx0XHRmb3IoOyBrZXlGcmFtZUluZGV4IDwga2V5RnJhbWVzTGVuZ3RoOyBrZXlGcmFtZUluZGV4KyspIHtcblx0XHRcdFx0a2YgPSBrZXlGcmFtZXNba2V5RnJhbWVJbmRleF07XG5cblx0XHRcdFx0b2Zmc2V0ID0ga2Yub2Zmc2V0O1xuXHRcdFx0XHRjb25zdGFudFZhbHVlID0gcHJvY2Vzc2VkQ29uc3RhbnRzW2tmLmNvbnN0YW50XSB8fCAwO1xuXG5cdFx0XHRcdGtmLmZyYW1lID0gb2Zmc2V0O1xuXG5cdFx0XHRcdGlmKGtmLmlzUGVyY2VudGFnZSkge1xuXHRcdFx0XHRcdC8vQ29udmVydCB0aGUgb2Zmc2V0IHRvIHBlcmNlbnRhZ2Ugb2YgdGhlIHZpZXdwb3J0IGhlaWdodC5cblx0XHRcdFx0XHRvZmZzZXQgPSBvZmZzZXQgKiB2aWV3cG9ydEhlaWdodDtcblxuXHRcdFx0XHRcdC8vQWJzb2x1dGUgKyBwZXJjZW50YWdlIG1vZGUuXG5cdFx0XHRcdFx0a2YuZnJhbWUgPSBvZmZzZXQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZihrZi5tb2RlID09PSAncmVsYXRpdmUnKSB7XG5cdFx0XHRcdFx0X3Jlc2V0KGVsZW1lbnQpO1xuXG5cdFx0XHRcdFx0a2YuZnJhbWUgPSBfaW5zdGFuY2UucmVsYXRpdmVUb0Fic29sdXRlKGFuY2hvclRhcmdldCwga2YuYW5jaG9yc1swXSwga2YuYW5jaG9yc1sxXSkgLSBvZmZzZXQ7XG5cblx0XHRcdFx0XHRfcmVzZXQoZWxlbWVudCwgdHJ1ZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRrZi5mcmFtZSArPSBjb25zdGFudFZhbHVlO1xuXG5cdFx0XHRcdC8vT25seSBzZWFyY2ggZm9yIG1heCBrZXkgZnJhbWUgd2hlbiBmb3JjZUhlaWdodCBpcyBlbmFibGVkLlxuXHRcdFx0XHRpZihfZm9yY2VIZWlnaHQpIHtcblx0XHRcdFx0XHQvL0ZpbmQgdGhlIG1heCBrZXkgZnJhbWUsIGJ1dCBkb24ndCB1c2Ugb25lIG9mIHRoZSBkYXRhLWVuZCBvbmVzIGZvciBjb21wYXJpc29uLlxuXHRcdFx0XHRcdGlmKCFrZi5pc0VuZCAmJiBrZi5mcmFtZSA+IF9tYXhLZXlGcmFtZSkge1xuXHRcdFx0XHRcdFx0X21heEtleUZyYW1lID0ga2YuZnJhbWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8jMTMzOiBUaGUgZG9jdW1lbnQgY2FuIGJlIGxhcmdlciB0aGFuIHRoZSBtYXhLZXlGcmFtZSB3ZSBmb3VuZC5cblx0XHRfbWF4S2V5RnJhbWUgPSBNYXRoLm1heChfbWF4S2V5RnJhbWUsIF9nZXREb2N1bWVudEhlaWdodCgpKTtcblxuXHRcdC8vTm93IHByb2Nlc3MgYWxsIGRhdGEtZW5kIGtleWZyYW1lcy5cblx0XHRza3JvbGxhYmxlSW5kZXggPSAwO1xuXHRcdHNrcm9sbGFibGVzTGVuZ3RoID0gX3Nrcm9sbGFibGVzLmxlbmd0aDtcblxuXHRcdGZvcig7IHNrcm9sbGFibGVJbmRleCA8IHNrcm9sbGFibGVzTGVuZ3RoOyBza3JvbGxhYmxlSW5kZXgrKykge1xuXHRcdFx0c2tyb2xsYWJsZSA9IF9za3JvbGxhYmxlc1tza3JvbGxhYmxlSW5kZXhdO1xuXHRcdFx0a2V5RnJhbWVzID0gc2tyb2xsYWJsZS5rZXlGcmFtZXM7XG5cblx0XHRcdGtleUZyYW1lSW5kZXggPSAwO1xuXHRcdFx0a2V5RnJhbWVzTGVuZ3RoID0ga2V5RnJhbWVzLmxlbmd0aDtcblxuXHRcdFx0Zm9yKDsga2V5RnJhbWVJbmRleCA8IGtleUZyYW1lc0xlbmd0aDsga2V5RnJhbWVJbmRleCsrKSB7XG5cdFx0XHRcdGtmID0ga2V5RnJhbWVzW2tleUZyYW1lSW5kZXhdO1xuXG5cdFx0XHRcdGNvbnN0YW50VmFsdWUgPSBwcm9jZXNzZWRDb25zdGFudHNba2YuY29uc3RhbnRdIHx8IDA7XG5cblx0XHRcdFx0aWYoa2YuaXNFbmQpIHtcblx0XHRcdFx0XHRrZi5mcmFtZSA9IF9tYXhLZXlGcmFtZSAtIGtmLm9mZnNldCArIGNvbnN0YW50VmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0c2tyb2xsYWJsZS5rZXlGcmFtZXMuc29ydChfa2V5RnJhbWVDb21wYXJhdG9yKTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgYW5kIHNldHMgdGhlIHN0eWxlIHByb3BlcnRpZXMgZm9yIHRoZSBlbGVtZW50IGF0IHRoZSBnaXZlbiBmcmFtZS5cblx0ICogQHBhcmFtIGZha2VGcmFtZSBUaGUgZnJhbWUgdG8gcmVuZGVyIGF0IHdoZW4gc21vb3RoIHNjcm9sbGluZyBpcyBlbmFibGVkLlxuXHQgKiBAcGFyYW0gYWN0dWFsRnJhbWUgVGhlIGFjdHVhbCBmcmFtZSB3ZSBhcmUgYXQuXG5cdCAqL1xuXHR2YXIgX2NhbGNTdGVwcyA9IGZ1bmN0aW9uKGZha2VGcmFtZSwgYWN0dWFsRnJhbWUpIHtcblx0XHQvL0l0ZXJhdGUgb3ZlciBhbGwgc2tyb2xsYWJsZXMuXG5cdFx0dmFyIHNrcm9sbGFibGVJbmRleCA9IDA7XG5cdFx0dmFyIHNrcm9sbGFibGVzTGVuZ3RoID0gX3Nrcm9sbGFibGVzLmxlbmd0aDtcblxuXHRcdGZvcig7IHNrcm9sbGFibGVJbmRleCA8IHNrcm9sbGFibGVzTGVuZ3RoOyBza3JvbGxhYmxlSW5kZXgrKykge1xuXHRcdFx0dmFyIHNrcm9sbGFibGUgPSBfc2tyb2xsYWJsZXNbc2tyb2xsYWJsZUluZGV4XTtcblx0XHRcdHZhciBlbGVtZW50ID0gc2tyb2xsYWJsZS5lbGVtZW50O1xuXHRcdFx0dmFyIGZyYW1lID0gc2tyb2xsYWJsZS5zbW9vdGhTY3JvbGxpbmcgPyBmYWtlRnJhbWUgOiBhY3R1YWxGcmFtZTtcblx0XHRcdHZhciBmcmFtZXMgPSBza3JvbGxhYmxlLmtleUZyYW1lcztcblx0XHRcdHZhciBmcmFtZXNMZW5ndGggPSBmcmFtZXMubGVuZ3RoO1xuXHRcdFx0dmFyIGZpcnN0RnJhbWUgPSBmcmFtZXNbMF07XG5cdFx0XHR2YXIgbGFzdEZyYW1lID0gZnJhbWVzW2ZyYW1lcy5sZW5ndGggLSAxXTtcblx0XHRcdHZhciBiZWZvcmVGaXJzdCA9IGZyYW1lIDwgZmlyc3RGcmFtZS5mcmFtZTtcblx0XHRcdHZhciBhZnRlckxhc3QgPSBmcmFtZSA+IGxhc3RGcmFtZS5mcmFtZTtcblx0XHRcdHZhciBmaXJzdE9yTGFzdEZyYW1lID0gYmVmb3JlRmlyc3QgPyBmaXJzdEZyYW1lIDogbGFzdEZyYW1lO1xuXHRcdFx0dmFyIGVtaXRFdmVudHMgPSBza3JvbGxhYmxlLmVtaXRFdmVudHM7XG5cdFx0XHR2YXIgbGFzdEZyYW1lSW5kZXggPSBza3JvbGxhYmxlLmxhc3RGcmFtZUluZGV4O1xuXHRcdFx0dmFyIGtleTtcblx0XHRcdHZhciB2YWx1ZTtcblxuXHRcdFx0Ly9JZiB3ZSBhcmUgYmVmb3JlL2FmdGVyIHRoZSBmaXJzdC9sYXN0IGZyYW1lLCBzZXQgdGhlIHN0eWxlcyBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIGVkZ2Ugc3RyYXRlZ3kuXG5cdFx0XHRpZihiZWZvcmVGaXJzdCB8fCBhZnRlckxhc3QpIHtcblx0XHRcdFx0Ly9DaGVjayBpZiB3ZSBhbHJlYWR5IGhhbmRsZWQgdGhpcyBlZGdlIGNhc2UgbGFzdCB0aW1lLlxuXHRcdFx0XHQvL05vdGU6IHVzaW5nIHNldFNjcm9sbFRvcCBpdCdzIHBvc3NpYmxlIHRoYXQgd2UganVtcGVkIGZyb20gb25lIGVkZ2UgdG8gdGhlIG90aGVyLlxuXHRcdFx0XHRpZihiZWZvcmVGaXJzdCAmJiBza3JvbGxhYmxlLmVkZ2UgPT09IC0xIHx8IGFmdGVyTGFzdCAmJiBza3JvbGxhYmxlLmVkZ2UgPT09IDEpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vQWRkIHRoZSBza3JvbGxyLWJlZm9yZSBvciAtYWZ0ZXIgY2xhc3MuXG5cdFx0XHRcdGlmKGJlZm9yZUZpcnN0KSB7XG5cdFx0XHRcdFx0X3VwZGF0ZUNsYXNzKGVsZW1lbnQsIFtTS1JPTExBQkxFX0JFRk9SRV9DTEFTU10sIFtTS1JPTExBQkxFX0FGVEVSX0NMQVNTLCBTS1JPTExBQkxFX0JFVFdFRU5fQ0xBU1NdKTtcblxuXHRcdFx0XHRcdC8vVGhpcyBoYW5kbGVzIHRoZSBzcGVjaWFsIGNhc2Ugd2hlcmUgd2UgZXhpdCB0aGUgZmlyc3Qga2V5ZnJhbWUuXG5cdFx0XHRcdFx0aWYoZW1pdEV2ZW50cyAmJiBsYXN0RnJhbWVJbmRleCA+IC0xKSB7XG5cdFx0XHRcdFx0XHRfZW1pdEV2ZW50KGVsZW1lbnQsIGZpcnN0RnJhbWUuZXZlbnRUeXBlLCBfZGlyZWN0aW9uKTtcblx0XHRcdFx0XHRcdHNrcm9sbGFibGUubGFzdEZyYW1lSW5kZXggPSAtMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X3VwZGF0ZUNsYXNzKGVsZW1lbnQsIFtTS1JPTExBQkxFX0FGVEVSX0NMQVNTXSwgW1NLUk9MTEFCTEVfQkVGT1JFX0NMQVNTLCBTS1JPTExBQkxFX0JFVFdFRU5fQ0xBU1NdKTtcblxuXHRcdFx0XHRcdC8vVGhpcyBoYW5kbGVzIHRoZSBzcGVjaWFsIGNhc2Ugd2hlcmUgd2UgZXhpdCB0aGUgbGFzdCBrZXlmcmFtZS5cblx0XHRcdFx0XHRpZihlbWl0RXZlbnRzICYmIGxhc3RGcmFtZUluZGV4IDwgZnJhbWVzTGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRfZW1pdEV2ZW50KGVsZW1lbnQsIGxhc3RGcmFtZS5ldmVudFR5cGUsIF9kaXJlY3Rpb24pO1xuXHRcdFx0XHRcdFx0c2tyb2xsYWJsZS5sYXN0RnJhbWVJbmRleCA9IGZyYW1lc0xlbmd0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL1JlbWVtYmVyIHRoYXQgd2UgaGFuZGxlZCB0aGUgZWRnZSBjYXNlIChiZWZvcmUvYWZ0ZXIgdGhlIGZpcnN0L2xhc3Qga2V5ZnJhbWUpLlxuXHRcdFx0XHRza3JvbGxhYmxlLmVkZ2UgPSBiZWZvcmVGaXJzdCA/IC0xIDogMTtcblxuXHRcdFx0XHRzd2l0Y2goc2tyb2xsYWJsZS5lZGdlU3RyYXRlZ3kpIHtcblx0XHRcdFx0XHRjYXNlICdyZXNldCc6XG5cdFx0XHRcdFx0XHRfcmVzZXQoZWxlbWVudCk7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRjYXNlICdlYXNlJzpcblx0XHRcdFx0XHRcdC8vSGFuZGxlIHRoaXMgY2FzZSBsaWtlIGl0IHdvdWxkIGJlIGV4YWN0bHkgYXQgZmlyc3QvbGFzdCBrZXlmcmFtZSBhbmQganVzdCBwYXNzIGl0IG9uLlxuXHRcdFx0XHRcdFx0ZnJhbWUgPSBmaXJzdE9yTGFzdEZyYW1lLmZyYW1lO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRjYXNlICdzZXQnOlxuXHRcdFx0XHRcdFx0dmFyIHByb3BzID0gZmlyc3RPckxhc3RGcmFtZS5wcm9wcztcblxuXHRcdFx0XHRcdFx0Zm9yKGtleSBpbiBwcm9wcykge1xuXHRcdFx0XHRcdFx0XHRpZihoYXNQcm9wLmNhbGwocHJvcHMsIGtleSkpIHtcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZSA9IF9pbnRlcnBvbGF0ZVN0cmluZyhwcm9wc1trZXldLnZhbHVlKTtcblxuXHRcdFx0XHRcdFx0XHRcdC8vU2V0IHN0eWxlIG9yIGF0dHJpYnV0ZS5cblx0XHRcdFx0XHRcdFx0XHRpZihrZXkuaW5kZXhPZignQCcpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRlbGVtZW50LnNldEF0dHJpYnV0ZShrZXkuc3Vic3RyKDEpLCB2YWx1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdHNrcm9sbHIuc2V0U3R5bGUoZWxlbWVudCwga2V5LCB2YWx1ZSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL0RpZCB3ZSBoYW5kbGUgYW4gZWRnZSBsYXN0IHRpbWU/XG5cdFx0XHRcdGlmKHNrcm9sbGFibGUuZWRnZSAhPT0gMCkge1xuXHRcdFx0XHRcdF91cGRhdGVDbGFzcyhlbGVtZW50LCBbU0tST0xMQUJMRV9DTEFTUywgU0tST0xMQUJMRV9CRVRXRUVOX0NMQVNTXSwgW1NLUk9MTEFCTEVfQkVGT1JFX0NMQVNTLCBTS1JPTExBQkxFX0FGVEVSX0NMQVNTXSk7XG5cdFx0XHRcdFx0c2tyb2xsYWJsZS5lZGdlID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL0ZpbmQgb3V0IGJldHdlZW4gd2hpY2ggdHdvIGtleSBmcmFtZXMgd2UgYXJlIHJpZ2h0IG5vdy5cblx0XHRcdHZhciBrZXlGcmFtZUluZGV4ID0gMDtcblxuXHRcdFx0Zm9yKDsga2V5RnJhbWVJbmRleCA8IGZyYW1lc0xlbmd0aCAtIDE7IGtleUZyYW1lSW5kZXgrKykge1xuXHRcdFx0XHRpZihmcmFtZSA+PSBmcmFtZXNba2V5RnJhbWVJbmRleF0uZnJhbWUgJiYgZnJhbWUgPD0gZnJhbWVzW2tleUZyYW1lSW5kZXggKyAxXS5mcmFtZSkge1xuXHRcdFx0XHRcdHZhciBsZWZ0ID0gZnJhbWVzW2tleUZyYW1lSW5kZXhdO1xuXHRcdFx0XHRcdHZhciByaWdodCA9IGZyYW1lc1trZXlGcmFtZUluZGV4ICsgMV07XG5cblx0XHRcdFx0XHRmb3Ioa2V5IGluIGxlZnQucHJvcHMpIHtcblx0XHRcdFx0XHRcdGlmKGhhc1Byb3AuY2FsbChsZWZ0LnByb3BzLCBrZXkpKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBwcm9ncmVzcyA9IChmcmFtZSAtIGxlZnQuZnJhbWUpIC8gKHJpZ2h0LmZyYW1lIC0gbGVmdC5mcmFtZSk7XG5cblx0XHRcdFx0XHRcdFx0Ly9UcmFuc2Zvcm0gdGhlIGN1cnJlbnQgcHJvZ3Jlc3MgdXNpbmcgdGhlIGdpdmVuIGVhc2luZyBmdW5jdGlvbi5cblx0XHRcdFx0XHRcdFx0cHJvZ3Jlc3MgPSBsZWZ0LnByb3BzW2tleV0uZWFzaW5nKHByb2dyZXNzKTtcblxuXHRcdFx0XHRcdFx0XHQvL0ludGVycG9sYXRlIGJldHdlZW4gdGhlIHR3byB2YWx1ZXNcblx0XHRcdFx0XHRcdFx0dmFsdWUgPSBfY2FsY0ludGVycG9sYXRpb24obGVmdC5wcm9wc1trZXldLnZhbHVlLCByaWdodC5wcm9wc1trZXldLnZhbHVlLCBwcm9ncmVzcyk7XG5cblx0XHRcdFx0XHRcdFx0dmFsdWUgPSBfaW50ZXJwb2xhdGVTdHJpbmcodmFsdWUpO1xuXG5cdFx0XHRcdFx0XHRcdC8vU2V0IHN0eWxlIG9yIGF0dHJpYnV0ZS5cblx0XHRcdFx0XHRcdFx0aWYoa2V5LmluZGV4T2YoJ0AnKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdGVsZW1lbnQuc2V0QXR0cmlidXRlKGtleS5zdWJzdHIoMSksIHZhbHVlKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRza3JvbGxyLnNldFN0eWxlKGVsZW1lbnQsIGtleSwgdmFsdWUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9BcmUgZXZlbnRzIGVuYWJsZWQgb24gdGhpcyBlbGVtZW50P1xuXHRcdFx0XHRcdC8vVGhpcyBjb2RlIGhhbmRsZXMgdGhlIHVzdWFsIGNhc2VzIG9mIHNjcm9sbGluZyB0aHJvdWdoIGRpZmZlcmVudCBrZXlmcmFtZXMuXG5cdFx0XHRcdFx0Ly9UaGUgc3BlY2lhbCBjYXNlcyBvZiBiZWZvcmUgZmlyc3QgYW5kIGFmdGVyIGxhc3Qga2V5ZnJhbWUgYXJlIGhhbmRsZWQgYWJvdmUuXG5cdFx0XHRcdFx0aWYoZW1pdEV2ZW50cykge1xuXHRcdFx0XHRcdFx0Ly9EaWQgd2UgcGFzcyBhIG5ldyBrZXlmcmFtZT9cblx0XHRcdFx0XHRcdGlmKGxhc3RGcmFtZUluZGV4ICE9PSBrZXlGcmFtZUluZGV4KSB7XG5cdFx0XHRcdFx0XHRcdGlmKF9kaXJlY3Rpb24gPT09ICdkb3duJykge1xuXHRcdFx0XHRcdFx0XHRcdF9lbWl0RXZlbnQoZWxlbWVudCwgbGVmdC5ldmVudFR5cGUsIF9kaXJlY3Rpb24pO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdF9lbWl0RXZlbnQoZWxlbWVudCwgcmlnaHQuZXZlbnRUeXBlLCBfZGlyZWN0aW9uKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHNrcm9sbGFibGUubGFzdEZyYW1lSW5kZXggPSBrZXlGcmFtZUluZGV4O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZW5kZXJzIGFsbCBlbGVtZW50cy5cblx0ICovXG5cdHZhciBfcmVuZGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYoX3JlcXVlc3RSZWZsb3cpIHtcblx0XHRcdF9yZXF1ZXN0UmVmbG93ID0gZmFsc2U7XG5cdFx0XHRfcmVmbG93KCk7XG5cdFx0fVxuXG5cdFx0Ly9XZSBtYXkgcmVuZGVyIHNvbWV0aGluZyBlbHNlIHRoYW4gdGhlIGFjdHVhbCBzY3JvbGxiYXIgcG9zaXRpb24uXG5cdFx0dmFyIHJlbmRlclRvcCA9IF9pbnN0YW5jZS5nZXRTY3JvbGxUb3AoKTtcblxuXHRcdC8vSWYgdGhlcmUncyBhbiBhbmltYXRpb24sIHdoaWNoIGVuZHMgaW4gY3VycmVudCByZW5kZXIgY2FsbCwgY2FsbCB0aGUgY2FsbGJhY2sgYWZ0ZXIgcmVuZGVyaW5nLlxuXHRcdHZhciBhZnRlckFuaW1hdGlvbkNhbGxiYWNrO1xuXHRcdHZhciBub3cgPSBfbm93KCk7XG5cdFx0dmFyIHByb2dyZXNzO1xuXG5cdFx0Ly9CZWZvcmUgYWN0dWFsbHkgcmVuZGVyaW5nIGhhbmRsZSB0aGUgc2Nyb2xsIGFuaW1hdGlvbiwgaWYgYW55LlxuXHRcdGlmKF9zY3JvbGxBbmltYXRpb24pIHtcblx0XHRcdC8vSXQncyBvdmVyXG5cdFx0XHRpZihub3cgPj0gX3Njcm9sbEFuaW1hdGlvbi5lbmRUaW1lKSB7XG5cdFx0XHRcdHJlbmRlclRvcCA9IF9zY3JvbGxBbmltYXRpb24udGFyZ2V0VG9wO1xuXHRcdFx0XHRhZnRlckFuaW1hdGlvbkNhbGxiYWNrID0gX3Njcm9sbEFuaW1hdGlvbi5kb25lO1xuXHRcdFx0XHRfc2Nyb2xsQW5pbWF0aW9uID0gdW5kZWZpbmVkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9NYXAgdGhlIGN1cnJlbnQgcHJvZ3Jlc3MgdG8gdGhlIG5ldyBwcm9ncmVzcyB1c2luZyBnaXZlbiBlYXNpbmcgZnVuY3Rpb24uXG5cdFx0XHRcdHByb2dyZXNzID0gX3Njcm9sbEFuaW1hdGlvbi5lYXNpbmcoKG5vdyAtIF9zY3JvbGxBbmltYXRpb24uc3RhcnRUaW1lKSAvIF9zY3JvbGxBbmltYXRpb24uZHVyYXRpb24pO1xuXG5cdFx0XHRcdHJlbmRlclRvcCA9IChfc2Nyb2xsQW5pbWF0aW9uLnN0YXJ0VG9wICsgcHJvZ3Jlc3MgKiBfc2Nyb2xsQW5pbWF0aW9uLnRvcERpZmYpIHwgMDtcblx0XHRcdH1cblxuXHRcdFx0X2luc3RhbmNlLnNldFNjcm9sbFRvcChyZW5kZXJUb3AsIHRydWUpO1xuXHRcdH1cblx0XHQvL1Ntb290aCBzY3JvbGxpbmcgb25seSBpZiB0aGVyZSdzIG5vIGFuaW1hdGlvbiBydW5uaW5nIGFuZCBpZiB3ZSdyZSBub3QgZm9yY2luZyB0aGUgcmVuZGVyaW5nLlxuXHRcdGVsc2UgaWYoIV9mb3JjZVJlbmRlcikge1xuXHRcdFx0dmFyIHNtb290aFNjcm9sbGluZ0RpZmYgPSBfc21vb3RoU2Nyb2xsaW5nLnRhcmdldFRvcCAtIHJlbmRlclRvcDtcblxuXHRcdFx0Ly9UaGUgdXNlciBzY3JvbGxlZCwgc3RhcnQgbmV3IHNtb290aCBzY3JvbGxpbmcuXG5cdFx0XHRpZihzbW9vdGhTY3JvbGxpbmdEaWZmKSB7XG5cdFx0XHRcdF9zbW9vdGhTY3JvbGxpbmcgPSB7XG5cdFx0XHRcdFx0c3RhcnRUb3A6IF9sYXN0VG9wLFxuXHRcdFx0XHRcdHRvcERpZmY6IHJlbmRlclRvcCAtIF9sYXN0VG9wLFxuXHRcdFx0XHRcdHRhcmdldFRvcDogcmVuZGVyVG9wLFxuXHRcdFx0XHRcdHN0YXJ0VGltZTogX2xhc3RSZW5kZXJDYWxsLFxuXHRcdFx0XHRcdGVuZFRpbWU6IF9sYXN0UmVuZGVyQ2FsbCArIF9zbW9vdGhTY3JvbGxpbmdEdXJhdGlvblxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHQvL0ludGVycG9sYXRlIHRoZSBpbnRlcm5hbCBzY3JvbGwgcG9zaXRpb24gKG5vdCB0aGUgYWN0dWFsIHNjcm9sbGJhcikuXG5cdFx0XHRpZihub3cgPD0gX3Ntb290aFNjcm9sbGluZy5lbmRUaW1lKSB7XG5cdFx0XHRcdC8vTWFwIHRoZSBjdXJyZW50IHByb2dyZXNzIHRvIHRoZSBuZXcgcHJvZ3Jlc3MgdXNpbmcgZWFzaW5nIGZ1bmN0aW9uLlxuXHRcdFx0XHRwcm9ncmVzcyA9IGVhc2luZ3Muc3FydCgobm93IC0gX3Ntb290aFNjcm9sbGluZy5zdGFydFRpbWUpIC8gX3Ntb290aFNjcm9sbGluZ0R1cmF0aW9uKTtcblxuXHRcdFx0XHRyZW5kZXJUb3AgPSAoX3Ntb290aFNjcm9sbGluZy5zdGFydFRvcCArIHByb2dyZXNzICogX3Ntb290aFNjcm9sbGluZy50b3BEaWZmKSB8IDA7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9EaWQgdGhlIHNjcm9sbCBwb3NpdGlvbiBldmVuIGNoYW5nZT9cblx0XHRpZihfZm9yY2VSZW5kZXIgfHwgX2xhc3RUb3AgIT09IHJlbmRlclRvcCkge1xuXHRcdFx0Ly9SZW1lbWJlciBpbiB3aGljaCBkaXJlY3Rpb24gYXJlIHdlIHNjcm9sbGluZz9cblx0XHRcdF9kaXJlY3Rpb24gPSAocmVuZGVyVG9wID4gX2xhc3RUb3ApID8gJ2Rvd24nIDogKHJlbmRlclRvcCA8IF9sYXN0VG9wID8gJ3VwJyA6IF9kaXJlY3Rpb24pO1xuXG5cdFx0XHRfZm9yY2VSZW5kZXIgPSBmYWxzZTtcblxuXHRcdFx0dmFyIGxpc3RlbmVyUGFyYW1zID0ge1xuXHRcdFx0XHRjdXJUb3A6IHJlbmRlclRvcCxcblx0XHRcdFx0bGFzdFRvcDogX2xhc3RUb3AsXG5cdFx0XHRcdG1heFRvcDogX21heEtleUZyYW1lLFxuXHRcdFx0XHRkaXJlY3Rpb246IF9kaXJlY3Rpb25cblx0XHRcdH07XG5cblx0XHRcdC8vVGVsbCB0aGUgbGlzdGVuZXIgd2UgYXJlIGFib3V0IHRvIHJlbmRlci5cblx0XHRcdHZhciBjb250aW51ZVJlbmRlcmluZyA9IF9saXN0ZW5lcnMuYmVmb3JlcmVuZGVyICYmIF9saXN0ZW5lcnMuYmVmb3JlcmVuZGVyLmNhbGwoX2luc3RhbmNlLCBsaXN0ZW5lclBhcmFtcyk7XG5cblx0XHRcdC8vVGhlIGJlZm9yZXJlbmRlciBsaXN0ZW5lciBmdW5jdGlvbiBpcyBhYmxlIHRoZSBjYW5jZWwgcmVuZGVyaW5nLlxuXHRcdFx0aWYoY29udGludWVSZW5kZXJpbmcgIT09IGZhbHNlKSB7XG5cdFx0XHRcdC8vTm93IGFjdHVhbGx5IGludGVycG9sYXRlIGFsbCB0aGUgc3R5bGVzLlxuXHRcdFx0XHRfY2FsY1N0ZXBzKHJlbmRlclRvcCwgX2luc3RhbmNlLmdldFNjcm9sbFRvcCgpKTtcblxuXHRcdFx0XHQvL1RoYXQncyB3ZXJlIHdlIGFjdHVhbGx5IFwic2Nyb2xsXCIgb24gbW9iaWxlLlxuXHRcdFx0XHRpZihfaXNNb2JpbGUgJiYgX3Nrcm9sbHJCb2R5KSB7XG5cdFx0XHRcdFx0Ly9TZXQgdGhlIHRyYW5zZm9ybSAoXCJzY3JvbGwgaXRcIikuXG5cdFx0XHRcdFx0c2tyb2xsci5zZXRTdHlsZShfc2tyb2xsckJvZHksICd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsICcgKyAtKF9tb2JpbGVPZmZzZXQpICsgJ3B4KSAnICsgX3RyYW5zbGF0ZVopO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9SZW1lbWJlciB3aGVuIHdlIGxhc3QgcmVuZGVyZWQuXG5cdFx0XHRcdF9sYXN0VG9wID0gcmVuZGVyVG9wO1xuXG5cdFx0XHRcdGlmKF9saXN0ZW5lcnMucmVuZGVyKSB7XG5cdFx0XHRcdFx0X2xpc3RlbmVycy5yZW5kZXIuY2FsbChfaW5zdGFuY2UsIGxpc3RlbmVyUGFyYW1zKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZihhZnRlckFuaW1hdGlvbkNhbGxiYWNrKSB7XG5cdFx0XHRcdGFmdGVyQW5pbWF0aW9uQ2FsbGJhY2suY2FsbChfaW5zdGFuY2UsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRfbGFzdFJlbmRlckNhbGwgPSBub3c7XG5cdH07XG5cblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgcHJvcGVydGllcyBmb3IgZWFjaCBrZXkgZnJhbWUgb2YgdGhlIGdpdmVuIHNrcm9sbGFibGUuXG5cdCAqL1xuXHR2YXIgX3BhcnNlUHJvcHMgPSBmdW5jdGlvbihza3JvbGxhYmxlKSB7XG5cdFx0Ly9JdGVyYXRlIG92ZXIgYWxsIGtleSBmcmFtZXNcblx0XHR2YXIga2V5RnJhbWVJbmRleCA9IDA7XG5cdFx0dmFyIGtleUZyYW1lc0xlbmd0aCA9IHNrcm9sbGFibGUua2V5RnJhbWVzLmxlbmd0aDtcblxuXHRcdGZvcig7IGtleUZyYW1lSW5kZXggPCBrZXlGcmFtZXNMZW5ndGg7IGtleUZyYW1lSW5kZXgrKykge1xuXHRcdFx0dmFyIGZyYW1lID0gc2tyb2xsYWJsZS5rZXlGcmFtZXNba2V5RnJhbWVJbmRleF07XG5cdFx0XHR2YXIgZWFzaW5nO1xuXHRcdFx0dmFyIHZhbHVlO1xuXHRcdFx0dmFyIHByb3A7XG5cdFx0XHR2YXIgcHJvcHMgPSB7fTtcblxuXHRcdFx0dmFyIG1hdGNoO1xuXG5cdFx0XHR3aGlsZSgobWF0Y2ggPSByeFByb3BWYWx1ZS5leGVjKGZyYW1lLnByb3BzKSkgIT09IG51bGwpIHtcblx0XHRcdFx0cHJvcCA9IG1hdGNoWzFdO1xuXHRcdFx0XHR2YWx1ZSA9IG1hdGNoWzJdO1xuXG5cdFx0XHRcdGVhc2luZyA9IHByb3AubWF0Y2gocnhQcm9wRWFzaW5nKTtcblxuXHRcdFx0XHQvL0lzIHRoZXJlIGFuIGVhc2luZyBzcGVjaWZpZWQgZm9yIHRoaXMgcHJvcD9cblx0XHRcdFx0aWYoZWFzaW5nICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0cHJvcCA9IGVhc2luZ1sxXTtcblx0XHRcdFx0XHRlYXNpbmcgPSBlYXNpbmdbMl07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZWFzaW5nID0gREVGQVVMVF9FQVNJTkc7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL0V4Y2xhbWF0aW9uIHBvaW50IGF0IGZpcnN0IHBvc2l0aW9uIGZvcmNlcyB0aGUgdmFsdWUgdG8gYmUgdGFrZW4gbGl0ZXJhbC5cblx0XHRcdFx0dmFsdWUgPSB2YWx1ZS5pbmRleE9mKCchJykgPyBfcGFyc2VQcm9wKHZhbHVlKSA6IFt2YWx1ZS5zbGljZSgxKV07XG5cblx0XHRcdFx0Ly9TYXZlIHRoZSBwcm9wIGZvciB0aGlzIGtleSBmcmFtZSB3aXRoIGhpcyB2YWx1ZSBhbmQgZWFzaW5nIGZ1bmN0aW9uXG5cdFx0XHRcdHByb3BzW3Byb3BdID0ge1xuXHRcdFx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdFx0XHRlYXNpbmc6IGVhc2luZ3NbZWFzaW5nXVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRmcmFtZS5wcm9wcyA9IHByb3BzO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogUGFyc2VzIGEgdmFsdWUgZXh0cmFjdGluZyBudW1lcmljIHZhbHVlcyBhbmQgZ2VuZXJhdGluZyBhIGZvcm1hdCBzdHJpbmdcblx0ICogZm9yIGxhdGVyIGludGVycG9sYXRpb24gb2YgdGhlIG5ldyB2YWx1ZXMgaW4gb2xkIHN0cmluZy5cblx0ICpcblx0ICogQHBhcmFtIHZhbCBUaGUgQ1NTIHZhbHVlIHRvIGJlIHBhcnNlZC5cblx0ICogQHJldHVybiBTb21ldGhpbmcgbGlrZSBbXCJyZ2JhKD8lLD8lLCA/JSw/KVwiLCAxMDAsIDUwLCAwLCAuN11cblx0ICogd2hlcmUgdGhlIGZpcnN0IGVsZW1lbnQgaXMgdGhlIGZvcm1hdCBzdHJpbmcgbGF0ZXIgdXNlZFxuXHQgKiBhbmQgYWxsIGZvbGxvd2luZyBlbGVtZW50cyBhcmUgdGhlIG51bWVyaWMgdmFsdWUuXG5cdCAqL1xuXHR2YXIgX3BhcnNlUHJvcCA9IGZ1bmN0aW9uKHZhbCkge1xuXHRcdHZhciBudW1iZXJzID0gW107XG5cblx0XHQvL09uZSBzcGVjaWFsIGNhc2UsIHdoZXJlIGZsb2F0cyBkb24ndCB3b3JrLlxuXHRcdC8vV2UgcmVwbGFjZSBhbGwgb2NjdXJlbmNlcyBvZiByZ2JhIGNvbG9yc1xuXHRcdC8vd2hpY2ggZG9uJ3QgdXNlIHBlcmNlbnRhZ2Ugbm90YXRpb24gd2l0aCB0aGUgcGVyY2VudGFnZSBub3RhdGlvbi5cblx0XHRyeFJHQkFJbnRlZ2VyQ29sb3IubGFzdEluZGV4ID0gMDtcblx0XHR2YWwgPSB2YWwucmVwbGFjZShyeFJHQkFJbnRlZ2VyQ29sb3IsIGZ1bmN0aW9uKHJnYmEpIHtcblx0XHRcdHJldHVybiByZ2JhLnJlcGxhY2UocnhOdW1lcmljVmFsdWUsIGZ1bmN0aW9uKG4pIHtcblx0XHRcdFx0cmV0dXJuIG4gLyAyNTUgKiAxMDAgKyAnJSc7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vSGFuZGxlIHByZWZpeGluZyBvZiBcImdyYWRpZW50XCIgdmFsdWVzLlxuXHRcdC8vRm9yIG5vdyBvbmx5IHRoZSBwcmVmaXhlZCB2YWx1ZSB3aWxsIGJlIHNldC4gVW5wcmVmaXhlZCBpc24ndCBzdXBwb3J0ZWQgYW55d2F5LlxuXHRcdGlmKHRoZURhc2hlZENTU1ByZWZpeCkge1xuXHRcdFx0cnhHcmFkaWVudC5sYXN0SW5kZXggPSAwO1xuXHRcdFx0dmFsID0gdmFsLnJlcGxhY2UocnhHcmFkaWVudCwgZnVuY3Rpb24ocykge1xuXHRcdFx0XHRyZXR1cm4gdGhlRGFzaGVkQ1NTUHJlZml4ICsgcztcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vTm93IHBhcnNlIEFOWSBudW1iZXIgaW5zaWRlIHRoaXMgc3RyaW5nIGFuZCBjcmVhdGUgYSBmb3JtYXQgc3RyaW5nLlxuXHRcdHZhbCA9IHZhbC5yZXBsYWNlKHJ4TnVtZXJpY1ZhbHVlLCBmdW5jdGlvbihuKSB7XG5cdFx0XHRudW1iZXJzLnB1c2goK24pO1xuXHRcdFx0cmV0dXJuICd7P30nO1xuXHRcdH0pO1xuXG5cdFx0Ly9BZGQgdGhlIGZvcm1hdHN0cmluZyBhcyBmaXJzdCB2YWx1ZS5cblx0XHRudW1iZXJzLnVuc2hpZnQodmFsKTtcblxuXHRcdHJldHVybiBudW1iZXJzO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBGaWxscyB0aGUga2V5IGZyYW1lcyB3aXRoIG1pc3NpbmcgbGVmdCBhbmQgcmlnaHQgaGFuZCBwcm9wZXJ0aWVzLlxuXHQgKiBJZiBrZXkgZnJhbWUgMSBoYXMgcHJvcGVydHkgWCBhbmQga2V5IGZyYW1lIDIgaXMgbWlzc2luZyBYLFxuXHQgKiBidXQga2V5IGZyYW1lIDMgaGFzIFggYWdhaW4sIHRoZW4gd2UgbmVlZCB0byBhc3NpZ24gWCB0byBrZXkgZnJhbWUgMiB0b28uXG5cdCAqXG5cdCAqIEBwYXJhbSBzayBBIHNrcm9sbGFibGUuXG5cdCAqL1xuXHR2YXIgX2ZpbGxQcm9wcyA9IGZ1bmN0aW9uKHNrKSB7XG5cdFx0Ly9XaWxsIGNvbGxlY3QgdGhlIHByb3BlcnRpZXMga2V5IGZyYW1lIGJ5IGtleSBmcmFtZVxuXHRcdHZhciBwcm9wTGlzdCA9IHt9O1xuXHRcdHZhciBrZXlGcmFtZUluZGV4O1xuXHRcdHZhciBrZXlGcmFtZXNMZW5ndGg7XG5cblx0XHQvL0l0ZXJhdGUgb3ZlciBhbGwga2V5IGZyYW1lcyBmcm9tIGxlZnQgdG8gcmlnaHRcblx0XHRrZXlGcmFtZUluZGV4ID0gMDtcblx0XHRrZXlGcmFtZXNMZW5ndGggPSBzay5rZXlGcmFtZXMubGVuZ3RoO1xuXG5cdFx0Zm9yKDsga2V5RnJhbWVJbmRleCA8IGtleUZyYW1lc0xlbmd0aDsga2V5RnJhbWVJbmRleCsrKSB7XG5cdFx0XHRfZmlsbFByb3BGb3JGcmFtZShzay5rZXlGcmFtZXNba2V5RnJhbWVJbmRleF0sIHByb3BMaXN0KTtcblx0XHR9XG5cblx0XHQvL05vdyBkbyB0aGUgc2FtZSBmcm9tIHJpZ2h0IHRvIGZpbGwgdGhlIGxhc3QgZ2Fwc1xuXG5cdFx0cHJvcExpc3QgPSB7fTtcblxuXHRcdC8vSXRlcmF0ZSBvdmVyIGFsbCBrZXkgZnJhbWVzIGZyb20gcmlnaHQgdG8gbGVmdFxuXHRcdGtleUZyYW1lSW5kZXggPSBzay5rZXlGcmFtZXMubGVuZ3RoIC0gMTtcblxuXHRcdGZvcig7IGtleUZyYW1lSW5kZXggPj0gMDsga2V5RnJhbWVJbmRleC0tKSB7XG5cdFx0XHRfZmlsbFByb3BGb3JGcmFtZShzay5rZXlGcmFtZXNba2V5RnJhbWVJbmRleF0sIHByb3BMaXN0KTtcblx0XHR9XG5cdH07XG5cblx0dmFyIF9maWxsUHJvcEZvckZyYW1lID0gZnVuY3Rpb24oZnJhbWUsIHByb3BMaXN0KSB7XG5cdFx0dmFyIGtleTtcblxuXHRcdC8vRm9yIGVhY2gga2V5IGZyYW1lIGl0ZXJhdGUgb3ZlciBhbGwgcmlnaHQgaGFuZCBwcm9wZXJ0aWVzIGFuZCBhc3NpZ24gdGhlbSxcblx0XHQvL2J1dCBvbmx5IGlmIHRoZSBjdXJyZW50IGtleSBmcmFtZSBkb2Vzbid0IGhhdmUgdGhlIHByb3BlcnR5IGJ5IGl0c2VsZlxuXHRcdGZvcihrZXkgaW4gcHJvcExpc3QpIHtcblx0XHRcdC8vVGhlIGN1cnJlbnQgZnJhbWUgbWlzc2VzIHRoaXMgcHJvcGVydHksIHNvIGFzc2lnbiBpdC5cblx0XHRcdGlmKCFoYXNQcm9wLmNhbGwoZnJhbWUucHJvcHMsIGtleSkpIHtcblx0XHRcdFx0ZnJhbWUucHJvcHNba2V5XSA9IHByb3BMaXN0W2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9JdGVyYXRlIG92ZXIgYWxsIHByb3BzIG9mIHRoZSBjdXJyZW50IGZyYW1lIGFuZCBjb2xsZWN0IHRoZW1cblx0XHRmb3Ioa2V5IGluIGZyYW1lLnByb3BzKSB7XG5cdFx0XHRwcm9wTGlzdFtrZXldID0gZnJhbWUucHJvcHNba2V5XTtcblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIG5ldyB2YWx1ZXMgZm9yIHR3byBnaXZlbiB2YWx1ZXMgYXJyYXkuXG5cdCAqL1xuXHR2YXIgX2NhbGNJbnRlcnBvbGF0aW9uID0gZnVuY3Rpb24odmFsMSwgdmFsMiwgcHJvZ3Jlc3MpIHtcblx0XHR2YXIgdmFsdWVJbmRleDtcblx0XHR2YXIgdmFsMUxlbmd0aCA9IHZhbDEubGVuZ3RoO1xuXG5cdFx0Ly9UaGV5IGJvdGggbmVlZCB0byBoYXZlIHRoZSBzYW1lIGxlbmd0aFxuXHRcdGlmKHZhbDFMZW5ndGggIT09IHZhbDIubGVuZ3RoKSB7XG5cdFx0XHR0aHJvdyAnQ2FuXFwndCBpbnRlcnBvbGF0ZSBiZXR3ZWVuIFwiJyArIHZhbDFbMF0gKyAnXCIgYW5kIFwiJyArIHZhbDJbMF0gKyAnXCInO1xuXHRcdH1cblxuXHRcdC8vQWRkIHRoZSBmb3JtYXQgc3RyaW5nIGFzIGZpcnN0IGVsZW1lbnQuXG5cdFx0dmFyIGludGVycG9sYXRlZCA9IFt2YWwxWzBdXTtcblxuXHRcdHZhbHVlSW5kZXggPSAxO1xuXG5cdFx0Zm9yKDsgdmFsdWVJbmRleCA8IHZhbDFMZW5ndGg7IHZhbHVlSW5kZXgrKykge1xuXHRcdFx0Ly9UaGF0J3MgdGhlIGxpbmUgd2hlcmUgdGhlIHR3byBudW1iZXJzIGFyZSBhY3R1YWxseSBpbnRlcnBvbGF0ZWQuXG5cdFx0XHRpbnRlcnBvbGF0ZWRbdmFsdWVJbmRleF0gPSB2YWwxW3ZhbHVlSW5kZXhdICsgKCh2YWwyW3ZhbHVlSW5kZXhdIC0gdmFsMVt2YWx1ZUluZGV4XSkgKiBwcm9ncmVzcyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGludGVycG9sYXRlZDtcblx0fTtcblxuXHQvKipcblx0ICogSW50ZXJwb2xhdGVzIHRoZSBudW1lcmljIHZhbHVlcyBpbnRvIHRoZSBmb3JtYXQgc3RyaW5nLlxuXHQgKi9cblx0dmFyIF9pbnRlcnBvbGF0ZVN0cmluZyA9IGZ1bmN0aW9uKHZhbCkge1xuXHRcdHZhciB2YWx1ZUluZGV4ID0gMTtcblxuXHRcdHJ4SW50ZXJwb2xhdGVTdHJpbmcubGFzdEluZGV4ID0gMDtcblxuXHRcdHJldHVybiB2YWxbMF0ucmVwbGFjZShyeEludGVycG9sYXRlU3RyaW5nLCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB2YWxbdmFsdWVJbmRleCsrXTtcblx0XHR9KTtcblx0fTtcblxuXHQvKipcblx0ICogUmVzZXRzIHRoZSBjbGFzcyBhbmQgc3R5bGUgYXR0cmlidXRlIHRvIHdoYXQgaXQgd2FzIGJlZm9yZSBza3JvbGxyIG1hbmlwdWxhdGVkIHRoZSBlbGVtZW50LlxuXHQgKiBBbHNvIHJlbWVtYmVycyB0aGUgdmFsdWVzIGl0IGhhZCBiZWZvcmUgcmVzZXRpbmcsIGluIG9yZGVyIHRvIHVuZG8gdGhlIHJlc2V0LlxuXHQgKi9cblx0dmFyIF9yZXNldCA9IGZ1bmN0aW9uKGVsZW1lbnRzLCB1bmRvKSB7XG5cdFx0Ly9XZSBhY2NlcHQgYSBzaW5nbGUgZWxlbWVudCBvciBhbiBhcnJheSBvZiBlbGVtZW50cy5cblx0XHRlbGVtZW50cyA9IFtdLmNvbmNhdChlbGVtZW50cyk7XG5cblx0XHR2YXIgc2tyb2xsYWJsZTtcblx0XHR2YXIgZWxlbWVudDtcblx0XHR2YXIgZWxlbWVudHNJbmRleCA9IDA7XG5cdFx0dmFyIGVsZW1lbnRzTGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuXG5cdFx0Zm9yKDsgZWxlbWVudHNJbmRleCA8IGVsZW1lbnRzTGVuZ3RoOyBlbGVtZW50c0luZGV4KyspIHtcblx0XHRcdGVsZW1lbnQgPSBlbGVtZW50c1tlbGVtZW50c0luZGV4XTtcblx0XHRcdHNrcm9sbGFibGUgPSBfc2tyb2xsYWJsZXNbZWxlbWVudFtTS1JPTExBQkxFX0lEX0RPTV9QUk9QRVJUWV1dO1xuXG5cdFx0XHQvL0NvdWxkbid0IGZpbmQgdGhlIHNrcm9sbGFibGUgZm9yIHRoaXMgRE9NIGVsZW1lbnQuXG5cdFx0XHRpZighc2tyb2xsYWJsZSkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYodW5kbykge1xuXHRcdFx0XHQvL1Jlc2V0IGNsYXNzIGFuZCBzdHlsZSB0byB0aGUgXCJkaXJ0eVwiIChzZXQgYnkgc2tyb2xscikgdmFsdWVzLlxuXHRcdFx0XHRlbGVtZW50LnN0eWxlLmNzc1RleHQgPSBza3JvbGxhYmxlLmRpcnR5U3R5bGVBdHRyO1xuXHRcdFx0XHRfdXBkYXRlQ2xhc3MoZWxlbWVudCwgc2tyb2xsYWJsZS5kaXJ0eUNsYXNzQXR0cik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL1JlbWVtYmVyIHRoZSBcImRpcnR5XCIgKHNldCBieSBza3JvbGxyKSBjbGFzcyBhbmQgc3R5bGUuXG5cdFx0XHRcdHNrcm9sbGFibGUuZGlydHlTdHlsZUF0dHIgPSBlbGVtZW50LnN0eWxlLmNzc1RleHQ7XG5cdFx0XHRcdHNrcm9sbGFibGUuZGlydHlDbGFzc0F0dHIgPSBfZ2V0Q2xhc3MoZWxlbWVudCk7XG5cblx0XHRcdFx0Ly9SZXNldCBjbGFzcyBhbmQgc3R5bGUgdG8gd2hhdCBpdCBvcmlnaW5hbGx5IHdhcy5cblx0XHRcdFx0ZWxlbWVudC5zdHlsZS5jc3NUZXh0ID0gc2tyb2xsYWJsZS5zdHlsZUF0dHI7XG5cdFx0XHRcdF91cGRhdGVDbGFzcyhlbGVtZW50LCBza3JvbGxhYmxlLmNsYXNzQXR0cik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBEZXRlY3RzIHN1cHBvcnQgZm9yIDNkIHRyYW5zZm9ybXMgYnkgYXBwbHlpbmcgaXQgdG8gdGhlIHNrcm9sbHItYm9keS5cblx0ICovXG5cdHZhciBfZGV0ZWN0M0RUcmFuc2Zvcm1zID0gZnVuY3Rpb24oKSB7XG5cdFx0X3RyYW5zbGF0ZVogPSAndHJhbnNsYXRlWigwKSc7XG5cdFx0c2tyb2xsci5zZXRTdHlsZShfc2tyb2xsckJvZHksICd0cmFuc2Zvcm0nLCBfdHJhbnNsYXRlWik7XG5cblx0XHR2YXIgY29tcHV0ZWRTdHlsZSA9IGdldFN0eWxlKF9za3JvbGxyQm9keSk7XG5cdFx0dmFyIGNvbXB1dGVkVHJhbnNmb3JtID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCd0cmFuc2Zvcm0nKTtcblx0XHR2YXIgY29tcHV0ZWRUcmFuc2Zvcm1XaXRoUHJlZml4ID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKHRoZURhc2hlZENTU1ByZWZpeCArICd0cmFuc2Zvcm0nKTtcblx0XHR2YXIgaGFzM0QgPSAoY29tcHV0ZWRUcmFuc2Zvcm0gJiYgY29tcHV0ZWRUcmFuc2Zvcm0gIT09ICdub25lJykgfHwgKGNvbXB1dGVkVHJhbnNmb3JtV2l0aFByZWZpeCAmJiBjb21wdXRlZFRyYW5zZm9ybVdpdGhQcmVmaXggIT09ICdub25lJyk7XG5cblx0XHRpZighaGFzM0QpIHtcblx0XHRcdF90cmFuc2xhdGVaID0gJyc7XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIENTUyBwcm9wZXJ0eSBvbiB0aGUgZ2l2ZW4gZWxlbWVudC4gU2V0cyBwcmVmaXhlZCBwcm9wZXJ0aWVzIGFzIHdlbGwuXG5cdCAqL1xuXHRza3JvbGxyLnNldFN0eWxlID0gZnVuY3Rpb24oZWwsIHByb3AsIHZhbCkge1xuXHRcdHZhciBzdHlsZSA9IGVsLnN0eWxlO1xuXG5cdFx0Ly9DYW1lbCBjYXNlLlxuXHRcdHByb3AgPSBwcm9wLnJlcGxhY2UocnhDYW1lbENhc2UsIHJ4Q2FtZWxDYXNlRm4pLnJlcGxhY2UoJy0nLCAnJyk7XG5cblx0XHQvL01ha2Ugc3VyZSB6LWluZGV4IGdldHMgYSA8aW50ZWdlcj4uXG5cdFx0Ly9UaGlzIGlzIHRoZSBvbmx5IDxpbnRlZ2VyPiBjYXNlIHdlIG5lZWQgdG8gaGFuZGxlLlxuXHRcdGlmKHByb3AgPT09ICd6SW5kZXgnKSB7XG5cdFx0XHRpZihpc05hTih2YWwpKSB7XG5cdFx0XHRcdC8vSWYgaXQncyBub3QgYSBudW1iZXIsIGRvbid0IHRvdWNoIGl0LlxuXHRcdFx0XHQvL0l0IGNvdWxkIGZvciBleGFtcGxlIGJlIFwiYXV0b1wiICgjMzUxKS5cblx0XHRcdFx0c3R5bGVbcHJvcF0gPSB2YWw7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL0Zsb29yIHRoZSBudW1iZXIuXG5cdFx0XHRcdHN0eWxlW3Byb3BdID0gJycgKyAodmFsIHwgMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIzY0OiBcImZsb2F0XCIgY2FuJ3QgYmUgc2V0IGFjcm9zcyBicm93c2Vycy4gTmVlZHMgdG8gdXNlIFwiY3NzRmxvYXRcIiBmb3IgYWxsIGV4Y2VwdCBJRS5cblx0XHRlbHNlIGlmKHByb3AgPT09ICdmbG9hdCcpIHtcblx0XHRcdHN0eWxlLnN0eWxlRmxvYXQgPSBzdHlsZS5jc3NGbG9hdCA9IHZhbDtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHQvL05lZWQgdHJ5LWNhdGNoIGZvciBvbGQgSUUuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHQvL1NldCBwcmVmaXhlZCBwcm9wZXJ0eSBpZiB0aGVyZSdzIGEgcHJlZml4LlxuXHRcdFx0XHRpZih0aGVDU1NQcmVmaXgpIHtcblx0XHRcdFx0XHRzdHlsZVt0aGVDU1NQcmVmaXggKyBwcm9wLnNsaWNlKDAsMSkudG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSldID0gdmFsO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9TZXQgdW5wcmVmaXhlZC5cblx0XHRcdFx0c3R5bGVbcHJvcF0gPSB2YWw7XG5cdFx0XHR9IGNhdGNoKGlnbm9yZSkge31cblx0XHR9XG5cdH07XG5cblx0LyoqXG5cdCAqIENyb3NzIGJyb3dzZXIgZXZlbnQgaGFuZGxpbmcuXG5cdCAqL1xuXHR2YXIgX2FkZEV2ZW50ID0gc2tyb2xsci5hZGRFdmVudCA9IGZ1bmN0aW9uKGVsZW1lbnQsIG5hbWVzLCBjYWxsYmFjaykge1xuXHRcdHZhciBpbnRlcm1lZGlhdGUgPSBmdW5jdGlvbihlKSB7XG5cdFx0XHQvL05vcm1hbGl6ZSBJRSBldmVudCBzdHVmZi5cblx0XHRcdGUgPSBlIHx8IHdpbmRvdy5ldmVudDtcblxuXHRcdFx0aWYoIWUudGFyZ2V0KSB7XG5cdFx0XHRcdGUudGFyZ2V0ID0gZS5zcmNFbGVtZW50O1xuXHRcdFx0fVxuXG5cdFx0XHRpZighZS5wcmV2ZW50RGVmYXVsdCkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0ZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuXHRcdFx0XHRcdGUuZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBjYWxsYmFjay5jYWxsKHRoaXMsIGUpO1xuXHRcdH07XG5cblx0XHRuYW1lcyA9IG5hbWVzLnNwbGl0KCcgJyk7XG5cblx0XHR2YXIgbmFtZTtcblx0XHR2YXIgbmFtZUNvdW50ZXIgPSAwO1xuXHRcdHZhciBuYW1lc0xlbmd0aCA9IG5hbWVzLmxlbmd0aDtcblxuXHRcdGZvcig7IG5hbWVDb3VudGVyIDwgbmFtZXNMZW5ndGg7IG5hbWVDb3VudGVyKyspIHtcblx0XHRcdG5hbWUgPSBuYW1lc1tuYW1lQ291bnRlcl07XG5cblx0XHRcdGlmKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuXHRcdFx0XHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgY2FsbGJhY2ssIGZhbHNlKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVsZW1lbnQuYXR0YWNoRXZlbnQoJ29uJyArIG5hbWUsIGludGVybWVkaWF0ZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vUmVtZW1iZXIgdGhlIGV2ZW50cyB0byBiZSBhYmxlIHRvIGZsdXNoIHRoZW0gbGF0ZXIuXG5cdFx0XHRfcmVnaXN0ZXJlZEV2ZW50cy5wdXNoKHtcblx0XHRcdFx0ZWxlbWVudDogZWxlbWVudCxcblx0XHRcdFx0bmFtZTogbmFtZSxcblx0XHRcdFx0bGlzdGVuZXI6IGNhbGxiYWNrXG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG5cblx0dmFyIF9yZW1vdmVFdmVudCA9IHNrcm9sbHIucmVtb3ZlRXZlbnQgPSBmdW5jdGlvbihlbGVtZW50LCBuYW1lcywgY2FsbGJhY2spIHtcblx0XHRuYW1lcyA9IG5hbWVzLnNwbGl0KCcgJyk7XG5cblx0XHR2YXIgbmFtZUNvdW50ZXIgPSAwO1xuXHRcdHZhciBuYW1lc0xlbmd0aCA9IG5hbWVzLmxlbmd0aDtcblxuXHRcdGZvcig7IG5hbWVDb3VudGVyIDwgbmFtZXNMZW5ndGg7IG5hbWVDb3VudGVyKyspIHtcblx0XHRcdGlmKGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuXHRcdFx0XHRlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZXNbbmFtZUNvdW50ZXJdLCBjYWxsYmFjaywgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWxlbWVudC5kZXRhY2hFdmVudCgnb24nICsgbmFtZXNbbmFtZUNvdW50ZXJdLCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBfcmVtb3ZlQWxsRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGV2ZW50RGF0YTtcblx0XHR2YXIgZXZlbnRDb3VudGVyID0gMDtcblx0XHR2YXIgZXZlbnRzTGVuZ3RoID0gX3JlZ2lzdGVyZWRFdmVudHMubGVuZ3RoO1xuXG5cdFx0Zm9yKDsgZXZlbnRDb3VudGVyIDwgZXZlbnRzTGVuZ3RoOyBldmVudENvdW50ZXIrKykge1xuXHRcdFx0ZXZlbnREYXRhID0gX3JlZ2lzdGVyZWRFdmVudHNbZXZlbnRDb3VudGVyXTtcblxuXHRcdFx0X3JlbW92ZUV2ZW50KGV2ZW50RGF0YS5lbGVtZW50LCBldmVudERhdGEubmFtZSwgZXZlbnREYXRhLmxpc3RlbmVyKTtcblx0XHR9XG5cblx0XHRfcmVnaXN0ZXJlZEV2ZW50cyA9IFtdO1xuXHR9O1xuXG5cdHZhciBfZW1pdEV2ZW50ID0gZnVuY3Rpb24oZWxlbWVudCwgbmFtZSwgZGlyZWN0aW9uKSB7XG5cdFx0aWYoX2xpc3RlbmVycy5rZXlmcmFtZSkge1xuXHRcdFx0X2xpc3RlbmVycy5rZXlmcmFtZS5jYWxsKF9pbnN0YW5jZSwgZWxlbWVudCwgbmFtZSwgZGlyZWN0aW9uKTtcblx0XHR9XG5cdH07XG5cblx0dmFyIF9yZWZsb3cgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgcG9zID0gX2luc3RhbmNlLmdldFNjcm9sbFRvcCgpO1xuXG5cdFx0Ly9XaWxsIGJlIHJlY2FsY3VsYXRlZCBieSBfdXBkYXRlRGVwZW5kZW50S2V5RnJhbWVzLlxuXHRcdF9tYXhLZXlGcmFtZSA9IDA7XG5cblx0XHRpZihfZm9yY2VIZWlnaHQgJiYgIV9pc01vYmlsZSkge1xuXHRcdFx0Ly91bi1cImZvcmNlXCIgdGhlIGhlaWdodCB0byBub3QgbWVzcyB3aXRoIHRoZSBjYWxjdWxhdGlvbnMgaW4gX3VwZGF0ZURlcGVuZGVudEtleUZyYW1lcyAoIzIxNikuXG5cdFx0XHRib2R5LnN0eWxlLmhlaWdodCA9ICcnO1xuXHRcdH1cblxuXHRcdF91cGRhdGVEZXBlbmRlbnRLZXlGcmFtZXMoKTtcblxuXHRcdGlmKF9mb3JjZUhlaWdodCAmJiAhX2lzTW9iaWxlKSB7XG5cdFx0XHQvL1wiZm9yY2VcIiB0aGUgaGVpZ2h0LlxuXHRcdFx0Ym9keS5zdHlsZS5oZWlnaHQgPSAoX21heEtleUZyYW1lICsgZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCkgKyAncHgnO1xuXHRcdH1cblxuXHRcdC8vVGhlIHNjcm9sbCBvZmZzZXQgbWF5IG5vdyBiZSBsYXJnZXIgdGhhbiBuZWVkZWQgKG9uIGRlc2t0b3AgdGhlIGJyb3dzZXIvb3MgcHJldmVudHMgc2Nyb2xsaW5nIGZhcnRoZXIgdGhhbiB0aGUgYm90dG9tKS5cblx0XHRpZihfaXNNb2JpbGUpIHtcblx0XHRcdF9pbnN0YW5jZS5zZXRTY3JvbGxUb3AoTWF0aC5taW4oX2luc3RhbmNlLmdldFNjcm9sbFRvcCgpLCBfbWF4S2V5RnJhbWUpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9SZW1lbWJlciBhbmQgcmVzZXQgdGhlIHNjcm9sbCBwb3MgKCMyMTcpLlxuXHRcdFx0X2luc3RhbmNlLnNldFNjcm9sbFRvcChwb3MsIHRydWUpO1xuXHRcdH1cblxuXHRcdF9mb3JjZVJlbmRlciA9IHRydWU7XG5cdH07XG5cblx0Lypcblx0ICogUmV0dXJucyBhIGNvcHkgb2YgdGhlIGNvbnN0YW50cyBvYmplY3Qgd2hlcmUgYWxsIGZ1bmN0aW9ucyBhbmQgc3RyaW5ncyBoYXZlIGJlZW4gZXZhbHVhdGVkLlxuXHQgKi9cblx0dmFyIF9wcm9jZXNzQ29uc3RhbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHZpZXdwb3J0SGVpZ2h0ID0gZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcblx0XHR2YXIgY29weSA9IHt9O1xuXHRcdHZhciBwcm9wO1xuXHRcdHZhciB2YWx1ZTtcblxuXHRcdGZvcihwcm9wIGluIF9jb25zdGFudHMpIHtcblx0XHRcdHZhbHVlID0gX2NvbnN0YW50c1twcm9wXTtcblxuXHRcdFx0aWYodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWUuY2FsbChfaW5zdGFuY2UpO1xuXHRcdFx0fVxuXHRcdFx0Ly9QZXJjZW50YWdlIG9mZnNldC5cblx0XHRcdGVsc2UgaWYoKC9wJC8pLnRlc3QodmFsdWUpKSB7XG5cdFx0XHRcdHZhbHVlID0gKHZhbHVlLnNsaWNlKDAsIC0xKSAvIDEwMCkgKiB2aWV3cG9ydEhlaWdodDtcblx0XHRcdH1cblxuXHRcdFx0Y29weVtwcm9wXSA9IHZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBjb3B5O1xuXHR9O1xuXG5cdC8qXG5cdCAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgZG9jdW1lbnQuXG5cdCAqL1xuXHR2YXIgX2dldERvY3VtZW50SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNrcm9sbHJCb2R5SGVpZ2h0ID0gMDtcblx0XHR2YXIgYm9keUhlaWdodDtcblxuXHRcdGlmKF9za3JvbGxyQm9keSkge1xuXHRcdFx0c2tyb2xsckJvZHlIZWlnaHQgPSBNYXRoLm1heChfc2tyb2xsckJvZHkub2Zmc2V0SGVpZ2h0LCBfc2tyb2xsckJvZHkuc2Nyb2xsSGVpZ2h0KTtcblx0XHR9XG5cblx0XHRib2R5SGVpZ2h0ID0gTWF0aC5tYXgoc2tyb2xsckJvZHlIZWlnaHQsIGJvZHkuc2Nyb2xsSGVpZ2h0LCBib2R5Lm9mZnNldEhlaWdodCwgZG9jdW1lbnRFbGVtZW50LnNjcm9sbEhlaWdodCwgZG9jdW1lbnRFbGVtZW50Lm9mZnNldEhlaWdodCwgZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCk7XG5cblx0XHRyZXR1cm4gYm9keUhlaWdodCAtIGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG5cdH07XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBzdHJpbmcgb2Ygc3BhY2Ugc2VwYXJhdGVkIGNsYXNzbmFtZXMgZm9yIHRoZSBjdXJyZW50IGVsZW1lbnQuXG5cdCAqIFdvcmtzIHdpdGggU1ZHIGFzIHdlbGwuXG5cdCAqL1xuXHR2YXIgX2dldENsYXNzID0gZnVuY3Rpb24oZWxlbWVudCkge1xuXHRcdHZhciBwcm9wID0gJ2NsYXNzTmFtZSc7XG5cblx0XHQvL1NWRyBzdXBwb3J0IGJ5IHVzaW5nIGNsYXNzTmFtZS5iYXNlVmFsIGluc3RlYWQgb2YganVzdCBjbGFzc05hbWUuXG5cdFx0aWYod2luZG93LlNWR0VsZW1lbnQgJiYgZWxlbWVudCBpbnN0YW5jZW9mIHdpbmRvdy5TVkdFbGVtZW50KSB7XG5cdFx0XHRlbGVtZW50ID0gZWxlbWVudFtwcm9wXTtcblx0XHRcdHByb3AgPSAnYmFzZVZhbCc7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVsZW1lbnRbcHJvcF07XG5cdH07XG5cblx0LyoqXG5cdCAqIEFkZHMgYW5kIHJlbW92ZXMgYSBDU1MgY2xhc3Nlcy5cblx0ICogV29ya3Mgd2l0aCBTVkcgYXMgd2VsbC5cblx0ICogYWRkIGFuZCByZW1vdmUgYXJlIGFycmF5cyBvZiBzdHJpbmdzLFxuXHQgKiBvciBpZiByZW1vdmUgaXMgb21taXRlZCBhZGQgaXMgYSBzdHJpbmcgYW5kIG92ZXJ3cml0ZXMgYWxsIGNsYXNzZXMuXG5cdCAqL1xuXHR2YXIgX3VwZGF0ZUNsYXNzID0gZnVuY3Rpb24oZWxlbWVudCwgYWRkLCByZW1vdmUpIHtcblx0XHR2YXIgcHJvcCA9ICdjbGFzc05hbWUnO1xuXG5cdFx0Ly9TVkcgc3VwcG9ydCBieSB1c2luZyBjbGFzc05hbWUuYmFzZVZhbCBpbnN0ZWFkIG9mIGp1c3QgY2xhc3NOYW1lLlxuXHRcdGlmKHdpbmRvdy5TVkdFbGVtZW50ICYmIGVsZW1lbnQgaW5zdGFuY2VvZiB3aW5kb3cuU1ZHRWxlbWVudCkge1xuXHRcdFx0ZWxlbWVudCA9IGVsZW1lbnRbcHJvcF07XG5cdFx0XHRwcm9wID0gJ2Jhc2VWYWwnO1xuXHRcdH1cblxuXHRcdC8vV2hlbiByZW1vdmUgaXMgb21taXRlZCwgd2Ugd2FudCB0byBvdmVyd3JpdGUvc2V0IHRoZSBjbGFzc2VzLlxuXHRcdGlmKHJlbW92ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRlbGVtZW50W3Byb3BdID0gYWRkO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vQ2FjaGUgY3VycmVudCBjbGFzc2VzLiBXZSB3aWxsIHdvcmsgb24gYSBzdHJpbmcgYmVmb3JlIHBhc3NpbmcgYmFjayB0byBET00uXG5cdFx0dmFyIHZhbCA9IGVsZW1lbnRbcHJvcF07XG5cblx0XHQvL0FsbCBjbGFzc2VzIHRvIGJlIHJlbW92ZWQuXG5cdFx0dmFyIGNsYXNzUmVtb3ZlSW5kZXggPSAwO1xuXHRcdHZhciByZW1vdmVMZW5ndGggPSByZW1vdmUubGVuZ3RoO1xuXG5cdFx0Zm9yKDsgY2xhc3NSZW1vdmVJbmRleCA8IHJlbW92ZUxlbmd0aDsgY2xhc3NSZW1vdmVJbmRleCsrKSB7XG5cdFx0XHR2YWwgPSBfdW50cmltKHZhbCkucmVwbGFjZShfdW50cmltKHJlbW92ZVtjbGFzc1JlbW92ZUluZGV4XSksICcgJyk7XG5cdFx0fVxuXG5cdFx0dmFsID0gX3RyaW0odmFsKTtcblxuXHRcdC8vQWxsIGNsYXNzZXMgdG8gYmUgYWRkZWQuXG5cdFx0dmFyIGNsYXNzQWRkSW5kZXggPSAwO1xuXHRcdHZhciBhZGRMZW5ndGggPSBhZGQubGVuZ3RoO1xuXG5cdFx0Zm9yKDsgY2xhc3NBZGRJbmRleCA8IGFkZExlbmd0aDsgY2xhc3NBZGRJbmRleCsrKSB7XG5cdFx0XHQvL09ubHkgYWRkIGlmIGVsIG5vdCBhbHJlYWR5IGhhcyBjbGFzcy5cblx0XHRcdGlmKF91bnRyaW0odmFsKS5pbmRleE9mKF91bnRyaW0oYWRkW2NsYXNzQWRkSW5kZXhdKSkgPT09IC0xKSB7XG5cdFx0XHRcdHZhbCArPSAnICcgKyBhZGRbY2xhc3NBZGRJbmRleF07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZWxlbWVudFtwcm9wXSA9IF90cmltKHZhbCk7XG5cdH07XG5cblx0dmFyIF90cmltID0gZnVuY3Rpb24oYSkge1xuXHRcdHJldHVybiBhLnJlcGxhY2UocnhUcmltLCAnJyk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBzcGFjZSBiZWZvcmUgYW5kIGFmdGVyIHRoZSBzdHJpbmcuXG5cdCAqL1xuXHR2YXIgX3VudHJpbSA9IGZ1bmN0aW9uKGEpIHtcblx0XHRyZXR1cm4gJyAnICsgYSArICcgJztcblx0fTtcblxuXHR2YXIgX25vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiArbmV3IERhdGUoKTtcblx0fTtcblxuXHR2YXIgX2tleUZyYW1lQ29tcGFyYXRvciA9IGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRyZXR1cm4gYS5mcmFtZSAtIGIuZnJhbWU7XG5cdH07XG5cblx0Lypcblx0ICogUHJpdmF0ZSB2YXJpYWJsZXMuXG5cdCAqL1xuXG5cdC8vU2luZ2xldG9uXG5cdHZhciBfaW5zdGFuY2U7XG5cblx0Lypcblx0XHRBIGxpc3Qgb2YgYWxsIGVsZW1lbnRzIHdoaWNoIHNob3VsZCBiZSBhbmltYXRlZCBhc3NvY2lhdGVkIHdpdGggdGhlaXIgdGhlIG1ldGFkYXRhLlxuXHRcdEV4bWFwbGUgc2tyb2xsYWJsZSB3aXRoIHR3byBrZXkgZnJhbWVzIGFuaW1hdGluZyBmcm9tIDEwMHB4IHdpZHRoIHRvIDIwcHg6XG5cblx0XHRza3JvbGxhYmxlID0ge1xuXHRcdFx0ZWxlbWVudDogPHRoZSBET00gZWxlbWVudD4sXG5cdFx0XHRzdHlsZUF0dHI6IDxzdHlsZSBhdHRyaWJ1dGUgb2YgdGhlIGVsZW1lbnQgYmVmb3JlIHNrcm9sbHI+LFxuXHRcdFx0Y2xhc3NBdHRyOiA8Y2xhc3MgYXR0cmlidXRlIG9mIHRoZSBlbGVtZW50IGJlZm9yZSBza3JvbGxyPixcblx0XHRcdGtleUZyYW1lczogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZnJhbWU6IDEwMCxcblx0XHRcdFx0XHRwcm9wczoge1xuXHRcdFx0XHRcdFx0d2lkdGg6IHtcblx0XHRcdFx0XHRcdFx0dmFsdWU6IFsnez99cHgnLCAxMDBdLFxuXHRcdFx0XHRcdFx0XHRlYXNpbmc6IDxyZWZlcmVuY2UgdG8gZWFzaW5nIGZ1bmN0aW9uPlxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZTogXCJhYnNvbHV0ZVwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmcmFtZTogMjAwLFxuXHRcdFx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdFx0XHR3aWR0aDoge1xuXHRcdFx0XHRcdFx0XHR2YWx1ZTogWyd7P31weCcsIDIwXSxcblx0XHRcdFx0XHRcdFx0ZWFzaW5nOiA8cmVmZXJlbmNlIHRvIGVhc2luZyBmdW5jdGlvbj5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1vZGU6IFwiYWJzb2x1dGVcIlxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fTtcblx0Ki9cblx0dmFyIF9za3JvbGxhYmxlcztcblxuXHR2YXIgX3Nrcm9sbHJCb2R5O1xuXG5cdHZhciBfbGlzdGVuZXJzO1xuXHR2YXIgX2ZvcmNlSGVpZ2h0O1xuXHR2YXIgX21heEtleUZyYW1lID0gMDtcblxuXHR2YXIgX3NjYWxlID0gMTtcblx0dmFyIF9jb25zdGFudHM7XG5cblx0dmFyIF9tb2JpbGVEZWNlbGVyYXRpb247XG5cblx0Ly9DdXJyZW50IGRpcmVjdGlvbiAodXAvZG93bikuXG5cdHZhciBfZGlyZWN0aW9uID0gJ2Rvd24nO1xuXG5cdC8vVGhlIGxhc3QgdG9wIG9mZnNldCB2YWx1ZS4gTmVlZGVkIHRvIGRldGVybWluZSBkaXJlY3Rpb24uXG5cdHZhciBfbGFzdFRvcCA9IC0xO1xuXG5cdC8vVGhlIGxhc3QgdGltZSB3ZSBjYWxsZWQgdGhlIHJlbmRlciBtZXRob2QgKGRvZXNuJ3QgbWVhbiB3ZSByZW5kZXJlZCEpLlxuXHR2YXIgX2xhc3RSZW5kZXJDYWxsID0gX25vdygpO1xuXG5cdC8vRm9yIGRldGVjdGluZyBpZiBpdCBhY3R1YWxseSByZXNpemVkICgjMjcxKS5cblx0dmFyIF9sYXN0Vmlld3BvcnRXaWR0aCA9IDA7XG5cdHZhciBfbGFzdFZpZXdwb3J0SGVpZ2h0ID0gMDtcblxuXHR2YXIgX3JlcXVlc3RSZWZsb3cgPSBmYWxzZTtcblxuXHQvL1dpbGwgY29udGFpbiBkYXRhIGFib3V0IGEgcnVubmluZyBzY3JvbGxiYXIgYW5pbWF0aW9uLCBpZiBhbnkuXG5cdHZhciBfc2Nyb2xsQW5pbWF0aW9uO1xuXG5cdHZhciBfc21vb3RoU2Nyb2xsaW5nRW5hYmxlZDtcblxuXHR2YXIgX3Ntb290aFNjcm9sbGluZ0R1cmF0aW9uO1xuXG5cdC8vV2lsbCBjb250YWluIHNldHRpbnMgZm9yIHNtb290aCBzY3JvbGxpbmcgaWYgZW5hYmxlZC5cblx0dmFyIF9zbW9vdGhTY3JvbGxpbmc7XG5cblx0Ly9DYW4gYmUgc2V0IGJ5IGFueSBvcGVyYXRpb24vZXZlbnQgdG8gZm9yY2UgcmVuZGVyaW5nIGV2ZW4gaWYgdGhlIHNjcm9sbGJhciBkaWRuJ3QgbW92ZS5cblx0dmFyIF9mb3JjZVJlbmRlcjtcblxuXHQvL0VhY2ggc2tyb2xsYWJsZSBnZXRzIGFuIHVuaXF1ZSBJRCBpbmNyZW1lbnRlZCBmb3IgZWFjaCBza3JvbGxhYmxlLlxuXHQvL1RoZSBJRCBpcyB0aGUgaW5kZXggaW4gdGhlIF9za3JvbGxhYmxlcyBhcnJheS5cblx0dmFyIF9za3JvbGxhYmxlSWRDb3VudGVyID0gMDtcblxuXHR2YXIgX2VkZ2VTdHJhdGVneTtcblxuXG5cdC8vTW9iaWxlIHNwZWNpZmljIHZhcnMuIFdpbGwgYmUgc3RyaXBwZWQgYnkgVWdsaWZ5SlMgd2hlbiBub3QgaW4gdXNlLlxuXHR2YXIgX2lzTW9iaWxlID0gZmFsc2U7XG5cblx0Ly9UaGUgdmlydHVhbCBzY3JvbGwgb2Zmc2V0IHdoZW4gdXNpbmcgbW9iaWxlIHNjcm9sbGluZy5cblx0dmFyIF9tb2JpbGVPZmZzZXQgPSAwO1xuXG5cdC8vSWYgdGhlIGJyb3dzZXIgc3VwcG9ydHMgM2QgdHJhbnNmb3JtcywgdGhpcyB3aWxsIGJlIGZpbGxlZCB3aXRoICd0cmFuc2xhdGVaKDApJyAoZW1wdHkgc3RyaW5nIG90aGVyd2lzZSkuXG5cdHZhciBfdHJhbnNsYXRlWjtcblxuXHQvL1dpbGwgY29udGFpbiBkYXRhIGFib3V0IHJlZ2lzdGVyZWQgZXZlbnRzIGJ5IHNrcm9sbHIuXG5cdHZhciBfcmVnaXN0ZXJlZEV2ZW50cyA9IFtdO1xuXG5cdC8vQW5pbWF0aW9uIGZyYW1lIGlkIHJldHVybmVkIGJ5IFJlcXVlc3RBbmltYXRpb25GcmFtZSAob3IgdGltZW91dCB3aGVuIFJBRiBpcyBub3Qgc3VwcG9ydGVkKS5cblx0dmFyIF9hbmltRnJhbWU7XG5cblx0Ly9FeHBvc2Ugc2tyb2xsciBhcyBlaXRoZXIgYSBnbG9iYWwgdmFyaWFibGUgb3IgYSByZXF1aXJlLmpzIG1vZHVsZS5cblx0aWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gc2tyb2xscjtcblx0XHR9KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gc2tyb2xscjtcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuc2tyb2xsciA9IHNrcm9sbHI7XG5cdH1cblxufSh3aW5kb3csIGRvY3VtZW50KSk7XG4iLCIvKiFcbiAqIHNrcm9sbHIgc3R5bGVzaGVldHMuXG4gKiBQYXJzZXMgc3R5bGVzaGVldHMgYW5kIHNlYXJjaGVzIGZvciBza3JvbGxyIGtleWZyYW1lIGRlY2xhcmF0aW9ucy5cbiAqIENvbnZlcnRzIHRoZW0gdG8gZGF0YS1hdHRyaWJ1dGVzLlxuICogRG9lc24ndCBleHBvc2UgYW55IGdsb2JhbHMuXG4gKi9cblxuKGZ1bmN0aW9uKHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIGNvbnRlbnQ7XG5cdHZhciBjb250ZW50cyA9IFtdO1xuXG5cdC8vRmluZHMgdGhlIGRlY2xhcmF0aW9uIG9mIGFuIGFuaW1hdGlvbiBibG9jay5cblx0dmFyIHJ4QW5pbWF0aW9uID0gL0Atc2tyb2xsci1rZXlmcmFtZXNcXHMrKFtcXHctXSspL2c7XG5cblx0Ly9GaW5kcyB0aGUgYmxvY2sgb2Yga2V5ZnJhbWVzIGluc2lkZSBhbiBhbmltYXRpb24gYmxvY2suXG5cdC8vaHR0cDovL3JlZ2V4cGFsLmNvbS8gc2F2ZXMgeW91ciBhc3Mgd2l0aCBzdHVmZiBsaWtlIHRoaXMuXG5cdHZhciByeEtleWZyYW1lcyA9IC9cXHMqXFx7XFxzKigoPzpbXntdK1xce1tefV0qXFx9XFxzKikrPylcXHMqXFx9L2c7XG5cblx0Ly9HZXRzIGEgc2luZ2xlIGtleWZyYW1lIGFuZCB0aGUgcHJvcGVydGllcyBpbnNpZGUuXG5cdHZhciByeFNpbmdsZUtleWZyYW1lID0gLyhbXFx3XFwtXSspXFxzKlxceyhbXn1dKylcXH0vZztcblxuXHQvL09wdGlvbmFsIGtleWZyYW1lIG5hbWUgcHJlZml4IHRvIHdvcmsgYXJvdW5kIFNBU1MgKD4zLjQpIGlzc3Vlc1xuXHR2YXIga2V5ZnJhbWVOYW1lT3B0aW9uYWxQcmVmaXggPSAnc2tyb2xsci0nO1xuXG5cdC8vRmluZHMgdXNhZ2VzIG9mIHRoZSBhbmltYXRpb24uXG5cdHZhciByeEFuaW1hdGlvblVzYWdlID0gLy1za3JvbGxyLWFuaW1hdGlvbi1uYW1lXFxzKjpcXHMqKFtcXHctXSspL2c7XG5cblx0Ly9GaW5kcyB1c2FnZXMgb2YgYXR0cmlidXRlIHNldHRlcnMuXG5cdHZhciByeEF0dHJpYnV0ZVNldHRlciA9IC8tc2tyb2xsci0oYW5jaG9yLXRhcmdldHxzbW9vdGgtc2Nyb2xsaW5nfGVtaXQtZXZlbnRzfG1lbnUtb2Zmc2V0KVxccyo6XFxzKlsnXCJdKFteJ1wiXSspWydcIl0vZztcblxuXHR2YXIgZmV0Y2hSZW1vdGUgPSBmdW5jdGlvbih1cmwpIHtcblx0XHR2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cblx0XHQvKlxuXHRcdCAqIFllcywgdGhlc2UgYXJlIFNZTkNIUk9OT1VTIHJlcXVlc3RzLlxuXHRcdCAqIFNpbXBseSBiZWNhdXNlIHNrcm9sbHIgc3R5bGVzaGVldHMgc2hvdWxkIHJ1biB3aGlsZSB0aGUgcGFnZSBpcyBsb2FkZWQuXG5cdFx0ICogR2V0IG92ZXIgaXQuXG5cdFx0ICovXG5cdFx0dHJ5IHtcblx0XHRcdHhoci5vcGVuKCdHRVQnLCB1cmwsIGZhbHNlKTtcblx0XHRcdHhoci5zZW5kKG51bGwpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vRmFsbGJhY2sgdG8gWERvbWFpblJlcXVlc3QgaWYgYXZhaWxhYmxlXG5cdFx0XHRpZiAod2luZG93LlhEb21haW5SZXF1ZXN0KSB7XG5cdFx0XHRcdHhociA9IG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuXHRcdFx0XHR4aHIub3BlbignR0VUJywgdXJsLCBmYWxzZSk7XG5cdFx0XHRcdHhoci5zZW5kKG51bGwpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB4aHIucmVzcG9uc2VUZXh0O1xuXHR9O1xuXG5cdC8vXCJtYWluXCJcblx0dmFyIGtpY2tzdGFydCA9IGZ1bmN0aW9uKHN0eWxlc2hlZXRzKSB7XG5cdFx0Ly9JdGVyYXRlIG92ZXIgYWxsIHN0eWxlc2hlZXRzLCBlbWJlZGRlZCBhbmQgcmVtb3RlLlxuXHRcdGZvcih2YXIgc3R5bGVzaGVldEluZGV4ID0gMDsgc3R5bGVzaGVldEluZGV4IDwgc3R5bGVzaGVldHMubGVuZ3RoOyBzdHlsZXNoZWV0SW5kZXgrKykge1xuXHRcdFx0dmFyIHNoZWV0ID0gc3R5bGVzaGVldHNbc3R5bGVzaGVldEluZGV4XTtcblxuXHRcdFx0aWYoc2hlZXQudGFnTmFtZSA9PT0gJ0xJTksnKSB7XG5cdFx0XHRcdGlmKHNoZWV0LmdldEF0dHJpYnV0ZSgnZGF0YS1za3JvbGxyLXN0eWxlc2hlZXQnKSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9UZXN0IG1lZGlhIGF0dHJpYnV0ZSBpZiBtYXRjaE1lZGlhIGF2YWlsYWJsZS5cblx0XHRcdFx0aWYod2luZG93Lm1hdGNoTWVkaWEpIHtcblx0XHRcdFx0XHR2YXIgbWVkaWEgPSBzaGVldC5nZXRBdHRyaWJ1dGUoJ21lZGlhJyk7XG5cblx0XHRcdFx0XHRpZihtZWRpYSAmJiAhbWF0Y2hNZWRpYShtZWRpYSkubWF0Y2hlcykge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9SZW1vdGUgc3R5bGVzaGVldCwgZmV0Y2ggaXQgKHN5bmNocm5vbm91cykuXG5cdFx0XHRcdGNvbnRlbnQgPSBmZXRjaFJlbW90ZShzaGVldC5ocmVmKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vRW1iZWRkZWQgc3R5bGVzaGVldCwgZ3JhYiB0aGUgbm9kZSBjb250ZW50LlxuXHRcdFx0XHRjb250ZW50ID0gc2hlZXQudGV4dENvbnRlbnQgfHwgc2hlZXQuaW5uZXJUZXh0IHx8IHNoZWV0LmlubmVySFRNTDtcblx0XHRcdH1cblxuXHRcdFx0aWYoY29udGVudCkge1xuXHRcdFx0XHRjb250ZW50cy5wdXNoKGNvbnRlbnQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vV2UgdGFrZSB0aGUgc3R5bGVzaGVldHMgaW4gcmV2ZXJzZSBvcmRlci5cblx0XHQvL1RoaXMgaXMgbmVlZGVkIHRvIGVuc3VyZSBjb3JyZWN0IG9yZGVyIG9mIHN0eWxlc2hlZXRzIGFuZCBpbmxpbmUgc3R5bGVzLlxuXHRcdGNvbnRlbnRzLnJldmVyc2UoKTtcblxuXHRcdHZhciBhbmltYXRpb25zID0ge307XG5cdFx0dmFyIHNlbGVjdG9ycyA9IFtdO1xuXHRcdHZhciBhdHRyaWJ1dGVzID0gW107XG5cblx0XHQvL05vdyBwYXJzZSBhbGwgc3R5bGVzaGVldHMuXG5cdFx0Zm9yKHZhciBjb250ZW50SW5kZXggPSAwOyBjb250ZW50SW5kZXggPCBjb250ZW50cy5sZW5ndGg7IGNvbnRlbnRJbmRleCsrKSB7XG5cdFx0XHRjb250ZW50ID0gY29udGVudHNbY29udGVudEluZGV4XTtcblxuXHRcdFx0cGFyc2VBbmltYXRpb25EZWNsYXJhdGlvbnMoY29udGVudCwgYW5pbWF0aW9ucyk7XG5cdFx0XHRwYXJzZUFuaW1hdGlvblVzYWdlKGNvbnRlbnQsIHNlbGVjdG9ycyk7XG5cdFx0XHRwYXJzZUF0dHJpYnV0ZVNldHRlcnMoY29udGVudCwgYXR0cmlidXRlcyk7XG5cdFx0fVxuXG5cdFx0YXBwbHlLZXlmcmFtZUF0dHJpYnV0ZXMoYW5pbWF0aW9ucywgc2VsZWN0b3JzKTtcblx0XHRhcHBseUF0dHJpYnV0ZVNldHRlcnMoYXR0cmlidXRlcyk7XG5cdH07XG5cblx0Ly9GaW5kcyBhbmltYXRpb24gZGVjbGFyYXRpb25zIGFuZCBwdXRzIHRoZW0gaW50byB0aGUgb3V0cHV0IG1hcC5cblx0dmFyIHBhcnNlQW5pbWF0aW9uRGVjbGFyYXRpb25zID0gZnVuY3Rpb24oaW5wdXQsIG91dHB1dCkge1xuXHRcdHJ4QW5pbWF0aW9uLmxhc3RJbmRleCA9IDA7XG5cblx0XHR2YXIgYW5pbWF0aW9uO1xuXHRcdHZhciByYXdLZXlmcmFtZXM7XG5cdFx0dmFyIGtleWZyYW1lO1xuXHRcdHZhciBjdXJBbmltYXRpb247XG5cblx0XHR3aGlsZSgoYW5pbWF0aW9uID0gcnhBbmltYXRpb24uZXhlYyhpbnB1dCkpICE9PSBudWxsKSB7XG5cdFx0XHQvL0dyYWIgdGhlIGtleWZyYW1lcyBpbnNpZGUgdGhpcyBhbmltYXRpb24uXG5cdFx0XHRyeEtleWZyYW1lcy5sYXN0SW5kZXggPSByeEFuaW1hdGlvbi5sYXN0SW5kZXg7XG5cdFx0XHRyYXdLZXlmcmFtZXMgPSByeEtleWZyYW1lcy5leGVjKGlucHV0KTtcblxuXHRcdFx0Ly9HcmFiIHRoZSBzaW5nbGUga2V5ZnJhbWVzIHdpdGggdGhlaXIgQ1NTIHByb3BlcnRpZXMuXG5cdFx0XHRyeFNpbmdsZUtleWZyYW1lLmxhc3RJbmRleCA9IDA7XG5cblx0XHRcdC8vU2F2ZSB0aGUgYW5pbWF0aW9uIGluIGFuIG9iamVjdCB1c2luZyBpdCdzIG5hbWUgYXMga2V5LlxuXHRcdFx0Y3VyQW5pbWF0aW9uID0gb3V0cHV0W2FuaW1hdGlvblsxXV0gPSB7fTtcblxuXHRcdFx0d2hpbGUoKGtleWZyYW1lID0gcnhTaW5nbGVLZXlmcmFtZS5leGVjKHJhd0tleWZyYW1lc1sxXSkpICE9PSBudWxsKSB7XG5cdFx0XHRcdC8vUHV0IGFsbCBrZXlmcmFtZXMgaW5zaWRlIHRoZSBhbmltYXRpb24gdXNpbmcgdGhlIGtleWZyYW1lIChsaWtlIGJvdHR0b20tdG9wLCBvciAxMDApIGFzIGtleVxuXHRcdFx0XHQvL2FuZCB0aGUgcHJvcGVydGllcyBhcyB2YWx1ZSAoanVzdCB0aGUgcmF3IHN0cmluZywgbmV3bGluZSBzdHJpcHBlZCkuXG5cdFx0XHRcdGN1ckFuaW1hdGlvbltrZXlmcmFtZVsxXV0gPSBrZXlmcmFtZVsyXS5yZXBsYWNlKC9bXFxuXFxyXFx0XS9nLCAnJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8vRXh0cmFjdHMgdGhlIHNlbGVjdG9yIG9mIHRoZSBnaXZlbiBibG9jayBieSB3YWxraW5nIGJhY2t3YXJkcyB0byB0aGUgc3RhcnQgb2YgdGhlIGJsb2NrLlxuXHR2YXIgZXh0cmFjdFNlbGVjdG9yID0gZnVuY3Rpb24oaW5wdXQsIHN0YXJ0SW5kZXgpIHtcblx0XHR2YXIgYmVnaW47XG5cdFx0dmFyIGVuZCA9IHN0YXJ0SW5kZXg7XG5cblx0XHQvL0ZpcnN0IGZpbmQgdGhlIGN1cmx5IGJyYWNrZXQgdGhhdCBvcGVucyB0aGlzIGJsb2NrLlxuXHRcdHdoaWxlKGVuZC0tICYmIGlucHV0LmNoYXJBdChlbmQpICE9PSAneycpIHt9XG5cblx0XHQvL1RoZSBlbmQgaXMgbm93IGZpeGVkIHRvIHRoZSByaWdodCBvZiB0aGUgc2VsZWN0b3IuXG5cdFx0Ly9Ob3cgc3RhcnQgdGhlcmUgdG8gZmluZCB0aGUgYmVnaW4gb2YgdGhlIHNlbGVjdG9yLlxuXHRcdGJlZ2luID0gZW5kO1xuXG5cdFx0Ly9Ob3cgd2FsayBmYXJ0aGVyIGJhY2t3YXJkcyB1bnRpbCB3ZSBncmFiYmVkIHRoZSB3aG9sZSBzZWxlY3Rvci5cblx0XHQvL1RoaXMgZWl0aGVyIGVuZHMgYXQgYmVnaW5uaW5nIG9mIHN0cmluZyBvciBhdCBlbmQgb2YgbmV4dCBibG9jay5cblx0XHR3aGlsZShiZWdpbi0tICYmIGlucHV0LmNoYXJBdChiZWdpbiAtIDEpICE9PSAnfScpIHt9XG5cblx0XHQvL1JldHVybiB0aGUgY2xlYW5lZCBzZWxlY3Rvci5cblx0XHRyZXR1cm4gaW5wdXQuc3Vic3RyaW5nKGJlZ2luLCBlbmQpLnJlcGxhY2UoL1tcXG5cXHJcXHRdL2csICcnKTtcblx0fTtcblxuXHQvL0ZpbmRzIHVzYWdlIG9mIGFuaW1hdGlvbnMgYW5kIHB1dHMgdGhlIHNlbGVjdG9ycyBpbnRvIHRoZSBvdXRwdXQgYXJyYXkuXG5cdHZhciBwYXJzZUFuaW1hdGlvblVzYWdlID0gZnVuY3Rpb24oaW5wdXQsIG91dHB1dCkge1xuXHRcdHZhciBtYXRjaDtcblx0XHR2YXIgc2VsZWN0b3I7XG5cblx0XHRyeEFuaW1hdGlvblVzYWdlLmxhc3RJbmRleCA9IDA7XG5cblx0XHR3aGlsZSgobWF0Y2ggPSByeEFuaW1hdGlvblVzYWdlLmV4ZWMoaW5wdXQpKSAhPT0gbnVsbCkge1xuXHRcdFx0Ly9FeHRyYWN0IHRoZSBzZWxlY3RvciBvZiB0aGUgYmxvY2sgd2UgZm91bmQgdGhlIGFuaW1hdGlvbiBpbi5cblx0XHRcdHNlbGVjdG9yID0gZXh0cmFjdFNlbGVjdG9yKGlucHV0LCByeEFuaW1hdGlvblVzYWdlLmxhc3RJbmRleCk7XG5cblx0XHRcdC8vQXNzb2NpYXRlIHRoaXMgc2VsZWN0b3Igd2l0aCB0aGUgYW5pbWF0aW9uIG5hbWUuXG5cdFx0XHRvdXRwdXQucHVzaChbc2VsZWN0b3IsIG1hdGNoWzFdXSk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vRmluZHMgdXNhZ2Ugb2YgYXR0cmlidXRlIHNldHRlcnMgYW5kIHB1dHMgdGhlIHNlbGVjdG9yIGFuZCBhdHRyaWJ1dGUgZGF0YSBpbnRvIHRoZSBvdXRwdXQgYXJyYXkuXG5cdHZhciBwYXJzZUF0dHJpYnV0ZVNldHRlcnMgPSBmdW5jdGlvbihpbnB1dCwgb3V0cHV0KSB7XG5cdFx0dmFyIG1hdGNoO1xuXHRcdHZhciBzZWxlY3RvcjtcblxuXHRcdHJ4QXR0cmlidXRlU2V0dGVyLmxhc3RJbmRleCA9IDA7XG5cblx0XHR3aGlsZSgobWF0Y2ggPSByeEF0dHJpYnV0ZVNldHRlci5leGVjKGlucHV0KSkgIT09IG51bGwpIHtcblx0XHRcdC8vRXh0cmFjdCB0aGUgc2VsZWN0b3Igb2YgdGhlIGJsb2NrIHdlIGZvdW5kIHRoZSBhbmltYXRpb24gaW4uXG5cdFx0XHRzZWxlY3RvciA9IGV4dHJhY3RTZWxlY3RvcihpbnB1dCwgcnhBdHRyaWJ1dGVTZXR0ZXIubGFzdEluZGV4KTtcblxuXHRcdFx0Ly9Bc3NvY2lhdGUgdGhpcyBzZWxlY3RvciB3aXRoIHRoZSBhdHRyaWJ1dGUgbmFtZSBhbmQgdmFsdWUuXG5cdFx0XHRvdXRwdXQucHVzaChbc2VsZWN0b3IsIG1hdGNoWzFdLCBtYXRjaFsyXV0pO1xuXHRcdH1cblx0fTtcblxuXHQvL0FwcGxpZXMgdGhlIGtleWZyYW1lcyAoYXMgZGF0YS1hdHRyaWJ1dGVzKSB0byB0aGUgZWxlbWVudHMuXG5cdHZhciBhcHBseUtleWZyYW1lQXR0cmlidXRlcyA9IGZ1bmN0aW9uKGFuaW1hdGlvbnMsIHNlbGVjdG9ycykge1xuXHRcdHZhciBlbGVtZW50cztcblx0XHR2YXIga2V5ZnJhbWVzO1xuXHRcdHZhciBrZXlmcmFtZU5hbWU7XG5cdFx0dmFyIGNsZWFuS2V5ZnJhbWVOYW1lO1xuXHRcdHZhciBlbGVtZW50SW5kZXg7XG5cdFx0dmFyIGF0dHJpYnV0ZU5hbWU7XG5cdFx0dmFyIGF0dHJpYnV0ZVZhbHVlO1xuXHRcdHZhciBjdXJFbGVtZW50O1xuXG5cdFx0Zm9yKHZhciBzZWxlY3RvckluZGV4ID0gMDsgc2VsZWN0b3JJbmRleCA8IHNlbGVjdG9ycy5sZW5ndGg7IHNlbGVjdG9ySW5kZXgrKykge1xuXHRcdFx0ZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yc1tzZWxlY3RvckluZGV4XVswXSk7XG5cblx0XHRcdGlmKCFlbGVtZW50cykge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0a2V5ZnJhbWVzID0gYW5pbWF0aW9uc1tzZWxlY3RvcnNbc2VsZWN0b3JJbmRleF1bMV1dO1xuXG5cdFx0XHRmb3Ioa2V5ZnJhbWVOYW1lIGluIGtleWZyYW1lcykge1xuXHRcdFx0XHRpZihrZXlmcmFtZU5hbWUuaW5kZXhPZihrZXlmcmFtZU5hbWVPcHRpb25hbFByZWZpeCkgPT09IDApIHtcblx0XHRcdFx0XHRjbGVhbktleWZyYW1lTmFtZSA9IGtleWZyYW1lTmFtZS5zdWJzdHJpbmcoa2V5ZnJhbWVOYW1lT3B0aW9uYWxQcmVmaXgubGVuZ3RoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjbGVhbktleWZyYW1lTmFtZSA9IGtleWZyYW1lTmFtZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZvcihlbGVtZW50SW5kZXggPSAwOyBlbGVtZW50SW5kZXggPCBlbGVtZW50cy5sZW5ndGg7IGVsZW1lbnRJbmRleCsrKSB7XG5cdFx0XHRcdFx0Y3VyRWxlbWVudCA9IGVsZW1lbnRzW2VsZW1lbnRJbmRleF07XG5cdFx0XHRcdFx0YXR0cmlidXRlTmFtZSA9ICdkYXRhLScgKyBjbGVhbktleWZyYW1lTmFtZTtcblx0XHRcdFx0XHRhdHRyaWJ1dGVWYWx1ZSA9IGtleWZyYW1lc1trZXlmcmFtZU5hbWVdO1xuXG5cdFx0XHRcdFx0Ly9JZiB0aGUgZWxlbWVudCBhbHJlYWR5IGhhcyB0aGlzIGtleWZyYW1lIGlubGluZSwgZ2l2ZSB0aGUgaW5saW5lIG9uZSBwcmVjZWRlbmNlIGJ5IHB1dHRpbmcgaXQgb24gdGhlIHJpZ2h0IHNpZGUuXG5cdFx0XHRcdFx0Ly9UaGUgaW5saW5lIG9uZSBtYXkgYWN0dWFsbHkgYmUgdGhlIHJlc3VsdCBvZiB0aGUga2V5ZnJhbWVzIGZyb20gYW5vdGhlciBzdHlsZXNoZWV0LlxuXHRcdFx0XHRcdC8vU2luY2Ugd2UgcmV2ZXJzZWQgdGhlIG9yZGVyIG9mIHRoZSBzdHlsZXNoZWV0cywgZXZlcnl0aGluZyBjb21lcyB0b2dldGhlciBjb3JyZWN0bHkgaGVyZS5cblx0XHRcdFx0XHRpZihjdXJFbGVtZW50Lmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKSkge1xuXHRcdFx0XHRcdFx0YXR0cmlidXRlVmFsdWUgKz0gY3VyRWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y3VyRWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgYXR0cmlidXRlVmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8vQXBwbGllcyB0aGUga2V5ZnJhbWVzIChhcyBkYXRhLWF0dHJpYnV0ZXMpIHRvIHRoZSBlbGVtZW50cy5cblx0dmFyIGFwcGx5QXR0cmlidXRlU2V0dGVycyA9IGZ1bmN0aW9uKHNlbGVjdG9ycykge1xuXHRcdHZhciBjdXJTZWxlY3Rvcjtcblx0XHR2YXIgZWxlbWVudHM7XG5cdFx0dmFyIGF0dHJpYnV0ZU5hbWU7XG5cdFx0dmFyIGF0dHJpYnV0ZVZhbHVlO1xuXHRcdHZhciBlbGVtZW50SW5kZXg7XG5cblx0XHRmb3IodmFyIHNlbGVjdG9ySW5kZXggPSAwOyBzZWxlY3RvckluZGV4IDwgc2VsZWN0b3JzLmxlbmd0aDsgc2VsZWN0b3JJbmRleCsrKSB7XG5cdFx0XHRjdXJTZWxlY3RvciA9IHNlbGVjdG9yc1tzZWxlY3RvckluZGV4XTtcblx0XHRcdGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChjdXJTZWxlY3RvclswXSk7XG5cdFx0XHRhdHRyaWJ1dGVOYW1lID0gJ2RhdGEtJyArIGN1clNlbGVjdG9yWzFdO1xuXHRcdFx0YXR0cmlidXRlVmFsdWUgPSBjdXJTZWxlY3RvclsyXTtcblxuXHRcdFx0aWYoIWVsZW1lbnRzKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IoZWxlbWVudEluZGV4ID0gMDsgZWxlbWVudEluZGV4IDwgZWxlbWVudHMubGVuZ3RoOyBlbGVtZW50SW5kZXgrKykge1xuXHRcdFx0XHRlbGVtZW50c1tlbGVtZW50SW5kZXhdLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdGtpY2tzdGFydChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsaW5rLCBzdHlsZScpKTtcbn0od2luZG93LCBkb2N1bWVudCkpO1xuIiwiLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFNJVEUuSlNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFNNT09USCBTQ1JPTExJTkdcbiQoZnVuY3Rpb24oKSB7XG4gICQoJ2FbaHJlZio9XFxcXCNdOm5vdChbaHJlZj1cXFxcI10pJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgaWYgKGxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCcnKSA9PSB0aGlzLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8vLCcnKSAmJiBsb2NhdGlvbi5ob3N0bmFtZSA9PSB0aGlzLmhvc3RuYW1lKSB7XG4gICAgICB2YXIgdGFyZ2V0ID0gJCh0aGlzLmhhc2gpO1xuICAgICAgdGFyZ2V0ID0gdGFyZ2V0Lmxlbmd0aCA/IHRhcmdldCA6ICQoJ1tuYW1lPScgKyB0aGlzLmhhc2guc2xpY2UoMSkgKyddJyk7XG4gICAgICBpZiAodGFyZ2V0Lmxlbmd0aCkge1xuICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICBzY3JvbGxUb3A6IHRhcmdldC5vZmZzZXQoKS50b3BcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufSk7XG5cbi8vIGluaXRpYWxpemUgc2tyb2xsclxuJChmdW5jdGlvbiAoKSB7XG4gIC8vIGluaXRpYWxpemUgc2tyb2xsciBpZiB0aGUgd2luZG93IHdpZHRoIGlzIGxhcmdlIGVub3VnaFxuICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPiA3NjcpIHtcbiAgICBza3JvbGxyLmluaXQoe2ZvcmNlSGVpZ2h0OiBmYWxzZX0pO1xuICB9XG59KTtcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuXG4gICQoJ1tkYXRhLXRyaWdnZXItbW9iaWxlLW5hdl0nKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICQoJy5tb2JpbGUtbmF2LWNvbnRlbnQnKS50b2dnbGVDbGFzcygnYWN0aXZlJyk7XG4gIH0pO1xuXG4gIC8vIEluaXRpYWxpemUgRm91bmRhdGlvblxuICAkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG5cbiAgLy8gRW1haWwgcHJvdGVjdG9yXG4gICQoJ2FbZGF0YS1lbWFpbC1wcm90ZWN0b3JdJykuZW1haWxQcm90ZWN0b3IoKVxuXG4gIC8vIElOSVRJQUxJWkUgU0xJREVSU1xuICB2YXIgbmF2ID0gJChcIi5uYXZcIik7XG4gICQod2luZG93KS5vbihcInNjcm9sbFwiLCBmdW5jdGlvbihlKSB7XG4gICAgJChcIi5tb2JpbGUtbmF2LWNvbnRlbnRcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG5cbiAgICBpZiAoJCh3aW5kb3cpLnNjcm9sbFRvcCgpID4gMTApIHtcbiAgICAgIG5hdi5hZGRDbGFzcyhcIm5hdi1maXhlZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmF2LnJlbW92ZUNsYXNzKFwibmF2LWZpeGVkXCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIG1hcnF1ZWVTbGlkZXIgPSAkKCcjbWFycXVlZS1zbGlkZXInKS5yb3lhbFNsaWRlcih7XG4gICAgYWRkQWN0aXZlQ2xhc3M6IHRydWUsXG4gICAgYXV0b1NjYWxlU2xpZGVyOiB0cnVlLFxuICAgIGxvb3A6IHRydWUsXG4gICAgaW1hZ2VTY2FsZU1vZGU6ICdmaWxsJyxcbiAgICBmYWRlaW5Mb2FkZWRTbGlkZTogZmFsc2UsXG4gICAga2V5Ym9hcmROYXZFbmFibGVkOiB0cnVlXG4gIH0pLmRhdGEoJ3JveWFsU2xpZGVyJyk7XG5cbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
