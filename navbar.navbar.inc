<?php

/**
 * @file
 * Navbar hooks implemented by the Navbar module.
 */

/**
 * Implements hook_navbar().
 */
function navbar_navbar() {
  global $user;

  $items = array();
  $config = config('navbar.settings');
  $components = $config->get('components');
  $destination = backdrop_get_destination();

  // Provides a simple link to escape the administration area.
  $items['home'] = array(
    '#type' => 'navbar_item',
    'tab' => array(
      '#type' => 'link',
      '#title' => t('Back to site'),
      '#href' => '<front>',
      '#options' => array(
        'attributes' => array(
          'title' => t('Return to site content'),
          'class' => array(
            'navbar-icon',
            'navbar-icon-escape-admin',
            'element-hidden'
          ),
          'data-navbar-escape-admin' => NULL,
        ),
      ),
    ),
    '#weight' => -20,
  );

  // Retrieve the administration menu from the database.
  $tree = navbar_links_menu(admin_bar_tree('management'));

  // If no menu links exist because the user does not have access to any, then
  // don't render a menu tab.
  if (!empty($tree)) {
    // Rearrange the links before rendering.
    navbar_menu_rearrange_links($tree);

    // Add attributes to the links before rendering.
    navbar_menu_navigation_links($tree);

    $tree = navbar_menu_tree_build($tree);

    // Add links under 'Dashboard'.
    reset($tree);
    $first_key = key($tree);
    if ($tree[$first_key]['#title'] == 'Dashboard') {
      // Set 'Flush all caches' link.
      $tree[$first_key]['#below']['flush-cache'] = array(
        '#theme' => 'menu_link__management',
        '#title' => t('Flush all caches'),
        '#href' => 'admin_bar/flush-cache',
        '#access' => user_access('flush caches'),
        '#below' => array(),
        '#attributes' => array(
          'class' => array(
            '0' => 'leaf',
          ),
        ),
        '#localized_options' => array(
          'query' => $destination + array('token' => backdrop_get_token('admin_bar/flush-cache')),
          'alias' => TRUE,
          'attributes' => array(
            'id' => 'navbar-link-admin-dashboard-flush-cache',
            'title' => t('Flush all caches'),
            'class' => array(
              '0' => 'navbar-icon',
              '1' => 'navbar-icon-flush-cache',
            ),
          ),
        ),
        '#below' => array(
          '#sorted' => TRUE,
          '#depth' => 2,
          '#theme_wrappers' => array(
            '0' => 'menu_tree__management',
          ),
        ),
      );

      // Set submenu of the 'Flush all caches'.
      $caches = module_invoke_all('admin_bar_cache_info');
      asort($caches);
      $first_cache_key = key($caches);
      foreach ($caches as $name => $cache) {
        $tree[$first_key]['#below']['flush-cache']['#below'][$name] = array(
          '#theme' => 'menu_link__management',
          '#title' => $cache['title'],
          '#href' => 'admin_bar/flush-cache/' . $name,
          '#below' => array(),
          '#attributes' => array(
            'class' => array(
              '0' => 'leaf',
            ),
          ),
          '#localized_options' => array(
            'query' => $destination + array('token' => backdrop_get_token('admin_bar/flush-cache/' . $name)),
            'alias' => TRUE,
            'attributes' => array(
              'id' => 'navbar-link-admin-dashboard-flush-cache-' . $name,
              'title' => t('Flush cache') . ' ' . $name,
              'class' => array(
                '0' => 'navbar-icon',
                '1' => 'navbar-icon-flush-cache-' . $name,
              ),
            ),
          ),
        );
      }
      // First child of 'Flush all caches' gets 'first' class.
      $tree[$first_key]['#below']['flush-cache']['#below'][$first_cache_key]['#attributes']['class'][] = 'first';
      // Last child of 'Flush all caches' gets 'last' class.
      end($tree[$first_key]['#below']['flush-cache']['#below']);
      $last_below_key = key($tree[$first_key]['#below']['flush-cache']['#below']);
      $tree[$first_key]['#below']['flush-cache']['#below'][$last_below_key]['#attributes']['class'][] = 'last';

      // Add link to manually run cron.
      $tree[$first_key]['#below']['cron'] = array(
        '#theme' => 'menu_link__management',
        '#title' => t('Run cron'),
        '#href' => 'admin/reports/status/run-cron',
        '#access' => user_access('administer site configuration'),
        '#below' => array(),
        '#attributes' => array(
          'class' => array(
            '0' => 'leaf',
          ),
        ),
        '#localized_options' => array(
          'alias' => TRUE,
          'attributes' => array(
            'id' => 'navbar-link-admin-dashboard-cron',
            'title' => t('Run cron manually'),
            'class' => array(
              '0' => 'navbar-icon',
              '1' => 'navbar-icon-cron',
            ),
          ),
        ),
      );

      // Add link to run update.php.
      $tree[$first_key]['#below']['update'] = array(
        '#theme' => 'menu_link__management',
        '#title' => t('Run updates'),
        '#href' => base_path() . 'core/update.php',
        '#access' => $GLOBALS['user']->uid == 1 || settings_get('update_free_access') || user_access('administer software updates'),
        '#below' => array(),
        '#attributes' => array(
          'class' => array(
            '0' => 'leaf',
          ),
        ),
        '#localized_options' => array(
          'external' => TRUE,
          'alias' => TRUE,
          'attributes' => array(
            'id' => 'navbar-link-admin-dashboard-update',
            'title' => t('Run core/update.php'),
            'class' => array(
              '0' => 'navbar-icon',
              '1' => 'navbar-icon-update',
            ),
          ),
        ),
      );

      //Move the 'last' class.
      foreach ($tree[$first_key]['#below'] as $key => $value) {
        if (isset($tree[$first_key]['#below'][$key]['#attributes']['class'][0])) {
          if ($tree[$first_key]['#below'][$key]['#attributes']['class'][0] == 'last') {
            unset($tree[$first_key]['#below'][$key]['#attributes']['class'][0]);
          }
        }
      }
      end($tree[$first_key]['#below']);
      $last_below_key = key($tree[$first_key]['#below']);
      $tree[$first_key]['#below'][$last_below_key]['#attributes']['class'][] = 'last';
    }

    $menu = array(
      '#heading' => t('Administration menu'),
      'navbar_administration' => array(
        '#type' => 'container',
        '#prefix' => '<div id="navbar-mainmenu">',
        '#suffix' => '</div>',
        '#attributes' => array(
          'class' => array('navbar-menu-administration'),
        ),
        'administration_menu' => $tree,
      ),
    );

    // This flow is commented out until we figure out how to return a JSONP
    // response in Backdrop.
    //
    // To conserve bandwidth, we only include the top-level links in the HTML.
    // The subtrees are included in a JSONP script, cached by the browser. Here we
    // add that JSONP script. We add it as an external script, because it's a
    // Backdrop path, not a file available via a stream wrapper.
    // @see navbar_subtrees_jsonp()
    // $menu['navbar_administration']['#attached']['js'][url('navbar/subtrees/' . _navbar_get_subtree_hash())] = array('type' => 'external');
    // The administration element has a link that is themed to correspond to
    // a navbar tray. The tray contains the full administrative menu of the site.
    $items['administration'] = array(
      '#type' => 'navbar_item',
      'tab' => array(
        '#type' => 'link',
        '#title' => t('Manage'),
        '#href' => 'admin',
        '#options' => array(
          'attributes' => array(
            'title' => t('Admin menu'),
            'class' => array('navbar-icon', 'navbar-icon-menu',),
          ),
        ),
      ),
      'tray' => $menu,
      '#weight' => -15,
    );
  }

  if (!empty($components)) {
    // Add logout & user account links, or login link.
    if (module_exists('user') && in_array('navbar.user', $components)) {
      if ($user->uid) {
        $links = array(
          'account' => array(
            'title' => t('View profile'),
            'href' => 'user',
            'html' => TRUE,
            'attributes' => array(
              'title' => t('User account'),
            ),
          ),
          'logout' => array(
            'title' => t('Log out'),
            'href' => 'user/logout',
          ),
        );
      }
      else {
        $links = array(
          'login' => array(
            'title' => t('Log in'),
            'href' => 'user',
          ),
        );
      }

      $items['user'] = array(
        '#type' => 'navbar_item',
        'tab' => array(
          '#type' => 'link',
          '#title' => user_format_name($user),
          '#href' => 'user',
          '#options' => array(
            'attributes' => array(
              'title' => t('My account'),
              'class' => array('navbar-icon', 'navbar-icon-user',),
            ),
          ),
        ),
        'tray' => array(
          '#heading' => t('User account actions'),
          'user_links' => array(
            '#theme' => 'links__navbar_user',
            '#links' => $links,
            '#attributes' => array(
              'class' => array('navbar-menu', 'navbar-menu-user'),
            ),
          ),
        ),
        '#weight' => 100,
      );
    }

    // Add alert indicator. It is a notification badge.
    if (in_array('navbar.alert', $components) && user_access('administer site configuration')) {
      // Get Administration bar core module's alert indicator.
      $alert = admin_bar_links_alert();
      if (!empty($alert)) {
        $items['alert'] = array(
          '#type' => 'navbar_item',
          'tab' => array(
            '#type' => 'link',
            '#title' => $alert['alert']['#title'],
            '#href' => $alert['alert']['#href'],
            '#options' => array(
              'attributes' => array(
                'title' => $alert['alert']['#attributes']['title'],
              ),
              'html' => $alert['alert']['#options']['html'],
            ),
          ),
          '#weight' => 190,
          '#wrapper_attributes' => array(
            'class' => array('navbar-tools-alert', 'error-count'),
          ),
        );
      }
    }

    // Prepare an array for search bar and user counter.
    $items['right'] = array(
      '#type' => 'navbar_item',
      '#weight' => 200,
      '#wrapper_attributes' => array(
        'id' => 'navbar-tools',
        'class' => array('navbar-tools-right-block'),
      ),
    );

    // Add search bar.
    if (in_array('navbar.search', $components)) {
      $items['right']['tab']['search'] = array(
          '#prefix' => '<div class="navbar-tools-first-right-component"><ul class="dropdown"><li class="navbar-tools-search">',
          '#suffix' => '</li></ul></div>',
          '#type' => 'search',
          '#attributes' => array(
            'placeholder' => t('Menu search'),
            'autocomplete' => 'off',
            'autocorrect' => 'off',
            'autocapitalize' => 'off',
          ),
        );
    }

    // Add user counter.
    if (in_array('navbar.user_count', $components) && user_access('administer site configuration')) {
      // Get Administration bar core module's user counter.
      $counter = admin_bar_links_users();
      $items['right']['tab']['counter'] = array(
          '#prefix' => '<div class="navbar-tools-users navbar-tools-right-component">',
          '#suffix' => '</div>',
          '#type' => 'link',
          '#title' => $counter['user-counter']['#title'],
          '#description' => $counter['user-counter']['#description'],
          '#href' => $counter['user-counter']['#href'],
          '#options' => array(
            'attributes' => array(
              'title' => t('Current authenticated users.'),
            ),
          ),
        );
    }

    // If there aren't components on right side, remove $items['right']
    if (!isset($items['right']['tab'])) {
      unset($items['right']);
    }

    // Add a shortcuts tab.
    if (in_array('navbar.shortcut', $components)) {
      $links = navbar_shortcut_renderable_links();
      $shortcut_set = navbar_shortcut_current_displayed_set();
      $configure_link = NULL;
      if (navbar_shortcut_set_edit_access($shortcut_set)) {
        $configure_link = array(
          '#type' => 'link',
          '#title' => t('Edit shortcuts'),
          '#href' => 'admin/config/user-interface/navbar_shortcut/' . $shortcut_set->set_name,
          '#options' => array('attributes' => array('class' => array('edit-shortcuts'))),
        );
      }
      if (!empty($links) || !empty($configure_link)) {
        $items['shortcuts'] = array(
          '#type' => 'navbar_item',
          'tab' => array(
            '#type' => 'link',
            '#title' => t('Shortcuts'),
            '#href' => 'admin/config/user-interface/navbar_shortcut',
            '#options' => array(
              'attributes' => array(
                'title' => t('Shortcuts'),
                'class' => array('navbar-icon', 'navbar-icon-shortcut',),
              ),
            ),
          ),
          'tray' => array(
            '#heading' => t('User-defined shortcuts'),
            '#wrapper_attributes' => array(
              'class' => array('navbar-tray-shortcuts', 'navbar-menu-shortcuts'),
            ),
            'shortcuts' => $links,
            'configure' => $configure_link,
          ),
          '#weight' => -10,
        );
      }
    }
  }
  return $items;
}
