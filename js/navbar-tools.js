(function($) {

/**
 * Apply the search bar functionality.
 */
Backdrop.behaviors.search = {

  attach: function (context, settings) {
    var $navBar = $(context).find('#navbar-administration');
    var $input = $navBar.find('.navbar-tools-search input');
    // Initialize the current search needle.
    var needle = $input.val();
    // Cache of all links that can be matched in the menu.
    var links;
    // Minimum search needle length.
    var needleMinLength = 2;
    // Append the results container.
    var $results = $('<div class="navbar-tools-search-results" />').insertAfter($input.parent());
    // Store highlighted menu link.
    var $before;
    // Determine the object of Navbar main menu.
    var $mainMenu = $(context).find('#navbar-mainmenu');
    // Determine the object of Navbar tray menu.
    var $itemTray = $(context).find('#navbar-item--2-tray');

    /**
     * Executes the search upon user input.
     */
    function keyupHandler(e) {
      var matches, $html, value = $(this).val();

      // Only proceed if the search needle has changed.
      if (value !== needle || e.type === 'focus') {
        needle = value;
        // Initialize the cache of menu links upon first search.
        if (!links && needle.length >= needleMinLength) {
          links = buildSearchIndex($navBar.find('.navbar-menu a'));
        }

        // Close any open items.
        $navBar.find('li.highlight').trigger('mouseleave').removeClass('highlight');

        // Empty results container when deleting search text.
        if (needle.length < needleMinLength) {
          $results.empty();
        }
        // Only search if the needle is long enough.
        if (needle.length >= needleMinLength && links) {
          matches = findMatches(needle, links);
          // Build the list in a detached DOM node.
          $html = buildResultsList(matches);
          // Display results.
          $results.empty().append($html);
        }
        $navBar.trigger('searchChanged');
      }
    }

    /**
     * Builds the search index.
     */
    function buildSearchIndex($links) {
      return $links
        .map(function () {
          var text = (this.textContent || this.innerText);
          // Skip menu entries that do not contain any text (e.g., the icon).
          if (typeof text === 'undefined') {
            return;
          }
          return {
            text: text,
            textMatch: text.toLowerCase(),
            element: this
          };
        });
    }

    /**
     * Searches the index for a given needle and returns matching entries.
     */
    function findMatches(needle, links) {
      var needleMatch = needle.toLowerCase();
      // Select matching links from the cache.
      return $.grep(links, function (link) {
        return link.textMatch.indexOf(needleMatch) !== -1;
      });
    }

    /**
     * Builds the search result list in a detached DOM node.
     */
    function buildResultsList(matches) {
      var $html = $('<ul class="dropdown" />');
      $.each(matches, function () {
        var result = this.text;
        var $element = $(this.element);

        // Check whether there is a parent category that can be prepended.
        var $category = $element.parent().parent().parent().parent().children();
        var categoryText = $category.find('> a').text();
        if ($category.length && categoryText) {
          result = categoryText + ': ' + result;
        }

        var $result = $('<li><a href="' + $element.attr('href') + '">' + result + '</a></li>');
        $result.data('original-link', $(this.element).parent().parent());
        $html.append($result);
      });
      return $html;
    }

    /**
     * Highlights selected result.
     */
    function resultsHandler(e) {
      var $this = $(this);
      var show = e.type === 'mouseenter' || e.type === 'focusin' || e.type === 'touchstart';
      // Supress the normal click handling on first touch, only highlighting.
      if (e.type === 'touchstart' && !$(this).hasClass('active-search-item')) {
        e.preventDefault();
      }
      if (show) {
        $navBar.find('.active-search-item').removeClass('active-search-item');
        $(this).addClass('active-search-item');
      }
      else {
        $(this).removeClass('active-search-item');
      }
      $this.trigger(show ? 'showPath' : 'hidePath', [this]);
    }

    /**
     * Closes the search results and clears the search input.
     */
    function resultsClickHandler(e, link) {
      var $original = $(this).data('original-link');
      $original.trigger('mouseleave');
      $input.val('').trigger('keyup');
    }

    /**
     * Shows the link in the menu that corresponds to a search result.
     */
    function highlightPathHandler(e, link) {
      // Initialize $before.
      if ((typeof $before == "undefined" || $before == null) && typeof $navBar.find('.open li').get(0) != "undefined") {
        $before = $navBar.find('.open li');
      }
      if (link) {
        $navBar.find('li.highlight').removeClass('highlight');
        var $original = $(link).data('original-link');
        var show = e.type === 'showPath';
        // Toggle an additional CSS class to visually highlight the matching link.
        hideMenu(true);
        if (show) {
          displayMenu($original);
          $before = $original;
        }
      }
    }

    /**
     * Insert 'display: block !important;' style and 'open' class
     * into the elements of menu path recursively.
     */
    function displayChain($original) {
      var navbarOrientation = Backdrop.navbar.models.navbarModel.get('orientation');

      // Add 'open' class to the closest <li> ancestor of the <a> link.
      $original.addClass('open');
      // Add 'open' class to the arrow button of <a> link.
      if (navbarOrientation == 'vertical' && $original.find('button')) {
        $original.find('button').first().addClass('open');
      }
      // Insert 'display: block !important;' style to the closest
      // <ul> ancestor of the <li>.
      $original.parent().attr('style', 'display: block !important;');
      // Repeat the function at ancestor of the menu link recursively.
      // .is('ul') doesn't work properly.
      if ($original.parent().parent().parent().get(0).tagName == 'UL') {
        displayChain($original.parent().parent());
      }
    }

    /**
     * Display menu link with its path.
     *
     * param $original
     *   The closest <li> ancestor of the <a> link.
     */
    function displayMenu($original) {
      var navbarOrientation = Backdrop.navbar.models.navbarModel.get('orientation');

      if (navbarOrientation == 'vertical') {
        // Underline selected menu link
        $original.find('a').first().attr('style', 'text-decoration: underline;');
        if ($original.parent().parent().parent().get(0).tagName == 'UL') {
          displayChain($original.parent().parent());
        }
      }
      else {
        displayChain($original);
      }
    }

    /**
     * Remove 'display: block !important;' style from elements of
     * the menu path recursively.
     */
    function hideChain($alink) {
      $alink.removeAttr('style');
      // Repeat the function at ancestor of the menu link recursively.
      if ($alink.parent().parent().get(0).tagName == 'UL') {
        hideChain($alink.parent().parent());
      }
    }

    /**
     * Hide highlighted menu link with its path.
     */
    function hideMenu(mouseInResultsList) {
      var navbarOrientation = Backdrop.navbar.models.navbarModel.get('orientation');

      if (typeof $before != "undefined" && $before != null && (navbarOrientation == 'horizontal' || mouseInResultsList)) {
        // Close all opened menu link.
        $navBar.find('.open').removeClass('open');
        // Remove underline from link.
        if (navbarOrientation == 'vertical') {
          $before.find('a').first().removeAttr('style');
        }
        // Remove 'display: block !important;'.
        hideChain($before.parent());
      }
    }

    /**
     * Event handler on links.
     */
    function hideMenuEvent(e) {
      if (e.type == 'click'  && typeof $before != "undefined" && $before != null) {
        hideChain($before.parent());
      }
      else {
        // On mouseenter event.
        hideMenu(false);
      }
    }

    // Attach showPath/hidePath handler to search result entries.
    $results.on('touchstart mouseenter focus blur', 'li', resultsHandler);
    // Hide the result list after a link has been clicked.
    $results.on('click', 'li', resultsClickHandler);
    // Attach hover/active highlight behavior to search result entries.
    $navBar.on('showPath hidePath', '.navbar-tools-search-results li', highlightPathHandler);
    // Attach the search input event handler.
    $input.bind('focus keyup search', keyupHandler);
    // Hide menu links.
    $mainMenu.on('mouseenter click', 'ul', hideMenuEvent);

    // Close search if clicking outside the menu.
    $(document).on('click', function (e) {
      if ($(e.target).closest($navBar).length === 0) {
        $results.empty();
        hideMenu(false);
      }
    });
  }
};

/**
 * @} End of "defgroup admin_behaviors".
 */

})(jQuery);
