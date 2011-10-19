/* >>>>>>>>>> BEGIN __sc_chance.js */
if (typeof CHANCE_SLICES === 'undefined') var CHANCE_SLICES = [];CHANCE_SLICES = CHANCE_SLICES.concat([]);

/* >>>>>>>>>> BEGIN source/theme.js */
// deprecated
// Main Ace Theme
SC.LegacyTheme = SC.BaseTheme.create({
  name: 'legacy',
  description: "The old SproutCore Ace theme. Deprecated. Included for backwards-compatibility."
});

SC.Theme.addTheme(SC.LegacyTheme);

// for backwards-compatibility with apps that do not set their
// own default theme:
SC.defaultTheme = 'legacy';


/* >>>>>>>>>> BEGIN source/render_delegates/button.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("theme");
/**
  Renders and updates the HTML representation of a button.
*/
SC.LegacyTheme.buttonRenderDelegate = SC.RenderDelegate.create({
  className: 'button',
  
  /**
    Called when we need to create the HTML that represents the button.

    @param {SC.Object} dataSource the object containing the information on how to render the button
    @param {SC.RenderContext} context the render context instance
  */
  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var theme             = dataSource.get('theme'),
        minWidth          = dataSource.get('titleMinWidth'),
        toolTip           = dataSource.get('toolTip'),
        isSelected        = dataSource.get('isSelected'),
        isActive          = dataSource.get('isActive');

    var labelContent;

    context.setClass('icon', !!dataSource.get('icon') || 0);
    context.setClass('def', dataSource.get('isDefault') || 0);
    context.setClass('cancel', dataSource.get('isCancel') || 0);

    if (toolTip) {
      context.attr('title', toolTip);
      context.attr('alt', toolTip);
    }

    // addressing accessibility
    context.attr('aria-pressed', isActive);

    // Specify a minimum width for the inner part of the button.
    minWidth = (minWidth ? "style='min-width: " + minWidth + "px'" : '');
    context = context.push("<span class='sc-button-inner' " + minWidth + ">");

    // Create the inner label element that contains the text and, optionally,
    // an icon.
    context = context.begin('label').addClass('sc-button-label');
    
    // NOTE: we don't add the label class names because button styles its own label.
    theme.labelRenderDelegate.render(dataSource, context);
    context = context.end();
    
    context.push("</span>");

    if (dataSource.get('supportFocusRing')) {
      context.push('<div class="focus-ring">',
                    '<div class="focus-left"></div>',
                    '<div class="focus-middle"></div>',
                    '<div class="focus-right"></div></div>');
    }
  },

  /**
    Called when one or more display properties have changed and we need to
    update the HTML representation with the new values.

    @param {SC.Object} dataSource the object containing the information on how to render the button
    @param {SC.RenderContext} jquery the jQuery object representing the HTML representation of the button
  */
  update: function(dataSource, jquery) {
    this.updateSizeClassName(dataSource, jquery);

    var theme         = dataSource.get('theme'),
        isSelected    = dataSource.get('isSelected'),
        isActive      = dataSource.get('isActive');

    if (dataSource.get('isActive')) jquery.addClass('active');
    if (dataSource.get('isDefault')) jquery.addClass('default');
    if (dataSource.get('isCancel')) jquery.addClass('cancel');
    if (dataSource.get('icon')) jquery.addClass('icon');

    // addressing accessibility
    jquery.attr('aria-pressed', isActive);
    theme.labelRenderDelegate.update(dataSource, jquery.find('label'));
  }
  
});

/* >>>>>>>>>> BEGIN source/render_delegates/panel.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("theme");
SC.LegacyTheme.panelRenderDelegate = SC.RenderDelegate.create({
  className: 'panel',

  render: function(dataSource, context) {
    context.push(
      "<div class='middle'></div>",
      "<div class='top-left-edge'></div>",
      "<div class='top-edge'></div>",
      "<div class='top-right-edge'></div>",
      "<div class='right-edge'></div>",
      "<div class='bottom-right-edge'></div>",
      "<div class='bottom-edge'></div>",
      "<div class='bottom-left-edge'></div>",
      "<div class='left-edge'></div>"
    );
  },
  
  update: function() {
    // We never update child views. They get to do that on their own.
  }
});

/* >>>>>>>>>> BEGIN source/render_delegates/progress.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("theme");
SC.LegacyTheme.PROGRESS_ANIMATED_BACKGROUND_MATRIX = [];
SC.LegacyTheme.PROGRESS_OFFSET_RANGE = 24;

/**
  @class
  Renders and updates DOM representations of progress bars.
  
  Parameters
  --------------------------
  Expects these properties on the data source:
  
  - isIndeterminate
  - isRunning
  - isEnabled
  - value (from 0 to 1)
  
  There are a few other properties supported for backwards-compatibility
  with certain ProgressView implementations; these ProgressViews should
  be updated to match the new API. These properties will trigger deprecation
  warnings.
  
  Theme Constants
  -------------------------------------
  Note that, unlike render delegate parameters, which are mostly standardized,
  the theme constants can vary by the theme and the theme's method of rendering
  the control.
  
  - PROGRESS_ANIMATED_BACKGROUND_MATRIX: Set to the matrix used for 
    background image position for animation. 
    [1st image y-location, offset, total number of images]
  
  - PROGRESS_OFFSET_RANGE: The value of the progress inner offset range. 
    Should be the same as width of image. Default it to 24.
  
*/
SC.LegacyTheme.progressRenderDelegate = SC.RenderDelegate.create({
  className: 'progress',
  
  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var theme    = dataSource.get('theme'),
        valueMax = dataSource.get('maximum'),
        valueMin = dataSource.get('minimum'),
        valueNow = dataSource.get('ariaValue');
    
    var inner, animatedBackground, value = dataSource.get('value') * 100, 
        cssString, backPosition,
        isIndeterminate = dataSource.get('isIndeterminate'),
        isRunning = dataSource.get('isRunning'),
        isEnabled = dataSource.get('isEnabled'),
        offsetRange = theme.PROGRESS_OFFSET_RANGE,
        offset = (isIndeterminate && isRunning) ? 
                (Math.floor(Date.now()/75)%offsetRange-offsetRange) : 0;

    //addressing accessibility
    context.attr('aria-valuemax', valueMax);
    context.attr('aria-valuemin', valueMin);
    context.attr('aria-valuenow', valueNow);
    context.attr('aria-valuetext', valueNow);

    // offsetRange from dataSource only supported for backwards-compatibility
    if (dataSource.get('offsetRange')) {
      if (!this._hasGivenOffsetRangeDeprecationWarning) {
        console.warn(
          "The 'offsetRange' property for progressRenderDelegate is deprecated. " +
          "Please override the value on your theme, instead, by setting " +
          "its PROGRESS_OFFSET_RANGE property."
        );
      }
      this._hasGivenOffsetRangeDeprecationWarning = YES;
      
      offsetRange = dataSource.get('offsetRange');
    }
  
    var classNames = {
      'sc-indeterminate': isIndeterminate,
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 100)
    };
    
    // compute value for setting the width of the inner progress
    if (!isEnabled) {
      value = "0%" ;
    } else if (isIndeterminate) {
      value = "120%";
    } else {
      value = value + "%";
    }
    
    var classString = this._createClassNameString(classNames);
    context.push('<div class="sc-inner ', classString, '" style="width: ', 
                  value, ';left: ', offset, 'px;">',
                  '<div class="sc-inner-head">','</div>',
                  '<div class="sc-inner-tail"></div></div>',
                  '<div class="sc-outer-head"></div>',
                  '<div class="sc-outer-tail"></div>');
  },
  
  update: function(dataSource, $) {
    this.updateSizeClassName(dataSource, $);

    var theme    = dataSource.get('theme'),
        valueMax = dataSource.get('maximum'),
        valueMin = dataSource.get('minimum'),
        valueNow = dataSource.get('ariaValue');

    // make accessible
    $.attr('aria-valuemax', valueMax);
    $.attr('aria-valuemin', valueMin);
    $.attr('aria-valuenow', valueNow);
    $.attr('aria-valuetext', valueNow);

    var inner, value, cssString, backPosition,
        animatedBackground = theme.PROGRESS_ANIMATED_BACKGROUND_MATRIX,
        isIndeterminate = dataSource.get('isIndeterminate'),
        isRunning = dataSource.get('isRunning'),
        isEnabled = dataSource.get('isEnabled'),
        offsetRange = dataSource.get('offsetRange'),
        offset = (isIndeterminate && isRunning) ? 
                (Math.floor(Date.now()/75)%offsetRange-offsetRange) : 0;
  
    // compute value for setting the width of the inner progress
    if (!isEnabled) {
      value = "0%" ;
    } else if (isIndeterminate) {
      value = "120%";
    } else {
      value = (dataSource.get('value') * 100) + "%";
    }

    var classNames = {
      'sc-indeterminate': isIndeterminate,
      'sc-empty': (value <= 0),
      'sc-complete': (value >= 100)
    };
    
    $.setClass(classNames);
    inner = $.find('.sc-inner');
    
    // animatedBackground from dataSource only supported for backwards-compatibility
    if (dataSource.get('animatedBackgroundMatrix')) {
      if (!this._hasGivenAnimatedBackgroundDeprecationWarning) {
        console.warn(
          "The 'animatedBackgroundMatrix' property for progressRenderDelegate " +
          "is deprecated. Please override the value on your theme by setting " +
          "its PROGRESS_ANIMATED_BACKGROUND_MATRIX property."
        );
      }
      
      this._hasGivenAnimatedBackgroundDeprecationWarning = YES;
      
      animatedBackground = dataSource.get('animatedBackgroundMatrix');
    }
    
    if (!animatedBackground) {
      animatedBackground = theme.PROGRESS_ANIMATED_BACKGROUND_MATRIX;
    }
    
    cssString = "width: "+value+"; ";
    cssString = cssString + "left: "+offset+"px; ";
    if (animatedBackground.length === 3 ) {
      inner.css('backgroundPosition', '0px -'+ 
              (animatedBackground[0] + 
              animatedBackground[1]*this._currentBackground)+'px');
      if(this._currentBackground===animatedBackground[2]-1
         || this._currentBackground===0){
        this._nextBackground *= -1;
      }
      this._currentBackground += this._nextBackground;
      
      cssString = cssString + "backgroundPosition: "+backPosition+"px; ";
      //Instead of using css() set attr for faster perf.
      inner.attr('style', cssString);
    }else{
      inner.attr('style', cssString);
    }
  },
  
  
  _createClassNameString: function(classNames) {
    var classNameArray = [], key;
    for(key in classNames) {
      if(!classNames.hasOwnProperty(key)) continue;
      if(classNames[key]) classNameArray.push(key);
    }
    return classNameArray.join(" ");
  }
});

/* >>>>>>>>>> BEGIN source/render_delegates/slider.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
sc_require("theme");
/**
  Renders and updates the DOM representation of a slider.
  
  Parameters
  -------------------------
  Requires the following parameters:
  
  - value: a value from 0 to 1.
  - frame: containing the frame in which the slider is being drawn.
*/

SC.LegacyTheme.sliderRenderDelegate = SC.RenderDelegate.create({
  
  className: 'slider',
  
  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var blankImage  = SC.BLANK_IMAGE_URL,
        valueMax    = dataSource.get('maximum'),
        valueMin    = dataSource.get('minimum'),
        valueNow    = dataSource.get('ariaValue');

    //addressing accessibility
    context.attr('aria-valuemax', valueMax);
    context.attr('aria-valuemin', valueMin);
    context.attr('aria-valuenow', valueNow);
    context.attr('aria-valuetext', valueNow);
    context.attr('aria-orientation', 'horizontal');

    context.push('<span class="sc-inner">',
                  '<span class="sc-leftcap"></span>',
                  '<span class="sc-rightcap"></span>',
                  '<img src="', blankImage, 
                  '" class="sc-handle" style="left: ', dataSource.get('value'), '%" />',
                  '</span>');
  },
  
  update: function(dataSource, jquery) {
    this.updateSizeClassName(dataSource, jquery);

    var blankImage  = SC.BLANK_IMAGE_URL,
        valueMax    = dataSource.get('maximum'),
        valueMin    = dataSource.get('minimum'),
        valueNow    = dataSource.get('ariaValue');

    //addressing accessibility
    jquery.attr('aria-valuemax', valueMax);
    jquery.attr('aria-valuemin', valueMin);
    jquery.attr('aria-valuenow', valueNow);
    jquery.attr('aria-valuetext', valueNow);
    jquery.attr('aria-orientation', 'horizontal');

    if (dataSource.didChangeFor('sliderRenderDelegate', 'value')) {
      jquery.find(".sc-handle").css('left', dataSource.get('value') + "%");
    }

  }
  
});

/* >>>>>>>>>> BEGIN source/render_delegates/well.js */
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require("theme");
// the 'well'-styled container
SC.BaseTheme.wellRenderDelegate = SC.Object.create({
  className: 'well',
  
  render: function(dataSource, context) {
    context.push("<div class='top-left-edge'></div>",
      "<div class='top-edge'></div>",
      "<div class='top-right-edge'></div>",
      "<div class='right-edge'></div>",
      "<div class='bottom-right-edge'></div>",
      "<div class='bottom-edge'></div>",
      "<div class='bottom-left-edge'></div>",
      "<div class='left-edge'></div>",
      "<div class='content-background'></div>");
  },
  
  update: function() {

  }
});

