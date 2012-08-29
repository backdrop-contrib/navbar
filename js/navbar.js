(function ($) {

"use strict";

Drupal.navbar = Drupal.navbar || {};

/**
 * Attach toggling behavior and notify the overlay of the navbar.
 */
Drupal.behaviors.navbar = {
  attach: function(context, settings) {
    var $navbar = $(context).find('#navbar');
    var $bar = $navbar.find('.navbar-bar');
    var $tray = $navbar.find('.navbar-tray');
    var $toggle = $navbar.find('.navbar-toggle-tray');
    // Set the initial state of the navbar.
    $bar.once('navbar-bar', function (index, element) {
      var $navbar = $(this);
      $navbar.data('drupalNavbar', new Drupal.NavBar($navbar));
    });
    // Instantiate the navbar tray.
    $tray.once('navbar-slider', function (index, element) {
      var $tray = $(this);
      $tray.data('drupalNavbar', new Drupal.TraySlider($tray, $toggle));
    });
  }
};

Drupal.NavBar = function ($navbar) {
  this.$navbar = $navbar;
  this.labels;
  this.collapsed;
  // Init the object.
  this.init.apply(this, arguments);
};
/**
 *
 */
Drupal.NavBar.prototype.init = function() {
  // Labels
  this.labels = {
    'opened': Drupal.t('Hide shortcuts'),
    'closed': Drupal.t('Show shortcuts')
  };
  // Set up the navbar drawer visibility toggle.
  this.$toggle = this.$navbar.find('a.toggle');
  this.$toggle
  .on('click.DrupalNavbar', $.proxy(this, 'toggle'));
  // Store the shortcut bar drawer HTML element.
  this.$drawer = this.$navbar.find('.navbar-drawer');
  // Retrieve the collapsed status from a stored cookie.
  this.collapsed = $.cookie('Drupal.navbar.collapsed');
  // Expand or collapse the navbar based on the cookie value.
  if (this.collapsed === '1') {
    this.collapse();
  }
  else {
    this.expand();
  }
};
/**
 * Collapse the navbar.
 */
Drupal.NavBar.prototype.collapse = function() {
  var toggle_text = this.labels.closed;
  this.$drawer.addClass('collapsed');
  this.$toggle
  .removeClass('toggle-active')
  .attr('title',  toggle_text)
  .html(toggle_text);
  // Remove the class from the body that would indicate the drawer is open.
  $('body')
  .removeClass('navbar-drawer');
  // Set the height of the navbar.
  this.setHeight();
};

/**
 * Expand the navbar.
 */
Drupal.NavBar.prototype.expand = function() {
  var toggle_text = this.labels.opened;
  this.$drawer.removeClass('collapsed');
  this.$toggle
  .addClass('toggle-active')
  .attr('title',  toggle_text)
  .html(toggle_text);
  // Add a class to the body to indicate the drawer is open.
  $('body').addClass('navbar-drawer');
  // Set the height of the navbar.
  this.setHeight();
};

/**
 * Toggle the navbar.
 */
Drupal.NavBar.prototype.toggle = function(event) {
  event.preventDefault();
  if (this.collapsed === '1') {
    this.expand();
    this.collapsed = '0';
  }
  else {
    this.collapse();
    this.collapsed = '1';
  }
  // Store the drawer state in a cookie.
  $.cookie(
    'Drupal.navbar.collapsed',
    this.collapsed,
    {
      path: Drupal.settings.basePath,
      // The cookie should "never" expire.
      expires: 36500
    }
  );
};

Drupal.NavBar.prototype.setHeight = function() {
  this.height = this.$navbar.outerHeight();
  this.$navbar.attr('data-offset-top', this.height);
  // Alter the padding on the top of the body element.
  // @todo, this should be moved to drupal.js and register for
  // the offsettopchange event.
  $('body').css('paddingTop', this.height);
  $(document).trigger('offsettopchange');
};
/**
 *
 */
Drupal.TraySlider = function ($tray, $toggle) {
  this.$tray = $tray;
  this.$toggle = $toggle;
  this.state;
  this.width;
  this.maxWidth;
  // Init the object.
  this.init.apply(this, arguments);
};
/**
 *
 */
Drupal.TraySlider.prototype.init = function () {
  this.state = 'closed';
  this.maxWidth = 200;
  this.width = this.getWidth();
  // Place the menu off screen.
  this.$tray.css({
    'width': this.width,
    'left': this.width * -1
  });
  // Add a click handler to the toggle.
  this.$toggle
  .on('click.DrupalNavbar', $.proxy(this, 'toggle'));
  // Register for offsettopchange events.
  $(document)
  .on({
    // Offset value vas changed by a third party script.
    'offsettopchange.DrupalNavbar': $.proxy(this, 'displace')
  });
  this.displace();
};
/**
 *
 */
Drupal.TraySlider.prototype.toggle = function (event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  if (this.state === 'closed') {
    this.expand();
  }
  else {
    this.collapse();
  }
}
/**
 *
 */
Drupal.TraySlider.prototype.expand = function (event) {
  this.width = this.getWidth();
  this.$tray.animate({
    'width': this.width,
    'left': 0
  });
  $('body').animate({
    'padding-left': this.width
  });
  this.state = 'open';
};
/**
 *
 */
Drupal.TraySlider.prototype.collapse = function () {
  this.$tray.animate({
    'left': this.width * -1
  });
  $('body').animate({
    'padding-left': 0
  });
  this.state = 'closed';
};
/**
 *
 */
Drupal.TraySlider.prototype.displace = function (event) {
  this.$tray.css({
    'top': this.computeOffsetTop()
  });
};
/**
 * Sum all [data-offset-top] values and cache it.
 * @todo move this out of tableheader.js into a move generic place like drupal.js.
 */
Drupal.TraySlider.prototype.computeOffsetTop = function () {
  var $offsets = $('[data-offset-top]');
  var value, sum = 0;
  for (var i = 0, il = $offsets.length; i < il; i++) {
    value = parseInt($offsets[i].getAttribute('data-offset-top'), 10);
    sum += !isNaN(value) ? value : 0;
  }
  this.offsetTop = sum;
  return sum;
};
/**
 *
 */
Drupal.TraySlider.prototype.getWidth = function (event) {
  var maxClient = document.documentElement.clientWidth;
  var candidate = maxClient * 0.9;
  var width = (candidate > this.maxWidth) ? this.maxWidth : candidate;
  return width;
};


})(jQuery);
