/**
 * Builds a nested accordion widget.
 *
 * Invoke on an HTML list element with the jQuery plugin pattern.
 * - For example, $('.menu').drupalNavbarMenu();
 */

(function ($, Drupal) {

"use strict";

/**
 * Store the open menu tray.
 */

  $.fn.drupalNavbarMenu = function (options) {

    var pathRegex = /^(?:\/)*(.*)/;
    var activeItem = Drupal.settings.basePath + Drupal.encodePath(pathRegex.exec(location.pathname)[1]);

    // Merge options onto defaults.
    var settings = $.extend({}, {
      twisties: true,
      activeTrail: true
    }, options);

    var ui = {
      'handleOpen': Drupal.t('Extend'),
      'handleClose': Drupal.t('Collapse')
    };
    /**
     * Handle clicks from the disclosure button on an item with sub-items.
     *
     * @param {Object} event
     *   A jQuery Event object.
     */
    function toggleClickHandler (event) {
      var $toggle = $(event.target).filter('.navbar-handle');
      if ($toggle.length) {
        var $item = $toggle.closest('li');
        // Toggle the list item.
        toggleList($item);
        // Close open sibling menus.
        var $openItems = $item.siblings().filter('.open');
        toggleList($openItems, false);
      }
    }
    /**
     * Toggle the open/close state of a list is a menu.
     *
     * @param {jQuery} $item
     *   The li item to be toggled.
     *
     * @param {Boolean} switcher
     *   A flag that forces toggleClass to add or a remove a class, rather than
     *   simply toggling its presence.
     */
    function toggleList ($item, switcher) {
      var $toggle = $item.children('.navbar-box').children('.navbar-handle');
      switcher = (typeof switcher !== 'undefined') ? switcher : !$item.hasClass('open');
      // Toggle the item open state.
      $item.toggleClass('open', switcher);
      // Twist the toggle.
      $toggle.toggleClass('open', switcher);
      // Adjust the toggle text.
      $toggle
        .find('.action')
        // Expand Structure, Collapse Structure
        .text((switcher) ?  ui.handleClose : ui.handleOpen);
    }
    /**
     * Wrap menu links is standardized markup.
     *
     * Items with sub-elements have a list toggle attached to them. Menu item
     * links and the corresponding list toggle are wrapped with in a div
     * classed with .navbar-box. The .navbar-box div provides a positioning
     * context for the item list toggle twisty.
     *
     * @param {jQuery} $menu
     *   The root of the menu to be initialized.
     */
    function processMenuLinks ($menu, settings) {
      // Initialize items and their links.
      $menu
        .find('li > a, li > span')
        .once('navbar-menu')
        .wrap('<div class="navbar-box">');
        // Add a handle to each list item if it has a menu.

      if (settings.twisties) {
        var options = {
          'class': 'navbar-icon navbar-handle',
          'action': ui.handleOpen,
          'text': ''
        };
        $menu
          .find('li')
          .each(function (index, element) {
            var $item = $(element);
            var $menus = $item.children('ul.menu').once('navbar-menu');
            if ($menus.length) {
              var $box = $item.children('.navbar-box');
              options.text = Drupal.t('@label', {'@label': $box.find('a').text()});
              $item
                .addClass('navbar-twisty')
                .children('.navbar-box')
                .append(Drupal.theme('navbarMenuItemToggle', options));
            }
          });
      }
    }
    /**
     * Adds a level class to each list based on its depth in the menu.
     *
     * This function is called recursively on each sub level of lists elements
     * until the depth of the menu is exhausted.
     *
     * @param {jQuery} $lists
     *   A jQuery object of ul elements.
     *
     * @param {Integer} level
     *   The current level number to be assigned to the list elements.
     */
    function markListLevels ($lists, level) {
      level = (!level) ? 1 : level;
      var $lis = $lists.children('li').addClass('level-' + level);
      $lists = $lis.children('ul');
      if ($lists.length) {
        markListLevels($lists, level + 1);
      }
    }
    /**
     * On page load, open the active menu item.
     *
     * Marks the trail of the active link in the menu back to the root of the
     * menu with .active-trail.
     *
     * @param {jQuery} $menu
     *   The root of the menu.
     */
    function openActiveItem ($menu) {
      var pathItem = $menu.find('a[href="' + location.pathname + '"]');
      if (pathItem.length && !activeItem) {
        activeItem = Drupal.encodePath(pathRegex.exec(location.pathname)[1]);
      }
      if (activeItem) {
        var $activeItem = $menu.find('a[href="' + activeItem + '"]').addClass('active');
        var $activeTrail = $activeItem.parentsUntil('.root', 'li').addClass('active-trail');
        toggleList($activeTrail, true);
      }
    }
    // Return the jQuery object.
    return this.each(function (selector) {
      var $menu = $(this);
      var rootNotProcessed = $menu.once('navbar-menu');
      if (rootNotProcessed.length) {
        $menu
          .addClass('root')
          .on('click.navbar', toggleClickHandler);
        markListLevels($menu);
        // Restore previous and active states.
        if (settings.activeTrail) {
          openActiveItem($menu);
        }
      }
      // Process components of the menu.
      processMenuLinks($menu, settings);
    });
  };

  /**
   * A toggle is an interactive element often bound to a click handler.
   *
   * @return {String}
   *   A string representing a DOM fragment.
   */
  Drupal.theme.navbarMenuItemToggle = function (options) {
    return '<button class="' + options['class'] + '"><span class="action">' + options.action + '</span><span class="label">' + options.text + '</span></button>';
  };

}(jQuery, Drupal));
