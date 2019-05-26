var ipsen = window.ipsen || {};

ipsen.Main = (function($, namespace) {  
  'use strict';
  var myFullpage;
  var init,
    _onClickMenuSearchLabel,
    _onClickSectionNextButton,
    _onSideLeave,
    _polyfill,
    _onClickToggleNavbar,
    _onResizeToInitSlick,
    _onSlickInit;  
  var SLICK_LOADED_CLASS = 'slick-loaded',
      TEXT_WHITE_CLASS = 'text-white',
      ACTIVE_CLASS = 'active',
      VISIBLE_CLASS = 'visible';
  var MOBILE_MEDIA_STRING = '(max-width: 767px)';
  var fondationSlickOptions;
  var slickOptionsDefault = {
    arrow: true,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1
  }
  var slickOptionPartners,
      slickOptionFondation;

  var Selectors = {
        SECTIONS: '.sections',
        MENU_SEARCH_LABEL: 'label[for="header-search"]',
        SECTION_NEXT_BUTTON: '.mission-next-button',
        PARTNER_ITEMS: '.partner-items',
        FONDATION_ITEMS: '.fondation-items',
        BOOKLAB_ITEMS: '.book-lab-items',
        ASIDE: 'aside',
        NAVBAR_TOGGLER: '.navbar-toggler'
      },
      Events = {
        CLICK_HEADER_SEARCH: 'click.header-search',
        CLICK_SCROLL_TO_NEXT: 'click.scroll-to-next-section',
        CLICK_TOGGLE_NAVBAR: 'click.toggle-navbar',
        SLIDE_LEAVE: 'onSlideLeave',
        AFTER_SLIDE_LOAD: 'afterSlideLoad',
        RESIZE_TO_INIT_SLICK: 'resize.init-slick',
        SLICK_INIT: 'init'
      };

  init = function() {     
    _polyfill();
    slickOptionFondation = Object.assign({}, slickOptionsDefault, {
      dots: true
    });
    slickOptionPartners = Object.assign({}, slickOptionsDefault, {
      slidesToShow: 3,
      slidesToScroll: 3,
      responsive: [
        {
          breakpoint: 560,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    })
    $(Selectors.SECTIONS).fullpage({  
      navigation: true,
      navigationPosition: 'left',
      css3: true,
      easing: 'easeInOutCubic',
      easingcss3: 'ease',
      afterLoad: function(anchorLink, index) {
        var self = $(Selectors.SECTIONS).children().eq(index - 1);        
        _onSideLeave(self);
      }
    });
    $(Selectors.PARTNER_ITEMS).slick(slickOptionPartners);
    $(Selectors.FONDATION_ITEMS).slick(slickOptionFondation);
    $(document)
      .off(Events.CLICK_HEADER_SEARCH).on(Events.CLICK_HEADER_SEARCH, Selectors.MENU_SEARCH_LABEL, _onClickMenuSearchLabel)
      .off(Events.CLICK_SCROLL_TO_NEXT).on(Events.CLICK_SCROLL_TO_NEXT, Selectors.SECTION_NEXT_BUTTON, _onClickSectionNextButton)
      .on(Events.SLICK_INIT, Selectors.PARTNER_ITEMS , _onSlickInit)
      .off(Events.CLICK_TOGGLE_NAVBAR).on(Events.CLICK_TOGGLE_NAVBAR, Selectors.NAVBAR_TOGGLER, _onClickToggleNavbar);
    
    $(window).off(Events.RESIZE_TO_INIT_SLICK).on(Events.RESIZE_TO_INIT_SLICK, _onResizeToInitSlick);
    
    $(window).trigger('resize');
  }
  _onResizeToInitSlick = function() {
    var booklabItemsElement = $(Selectors.BOOKLAB_ITEMS),
        isMobile = window.matchMedia(MOBILE_MEDIA_STRING).matches;
    if(isMobile) {      
      if(!booklabItemsElement.hasClass('slick-initialized')) {
        booklabItemsElement.slick(slickOptionsDefault)
      }
    } else {
      if(booklabItemsElement.hasClass('slick-initialized')) {
        booklabItemsElement.slick('unslick');
      }
    }
  }
  _onClickToggleNavbar = function() {
    var self = $(this),
        targetElement = $(self.data('target'));
    self.toggleClass(ACTIVE_CLASS);
    targetElement.toggleClass(VISIBLE_CLASS);
  }
  _onSideLeave = function(el) {
    var dataColor = el.data('color'),
    isDarkBackground = el.data('dark-background');

    $('header')[isDarkBackground ? 'addClass' : 'removeClass'](TEXT_WHITE_CLASS);
    if(dataColor) {
      $(Selectors.ASIDE).css('background', dataColor);
    } else {
      $(Selectors.ASIDE).removeAttr('style')
    }
  }
  _onSlickInit = function() {
    $(this).addClass(SLICK_LOADED_CLASS);
  }
  _onClickSectionNextButton = function() {
    $.fn.fullpage.moveSectionDown();
  }
  _onClickMenuSearchLabel = function() {
    var self = $(this);
    self.siblings('input').toggleClass(ACTIVE_CLASS);
  }
  _polyfill = function() {
    if (typeof Object.assign != 'function') {
      // Must be writable: true, enumerable: false, configurable: true
      Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
          'use strict';
          if (target == null) { // TypeError if undefined or null
            throw new TypeError('Cannot convert undefined or null to object');
          }
    
          var to = Object(target);
    
          for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];
    
            if (nextSource != null) { // Skip over if undefined or null
              for (var nextKey in nextSource) {
                // Avoid bugs when hasOwnProperty is shadowed
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                  to[nextKey] = nextSource[nextKey];
                }
              }
            }
          }
          return to;
        },
        writable: true,
        configurable: true
      });
    }
  }
  return {
    init: init
  }
})(jQuery, 'ipsen');

jQuery(ipsen.Main.init);