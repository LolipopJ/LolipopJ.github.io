/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/anchor-js/anchor.js":
/*!******************************************!*\
  !*** ./node_modules/anchor-js/anchor.js ***!
  \******************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* eslint-env amd */
/* globals module:false */

// https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
  'use strict';

  if (true) {
    // AMD. Register as an anonymous module.
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
}(this, function () {
  'use strict';

  function AnchorJS(options) {
    this.options = options || {};
    this.elements = [];

    /**
     * Assigns options to the internal options object, and provides defaults.
     * @param {Object} opts - Options object
     */
    function _applyRemainingDefaultOptions(opts) {
      opts.icon = Object.prototype.hasOwnProperty.call(opts, 'icon') ? opts.icon : '\uE9CB'; // Accepts characters (and also URLs?), like  '#', '¶', '❡', or '§'.
      opts.visible = Object.prototype.hasOwnProperty.call(opts, 'visible') ? opts.visible : 'hover'; // Also accepts 'always' & 'touch'
      opts.placement = Object.prototype.hasOwnProperty.call(opts, 'placement') ? opts.placement : 'right'; // Also accepts 'left'
      opts.ariaLabel = Object.prototype.hasOwnProperty.call(opts, 'ariaLabel') ? opts.ariaLabel : 'Anchor'; // Accepts any text.
      opts.class = Object.prototype.hasOwnProperty.call(opts, 'class') ? opts.class : ''; // Accepts any class name.
      opts.base = Object.prototype.hasOwnProperty.call(opts, 'base') ? opts.base : ''; // Accepts any base URI.
      // Using Math.floor here will ensure the value is Number-cast and an integer.
      opts.truncate = Object.prototype.hasOwnProperty.call(opts, 'truncate') ? Math.floor(opts.truncate) : 64; // Accepts any value that can be typecast to a number.
      opts.titleText = Object.prototype.hasOwnProperty.call(opts, 'titleText') ? opts.titleText : ''; // Accepts any text.
    }

    _applyRemainingDefaultOptions(this.options);

    /**
     * Checks to see if this device supports touch. Uses criteria pulled from Modernizr:
     * https://github.com/Modernizr/Modernizr/blob/da22eb27631fc4957f67607fe6042e85c0a84656/feature-detects/touchevents.js#L40
     * @return {Boolean} - true if the current device supports touch.
     */
    this.isTouchDevice = function() {
      return Boolean('ontouchstart' in window || window.TouchEvent || window.DocumentTouch && document instanceof DocumentTouch);
    };

    /**
     * Add anchor links to page elements.
     * @param  {String|Array|Nodelist} selector - A CSS selector for targeting the elements you wish to add anchor links
     *                                            to. Also accepts an array or nodeList containing the relavant elements.
     * @return {this}                           - The AnchorJS object
     */
    this.add = function(selector) {
      var elements,
          elsWithIds,
          idList,
          elementID,
          i,
          index,
          count,
          tidyText,
          newTidyText,
          anchor,
          visibleOptionToUse,
          hrefBase,
          indexesToDrop = [];

      // We reapply options here because somebody may have overwritten the default options object when setting options.
      // For example, this overwrites all options but visible:
      //
      // anchors.options = { visible: 'always'; }
      _applyRemainingDefaultOptions(this.options);

      visibleOptionToUse = this.options.visible;
      if (visibleOptionToUse === 'touch') {
        visibleOptionToUse = this.isTouchDevice() ? 'always' : 'hover';
      }

      // Provide a sensible default selector, if none is given.
      if (!selector) {
        selector = 'h2, h3, h4, h5, h6';
      }

      elements = _getElements(selector);

      if (elements.length === 0) {
        return this;
      }

      _addBaselineStyles();

      // We produce a list of existing IDs so we don't generate a duplicate.
      elsWithIds = document.querySelectorAll('[id]');
      idList = [].map.call(elsWithIds, function(el) {
        return el.id;
      });

      for (i = 0; i < elements.length; i++) {
        if (this.hasAnchorJSLink(elements[i])) {
          indexesToDrop.push(i);
          continue;
        }

        if (elements[i].hasAttribute('id')) {
          elementID = elements[i].getAttribute('id');
        } else if (elements[i].hasAttribute('data-anchor-id')) {
          elementID = elements[i].getAttribute('data-anchor-id');
        } else {
          tidyText = this.urlify(elements[i].textContent);

          // Compare our generated ID to existing IDs (and increment it if needed)
          // before we add it to the page.
          newTidyText = tidyText;
          count = 0;
          do {
            if (index !== undefined) {
              newTidyText = tidyText + '-' + count;
            }

            index = idList.indexOf(newTidyText);
            count += 1;
          } while (index !== -1);

          index = undefined;
          idList.push(newTidyText);

          elements[i].setAttribute('id', newTidyText);
          elementID = newTidyText;
        }

        // The following code efficiently builds this DOM structure:
        // `<a class="anchorjs-link ${this.options.class}"
        //     aria-label="${this.options.ariaLabel}"
        //     data-anchorjs-icon="${this.options.icon}"
        //     title="${this.options.titleText}"
        //     href="this.options.base#${elementID}">
        // </a>;`
        anchor = document.createElement('a');
        anchor.className = 'anchorjs-link ' + this.options.class;
        anchor.setAttribute('aria-label', this.options.ariaLabel);
        anchor.setAttribute('data-anchorjs-icon', this.options.icon);
        if (this.options.titleText) {
          anchor.title = this.options.titleText;
        }

        // Adjust the href if there's a <base> tag. See https://github.com/bryanbraun/anchorjs/issues/98
        hrefBase = document.querySelector('base') ? window.location.pathname + window.location.search : '';
        hrefBase = this.options.base || hrefBase;
        anchor.href = hrefBase + '#' + elementID;

        if (visibleOptionToUse === 'always') {
          anchor.style.opacity = '1';
        }

        if (this.options.icon === '\uE9CB') {
          anchor.style.font = '1em/1 anchorjs-icons';

          // We set lineHeight = 1 here because the `anchorjs-icons` font family could otherwise affect the
          // height of the heading. This isn't the case for icons with `placement: left`, so we restore
          // line-height: inherit in that case, ensuring they remain positioned correctly. For more info,
          // see https://github.com/bryanbraun/anchorjs/issues/39.
          if (this.options.placement === 'left') {
            anchor.style.lineHeight = 'inherit';
          }
        }

        if (this.options.placement === 'left') {
          anchor.style.position = 'absolute';
          anchor.style.marginLeft = '-1em';
          anchor.style.paddingRight = '.5em';
          elements[i].insertBefore(anchor, elements[i].firstChild);
        } else { // if the option provided is `right` (or anything else).
          anchor.style.paddingLeft = '.375em';
          elements[i].appendChild(anchor);
        }
      }

      for (i = 0; i < indexesToDrop.length; i++) {
        elements.splice(indexesToDrop[i] - i, 1);
      }

      this.elements = this.elements.concat(elements);

      return this;
    };

    /**
     * Removes all anchorjs-links from elements targeted by the selector.
     * @param  {String|Array|Nodelist} selector - A CSS selector string targeting elements with anchor links,
     *                                            OR a nodeList / array containing the DOM elements.
     * @return {this}                           - The AnchorJS object
     */
    this.remove = function(selector) {
      var index,
          domAnchor,
          elements = _getElements(selector);

      for (var i = 0; i < elements.length; i++) {
        domAnchor = elements[i].querySelector('.anchorjs-link');
        if (domAnchor) {
          // Drop the element from our main list, if it's in there.
          index = this.elements.indexOf(elements[i]);
          if (index !== -1) {
            this.elements.splice(index, 1);
          }

          // Remove the anchor from the DOM.
          elements[i].removeChild(domAnchor);
        }
      }

      return this;
    };

    /**
     * Removes all anchorjs links. Mostly used for tests.
     */
    this.removeAll = function() {
      this.remove(this.elements);
    };

    /**
     * Urlify - Refine text so it makes a good ID.
     *
     * To do this, we remove apostrophes, replace non-safe characters with hyphens,
     * remove extra hyphens, truncate, trim hyphens, and make lowercase.
     *
     * @param  {String} text - Any text. Usually pulled from the webpage element we are linking to.
     * @return {String}      - hyphen-delimited text for use in IDs and URLs.
     */
    this.urlify = function(text) {
      // Decode HTML characters such as '&nbsp;' first.
      var textareaElement = document.createElement('textarea');
      textareaElement.innerHTML = text;
      text = textareaElement.value;

      // Regex for finding the non-safe URL characters (many need escaping):
      //   & +$,:;=?@"#{}|^~[`%!'<>]./()*\ (newlines, tabs, backspace, vertical tabs, and non-breaking space)
      var nonsafeChars = /[& +$,:;=?@"#{}|^~[`%!'<>\]./()*\\\n\t\b\v\u00A0]/g;

      // The reason we include this _applyRemainingDefaultOptions is so urlify can be called independently,
      // even after setting options. This can be useful for tests or other applications.
      if (!this.options.truncate) {
        _applyRemainingDefaultOptions(this.options);
      }

      // Note: we trim hyphens after truncating because truncating can cause dangling hyphens.
      // Example string:                      // " ⚡⚡ Don't forget: URL fragments should be i18n-friendly, hyphenated, short, and clean."
      return text.trim()                      // "⚡⚡ Don't forget: URL fragments should be i18n-friendly, hyphenated, short, and clean."
        .replace(/'/gi, '')                   // "⚡⚡ Dont forget: URL fragments should be i18n-friendly, hyphenated, short, and clean."
        .replace(nonsafeChars, '-')           // "⚡⚡-Dont-forget--URL-fragments-should-be-i18n-friendly--hyphenated--short--and-clean-"
        .replace(/-{2,}/g, '-')               // "⚡⚡-Dont-forget-URL-fragments-should-be-i18n-friendly-hyphenated-short-and-clean-"
        .substring(0, this.options.truncate)  // "⚡⚡-Dont-forget-URL-fragments-should-be-i18n-friendly-hyphenated-"
        .replace(/^-+|-+$/gm, '')             // "⚡⚡-Dont-forget-URL-fragments-should-be-i18n-friendly-hyphenated"
        .toLowerCase();                       // "⚡⚡-dont-forget-url-fragments-should-be-i18n-friendly-hyphenated"
    };

    /**
     * Determines if this element already has an AnchorJS link on it.
     * Uses this technique: https://stackoverflow.com/a/5898748/1154642
     * @param    {HTMLElement}  el - a DOM node
     * @return   {Boolean}     true/false
     */
    this.hasAnchorJSLink = function(el) {
      var hasLeftAnchor = el.firstChild && (' ' + el.firstChild.className + ' ').indexOf(' anchorjs-link ') > -1,
          hasRightAnchor = el.lastChild && (' ' + el.lastChild.className + ' ').indexOf(' anchorjs-link ') > -1;

      return hasLeftAnchor || hasRightAnchor || false;
    };

    /**
     * Turns a selector, nodeList, or array of elements into an array of elements (so we can use array methods).
     * It also throws errors on any other inputs. Used to handle inputs to .add and .remove.
     * @param  {String|Array|Nodelist} input - A CSS selector string targeting elements with anchor links,
     *                                         OR a nodeList / array containing the DOM elements.
     * @return {Array} - An array containing the elements we want.
     */
    function _getElements(input) {
      var elements;
      if (typeof input === 'string' || input instanceof String) {
        // See https://davidwalsh.name/nodelist-array for the technique transforming nodeList -> Array.
        elements = [].slice.call(document.querySelectorAll(input));
      // I checked the 'input instanceof NodeList' test in IE9 and modern browsers and it worked for me.
      } else if (Array.isArray(input) || input instanceof NodeList) {
        elements = [].slice.call(input);
      } else {
        throw new TypeError('The selector provided to AnchorJS was invalid.');
      }

      return elements;
    }

    /**
     * _addBaselineStyles
     * Adds baseline styles to the page, used by all AnchorJS links irregardless of configuration.
     */
    function _addBaselineStyles() {
      // We don't want to add global baseline styles if they've been added before.
      if (document.head.querySelector('style.anchorjs') !== null) {
        return;
      }

      var style = document.createElement('style'),
          linkRule =
          '.anchorjs-link{'                        +
            'opacity:0;'                           +
            'text-decoration:none;'                +
            '-webkit-font-smoothing:antialiased;'  +
            '-moz-osx-font-smoothing:grayscale'    +
          '}',
          hoverRule =
          ':hover>.anchorjs-link,'                 +
          '.anchorjs-link:focus{'                  +
            'opacity:1'                            +
          '}',
          anchorjsLinkFontFace =
          '@font-face{'                            +
            'font-family:anchorjs-icons;'          + // Icon from icomoon; 10px wide & 10px tall; 2 empty below & 4 above
            'src:url(data:n/a;base64,AAEAAAALAIAAAwAwT1MvMg8yG2cAAAE4AAAAYGNtYXDp3gC3AAABpAAAAExnYXNwAAAAEAAAA9wAAAAIZ2x5ZlQCcfwAAAH4AAABCGhlYWQHFvHyAAAAvAAAADZoaGVhBnACFwAAAPQAAAAkaG10eASAADEAAAGYAAAADGxvY2EACACEAAAB8AAAAAhtYXhwAAYAVwAAARgAAAAgbmFtZQGOH9cAAAMAAAAAunBvc3QAAwAAAAADvAAAACAAAQAAAAEAAHzE2p9fDzz1AAkEAAAAAADRecUWAAAAANQA6R8AAAAAAoACwAAAAAgAAgAAAAAAAAABAAADwP/AAAACgAAA/9MCrQABAAAAAAAAAAAAAAAAAAAAAwABAAAAAwBVAAIAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAMCQAGQAAUAAAKZAswAAACPApkCzAAAAesAMwEJAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAg//0DwP/AAEADwABAAAAAAQAAAAAAAAAAAAAAIAAAAAAAAAIAAAACgAAxAAAAAwAAAAMAAAAcAAEAAwAAABwAAwABAAAAHAAEADAAAAAIAAgAAgAAACDpy//9//8AAAAg6cv//f///+EWNwADAAEAAAAAAAAAAAAAAAAACACEAAEAAAAAAAAAAAAAAAAxAAACAAQARAKAAsAAKwBUAAABIiYnJjQ3NzY2MzIWFxYUBwcGIicmNDc3NjQnJiYjIgYHBwYUFxYUBwYGIwciJicmNDc3NjIXFhQHBwYUFxYWMzI2Nzc2NCcmNDc2MhcWFAcHBgYjARQGDAUtLXoWOR8fORYtLTgKGwoKCjgaGg0gEhIgDXoaGgkJBQwHdR85Fi0tOAobCgoKOBoaDSASEiANehoaCQkKGwotLXoWOR8BMwUFLYEuehYXFxYugC44CQkKGwo4GkoaDQ0NDXoaShoKGwoFBe8XFi6ALjgJCQobCjgaShoNDQ0NehpKGgobCgoKLYEuehYXAAAADACWAAEAAAAAAAEACAAAAAEAAAAAAAIAAwAIAAEAAAAAAAMACAAAAAEAAAAAAAQACAAAAAEAAAAAAAUAAQALAAEAAAAAAAYACAAAAAMAAQQJAAEAEAAMAAMAAQQJAAIABgAcAAMAAQQJAAMAEAAMAAMAAQQJAAQAEAAMAAMAAQQJAAUAAgAiAAMAAQQJAAYAEAAMYW5jaG9yanM0MDBAAGEAbgBjAGgAbwByAGoAcwA0ADAAMABAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAH//wAP) format("truetype")' +
          '}',
          pseudoElContent =
          '[data-anchorjs-icon]::after{'           +
            'content:attr(data-anchorjs-icon)'     +
          '}',
          firstStyleEl;

      style.className = 'anchorjs';
      style.appendChild(document.createTextNode('')); // Necessary for Webkit.

      // We place it in the head with the other style tags, if possible, so as to
      // not look out of place. We insert before the others so these styles can be
      // overridden if necessary.
      firstStyleEl = document.head.querySelector('[rel="stylesheet"],style');
      if (firstStyleEl === undefined) {
        document.head.appendChild(style);
      } else {
        document.head.insertBefore(style, firstStyleEl);
      }

      style.sheet.insertRule(linkRule, style.sheet.cssRules.length);
      style.sheet.insertRule(hoverRule, style.sheet.cssRules.length);
      style.sheet.insertRule(pseudoElContent, style.sheet.cssRules.length);
      style.sheet.insertRule(anchorjsLinkFontFace, style.sheet.cssRules.length);
    }
  }

  return AnchorJS;
}));


/***/ }),

/***/ "./src/js/fancybox.js":
/*!****************************!*\
  !*** ./src/js/fancybox.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var fancyBoxInit = function fancyBoxInit(img) {
  var outer = img.outerHTML;
  var imgSrc = /src="(.*)"/.exec(outer) && /src="(.*)"/.exec(outer)[1];
  var imgAlt = /alt="(.*)"/.exec(outer) && /alt="(.*)"/.exec(outer)[1] || /title="(.*)"/.exec(outer) && /title="(.*)"/.exec(outer)[1] || '';
  img.outerHTML = '<a class="fancy-link" href="' + imgSrc + '" data-fancybox="group" data-caption="' + imgAlt + '">' + outer + '</a>';
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (function () {
  document.querySelectorAll('.article-entry img').forEach(fancyBoxInit);
  document.querySelectorAll('.about-body container img').forEach(fancyBoxInit);
});

/***/ }),

/***/ "./src/js/init.js":
/*!************************!*\
  !*** ./src/js/init.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var anchor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! anchor-js */ "./node_modules/anchor-js/anchor.js");
/* harmony import */ var anchor_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(anchor_js__WEBPACK_IMPORTED_MODULE_0__);


var init = function init() {
  var $introImg = $('.site-intro-img:first'),
      introPlaceholder = $('.site-intro-placeholder:first'),
      bgCSS = $introImg.css('background-image'),
      bgRegResult = bgCSS.match(/url\("*([^"]*)"*\)/);

  if (bgRegResult.length < 2) {
    console.log('...');
    console.log(bgRegResult);
    return;
  }

  var bgURL = bgRegResult[1],
      img = new Image();

  img.onload = function () {
    // window.alert()
    // setTimeout(function () {
    introPlaceholder.remove(); // }, 100)

    console.info('PLACEHOLDER REMOVED');
  };

  img.src = bgURL;
  document.addEventListener('DOMContentLoaded', function () {
    $('.container').removeClass('container-unloaded');
    $('.footer').removeClass('footer-unloaded');
    $('.loading').remove();
  }, false); // https://www.bryanbraun.com/anchorjs/

  var anchors = new (anchor_js__WEBPACK_IMPORTED_MODULE_0___default())();
  anchors.options = {
    placement: 'right',
    "class": 'anchorjs-archer'
  };
  anchors.add();
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (init);

/***/ }),

/***/ "./src/js/initSidebar.js":
/*!*******************************!*\
  !*** ./src/js/initSidebar.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _sidebar__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sidebar */ "./src/js/sidebar.js");

var mySidebar = new _sidebar__WEBPACK_IMPORTED_MODULE_0__.default({
  sidebar: '.sidebar',
  nav: '.sidebar-tabs',
  tabs: '.sidebar-tabs li',
  content: '.sidebar-content',
  panels: '.sideabar-contents > div',
  menuButton: '.header-sidebar-menu'
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (mySidebar);

/***/ }),

/***/ "./src/js/mobile.js":
/*!**************************!*\
  !*** ./src/js/mobile.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "initMobile": () => (/* binding */ initMobile)
/* harmony export */ });
var initMobile = function initMobile() {
  if (window.matchMedia) {
    var mql = window.matchMedia('(max-width: 980px)');
    mql.addListener(mediaChangeHandler);
    mediaChangeHandler(mql);
  } else {
    window.addListener('resize', function () {
      var innerWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      mediaChangeHandler(innerWidth > 900 ? {
        matches: false
      } : {
        matches: true
      });
    }, false);
  }

  function mediaChangeHandler(mql) {
    if (mql.matches) {
      console.log('mobile'); // TODO: why

      mobilePreventScrollBreakdown(); // document.body.addEventListener('touchstart', function () {})
    } else {
      console.log('desktop');
    }
  }

  function mobilePreventScrollBreakdown() {}
};



/***/ }),

/***/ "./src/js/scroll.js":
/*!**************************!*\
  !*** ./src/js/scroll.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "scroll": () => (/* binding */ scroll)
/* harmony export */ });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ "./src/js/util.js");


var scroll = function scroll() {
  var $banner = $('.banner:first'),
      $postBanner = $banner.find('.post-title a'),
      $bgEle = $('.site-intro:first'),
      $homeLink = $('.home-link:first'),
      $backTop = $('.back-top:first'),
      $sidebarMenu = $('.header-sidebar-menu:first'),
      $tocWrapper = $('.toc-wrapper:first'),
      $tocCatalog = $tocWrapper.find('.toc-catalog'),
      $progressBar = $('.read-progress'),
      bgTitleHeight = $bgEle.offset().top + $bgEle.outerHeight(); // toc 的收缩

  $tocCatalog.on('click', function () {
    $tocWrapper.toggleClass('toc-hide-children');
  }); // 滚动式切换文章标题和站点标题

  var showBannerScrollHeight = -500;
  var previousHeight = 0,
      continueScroll = 0;

  function isScrollingUpOrDown(currTop) {
    continueScroll += currTop - previousHeight;

    if (continueScroll > 30) {
      // 向下滑动
      continueScroll = 0;
      return 1;
    } else if (continueScroll < showBannerScrollHeight) {
      // 向上滑动
      continueScroll = 0;
      return -1;
    } else {
      return 0;
    }
  } // 是否在向上或向下滚动


  var crossingState = -1;
  var isHigherThanIntro = true;

  function isCrossingIntro(currTop) {
    // 向下滑动超过 intro
    if (currTop > bgTitleHeight) {
      if (crossingState !== 1) {
        crossingState = 1;
        isHigherThanIntro = false;
        return 1;
      }
    } else {
      // 向上滑动超过 intro
      if (crossingState !== -1) {
        crossingState = -1;
        isHigherThanIntro = true;
        return -1;
      }
    }

    return 0;
  } // 判断是否为 post-page


  var isPostPage = false;
  var articleHeight, articleTop;

  if ($('.post-body').length) {
    isPostPage = true;
    articleTop = bgTitleHeight; // 如果执行时动画已执行完毕

    articleHeight = $('.article-entry').outerHeight(); // 如果执行时动画未执行完毕

    articleHeight = $('.container')[0].addEventListener('transitionend', function () {
      articleHeight = $('.article-entry').outerHeight();
    });
  }

  function updateProgress(scrollTop, beginY, contentHeight) {
    var windowHeight = $(window).height();
    var readPercent;

    if (scrollTop < bgTitleHeight) {
      readPercent = 0;
    } else {
      readPercent = (scrollTop - beginY) / (contentHeight - windowHeight) * 100;
    } // 防止文章过短，产生负百分比


    readPercent = readPercent >= 0 ? readPercent : 100;
    var restPercent = readPercent - 100 <= 0 ? readPercent - 100 : 0;
    $progressBar[0].style.transform = "translate3d(".concat(restPercent, "%, 0, 0)");
  } // rAF 操作


  var tickingScroll = false;

  function updateScroll(scrollTop) {
    var crossingState = isCrossingIntro(scrollTop); // intro 边界切换

    if (crossingState === 1) {
      $tocWrapper.addClass('toc-fixed');
      $homeLink.addClass('home-link-hide');
      $backTop.addClass('back-top-show');
      $sidebarMenu.addClass('header-sidebar-menu-black');
    } else if (crossingState === -1) {
      $tocWrapper.removeClass('toc-fixed');
      $homeLink.removeClass('home-link-hide');
      $banner.removeClass('banner-show');
      $backTop.removeClass('back-top-show');
      $sidebarMenu.removeClass('header-sidebar-menu-black');
    } // 如果不是 post-page 以下忽略


    if (isPostPage) {
      // 上下滑动一定距离显示/隐藏 header
      var upDownState = isScrollingUpOrDown(scrollTop);

      if (upDownState === 1) {
        $banner.removeClass('banner-show');
      } else if (upDownState === -1 && !isHigherThanIntro) {
        $banner.addClass('banner-show');
      } // 进度条君的长度


      updateProgress(scrollTop, articleTop, articleHeight);
    }

    previousHeight = scrollTop;
    tickingScroll = false;
  } // scroll 回调


  function onScroll() {
    var scrollTop = $(document).scrollTop();
    var bindedUpdate = updateScroll.bind(null, scrollTop);
    _util__WEBPACK_IMPORTED_MODULE_0__.default.rafTick(tickingScroll, bindedUpdate);
  }

  var throttleOnScroll = _util__WEBPACK_IMPORTED_MODULE_0__.default.throttle(onScroll, 25, true);
  $(document).on('scroll', throttleOnScroll) // 每 25 ms 执行一次 onScroll() 方法
  // 绑定返回顶部事件
  ;
  [$postBanner, $backTop].forEach(function (ele) {
    ele.on('click', _util__WEBPACK_IMPORTED_MODULE_0__.default.backTop);
  });
};



/***/ }),

/***/ "./src/js/sidebar.js":
/*!***************************!*\
  !*** ./src/js/sidebar.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var perfect_scrollbar__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! perfect-scrollbar */ "./node_modules/perfect-scrollbar/dist/perfect-scrollbar.esm.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



var Selector = function Selector(classPrefix) {
  return {
    ACTIVE: "".concat(classPrefix, "-active")
  };
};

var Sidebar = /*#__PURE__*/function () {
  function Sidebar(options) {
    _classCallCheck(this, Sidebar);

    this.options = _objectSpread(_objectSpread({}, Sidebar.defaultOptions), options);
    this.activeIndex = this.options.activeIndex;

    this._initElements();

    this._initTabs();

    this._bindTabsClick();

    this._bindButtonClick();

    this._bindWrapperClick();

    this._bindWrapperTransitionEnd();

    this.perfectScrollbar();
  }

  _createClass(Sidebar, [{
    key: "_initElements",
    value: function _initElements() {
      this.$sidebar = $(this.options.sidebar);
      this.$tabs = $(this.options.tabs);
      this.$panels = $(this.options.panels);
      this.$menuButton = $(this.options.menuButton);
      this.$nav = $(this.options.nav);
      this.$content = $(this.options.content);
    }
  }, {
    key: "_initTabs",
    value: function _initTabs() {
      this.$tabs.each(function (index, tab) {
        $(tab).data('tabIndex', index);
      });
    }
  }, {
    key: "activateSidebar",
    value: function activateSidebar() {
      $('.wrapper').addClass('wrapper-sidebar-active');
      $('.header').addClass('header-sidebar-active');
      $('.footer-fixed').addClass('footer-fixed-sidebar-active');
      $('.toc-wrapper').addClass('toc-slide');
      this.$menuButton.addClass('header-sidebar-menu-active');
      this.$sidebar.removeClass('sidebar-hide');
      this.$sidebar.addClass('sidebar-active');
    }
  }, {
    key: "_inactivateSidebar",
    value: function _inactivateSidebar() {
      $('.wrapper').removeClass('wrapper-sidebar-active');
      $('.header').removeClass('header-sidebar-active');
      $('.footer-fixed').removeClass('footer-fixed-sidebar-active');
      $('.toc-wrapper').removeClass('toc-slide');
      this.$menuButton.removeClass('header-sidebar-menu-active');
      this.$sidebar.removeClass("sidebar-active");
    }
  }, {
    key: "switchTo",
    value: function switchTo(toIndex) {
      this._switchTo(toIndex);
    }
  }, {
    key: "_switchTab",
    value: function _switchTab(toIndex) {
      for (var i = 0; i < 3; i++) {
        if (i !== toIndex) {
          this.$nav.removeClass("sidebar-tabs-active-".concat(i));
        } else {
          this.$nav.addClass("sidebar-tabs-active-".concat(i));
        }
      }
    }
  }, {
    key: "_bindWrapperTransitionEnd",
    value: function _bindWrapperTransitionEnd() {
      var _this = this;

      $('.wrapper').on('transitionend', function (e) {
        if (!_this.$sidebar.hasClass('sidebar-active')) {
          _this.$sidebar.addClass('sidebar-hide');
        }
      });
    }
  }, {
    key: "_switchPanel",
    value: function _switchPanel(toIndex) {
      for (var i = 0; i < 3; i++) {
        if (i !== toIndex) {
          this.$content.removeClass("sidebar-content-active-".concat(i));
        } else {
          this.$content.addClass("sidebar-content-active-".concat(i));
        }
      }
    }
  }, {
    key: "_switchTo",
    value: function _switchTo(toIndex) {
      this._switchTab(toIndex);

      this._switchPanel(toIndex);
    }
  }, {
    key: "_bindTabsClick",
    value: function _bindTabsClick() {
      var _this2 = this;

      this.$tabs.click(function (e) {
        var $target = $(e.target);

        _this2.switchTo($target.data('tabIndex'));
      });
    }
  }, {
    key: "_bindButtonClick",
    value: function _bindButtonClick() {
      var _this3 = this;

      this.$menuButton.click(function (e) {
        if (_this3.$sidebar.hasClass('sidebar-hide')) {
          _this3.activateSidebar();
        } else {
          _this3._inactivateSidebar();
        }
      });
    }
  }, {
    key: "_bindWrapperClick",
    value: function _bindWrapperClick() {
      var _this4 = this;

      $('.wrapper').click(function (e) {
        _this4._inactivateSidebar();
      });
    } // 阻止sidebarContent在滚动到顶部或底部时继续滚动

  }, {
    key: "perfectScrollbar",
    value: function perfectScrollbar() {
      var ps = new perfect_scrollbar__WEBPACK_IMPORTED_MODULE_0__.default('.sidebar', {
        suppressScrollX: true
      });
    }
  }]);

  return Sidebar;
}();

_defineProperty(Sidebar, "defaultOptions", {
  activeIndex: 0
});

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Sidebar);

/***/ }),

/***/ "./src/js/tag.js":
/*!***********************!*\
  !*** ./src/js/tag.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ "./src/js/util.js");
/* harmony import */ var _initSidebar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./initSidebar */ "./src/js/initSidebar.js");
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! eventemitter3 */ "./node_modules/eventemitter3/index.js");
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(eventemitter3__WEBPACK_IMPORTED_MODULE_2__);
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }





var MetaInfo = /*#__PURE__*/function () {
  function MetaInfo(metaName, labelsContainer, postContainer) {
    _classCallCheck(this, MetaInfo);

    this.currLabelName = '';
    this.isInited = false;
    this.postsArr = null;
    this.metaName = metaName;
    this.labelsContainer = $(labelsContainer)[0];
    this.postContainer = $(postContainer)[0];
    this.indexMap = new Map();

    this._bindLabelClick();
  }

  _createClass(MetaInfo, [{
    key: "changeLabel",
    value: function changeLabel(currLabelName) {
      if (typeof currLabelName === 'string') {
        this.currLabelName = currLabelName;

        this._changeList();

        this._changeFocus();
      }
    }
  }, {
    key: "_bindLabelClick",
    value: function _bindLabelClick() {
      var _this = this;

      this.labelsContainer.addEventListener('click', function (e) {
        var currLabelName = e.target.getAttribute("data-".concat(_this.metaName));

        _this.changeLabel(currLabelName);
      });
    }
  }, {
    key: "_changeFocus",
    value: function _changeFocus(label) {
      var _this2 = this;

      var currFocus = this.labelsContainer.getElementsByClassName('sidebar-label-focus');

      _toConsumableArray(currFocus).forEach(function (item) {
        return item.classList.remove('sidebar-label-focus');
      });

      _toConsumableArray(this.labelsContainer.children).forEach(function (item) {
        if (item.getAttribute("data-".concat(_this2.metaName)) === _this2.currLabelName) {
          item.classList.add('sidebar-label-focus');
        }
      });
    }
  }, {
    key: "_changeList",
    value: function _changeList() {
      var _this3 = this;

      var indexArr = this.indexMap.get(this.currLabelName);

      try {
        var corrArr = indexArr.map(function (index) {
          return _this3.postsArr[index];
        });

        this._createPostsDom(corrArr);
      } catch (error) {
        console.error('Please ensure set `tags: true` and `categories: true` of the hexo-content-json config');
      }
    }
  }, {
    key: "_createPostsDom",
    value: function _createPostsDom(corrArr) {
      console.log(corrArr);
      var frag = document.createDocumentFragment();
      this.postContainer.innerHTML = '';

      for (var i = 0; i < corrArr.length; i++) {
        frag.appendChild(this._createPostDom(corrArr[i]));
      }

      this.postContainer.appendChild(frag);
    }
  }, {
    key: "_createPostDom",
    value: function _createPostDom(postInfo) {
      var $tagItem = $('<li class="meta-post-item"><span class="meta-post-date">' + _util__WEBPACK_IMPORTED_MODULE_0__.default.dateFormater(new Date(Date.parse(postInfo.date)), 'yyyy/MM/dd') + '</span></li>');
      var $aItem = $('<a class="meta-post-title" href="' + siteMeta.root + postInfo.path + '">' + postInfo.title + '</a>');
      $tagItem.append($aItem);
      return $tagItem[0];
    }
  }, {
    key: "tryInit",
    value: function tryInit(postsArr) {
      var _this4 = this;

      if (this.isInited || Object.prototype.toString.call(postsArr) === '[object Null]') {
        return;
      }

      var _loop = function _loop(postIndex) {
        var currPostLabels = postsArr[postIndex][_this4.metaName]; // if there is any post has a tag

        if (currPostLabels && currPostLabels.length) {
          currPostLabels.forEach(function (tagOrCatetory) {
            // if this.metaName is 'categories', tagOrCatetory['slug'] will be used as key in this.indexMap
            // else if this.metaName is 'tag', tagOrCatetory['name'] will be used as key in this.indexMap
            // check the array postsArr and you'll know why. (actually you can just use 'slug' in both case)
            var key = _this4.metaName === 'categories' ? 'slug' : 'name';

            if (_this4.indexMap.has(tagOrCatetory[key])) {
              _this4.indexMap.get(tagOrCatetory[key]).push(postIndex);
            } else {
              _this4.indexMap.set(tagOrCatetory[key], [postIndex]);
            }
          });
        }
      };

      for (var postIndex = 0; postIndex < postsArr.length; postIndex++) {
        _loop(postIndex);
      }

      if (!this.indexMap.size) {
        document.getElementsByClassName("sidebar-".concat(this.metaName, "-empty"))[0].classList.add("sidebar-".concat(this.metaName, "-empty-active"));
      }

      this.postsArr = postsArr;
      this.isInited = true;
    }
  }]);

  return MetaInfo;
}();

var SidebarMeta = /*#__PURE__*/function () {
  function SidebarMeta(tabCount) {
    _classCallCheck(this, SidebarMeta);

    this.tabCount = 0;
    this.emitter = new (eventemitter3__WEBPACK_IMPORTED_MODULE_2___default())();
    this.postsArr = null;
    this.metas = [];
    this._initMap = this._initMap.bind(this);
    this.dataMaps = new Map();

    this._subscribe();

    this._fetchInfo();

    this._bindOtherClick();
  } // add a new tab and updata all metas


  _createClass(SidebarMeta, [{
    key: "addTab",
    value: function addTab(para) {
      this.tabCount++;
      var newMeta = new MetaInfo(para.metaName, para.labelsContainer, para.postsContainer);
      newMeta.tryInit(this.postsArr);
      this.metas.push(newMeta);
    } // update every MetaInfo

  }, {
    key: "_tryInitMetas",
    value: function _tryInitMetas() {
      for (var i = 0; i < this.metas.length; i++) {
        this.metas[i].tryInit(this.postsArr);
      }
    } // subscribe data onload

  }, {
    key: "_subscribe",
    value: function _subscribe() {
      this.emitter.on('DATA_FETCHED_SUCCESS', this._initMap);
    } // init maps

  }, {
    key: "_initMap",
    value: function _initMap() {
      if (!this.postsArr.length) {
        return;
      }

      this._tryInitMetas();
    } // fetch content.json

  }, {
    key: "_fetchInfo",
    value: function _fetchInfo() {
      // siteMeta is from js-info.ejs
      var contentURL = siteMeta.root + 'content.json?t=' + Number(new Date());
      var xhr = new XMLHttpRequest();
      xhr.responseType = '';
      xhr.open('get', contentURL, true);
      var $loadFailed = $('.tag-load-fail');
      var that = this;

      xhr.onload = function () {
        if (this.status === 200 || this.status === 304) {
          $loadFailed.remove(); // defensive programming if content.json formart is not correct
          // pr: https://github.com/fi3ework/hexo-theme-archer/pull/37

          var contentJSON;
          var posts;
          contentJSON = JSON.parse(this.responseText);
          posts = Array.isArray(contentJSON) ? contentJSON : contentJSON.posts;

          if (posts && posts.length) {
            that.postsArr = posts;
            that.emitter.emit('DATA_FETCHED_SUCCESS');
          }
        } else {
          this.$currPostsContainer.remove();
        }
      };

      xhr.send();
    }
  }, {
    key: "_bindOtherClick",
    value: function _bindOtherClick() {
      var _this5 = this;

      document.body.addEventListener('click', function (e) {
        if (e.target.className === 'post-tag') {
          e.stopPropagation();
          _initSidebar__WEBPACK_IMPORTED_MODULE_1__.default.activateSidebar();
          _initSidebar__WEBPACK_IMPORTED_MODULE_1__.default.switchTo(1);
          var currLabelName = e.target.getAttribute("data-tags");
          _this5.currLabelName = currLabelName;
          var tagMeta = _this5.metas[0];
          tagMeta.changeLabel(_this5.currLabelName);
        }
      });
    }
  }]);

  return SidebarMeta;
}();

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (SidebarMeta);

/***/ }),

/***/ "./src/js/toc.js":
/*!***********************!*\
  !*** ./src/js/toc.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util */ "./src/js/util.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }


var prevHeight = 0;

function initTocLinksScrollTop(tocLinks) {
  return _toConsumableArray(tocLinks).map(function (link) {
    return _util__WEBPACK_IMPORTED_MODULE_0__.default.getAbsPosition(link).y;
  });
}

var calcAnchorLink = function calcAnchorLink(heights, currHeight) {
  for (var i = 0; i < heights.length; i++) {
    if (Math.abs(currHeight - heights[i]) < 1.1) {
      return i;
    }
  }

  return -1;
};

var isPassingThrough = function isPassingThrough(currHeight, prevHeight, linkHeight) {
  return (currHeight + 1 - linkHeight) * (prevHeight + 1 - linkHeight) <= 0;
};

function calcScrollIntoScreenIndex(heights, prevHeight, currHeight) {
  var anchorLinkIndex = calcAnchorLink(heights, currHeight);

  if (anchorLinkIndex >= 0) {
    return anchorLinkIndex;
  }

  for (var i = 0; i < heights.length; i++) {
    if (isPassingThrough(currHeight, prevHeight, heights[i])) {
      // if is scrolling down, select current
      if (currHeight > prevHeight) {
        return i;
      } else {
        // if is scrolling up, select previous
        return i - 1;
      }
    }
  }
} // hide all ol


function hideAllOl(root) {
  ;

  _toConsumableArray(root.querySelectorAll('ol')).forEach(function (li) {
    hideItem(li);
  });
} // back to default state


function initFold(toc) {
  ;

  _toConsumableArray(toc.children).forEach(function (child) {
    hideAllOl(child);
  });

  _toConsumableArray(toc.querySelectorAll('.toc-active')).forEach(function (child) {
    child.classList.remove('toc-active');
  });
}

function resetFold(toc) {
  initFold(toc);
}

function hideItem(node) {
  node.style.display = 'none';
}

function showItem(node) {
  node.style.display = '';
}

function activeTocItem(node) {
  node.classList.add('toc-active');
}

function showAllChildren(node) {
  ;

  _toConsumableArray(node.children).forEach(function (child) {
    showItem(child);
  });
}

function spreadParentNodeOfTargetItem(tocItem) {
  var currNode = tocItem;

  while (currNode && currNode.parentNode) {
    showAllChildren(currNode.parentNode);
    showAllChildren(currNode);
    currNode = currNode.parentNode;

    if (currNode.classList.contains('toc')) {
      break;
    }
  }
}

var main = function main() {
  var toc = document.querySelector('.toc');
  var tocItems = document.querySelectorAll('.toc-item');

  if (!tocItems.length) {
    return;
  }

  initFold(toc);
  var headers = document.querySelectorAll('.article-entry h1, h2, h3, h4, h5, h6'); // get links height

  var heights = initTocLinksScrollTop(headers);
  document.addEventListener('scroll', function () {
    var currHeight = $(document).scrollTop();
    var currHeightIndex = calcScrollIntoScreenIndex(heights, prevHeight, currHeight);
    prevHeight = currHeight;

    if (typeof currHeightIndex === 'undefined') {
      return;
    } // spread, fold and active


    var currItem = tocItems[currHeightIndex]; // 1. fold

    resetFold(toc); // 2. spread

    spreadParentNodeOfTargetItem(currItem); // 3. active

    if (currItem) {
      activeTocItem(currItem.querySelector('a'));
    }
  });
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (main);

/***/ }),

/***/ "./src/js/util.js":
/*!************************!*\
  !*** ./src/js/util.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var archerUtil = {
  // 回到顶部
  backTop: function backTop(event) {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  },
  // 获取元素在页面上相对左上角的位置
  getAbsPosition: function getAbsPosition(e) {
    var x = e.offsetLeft,
        y = e.offsetTop;

    while (e = e.offsetParent) {
      x += e.offsetLeft;
      y += e.offsetTop;
    }

    return {
      x: x,
      y: y
    };
  },
  // 格式化日期
  dateFormater: function dateFormater(date, fmt) {
    var o = {
      'M+': date.getMonth() + 1,
      // 月份
      'd+': date.getDate(),
      // 日
      'h+': date.getHours(),
      // 小时
      'm+': date.getMinutes(),
      // 分
      's+': date.getSeconds(),
      // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3),
      // 季度
      S: date.getMilliseconds() // 毫秒

    };

    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, String(date.getFullYear()).substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(String(o[k]).length));
      }
    }

    return fmt;
  },
  // rAF 的 ticking
  rafTick: function rafTick(ticking, updateFunc) {
    if (!ticking) {
      requestAnimationFrame(updateFunc);
    }

    ticking = true;
  },
  // 函数节流
  throttle: function throttle(func, wait) {
    var immediate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var timer;
    return function () {
      var _this = this;

      var args = arguments;

      if (!timer) {
        if (immediate) {
          timer = setTimeout(function () {
            timer = undefined;
          }, wait);
          func.apply(this, args);
        } else {
          timer = setTimeout(function () {
            timer = undefined;
            func.apply(_this, args);
          }, wait);
        }
      }
    };
  },
  // 函数防抖
  debounce: function debounce(func, wait) {
    var immediate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var timer;
    return function () {
      var _this2 = this;

      var args = arguments;
      timer && clearTimeout(timer);

      if (immediate) {
        !timer && func.apply(this, args);
        timer = setTimeout(function () {
          timer = undefined;
        }, wait);
      } else {
        timer = setTimeout(function () {
          func.apply(_this2, args);
        }, wait);
      }
    };
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (archerUtil);

/***/ }),

/***/ "./node_modules/eventemitter3/index.js":
/*!*********************************************!*\
  !*** ./node_modules/eventemitter3/index.js ***!
  \*********************************************/
/***/ ((module) => {

"use strict";


var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if (true) {
  module.exports = EventEmitter;
}


/***/ }),

/***/ "./node_modules/perfect-scrollbar/dist/perfect-scrollbar.esm.js":
/*!**********************************************************************!*\
  !*** ./node_modules/perfect-scrollbar/dist/perfect-scrollbar.esm.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/*!
 * perfect-scrollbar v1.5.0
 * Copyright 2020 Hyunje Jun, MDBootstrap and Contributors
 * Licensed under MIT
 */

function get(element) {
  return getComputedStyle(element);
}

function set(element, obj) {
  for (var key in obj) {
    var val = obj[key];
    if (typeof val === 'number') {
      val = val + "px";
    }
    element.style[key] = val;
  }
  return element;
}

function div(className) {
  var div = document.createElement('div');
  div.className = className;
  return div;
}

var elMatches =
  typeof Element !== 'undefined' &&
  (Element.prototype.matches ||
    Element.prototype.webkitMatchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector);

function matches(element, query) {
  if (!elMatches) {
    throw new Error('No element matching method supported');
  }

  return elMatches.call(element, query);
}

function remove(element) {
  if (element.remove) {
    element.remove();
  } else {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}

function queryChildren(element, selector) {
  return Array.prototype.filter.call(element.children, function (child) { return matches(child, selector); }
  );
}

var cls = {
  main: 'ps',
  rtl: 'ps__rtl',
  element: {
    thumb: function (x) { return ("ps__thumb-" + x); },
    rail: function (x) { return ("ps__rail-" + x); },
    consuming: 'ps__child--consume',
  },
  state: {
    focus: 'ps--focus',
    clicking: 'ps--clicking',
    active: function (x) { return ("ps--active-" + x); },
    scrolling: function (x) { return ("ps--scrolling-" + x); },
  },
};

/*
 * Helper methods
 */
var scrollingClassTimeout = { x: null, y: null };

function addScrollingClass(i, x) {
  var classList = i.element.classList;
  var className = cls.state.scrolling(x);

  if (classList.contains(className)) {
    clearTimeout(scrollingClassTimeout[x]);
  } else {
    classList.add(className);
  }
}

function removeScrollingClass(i, x) {
  scrollingClassTimeout[x] = setTimeout(
    function () { return i.isAlive && i.element.classList.remove(cls.state.scrolling(x)); },
    i.settings.scrollingThreshold
  );
}

function setScrollingClassInstantly(i, x) {
  addScrollingClass(i, x);
  removeScrollingClass(i, x);
}

var EventElement = function EventElement(element) {
  this.element = element;
  this.handlers = {};
};

var prototypeAccessors = { isEmpty: { configurable: true } };

EventElement.prototype.bind = function bind (eventName, handler) {
  if (typeof this.handlers[eventName] === 'undefined') {
    this.handlers[eventName] = [];
  }
  this.handlers[eventName].push(handler);
  this.element.addEventListener(eventName, handler, false);
};

EventElement.prototype.unbind = function unbind (eventName, target) {
    var this$1 = this;

  this.handlers[eventName] = this.handlers[eventName].filter(function (handler) {
    if (target && handler !== target) {
      return true;
    }
    this$1.element.removeEventListener(eventName, handler, false);
    return false;
  });
};

EventElement.prototype.unbindAll = function unbindAll () {
  for (var name in this.handlers) {
    this.unbind(name);
  }
};

prototypeAccessors.isEmpty.get = function () {
    var this$1 = this;

  return Object.keys(this.handlers).every(
    function (key) { return this$1.handlers[key].length === 0; }
  );
};

Object.defineProperties( EventElement.prototype, prototypeAccessors );

var EventManager = function EventManager() {
  this.eventElements = [];
};

EventManager.prototype.eventElement = function eventElement (element) {
  var ee = this.eventElements.filter(function (ee) { return ee.element === element; })[0];
  if (!ee) {
    ee = new EventElement(element);
    this.eventElements.push(ee);
  }
  return ee;
};

EventManager.prototype.bind = function bind (element, eventName, handler) {
  this.eventElement(element).bind(eventName, handler);
};

EventManager.prototype.unbind = function unbind (element, eventName, handler) {
  var ee = this.eventElement(element);
  ee.unbind(eventName, handler);

  if (ee.isEmpty) {
    // remove
    this.eventElements.splice(this.eventElements.indexOf(ee), 1);
  }
};

EventManager.prototype.unbindAll = function unbindAll () {
  this.eventElements.forEach(function (e) { return e.unbindAll(); });
  this.eventElements = [];
};

EventManager.prototype.once = function once (element, eventName, handler) {
  var ee = this.eventElement(element);
  var onceHandler = function (evt) {
    ee.unbind(eventName, onceHandler);
    handler(evt);
  };
  ee.bind(eventName, onceHandler);
};

function createEvent(name) {
  if (typeof window.CustomEvent === 'function') {
    return new CustomEvent(name);
  } else {
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(name, false, false, undefined);
    return evt;
  }
}

function processScrollDiff(
  i,
  axis,
  diff,
  useScrollingClass,
  forceFireReachEvent
) {
  if ( useScrollingClass === void 0 ) useScrollingClass = true;
  if ( forceFireReachEvent === void 0 ) forceFireReachEvent = false;

  var fields;
  if (axis === 'top') {
    fields = [
      'contentHeight',
      'containerHeight',
      'scrollTop',
      'y',
      'up',
      'down' ];
  } else if (axis === 'left') {
    fields = [
      'contentWidth',
      'containerWidth',
      'scrollLeft',
      'x',
      'left',
      'right' ];
  } else {
    throw new Error('A proper axis should be provided');
  }

  processScrollDiff$1(i, diff, fields, useScrollingClass, forceFireReachEvent);
}

function processScrollDiff$1(
  i,
  diff,
  ref,
  useScrollingClass,
  forceFireReachEvent
) {
  var contentHeight = ref[0];
  var containerHeight = ref[1];
  var scrollTop = ref[2];
  var y = ref[3];
  var up = ref[4];
  var down = ref[5];
  if ( useScrollingClass === void 0 ) useScrollingClass = true;
  if ( forceFireReachEvent === void 0 ) forceFireReachEvent = false;

  var element = i.element;

  // reset reach
  i.reach[y] = null;

  // 1 for subpixel rounding
  if (element[scrollTop] < 1) {
    i.reach[y] = 'start';
  }

  // 1 for subpixel rounding
  if (element[scrollTop] > i[contentHeight] - i[containerHeight] - 1) {
    i.reach[y] = 'end';
  }

  if (diff) {
    element.dispatchEvent(createEvent(("ps-scroll-" + y)));

    if (diff < 0) {
      element.dispatchEvent(createEvent(("ps-scroll-" + up)));
    } else if (diff > 0) {
      element.dispatchEvent(createEvent(("ps-scroll-" + down)));
    }

    if (useScrollingClass) {
      setScrollingClassInstantly(i, y);
    }
  }

  if (i.reach[y] && (diff || forceFireReachEvent)) {
    element.dispatchEvent(createEvent(("ps-" + y + "-reach-" + (i.reach[y]))));
  }
}

function toInt(x) {
  return parseInt(x, 10) || 0;
}

function isEditable(el) {
  return (
    matches(el, 'input,[contenteditable]') ||
    matches(el, 'select,[contenteditable]') ||
    matches(el, 'textarea,[contenteditable]') ||
    matches(el, 'button,[contenteditable]')
  );
}

function outerWidth(element) {
  var styles = get(element);
  return (
    toInt(styles.width) +
    toInt(styles.paddingLeft) +
    toInt(styles.paddingRight) +
    toInt(styles.borderLeftWidth) +
    toInt(styles.borderRightWidth)
  );
}

var env = {
  isWebKit:
    typeof document !== 'undefined' &&
    'WebkitAppearance' in document.documentElement.style,
  supportsTouch:
    typeof window !== 'undefined' &&
    ('ontouchstart' in window ||
      ('maxTouchPoints' in window.navigator &&
        window.navigator.maxTouchPoints > 0) ||
      (window.DocumentTouch && document instanceof window.DocumentTouch)),
  supportsIePointer:
    typeof navigator !== 'undefined' && navigator.msMaxTouchPoints,
  isChrome:
    typeof navigator !== 'undefined' &&
    /Chrome/i.test(navigator && navigator.userAgent),
};

function updateGeometry(i) {
  var element = i.element;
  var roundedScrollTop = Math.floor(element.scrollTop);
  var rect = element.getBoundingClientRect();

  i.containerWidth = Math.ceil(rect.width);
  i.containerHeight = Math.ceil(rect.height);
  i.contentWidth = element.scrollWidth;
  i.contentHeight = element.scrollHeight;

  if (!element.contains(i.scrollbarXRail)) {
    // clean up and append
    queryChildren(element, cls.element.rail('x')).forEach(function (el) { return remove(el); }
    );
    element.appendChild(i.scrollbarXRail);
  }
  if (!element.contains(i.scrollbarYRail)) {
    // clean up and append
    queryChildren(element, cls.element.rail('y')).forEach(function (el) { return remove(el); }
    );
    element.appendChild(i.scrollbarYRail);
  }

  if (
    !i.settings.suppressScrollX &&
    i.containerWidth + i.settings.scrollXMarginOffset < i.contentWidth
  ) {
    i.scrollbarXActive = true;
    i.railXWidth = i.containerWidth - i.railXMarginWidth;
    i.railXRatio = i.containerWidth / i.railXWidth;
    i.scrollbarXWidth = getThumbSize(
      i,
      toInt((i.railXWidth * i.containerWidth) / i.contentWidth)
    );
    i.scrollbarXLeft = toInt(
      ((i.negativeScrollAdjustment + element.scrollLeft) *
        (i.railXWidth - i.scrollbarXWidth)) /
        (i.contentWidth - i.containerWidth)
    );
  } else {
    i.scrollbarXActive = false;
  }

  if (
    !i.settings.suppressScrollY &&
    i.containerHeight + i.settings.scrollYMarginOffset < i.contentHeight
  ) {
    i.scrollbarYActive = true;
    i.railYHeight = i.containerHeight - i.railYMarginHeight;
    i.railYRatio = i.containerHeight / i.railYHeight;
    i.scrollbarYHeight = getThumbSize(
      i,
      toInt((i.railYHeight * i.containerHeight) / i.contentHeight)
    );
    i.scrollbarYTop = toInt(
      (roundedScrollTop * (i.railYHeight - i.scrollbarYHeight)) /
        (i.contentHeight - i.containerHeight)
    );
  } else {
    i.scrollbarYActive = false;
  }

  if (i.scrollbarXLeft >= i.railXWidth - i.scrollbarXWidth) {
    i.scrollbarXLeft = i.railXWidth - i.scrollbarXWidth;
  }
  if (i.scrollbarYTop >= i.railYHeight - i.scrollbarYHeight) {
    i.scrollbarYTop = i.railYHeight - i.scrollbarYHeight;
  }

  updateCss(element, i);

  if (i.scrollbarXActive) {
    element.classList.add(cls.state.active('x'));
  } else {
    element.classList.remove(cls.state.active('x'));
    i.scrollbarXWidth = 0;
    i.scrollbarXLeft = 0;
    element.scrollLeft = i.isRtl === true ? i.contentWidth : 0;
  }
  if (i.scrollbarYActive) {
    element.classList.add(cls.state.active('y'));
  } else {
    element.classList.remove(cls.state.active('y'));
    i.scrollbarYHeight = 0;
    i.scrollbarYTop = 0;
    element.scrollTop = 0;
  }
}

function getThumbSize(i, thumbSize) {
  if (i.settings.minScrollbarLength) {
    thumbSize = Math.max(thumbSize, i.settings.minScrollbarLength);
  }
  if (i.settings.maxScrollbarLength) {
    thumbSize = Math.min(thumbSize, i.settings.maxScrollbarLength);
  }
  return thumbSize;
}

function updateCss(element, i) {
  var xRailOffset = { width: i.railXWidth };
  var roundedScrollTop = Math.floor(element.scrollTop);

  if (i.isRtl) {
    xRailOffset.left =
      i.negativeScrollAdjustment +
      element.scrollLeft +
      i.containerWidth -
      i.contentWidth;
  } else {
    xRailOffset.left = element.scrollLeft;
  }
  if (i.isScrollbarXUsingBottom) {
    xRailOffset.bottom = i.scrollbarXBottom - roundedScrollTop;
  } else {
    xRailOffset.top = i.scrollbarXTop + roundedScrollTop;
  }
  set(i.scrollbarXRail, xRailOffset);

  var yRailOffset = { top: roundedScrollTop, height: i.railYHeight };
  if (i.isScrollbarYUsingRight) {
    if (i.isRtl) {
      yRailOffset.right =
        i.contentWidth -
        (i.negativeScrollAdjustment + element.scrollLeft) -
        i.scrollbarYRight -
        i.scrollbarYOuterWidth -
        9;
    } else {
      yRailOffset.right = i.scrollbarYRight - element.scrollLeft;
    }
  } else {
    if (i.isRtl) {
      yRailOffset.left =
        i.negativeScrollAdjustment +
        element.scrollLeft +
        i.containerWidth * 2 -
        i.contentWidth -
        i.scrollbarYLeft -
        i.scrollbarYOuterWidth;
    } else {
      yRailOffset.left = i.scrollbarYLeft + element.scrollLeft;
    }
  }
  set(i.scrollbarYRail, yRailOffset);

  set(i.scrollbarX, {
    left: i.scrollbarXLeft,
    width: i.scrollbarXWidth - i.railBorderXWidth,
  });
  set(i.scrollbarY, {
    top: i.scrollbarYTop,
    height: i.scrollbarYHeight - i.railBorderYWidth,
  });
}

function clickRail(i) {
  var element = i.element;

  i.event.bind(i.scrollbarY, 'mousedown', function (e) { return e.stopPropagation(); });
  i.event.bind(i.scrollbarYRail, 'mousedown', function (e) {
    var positionTop =
      e.pageY -
      window.pageYOffset -
      i.scrollbarYRail.getBoundingClientRect().top;
    var direction = positionTop > i.scrollbarYTop ? 1 : -1;

    i.element.scrollTop += direction * i.containerHeight;
    updateGeometry(i);

    e.stopPropagation();
  });

  i.event.bind(i.scrollbarX, 'mousedown', function (e) { return e.stopPropagation(); });
  i.event.bind(i.scrollbarXRail, 'mousedown', function (e) {
    var positionLeft =
      e.pageX -
      window.pageXOffset -
      i.scrollbarXRail.getBoundingClientRect().left;
    var direction = positionLeft > i.scrollbarXLeft ? 1 : -1;

    i.element.scrollLeft += direction * i.containerWidth;
    updateGeometry(i);

    e.stopPropagation();
  });
}

function dragThumb(i) {
  bindMouseScrollHandler(i, [
    'containerWidth',
    'contentWidth',
    'pageX',
    'railXWidth',
    'scrollbarX',
    'scrollbarXWidth',
    'scrollLeft',
    'x',
    'scrollbarXRail' ]);
  bindMouseScrollHandler(i, [
    'containerHeight',
    'contentHeight',
    'pageY',
    'railYHeight',
    'scrollbarY',
    'scrollbarYHeight',
    'scrollTop',
    'y',
    'scrollbarYRail' ]);
}

function bindMouseScrollHandler(
  i,
  ref
) {
  var containerHeight = ref[0];
  var contentHeight = ref[1];
  var pageY = ref[2];
  var railYHeight = ref[3];
  var scrollbarY = ref[4];
  var scrollbarYHeight = ref[5];
  var scrollTop = ref[6];
  var y = ref[7];
  var scrollbarYRail = ref[8];

  var element = i.element;

  var startingScrollTop = null;
  var startingMousePageY = null;
  var scrollBy = null;

  function mouseMoveHandler(e) {
    if (e.touches && e.touches[0]) {
      e[pageY] = e.touches[0].pageY;
    }
    element[scrollTop] =
      startingScrollTop + scrollBy * (e[pageY] - startingMousePageY);
    addScrollingClass(i, y);
    updateGeometry(i);

    e.stopPropagation();
    e.preventDefault();
  }

  function mouseUpHandler() {
    removeScrollingClass(i, y);
    i[scrollbarYRail].classList.remove(cls.state.clicking);
    i.event.unbind(i.ownerDocument, 'mousemove', mouseMoveHandler);
  }

  function bindMoves(e, touchMode) {
    startingScrollTop = element[scrollTop];
    if (touchMode && e.touches) {
      e[pageY] = e.touches[0].pageY;
    }
    startingMousePageY = e[pageY];
    scrollBy =
      (i[contentHeight] - i[containerHeight]) /
      (i[railYHeight] - i[scrollbarYHeight]);
    if (!touchMode) {
      i.event.bind(i.ownerDocument, 'mousemove', mouseMoveHandler);
      i.event.once(i.ownerDocument, 'mouseup', mouseUpHandler);
      e.preventDefault();
    } else {
      i.event.bind(i.ownerDocument, 'touchmove', mouseMoveHandler);
    }

    i[scrollbarYRail].classList.add(cls.state.clicking);

    e.stopPropagation();
  }

  i.event.bind(i[scrollbarY], 'mousedown', function (e) {
    bindMoves(e);
  });
  i.event.bind(i[scrollbarY], 'touchstart', function (e) {
    bindMoves(e, true);
  });
}

function keyboard(i) {
  var element = i.element;

  var elementHovered = function () { return matches(element, ':hover'); };
  var scrollbarFocused = function () { return matches(i.scrollbarX, ':focus') || matches(i.scrollbarY, ':focus'); };

  function shouldPreventDefault(deltaX, deltaY) {
    var scrollTop = Math.floor(element.scrollTop);
    if (deltaX === 0) {
      if (!i.scrollbarYActive) {
        return false;
      }
      if (
        (scrollTop === 0 && deltaY > 0) ||
        (scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0)
      ) {
        return !i.settings.wheelPropagation;
      }
    }

    var scrollLeft = element.scrollLeft;
    if (deltaY === 0) {
      if (!i.scrollbarXActive) {
        return false;
      }
      if (
        (scrollLeft === 0 && deltaX < 0) ||
        (scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0)
      ) {
        return !i.settings.wheelPropagation;
      }
    }
    return true;
  }

  i.event.bind(i.ownerDocument, 'keydown', function (e) {
    if (
      (e.isDefaultPrevented && e.isDefaultPrevented()) ||
      e.defaultPrevented
    ) {
      return;
    }

    if (!elementHovered() && !scrollbarFocused()) {
      return;
    }

    var activeElement = document.activeElement
      ? document.activeElement
      : i.ownerDocument.activeElement;
    if (activeElement) {
      if (activeElement.tagName === 'IFRAME') {
        activeElement = activeElement.contentDocument.activeElement;
      } else {
        // go deeper if element is a webcomponent
        while (activeElement.shadowRoot) {
          activeElement = activeElement.shadowRoot.activeElement;
        }
      }
      if (isEditable(activeElement)) {
        return;
      }
    }

    var deltaX = 0;
    var deltaY = 0;

    switch (e.which) {
      case 37: // left
        if (e.metaKey) {
          deltaX = -i.contentWidth;
        } else if (e.altKey) {
          deltaX = -i.containerWidth;
        } else {
          deltaX = -30;
        }
        break;
      case 38: // up
        if (e.metaKey) {
          deltaY = i.contentHeight;
        } else if (e.altKey) {
          deltaY = i.containerHeight;
        } else {
          deltaY = 30;
        }
        break;
      case 39: // right
        if (e.metaKey) {
          deltaX = i.contentWidth;
        } else if (e.altKey) {
          deltaX = i.containerWidth;
        } else {
          deltaX = 30;
        }
        break;
      case 40: // down
        if (e.metaKey) {
          deltaY = -i.contentHeight;
        } else if (e.altKey) {
          deltaY = -i.containerHeight;
        } else {
          deltaY = -30;
        }
        break;
      case 32: // space bar
        if (e.shiftKey) {
          deltaY = i.containerHeight;
        } else {
          deltaY = -i.containerHeight;
        }
        break;
      case 33: // page up
        deltaY = i.containerHeight;
        break;
      case 34: // page down
        deltaY = -i.containerHeight;
        break;
      case 36: // home
        deltaY = i.contentHeight;
        break;
      case 35: // end
        deltaY = -i.contentHeight;
        break;
      default:
        return;
    }

    if (i.settings.suppressScrollX && deltaX !== 0) {
      return;
    }
    if (i.settings.suppressScrollY && deltaY !== 0) {
      return;
    }

    element.scrollTop -= deltaY;
    element.scrollLeft += deltaX;
    updateGeometry(i);

    if (shouldPreventDefault(deltaX, deltaY)) {
      e.preventDefault();
    }
  });
}

function wheel(i) {
  var element = i.element;

  function shouldPreventDefault(deltaX, deltaY) {
    var roundedScrollTop = Math.floor(element.scrollTop);
    var isTop = element.scrollTop === 0;
    var isBottom =
      roundedScrollTop + element.offsetHeight === element.scrollHeight;
    var isLeft = element.scrollLeft === 0;
    var isRight =
      element.scrollLeft + element.offsetWidth === element.scrollWidth;

    var hitsBound;

    // pick axis with primary direction
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      hitsBound = isTop || isBottom;
    } else {
      hitsBound = isLeft || isRight;
    }

    return hitsBound ? !i.settings.wheelPropagation : true;
  }

  function getDeltaFromEvent(e) {
    var deltaX = e.deltaX;
    var deltaY = -1 * e.deltaY;

    if (typeof deltaX === 'undefined' || typeof deltaY === 'undefined') {
      // OS X Safari
      deltaX = (-1 * e.wheelDeltaX) / 6;
      deltaY = e.wheelDeltaY / 6;
    }

    if (e.deltaMode && e.deltaMode === 1) {
      // Firefox in deltaMode 1: Line scrolling
      deltaX *= 10;
      deltaY *= 10;
    }

    if (deltaX !== deltaX && deltaY !== deltaY /* NaN checks */) {
      // IE in some mouse drivers
      deltaX = 0;
      deltaY = e.wheelDelta;
    }

    if (e.shiftKey) {
      // reverse axis with shift key
      return [-deltaY, -deltaX];
    }
    return [deltaX, deltaY];
  }

  function shouldBeConsumedByChild(target, deltaX, deltaY) {
    // FIXME: this is a workaround for <select> issue in FF and IE #571
    if (!env.isWebKit && element.querySelector('select:focus')) {
      return true;
    }

    if (!element.contains(target)) {
      return false;
    }

    var cursor = target;

    while (cursor && cursor !== element) {
      if (cursor.classList.contains(cls.element.consuming)) {
        return true;
      }

      var style = get(cursor);

      // if deltaY && vertical scrollable
      if (deltaY && style.overflowY.match(/(scroll|auto)/)) {
        var maxScrollTop = cursor.scrollHeight - cursor.clientHeight;
        if (maxScrollTop > 0) {
          if (
            (cursor.scrollTop > 0 && deltaY < 0) ||
            (cursor.scrollTop < maxScrollTop && deltaY > 0)
          ) {
            return true;
          }
        }
      }
      // if deltaX && horizontal scrollable
      if (deltaX && style.overflowX.match(/(scroll|auto)/)) {
        var maxScrollLeft = cursor.scrollWidth - cursor.clientWidth;
        if (maxScrollLeft > 0) {
          if (
            (cursor.scrollLeft > 0 && deltaX < 0) ||
            (cursor.scrollLeft < maxScrollLeft && deltaX > 0)
          ) {
            return true;
          }
        }
      }

      cursor = cursor.parentNode;
    }

    return false;
  }

  function mousewheelHandler(e) {
    var ref = getDeltaFromEvent(e);
    var deltaX = ref[0];
    var deltaY = ref[1];

    if (shouldBeConsumedByChild(e.target, deltaX, deltaY)) {
      return;
    }

    var shouldPrevent = false;
    if (!i.settings.useBothWheelAxes) {
      // deltaX will only be used for horizontal scrolling and deltaY will
      // only be used for vertical scrolling - this is the default
      element.scrollTop -= deltaY * i.settings.wheelSpeed;
      element.scrollLeft += deltaX * i.settings.wheelSpeed;
    } else if (i.scrollbarYActive && !i.scrollbarXActive) {
      // only vertical scrollbar is active and useBothWheelAxes option is
      // active, so let's scroll vertical bar using both mouse wheel axes
      if (deltaY) {
        element.scrollTop -= deltaY * i.settings.wheelSpeed;
      } else {
        element.scrollTop += deltaX * i.settings.wheelSpeed;
      }
      shouldPrevent = true;
    } else if (i.scrollbarXActive && !i.scrollbarYActive) {
      // useBothWheelAxes and only horizontal bar is active, so use both
      // wheel axes for horizontal bar
      if (deltaX) {
        element.scrollLeft += deltaX * i.settings.wheelSpeed;
      } else {
        element.scrollLeft -= deltaY * i.settings.wheelSpeed;
      }
      shouldPrevent = true;
    }

    updateGeometry(i);

    shouldPrevent = shouldPrevent || shouldPreventDefault(deltaX, deltaY);
    if (shouldPrevent && !e.ctrlKey) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  if (typeof window.onwheel !== 'undefined') {
    i.event.bind(element, 'wheel', mousewheelHandler);
  } else if (typeof window.onmousewheel !== 'undefined') {
    i.event.bind(element, 'mousewheel', mousewheelHandler);
  }
}

function touch(i) {
  if (!env.supportsTouch && !env.supportsIePointer) {
    return;
  }

  var element = i.element;

  function shouldPrevent(deltaX, deltaY) {
    var scrollTop = Math.floor(element.scrollTop);
    var scrollLeft = element.scrollLeft;
    var magnitudeX = Math.abs(deltaX);
    var magnitudeY = Math.abs(deltaY);

    if (magnitudeY > magnitudeX) {
      // user is perhaps trying to swipe up/down the page

      if (
        (deltaY < 0 && scrollTop === i.contentHeight - i.containerHeight) ||
        (deltaY > 0 && scrollTop === 0)
      ) {
        // set prevent for mobile Chrome refresh
        return window.scrollY === 0 && deltaY > 0 && env.isChrome;
      }
    } else if (magnitudeX > magnitudeY) {
      // user is perhaps trying to swipe left/right across the page

      if (
        (deltaX < 0 && scrollLeft === i.contentWidth - i.containerWidth) ||
        (deltaX > 0 && scrollLeft === 0)
      ) {
        return true;
      }
    }

    return true;
  }

  function applyTouchMove(differenceX, differenceY) {
    element.scrollTop -= differenceY;
    element.scrollLeft -= differenceX;

    updateGeometry(i);
  }

  var startOffset = {};
  var startTime = 0;
  var speed = {};
  var easingLoop = null;

  function getTouch(e) {
    if (e.targetTouches) {
      return e.targetTouches[0];
    } else {
      // Maybe IE pointer
      return e;
    }
  }

  function shouldHandle(e) {
    if (e.pointerType && e.pointerType === 'pen' && e.buttons === 0) {
      return false;
    }
    if (e.targetTouches && e.targetTouches.length === 1) {
      return true;
    }
    if (
      e.pointerType &&
      e.pointerType !== 'mouse' &&
      e.pointerType !== e.MSPOINTER_TYPE_MOUSE
    ) {
      return true;
    }
    return false;
  }

  function touchStart(e) {
    if (!shouldHandle(e)) {
      return;
    }

    var touch = getTouch(e);

    startOffset.pageX = touch.pageX;
    startOffset.pageY = touch.pageY;

    startTime = new Date().getTime();

    if (easingLoop !== null) {
      clearInterval(easingLoop);
    }
  }

  function shouldBeConsumedByChild(target, deltaX, deltaY) {
    if (!element.contains(target)) {
      return false;
    }

    var cursor = target;

    while (cursor && cursor !== element) {
      if (cursor.classList.contains(cls.element.consuming)) {
        return true;
      }

      var style = get(cursor);

      // if deltaY && vertical scrollable
      if (deltaY && style.overflowY.match(/(scroll|auto)/)) {
        var maxScrollTop = cursor.scrollHeight - cursor.clientHeight;
        if (maxScrollTop > 0) {
          if (
            (cursor.scrollTop > 0 && deltaY < 0) ||
            (cursor.scrollTop < maxScrollTop && deltaY > 0)
          ) {
            return true;
          }
        }
      }
      // if deltaX && horizontal scrollable
      if (deltaX && style.overflowX.match(/(scroll|auto)/)) {
        var maxScrollLeft = cursor.scrollWidth - cursor.clientWidth;
        if (maxScrollLeft > 0) {
          if (
            (cursor.scrollLeft > 0 && deltaX < 0) ||
            (cursor.scrollLeft < maxScrollLeft && deltaX > 0)
          ) {
            return true;
          }
        }
      }

      cursor = cursor.parentNode;
    }

    return false;
  }

  function touchMove(e) {
    if (shouldHandle(e)) {
      var touch = getTouch(e);

      var currentOffset = { pageX: touch.pageX, pageY: touch.pageY };

      var differenceX = currentOffset.pageX - startOffset.pageX;
      var differenceY = currentOffset.pageY - startOffset.pageY;

      if (shouldBeConsumedByChild(e.target, differenceX, differenceY)) {
        return;
      }

      applyTouchMove(differenceX, differenceY);
      startOffset = currentOffset;

      var currentTime = new Date().getTime();

      var timeGap = currentTime - startTime;
      if (timeGap > 0) {
        speed.x = differenceX / timeGap;
        speed.y = differenceY / timeGap;
        startTime = currentTime;
      }

      if (shouldPrevent(differenceX, differenceY)) {
        e.preventDefault();
      }
    }
  }
  function touchEnd() {
    if (i.settings.swipeEasing) {
      clearInterval(easingLoop);
      easingLoop = setInterval(function() {
        if (i.isInitialized) {
          clearInterval(easingLoop);
          return;
        }

        if (!speed.x && !speed.y) {
          clearInterval(easingLoop);
          return;
        }

        if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
          clearInterval(easingLoop);
          return;
        }

        applyTouchMove(speed.x * 30, speed.y * 30);

        speed.x *= 0.8;
        speed.y *= 0.8;
      }, 10);
    }
  }

  if (env.supportsTouch) {
    i.event.bind(element, 'touchstart', touchStart);
    i.event.bind(element, 'touchmove', touchMove);
    i.event.bind(element, 'touchend', touchEnd);
  } else if (env.supportsIePointer) {
    if (window.PointerEvent) {
      i.event.bind(element, 'pointerdown', touchStart);
      i.event.bind(element, 'pointermove', touchMove);
      i.event.bind(element, 'pointerup', touchEnd);
    } else if (window.MSPointerEvent) {
      i.event.bind(element, 'MSPointerDown', touchStart);
      i.event.bind(element, 'MSPointerMove', touchMove);
      i.event.bind(element, 'MSPointerUp', touchEnd);
    }
  }
}

var defaultSettings = function () { return ({
  handlers: ['click-rail', 'drag-thumb', 'keyboard', 'wheel', 'touch'],
  maxScrollbarLength: null,
  minScrollbarLength: null,
  scrollingThreshold: 1000,
  scrollXMarginOffset: 0,
  scrollYMarginOffset: 0,
  suppressScrollX: false,
  suppressScrollY: false,
  swipeEasing: true,
  useBothWheelAxes: false,
  wheelPropagation: true,
  wheelSpeed: 1,
}); };

var handlers = {
  'click-rail': clickRail,
  'drag-thumb': dragThumb,
  keyboard: keyboard,
  wheel: wheel,
  touch: touch,
};

var PerfectScrollbar = function PerfectScrollbar(element, userSettings) {
  var this$1 = this;
  if ( userSettings === void 0 ) userSettings = {};

  if (typeof element === 'string') {
    element = document.querySelector(element);
  }

  if (!element || !element.nodeName) {
    throw new Error('no element is specified to initialize PerfectScrollbar');
  }

  this.element = element;

  element.classList.add(cls.main);

  this.settings = defaultSettings();
  for (var key in userSettings) {
    this.settings[key] = userSettings[key];
  }

  this.containerWidth = null;
  this.containerHeight = null;
  this.contentWidth = null;
  this.contentHeight = null;

  var focus = function () { return element.classList.add(cls.state.focus); };
  var blur = function () { return element.classList.remove(cls.state.focus); };

  this.isRtl = get(element).direction === 'rtl';
  if (this.isRtl === true) {
    element.classList.add(cls.rtl);
  }
  this.isNegativeScroll = (function () {
    var originalScrollLeft = element.scrollLeft;
    var result = null;
    element.scrollLeft = -1;
    result = element.scrollLeft < 0;
    element.scrollLeft = originalScrollLeft;
    return result;
  })();
  this.negativeScrollAdjustment = this.isNegativeScroll
    ? element.scrollWidth - element.clientWidth
    : 0;
  this.event = new EventManager();
  this.ownerDocument = element.ownerDocument || document;

  this.scrollbarXRail = div(cls.element.rail('x'));
  element.appendChild(this.scrollbarXRail);
  this.scrollbarX = div(cls.element.thumb('x'));
  this.scrollbarXRail.appendChild(this.scrollbarX);
  this.scrollbarX.setAttribute('tabindex', 0);
  this.event.bind(this.scrollbarX, 'focus', focus);
  this.event.bind(this.scrollbarX, 'blur', blur);
  this.scrollbarXActive = null;
  this.scrollbarXWidth = null;
  this.scrollbarXLeft = null;
  var railXStyle = get(this.scrollbarXRail);
  this.scrollbarXBottom = parseInt(railXStyle.bottom, 10);
  if (isNaN(this.scrollbarXBottom)) {
    this.isScrollbarXUsingBottom = false;
    this.scrollbarXTop = toInt(railXStyle.top);
  } else {
    this.isScrollbarXUsingBottom = true;
  }
  this.railBorderXWidth =
    toInt(railXStyle.borderLeftWidth) + toInt(railXStyle.borderRightWidth);
  // Set rail to display:block to calculate margins
  set(this.scrollbarXRail, { display: 'block' });
  this.railXMarginWidth =
    toInt(railXStyle.marginLeft) + toInt(railXStyle.marginRight);
  set(this.scrollbarXRail, { display: '' });
  this.railXWidth = null;
  this.railXRatio = null;

  this.scrollbarYRail = div(cls.element.rail('y'));
  element.appendChild(this.scrollbarYRail);
  this.scrollbarY = div(cls.element.thumb('y'));
  this.scrollbarYRail.appendChild(this.scrollbarY);
  this.scrollbarY.setAttribute('tabindex', 0);
  this.event.bind(this.scrollbarY, 'focus', focus);
  this.event.bind(this.scrollbarY, 'blur', blur);
  this.scrollbarYActive = null;
  this.scrollbarYHeight = null;
  this.scrollbarYTop = null;
  var railYStyle = get(this.scrollbarYRail);
  this.scrollbarYRight = parseInt(railYStyle.right, 10);
  if (isNaN(this.scrollbarYRight)) {
    this.isScrollbarYUsingRight = false;
    this.scrollbarYLeft = toInt(railYStyle.left);
  } else {
    this.isScrollbarYUsingRight = true;
  }
  this.scrollbarYOuterWidth = this.isRtl ? outerWidth(this.scrollbarY) : null;
  this.railBorderYWidth =
    toInt(railYStyle.borderTopWidth) + toInt(railYStyle.borderBottomWidth);
  set(this.scrollbarYRail, { display: 'block' });
  this.railYMarginHeight =
    toInt(railYStyle.marginTop) + toInt(railYStyle.marginBottom);
  set(this.scrollbarYRail, { display: '' });
  this.railYHeight = null;
  this.railYRatio = null;

  this.reach = {
    x:
      element.scrollLeft <= 0
        ? 'start'
        : element.scrollLeft >= this.contentWidth - this.containerWidth
        ? 'end'
        : null,
    y:
      element.scrollTop <= 0
        ? 'start'
        : element.scrollTop >= this.contentHeight - this.containerHeight
        ? 'end'
        : null,
  };

  this.isAlive = true;

  this.settings.handlers.forEach(function (handlerName) { return handlers[handlerName](this$1); });

  this.lastScrollTop = Math.floor(element.scrollTop); // for onScroll only
  this.lastScrollLeft = element.scrollLeft; // for onScroll only
  this.event.bind(this.element, 'scroll', function (e) { return this$1.onScroll(e); });
  updateGeometry(this);
};

PerfectScrollbar.prototype.update = function update () {
  if (!this.isAlive) {
    return;
  }

  // Recalcuate negative scrollLeft adjustment
  this.negativeScrollAdjustment = this.isNegativeScroll
    ? this.element.scrollWidth - this.element.clientWidth
    : 0;

  // Recalculate rail margins
  set(this.scrollbarXRail, { display: 'block' });
  set(this.scrollbarYRail, { display: 'block' });
  this.railXMarginWidth =
    toInt(get(this.scrollbarXRail).marginLeft) +
    toInt(get(this.scrollbarXRail).marginRight);
  this.railYMarginHeight =
    toInt(get(this.scrollbarYRail).marginTop) +
    toInt(get(this.scrollbarYRail).marginBottom);

  // Hide scrollbars not to affect scrollWidth and scrollHeight
  set(this.scrollbarXRail, { display: 'none' });
  set(this.scrollbarYRail, { display: 'none' });

  updateGeometry(this);

  processScrollDiff(this, 'top', 0, false, true);
  processScrollDiff(this, 'left', 0, false, true);

  set(this.scrollbarXRail, { display: '' });
  set(this.scrollbarYRail, { display: '' });
};

PerfectScrollbar.prototype.onScroll = function onScroll (e) {
  if (!this.isAlive) {
    return;
  }

  updateGeometry(this);
  processScrollDiff(this, 'top', this.element.scrollTop - this.lastScrollTop);
  processScrollDiff(
    this,
    'left',
    this.element.scrollLeft - this.lastScrollLeft
  );

  this.lastScrollTop = Math.floor(this.element.scrollTop);
  this.lastScrollLeft = this.element.scrollLeft;
};

PerfectScrollbar.prototype.destroy = function destroy () {
  if (!this.isAlive) {
    return;
  }

  this.event.unbindAll();
  remove(this.scrollbarX);
  remove(this.scrollbarY);
  remove(this.scrollbarXRail);
  remove(this.scrollbarYRail);
  this.removePsClasses();

  // unset elements
  this.element = null;
  this.scrollbarX = null;
  this.scrollbarY = null;
  this.scrollbarXRail = null;
  this.scrollbarYRail = null;

  this.isAlive = false;
};

PerfectScrollbar.prototype.removePsClasses = function removePsClasses () {
  this.element.className = this.element.className
    .split(' ')
    .filter(function (name) { return !name.match(/^ps([-_].+|)$/); })
    .join(' ');
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PerfectScrollbar);
//# sourceMappingURL=perfect-scrollbar.esm.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _init__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./init */ "./src/js/init.js");
/* harmony import */ var _scroll__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scroll */ "./src/js/scroll.js");
/* harmony import */ var _initSidebar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./initSidebar */ "./src/js/initSidebar.js");
/* harmony import */ var _mobile__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./mobile */ "./src/js/mobile.js");
/* harmony import */ var _tag__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./tag */ "./src/js/tag.js");
/* harmony import */ var _toc__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./toc */ "./src/js/toc.js");
/* harmony import */ var _fancybox__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./fancybox */ "./src/js/fancybox.js");






 // print custom info

var logStyle = 'color: #fff; background: #61bfad; padding: 1px; border-radius: 5px;';
console.info('%c 🎯 hexo-theme-archer ⬇️ ', logStyle);
console.info('%c 🏷 Version: 1.6.2 ', logStyle);
console.info('%c 📅 Version date: 20210531', logStyle);
console.info('%c 📦 https://github.com/fi3ework/hexo-theme-archer ', logStyle); // remove background placeholder

(0,_init__WEBPACK_IMPORTED_MODULE_0__.default)(); // scroll event

(0,_scroll__WEBPACK_IMPORTED_MODULE_1__.scroll)(); // init sidebar link

var metas = new _tag__WEBPACK_IMPORTED_MODULE_4__.default();
metas.addTab({
  metaName: 'tags',
  labelsContainer: '.sidebar-tags-name',
  postsContainer: '.sidebar-tags-list'
});
metas.addTab({
  metaName: 'categories',
  labelsContainer: '.sidebar-categories-name',
  postsContainer: '.sidebar-categories-list'
}); // init toc

window.addEventListener('load', function (event) {
  console.log('All resources finished loading!');
  (0,_toc__WEBPACK_IMPORTED_MODULE_5__.default)();
});
(0,_mobile__WEBPACK_IMPORTED_MODULE_3__.initMobile)(); // initSearch()
// fancybox

(0,_fancybox__WEBPACK_IMPORTED_MODULE_6__.default)();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci8uL25vZGVfbW9kdWxlcy9hbmNob3ItanMvYW5jaG9yLmpzIiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyLy4vc3JjL2pzL2ZhbmN5Ym94LmpzIiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyLy4vc3JjL2pzL2luaXQuanMiLCJ3ZWJwYWNrOi8vaGV4by10aGVtZS1hcmNoZXIvLi9zcmMvanMvaW5pdFNpZGViYXIuanMiLCJ3ZWJwYWNrOi8vaGV4by10aGVtZS1hcmNoZXIvLi9zcmMvanMvbW9iaWxlLmpzIiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyLy4vc3JjL2pzL3Njcm9sbC5qcyIsIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci8uL3NyYy9qcy9zaWRlYmFyLmpzIiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyLy4vc3JjL2pzL3RhZy5qcyIsIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci8uL3NyYy9qcy90b2MuanMiLCJ3ZWJwYWNrOi8vaGV4by10aGVtZS1hcmNoZXIvLi9zcmMvanMvdXRpbC5qcyIsIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci8uL25vZGVfbW9kdWxlcy9ldmVudGVtaXR0ZXIzL2luZGV4LmpzIiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyLy4vbm9kZV9tb2R1bGVzL3BlcmZlY3Qtc2Nyb2xsYmFyL2Rpc3QvcGVyZmVjdC1zY3JvbGxiYXIuZXNtLmpzIiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9oZXhvLXRoZW1lLWFyY2hlci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2hleG8tdGhlbWUtYXJjaGVyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vaGV4by10aGVtZS1hcmNoZXIvLi9zcmMvanMvbWFpbi5qcyJdLCJuYW1lcyI6WyJmYW5jeUJveEluaXQiLCJpbWciLCJvdXRlciIsIm91dGVySFRNTCIsImltZ1NyYyIsImV4ZWMiLCJpbWdBbHQiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwiaW5pdCIsIiRpbnRyb0ltZyIsIiQiLCJpbnRyb1BsYWNlaG9sZGVyIiwiYmdDU1MiLCJjc3MiLCJiZ1JlZ1Jlc3VsdCIsIm1hdGNoIiwibGVuZ3RoIiwiY29uc29sZSIsImxvZyIsImJnVVJMIiwiSW1hZ2UiLCJvbmxvYWQiLCJyZW1vdmUiLCJpbmZvIiwic3JjIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUNsYXNzIiwiYW5jaG9ycyIsIkFuY2hvckpTIiwib3B0aW9ucyIsInBsYWNlbWVudCIsImFkZCIsIm15U2lkZWJhciIsIlNpZGViYXIiLCJzaWRlYmFyIiwibmF2IiwidGFicyIsImNvbnRlbnQiLCJwYW5lbHMiLCJtZW51QnV0dG9uIiwiaW5pdE1vYmlsZSIsIndpbmRvdyIsIm1hdGNoTWVkaWEiLCJtcWwiLCJhZGRMaXN0ZW5lciIsIm1lZGlhQ2hhbmdlSGFuZGxlciIsImlubmVyV2lkdGgiLCJkb2N1bWVudEVsZW1lbnQiLCJjbGllbnRXaWR0aCIsImJvZHkiLCJtYXRjaGVzIiwibW9iaWxlUHJldmVudFNjcm9sbEJyZWFrZG93biIsInNjcm9sbCIsIiRiYW5uZXIiLCIkcG9zdEJhbm5lciIsImZpbmQiLCIkYmdFbGUiLCIkaG9tZUxpbmsiLCIkYmFja1RvcCIsIiRzaWRlYmFyTWVudSIsIiR0b2NXcmFwcGVyIiwiJHRvY0NhdGFsb2ciLCIkcHJvZ3Jlc3NCYXIiLCJiZ1RpdGxlSGVpZ2h0Iiwib2Zmc2V0IiwidG9wIiwib3V0ZXJIZWlnaHQiLCJvbiIsInRvZ2dsZUNsYXNzIiwic2hvd0Jhbm5lclNjcm9sbEhlaWdodCIsInByZXZpb3VzSGVpZ2h0IiwiY29udGludWVTY3JvbGwiLCJpc1Njcm9sbGluZ1VwT3JEb3duIiwiY3VyclRvcCIsImNyb3NzaW5nU3RhdGUiLCJpc0hpZ2hlclRoYW5JbnRybyIsImlzQ3Jvc3NpbmdJbnRybyIsImlzUG9zdFBhZ2UiLCJhcnRpY2xlSGVpZ2h0IiwiYXJ0aWNsZVRvcCIsInVwZGF0ZVByb2dyZXNzIiwic2Nyb2xsVG9wIiwiYmVnaW5ZIiwiY29udGVudEhlaWdodCIsIndpbmRvd0hlaWdodCIsImhlaWdodCIsInJlYWRQZXJjZW50IiwicmVzdFBlcmNlbnQiLCJzdHlsZSIsInRyYW5zZm9ybSIsInRpY2tpbmdTY3JvbGwiLCJ1cGRhdGVTY3JvbGwiLCJhZGRDbGFzcyIsInVwRG93blN0YXRlIiwib25TY3JvbGwiLCJiaW5kZWRVcGRhdGUiLCJiaW5kIiwiYXJjaGVyVXRpbCIsInRocm90dGxlT25TY3JvbGwiLCJlbGUiLCJTZWxlY3RvciIsImNsYXNzUHJlZml4IiwiQUNUSVZFIiwiZGVmYXVsdE9wdGlvbnMiLCJhY3RpdmVJbmRleCIsIl9pbml0RWxlbWVudHMiLCJfaW5pdFRhYnMiLCJfYmluZFRhYnNDbGljayIsIl9iaW5kQnV0dG9uQ2xpY2siLCJfYmluZFdyYXBwZXJDbGljayIsIl9iaW5kV3JhcHBlclRyYW5zaXRpb25FbmQiLCJwZXJmZWN0U2Nyb2xsYmFyIiwiJHNpZGViYXIiLCIkdGFicyIsIiRwYW5lbHMiLCIkbWVudUJ1dHRvbiIsIiRuYXYiLCIkY29udGVudCIsImVhY2giLCJpbmRleCIsInRhYiIsImRhdGEiLCJ0b0luZGV4IiwiX3N3aXRjaFRvIiwiaSIsImUiLCJoYXNDbGFzcyIsIl9zd2l0Y2hUYWIiLCJfc3dpdGNoUGFuZWwiLCJjbGljayIsIiR0YXJnZXQiLCJ0YXJnZXQiLCJzd2l0Y2hUbyIsImFjdGl2YXRlU2lkZWJhciIsIl9pbmFjdGl2YXRlU2lkZWJhciIsInBzIiwiUGVyZmVjdFNjcm9sbGJhciIsInN1cHByZXNzU2Nyb2xsWCIsIk1ldGFJbmZvIiwibWV0YU5hbWUiLCJsYWJlbHNDb250YWluZXIiLCJwb3N0Q29udGFpbmVyIiwiY3VyckxhYmVsTmFtZSIsImlzSW5pdGVkIiwicG9zdHNBcnIiLCJpbmRleE1hcCIsIk1hcCIsIl9iaW5kTGFiZWxDbGljayIsIl9jaGFuZ2VMaXN0IiwiX2NoYW5nZUZvY3VzIiwiZ2V0QXR0cmlidXRlIiwiY2hhbmdlTGFiZWwiLCJsYWJlbCIsImN1cnJGb2N1cyIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJpdGVtIiwiY2xhc3NMaXN0IiwiY2hpbGRyZW4iLCJpbmRleEFyciIsImdldCIsImNvcnJBcnIiLCJtYXAiLCJfY3JlYXRlUG9zdHNEb20iLCJlcnJvciIsImZyYWciLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwiaW5uZXJIVE1MIiwiYXBwZW5kQ2hpbGQiLCJfY3JlYXRlUG9zdERvbSIsInBvc3RJbmZvIiwiJHRhZ0l0ZW0iLCJEYXRlIiwicGFyc2UiLCJkYXRlIiwiJGFJdGVtIiwic2l0ZU1ldGEiLCJyb290IiwicGF0aCIsInRpdGxlIiwiYXBwZW5kIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwicG9zdEluZGV4IiwiY3VyclBvc3RMYWJlbHMiLCJ0YWdPckNhdGV0b3J5Iiwia2V5IiwiaGFzIiwicHVzaCIsInNldCIsInNpemUiLCJTaWRlYmFyTWV0YSIsInRhYkNvdW50IiwiZW1pdHRlciIsIkVtaXR0ZXIiLCJtZXRhcyIsIl9pbml0TWFwIiwiZGF0YU1hcHMiLCJfc3Vic2NyaWJlIiwiX2ZldGNoSW5mbyIsIl9iaW5kT3RoZXJDbGljayIsInBhcmEiLCJuZXdNZXRhIiwicG9zdHNDb250YWluZXIiLCJ0cnlJbml0IiwiX3RyeUluaXRNZXRhcyIsImNvbnRlbnRVUkwiLCJOdW1iZXIiLCJ4aHIiLCJYTUxIdHRwUmVxdWVzdCIsInJlc3BvbnNlVHlwZSIsIm9wZW4iLCIkbG9hZEZhaWxlZCIsInRoYXQiLCJzdGF0dXMiLCJjb250ZW50SlNPTiIsInBvc3RzIiwiSlNPTiIsInJlc3BvbnNlVGV4dCIsIkFycmF5IiwiaXNBcnJheSIsImVtaXQiLCIkY3VyclBvc3RzQ29udGFpbmVyIiwic2VuZCIsImNsYXNzTmFtZSIsInN0b3BQcm9wYWdhdGlvbiIsInRhZ01ldGEiLCJwcmV2SGVpZ2h0IiwiaW5pdFRvY0xpbmtzU2Nyb2xsVG9wIiwidG9jTGlua3MiLCJsaW5rIiwieSIsImNhbGNBbmNob3JMaW5rIiwiaGVpZ2h0cyIsImN1cnJIZWlnaHQiLCJNYXRoIiwiYWJzIiwiaXNQYXNzaW5nVGhyb3VnaCIsImxpbmtIZWlnaHQiLCJjYWxjU2Nyb2xsSW50b1NjcmVlbkluZGV4IiwiYW5jaG9yTGlua0luZGV4IiwiaGlkZUFsbE9sIiwibGkiLCJoaWRlSXRlbSIsImluaXRGb2xkIiwidG9jIiwiY2hpbGQiLCJyZXNldEZvbGQiLCJub2RlIiwiZGlzcGxheSIsInNob3dJdGVtIiwiYWN0aXZlVG9jSXRlbSIsInNob3dBbGxDaGlsZHJlbiIsInNwcmVhZFBhcmVudE5vZGVPZlRhcmdldEl0ZW0iLCJ0b2NJdGVtIiwiY3Vyck5vZGUiLCJwYXJlbnROb2RlIiwiY29udGFpbnMiLCJtYWluIiwicXVlcnlTZWxlY3RvciIsInRvY0l0ZW1zIiwiaGVhZGVycyIsImN1cnJIZWlnaHRJbmRleCIsImN1cnJJdGVtIiwiYmFja1RvcCIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJzY3JvbGxUbyIsImJlaGF2aW9yIiwiZ2V0QWJzUG9zaXRpb24iLCJ4Iiwib2Zmc2V0TGVmdCIsIm9mZnNldFRvcCIsIm9mZnNldFBhcmVudCIsImRhdGVGb3JtYXRlciIsImZtdCIsIm8iLCJnZXRNb250aCIsImdldERhdGUiLCJnZXRIb3VycyIsImdldE1pbnV0ZXMiLCJnZXRTZWNvbmRzIiwiZmxvb3IiLCJTIiwiZ2V0TWlsbGlzZWNvbmRzIiwidGVzdCIsInJlcGxhY2UiLCJSZWdFeHAiLCIkMSIsIlN0cmluZyIsImdldEZ1bGxZZWFyIiwic3Vic3RyIiwiayIsInJhZlRpY2siLCJ0aWNraW5nIiwidXBkYXRlRnVuYyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInRocm90dGxlIiwiZnVuYyIsIndhaXQiLCJpbW1lZGlhdGUiLCJ0aW1lciIsImFyZ3MiLCJhcmd1bWVudHMiLCJzZXRUaW1lb3V0IiwidW5kZWZpbmVkIiwiYXBwbHkiLCJkZWJvdW5jZSIsImNsZWFyVGltZW91dCIsImxvZ1N0eWxlIiwiSW5pdFNpZGViYXJMaW5rIiwiYWRkVGFiIiwiZmFuY3lib3giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLE1BQU0sSUFBMEM7QUFDaEQ7QUFDQSxJQUFJLGlDQUFPLEVBQUUsb0NBQUUsT0FBTztBQUFBO0FBQUE7QUFBQSxrR0FBQztBQUN2QixHQUFHLE1BQU0sRUFTTjtBQUNILENBQUM7QUFDRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0EsNEZBQTRGO0FBQzVGLG9HQUFvRztBQUNwRywwR0FBMEc7QUFDMUcsMkdBQTJHO0FBQzNHLHlGQUF5RjtBQUN6RixzRkFBc0Y7QUFDdEY7QUFDQSw4R0FBOEc7QUFDOUcscUdBQXFHO0FBQ3JHOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxnQkFBZ0Isc0JBQXNCO0FBQ3RDO0FBQ0EsZ0JBQWdCLEtBQUs7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixtQkFBbUI7QUFDL0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNB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QUNuRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlFQUF5RSxtQkFBbUI7QUFDNUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxtQkFBbUI7QUFDNUY7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7O0FBRUEsd0RBQXdELDRCQUE0QixFQUFFO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsR0FBRzs7QUFFSCx3REFBd0QsNEJBQTRCLEVBQUU7QUFDdEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBOztBQUVBLG9DQUFvQyxtQ0FBbUM7QUFDdkUsc0NBQXNDLDJFQUEyRTs7QUFFakg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSwyQkFBMkI7O0FBRTNCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNB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QXJTLE9BQU8sQ0FBQ00sSUFBUixDQUFhLHVCQUFiLEVBQXNDK1IsUUFBdEM7QUFDQXJTLE9BQU8sQ0FBQ00sSUFBUixDQUFhLDhCQUFiLEVBQTZDK1IsUUFBN0M7QUFDQXJTLE9BQU8sQ0FBQ00sSUFBUixDQUFhLHNEQUFiLEVBQXFFK1IsUUFBckUsRSxDQUVBOztBQUNBOVMsOENBQUksRyxDQUVKOztBQUNBNEMsK0NBQU0sRyxDQUVOOztBQUNBLElBQUlnSixLQUFLLEdBQUcsSUFBSW1ILHlDQUFKLEVBQVo7QUFDQW5ILEtBQUssQ0FBQ29ILE1BQU4sQ0FBYTtBQUNYN0ssVUFBUSxFQUFFLE1BREM7QUFFWEMsaUJBQWUsRUFBRSxvQkFGTjtBQUdYZ0UsZ0JBQWMsRUFBRTtBQUhMLENBQWI7QUFNQVIsS0FBSyxDQUFDb0gsTUFBTixDQUFhO0FBQ1g3SyxVQUFRLEVBQUUsWUFEQztBQUVYQyxpQkFBZSxFQUFFLDBCQUZOO0FBR1hnRSxnQkFBYyxFQUFFO0FBSEwsQ0FBYixFLENBTUE7O0FBQ0FuSyxNQUFNLENBQUNoQixnQkFBUCxDQUF3QixNQUF4QixFQUFnQyxVQUFVaVAsS0FBVixFQUFpQjtBQUMvQ3pQLFNBQU8sQ0FBQ0MsR0FBUixDQUFZLGlDQUFaO0FBQ0FvTywrQ0FBRztBQUNKLENBSEQ7QUFLQTlNLG1EQUFVLEcsQ0FDVjtBQUVBOztBQUNBaVIsa0RBQVEsRyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWVudiBhbWQgKi9cbi8qIGdsb2JhbHMgbW9kdWxlOmZhbHNlICovXG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvdGVtcGxhdGVzL3JldHVybkV4cG9ydHMuanNcbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICBkZWZpbmUoW10sIGZhY3RvcnkpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgLy8gTm9kZS4gRG9lcyBub3Qgd29yayB3aXRoIHN0cmljdCBDb21tb25KUywgYnV0XG4gICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMsXG4gICAgLy8gbGlrZSBOb2RlLlxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5BbmNob3JKUyA9IGZhY3RvcnkoKTtcbiAgICByb290LmFuY2hvcnMgPSBuZXcgcm9vdC5BbmNob3JKUygpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGZ1bmN0aW9uIEFuY2hvckpTKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcblxuICAgIC8qKlxuICAgICAqIEFzc2lnbnMgb3B0aW9ucyB0byB0aGUgaW50ZXJuYWwgb3B0aW9ucyBvYmplY3QsIGFuZCBwcm92aWRlcyBkZWZhdWx0cy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyAtIE9wdGlvbnMgb2JqZWN0XG4gICAgICovXG4gICAgZnVuY3Rpb24gX2FwcGx5UmVtYWluaW5nRGVmYXVsdE9wdGlvbnMob3B0cykge1xuICAgICAgb3B0cy5pY29uID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdHMsICdpY29uJykgPyBvcHRzLmljb24gOiAnXFx1RTlDQic7IC8vIEFjY2VwdHMgY2hhcmFjdGVycyAoYW5kIGFsc28gVVJMcz8pLCBsaWtlICAnIycsICfCticsICfinaEnLCBvciAnwqcnLlxuICAgICAgb3B0cy52aXNpYmxlID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdHMsICd2aXNpYmxlJykgPyBvcHRzLnZpc2libGUgOiAnaG92ZXInOyAvLyBBbHNvIGFjY2VwdHMgJ2Fsd2F5cycgJiAndG91Y2gnXG4gICAgICBvcHRzLnBsYWNlbWVudCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvcHRzLCAncGxhY2VtZW50JykgPyBvcHRzLnBsYWNlbWVudCA6ICdyaWdodCc7IC8vIEFsc28gYWNjZXB0cyAnbGVmdCdcbiAgICAgIG9wdHMuYXJpYUxhYmVsID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdHMsICdhcmlhTGFiZWwnKSA/IG9wdHMuYXJpYUxhYmVsIDogJ0FuY2hvcic7IC8vIEFjY2VwdHMgYW55IHRleHQuXG4gICAgICBvcHRzLmNsYXNzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdHMsICdjbGFzcycpID8gb3B0cy5jbGFzcyA6ICcnOyAvLyBBY2NlcHRzIGFueSBjbGFzcyBuYW1lLlxuICAgICAgb3B0cy5iYXNlID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9wdHMsICdiYXNlJykgPyBvcHRzLmJhc2UgOiAnJzsgLy8gQWNjZXB0cyBhbnkgYmFzZSBVUkkuXG4gICAgICAvLyBVc2luZyBNYXRoLmZsb29yIGhlcmUgd2lsbCBlbnN1cmUgdGhlIHZhbHVlIGlzIE51bWJlci1jYXN0IGFuZCBhbiBpbnRlZ2VyLlxuICAgICAgb3B0cy50cnVuY2F0ZSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvcHRzLCAndHJ1bmNhdGUnKSA/IE1hdGguZmxvb3Iob3B0cy50cnVuY2F0ZSkgOiA2NDsgLy8gQWNjZXB0cyBhbnkgdmFsdWUgdGhhdCBjYW4gYmUgdHlwZWNhc3QgdG8gYSBudW1iZXIuXG4gICAgICBvcHRzLnRpdGxlVGV4dCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvcHRzLCAndGl0bGVUZXh0JykgPyBvcHRzLnRpdGxlVGV4dCA6ICcnOyAvLyBBY2NlcHRzIGFueSB0ZXh0LlxuICAgIH1cblxuICAgIF9hcHBseVJlbWFpbmluZ0RlZmF1bHRPcHRpb25zKHRoaXMub3B0aW9ucyk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgdG8gc2VlIGlmIHRoaXMgZGV2aWNlIHN1cHBvcnRzIHRvdWNoLiBVc2VzIGNyaXRlcmlhIHB1bGxlZCBmcm9tIE1vZGVybml6cjpcbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9ibG9iL2RhMjJlYjI3NjMxZmM0OTU3ZjY3NjA3ZmU2MDQyZTg1YzBhODQ2NTYvZmVhdHVyZS1kZXRlY3RzL3RvdWNoZXZlbnRzLmpzI0w0MFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IC0gdHJ1ZSBpZiB0aGUgY3VycmVudCBkZXZpY2Ugc3VwcG9ydHMgdG91Y2guXG4gICAgICovXG4gICAgdGhpcy5pc1RvdWNoRGV2aWNlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gQm9vbGVhbignb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgfHwgd2luZG93LlRvdWNoRXZlbnQgfHwgd2luZG93LkRvY3VtZW50VG91Y2ggJiYgZG9jdW1lbnQgaW5zdGFuY2VvZiBEb2N1bWVudFRvdWNoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkIGFuY2hvciBsaW5rcyB0byBwYWdlIGVsZW1lbnRzLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheXxOb2RlbGlzdH0gc2VsZWN0b3IgLSBBIENTUyBzZWxlY3RvciBmb3IgdGFyZ2V0aW5nIHRoZSBlbGVtZW50cyB5b3Ugd2lzaCB0byBhZGQgYW5jaG9yIGxpbmtzXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvLiBBbHNvIGFjY2VwdHMgYW4gYXJyYXkgb3Igbm9kZUxpc3QgY29udGFpbmluZyB0aGUgcmVsYXZhbnQgZWxlbWVudHMuXG4gICAgICogQHJldHVybiB7dGhpc30gICAgICAgICAgICAgICAgICAgICAgICAgICAtIFRoZSBBbmNob3JKUyBvYmplY3RcbiAgICAgKi9cbiAgICB0aGlzLmFkZCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgZWxlbWVudHMsXG4gICAgICAgICAgZWxzV2l0aElkcyxcbiAgICAgICAgICBpZExpc3QsXG4gICAgICAgICAgZWxlbWVudElELFxuICAgICAgICAgIGksXG4gICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgY291bnQsXG4gICAgICAgICAgdGlkeVRleHQsXG4gICAgICAgICAgbmV3VGlkeVRleHQsXG4gICAgICAgICAgYW5jaG9yLFxuICAgICAgICAgIHZpc2libGVPcHRpb25Ub1VzZSxcbiAgICAgICAgICBocmVmQmFzZSxcbiAgICAgICAgICBpbmRleGVzVG9Ecm9wID0gW107XG5cbiAgICAgIC8vIFdlIHJlYXBwbHkgb3B0aW9ucyBoZXJlIGJlY2F1c2Ugc29tZWJvZHkgbWF5IGhhdmUgb3ZlcndyaXR0ZW4gdGhlIGRlZmF1bHQgb3B0aW9ucyBvYmplY3Qgd2hlbiBzZXR0aW5nIG9wdGlvbnMuXG4gICAgICAvLyBGb3IgZXhhbXBsZSwgdGhpcyBvdmVyd3JpdGVzIGFsbCBvcHRpb25zIGJ1dCB2aXNpYmxlOlxuICAgICAgLy9cbiAgICAgIC8vIGFuY2hvcnMub3B0aW9ucyA9IHsgdmlzaWJsZTogJ2Fsd2F5cyc7IH1cbiAgICAgIF9hcHBseVJlbWFpbmluZ0RlZmF1bHRPcHRpb25zKHRoaXMub3B0aW9ucyk7XG5cbiAgICAgIHZpc2libGVPcHRpb25Ub1VzZSA9IHRoaXMub3B0aW9ucy52aXNpYmxlO1xuICAgICAgaWYgKHZpc2libGVPcHRpb25Ub1VzZSA9PT0gJ3RvdWNoJykge1xuICAgICAgICB2aXNpYmxlT3B0aW9uVG9Vc2UgPSB0aGlzLmlzVG91Y2hEZXZpY2UoKSA/ICdhbHdheXMnIDogJ2hvdmVyJztcbiAgICAgIH1cblxuICAgICAgLy8gUHJvdmlkZSBhIHNlbnNpYmxlIGRlZmF1bHQgc2VsZWN0b3IsIGlmIG5vbmUgaXMgZ2l2ZW4uXG4gICAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICAgIHNlbGVjdG9yID0gJ2gyLCBoMywgaDQsIGg1LCBoNic7XG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnRzID0gX2dldEVsZW1lbnRzKHNlbGVjdG9yKTtcblxuICAgICAgaWYgKGVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgX2FkZEJhc2VsaW5lU3R5bGVzKCk7XG5cbiAgICAgIC8vIFdlIHByb2R1Y2UgYSBsaXN0IG9mIGV4aXN0aW5nIElEcyBzbyB3ZSBkb24ndCBnZW5lcmF0ZSBhIGR1cGxpY2F0ZS5cbiAgICAgIGVsc1dpdGhJZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbaWRdJyk7XG4gICAgICBpZExpc3QgPSBbXS5tYXAuY2FsbChlbHNXaXRoSWRzLCBmdW5jdGlvbihlbCkge1xuICAgICAgICByZXR1cm4gZWwuaWQ7XG4gICAgICB9KTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc0FuY2hvckpTTGluayhlbGVtZW50c1tpXSkpIHtcbiAgICAgICAgICBpbmRleGVzVG9Ecm9wLnB1c2goaSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWxlbWVudHNbaV0uaGFzQXR0cmlidXRlKCdpZCcpKSB7XG4gICAgICAgICAgZWxlbWVudElEID0gZWxlbWVudHNbaV0uZ2V0QXR0cmlidXRlKCdpZCcpO1xuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnRzW2ldLmhhc0F0dHJpYnV0ZSgnZGF0YS1hbmNob3ItaWQnKSkge1xuICAgICAgICAgIGVsZW1lbnRJRCA9IGVsZW1lbnRzW2ldLmdldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3ItaWQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aWR5VGV4dCA9IHRoaXMudXJsaWZ5KGVsZW1lbnRzW2ldLnRleHRDb250ZW50KTtcblxuICAgICAgICAgIC8vIENvbXBhcmUgb3VyIGdlbmVyYXRlZCBJRCB0byBleGlzdGluZyBJRHMgKGFuZCBpbmNyZW1lbnQgaXQgaWYgbmVlZGVkKVxuICAgICAgICAgIC8vIGJlZm9yZSB3ZSBhZGQgaXQgdG8gdGhlIHBhZ2UuXG4gICAgICAgICAgbmV3VGlkeVRleHQgPSB0aWR5VGV4dDtcbiAgICAgICAgICBjb3VudCA9IDA7XG4gICAgICAgICAgZG8ge1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgbmV3VGlkeVRleHQgPSB0aWR5VGV4dCArICctJyArIGNvdW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbmRleCA9IGlkTGlzdC5pbmRleE9mKG5ld1RpZHlUZXh0KTtcbiAgICAgICAgICAgIGNvdW50ICs9IDE7XG4gICAgICAgICAgfSB3aGlsZSAoaW5kZXggIT09IC0xKTtcblxuICAgICAgICAgIGluZGV4ID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGlkTGlzdC5wdXNoKG5ld1RpZHlUZXh0KTtcblxuICAgICAgICAgIGVsZW1lbnRzW2ldLnNldEF0dHJpYnV0ZSgnaWQnLCBuZXdUaWR5VGV4dCk7XG4gICAgICAgICAgZWxlbWVudElEID0gbmV3VGlkeVRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvZGUgZWZmaWNpZW50bHkgYnVpbGRzIHRoaXMgRE9NIHN0cnVjdHVyZTpcbiAgICAgICAgLy8gYDxhIGNsYXNzPVwiYW5jaG9yanMtbGluayAke3RoaXMub3B0aW9ucy5jbGFzc31cIlxuICAgICAgICAvLyAgICAgYXJpYS1sYWJlbD1cIiR7dGhpcy5vcHRpb25zLmFyaWFMYWJlbH1cIlxuICAgICAgICAvLyAgICAgZGF0YS1hbmNob3Jqcy1pY29uPVwiJHt0aGlzLm9wdGlvbnMuaWNvbn1cIlxuICAgICAgICAvLyAgICAgdGl0bGU9XCIke3RoaXMub3B0aW9ucy50aXRsZVRleHR9XCJcbiAgICAgICAgLy8gICAgIGhyZWY9XCJ0aGlzLm9wdGlvbnMuYmFzZSMke2VsZW1lbnRJRH1cIj5cbiAgICAgICAgLy8gPC9hPjtgXG4gICAgICAgIGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgYW5jaG9yLmNsYXNzTmFtZSA9ICdhbmNob3Jqcy1saW5rICcgKyB0aGlzLm9wdGlvbnMuY2xhc3M7XG4gICAgICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCB0aGlzLm9wdGlvbnMuYXJpYUxhYmVsKTtcbiAgICAgICAgYW5jaG9yLnNldEF0dHJpYnV0ZSgnZGF0YS1hbmNob3Jqcy1pY29uJywgdGhpcy5vcHRpb25zLmljb24pO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnRpdGxlVGV4dCkge1xuICAgICAgICAgIGFuY2hvci50aXRsZSA9IHRoaXMub3B0aW9ucy50aXRsZVRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGp1c3QgdGhlIGhyZWYgaWYgdGhlcmUncyBhIDxiYXNlPiB0YWcuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYnJ5YW5icmF1bi9hbmNob3Jqcy9pc3N1ZXMvOThcbiAgICAgICAgaHJlZkJhc2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdiYXNlJykgPyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgKyB3aW5kb3cubG9jYXRpb24uc2VhcmNoIDogJyc7XG4gICAgICAgIGhyZWZCYXNlID0gdGhpcy5vcHRpb25zLmJhc2UgfHwgaHJlZkJhc2U7XG4gICAgICAgIGFuY2hvci5ocmVmID0gaHJlZkJhc2UgKyAnIycgKyBlbGVtZW50SUQ7XG5cbiAgICAgICAgaWYgKHZpc2libGVPcHRpb25Ub1VzZSA9PT0gJ2Fsd2F5cycpIHtcbiAgICAgICAgICBhbmNob3Iuc3R5bGUub3BhY2l0eSA9ICcxJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuaWNvbiA9PT0gJ1xcdUU5Q0InKSB7XG4gICAgICAgICAgYW5jaG9yLnN0eWxlLmZvbnQgPSAnMWVtLzEgYW5jaG9yanMtaWNvbnMnO1xuXG4gICAgICAgICAgLy8gV2Ugc2V0IGxpbmVIZWlnaHQgPSAxIGhlcmUgYmVjYXVzZSB0aGUgYGFuY2hvcmpzLWljb25zYCBmb250IGZhbWlseSBjb3VsZCBvdGhlcndpc2UgYWZmZWN0IHRoZVxuICAgICAgICAgIC8vIGhlaWdodCBvZiB0aGUgaGVhZGluZy4gVGhpcyBpc24ndCB0aGUgY2FzZSBmb3IgaWNvbnMgd2l0aCBgcGxhY2VtZW50OiBsZWZ0YCwgc28gd2UgcmVzdG9yZVxuICAgICAgICAgIC8vIGxpbmUtaGVpZ2h0OiBpbmhlcml0IGluIHRoYXQgY2FzZSwgZW5zdXJpbmcgdGhleSByZW1haW4gcG9zaXRpb25lZCBjb3JyZWN0bHkuIEZvciBtb3JlIGluZm8sXG4gICAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9icnlhbmJyYXVuL2FuY2hvcmpzL2lzc3Vlcy8zOS5cbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBsYWNlbWVudCA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICBhbmNob3Iuc3R5bGUubGluZUhlaWdodCA9ICdpbmhlcml0JztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBsYWNlbWVudCA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgYW5jaG9yLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICBhbmNob3Iuc3R5bGUubWFyZ2luTGVmdCA9ICctMWVtJztcbiAgICAgICAgICBhbmNob3Iuc3R5bGUucGFkZGluZ1JpZ2h0ID0gJy41ZW0nO1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmluc2VydEJlZm9yZShhbmNob3IsIGVsZW1lbnRzW2ldLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9IGVsc2UgeyAvLyBpZiB0aGUgb3B0aW9uIHByb3ZpZGVkIGlzIGByaWdodGAgKG9yIGFueXRoaW5nIGVsc2UpLlxuICAgICAgICAgIGFuY2hvci5zdHlsZS5wYWRkaW5nTGVmdCA9ICcuMzc1ZW0nO1xuICAgICAgICAgIGVsZW1lbnRzW2ldLmFwcGVuZENoaWxkKGFuY2hvcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IGluZGV4ZXNUb0Ryb3AubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHMuc3BsaWNlKGluZGV4ZXNUb0Ryb3BbaV0gLSBpLCAxKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5lbGVtZW50cyA9IHRoaXMuZWxlbWVudHMuY29uY2F0KGVsZW1lbnRzKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGFuY2hvcmpzLWxpbmtzIGZyb20gZWxlbWVudHMgdGFyZ2V0ZWQgYnkgdGhlIHNlbGVjdG9yLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ3xBcnJheXxOb2RlbGlzdH0gc2VsZWN0b3IgLSBBIENTUyBzZWxlY3RvciBzdHJpbmcgdGFyZ2V0aW5nIGVsZW1lbnRzIHdpdGggYW5jaG9yIGxpbmtzLFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPUiBhIG5vZGVMaXN0IC8gYXJyYXkgY29udGFpbmluZyB0aGUgRE9NIGVsZW1lbnRzLlxuICAgICAqIEByZXR1cm4ge3RoaXN9ICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBUaGUgQW5jaG9ySlMgb2JqZWN0XG4gICAgICovXG4gICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgdmFyIGluZGV4LFxuICAgICAgICAgIGRvbUFuY2hvcixcbiAgICAgICAgICBlbGVtZW50cyA9IF9nZXRFbGVtZW50cyhzZWxlY3Rvcik7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZG9tQW5jaG9yID0gZWxlbWVudHNbaV0ucXVlcnlTZWxlY3RvcignLmFuY2hvcmpzLWxpbmsnKTtcbiAgICAgICAgaWYgKGRvbUFuY2hvcikge1xuICAgICAgICAgIC8vIERyb3AgdGhlIGVsZW1lbnQgZnJvbSBvdXIgbWFpbiBsaXN0LCBpZiBpdCdzIGluIHRoZXJlLlxuICAgICAgICAgIGluZGV4ID0gdGhpcy5lbGVtZW50cy5pbmRleE9mKGVsZW1lbnRzW2ldKTtcbiAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBhbmNob3IgZnJvbSB0aGUgRE9NLlxuICAgICAgICAgIGVsZW1lbnRzW2ldLnJlbW92ZUNoaWxkKGRvbUFuY2hvcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGFuY2hvcmpzIGxpbmtzLiBNb3N0bHkgdXNlZCBmb3IgdGVzdHMuXG4gICAgICovXG4gICAgdGhpcy5yZW1vdmVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucmVtb3ZlKHRoaXMuZWxlbWVudHMpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBVcmxpZnkgLSBSZWZpbmUgdGV4dCBzbyBpdCBtYWtlcyBhIGdvb2QgSUQuXG4gICAgICpcbiAgICAgKiBUbyBkbyB0aGlzLCB3ZSByZW1vdmUgYXBvc3Ryb3BoZXMsIHJlcGxhY2Ugbm9uLXNhZmUgY2hhcmFjdGVycyB3aXRoIGh5cGhlbnMsXG4gICAgICogcmVtb3ZlIGV4dHJhIGh5cGhlbnMsIHRydW5jYXRlLCB0cmltIGh5cGhlbnMsIGFuZCBtYWtlIGxvd2VyY2FzZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gdGV4dCAtIEFueSB0ZXh0LiBVc3VhbGx5IHB1bGxlZCBmcm9tIHRoZSB3ZWJwYWdlIGVsZW1lbnQgd2UgYXJlIGxpbmtpbmcgdG8uXG4gICAgICogQHJldHVybiB7U3RyaW5nfSAgICAgIC0gaHlwaGVuLWRlbGltaXRlZCB0ZXh0IGZvciB1c2UgaW4gSURzIGFuZCBVUkxzLlxuICAgICAqL1xuICAgIHRoaXMudXJsaWZ5ID0gZnVuY3Rpb24odGV4dCkge1xuICAgICAgLy8gRGVjb2RlIEhUTUwgY2hhcmFjdGVycyBzdWNoIGFzICcmbmJzcDsnIGZpcnN0LlxuICAgICAgdmFyIHRleHRhcmVhRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XG4gICAgICB0ZXh0YXJlYUVsZW1lbnQuaW5uZXJIVE1MID0gdGV4dDtcbiAgICAgIHRleHQgPSB0ZXh0YXJlYUVsZW1lbnQudmFsdWU7XG5cbiAgICAgIC8vIFJlZ2V4IGZvciBmaW5kaW5nIHRoZSBub24tc2FmZSBVUkwgY2hhcmFjdGVycyAobWFueSBuZWVkIGVzY2FwaW5nKTpcbiAgICAgIC8vICAgJiArJCw6Oz0/QFwiI3t9fF5+W2AlISc8Pl0uLygpKlxcIChuZXdsaW5lcywgdGFicywgYmFja3NwYWNlLCB2ZXJ0aWNhbCB0YWJzLCBhbmQgbm9uLWJyZWFraW5nIHNwYWNlKVxuICAgICAgdmFyIG5vbnNhZmVDaGFycyA9IC9bJiArJCw6Oz0/QFwiI3t9fF5+W2AlISc8PlxcXS4vKCkqXFxcXFxcblxcdFxcYlxcdlxcdTAwQTBdL2c7XG5cbiAgICAgIC8vIFRoZSByZWFzb24gd2UgaW5jbHVkZSB0aGlzIF9hcHBseVJlbWFpbmluZ0RlZmF1bHRPcHRpb25zIGlzIHNvIHVybGlmeSBjYW4gYmUgY2FsbGVkIGluZGVwZW5kZW50bHksXG4gICAgICAvLyBldmVuIGFmdGVyIHNldHRpbmcgb3B0aW9ucy4gVGhpcyBjYW4gYmUgdXNlZnVsIGZvciB0ZXN0cyBvciBvdGhlciBhcHBsaWNhdGlvbnMuXG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy50cnVuY2F0ZSkge1xuICAgICAgICBfYXBwbHlSZW1haW5pbmdEZWZhdWx0T3B0aW9ucyh0aGlzLm9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICAvLyBOb3RlOiB3ZSB0cmltIGh5cGhlbnMgYWZ0ZXIgdHJ1bmNhdGluZyBiZWNhdXNlIHRydW5jYXRpbmcgY2FuIGNhdXNlIGRhbmdsaW5nIGh5cGhlbnMuXG4gICAgICAvLyBFeGFtcGxlIHN0cmluZzogICAgICAgICAgICAgICAgICAgICAgLy8gXCIg4pqh4pqhIERvbid0IGZvcmdldDogVVJMIGZyYWdtZW50cyBzaG91bGQgYmUgaTE4bi1mcmllbmRseSwgaHlwaGVuYXRlZCwgc2hvcnQsIGFuZCBjbGVhbi5cIlxuICAgICAgcmV0dXJuIHRleHQudHJpbSgpICAgICAgICAgICAgICAgICAgICAgIC8vIFwi4pqh4pqhIERvbid0IGZvcmdldDogVVJMIGZyYWdtZW50cyBzaG91bGQgYmUgaTE4bi1mcmllbmRseSwgaHlwaGVuYXRlZCwgc2hvcnQsIGFuZCBjbGVhbi5cIlxuICAgICAgICAucmVwbGFjZSgvJy9naSwgJycpICAgICAgICAgICAgICAgICAgIC8vIFwi4pqh4pqhIERvbnQgZm9yZ2V0OiBVUkwgZnJhZ21lbnRzIHNob3VsZCBiZSBpMThuLWZyaWVuZGx5LCBoeXBoZW5hdGVkLCBzaG9ydCwgYW5kIGNsZWFuLlwiXG4gICAgICAgIC5yZXBsYWNlKG5vbnNhZmVDaGFycywgJy0nKSAgICAgICAgICAgLy8gXCLimqHimqEtRG9udC1mb3JnZXQtLVVSTC1mcmFnbWVudHMtc2hvdWxkLWJlLWkxOG4tZnJpZW5kbHktLWh5cGhlbmF0ZWQtLXNob3J0LS1hbmQtY2xlYW4tXCJcbiAgICAgICAgLnJlcGxhY2UoLy17Mix9L2csICctJykgICAgICAgICAgICAgICAvLyBcIuKaoeKaoS1Eb250LWZvcmdldC1VUkwtZnJhZ21lbnRzLXNob3VsZC1iZS1pMThuLWZyaWVuZGx5LWh5cGhlbmF0ZWQtc2hvcnQtYW5kLWNsZWFuLVwiXG4gICAgICAgIC5zdWJzdHJpbmcoMCwgdGhpcy5vcHRpb25zLnRydW5jYXRlKSAgLy8gXCLimqHimqEtRG9udC1mb3JnZXQtVVJMLWZyYWdtZW50cy1zaG91bGQtYmUtaTE4bi1mcmllbmRseS1oeXBoZW5hdGVkLVwiXG4gICAgICAgIC5yZXBsYWNlKC9eLSt8LSskL2dtLCAnJykgICAgICAgICAgICAgLy8gXCLimqHimqEtRG9udC1mb3JnZXQtVVJMLWZyYWdtZW50cy1zaG91bGQtYmUtaTE4bi1mcmllbmRseS1oeXBoZW5hdGVkXCJcbiAgICAgICAgLnRvTG93ZXJDYXNlKCk7ICAgICAgICAgICAgICAgICAgICAgICAvLyBcIuKaoeKaoS1kb250LWZvcmdldC11cmwtZnJhZ21lbnRzLXNob3VsZC1iZS1pMThuLWZyaWVuZGx5LWh5cGhlbmF0ZWRcIlxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoaXMgZWxlbWVudCBhbHJlYWR5IGhhcyBhbiBBbmNob3JKUyBsaW5rIG9uIGl0LlxuICAgICAqIFVzZXMgdGhpcyB0ZWNobmlxdWU6IGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81ODk4NzQ4LzExNTQ2NDJcbiAgICAgKiBAcGFyYW0gICAge0hUTUxFbGVtZW50fSAgZWwgLSBhIERPTSBub2RlXG4gICAgICogQHJldHVybiAgIHtCb29sZWFufSAgICAgdHJ1ZS9mYWxzZVxuICAgICAqL1xuICAgIHRoaXMuaGFzQW5jaG9ySlNMaW5rID0gZnVuY3Rpb24oZWwpIHtcbiAgICAgIHZhciBoYXNMZWZ0QW5jaG9yID0gZWwuZmlyc3RDaGlsZCAmJiAoJyAnICsgZWwuZmlyc3RDaGlsZC5jbGFzc05hbWUgKyAnICcpLmluZGV4T2YoJyBhbmNob3Jqcy1saW5rICcpID4gLTEsXG4gICAgICAgICAgaGFzUmlnaHRBbmNob3IgPSBlbC5sYXN0Q2hpbGQgJiYgKCcgJyArIGVsLmxhc3RDaGlsZC5jbGFzc05hbWUgKyAnICcpLmluZGV4T2YoJyBhbmNob3Jqcy1saW5rICcpID4gLTE7XG5cbiAgICAgIHJldHVybiBoYXNMZWZ0QW5jaG9yIHx8IGhhc1JpZ2h0QW5jaG9yIHx8IGZhbHNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUdXJucyBhIHNlbGVjdG9yLCBub2RlTGlzdCwgb3IgYXJyYXkgb2YgZWxlbWVudHMgaW50byBhbiBhcnJheSBvZiBlbGVtZW50cyAoc28gd2UgY2FuIHVzZSBhcnJheSBtZXRob2RzKS5cbiAgICAgKiBJdCBhbHNvIHRocm93cyBlcnJvcnMgb24gYW55IG90aGVyIGlucHV0cy4gVXNlZCB0byBoYW5kbGUgaW5wdXRzIHRvIC5hZGQgYW5kIC5yZW1vdmUuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfEFycmF5fE5vZGVsaXN0fSBpbnB1dCAtIEEgQ1NTIHNlbGVjdG9yIHN0cmluZyB0YXJnZXRpbmcgZWxlbWVudHMgd2l0aCBhbmNob3IgbGlua3MsXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9SIGEgbm9kZUxpc3QgLyBhcnJheSBjb250YWluaW5nIHRoZSBET00gZWxlbWVudHMuXG4gICAgICogQHJldHVybiB7QXJyYXl9IC0gQW4gYXJyYXkgY29udGFpbmluZyB0aGUgZWxlbWVudHMgd2Ugd2FudC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfZ2V0RWxlbWVudHMoaW5wdXQpIHtcbiAgICAgIHZhciBlbGVtZW50cztcbiAgICAgIGlmICh0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnIHx8IGlucHV0IGluc3RhbmNlb2YgU3RyaW5nKSB7XG4gICAgICAgIC8vIFNlZSBodHRwczovL2Rhdmlkd2Fsc2gubmFtZS9ub2RlbGlzdC1hcnJheSBmb3IgdGhlIHRlY2huaXF1ZSB0cmFuc2Zvcm1pbmcgbm9kZUxpc3QgLT4gQXJyYXkuXG4gICAgICAgIGVsZW1lbnRzID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGlucHV0KSk7XG4gICAgICAvLyBJIGNoZWNrZWQgdGhlICdpbnB1dCBpbnN0YW5jZW9mIE5vZGVMaXN0JyB0ZXN0IGluIElFOSBhbmQgbW9kZXJuIGJyb3dzZXJzIGFuZCBpdCB3b3JrZWQgZm9yIG1lLlxuICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGlucHV0KSB8fCBpbnB1dCBpbnN0YW5jZW9mIE5vZGVMaXN0KSB7XG4gICAgICAgIGVsZW1lbnRzID0gW10uc2xpY2UuY2FsbChpbnB1dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgc2VsZWN0b3IgcHJvdmlkZWQgdG8gQW5jaG9ySlMgd2FzIGludmFsaWQuJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlbGVtZW50cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBfYWRkQmFzZWxpbmVTdHlsZXNcbiAgICAgKiBBZGRzIGJhc2VsaW5lIHN0eWxlcyB0byB0aGUgcGFnZSwgdXNlZCBieSBhbGwgQW5jaG9ySlMgbGlua3MgaXJyZWdhcmRsZXNzIG9mIGNvbmZpZ3VyYXRpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gX2FkZEJhc2VsaW5lU3R5bGVzKCkge1xuICAgICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBhZGQgZ2xvYmFsIGJhc2VsaW5lIHN0eWxlcyBpZiB0aGV5J3ZlIGJlZW4gYWRkZWQgYmVmb3JlLlxuICAgICAgaWYgKGRvY3VtZW50LmhlYWQucXVlcnlTZWxlY3Rvcignc3R5bGUuYW5jaG9yanMnKSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBzdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgICAgICAgbGlua1J1bGUgPVxuICAgICAgICAgICcuYW5jaG9yanMtbGlua3snICAgICAgICAgICAgICAgICAgICAgICAgK1xuICAgICAgICAgICAgJ29wYWNpdHk6MDsnICAgICAgICAgICAgICAgICAgICAgICAgICAgK1xuICAgICAgICAgICAgJ3RleHQtZGVjb3JhdGlvbjpub25lOycgICAgICAgICAgICAgICAgK1xuICAgICAgICAgICAgJy13ZWJraXQtZm9udC1zbW9vdGhpbmc6YW50aWFsaWFzZWQ7JyAgK1xuICAgICAgICAgICAgJy1tb3otb3N4LWZvbnQtc21vb3RoaW5nOmdyYXlzY2FsZScgICAgK1xuICAgICAgICAgICd9JyxcbiAgICAgICAgICBob3ZlclJ1bGUgPVxuICAgICAgICAgICc6aG92ZXI+LmFuY2hvcmpzLWxpbmssJyAgICAgICAgICAgICAgICAgK1xuICAgICAgICAgICcuYW5jaG9yanMtbGluazpmb2N1c3snICAgICAgICAgICAgICAgICAgK1xuICAgICAgICAgICAgJ29wYWNpdHk6MScgICAgICAgICAgICAgICAgICAgICAgICAgICAgK1xuICAgICAgICAgICd9JyxcbiAgICAgICAgICBhbmNob3Jqc0xpbmtGb250RmFjZSA9XG4gICAgICAgICAgJ0Bmb250LWZhY2V7JyAgICAgICAgICAgICAgICAgICAgICAgICAgICArXG4gICAgICAgICAgICAnZm9udC1mYW1pbHk6YW5jaG9yanMtaWNvbnM7JyAgICAgICAgICArIC8vIEljb24gZnJvbSBpY29tb29uOyAxMHB4IHdpZGUgJiAxMHB4IHRhbGw7IDIgZW1wdHkgYmVsb3cgJiA0IGFib3ZlXG4gICAgICAgICAgICAnc3JjOnVybChkYXRhOm4vYTtiYXNlNjQsQUFFQUFBQUxBSUFBQXdBd1QxTXZNZzh5RzJjQUFBRTRBQUFBWUdOdFlYRHAzZ0MzQUFBQnBBQUFBRXhuWVhOd0FBQUFFQUFBQTl3QUFBQUlaMng1WmxRQ2Nmd0FBQUg0QUFBQkNHaGxZV1FIRnZIeUFBQUF2QUFBQURab2FHVmhCbkFDRndBQUFQUUFBQUFrYUcxMGVBU0FBREVBQUFHWUFBQUFER3h2WTJFQUNBQ0VBQUFCOEFBQUFBaHRZWGh3QUFZQVZ3QUFBUmdBQUFBZ2JtRnRaUUdPSDljQUFBTUFBQUFBdW5CdmMzUUFBd0FBQUFBRHZBQUFBQ0FBQVFBQUFBRUFBSHpFMnA5ZkR6ejFBQWtFQUFBQUFBRFJlY1VXQUFBQUFOUUE2UjhBQUFBQUFvQUN3QUFBQUFnQUFnQUFBQUFBQUFBQkFBQUR3UC9BQUFBQ2dBQUEvOU1DclFBQkFBQUFBQUFBQUFBQUFBQUFBQUFBQXdBQkFBQUFBd0JWQUFJQUFBQUFBQUlBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU1DUUFHUUFBVUFBQUtaQXN3QUFBQ1BBcGtDekFBQUFlc0FNd0VKQUFBQUFBQUFBQUFBQUFBQUFBQUFBUkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFRQUFnLy8wRHdQL0FBRUFEd0FCQUFBQUFBUUFBQUFBQUFBQUFBQUFBSUFBQUFBQUFBQUlBQUFBQ2dBQXhBQUFBQXdBQUFBTUFBQUFjQUFFQUF3QUFBQndBQXdBQkFBQUFIQUFFQURBQUFBQUlBQWdBQWdBQUFDRHB5Ly85Ly84QUFBQWc2Y3YvL2YvLy8rRVdOd0FEQUFFQUFBQUFBQUFBQUFBQUFBQUFDQUNFQUFFQUFBQUFBQUFBQUFBQUFBQXhBQUFDQUFRQVJBS0FBc0FBS3dCVUFBQUJJaVluSmpRM056WTJNeklXRnhZVUJ3Y0dJaWNtTkRjM05qUW5KaVlqSWdZSEJ3WVVGeFlVQndZR0l3Y2lKaWNtTkRjM05qSVhGaFFIQndZVUZ4WVdNekkyTnpjMk5DY21ORGMyTWhjV0ZBY0hCZ1lqQVJRR0RBVXRMWG9XT1I4Zk9SWXRMVGdLR3dvS0NqZ2FHZzBnRWhJZ0RYb2FHZ2tKQlF3SGRSODVGaTB0T0FvYkNnb0tPQm9hRFNBU0VpQU5laG9hQ1FrS0d3b3RMWG9XT1I4Qk13VUZMWUV1ZWhZWEZ4WXVnQzQ0Q1FrS0d3bzRHa29hRFEwTkRYb2FTaG9LR3dvRkJlOFhGaTZBTGpnSkNRb2JDamdhU2hvTkRRME5laHBLR2dvYkNnb0tMWUV1ZWhZWEFBQUFEQUNXQUFFQUFBQUFBQUVBQ0FBQUFBRUFBQUFBQUFJQUF3QUlBQUVBQUFBQUFBTUFDQUFBQUFFQUFBQUFBQVFBQ0FBQUFBRUFBQUFBQUFVQUFRQUxBQUVBQUFBQUFBWUFDQUFBQUFNQUFRUUpBQUVBRUFBTUFBTUFBUVFKQUFJQUJnQWNBQU1BQVFRSkFBTUFFQUFNQUFNQUFRUUpBQVFBRUFBTUFBTUFBUVFKQUFVQUFnQWlBQU1BQVFRSkFBWUFFQUFNWVc1amFHOXlhbk0wTURCQUFHRUFiZ0JqQUdnQWJ3QnlBR29BY3dBMEFEQUFNQUJBQUFBQUF3QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCQUFILy93QVApIGZvcm1hdChcInRydWV0eXBlXCIpJyArXG4gICAgICAgICAgJ30nLFxuICAgICAgICAgIHBzZXVkb0VsQ29udGVudCA9XG4gICAgICAgICAgJ1tkYXRhLWFuY2hvcmpzLWljb25dOjphZnRlcnsnICAgICAgICAgICArXG4gICAgICAgICAgICAnY29udGVudDphdHRyKGRhdGEtYW5jaG9yanMtaWNvbiknICAgICArXG4gICAgICAgICAgJ30nLFxuICAgICAgICAgIGZpcnN0U3R5bGVFbDtcblxuICAgICAgc3R5bGUuY2xhc3NOYW1lID0gJ2FuY2hvcmpzJztcbiAgICAgIHN0eWxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKSk7IC8vIE5lY2Vzc2FyeSBmb3IgV2Via2l0LlxuXG4gICAgICAvLyBXZSBwbGFjZSBpdCBpbiB0aGUgaGVhZCB3aXRoIHRoZSBvdGhlciBzdHlsZSB0YWdzLCBpZiBwb3NzaWJsZSwgc28gYXMgdG9cbiAgICAgIC8vIG5vdCBsb29rIG91dCBvZiBwbGFjZS4gV2UgaW5zZXJ0IGJlZm9yZSB0aGUgb3RoZXJzIHNvIHRoZXNlIHN0eWxlcyBjYW4gYmVcbiAgICAgIC8vIG92ZXJyaWRkZW4gaWYgbmVjZXNzYXJ5LlxuICAgICAgZmlyc3RTdHlsZUVsID0gZG9jdW1lbnQuaGVhZC5xdWVyeVNlbGVjdG9yKCdbcmVsPVwic3R5bGVzaGVldFwiXSxzdHlsZScpO1xuICAgICAgaWYgKGZpcnN0U3R5bGVFbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQuaGVhZC5pbnNlcnRCZWZvcmUoc3R5bGUsIGZpcnN0U3R5bGVFbCk7XG4gICAgICB9XG5cbiAgICAgIHN0eWxlLnNoZWV0Lmluc2VydFJ1bGUobGlua1J1bGUsIHN0eWxlLnNoZWV0LmNzc1J1bGVzLmxlbmd0aCk7XG4gICAgICBzdHlsZS5zaGVldC5pbnNlcnRSdWxlKGhvdmVyUnVsZSwgc3R5bGUuc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICAgIHN0eWxlLnNoZWV0Lmluc2VydFJ1bGUocHNldWRvRWxDb250ZW50LCBzdHlsZS5zaGVldC5jc3NSdWxlcy5sZW5ndGgpO1xuICAgICAgc3R5bGUuc2hlZXQuaW5zZXJ0UnVsZShhbmNob3Jqc0xpbmtGb250RmFjZSwgc3R5bGUuc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gQW5jaG9ySlM7XG59KSk7XG4iLCJjb25zdCBmYW5jeUJveEluaXQgPSAoaW1nKSA9PiB7XG4gIGxldCBvdXRlciA9IGltZy5vdXRlckhUTUxcbiAgbGV0IGltZ1NyYyA9IC9zcmM9XCIoLiopXCIvLmV4ZWMob3V0ZXIpICYmIC9zcmM9XCIoLiopXCIvLmV4ZWMob3V0ZXIpWzFdXG4gIGxldCBpbWdBbHQgPVxuICAgICgvYWx0PVwiKC4qKVwiLy5leGVjKG91dGVyKSAmJiAvYWx0PVwiKC4qKVwiLy5leGVjKG91dGVyKVsxXSkgfHxcbiAgICAoL3RpdGxlPVwiKC4qKVwiLy5leGVjKG91dGVyKSAmJiAvdGl0bGU9XCIoLiopXCIvLmV4ZWMob3V0ZXIpWzFdKSB8fFxuICAgICcnXG4gIGltZy5vdXRlckhUTUwgPVxuICAgICc8YSBjbGFzcz1cImZhbmN5LWxpbmtcIiBocmVmPVwiJyArXG4gICAgaW1nU3JjICtcbiAgICAnXCIgZGF0YS1mYW5jeWJveD1cImdyb3VwXCIgZGF0YS1jYXB0aW9uPVwiJyArXG4gICAgaW1nQWx0ICtcbiAgICAnXCI+JyArXG4gICAgb3V0ZXIgK1xuICAgICc8L2E+J1xufVxuXG5leHBvcnQgZGVmYXVsdCAoKSA9PiB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hcnRpY2xlLWVudHJ5IGltZycpLmZvckVhY2goZmFuY3lCb3hJbml0KVxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYWJvdXQtYm9keSBjb250YWluZXIgaW1nJykuZm9yRWFjaChmYW5jeUJveEluaXQpXG59XG4iLCJpbXBvcnQgQW5jaG9ySlMgZnJvbSAnYW5jaG9yLWpzJ1xuXG5sZXQgaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0ICRpbnRyb0ltZyA9ICQoJy5zaXRlLWludHJvLWltZzpmaXJzdCcpLFxuICAgIGludHJvUGxhY2Vob2xkZXIgPSAkKCcuc2l0ZS1pbnRyby1wbGFjZWhvbGRlcjpmaXJzdCcpLFxuICAgIGJnQ1NTID0gJGludHJvSW1nLmNzcygnYmFja2dyb3VuZC1pbWFnZScpLFxuICAgIGJnUmVnUmVzdWx0ID0gYmdDU1MubWF0Y2goL3VybFxcKFwiKihbXlwiXSopXCIqXFwpLylcblxuICBpZiAoYmdSZWdSZXN1bHQubGVuZ3RoIDwgMikge1xuICAgIGNvbnNvbGUubG9nKCcuLi4nKVxuICAgIGNvbnNvbGUubG9nKGJnUmVnUmVzdWx0KVxuICAgIHJldHVyblxuICB9XG5cbiAgbGV0IGJnVVJMID0gYmdSZWdSZXN1bHRbMV0sXG4gICAgaW1nID0gbmV3IEltYWdlKClcbiAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB3aW5kb3cuYWxlcnQoKVxuICAgIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGludHJvUGxhY2Vob2xkZXIucmVtb3ZlKClcbiAgICAvLyB9LCAxMDApXG4gICAgY29uc29sZS5pbmZvKCdQTEFDRUhPTERFUiBSRU1PVkVEJylcbiAgfVxuICBpbWcuc3JjID0gYmdVUkxcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgICdET01Db250ZW50TG9hZGVkJyxcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAkKCcuY29udGFpbmVyJykucmVtb3ZlQ2xhc3MoJ2NvbnRhaW5lci11bmxvYWRlZCcpXG4gICAgICAkKCcuZm9vdGVyJykucmVtb3ZlQ2xhc3MoJ2Zvb3Rlci11bmxvYWRlZCcpXG4gICAgICAkKCcubG9hZGluZycpLnJlbW92ZSgpXG4gICAgfSxcbiAgICBmYWxzZVxuICApXG5cbiAgLy8gaHR0cHM6Ly93d3cuYnJ5YW5icmF1bi5jb20vYW5jaG9yanMvXG4gIGxldCBhbmNob3JzID0gbmV3IEFuY2hvckpTKClcbiAgYW5jaG9ycy5vcHRpb25zID0ge1xuICAgIHBsYWNlbWVudDogJ3JpZ2h0JyxcbiAgICBjbGFzczogJ2FuY2hvcmpzLWFyY2hlcicsXG4gIH1cbiAgYW5jaG9ycy5hZGQoKVxufVxuXG5leHBvcnQgZGVmYXVsdCBpbml0XG4iLCJpbXBvcnQgU2lkZWJhciBmcm9tICcuL3NpZGViYXInXG5cbmxldCBteVNpZGViYXIgPSBuZXcgU2lkZWJhcih7XG4gIHNpZGViYXI6ICcuc2lkZWJhcicsXG4gIG5hdjogJy5zaWRlYmFyLXRhYnMnLFxuICB0YWJzOiAnLnNpZGViYXItdGFicyBsaScsXG4gIGNvbnRlbnQ6ICcuc2lkZWJhci1jb250ZW50JyxcbiAgcGFuZWxzOiAnLnNpZGVhYmFyLWNvbnRlbnRzID4gZGl2JyxcbiAgbWVudUJ1dHRvbjogJy5oZWFkZXItc2lkZWJhci1tZW51Jyxcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IG15U2lkZWJhclxuIiwibGV0IGluaXRNb2JpbGUgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh3aW5kb3cubWF0Y2hNZWRpYSkge1xuICAgIGxldCBtcWwgPSB3aW5kb3cubWF0Y2hNZWRpYSgnKG1heC13aWR0aDogOTgwcHgpJylcbiAgICBtcWwuYWRkTGlzdGVuZXIobWVkaWFDaGFuZ2VIYW5kbGVyKVxuICAgIG1lZGlhQ2hhbmdlSGFuZGxlcihtcWwpXG4gIH0gZWxzZSB7XG4gICAgd2luZG93LmFkZExpc3RlbmVyKFxuICAgICAgJ3Jlc2l6ZScsXG4gICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxldCBpbm5lcldpZHRoID1cbiAgICAgICAgICB3aW5kb3cuaW5uZXJXaWR0aCB8fFxuICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCB8fFxuICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGhcbiAgICAgICAgbWVkaWFDaGFuZ2VIYW5kbGVyKFxuICAgICAgICAgIGlubmVyV2lkdGggPiA5MDBcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIG1hdGNoZXM6IGZhbHNlLFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICBtYXRjaGVzOiB0cnVlLFxuICAgICAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIH0sXG4gICAgICBmYWxzZVxuICAgIClcbiAgfVxuXG4gIGZ1bmN0aW9uIG1lZGlhQ2hhbmdlSGFuZGxlcihtcWwpIHtcbiAgICBpZiAobXFsLm1hdGNoZXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdtb2JpbGUnKVxuICAgICAgLy8gVE9ETzogd2h5XG4gICAgICBtb2JpbGVQcmV2ZW50U2Nyb2xsQnJlYWtkb3duKClcbiAgICAgIC8vIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGZ1bmN0aW9uICgpIHt9KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnZGVza3RvcCcpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbW9iaWxlUHJldmVudFNjcm9sbEJyZWFrZG93bigpIHt9XG59XG5cbmV4cG9ydCB7IGluaXRNb2JpbGUgfVxuIiwiaW1wb3J0IGFyY2hlclV0aWwgZnJvbSAnLi91dGlsJ1xuXG5sZXQgc2Nyb2xsID0gZnVuY3Rpb24gKCkge1xuICBsZXQgJGJhbm5lciA9ICQoJy5iYW5uZXI6Zmlyc3QnKSxcbiAgICAkcG9zdEJhbm5lciA9ICRiYW5uZXIuZmluZCgnLnBvc3QtdGl0bGUgYScpLFxuICAgICRiZ0VsZSA9ICQoJy5zaXRlLWludHJvOmZpcnN0JyksXG4gICAgJGhvbWVMaW5rID0gJCgnLmhvbWUtbGluazpmaXJzdCcpLFxuICAgICRiYWNrVG9wID0gJCgnLmJhY2stdG9wOmZpcnN0JyksXG4gICAgJHNpZGViYXJNZW51ID0gJCgnLmhlYWRlci1zaWRlYmFyLW1lbnU6Zmlyc3QnKSxcbiAgICAkdG9jV3JhcHBlciA9ICQoJy50b2Mtd3JhcHBlcjpmaXJzdCcpLFxuICAgICR0b2NDYXRhbG9nID0gJHRvY1dyYXBwZXIuZmluZCgnLnRvYy1jYXRhbG9nJyksXG4gICAgJHByb2dyZXNzQmFyID0gJCgnLnJlYWQtcHJvZ3Jlc3MnKSxcbiAgICBiZ1RpdGxlSGVpZ2h0ID0gJGJnRWxlLm9mZnNldCgpLnRvcCArICRiZ0VsZS5vdXRlckhlaWdodCgpXG5cbiAgLy8gdG9jIOeahOaUtue8qVxuICAkdG9jQ2F0YWxvZy5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgJHRvY1dyYXBwZXIudG9nZ2xlQ2xhc3MoJ3RvYy1oaWRlLWNoaWxkcmVuJylcbiAgfSlcblxuICAvLyDmu5rliqjlvI/liIfmjaLmlofnq6DmoIfpopjlkoznq5nngrnmoIfpophcbiAgY29uc3Qgc2hvd0Jhbm5lclNjcm9sbEhlaWdodCA9IC01MDBcbiAgbGV0IHByZXZpb3VzSGVpZ2h0ID0gMCxcbiAgICBjb250aW51ZVNjcm9sbCA9IDBcblxuICBmdW5jdGlvbiBpc1Njcm9sbGluZ1VwT3JEb3duKGN1cnJUb3ApIHtcbiAgICBjb250aW51ZVNjcm9sbCArPSBjdXJyVG9wIC0gcHJldmlvdXNIZWlnaHRcbiAgICBpZiAoY29udGludWVTY3JvbGwgPiAzMCkge1xuICAgICAgLy8g5ZCR5LiL5ruR5YqoXG4gICAgICBjb250aW51ZVNjcm9sbCA9IDBcbiAgICAgIHJldHVybiAxXG4gICAgfSBlbHNlIGlmIChjb250aW51ZVNjcm9sbCA8IHNob3dCYW5uZXJTY3JvbGxIZWlnaHQpIHtcbiAgICAgIC8vIOWQkeS4iua7keWKqFxuICAgICAgY29udGludWVTY3JvbGwgPSAwXG4gICAgICByZXR1cm4gLTFcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDBcbiAgICB9XG4gIH1cblxuICAvLyDmmK/lkKblnKjlkJHkuIrmiJblkJHkuIvmu5rliqhcbiAgbGV0IGNyb3NzaW5nU3RhdGUgPSAtMVxuICBsZXQgaXNIaWdoZXJUaGFuSW50cm8gPSB0cnVlXG4gIGZ1bmN0aW9uIGlzQ3Jvc3NpbmdJbnRybyhjdXJyVG9wKSB7XG4gICAgLy8g5ZCR5LiL5ruR5Yqo6LaF6L+HIGludHJvXG4gICAgaWYgKGN1cnJUb3AgPiBiZ1RpdGxlSGVpZ2h0KSB7XG4gICAgICBpZiAoY3Jvc3NpbmdTdGF0ZSAhPT0gMSkge1xuICAgICAgICBjcm9zc2luZ1N0YXRlID0gMVxuICAgICAgICBpc0hpZ2hlclRoYW5JbnRybyA9IGZhbHNlXG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIOWQkeS4iua7keWKqOi2hei/hyBpbnRyb1xuICAgICAgaWYgKGNyb3NzaW5nU3RhdGUgIT09IC0xKSB7XG4gICAgICAgIGNyb3NzaW5nU3RhdGUgPSAtMVxuICAgICAgICBpc0hpZ2hlclRoYW5JbnRybyA9IHRydWVcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAwXG4gIH1cblxuICAvLyDliKTmlq3mmK/lkKbkuLogcG9zdC1wYWdlXG4gIGxldCBpc1Bvc3RQYWdlID0gZmFsc2VcbiAgbGV0IGFydGljbGVIZWlnaHQsIGFydGljbGVUb3BcbiAgaWYgKCQoJy5wb3N0LWJvZHknKS5sZW5ndGgpIHtcbiAgICBpc1Bvc3RQYWdlID0gdHJ1ZVxuICAgIGFydGljbGVUb3AgPSBiZ1RpdGxlSGVpZ2h0XG4gICAgLy8g5aaC5p6c5omn6KGM5pe25Yqo55S75bey5omn6KGM5a6M5q+VXG4gICAgYXJ0aWNsZUhlaWdodCA9ICQoJy5hcnRpY2xlLWVudHJ5Jykub3V0ZXJIZWlnaHQoKVxuICAgIC8vIOWmguaenOaJp+ihjOaXtuWKqOeUu+acquaJp+ihjOWujOavlVxuICAgIGFydGljbGVIZWlnaHQgPSAkKCcuY29udGFpbmVyJylbMF0uYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsICgpID0+IHtcbiAgICAgIGFydGljbGVIZWlnaHQgPSAkKCcuYXJ0aWNsZS1lbnRyeScpLm91dGVySGVpZ2h0KClcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlUHJvZ3Jlc3Moc2Nyb2xsVG9wLCBiZWdpblksIGNvbnRlbnRIZWlnaHQpIHtcbiAgICBsZXQgd2luZG93SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpXG4gICAgbGV0IHJlYWRQZXJjZW50XG4gICAgaWYgKHNjcm9sbFRvcCA8IGJnVGl0bGVIZWlnaHQpIHtcbiAgICAgIHJlYWRQZXJjZW50ID0gMFxuICAgIH0gZWxzZSB7XG4gICAgICByZWFkUGVyY2VudCA9XG4gICAgICAgICgoc2Nyb2xsVG9wIC0gYmVnaW5ZKSAvIChjb250ZW50SGVpZ2h0IC0gd2luZG93SGVpZ2h0KSkgKiAxMDBcbiAgICB9XG4gICAgLy8g6Ziy5q2i5paH56ug6L+H55+t77yM5Lqn55Sf6LSf55m+5YiG5q+UXG4gICAgcmVhZFBlcmNlbnQgPSByZWFkUGVyY2VudCA+PSAwID8gcmVhZFBlcmNlbnQgOiAxMDBcbiAgICBsZXQgcmVzdFBlcmNlbnQgPSByZWFkUGVyY2VudCAtIDEwMCA8PSAwID8gcmVhZFBlcmNlbnQgLSAxMDAgOiAwXG4gICAgJHByb2dyZXNzQmFyWzBdLnN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUzZCgke3Jlc3RQZXJjZW50fSUsIDAsIDApYFxuICB9XG5cbiAgLy8gckFGIOaTjeS9nFxuICBsZXQgdGlja2luZ1Njcm9sbCA9IGZhbHNlXG4gIGZ1bmN0aW9uIHVwZGF0ZVNjcm9sbChzY3JvbGxUb3ApIHtcbiAgICBsZXQgY3Jvc3NpbmdTdGF0ZSA9IGlzQ3Jvc3NpbmdJbnRybyhzY3JvbGxUb3ApXG4gICAgLy8gaW50cm8g6L6555WM5YiH5o2iXG4gICAgaWYgKGNyb3NzaW5nU3RhdGUgPT09IDEpIHtcbiAgICAgICR0b2NXcmFwcGVyLmFkZENsYXNzKCd0b2MtZml4ZWQnKVxuICAgICAgJGhvbWVMaW5rLmFkZENsYXNzKCdob21lLWxpbmstaGlkZScpXG4gICAgICAkYmFja1RvcC5hZGRDbGFzcygnYmFjay10b3Atc2hvdycpXG4gICAgICAkc2lkZWJhck1lbnUuYWRkQ2xhc3MoJ2hlYWRlci1zaWRlYmFyLW1lbnUtYmxhY2snKVxuICAgIH0gZWxzZSBpZiAoY3Jvc3NpbmdTdGF0ZSA9PT0gLTEpIHtcbiAgICAgICR0b2NXcmFwcGVyLnJlbW92ZUNsYXNzKCd0b2MtZml4ZWQnKVxuICAgICAgJGhvbWVMaW5rLnJlbW92ZUNsYXNzKCdob21lLWxpbmstaGlkZScpXG4gICAgICAkYmFubmVyLnJlbW92ZUNsYXNzKCdiYW5uZXItc2hvdycpXG4gICAgICAkYmFja1RvcC5yZW1vdmVDbGFzcygnYmFjay10b3Atc2hvdycpXG4gICAgICAkc2lkZWJhck1lbnUucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zaWRlYmFyLW1lbnUtYmxhY2snKVxuICAgIH1cbiAgICAvLyDlpoLmnpzkuI3mmK8gcG9zdC1wYWdlIOS7peS4i+W/veeVpVxuICAgIGlmIChpc1Bvc3RQYWdlKSB7XG4gICAgICAvLyDkuIrkuIvmu5HliqjkuIDlrprot53nprvmmL7npLov6ZqQ6JePIGhlYWRlclxuICAgICAgbGV0IHVwRG93blN0YXRlID0gaXNTY3JvbGxpbmdVcE9yRG93bihzY3JvbGxUb3ApXG4gICAgICBpZiAodXBEb3duU3RhdGUgPT09IDEpIHtcbiAgICAgICAgJGJhbm5lci5yZW1vdmVDbGFzcygnYmFubmVyLXNob3cnKVxuICAgICAgfSBlbHNlIGlmICh1cERvd25TdGF0ZSA9PT0gLTEgJiYgIWlzSGlnaGVyVGhhbkludHJvKSB7XG4gICAgICAgICRiYW5uZXIuYWRkQ2xhc3MoJ2Jhbm5lci1zaG93JylcbiAgICAgIH1cbiAgICAgIC8vIOi/m+W6puadoeWQm+eahOmVv+W6plxuICAgICAgdXBkYXRlUHJvZ3Jlc3Moc2Nyb2xsVG9wLCBhcnRpY2xlVG9wLCBhcnRpY2xlSGVpZ2h0KVxuICAgIH1cbiAgICBwcmV2aW91c0hlaWdodCA9IHNjcm9sbFRvcFxuICAgIHRpY2tpbmdTY3JvbGwgPSBmYWxzZVxuICB9XG5cbiAgLy8gc2Nyb2xsIOWbnuiwg1xuICBmdW5jdGlvbiBvblNjcm9sbCgpIHtcbiAgICBjb25zdCBzY3JvbGxUb3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKVxuICAgIGNvbnN0IGJpbmRlZFVwZGF0ZSA9IHVwZGF0ZVNjcm9sbC5iaW5kKG51bGwsIHNjcm9sbFRvcClcbiAgICBhcmNoZXJVdGlsLnJhZlRpY2sodGlja2luZ1Njcm9sbCwgYmluZGVkVXBkYXRlKVxuICB9XG5cbiAgY29uc3QgdGhyb3R0bGVPblNjcm9sbCA9IGFyY2hlclV0aWwudGhyb3R0bGUob25TY3JvbGwsIDI1LCB0cnVlKVxuICAkKGRvY3VtZW50KS5vbignc2Nyb2xsJywgdGhyb3R0bGVPblNjcm9sbCkgLy8g5q+PIDI1IG1zIOaJp+ihjOS4gOasoSBvblNjcm9sbCgpIOaWueazlVxuXG4gIC8vIOe7keWumui/lOWbnumhtumDqOS6i+S7tlxuICA7WyRwb3N0QmFubmVyLCAkYmFja1RvcF0uZm9yRWFjaChmdW5jdGlvbiAoZWxlKSB7XG4gICAgZWxlLm9uKCdjbGljaycsIGFyY2hlclV0aWwuYmFja1RvcClcbiAgfSlcbn1cblxuZXhwb3J0IHsgc2Nyb2xsIH1cbiIsImltcG9ydCBQZXJmZWN0U2Nyb2xsYmFyIGZyb20gJ3BlcmZlY3Qtc2Nyb2xsYmFyJ1xuXG5jb25zdCBTZWxlY3RvciA9IChjbGFzc1ByZWZpeCkgPT4gKHtcbiAgQUNUSVZFOiBgJHtjbGFzc1ByZWZpeH0tYWN0aXZlYCxcbn0pXG5cbmNsYXNzIFNpZGViYXIge1xuICBzdGF0aWMgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgYWN0aXZlSW5kZXg6IDAsXG4gIH1cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IHsgLi4uU2lkZWJhci5kZWZhdWx0T3B0aW9ucywgLi4ub3B0aW9ucyB9XG4gICAgdGhpcy5hY3RpdmVJbmRleCA9IHRoaXMub3B0aW9ucy5hY3RpdmVJbmRleFxuICAgIHRoaXMuX2luaXRFbGVtZW50cygpXG4gICAgdGhpcy5faW5pdFRhYnMoKVxuICAgIHRoaXMuX2JpbmRUYWJzQ2xpY2soKVxuICAgIHRoaXMuX2JpbmRCdXR0b25DbGljaygpXG4gICAgdGhpcy5fYmluZFdyYXBwZXJDbGljaygpXG4gICAgdGhpcy5fYmluZFdyYXBwZXJUcmFuc2l0aW9uRW5kKClcbiAgICB0aGlzLnBlcmZlY3RTY3JvbGxiYXIoKVxuICB9XG5cbiAgX2luaXRFbGVtZW50cygpIHtcbiAgICB0aGlzLiRzaWRlYmFyID0gJCh0aGlzLm9wdGlvbnMuc2lkZWJhcilcbiAgICB0aGlzLiR0YWJzID0gJCh0aGlzLm9wdGlvbnMudGFicylcbiAgICB0aGlzLiRwYW5lbHMgPSAkKHRoaXMub3B0aW9ucy5wYW5lbHMpXG4gICAgdGhpcy4kbWVudUJ1dHRvbiA9ICQodGhpcy5vcHRpb25zLm1lbnVCdXR0b24pXG4gICAgdGhpcy4kbmF2ID0gJCh0aGlzLm9wdGlvbnMubmF2KVxuICAgIHRoaXMuJGNvbnRlbnQgPSAkKHRoaXMub3B0aW9ucy5jb250ZW50KVxuICB9XG5cbiAgX2luaXRUYWJzKCkge1xuICAgIHRoaXMuJHRhYnMuZWFjaCgoaW5kZXgsIHRhYikgPT4ge1xuICAgICAgJCh0YWIpLmRhdGEoJ3RhYkluZGV4JywgaW5kZXgpXG4gICAgfSlcbiAgfVxuXG4gIGFjdGl2YXRlU2lkZWJhcigpIHtcbiAgICAkKCcud3JhcHBlcicpLmFkZENsYXNzKCd3cmFwcGVyLXNpZGViYXItYWN0aXZlJylcbiAgICAkKCcuaGVhZGVyJykuYWRkQ2xhc3MoJ2hlYWRlci1zaWRlYmFyLWFjdGl2ZScpXG4gICAgJCgnLmZvb3Rlci1maXhlZCcpLmFkZENsYXNzKCdmb290ZXItZml4ZWQtc2lkZWJhci1hY3RpdmUnKVxuICAgICQoJy50b2Mtd3JhcHBlcicpLmFkZENsYXNzKCd0b2Mtc2xpZGUnKVxuICAgIHRoaXMuJG1lbnVCdXR0b24uYWRkQ2xhc3MoJ2hlYWRlci1zaWRlYmFyLW1lbnUtYWN0aXZlJylcbiAgICB0aGlzLiRzaWRlYmFyLnJlbW92ZUNsYXNzKCdzaWRlYmFyLWhpZGUnKVxuICAgIHRoaXMuJHNpZGViYXIuYWRkQ2xhc3MoJ3NpZGViYXItYWN0aXZlJylcbiAgfVxuXG4gIF9pbmFjdGl2YXRlU2lkZWJhcigpIHtcbiAgICAkKCcud3JhcHBlcicpLnJlbW92ZUNsYXNzKCd3cmFwcGVyLXNpZGViYXItYWN0aXZlJylcbiAgICAkKCcuaGVhZGVyJykucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zaWRlYmFyLWFjdGl2ZScpXG4gICAgJCgnLmZvb3Rlci1maXhlZCcpLnJlbW92ZUNsYXNzKCdmb290ZXItZml4ZWQtc2lkZWJhci1hY3RpdmUnKVxuICAgICQoJy50b2Mtd3JhcHBlcicpLnJlbW92ZUNsYXNzKCd0b2Mtc2xpZGUnKVxuICAgIHRoaXMuJG1lbnVCdXR0b24ucmVtb3ZlQ2xhc3MoJ2hlYWRlci1zaWRlYmFyLW1lbnUtYWN0aXZlJylcbiAgICB0aGlzLiRzaWRlYmFyLnJlbW92ZUNsYXNzKGBzaWRlYmFyLWFjdGl2ZWApXG4gIH1cblxuICBzd2l0Y2hUbyh0b0luZGV4KSB7XG4gICAgdGhpcy5fc3dpdGNoVG8odG9JbmRleClcbiAgfVxuXG4gIF9zd2l0Y2hUYWIodG9JbmRleCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICBpZiAoaSAhPT0gdG9JbmRleCkge1xuICAgICAgICB0aGlzLiRuYXYucmVtb3ZlQ2xhc3MoYHNpZGViYXItdGFicy1hY3RpdmUtJHtpfWApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiRuYXYuYWRkQ2xhc3MoYHNpZGViYXItdGFicy1hY3RpdmUtJHtpfWApXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2JpbmRXcmFwcGVyVHJhbnNpdGlvbkVuZCgpIHtcbiAgICAkKCcud3JhcHBlcicpLm9uKCd0cmFuc2l0aW9uZW5kJywgKGUpID0+IHtcbiAgICAgIGlmICghdGhpcy4kc2lkZWJhci5oYXNDbGFzcygnc2lkZWJhci1hY3RpdmUnKSkge1xuICAgICAgICB0aGlzLiRzaWRlYmFyLmFkZENsYXNzKCdzaWRlYmFyLWhpZGUnKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBfc3dpdGNoUGFuZWwodG9JbmRleCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICBpZiAoaSAhPT0gdG9JbmRleCkge1xuICAgICAgICB0aGlzLiRjb250ZW50LnJlbW92ZUNsYXNzKGBzaWRlYmFyLWNvbnRlbnQtYWN0aXZlLSR7aX1gKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kY29udGVudC5hZGRDbGFzcyhgc2lkZWJhci1jb250ZW50LWFjdGl2ZS0ke2l9YClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfc3dpdGNoVG8odG9JbmRleCkge1xuICAgIHRoaXMuX3N3aXRjaFRhYih0b0luZGV4KVxuICAgIHRoaXMuX3N3aXRjaFBhbmVsKHRvSW5kZXgpXG4gIH1cblxuICBfYmluZFRhYnNDbGljaygpIHtcbiAgICB0aGlzLiR0YWJzLmNsaWNrKChlKSA9PiB7XG4gICAgICBjb25zdCAkdGFyZ2V0ID0gJChlLnRhcmdldClcbiAgICAgIHRoaXMuc3dpdGNoVG8oJHRhcmdldC5kYXRhKCd0YWJJbmRleCcpKVxuICAgIH0pXG4gIH1cblxuICBfYmluZEJ1dHRvbkNsaWNrKCkge1xuICAgIHRoaXMuJG1lbnVCdXR0b24uY2xpY2soKGUpID0+IHtcbiAgICAgIGlmICh0aGlzLiRzaWRlYmFyLmhhc0NsYXNzKCdzaWRlYmFyLWhpZGUnKSkge1xuICAgICAgICB0aGlzLmFjdGl2YXRlU2lkZWJhcigpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9pbmFjdGl2YXRlU2lkZWJhcigpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIF9iaW5kV3JhcHBlckNsaWNrKCkge1xuICAgICQoJy53cmFwcGVyJykuY2xpY2soKGUpID0+IHtcbiAgICAgIHRoaXMuX2luYWN0aXZhdGVTaWRlYmFyKClcbiAgICB9KVxuICB9XG5cbiAgLy8g6Zi75q2ic2lkZWJhckNvbnRlbnTlnKjmu5rliqjliLDpobbpg6jmiJblupXpg6jml7bnu6fnu63mu5rliqhcbiAgcGVyZmVjdFNjcm9sbGJhcigpIHtcbiAgICBjb25zdCBwcyA9IG5ldyBQZXJmZWN0U2Nyb2xsYmFyKCcuc2lkZWJhcicsIHtcbiAgICAgIHN1cHByZXNzU2Nyb2xsWDogdHJ1ZSxcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNpZGViYXJcbiIsImltcG9ydCBhcmNoZXJVdGlsIGZyb20gJy4vdXRpbCdcbmltcG9ydCBzaWRlYmFyIGZyb20gJy4vaW5pdFNpZGViYXInXG5pbXBvcnQgRW1pdHRlciBmcm9tICdldmVudGVtaXR0ZXIzJ1xuXG5jbGFzcyBNZXRhSW5mbyB7XG4gIGNvbnN0cnVjdG9yKG1ldGFOYW1lLCBsYWJlbHNDb250YWluZXIsIHBvc3RDb250YWluZXIpIHtcbiAgICB0aGlzLmN1cnJMYWJlbE5hbWUgPSAnJ1xuICAgIHRoaXMuaXNJbml0ZWQgPSBmYWxzZVxuICAgIHRoaXMucG9zdHNBcnIgPSBudWxsXG4gICAgdGhpcy5tZXRhTmFtZSA9IG1ldGFOYW1lXG4gICAgdGhpcy5sYWJlbHNDb250YWluZXIgPSAkKGxhYmVsc0NvbnRhaW5lcilbMF1cbiAgICB0aGlzLnBvc3RDb250YWluZXIgPSAkKHBvc3RDb250YWluZXIpWzBdXG4gICAgdGhpcy5pbmRleE1hcCA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX2JpbmRMYWJlbENsaWNrKClcbiAgfVxuXG4gIGNoYW5nZUxhYmVsKGN1cnJMYWJlbE5hbWUpIHtcbiAgICBpZiAodHlwZW9mIGN1cnJMYWJlbE5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmN1cnJMYWJlbE5hbWUgPSBjdXJyTGFiZWxOYW1lXG4gICAgICB0aGlzLl9jaGFuZ2VMaXN0KClcbiAgICAgIHRoaXMuX2NoYW5nZUZvY3VzKClcbiAgICB9XG4gIH1cblxuICBfYmluZExhYmVsQ2xpY2soKSB7XG4gICAgdGhpcy5sYWJlbHNDb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgbGV0IGN1cnJMYWJlbE5hbWUgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoYGRhdGEtJHt0aGlzLm1ldGFOYW1lfWApXG4gICAgICB0aGlzLmNoYW5nZUxhYmVsKGN1cnJMYWJlbE5hbWUpXG4gICAgfSlcbiAgfVxuXG4gIF9jaGFuZ2VGb2N1cyhsYWJlbCkge1xuICAgIGxldCBjdXJyRm9jdXMgPSB0aGlzLmxhYmVsc0NvbnRhaW5lci5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFxuICAgICAgJ3NpZGViYXItbGFiZWwtZm9jdXMnXG4gICAgKVxuICAgIDtbLi4uY3VyckZvY3VzXS5mb3JFYWNoKChpdGVtKSA9PlxuICAgICAgaXRlbS5jbGFzc0xpc3QucmVtb3ZlKCdzaWRlYmFyLWxhYmVsLWZvY3VzJylcbiAgICApXG4gICAgO1suLi50aGlzLmxhYmVsc0NvbnRhaW5lci5jaGlsZHJlbl0uZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaWYgKGl0ZW0uZ2V0QXR0cmlidXRlKGBkYXRhLSR7dGhpcy5tZXRhTmFtZX1gKSA9PT0gdGhpcy5jdXJyTGFiZWxOYW1lKSB7XG4gICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnc2lkZWJhci1sYWJlbC1mb2N1cycpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIF9jaGFuZ2VMaXN0KCkge1xuICAgIGxldCBpbmRleEFyciA9IHRoaXMuaW5kZXhNYXAuZ2V0KHRoaXMuY3VyckxhYmVsTmFtZSlcbiAgICB0cnkge1xuICAgICAgbGV0IGNvcnJBcnIgPSBpbmRleEFyci5tYXAoKGluZGV4KSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvc3RzQXJyW2luZGV4XVxuICAgICAgfSlcbiAgICAgIHRoaXMuX2NyZWF0ZVBvc3RzRG9tKGNvcnJBcnIpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICdQbGVhc2UgZW5zdXJlIHNldCBgdGFnczogdHJ1ZWAgYW5kIGBjYXRlZ29yaWVzOiB0cnVlYCBvZiB0aGUgaGV4by1jb250ZW50LWpzb24gY29uZmlnJ1xuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVQb3N0c0RvbShjb3JyQXJyKSB7XG4gICAgY29uc29sZS5sb2coY29yckFycilcbiAgICBsZXQgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuICAgIHRoaXMucG9zdENvbnRhaW5lci5pbm5lckhUTUwgPSAnJ1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29yckFyci5sZW5ndGg7IGkrKykge1xuICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0aGlzLl9jcmVhdGVQb3N0RG9tKGNvcnJBcnJbaV0pKVxuICAgIH1cbiAgICB0aGlzLnBvc3RDb250YWluZXIuYXBwZW5kQ2hpbGQoZnJhZylcbiAgfVxuXG4gIF9jcmVhdGVQb3N0RG9tKHBvc3RJbmZvKSB7XG4gICAgbGV0ICR0YWdJdGVtID0gJChcbiAgICAgICc8bGkgY2xhc3M9XCJtZXRhLXBvc3QtaXRlbVwiPjxzcGFuIGNsYXNzPVwibWV0YS1wb3N0LWRhdGVcIj4nICtcbiAgICAgICAgYXJjaGVyVXRpbC5kYXRlRm9ybWF0ZXIoXG4gICAgICAgICAgbmV3IERhdGUoRGF0ZS5wYXJzZShwb3N0SW5mby5kYXRlKSksXG4gICAgICAgICAgJ3l5eXkvTU0vZGQnXG4gICAgICAgICkgK1xuICAgICAgICAnPC9zcGFuPjwvbGk+J1xuICAgIClcbiAgICBsZXQgJGFJdGVtID0gJChcbiAgICAgICc8YSBjbGFzcz1cIm1ldGEtcG9zdC10aXRsZVwiIGhyZWY9XCInICtcbiAgICAgICAgc2l0ZU1ldGEucm9vdCArXG4gICAgICAgIHBvc3RJbmZvLnBhdGggK1xuICAgICAgICAnXCI+JyArXG4gICAgICAgIHBvc3RJbmZvLnRpdGxlICtcbiAgICAgICAgJzwvYT4nXG4gICAgKVxuICAgICR0YWdJdGVtLmFwcGVuZCgkYUl0ZW0pXG4gICAgcmV0dXJuICR0YWdJdGVtWzBdXG4gIH1cblxuICB0cnlJbml0KHBvc3RzQXJyKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5pc0luaXRlZCB8fFxuICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHBvc3RzQXJyKSA9PT0gJ1tvYmplY3QgTnVsbF0nXG4gICAgKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZm9yIChsZXQgcG9zdEluZGV4ID0gMDsgcG9zdEluZGV4IDwgcG9zdHNBcnIubGVuZ3RoOyBwb3N0SW5kZXgrKykge1xuICAgICAgbGV0IGN1cnJQb3N0TGFiZWxzID0gcG9zdHNBcnJbcG9zdEluZGV4XVt0aGlzLm1ldGFOYW1lXVxuICAgICAgLy8gaWYgdGhlcmUgaXMgYW55IHBvc3QgaGFzIGEgdGFnXG4gICAgICBpZiAoY3VyclBvc3RMYWJlbHMgJiYgY3VyclBvc3RMYWJlbHMubGVuZ3RoKSB7XG4gICAgICAgIGN1cnJQb3N0TGFiZWxzLmZvckVhY2goKHRhZ09yQ2F0ZXRvcnkpID0+IHtcbiAgICAgICAgICAvLyBpZiB0aGlzLm1ldGFOYW1lIGlzICdjYXRlZ29yaWVzJywgdGFnT3JDYXRldG9yeVsnc2x1ZyddIHdpbGwgYmUgdXNlZCBhcyBrZXkgaW4gdGhpcy5pbmRleE1hcFxuICAgICAgICAgIC8vIGVsc2UgaWYgdGhpcy5tZXRhTmFtZSBpcyAndGFnJywgdGFnT3JDYXRldG9yeVsnbmFtZSddIHdpbGwgYmUgdXNlZCBhcyBrZXkgaW4gdGhpcy5pbmRleE1hcFxuICAgICAgICAgIC8vIGNoZWNrIHRoZSBhcnJheSBwb3N0c0FyciBhbmQgeW91J2xsIGtub3cgd2h5LiAoYWN0dWFsbHkgeW91IGNhbiBqdXN0IHVzZSAnc2x1ZycgaW4gYm90aCBjYXNlKVxuICAgICAgICAgIGxldCBrZXkgPSB0aGlzLm1ldGFOYW1lID09PSAnY2F0ZWdvcmllcycgPyAnc2x1ZycgOiAnbmFtZSdcbiAgICAgICAgICBpZiAodGhpcy5pbmRleE1hcC5oYXModGFnT3JDYXRldG9yeVtrZXldKSkge1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5nZXQodGFnT3JDYXRldG9yeVtrZXldKS5wdXNoKHBvc3RJbmRleClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pbmRleE1hcC5zZXQodGFnT3JDYXRldG9yeVtrZXldLCBbcG9zdEluZGV4XSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmluZGV4TWFwLnNpemUpIHtcbiAgICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGBzaWRlYmFyLSR7dGhpcy5tZXRhTmFtZX0tZW1wdHlgKVswXVxuICAgICAgICAuY2xhc3NMaXN0LmFkZChgc2lkZWJhci0ke3RoaXMubWV0YU5hbWV9LWVtcHR5LWFjdGl2ZWApXG4gICAgfVxuXG4gICAgdGhpcy5wb3N0c0FyciA9IHBvc3RzQXJyXG4gICAgdGhpcy5pc0luaXRlZCA9IHRydWVcbiAgfVxufVxuXG5jbGFzcyBTaWRlYmFyTWV0YSB7XG4gIGNvbnN0cnVjdG9yKHRhYkNvdW50KSB7XG4gICAgdGhpcy50YWJDb3VudCA9IDBcbiAgICB0aGlzLmVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICAgdGhpcy5wb3N0c0FyciA9IG51bGxcbiAgICB0aGlzLm1ldGFzID0gW11cbiAgICB0aGlzLl9pbml0TWFwID0gdGhpcy5faW5pdE1hcC5iaW5kKHRoaXMpXG4gICAgdGhpcy5kYXRhTWFwcyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX3N1YnNjcmliZSgpXG4gICAgdGhpcy5fZmV0Y2hJbmZvKClcbiAgICB0aGlzLl9iaW5kT3RoZXJDbGljaygpXG4gIH1cblxuICAvLyBhZGQgYSBuZXcgdGFiIGFuZCB1cGRhdGEgYWxsIG1ldGFzXG4gIGFkZFRhYihwYXJhKSB7XG4gICAgdGhpcy50YWJDb3VudCsrXG4gICAgbGV0IG5ld01ldGEgPSBuZXcgTWV0YUluZm8oXG4gICAgICBwYXJhLm1ldGFOYW1lLFxuICAgICAgcGFyYS5sYWJlbHNDb250YWluZXIsXG4gICAgICBwYXJhLnBvc3RzQ29udGFpbmVyXG4gICAgKVxuICAgIG5ld01ldGEudHJ5SW5pdCh0aGlzLnBvc3RzQXJyKVxuICAgIHRoaXMubWV0YXMucHVzaChuZXdNZXRhKVxuICB9XG5cbiAgLy8gdXBkYXRlIGV2ZXJ5IE1ldGFJbmZvXG4gIF90cnlJbml0TWV0YXMoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm1ldGFzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLm1ldGFzW2ldLnRyeUluaXQodGhpcy5wb3N0c0FycilcbiAgICB9XG4gIH1cblxuICAvLyBzdWJzY3JpYmUgZGF0YSBvbmxvYWRcbiAgX3N1YnNjcmliZSgpIHtcbiAgICB0aGlzLmVtaXR0ZXIub24oJ0RBVEFfRkVUQ0hFRF9TVUNDRVNTJywgdGhpcy5faW5pdE1hcClcbiAgfVxuXG4gIC8vIGluaXQgbWFwc1xuICBfaW5pdE1hcCgpIHtcbiAgICBpZiAoIXRoaXMucG9zdHNBcnIubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5fdHJ5SW5pdE1ldGFzKClcbiAgfVxuXG4gIC8vIGZldGNoIGNvbnRlbnQuanNvblxuICBfZmV0Y2hJbmZvKCkge1xuICAgIC8vIHNpdGVNZXRhIGlzIGZyb20ganMtaW5mby5lanNcbiAgICBsZXQgY29udGVudFVSTCA9IHNpdGVNZXRhLnJvb3QgKyAnY29udGVudC5qc29uP3Q9JyArIE51bWJlcihuZXcgRGF0ZSgpKVxuICAgIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHhoci5yZXNwb25zZVR5cGUgPSAnJ1xuICAgIHhoci5vcGVuKCdnZXQnLCBjb250ZW50VVJMLCB0cnVlKVxuICAgIGxldCAkbG9hZEZhaWxlZCA9ICQoJy50YWctbG9hZC1mYWlsJylcbiAgICBsZXQgdGhhdCA9IHRoaXNcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDAgfHwgdGhpcy5zdGF0dXMgPT09IDMwNCkge1xuICAgICAgICAkbG9hZEZhaWxlZC5yZW1vdmUoKVxuICAgICAgICAvLyBkZWZlbnNpdmUgcHJvZ3JhbW1pbmcgaWYgY29udGVudC5qc29uIGZvcm1hcnQgaXMgbm90IGNvcnJlY3RcbiAgICAgICAgLy8gcHI6IGh0dHBzOi8vZ2l0aHViLmNvbS9maTNld29yay9oZXhvLXRoZW1lLWFyY2hlci9wdWxsLzM3XG4gICAgICAgIGxldCBjb250ZW50SlNPTlxuICAgICAgICBsZXQgcG9zdHNcbiAgICAgICAgY29udGVudEpTT04gPSBKU09OLnBhcnNlKHRoaXMucmVzcG9uc2VUZXh0KVxuICAgICAgICBwb3N0cyA9IEFycmF5LmlzQXJyYXkoY29udGVudEpTT04pID8gY29udGVudEpTT04gOiBjb250ZW50SlNPTi5wb3N0c1xuICAgICAgICBpZiAocG9zdHMgJiYgcG9zdHMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhhdC5wb3N0c0FyciA9IHBvc3RzXG4gICAgICAgICAgdGhhdC5lbWl0dGVyLmVtaXQoJ0RBVEFfRkVUQ0hFRF9TVUNDRVNTJylcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kY3VyclBvc3RzQ29udGFpbmVyLnJlbW92ZSgpXG4gICAgICB9XG4gICAgfVxuICAgIHhoci5zZW5kKClcbiAgfVxuXG4gIF9iaW5kT3RoZXJDbGljaygpIHtcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGlmIChlLnRhcmdldC5jbGFzc05hbWUgPT09ICdwb3N0LXRhZycpIHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICBzaWRlYmFyLmFjdGl2YXRlU2lkZWJhcigpXG4gICAgICAgIHNpZGViYXIuc3dpdGNoVG8oMSlcbiAgICAgICAgbGV0IGN1cnJMYWJlbE5hbWUgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoYGRhdGEtdGFnc2ApXG4gICAgICAgIHRoaXMuY3VyckxhYmVsTmFtZSA9IGN1cnJMYWJlbE5hbWVcbiAgICAgICAgbGV0IHRhZ01ldGEgPSB0aGlzLm1ldGFzWzBdXG4gICAgICAgIHRhZ01ldGEuY2hhbmdlTGFiZWwodGhpcy5jdXJyTGFiZWxOYW1lKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2lkZWJhck1ldGFcbiIsImltcG9ydCBhcmNoZXJVdGlsIGZyb20gJy4vdXRpbCdcbmxldCBwcmV2SGVpZ2h0ID0gMFxuZnVuY3Rpb24gaW5pdFRvY0xpbmtzU2Nyb2xsVG9wKHRvY0xpbmtzKSB7XG4gIHJldHVybiBbLi4udG9jTGlua3NdLm1hcCgobGluaykgPT4ge1xuICAgIHJldHVybiBhcmNoZXJVdGlsLmdldEFic1Bvc2l0aW9uKGxpbmspLnlcbiAgfSlcbn1cblxubGV0IGNhbGNBbmNob3JMaW5rID0gKGhlaWdodHMsIGN1cnJIZWlnaHQpID0+IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZWlnaHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKE1hdGguYWJzKGN1cnJIZWlnaHQgLSBoZWlnaHRzW2ldKSA8IDEuMSkge1xuICAgICAgcmV0dXJuIGlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xXG59XG5cbmxldCBpc1Bhc3NpbmdUaHJvdWdoID0gKGN1cnJIZWlnaHQsIHByZXZIZWlnaHQsIGxpbmtIZWlnaHQpID0+IHtcbiAgcmV0dXJuIChjdXJySGVpZ2h0ICsgMSAtIGxpbmtIZWlnaHQpICogKHByZXZIZWlnaHQgKyAxIC0gbGlua0hlaWdodCkgPD0gMFxufVxuXG5mdW5jdGlvbiBjYWxjU2Nyb2xsSW50b1NjcmVlbkluZGV4KGhlaWdodHMsIHByZXZIZWlnaHQsIGN1cnJIZWlnaHQpIHtcbiAgbGV0IGFuY2hvckxpbmtJbmRleCA9IGNhbGNBbmNob3JMaW5rKGhlaWdodHMsIGN1cnJIZWlnaHQpXG4gIGlmIChhbmNob3JMaW5rSW5kZXggPj0gMCkge1xuICAgIHJldHVybiBhbmNob3JMaW5rSW5kZXhcbiAgfVxuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGVpZ2h0cy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChpc1Bhc3NpbmdUaHJvdWdoKGN1cnJIZWlnaHQsIHByZXZIZWlnaHQsIGhlaWdodHNbaV0pKSB7XG4gICAgICAvLyBpZiBpcyBzY3JvbGxpbmcgZG93biwgc2VsZWN0IGN1cnJlbnRcbiAgICAgIGlmIChjdXJySGVpZ2h0ID4gcHJldkhlaWdodCkge1xuICAgICAgICByZXR1cm4gaVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaWYgaXMgc2Nyb2xsaW5nIHVwLCBzZWxlY3QgcHJldmlvdXNcbiAgICAgICAgcmV0dXJuIGkgLSAxXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8vIGhpZGUgYWxsIG9sXG5mdW5jdGlvbiBoaWRlQWxsT2wocm9vdCkge1xuICA7Wy4uLnJvb3QucXVlcnlTZWxlY3RvckFsbCgnb2wnKV0uZm9yRWFjaCgobGkpID0+IHtcbiAgICBoaWRlSXRlbShsaSlcbiAgfSlcbn1cblxuLy8gYmFjayB0byBkZWZhdWx0IHN0YXRlXG5mdW5jdGlvbiBpbml0Rm9sZCh0b2MpIHtcbiAgO1suLi50b2MuY2hpbGRyZW5dLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgaGlkZUFsbE9sKGNoaWxkKVxuICB9KVxuICA7Wy4uLnRvYy5xdWVyeVNlbGVjdG9yQWxsKCcudG9jLWFjdGl2ZScpXS5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgIGNoaWxkLmNsYXNzTGlzdC5yZW1vdmUoJ3RvYy1hY3RpdmUnKVxuICB9KVxufVxuXG5mdW5jdGlvbiByZXNldEZvbGQodG9jKSB7XG4gIGluaXRGb2xkKHRvYylcbn1cblxuZnVuY3Rpb24gaGlkZUl0ZW0obm9kZSkge1xuICBub2RlLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcbn1cblxuZnVuY3Rpb24gc2hvd0l0ZW0obm9kZSkge1xuICBub2RlLnN0eWxlLmRpc3BsYXkgPSAnJ1xufVxuXG5mdW5jdGlvbiBhY3RpdmVUb2NJdGVtKG5vZGUpIHtcbiAgbm9kZS5jbGFzc0xpc3QuYWRkKCd0b2MtYWN0aXZlJylcbn1cblxuZnVuY3Rpb24gc2hvd0FsbENoaWxkcmVuKG5vZGUpIHtcbiAgO1suLi5ub2RlLmNoaWxkcmVuXS5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgIHNob3dJdGVtKGNoaWxkKVxuICB9KVxufVxuXG5mdW5jdGlvbiBzcHJlYWRQYXJlbnROb2RlT2ZUYXJnZXRJdGVtKHRvY0l0ZW0pIHtcbiAgbGV0IGN1cnJOb2RlID0gdG9jSXRlbVxuICB3aGlsZSAoY3Vyck5vZGUgJiYgY3Vyck5vZGUucGFyZW50Tm9kZSkge1xuICAgIHNob3dBbGxDaGlsZHJlbihjdXJyTm9kZS5wYXJlbnROb2RlKVxuICAgIHNob3dBbGxDaGlsZHJlbihjdXJyTm9kZSlcbiAgICBjdXJyTm9kZSA9IGN1cnJOb2RlLnBhcmVudE5vZGVcbiAgICBpZiAoY3Vyck5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKCd0b2MnKSkge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbn1cblxubGV0IG1haW4gPSAoKSA9PiB7XG4gIGxldCB0b2MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9jJylcbiAgbGV0IHRvY0l0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRvYy1pdGVtJylcbiAgaWYgKCF0b2NJdGVtcy5sZW5ndGgpIHtcbiAgICByZXR1cm5cbiAgfVxuICBpbml0Rm9sZCh0b2MpXG4gIGxldCBoZWFkZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAnLmFydGljbGUtZW50cnkgaDEsIGgyLCBoMywgaDQsIGg1LCBoNidcbiAgKVxuICAvLyBnZXQgbGlua3MgaGVpZ2h0XG4gIGxldCBoZWlnaHRzID0gaW5pdFRvY0xpbmtzU2Nyb2xsVG9wKGhlYWRlcnMpXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsICgpID0+IHtcbiAgICBsZXQgY3VyckhlaWdodCA9ICQoZG9jdW1lbnQpLnNjcm9sbFRvcCgpXG4gICAgbGV0IGN1cnJIZWlnaHRJbmRleCA9IGNhbGNTY3JvbGxJbnRvU2NyZWVuSW5kZXgoXG4gICAgICBoZWlnaHRzLFxuICAgICAgcHJldkhlaWdodCxcbiAgICAgIGN1cnJIZWlnaHRcbiAgICApXG4gICAgcHJldkhlaWdodCA9IGN1cnJIZWlnaHRcbiAgICBpZiAodHlwZW9mIGN1cnJIZWlnaHRJbmRleCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBzcHJlYWQsIGZvbGQgYW5kIGFjdGl2ZVxuICAgIGxldCBjdXJySXRlbSA9IHRvY0l0ZW1zW2N1cnJIZWlnaHRJbmRleF1cbiAgICAvLyAxLiBmb2xkXG4gICAgcmVzZXRGb2xkKHRvYylcbiAgICAvLyAyLiBzcHJlYWRcbiAgICBzcHJlYWRQYXJlbnROb2RlT2ZUYXJnZXRJdGVtKGN1cnJJdGVtKVxuICAgIC8vIDMuIGFjdGl2ZVxuICAgIGlmIChjdXJySXRlbSkge1xuICAgICAgYWN0aXZlVG9jSXRlbShjdXJySXRlbS5xdWVyeVNlbGVjdG9yKCdhJykpXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZGVmYXVsdCBtYWluXG4iLCJjb25zdCBhcmNoZXJVdGlsID0ge1xuICAvLyDlm57liLDpobbpg6hcbiAgYmFja1RvcDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIHdpbmRvdy5zY3JvbGxUbyh7XG4gICAgICB0b3A6IDAsXG4gICAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gICAgfSlcbiAgfSxcblxuICAvLyDojrflj5blhYPntKDlnKjpobXpnaLkuIrnm7jlr7nlt6bkuIrop5LnmoTkvY3nva5cbiAgZ2V0QWJzUG9zaXRpb246IGZ1bmN0aW9uIChlKSB7XG4gICAgbGV0IHggPSBlLm9mZnNldExlZnQsXG4gICAgICB5ID0gZS5vZmZzZXRUb3BcbiAgICB3aGlsZSAoKGUgPSBlLm9mZnNldFBhcmVudCkpIHtcbiAgICAgIHggKz0gZS5vZmZzZXRMZWZ0XG4gICAgICB5ICs9IGUub2Zmc2V0VG9wXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICB9XG4gIH0sXG5cbiAgLy8g5qC85byP5YyW5pel5pyfXG4gIGRhdGVGb3JtYXRlcjogZnVuY3Rpb24gKGRhdGUsIGZtdCkge1xuICAgIGxldCBvID0ge1xuICAgICAgJ00rJzogZGF0ZS5nZXRNb250aCgpICsgMSwgLy8g5pyI5Lu9XG4gICAgICAnZCsnOiBkYXRlLmdldERhdGUoKSwgLy8g5pelXG4gICAgICAnaCsnOiBkYXRlLmdldEhvdXJzKCksIC8vIOWwj+aXtlxuICAgICAgJ20rJzogZGF0ZS5nZXRNaW51dGVzKCksIC8vIOWIhlxuICAgICAgJ3MrJzogZGF0ZS5nZXRTZWNvbmRzKCksIC8vIOenklxuICAgICAgJ3ErJzogTWF0aC5mbG9vcigoZGF0ZS5nZXRNb250aCgpICsgMykgLyAzKSwgLy8g5a2j5bqmXG4gICAgICBTOiBkYXRlLmdldE1pbGxpc2Vjb25kcygpLCAvLyDmr6vnp5JcbiAgICB9XG4gICAgaWYgKC8oeSspLy50ZXN0KGZtdCkpIHtcbiAgICAgIGZtdCA9IGZtdC5yZXBsYWNlKFxuICAgICAgICBSZWdFeHAuJDEsXG4gICAgICAgIFN0cmluZyhkYXRlLmdldEZ1bGxZZWFyKCkpLnN1YnN0cig0IC0gUmVnRXhwLiQxLmxlbmd0aClcbiAgICAgIClcbiAgICB9XG4gICAgZm9yIChsZXQgayBpbiBvKSB7XG4gICAgICBpZiAobmV3IFJlZ0V4cCgnKCcgKyBrICsgJyknKS50ZXN0KGZtdCkpIHtcbiAgICAgICAgZm10ID0gZm10LnJlcGxhY2UoXG4gICAgICAgICAgUmVnRXhwLiQxLFxuICAgICAgICAgIFJlZ0V4cC4kMS5sZW5ndGggPT09IDFcbiAgICAgICAgICAgID8gb1trXVxuICAgICAgICAgICAgOiAoJzAwJyArIG9ba10pLnN1YnN0cihTdHJpbmcob1trXSkubGVuZ3RoKVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmbXRcbiAgfSxcblxuICAvLyByQUYg55qEIHRpY2tpbmdcbiAgcmFmVGljazogZnVuY3Rpb24gKHRpY2tpbmcsIHVwZGF0ZUZ1bmMpIHtcbiAgICBpZiAoIXRpY2tpbmcpIHtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGVGdW5jKVxuICAgIH1cbiAgICB0aWNraW5nID0gdHJ1ZVxuICB9LFxuXG4gIC8vIOWHveaVsOiKgua1gVxuICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSA9IGZhbHNlKSB7XG4gICAgbGV0IHRpbWVyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGFyZ3MgPSBhcmd1bWVudHNcbiAgICAgIGlmICghdGltZXIpIHtcbiAgICAgICAgaWYgKGltbWVkaWF0ZSkge1xuICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aW1lciA9IHVuZGVmaW5lZFxuICAgICAgICAgIH0sIHdhaXQpXG4gICAgICAgICAgZnVuYy5hcHBseSh0aGlzLCBhcmdzKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aW1lciA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgZnVuYy5hcHBseSh0aGlzLCBhcmdzKVxuICAgICAgICAgIH0sIHdhaXQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8g5Ye95pWw6Ziy5oqWXG4gIGRlYm91bmNlOiBmdW5jdGlvbiAoZnVuYywgd2FpdCwgaW1tZWRpYXRlID0gZmFsc2UpIHtcbiAgICBsZXQgdGltZXJcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgYXJncyA9IGFyZ3VtZW50c1xuXG4gICAgICB0aW1lciAmJiBjbGVhclRpbWVvdXQodGltZXIpXG5cbiAgICAgIGlmIChpbW1lZGlhdGUpIHtcbiAgICAgICAgIXRpbWVyICYmIGZ1bmMuYXBwbHkodGhpcywgYXJncylcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICB0aW1lciA9IHVuZGVmaW5lZFxuICAgICAgICB9LCB3YWl0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgICAgIH0sIHdhaXQpXG4gICAgICB9XG4gICAgfVxuICB9LFxufVxuXG5leHBvcnQgZGVmYXVsdCBhcmNoZXJVdGlsXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG4gICwgcHJlZml4ID0gJ34nO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIHRvIGNyZWF0ZSBhIHN0b3JhZ2UgZm9yIG91ciBgRUVgIG9iamVjdHMuXG4gKiBBbiBgRXZlbnRzYCBpbnN0YW5jZSBpcyBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEV2ZW50cygpIHt9XG5cbi8vXG4vLyBXZSB0cnkgdG8gbm90IGluaGVyaXQgZnJvbSBgT2JqZWN0LnByb3RvdHlwZWAuIEluIHNvbWUgZW5naW5lcyBjcmVhdGluZyBhblxuLy8gaW5zdGFuY2UgaW4gdGhpcyB3YXkgaXMgZmFzdGVyIHRoYW4gY2FsbGluZyBgT2JqZWN0LmNyZWF0ZShudWxsKWAgZGlyZWN0bHkuXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxuLy8gY2hhcmFjdGVyIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90XG4vLyBvdmVycmlkZGVuIG9yIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cbi8vXG5pZiAoT2JqZWN0LmNyZWF0ZSkge1xuICBFdmVudHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAvL1xuICAvLyBUaGlzIGhhY2sgaXMgbmVlZGVkIGJlY2F1c2UgdGhlIGBfX3Byb3RvX19gIHByb3BlcnR5IGlzIHN0aWxsIGluaGVyaXRlZCBpblxuICAvLyBzb21lIG9sZCBicm93c2VycyBsaWtlIEFuZHJvaWQgNCwgaVBob25lIDUuMSwgT3BlcmEgMTEgYW5kIFNhZmFyaSA1LlxuICAvL1xuICBpZiAoIW5ldyBFdmVudHMoKS5fX3Byb3RvX18pIHByZWZpeCA9IGZhbHNlO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIGV2ZW50IGxpc3RlbmVyLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gY29udGV4dCBUaGUgY29udGV4dCB0byBpbnZva2UgdGhlIGxpc3RlbmVyIHdpdGguXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvbmNlPWZhbHNlXSBTcGVjaWZ5IGlmIHRoZSBsaXN0ZW5lciBpcyBhIG9uZS10aW1lIGxpc3RlbmVyLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogQWRkIGEgbGlzdGVuZXIgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtFdmVudEVtaXR0ZXJ9IGVtaXR0ZXIgUmVmZXJlbmNlIHRvIHRoZSBgRXZlbnRFbWl0dGVyYCBpbnN0YW5jZS5cbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gY29udGV4dCBUaGUgY29udGV4dCB0byBpbnZva2UgdGhlIGxpc3RlbmVyIHdpdGguXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgU3BlY2lmeSBpZiB0aGUgbGlzdGVuZXIgaXMgYSBvbmUtdGltZSBsaXN0ZW5lci5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcihlbWl0dGVyLCBldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgfVxuXG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCBlbWl0dGVyLCBvbmNlKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIWVtaXR0ZXIuX2V2ZW50c1tldnRdKSBlbWl0dGVyLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyLCBlbWl0dGVyLl9ldmVudHNDb3VudCsrO1xuICBlbHNlIGlmICghZW1pdHRlci5fZXZlbnRzW2V2dF0uZm4pIGVtaXR0ZXIuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlIGVtaXR0ZXIuX2V2ZW50c1tldnRdID0gW2VtaXR0ZXIuX2V2ZW50c1tldnRdLCBsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIGVtaXR0ZXI7XG59XG5cbi8qKlxuICogQ2xlYXIgZXZlbnQgYnkgbmFtZS5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50RW1pdHRlcn0gZW1pdHRlciBSZWZlcmVuY2UgdG8gdGhlIGBFdmVudEVtaXR0ZXJgIGluc3RhbmNlLlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2dCBUaGUgRXZlbnQgbmFtZS5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNsZWFyRXZlbnQoZW1pdHRlciwgZXZ0KSB7XG4gIGlmICgtLWVtaXR0ZXIuX2V2ZW50c0NvdW50ID09PSAwKSBlbWl0dGVyLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gIGVsc2UgZGVsZXRlIGVtaXR0ZXIuX2V2ZW50c1tldnRdO1xufVxuXG4vKipcbiAqIE1pbmltYWwgYEV2ZW50RW1pdHRlcmAgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIGBFdmVudEVtaXR0ZXJgIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYW4gYXJyYXkgbGlzdGluZyB0aGUgZXZlbnRzIGZvciB3aGljaCB0aGUgZW1pdHRlciBoYXMgcmVnaXN0ZXJlZFxuICogbGlzdGVuZXJzLlxuICpcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgdmFyIG5hbWVzID0gW11cbiAgICAsIGV2ZW50c1xuICAgICwgbmFtZTtcblxuICBpZiAodGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHJldHVybiBuYW1lcztcblxuICBmb3IgKG5hbWUgaW4gKGV2ZW50cyA9IHRoaXMuX2V2ZW50cykpIHtcbiAgICBpZiAoaGFzLmNhbGwoZXZlbnRzLCBuYW1lKSkgbmFtZXMucHVzaChwcmVmaXggPyBuYW1lLnNsaWNlKDEpIDogbmFtZSk7XG4gIH1cblxuICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuICAgIHJldHVybiBuYW1lcy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhldmVudHMpKTtcbiAgfVxuXG4gIHJldHVybiBuYW1lcztcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFRoZSByZWdpc3RlcmVkIGxpc3RlbmVycy5cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKCFoYW5kbGVycykgcmV0dXJuIFtdO1xuICBpZiAoaGFuZGxlcnMuZm4pIHJldHVybiBbaGFuZGxlcnMuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gaGFuZGxlcnMubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gaGFuZGxlcnNbaV0uZm47XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgbnVtYmVyIG9mIGxpc3RlbmVycyBsaXN0ZW5pbmcgdG8gYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0geyhTdHJpbmd8U3ltYm9sKX0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBUaGUgbnVtYmVyIG9mIGxpc3RlbmVycy5cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24gbGlzdGVuZXJDb3VudChldmVudCkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKCFsaXN0ZW5lcnMpIHJldHVybiAwO1xuICBpZiAobGlzdGVuZXJzLmZuKSByZXR1cm4gMTtcbiAgcmV0dXJuIGxpc3RlbmVycy5sZW5ndGg7XG59O1xuXG4vKipcbiAqIENhbGxzIGVhY2ggb2YgdGhlIGxpc3RlbmVycyByZWdpc3RlcmVkIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGVsc2UgYGZhbHNlYC5cbiAqIEBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgY2FzZSA0OiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyLCBhMyk7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEFkZCBhIGxpc3RlbmVyIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0aGlzLCBldmVudCwgZm4sIGNvbnRleHQsIGZhbHNlKTtcbn07XG5cbi8qKlxuICogQWRkIGEgb25lLXRpbWUgbGlzdGVuZXIgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoU3RyaW5nfFN5bWJvbCl9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHsqfSBbY29udGV4dD10aGlzXSBUaGUgY29udGV4dCB0byBpbnZva2UgdGhlIGxpc3RlbmVyIHdpdGguXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHJldHVybiBhZGRMaXN0ZW5lcih0aGlzLCBldmVudCwgZm4sIGNvbnRleHQsIHRydWUpO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGxpc3RlbmVycyBvZiBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIE9ubHkgcmVtb3ZlIHRoZSBsaXN0ZW5lcnMgdGhhdCBtYXRjaCB0aGlzIGZ1bmN0aW9uLlxuICogQHBhcmFtIHsqfSBjb250ZXh0IE9ubHkgcmVtb3ZlIHRoZSBsaXN0ZW5lcnMgdGhhdCBoYXZlIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmUtdGltZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XG4gIGlmICghZm4pIHtcbiAgICBjbGVhckV2ZW50KHRoaXMsIGV2dCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgIGlmIChcbiAgICAgIGxpc3RlbmVycy5mbiA9PT0gZm4gJiZcbiAgICAgICghb25jZSB8fCBsaXN0ZW5lcnMub25jZSkgJiZcbiAgICAgICghY29udGV4dCB8fCBsaXN0ZW5lcnMuY29udGV4dCA9PT0gY29udGV4dClcbiAgICApIHtcbiAgICAgIGNsZWFyRXZlbnQodGhpcywgZXZ0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGV2ZW50cyA9IFtdLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChcbiAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmbiB8fFxuICAgICAgICAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpIHx8XG4gICAgICAgIChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgKSB7XG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gICAgLy9cbiAgICBpZiAoZXZlbnRzLmxlbmd0aCkgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xuICAgIGVsc2UgY2xlYXJFdmVudCh0aGlzLCBldnQpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzLCBvciB0aG9zZSBvZiB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7KFN0cmluZ3xTeW1ib2wpfSBbZXZlbnRdIFRoZSBldmVudCBuYW1lLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICB2YXIgZXZ0O1xuXG4gIGlmIChldmVudCkge1xuICAgIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG4gICAgaWYgKHRoaXMuX2V2ZW50c1tldnRdKSBjbGVhckV2ZW50KHRoaXMsIGV2dCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBBbGxvdyBgRXZlbnRFbWl0dGVyYCB0byBiZSBpbXBvcnRlZCBhcyBtb2R1bGUgbmFtZXNwYWNlLlxuLy9cbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG4iLCIvKiFcclxuICogcGVyZmVjdC1zY3JvbGxiYXIgdjEuNS4wXHJcbiAqIENvcHlyaWdodCAyMDIwIEh5dW5qZSBKdW4sIE1EQm9vdHN0cmFwIGFuZCBDb250cmlidXRvcnNcclxuICogTGljZW5zZWQgdW5kZXIgTUlUXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gZ2V0KGVsZW1lbnQpIHtcclxuICByZXR1cm4gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KTtcclxufVxyXG5cclxuZnVuY3Rpb24gc2V0KGVsZW1lbnQsIG9iaikge1xyXG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcclxuICAgIHZhciB2YWwgPSBvYmpba2V5XTtcclxuICAgIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xyXG4gICAgICB2YWwgPSB2YWwgKyBcInB4XCI7XHJcbiAgICB9XHJcbiAgICBlbGVtZW50LnN0eWxlW2tleV0gPSB2YWw7XHJcbiAgfVxyXG4gIHJldHVybiBlbGVtZW50O1xyXG59XHJcblxyXG5mdW5jdGlvbiBkaXYoY2xhc3NOYW1lKSB7XHJcbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIGRpdi5jbGFzc05hbWUgPSBjbGFzc05hbWU7XHJcbiAgcmV0dXJuIGRpdjtcclxufVxyXG5cclxudmFyIGVsTWF0Y2hlcyA9XHJcbiAgdHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmXHJcbiAgKEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMgfHxcclxuICAgIEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fFxyXG4gICAgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8XHJcbiAgICBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3Rvcik7XHJcblxyXG5mdW5jdGlvbiBtYXRjaGVzKGVsZW1lbnQsIHF1ZXJ5KSB7XHJcbiAgaWYgKCFlbE1hdGNoZXMpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignTm8gZWxlbWVudCBtYXRjaGluZyBtZXRob2Qgc3VwcG9ydGVkJyk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZWxNYXRjaGVzLmNhbGwoZWxlbWVudCwgcXVlcnkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW1vdmUoZWxlbWVudCkge1xyXG4gIGlmIChlbGVtZW50LnJlbW92ZSkge1xyXG4gICAgZWxlbWVudC5yZW1vdmUoKTtcclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKGVsZW1lbnQucGFyZW50Tm9kZSkge1xyXG4gICAgICBlbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBxdWVyeUNoaWxkcmVuKGVsZW1lbnQsIHNlbGVjdG9yKSB7XHJcbiAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChlbGVtZW50LmNoaWxkcmVuLCBmdW5jdGlvbiAoY2hpbGQpIHsgcmV0dXJuIG1hdGNoZXMoY2hpbGQsIHNlbGVjdG9yKTsgfVxyXG4gICk7XHJcbn1cclxuXHJcbnZhciBjbHMgPSB7XHJcbiAgbWFpbjogJ3BzJyxcclxuICBydGw6ICdwc19fcnRsJyxcclxuICBlbGVtZW50OiB7XHJcbiAgICB0aHVtYjogZnVuY3Rpb24gKHgpIHsgcmV0dXJuIChcInBzX190aHVtYi1cIiArIHgpOyB9LFxyXG4gICAgcmFpbDogZnVuY3Rpb24gKHgpIHsgcmV0dXJuIChcInBzX19yYWlsLVwiICsgeCk7IH0sXHJcbiAgICBjb25zdW1pbmc6ICdwc19fY2hpbGQtLWNvbnN1bWUnLFxyXG4gIH0sXHJcbiAgc3RhdGU6IHtcclxuICAgIGZvY3VzOiAncHMtLWZvY3VzJyxcclxuICAgIGNsaWNraW5nOiAncHMtLWNsaWNraW5nJyxcclxuICAgIGFjdGl2ZTogZnVuY3Rpb24gKHgpIHsgcmV0dXJuIChcInBzLS1hY3RpdmUtXCIgKyB4KTsgfSxcclxuICAgIHNjcm9sbGluZzogZnVuY3Rpb24gKHgpIHsgcmV0dXJuIChcInBzLS1zY3JvbGxpbmctXCIgKyB4KTsgfSxcclxuICB9LFxyXG59O1xyXG5cclxuLypcclxuICogSGVscGVyIG1ldGhvZHNcclxuICovXHJcbnZhciBzY3JvbGxpbmdDbGFzc1RpbWVvdXQgPSB7IHg6IG51bGwsIHk6IG51bGwgfTtcclxuXHJcbmZ1bmN0aW9uIGFkZFNjcm9sbGluZ0NsYXNzKGksIHgpIHtcclxuICB2YXIgY2xhc3NMaXN0ID0gaS5lbGVtZW50LmNsYXNzTGlzdDtcclxuICB2YXIgY2xhc3NOYW1lID0gY2xzLnN0YXRlLnNjcm9sbGluZyh4KTtcclxuXHJcbiAgaWYgKGNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpKSB7XHJcbiAgICBjbGVhclRpbWVvdXQoc2Nyb2xsaW5nQ2xhc3NUaW1lb3V0W3hdKTtcclxuICB9IGVsc2Uge1xyXG4gICAgY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlU2Nyb2xsaW5nQ2xhc3MoaSwgeCkge1xyXG4gIHNjcm9sbGluZ0NsYXNzVGltZW91dFt4XSA9IHNldFRpbWVvdXQoXHJcbiAgICBmdW5jdGlvbiAoKSB7IHJldHVybiBpLmlzQWxpdmUgJiYgaS5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xzLnN0YXRlLnNjcm9sbGluZyh4KSk7IH0sXHJcbiAgICBpLnNldHRpbmdzLnNjcm9sbGluZ1RocmVzaG9sZFxyXG4gICk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFNjcm9sbGluZ0NsYXNzSW5zdGFudGx5KGksIHgpIHtcclxuICBhZGRTY3JvbGxpbmdDbGFzcyhpLCB4KTtcclxuICByZW1vdmVTY3JvbGxpbmdDbGFzcyhpLCB4KTtcclxufVxyXG5cclxudmFyIEV2ZW50RWxlbWVudCA9IGZ1bmN0aW9uIEV2ZW50RWxlbWVudChlbGVtZW50KSB7XHJcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICB0aGlzLmhhbmRsZXJzID0ge307XHJcbn07XHJcblxyXG52YXIgcHJvdG90eXBlQWNjZXNzb3JzID0geyBpc0VtcHR5OiB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH07XHJcblxyXG5FdmVudEVsZW1lbnQucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiBiaW5kIChldmVudE5hbWUsIGhhbmRsZXIpIHtcclxuICBpZiAodHlwZW9mIHRoaXMuaGFuZGxlcnNbZXZlbnROYW1lXSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIHRoaXMuaGFuZGxlcnNbZXZlbnROYW1lXSA9IFtdO1xyXG4gIH1cclxuICB0aGlzLmhhbmRsZXJzW2V2ZW50TmFtZV0ucHVzaChoYW5kbGVyKTtcclxuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKTtcclxufTtcclxuXHJcbkV2ZW50RWxlbWVudC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24gdW5iaW5kIChldmVudE5hbWUsIHRhcmdldCkge1xyXG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XHJcblxyXG4gIHRoaXMuaGFuZGxlcnNbZXZlbnROYW1lXSA9IHRoaXMuaGFuZGxlcnNbZXZlbnROYW1lXS5maWx0ZXIoZnVuY3Rpb24gKGhhbmRsZXIpIHtcclxuICAgIGlmICh0YXJnZXQgJiYgaGFuZGxlciAhPT0gdGFyZ2V0KSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgdGhpcyQxLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGhhbmRsZXIsIGZhbHNlKTtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9KTtcclxufTtcclxuXHJcbkV2ZW50RWxlbWVudC5wcm90b3R5cGUudW5iaW5kQWxsID0gZnVuY3Rpb24gdW5iaW5kQWxsICgpIHtcclxuICBmb3IgKHZhciBuYW1lIGluIHRoaXMuaGFuZGxlcnMpIHtcclxuICAgIHRoaXMudW5iaW5kKG5hbWUpO1xyXG4gIH1cclxufTtcclxuXHJcbnByb3RvdHlwZUFjY2Vzc29ycy5pc0VtcHR5LmdldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xyXG5cclxuICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5oYW5kbGVycykuZXZlcnkoXHJcbiAgICBmdW5jdGlvbiAoa2V5KSB7IHJldHVybiB0aGlzJDEuaGFuZGxlcnNba2V5XS5sZW5ndGggPT09IDA7IH1cclxuICApO1xyXG59O1xyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIEV2ZW50RWxlbWVudC5wcm90b3R5cGUsIHByb3RvdHlwZUFjY2Vzc29ycyApO1xyXG5cclxudmFyIEV2ZW50TWFuYWdlciA9IGZ1bmN0aW9uIEV2ZW50TWFuYWdlcigpIHtcclxuICB0aGlzLmV2ZW50RWxlbWVudHMgPSBbXTtcclxufTtcclxuXHJcbkV2ZW50TWFuYWdlci5wcm90b3R5cGUuZXZlbnRFbGVtZW50ID0gZnVuY3Rpb24gZXZlbnRFbGVtZW50IChlbGVtZW50KSB7XHJcbiAgdmFyIGVlID0gdGhpcy5ldmVudEVsZW1lbnRzLmZpbHRlcihmdW5jdGlvbiAoZWUpIHsgcmV0dXJuIGVlLmVsZW1lbnQgPT09IGVsZW1lbnQ7IH0pWzBdO1xyXG4gIGlmICghZWUpIHtcclxuICAgIGVlID0gbmV3IEV2ZW50RWxlbWVudChlbGVtZW50KTtcclxuICAgIHRoaXMuZXZlbnRFbGVtZW50cy5wdXNoKGVlKTtcclxuICB9XHJcbiAgcmV0dXJuIGVlO1xyXG59O1xyXG5cclxuRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24gYmluZCAoZWxlbWVudCwgZXZlbnROYW1lLCBoYW5kbGVyKSB7XHJcbiAgdGhpcy5ldmVudEVsZW1lbnQoZWxlbWVudCkuYmluZChldmVudE5hbWUsIGhhbmRsZXIpO1xyXG59O1xyXG5cclxuRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS51bmJpbmQgPSBmdW5jdGlvbiB1bmJpbmQgKGVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xyXG4gIHZhciBlZSA9IHRoaXMuZXZlbnRFbGVtZW50KGVsZW1lbnQpO1xyXG4gIGVlLnVuYmluZChldmVudE5hbWUsIGhhbmRsZXIpO1xyXG5cclxuICBpZiAoZWUuaXNFbXB0eSkge1xyXG4gICAgLy8gcmVtb3ZlXHJcbiAgICB0aGlzLmV2ZW50RWxlbWVudHMuc3BsaWNlKHRoaXMuZXZlbnRFbGVtZW50cy5pbmRleE9mKGVlKSwgMSk7XHJcbiAgfVxyXG59O1xyXG5cclxuRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS51bmJpbmRBbGwgPSBmdW5jdGlvbiB1bmJpbmRBbGwgKCkge1xyXG4gIHRoaXMuZXZlbnRFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnVuYmluZEFsbCgpOyB9KTtcclxuICB0aGlzLmV2ZW50RWxlbWVudHMgPSBbXTtcclxufTtcclxuXHJcbkV2ZW50TWFuYWdlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UgKGVsZW1lbnQsIGV2ZW50TmFtZSwgaGFuZGxlcikge1xyXG4gIHZhciBlZSA9IHRoaXMuZXZlbnRFbGVtZW50KGVsZW1lbnQpO1xyXG4gIHZhciBvbmNlSGFuZGxlciA9IGZ1bmN0aW9uIChldnQpIHtcclxuICAgIGVlLnVuYmluZChldmVudE5hbWUsIG9uY2VIYW5kbGVyKTtcclxuICAgIGhhbmRsZXIoZXZ0KTtcclxuICB9O1xyXG4gIGVlLmJpbmQoZXZlbnROYW1lLCBvbmNlSGFuZGxlcik7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVFdmVudChuYW1lKSB7XHJcbiAgaWYgKHR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcclxuICAgIHJldHVybiBuZXcgQ3VzdG9tRXZlbnQobmFtZSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcclxuICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQobmFtZSwgZmFsc2UsIGZhbHNlLCB1bmRlZmluZWQpO1xyXG4gICAgcmV0dXJuIGV2dDtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHByb2Nlc3NTY3JvbGxEaWZmKFxyXG4gIGksXHJcbiAgYXhpcyxcclxuICBkaWZmLFxyXG4gIHVzZVNjcm9sbGluZ0NsYXNzLFxyXG4gIGZvcmNlRmlyZVJlYWNoRXZlbnRcclxuKSB7XHJcbiAgaWYgKCB1c2VTY3JvbGxpbmdDbGFzcyA9PT0gdm9pZCAwICkgdXNlU2Nyb2xsaW5nQ2xhc3MgPSB0cnVlO1xyXG4gIGlmICggZm9yY2VGaXJlUmVhY2hFdmVudCA9PT0gdm9pZCAwICkgZm9yY2VGaXJlUmVhY2hFdmVudCA9IGZhbHNlO1xyXG5cclxuICB2YXIgZmllbGRzO1xyXG4gIGlmIChheGlzID09PSAndG9wJykge1xyXG4gICAgZmllbGRzID0gW1xyXG4gICAgICAnY29udGVudEhlaWdodCcsXHJcbiAgICAgICdjb250YWluZXJIZWlnaHQnLFxyXG4gICAgICAnc2Nyb2xsVG9wJyxcclxuICAgICAgJ3knLFxyXG4gICAgICAndXAnLFxyXG4gICAgICAnZG93bicgXTtcclxuICB9IGVsc2UgaWYgKGF4aXMgPT09ICdsZWZ0Jykge1xyXG4gICAgZmllbGRzID0gW1xyXG4gICAgICAnY29udGVudFdpZHRoJyxcclxuICAgICAgJ2NvbnRhaW5lcldpZHRoJyxcclxuICAgICAgJ3Njcm9sbExlZnQnLFxyXG4gICAgICAneCcsXHJcbiAgICAgICdsZWZ0JyxcclxuICAgICAgJ3JpZ2h0JyBdO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgcHJvcGVyIGF4aXMgc2hvdWxkIGJlIHByb3ZpZGVkJyk7XHJcbiAgfVxyXG5cclxuICBwcm9jZXNzU2Nyb2xsRGlmZiQxKGksIGRpZmYsIGZpZWxkcywgdXNlU2Nyb2xsaW5nQ2xhc3MsIGZvcmNlRmlyZVJlYWNoRXZlbnQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwcm9jZXNzU2Nyb2xsRGlmZiQxKFxyXG4gIGksXHJcbiAgZGlmZixcclxuICByZWYsXHJcbiAgdXNlU2Nyb2xsaW5nQ2xhc3MsXHJcbiAgZm9yY2VGaXJlUmVhY2hFdmVudFxyXG4pIHtcclxuICB2YXIgY29udGVudEhlaWdodCA9IHJlZlswXTtcclxuICB2YXIgY29udGFpbmVySGVpZ2h0ID0gcmVmWzFdO1xyXG4gIHZhciBzY3JvbGxUb3AgPSByZWZbMl07XHJcbiAgdmFyIHkgPSByZWZbM107XHJcbiAgdmFyIHVwID0gcmVmWzRdO1xyXG4gIHZhciBkb3duID0gcmVmWzVdO1xyXG4gIGlmICggdXNlU2Nyb2xsaW5nQ2xhc3MgPT09IHZvaWQgMCApIHVzZVNjcm9sbGluZ0NsYXNzID0gdHJ1ZTtcclxuICBpZiAoIGZvcmNlRmlyZVJlYWNoRXZlbnQgPT09IHZvaWQgMCApIGZvcmNlRmlyZVJlYWNoRXZlbnQgPSBmYWxzZTtcclxuXHJcbiAgdmFyIGVsZW1lbnQgPSBpLmVsZW1lbnQ7XHJcblxyXG4gIC8vIHJlc2V0IHJlYWNoXHJcbiAgaS5yZWFjaFt5XSA9IG51bGw7XHJcblxyXG4gIC8vIDEgZm9yIHN1YnBpeGVsIHJvdW5kaW5nXHJcbiAgaWYgKGVsZW1lbnRbc2Nyb2xsVG9wXSA8IDEpIHtcclxuICAgIGkucmVhY2hbeV0gPSAnc3RhcnQnO1xyXG4gIH1cclxuXHJcbiAgLy8gMSBmb3Igc3VicGl4ZWwgcm91bmRpbmdcclxuICBpZiAoZWxlbWVudFtzY3JvbGxUb3BdID4gaVtjb250ZW50SGVpZ2h0XSAtIGlbY29udGFpbmVySGVpZ2h0XSAtIDEpIHtcclxuICAgIGkucmVhY2hbeV0gPSAnZW5kJztcclxuICB9XHJcblxyXG4gIGlmIChkaWZmKSB7XHJcbiAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoKFwicHMtc2Nyb2xsLVwiICsgeSkpKTtcclxuXHJcbiAgICBpZiAoZGlmZiA8IDApIHtcclxuICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KChcInBzLXNjcm9sbC1cIiArIHVwKSkpO1xyXG4gICAgfSBlbHNlIGlmIChkaWZmID4gMCkge1xyXG4gICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoY3JlYXRlRXZlbnQoKFwicHMtc2Nyb2xsLVwiICsgZG93bikpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodXNlU2Nyb2xsaW5nQ2xhc3MpIHtcclxuICAgICAgc2V0U2Nyb2xsaW5nQ2xhc3NJbnN0YW50bHkoaSwgeSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAoaS5yZWFjaFt5XSAmJiAoZGlmZiB8fCBmb3JjZUZpcmVSZWFjaEV2ZW50KSkge1xyXG4gICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGNyZWF0ZUV2ZW50KChcInBzLVwiICsgeSArIFwiLXJlYWNoLVwiICsgKGkucmVhY2hbeV0pKSkpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gdG9JbnQoeCkge1xyXG4gIHJldHVybiBwYXJzZUludCh4LCAxMCkgfHwgMDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNFZGl0YWJsZShlbCkge1xyXG4gIHJldHVybiAoXHJcbiAgICBtYXRjaGVzKGVsLCAnaW5wdXQsW2NvbnRlbnRlZGl0YWJsZV0nKSB8fFxyXG4gICAgbWF0Y2hlcyhlbCwgJ3NlbGVjdCxbY29udGVudGVkaXRhYmxlXScpIHx8XHJcbiAgICBtYXRjaGVzKGVsLCAndGV4dGFyZWEsW2NvbnRlbnRlZGl0YWJsZV0nKSB8fFxyXG4gICAgbWF0Y2hlcyhlbCwgJ2J1dHRvbixbY29udGVudGVkaXRhYmxlXScpXHJcbiAgKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb3V0ZXJXaWR0aChlbGVtZW50KSB7XHJcbiAgdmFyIHN0eWxlcyA9IGdldChlbGVtZW50KTtcclxuICByZXR1cm4gKFxyXG4gICAgdG9JbnQoc3R5bGVzLndpZHRoKSArXHJcbiAgICB0b0ludChzdHlsZXMucGFkZGluZ0xlZnQpICtcclxuICAgIHRvSW50KHN0eWxlcy5wYWRkaW5nUmlnaHQpICtcclxuICAgIHRvSW50KHN0eWxlcy5ib3JkZXJMZWZ0V2lkdGgpICtcclxuICAgIHRvSW50KHN0eWxlcy5ib3JkZXJSaWdodFdpZHRoKVxyXG4gICk7XHJcbn1cclxuXHJcbnZhciBlbnYgPSB7XHJcbiAgaXNXZWJLaXQ6XHJcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmXHJcbiAgICAnV2Via2l0QXBwZWFyYW5jZScgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLFxyXG4gIHN1cHBvcnRzVG91Y2g6XHJcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxyXG4gICAgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdyB8fFxyXG4gICAgICAoJ21heFRvdWNoUG9pbnRzJyBpbiB3aW5kb3cubmF2aWdhdG9yICYmXHJcbiAgICAgICAgd2luZG93Lm5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDApIHx8XHJcbiAgICAgICh3aW5kb3cuRG9jdW1lbnRUb3VjaCAmJiBkb2N1bWVudCBpbnN0YW5jZW9mIHdpbmRvdy5Eb2N1bWVudFRvdWNoKSksXHJcbiAgc3VwcG9ydHNJZVBvaW50ZXI6XHJcbiAgICB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyxcclxuICBpc0Nocm9tZTpcclxuICAgIHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmXHJcbiAgICAvQ2hyb21lL2kudGVzdChuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCksXHJcbn07XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVHZW9tZXRyeShpKSB7XHJcbiAgdmFyIGVsZW1lbnQgPSBpLmVsZW1lbnQ7XHJcbiAgdmFyIHJvdW5kZWRTY3JvbGxUb3AgPSBNYXRoLmZsb29yKGVsZW1lbnQuc2Nyb2xsVG9wKTtcclxuICB2YXIgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gIGkuY29udGFpbmVyV2lkdGggPSBNYXRoLmNlaWwocmVjdC53aWR0aCk7XHJcbiAgaS5jb250YWluZXJIZWlnaHQgPSBNYXRoLmNlaWwocmVjdC5oZWlnaHQpO1xyXG4gIGkuY29udGVudFdpZHRoID0gZWxlbWVudC5zY3JvbGxXaWR0aDtcclxuICBpLmNvbnRlbnRIZWlnaHQgPSBlbGVtZW50LnNjcm9sbEhlaWdodDtcclxuXHJcbiAgaWYgKCFlbGVtZW50LmNvbnRhaW5zKGkuc2Nyb2xsYmFyWFJhaWwpKSB7XHJcbiAgICAvLyBjbGVhbiB1cCBhbmQgYXBwZW5kXHJcbiAgICBxdWVyeUNoaWxkcmVuKGVsZW1lbnQsIGNscy5lbGVtZW50LnJhaWwoJ3gnKSkuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHsgcmV0dXJuIHJlbW92ZShlbCk7IH1cclxuICAgICk7XHJcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGkuc2Nyb2xsYmFyWFJhaWwpO1xyXG4gIH1cclxuICBpZiAoIWVsZW1lbnQuY29udGFpbnMoaS5zY3JvbGxiYXJZUmFpbCkpIHtcclxuICAgIC8vIGNsZWFuIHVwIGFuZCBhcHBlbmRcclxuICAgIHF1ZXJ5Q2hpbGRyZW4oZWxlbWVudCwgY2xzLmVsZW1lbnQucmFpbCgneScpKS5mb3JFYWNoKGZ1bmN0aW9uIChlbCkgeyByZXR1cm4gcmVtb3ZlKGVsKTsgfVxyXG4gICAgKTtcclxuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaS5zY3JvbGxiYXJZUmFpbCk7XHJcbiAgfVxyXG5cclxuICBpZiAoXHJcbiAgICAhaS5zZXR0aW5ncy5zdXBwcmVzc1Njcm9sbFggJiZcclxuICAgIGkuY29udGFpbmVyV2lkdGggKyBpLnNldHRpbmdzLnNjcm9sbFhNYXJnaW5PZmZzZXQgPCBpLmNvbnRlbnRXaWR0aFxyXG4gICkge1xyXG4gICAgaS5zY3JvbGxiYXJYQWN0aXZlID0gdHJ1ZTtcclxuICAgIGkucmFpbFhXaWR0aCA9IGkuY29udGFpbmVyV2lkdGggLSBpLnJhaWxYTWFyZ2luV2lkdGg7XHJcbiAgICBpLnJhaWxYUmF0aW8gPSBpLmNvbnRhaW5lcldpZHRoIC8gaS5yYWlsWFdpZHRoO1xyXG4gICAgaS5zY3JvbGxiYXJYV2lkdGggPSBnZXRUaHVtYlNpemUoXHJcbiAgICAgIGksXHJcbiAgICAgIHRvSW50KChpLnJhaWxYV2lkdGggKiBpLmNvbnRhaW5lcldpZHRoKSAvIGkuY29udGVudFdpZHRoKVxyXG4gICAgKTtcclxuICAgIGkuc2Nyb2xsYmFyWExlZnQgPSB0b0ludChcclxuICAgICAgKChpLm5lZ2F0aXZlU2Nyb2xsQWRqdXN0bWVudCArIGVsZW1lbnQuc2Nyb2xsTGVmdCkgKlxyXG4gICAgICAgIChpLnJhaWxYV2lkdGggLSBpLnNjcm9sbGJhclhXaWR0aCkpIC9cclxuICAgICAgICAoaS5jb250ZW50V2lkdGggLSBpLmNvbnRhaW5lcldpZHRoKVxyXG4gICAgKTtcclxuICB9IGVsc2Uge1xyXG4gICAgaS5zY3JvbGxiYXJYQWN0aXZlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBpZiAoXHJcbiAgICAhaS5zZXR0aW5ncy5zdXBwcmVzc1Njcm9sbFkgJiZcclxuICAgIGkuY29udGFpbmVySGVpZ2h0ICsgaS5zZXR0aW5ncy5zY3JvbGxZTWFyZ2luT2Zmc2V0IDwgaS5jb250ZW50SGVpZ2h0XHJcbiAgKSB7XHJcbiAgICBpLnNjcm9sbGJhcllBY3RpdmUgPSB0cnVlO1xyXG4gICAgaS5yYWlsWUhlaWdodCA9IGkuY29udGFpbmVySGVpZ2h0IC0gaS5yYWlsWU1hcmdpbkhlaWdodDtcclxuICAgIGkucmFpbFlSYXRpbyA9IGkuY29udGFpbmVySGVpZ2h0IC8gaS5yYWlsWUhlaWdodDtcclxuICAgIGkuc2Nyb2xsYmFyWUhlaWdodCA9IGdldFRodW1iU2l6ZShcclxuICAgICAgaSxcclxuICAgICAgdG9JbnQoKGkucmFpbFlIZWlnaHQgKiBpLmNvbnRhaW5lckhlaWdodCkgLyBpLmNvbnRlbnRIZWlnaHQpXHJcbiAgICApO1xyXG4gICAgaS5zY3JvbGxiYXJZVG9wID0gdG9JbnQoXHJcbiAgICAgIChyb3VuZGVkU2Nyb2xsVG9wICogKGkucmFpbFlIZWlnaHQgLSBpLnNjcm9sbGJhcllIZWlnaHQpKSAvXHJcbiAgICAgICAgKGkuY29udGVudEhlaWdodCAtIGkuY29udGFpbmVySGVpZ2h0KVxyXG4gICAgKTtcclxuICB9IGVsc2Uge1xyXG4gICAgaS5zY3JvbGxiYXJZQWN0aXZlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBpZiAoaS5zY3JvbGxiYXJYTGVmdCA+PSBpLnJhaWxYV2lkdGggLSBpLnNjcm9sbGJhclhXaWR0aCkge1xyXG4gICAgaS5zY3JvbGxiYXJYTGVmdCA9IGkucmFpbFhXaWR0aCAtIGkuc2Nyb2xsYmFyWFdpZHRoO1xyXG4gIH1cclxuICBpZiAoaS5zY3JvbGxiYXJZVG9wID49IGkucmFpbFlIZWlnaHQgLSBpLnNjcm9sbGJhcllIZWlnaHQpIHtcclxuICAgIGkuc2Nyb2xsYmFyWVRvcCA9IGkucmFpbFlIZWlnaHQgLSBpLnNjcm9sbGJhcllIZWlnaHQ7XHJcbiAgfVxyXG5cclxuICB1cGRhdGVDc3MoZWxlbWVudCwgaSk7XHJcblxyXG4gIGlmIChpLnNjcm9sbGJhclhBY3RpdmUpIHtcclxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbHMuc3RhdGUuYWN0aXZlKCd4JykpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xzLnN0YXRlLmFjdGl2ZSgneCcpKTtcclxuICAgIGkuc2Nyb2xsYmFyWFdpZHRoID0gMDtcclxuICAgIGkuc2Nyb2xsYmFyWExlZnQgPSAwO1xyXG4gICAgZWxlbWVudC5zY3JvbGxMZWZ0ID0gaS5pc1J0bCA9PT0gdHJ1ZSA/IGkuY29udGVudFdpZHRoIDogMDtcclxuICB9XHJcbiAgaWYgKGkuc2Nyb2xsYmFyWUFjdGl2ZSkge1xyXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNscy5zdGF0ZS5hY3RpdmUoJ3knKSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbHMuc3RhdGUuYWN0aXZlKCd5JykpO1xyXG4gICAgaS5zY3JvbGxiYXJZSGVpZ2h0ID0gMDtcclxuICAgIGkuc2Nyb2xsYmFyWVRvcCA9IDA7XHJcbiAgICBlbGVtZW50LnNjcm9sbFRvcCA9IDA7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRUaHVtYlNpemUoaSwgdGh1bWJTaXplKSB7XHJcbiAgaWYgKGkuc2V0dGluZ3MubWluU2Nyb2xsYmFyTGVuZ3RoKSB7XHJcbiAgICB0aHVtYlNpemUgPSBNYXRoLm1heCh0aHVtYlNpemUsIGkuc2V0dGluZ3MubWluU2Nyb2xsYmFyTGVuZ3RoKTtcclxuICB9XHJcbiAgaWYgKGkuc2V0dGluZ3MubWF4U2Nyb2xsYmFyTGVuZ3RoKSB7XHJcbiAgICB0aHVtYlNpemUgPSBNYXRoLm1pbih0aHVtYlNpemUsIGkuc2V0dGluZ3MubWF4U2Nyb2xsYmFyTGVuZ3RoKTtcclxuICB9XHJcbiAgcmV0dXJuIHRodW1iU2l6ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ3NzKGVsZW1lbnQsIGkpIHtcclxuICB2YXIgeFJhaWxPZmZzZXQgPSB7IHdpZHRoOiBpLnJhaWxYV2lkdGggfTtcclxuICB2YXIgcm91bmRlZFNjcm9sbFRvcCA9IE1hdGguZmxvb3IoZWxlbWVudC5zY3JvbGxUb3ApO1xyXG5cclxuICBpZiAoaS5pc1J0bCkge1xyXG4gICAgeFJhaWxPZmZzZXQubGVmdCA9XHJcbiAgICAgIGkubmVnYXRpdmVTY3JvbGxBZGp1c3RtZW50ICtcclxuICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICtcclxuICAgICAgaS5jb250YWluZXJXaWR0aCAtXHJcbiAgICAgIGkuY29udGVudFdpZHRoO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB4UmFpbE9mZnNldC5sZWZ0ID0gZWxlbWVudC5zY3JvbGxMZWZ0O1xyXG4gIH1cclxuICBpZiAoaS5pc1Njcm9sbGJhclhVc2luZ0JvdHRvbSkge1xyXG4gICAgeFJhaWxPZmZzZXQuYm90dG9tID0gaS5zY3JvbGxiYXJYQm90dG9tIC0gcm91bmRlZFNjcm9sbFRvcDtcclxuICB9IGVsc2Uge1xyXG4gICAgeFJhaWxPZmZzZXQudG9wID0gaS5zY3JvbGxiYXJYVG9wICsgcm91bmRlZFNjcm9sbFRvcDtcclxuICB9XHJcbiAgc2V0KGkuc2Nyb2xsYmFyWFJhaWwsIHhSYWlsT2Zmc2V0KTtcclxuXHJcbiAgdmFyIHlSYWlsT2Zmc2V0ID0geyB0b3A6IHJvdW5kZWRTY3JvbGxUb3AsIGhlaWdodDogaS5yYWlsWUhlaWdodCB9O1xyXG4gIGlmIChpLmlzU2Nyb2xsYmFyWVVzaW5nUmlnaHQpIHtcclxuICAgIGlmIChpLmlzUnRsKSB7XHJcbiAgICAgIHlSYWlsT2Zmc2V0LnJpZ2h0ID1cclxuICAgICAgICBpLmNvbnRlbnRXaWR0aCAtXHJcbiAgICAgICAgKGkubmVnYXRpdmVTY3JvbGxBZGp1c3RtZW50ICsgZWxlbWVudC5zY3JvbGxMZWZ0KSAtXHJcbiAgICAgICAgaS5zY3JvbGxiYXJZUmlnaHQgLVxyXG4gICAgICAgIGkuc2Nyb2xsYmFyWU91dGVyV2lkdGggLVxyXG4gICAgICAgIDk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB5UmFpbE9mZnNldC5yaWdodCA9IGkuc2Nyb2xsYmFyWVJpZ2h0IC0gZWxlbWVudC5zY3JvbGxMZWZ0O1xyXG4gICAgfVxyXG4gIH0gZWxzZSB7XHJcbiAgICBpZiAoaS5pc1J0bCkge1xyXG4gICAgICB5UmFpbE9mZnNldC5sZWZ0ID1cclxuICAgICAgICBpLm5lZ2F0aXZlU2Nyb2xsQWRqdXN0bWVudCArXHJcbiAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICtcclxuICAgICAgICBpLmNvbnRhaW5lcldpZHRoICogMiAtXHJcbiAgICAgICAgaS5jb250ZW50V2lkdGggLVxyXG4gICAgICAgIGkuc2Nyb2xsYmFyWUxlZnQgLVxyXG4gICAgICAgIGkuc2Nyb2xsYmFyWU91dGVyV2lkdGg7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB5UmFpbE9mZnNldC5sZWZ0ID0gaS5zY3JvbGxiYXJZTGVmdCArIGVsZW1lbnQuc2Nyb2xsTGVmdDtcclxuICAgIH1cclxuICB9XHJcbiAgc2V0KGkuc2Nyb2xsYmFyWVJhaWwsIHlSYWlsT2Zmc2V0KTtcclxuXHJcbiAgc2V0KGkuc2Nyb2xsYmFyWCwge1xyXG4gICAgbGVmdDogaS5zY3JvbGxiYXJYTGVmdCxcclxuICAgIHdpZHRoOiBpLnNjcm9sbGJhclhXaWR0aCAtIGkucmFpbEJvcmRlclhXaWR0aCxcclxuICB9KTtcclxuICBzZXQoaS5zY3JvbGxiYXJZLCB7XHJcbiAgICB0b3A6IGkuc2Nyb2xsYmFyWVRvcCxcclxuICAgIGhlaWdodDogaS5zY3JvbGxiYXJZSGVpZ2h0IC0gaS5yYWlsQm9yZGVyWVdpZHRoLFxyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBjbGlja1JhaWwoaSkge1xyXG4gIHZhciBlbGVtZW50ID0gaS5lbGVtZW50O1xyXG5cclxuICBpLmV2ZW50LmJpbmQoaS5zY3JvbGxiYXJZLCAnbW91c2Vkb3duJywgZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUuc3RvcFByb3BhZ2F0aW9uKCk7IH0pO1xyXG4gIGkuZXZlbnQuYmluZChpLnNjcm9sbGJhcllSYWlsLCAnbW91c2Vkb3duJywgZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciBwb3NpdGlvblRvcCA9XHJcbiAgICAgIGUucGFnZVkgLVxyXG4gICAgICB3aW5kb3cucGFnZVlPZmZzZXQgLVxyXG4gICAgICBpLnNjcm9sbGJhcllSYWlsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgIHZhciBkaXJlY3Rpb24gPSBwb3NpdGlvblRvcCA+IGkuc2Nyb2xsYmFyWVRvcCA/IDEgOiAtMTtcclxuXHJcbiAgICBpLmVsZW1lbnQuc2Nyb2xsVG9wICs9IGRpcmVjdGlvbiAqIGkuY29udGFpbmVySGVpZ2h0O1xyXG4gICAgdXBkYXRlR2VvbWV0cnkoaSk7XHJcblxyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICB9KTtcclxuXHJcbiAgaS5ldmVudC5iaW5kKGkuc2Nyb2xsYmFyWCwgJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnN0b3BQcm9wYWdhdGlvbigpOyB9KTtcclxuICBpLmV2ZW50LmJpbmQoaS5zY3JvbGxiYXJYUmFpbCwgJ21vdXNlZG93bicsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgcG9zaXRpb25MZWZ0ID1cclxuICAgICAgZS5wYWdlWCAtXHJcbiAgICAgIHdpbmRvdy5wYWdlWE9mZnNldCAtXHJcbiAgICAgIGkuc2Nyb2xsYmFyWFJhaWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgIHZhciBkaXJlY3Rpb24gPSBwb3NpdGlvbkxlZnQgPiBpLnNjcm9sbGJhclhMZWZ0ID8gMSA6IC0xO1xyXG5cclxuICAgIGkuZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRpcmVjdGlvbiAqIGkuY29udGFpbmVyV2lkdGg7XHJcbiAgICB1cGRhdGVHZW9tZXRyeShpKTtcclxuXHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBkcmFnVGh1bWIoaSkge1xyXG4gIGJpbmRNb3VzZVNjcm9sbEhhbmRsZXIoaSwgW1xyXG4gICAgJ2NvbnRhaW5lcldpZHRoJyxcclxuICAgICdjb250ZW50V2lkdGgnLFxyXG4gICAgJ3BhZ2VYJyxcclxuICAgICdyYWlsWFdpZHRoJyxcclxuICAgICdzY3JvbGxiYXJYJyxcclxuICAgICdzY3JvbGxiYXJYV2lkdGgnLFxyXG4gICAgJ3Njcm9sbExlZnQnLFxyXG4gICAgJ3gnLFxyXG4gICAgJ3Njcm9sbGJhclhSYWlsJyBdKTtcclxuICBiaW5kTW91c2VTY3JvbGxIYW5kbGVyKGksIFtcclxuICAgICdjb250YWluZXJIZWlnaHQnLFxyXG4gICAgJ2NvbnRlbnRIZWlnaHQnLFxyXG4gICAgJ3BhZ2VZJyxcclxuICAgICdyYWlsWUhlaWdodCcsXHJcbiAgICAnc2Nyb2xsYmFyWScsXHJcbiAgICAnc2Nyb2xsYmFyWUhlaWdodCcsXHJcbiAgICAnc2Nyb2xsVG9wJyxcclxuICAgICd5JyxcclxuICAgICdzY3JvbGxiYXJZUmFpbCcgXSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGJpbmRNb3VzZVNjcm9sbEhhbmRsZXIoXHJcbiAgaSxcclxuICByZWZcclxuKSB7XHJcbiAgdmFyIGNvbnRhaW5lckhlaWdodCA9IHJlZlswXTtcclxuICB2YXIgY29udGVudEhlaWdodCA9IHJlZlsxXTtcclxuICB2YXIgcGFnZVkgPSByZWZbMl07XHJcbiAgdmFyIHJhaWxZSGVpZ2h0ID0gcmVmWzNdO1xyXG4gIHZhciBzY3JvbGxiYXJZID0gcmVmWzRdO1xyXG4gIHZhciBzY3JvbGxiYXJZSGVpZ2h0ID0gcmVmWzVdO1xyXG4gIHZhciBzY3JvbGxUb3AgPSByZWZbNl07XHJcbiAgdmFyIHkgPSByZWZbN107XHJcbiAgdmFyIHNjcm9sbGJhcllSYWlsID0gcmVmWzhdO1xyXG5cclxuICB2YXIgZWxlbWVudCA9IGkuZWxlbWVudDtcclxuXHJcbiAgdmFyIHN0YXJ0aW5nU2Nyb2xsVG9wID0gbnVsbDtcclxuICB2YXIgc3RhcnRpbmdNb3VzZVBhZ2VZID0gbnVsbDtcclxuICB2YXIgc2Nyb2xsQnkgPSBudWxsO1xyXG5cclxuICBmdW5jdGlvbiBtb3VzZU1vdmVIYW5kbGVyKGUpIHtcclxuICAgIGlmIChlLnRvdWNoZXMgJiYgZS50b3VjaGVzWzBdKSB7XHJcbiAgICAgIGVbcGFnZVldID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xyXG4gICAgfVxyXG4gICAgZWxlbWVudFtzY3JvbGxUb3BdID1cclxuICAgICAgc3RhcnRpbmdTY3JvbGxUb3AgKyBzY3JvbGxCeSAqIChlW3BhZ2VZXSAtIHN0YXJ0aW5nTW91c2VQYWdlWSk7XHJcbiAgICBhZGRTY3JvbGxpbmdDbGFzcyhpLCB5KTtcclxuICAgIHVwZGF0ZUdlb21ldHJ5KGkpO1xyXG5cclxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBtb3VzZVVwSGFuZGxlcigpIHtcclxuICAgIHJlbW92ZVNjcm9sbGluZ0NsYXNzKGksIHkpO1xyXG4gICAgaVtzY3JvbGxiYXJZUmFpbF0uY2xhc3NMaXN0LnJlbW92ZShjbHMuc3RhdGUuY2xpY2tpbmcpO1xyXG4gICAgaS5ldmVudC51bmJpbmQoaS5vd25lckRvY3VtZW50LCAnbW91c2Vtb3ZlJywgbW91c2VNb3ZlSGFuZGxlcik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBiaW5kTW92ZXMoZSwgdG91Y2hNb2RlKSB7XHJcbiAgICBzdGFydGluZ1Njcm9sbFRvcCA9IGVsZW1lbnRbc2Nyb2xsVG9wXTtcclxuICAgIGlmICh0b3VjaE1vZGUgJiYgZS50b3VjaGVzKSB7XHJcbiAgICAgIGVbcGFnZVldID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xyXG4gICAgfVxyXG4gICAgc3RhcnRpbmdNb3VzZVBhZ2VZID0gZVtwYWdlWV07XHJcbiAgICBzY3JvbGxCeSA9XHJcbiAgICAgIChpW2NvbnRlbnRIZWlnaHRdIC0gaVtjb250YWluZXJIZWlnaHRdKSAvXHJcbiAgICAgIChpW3JhaWxZSGVpZ2h0XSAtIGlbc2Nyb2xsYmFyWUhlaWdodF0pO1xyXG4gICAgaWYgKCF0b3VjaE1vZGUpIHtcclxuICAgICAgaS5ldmVudC5iaW5kKGkub3duZXJEb2N1bWVudCwgJ21vdXNlbW92ZScsIG1vdXNlTW92ZUhhbmRsZXIpO1xyXG4gICAgICBpLmV2ZW50Lm9uY2UoaS5vd25lckRvY3VtZW50LCAnbW91c2V1cCcsIG1vdXNlVXBIYW5kbGVyKTtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaS5ldmVudC5iaW5kKGkub3duZXJEb2N1bWVudCwgJ3RvdWNobW92ZScsIG1vdXNlTW92ZUhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlbc2Nyb2xsYmFyWVJhaWxdLmNsYXNzTGlzdC5hZGQoY2xzLnN0YXRlLmNsaWNraW5nKTtcclxuXHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gIH1cclxuXHJcbiAgaS5ldmVudC5iaW5kKGlbc2Nyb2xsYmFyWV0sICdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgYmluZE1vdmVzKGUpO1xyXG4gIH0pO1xyXG4gIGkuZXZlbnQuYmluZChpW3Njcm9sbGJhclldLCAndG91Y2hzdGFydCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBiaW5kTW92ZXMoZSwgdHJ1ZSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGtleWJvYXJkKGkpIHtcclxuICB2YXIgZWxlbWVudCA9IGkuZWxlbWVudDtcclxuXHJcbiAgdmFyIGVsZW1lbnRIb3ZlcmVkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0Y2hlcyhlbGVtZW50LCAnOmhvdmVyJyk7IH07XHJcbiAgdmFyIHNjcm9sbGJhckZvY3VzZWQgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXRjaGVzKGkuc2Nyb2xsYmFyWCwgJzpmb2N1cycpIHx8IG1hdGNoZXMoaS5zY3JvbGxiYXJZLCAnOmZvY3VzJyk7IH07XHJcblxyXG4gIGZ1bmN0aW9uIHNob3VsZFByZXZlbnREZWZhdWx0KGRlbHRhWCwgZGVsdGFZKSB7XHJcbiAgICB2YXIgc2Nyb2xsVG9wID0gTWF0aC5mbG9vcihlbGVtZW50LnNjcm9sbFRvcCk7XHJcbiAgICBpZiAoZGVsdGFYID09PSAwKSB7XHJcbiAgICAgIGlmICghaS5zY3JvbGxiYXJZQWN0aXZlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChcclxuICAgICAgICAoc2Nyb2xsVG9wID09PSAwICYmIGRlbHRhWSA+IDApIHx8XHJcbiAgICAgICAgKHNjcm9sbFRvcCA+PSBpLmNvbnRlbnRIZWlnaHQgLSBpLmNvbnRhaW5lckhlaWdodCAmJiBkZWx0YVkgPCAwKVxyXG4gICAgICApIHtcclxuICAgICAgICByZXR1cm4gIWkuc2V0dGluZ3Mud2hlZWxQcm9wYWdhdGlvbjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzY3JvbGxMZWZ0ID0gZWxlbWVudC5zY3JvbGxMZWZ0O1xyXG4gICAgaWYgKGRlbHRhWSA9PT0gMCkge1xyXG4gICAgICBpZiAoIWkuc2Nyb2xsYmFyWEFjdGl2ZSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKHNjcm9sbExlZnQgPT09IDAgJiYgZGVsdGFYIDwgMCkgfHxcclxuICAgICAgICAoc2Nyb2xsTGVmdCA+PSBpLmNvbnRlbnRXaWR0aCAtIGkuY29udGFpbmVyV2lkdGggJiYgZGVsdGFYID4gMClcclxuICAgICAgKSB7XHJcbiAgICAgICAgcmV0dXJuICFpLnNldHRpbmdzLndoZWVsUHJvcGFnYXRpb247XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgaS5ldmVudC5iaW5kKGkub3duZXJEb2N1bWVudCwgJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKFxyXG4gICAgICAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQgJiYgZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgfHxcclxuICAgICAgZS5kZWZhdWx0UHJldmVudGVkXHJcbiAgICApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZWxlbWVudEhvdmVyZWQoKSAmJiAhc2Nyb2xsYmFyRm9jdXNlZCgpKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcclxuICAgICAgPyBkb2N1bWVudC5hY3RpdmVFbGVtZW50XHJcbiAgICAgIDogaS5vd25lckRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XHJcbiAgICBpZiAoYWN0aXZlRWxlbWVudCkge1xyXG4gICAgICBpZiAoYWN0aXZlRWxlbWVudC50YWdOYW1lID09PSAnSUZSQU1FJykge1xyXG4gICAgICAgIGFjdGl2ZUVsZW1lbnQgPSBhY3RpdmVFbGVtZW50LmNvbnRlbnREb2N1bWVudC5hY3RpdmVFbGVtZW50O1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGdvIGRlZXBlciBpZiBlbGVtZW50IGlzIGEgd2ViY29tcG9uZW50XHJcbiAgICAgICAgd2hpbGUgKGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdCkge1xyXG4gICAgICAgICAgYWN0aXZlRWxlbWVudCA9IGFjdGl2ZUVsZW1lbnQuc2hhZG93Um9vdC5hY3RpdmVFbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNFZGl0YWJsZShhY3RpdmVFbGVtZW50KSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBkZWx0YVggPSAwO1xyXG4gICAgdmFyIGRlbHRhWSA9IDA7XHJcblxyXG4gICAgc3dpdGNoIChlLndoaWNoKSB7XHJcbiAgICAgIGNhc2UgMzc6IC8vIGxlZnRcclxuICAgICAgICBpZiAoZS5tZXRhS2V5KSB7XHJcbiAgICAgICAgICBkZWx0YVggPSAtaS5jb250ZW50V2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLmFsdEtleSkge1xyXG4gICAgICAgICAgZGVsdGFYID0gLWkuY29udGFpbmVyV2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRlbHRhWCA9IC0zMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzg6IC8vIHVwXHJcbiAgICAgICAgaWYgKGUubWV0YUtleSkge1xyXG4gICAgICAgICAgZGVsdGFZID0gaS5jb250ZW50SGVpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZS5hbHRLZXkpIHtcclxuICAgICAgICAgIGRlbHRhWSA9IGkuY29udGFpbmVySGVpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBkZWx0YVkgPSAzMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzk6IC8vIHJpZ2h0XHJcbiAgICAgICAgaWYgKGUubWV0YUtleSkge1xyXG4gICAgICAgICAgZGVsdGFYID0gaS5jb250ZW50V2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlLmFsdEtleSkge1xyXG4gICAgICAgICAgZGVsdGFYID0gaS5jb250YWluZXJXaWR0aDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGVsdGFYID0gMzA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDQwOiAvLyBkb3duXHJcbiAgICAgICAgaWYgKGUubWV0YUtleSkge1xyXG4gICAgICAgICAgZGVsdGFZID0gLWkuY29udGVudEhlaWdodDtcclxuICAgICAgICB9IGVsc2UgaWYgKGUuYWx0S2V5KSB7XHJcbiAgICAgICAgICBkZWx0YVkgPSAtaS5jb250YWluZXJIZWlnaHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRlbHRhWSA9IC0zMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzI6IC8vIHNwYWNlIGJhclxyXG4gICAgICAgIGlmIChlLnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICBkZWx0YVkgPSBpLmNvbnRhaW5lckhlaWdodDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGVsdGFZID0gLWkuY29udGFpbmVySGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAzMzogLy8gcGFnZSB1cFxyXG4gICAgICAgIGRlbHRhWSA9IGkuY29udGFpbmVySGVpZ2h0O1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlIDM0OiAvLyBwYWdlIGRvd25cclxuICAgICAgICBkZWx0YVkgPSAtaS5jb250YWluZXJIZWlnaHQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzY6IC8vIGhvbWVcclxuICAgICAgICBkZWx0YVkgPSBpLmNvbnRlbnRIZWlnaHQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgMzU6IC8vIGVuZFxyXG4gICAgICAgIGRlbHRhWSA9IC1pLmNvbnRlbnRIZWlnaHQ7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpLnNldHRpbmdzLnN1cHByZXNzU2Nyb2xsWCAmJiBkZWx0YVggIT09IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKGkuc2V0dGluZ3Muc3VwcHJlc3NTY3JvbGxZICYmIGRlbHRhWSAhPT0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgZWxlbWVudC5zY3JvbGxUb3AgLT0gZGVsdGFZO1xyXG4gICAgZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRlbHRhWDtcclxuICAgIHVwZGF0ZUdlb21ldHJ5KGkpO1xyXG5cclxuICAgIGlmIChzaG91bGRQcmV2ZW50RGVmYXVsdChkZWx0YVgsIGRlbHRhWSkpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiB3aGVlbChpKSB7XHJcbiAgdmFyIGVsZW1lbnQgPSBpLmVsZW1lbnQ7XHJcblxyXG4gIGZ1bmN0aW9uIHNob3VsZFByZXZlbnREZWZhdWx0KGRlbHRhWCwgZGVsdGFZKSB7XHJcbiAgICB2YXIgcm91bmRlZFNjcm9sbFRvcCA9IE1hdGguZmxvb3IoZWxlbWVudC5zY3JvbGxUb3ApO1xyXG4gICAgdmFyIGlzVG9wID0gZWxlbWVudC5zY3JvbGxUb3AgPT09IDA7XHJcbiAgICB2YXIgaXNCb3R0b20gPVxyXG4gICAgICByb3VuZGVkU2Nyb2xsVG9wICsgZWxlbWVudC5vZmZzZXRIZWlnaHQgPT09IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xyXG4gICAgdmFyIGlzTGVmdCA9IGVsZW1lbnQuc2Nyb2xsTGVmdCA9PT0gMDtcclxuICAgIHZhciBpc1JpZ2h0ID1cclxuICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICsgZWxlbWVudC5vZmZzZXRXaWR0aCA9PT0gZWxlbWVudC5zY3JvbGxXaWR0aDtcclxuXHJcbiAgICB2YXIgaGl0c0JvdW5kO1xyXG5cclxuICAgIC8vIHBpY2sgYXhpcyB3aXRoIHByaW1hcnkgZGlyZWN0aW9uXHJcbiAgICBpZiAoTWF0aC5hYnMoZGVsdGFZKSA+IE1hdGguYWJzKGRlbHRhWCkpIHtcclxuICAgICAgaGl0c0JvdW5kID0gaXNUb3AgfHwgaXNCb3R0b207XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBoaXRzQm91bmQgPSBpc0xlZnQgfHwgaXNSaWdodDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaGl0c0JvdW5kID8gIWkuc2V0dGluZ3Mud2hlZWxQcm9wYWdhdGlvbiA6IHRydWU7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXREZWx0YUZyb21FdmVudChlKSB7XHJcbiAgICB2YXIgZGVsdGFYID0gZS5kZWx0YVg7XHJcbiAgICB2YXIgZGVsdGFZID0gLTEgKiBlLmRlbHRhWTtcclxuXHJcbiAgICBpZiAodHlwZW9mIGRlbHRhWCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGRlbHRhWSA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgLy8gT1MgWCBTYWZhcmlcclxuICAgICAgZGVsdGFYID0gKC0xICogZS53aGVlbERlbHRhWCkgLyA2O1xyXG4gICAgICBkZWx0YVkgPSBlLndoZWVsRGVsdGFZIC8gNjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZS5kZWx0YU1vZGUgJiYgZS5kZWx0YU1vZGUgPT09IDEpIHtcclxuICAgICAgLy8gRmlyZWZveCBpbiBkZWx0YU1vZGUgMTogTGluZSBzY3JvbGxpbmdcclxuICAgICAgZGVsdGFYICo9IDEwO1xyXG4gICAgICBkZWx0YVkgKj0gMTA7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRlbHRhWCAhPT0gZGVsdGFYICYmIGRlbHRhWSAhPT0gZGVsdGFZIC8qIE5hTiBjaGVja3MgKi8pIHtcclxuICAgICAgLy8gSUUgaW4gc29tZSBtb3VzZSBkcml2ZXJzXHJcbiAgICAgIGRlbHRhWCA9IDA7XHJcbiAgICAgIGRlbHRhWSA9IGUud2hlZWxEZWx0YTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZS5zaGlmdEtleSkge1xyXG4gICAgICAvLyByZXZlcnNlIGF4aXMgd2l0aCBzaGlmdCBrZXlcclxuICAgICAgcmV0dXJuIFstZGVsdGFZLCAtZGVsdGFYXTtcclxuICAgIH1cclxuICAgIHJldHVybiBbZGVsdGFYLCBkZWx0YVldO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2hvdWxkQmVDb25zdW1lZEJ5Q2hpbGQodGFyZ2V0LCBkZWx0YVgsIGRlbHRhWSkge1xyXG4gICAgLy8gRklYTUU6IHRoaXMgaXMgYSB3b3JrYXJvdW5kIGZvciA8c2VsZWN0PiBpc3N1ZSBpbiBGRiBhbmQgSUUgIzU3MVxyXG4gICAgaWYgKCFlbnYuaXNXZWJLaXQgJiYgZWxlbWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3Q6Zm9jdXMnKSkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWVsZW1lbnQuY29udGFpbnModGFyZ2V0KSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGN1cnNvciA9IHRhcmdldDtcclxuXHJcbiAgICB3aGlsZSAoY3Vyc29yICYmIGN1cnNvciAhPT0gZWxlbWVudCkge1xyXG4gICAgICBpZiAoY3Vyc29yLmNsYXNzTGlzdC5jb250YWlucyhjbHMuZWxlbWVudC5jb25zdW1pbmcpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBzdHlsZSA9IGdldChjdXJzb3IpO1xyXG5cclxuICAgICAgLy8gaWYgZGVsdGFZICYmIHZlcnRpY2FsIHNjcm9sbGFibGVcclxuICAgICAgaWYgKGRlbHRhWSAmJiBzdHlsZS5vdmVyZmxvd1kubWF0Y2goLyhzY3JvbGx8YXV0bykvKSkge1xyXG4gICAgICAgIHZhciBtYXhTY3JvbGxUb3AgPSBjdXJzb3Iuc2Nyb2xsSGVpZ2h0IC0gY3Vyc29yLmNsaWVudEhlaWdodDtcclxuICAgICAgICBpZiAobWF4U2Nyb2xsVG9wID4gMCkge1xyXG4gICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAoY3Vyc29yLnNjcm9sbFRvcCA+IDAgJiYgZGVsdGFZIDwgMCkgfHxcclxuICAgICAgICAgICAgKGN1cnNvci5zY3JvbGxUb3AgPCBtYXhTY3JvbGxUb3AgJiYgZGVsdGFZID4gMClcclxuICAgICAgICAgICkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgLy8gaWYgZGVsdGFYICYmIGhvcml6b250YWwgc2Nyb2xsYWJsZVxyXG4gICAgICBpZiAoZGVsdGFYICYmIHN0eWxlLm92ZXJmbG93WC5tYXRjaCgvKHNjcm9sbHxhdXRvKS8pKSB7XHJcbiAgICAgICAgdmFyIG1heFNjcm9sbExlZnQgPSBjdXJzb3Iuc2Nyb2xsV2lkdGggLSBjdXJzb3IuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgaWYgKG1heFNjcm9sbExlZnQgPiAwKSB7XHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIChjdXJzb3Iuc2Nyb2xsTGVmdCA+IDAgJiYgZGVsdGFYIDwgMCkgfHxcclxuICAgICAgICAgICAgKGN1cnNvci5zY3JvbGxMZWZ0IDwgbWF4U2Nyb2xsTGVmdCAmJiBkZWx0YVggPiAwKVxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY3Vyc29yID0gY3Vyc29yLnBhcmVudE5vZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gbW91c2V3aGVlbEhhbmRsZXIoZSkge1xyXG4gICAgdmFyIHJlZiA9IGdldERlbHRhRnJvbUV2ZW50KGUpO1xyXG4gICAgdmFyIGRlbHRhWCA9IHJlZlswXTtcclxuICAgIHZhciBkZWx0YVkgPSByZWZbMV07XHJcblxyXG4gICAgaWYgKHNob3VsZEJlQ29uc3VtZWRCeUNoaWxkKGUudGFyZ2V0LCBkZWx0YVgsIGRlbHRhWSkpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzaG91bGRQcmV2ZW50ID0gZmFsc2U7XHJcbiAgICBpZiAoIWkuc2V0dGluZ3MudXNlQm90aFdoZWVsQXhlcykge1xyXG4gICAgICAvLyBkZWx0YVggd2lsbCBvbmx5IGJlIHVzZWQgZm9yIGhvcml6b250YWwgc2Nyb2xsaW5nIGFuZCBkZWx0YVkgd2lsbFxyXG4gICAgICAvLyBvbmx5IGJlIHVzZWQgZm9yIHZlcnRpY2FsIHNjcm9sbGluZyAtIHRoaXMgaXMgdGhlIGRlZmF1bHRcclxuICAgICAgZWxlbWVudC5zY3JvbGxUb3AgLT0gZGVsdGFZICogaS5zZXR0aW5ncy53aGVlbFNwZWVkO1xyXG4gICAgICBlbGVtZW50LnNjcm9sbExlZnQgKz0gZGVsdGFYICogaS5zZXR0aW5ncy53aGVlbFNwZWVkO1xyXG4gICAgfSBlbHNlIGlmIChpLnNjcm9sbGJhcllBY3RpdmUgJiYgIWkuc2Nyb2xsYmFyWEFjdGl2ZSkge1xyXG4gICAgICAvLyBvbmx5IHZlcnRpY2FsIHNjcm9sbGJhciBpcyBhY3RpdmUgYW5kIHVzZUJvdGhXaGVlbEF4ZXMgb3B0aW9uIGlzXHJcbiAgICAgIC8vIGFjdGl2ZSwgc28gbGV0J3Mgc2Nyb2xsIHZlcnRpY2FsIGJhciB1c2luZyBib3RoIG1vdXNlIHdoZWVsIGF4ZXNcclxuICAgICAgaWYgKGRlbHRhWSkge1xyXG4gICAgICAgIGVsZW1lbnQuc2Nyb2xsVG9wIC09IGRlbHRhWSAqIGkuc2V0dGluZ3Mud2hlZWxTcGVlZDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50LnNjcm9sbFRvcCArPSBkZWx0YVggKiBpLnNldHRpbmdzLndoZWVsU3BlZWQ7XHJcbiAgICAgIH1cclxuICAgICAgc2hvdWxkUHJldmVudCA9IHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKGkuc2Nyb2xsYmFyWEFjdGl2ZSAmJiAhaS5zY3JvbGxiYXJZQWN0aXZlKSB7XHJcbiAgICAgIC8vIHVzZUJvdGhXaGVlbEF4ZXMgYW5kIG9ubHkgaG9yaXpvbnRhbCBiYXIgaXMgYWN0aXZlLCBzbyB1c2UgYm90aFxyXG4gICAgICAvLyB3aGVlbCBheGVzIGZvciBob3Jpem9udGFsIGJhclxyXG4gICAgICBpZiAoZGVsdGFYKSB7XHJcbiAgICAgICAgZWxlbWVudC5zY3JvbGxMZWZ0ICs9IGRlbHRhWCAqIGkuc2V0dGluZ3Mud2hlZWxTcGVlZDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBlbGVtZW50LnNjcm9sbExlZnQgLT0gZGVsdGFZICogaS5zZXR0aW5ncy53aGVlbFNwZWVkO1xyXG4gICAgICB9XHJcbiAgICAgIHNob3VsZFByZXZlbnQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUdlb21ldHJ5KGkpO1xyXG5cclxuICAgIHNob3VsZFByZXZlbnQgPSBzaG91bGRQcmV2ZW50IHx8IHNob3VsZFByZXZlbnREZWZhdWx0KGRlbHRhWCwgZGVsdGFZKTtcclxuICAgIGlmIChzaG91bGRQcmV2ZW50ICYmICFlLmN0cmxLZXkpIHtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiB3aW5kb3cub253aGVlbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGkuZXZlbnQuYmluZChlbGVtZW50LCAnd2hlZWwnLCBtb3VzZXdoZWVsSGFuZGxlcik7XHJcbiAgfSBlbHNlIGlmICh0eXBlb2Ygd2luZG93Lm9ubW91c2V3aGVlbCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGkuZXZlbnQuYmluZChlbGVtZW50LCAnbW91c2V3aGVlbCcsIG1vdXNld2hlZWxIYW5kbGVyKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvdWNoKGkpIHtcclxuICBpZiAoIWVudi5zdXBwb3J0c1RvdWNoICYmICFlbnYuc3VwcG9ydHNJZVBvaW50ZXIpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIHZhciBlbGVtZW50ID0gaS5lbGVtZW50O1xyXG5cclxuICBmdW5jdGlvbiBzaG91bGRQcmV2ZW50KGRlbHRhWCwgZGVsdGFZKSB7XHJcbiAgICB2YXIgc2Nyb2xsVG9wID0gTWF0aC5mbG9vcihlbGVtZW50LnNjcm9sbFRvcCk7XHJcbiAgICB2YXIgc2Nyb2xsTGVmdCA9IGVsZW1lbnQuc2Nyb2xsTGVmdDtcclxuICAgIHZhciBtYWduaXR1ZGVYID0gTWF0aC5hYnMoZGVsdGFYKTtcclxuICAgIHZhciBtYWduaXR1ZGVZID0gTWF0aC5hYnMoZGVsdGFZKTtcclxuXHJcbiAgICBpZiAobWFnbml0dWRlWSA+IG1hZ25pdHVkZVgpIHtcclxuICAgICAgLy8gdXNlciBpcyBwZXJoYXBzIHRyeWluZyB0byBzd2lwZSB1cC9kb3duIHRoZSBwYWdlXHJcblxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgKGRlbHRhWSA8IDAgJiYgc2Nyb2xsVG9wID09PSBpLmNvbnRlbnRIZWlnaHQgLSBpLmNvbnRhaW5lckhlaWdodCkgfHxcclxuICAgICAgICAoZGVsdGFZID4gMCAmJiBzY3JvbGxUb3AgPT09IDApXHJcbiAgICAgICkge1xyXG4gICAgICAgIC8vIHNldCBwcmV2ZW50IGZvciBtb2JpbGUgQ2hyb21lIHJlZnJlc2hcclxuICAgICAgICByZXR1cm4gd2luZG93LnNjcm9sbFkgPT09IDAgJiYgZGVsdGFZID4gMCAmJiBlbnYuaXNDaHJvbWU7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAobWFnbml0dWRlWCA+IG1hZ25pdHVkZVkpIHtcclxuICAgICAgLy8gdXNlciBpcyBwZXJoYXBzIHRyeWluZyB0byBzd2lwZSBsZWZ0L3JpZ2h0IGFjcm9zcyB0aGUgcGFnZVxyXG5cclxuICAgICAgaWYgKFxyXG4gICAgICAgIChkZWx0YVggPCAwICYmIHNjcm9sbExlZnQgPT09IGkuY29udGVudFdpZHRoIC0gaS5jb250YWluZXJXaWR0aCkgfHxcclxuICAgICAgICAoZGVsdGFYID4gMCAmJiBzY3JvbGxMZWZ0ID09PSAwKVxyXG4gICAgICApIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYXBwbHlUb3VjaE1vdmUoZGlmZmVyZW5jZVgsIGRpZmZlcmVuY2VZKSB7XHJcbiAgICBlbGVtZW50LnNjcm9sbFRvcCAtPSBkaWZmZXJlbmNlWTtcclxuICAgIGVsZW1lbnQuc2Nyb2xsTGVmdCAtPSBkaWZmZXJlbmNlWDtcclxuXHJcbiAgICB1cGRhdGVHZW9tZXRyeShpKTtcclxuICB9XHJcblxyXG4gIHZhciBzdGFydE9mZnNldCA9IHt9O1xyXG4gIHZhciBzdGFydFRpbWUgPSAwO1xyXG4gIHZhciBzcGVlZCA9IHt9O1xyXG4gIHZhciBlYXNpbmdMb29wID0gbnVsbDtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0VG91Y2goZSkge1xyXG4gICAgaWYgKGUudGFyZ2V0VG91Y2hlcykge1xyXG4gICAgICByZXR1cm4gZS50YXJnZXRUb3VjaGVzWzBdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gTWF5YmUgSUUgcG9pbnRlclxyXG4gICAgICByZXR1cm4gZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3VsZEhhbmRsZShlKSB7XHJcbiAgICBpZiAoZS5wb2ludGVyVHlwZSAmJiBlLnBvaW50ZXJUeXBlID09PSAncGVuJyAmJiBlLmJ1dHRvbnMgPT09IDApIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGUudGFyZ2V0VG91Y2hlcyAmJiBlLnRhcmdldFRvdWNoZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgaWYgKFxyXG4gICAgICBlLnBvaW50ZXJUeXBlICYmXHJcbiAgICAgIGUucG9pbnRlclR5cGUgIT09ICdtb3VzZScgJiZcclxuICAgICAgZS5wb2ludGVyVHlwZSAhPT0gZS5NU1BPSU5URVJfVFlQRV9NT1VTRVxyXG4gICAgKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdG91Y2hTdGFydChlKSB7XHJcbiAgICBpZiAoIXNob3VsZEhhbmRsZShlKSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHRvdWNoID0gZ2V0VG91Y2goZSk7XHJcblxyXG4gICAgc3RhcnRPZmZzZXQucGFnZVggPSB0b3VjaC5wYWdlWDtcclxuICAgIHN0YXJ0T2Zmc2V0LnBhZ2VZID0gdG91Y2gucGFnZVk7XHJcblxyXG4gICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XHJcblxyXG4gICAgaWYgKGVhc2luZ0xvb3AgIT09IG51bGwpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbChlYXNpbmdMb29wKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3VsZEJlQ29uc3VtZWRCeUNoaWxkKHRhcmdldCwgZGVsdGFYLCBkZWx0YVkpIHtcclxuICAgIGlmICghZWxlbWVudC5jb250YWlucyh0YXJnZXQpKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgY3Vyc29yID0gdGFyZ2V0O1xyXG5cclxuICAgIHdoaWxlIChjdXJzb3IgJiYgY3Vyc29yICE9PSBlbGVtZW50KSB7XHJcbiAgICAgIGlmIChjdXJzb3IuY2xhc3NMaXN0LmNvbnRhaW5zKGNscy5lbGVtZW50LmNvbnN1bWluZykpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIHN0eWxlID0gZ2V0KGN1cnNvcik7XHJcblxyXG4gICAgICAvLyBpZiBkZWx0YVkgJiYgdmVydGljYWwgc2Nyb2xsYWJsZVxyXG4gICAgICBpZiAoZGVsdGFZICYmIHN0eWxlLm92ZXJmbG93WS5tYXRjaCgvKHNjcm9sbHxhdXRvKS8pKSB7XHJcbiAgICAgICAgdmFyIG1heFNjcm9sbFRvcCA9IGN1cnNvci5zY3JvbGxIZWlnaHQgLSBjdXJzb3IuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgIGlmIChtYXhTY3JvbGxUb3AgPiAwKSB7XHJcbiAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIChjdXJzb3Iuc2Nyb2xsVG9wID4gMCAmJiBkZWx0YVkgPCAwKSB8fFxyXG4gICAgICAgICAgICAoY3Vyc29yLnNjcm9sbFRvcCA8IG1heFNjcm9sbFRvcCAmJiBkZWx0YVkgPiAwKVxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAvLyBpZiBkZWx0YVggJiYgaG9yaXpvbnRhbCBzY3JvbGxhYmxlXHJcbiAgICAgIGlmIChkZWx0YVggJiYgc3R5bGUub3ZlcmZsb3dYLm1hdGNoKC8oc2Nyb2xsfGF1dG8pLykpIHtcclxuICAgICAgICB2YXIgbWF4U2Nyb2xsTGVmdCA9IGN1cnNvci5zY3JvbGxXaWR0aCAtIGN1cnNvci5jbGllbnRXaWR0aDtcclxuICAgICAgICBpZiAobWF4U2Nyb2xsTGVmdCA+IDApIHtcclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgKGN1cnNvci5zY3JvbGxMZWZ0ID4gMCAmJiBkZWx0YVggPCAwKSB8fFxyXG4gICAgICAgICAgICAoY3Vyc29yLnNjcm9sbExlZnQgPCBtYXhTY3JvbGxMZWZ0ICYmIGRlbHRhWCA+IDApXHJcbiAgICAgICAgICApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjdXJzb3IgPSBjdXJzb3IucGFyZW50Tm9kZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB0b3VjaE1vdmUoZSkge1xyXG4gICAgaWYgKHNob3VsZEhhbmRsZShlKSkge1xyXG4gICAgICB2YXIgdG91Y2ggPSBnZXRUb3VjaChlKTtcclxuXHJcbiAgICAgIHZhciBjdXJyZW50T2Zmc2V0ID0geyBwYWdlWDogdG91Y2gucGFnZVgsIHBhZ2VZOiB0b3VjaC5wYWdlWSB9O1xyXG5cclxuICAgICAgdmFyIGRpZmZlcmVuY2VYID0gY3VycmVudE9mZnNldC5wYWdlWCAtIHN0YXJ0T2Zmc2V0LnBhZ2VYO1xyXG4gICAgICB2YXIgZGlmZmVyZW5jZVkgPSBjdXJyZW50T2Zmc2V0LnBhZ2VZIC0gc3RhcnRPZmZzZXQucGFnZVk7XHJcblxyXG4gICAgICBpZiAoc2hvdWxkQmVDb25zdW1lZEJ5Q2hpbGQoZS50YXJnZXQsIGRpZmZlcmVuY2VYLCBkaWZmZXJlbmNlWSkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFwcGx5VG91Y2hNb3ZlKGRpZmZlcmVuY2VYLCBkaWZmZXJlbmNlWSk7XHJcbiAgICAgIHN0YXJ0T2Zmc2V0ID0gY3VycmVudE9mZnNldDtcclxuXHJcbiAgICAgIHZhciBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG5cclxuICAgICAgdmFyIHRpbWVHYXAgPSBjdXJyZW50VGltZSAtIHN0YXJ0VGltZTtcclxuICAgICAgaWYgKHRpbWVHYXAgPiAwKSB7XHJcbiAgICAgICAgc3BlZWQueCA9IGRpZmZlcmVuY2VYIC8gdGltZUdhcDtcclxuICAgICAgICBzcGVlZC55ID0gZGlmZmVyZW5jZVkgLyB0aW1lR2FwO1xyXG4gICAgICAgIHN0YXJ0VGltZSA9IGN1cnJlbnRUaW1lO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2hvdWxkUHJldmVudChkaWZmZXJlbmNlWCwgZGlmZmVyZW5jZVkpKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIHRvdWNoRW5kKCkge1xyXG4gICAgaWYgKGkuc2V0dGluZ3Muc3dpcGVFYXNpbmcpIHtcclxuICAgICAgY2xlYXJJbnRlcnZhbChlYXNpbmdMb29wKTtcclxuICAgICAgZWFzaW5nTG9vcCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChpLmlzSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoZWFzaW5nTG9vcCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXNwZWVkLnggJiYgIXNwZWVkLnkpIHtcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoZWFzaW5nTG9vcCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoTWF0aC5hYnMoc3BlZWQueCkgPCAwLjAxICYmIE1hdGguYWJzKHNwZWVkLnkpIDwgMC4wMSkge1xyXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChlYXNpbmdMb29wKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGFwcGx5VG91Y2hNb3ZlKHNwZWVkLnggKiAzMCwgc3BlZWQueSAqIDMwKTtcclxuXHJcbiAgICAgICAgc3BlZWQueCAqPSAwLjg7XHJcbiAgICAgICAgc3BlZWQueSAqPSAwLjg7XHJcbiAgICAgIH0sIDEwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGlmIChlbnYuc3VwcG9ydHNUb3VjaCkge1xyXG4gICAgaS5ldmVudC5iaW5kKGVsZW1lbnQsICd0b3VjaHN0YXJ0JywgdG91Y2hTdGFydCk7XHJcbiAgICBpLmV2ZW50LmJpbmQoZWxlbWVudCwgJ3RvdWNobW92ZScsIHRvdWNoTW92ZSk7XHJcbiAgICBpLmV2ZW50LmJpbmQoZWxlbWVudCwgJ3RvdWNoZW5kJywgdG91Y2hFbmQpO1xyXG4gIH0gZWxzZSBpZiAoZW52LnN1cHBvcnRzSWVQb2ludGVyKSB7XHJcbiAgICBpZiAod2luZG93LlBvaW50ZXJFdmVudCkge1xyXG4gICAgICBpLmV2ZW50LmJpbmQoZWxlbWVudCwgJ3BvaW50ZXJkb3duJywgdG91Y2hTdGFydCk7XHJcbiAgICAgIGkuZXZlbnQuYmluZChlbGVtZW50LCAncG9pbnRlcm1vdmUnLCB0b3VjaE1vdmUpO1xyXG4gICAgICBpLmV2ZW50LmJpbmQoZWxlbWVudCwgJ3BvaW50ZXJ1cCcsIHRvdWNoRW5kKTtcclxuICAgIH0gZWxzZSBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XHJcbiAgICAgIGkuZXZlbnQuYmluZChlbGVtZW50LCAnTVNQb2ludGVyRG93bicsIHRvdWNoU3RhcnQpO1xyXG4gICAgICBpLmV2ZW50LmJpbmQoZWxlbWVudCwgJ01TUG9pbnRlck1vdmUnLCB0b3VjaE1vdmUpO1xyXG4gICAgICBpLmV2ZW50LmJpbmQoZWxlbWVudCwgJ01TUG9pbnRlclVwJywgdG91Y2hFbmQpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxudmFyIGRlZmF1bHRTZXR0aW5ncyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICh7XHJcbiAgaGFuZGxlcnM6IFsnY2xpY2stcmFpbCcsICdkcmFnLXRodW1iJywgJ2tleWJvYXJkJywgJ3doZWVsJywgJ3RvdWNoJ10sXHJcbiAgbWF4U2Nyb2xsYmFyTGVuZ3RoOiBudWxsLFxyXG4gIG1pblNjcm9sbGJhckxlbmd0aDogbnVsbCxcclxuICBzY3JvbGxpbmdUaHJlc2hvbGQ6IDEwMDAsXHJcbiAgc2Nyb2xsWE1hcmdpbk9mZnNldDogMCxcclxuICBzY3JvbGxZTWFyZ2luT2Zmc2V0OiAwLFxyXG4gIHN1cHByZXNzU2Nyb2xsWDogZmFsc2UsXHJcbiAgc3VwcHJlc3NTY3JvbGxZOiBmYWxzZSxcclxuICBzd2lwZUVhc2luZzogdHJ1ZSxcclxuICB1c2VCb3RoV2hlZWxBeGVzOiBmYWxzZSxcclxuICB3aGVlbFByb3BhZ2F0aW9uOiB0cnVlLFxyXG4gIHdoZWVsU3BlZWQ6IDEsXHJcbn0pOyB9O1xyXG5cclxudmFyIGhhbmRsZXJzID0ge1xyXG4gICdjbGljay1yYWlsJzogY2xpY2tSYWlsLFxyXG4gICdkcmFnLXRodW1iJzogZHJhZ1RodW1iLFxyXG4gIGtleWJvYXJkOiBrZXlib2FyZCxcclxuICB3aGVlbDogd2hlZWwsXHJcbiAgdG91Y2g6IHRvdWNoLFxyXG59O1xyXG5cclxudmFyIFBlcmZlY3RTY3JvbGxiYXIgPSBmdW5jdGlvbiBQZXJmZWN0U2Nyb2xsYmFyKGVsZW1lbnQsIHVzZXJTZXR0aW5ncykge1xyXG4gIHZhciB0aGlzJDEgPSB0aGlzO1xyXG4gIGlmICggdXNlclNldHRpbmdzID09PSB2b2lkIDAgKSB1c2VyU2V0dGluZ3MgPSB7fTtcclxuXHJcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xyXG4gICAgZWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCk7XHJcbiAgfVxyXG5cclxuICBpZiAoIWVsZW1lbnQgfHwgIWVsZW1lbnQubm9kZU5hbWUpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignbm8gZWxlbWVudCBpcyBzcGVjaWZpZWQgdG8gaW5pdGlhbGl6ZSBQZXJmZWN0U2Nyb2xsYmFyJyk7XHJcbiAgfVxyXG5cclxuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG5cclxuICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xzLm1haW4pO1xyXG5cclxuICB0aGlzLnNldHRpbmdzID0gZGVmYXVsdFNldHRpbmdzKCk7XHJcbiAgZm9yICh2YXIga2V5IGluIHVzZXJTZXR0aW5ncykge1xyXG4gICAgdGhpcy5zZXR0aW5nc1trZXldID0gdXNlclNldHRpbmdzW2tleV07XHJcbiAgfVxyXG5cclxuICB0aGlzLmNvbnRhaW5lcldpZHRoID0gbnVsbDtcclxuICB0aGlzLmNvbnRhaW5lckhlaWdodCA9IG51bGw7XHJcbiAgdGhpcy5jb250ZW50V2lkdGggPSBudWxsO1xyXG4gIHRoaXMuY29udGVudEhlaWdodCA9IG51bGw7XHJcblxyXG4gIHZhciBmb2N1cyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbHMuc3RhdGUuZm9jdXMpOyB9O1xyXG4gIHZhciBibHVyID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNscy5zdGF0ZS5mb2N1cyk7IH07XHJcblxyXG4gIHRoaXMuaXNSdGwgPSBnZXQoZWxlbWVudCkuZGlyZWN0aW9uID09PSAncnRsJztcclxuICBpZiAodGhpcy5pc1J0bCA9PT0gdHJ1ZSkge1xyXG4gICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNscy5ydGwpO1xyXG4gIH1cclxuICB0aGlzLmlzTmVnYXRpdmVTY3JvbGwgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG9yaWdpbmFsU2Nyb2xsTGVmdCA9IGVsZW1lbnQuc2Nyb2xsTGVmdDtcclxuICAgIHZhciByZXN1bHQgPSBudWxsO1xyXG4gICAgZWxlbWVudC5zY3JvbGxMZWZ0ID0gLTE7XHJcbiAgICByZXN1bHQgPSBlbGVtZW50LnNjcm9sbExlZnQgPCAwO1xyXG4gICAgZWxlbWVudC5zY3JvbGxMZWZ0ID0gb3JpZ2luYWxTY3JvbGxMZWZ0O1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9KSgpO1xyXG4gIHRoaXMubmVnYXRpdmVTY3JvbGxBZGp1c3RtZW50ID0gdGhpcy5pc05lZ2F0aXZlU2Nyb2xsXHJcbiAgICA/IGVsZW1lbnQuc2Nyb2xsV2lkdGggLSBlbGVtZW50LmNsaWVudFdpZHRoXHJcbiAgICA6IDA7XHJcbiAgdGhpcy5ldmVudCA9IG5ldyBFdmVudE1hbmFnZXIoKTtcclxuICB0aGlzLm93bmVyRG9jdW1lbnQgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQgfHwgZG9jdW1lbnQ7XHJcblxyXG4gIHRoaXMuc2Nyb2xsYmFyWFJhaWwgPSBkaXYoY2xzLmVsZW1lbnQucmFpbCgneCcpKTtcclxuICBlbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuc2Nyb2xsYmFyWFJhaWwpO1xyXG4gIHRoaXMuc2Nyb2xsYmFyWCA9IGRpdihjbHMuZWxlbWVudC50aHVtYigneCcpKTtcclxuICB0aGlzLnNjcm9sbGJhclhSYWlsLmFwcGVuZENoaWxkKHRoaXMuc2Nyb2xsYmFyWCk7XHJcbiAgdGhpcy5zY3JvbGxiYXJYLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAwKTtcclxuICB0aGlzLmV2ZW50LmJpbmQodGhpcy5zY3JvbGxiYXJYLCAnZm9jdXMnLCBmb2N1cyk7XHJcbiAgdGhpcy5ldmVudC5iaW5kKHRoaXMuc2Nyb2xsYmFyWCwgJ2JsdXInLCBibHVyKTtcclxuICB0aGlzLnNjcm9sbGJhclhBY3RpdmUgPSBudWxsO1xyXG4gIHRoaXMuc2Nyb2xsYmFyWFdpZHRoID0gbnVsbDtcclxuICB0aGlzLnNjcm9sbGJhclhMZWZ0ID0gbnVsbDtcclxuICB2YXIgcmFpbFhTdHlsZSA9IGdldCh0aGlzLnNjcm9sbGJhclhSYWlsKTtcclxuICB0aGlzLnNjcm9sbGJhclhCb3R0b20gPSBwYXJzZUludChyYWlsWFN0eWxlLmJvdHRvbSwgMTApO1xyXG4gIGlmIChpc05hTih0aGlzLnNjcm9sbGJhclhCb3R0b20pKSB7XHJcbiAgICB0aGlzLmlzU2Nyb2xsYmFyWFVzaW5nQm90dG9tID0gZmFsc2U7XHJcbiAgICB0aGlzLnNjcm9sbGJhclhUb3AgPSB0b0ludChyYWlsWFN0eWxlLnRvcCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuaXNTY3JvbGxiYXJYVXNpbmdCb3R0b20gPSB0cnVlO1xyXG4gIH1cclxuICB0aGlzLnJhaWxCb3JkZXJYV2lkdGggPVxyXG4gICAgdG9JbnQocmFpbFhTdHlsZS5ib3JkZXJMZWZ0V2lkdGgpICsgdG9JbnQocmFpbFhTdHlsZS5ib3JkZXJSaWdodFdpZHRoKTtcclxuICAvLyBTZXQgcmFpbCB0byBkaXNwbGF5OmJsb2NrIHRvIGNhbGN1bGF0ZSBtYXJnaW5zXHJcbiAgc2V0KHRoaXMuc2Nyb2xsYmFyWFJhaWwsIHsgZGlzcGxheTogJ2Jsb2NrJyB9KTtcclxuICB0aGlzLnJhaWxYTWFyZ2luV2lkdGggPVxyXG4gICAgdG9JbnQocmFpbFhTdHlsZS5tYXJnaW5MZWZ0KSArIHRvSW50KHJhaWxYU3R5bGUubWFyZ2luUmlnaHQpO1xyXG4gIHNldCh0aGlzLnNjcm9sbGJhclhSYWlsLCB7IGRpc3BsYXk6ICcnIH0pO1xyXG4gIHRoaXMucmFpbFhXaWR0aCA9IG51bGw7XHJcbiAgdGhpcy5yYWlsWFJhdGlvID0gbnVsbDtcclxuXHJcbiAgdGhpcy5zY3JvbGxiYXJZUmFpbCA9IGRpdihjbHMuZWxlbWVudC5yYWlsKCd5JykpO1xyXG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5zY3JvbGxiYXJZUmFpbCk7XHJcbiAgdGhpcy5zY3JvbGxiYXJZID0gZGl2KGNscy5lbGVtZW50LnRodW1iKCd5JykpO1xyXG4gIHRoaXMuc2Nyb2xsYmFyWVJhaWwuYXBwZW5kQ2hpbGQodGhpcy5zY3JvbGxiYXJZKTtcclxuICB0aGlzLnNjcm9sbGJhclkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIDApO1xyXG4gIHRoaXMuZXZlbnQuYmluZCh0aGlzLnNjcm9sbGJhclksICdmb2N1cycsIGZvY3VzKTtcclxuICB0aGlzLmV2ZW50LmJpbmQodGhpcy5zY3JvbGxiYXJZLCAnYmx1cicsIGJsdXIpO1xyXG4gIHRoaXMuc2Nyb2xsYmFyWUFjdGl2ZSA9IG51bGw7XHJcbiAgdGhpcy5zY3JvbGxiYXJZSGVpZ2h0ID0gbnVsbDtcclxuICB0aGlzLnNjcm9sbGJhcllUb3AgPSBudWxsO1xyXG4gIHZhciByYWlsWVN0eWxlID0gZ2V0KHRoaXMuc2Nyb2xsYmFyWVJhaWwpO1xyXG4gIHRoaXMuc2Nyb2xsYmFyWVJpZ2h0ID0gcGFyc2VJbnQocmFpbFlTdHlsZS5yaWdodCwgMTApO1xyXG4gIGlmIChpc05hTih0aGlzLnNjcm9sbGJhcllSaWdodCkpIHtcclxuICAgIHRoaXMuaXNTY3JvbGxiYXJZVXNpbmdSaWdodCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zY3JvbGxiYXJZTGVmdCA9IHRvSW50KHJhaWxZU3R5bGUubGVmdCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuaXNTY3JvbGxiYXJZVXNpbmdSaWdodCA9IHRydWU7XHJcbiAgfVxyXG4gIHRoaXMuc2Nyb2xsYmFyWU91dGVyV2lkdGggPSB0aGlzLmlzUnRsID8gb3V0ZXJXaWR0aCh0aGlzLnNjcm9sbGJhclkpIDogbnVsbDtcclxuICB0aGlzLnJhaWxCb3JkZXJZV2lkdGggPVxyXG4gICAgdG9JbnQocmFpbFlTdHlsZS5ib3JkZXJUb3BXaWR0aCkgKyB0b0ludChyYWlsWVN0eWxlLmJvcmRlckJvdHRvbVdpZHRoKTtcclxuICBzZXQodGhpcy5zY3JvbGxiYXJZUmFpbCwgeyBkaXNwbGF5OiAnYmxvY2snIH0pO1xyXG4gIHRoaXMucmFpbFlNYXJnaW5IZWlnaHQgPVxyXG4gICAgdG9JbnQocmFpbFlTdHlsZS5tYXJnaW5Ub3ApICsgdG9JbnQocmFpbFlTdHlsZS5tYXJnaW5Cb3R0b20pO1xyXG4gIHNldCh0aGlzLnNjcm9sbGJhcllSYWlsLCB7IGRpc3BsYXk6ICcnIH0pO1xyXG4gIHRoaXMucmFpbFlIZWlnaHQgPSBudWxsO1xyXG4gIHRoaXMucmFpbFlSYXRpbyA9IG51bGw7XHJcblxyXG4gIHRoaXMucmVhY2ggPSB7XHJcbiAgICB4OlxyXG4gICAgICBlbGVtZW50LnNjcm9sbExlZnQgPD0gMFxyXG4gICAgICAgID8gJ3N0YXJ0J1xyXG4gICAgICAgIDogZWxlbWVudC5zY3JvbGxMZWZ0ID49IHRoaXMuY29udGVudFdpZHRoIC0gdGhpcy5jb250YWluZXJXaWR0aFxyXG4gICAgICAgID8gJ2VuZCdcclxuICAgICAgICA6IG51bGwsXHJcbiAgICB5OlxyXG4gICAgICBlbGVtZW50LnNjcm9sbFRvcCA8PSAwXHJcbiAgICAgICAgPyAnc3RhcnQnXHJcbiAgICAgICAgOiBlbGVtZW50LnNjcm9sbFRvcCA+PSB0aGlzLmNvbnRlbnRIZWlnaHQgLSB0aGlzLmNvbnRhaW5lckhlaWdodFxyXG4gICAgICAgID8gJ2VuZCdcclxuICAgICAgICA6IG51bGwsXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5pc0FsaXZlID0gdHJ1ZTtcclxuXHJcbiAgdGhpcy5zZXR0aW5ncy5oYW5kbGVycy5mb3JFYWNoKGZ1bmN0aW9uIChoYW5kbGVyTmFtZSkgeyByZXR1cm4gaGFuZGxlcnNbaGFuZGxlck5hbWVdKHRoaXMkMSk7IH0pO1xyXG5cclxuICB0aGlzLmxhc3RTY3JvbGxUb3AgPSBNYXRoLmZsb29yKGVsZW1lbnQuc2Nyb2xsVG9wKTsgLy8gZm9yIG9uU2Nyb2xsIG9ubHlcclxuICB0aGlzLmxhc3RTY3JvbGxMZWZ0ID0gZWxlbWVudC5zY3JvbGxMZWZ0OyAvLyBmb3Igb25TY3JvbGwgb25seVxyXG4gIHRoaXMuZXZlbnQuYmluZCh0aGlzLmVsZW1lbnQsICdzY3JvbGwnLCBmdW5jdGlvbiAoZSkgeyByZXR1cm4gdGhpcyQxLm9uU2Nyb2xsKGUpOyB9KTtcclxuICB1cGRhdGVHZW9tZXRyeSh0aGlzKTtcclxufTtcclxuXHJcblBlcmZlY3RTY3JvbGxiYXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZSAoKSB7XHJcbiAgaWYgKCF0aGlzLmlzQWxpdmUpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcblxyXG4gIC8vIFJlY2FsY3VhdGUgbmVnYXRpdmUgc2Nyb2xsTGVmdCBhZGp1c3RtZW50XHJcbiAgdGhpcy5uZWdhdGl2ZVNjcm9sbEFkanVzdG1lbnQgPSB0aGlzLmlzTmVnYXRpdmVTY3JvbGxcclxuICAgID8gdGhpcy5lbGVtZW50LnNjcm9sbFdpZHRoIC0gdGhpcy5lbGVtZW50LmNsaWVudFdpZHRoXHJcbiAgICA6IDA7XHJcblxyXG4gIC8vIFJlY2FsY3VsYXRlIHJhaWwgbWFyZ2luc1xyXG4gIHNldCh0aGlzLnNjcm9sbGJhclhSYWlsLCB7IGRpc3BsYXk6ICdibG9jaycgfSk7XHJcbiAgc2V0KHRoaXMuc2Nyb2xsYmFyWVJhaWwsIHsgZGlzcGxheTogJ2Jsb2NrJyB9KTtcclxuICB0aGlzLnJhaWxYTWFyZ2luV2lkdGggPVxyXG4gICAgdG9JbnQoZ2V0KHRoaXMuc2Nyb2xsYmFyWFJhaWwpLm1hcmdpbkxlZnQpICtcclxuICAgIHRvSW50KGdldCh0aGlzLnNjcm9sbGJhclhSYWlsKS5tYXJnaW5SaWdodCk7XHJcbiAgdGhpcy5yYWlsWU1hcmdpbkhlaWdodCA9XHJcbiAgICB0b0ludChnZXQodGhpcy5zY3JvbGxiYXJZUmFpbCkubWFyZ2luVG9wKSArXHJcbiAgICB0b0ludChnZXQodGhpcy5zY3JvbGxiYXJZUmFpbCkubWFyZ2luQm90dG9tKTtcclxuXHJcbiAgLy8gSGlkZSBzY3JvbGxiYXJzIG5vdCB0byBhZmZlY3Qgc2Nyb2xsV2lkdGggYW5kIHNjcm9sbEhlaWdodFxyXG4gIHNldCh0aGlzLnNjcm9sbGJhclhSYWlsLCB7IGRpc3BsYXk6ICdub25lJyB9KTtcclxuICBzZXQodGhpcy5zY3JvbGxiYXJZUmFpbCwgeyBkaXNwbGF5OiAnbm9uZScgfSk7XHJcblxyXG4gIHVwZGF0ZUdlb21ldHJ5KHRoaXMpO1xyXG5cclxuICBwcm9jZXNzU2Nyb2xsRGlmZih0aGlzLCAndG9wJywgMCwgZmFsc2UsIHRydWUpO1xyXG4gIHByb2Nlc3NTY3JvbGxEaWZmKHRoaXMsICdsZWZ0JywgMCwgZmFsc2UsIHRydWUpO1xyXG5cclxuICBzZXQodGhpcy5zY3JvbGxiYXJYUmFpbCwgeyBkaXNwbGF5OiAnJyB9KTtcclxuICBzZXQodGhpcy5zY3JvbGxiYXJZUmFpbCwgeyBkaXNwbGF5OiAnJyB9KTtcclxufTtcclxuXHJcblBlcmZlY3RTY3JvbGxiYXIucHJvdG90eXBlLm9uU2Nyb2xsID0gZnVuY3Rpb24gb25TY3JvbGwgKGUpIHtcclxuICBpZiAoIXRoaXMuaXNBbGl2ZSkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlR2VvbWV0cnkodGhpcyk7XHJcbiAgcHJvY2Vzc1Njcm9sbERpZmYodGhpcywgJ3RvcCcsIHRoaXMuZWxlbWVudC5zY3JvbGxUb3AgLSB0aGlzLmxhc3RTY3JvbGxUb3ApO1xyXG4gIHByb2Nlc3NTY3JvbGxEaWZmKFxyXG4gICAgdGhpcyxcclxuICAgICdsZWZ0JyxcclxuICAgIHRoaXMuZWxlbWVudC5zY3JvbGxMZWZ0IC0gdGhpcy5sYXN0U2Nyb2xsTGVmdFxyXG4gICk7XHJcblxyXG4gIHRoaXMubGFzdFNjcm9sbFRvcCA9IE1hdGguZmxvb3IodGhpcy5lbGVtZW50LnNjcm9sbFRvcCk7XHJcbiAgdGhpcy5sYXN0U2Nyb2xsTGVmdCA9IHRoaXMuZWxlbWVudC5zY3JvbGxMZWZ0O1xyXG59O1xyXG5cclxuUGVyZmVjdFNjcm9sbGJhci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIGRlc3Ryb3kgKCkge1xyXG4gIGlmICghdGhpcy5pc0FsaXZlKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB0aGlzLmV2ZW50LnVuYmluZEFsbCgpO1xyXG4gIHJlbW92ZSh0aGlzLnNjcm9sbGJhclgpO1xyXG4gIHJlbW92ZSh0aGlzLnNjcm9sbGJhclkpO1xyXG4gIHJlbW92ZSh0aGlzLnNjcm9sbGJhclhSYWlsKTtcclxuICByZW1vdmUodGhpcy5zY3JvbGxiYXJZUmFpbCk7XHJcbiAgdGhpcy5yZW1vdmVQc0NsYXNzZXMoKTtcclxuXHJcbiAgLy8gdW5zZXQgZWxlbWVudHNcclxuICB0aGlzLmVsZW1lbnQgPSBudWxsO1xyXG4gIHRoaXMuc2Nyb2xsYmFyWCA9IG51bGw7XHJcbiAgdGhpcy5zY3JvbGxiYXJZID0gbnVsbDtcclxuICB0aGlzLnNjcm9sbGJhclhSYWlsID0gbnVsbDtcclxuICB0aGlzLnNjcm9sbGJhcllSYWlsID0gbnVsbDtcclxuXHJcbiAgdGhpcy5pc0FsaXZlID0gZmFsc2U7XHJcbn07XHJcblxyXG5QZXJmZWN0U2Nyb2xsYmFyLnByb3RvdHlwZS5yZW1vdmVQc0NsYXNzZXMgPSBmdW5jdGlvbiByZW1vdmVQc0NsYXNzZXMgKCkge1xyXG4gIHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPSB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lXHJcbiAgICAuc3BsaXQoJyAnKVxyXG4gICAgLmZpbHRlcihmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gIW5hbWUubWF0Y2goL15wcyhbLV9dLit8KSQvKTsgfSlcclxuICAgIC5qb2luKCcgJyk7XHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBQZXJmZWN0U2Nyb2xsYmFyO1xyXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wZXJmZWN0LXNjcm9sbGJhci5lc20uanMubWFwXHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgaW5pdCBmcm9tICcuL2luaXQnXG5pbXBvcnQgeyBzY3JvbGwgfSBmcm9tICcuL3Njcm9sbCdcbmltcG9ydCAnLi9pbml0U2lkZWJhcidcbmltcG9ydCB7IGluaXRNb2JpbGUgfSBmcm9tICcuL21vYmlsZSdcbmltcG9ydCBJbml0U2lkZWJhckxpbmsgZnJvbSAnLi90YWcnXG5pbXBvcnQgdG9jIGZyb20gJy4vdG9jJ1xuaW1wb3J0IGZhbmN5Ym94IGZyb20gJy4vZmFuY3lib3gnXG5cbi8vIHByaW50IGN1c3RvbSBpbmZvXG5jb25zdCBsb2dTdHlsZSA9XG4gICdjb2xvcjogI2ZmZjsgYmFja2dyb3VuZDogIzYxYmZhZDsgcGFkZGluZzogMXB4OyBib3JkZXItcmFkaXVzOiA1cHg7J1xuY29uc29sZS5pbmZvKCclYyDwn46vIGhleG8tdGhlbWUtYXJjaGVyIOKsh++4jyAnLCBsb2dTdHlsZSlcbmNvbnNvbGUuaW5mbygnJWMg8J+PtyBWZXJzaW9uOiAxLjYuMiAnLCBsb2dTdHlsZSlcbmNvbnNvbGUuaW5mbygnJWMg8J+ThSBWZXJzaW9uIGRhdGU6IDIwMjEwNTMxJywgbG9nU3R5bGUpXG5jb25zb2xlLmluZm8oJyVjIPCfk6YgaHR0cHM6Ly9naXRodWIuY29tL2ZpM2V3b3JrL2hleG8tdGhlbWUtYXJjaGVyICcsIGxvZ1N0eWxlKVxuXG4vLyByZW1vdmUgYmFja2dyb3VuZCBwbGFjZWhvbGRlclxuaW5pdCgpXG5cbi8vIHNjcm9sbCBldmVudFxuc2Nyb2xsKClcblxuLy8gaW5pdCBzaWRlYmFyIGxpbmtcbmxldCBtZXRhcyA9IG5ldyBJbml0U2lkZWJhckxpbmsoKVxubWV0YXMuYWRkVGFiKHtcbiAgbWV0YU5hbWU6ICd0YWdzJyxcbiAgbGFiZWxzQ29udGFpbmVyOiAnLnNpZGViYXItdGFncy1uYW1lJyxcbiAgcG9zdHNDb250YWluZXI6ICcuc2lkZWJhci10YWdzLWxpc3QnLFxufSlcblxubWV0YXMuYWRkVGFiKHtcbiAgbWV0YU5hbWU6ICdjYXRlZ29yaWVzJyxcbiAgbGFiZWxzQ29udGFpbmVyOiAnLnNpZGViYXItY2F0ZWdvcmllcy1uYW1lJyxcbiAgcG9zdHNDb250YWluZXI6ICcuc2lkZWJhci1jYXRlZ29yaWVzLWxpc3QnLFxufSlcblxuLy8gaW5pdCB0b2NcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gIGNvbnNvbGUubG9nKCdBbGwgcmVzb3VyY2VzIGZpbmlzaGVkIGxvYWRpbmchJylcbiAgdG9jKClcbn0pXG5cbmluaXRNb2JpbGUoKVxuLy8gaW5pdFNlYXJjaCgpXG5cbi8vIGZhbmN5Ym94XG5mYW5jeWJveCgpXG4iXSwic291cmNlUm9vdCI6IiJ9