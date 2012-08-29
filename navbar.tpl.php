<?php

/**
 * @file
 * Default template for admin navbar.
 *
 * Available variables:
 * - $attributes: An instance of Attributes class that can be manipulated as an
 *    array and printed as a string.
 *    It includes the 'class' information, which includes:
 *   - navbar: The current template type, i.e., "theming hook".
 * - $navbar['navbar_user']: User account / logout links.
 * - $navbar['navbar_menu']: Top level management menu links.
 * - $navbar['navbar_drawer']: A place for extended navbar content.
 *
 * @see template_preprocess()
 * @see template_preprocess_navbar()
 */
?>
<nav id="navbar" role="navigation" class="<?php print $attributes['class']; ?> clearfix" <?php print $attributes; ?>>
  <div class="navbar-bar">
    <div class="navbar-menu clearfix">
      <?php print render($navbar['navbar_tray_toggle']); ?>
      <?php print render($navbar['navbar_home']); ?>
      <?php print render($navbar['navbar_user']); ?>
      <?php //print render($navbar['navbar_menu']); ?>
      <?php if ($navbar['navbar_drawer']):?>
        <?php print render($navbar['navbar_toggle']); ?>
      <?php endif; ?>
    </div>
    <?php print render($navbar['navbar_drawer']); ?>
  </div>

  <div class="navbar-tray">
    <div class="filter-search clearfix">
      <?php print render($navbar['navbar_filter']); ?>
      <span class="close"><?php print t('x'); ?></span>
    </div>
    <div class="tray-menu clearfix">
      <?php print render($navbar['navbar_menu']); ?>
    </div>
  </div>
</nav>
