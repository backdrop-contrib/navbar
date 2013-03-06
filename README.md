=== D8 to D7 backporting considerations

1. Change all instances of 'toolbar' to 'navbar'
1. Remove any PHP 'use' statements from the top of the navbar.module file.
1. Replace 'new Attribute()' with 'drupal_attributes()'
1. Implement hook_toolbar() on behalf of User and Shortcut modules.
?? 1. Remove references to the breakpoint module.
1. Change hook_library_info() to hook_library().
1. Remove the array('system', 'drupal') dependency from the navbar and navbar.menu libraries.
1. Add libraries for the matchemedia.js and debounce.js files from D8.
