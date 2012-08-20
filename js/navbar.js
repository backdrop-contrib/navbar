(function ($) {

Drupal.navbar = Drupal.navbar || {};

/**
 * Fix internal padding to the height of the navigation bar.
 */
Drupal.behaviors.navbar = {
  attach: function(context) {
    var $bar = $('#navbar');
    var $drawer = $('#navbar-drawer');
    var barHeight = $bar.outerHeight()
    var drawerHeight = $drawer.outerHeight();
    $('body').css({
      'padding-top': barHeight + drawerHeight
    });
    $drawer.css({
      'top': barHeight
    });
    // The following code is just for demo. Please rip it out fast.
    $('#admin-toolbar ul.drilldown-active-menu li').once('navbar-menu-items', function (index, element) {
      $(this).prepend(
        $('<span>', {
          'class': 'navbar-icon'
        })
      );
    });
  }
};
})(jQuery);
