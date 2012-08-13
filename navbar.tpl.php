<?php

/**
 * @file
 * Default template for mobile friendly navigation toolbar.
 *
 * Available variables:
 * - $classes: String of classes that can be used to style contextually through
 *   CSS. It can be manipulated through the variable $classes_array from
 *   preprocess functions.
 *
 * Other variables:
 * - $classes_array: Array of html class attribute values. It is flattened
 *   into a string within the variable $classes.
 *
 * @see template_preprocess()
 * @see template_preprocess_navbar()
 */
?>
<div id="navbar" class="<?php print $classes; ?> clearfix">
  <div class="navbar-menu">
    <ul id="navbar-menu">
      <li class="home">
        <a href="<?php print url('<front>'); ?>">
          <span aria-hidden="true" data-icon="&#xe00e;"></span>
          <span class="home-link screen-reader-text"><?php print t('Home'); ?></span>
        </a>
      </li>
      <li class="administration">
        <a href="<?php print url('admin'); ?>">
          <span aria-hidden="true" data-icon="&#xe011;"></span>
          <span class="admin-link screen-reader-text"><?php print t('Administration'); ?></span>
        </a>
      </li>
    </ul>
    <ul id="navbar-user">
      <li class="account">
        <a href="<?php print url('user'); ?>">
          <span aria-hidden="true" data-icon="&#xe010;"></span>
          <span class="account-link screen-reader-text"><?php print check_plain($user->name); ?></span>
        </a>
      </li>
      <li class="pulldown">
        <a href="<?php print url('user'); ?>">
          <span aria-hidden="true" data-icon="&#xe024;"></span>
          <span class="pulldown-link screen-reader-text"><?php print t('More'); ?></span>
        </a>
      </li>
    </ul>
  </div>
</div>
