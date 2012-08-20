(function ($) {

Drupal.navbar = Drupal.navbar || {};

/**
 * Fix internal padding to the height of the navigation bar.
 */
Drupal.behaviors.navbar = {
  attach: function(context, settings) {
    // Offset the top padding of the body by the height of the navbar.
    $('body').once('navbar', function (index, element) {
      $(this).css({
        'padding-top': $('#navbar').outerHeight(true)
      });
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
