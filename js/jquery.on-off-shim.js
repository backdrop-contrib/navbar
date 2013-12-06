// Backbone has a dependency on jQuery 1.7+ because it refers to the
// jQuery.fn.on and jQuery.fn.off methods. We polyfill them here, but prefer
// the native implementation if it exists.
(function ($) {
  $.fn.on = $.fn.on || $.fn.bind;
  $.fn.off = $.fn.off || $.fn.unbind;
}(jQuery));
