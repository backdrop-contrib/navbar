(function($) {

/**
 * Apply the search bar functionality.
 */
Backdrop.behaviors.search = {

  attach: function (context, settings) {
    var $adminBar = $(document, '#navbar-bar');
    var $input = $adminBar.find('.admin-bar-search input');
    // Initialize the current search needle.
    var needle = $input.val();
    // Cache of all links that can be matched in the menu.
    var links;
    // Minimum search needle length.
    var needleMinLength = 2;
    // Append the results container.
    var $results = $('<div class="admin-bar-search-results" />').insertAfter($input.parent());

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
          links = buildSearchIndex($adminBar.find('.navbar-menu a'));
        }

        // Close any open items.
        $adminBar.find('li.highlight').trigger('mouseleave').removeClass('highlight');

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
        $adminBar.trigger('searchChanged');
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
        $result.data('original-link', $(this.element).parent());
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
        $adminBar.find('.active-search-item').removeClass('active-search-item');
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
    /*function highlightPathHandler(e, link) {
      if (link) {
        $adminBar.find('li.highlight').removeClass('highlight');
        var $original = $(link).data('original-link');
        var show = e.type === 'showPath';
        // Toggle an additional CSS class to visually highlight the matching link.
        $original.toggleClass('highlight', show);
        $original.trigger(show ? 'mouseenter' : 'mouseleave');
      }
    }*/

    /*function resetSearchDisplay(e) {
      $adminBar.find('#admin-bar-extra > li > ul > li:not(li.admin-bar-search)').css('display', '');
    }
    function updateSearchDisplay(e) {
      // Build the list of extra items to be hidden if in small window mode.
      var $hideItems = $adminBar.find('#admin-bar-extra > li > ul > li:not(li.admin-bar-search)').css('display', '');
      if ($results.children().length) {
        if ($adminBar.find('#admin-bar-extra').hasClass('dropdown')) {
          $hideItems.css('display', 'none');
        }
      }
    }*/

    // Attach showPath/hidePath handler to search result entries.
    $results.on('touchstart mouseenter focus blur', 'li', resultsHandler);
    // Hide the result list after a link has been clicked.
    $results.on('click', 'li', resultsClickHandler);
    // Attach hover/active highlight behavior to search result entries.
    //$adminBar.on('showPath hidePath', '.admin-bar-search-results li', highlightPathHandler);
    // Show/hide the extra parts of the menu on resize.
    //$adminBar.on('beforeResize', resetSearchDisplay);
    //$adminBar.on('afterResize searchChanged', updateSearchDisplay);
    // Attach the search input event handler.
    $input.bind('focus keyup search', keyupHandler);

    // Close search if clicking outside the menu.
    $(document).on('click', function (e) {
      if ($(e.target).closest($adminBar).length === 0) {
        $results.empty();
      }
    });
  }
};

/**
 * @} End of "defgroup admin_behaviors".
 */

})(jQuery);
