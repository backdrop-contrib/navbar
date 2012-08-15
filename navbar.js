(function ($) {

Drupal.navbar = Drupal.navbar || {};

/**
 * Fix internal padding to the height of the navigation bar.
 */
Drupal.behaviors.navbar = {
  attach: function(context) {
    $('body').css('paddingTop', Drupal.navbar.height());
  }
};

Drupal.navbar.height = function() {
  return Drupal.navbar.heightOf('#navbar');
}

Drupal.navbar.drawerHeight = function() {
  return Drupal.navbar.heightOf('#navbar-drawer');
};

Drupal.navbar.heightOf = function(selector) {
  var $navbar = $(selector);
  var height = $navbar.outerHeight();
  // In modern browsers (including IE9), when box-shadow is defined, use the
  // normal height.
  var cssBoxShadowValue = $navbar.css('box-shadow');
  var boxShadow = (typeof cssBoxShadowValue !== 'undefined' && cssBoxShadowValue !== 'none');
  // In IE8 and below, we use the shadow filter to apply box-shadow styles to
  // the toolbar. It adds some extra height that we need to remove.
  if (!boxShadow && /DXImageTransform\.Microsoft\.Shadow/.test($navbar.css('filter'))) {
    height -= $navbar[0].filters.item("DXImageTransform.Microsoft.Shadow").strength;
  }
  return height;
};

})(jQuery);
