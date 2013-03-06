=== D8 to D7 backporting considerations

1. Change all instances of 'toolbar' to 'navbar'
1. Remove any PHP 'use' statements from the top of the navbar.module file.
1. Replace 'new Attribute()' with 'drupal_attributes()'
1. Implement hook_toolbar() on behalf of User and Shortcut modules.
?? 1. Remove references to the breakpoint module.
1. Change hook_library_info() to hook_library().
