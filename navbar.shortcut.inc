<?php
/**
 * @file
 * Allows users to manage customizable lists of shortcut links.
 */

/**
 * The name of the default shortcut set.
 *
 * This set will be displayed to any user that does not have another set
 * assigned, unless overridden by a hook_navbar_shortcut_default_set() implementation.
 */
define('NAVBAR_SHORTCUT_DEFAULT_SET_NAME', 'navbar-shortcut-set-1');


/**
 * Access callback for editing a shortcut set.
 *
 * @param object $shortcut_set
 *   (optional) The shortcut set to be edited. If not set, the current user's
 *   shortcut set will be used.
 *
 * @return
 *   TRUE if the current user has access to edit the shortcut set, FALSE
 *   otherwise.
 */
function navbar_shortcut_set_edit_access($shortcut_set = NULL) {
  return user_access('access navbar');
}

/**
 * Access callback for deleting a shortcut set.
 *
 * @param $shortcut_set
 *   The shortcut set to be deleted.
 *
 * @return
 *   TRUE if the current user has access to delete shortcut sets and this is
 *   not the site-wide default set; FALSE otherwise.
 */
function navbar_shortcut_set_delete_access($shortcut_set) {
  // Only admins can delete sets.
  if (!user_access('access navbar')) {
    return FALSE;
  }

  // Never let the default shortcut set be deleted.
  if ($shortcut_set->set_name == NAVBAR_SHORTCUT_DEFAULT_SET_NAME) {
    return FALSE;
  }

  return TRUE;
}

/**
 * Access callback for switching the shortcut set assigned to a user account.
 *
 * @param object $account
 *   (optional) The user account whose shortcuts will be switched. If not set,
 *   permissions will be checked for switching the logged-in user's own
 *   shortcut set.
 *
 * @return
 *   TRUE if the current user has access to switch the shortcut set of the
 *   provided account, FALSE otherwise.
 */
function navbar_shortcut_set_switch_access($account = NULL) {
  return user_access('access navbar');
}

/**
 * Access callback for editing a link in a shortcut set.
 */
function navbar_shortcut_link_access($menu_link) {
  // The link must belong to a shortcut set that the current user has access
  // to edit.
  if ($shortcut_set = navbar_shortcut_set_load($menu_link['menu_name'])) {
    return navbar_shortcut_set_edit_access($shortcut_set);
  }
  return FALSE;
}

/**
 * Loads the data for a shortcut set.
 *
 * @param $set_name
 *   The name of the shortcut set to load.
 *
 * @return object
 *   If the shortcut set exists, an object containing the following properties:
 *   - 'set_name': The internal name of the shortcut set.
 *   - 'title': The title of the shortcut set.
 *   - 'links': An array of links associated with this shortcut set.
 *   If the shortcut set does not exist, the function returns FALSE.
 */
function navbar_shortcut_set_load($set_name) {
  $set = db_select('navbar_shortcut_set', 'ss')
  ->fields('ss')
  ->condition('set_name', $set_name)
  ->execute()
  ->fetchObject();
  if (!$set) {
    return FALSE;
  }
  $set->links = menu_load_links($set_name);
  return $set;
}

/**
 * Saves a shortcut set.
 *
 * @param $shortcut_set
 *   An object containing the following properties:
 *   - 'title': The title of the shortcut set.
 *   - 'set_name': (optional) The internal name of the shortcut set. If
 *     omitted, a new shortcut set will be created, and the 'set_name' property
 *     will be added to the passed-in object.
 *   - 'links': (optional) An array of menu links to save for the shortcut set.
 *     Each link is an array containing at least the following keys (which will
 *     be expanded to fill in other default values after the shortcut set is
 *     saved):
 *     - 'link_path': The Backdrop path or external path that the link points to.
 *     - 'link_title': The title of the link.
 *     Any other keys accepted by menu_link_save() may also be provided.
 *
 * @return
 *   A constant which is either SAVED_NEW or SAVED_UPDATED depending on whether
 *   a new set was created or an existing one was updated.
 *
 * @see menu_link_save()
 */
function navbar_shortcut_set_save(&$shortcut_set) {
  // First save the shortcut set itself.
  if (isset($shortcut_set->set_name)) {
    $return = backdrop_write_record('navbar_shortcut_set', $shortcut_set, 'set_name');
  }
  else {
    $shortcut_set->set_name = navbar_shortcut_set_get_unique_name();
    $return = backdrop_write_record('navbar_shortcut_set', $shortcut_set);
  }
  // If links were provided for the set, save them.
  if (isset($shortcut_set->links)) {
    foreach ($shortcut_set->links as &$link) {
      // Do not specifically associate these links with the Navbar shortcut,
      // since other modules may make them editable via the menu system.
      // However, we do need to specify the correct menu name.
      $link['menu_name'] = $shortcut_set->set_name;
      $link['plid'] = 0;
      menu_link_save($link);
    }
    // Make sure that we have a return value, since if the links were updated
    // but the shortcut set was not, the call to backdrop_write_record() above
    // would not return an indication that anything had changed.
    if (empty($return)) {
      $return = SAVED_UPDATED;
    }
  }
  return $return;
}

/**
 * Deletes a shortcut set.
 *
 * Note that the default set cannot be deleted.
 *
 * @param $shortcut_set
 *   An object representing the shortcut set to delete.
 *
 * @return
 *   TRUE if the set was deleted, FALSE otherwise.
 */
function navbar_shortcut_set_delete($shortcut_set) {
  // Don't allow deletion of the system default shortcut set.
  if ($shortcut_set->set_name == NAVBAR_SHORTCUT_DEFAULT_SET_NAME) {
    return FALSE;
  }

  // First, delete any user assignments for this set, so that each of these
  // users will go back to using whatever default set applies.
  db_delete('navbar_shortcut_set_users')
    ->condition('set_name', $shortcut_set->set_name)
    ->execute();

  // Next, delete the menu links for this set.
  menu_delete_links($shortcut_set->set_name);

  // Finally, delete the set itself.
  $deleted = db_delete('navbar_shortcut_set')
    ->condition('set_name', $shortcut_set->set_name)
    ->execute();

  return (bool) $deleted;
}

/**
 * Resets the link weights in a shortcut set to match their current order.
 *
 * This function can be used, for example, when a new shortcut link is added to
 * the set. If the link is added to the end of the array and this function is
 * called, it will force that link to display at the end of the list.
 *
 * @param object $shortcut_set
 *   An object representing a shortcut set. The link weights of the passed-in
 *   object will be reset as described above.
 */
function navbar_shortcut_set_reset_link_weights(&$shortcut_set) {
  $weight = -50;
  foreach ($shortcut_set->links as &$link) {
    $link['weight'] = $weight;
    $weight++;
  }
}

/**
 * Assigns a user to a particular shortcut set.
 *
 * @param $shortcut_set
 *   An object representing the shortcut set.
 * @param $account
 *   A user account that will be assigned to use the set.
 */
function navbar_shortcut_set_assign_user($shortcut_set, $account) {
  db_merge('navbar_shortcut_set_users')
    ->key(array('uid' => $account->uid))
    ->fields(array('set_name' => $shortcut_set->set_name))
    ->execute();
  backdrop_static_reset('navbar_shortcut_current_displayed_set');
}

/**
 * Unassigns a user from any shortcut set they may have been assigned to.
 *
 * The user will go back to using whatever default set applies.
 *
 * @param $account
 *   A user account that will be removed from the shortcut set assignment.
 *
 * @return
 *   TRUE if the user was previously assigned to a shortcut set and has been
 *   successfully removed from it. FALSE if the user was already not assigned
 *   to any set.
 */
function navbar_shortcut_set_unassign_user($account) {
  $deleted = db_delete('navbar_shortcut_set_users')
    ->condition('uid', $account->uid)
    ->execute();
  return (bool) $deleted;
}

/**
 * Returns the current displayed shortcut set for the provided user account.
 *
 * @param $account
 *   (optional) The user account whose shortcuts will be returned. Defaults to
 *   the currently logged-in user.
 *
 * @return
 *   An object representing the shortcut set that should be displayed to the
 *   current user. If the user does not have an explicit shortcut set defined,
 *   the default set is returned.
 */
function navbar_shortcut_current_displayed_set($account = NULL) {
  $shortcut_sets = &backdrop_static(__FUNCTION__, array());
  global $user;
  if (!isset($account)) {
    $account = $user;
  }
  // Try to return a shortcut set from the static cache.
  if (isset($shortcut_sets[$account->uid])) {
    return $shortcut_sets[$account->uid];
  }
  // If none was found, try to find a shortcut set that is explicitly assigned
  // to this user.
  $query = db_select('navbar_shortcut_set', 's');
  $query->addField('s', 'set_name');
  $query->join('navbar_shortcut_set_users', 'u', 's.set_name = u.set_name');
  $query->condition('u.uid', $account->uid);
  $shortcut_set_name = $query->execute()->fetchField();
  if ($shortcut_set_name) {
    $shortcut_set = navbar_shortcut_set_load($shortcut_set_name);
  }
  // Otherwise, use the default set.
  else {
    $shortcut_set = navbar_shortcut_default_set($account);
  }

  $shortcut_sets[$account->uid] = $shortcut_set;
  return $shortcut_set;
}

/**
 * Returns the default shortcut set for a given user account.
 *
 * @param object $account
 *   (optional) The user account whose default shortcut set will be returned.
 *   If not provided, the function will return the currently logged-in user's
 *   default shortcut set.
 *
 * @return
 *   An object representing the default shortcut set.
 */
function navbar_shortcut_default_set($account = NULL) {
  global $user;
  if (!isset($account)) {
    $account = $user;
  }

  // Allow modules to return a default shortcut set name. Since we can only
  // have one, we allow the last module which returns a valid result to take
  // precedence. If no module returns a valid set, fall back on the site-wide
  // default, which is the lowest-numbered shortcut set.
  $suggestions = array_reverse(module_invoke_all('navbar_shortcut_default_set', $account));
  $suggestions[] = NAVBAR_SHORTCUT_DEFAULT_SET_NAME;
  foreach ($suggestions as $name) {
    if ($shortcut_set = navbar_shortcut_set_load($name)) {
      break;
    }
  }

  return $shortcut_set;
}

/**
 * Returns a unique, machine-readable shortcut set name.
 */
function navbar_shortcut_set_get_unique_name() {
  // Shortcut sets are numbered sequentially, so we keep trying until we find
  // one that is available. For better performance, we start with a number
  // equal to one more than the current number of shortcut sets, so that if
  // no shortcut sets have been deleted from the database, this will
  // automatically give us the correct one.
  $number = db_query("SELECT COUNT(*) FROM {navbar_shortcut_set}")->fetchField() + 1;
  do {
    $name = navbar_shortcut_set_name($number);
    $number++;
  } while ($shortcut_set = navbar_shortcut_set_load($name));
  return $name;
}

/**
 * Returns the name of a shortcut set, based on a provided number.
 *
 * All shortcut sets have names like "shortcut-set-N" so that they can be
 * matched with a properly-namespaced entry in the {menu_links} table.
 *
 * @param $number
 *   A number representing the shortcut set whose name should be retrieved.
 *
 * @return
 *   A string representing the expected shortcut name.
 */
function navbar_shortcut_set_name($number) {
  return "navbar-shortcut-set-$number";
}

/**
 * Returns an array of all shortcut sets, keyed by the set name.
 *
 * @return
 *   An array of shortcut sets. Note that only the basic shortcut set
 *   properties (name and title) are returned by this function, not the list
 *   of menu links that belong to the set.
 */
function navbar_shortcut_sets() {
  return db_select('navbar_shortcut_set', 'ss')
  ->fields('ss')
  ->execute()
  ->fetchAllAssoc('set_name');
}

/**
 * Check to see if a shortcut set with the given title already exists.
 *
 * @param $title
 *   Human-readable name of the shortcut set to check.
 *
 * @return
 *   TRUE if a shortcut set with that title exists; FALSE otherwise.
 */
function navbar_shortcut_set_title_exists($title) {
  return (bool) db_query_range('SELECT 1 FROM {navbar_shortcut_set} WHERE title = :title', 0, 1, array(':title' => $title))->fetchField();
}

/**
 * Determines if a path corresponds to a valid shortcut link.
 *
 * @param $path
 *   The path to the link.
 * @return
 *   TRUE if the shortcut link is valid, FALSE otherwise. Valid links are ones
 *   that correspond to actual paths on the site.
 *
 * @see menu_edit_item_validate()
 */
function navbar_shortcut_valid_link($path) {
  // Do not use URL aliases.
  $normal_path = backdrop_get_normal_path($path);
  if ($path != $normal_path) {
    $path = $normal_path;
  }
  // An empty path is valid too and will be converted to <front>.
  return (!url_is_external($path) && menu_get_item($path)) || empty($path) || $path == '<front>';
}

/**
 * Returns an array of shortcut links, suitable for rendering.
 *
 * @param $shortcut_set
 *   (optional) An object representing the set whose links will be displayed.
 *   If not provided, the user's current set will be displayed.
 * @return
 *   An array of shortcut links, in the format returned by the menu system.
 *
 * @see menu_tree()
 */
function navbar_shortcut_renderable_links($shortcut_set = NULL) {
  if (!isset($shortcut_set)) {
    $shortcut_set = navbar_shortcut_current_displayed_set();
  }
  return menu_tree($shortcut_set->set_name);
}

/**
 * Returns the sanitized title of a shortcut set.
 *
 * Deprecated. This function was previously used as a menu item title callback
 * but has been replaced by shortcut_set_title_callback() (which does not
 * sanitize the title, since the menu system does that automatically). In
 * Backdrop CMS, use that function for title callbacks, and call check_plain()
 * directly if you need a sanitized title. In Backdrop CMS, this function will be
 * restored as a title callback and therefore will no longer sanitize its
 * output.
 *
 * @param $shortcut_set
 *   An object representing the shortcut set, as returned by
 *   navbar_shortcut_set_load().
 */
function navbar_shortcut_set_title($shortcut_set) {
  return check_plain($shortcut_set->title);
}

/**
 * Returns the title of a shortcut set.
 *
 * Title callback for the editing pages for shortcut sets.
 *
 * @param $shortcut_set
 *   An object representing the shortcut set, as returned by
 *   navbar_shortcut_set_load().
 */
function navbar_shortcut_set_title_callback($shortcut_set) {
  return $shortcut_set->title;
}
