
var STATIC = 0;
var TOP_ANCHOR = 1;
var BOTTOM_ANCHOR = 2;

var SIDEBAR_TOP_OFFSET = 8;

function AnchoredSidebar($element, centerOffset) {
  this.$element = $element;

  // actually if there's enough room in viewport for entire sidebar it should be top anchored
  this.state = STATIC;
  this.staticPosition = 0;
  this.centerOffset = centerOffset;
}

AnchoredSidebar.prototype.getTopAndBottom = function() {
  var top = this.staticPosition;
  var bottom = top + this.$element.outerHeight();

  return {
    top: top,
    bottom: bottom
  };
};

AnchoredSidebar.prototype.getScrollTopAndBottom = function() {
  var top = $(document).scrollTop();
  var bottom = top + $(window).height();

  return {
    top: top,
    bottom: bottom
  }
};

AnchoredSidebar.prototype.updateDOM = function() {
  requestAnimationFrame(function() {
    var isStatic = this.state === STATIC;

    var top = '';

    if (this.state === TOP_ANCHOR) {
      top = SIDEBAR_TOP_OFFSET;
    } else if (this.state === STATIC && this.staticPosition) {
      top = this.staticPosition;
    }

    this.$element.css({
      position: isStatic ? 'relative' : 'fixed',
      bottom: this.state === BOTTOM_ANCHOR ? SIDEBAR_TOP_OFFSET : '',
      top: top,
      left: isStatic ? '' : '50%',
      marginLeft: isStatic ? '' : this.centerOffset
    });
  }.bind(this));
};

AnchoredSidebar.prototype.onScroll = function() {
  var position = this.getTopAndBottom();
  var scrollPosition = this.getScrollTopAndBottom();

  if (this.state === STATIC) {
    // offsets
    if (scrollPosition.bottom > position.bottom + 2 * SIDEBAR_TOP_OFFSET) {
      // anchor bottom
      console.log("Anchoring to bottom");

      this.state = BOTTOM_ANCHOR;
      this.updateDOM();
    } else if (scrollPosition.top < position.top) {
      // anchor to the top
      console.log("Anchoring to top");

      this.state = TOP_ANCHOR;
      this.updateDOM();
    }

  } else if (this.state === TOP_ANCHOR) {
    if (scrollPosition.top > this.lastScrollTop) {
      // unanchor
      console.log("Unanchoring from top");

      this.staticPosition = scrollPosition.top - SIDEBAR_TOP_OFFSET;

      this.state = STATIC;
      this.updateDOM();
    }
  } else if (this.state == BOTTOM_ANCHOR) {
    if (scrollPosition.top < this.lastScrollTop) {
      // unanchor
      console.log("Unanchoring from bottom");

      this.staticPosition = scrollPosition.bottom - this.$element.height() - 2 * SIDEBAR_TOP_OFFSET;

      this.state = STATIC;
      this.updateDOM();
    }
  }

  this.lastScrollTop = scrollPosition.top;
};

AnchoredSidebar.prototype.attach = function() {
  this.lastScrollTop = $(document).scrollTop();

  this.boundOnScroll = this.onScroll.bind(this);

  $(document).on('scroll', this.boundOnScroll);
};

AnchoredSidebar.prototype.unattach = function() {
  $(document).off('scroll', this.boundOnScroll);
};

new AnchoredSidebar($('.js-anchoredSidebar'), -600).attach();
new AnchoredSidebar($('.js-anchoredSidebarRight'), 283).attach();