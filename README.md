Navbar
======

A very simple mobile friendly navigation toolbar. The Navbar module displays a bar containing top-level administrative components across the top of the screen or on left side.

In addition to providing deep-level responsive access into administrative functions without refreshing the page.
Navbar module has a drawer section where it displays links provided by other modules. The drawer can be hidden/shown by clicking on its corresponding tab.


Attention
---------

The Navbar module is incompatible with Backdrop core's Administration bar module. Administration bar is suppressed if the Navbar module is enabled.


Installation
------------

Install this module using the official Backdrop CMS instructions at
  https://backdropcms.org/guide/modules


3rd party JavaScript libraries
------------------------------

The Navbar module depends on several third party JavaScript libraries, which included in 'js' directory:
- [Backbone](http://backbonejs.org/) (version >= 1.0.0)
- [Underscore](http://underscorejs.org/) (version >=1.5.0)
- Modernizr: [preconfigured version of Modernizr](http://modernizr.com/download/#-inputtypes-svg-touchevents-cssclasses-addtest-teststyles-prefixes-elem_details). Configuration:
  - Input Types (HTML5)
  - SVG (Misc.)
  - Touch Events (Misc.)
  - Add CSS Classes (Extra)
  - Modernizr.addTest (Extensibility)
  - Modernizr.testStyles (Extensibility)
  - Modernizr._prefixes (Extensibility)
  - elem-details (Non-core detects)


Application programming interface (API)
---------------------------------------

You can integrate your custom module's links in Navbar toolbar. See 'navbar.api.php'


Including styling assets for a menu item
----------------------------------------

If you add a top-level menu item that requires an associated icon, you can add the styling assets to the page with hook_navbar. Follow this example.
```php
function workbench_navbar() {
  $items['workbench'] = array(
    '#attached' => array(
      'css' => array(drupal_get_path('module', 'workbench') . '/workbench.navbar.icons.css'),
    ),
  );
  return $items;
}
```


Icons
-----

The toolbar uses the SVG icons designed by ry5n: [https://github.com/ry5n/libricons](https://github.com/ry5n/libricons)  
Recommended application for create an icon: [Inkscape](https://inkscape.org/)  
Set the page size to 16x16px (Inkscape: File -> Document Properties -> Width: 16, Height: 16, Units: px)


Issues
------

Bugs and Feature requests should be reported in the Issue Queue:
https://github.com/backdrop-contrib/navbar/issues


Current Maintainers
-------------------

- Attila Vasas (https://github.com/vasasa).


Credits
-------

- Ported to Backdrop CMS by Attila Vasas (https://github.com/vasasa).
- Originally written for Drupal by Jesse Beach (https://www.drupal.org/u/jessebeach).


License
-------

This project is GPL v2 software. See the LICENSE.txt file in this directory for
complete text.


Screenshots
-----------
Vertical orientation of Navbar:
![Vertical orientation of Navbar](https://gitlab.com/VasasA/jegyzet/blob/master/screenshot-vertical.png)

Horizontal orientation of Navbar:
![Horizontal orientation of Navbar](https://gitlab.com/VasasA/jegyzet/blob/master/screenshot-horizontal.png)
