/* >>>>>>>>>> BEGIN source/core.js */
// ==========================================================================
// LinkIt
// ==========================================================================

/*globals LinkIt*/

/** @class

  This is the grouping where all utility functions will live

  @extends SC.Object
  @author Evin Grano
  @version: 0.1
*/
window.LinkIt = SC.Object.create({

  // CONST
  ROUND: 'round',
  
  FORWARD: 'forward',
  REVERSE: 'reverse',
  
  // Drag Types
  OUTPUT_TERMINAL: 'LinkIt.TerminalOutput',
  INPUT_TERMINAL: 'LinkIt.TerminalInput',
  
  // Respond to Linking
  NEVER: 'never',
  DIRECTIONAL: 'dir',
  INVERSE_DIRECTIONAL: 'idir',
  ALWAYS: 'always',
  
  // Terminals Drop State
  INVITE: 'invite',
  ACCEPT: 'accept',
  
  // Line Styling
  HORIZONTAL_CURVED: 'hcurved',
  VERTICAL_CURVED: 'vcurved',
  STRAIGHT: 'straight',
  PIPES: 'pipes',
  
  /**
    See log() method below.  For development purposes, many methods in LinkIt
    log messages to LinkIt.log() instead of console.log() to give us a central place
    to turn console messages on/off.  LinkIt.log() checks this setting prior to
    logging the messages to the console.
  */
  logToConsole: YES,
  
  /**  
    Utility Functions
  */
  getLayer: function(view){
    if (view.kindOf(LinkIt.CanvasView)) {
      return view;
    }
    else {
      var parent = view.get('parentView');
      if (parent) {
        return this.getLayer(parent);
      }
      else {
        LinkIt.log('Error: No layer to be found!');
      }
    }
    return null;
  },
  
  getContainer: function(view){
    if (view.kindOf(LinkIt.NodeContainerView)) {
      return view;
    }
    else {
      var parent = view.get('parentView');
      if (parent) {
        return this.getContainer(parent);
      }
      else {
        LinkIt.log('Error: No Container To Be Found!');
      } 
    }
    return null;
  },
  
  genLinkID: function(link) {
    if (link) {
      var startNode = link.get('startNode');
      var startTerm = link.get('startTerminal');
      var endNode = link.get('endNode');
      var endTerm = link.get('endTerminal');
      var startID = [SC.guidFor(startNode), startTerm].join('_');
      var endID = [SC.guidFor(endNode), endTerm].join('_');
      return (startID < endID) ? [startID, endID].join('_') : [endID, startID].join('_');
    }
    return '';
  },
  
  /**
    Many LinkIt methods call here to log to the console so that we have a central
    place for turning console logging on/off.  For debugging purposes.
  */
  log: function(message) {
    if (this.logToConsole) {
      console.log(message);
    }
  }
  
});


/* >>>>>>>>>> BEGIN source/libs/excanvas.js */
// Copyright 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


// Known Issues:
//
// * Patterns are not implemented.
// * Radial gradient are not implemented. The VML version of these look very
//   different from the canvas one.
// * Clipping paths are not implemented.
// * Coordsize. The width and height attribute have higher priority than the
//   width and height style values which isn't correct.
// * Painting mode isn't implemented.
// * Canvas width/height should is using content-box by default. IE in
//   Quirks mode will draw the canvas using border-box. Either change your
//   doctype to HTML5
//   (http://www.whatwg.org/specs/web-apps/current-work/#the-doctype)
//   or use Box Sizing Behavior from WebFX
//   (http://webfx.eae.net/dhtml/boxsizing/boxsizing.html)
// * Non uniform scaling does not correctly scale strokes.
// * Optimize. There is always room for speed improvements.

// Only add this code if we do not already have a canvas implementation
if (!document.createElement('canvas').getContext) {

(function() {

  // alias some functions to make (compiled) code shorter
  var m = Math;
  var mr = m.round;
  var ms = m.sin;
  var mc = m.cos;
  var abs = m.abs;
  var sqrt = m.sqrt;

  // this is used for sub pixel precision
  var Z = 10;
  var Z2 = Z / 2;

  /**
   * This funtion is assigned to the <canvas> elements as element.getContext().
   * @this {HTMLElement}
   * @return {CanvasRenderingContext2D_}
   */
  function getContext() {
    return this.context_ ||
        (this.context_ = new CanvasRenderingContext2D_(this));
  }

  var slice = Array.prototype.slice;

  /**
   * Binds a function to an object. The returned function will always use the
   * passed in {@code obj} as {@code this}.
   *
   * Example:
   *
   *   g = bind(f, obj, a, b)
   *   g(c, d) // will do f.call(obj, a, b, c, d)
   *
   * @param {Function} f The function to bind the object to
   * @param {Object} obj The object that should act as this when the function
   *     is called
   * @param {*} var_args Rest arguments that will be used as the initial
   *     arguments when the function is called
   * @return {Function} A new function that has bound this
   */
  function bind(f, obj, var_args) {
    var a = slice.call(arguments, 2);
    return function() {
      return f.apply(obj, a.concat(slice.call(arguments)));
    };
  }

  var G_vmlCanvasManager_ = {
    init: function(opt_doc) {
      if (/MSIE/.test(navigator.userAgent) && !window.opera) {
        var doc = opt_doc || document;
        // Create a dummy element so that IE will allow canvas elements to be
        // recognized.
        doc.createElement('canvas');
        doc.attachEvent('onreadystatechange', bind(this.init_, this, doc));
      }
    },

    init_: function(doc) {
      // create xmlns
      if (!doc.namespaces['g_vml_']) {
        doc.namespaces.add('g_vml_', 'urn:schemas-microsoft-com:vml',
                           '#default#VML');

      }
      if (!doc.namespaces['g_o_']) {
        doc.namespaces.add('g_o_', 'urn:schemas-microsoft-com:office:office',
                           '#default#VML');
      }

      // Setup default CSS.  Only add one style sheet per document
      if (!doc.styleSheets['ex_canvas_']) {
        var ss = doc.createStyleSheet();
        ss.owningElement.id = 'ex_canvas_';
        ss.cssText = 'canvas{display:inline-block;overflow:hidden;' +
            // default size is 300x150 in Gecko and Opera
            'text-align:left;width:300px;height:150px}' +
            'g_vml_\\:*{behavior:url(#default#VML)}' +
            'g_o_\\:*{behavior:url(#default#VML)}';

      }

      // find all canvas elements
      var els = doc.getElementsByTagName('canvas');
      for (var i = 0; i < els.length; i++) {
        this.initElement(els[i]);
      }
    },

    /**
     * Public initializes a canvas element so that it can be used as canvas
     * element from now on. This is called automatically before the page is
     * loaded but if you are creating elements using createElement you need to
     * make sure this is called on the element.
     * @param {HTMLElement} el The canvas element to initialize.
     * @return {HTMLElement} the element that was created.
     */
    initElement: function(el) {
      if (!el.getContext) {

        el.getContext = getContext;

        // Remove fallback content. There is no way to hide text nodes so we
        // just remove all childNodes. We could hide all elements and remove
        // text nodes but who really cares about the fallback content.
        el.innerHTML = '';

        // do not use inline function because that will leak memory
        el.attachEvent('onpropertychange', onPropertyChange);
        el.attachEvent('onresize', onResize);

        var attrs = el.attributes;
        if (attrs.width && attrs.width.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setWidth_(attrs.width.nodeValue);
          el.style.width = attrs.width.nodeValue + 'px';
        } else {
          el.width = el.clientWidth;
        }
        if (attrs.height && attrs.height.specified) {
          // TODO: use runtimeStyle and coordsize
          // el.getContext().setHeight_(attrs.height.nodeValue);
          el.style.height = attrs.height.nodeValue + 'px';
        } else {
          el.height = el.clientHeight;
        }
        //el.getContext().setCoordsize_()
      }
      return el;
    }
  };

  function onPropertyChange(e) {
    var el = e.srcElement;

    switch (e.propertyName) {
      case 'width':
        el.style.width = el.attributes.width.nodeValue + 'px';
        el.getContext().clearRect();
        break;
      case 'height':
        el.style.height = el.attributes.height.nodeValue + 'px';
        el.getContext().clearRect();
        break;
    }
  }

  function onResize(e) {
    var el = e.srcElement;
    if (el.firstChild) {
      el.firstChild.style.width =  el.clientWidth + 'px';
      el.firstChild.style.height = el.clientHeight + 'px';
    }
  }

  G_vmlCanvasManager_.init();

  // precompute "00" to "FF"
  var dec2hex = [];
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 16; j++) {
      dec2hex[i * 16 + j] = i.toString(16) + j.toString(16);
    }
  }

  function createMatrixIdentity() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];
  }

  function matrixMultiply(m1, m2) {
    var result = createMatrixIdentity();

    for (var x = 0; x < 3; x++) {
      for (var y = 0; y < 3; y++) {
        var sum = 0;

        for (var z = 0; z < 3; z++) {
          sum += m1[x][z] * m2[z][y];
        }

        result[x][y] = sum;
      }
    }
    return result;
  }

  function copyState(o1, o2) {
    o2.fillStyle     = o1.fillStyle;
    o2.lineCap       = o1.lineCap;
    o2.lineJoin      = o1.lineJoin;
    o2.lineWidth     = o1.lineWidth;
    o2.miterLimit    = o1.miterLimit;
    o2.shadowBlur    = o1.shadowBlur;
    o2.shadowColor   = o1.shadowColor;
    o2.shadowOffsetX = o1.shadowOffsetX;
    o2.shadowOffsetY = o1.shadowOffsetY;
    o2.strokeStyle   = o1.strokeStyle;
    o2.globalAlpha   = o1.globalAlpha;
    o2.arcScaleX_    = o1.arcScaleX_;
    o2.arcScaleY_    = o1.arcScaleY_;
    o2.lineScale_    = o1.lineScale_;
  }

  function processStyle(styleString) {
    var str, alpha = 1;

    styleString = String(styleString);
    if (styleString.substring(0, 3) == 'rgb') {
      var start = styleString.indexOf('(', 3);
      var end = styleString.indexOf(')', start + 1);
      var guts = styleString.substring(start + 1, end).split(',');

      str = '#';
      for (var i = 0; i < 3; i++) {
        str += dec2hex[Number(guts[i])];
      }

      if (guts.length == 4 && styleString.substr(3, 1) == 'a') {
        alpha = guts[3];
      }
    } else {
      str = styleString;
    }

    return {color: str, alpha: alpha};
  }

  function processLineCap(lineCap) {
    switch (lineCap) {
      case 'butt':
        return 'flat';
      case 'round':
        return 'round';
      case 'square':
      default:
        return 'square';
    }
  }

  /**
   * This class implements CanvasRenderingContext2D interface as described by
   * the WHATWG.
   * @param {HTMLElement} surfaceElement The element that the 2D context should
   * be associated with
   */
  function CanvasRenderingContext2D_(surfaceElement) {
    this.m_ = createMatrixIdentity();

    this.mStack_ = [];
    this.aStack_ = [];
    this.currentPath_ = [];

    // Canvas context properties
    this.strokeStyle = '#000';
    this.fillStyle = '#000';

    this.lineWidth = 1;
    this.lineJoin = 'miter';
    this.lineCap = 'butt';
    this.miterLimit = Z * 1;
    this.globalAlpha = 1;
    this.canvas = surfaceElement;

    var el = surfaceElement.ownerDocument.createElement('div');
    el.style.width =  surfaceElement.clientWidth + 'px';
    el.style.height = surfaceElement.clientHeight + 'px';
    el.style.overflow = 'hidden';
    el.style.position = 'absolute';
    surfaceElement.appendChild(el);

    this.element_ = el;
    this.arcScaleX_ = 1;
    this.arcScaleY_ = 1;
    this.lineScale_ = 1;
  }

  var contextPrototype = CanvasRenderingContext2D_.prototype;
  contextPrototype.clearRect = function() {
    this.element_.innerHTML = '';
  };

  contextPrototype.beginPath = function() {
    // TODO: Branch current matrix so that save/restore has no effect
    //       as per safari docs.
    this.currentPath_ = [];
  };

  contextPrototype.moveTo = function(aX, aY) {
    var p = this.getCoords_(aX, aY);
    this.currentPath_.push({type: 'moveTo', x: p.x, y: p.y});
    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.lineTo = function(aX, aY) {
    var p = this.getCoords_(aX, aY);
    this.currentPath_.push({type: 'lineTo', x: p.x, y: p.y});

    this.currentX_ = p.x;
    this.currentY_ = p.y;
  };

  contextPrototype.bezierCurveTo = function(aCP1x, aCP1y,
                                            aCP2x, aCP2y,
                                            aX, aY) {
    var p = this.getCoords_(aX, aY);
    var cp1 = this.getCoords_(aCP1x, aCP1y);
    var cp2 = this.getCoords_(aCP2x, aCP2y);
    bezierCurveTo(this, cp1, cp2, p);
  };

  // Helper function that takes the already fixed cordinates.
  function bezierCurveTo(self, cp1, cp2, p) {
    self.currentPath_.push({
      type: 'bezierCurveTo',
      cp1x: cp1.x,
      cp1y: cp1.y,
      cp2x: cp2.x,
      cp2y: cp2.y,
      x: p.x,
      y: p.y
    });
    self.currentX_ = p.x;
    self.currentY_ = p.y;
  }

  contextPrototype.quadraticCurveTo = function(aCPx, aCPy, aX, aY) {
    // the following is lifted almost directly from
    // http://developer.mozilla.org/en/docs/Canvas_tutorial:Drawing_shapes

    var cp = this.getCoords_(aCPx, aCPy);
    var p = this.getCoords_(aX, aY);

    var cp1 = {
      x: this.currentX_ + 2.0 / 3.0 * (cp.x - this.currentX_),
      y: this.currentY_ + 2.0 / 3.0 * (cp.y - this.currentY_)
    };
    var cp2 = {
      x: cp1.x + (p.x - this.currentX_) / 3.0,
      y: cp1.y + (p.y - this.currentY_) / 3.0
    };

    bezierCurveTo(this, cp1, cp2, p);
  };

  contextPrototype.arc = function(aX, aY, aRadius,
                                  aStartAngle, aEndAngle, aClockwise) {
    aRadius *= Z;
    var arcType = aClockwise ? 'at' : 'wa';

    var xStart = aX + mc(aStartAngle) * aRadius - Z2;
    var yStart = aY + ms(aStartAngle) * aRadius - Z2;

    var xEnd = aX + mc(aEndAngle) * aRadius - Z2;
    var yEnd = aY + ms(aEndAngle) * aRadius - Z2;

    // IE won't render arches drawn counter clockwise if xStart == xEnd.
    if (xStart == xEnd && !aClockwise) {
      xStart += 0.125; // Offset xStart by 1/80 of a pixel. Use something
                       // that can be represented in binary
    }

    var p = this.getCoords_(aX, aY);
    var pStart = this.getCoords_(xStart, yStart);
    var pEnd = this.getCoords_(xEnd, yEnd);

    this.currentPath_.push({type: arcType,
                           x: p.x,
                           y: p.y,
                           radius: aRadius,
                           xStart: pStart.x,
                           yStart: pStart.y,
                           xEnd: pEnd.x,
                           yEnd: pEnd.y});

  };

  contextPrototype.rect = function(aX, aY, aWidth, aHeight) {
    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
  };

  contextPrototype.strokeRect = function(aX, aY, aWidth, aHeight) {
    var oldPath = this.currentPath_;
    this.beginPath();

    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.stroke();

    this.currentPath_ = oldPath;
  };

  contextPrototype.fillRect = function(aX, aY, aWidth, aHeight) {
    var oldPath = this.currentPath_;
    this.beginPath();

    this.moveTo(aX, aY);
    this.lineTo(aX + aWidth, aY);
    this.lineTo(aX + aWidth, aY + aHeight);
    this.lineTo(aX, aY + aHeight);
    this.closePath();
    this.fill();

    this.currentPath_ = oldPath;
  };

  contextPrototype.createLinearGradient = function(aX0, aY0, aX1, aY1) {
    var gradient = new CanvasGradient_('gradient');
    gradient.x0_ = aX0;
    gradient.y0_ = aY0;
    gradient.x1_ = aX1;
    gradient.y1_ = aY1;
    return gradient;
  };

  contextPrototype.createRadialGradient = function(aX0, aY0, aR0,
                                                   aX1, aY1, aR1) {
    var gradient = new CanvasGradient_('gradientradial');
    gradient.x0_ = aX0;
    gradient.y0_ = aY0;
    gradient.r0_ = aR0;
    gradient.x1_ = aX1;
    gradient.y1_ = aY1;
    gradient.r1_ = aR1;
    return gradient;
  };

  contextPrototype.drawImage = function(image, var_args) {
    var dx, dy, dw, dh, sx, sy, sw, sh;

    // to find the original width we overide the width and height
    var oldRuntimeWidth = image.runtimeStyle.width;
    var oldRuntimeHeight = image.runtimeStyle.height;
    image.runtimeStyle.width = 'auto';
    image.runtimeStyle.height = 'auto';

    // get the original size
    var w = image.width;
    var h = image.height;

    // and remove overides
    image.runtimeStyle.width = oldRuntimeWidth;
    image.runtimeStyle.height = oldRuntimeHeight;

    if (arguments.length == 3) {
      dx = arguments[1];
      dy = arguments[2];
      sx = sy = 0;
      sw = dw = w;
      sh = dh = h;
    } else if (arguments.length == 5) {
      dx = arguments[1];
      dy = arguments[2];
      dw = arguments[3];
      dh = arguments[4];
      sx = sy = 0;
      sw = w;
      sh = h;
    } else if (arguments.length == 9) {
      sx = arguments[1];
      sy = arguments[2];
      sw = arguments[3];
      sh = arguments[4];
      dx = arguments[5];
      dy = arguments[6];
      dw = arguments[7];
      dh = arguments[8];
    } else {
      throw Error('Invalid number of arguments');
    }

    var d = this.getCoords_(dx, dy);

    var w2 = sw / 2;
    var h2 = sh / 2;

    var vmlStr = [];

    var W = 10;
    var H = 10;

    // For some reason that I've now forgotten, using divs didn't work
    vmlStr.push(' <g_vml_:group',
                ' coordsize="', Z * W, ',', Z * H, '"',
                ' coordorigin="0,0"' ,
                ' style="width:', W, 'px;height:', H, 'px;position:absolute;');

    // If filters are necessary (rotation exists), create them
    // filters are bog-slow, so only create them if abbsolutely necessary
    // The following check doesn't account for skews (which don't exist
    // in the canvas spec (yet) anyway.

    if (this.m_[0][0] != 1 || this.m_[0][1]) {
      var filter = [];

      // Note the 12/21 reversal
      filter.push('M11=', this.m_[0][0], ',',
                  'M12=', this.m_[1][0], ',',
                  'M21=', this.m_[0][1], ',',
                  'M22=', this.m_[1][1], ',',
                  'Dx=', mr(d.x / Z), ',',
                  'Dy=', mr(d.y / Z), '');

      // Bounding box calculation (need to minimize displayed area so that
      // filters don't waste time on unused pixels.
      var max = d;
      var c2 = this.getCoords_(dx + dw, dy);
      var c3 = this.getCoords_(dx, dy + dh);
      var c4 = this.getCoords_(dx + dw, dy + dh);

      max.x = m.max(max.x, c2.x, c3.x, c4.x);
      max.y = m.max(max.y, c2.y, c3.y, c4.y);

      vmlStr.push('padding:0 ', mr(max.x / Z), 'px ', mr(max.y / Z),
                  'px 0;filter:progid:DXImageTransform.Microsoft.Matrix(',
                  filter.join(''), ", sizingmethod='clip');")
    } else {
      vmlStr.push('top:', mr(d.y / Z), 'px;left:', mr(d.x / Z), 'px;');
    }

    vmlStr.push(' ">' ,
                '<g_vml_:image src="', image.src, '"',
                ' style="width:', Z * dw, 'px;',
                ' height:', Z * dh, 'px;"',
                ' cropleft="', sx / w, '"',
                ' croptop="', sy / h, '"',
                ' cropright="', (w - sx - sw) / w, '"',
                ' cropbottom="', (h - sy - sh) / h, '"',
                ' />',
                '</g_vml_:group>');

    this.element_.insertAdjacentHTML('BeforeEnd',
                                    vmlStr.join(''));
  };

  contextPrototype.stroke = function(aFill) {
    var lineStr = [];
    var lineOpen = false;
    var a = processStyle(aFill ? this.fillStyle : this.strokeStyle);
    var color = a.color;
    var opacity = a.alpha * this.globalAlpha;

    var W = 10;
    var H = 10;

    lineStr.push('<g_vml_:shape',
                 ' filled="', !!aFill, '"',
                 ' style="position:absolute;width:', W, 'px;height:', H, 'px;"',
                 ' coordorigin="0 0" coordsize="', Z * W, ' ', Z * H, '"',
                 ' stroked="', !aFill, '"',
                 ' path="');

    var newSeq = false;
    var min = {x: null, y: null};
    var max = {x: null, y: null};

    for (var i = 0; i < this.currentPath_.length; i++) {
      var p = this.currentPath_[i];
      var c;

      switch (p.type) {
        case 'moveTo':
          c = p;
          lineStr.push(' m ', mr(p.x), ',', mr(p.y));
          break;
        case 'lineTo':
          lineStr.push(' l ', mr(p.x), ',', mr(p.y));
          break;
        case 'close':
          lineStr.push(' x ');
          p = null;
          break;
        case 'bezierCurveTo':
          lineStr.push(' c ',
                       mr(p.cp1x), ',', mr(p.cp1y), ',',
                       mr(p.cp2x), ',', mr(p.cp2y), ',',
                       mr(p.x), ',', mr(p.y));
          break;
        case 'at':
        case 'wa':
          lineStr.push(' ', p.type, ' ',
                       mr(p.x - this.arcScaleX_ * p.radius), ',',
                       mr(p.y - this.arcScaleY_ * p.radius), ' ',
                       mr(p.x + this.arcScaleX_ * p.radius), ',',
                       mr(p.y + this.arcScaleY_ * p.radius), ' ',
                       mr(p.xStart), ',', mr(p.yStart), ' ',
                       mr(p.xEnd), ',', mr(p.yEnd));
          break;
      }


      // TODO: Following is broken for curves due to
      //       move to proper paths.

      // Figure out dimensions so we can do gradient fills
      // properly
      if (p) {
        if (min.x == null || p.x < min.x) {
          min.x = p.x;
        }
        if (max.x == null || p.x > max.x) {
          max.x = p.x;
        }
        if (min.y == null || p.y < min.y) {
          min.y = p.y;
        }
        if (max.y == null || p.y > max.y) {
          max.y = p.y;
        }
      }
    }
    lineStr.push(' ">');

    if (!aFill) {
      var lineWidth = this.lineScale_ * this.lineWidth;

      // VML cannot correctly render a line if the width is less than 1px.
      // In that case, we dilute the color to make the line look thinner.
      if (lineWidth < 1) {
        opacity *= lineWidth;
      }

      lineStr.push(
        '<g_vml_:stroke',
        ' opacity="', opacity, '"',
        ' joinstyle="', this.lineJoin, '"',
        ' miterlimit="', this.miterLimit, '"',
        ' endcap="', processLineCap(this.lineCap), '"',
        ' weight="', lineWidth, 'px"',
        ' color="', color, '" />'
      );
    } else if (typeof this.fillStyle == 'object') {
      var fillStyle = this.fillStyle;
      var angle = 0;
      var focus = {x: 0, y: 0};

      // additional offset
      var shift = 0;
      // scale factor for offset
      var expansion = 1;

      if (fillStyle.type_ == 'gradient') {
        var x0 = fillStyle.x0_ / this.arcScaleX_;
        var y0 = fillStyle.y0_ / this.arcScaleY_;
        var x1 = fillStyle.x1_ / this.arcScaleX_;
        var y1 = fillStyle.y1_ / this.arcScaleY_;
        var p0 = this.getCoords_(x0, y0);
        var p1 = this.getCoords_(x1, y1);
        var dx = p1.x - p0.x;
        var dy = p1.y - p0.y;
        angle = Math.atan2(dx, dy) * 180 / Math.PI;

        // The angle should be a non-negative number.
        if (angle < 0) {
          angle += 360;
        }

        // Very small angles produce an unexpected result because they are
        // converted to a scientific notation string.
        if (angle < 1e-6) {
          angle = 0;
        }
      } else {
        var p0 = this.getCoords_(fillStyle.x0_, fillStyle.y0_);
        var width  = max.x - min.x;
        var height = max.y - min.y;
        focus = {
          x: (p0.x - min.x) / width,
          y: (p0.y - min.y) / height
        };

        width  /= this.arcScaleX_ * Z;
        height /= this.arcScaleY_ * Z;
        var dimension = m.max(width, height);
        shift = 2 * fillStyle.r0_ / dimension;
        expansion = 2 * fillStyle.r1_ / dimension - shift;
      }

      // We need to sort the color stops in ascending order by offset,
      // otherwise IE won't interpret it correctly.
      var stops = fillStyle.colors_;
      stops.sort(function(cs1, cs2) {
        return cs1.offset - cs2.offset;
      });

      var length = stops.length;
      var color1 = stops[0].color;
      var color2 = stops[length - 1].color;
      var opacity1 = stops[0].alpha * this.globalAlpha;
      var opacity2 = stops[length - 1].alpha * this.globalAlpha;

      var colors = [];
      for (var i = 0; i < length; i++) {
        var stop = stops[i];
        colors.push(stop.offset * expansion + shift + ' ' + stop.color);
      }

      // When colors attribute is used, the meanings of opacity and o:opacity2
      // are reversed.
      lineStr.push('<g_vml_:fill type="', fillStyle.type_, '"',
                   ' method="none" focus="100%"',
                   ' color="', color1, '"',
                   ' color2="', color2, '"',
                   ' colors="', colors.join(','), '"',
                   ' opacity="', opacity2, '"',
                   ' g_o_:opacity2="', opacity1, '"',
                   ' angle="', angle, '"',
                   ' focusposition="', focus.x, ',', focus.y, '" />');
    } else {
      lineStr.push('<g_vml_:fill color="', color, '" opacity="', opacity,
                   '" />');
    }

    lineStr.push('</g_vml_:shape>');

    this.element_.insertAdjacentHTML('beforeEnd', lineStr.join(''));
  };

  contextPrototype.fill = function() {
    this.stroke(true);
  }

  contextPrototype.closePath = function() {
    this.currentPath_.push({type: 'close'});
  };

  /**
   * @private
   */
  contextPrototype.getCoords_ = function(aX, aY) {
    var m = this.m_;
    return {
      x: Z * (aX * m[0][0] + aY * m[1][0] + m[2][0]) - Z2,
      y: Z * (aX * m[0][1] + aY * m[1][1] + m[2][1]) - Z2
    }
  };

  contextPrototype.save = function() {
    var o = {};
    copyState(this, o);
    this.aStack_.push(o);
    this.mStack_.push(this.m_);
    this.m_ = matrixMultiply(createMatrixIdentity(), this.m_);
  };

  contextPrototype.restore = function() {
    copyState(this.aStack_.pop(), this);
    this.m_ = this.mStack_.pop();
  };

  function matrixIsFinite(m) {
    for (var j = 0; j < 3; j++) {
      for (var k = 0; k < 2; k++) {
        if (!isFinite(m[j][k]) || isNaN(m[j][k])) {
          return false;
        }
      }
    }
    return true;
  }

  function setM(ctx, m, updateLineScale) {
    if (!matrixIsFinite(m)) {
      return;
    }
    ctx.m_ = m;

    if (updateLineScale) {
      // Get the line scale.
      // Determinant of this.m_ means how much the area is enlarged by the
      // transformation. So its square root can be used as a scale factor
      // for width.
      var det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
      ctx.lineScale_ = sqrt(abs(det));
    }
  }

  contextPrototype.translate = function(aX, aY) {
    var m1 = [
      [1,  0,  0],
      [0,  1,  0],
      [aX, aY, 1]
    ];

    setM(this, matrixMultiply(m1, this.m_), false);
  };

  contextPrototype.rotate = function(aRot) {
    var c = mc(aRot);
    var s = ms(aRot);

    var m1 = [
      [c,  s, 0],
      [-s, c, 0],
      [0,  0, 1]
    ];

    setM(this, matrixMultiply(m1, this.m_), false);
  };

  contextPrototype.scale = function(aX, aY) {
    this.arcScaleX_ *= aX;
    this.arcScaleY_ *= aY;
    var m1 = [
      [aX, 0,  0],
      [0,  aY, 0],
      [0,  0,  1]
    ];

    setM(this, matrixMultiply(m1, this.m_), true);
  };

  contextPrototype.transform = function(m11, m12, m21, m22, dx, dy) {
    var m1 = [
      [m11, m12, 0],
      [m21, m22, 0],
      [dx,  dy,  1]
    ];

    setM(this, matrixMultiply(m1, this.m_), true);
  };

  contextPrototype.setTransform = function(m11, m12, m21, m22, dx, dy) {
    var m = [
      [m11, m12, 0],
      [m21, m22, 0],
      [dx,  dy,  1]
    ];

    setM(this, m, true);
  };

  /******** STUBS ********/
  contextPrototype.clip = function() {
    // TODO: Implement
  };

  contextPrototype.arcTo = function() {
    // TODO: Implement
  };

  contextPrototype.createPattern = function() {
    return new CanvasPattern_;
  };

  // Gradient / Pattern Stubs
  function CanvasGradient_(aType) {
    this.type_ = aType;
    this.x0_ = 0;
    this.y0_ = 0;
    this.r0_ = 0;
    this.x1_ = 0;
    this.y1_ = 0;
    this.r1_ = 0;
    this.colors_ = [];
  }

  CanvasGradient_.prototype.addColorStop = function(aOffset, aColor) {
    aColor = processStyle(aColor);
    this.colors_.push({offset: aOffset,
                       color: aColor.color,
                       alpha: aColor.alpha});
  };

  function CanvasPattern_() {}

  // set up externs
  G_vmlCanvasManager = G_vmlCanvasManager_;
  CanvasRenderingContext2D = CanvasRenderingContext2D_;
  CanvasGradient = CanvasGradient_;
  CanvasPattern = CanvasPattern_;

})();

} // if


/* >>>>>>>>>> BEGIN source/mixins/link.js */
/*globals LinkIt*/

/** @class

  This is the canvas tag that draws the line on the screen

  @extends SC.View
  @author Evin Grano
  @author Jonathan Lewis
  @version 0.1
*/

LinkIt.Link = {

  // PUBLIC PROPERTIES
  
  isSelected: NO,

  /**
    Default link drawing style
  */
  linkStyle: {
    cap: LinkIt.ROUND,
    width: 3, // Default: 3 pixels
    color: '#ADD8E6',
    lineStyle: LinkIt.VERTICAL_CURVED,
    directionIndicator: NO // may also be LinkIt.FORWARD or LinkIt.REVERSE (where forward means from 'startNode' to 'endNode')
  },

  /**
    Whether or not we should draw a direction indicator arrowhead at the midpoint of the
    line indicating flow from 'startNode' to 'endNode'.  This setting will be overridden by
    the property of the same name in 'linkStyle' if 'linkStyle' hash is present.

    NOTE: Due to lack of time, currently only supported by line styles LinkIt.VERTICAL_CURVED
    and LinkIt.HORIZONTAL_CURVED.
    
    Possible values are
      LinkIt.FORWARD, LinkIt.REVERSE, or NO for no indicator.
  */
  directionIndicator: NO,
  
  selectionColor: '#FFFF64',
  selectionWidth: 7,
    
  // Graph-Related Properties

  /**
    Object mixing in LinkIt.Node
  */
  startNode: null,

  /**
    String terminal identifier
  */
  startTerminal: null,

  /**
    Object mixing in LinkIt.Node
  */
  endNode: null,

  /**
    String terminal identifier
  */
  endTerminal: null,

  // Draw-Related Properties

  startPt: null,
  endPt: null,

  // PUBLIC METHODS

  /*
    Returns YES if both start and end nodes are present and allow removal of the connection.
  */
  canDelete: function() {
    var startNode = this.get('startNode');
    var endNode = this.get('endNode');
    return !!(startNode && endNode && startNode.canDeleteLink(this) && endNode.canDeleteLink(this));
  },

  drawLink: function(context){
    var linkStyle = this.get('linkStyle') || {};
    var lineStyle = (linkStyle ? linkStyle.lineStyle : LinkIt.STRAIGHT) || LinkIt.STRAIGHT;
    var origColor = linkStyle.color;
    var origWidth = linkStyle.width;
    var isSelected = this.get('isSelected');

    switch (lineStyle){
      case LinkIt.HORIZONTAL_CURVED:
        if (isSelected) {
          linkStyle.color = this.get('selectionColor');
          linkStyle.width = this.get('selectionWidth');
          this.drawHorizontalCurvedLine(context, linkStyle);
          linkStyle.color = origColor;
          linkStyle.width = origWidth;
        }
        this.drawHorizontalCurvedLine(context, linkStyle);
        break;
      case LinkIt.VERTICAL_CURVED:
        if (isSelected) {
          linkStyle.color = this.get('selectionColor');
          linkStyle.width = this.get('selectionWidth');
          this.drawVerticalCurvedLine(context, linkStyle);
          linkStyle.color = origColor;
          linkStyle.width = origWidth;
        }
        this.drawVerticalCurvedLine(context, linkStyle);
        break;
      default:
        if (isSelected) {
          linkStyle.color = this.get('selectionColor');
          linkStyle.width = this.get('selectionWidth');
          this.drawStraightLine(context, linkStyle);
          linkStyle.color = origColor;
          linkStyle.width = origWidth;
        }
        this.drawStraightLine(context, linkStyle);
        break;
    }
  },
  
  drawStraightLine: function(context, linkStyle){
    var startPt = this.get('startPt');
    var endPt = this.get('endPt');
    if (startPt && endPt) {
      context = this._initLineProperties(context, linkStyle);
      context.beginPath();
      context.moveTo(startPt.x, startPt.y);
      context.lineTo(endPt.x, endPt.y);
      context.closePath();
      context.stroke();
    }
  },
  
  drawHorizontalCurvedLine: function(context, linkStyle){
    var startPt = this.get('startPt');
    var endPt = this.get('endPt');
    if (startPt && endPt) {
      context = this._initLineProperties(context, linkStyle);

      // Contruct Data points
      var midX = (startPt.x + endPt.x)/2;
      var midY = (startPt.y + endPt.y)/2;
      this._midPt = { x: midX, y: midY };
    
      var vectX = (startPt.x - endPt.x);
      var vectY = (startPt.y - endPt.y);
    
      // Find length
      var xLen = Math.pow(vectX, 2);
      var yLen = Math.pow(vectY, 2);
      var lineLen = Math.sqrt(xLen+yLen);
    
      // Finded the loop scaler
      var xDiff = Math.abs(startPt.x - endPt.x);
      var yDiff = Math.abs(startPt.y - endPt.y);
      var scaler = 0, diff;
      if (lineLen > 0) {
        diff = (xDiff < yDiff) ? xDiff : yDiff;
        scaler = (diff < 50) ? diff / lineLen : 50 / lineLen;
      }
    
      // Find Anchor points
      var q1X = (startPt.x + midX)/2;
      var q1Y = (startPt.y + midY)/2;
      var q2X = (endPt.x + midX)/2;
      var q2Y = (endPt.y + midY)/2;
    
      // Set the curve direction based off of the y position
      var vectMidY, vectMidX;
      if(startPt.y < endPt.y){
        vectMidY = vectX*scaler;
        vectMidX = -(vectY*scaler);
      }
      else {
        vectMidY = -(vectX*scaler);
        vectMidX = vectY*scaler;
      }
  
      // First Curve Point
      var curve1X = q1X+vectMidX;
      var curve1Y = q1Y+vectMidY;
      this._startControlPt = { x: curve1X, y: curve1Y };
    
      // Second Curve Point
      var curve2X = q2X-vectMidX;
      var curve2Y = q2Y-vectMidY;
      this._endControlPt = { x: curve2X, y: curve2Y };
    
      context.beginPath();
      context.moveTo(startPt.x, startPt.y);
      context.quadraticCurveTo(curve1X,curve1Y,midX,midY);
      context.quadraticCurveTo(curve2X,curve2Y,endPt.x,endPt.y);
      context.stroke();

      var directionIndicator = this.get('directionIndicator');
      if (directionIndicator === LinkIt.FORWARD) {
        this.drawDirectionIndicator(context, midX, midY, curve1X - midX, curve1Y - midY);
      }
      else if (directionIndicator === LinkIt.REVERSE) {
        this.drawDirectionIndicator(context, midX, midY, midX - curve1X, midY - curve1Y);
      }
    }
  },
  
  drawVerticalCurvedLine: function(context, linkStyle){
    var startPt = this.get('startPt');
    var endPt = this.get('endPt');
    if (startPt && endPt) {
      context = this._initLineProperties(context, linkStyle);
    
      // Contruct Data points
      var midX = (startPt.x + endPt.x)/2;
      var midY = (startPt.y + endPt.y)/2;
      this._midPt = { x: midX, y: midY };
    
      var vectX = (startPt.x - endPt.x);
      var vectY = (startPt.y - endPt.y);
    
      // Find length
      var xLen = Math.pow(vectX, 2);
      var yLen = Math.pow(vectY, 2);
      var lineLen = Math.sqrt(xLen+yLen);
    
      // Find the loop scaler
      var xDiff = Math.abs(startPt.x - endPt.x);
      var yDiff = Math.abs(startPt.y - endPt.y);
      var scaler = 0, diff;
      if (lineLen > 0) {
        diff = (xDiff < yDiff) ? xDiff : yDiff;
        scaler = (diff < 50) ? diff / lineLen : 50 / lineLen;
      }
    
      // Find Anchor points
      var q1X = (startPt.x + midX)/2;
      var q1Y = (startPt.y + midY)/2;
      var q2X = (endPt.x + midX)/2;
      var q2Y = (endPt.y + midY)/2;
    
      // Set the curve direction based off of the x position
      var vectMidY, vectMidX;
      if(startPt.x < endPt.x){
        vectMidY = -(vectX*scaler);
        vectMidX = vectY*scaler;
      }
      else {
        vectMidY = vectX*scaler;
        vectMidX = -(vectY*scaler);
      }
  
      // First Curve Point
      var curve1X = q1X+vectMidX;
      var curve1Y = q1Y+vectMidY;
      this._startControlPt = { x: curve1X, y: curve1Y };
    
      // Second Curve Point
      var curve2X = q2X-vectMidX;
      var curve2Y = q2Y-vectMidY;
      this._endControlPt = { x: curve2X, y: curve2Y };
 
      context.beginPath();
      context.moveTo(startPt.x, startPt.y);
      context.quadraticCurveTo(curve1X, curve1Y, midX, midY);
      context.quadraticCurveTo(curve2X, curve2Y, endPt.x, endPt.y);
      context.stroke();

      var directionIndicator = this.get('directionIndicator');
      if (directionIndicator === LinkIt.FORWARD) {
        this.drawDirectionIndicator(context, midX, midY, curve1X - midX, curve1Y - midY);
      }
      else if (directionIndicator === LinkIt.REVERSE) {
        this.drawDirectionIndicator(context, midX, midY, midX - curve1X, midY - curve1Y);
      }
    }
  },
  
  /**
    (centerX, centerY): location of center point of the arrowhead.
    (directionX, directionY): vector describing the direction in which the arrow should point.
  */
  drawDirectionIndicator: function(context, centerX, centerY, directionX, directionY) {
    context.save();
    
    context.translate(centerX, centerY); // artificially move canvas origin to center of the arrowhead
    context.rotate(Math.atan2(directionY, directionX) - Math.atan2(1, 0));
    context.scale(2.5, 2.5);

    context.beginPath();
    context.moveTo(0, -3);
    context.lineTo(2, 3);
    context.lineTo(-2, 3);
    context.lineTo(0, -3);
    context.fill();

    context.restore();
  },

  distanceSquaredFromLine: function(pt) {
    var startPt = this.get('startPt');
    var endPt = this.get('endPt');
    var linkStyle = this.get('linkStyle');
    var lineStyle = linkStyle ? (linkStyle.lineStyle || LinkIt.STRAIGHT) : LinkIt.STRAIGHT;

    if (lineStyle === LinkIt.STRAIGHT) {
      return this._distanceSquaredFromLineSegment(startPt, endPt, pt);
    }
    else {
      var dist1 = this._distanceSquaredFromCurve(startPt, this._midPt, this._startControlPt, pt);
      var dist2 = this._distanceSquaredFromCurve(this._midPt, endPt, this._endControlPt, pt);
      var dist = Math.min(dist1, dist2);
      return dist;
    }
  },

  // PRIVATE METHODS

  /** @private
    * Calculates distance point p is from line segment a, b.
    * All points should be hashes like this: { x: 3, y: 4 }.
    */
  _distanceSquaredFromLineSegment: function(a, b, p) {
    var q;

    if (a.x !== b.x || a.y !== b.y) { // make sure a and b aren't on top of each other (i.e. zero length line)
      var ab = { x: (b.x - a.x), y: (b.y - a.y) }; // vector from a to b

      // Derived from the formula the intersection point of two 2D lines.
      // The two lines are: the infinite line through and a and b, and the infinite line through p
      // that is perpendicular to that line.
      // If f(u) is the parametric equation describing the line segment between a and b, then
      // we are solving for u at the point q where f(u) == intersection of the above two lines.
      // If u is in the interval [0, 1], then the intersection is somewhere between A and B.
      var numerator = (ab.x * (p.x - a.x)) + ((p.y - a.y) * ab.y);
      var u = numerator / ((ab.x * ab.x) + (ab.y * ab.y));
      
      // calculate q as closet point on line segment ab
      if (u <= 0) { // closest point on the line is not between a and b, but closest to a
        q = { x: a.x, y: a.y };
      }
      else if (u >= 1) { // closest point on the line is not between a and b, but closest to b
        q = { x: b.x, y: b.y };
      }
      else { // closest point on the line is between a and b, so calculate it
        var x = a.x + (u * ab.x);
        var y = a.y + (u * ab.y);
        q = { x: x, y: y };
      }
    }
    else { // if a and b are concurrent, the distance we want will be that between a and p.
      q = { x: a.x, y: a.y };
    }

    // vector from p to q.  Length of pq is the shortest distance from p to the line segment ab.
    var pq = { x: (q.x - p.x), y: (q.y - p.y) };
    var distSquared = (pq.x * pq.x) + (pq.y * pq.y);
    return distSquared;
  },
  
  /** @private
    * Calculates a line segment approximation of a quadratic bezier curve and returns
    * the distance between point p and the closest line segment.
    *   a: start point of the quadratic bezier curve.
    *   b: end point
    *   c: bezier control point
    *   p: query point
    */
  _distanceSquaredFromCurve: function(a, b, c, p) {
    var bezierPt, midPt, delta;

    // m and n are the endpoints of the current line segment approximating the part
    // of the bezier curve closest to p.  Start out by approximating the curve with one
    // long segment from a to b.
    var m = { x: a.x, y: a.y };
    var n = { x: b.x, y: b.y };
    var t = 0.5, dt = 0.5; // t is the parameter in the parametric equation describing the bezier curve.
    
    do {
      // Compare the midpoint on the current line segment approximation with the midpoint on the bezier.
      midPt = { x: (m.x + n.x) / 2, y: (m.y + n.y) / 2 };
      bezierPt = this._pointOnBezierCurve(a, c, b, t);
      delta = this._distanceSquared(midPt, bezierPt); // note this is distance squared to avoid a sqrt call.

      if (delta > 16) { // comparing squared distances
        // If the line segment is a bad approximation, narrow it down and try again, using a sort
        // of binary search.
        
        // We'll make a new line segment approximation where one endpoint is the closer of the
        // two original endpoints, and the other is the last point on the bezier curve (bezierPt).
        // Thus our approximation endpoints are always on the bezier and move progressively closer
        // and closer together, and therefore are guaranteed to converge on a short line segment
        // that closely approximates the bezier.  Because we always choose the closer of the last
        // two endpoints as one of the new endpoints, we always converge toward a line segment that is close
        // to our query point p.
        var distM = this._distanceSquared(m, p);
        var distN = this._distanceSquared(n, p);
        dt = 0.5 * dt;

        if (distM < distN) {
          n = bezierPt; // p is closer to m than n, so keep m and our new n will be the last bezier point
          t = t - dt; // new t for calculating the new mid bezier point that will correspond to a new mid point between m and n.
        }
        else {
          m = bezierPt; // p is closer to n than m, so keep n and our new m will be the last bezier point
          t = t + dt;
        }
      }
      else {
        // The line segment matches the corresponding portion of the bezier closely enough
        break;
      }

    } while (true);

    // Return the distance from p to the line segment that closely matches a nearby part of the bezier curve.
    return this._distanceSquaredFromLineSegment(m, n, p);
  },
  
  /** @private
    * Calculates a point on a quadratic bezier curve described by points P0, P1, and P2.
    * See http://en.wikipedia.org/wiki/Bezier_curve for definitions and formula.
    */
  _pointOnBezierCurve: function(p0, p1, p2, t) {
    var x = ((1 - t) * (1 - t) * p0.x) + (2 * (1 - t) * t * p1.x) + (t * t * p2.x);
    var y = ((1 - t) * (1 - t) * p0.y) + (2 * (1 - t) * t * p1.y) + (t * t * p2.y);
    return { x: x, y: y };
  },
  
  /** @private
    * Calculates the distance squared between points a and b.
    * Points are expected to be hashes of the form { x: 3, y: 4 }.
    */
  _distanceSquared: function(a, b) {
    return ((b.x - a.x) * (b.x - a.x)) + ((b.y - a.y) * (b.y - a.y));
  },

  _initLineProperties: function(context, linkStyle){
    this.set('directionIndicator', linkStyle ? linkStyle.directionIndicator : this.get('directionIndicator'));

    if (context) {
      var cap = linkStyle ? (linkStyle.cap || LinkIt.ROUND) : LinkIt.ROUND;
      var color = linkStyle ? (linkStyle.color || '#ADD8E6') : '#ADD8E6';
      var width = linkStyle ? (linkStyle.width || 3) : 3;

      context.lineCap = cap;
      context.strokeStyle = color;
      context.fillStyle = color;
      context.lineWidth = width;
    }
    return context;
  },

  // PRIVATE PROPERTIES
  
  _midPt: null,
  _startControlPt: null, // for drawing bezier curve
  _endControlPt: null // for drawing bezier curve

};


/* >>>>>>>>>> BEGIN source/mixins/node.js */
// ==========================================================================
// LinkIt.Node 
// ==========================================================================

/** @class

  This is a Mixin that lives on the Model Object that are going to
  trigger the links and the structures

  @author Evin Grano
  @version: 0.1
*/

LinkIt.Node = {
/* Node Mixin */

  // PUBLIC PROPERTIES

  /**
  @public:  Properties that need to be set for the internal LinkIt Calls
  */
  isNode: YES,
  
  terminals: null,
  
  /**
    @public: 
    
    This is the property that is called on the node to get back an array of objects
  */
  linksKey: 'links',

  positionKey: 'position',
  
  /**
    @private: Invalidation delegate that should be notified when the links array changes.
  */
  _invalidationDelegate: null,

  /**
    @private: The method on the delegate that should be called
  */
  _invalidationAction: null,
  
  initMixin: function() {
    var terminals, key;

    // by this time we are in an object instance, so clone the terminals array
    // so that we won't be sharing this array memory (a by-product of using mixins)
    terminals = this.get('terminals');
    if (SC.typeOf(terminals) === SC.T_ARRAY) {
      this.set('terminals', SC.clone(terminals));
    }

    // We want to observe the links array but we don't know what it'll be called until runtime.
    key = this.get('linksKey');
    if (key) {
      this.addObserver(key, this, '_linksDidChange');
    }
  },
  
  /**
    @public: 
    
    Overwrite this function on your model object to validate the linking
    
    Always return YES or NO
  */
  canLink: function(link){
    return YES;
  },

  /**
    @public
    Overwrite this function on your model to validate unlinking.
    Always return YES or NO.
  */
  canDeleteLink: function(link) {
    return YES;
  },
  
  registerInvalidationDelegate: function(delegate, action){
    this._invalidationDelegate = delegate;
    this._invalidationAction = action;
  },
  
  /**
    Called after a link is added to this node
    Override on your node object to perform custom activity.
  */
  didCreateLink: function(link) {},

  /**
    Called before a link is deleted from this node
    Override on your node to perform custom activity.
  */
  willDeleteLink: function(link) {},
  
  createLink: function(link){
    // TODO: [EG] More create link functionality that is entirely depended in the internal API
    
    // Call the model specific functionality if needed
    if (this.didCreateLink) this.didCreateLink(link);
  },
  
  deleteLink: function(link){
    // TODO: [EG] More delete link functionality that is entirely depended in the internal API
    
    // Call the model specific functionality if needed
    if (this.willDeleteLink) this.willDeleteLink(link);
  },
  
  /**
    Fired by an observer on the links array that gets setup in initMixin.
  */
  _linksDidChange: function() {
    // console.log('%@._linksDidChange()'.fmt(this));
    // Call invalidate function
    var func, inact, indel = this._invalidationDelegate;
    if (this._invalidationDelegate ) {
      inact = this._invalidationAction;
      func = indel[inact];
      if (func) indel.invokeLast(inact);
    }
  }
  
};


/* >>>>>>>>>> BEGIN source/mixins/node_view.js */
/*globals LinkIt*/

LinkIt.NodeView = {
  
  // PUBLIC PROPERTIES
  
  isNodeView: YES,

  isDropTarget: YES,

  displayProperties: ['dropState'],
  
  /*
    @read-only
    The node view can act as a drop target on behalf of one of its terminal views.
    This property stores the currently-proxied terminal view.
    
    The terminal being proxied is determined by implementation of shouldProxyTerminalFor()
    below in views mixing in this mixin.
  */
  proxiedTerminalView: null,

  // PUBLIC METHODS
  
  terminalViewFor: function(terminalKey) {
    return null; // implement this in your node view
  },

  /*
    Stub function; implement this in the view using this mixin.
    Return NO if this node view should not act as a drop proxy for one of its terminal views.
    Return the name of the terminal otherwise.
  */
  shouldProxyTerminalFor: function(drag) {
    return NO; // implement this in your code
  },
  
  willDestroyLayerMixin: function() {
    SC.Drag.removeDropTarget(this);
  },

  renderMixin: function(context, firstTime) {
    var dropState = this.get('dropState'); // drop state
    context.setClass('invite', dropState === LinkIt.INVITE); // addClass if YES, removeClass if NO
    context.setClass('accept', dropState === LinkIt.ACCEPT);
  },
  
  // *** SC.DropTarget ***

  dragStarted: function(drag, evt){
    var terminal = this.shouldProxyTerminalFor(drag);
    terminal = terminal ? this.terminalViewFor(terminal) : null;
    this.set('proxiedTerminalView', terminal);
    if (terminal && terminal._nodeAllowsLink(drag.source)) {
      this.set('dropState', LinkIt.INVITE);
    }
  },
  
  dragEntered: function(drag, evt) {
    this.set('dropState', LinkIt.ACCEPT);
  },
  
  dragExited: function(drag, evt) {
    this.set('dropState', LinkIt.INVITE);
  },

  dragEnded: function(drag, evt) {
    this.set('dropState', null);
  },
  
  computeDragOperations: function(drag, evt) {
    return SC.DRAG_LINK;
  },
  
  acceptDragOperation: function(drag, op) {
    var terminal = this.get('proxiedTerminalView');
    return (terminal && op === SC.DRAG_LINK) ? terminal._nodeAllowsLink(drag.source) : NO; 
  },
  
  performDragOperation: function(drag, op) {
    var terminal = this.get('proxiedTerminalView');
    return terminal ? terminal.performDragOperation(drag, op) : op;
  }
  
};

/* >>>>>>>>>> BEGIN source/mixins/terminal.js */
/*globals LinkIt*/

LinkIt.Terminal = {
  
  // PUBLIC PROPERTIES
  
  /**
    For quick checks to see if an object is mixing terminal in
  */
  isTerminal: YES,
  
  /**
    States whether this object is connected
  */
  isLinked: NO,
  
  /**
    May be LinkIt.OUTPUT_TERMINAL, LinkIt.INPUT_TERMINAL, or null.
    If null, will be assumed to be bi-directional.  Bi-directional terminals can connect
    to each other, and to output and input terminals.
  */
  direction: null,

  /**
    The name of this terminal
  */
  terminal: null,

  /**
  */
  linkStyle: null,
  
  /**
  */
  dropState: null,
  
  /**
  */
  displayProperties: ['dropState', 'isLinked', 'linkStyle', 'direction'],
  
  /**
    Will be set automatically
  */
  node: null,
  
  /**
    @private linkCache...
  */
  _linkCache: null,
  
  // *** SC.DropTarget ***
  
  /**
    Must be true when your view is instantiated.
    
    Drop targets must be specially registered in order to receive drop
    events.  SproutCore knows to register your view when this property
    is true on view creation.
  */  
  isDropTarget: YES,
  
  /**
    @public @property
  */
  terminalKey: function(){
    var n = this.get('node');
    var t = this.get('terminal');
    return '%@:%@'.fmt(SC.guidFor(n), t);
  }.property('node', 'terminal').cacheable(),

  // PUBLIC METHODS
  
  initMixin: function() {
    //LinkIt.log('%@.initMixin()'.fmt(this));
    this.isLinked = NO;
  },

  /**
    Unregister this view as a drop target when it gets destroyed
  */
  willDestroyLayerMixin: function() {
    //console.log('%@.willDestroyLayerMixin()'.fmt(this));
    SC.Drag.removeDropTarget(this);
  },
  
  renderMixin: function(context, firstTime) {
    //LinkIt.log('%@.renderMixin()'.fmt(this));
    var links = this.get('links');
    context.setClass('connected', this.get('isLinked'));
    
    // drop state
    var dropState = this.get('dropState');
    // Invite class
    context.setClass('invite', dropState === LinkIt.INVITE); // addClass if YES, removeClass if NO
    // Accept class
    context.setClass('accept', dropState === LinkIt.ACCEPT);
  },
  
  // *** LinkIt.Terminal API ***

  /**
    Return yes if someone is allowed to start dragging a link from this terminal.
    Not the same as canLink() above in that linking this terminal to another may still
    be allowed, just not triggered by a drag from this terminal.
  */
  canDragLink: function() { 
    return YES;
  },

  /**
    Return yes if someone is allowed to drop a link onto this terminal.
    Not the same as canLink() above in that linking this terminal to another may still
    be allowed, just not triggered by a drop onto this terminal.
  */
  canDropLink: function() {
    return YES;
  },
  
  /**
    Only gets called if linking is acceptable.  Notifies you that someone
    has started dragging a link somewhere on the canvas that could connect
    to this terminal.
  */
  linkDragStarted: function() {
    //LinkIt.log('%@.linkStarted()'.fmt(this));
  },
  
  /**
    Notifies you that a dragged link has been finished or cancelled.
  */
  linkDragEnded: function() {
    //LinkIt.log('%@.linkEnded()'.fmt(this));
  },

  /**
    Notifies you that someone has dragged a link over this terminal but has
    not dropped it yet.
  */
  linkDragEntered: function() {
    //LinkIt.log('%@.linkEntered()'.fmt(this));
  },

  /**
    Notifies you that a link dragged over this terminal has now left without
    connecting.
  */
  linkDragExited: function() {
    //LinkIt.log('%@.linkExited()'.fmt(this));
  },

  // *** Mouse Events ***

  mouseDown: function(evt) {
    this._mouseDownEvent = evt;
    this._mouseDownAt = Date.now();
    return YES;
  },
  
  mouseDragged: function(evt) {
    if (this.canDragLink() && this._mouseDownEvent) {
      // Build the drag view to use for the ghost drag.  This 
      // should essentially contain any visible drag items.
      var layer = LinkIt.getLayer(this);

      if (layer && layer.get('isEditable')) {
        var parent = this.get('parentView');    
        var fo = parent.convertFrameFromView(parent.get('frame'), this);
        var frame = this.get('frame');
        var startX = fo.x + (frame.width/2);
        var startY = fo.y + (frame.height/2);
        var color = this.get('linkDragColor');

        var dragLink = LinkIt.DragLink.create({
          layout: {left: 0, top: 0, right: 0, bottom: 0},
          startPt: {x: startX, y: startY},
          endPt: {x: startX, y: startY},
          linkStyle: this.get('linkStyle')
        });
        layer.appendChild(dragLink);
      
        // Initiate the drag
        var drag = SC.Drag.start({
          event: this._mouseDownEvent,
          dragLink: dragLink,
          source: this, // terminal
          dragView: SC.View.create({ layout: {left: 0, top: 0, width: 0, height: 0}}),
          ghost: NO,
          slideBack: YES,
          dataSource: this,
          anchorView: layer
        });
      }

      // Also use this opportunity to clean up since mouseUp won't 
      // get called.
      this._cleanupMouseDown() ;
    }    
    return YES ;
  },
  
  mouseUp: function(evt) {
    this._cleanupMouseDown();
    return YES; // just absorb the mouse event so that LinkIt.CanvasView (SC.CollectionView) doesn't complain.
  },
    
  // *** SC.DragSource ***
  
  /**
    This method must be overridden for drag operations to be allowed. 
    Return a bitwise OR'd mask of the drag operations allowed on the
    specified target.  If you don't care about the target, just return a
    constant value.
  
    @param {SC.View} dropTarget The proposed target of the drop.
    @param {SC.Drag} drag The SC.Drag instance managing this drag.
  
  */
  dragSourceOperationMaskFor: function(drag, dropTarget) {
    var terminal = dropTarget.get('isNodeView') ? dropTarget.get('proxiedTerminalView') : dropTarget;
    return this._nodeAllowsLink(terminal) ? SC.DRAG_LINK : SC.DRAG_NONE;
  },

  /**  
    This method is called when the drag begins. You can use this to do any
    visual highlighting to indicate that the receiver is the source of the 
    drag.
  
    @param {SC.Drag} drag The Drag instance managing this drag.
  
    @param {Point} loc The point in *window* coordinates where the drag 
      began.  You can use convertOffsetFromView() to convert this to local 
      coordinates.
  */
  dragDidBegin: function(drag, loc) {
    //LinkIt.log('%@.dragDidBegin()'.fmt(this));
  },
  
  /**
    This method is called whenever the drag image is moved.  This is
    similar to the dragUpdated() method called on drop targets.

    @param {SC.Drag} drag The Drag instance managing this drag.

    @param {Point} loc  The point in *window* coordinates where the drag 
      mouse is.  You can use convertOffsetFromView() to convert this to local 
      coordinates.
  */
  dragDidMove: function(drag, loc) {
    var dragLink = drag.dragLink;
    var endX, endY;

    if (dragLink) {
      // if using latest SproutCore 1.0, loc is expressed in browser window coordinates
      var pv = dragLink.get('parentView');
      var frame = dragLink.get('frame');
      var globalFrame = pv ? pv.convertFrameToView(frame, null) : frame;
      if (globalFrame) {
        endX = loc.x - globalFrame.x;
        endY = loc.y - globalFrame.y;
        dragLink.set('endPt', {x: endX , y: endY});
      }
    }
  },
  
  /**  
    This method is called when the drag ended. You can use this to do any
    cleanup.  The operation is the actual operation performed on the drag.
  
    @param {SC.Drag} drag The drag instance managing the drag.
  
    @param {Point} loc The point in WINDOW coordinates where the drag 
      ended. 
  
    @param {DragOp} op The drag operation that was performed. One of 
      SC.DRAG_COPY, SC.DRAG_MOVE, SC.DRAG_LINK, or SC.DRAG_NONE.
  
  */
  dragDidEnd: function(drag, loc, op) {
    var dragLink = drag.dragLink;
    if (dragLink) {
      dragLink.destroy();
    }
  },
  
  // *** SC.DropTarget ***

  dragStarted: function(drag, evt){
    // Only notify permissible terminals
    if (this._nodeAllowsLink(drag.source)) {
      this.set('dropState', LinkIt.INVITE);
      this.linkDragStarted();
    }
  },
  
  dragEntered: function(drag, evt) {
    this.set('dropState', LinkIt.ACCEPT);
    this.linkDragEntered();
  },
  
  dragExited: function(drag, evt) {
    this.set('dropState', LinkIt.INVITE);
    this.linkDragExited();
  },

  dragEnded: function(drag, evt) {
    this.set('dropState', null);
    this.linkDragEnded();
  },
  
  computeDragOperations: function(drag, evt) {
    return SC.DRAG_LINK;
  },
  
  acceptDragOperation: function(drag, op) {
    var accept = (op === SC.DRAG_LINK) ? this._nodeAllowsLink(drag.source) : NO; 
    return accept;
  },
  
  performDragOperation: function(drag, op) {
    var node = this.get('node');
    var otherTerminal = drag.source;
    if (node && otherTerminal) {
      var otherNode = otherTerminal.get('node');
      if (otherNode) {
        var linkObj = this._createLinkObject(this, node, otherTerminal, otherNode);
        node.createLink( SC.Object.create(linkObj) );

        var otherLinkObj = this._createLinkObject(otherTerminal, otherNode, this, node);
        otherNode.createLink( SC.Object.create(otherLinkObj) );
      }
    }
    return op;
  },
  
  // PRIVATE METHODS
  _getLinkObjects: function(startTerminal, startNode, endTerminal, endNode){
    var key, links;
    this._linkCache = this._linkCache || {};
    
    key = '%@ %@'.fmt(startTerminal.get('terminalKey'), endTerminal.get('terminalKey'));
    links = this._linkCache[key] || this._createLinkObject(startTerminal, startNode, endTerminal, endNode);
    this._linkCache[key] = links;
    return links;
  },

  _nodeAllowsLink: function(otherTerminal) {
    var myLinkObj, myNodeAccepted, otherLinkObj, otherNodeAccepted;
    if (otherTerminal && otherTerminal.get('isTerminal')) {

      var myNode = this.get('node');
      var otherNode = otherTerminal.get('node');
      
      // First, Check nodes for compatability
      var links = this._getLinkObjects(otherTerminal, otherNode, this, myNode);
      myNodeAccepted =  (myNode && links[0]) ? myNode.canLink( links[0] ) : NO;
      otherNodeAccepted = (otherNode && myNodeAccepted && links[1]) ? otherNode.canLink( links[1] ) : NO;
    }
    if (otherTerminal && otherTerminal.get('isCanvas')) {
    	return otherTerminal.get('acceptCanvasDrop');
    }
    return (myNodeAccepted && otherNodeAccepted);
  },
  
  /**
    When we check the Nodes we must make a judgement for each of the directions
    Unaccepted:
      Output => Output
      Intputs => Inputs
    Accepted:
      Output (start) => Input (end)
      Bidirectional (start) => Input (end)
      Output (start) => Bidirectional (end)
      Bidirectional (start) => Bidirectional (end) && Bidirectional (end) => Bidirectional (start)
    
  */
  _createLinkObject: function(startTerminal, startNode, endTerminal, endNode){
    var tempHash = {};
    var startObj, endObj;
    // First, we need to get the direction of both terminals
    if (startNode && endNode){
      var sDir = startTerminal.get('direction');
      var eDir = endTerminal.get('direction');
      
      // Check to see if they are of unaccepted types
      if (!SC.none(sDir) && sDir === eDir) return [null, null];
      
      if ( (sDir === LinkIt.OUTPUT_TERMINAL && (eDir === LinkIt.INPUT_TERMINAL || SC.none(eDir)) ) || (eDir === LinkIt.INPUT_TERMINAL && SC.none(sDir)) ) {
        tempHash.direction = sDir;
        tempHash.startNode = startNode;
        tempHash.startTerminal = startTerminal.get('terminal');
        tempHash.startTerminalView = startTerminal;
        tempHash.endNode = endNode;
        tempHash.endTerminal = endTerminal.get('terminal');
        tempHash.endTerminalView = endTerminal;
        //console.log('\nUni(%@,%@): (%@).%@ => (%@).%@'.fmt(sDir, eDir, SC.guidFor(startNode), tempHash.startTerminal, SC.guidFor(endNode), tempHash.endTerminal));
        startObj = SC.Object.create( LinkIt.Link, tempHash );
        return [startObj, startObj];
      } 
      else if ( (sDir === LinkIt.INPUT_TERMINAL && (eDir === LinkIt.OUTPUT_TERMINAL || SC.none(eDir)) ) || (eDir === LinkIt.OUTPUT_TERMINAL && SC.none(sDir)) ) {
        tempHash.direction = eDir;
        tempHash.startNode = endNode;
        tempHash.startTerminal = endTerminal.get('terminal');
        tempHash.startTerminalView = endTerminal;
        tempHash.endNode = startNode;
        tempHash.endTerminal = startTerminal.get('terminal');
        tempHash.endTerminalView = startTerminal;
        //console.log('\nUni(%@,%@): (%@).%@ => (%@).%@'.fmt(sDir, eDir, SC.guidFor(endNode), tempHash.startTerminal, SC.guidFor(startNode), tempHash.endTerminal));
        startObj = SC.Object.create( LinkIt.Link, tempHash );
        return [startObj, startObj];
      }
      else { // Bi Directional
        tempHash.direction = sDir;
        tempHash.startNode = startNode;
        tempHash.startTerminal = startTerminal.get('terminal');
        tempHash.startTerminalView = startTerminal;
        tempHash.endNode = endNode;
        tempHash.endTerminal = endTerminal.get('terminal');
        tempHash.endTerminalView = endTerminal;
        startObj = SC.Object.create( LinkIt.Link, tempHash );
        //console.log('\nBi(%@): (%@).%@ => (%@).%@'.fmt(sDir, SC.guidFor(startNode), tempHash.startTerminal, SC.guidFor(endNode), tempHash.endTerminal));
        
        tempHash.direction = eDir;
        tempHash.startNode = endNode;
        tempHash.startTerminal = endTerminal.get('terminal');
        tempHash.startTerminalView = endTerminal;
        tempHash.endNode = startNode;
        tempHash.endTerminal = startTerminal.get('terminal');
        tempHash.endTerminalView = startTerminal;
        endObj = SC.Object.create( LinkIt.Link, tempHash );
        //console.log('Bi(%@): (%@).%@ => (%@).%@'.fmt(eDir, SC.guidFor(endNode), tempHash.startTerminal, SC.guidFor(startNode), tempHash.endTerminal));
        return [startObj, endObj];
      }
    }
  },
  
  /**
    @private
  */
  _cleanupMouseDown: function() {
    this._mouseDownEvent = this._mouseDownAt = null ;
  }

};


/* >>>>>>>>>> BEGIN source/views/canvas.js */
// ==========================================================================
// LinkIt.CanvasView
// ==========================================================================
/*globals G_vmlCanvasManager LinkIt SCUI*/

sc_require('libs/excanvas');

/** @class

  This is the canvas tag that draws the line on the screen

  @extends SC.View
  @author Jonathan Lewis
  @author Evin Grano
  @author Mohammed Taher
  @version 0.1
*/

LinkIt.CanvasView = SC.CollectionView.extend({

  // PUBLIC PROPERTIES

  classNames: ['linkit-canvas'],

  /**
    YES if there are no nodes present on the canvas.  Provided so you can style
    the canvas differently when empty if you want to.
  */
  isEmpty: YES,
  
  /**
    SC.CollectionView property that lets delete keys be detected
  */
  acceptsFirstResponder: YES,

  /**
  */
  canDeleteContent: YES,

  /**
    SC.CollectionView property that allows clearing the selection by clicking
    in an empty area.
  */
  allowDeselectAll: YES,

  /**
    Optional target for an action to be performed upon right-clicking anywhere
    on the canvas.
  */
  contextMenuTarget: null,
  
  /**
    Optional action to be performed when the canvas is right-clicked anywhere.
  */
  contextMenuAction: null,

  /**
    How close you have to click to a line before it is considered a hit
  */
  LINK_SELECTION_FREEDOM: 6,
  
  /**
    Pointer to selected link object
  */
  linkSelection: null,
  
  /**
  */
  displayProperties: ['frame'],

  /**
  * Easy to use detection of the canvas class
  */
  isCanvas : YES,
  
  //*** SC.DropTarget ***
  /**
  	Must be true when your view is instantiated.

  	Drop targets must be specially registered in order to receive drop
  	events.  SproutCore knows to register your view when this property
  	is true on view creation.
  */  
  isDropTarget: YES,
  
  // PUBLIC METHODS
  
  /**
   * You would need to override this function with your specific handler
   * to handle Drops to the canvas.
   */
  acceptCanvasDrop: YES,
  
  computeDragOperations: function(drag, evt) {
  	// Make it dependent on acceptCanvasDrop
    return this.acceptCanvasDrop?SC.DRAG_LINK:SC.DRAG_NONE;
  }, 
  
  /**
   * Overridden perform drag operation so that CollectionView#performDragOperation will
   * not get called.
   * If you would like to implement a Canvas Drop to Create a new element
   * just override this operation to do what you need to do 
   * 
   * @param drag
   * @param op
   * @returns
   */
  performDragOperation: function(drag, op) {
  	return SC.DRAG_NONE;
  },
  
 
  /**
    Call this to trigger a links refresh
  */
  linksDidChange: function() {
    //console.log('%@.linksDidChange()'.fmt(this));
    this.invokeOnce(this._updateLinks);
  },

  render: function(context, firstTime) {
    var ctx, ce, frame = this.get('frame');
    
    if (firstTime && !SC.browser.msie) {
      context.push('<canvas class="base-layer" width="%@" height="%@"></canvas>'.fmt(frame.width, frame.height));
    }

    this.invokeOnce('updateCanvas');
    
    arguments.callee.base.apply(this,arguments);
  },
  
  updateCanvas: function() {
    var ce, ctx = this._canvasContext, 
        frame = this.get('clippingFrame');
    if (!ctx){
      ce = this.$('canvas.base-layer');
      ctx = (ce && ce.length > 0) ? ce[0].getContext('2d') : null;
    }
    
    if (ctx) {
      ctx.clearRect(frame.x, frame.y, frame.width + 4, frame.height + 4);      
      this._drawLinks(ctx);
    } else {
      this.set('layerNeedsUpdate', YES) ;
    }
  },
  
  didCreateLayer: function() {
    if (SC.browser.msie) {
      var frame = this.get('frame');
      var canvas = document.createElement('CANVAS');
      canvas.className = 'base-layer';
      canvas.width = frame.width;
      canvas.height = frame.height;
      this.$().append(canvas);
      canvas = G_vmlCanvasManager.initElement(canvas);
      this._canvasie = canvas;
    }
  },

  didReload: function(invalid) {
    //console.log('%@.didReload()'.fmt(this));
    var viewIndex = {};
    var content = this.get('content') || [];
    var len = content.get('length');
    var node, nodeID, view;
    for (var i = 0; i < len; i++) {
      node = content.objectAt(i);
      nodeID = SC.guidFor(node);
      view = this.itemViewForContentIndex(i);
      viewIndex[nodeID] = view;
    }
    this._nodeViewIndex = viewIndex;
  },

  /**
    Overrides SC.CollectionView.createItemView().
    In addition to creating new view instance, it also overrides the layout
    to position the view according to where the LinkIt.Node API indicates, or
    randomly generated position if that's not present.
  */
  createItemView: function(exampleClass, idx, attrs) {
    var view, frame;
    var layout, position;
    var node = attrs.content;

    if (exampleClass) {
      view = exampleClass.create(attrs);
    }
    else { // if no node view, create a default view with an error message in it
      view = SC.LabelView.create(attrs, {
        layout: { left: 0, top: 0, width: 150, height: 50 },
        value: 'Missing NodeView'
      });
    }

    frame = view.get('frame');
    position = this._getItemPosition(node);

    // generate a random position if it's not present
    if (!position) {
      position = this._genRandomPosition();
      this._setItemPosition(node, position);
    }
    
    // override the layout so we can control positioning of this node view
    layout = { top: position.y, left: position.x, width: frame.width, height: frame.height };
    view.set('layout', layout);
    return view;
  },

  /**
    Override this method from SC.CollectionView to handle link deletion.
    Handles regular item deletion by calling arguments.callee.base.apply(this,arguments) first.
  */
  deleteSelection: function() {
    if (this.get('isEditable')) {
      arguments.callee.base.apply(this,arguments);
      this.deleteLinkSelection();
    }

    // Always return YES since this becomes the return value of the keyDown() method
    // in SC.CollectionView and we have to signal we are absorbing backspace keys whether
    // we delete anything or not, or the browser will treat it like the Back button.
    return YES;
  },

  /**
    Attempts to delete the link selection if present and possible
  */
  deleteLinkSelection: function() {
    var link = this.get('linkSelection');

    if (link && link.canDelete() && this.get('isEditable')) {
      var startNode = link.get('startNode');
      var endNode = link.get('endNode');
      
      if (startNode) {
        startNode.deleteLink(link);
      }
      
      if (endNode) {
        endNode.deleteLink(link);
      }
      
      this.set('linkSelection', null);
      this.displayDidChange();
    }
  },

  mouseDown: function(evt) {
    var pv, frame, globalFrame, canvasX, canvasY, itemView, menuPane, menuOptions;
    var linkSelection, startNode, endNode, canDelete;

    arguments.callee.base.apply(this,arguments);

    // init the drag data
    this._dragData = null;

    if (evt && (evt.which === 3) || (evt.ctrlKey && evt.which === 1)) {
      if (this.get('isEditable')) {
        linkSelection = this.get('linkSelection');
        if (linkSelection && linkSelection.canDelete() && !this.getPath('selection.length')) {
          menuOptions = [
            { title: "Delete Selected Link".loc(), target: this, action: 'deleteLinkSelection', isEnabled: YES }
          ];

          menuPane = SCUI.ContextMenuPane.create({
            contentView: SC.View.design({}),
            layout: { width: 194, height: 0 },
            itemTitleKey: 'title',
            itemTargetKey: 'target',
            itemActionKey: 'action',
            itemSeparatorKey: 'isSeparator',
            itemIsEnabledKey: 'isEnabled',
            items: menuOptions
          });
  
          menuPane.popup(this, evt);
        }
      }
    }
    else {
      pv = this.get('parentView');
      frame = this.get('frame');
      globalFrame = pv ? pv.convertFrameToView(frame, null) : frame;
      canvasX = evt.pageX - globalFrame.x;
      canvasY = evt.pageY - globalFrame.y;
      this._selectLink( {x: canvasX, y: canvasY} );

      if (this.get('isEditable')) { // only allow possible drag if this view is editable
        itemView = this.itemViewForEvent(evt);
        if (itemView) {
          this._dragData = SC.clone(itemView.get('layout'));
          this._dragData.startPageX = evt.pageX;
          this._dragData.startPageY = evt.pageY;
          this._dragData.view = itemView;
          this._dragData.itemFrame = itemView.get('frame'); // note this assumes the item's frame will not change during the drag
          this._dragData.ownerFrame = this.get('frame'); // note this assumes the canvas' frame will not change during the drag
          this._dragData.didMove = NO; // hasn't moved yet; drag will update this
        }
      }
    }
    
    return YES;
  }, 

  mouseDragged: function(evt) {
    var x, y, itemFrame, thisFrame;

    if (this._dragData) {
      this._dragData.didMove = YES; // so that mouseUp knows whether to report the new position.

      // Get width & height of item and the canvas.  Note that this assumes neither will change
      // during the drag.
      itemFrame = this._dragData.itemFrame;
      thisFrame = this._dragData.ownerFrame;

      // proposed new position
      x = this._dragData.left + evt.pageX - this._dragData.startPageX;
      y = this._dragData.top + evt.pageY - this._dragData.startPageY;

      // disallow dragging beyond the borders
      if (x < 0) {
        x = 0;
      }
      else if ((x + itemFrame.width) > thisFrame.width) {
        x = thisFrame.width - itemFrame.width;
      }
      
      if (y < 0) {
        y = 0;
      }
      else if ((y + itemFrame.height) > thisFrame.height) {
        y = thisFrame.height - itemFrame.height;
      }

      this._dragData.view.adjust({ left: x, top: y });
      this.invokeOnce('updateCanvas'); // so that lines get redrawn
    }

    return YES;
  },

  mouseUp: function(evt) {
    var ret = arguments.callee.base.apply(this,arguments);
    var layout, content, newPosition, action;
    
    if (this._dragData && this._dragData.didMove) {
      layout = this._dragData.view.get('layout');
      content = this._dragData.view.get('content');

      if (content && content.get('isNode')) {
        newPosition = { x: layout.left, y: layout.top };
        this._setItemPosition(content, newPosition);
      }
    }

    this._dragData = null; // clean up

    if (evt && (evt.which === 3) || (evt.ctrlKey && evt.which === 1)) {
      action = this.get('contextMenuAction');

      if (action) {
        this.getPath('pane.rootResponder').sendAction(action, this.get('contextMenuTarget'), this, this.get('pane'), evt);
      }
    }
    
    return ret;
  },

  // PRIVATE METHODS
  
  _layoutForNodeView: function(nodeView, node) {
    var layout = null, position, frame;

    if (nodeView && node) {
      frame = nodeView.get('frame');
      position = this._getItemPosition(node);

      // generate a random position if it's not present
      if (!position) {
        position = this._genRandomPosition();
        this._setItemPosition(node, position);
      }

      layout = { top: position.x, left: position.y, width: frame.width, height: frame.height };
    }
    return layout;
  },
  
  _updateLinks: function() {
    //console.log('%@._updateLinks()'.fmt(this));
    var x, curr, links = [],
        ni = this._nodeIndex || {},
        nodes = this.get('content');
    if (nodes) {
      var numNodes = nodes.get('length');
      var node, i, j, nodeLinks, key, len, link;
      var startNode, endNode;
      for( x in ni ){
        node = ni[x];
        if (node && (key = node.get('linksKey'))) {
          nodeLinks = node.get(key);
          links = links.concat(nodeLinks);
        }
      }
    
      var linkSelection = this.get('linkSelection');
      this.set('linkSelection', null);
      if (linkSelection) {
        var selectedID = LinkIt.genLinkID(linkSelection);
        len = links.get('length');
        for (i = 0; i < len; i++) {
          link = links.objectAt(i);
          if (LinkIt.genLinkID(link) === selectedID) {
            this.set('linkSelection', link);
            link.set('isSelected', YES);
            break;
          }
        }
      }
    }
    this._links = links;
    this.updateCanvas();
  },

  /**
  */
  _drawLinks: function(context) {
    var links = this._links;
    var numLinks = links.get('length');
    var link, points, i, linkID;
    for (i = 0; i < numLinks; i++) {
      link = links.objectAt(i);
      if (!SC.none(link)) {
        points = this._endpointsFor(link);
        if (points) {
          link.drawLink(context);
        }
      }
    }
  },
  
  _endpointsFor: function(link) {
    var startTerminal = this._terminalViewFor(link.get('startNode'), link.get('startTerminal'));
    var endTerminal = this._terminalViewFor(link.get('endNode'), link.get('endTerminal'));
    var startPt = null, endPt = null, pv, frame;
    
    if (startTerminal && endTerminal) {
      pv = startTerminal.get('parentView');
      if (pv) {
        frame = pv.convertFrameToView(startTerminal.get('frame'), this);
        startPt = {};
        startPt.x = SC.midX(frame); startPt.y = SC.midY(frame);
        link.set('startPt', startPt);
      }
    
      // Second Find the End
      pv = endTerminal.get('parentView');
      if (pv) {
        frame = pv.convertFrameToView(endTerminal.get('frame'), this);
        endPt = {};
        endPt.x = SC.midX(frame); endPt.y = SC.midY(frame);
        link.set('endPt', endPt);
      }

      var linkStyle = startTerminal.get('linkStyle');
      if (linkStyle) {
        link.set('linkStyle', linkStyle);
      }
    }
    return startPt && endPt ? { startPt: startPt, endPt: endPt } : null;
  },
  
  /**
    pt = mouse click location { x: , y: } in canvas frame space
  */
  _selectLink: function(pt) {
    //console.log('%@._selectLink()'.fmt(this));
    var links = this._links || [];
    var len = links.get('length');
    var link, dist, i;

    // we compare distances squared to avoid costly square root calculations when finding distances
    var maxDist = (this.LINE_SELECTION_FREEDOM * this.LINE_SELECTION_FREEDOM) || 25;

    this.set('linkSelection', null);
    for (i = 0; i < len; i++) {
      link = links.objectAt(i);
      dist = link.distanceSquaredFromLine(pt);
      if ((SC.typeOf(dist) === SC.T_NUMBER) && (dist <= maxDist)) {
        link.set('isSelected', YES);
        this.set('linkSelection', link);
        break;
      }
      else {
        link.set('isSelected', NO);
      }
    }

    // no more lines to select, just mark all the other lines as not selected
    for (i = i + 1; i < len; i++) {
      link = links.objectAt(i);
      link.set('isSelected', NO);
    }

    // trigger a redraw of the canvas
    this.invokeOnce('updateCanvas');
  },
  
  _terminalViewFor: function(node, terminal) {
    var nodeView = this._nodeViewIndex[SC.guidFor(node)];
    if (nodeView && nodeView.terminalViewFor) {
      return nodeView.terminalViewFor(terminal);
    }
    return null;
  },

  _handleContentDidChange: function() {
    this._nodeSetup();
    this.linksDidChange(); // schedules a links update at the end of the run loop
  },
  
  /**
  */
  _contentDidChange: function() {
    this.invokeOnce('_handleContentDidChange');
  }.observes('*content.[]'), // without the '*' at the beginning, this doesn't get triggered
  
  _nodeSetup: function(){
    var nodes = this.get('content');
    var numNodes = 0;
    var node, nodeID;
    this._nodeIndex = this._nodeIndex || {};
    if (nodes) {
      numNodes = nodes.get('length');
      for (var i = 0; i < numNodes; i++) {
        node = nodes.objectAt(i);
        nodeID =  SC.guidFor(node);
        if (SC.none(this._nodeIndex[nodeID])){
          node.registerInvalidationDelegate(this, 'linksDidChange');
          this._nodeIndex[nodeID] = node;
        } 
      }
    }

    // Update the canvas state
    this.set('isEmpty', numNodes <= 0);
  },
  
  /**
    Encapsulates the standard way the dashboard attempts to extract the last
    position from the dashboard element.
    Returns null if unsuccessful.
  */
  _getItemPosition: function(item) {
    var posKey = item ? item.get('positionKey') : null;
    var pos = posKey ? item.get(posKey) : null;

    if (posKey && pos) {
      pos = { x: (parseFloat(pos.x) || 0), y: (parseFloat(pos.y) || 0) };
    }
    
    return pos;
  },
  
  /**
    Encapsulates the standard way the dashboard attempts to store the last
    position on a dashboard element.
  */
  _setItemPosition: function(item, pos) {
    var posKey = item ? item.get('positionKey') : null;

    if (posKey) {
      item.set(posKey, pos);
    }
  },
  
  /**
    Generates a random (x,y) where x=[10, 600), y=[10, 400)
  */
  _genRandomPosition: function() {
    return {
      x: Math.floor(10 + Math.random() * 590),
      y: Math.floor(10 + Math.random() * 390)
    };
  },
  
  // PRIVATE PROPERTIES
  
  /**
  */
  links: [],

  _nodeIndex: {},
  _nodeViewIndex: {},
  
  /**
    @private: parameters
  */
  _dragData: null,
  
  _canvasContext: null
  
});


/* >>>>>>>>>> BEGIN source/views/drag_link.js */
// ==========================================================================
// LinkIt.DragLink
// ==========================================================================
/*globals G_vmlCanvasManager*/

sc_require('mixins/link');

/** @class

  This is the canvas tag that draws the line on the screen

  @extends SC.View
  @author Evin Grano
  @author Jonathan Lewis
  @version 0.1
*/

LinkIt.DragLink = SC.View.extend( LinkIt.Link,
/** @scope LinkIt.DragLink.prototype */ {

  classNames: ['linkIt-draglink'],
  
  displayProperties: ['startPt', 'endPt'],
  
  render: function(context, firstTime) {
    if (firstTime){
      if (!SC.browser.msie) {
        context.push('<canvas>test</canvas>');
      }
    }
    else
    { 
      //LinkIt.log('Drawing DragLink...');
      var canvasElem = this.$('canvas');
      var frame = this.get('frame');
      
      if (canvasElem && frame) {
        var width = frame.width;
        var height = frame.height;
    
        // Set the position, height, and width
        canvasElem.attr('width', width);
        canvasElem.attr('height', height);

        if (canvasElem.length > 0) {
          var cntx = this._canvasie ? this._canvasie.getContext('2d') : canvasElem[0].getContext('2d'); // Get the actual canvas object context
          if (cntx) {
            cntx.clearRect(0, 0, width, height);

            // Find the X Draw positions
            var startPt = this.get('startPt');
            var endPt = this.get('endPt');
      
            // skip if they are the same...
            var xDiff = Math.abs(startPt.x - endPt.x);
            var yDiff = Math.abs(startPt.y - endPt.y);
            if (xDiff > 5 || yDiff > 5){
              if (this.drawLink) {
                this.drawLink(cntx);
              }
            }
          }
          else {
            LinkIt.log("LinkIt.DragLink.render(): Canvas object context is not accessible.");
          }
        }
        else {
          LinkIt.log("LinkIt.DragLink.render(): Canvas element has length zero.");
        }
      }
      else {
        LinkIt.log("LinkIt.DragLink.render(): Canvas element or frame unaccessible.");
      }
    }
    arguments.callee.base.apply(this,arguments);
  },

  didCreateLayer: function(){
    if (SC.browser.msie) {
      var frame = this.get('frame');
      var canvas = document.createElement('CANVAS');
      canvas.width = frame.width;
      canvas.height = frame.height;
      this.$().append(canvas);
      canvas = G_vmlCanvasManager.initElement(canvas);
      this._canvasie = canvas;
    }
    
    this.set('layoutNeedsUpdate', YES);
  }
  
});


