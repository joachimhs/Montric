/* >>>>>>>>>> BEGIN javascript.js */



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



/* >>>>>>>>>> BEGIN javascript.js */
/* >>>>>>>>>> BEGIN source/raphael.js */
/*!
 * Raphael 1.5.2 - JavaScript Vector Library
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Licensed under the MIT (http://raphaeljs.com/license.html) license.
 */
(function () {
    function R() {
        if (R.is(arguments[0], array)) {
            var a = arguments[0],
                cnv = create[apply](R, a.splice(0, 3 + R.is(a[0], nu))),
                res = cnv.set();
            for (var i = 0, ii = a[length]; i < ii; i++) {
                var j = a[i] || {};
                elements[has](j.type) && res[push](cnv[j.type]().attr(j));
            }
            return res;
        }
        return create[apply](R, arguments);
    }
    R.version = "1.5.2";
    var separator = /[, ]+/,
        elements = {circle: 1, rect: 1, path: 1, ellipse: 1, text: 1, image: 1},
        formatrg = /\{(\d+)\}/g,
        proto = "prototype",
        has = "hasOwnProperty",
        doc = document,
        win = window,
        oldRaphael = {
            was: Object[proto][has].call(win, "Raphael"),
            is: win.Raphael
        },
        Paper = function () {
            this.customAttributes = {};
        },
        paperproto,
        appendChild = "appendChild",
        apply = "apply",
        concat = "concat",
        supportsTouch = "createTouch" in doc,
        E = "",
        S = " ",
        Str = String,
        split = "split",
        events = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend orientationchange touchcancel gesturestart gesturechange gestureend"[split](S),
        touchMap = {
            mousedown: "touchstart",
            mousemove: "touchmove",
            mouseup: "touchend"
        },
        join = "join",
        length = "length",
        lowerCase = Str[proto].toLowerCase,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        nu = "number",
        string = "string",
        array = "array",
        toString = "toString",
        fillString = "fill",
        objectToString = Object[proto][toString],
        paper = {},
        push = "push",
        ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,
        isnan = {"NaN": 1, "Infinity": 1, "-Infinity": 1},
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        round = math.round,
        setAttribute = "setAttribute",
        toFloat = parseFloat,
        toInt = parseInt,
        ms = " progid:DXImageTransform.Microsoft",
        upperCase = Str[proto].toUpperCase,
        availableAttrs = {blur: 0, "clip-rect": "0 0 1e9 1e9", cursor: "default", cx: 0, cy: 0, fill: "#fff", "fill-opacity": 1, font: '10px "Arial"', "font-family": '"Arial"', "font-size": "10", "font-style": "normal", "font-weight": 400, gradient: 0, height: 0, href: "http://raphaeljs.com/", opacity: 1, path: "M0,0", r: 0, rotation: 0, rx: 0, ry: 0, scale: "1 1", src: "", stroke: "#000", "stroke-dasharray": "", "stroke-linecap": "butt", "stroke-linejoin": "butt", "stroke-miterlimit": 0, "stroke-opacity": 1, "stroke-width": 1, target: "_blank", "text-anchor": "middle", title: "Raphael", translation: "0 0", width: 0, x: 0, y: 0},
        availableAnimAttrs = {along: "along", blur: nu, "clip-rect": "csv", cx: nu, cy: nu, fill: "colour", "fill-opacity": nu, "font-size": nu, height: nu, opacity: nu, path: "path", r: nu, rotation: "csv", rx: nu, ry: nu, scale: "csv", stroke: "colour", "stroke-opacity": nu, "stroke-width": nu, translation: "csv", width: nu, x: nu, y: nu},
        rp = "replace",
        animKeyFrames= /^(from|to|\d+%?)$/,
        commaSpaces = /\s*,\s*/,
        hsrg = {hs: 1, rg: 1},
        p2s = /,?([achlmqrstvxz]),?/gi,
        pathCommand = /([achlmqstvz])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?\s*,?\s*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[-+]?\d+)?)\s*,?\s*/ig,
        radial_gradient = /^r(?:\(([^,]+?)\s*,\s*([^\)]+?)\))?/,
        sortByKey = function (a, b) {
            return a.key - b.key;
        };

    R.type = (win.SVGAngle || doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML");
    if (R.type == "VML") {
        var d = doc.createElement("div"),
            b;
        d.innerHTML = '<v:shape adj="1"/>';
        b = d.firstChild;
        b.style.behavior = "url(#default#VML)";
        if (!(b && typeof b.adj == "object")) {
            return R.type = null;
        }
        d = null;
    }
    R.svg = !(R.vml = R.type == "VML");
    Paper[proto] = R[proto];
    paperproto = Paper[proto];
    R._id = 0;
    R._oid = 0;
    R.fn = {};
    R.is = function (o, type) {
        type = lowerCase.call(type);
        if (type == "finite") {
            return !isnan[has](+o);
        }
        return  (type == "null" && o === null) ||
                (type == typeof o) ||
                (type == "object" && o === Object(o)) ||
                (type == "array" && Array.isArray && Array.isArray(o)) ||
                objectToString.call(o).slice(8, -1).toLowerCase() == type;
    };
    R.angle = function (x1, y1, x2, y2, x3, y3) {
        if (x3 == null) {
            var x = x1 - x2,
                y = y1 - y2;
            if (!x && !y) {
                return 0;
            }
            return ((x < 0) * 180 + math.atan(-y / -x) * 180 / PI + 360) % 360;
        } else {
            return R.angle(x1, y1, x3, y3) - R.angle(x2, y2, x3, y3);
        }
    };
    R.rad = function (deg) {
        return deg % 360 * PI / 180;
    };
    R.deg = function (rad) {
        return rad * 180 / PI % 360;
    };
    R.snapTo = function (values, value, tolerance) {
        tolerance = R.is(tolerance, "finite") ? tolerance : 10;
        if (R.is(values, array)) {
            var i = values.length;
            while (i--) if (abs(values[i] - value) <= tolerance) {
                return values[i];
            }
        } else {
            values = +values;
            var rem = value % values;
            if (rem < tolerance) {
                return value - rem;
            }
            if (rem > values - tolerance) {
                return value - rem + values;
            }
        }
        return value;
    };
    function createUUID() {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [],
            i = 0;
        for (; i < 32; i++) {
            s[i] = (~~(math.random() * 16))[toString](16);
        }
        s[12] = 4;  // bits 12-15 of the time_hi_and_version field to 0010
        s[16] = ((s[16] & 3) | 8)[toString](16);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        return "r-" + s[join]("");
    }

    R.setWindow = function (newwin) {
        win = newwin;
        doc = win.document;
    };
    // colour utilities
    var toHex = function (color) {
        if (R.vml) {
            // http://dean.edwards.name/weblog/2009/10/convert-any-colour-value-to-hex-in-msie/
            var trim = /^\s+|\s+$/g;
            var bod;
            try {
                var docum = new ActiveXObject("htmlfile");
                docum.write("<body>");
                docum.close();
                bod = docum.body;
            } catch(e) {
                bod = createPopup().document.body;
            }
            var range = bod.createTextRange();
            toHex = cacher(function (color) {
                try {
                    bod.style.color = Str(color)[rp](trim, E);
                    var value = range.queryCommandValue("ForeColor");
                    value = ((value & 255) << 16) | (value & 65280) | ((value & 16711680) >>> 16);
                    return "#" + ("000000" + value[toString](16)).slice(-6);
                } catch(e) {
                    return "none";
                }
            });
        } else {
            var i = doc.createElement("i");
            i.title = "Rapha\xebl Colour Picker";
            i.style.display = "none";
            doc.body[appendChild](i);
            toHex = cacher(function (color) {
                i.style.color = color;
                return doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
            });
        }
        return toHex(color);
    },
    hsbtoString = function () {
        return "hsb(" + [this.h, this.s, this.b] + ")";
    },
    hsltoString = function () {
        return "hsl(" + [this.h, this.s, this.l] + ")";
    },
    rgbtoString = function () {
        return this.hex;
    };
    R.hsb2rgb = function (h, s, b, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "b" in h) {
            b = h.b;
            s = h.s;
            h = h.h;
            o = h.o;
        }
        return R.hsl2rgb(h, s, b / 2, o);
    };
    R.hsl2rgb = function (h, s, l, o) {
        if (R.is(h, "object") && "h" in h && "s" in h && "l" in h) {
            l = h.l;
            s = h.s;
            h = h.h;
        }
        if (h > 1 || s > 1 || l > 1) {
            h /= 360;
            s /= 100;
            l /= 100;
        }
        var rgb = {},
            channels = ["r", "g", "b"],
            t2, t1, t3, r, g, b;
        if (!s) {
            rgb = {
                r: l,
                g: l,
                b: l
            };
        } else {
            if (l < .5) {
                t2 = l * (1 + s);
            } else {
                t2 = l + s - l * s;
            }
            t1 = 2 * l - t2;
            for (var i = 0; i < 3; i++) {
                t3 = h + 1 / 3 * -(i - 1);
                t3 < 0 && t3++;
                t3 > 1 && t3--;
                if (t3 * 6 < 1) {
                    rgb[channels[i]] = t1 + (t2 - t1) * 6 * t3;
                } else if (t3 * 2 < 1) {
                    rgb[channels[i]] = t2;
                } else if (t3 * 3 < 2) {
                    rgb[channels[i]] = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                } else {
                    rgb[channels[i]] = t1;
                }
            }
        }
        rgb.r *= 255;
        rgb.g *= 255;
        rgb.b *= 255;
        rgb.hex = "#" + (16777216 | rgb.b | (rgb.g << 8) | (rgb.r << 16)).toString(16).slice(1);
        R.is(o, "finite") && (rgb.opacity = o);
        rgb.toString = rgbtoString;
        return rgb;
    };
    R.rgb2hsb = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            hue,
            saturation,
            brightness = max;
        if (min == max) {
            return {h: 0, s: 0, b: max, toString: hsbtoString};
        } else {
            var delta = (max - min);
            saturation = delta / max;
            if (red == max) {
                hue = (green - blue) / delta;
            } else if (green == max) {
                hue = 2 + ((blue - red) / delta);
            } else {
                hue = 4 + ((red - green) / delta);
            }
            hue /= 6;
            hue < 0 && hue++;
            hue > 1 && hue--;
        }
        return {h: hue, s: saturation, b: brightness, toString: hsbtoString};
    };
    R.rgb2hsl = function (red, green, blue) {
        if (green == null && R.is(red, "object") && "r" in red && "g" in red && "b" in red) {
            blue = red.b;
            green = red.g;
            red = red.r;
        }
        if (green == null && R.is(red, string)) {
            var clr = R.getRGB(red);
            red = clr.r;
            green = clr.g;
            blue = clr.b;
        }
        if (red > 1 || green > 1 || blue > 1) {
            red /= 255;
            green /= 255;
            blue /= 255;
        }
        var max = mmax(red, green, blue),
            min = mmin(red, green, blue),
            h,
            s,
            l = (max + min) / 2,
            hsl;
        if (min == max) {
            hsl =  {h: 0, s: 0, l: l};
        } else {
            var delta = max - min;
            s = l < .5 ? delta / (max + min) : delta / (2 - max - min);
            if (red == max) {
                h = (green - blue) / delta;
            } else if (green == max) {
                h = 2 + (blue - red) / delta;
            } else {
                h = 4 + (red - green) / delta;
            }
            h /= 6;
            h < 0 && h++;
            h > 1 && h--;
            hsl = {h: h, s: s, l: l};
        }
        hsl.toString = hsltoString;
        return hsl;
    };
    R._path2string = function () {
        return this.join(",")[rp](p2s, "$1");
    };
    function cacher(f, scope, postprocessor) {
        function newf() {
            var arg = Array[proto].slice.call(arguments, 0),
                args = arg[join]("\u25ba"),
                cache = newf.cache = newf.cache || {},
                count = newf.count = newf.count || [];
            if (cache[has](args)) {
                return postprocessor ? postprocessor(cache[args]) : cache[args];
            }
            count[length] >= 1e3 && delete cache[count.shift()];
            count[push](args);
            cache[args] = f[apply](scope, arg);
            return postprocessor ? postprocessor(cache[args]) : cache[args];
        }
        return newf;
    }
 
    R.getRGB = cacher(function (colour) {
        if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
            return {r: -1, g: -1, b: -1, hex: "none", error: 1};
        }
        if (colour == "none") {
            return {r: -1, g: -1, b: -1, hex: "none"};
        }
        !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));
        var res,
            red,
            green,
            blue,
            opacity,
            t,
            values,
            rgb = colour.match(colourRegExp);
        if (rgb) {
            if (rgb[2]) {
                blue = toInt(rgb[2].substring(5), 16);
                green = toInt(rgb[2].substring(3, 5), 16);
                red = toInt(rgb[2].substring(1, 3), 16);
            }
            if (rgb[3]) {
                blue = toInt((t = rgb[3].charAt(3)) + t, 16);
                green = toInt((t = rgb[3].charAt(2)) + t, 16);
                red = toInt((t = rgb[3].charAt(1)) + t, 16);
            }
            if (rgb[4]) {
                values = rgb[4][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
            }
            if (rgb[5]) {
                values = rgb[5][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsb2rgb(red, green, blue, opacity);
            }
            if (rgb[6]) {
                values = rgb[6][split](commaSpaces);
                red = toFloat(values[0]);
                values[0].slice(-1) == "%" && (red *= 2.55);
                green = toFloat(values[1]);
                values[1].slice(-1) == "%" && (green *= 2.55);
                blue = toFloat(values[2]);
                values[2].slice(-1) == "%" && (blue *= 2.55);
                (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
                rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
                values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
                return R.hsl2rgb(red, green, blue, opacity);
            }
            rgb = {r: red, g: green, b: blue};
            rgb.hex = "#" + (16777216 | blue | (green << 8) | (red << 16)).toString(16).slice(1);
            R.is(opacity, "finite") && (rgb.opacity = opacity);
            return rgb;
        }
        return {r: -1, g: -1, b: -1, hex: "none", error: 1};
    }, R);
    R.getColor = function (value) {
        var start = this.getColor.start = this.getColor.start || {h: 0, s: 1, b: value || .75},
            rgb = this.hsb2rgb(start.h, start.s, start.b);
        start.h += .075;
        if (start.h > 1) {
            start.h = 0;
            start.s -= .2;
            start.s <= 0 && (this.getColor.start = {h: 0, s: 1, b: start.b});
        }
        return rgb.hex;
    };
    R.getColor.reset = function () {
        delete this.start;
    };
    // path utilities
    R.parsePathString = cacher(function (pathString) {
        if (!pathString) {
            return null;
        }
        var paramCounts = {a: 7, c: 6, h: 1, l: 2, m: 2, q: 4, s: 4, t: 2, v: 1, z: 0},
            data = [];
        if (R.is(pathString, array) && R.is(pathString[0], array)) { // rough assumption
            data = pathClone(pathString);
        }
        if (!data[length]) {
            Str(pathString)[rp](pathCommand, function (a, b, c) {
                var params = [],
                    name = lowerCase.call(b);
                c[rp](pathValues, function (a, b) {
                    b && params[push](+b);
                });
                if (name == "m" && params[length] > 2) {
                    data[push]([b][concat](params.splice(0, 2)));
                    name = "l";
                    b = b == "m" ? "l" : "L";
                }
                while (params[length] >= paramCounts[name]) {
                    data[push]([b][concat](params.splice(0, paramCounts[name])));
                    if (!paramCounts[name]) {
                        break;
                    }
                }
            });
        }
        data[toString] = R._path2string;
        return data;
    });
    R.findDotsAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
        var t1 = 1 - t,
            x = pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
            y = pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y,
            mx = p1x + 2 * t * (c1x - p1x) + t * t * (c2x - 2 * c1x + p1x),
            my = p1y + 2 * t * (c1y - p1y) + t * t * (c2y - 2 * c1y + p1y),
            nx = c1x + 2 * t * (c2x - c1x) + t * t * (p2x - 2 * c2x + c1x),
            ny = c1y + 2 * t * (c2y - c1y) + t * t * (p2y - 2 * c2y + c1y),
            ax = (1 - t) * p1x + t * c1x,
            ay = (1 - t) * p1y + t * c1y,
            cx = (1 - t) * c2x + t * p2x,
            cy = (1 - t) * c2y + t * p2y,
            alpha = (90 - math.atan((mx - nx) / (my - ny)) * 180 / PI);
        (mx > nx || my < ny) && (alpha += 180);
        return {x: x, y: y, m: {x: mx, y: my}, n: {x: nx, y: ny}, start: {x: ax, y: ay}, end: {x: cx, y: cy}, alpha: alpha};
    };
    var pathDimensions = cacher(function (path) {
        if (!path) {
            return {x: 0, y: 0, width: 0, height: 0};
        }
        path = path2curve(path);
        var x = 0, 
            y = 0,
            X = [],
            Y = [],
            p;
        for (var i = 0, ii = path[length]; i < ii; i++) {
            p = path[i];
            if (p[0] == "M") {
                x = p[1];
                y = p[2];
                X[push](x);
                Y[push](y);
            } else {
                var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                X = X[concat](dim.min.x, dim.max.x);
                Y = Y[concat](dim.min.y, dim.max.y);
                x = p[5];
                y = p[6];
            }
        }
        var xmin = mmin[apply](0, X),
            ymin = mmin[apply](0, Y);
        return {
            x: xmin,
            y: ymin,
            width: mmax[apply](0, X) - xmin,
            height: mmax[apply](0, Y) - ymin
        };
    }),
        pathClone = function (pathArray) {
            var res = [];
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            for (var i = 0, ii = pathArray[length]; i < ii; i++) {
                res[i] = [];
                for (var j = 0, jj = pathArray[i][length]; j < jj; j++) {
                    res[i][j] = pathArray[i][j];
                }
            }
            res[toString] = R._path2string;
            return res;
        },
        pathToRelative = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = pathArray[0][1];
                y = pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[push](["M", x, y]);
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != lowerCase.call(pa[0])) {
                    r[0] = lowerCase.call(pa[0]);
                    switch (r[0]) {
                        case "a":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] - x).toFixed(3);
                            r[7] = +(pa[7] - y).toFixed(3);
                            break;
                        case "v":
                            r[1] = +(pa[1] - y).toFixed(3);
                            break;
                        case "m":
                            mx = pa[1];
                            my = pa[2];
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +(pa[j] - ((j % 2) ? x : y)).toFixed(3);
                            }
                    }
                } else {
                    r = res[i] = [];
                    if (pa[0] == "m") {
                        mx = pa[1] + x;
                        my = pa[2] + y;
                    }
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                var len = res[i][length];
                switch (res[i][0]) {
                    case "z":
                        x = mx;
                        y = my;
                        break;
                    case "h":
                        x += +res[i][len - 1];
                        break;
                    case "v":
                        y += +res[i][len - 1];
                        break;
                    default:
                        x += +res[i][len - 2];
                        y += +res[i][len - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, 0, pathClone),
        pathToAbsolute = cacher(function (pathArray) {
            if (!R.is(pathArray, array) || !R.is(pathArray && pathArray[0], array)) { // rough assumption
                pathArray = R.parsePathString(pathArray);
            }
            var res = [],
                x = 0,
                y = 0,
                mx = 0,
                my = 0,
                start = 0;
            if (pathArray[0][0] == "M") {
                x = +pathArray[0][1];
                y = +pathArray[0][2];
                mx = x;
                my = y;
                start++;
                res[0] = ["M", x, y];
            }
            for (var i = start, ii = pathArray[length]; i < ii; i++) {
                var r = res[i] = [],
                    pa = pathArray[i];
                if (pa[0] != upperCase.call(pa[0])) {
                    r[0] = upperCase.call(pa[0]);
                    switch (r[0]) {
                        case "A":
                            r[1] = pa[1];
                            r[2] = pa[2];
                            r[3] = pa[3];
                            r[4] = pa[4];
                            r[5] = pa[5];
                            r[6] = +(pa[6] + x);
                            r[7] = +(pa[7] + y);
                            break;
                        case "V":
                            r[1] = +pa[1] + y;
                            break;
                        case "H":
                            r[1] = +pa[1] + x;
                            break;
                        case "M":
                            mx = +pa[1] + x;
                            my = +pa[2] + y;
                        default:
                            for (var j = 1, jj = pa[length]; j < jj; j++) {
                                r[j] = +pa[j] + ((j % 2) ? x : y);
                            }
                    }
                } else {
                    for (var k = 0, kk = pa[length]; k < kk; k++) {
                        res[i][k] = pa[k];
                    }
                }
                switch (r[0]) {
                    case "Z":
                        x = mx;
                        y = my;
                        break;
                    case "H":
                        x = r[1];
                        break;
                    case "V":
                        y = r[1];
                        break;
                    case "M":
                        mx = res[i][res[i][length] - 2];
                        my = res[i][res[i][length] - 1];
                    default:
                        x = res[i][res[i][length] - 2];
                        y = res[i][res[i][length] - 1];
                }
            }
            res[toString] = R._path2string;
            return res;
        }, null, pathClone),
        l2c = function (x1, y1, x2, y2) {
            return [x1, y1, x2, y2, x2, y2];
        },
        q2c = function (x1, y1, ax, ay, x2, y2) {
            var _13 = 1 / 3,
                _23 = 2 / 3;
            return [
                    _13 * x1 + _23 * ax,
                    _13 * y1 + _23 * ay,
                    _13 * x2 + _23 * ax,
                    _13 * y2 + _23 * ay,
                    x2,
                    y2
                ];
        },
        a2c = function (x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
            // for more information of where this math came from visit:
            // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
            var _120 = PI * 120 / 180,
                rad = PI / 180 * (+angle || 0),
                res = [],
                xy,
                rotate = cacher(function (x, y, rad) {
                    var X = x * math.cos(rad) - y * math.sin(rad),
                        Y = x * math.sin(rad) + y * math.cos(rad);
                    return {x: X, y: Y};
                });
            if (!recursive) {
                xy = rotate(x1, y1, -rad);
                x1 = xy.x;
                y1 = xy.y;
                xy = rotate(x2, y2, -rad);
                x2 = xy.x;
                y2 = xy.y;
                var cos = math.cos(PI / 180 * angle),
                    sin = math.sin(PI / 180 * angle),
                    x = (x1 - x2) / 2,
                    y = (y1 - y2) / 2;
                var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
                if (h > 1) {
                    h = math.sqrt(h);
                    rx = h * rx;
                    ry = h * ry;
                }
                var rx2 = rx * rx,
                    ry2 = ry * ry,
                    k = (large_arc_flag == sweep_flag ? -1 : 1) *
                        math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                    cx = k * rx * y / ry + (x1 + x2) / 2,
                    cy = k * -ry * x / rx + (y1 + y2) / 2,
                    f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
                    f2 = math.asin(((y2 - cy) / ry).toFixed(9));

                f1 = x1 < cx ? PI - f1 : f1;
                f2 = x2 < cx ? PI - f2 : f2;
                f1 < 0 && (f1 = PI * 2 + f1);
                f2 < 0 && (f2 = PI * 2 + f2);
                if (sweep_flag && f1 > f2) {
                    f1 = f1 - PI * 2;
                }
                if (!sweep_flag && f2 > f1) {
                    f2 = f2 - PI * 2;
                }
            } else {
                f1 = recursive[0];
                f2 = recursive[1];
                cx = recursive[2];
                cy = recursive[3];
            }
            var df = f2 - f1;
            if (abs(df) > _120) {
                var f2old = f2,
                    x2old = x2,
                    y2old = y2;
                f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
                x2 = cx + rx * math.cos(f2);
                y2 = cy + ry * math.sin(f2);
                res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
            }
            df = f2 - f1;
            var c1 = math.cos(f1),
                s1 = math.sin(f1),
                c2 = math.cos(f2),
                s2 = math.sin(f2),
                t = math.tan(df / 4),
                hx = 4 / 3 * rx * t,
                hy = 4 / 3 * ry * t,
                m1 = [x1, y1],
                m2 = [x1 + hx * s1, y1 - hy * c1],
                m3 = [x2 + hx * s2, y2 - hy * c2],
                m4 = [x2, y2];
            m2[0] = 2 * m1[0] - m2[0];
            m2[1] = 2 * m1[1] - m2[1];
            if (recursive) {
                return [m2, m3, m4][concat](res);
            } else {
                res = [m2, m3, m4][concat](res)[join]()[split](",");
                var newres = [];
                for (var i = 0, ii = res[length]; i < ii; i++) {
                    newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
                }
                return newres;
            }
        },
        findDotAtSegment = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
            var t1 = 1 - t;
            return {
                x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
                y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
            };
        },
        curveDim = cacher(function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
            var a = (c2x - 2 * c1x + p1x) - (p2x - 2 * c2x + c1x),
                b = 2 * (c1x - p1x) - 2 * (c2x - c1x),
                c = p1x - c1x,
                t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a,
                t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a,
                y = [p1y, p2y],
                x = [p1x, p2x],
                dot;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            a = (c2y - 2 * c1y + p1y) - (p2y - 2 * c2y + c1y);
            b = 2 * (c1y - p1y) - 2 * (c2y - c1y);
            c = p1y - c1y;
            t1 = (-b + math.sqrt(b * b - 4 * a * c)) / 2 / a;
            t2 = (-b - math.sqrt(b * b - 4 * a * c)) / 2 / a;
            abs(t1) > "1e12" && (t1 = .5);
            abs(t2) > "1e12" && (t2 = .5);
            if (t1 > 0 && t1 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t1);
                x[push](dot.x);
                y[push](dot.y);
            }
            if (t2 > 0 && t2 < 1) {
                dot = findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t2);
                x[push](dot.x);
                y[push](dot.y);
            }
            return {
                min: {x: mmin[apply](0, x), y: mmin[apply](0, y)},
                max: {x: mmax[apply](0, x), y: mmax[apply](0, y)}
            };
        }),
        path2curve = cacher(function (path, path2) {
            var p = pathToAbsolute(path),
                p2 = path2 && pathToAbsolute(path2),
                attrs = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                attrs2 = {x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null},
                processPath = function (path, d) {
                    var nx, ny;
                    if (!path) {
                        return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
                    }
                    !(path[0] in {T:1, Q:1}) && (d.qx = d.qy = null);
                    switch (path[0]) {
                        case "M":
                            d.X = path[1];
                            d.Y = path[2];
                            break;
                        case "A":
                            path = ["C"][concat](a2c[apply](0, [d.x, d.y][concat](path.slice(1))));
                            break;
                        case "S":
                            nx = d.x + (d.x - (d.bx || d.x));
                            ny = d.y + (d.y - (d.by || d.y));
                            path = ["C", nx, ny][concat](path.slice(1));
                            break;
                        case "T":
                            d.qx = d.x + (d.x - (d.qx || d.x));
                            d.qy = d.y + (d.y - (d.qy || d.y));
                            path = ["C"][concat](q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
                            break;
                        case "Q":
                            d.qx = path[1];
                            d.qy = path[2];
                            path = ["C"][concat](q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
                            break;
                        case "L":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], path[2]));
                            break;
                        case "H":
                            path = ["C"][concat](l2c(d.x, d.y, path[1], d.y));
                            break;
                        case "V":
                            path = ["C"][concat](l2c(d.x, d.y, d.x, path[1]));
                            break;
                        case "Z":
                            path = ["C"][concat](l2c(d.x, d.y, d.X, d.Y));
                            break;
                    }
                    return path;
                },
                fixArc = function (pp, i) {
                    if (pp[i][length] > 7) {
                        pp[i].shift();
                        var pi = pp[i];
                        while (pi[length]) {
                            pp.splice(i++, 0, ["C"][concat](pi.splice(0, 6)));
                        }
                        pp.splice(i, 1);
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                },
                fixM = function (path1, path2, a1, a2, i) {
                    if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
                        path2.splice(i, 0, ["M", a2.x, a2.y]);
                        a1.bx = 0;
                        a1.by = 0;
                        a1.x = path1[i][1];
                        a1.y = path1[i][2];
                        ii = mmax(p[length], p2 && p2[length] || 0);
                    }
                };
            for (var i = 0, ii = mmax(p[length], p2 && p2[length] || 0); i < ii; i++) {
                p[i] = processPath(p[i], attrs);
                fixArc(p, i);
                p2 && (p2[i] = processPath(p2[i], attrs2));
                p2 && fixArc(p2, i);
                fixM(p, p2, attrs, attrs2, i);
                fixM(p2, p, attrs2, attrs, i);
                var seg = p[i],
                    seg2 = p2 && p2[i],
                    seglen = seg[length],
                    seg2len = p2 && seg2[length];
                attrs.x = seg[seglen - 2];
                attrs.y = seg[seglen - 1];
                attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
                attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
                attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
                attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
                attrs2.x = p2 && seg2[seg2len - 2];
                attrs2.y = p2 && seg2[seg2len - 1];
            }
            return p2 ? [p, p2] : p;
        }, null, pathClone),
        parseDots = cacher(function (gradient) {
            var dots = [];
            for (var i = 0, ii = gradient[length]; i < ii; i++) {
                var dot = {},
                    par = gradient[i].match(/^([^:]*):?([\d\.]*)/);
                dot.color = R.getRGB(par[1]);
                if (dot.color.error) {
                    return null;
                }
                dot.color = dot.color.hex;
                par[2] && (dot.offset = par[2] + "%");
                dots[push](dot);
            }
            for (i = 1, ii = dots[length] - 1; i < ii; i++) {
                if (!dots[i].offset) {
                    var start = toFloat(dots[i - 1].offset || 0),
                        end = 0;
                    for (var j = i + 1; j < ii; j++) {
                        if (dots[j].offset) {
                            end = dots[j].offset;
                            break;
                        }
                    }
                    if (!end) {
                        end = 100;
                        j = ii;
                    }
                    end = toFloat(end);
                    var d = (end - start) / (j - i + 1);
                    for (; i < j; i++) {
                        start += d;
                        dots[i].offset = start + "%";
                    }
                }
            }
            return dots;
        }),
        getContainer = function (x, y, w, h) {
            var container;
            if (R.is(x, string) || R.is(x, "object")) {
                container = R.is(x, string) ? doc.getElementById(x) : x;
                if (container.tagName) {
                    if (y == null) {
                        return {
                            container: container,
                            width: container.style.pixelWidth || container.offsetWidth,
                            height: container.style.pixelHeight || container.offsetHeight
                        };
                    } else {
                        return {container: container, width: y, height: w};
                    }
                }
            } else {
                return {container: 1, x: x, y: y, width: w, height: h};
            }
        },
        plugins = function (con, add) {
            var that = this;
            for (var prop in add) {
                if (add[has](prop) && !(prop in con)) {
                    switch (typeof add[prop]) {
                        case "function":
                            (function (f) {
                                con[prop] = con === that ? f : function () { return f[apply](that, arguments); };
                            })(add[prop]);
                        break;
                        case "object":
                            con[prop] = con[prop] || {};
                            plugins.call(this, con[prop], add[prop]);
                        break;
                        default:
                            con[prop] = add[prop];
                        break;
                    }
                }
            }
        },
        tear = function (el, paper) {
            el == paper.top && (paper.top = el.prev);
            el == paper.bottom && (paper.bottom = el.next);
            el.next && (el.next.prev = el.prev);
            el.prev && (el.prev.next = el.next);
        },
        tofront = function (el, paper) {
            if (paper.top === el) {
                return;
            }
            tear(el, paper);
            el.next = null;
            el.prev = paper.top;
            paper.top.next = el;
            paper.top = el;
        },
        toback = function (el, paper) {
            if (paper.bottom === el) {
                return;
            }
            tear(el, paper);
            el.next = paper.bottom;
            el.prev = null;
            paper.bottom.prev = el;
            paper.bottom = el;
        },
        insertafter = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.top && (paper.top = el);
            el2.next && (el2.next.prev = el);
            el.next = el2.next;
            el.prev = el2;
            el2.next = el;
        },
        insertbefore = function (el, el2, paper) {
            tear(el, paper);
            el2 == paper.bottom && (paper.bottom = el);
            el2.prev && (el2.prev.next = el);
            el.prev = el2.prev;
            el2.prev = el;
            el.next = el2;
        },
        removed = function (methodname) {
            return function () {
                throw new Error("Rapha\xebl: you are calling to method \u201c" + methodname + "\u201d of removed object");
            };
        };
    R.pathToRelative = pathToRelative;
    // SVG
    if (R.svg) {
        paperproto.svgns = "http://www.w3.org/2000/svg";
        paperproto.xlink = "http://www.w3.org/1999/xlink";
        round = function (num) {
            return +num + (~~num === num) * .5;
        };
        var $ = function (el, attr) {
            if (attr) {
                for (var key in attr) {
                    if (attr[has](key)) {
                        el[setAttribute](key, Str(attr[key]));
                    }
                }
            } else {
                el = doc.createElementNS(paperproto.svgns, el);
                el.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
                return el;
            }
        };
        R[toString] = function () {
            return  "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
        };
        var thePath = function (pathString, SVG) {
            var el = $("path");
            SVG.canvas && SVG.canvas[appendChild](el);
            var p = new Element(el, SVG);
            p.type = "path";
            setFillAndStroke(p, {fill: "none", stroke: "#000", path: pathString});
            return p;
        };
        var addGradientFill = function (o, gradient, SVG) {
            var type = "linear",
                fx = .5, fy = .5,
                s = o.style;
            gradient = Str(gradient)[rp](radial_gradient, function (all, _fx, _fy) {
                type = "radial";
                if (_fx && _fy) {
                    fx = toFloat(_fx);
                    fy = toFloat(_fy);
                    var dir = ((fy > .5) * 2 - 1);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 &&
                        (fy = math.sqrt(.25 - pow(fx - .5, 2)) * dir + .5) &&
                        fy != .5 &&
                        (fy = fy.toFixed(5) - 1e-5 * dir);
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
                var vector = [0, 0, math.cos(angle * PI / 180), math.sin(angle * PI / 180)],
                    max = 1 / (mmax(abs(vector[2]), abs(vector[3])) || 1);
                vector[2] *= max;
                vector[3] *= max;
                if (vector[2] < 0) {
                    vector[0] = -vector[2];
                    vector[2] = 0;
                }
                if (vector[3] < 0) {
                    vector[1] = -vector[3];
                    vector[3] = 0;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            var id = o.getAttribute(fillString);
            id = id.match(/^url\(#(.*)\)$/);
            try {
              id && SVG.defs.removeChild(doc.getElementById(id[1]));
            } catch (e) {
              SC.Logger.warn('scui-sai exception removing element ' + id[1]);
            }
            var el = $(type + "Gradient");
            el.id = createUUID();
            $(el, type == "radial" ? {fx: fx, fy: fy} : {x1: vector[0], y1: vector[1], x2: vector[2], y2: vector[3]});
            SVG.defs[appendChild](el);
            for (var i = 0, ii = dots[length]; i < ii; i++) {
                var stop = $("stop");
                $(stop, {
                    offset: dots[i].offset ? dots[i].offset : !i ? "0%" : "100%",
                    "stop-color": dots[i].color || "#fff"
                });
                el[appendChild](stop);
            }
            $(o, {
                fill: "url(#" + el.id + ")",
                opacity: 1,
                "fill-opacity": 1
            });
            s.fill = E;
            s.opacity = 1;
            s.fillOpacity = 1;
            return 1;
        };
        var updatePosition = function (o) {
            var bbox = o.getBBox();
            $(o.pattern, {patternTransform: R.format("translate({0},{1})", bbox.x, bbox.y)});
        };
        var setFillAndStroke = function (o, params) {
            var dasharray = {
                    "": [0],
                    "none": [0],
                    "-": [3, 1],
                    ".": [1, 1],
                    "-.": [3, 1, 1, 1],
                    "-..": [3, 1, 1, 1, 1, 1],
                    ". ": [1, 3],
                    "- ": [4, 3],
                    "--": [8, 3],
                    "- .": [4, 3, 1, 3],
                    "--.": [8, 3, 1, 3],
                    "--..": [8, 3, 1, 3, 1, 3]
                },
                node = o.node,
                attrs = o.attrs,
                rot = o.rotate(),
                addDashes = function (o, value) {
                    value = dasharray[lowerCase.call(value)];
                    if (value) {
                        var width = o.attrs["stroke-width"] || "1",
                            butt = {round: width, square: width, butt: 0}[o.attrs["stroke-linecap"] || params["stroke-linecap"]] || 0,
                            dashes = [];
                        var i = value[length];
                        while (i--) {
                            dashes[i] = value[i] * width + ((i % 2) ? 1 : -1) * butt;
                        }
                        $(node, {"stroke-dasharray": dashes[join](",")});
                    }
                };
            params[has]("rotation") && (rot = params.rotation);
            var rotxy = Str(rot)[split](separator);
            if (!(rotxy.length - 1)) {
                rotxy = null;
            } else {
                rotxy[1] = +rotxy[1];
                rotxy[2] = +rotxy[2];
            }
            toFloat(rot) && o.rotate(0, true);
            for (var att in params) {
                if (params[has](att)) {
                    if (!availableAttrs[has](att)) {
                        continue;
                    }
                    var value = params[att];
                    attrs[att] = value;
                    switch (att) {
                        case "blur":
                            o.blur(value);
                            break;
                        case "rotation":
                            o.rotate(value, true);
                            break;
                        case "href":
                        case "title":
                        case "target":
                            var pn = node.parentNode;
                            if (lowerCase.call(pn.tagName) != "a") {
                                var hl = $("a");
                                pn.insertBefore(hl, node);
                                hl[appendChild](node);
                                pn = hl;
                            }
                            if (att == "target" && value == "blank") {
                                pn.setAttributeNS(o.paper.xlink, "show", "new");
                            } else {
                                pn.setAttributeNS(o.paper.xlink, att, value);
                            }
                            break;
                        case "cursor":
                            node.style.cursor = value;
                            break;
                        case "clip-rect":
                            var rect = Str(value)[split](separator);
                            if (rect[length] == 4) {
                                o.clip && o.clip.parentNode.parentNode.removeChild(o.clip.parentNode);
                                var el = $("clipPath"),
                                    rc = $("rect");
                                el.id = createUUID();
                                $(rc, {
                                    x: rect[0],
                                    y: rect[1],
                                    width: rect[2],
                                    height: rect[3]
                                });
                                el[appendChild](rc);
                                o.paper.defs[appendChild](el);
                                $(node, {"clip-path": "url(#" + el.id + ")"});
                                o.clip = rc;
                            }
                            if (!value) {
                                var clip = doc.getElementById(node.getAttribute("clip-path")[rp](/(^url\(#|\)$)/g, E));
                                clip && clip.parentNode.removeChild(clip);
                                $(node, {"clip-path": E});
                                delete o.clip;
                            }
                        break;
                        case "path":
                            if (o.type == "path") {
                                $(node, {d: value ? attrs.path = pathToAbsolute(value) : "M0,0"});
                            }
                            break;
                        case "width":
                            node[setAttribute](att, value);
                            if (attrs.fx) {
                                att = "x";
                                value = attrs.x;
                            } else {
                                break;
                            }
                        case "x":
                            if (attrs.fx) {
                                value = -attrs.x - (attrs.width || 0);
                            }
                        case "rx":
                            if (att == "rx" && o.type == "rect") {
                                break;
                            }
                        case "cx":
                            rotxy && (att == "x" || att == "cx") && (rotxy[1] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "height":
                            node[setAttribute](att, value);
                            if (attrs.fy) {
                                att = "y";
                                value = attrs.y;
                            } else {
                                break;
                            }
                        case "y":
                            if (attrs.fy) {
                                value = -attrs.y - (attrs.height || 0);
                            }
                        case "ry":
                            if (att == "ry" && o.type == "rect") {
                                break;
                            }
                        case "cy":
                            rotxy && (att == "y" || att == "cy") && (rotxy[2] += value - attrs[att]);
                            node[setAttribute](att, value);
                            o.pattern && updatePosition(o);
                            break;
                        case "r":
                            if (o.type == "rect") {
                                $(node, {rx: value, ry: value});
                            } else {
                                node[setAttribute](att, value);
                            }
                            break;
                        case "src":
                            if (o.type == "image") {
                                node.setAttributeNS(o.paper.xlink, "href", value);
                            }
                            break;
                        case "stroke-width":
                            node.style.strokeWidth = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            if (attrs["stroke-dasharray"]) {
                                addDashes(o, attrs["stroke-dasharray"]);
                            }
                            break;
                        case "stroke-dasharray":
                            addDashes(o, value);
                            break;
                        case "translation":
                            var xy = Str(value)[split](separator);
                            xy[0] = +xy[0] || 0;
                            xy[1] = +xy[1] || 0;
                            if (rotxy) {
                                rotxy[1] += xy[0];
                                rotxy[2] += xy[1];
                            }
                            translate.call(o, xy[0], xy[1]);
                            break;
                        case "scale":
                            xy = Str(value)[split](separator);
                            o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, isNaN(toFloat(xy[2])) ? null : +xy[2], isNaN(toFloat(xy[3])) ? null : +xy[3]);
                            break;
                        case fillString:
                            var isURL = Str(value).match(ISURL);
                            if (isURL) {
                                el = $("pattern");
                                var ig = $("image");
                                el.id = createUUID();
                                $(el, {x: 0, y: 0, patternUnits: "userSpaceOnUse", height: 1, width: 1});
                                $(ig, {x: 0, y: 0});
                                ig.setAttributeNS(o.paper.xlink, "href", isURL[1]);
                                el[appendChild](ig);
 
                                var img = doc.createElement("img");
                                img.style.cssText = "position:absolute;left:-9999em;top-9999em";
                                img.onload = function () {
                                    $(el, {width: this.offsetWidth, height: this.offsetHeight});
                                    $(ig, {width: this.offsetWidth, height: this.offsetHeight});
                                    doc.body.removeChild(this);
                                    o.paper.safari();
                                };
                                doc.body[appendChild](img);
                                img.src = isURL[1];
                                o.paper.defs[appendChild](el);
                                node.style.fill = "url(#" + el.id + ")";
                                $(node, {fill: "url(#" + el.id + ")"});
                                o.pattern = el;
                                o.pattern && updatePosition(o);
                                break;
                            }
                            var clr = R.getRGB(value);
                            if (!clr.error) {
                                delete params.gradient;
                                delete attrs.gradient;
                                !R.is(attrs.opacity, "undefined") &&
                                    R.is(params.opacity, "undefined") &&
                                    $(node, {opacity: attrs.opacity});
                                !R.is(attrs["fill-opacity"], "undefined") &&
                                    R.is(params["fill-opacity"], "undefined") &&
                                    $(node, {"fill-opacity": attrs["fill-opacity"]});
                            } else if ((({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper)) {
                                attrs.gradient = value;
                                attrs.fill = "none";
                                break;
                            }
                            clr[has]("opacity") && $(node, {"fill-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                        case "stroke":
                            clr = R.getRGB(value);
                            node[setAttribute](att, clr.hex);
                            att == "stroke" && clr[has]("opacity") && $(node, {"stroke-opacity": clr.opacity > 1 ? clr.opacity / 100 : clr.opacity});
                            break;
                        case "gradient":
                            (({circle: 1, ellipse: 1})[has](o.type) || Str(value).charAt() != "r") && addGradientFill(node, value, o.paper);
                            break;
                        case "opacity":
                            if (attrs.gradient && !attrs[has]("stroke-opacity")) {
                                $(node, {"stroke-opacity": value > 1 ? value / 100 : value});
                            }
                            // fall
                        case "fill-opacity":
                            if (attrs.gradient) {
                                var gradient = doc.getElementById(node.getAttribute(fillString)[rp](/^url\(#|\)$/g, E));
                                if (gradient) {
                                    var stops = gradient.getElementsByTagName("stop");
                                    stops[stops[length] - 1][setAttribute]("stop-opacity", value);
                                }
                                break;
                            }
                        default:
                            att == "font-size" && (value = toInt(value, 10) + "px");
                            var cssrule = att[rp](/(\-.)/g, function (w) {
                                return upperCase.call(w.substring(1));
                            });
                            node.style[cssrule] = value;
                            // Need following line for Firefox
                            node[setAttribute](att, value);
                            break;
                    }
                }
            }
            
            tuneText(o, params);
            if (rotxy) {
                o.rotate(rotxy.join(S));
            } else {
                toFloat(rot) && o.rotate(rot, true);
            }
        };
        var leading = 1.2,
        tuneText = function (el, params) {
            if (el.type != "text" || !(params[has]("text") || params[has]("font") || params[has]("font-size") || params[has]("x") || params[has]("y"))) {
                return;
            }
            var a = el.attrs,
                node = el.node,
                fontSize = node.firstChild ? toInt(doc.defaultView.getComputedStyle(node.firstChild, E).getPropertyValue("font-size"), 10) : 10;
 
            if (params[has]("text")) {
                a.text = params.text;
                while (node.firstChild) {
                    node.removeChild(node.firstChild);
                }
                var texts = Str(params.text)[split]("\n");
                for (var i = 0, ii = texts[length]; i < ii; i++) if (texts[i]) {
                    var tspan = $("tspan");
                    i && $(tspan, {dy: fontSize * leading, x: a.x});
                    tspan[appendChild](doc.createTextNode(texts[i]));
                    node[appendChild](tspan);
                }
            } else {
                texts = node.getElementsByTagName("tspan");
                for (i = 0, ii = texts[length]; i < ii; i++) {
                    i && $(texts[i], {dy: fontSize * leading, x: a.x});
                }
            }
            $(node, {y: a.y});
            var bb = el.getBBox(),
                dif = a.y - (bb.y + bb.height / 2);
            dif && R.is(dif, "finite") && $(node, {y: a.y + dif});
        },
        Element = function (node, svg) {
            var X = 0,
                Y = 0;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.paper = svg;
            this.attrs = this.attrs || {};
            this.transformations = []; // rotate, translate, scale
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg: 0, cx: 0, cy: 0},
                sx: 1,
                sy: 1
            };
            !svg.bottom && (svg.bottom = this);
            this.prev = svg.top;
            svg.top && (svg.top.next = this);
            svg.top = this;
            this.next = null;
        };
        var elproto = Element[proto];
        Element[proto].rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            var bbox = this.getBBox();
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null && cx !== false) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            (cy == null) && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            cx = cx == null ? bbox.x + bbox.width / 2 : cx;
            cy = cy == null ? bbox.y + bbox.height / 2 : cy;
            if (this._.rt.deg) {
                this.transformations[0] = R.format("rotate({0} {1} {2})", this._.rt.deg, cx, cy);
                this.clip && $(this.clip, {transform: R.format("rotate({0} {1} {2})", -this._.rt.deg, cx, cy)});
            } else {
                this.transformations[0] = E;
                this.clip && $(this.clip, {transform: E});
            }
            $(this.node, {transform: this.transformations[join](S)});
            return this;
        };
        Element[proto].hide = function () {
            !this.removed && (this.node.style.display = "none");
            return this;
        };
        Element[proto].show = function () {
            !this.removed && (this.node.style.display = "");
            return this;
        };
        Element[proto].remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        Element[proto].getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (this.type == "path") {
                return pathDimensions(this.attrs.path);
            }
            if (this.node.style.display == "none") {
                this.show();
                var hide = true;
            }
            var bbox = {};
            try {
                bbox = this.node.getBBox();
            } catch(e) {
                // Firefox 3.0.x plays badly here
            } finally {
                bbox = bbox || {};
            }
            if (this.type == "text") {
                bbox = {x: bbox.x, y: Infinity, width: 0, height: 0};
                for (var i = 0, ii = this.node.getNumberOfChars(); i < ii; i++) {
                    var bb = this.node.getExtentOfChar(i);
                    (bb.y < bbox.y) && (bbox.y = bb.y);
                    (bb.y + bb.height - bbox.y > bbox.height) && (bbox.height = bb.y + bb.height - bbox.y);
                    (bb.x + bb.width - bbox.x > bbox.width) && (bbox.width = bb.x + bb.width - bbox.x);
                }
            }
            hide && this.hide();
            return bbox;
        };
        Element[proto].attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, string)) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (value == null && R.is(name, array)) {
                var values = {};
                for (var j = 0, jj = name.length; j < jj; j++) {
                    values[name[j]] = this.attr(name[j]);
                }
                return values;
            }
            if (value != null) {
                var params = {};
                params[name] = value;
            } else if (name != null && R.is(name, "object")) {
                params = name;
            }
            for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                this.attrs[key] = params[key];
                for (var subkey in par) if (par[has](subkey)) {
                    params[subkey] = par[subkey];
                }
            }
            setFillAndStroke(this, params);
            return this;
        };
        Element[proto].toFront = function () {
            if (this.removed) {
                return this;
            }
            this.node.parentNode[appendChild](this.node);
            var svg = this.paper;
            svg.top != this && tofront(this, svg);
            return this;
        };
        Element[proto].toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.node.parentNode.firstChild != this.node) {
                this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild);
                toback(this, this.paper);
                var svg = this.paper;
            }
            return this;
        };
        Element[proto].insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[element.length - 1].node;
            if (node.nextSibling) {
                node.parentNode.insertBefore(this.node, node.nextSibling);
            } else {
                node.parentNode[appendChild](this.node);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        Element[proto].insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            var node = element.node || element[0].node;
            node.parentNode.insertBefore(this.node, node);
            insertbefore(this, element, this.paper);
            return this;
        };
        Element[proto].blur = function (size) {
            // Experimental. No Safari support. Use it on your own risk.
            var t = this;
            if (+size !== 0) {
                var fltr = $("filter"),
                    blur = $("feGaussianBlur");
                t.attrs.blur = size;
                fltr.id = createUUID();
                $(blur, {stdDeviation: +size || 1.5});
                fltr.appendChild(blur);
                t.paper.defs.appendChild(fltr);
                t._blur = fltr;
                $(t.node, {filter: "url(#" + fltr.id + ")"});
            } else {
                if (t._blur) {
                    t._blur.parentNode.removeChild(t._blur);
                    delete t._blur;
                    delete t.attrs.blur;
                }
                t.node.removeAttribute("filter");
            }
        };
        var theCircle = function (svg, x, y, r) {
            var el = $("circle");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, r: r, fill: "none", stroke: "#000"};
            res.type = "circle";
            $(el, res.attrs);
            return res;
        },
        theRect = function (svg, x, y, w, h, r) {
            var el = $("rect");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, r: r || 0, rx: r || 0, ry: r || 0, fill: "none", stroke: "#000"};
            res.type = "rect";
            $(el, res.attrs);
            return res;
        },
        theEllipse = function (svg, x, y, rx, ry) {
            var el = $("ellipse");
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {cx: x, cy: y, rx: rx, ry: ry, fill: "none", stroke: "#000"};
            res.type = "ellipse";
            $(el, res.attrs);
            return res;
        },
        theImage = function (svg, src, x, y, w, h) {
            var el = $("image");
            $(el, {x: x, y: y, width: w, height: h, preserveAspectRatio: "none"});
            el.setAttributeNS(svg.xlink, "href", src);
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, width: w, height: h, src: src};
            res.type = "image";
            return res;
        },
        theText = function (svg, x, y, text) {
            var el = $("text");
            $(el, {x: x, y: y, "text-anchor": "middle"});
            svg.canvas && svg.canvas[appendChild](el);
            var res = new Element(el, svg);
            res.attrs = {x: x, y: y, "text-anchor": "middle", text: text, font: availableAttrs.font, stroke: "none", fill: "#000"};
            res.type = "text";
            setFillAndStroke(res, res.attrs);
            return res;
        },
        setSize = function (width, height) {
            this.width = width || this.width;
            this.height = height || this.height;
            this.canvas[setAttribute]("width", this.width);
            this.canvas[setAttribute]("height", this.height);
            return this;
        },
        create = function () {
            var con = getContainer[apply](0, arguments),
                container = con && con.container,
                x = con.x,
                y = con.y,
                width = con.width,
                height = con.height;
            if (!container) {
                throw new Error("SVG container not found.");
            }
            var cnvs = $("svg");
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            $(cnvs, {
                xmlns: "http://www.w3.org/2000/svg",
                version: 1.1,
                width: width,
                height: height
            });
            if (container == 1) {
                cnvs.style.cssText = "position:absolute;left:" + x + "px;top:" + y + "px";
                doc.body[appendChild](cnvs);
            } else {
                if (container.firstChild) {
                    container.insertBefore(cnvs, container.firstChild);
                } else {
                    container[appendChild](cnvs);
                }
            }
            container = new Paper;
            container.width = width;
            container.height = height;
            container.canvas = cnvs;
            plugins.call(container, container, R.fn);
            container.clear();
            return container;
        };
        paperproto.clear = function () {
            var c = this.canvas;
            while (c.firstChild) {
                c.removeChild(c.firstChild);
            }
            this.bottom = this.top = null;
            (this.desc = $("desc"))[appendChild](doc.createTextNode("Created with Rapha\xebl"));
            c[appendChild](this.desc);
            c[appendChild](this.defs = $("defs"));
        };
        paperproto.remove = function () {
            this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
        };
    }

    // VML
    if (R.vml) {
        var map = {M: "m", L: "l", C: "c", Z: "x", m: "t", l: "r", c: "v", z: "x"},
            bites = /([clmz]),?([^clmz]*)/gi,
            blurregexp = / progid:\S+Blur\([^\)]+\)/g,
            val = /-?[^,\s-]+/g,
            coordsize = 1e3 + S + 1e3,
            zoom = 10,
            pathlike = {path: 1, rect: 1},
            path2vml = function (path) {
                var total =  /[ahqstv]/ig,
                    command = pathToAbsolute;
                Str(path).match(total) && (command = path2curve);
                total = /[clmz]/g;
                if (command == pathToAbsolute && !Str(path).match(total)) {
                    var res = Str(path)[rp](bites, function (all, command, args) {
                        var vals = [],
                            isMove = lowerCase.call(command) == "m",
                            res = map[command];
                        args[rp](val, function (value) {
                            if (isMove && vals[length] == 2) {
                                res += vals + map[command == "m" ? "l" : "L"];
                                vals = [];
                            }
                            vals[push](round(value * zoom));
                        });
                        return res + vals;
                    });
                    return res;
                }
                var pa = command(path), p, r;
                res = [];
                for (var i = 0, ii = pa[length]; i < ii; i++) {
                    p = pa[i];
                    r = lowerCase.call(pa[i][0]);
                    r == "z" && (r = "x");
                    for (var j = 1, jj = p[length]; j < jj; j++) {
                        r += round(p[j] * zoom) + (j != jj - 1 ? "," : E);
                    }
                    res[push](r);
                }
                return res[join](S);
            };
        
        R[toString] = function () {
            return  "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
        };
        thePath = function (pathString, vml) {
            var g = createNode("group");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = vml.coordsize;
            g.coordorigin = vml.coordorigin;
            var el = createNode("shape"), ol = el.style;
            ol.width = vml.width + "px";
            ol.height = vml.height + "px";
            el.coordsize = coordsize;
            el.coordorigin = vml.coordorigin;
            g[appendChild](el);
            var p = new Element(el, g, vml),
                attr = {fill: "none", stroke: "#000"};
            pathString && (attr.path = pathString);
            p.type = "path";
            p.path = [];
            p.Path = E;
            setFillAndStroke(p, attr);
            vml.canvas[appendChild](g);
            return p;
        };
        setFillAndStroke = function (o, params) {
            o.attrs = o.attrs || {};
            var node = o.node,
                a = o.attrs,
                s = node.style,
                xy,
                newpath = (params.x != a.x || params.y != a.y || params.width != a.width || params.height != a.height || params.r != a.r) && o.type == "rect",
                res = o;

            for (var par in params) if (params[has](par)) {
                a[par] = params[par];
            }
            if (newpath) {
                a.path = rectPath(a.x, a.y, a.width, a.height, a.r);
                o.X = a.x;
                o.Y = a.y;
                o.W = a.width;
                o.H = a.height;
            }
            params.href && (node.href = params.href);
            params.title && (node.title = params.title);
            params.target && (node.target = params.target);
            params.cursor && (s.cursor = params.cursor);
            "blur" in params && o.blur(params.blur);
            if (params.path && o.type == "path" || newpath) {
                node.path = path2vml(a.path);
            }
            if (params.rotation != null) {
                o.rotate(params.rotation, true);
            }
            if (params.translation) {
                xy = Str(params.translation)[split](separator);
                translate.call(o, xy[0], xy[1]);
                if (o._.rt.cx != null) {
                    o._.rt.cx +=+ xy[0];
                    o._.rt.cy +=+ xy[1];
                    o.setBox(o.attrs, xy[0], xy[1]);
                }
            }
            if (params.scale) {
                xy = Str(params.scale)[split](separator);
                o.scale(+xy[0] || 1, +xy[1] || +xy[0] || 1, +xy[2] || null, +xy[3] || null);
            }
            if ("clip-rect" in params) {
                var rect = Str(params["clip-rect"])[split](separator);
                if (rect[length] == 4) {
                    rect[2] = +rect[2] + (+rect[0]);
                    rect[3] = +rect[3] + (+rect[1]);
                    var div = node.clipRect || doc.createElement("div"),
                        dstyle = div.style,
                        group = node.parentNode;
                    dstyle.clip = R.format("rect({1}px {2}px {3}px {0}px)", rect);
                    if (!node.clipRect) {
                        dstyle.position = "absolute";
                        dstyle.top = 0;
                        dstyle.left = 0;
                        dstyle.width = o.paper.width + "px";
                        dstyle.height = o.paper.height + "px";
                        group.parentNode.insertBefore(div, group);
                        div[appendChild](group);
                        node.clipRect = div;
                    }
                }
                if (!params["clip-rect"]) {
                    node.clipRect && (node.clipRect.style.clip = E);
                }
            }
            if (o.type == "image" && params.src) {
                node.src = params.src;
            }
            if (o.type == "image" && params.opacity) {
                node.filterOpacity = ms + ".Alpha(opacity=" + (params.opacity * 100) + ")";
                s.filter = (node.filterMatrix || E) + (node.filterOpacity || E);
            }
            params.font && (s.font = params.font);
            params["font-family"] && (s.fontFamily = '"' + params["font-family"][split](",")[0][rp](/^['"]+|['"]+$/g, E) + '"');
            params["font-size"] && (s.fontSize = params["font-size"]);
            params["font-weight"] && (s.fontWeight = params["font-weight"]);
            params["font-style"] && (s.fontStyle = params["font-style"]);
            if (params.opacity != null || 
                params["stroke-width"] != null ||
                params.fill != null ||
                params.stroke != null ||
                params["stroke-width"] != null ||
                params["stroke-opacity"] != null ||
                params["fill-opacity"] != null ||
                params["stroke-dasharray"] != null ||
                params["stroke-miterlimit"] != null ||
                params["stroke-linejoin"] != null ||
                params["stroke-linecap"] != null) {
                node = o.shape || node;
                var fill = (node.getElementsByTagName(fillString) && node.getElementsByTagName(fillString)[0]),
                    newfill = false;
                !fill && (newfill = fill = createNode(fillString));
                if ("fill-opacity" in params || "opacity" in params) {
                    var opacity = ((+a["fill-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+R.getRGB(params.fill).o + 1 || 2) - 1);
                    opacity = mmin(mmax(opacity, 0), 1);
                    fill.opacity = opacity;
                }
                params.fill && (fill.on = true);
                if (fill.on == null || params.fill == "none") {
                    fill.on = false;
                }
                if (fill.on && params.fill) {
                    var isURL = params.fill.match(ISURL);
                    if (isURL) {
                        fill.src = isURL[1];
                        fill.type = "tile";
                    } else {
                        fill.color = R.getRGB(params.fill).hex;
                        fill.src = E;
                        fill.type = "solid";
                        if (R.getRGB(params.fill).error && (res.type in {circle: 1, ellipse: 1} || Str(params.fill).charAt() != "r") && addGradientFill(res, params.fill)) {
                            a.fill = "none";
                            a.gradient = params.fill;
                        }
                    }
                }
                newfill && node[appendChild](fill);
                var stroke = (node.getElementsByTagName("stroke") && node.getElementsByTagName("stroke")[0]),
                newstroke = false;
                !stroke && (newstroke = stroke = createNode("stroke"));
                if ((params.stroke && params.stroke != "none") ||
                    params["stroke-width"] ||
                    params["stroke-opacity"] != null ||
                    params["stroke-dasharray"] ||
                    params["stroke-miterlimit"] ||
                    params["stroke-linejoin"] ||
                    params["stroke-linecap"]) {
                    stroke.on = true;
                }
                (params.stroke == "none" || stroke.on == null || params.stroke == 0 || params["stroke-width"] == 0) && (stroke.on = false);
                var strokeColor = R.getRGB(params.stroke);
                stroke.on && params.stroke && (stroke.color = strokeColor.hex);
                opacity = ((+a["stroke-opacity"] + 1 || 2) - 1) * ((+a.opacity + 1 || 2) - 1) * ((+strokeColor.o + 1 || 2) - 1);
                var width = (toFloat(params["stroke-width"]) || 1) * .75;
                opacity = mmin(mmax(opacity, 0), 1);
                params["stroke-width"] == null && (width = a["stroke-width"]);
                params["stroke-width"] && (stroke.weight = width);
                width && width < 1 && (opacity *= width) && (stroke.weight = 1);
                stroke.opacity = opacity;
                
                params["stroke-linejoin"] && (stroke.joinstyle = params["stroke-linejoin"] || "miter");
                stroke.miterlimit = params["stroke-miterlimit"] || 8;
                params["stroke-linecap"] && (stroke.endcap = params["stroke-linecap"] == "butt" ? "flat" : params["stroke-linecap"] == "square" ? "square" : "round");
                if (params["stroke-dasharray"]) {
                    var dasharray = {
                        "-": "shortdash",
                        ".": "shortdot",
                        "-.": "shortdashdot",
                        "-..": "shortdashdotdot",
                        ". ": "dot",
                        "- ": "dash",
                        "--": "longdash",
                        "- .": "dashdot",
                        "--.": "longdashdot",
                        "--..": "longdashdotdot"
                    };
                    stroke.dashstyle = dasharray[has](params["stroke-dasharray"]) ? dasharray[params["stroke-dasharray"]] : E;
                }
                newstroke && node[appendChild](stroke);
            }
            if (res.type == "text") {
                s = res.paper.span.style;
                a.font && (s.font = a.font);
                a["font-family"] && (s.fontFamily = a["font-family"]);
                a["font-size"] && (s.fontSize = a["font-size"]);
                a["font-weight"] && (s.fontWeight = a["font-weight"]);
                a["font-style"] && (s.fontStyle = a["font-style"]);
                res.node.string && (res.paper.span.innerHTML = Str(res.node.string)[rp](/</g, "&#60;")[rp](/&/g, "&#38;")[rp](/\n/g, "<br>"));
                res.W = a.w = res.paper.span.offsetWidth;
                res.H = a.h = res.paper.span.offsetHeight;
                res.X = a.x;
                res.Y = a.y + round(res.H / 2);
 
                // text-anchor emulationm
                switch (a["text-anchor"]) {
                    case "start":
                        res.node.style["v-text-align"] = "left";
                        res.bbx = round(res.W / 2);
                    break;
                    case "end":
                        res.node.style["v-text-align"] = "right";
                        res.bbx = -round(res.W / 2);
                    break;
                    default:
                        res.node.style["v-text-align"] = "center";
                    break;
                }
            }
        };
        addGradientFill = function (o, gradient) {
            o.attrs = o.attrs || {};
            var attrs = o.attrs,
                fill,
                type = "linear",
                fxfy = ".5 .5";
            o.attrs.gradient = gradient;
            gradient = Str(gradient)[rp](radial_gradient, function (all, fx, fy) {
                type = "radial";
                if (fx && fy) {
                    fx = toFloat(fx);
                    fy = toFloat(fy);
                    pow(fx - .5, 2) + pow(fy - .5, 2) > .25 && (fy = math.sqrt(.25 - pow(fx - .5, 2)) * ((fy > .5) * 2 - 1) + .5);
                    fxfy = fx + S + fy;
                }
                return E;
            });
            gradient = gradient[split](/\s*\-\s*/);
            if (type == "linear") {
                var angle = gradient.shift();
                angle = -toFloat(angle);
                if (isNaN(angle)) {
                    return null;
                }
            }
            var dots = parseDots(gradient);
            if (!dots) {
                return null;
            }
            o = o.shape || o.node;
            fill = o.getElementsByTagName(fillString)[0] || createNode(fillString);
            !fill.parentNode && o.appendChild(fill);
            if (dots[length]) {
                fill.on = true;
                fill.method = "none";
                fill.color = dots[0].color;
                fill.color2 = dots[dots[length] - 1].color;
                var clrs = [];
                for (var i = 0, ii = dots[length]; i < ii; i++) {
                    dots[i].offset && clrs[push](dots[i].offset + S + dots[i].color);
                }
                fill.colors && (fill.colors.value = clrs[length] ? clrs[join]() : "0% " + fill.color);
                if (type == "radial") {
                    fill.type = "gradientradial";
                    fill.focus = "100%";
                    fill.focussize = fxfy;
                    fill.focusposition = fxfy;
                } else {
                    fill.type = "gradient";
                    fill.angle = (270 - angle) % 360;
                }
            }
            return 1;
        };
        Element = function (node, group, vml) {
            var Rotation = 0,
                RotX = 0,
                RotY = 0,
                Scale = 1;
            this[0] = node;
            this.id = R._oid++;
            this.node = node;
            node.raphael = this;
            this.X = 0;
            this.Y = 0;
            this.attrs = {};
            this.Group = group;
            this.paper = vml;
            this._ = {
                tx: 0,
                ty: 0,
                rt: {deg:0},
                sx: 1,
                sy: 1
            };
            !vml.bottom && (vml.bottom = this);
            this.prev = vml.top;
            vml.top && (vml.top.next = this);
            vml.top = this;
            this.next = null;
        };
        elproto = Element[proto];
        elproto.rotate = function (deg, cx, cy) {
            if (this.removed) {
                return this;
            }
            if (deg == null) {
                if (this._.rt.cx) {
                    return [this._.rt.deg, this._.rt.cx, this._.rt.cy][join](S);
                }
                return this._.rt.deg;
            }
            deg = Str(deg)[split](separator);
            if (deg[length] - 1) {
                cx = toFloat(deg[1]);
                cy = toFloat(deg[2]);
            }
            deg = toFloat(deg[0]);
            if (cx != null) {
                this._.rt.deg = deg;
            } else {
                this._.rt.deg += deg;
            }
            cy == null && (cx = null);
            this._.rt.cx = cx;
            this._.rt.cy = cy;
            this.setBox(this.attrs, cx, cy);
            this.Group.style.rotation = this._.rt.deg;
            // gradient fix for rotation. TODO
            // var fill = (this.shape || this.node).getElementsByTagName(fillString);
            // fill = fill[0] || {};
            // var b = ((360 - this._.rt.deg) - 270) % 360;
            // !R.is(fill.angle, "undefined") && (fill.angle = b);
            return this;
        };
        elproto.setBox = function (params, cx, cy) {
            if (this.removed) {
                return this;
            }
            var gs = this.Group.style,
                os = (this.shape && this.shape.style) || this.node.style;
            params = params || {};
            for (var i in params) if (params[has](i)) {
                this.attrs[i] = params[i];
            }
            cx = cx || this._.rt.cx;
            cy = cy || this._.rt.cy;
            var attr = this.attrs,
                x,
                y,
                w,
                h;
            switch (this.type) {
                case "circle":
                    x = attr.cx - attr.r;
                    y = attr.cy - attr.r;
                    w = h = attr.r * 2;
                    break;
                case "ellipse":
                    x = attr.cx - attr.rx;
                    y = attr.cy - attr.ry;
                    w = attr.rx * 2;
                    h = attr.ry * 2;
                    break;
                case "image":
                    x = +attr.x;
                    y = +attr.y;
                    w = attr.width || 0;
                    h = attr.height || 0;
                    break;
                case "text":
                    this.textpath.v = ["m", round(attr.x), ", ", round(attr.y - 2), "l", round(attr.x) + 1, ", ", round(attr.y - 2)][join](E);
                    x = attr.x - round(this.W / 2);
                    y = attr.y - this.H / 2;
                    w = this.W;
                    h = this.H;
                    break;
                case "rect":
                case "path":
                    if (!this.attrs.path) {
                        x = 0;
                        y = 0;
                        w = this.paper.width;
                        h = this.paper.height;
                    } else {
                        var dim = pathDimensions(this.attrs.path);
                        x = dim.x;
                        y = dim.y;
                        w = dim.width;
                        h = dim.height;
                    }
                    break;
                default:
                    x = 0;
                    y = 0;
                    w = this.paper.width;
                    h = this.paper.height;
                    break;
            }
            cx = (cx == null) ? x + w / 2 : cx;
            cy = (cy == null) ? y + h / 2 : cy;
            var left = cx - this.paper.width / 2,
                top = cy - this.paper.height / 2, t;
            gs.left != (t = left + "px") && (gs.left = t);
            gs.top != (t = top + "px") && (gs.top = t);
            this.X = pathlike[has](this.type) ? -left : x;
            this.Y = pathlike[has](this.type) ? -top : y;
            this.W = w;
            this.H = h;
            if (pathlike[has](this.type)) {
                os.left != (t = -left * zoom + "px") && (os.left = t);
                os.top != (t = -top * zoom + "px") && (os.top = t);
            } else if (this.type == "text") {
                os.left != (t = -left + "px") && (os.left = t);
                os.top != (t = -top + "px") && (os.top = t);
            } else {
                gs.width != (t = this.paper.width + "px") && (gs.width = t);
                gs.height != (t = this.paper.height + "px") && (gs.height = t);
                os.left != (t = x - left + "px") && (os.left = t);
                os.top != (t = y - top + "px") && (os.top = t);
                os.width != (t = w + "px") && (os.width = t);
                os.height != (t = h + "px") && (os.height = t);
            }
        };
        elproto.hide = function () {
            !this.removed && (this.Group.style.display = "none");
            return this;
        };
        elproto.show = function () {
            !this.removed && (this.Group.style.display = "block");
            return this;
        };
        elproto.getBBox = function () {
            if (this.removed) {
                return this;
            }
            if (pathlike[has](this.type)) {
                return pathDimensions(this.attrs.path);
            }
            return {
                x: this.X + (this.bbx || 0),
                y: this.Y,
                width: this.W,
                height: this.H
            };
        };
        elproto.remove = function () {
            if (this.removed) {
                return;
            }
            tear(this, this.paper);
            this.node.parentNode.removeChild(this.node);
            this.Group.parentNode.removeChild(this.Group);
            this.shape && this.shape.parentNode.removeChild(this.shape);
            for (var i in this) {
                delete this[i];
            }
            this.removed = true;
        };
        elproto.attr = function (name, value) {
            if (this.removed) {
                return this;
            }
            if (name == null) {
                var res = {};
                for (var i in this.attrs) if (this.attrs[has](i)) {
                    res[i] = this.attrs[i];
                }
                this._.rt.deg && (res.rotation = this.rotate());
                (this._.sx != 1 || this._.sy != 1) && (res.scale = this.scale());
                res.gradient && res.fill == "none" && (res.fill = res.gradient) && delete res.gradient;
                return res;
            }
            if (value == null && R.is(name, "string")) {
                if (name == "translation") {
                    return translate.call(this);
                }
                if (name == "rotation") {
                    return this.rotate();
                }
                if (name == "scale") {
                    return this.scale();
                }
                if (name == fillString && this.attrs.fill == "none" && this.attrs.gradient) {
                    return this.attrs.gradient;
                }
                return this.attrs[name];
            }
            if (this.attrs && value == null && R.is(name, array)) {
                var ii, values = {};
                for (i = 0, ii = name[length]; i < ii; i++) {
                    values[name[i]] = this.attr(name[i]);
                }
                return values;
            }
            var params;
            if (value != null) {
                params = {};
                params[name] = value;
            }
            value == null && R.is(name, "object") && (params = name);
            if (params) {
                for (var key in this.paper.customAttributes) if (this.paper.customAttributes[has](key) && params[has](key) && R.is(this.paper.customAttributes[key], "function")) {
                    var par = this.paper.customAttributes[key].apply(this, [][concat](params[key]));
                    this.attrs[key] = params[key];
                    for (var subkey in par) if (par[has](subkey)) {
                        params[subkey] = par[subkey];
                    }
                }
                if (params.text && this.type == "text") {
                    this.node.string = params.text;
                }
                setFillAndStroke(this, params);
                if (params.gradient && (({circle: 1, ellipse: 1})[has](this.type) || Str(params.gradient).charAt() != "r")) {
                    addGradientFill(this, params.gradient);
                }
                (!pathlike[has](this.type) || this._.rt.deg) && this.setBox(this.attrs);
            }
            return this;
        };
        elproto.toFront = function () {
            !this.removed && this.Group.parentNode[appendChild](this.Group);
            this.paper.top != this && tofront(this, this.paper);
            return this;
        };
        elproto.toBack = function () {
            if (this.removed) {
                return this;
            }
            if (this.Group.parentNode.firstChild != this.Group) {
                this.Group.parentNode.insertBefore(this.Group, this.Group.parentNode.firstChild);
                toback(this, this.paper);
            }
            return this;
        };
        elproto.insertAfter = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[element.length - 1];
            }
            if (element.Group.nextSibling) {
                element.Group.parentNode.insertBefore(this.Group, element.Group.nextSibling);
            } else {
                element.Group.parentNode[appendChild](this.Group);
            }
            insertafter(this, element, this.paper);
            return this;
        };
        elproto.insertBefore = function (element) {
            if (this.removed) {
                return this;
            }
            if (element.constructor == Set) {
                element = element[0];
            }
            element.Group.parentNode.insertBefore(this.Group, element.Group);
            insertbefore(this, element, this.paper);
            return this;
        };
        elproto.blur = function (size) {
            var s = this.node.runtimeStyle,
                f = s.filter;
            f = f.replace(blurregexp, E);
            if (+size !== 0) {
                this.attrs.blur = size;
                s.filter = f + S + ms + ".Blur(pixelradius=" + (+size || 1.5) + ")";
                s.margin = R.format("-{0}px 0 0 -{0}px", round(+size || 1.5));
            } else {
                s.filter = f;
                s.margin = 0;
                delete this.attrs.blur;
            }
        };
 
        theCircle = function (vml, x, y, r) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "circle";
            setFillAndStroke(res, {stroke: "#000", fill: "none"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.r = r;
            res.setBox({x: x - r, y: y - r, width: r * 2, height: r * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        function rectPath(x, y, w, h, r) {
            if (r) {
                return R.format("M{0},{1}l{2},0a{3},{3},0,0,1,{3},{3}l0,{5}a{3},{3},0,0,1,{4},{3}l{6},0a{3},{3},0,0,1,{4},{4}l0,{7}a{3},{3},0,0,1,{3},{4}z", x + r, y, w - r * 2, r, -r, h - r * 2, r * 2 - w, r * 2 - h);
            } else {
                return R.format("M{0},{1}l{2},0,0,{3},{4},0z", x, y, w, h, -w);
            }
        }
        theRect = function (vml, x, y, w, h, r) {
            var path = rectPath(x, y, w, h, r),
                res = vml.path(path),
                a = res.attrs;
            res.X = a.x = x;
            res.Y = a.y = y;
            res.W = a.width = w;
            res.H = a.height = h;
            a.r = r;
            a.path = path;
            res.type = "rect";
            return res;
        };
        theEllipse = function (vml, x, y, rx, ry) {
            var g = createNode("group"),
                o = createNode("oval"),
                ol = o.style;
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "ellipse";
            setFillAndStroke(res, {stroke: "#000"});
            res.attrs.cx = x;
            res.attrs.cy = y;
            res.attrs.rx = rx;
            res.attrs.ry = ry;
            res.setBox({x: x - rx, y: y - ry, width: rx * 2, height: ry * 2});
            vml.canvas[appendChild](g);
            return res;
        };
        theImage = function (vml, src, x, y, w, h) {
            var g = createNode("group"),
                o = createNode("image");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            o.src = src;
            g[appendChild](o);
            var res = new Element(o, g, vml);
            res.type = "image";
            res.attrs.src = src;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = w;
            res.attrs.h = h;
            res.setBox({x: x, y: y, width: w, height: h});
            vml.canvas[appendChild](g);
            return res;
        };
        theText = function (vml, x, y, text) {
            var g = createNode("group"),
                el = createNode("shape"),
                ol = el.style,
                path = createNode("path"),
                ps = path.style,
                o = createNode("textpath");
            g.style.cssText = "position:absolute;left:0;top:0;width:" + vml.width + "px;height:" + vml.height + "px";
            g.coordsize = coordsize;
            g.coordorigin = vml.coordorigin;
            path.v = R.format("m{0},{1}l{2},{1}", round(x * 10), round(y * 10), round(x * 10) + 1);
            path.textpathok = true;
            ol.width = vml.width;
            ol.height = vml.height;
            o.string = Str(text);
            o.on = true;
            el[appendChild](o);
            el[appendChild](path);
            g[appendChild](el);
            var res = new Element(o, g, vml);
            res.shape = el;
            res.textpath = path;
            res.type = "text";
            res.attrs.text = text;
            res.attrs.x = x;
            res.attrs.y = y;
            res.attrs.w = 1;
            res.attrs.h = 1;
            setFillAndStroke(res, {font: availableAttrs.font, stroke: "none", fill: "#000"});
            res.setBox();
            vml.canvas[appendChild](g);
            return res;
        };
        setSize = function (width, height) {
            var cs = this.canvas.style;
            width == +width && (width += "px");
            height == +height && (height += "px");
            cs.width = width;
            cs.height = height;
            cs.clip = "rect(0 " + width + " " + height + " 0)";
            return this;
        };
        var createNode;
        doc.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        try {
            !doc.namespaces.rvml && doc.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            createNode = function (tagName) {
                return doc.createElement('<rvml:' + tagName + ' class="rvml">');
            };
        } catch (e) {
            createNode = function (tagName) {
                return doc.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
        }
        create = function () {
            var con = getContainer[apply](0, arguments),
                container = con.container,
                height = con.height,
                s,
                width = con.width,
                x = con.x,
                y = con.y;
            if (!container) {
                throw new Error("VML container not found.");
            }
            var res = new Paper,
                c = res.canvas = doc.createElement("div"),
                cs = c.style;
            x = x || 0;
            y = y || 0;
            width = width || 512;
            height = height || 342;
            width == +width && (width += "px");
            height == +height && (height += "px");
            res.width = 1e3;
            res.height = 1e3;
            res.coordsize = zoom * 1e3 + S + zoom * 1e3;
            res.coordorigin = "0 0";
            res.span = doc.createElement("span");
            res.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            c[appendChild](res.span);
            cs.cssText = R.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", width, height);
            if (container == 1) {
                doc.body[appendChild](c);
                cs.left = x + "px";
                cs.top = y + "px";
                cs.position = "absolute";
            } else {
                if (container.firstChild) {
                    container.insertBefore(c, container.firstChild);
                } else {
                    container[appendChild](c);
                }
            }
            plugins.call(res, res, R.fn);
            return res;
        };
        paperproto.clear = function () {
            this.canvas.innerHTML = E;
            this.span = doc.createElement("span");
            this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;";
            this.canvas[appendChild](this.span);
            this.bottom = this.top = null;
        };
        paperproto.remove = function () {
            this.canvas.parentNode.removeChild(this.canvas);
            for (var i in this) {
                this[i] = removed(i);
            }
            return true;
        };
    }
 
    // rest
    // WebKit rendering bug workaround method
    var version = navigator.userAgent.match(/Version\/(.*?)\s/);
    if ((navigator.vendor == "Apple Computer, Inc.") && (version && version[1] < 4 || navigator.platform.slice(0, 2) == "iP")) {
        paperproto.safari = function () {
            var rect = this.rect(-99, -99, this.width + 99, this.height + 99).attr({stroke: "none"});
            win.setTimeout(function () {rect.remove();});
        };
    } else {
        paperproto.safari = function () {};
    }
 
    // Events
    var preventDefault = function () {
        this.returnValue = false;
    },
    preventTouch = function () {
        return this.originalEvent.preventDefault();
    },
    stopPropagation = function () {
        this.cancelBubble = true;
    },
    stopTouch = function () {
        return this.originalEvent.stopPropagation();
    },
    addEvent = (function () {
        if (doc.addEventListener) {
            return function (obj, type, fn, element) {
                var realName = supportsTouch && touchMap[type] ? touchMap[type] : type;
                var f = function (e) {
                    if (supportsTouch && touchMap[has](type)) {
                        for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
                            if (e.targetTouches[i].target == obj) {
                                var olde = e;
                                e = e.targetTouches[i];
                                e.originalEvent = olde;
                                e.preventDefault = preventTouch;
                                e.stopPropagation = stopTouch;
                                break;
                            }
                        }
                    }
                    return fn.call(element, e);
                };
                obj.addEventListener(realName, f, false);
                return function () {
                    obj.removeEventListener(realName, f, false);
                    return true;
                };
            };
        } else if (doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    e = e || win.event;
                    e.preventDefault = e.preventDefault || preventDefault;
                    e.stopPropagation = e.stopPropagation || stopPropagation;
                    return fn.call(element, e);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })(),
    drag = [],
    dragMove = function (e) {
        var x = e.clientX,
            y = e.clientY,
            scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
            scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft,
            dragi,
            j = drag.length;
        while (j--) {
            dragi = drag[j];
            if (supportsTouch) {
                var i = e.touches.length,
                    touch;
                while (i--) {
                    touch = e.touches[i];
                    if (touch.identifier == dragi.el._drag.id) {
                        x = touch.clientX;
                        y = touch.clientY;
                        (e.originalEvent ? e.originalEvent : e).preventDefault();
                        break;
                    }
                }
            } else {
                e.preventDefault();
            }
            x += scrollX;
            y += scrollY;
            dragi.move && dragi.move.call(dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
        }
    },
    dragUp = function (e) {
        R.unmousemove(dragMove).unmouseup(dragUp);
        var i = drag.length,
            dragi;
        while (i--) {
            dragi = drag[i];
            dragi.el._drag = {};
            dragi.end && dragi.end.call(dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        }
        drag = [];
    };
    for (var i = events[length]; i--;) {
        (function (eventName) {
            R[eventName] = Element[proto][eventName] = function (fn, scope) {
                if (R.is(fn, "function")) {
                    this.events = this.events || [];
                    this.events.push({name: eventName, f: fn, unbind: addEvent(this.shape || this.node || doc, eventName, fn, scope || this)});
                }
                return this;
            };
            R["un" + eventName] = Element[proto]["un" + eventName] = function (fn) {
                var events = this.events,
                    l = events[length];
                while (l--) if (events[l].name == eventName && events[l].f == fn) {
                    events[l].unbind();
                    events.splice(l, 1);
                    !events.length && delete this.events;
                    return this;
                }
                return this;
            };
        })(events[i]);
    }
    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
        return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    elproto.unhover = function (f_in, f_out) {
        return this.unmouseover(f_in).unmouseout(f_out);
    };
    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
        this._drag = {};
        this.mousedown(function (e) {
            (e.originalEvent || e).preventDefault();
            var scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
                scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft;
            this._drag.x = e.clientX + scrollX;
            this._drag.y = e.clientY + scrollY;
            this._drag.id = e.identifier;
            onstart && onstart.call(start_scope || move_scope || this, e.clientX + scrollX, e.clientY + scrollY, e);
            !drag.length && R.mousemove(dragMove).mouseup(dragUp);
            drag.push({el: this, move: onmove, end: onend, move_scope: move_scope, start_scope: start_scope, end_scope: end_scope});
        });
        return this;
    };
    elproto.undrag = function (onmove, onstart, onend) {
        var i = drag.length;
        while (i--) {
            drag[i].el == this && (drag[i].move == onmove && drag[i].end == onend) && drag.splice(i++, 1);
        }
        !drag.length && R.unmousemove(dragMove).unmouseup(dragUp);
    };
    paperproto.circle = function (x, y, r) {
        return theCircle(this, x || 0, y || 0, r || 0);
    };
    paperproto.rect = function (x, y, w, h, r) {
        return theRect(this, x || 0, y || 0, w || 0, h || 0, r || 0);
    };
    paperproto.ellipse = function (x, y, rx, ry) {
        return theEllipse(this, x || 0, y || 0, rx || 0, ry || 0);
    };
    paperproto.path = function (pathString) {
        pathString && !R.is(pathString, string) && !R.is(pathString[0], array) && (pathString += E);
        return thePath(R.format[apply](R, arguments), this);
    };
    paperproto.image = function (src, x, y, w, h) {
        return theImage(this, src || "about:blank", x || 0, y || 0, w || 0, h || 0);
    };
    paperproto.text = function (x, y, text) {
        return theText(this, x || 0, y || 0, Str(text));
    };
    paperproto.set = function (itemsArray) {
        arguments[length] > 1 && (itemsArray = Array[proto].splice.call(arguments, 0, arguments[length]));
        return new Set(itemsArray);
    };
    paperproto.setSize = setSize;
    paperproto.top = paperproto.bottom = null;
    paperproto.raphael = R;
    function x_y() {
        return this.x + S + this.y;
    }
    elproto.resetScale = function () {
        if (this.removed) {
            return this;
        }
        this._.sx = 1;
        this._.sy = 1;
        this.attrs.scale = "1 1";
    };
    elproto.scale = function (x, y, cx, cy) {
        if (this.removed) {
            return this;
        }
        if (x == null && y == null) {
            return {
                x: this._.sx,
                y: this._.sy,
                toString: x_y
            };
        }
        y = y || x;
        !+y && (y = x);
        var dx,
            dy,
            dcx,
            dcy,
            a = this.attrs;
        if (x != 0) {
            var bb = this.getBBox(),
                rcx = bb.x + bb.width / 2,
                rcy = bb.y + bb.height / 2,
                kx = abs(x / this._.sx),
                ky = abs(y / this._.sy);
            cx = (+cx || cx == 0) ? cx : rcx;
            cy = (+cy || cy == 0) ? cy : rcy;
            var posx = this._.sx > 0,
                posy = this._.sy > 0,
                dirx = ~~(x / abs(x)),
                diry = ~~(y / abs(y)),
                dkx = kx * dirx,
                dky = ky * diry,
                s = this.node.style,
                ncx = cx + abs(rcx - cx) * dkx * (rcx > cx == posx ? 1 : -1),
                ncy = cy + abs(rcy - cy) * dky * (rcy > cy == posy ? 1 : -1),
                fr = (x * dirx > y * diry ? ky : kx);
            switch (this.type) {
                case "rect":
                case "image":
                    var neww = a.width * kx,
                        newh = a.height * ky;
                    this.attr({
                        height: newh,
                        r: a.r * fr,
                        width: neww,
                        x: ncx - neww / 2,
                        y: ncy - newh / 2
                    });
                    break;
                case "circle":
                case "ellipse":
                    this.attr({
                        rx: a.rx * kx,
                        ry: a.ry * ky,
                        r: a.r * fr,
                        cx: ncx,
                        cy: ncy
                    });
                    break;
                case "text":
                    this.attr({
                        x: ncx,
                        y: ncy
                    });
                    break;
                case "path":
                    var path = pathToRelative(a.path),
                        skip = true,
                        fx = posx ? dkx : kx,
                        fy = posy ? dky : ky;
                    for (var i = 0, ii = path[length]; i < ii; i++) {
                        var p = path[i],
                            P0 = upperCase.call(p[0]);
                        if (P0 == "M" && skip) {
                            continue;
                        } else {
                            skip = false;
                        }
                        if (P0 == "A") {
                            p[path[i][length] - 2] *= fx;
                            p[path[i][length] - 1] *= fy;
                            p[1] *= kx;
                            p[2] *= ky;
                            p[5] = +(dirx + diry ? !!+p[5] : !+p[5]);
                        } else if (P0 == "H") {
                            for (var j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= fx;
                            }
                        } else if (P0 == "V") {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= fy;
                            }
                         } else {
                            for (j = 1, jj = p[length]; j < jj; j++) {
                                p[j] *= (j % 2) ? fx : fy;
                            }
                        }
                    }
                    var dim2 = pathDimensions(path);
                    dx = ncx - dim2.x - dim2.width / 2;
                    dy = ncy - dim2.y - dim2.height / 2;
                    path[0][1] += dx;
                    path[0][2] += dy;
                    this.attr({path: path});
                break;
            }
            if (this.type in {text: 1, image:1} && (dirx != 1 || diry != 1)) {
                if (this.transformations) {
                    this.transformations[2] = "scale("[concat](dirx, ",", diry, ")");
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    dx = (dirx == -1) ? -a.x - (neww || 0) : a.x;
                    dy = (diry == -1) ? -a.y - (newh || 0) : a.y;
                    this.attr({x: dx, y: dy});
                    a.fx = dirx - 1;
                    a.fy = diry - 1;
                } else {
                    this.node.filterMatrix = ms + ".Matrix(M11="[concat](dirx,
                        ", M12=0, M21=0, M22=", diry,
                        ", Dx=0, Dy=0, sizingmethod='auto expand', filtertype='bilinear')");
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            } else {
                if (this.transformations) {
                    this.transformations[2] = E;
                    this.node[setAttribute]("transform", this.transformations[join](S));
                    a.fx = 0;
                    a.fy = 0;
                } else {
                    this.node.filterMatrix = E;
                    s.filter = (this.node.filterMatrix || E) + (this.node.filterOpacity || E);
                }
            }
            a.scale = [x, y, cx, cy][join](S);
            this._.sx = x;
            this._.sy = y;
        }
        return this;
    };
    elproto.clone = function () {
        if (this.removed) {
            return null;
        }
        var attr = this.attr();
        delete attr.scale;
        delete attr.translation;
        return this.paper[this.type]().attr(attr);
    };
    var curveslengths = {},
    getPointAtSegmentLength = function (p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
        var len = 0,
            precision = 100,
            name = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y].join(),
            cache = curveslengths[name],
            old, dot;
        !cache && (curveslengths[name] = cache = {data: []});
        cache.timer && clearTimeout(cache.timer);
        cache.timer = setTimeout(function () {delete curveslengths[name];}, 2000);
        if (length != null) {
            var total = getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
            precision = ~~total * 10;
        }
        for (var i = 0; i < precision + 1; i++) {
            if (cache.data[length] > i) {
                dot = cache.data[i * precision];
            } else {
                dot = R.findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, i / precision);
                cache.data[i] = dot;
            }
            i && (len += pow(pow(old.x - dot.x, 2) + pow(old.y - dot.y, 2), .5));
            if (length != null && len >= length) {
                return dot;
            }
            old = dot;
        }
        if (length == null) {
            return len;
        }
    },
    getLengthFactory = function (istotal, subpath) {
        return function (path, length, onlystart) {
            path = path2curve(path);
            var x, y, p, l, sp = "", subpaths = {}, point,
                len = 0;
            for (var i = 0, ii = path.length; i < ii; i++) {
                p = path[i];
                if (p[0] == "M") {
                    x = +p[1];
                    y = +p[2];
                } else {
                    l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
                    if (len + l > length) {
                        if (subpath && !subpaths.start) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            sp += ["C", point.start.x, point.start.y, point.m.x, point.m.y, point.x, point.y];
                            if (onlystart) {return sp;}
                            subpaths.start = sp;
                            sp = ["M", point.x, point.y + "C", point.n.x, point.n.y, point.end.x, point.end.y, p[5], p[6]][join]();
                            len += l;
                            x = +p[5];
                            y = +p[6];
                            continue;
                        }
                        if (!istotal && !subpath) {
                            point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                            return {x: point.x, y: point.y, alpha: point.alpha};
                        }
                    }
                    len += l;
                    x = +p[5];
                    y = +p[6];
                }
                sp += p;
            }
            subpaths.end = sp;
            point = istotal ? len : subpath ? subpaths : R.findDotsAtSegment(x, y, p[1], p[2], p[3], p[4], p[5], p[6], 1);
            point.alpha && (point = {x: point.x, y: point.y, alpha: point.alpha});
            return point;
        };
    };
    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);
    elproto.getTotalLength = function () {
        if (this.type != "path") {return;}
        if (this.node.getTotalLength) {
            return this.node.getTotalLength();
        }
        return getTotalLength(this.attrs.path);
    };
    elproto.getPointAtLength = function (length) {
        if (this.type != "path") {return;}
        return getPointAtLength(this.attrs.path, length);
    };
    elproto.getSubpath = function (from, to) {
        if (this.type != "path") {return;}
        if (abs(this.getTotalLength() - to) < "1e-6") {
            return getSubpathsAtLength(this.attrs.path, from).end;
        }
        var a = getSubpathsAtLength(this.attrs.path, to, 1);
        return from ? getSubpathsAtLength(a, from).end : a;
    };

    // animation easing formulas
    R.easing_formulas = {
        linear: function (n) {
            return n;
        },
        "<": function (n) {
            return pow(n, 3);
        },
        ">": function (n) {
            return pow(n - 1, 3) + 1;
        },
        "<>": function (n) {
            n = n * 2;
            if (n < 1) {
                return pow(n, 3) / 2;
            }
            n -= 2;
            return (pow(n, 3) + 2) / 2;
        },
        backIn: function (n) {
            var s = 1.70158;
            return n * n * ((s + 1) * n - s);
        },
        backOut: function (n) {
            n = n - 1;
            var s = 1.70158;
            return n * n * ((s + 1) * n + s) + 1;
        },
        elastic: function (n) {
            if (n == 0 || n == 1) {
                return n;
            }
            var p = .3,
                s = p / 4;
            return pow(2, -10 * n) * math.sin((n - s) * (2 * PI) / p) + 1;
        },
        bounce: function (n) {
            var s = 7.5625,
                p = 2.75,
                l;
            if (n < (1 / p)) {
                l = s * n * n;
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * n * n + .75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * n * n + .9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * n * n + .984375;
                    }
                }
            }
            return l;
        }
    };

    var animationElements = [],
        animation = function () {
            var Now = +new Date;
            for (var l = 0; l < animationElements[length]; l++) {
                var e = animationElements[l];
                if (e.stop || e.el.removed) {
                    continue;
                }
                var time = Now - e.start,
                    ms = e.ms,
                    easing = e.easing,
                    from = e.from,
                    diff = e.diff,
                    to = e.to,
                    t = e.t,
                    that = e.el,
                    set = {},
                    now;
                if (time < ms) {
                    var pos = easing(time / ms);
                    for (var attr in from) if (from[has](attr)) {
                        switch (availableAnimAttrs[attr]) {
                            case "along":
                                now = pos * ms * diff[attr];
                                to.back && (now = to.len - now);
                                var point = getPointAtLength(to[attr], now);
                                that.translate(diff.sx - diff.x || 0, diff.sy - diff.y || 0);
                                diff.x = point.x;
                                diff.y = point.y;
                                that.translate(point.x - diff.sx, point.y - diff.sy);
                                to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                                break;
                            case nu:
                                now = +from[attr] + pos * ms * diff[attr];
                                break;
                            case "colour":
                                now = "rgb(" + [
                                    upto255(round(from[attr].r + pos * ms * diff[attr].r)),
                                    upto255(round(from[attr].g + pos * ms * diff[attr].g)),
                                    upto255(round(from[attr].b + pos * ms * diff[attr].b))
                                ][join](",") + ")";
                                break;
                            case "path":
                                now = [];
                                for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                                    now[i] = [from[attr][i][0]];
                                    for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                        now[i][j] = +from[attr][i][j] + pos * ms * diff[attr][i][j];
                                    }
                                    now[i] = now[i][join](S);
                                }
                                now = now[join](S);
                                break;
                            case "csv":
                                switch (attr) {
                                    case "translation":
                                        var x = pos * ms * diff[attr][0] - t.x,
                                            y = pos * ms * diff[attr][1] - t.y;
                                        t.x += x;
                                        t.y += y;
                                        now = x + S + y;
                                    break;
                                    case "rotation":
                                        now = +from[attr][0] + pos * ms * diff[attr][0];
                                        from[attr][1] && (now += "," + from[attr][1] + "," + from[attr][2]);
                                    break;
                                    case "scale":
                                        now = [+from[attr][0] + pos * ms * diff[attr][0], +from[attr][1] + pos * ms * diff[attr][1], (2 in to[attr] ? to[attr][2] : E), (3 in to[attr] ? to[attr][3] : E)][join](S);
                                    break;
                                    case "clip-rect":
                                        now = [];
                                        i = 4;
                                        while (i--) {
                                            now[i] = +from[attr][i] + pos * ms * diff[attr][i];
                                        }
                                    break;
                                }
                                break;
                            default:
                              var from2 = [].concat(from[attr]);
                                now = [];
                                i = that.paper.customAttributes[attr].length;
                                while (i--) {
                                    now[i] = +from2[i] + pos * ms * diff[attr][i];
                                }
                                break;
                        }
                        set[attr] = now;
                    }
                    that.attr(set);
                    that._run && that._run.call(that);
                } else {
                    if (to.along) {
                        point = getPointAtLength(to.along, to.len * !to.back);
                        that.translate(diff.sx - (diff.x || 0) + point.x - diff.sx, diff.sy - (diff.y || 0) + point.y - diff.sy);
                        to.rot && that.rotate(diff.r + point.alpha, point.x, point.y);
                    }
                    (t.x || t.y) && that.translate(-t.x, -t.y);
                    to.scale && (to.scale += E);
                    that.attr(to);
                    animationElements.splice(l--, 1);
                }
            }
            R.svg && that && that.paper && that.paper.safari();
            animationElements[length] && setTimeout(animation);
        },
        keyframesRun = function (attr, element, time, prev, prevcallback) {
            var dif = time - prev;
            element.timeouts.push(setTimeout(function () {
                R.is(prevcallback, "function") && prevcallback.call(element);
                element.animate(attr, dif, attr.easing);
            }, prev));
        },
        upto255 = function (color) {
            return mmax(mmin(color, 255), 0);
        },
        translate = function (x, y) {
            if (x == null) {
                return {x: this._.tx, y: this._.ty, toString: x_y};
            }
            this._.tx += +x;
            this._.ty += +y;
            switch (this.type) {
                case "circle":
                case "ellipse":
                    this.attr({cx: +x + this.attrs.cx, cy: +y + this.attrs.cy});
                    break;
                case "rect":
                case "image":
                case "text":
                    this.attr({x: +x + this.attrs.x, y: +y + this.attrs.y});
                    break;
                case "path":
                    var path = pathToRelative(this.attrs.path);
                    path[0][1] += +x;
                    path[0][2] += +y;
                    this.attr({path: path});
                break;
            }
            return this;
        };
    elproto.animateWith = function (element, params, ms, easing, callback) {
        for (var i = 0, ii = animationElements.length; i < ii; i++) {
            if (animationElements[i].el.id == element.id) {
                params.start = animationElements[i].start;
            }
        }
        return this.animate(params, ms, easing, callback);
    };
    elproto.animateAlong = along();
    elproto.animateAlongBack = along(1);
    function along(isBack) {
        return function (path, ms, rotate, callback) {
            var params = {back: isBack};
            R.is(rotate, "function") ? (callback = rotate) : (params.rot = rotate);
            path && path.constructor == Element && (path = path.attrs.path);
            path && (params.along = path);
            return this.animate(params, ms, callback);
        };
    }
    function CubicBezierAtTime(t, p1x, p1y, p2x, p2y, duration) {
        var cx = 3 * p1x,
            bx = 3 * (p2x - p1x) - cx,
            ax = 1 - cx - bx,
            cy = 3 * p1y,
            by = 3 * (p2y - p1y) - cy,
            ay = 1 - cy - by;
        function sampleCurveX(t) {
            return ((ax * t + bx) * t + cx) * t;
        }
        function solve(x, epsilon) {
            var t = solveCurveX(x, epsilon);
            return ((ay * t + by) * t + cy) * t;
        }
        function solveCurveX(x, epsilon) {
            var t0, t1, t2, x2, d2, i;
            for(t2 = x, i = 0; i < 8; i++) {
                x2 = sampleCurveX(t2) - x;
                if (abs(x2) < epsilon) {
                    return t2;
                }
                d2 = (3 * ax * t2 + 2 * bx) * t2 + cx;
                if (abs(d2) < 1e-6) {
                    break;
                }
                t2 = t2 - x2 / d2;
            }
            t0 = 0;
            t1 = 1;
            t2 = x;
            if (t2 < t0) {
                return t0;
            }
            if (t2 > t1) {
                return t1;
            }
            while (t0 < t1) {
                x2 = sampleCurveX(t2);
                if (abs(x2 - x) < epsilon) {
                    return t2;
                }
                if (x > x2) {
                    t0 = t2;
                } else {
                    t1 = t2;
                }
                t2 = (t1 - t0) / 2 + t0;
            }
            return t2;
        }
        return solve(t, 1 / (200 * duration));
    }
    elproto.onAnimation = function (f) {
        this._run = f || 0;
        return this;
    };
    elproto.animate = function (params, ms, easing, callback) {
        var element = this;
        element.timeouts = element.timeouts || [];
        if (R.is(easing, "function") || !easing) {
            callback = easing || null;
        }
        if (element.removed) {
            callback && callback.call(element);
            return element;
        }
        var from = {},
            to = {},
            animateable = false,
            diff = {};
        for (var attr in params) if (params[has](attr)) {
            if (availableAnimAttrs[has](attr) || element.paper.customAttributes[has](attr)) {
                animateable = true;
                from[attr] = element.attr(attr);
                (from[attr] == null) && (from[attr] = availableAttrs[attr]);
                to[attr] = params[attr];
                switch (availableAnimAttrs[attr]) {
                    case "along":
                        var len = getTotalLength(params[attr]);
                        var point = getPointAtLength(params[attr], len * !!params.back);
                        var bb = element.getBBox();
                        diff[attr] = len / ms;
                        diff.tx = bb.x;
                        diff.ty = bb.y;
                        diff.sx = point.x;
                        diff.sy = point.y;
                        to.rot = params.rot;
                        to.back = params.back;
                        to.len = len;
                        params.rot && (diff.r = toFloat(element.rotate()) || 0);
                        break;
                    case nu:
                        diff[attr] = (to[attr] - from[attr]) / ms;
                        break;
                    case "colour":
                        from[attr] = R.getRGB(from[attr]);
                        var toColour = R.getRGB(to[attr]);
                        diff[attr] = {
                            r: (toColour.r - from[attr].r) / ms,
                            g: (toColour.g - from[attr].g) / ms,
                            b: (toColour.b - from[attr].b) / ms
                        };
                        break;
                    case "path":
                        var pathes = path2curve(from[attr], to[attr]);
                        from[attr] = pathes[0];
                        var toPath = pathes[1];
                        diff[attr] = [];
                        for (var i = 0, ii = from[attr][length]; i < ii; i++) {
                            diff[attr][i] = [0];
                            for (var j = 1, jj = from[attr][i][length]; j < jj; j++) {
                                diff[attr][i][j] = (toPath[i][j] - from[attr][i][j]) / ms;
                            }
                        }
                        break;
                    case "csv":
                        var values = Str(params[attr])[split](separator),
                            from2 = Str(from[attr])[split](separator);
                        switch (attr) {
                            case "translation":
                                from[attr] = [0, 0];
                                diff[attr] = [values[0] / ms, values[1] / ms];
                            break;
                            case "rotation":
                                from[attr] = (from2[1] == values[1] && from2[2] == values[2]) ? from2 : [0, values[1], values[2]];
                                diff[attr] = [(values[0] - from[attr][0]) / ms, 0, 0];
                            break;
                            case "scale":
                                params[attr] = values;
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [(values[0] - from[attr][0]) / ms, (values[1] - from[attr][1]) / ms, 0, 0];
                            break;
                            case "clip-rect":
                                from[attr] = Str(from[attr])[split](separator);
                                diff[attr] = [];
                                i = 4;
                                while (i--) {
                                    diff[attr][i] = (values[i] - from[attr][i]) / ms;
                                }
                            break;
                        }
                        to[attr] = values;
                        break;
                    default:
                        values = [].concat(params[attr]);
                        from2 = [].concat(from[attr]);
                        diff[attr] = [];
                        i = element.paper.customAttributes[attr][length];
                        while (i--) {
                            diff[attr][i] = ((values[i] || 0) - (from2[i] || 0)) / ms;
                        }
                        break;
                }
            }
        }
        if (!animateable) {
            var attrs = [],
                lastcall;
            for (var key in params) if (params[has](key) && animKeyFrames.test(key)) {
                attr = {value: params[key]};
                key == "from" && (key = 0);
                key == "to" && (key = 100);
                attr.key = toInt(key, 10);
                attrs.push(attr);
            }
            attrs.sort(sortByKey);
            if (attrs[0].key) {
                attrs.unshift({key: 0, value: element.attrs});
            }
            for (i = 0, ii = attrs[length]; i < ii; i++) {
                keyframesRun(attrs[i].value, element, ms / 100 * attrs[i].key, ms / 100 * (attrs[i - 1] && attrs[i - 1].key || 0), attrs[i - 1] && attrs[i - 1].value.callback);
            }
            lastcall = attrs[attrs[length] - 1].value.callback;
            if (lastcall) {
                element.timeouts.push(setTimeout(function () {lastcall.call(element);}, ms));
            }
        } else {
            var easyeasy = R.easing_formulas[easing];
            if (!easyeasy) {
                easyeasy = Str(easing).match(bezierrg);
                if (easyeasy && easyeasy[length] == 5) {
                    var curve = easyeasy;
                    easyeasy = function (t) {
                        return CubicBezierAtTime(t, +curve[1], +curve[2], +curve[3], +curve[4], ms);
                    };
                } else {
                    easyeasy = function (t) {
                        return t;
                    };
                }
            }
            animationElements.push({
                start: params.start || +new Date,
                ms: ms,
                easing: easyeasy,
                from: from,
                diff: diff,
                to: to,
                el: element,
                t: {x: 0, y: 0}
            });
            R.is(callback, "function") && (element._ac = setTimeout(function () {
                callback.call(element);
            }, ms));
            animationElements[length] == 1 && setTimeout(animation);
        }
        return this;
    };
    elproto.stop = function () {
        for (var i = 0; i < animationElements.length; i++) {
            animationElements[i].el.id == this.id && animationElements.splice(i--, 1);
        }
        for (i = 0, ii = this.timeouts && this.timeouts.length; i < ii; i++) {
            clearTimeout(this.timeouts[i]);
        }
        this.timeouts = [];
        clearTimeout(this._ac);
        delete this._ac;
        return this;
    };
    elproto.translate = function (x, y) {
        return this.attr({translation: x + " " + y});
    };
    elproto[toString] = function () {
        return "Rapha\xebl\u2019s object";
    };
    R.ae = animationElements;
 
    // Set
    var Set = function (items) {
        this.items = [];
        this[length] = 0;
        this.type = "set";
        if (items) {
            for (var i = 0, ii = items[length]; i < ii; i++) {
                if (items[i] && (items[i].constructor == Element || items[i].constructor == Set)) {
                    this[this.items[length]] = this.items[this.items[length]] = items[i];
                    this[length]++;
                }
            }
        }
    };
    Set[proto][push] = function () {
        var item,
            len;
        for (var i = 0, ii = arguments[length]; i < ii; i++) {
            item = arguments[i];
            if (item && (item.constructor == Element || item.constructor == Set)) {
                len = this.items[length];
                this[len] = this.items[len] = item;
                this[length]++;
            }
        }
        return this;
    };
    Set[proto].pop = function () {
        delete this[this[length]--];
        return this.items.pop();
    };
    for (var method in elproto) if (elproto[has](method)) {
        Set[proto][method] = (function (methodname) {
            return function () {
                for (var i = 0, ii = this.items[length]; i < ii; i++) {
                    this.items[i][methodname][apply](this.items[i], arguments);
                }
                return this;
            };
        })(method);
    }
    Set[proto].attr = function (name, value) {
        if (name && R.is(name, array) && R.is(name[0], "object")) {
            for (var j = 0, jj = name[length]; j < jj; j++) {
                this.items[j].attr(name[j]);
            }
        } else {
            for (var i = 0, ii = this.items[length]; i < ii; i++) {
                this.items[i].attr(name, value);
            }
        }
        return this;
    };
    Set[proto].animate = function (params, ms, easing, callback) {
        (R.is(easing, "function") || !easing) && (callback = easing || null);
        var len = this.items[length],
            i = len,
            item,
            set = this,
            collector;
        callback && (collector = function () {
            !--len && callback.call(set);
        });
        easing = R.is(easing, string) ? easing : collector;
        item = this.items[--i].animate(params, ms, easing, collector);
        while (i--) {
            this.items[i] && !this.items[i].removed && this.items[i].animateWith(item, params, ms, easing, collector);
        }
        return this;
    };
    Set[proto].insertAfter = function (el) {
        var i = this.items[length];
        while (i--) {
            this.items[i].insertAfter(el);
        }
        return this;
    };
    Set[proto].getBBox = function () {
        var x = [],
            y = [],
            w = [],
            h = [];
        for (var i = this.items[length]; i--;) {
            var box = this.items[i].getBBox();
            x[push](box.x);
            y[push](box.y);
            w[push](box.x + box.width);
            h[push](box.y + box.height);
        }
        x = mmin[apply](0, x);
        y = mmin[apply](0, y);
        return {
            x: x,
            y: y,
            width: mmax[apply](0, w) - x,
            height: mmax[apply](0, h) - y
        };
    };
    Set[proto].clone = function (s) {
        s = new Set;
        for (var i = 0, ii = this.items[length]; i < ii; i++) {
            s[push](this.items[i].clone());
        }
        return s;
    };

    R.registerFont = function (font) {
        if (!font.face) {
            return font;
        }
        this.fonts = this.fonts || {};
        var fontcopy = {
                w: font.w,
                face: {},
                glyphs: {}
            },
            family = font.face["font-family"];
        for (var prop in font.face) if (font.face[has](prop)) {
            fontcopy.face[prop] = font.face[prop];
        }
        if (this.fonts[family]) {
            this.fonts[family][push](fontcopy);
        } else {
            this.fonts[family] = [fontcopy];
        }
        if (!font.svg) {
            fontcopy.face["units-per-em"] = toInt(font.face["units-per-em"], 10);
            for (var glyph in font.glyphs) if (font.glyphs[has](glyph)) {
                var path = font.glyphs[glyph];
                fontcopy.glyphs[glyph] = {
                    w: path.w,
                    k: {},
                    d: path.d && "M" + path.d[rp](/[mlcxtrv]/g, function (command) {
                            return {l: "L", c: "C", x: "z", t: "m", r: "l", v: "c"}[command] || "M";
                        }) + "z"
                };
                if (path.k) {
                    for (var k in path.k) if (path[has](k)) {
                        fontcopy.glyphs[glyph].k[k] = path.k[k];
                    }
                }
            }
        }
        return font;
    };
    paperproto.getFont = function (family, weight, style, stretch) {
        stretch = stretch || "normal";
        style = style || "normal";
        weight = +weight || {normal: 400, bold: 700, lighter: 300, bolder: 800}[weight] || 400;
        if (!R.fonts) {
            return;
        }
        var font = R.fonts[family];
        if (!font) {
            var name = new RegExp("(^|\\s)" + family[rp](/[^\w\d\s+!~.:_-]/g, E) + "(\\s|$)", "i");
            for (var fontName in R.fonts) if (R.fonts[has](fontName)) {
                if (name.test(fontName)) {
                    font = R.fonts[fontName];
                    break;
                }
            }
        }
        var thefont;
        if (font) {
            for (var i = 0, ii = font[length]; i < ii; i++) {
                thefont = font[i];
                if (thefont.face["font-weight"] == weight && (thefont.face["font-style"] == style || !thefont.face["font-style"]) && thefont.face["font-stretch"] == stretch) {
                    break;
                }
            }
        }
        return thefont;
    };
    paperproto.print = function (x, y, string, font, size, origin, letter_spacing) {
        origin = origin || "middle"; // baseline|middle
        letter_spacing = mmax(mmin(letter_spacing || 0, 1), -1);
        var out = this.set(),
            letters = Str(string)[split](E),
            shift = 0,
            path = E,
            scale;
        R.is(font, string) && (font = this.getFont(font));
        if (font) {
            scale = (size || 16) / font.face["units-per-em"];
            var bb = font.face.bbox.split(separator),
                top = +bb[0],
                height = +bb[1] + (origin == "baseline" ? bb[3] - bb[1] + (+font.face.descent) : (bb[3] - bb[1]) / 2);
            for (var i = 0, ii = letters[length]; i < ii; i++) {
                var prev = i && font.glyphs[letters[i - 1]] || {},
                    curr = font.glyphs[letters[i]];
                shift += i ? (prev.w || font.w) + (prev.k && prev.k[letters[i]] || 0) + (font.w * letter_spacing) : 0;
                curr && curr.d && out[push](this.path(curr.d).attr({fill: "#000", stroke: "none", translation: [shift, 0]}));
            }
            out.scale(scale, scale, top, height).translate(x - top, y - height);
        }
        return out;
    };

    R.format = function (token, params) {
        var args = R.is(params, array) ? [0][concat](params) : arguments;
        token && R.is(token, string) && args[length] - 1 && (token = token[rp](formatrg, function (str, i) {
            return args[++i] == null ? E : args[i];
        }));
        return token || E;
    };
    R.ninja = function () {
        oldRaphael.was ? (win.Raphael = oldRaphael.is) : delete Raphael;
        return R;
    };
    R.el = elproto;
    R.st = Set[proto];

    oldRaphael.was ? (win.Raphael = R) : (Raphael = R);
})();


/* >>>>>>>>>> BEGIN source/color_picker/colorpicker.js */
/*!
 * Color Picker 0.1.0 - Raphael plugin
 *
 * Copyright (c) 2010 Dmitry Baranovskiy (http://raphaeljs.com)
 * Based on Color Wheel (http://jweir.github.com/colorwheel) by John Weir (http://famedriver.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
 
 /*
  * Usage
  * var cp = Raphael.colorpicker(x, y, size, "#fff"); // #fff is optional init color
  * cp.color(); // returns "#fff"
  * cp.color("#fc0"); // sets new color
  * cp.onchange = function (color) {
  *    // do something with the color when user change it
  * }
  * cp.remove(); // removes widget
  */
sc_require('raphael');

(function (Raphael) {
    Raphael.colorpicker = function (x, y, size, initcolor, element) {
        return new ColorPicker(x, y, size, initcolor, element);
    };
    Raphael.fn.colorPickerIcon = function (x, y, r) {
        var segments = pi * r * 2 / Math.min(r / 8, 4);
        var a = pi / 2 - pi * 2 / segments * 1.5,
            path = ["M", x, y - r, "A", r, r, 0, 0, 1, r * Math.cos(a) + x, y - r * Math.sin(a), "L", x, y, "z"].join();
        for (var i = 0; i < segments; i++) {
            this.path(path).attr({
                stroke: "none",
                fill: "hsb(" + (segments - i) * (360 / segments) + ", 100, 100)",
                rotation: [90 + (360 / segments) * i, x, y]
            });
        }
        return this.circle(x, y, r).attr({
            fill: "r#fff-#fff",
            "fill-opacity": 0,
            "stroke-width": Math.round(r * .03),
            stroke: "#fff"
        });
    };
    var pi = Math.PI;
    function angle(x, y) {
        return (x < 0) * 180 + Math.atan(-y / -x) * 180 / pi;
    }
    var doc = document, win = window,
        ColorPicker = function (x, y, size, initcolor, element) {
            size = size || 200;
            var w3 = 3 * size / 200,
                w1 = size / 200,
                fi = 1.6180339887,
                size20 = size / 20,
                size2 = size / 2,
                padding = 2 * size / 200,
                height = size + size20 * 2 + padding * 3,
                t = this,
                H = 1, S = 1, B = 1, s = size - (size20 * 4),
                r = element ? Raphael(element, size, height) : Raphael(x, y, size, height),
                xy = s / 6 + size20 * 2 + padding,
                wh = s * 2 / 3 - padding * 2;
            w1 < 1 && (w1 = 1);
            w3 < 1 && (w3 = 1);


            r.colorPickerIcon(size2, size2, size2 - padding);

            t.cursor = r.set();
            t.cursor.push(r.circle(size2, size2, size20 / 2).attr({
                stroke: "#000",
                opacity: .5,
                "stroke-width": w3
            }));
            t.cursor.push(t.cursor[0].clone().attr({
                stroke: "#fff",
                opacity: 1,
                "stroke-width": w1
            }));
            t.disc = r.circle(size2, size2, size2 - padding).attr({
                fill: "#000",
                "fill-opacity": 0,
                stroke: "none",
                cursor: "crosshair"
            });
            var style = t.disc.node.style;
            style.unselectable = "on";
            style.MozUserSelect =  "none";
            style.WebkitUserSelect= "none";

            // brightness drawing
            var h = size20 * 2 + 2;
            t.brect = r.rect(padding + h / fi / 2, size + padding * 2, size - padding * 2 - h / fi, h - padding * 2).attr({
                stroke: "#fff",
                fill: "180-#fff-#000"
            });
            t.cursorb = r.set();
            t.cursorb.push(r.rect(size - padding - h / fi, size + padding, ~~(h / fi), h, w3).attr({
                stroke: "#000",
                opacity: .5,
                "stroke-width": w3
            }));
            t.cursorb.push(t.cursorb[0].clone().attr({
                stroke: "#fff",
                opacity: 1,
                "stroke-width": w1
            }));
            t.btop = t.brect.clone().attr({
                stroke: "#000",
                fill: "#000",
                opacity: 0
            });
            style = t.btop.node.style;
            style.unselectable = "on";
            style.MozUserSelect =  "none";
            style.WebkitUserSelect= "none";
        
            t.bwidth = ~~(h / fi) / 2;
            t.minx = padding + t.bwidth;
            t.maxx = size - h / fi - padding + t.bwidth;

            t.H = t.S = t.B = 1;
            t.padding = padding;
            t.raphael = r;
            t.size2 = size2;
            t.size20 = size20;
            t.x = x;
            t.y = y;

            // events
            t.disc.drag(function (dx, dy, x, y) {
                t.docOnMove(dx, dy, x, y);
            }, function (x, y) {
                var scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
                    scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft;
                t.hsOnTheMove = true;
                t.setHS(x + scrollX - t.x, y + scrollY - t.y);
            }, function () {
                t.hsOnTheMove = false;
            });
            t.btop.drag(function (dx, dy, x, y) {
                t.docOnMove(dx, dy, x, y);
            }, function (x, y) {
                var scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft;
                t.bOnTheMove = true;
                t.setB(x + scrollX - t.x);
            }, function () {
                t.bOnTheMove = false;
            });

            t.color(initcolor || "#fff");
            this.onchanged && this.onchanged(this.color());
        };
    ColorPicker.prototype.setB = function (x) {
        x < this.minx && (x = this.minx);
        x > this.maxx && (x = this.maxx);
        this.cursorb.attr({x: x - this.bwidth});
        this.B = (x - this.minx) / (this.maxx - this.minx);
        this.onchange && this.onchange(this.color());
    };
    ColorPicker.prototype.setHS = function (x, y) {
        var X = x - this.size2,
            Y = y - this.size2,
            R = this.size2 - this.size20 / 2 - this.padding,
            d = angle(X, Y),
            rd = d * pi / 180;
        isNaN(d) && (d = 0);
        if (X * X + Y * Y > R * R) {
            x = R * Math.cos(rd) + this.size2;
            y = R * Math.sin(rd) + this.size2;
        }
        this.cursor.attr({cx: x, cy: y});
        this.H = (1 - d / 360) % 1;
        this.S = Math.min((X * X + Y * Y) / R / R, 1);
        this.brect.attr({fill: "180-hsl(" + [this.H, this.S] + ",1)-#000"});
        this.onchange && this.onchange(this.color());
    };
    ColorPicker.prototype.docOnMove = function (dx, dy, x, y) {
        var scrollY = doc.documentElement.scrollTop || doc.body.scrollTop,
            scrollX = doc.documentElement.scrollLeft || doc.body.scrollLeft;
        if (this.hsOnTheMove) {
            this.setHS(x + scrollX - this.x, y + scrollY - this.y);
        }
        if (this.bOnTheMove) {
            this.setB(x + scrollX - this.x);
        }
    };
    ColorPicker.prototype.remove = function () {
        this.raphael.remove();
        this.color = function () {
            return false;
        };
    };
    ColorPicker.prototype.color = function (color) {
        if (color) {
            color = Raphael.getRGB(color);
            var hex = color.hex;
            color = Raphael.rgb2hsb(color.r, color.g, color.b);
            d = color.h * 360;
            this.H = color.h;
            this.S = color.s;
            this.B = color.b;

            this.cursorb.attr({x: this.B * (this.maxx - this.minx) + this.minx - this.bwidth});
            this.brect.attr({fill: "180-hsl(" + [this.H, this.S] + ",1)-#000"});

            var d = (1 - this.H) * 360,
                rd = d * pi / 180,
                R = (this.size2 - this.size20 / 2 - this.padding) * this.S,
                x = Math.cos(rd) * R + this.size2,
                y = Math.sin(rd) * R + this.size2;
            this.cursor.attr({cx: x, cy: y});
            return this;
        } else {
            return Raphael.hsb2rgb(this.H, this.S, this.B).hex;
        }
    };
})(window.Raphael);


/* >>>>>>>>>> BEGIN source/color_picker/colorwheel.js */
sc_require('color_picker/colorwheel');
(function (Raphael) {
    Raphael.colorwheel = function (x, y, size, initcolor, element) {
        return new ColorWheel(x, y, size, initcolor, element);
    };
    var pi = Math.PI;
    function angle(x, y) {
        return (x < 0) * 180 + Math.atan(-y / -x) * 180 / pi;
    }
    var doc = document, win = window;
    var addEvent = (function () {
        if (doc.addEventListener) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    return fn.call(element, e);
                };
                obj.addEventListener(type, f, false);
                return function () {
                    obj.removeEventListener(type, f, false);
                    return true;
                };
            };
        } else if (doc.attachEvent) {
            return function (obj, type, fn, element) {
                var f = function (e) {
                    return fn.call(element, e || win.event);
                };
                obj.attachEvent("on" + type, f);
                var detacher = function () {
                    obj.detachEvent("on" + type, f);
                    return true;
                };
                return detacher;
            };
        }
    })();
    var ColorWheel = function (x, y, size, initcolor, element) {
        size = size || 200;
        var w3 = 3 * size / 200,
            w1 = size / 200,
            fi = 1.6180339887,
            segments = pi * size / 5,
            size20 = size / 20,
            size2 = size / 2,
            padding = 2 * size / 200,
            t = this;

        var H = 1, S = 1, B = 1, s = size - (size20 * 4);
        var r = element ? Raphael(element, size, size) : Raphael(x, y, size, size),
            xy = s / 6 + size20 * 2 + padding,
            wh = s * 2 / 3 - padding * 2;
        w1 < 1 && (w1 = 1);
        w3 < 1 && (w3 = 1);


        // ring drawing
        var a = pi / 2 - pi * 2 / segments * 1.3,
            R = size2 - padding,
            R2 = size2 - padding - size20 * 2,
            path = ["M", size2, padding, "A", R, R, 0, 0, 1, R * Math.cos(a) + R + padding, R - R * Math.sin(a) + padding, "L", R2 * Math.cos(a) + R + padding, R - R2 * Math.sin(a) + padding, "A", R2, R2, 0, 0, 0, size2, padding + size20 * 2, "z"].join();
        for (var i = 0; i < segments; i++) {
            r.path(path).attr({
                stroke: "none",
                fill: "hsb(" + i * (255 / segments) + ", 255, 200)",
                rotation: [(360 / segments) * i, size2, size2]
            });
        }
        r.path(["M", size2, padding, "A", R, R, 0, 1, 1, size2 - 1, padding, "l1,0", "M", size2, padding + size20 * 2, "A", R2, R2, 0, 1, 1, size2 - 1, padding + size20 * 2, "l1,0"]).attr({
            "stroke-width": w3,
            stroke: "#fff"
        });
        t.cursorhsb = r.set();
        var h = size20 * 2 + 2;
        t.cursorhsb.push(r.rect(size2 - h / fi / 2, padding - 1, h / fi, h, 3 * size / 200).attr({
            stroke: "#000",
            opacity: .5,
            "stroke-width": w3
        }));
        t.cursorhsb.push(t.cursorhsb[0].clone().attr({
            stroke: "#fff",
            opacity: 1,
            "stroke-width": w1
        }));
        t.ring = r.path(["M", size2, padding, "A", R, R, 0, 1, 1, size2 - 1, padding, "l1,0M", size2, padding + size20 * 2, "A", R2, R2, 0, 1, 1, size2 - 1, padding + size20 * 2, "l1,0"]).attr({
            fill: "#000",
            opacity: 0,
            stroke: "none"
        });

        // rect drawing
        t.main = r.rect(xy, xy, wh, wh).attr({
            stroke: "none",
            fill: "#f00",
            opacity: 1
        });
        t.main.clone().attr({
            stroke: "none",
            fill: "0-#fff-#fff",
            opacity: 0
        });
        t.square = r.rect(xy - 1, xy - 1, wh + 2, wh + 2).attr({
            r: 2,
            stroke: "#fff",
            "stroke-width": w3,
            fill: "90-#000-#000",
            opacity: 0,
            cursor: "crosshair"
        });
        t.cursor = r.set();
        t.cursor.push(r.circle(size2, size2, size20 / 2).attr({
            stroke: "#000",
            opacity: .5,
            "stroke-width": w3
        }));
        t.cursor.push(t.cursor[0].clone().attr({
            stroke: "#fff",
            opacity: 1,
            "stroke-width": w1
        }));
        t.H = t.S = t.B = 1;
        t.raphael = r;
        t.size2 = size2;
        t.wh = wh;
        t.x = x;
        t.xy = xy;
        t.y = y;

        // events
        t.hsbon = addEvent(t.ring.node, "mousedown", function (e) {
            this.hsbOnTheMove = true;
            this.setH(e.clientX - this.x - this.size2, e.clientY - this.y - this.size2);
            this.docmove = addEvent(doc, "mousemove", this.docOnMove, this);
            this.docup = addEvent(doc, "mouseup", this.docOnUp, this);
        }, t);
        t.clron = addEvent(t.square.node, "mousedown", function (e) {
            this.clrOnTheMove = true;
            this.setSB(e.clientX - this.x, e.clientY - this.y);
            this.docmove = addEvent(doc, "mousemove", this.docOnMove, this);
            this.docup = addEvent(doc, "mouseup", this.docOnUp, this);
        }, t);
        t.winunload = addEvent(win, "unload", function () {
            this.hsbon();
            this.clron();
            this.docmove && this.docmove();
            this.docup && this.docup();
            this.winunload();
        }, t);
        
        t.color(initcolor || "#f00");
        this.onchanged && this.onchanged(this.color());
    };
    ColorWheel.prototype.setH = function (x, y) {
        var d = angle(x, y),
            rd = d * pi / 180;
        this.cursorhsb.rotate(d + 90, this.size2, this.size2);
        this.H = (d + 90) / 360;
        this.main.attr({fill: "hsb(" + this.H + ",1,1)"});
        this.onchange && this.onchange(this.color());
    };
    ColorWheel.prototype.setSB = function (x, y) {
        x < this.size2 - this.wh / 2 && (x = this.size2 - this.wh / 2);
        x > this.size2 + this.wh / 2 && (x = this.size2 + this.wh / 2);
        y < this.size2 - this.wh / 2 && (y = this.size2 - this.wh / 2);
        y > this.size2 + this.wh / 2 && (y = this.size2 + this.wh / 2);
        this.cursor.attr({cx: x, cy: y});
        this.B = 1 - (y - this.xy) / this.wh;
        this.S = (x - this.xy) / this.wh;
        this.onchange && this.onchange(this.color());
    };
    ColorWheel.prototype.docOnMove = function (e) {
        if (this.hsbOnTheMove) {
            this.setH(e.clientX - this.x - this.size2, e.clientY - this.y - this.size2);
        }
        if (this.clrOnTheMove) {
            this.setSB(e.clientX - this.x, e.clientY - this.y);
        }
        e.preventDefault && e.preventDefault();
        e.returnValue = false;
        return false;
    };
    ColorWheel.prototype.docOnUp = function (e) {
        this.hsbOnTheMove = this.clrOnTheMove = false;
        if(this.docmove) this.docmove();
        delete this.docmove;
        if(this.docup) this.docup();
        delete this.docup;
        this.onchanged && this.onchanged(this.color());
    };
    ColorWheel.prototype.remove = function () {
        this.raphael.remove();
        this.color = function () {
            return false;
        };
    };
    ColorWheel.prototype.color = function (color) {
        if (color) {
            color = Raphael.getRGB(color);
            color = Raphael.rgb2hsb(color.r, color.g, color.b);
            var d = color.h * 360;
            this.H = color.h;
            this.S = color.s;
            this.B = color.b;
            this.cursorhsb.rotate(d, this.size2, this.size2);
            this.main.attr({fill: "hsb(" + this.H + ",1,1)"});
            var x = this.S * this.wh + this.xy,
                y = (1 - this.B) * this.wh + this.xy;
            this.cursor.attr({cx: x, cy: y});
            return this;
        } else {
            return Raphael.hsb2rgb(this.H, this.S, this.B).hex;
        }
    };
})(window.Raphael);


/* >>>>>>>>>> BEGIN source/graphing/graphael.js */
/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
/*globals Raphael*/
sc_require('raphael'); 
 
(function () {
    Raphael.fn.g = Raphael.fn.g || {};
    Raphael.fn.g.markers = {
        disc: "disc",
        o: "disc",
        flower: "flower",
        f: "flower",
        diamond: "diamond",
        d: "diamond",
        square: "square",
        s: "square",
        triangle: "triangle",
        t: "triangle",
        star: "star",
        "*": "star",
        cross: "cross",
        x: "cross",
        plus: "plus",
        "+": "plus",
        arrow: "arrow",
        "->": "arrow"
    };
    Raphael.fn.g.shim = {stroke: "none", fill: "#000", "fill-opacity": 0};
    Raphael.fn.g.txtattr = {font: "12px Arial, sans-serif"};
    Raphael.fn.g.colors = [];
    var hues = [.6, .2, .05, .1333, .75, 0];
    for (var i = 0; i < 10; i++) {
        if (i < hues.length) {
            Raphael.fn.g.colors.push("hsb(" + hues[i] + ", .75, .75)");
        } else {
            Raphael.fn.g.colors.push("hsb(" + hues[i - hues.length] + ", 1, .5)");
        }
    }
    Raphael.fn.g.text = function (x, y, text) {
        return this.text(x, y, text).attr(this.g.txtattr);
    };
    Raphael.fn.g.labelise = function (label, val, total) {
        if (label) {
            return (label + "").replace(/(##+(?:\.#+)?)|(%%+(?:\.%+)?)/g, function (all, value, percent) {
                if (value) {
                    return (+val).toFixed(value.replace(/^#+\.?/g, "").length);
                }
                if (percent) {
                    return (val * 100 / total).toFixed(percent.replace(/^%+\.?/g, "").length) + "%";
                }
            });
        } else {
            return (+val).toFixed(0);
        }
    };

    Raphael.fn.g.finger = function (x, y, width, height, dir, ending, isPath) {
        // dir 0 for horisontal and 1 for vertical
        if ((dir && !height) || (!dir && !width)) {
            return isPath ? "" : this.path();
        }
        ending = {square: "square", sharp: "sharp", soft: "soft"}[ending] || "round";
        var path;
        height = Math.round(height);
        width = Math.round(width);
        x = Math.round(x);
        y = Math.round(y);
        switch (ending) {
            case "round":
            if (!dir) {
                var r = Math.floor(height / 2);
                if (width < r) {
                    r = width;
                    path = ["M", x + .5, y + .5 - Math.floor(height / 2), "l", 0, 0, "a", r, Math.floor(height / 2), 0, 0, 1, 0, height, "l", 0, 0, "z"];
                } else {
                    path = ["M", x + .5, y + .5 - r, "l", width - r, 0, "a", r, r, 0, 1, 1, 0, height, "l", r - width, 0, "z"];
                }
            } else {
                var r = Math.floor(width / 2);
                if (height < r) {
                    r = height;
                    path = ["M", x - Math.floor(width / 2), y, "l", 0, 0, "a", Math.floor(width / 2), r, 0, 0, 1, width, 0, "l", 0, 0, "z"];
                } else {
                    path = ["M", x - r, y, "l", 0, r - height, "a", r, r, 0, 1, 1, width, 0, "l", 0, height - r, "z"];
                }
            }
            break;
            case "sharp":
            if (!dir) {
                var half = Math.floor(height / 2);
                path = ["M", x, y + half, "l", 0, -height, Math.max(width - half, 0), 0, Math.min(half, width), half, -Math.min(half, width), half + (half * 2 < height), "z"];
            } else {
                var half = Math.floor(width / 2);
                path = ["M", x + half, y, "l", -width, 0, 0, -Math.max(height - half, 0), half, -Math.min(half, height), half, Math.min(half, height), half, "z"];
            }
            break;
            case "square":
            if (!dir) {
                path = ["M", x, y + Math.floor(height / 2), "l", 0, -height, width, 0, 0, height, "z"];
            } else {
                path = ["M", x + Math.floor(width / 2), y, "l", 1 - width, 0, 0, -height, width - 1, 0, "z"];
            }
            break;
            case "soft":
            var r;
            if (!dir) {
                r = Math.min(width, Math.round(height / 5));
                path = ["M", x + .5, y + .5 - Math.floor(height / 2), "l", width - r, 0, "a", r, r, 0, 0, 1, r, r, "l", 0, height - r * 2, "a", r, r, 0, 0, 1, -r, r, "l", r - width, 0, "z"];
            } else {
                r = Math.min(Math.round(width / 5), height);
                path = ["M", x - Math.floor(width / 2), y, "l", 0, r - height, "a", r, r, 0, 0, 1, r, -r, "l", width - 2 * r, 0, "a", r, r, 0, 0, 1, r, r, "l", 0, height - r, "z"];
            }
        }
        if (isPath) {
            return path.join(",");
        } else {
            return this.path(path);
        }
    };

    // Symbols
    Raphael.fn.g.disc = function (cx, cy, r) {
        return this.circle(cx, cy, r);
    };
    Raphael.fn.g.line = function (cx, cy, r) {
        return this.rect(cx - r, cy - r / 5, 2 * r, 2 * r / 5);
    };
    Raphael.fn.g.square = function (cx, cy, r) {
        r = r * .7;
        return this.rect(cx - r, cy - r, 2 * r, 2 * r);
    };
    Raphael.fn.g.triangle = function (cx, cy, r) {
        r *= 1.75;
        return this.path("M".concat(cx, ",", cy, "m0-", r * .58, "l", r * .5, ",", r * .87, "-", r, ",0z"));
    };
    Raphael.fn.g.diamond = function (cx, cy, r) {
        return this.path(["M", cx, cy - r, "l", r, r, -r, r, -r, -r, r, -r, "z"]);
    };
    Raphael.fn.g.flower = function (cx, cy, r, n) {
        r = r * 1.25;
        var rout = r,
            rin = rout * .5;
        n = +n < 3 || !n ? 5 : n;
        var points = ["M", cx, cy + rin, "Q"],
            R;
        for (var i = 1; i < n * 2 + 1; i++) {
            R = i % 2 ? rout : rin;
            points = points.concat([+(cx + R * Math.sin(i * Math.PI / n)).toFixed(3), +(cy + R * Math.cos(i * Math.PI / n)).toFixed(3)]);
        }
        points.push("z");
        return this.path(points.join(","));
    };
    Raphael.fn.g.star = function (cx, cy, r, r2) {
        r2 = r2 || r * .5;
        var points = ["M", cx, cy + r2, "L"],
            R;
        for (var i = 1; i < 10; i++) {
            R = i % 2 ? r : r2;
            points = points.concat([(cx + R * Math.sin(i * Math.PI * .2)).toFixed(3), (cy + R * Math.cos(i * Math.PI * .2)).toFixed(3)]);
        }
        points.push("z");
        return this.path(points.join(","));
    };
    Raphael.fn.g.cross = function (cx, cy, r) {
        r = r / 2.5;
        return this.path("M".concat(cx - r, ",", cy, "l", [-r, -r, r, -r, r, r, r, -r, r, r, -r, r, r, r, -r, r, -r, -r, -r, r, -r, -r, "z"]));
    };
    Raphael.fn.g.plus = function (cx, cy, r) {
        r = r / 2;
        return this.path("M".concat(cx - r / 2, ",", cy - r / 2, "l", [0, -r, r, 0, 0, r, r, 0, 0, r, -r, 0, 0, r, -r, 0, 0, -r, -r, 0, 0, -r, "z"]));
    };
    Raphael.fn.g.arrow = function (cx, cy, r) {
        return this.path("M".concat(cx - r * .7, ",", cy - r * .4, "l", [r * .6, 0, 0, -r * .4, r, r * .8, -r, r * .8, 0, -r * .4, -r * .6, 0], "z"));
    };

    // Tooltips
    Raphael.fn.g.tag = function (x, y, text, angle, r) {
        angle = angle || 0;
        r = r == null ? 5 : r;
        text = text == null ? "$9.99" : text;
        var R = .5522 * r,
            res = this.set(),
            d = 3;
        res.push(this.path().attr({fill: "#000", stroke: "none"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff"}));
        res.update = function () {
            this.rotate(0, x, y);
            var bb = this[1].getBBox();
            if (bb.height >= r * 2) {
                this[0].attr({path: ["M", x, y + r, "a", r, r, 0, 1, 1, 0, -r * 2, r, r, 0, 1, 1, 0, r * 2, "m", 0, -r * 2 -d, "a", r + d, r + d, 0, 1, 0, 0, (r + d) * 2, "L", x + r + d, y + bb.height / 2 + d, "l", bb.width + 2 * d, 0, 0, -bb.height - 2 * d, -bb.width - 2 * d, 0, "L", x, y - r - d].join(",")});
            } else {
                var dx = Math.sqrt(Math.pow(r + d, 2) - Math.pow(bb.height / 2 + d, 2));
                // ["c", -R, 0, -r, R - r, -r, -r, 0, -R, r - R, -r, r, -r, R, 0, r, r - R, r, r, 0, R, R - r, r, -r, r]
                // "a", r, r, 0, 1, 1, 0, -r * 2, r, r, 0, 1, 1, 0, r * 2,
                this[0].attr({path: ["M", x, y + r, "c", -R, 0, -r, R - r, -r, -r, 0, -R, r - R, -r, r, -r, R, 0, r, r - R, r, r, 0, R, R - r, r, -r, r, "M", x + dx, y - bb.height / 2 - d, "a", r + d, r + d, 0, 1, 0, 0, bb.height + 2 * d, "l", r + d - dx + bb.width + 2 * d, 0, 0, -bb.height - 2 * d, "L", x + dx, y - bb.height / 2 - d].join(",")});
            }
            this[1].attr({x: x + r + d + bb.width / 2, y: y});
            angle = (360 - angle) % 360;
            this.rotate(angle, x, y);
            angle > 90 && angle < 270 && this[1].attr({x: x - r - d - bb.width / 2, y: y, rotation: [180 + angle, x, y]});
            return this;
        };
        res.update();
        return res;
    };
    Raphael.fn.g.popupit = function (x, y, set, dir, size) {
        dir = dir == null ? 2 : dir;
        size = size || 5;
        x = Math.round(x) + .5;
        y = Math.round(y) + .5;
        var bb = set.getBBox(),
            w = Math.round(bb.width / 2),
            h = Math.round(bb.height / 2),
            dx = [0, w + size * 2, 0, -w - size * 2],
            dy = [-h * 2 - size * 3, -h - size, 0, -h - size],
            p = ["M", x - dx[dir], y - dy[dir], "l", -size, (dir == 2) * -size, -Math.max(w - size, 0), 0, "a", size, size, 0, 0, 1, -size, -size,
                "l", 0, -Math.max(h - size, 0), (dir == 3) * -size, -size, (dir == 3) * size, -size, 0, -Math.max(h - size, 0), "a", size, size, 0, 0, 1, size, -size,
                "l", Math.max(w - size, 0), 0, size, !dir * -size, size, !dir * size, Math.max(w - size, 0), 0, "a", size, size, 0, 0, 1, size, size,
                "l", 0, Math.max(h - size, 0), (dir == 1) * size, size, (dir == 1) * -size, size, 0, Math.max(h - size, 0), "a", size, size, 0, 0, 1, -size, size,
                "l", -Math.max(w - size, 0), 0, "z"].join(","),
            xy = [{x: x, y: y + size * 2 + h}, {x: x - size * 2 - w, y: y}, {x: x, y: y - size * 2 - h}, {x: x + size * 2 + w, y: y}][dir];
        set.translate(xy.x - w - bb.x, xy.y - h - bb.y);
        return this.path(p).attr({fill: "#000", stroke: "none"}).insertBefore(set.node ? set : set[0]);
    };
    Raphael.fn.g.popup = function (x, y, text, dir, size) {
        dir = dir == null ? 2 : dir;
        size = size || 5;
        text = text || "$9.99";
        var res = this.set(),
            d = 3;
        res.push(this.path().attr({fill: "#000", stroke: "none"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff"}));
        res.update = function (X, Y, withAnimation) {
            X = X || x;
            Y = Y || y;
            var bb = this[1].getBBox(),
                w = bb.width / 2,
                h = bb.height / 2,
                dx = [0, w + size * 2, 0, -w - size * 2],
                dy = [-h * 2 - size * 3, -h - size, 0, -h - size],
                p = ["M", X - dx[dir], Y - dy[dir], "l", -size, (dir == 2) * -size, -Math.max(w - size, 0), 0, "a", size, size, 0, 0, 1, -size, -size,
                    "l", 0, -Math.max(h - size, 0), (dir == 3) * -size, -size, (dir == 3) * size, -size, 0, -Math.max(h - size, 0), "a", size, size, 0, 0, 1, size, -size,
                    "l", Math.max(w - size, 0), 0, size, !dir * -size, size, !dir * size, Math.max(w - size, 0), 0, "a", size, size, 0, 0, 1, size, size,
                    "l", 0, Math.max(h - size, 0), (dir == 1) * size, size, (dir == 1) * -size, size, 0, Math.max(h - size, 0), "a", size, size, 0, 0, 1, -size, size,
                    "l", -Math.max(w - size, 0), 0, "z"].join(","),
                xy = [{x: X, y: Y + size * 2 + h}, {x: X - size * 2 - w, y: Y}, {x: X, y: Y - size * 2 - h}, {x: X + size * 2 + w, y: Y}][dir];
            if (withAnimation) {
                this[0].animate({path: p}, 500, ">");
                this[1].animate(xy, 500, ">");
            } else {
                this[0].attr({path: p});
                this[1].attr(xy);
            }
            return this;
        };
        return res.update(x, y);
    };
    Raphael.fn.g.flag = function (x, y, text, angle) {
        angle = angle || 0;
        text = text || "$9.99";
        var res = this.set(),
            d = 3;
        res.push(this.path().attr({fill: "#000", stroke: "none"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff"}));
        res.update = function (x, y) {
            this.rotate(0, x, y);
            var bb = this[1].getBBox(),
                h = bb.height / 2;
            this[0].attr({path: ["M", x, y, "l", h + d, -h - d, bb.width + 2 * d, 0, 0, bb.height + 2 * d, -bb.width - 2 * d, 0, "z"].join(",")});
            this[1].attr({x: x + h + d + bb.width / 2, y: y});
            angle = 360 - angle;
            this.rotate(angle, x, y);
            angle > 90 && angle < 270 && this[1].attr({x: x - r - d - bb.width / 2, y: y, rotation: [180 + angle, x, y]});
            return this;
        };
        return res.update(x, y);
    };
    Raphael.fn.g.label = function (x, y, text) {
        var res = this.set();
        res.push(this.rect(x, y, 10, 10).attr({stroke: "none", fill: "#000"}));
        res.push(this.text(x, y, text).attr(this.g.txtattr).attr({fill: "#fff"}));
        res.update = function () {
            var bb = this[1].getBBox(),
                r = Math.min(bb.width + 10, bb.height + 10) / 2;
            this[0].attr({x: bb.x - r / 2, y: bb.y - r / 2, width: bb.width + r, height: bb.height + r, r: r});
        };
        res.update();
        return res;
    };
    Raphael.fn.g.labelit = function (set) {
        var bb = set.getBBox(),
            r = Math.min(20, bb.width + 10, bb.height + 10) / 2;
        return this.rect(bb.x - r / 2, bb.y - r / 2, bb.width + r, bb.height + r, r).attr({stroke: "none", fill: "#000"}).insertBefore(set[0]);
    };
    Raphael.fn.g.drop = function (x, y, text, size, angle) {
        size = size || 30;
        angle = angle || 0;
        var res = this.set();
        res.push(this.path(["M", x, y, "l", size, 0, "A", size * .4, size * .4, 0, 1, 0, x + size * .7, y - size * .7, "z"]).attr({fill: "#000", stroke: "none", rotation: [22.5 - angle, x, y]}));
        angle = (angle + 90) * Math.PI / 180;
        res.push(this.text(x + size * Math.sin(angle), y + size * Math.cos(angle), text).attr(this.g.txtattr).attr({"font-size": size * 12 / 30, fill: "#fff"}));
        res.drop = res[0];
        res.text = res[1];
        return res;
    };
    Raphael.fn.g.blob = function (x, y, text, angle, size) {
        angle = (+angle + 1 ? angle : 45) + 90;
        size = size || 12;
        var rad = Math.PI / 180,
            fontSize = size * 12 / 12;
        var res = this.set();
        res.push(this.path().attr({fill: "#000", stroke: "none"}));
        res.push(this.text(x + size * Math.sin((angle) * rad), y + size * Math.cos((angle) * rad) - fontSize / 2, text).attr(this.g.txtattr).attr({"font-size": fontSize, fill: "#fff"}));
        res.update = function (X, Y, withAnimation) {
            X = X || x;
            Y = Y || y;
            var bb = this[1].getBBox(),
                w = Math.max(bb.width + fontSize, size * 25 / 12),
                h = Math.max(bb.height + fontSize, size * 25 / 12),
                x2 = X + size * Math.sin((angle - 22.5) * rad),
                y2 = Y + size * Math.cos((angle - 22.5) * rad),
                x1 = X + size * Math.sin((angle + 22.5) * rad),
                y1 = Y + size * Math.cos((angle + 22.5) * rad),
                dx = (x1 - x2) / 2,
                dy = (y1 - y2) / 2,
                rx = w / 2,
                ry = h / 2,
                k = -Math.sqrt(Math.abs(rx * rx * ry * ry - rx * rx * dy * dy - ry * ry * dx * dx) / (rx * rx * dy * dy + ry * ry * dx * dx)),
                cx = k * rx * dy / ry + (x1 + x2) / 2,
                cy = k * -ry * dx / rx + (y1 + y2) / 2;
            if (withAnimation) {
                this.animate({x: cx, y: cy, path: ["M", x, y, "L", x1, y1, "A", rx, ry, 0, 1, 1, x2, y2, "z"].join(",")}, 500, ">");
            } else {
                this.attr({x: cx, y: cy, path: ["M", x, y, "L", x1, y1, "A", rx, ry, 0, 1, 1, x2, y2, "z"].join(",")});
            }
            return this;
        };
        res.update(x, y);
        return res;
    };

    Raphael.fn.g.colorValue = function (value, total, s, b) {
        return "hsb(" + [Math.min((1 - value / total) * .4, 1), s || .75, b || .75] + ")";
    };

    Raphael.fn.g.snapEnds = function (from, to, steps) {
        var f = from,
            t = to;
        if (f == t) {
            return {from: f, to: t, power: 0};
        }
        function round(a) {
            return Math.abs(a - .5) < .25 ? Math.floor(a) + .5 : Math.round(a);
        }
        var d = (t - f) / steps,
            r = Math.floor(d),
            R = r,
            i = 0;
        if (r) {
            while (R) {
                i--;
                R = Math.floor(d * Math.pow(10, i)) / Math.pow(10, i);
            }
            i ++;
        } else {
            while (!r) {
                i = i || 1;
                r = Math.floor(d * Math.pow(10, i)) / Math.pow(10, i);
                i++;
            }
            i && i--;
        }
        var t = round(to * Math.pow(10, i)) / Math.pow(10, i);
        if (t < to) {
            t = round((to + .5) * Math.pow(10, i)) / Math.pow(10, i);
        }
        var f = round((from - (i > 0 ? 0 : .5)) * Math.pow(10, i)) / Math.pow(10, i);
        return {from: f, to: t, power: i};
    };
    Raphael.fn.g.axis = function (x, y, length, from, to, steps, orientation, labels, type, dashsize) {
        dashsize = dashsize == null ? 2 : dashsize;
        type = type || "t";
        steps = steps || 10;
        var path = type == "|" || type == " " ? ["M", x + .5, y, "l", 0, .001] : orientation == 1 || orientation == 3 ? ["M", x + .5, y, "l", 0, -length] : ["M", x, y + .5, "l", length, 0],
            ends = this.g.snapEnds(from, to, steps),
            f = ends.from,
            t = ends.to,
            i = ends.power,
            j = 0,
            text = this.set();
        d = (t - f) / steps;
        var label = f,
            rnd = i > 0 ? i : 0;
            dx = length / steps;
        if (+orientation == 1 || +orientation == 3) {
            var Y = y,
                addon = (orientation - 1 ? 1 : -1) * (dashsize + 3 + !!(orientation - 1));
            while (Y >= y - length) {
                type != "-" && type != " " && (path = path.concat(["M", x - (type == "+" || type == "|" ? dashsize : !(orientation - 1) * dashsize * 2), Y + .5, "l", dashsize * 2 + 1, 0]));
                text.push(this.text(x + addon, Y, (labels && labels[j++]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr).attr({"text-anchor": orientation - 1 ? "start" : "end"}));
                label += d;
                Y -= dx;
            }
            if (Math.round(Y + dx - (y - length))) {
                type != "-" && type != " " && (path = path.concat(["M", x - (type == "+" || type == "|" ? dashsize : !(orientation - 1) * dashsize * 2), y - length + .5, "l", dashsize * 2 + 1, 0]));
                text.push(this.text(x + addon, y - length, (labels && labels[j]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr).attr({"text-anchor": orientation - 1 ? "start" : "end"}));
            }
        } else {
            var X = x,
                label = f,
                rnd = i > 0 ? i : 0,
                addon = (orientation ? -1 : 1) * (dashsize + 9 + !orientation),
                dx = length / steps,
                txt = 0,
                prev = 0;
            while (X <= x + length) {
                type != "-" && type != " " && (path = path.concat(["M", X + .5, y - (type == "+" ? dashsize : !!orientation * dashsize * 2), "l", 0, dashsize * 2 + 1]));
                text.push(txt = this.text(X, y + addon, (labels && labels[j++]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr));
                var bb = txt.getBBox();
                if (prev >= bb.x - 5) {
                    text.pop(text.length - 1).remove();
                } else {
                    prev = bb.x + bb.width;
                }
                label += d;
                X += dx;
            }
            if (Math.round(X - dx - x - length)) {
                type != "-" && type != " " && (path = path.concat(["M", x + length + .5, y - (type == "+" ? dashsize : !!orientation * dashsize * 2), "l", 0, dashsize * 2 + 1]));
                text.push(this.text(x + length, y + addon, (labels && labels[j]) || (Math.round(label) == label ? label : +label.toFixed(rnd))).attr(this.g.txtattr));
            }
        }
        var res = this.path(path);
        res.text = text;
        res.all = this.set([res, text]);
        res.remove = function () {
            this.text.remove();
            this.constructor.prototype.remove.call(this);
        };
        return res;
    };

    Raphael.el.lighter = function (times) {
        times = times || 2;
        var fs = [this.attrs.fill, this.attrs.stroke];
        this.fs = this.fs || [fs[0], fs[1]];
        fs[0] = Raphael.rgb2hsb(Raphael.getRGB(fs[0]).hex);
        fs[1] = Raphael.rgb2hsb(Raphael.getRGB(fs[1]).hex);
        fs[0].b = Math.min(fs[0].b * times, 1);
        fs[0].s = fs[0].s / times;
        fs[1].b = Math.min(fs[1].b * times, 1);
        fs[1].s = fs[1].s / times;
        this.attr({fill: "hsb(" + [fs[0].h, fs[0].s, fs[0].b] + ")", stroke: "hsb(" + [fs[1].h, fs[1].s, fs[1].b] + ")"});
    };
    Raphael.el.darker = function (times) {
        times = times || 2;
        var fs = [this.attrs.fill, this.attrs.stroke];
        this.fs = this.fs || [fs[0], fs[1]];
        fs[0] = Raphael.rgb2hsb(Raphael.getRGB(fs[0]).hex);
        fs[1] = Raphael.rgb2hsb(Raphael.getRGB(fs[1]).hex);
        fs[0].s = Math.min(fs[0].s * times, 1);
        fs[0].b = fs[0].b / times;
        fs[1].s = Math.min(fs[1].s * times, 1);
        fs[1].b = fs[1].b / times;
        this.attr({fill: "hsb(" + [fs[0].h, fs[0].s, fs[0].b] + ")", stroke: "hsb(" + [fs[1].h, fs[1].s, fs[1].b] + ")"});
    };
    Raphael.el.original = function () {
        if (this.fs) {
            this.attr({fill: this.fs[0], stroke: this.fs[1]});
            delete this.fs;
        }
    };
})();


/* >>>>>>>>>> BEGIN source/graphing/gbar.js */
/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
 /*globals Raphael*/
sc_require('graphing/graphael'); 


Raphael.fn.g.barchart = function (x, y, width, height, values, opts) {
    opts = opts || {};
    var type = {round: "round", sharp: "sharp", soft: "soft"}[opts.type] || "square",
        gutter = parseFloat(opts.gutter || "20%"),
        chart = this.set(),
        bars = this.set(),
        covers = this.set(),
        covers2 = this.set(),
        total = Math.max.apply(Math, values),
        stacktotal = [],
        paper = this,
        multi = 0,
        colors = opts.colors || this.g.colors,
        len = values.length;
    if (this.raphael.is(values[0], "array")) {
        total = [];
        multi = len;
        len = 0;
        for (var i = values.length; i--;) {
            bars.push(this.set());
            total.push(Math.max.apply(Math, values[i]));
            len = Math.max(len, values[i].length);
        }
        if (opts.stacked) {
            for (var i = len; i--;) {
                var tot = 0;
                for (var j = values.length; j--;) {
                    tot +=+ values[j][i] || 0;
                }
                stacktotal.push(tot);
            }
        }
        for (var i = values.length; i--;) {
            if (values[i].length < len) {
                for (var j = len; j--;) {
                    values[i].push(0);
                }
            }
        }
        total = Math.max.apply(Math, opts.stacked ? stacktotal : total);
    }
    
    total = (opts.to) || total;
    var barwidth = width / (len * (100 + gutter) + gutter) * 100,
        barhgutter = barwidth * gutter / 100,
        barvgutter = opts.vgutter == null ? 20 : opts.vgutter,
        stack = [],
        X = x + barhgutter,
        Y = (height - 2 * barvgutter) / total;
    if (!opts.stretch) {
        barhgutter = Math.round(barhgutter);
        barwidth = Math.floor(barwidth);
    }
    !opts.stacked && (barwidth /= multi || 1);
    for (var i = 0; i < len; i++) {
        stack = [];
        for (var j = 0; j < (multi || 1); j++) {
            var h = Math.round((multi ? values[j][i] : values[i]) * Y),
                top = y + height - barvgutter - h,
                bar = this.g.finger(Math.round(X + barwidth / 2), top + h, barwidth, h, true, type).attr({stroke: colors[multi ? j : i], fill: colors[multi ? j : i]});
            if (multi) {
                bars[j].push(bar);
            } else {
                bars.push(bar);
            }
            bar.y = top;
            bar.x = Math.round(X + barwidth / 2);
            bar.w = barwidth;
            bar.h = h;
            bar.value = multi ? values[j][i] : values[i];
            if (!opts.stacked) {
                X += barwidth;
            } else {
                stack.push(bar);
            }
        }
        if (opts.stacked) {
            var cvr;
            covers2.push(cvr = this.rect(stack[0].x - stack[0].w / 2, y, barwidth, height).attr(this.g.shim));
            cvr.bars = this.set();
            var size = 0;
            for (var s = stack.length; s--;) {
                stack[s].toFront();
            }
            for (var s = 0, ss = stack.length; s < ss; s++) {
                var bar = stack[s],
                    cover,
                    h = (size + bar.value) * Y,
                    path = this.g.finger(bar.x, y + height - barvgutter - !!size * .5, barwidth, h, true, type, 1);
                cvr.bars.push(bar);
                size && bar.attr({path: path});
                bar.h = h;
                bar.y = y + height - barvgutter - !!size * .5 - h;
                covers.push(cover = this.rect(bar.x - bar.w / 2, bar.y, barwidth, bar.value * Y).attr(this.g.shim));
                cover.bar = bar;
                cover.value = bar.value;
                size += bar.value;
            }
            X += barwidth;
        }
        X += barhgutter;
    }
    covers2.toFront();
    X = x + barhgutter;
    if (!opts.stacked) {
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < (multi || 1); j++) {
                var cover;
                covers.push(cover = this.rect(Math.round(X), y + barvgutter, barwidth, height - barvgutter).attr(this.g.shim));
                cover.bar = multi ? bars[j][i] : bars[i];
                cover.value = cover.bar.value;
                X += barwidth;
            }
            X += barhgutter;
        }
    }
    chart.label = function (labels, isBottom) {
        labels = labels || [];
        this.labels = paper.set();
        var L, l = -Infinity;
        if (opts.stacked) {
            for (var i = 0; i < len; i++) {
                var tot = 0;
                for (var j = 0; j < (multi || 1); j++) {
                    tot += multi ? values[j][i] : values[i];
                    if (j == multi - 1) {
                        var label = paper.g.labelise(labels[i], tot, total);
                        L = paper.g.text(bars[i * (multi || 1) + j].x, y + height - barvgutter / 2, label).insertBefore(covers[i * (multi || 1) + j]);
                        var bb = L.getBBox();
                        if (bb.x - 7 < l) {
                            L.remove();
                        } else {
                            this.labels.push(L);
                            l = bb.x + bb.width;
                        }
                    }
                }
            }
        } else {
            for (var i = 0; i < len; i++) {
                for (var j = 0; j < (multi || 1); j++) {
                    var label = paper.g.labelise(multi ? labels[j] && labels[j][i] : labels[i], multi ? values[j][i] : values[i], total);
                    L = paper.g.text(bars[i * (multi || 1) + j].x, isBottom ? y + height - barvgutter / 2 : bars[i * (multi || 1) + j].y - 10, label).insertBefore(covers[i * (multi || 1) + j]);
                    var bb = L.getBBox();
                    if (bb.x - 7 < l) {
                        L.remove();
                    } else {
                        this.labels.push(L);
                        l = bb.x + bb.width;
                    }
                }
            }
        }
        return this;
    };
    chart.hover = function (fin, fout) {
        covers2.hide();
        covers.show();
        covers.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.hoverColumn = function (fin, fout) {
        covers.hide();
        covers2.show();
        fout = fout || function () {};
        covers2.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.click = function (f) {
        covers2.hide();
        covers.show();
        covers.click(f);
        return this;
    };
    chart.each = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers.length; i--;) {
            f.call(covers[i]);
        }
        return this;
    };
    chart.eachColumn = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers2.length; i--;) {
            f.call(covers2[i]);
        }
        return this;
    };
    chart.clickColumn = function (f) {
        covers.hide();
        covers2.show();
        covers2.click(f);
        return this;
    };
    chart.push(bars, covers, covers2);
    chart.bars = bars;
    chart.covers = covers;
    return chart;
};
Raphael.fn.g.hbarchart = function (x, y, width, height, values, opts) {
    opts = opts || {};
    var type = {round: "round", sharp: "sharp", soft: "soft"}[opts.type] || "square",
        gutter = parseFloat(opts.gutter || "20%"),
        chart = this.set(),
        bars = this.set(),
        covers = this.set(),
        covers2 = this.set(),
        total = Math.max.apply(Math, values),
        stacktotal = [],
        paper = this,
        multi = 0,
        colors = opts.colors || this.g.colors,
        len = values.length;
    if (this.raphael.is(values[0], "array")) {
        total = [];
        multi = len;
        len = 0;
        for (var i = values.length; i--;) {
            bars.push(this.set());
            total.push(Math.max.apply(Math, values[i]));
            len = Math.max(len, values[i].length);
        }
        if (opts.stacked) {
            for (var i = len; i--;) {
                var tot = 0;
                for (var j = values.length; j--;) {
                    tot +=+ values[j][i] || 0;
                }
                stacktotal.push(tot);
            }
        }
        for (var i = values.length; i--;) {
            if (values[i].length < len) {
                for (var j = len; j--;) {
                    values[i].push(0);
                }
            }
        }
        total = Math.max.apply(Math, opts.stacked ? stacktotal : total);
    }
    
    total = (opts.to) || total;
    var barheight = Math.floor(height / (len * (100 + gutter) + gutter) * 100),
        bargutter = Math.floor(barheight * gutter / 100),
        stack = [],
        Y = y + bargutter,
        X = (width - 1) / total;
    !opts.stacked && (barheight /= multi || 1);
    for (var i = 0; i < len; i++) {
        stack = [];
        for (var j = 0; j < (multi || 1); j++) {
            var val = multi ? values[j][i] : values[i],
                bar = this.g.finger(x, Y + barheight / 2, Math.round(val * X), barheight - 1, false, type).attr({stroke: colors[multi ? j : i], fill: colors[multi ? j : i]});
            if (multi) {
                bars[j].push(bar);
            } else {
                bars.push(bar);
            }
            bar.x = x + Math.round(val * X);
            bar.y = Y + barheight / 2;
            bar.w = Math.round(val * X);
            bar.h = barheight;
            bar.value = +val;
            if (!opts.stacked) {
                Y += barheight;
            } else {
                stack.push(bar);
            }
        }
        if (opts.stacked) {
            var cvr = this.rect(x, stack[0].y - stack[0].h / 2, width, barheight).attr(this.g.shim);
            covers2.push(cvr);
            cvr.bars = this.set();
            var size = 0;
            for (var s = stack.length; s--;) {
                stack[s].toFront();
            }
            for (var s = 0, ss = stack.length; s < ss; s++) {
                var bar = stack[s],
                    cover,
                    val = Math.round((size + bar.value) * X),
                    path = this.g.finger(x, bar.y, val, barheight - 1, false, type, 1);
                cvr.bars.push(bar);
                size && bar.attr({path: path});
                bar.w = val;
                bar.x = x + val;
                covers.push(cover = this.rect(x + size * X, bar.y - bar.h / 2, bar.value * X, barheight).attr(this.g.shim));
                cover.bar = bar;
                size += bar.value;
            }
            Y += barheight;
        }
        Y += bargutter;
    }
    covers2.toFront();
    Y = y + bargutter;
    if (!opts.stacked) {
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < multi; j++) {
                var cover = this.rect(x, Y, width, barheight).attr(this.g.shim);
                covers.push(cover);
                cover.bar = bars[j][i];
                Y += barheight;
            }
            Y += bargutter;
        }
    }
    chart.label = function (labels, isRight) {
        labels = labels || [];
        this.labels = paper.set();
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < multi; j++) {
                var  label = paper.g.labelise(multi ? labels[j] && labels[j][i] : labels[i], multi ? values[j][i] : values[i], total);
                var X = isRight ? bars[i * (multi || 1) + j].x - barheight / 2 + 3 : x + 5,
                    A = isRight ? "end" : "start",
                    L;
                this.labels.push(L = paper.g.text(X, bars[i * (multi || 1) + j].y, label).attr({"text-anchor": A}).insertBefore(covers[0]));
                if (L.getBBox().x < x + 5) {
                    L.attr({x: x + 5, "text-anchor": "start"});
                } else {
                    bars[i * (multi || 1) + j].label = L;
                }
            }
        }
        return this;
    };
    chart.hover = function (fin, fout) {
        covers2.hide();
        covers.show();
        fout = fout || function () {};
        covers.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.hoverColumn = function (fin, fout) {
        covers.hide();
        covers2.show();
        fout = fout || function () {};
        covers2.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.each = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers.length; i--;) {
            f.call(covers[i]);
        }
        return this;
    };
    chart.eachColumn = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers2.length; i--;) {
            f.call(covers2[i]);
        }
        return this;
    };
    chart.click = function (f) {
        covers2.hide();
        covers.show();
        covers.click(f);
        return this;
    };
    chart.clickColumn = function (f) {
        covers.hide();
        covers2.show();
        covers2.click(f);
        return this;
    };
    chart.push(bars, covers, covers2);
    chart.bars = bars;
    chart.covers = covers;
    return chart;
};


/* >>>>>>>>>> BEGIN source/graphing/gdot.js */
/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
 /*globals Raphael*/

sc_require('graphing/graphael'); 



Raphael.fn.g.dotchart = function (x, y, width, height, valuesx, valuesy, size, opts) {
    function drawAxis(ax) {
        +ax[0] && (ax[0] = paper.g.axis(x + gutter, y + gutter, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor((width - 2 * gutter) / 20), 2, opts.axisxlabels || null, opts.axisxtype || "t"));
        +ax[1] && (ax[1] = paper.g.axis(x + width - gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 3, opts.axisylabels || null, opts.axisytype || "t"));
        +ax[2] && (ax[2] = paper.g.axis(x + gutter, y + height - gutter + maxR, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor((width - 2 * gutter) / 20), 0, opts.axisxlabels || null, opts.axisxtype || "t"));
        +ax[3] && (ax[3] = paper.g.axis(x + gutter - maxR, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 1, opts.axisylabels || null, opts.axisytype || "t"));
    }
    opts = opts || {};
    var xdim = this.g.snapEnds(Math.min.apply(Math, valuesx), Math.max.apply(Math, valuesx), valuesx.length - 1),
        minx = xdim.from,
        maxx = xdim.to,
        gutter = opts.gutter || 10,
        ydim = this.g.snapEnds(Math.min.apply(Math, valuesy), Math.max.apply(Math, valuesy), valuesy.length - 1),
        miny = ydim.from,
        maxy = ydim.to,
        len = Math.max(valuesx.length, valuesy.length, size.length),
        symbol = this.g.markers[opts.symbol] || "disc",
        res = this.set(),
        series = this.set(),
        max = opts.max || 100,
        top = Math.max.apply(Math, size),
        R = [],
        paper = this,
        k = Math.sqrt(top / Math.PI) * 2 / max;

    for (var i = 0; i < len; i++) {
        R[i] = Math.min(Math.sqrt(size[i] / Math.PI) * 2 / k, max);
    }
    gutter = Math.max.apply(Math, R.concat(gutter));
    var axis = this.set(),
        maxR = Math.max.apply(Math, R);
    if (opts.axis) {
        var ax = (opts.axis + "").split(/[,\s]+/);
        drawAxis(ax);
        var g = [], b = [];
        for (var i = 0, ii = ax.length; i < ii; i++) {
            var bb = ax[i].all ? ax[i].all.getBBox()[["height", "width"][i % 2]] : 0;
            g[i] = bb + gutter;
            b[i] = bb;
        }
        gutter = Math.max.apply(Math, g.concat(gutter));
        for (var i = 0, ii = ax.length; i < ii; i++) if (ax[i].all) {
            ax[i].remove();
            ax[i] = 1;
        }
        drawAxis(ax);
        for (var i = 0, ii = ax.length; i < ii; i++) if (ax[i].all) {
            axis.push(ax[i].all);
        }
        res.axis = axis;
    }
    var kx = (width - gutter * 2) / ((maxx - minx) || 1),
        ky = (height - gutter * 2) / ((maxy - miny) || 1);
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        var sym = this.raphael.is(symbol, "array") ? symbol[i] : symbol,
            X = x + gutter + (valuesx[i] - minx) * kx,
            Y = y + height - gutter - (valuesy[i] - miny) * ky;
        sym && R[i] && series.push(this.g[sym](X, Y, R[i]).attr({fill: opts.heat ? this.g.colorValue(R[i], maxR) : Raphael.fn.g.colors[0], "fill-opacity": opts.opacity ? R[i] / max : 1, stroke: "none"}));
    }
    var covers = this.set();
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        var X = x + gutter + (valuesx[i] - minx) * kx,
            Y = y + height - gutter - (valuesy[i] - miny) * ky;
        covers.push(this.circle(X, Y, maxR).attr(this.g.shim));
        opts.href && opts.href[i] && covers[i].attr({href: opts.href[i]});
        covers[i].r = +R[i].toFixed(3);
        covers[i].x = +X.toFixed(3);
        covers[i].y = +Y.toFixed(3);
        covers[i].X = valuesx[i];
        covers[i].Y = valuesy[i];
        covers[i].value = size[i] || 0;
        covers[i].dot = series[i];
    }
    res.covers = covers;
    res.series = series;
    res.push(series, axis, covers);
    res.hover = function (fin, fout) {
        covers.mouseover(fin).mouseout(fout);
        return this;
    };
    res.click = function (f) {
        covers.click(f);
        return this;
    };
    res.each = function (f) {
        if (!Raphael.is(f, "function")) {
            return this;
        }
        for (var i = covers.length; i--;) {
            f.call(covers[i]);
        }
        return this;
    };
    res.href = function (map) {
        var cover;
        for (var i = covers.length; i--;) {
            cover = covers[i];
            if (cover.X == map.x && cover.Y == map.y && cover.value == map.value) {
                cover.attr({href: map.href});
            }
        }
    };
    return res;
};


/* >>>>>>>>>> BEGIN source/graphing/gline.js */
/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
/*globals Raphael*/ 
sc_require('graphing/graphael'); 
 
 
Raphael.fn.g.linechart = function (x, y, width, height, valuesx, valuesy, opts) {
    function shrink(values, dim) {
        var k = values.length / dim,
            j = 0,
            l = k,
            sum = 0,
            res = [];
        while (j < values.length) {
            l--;
            if (l < 0) {
                sum += values[j] * (1 + l);
                res.push(sum / k);
                sum = values[j++] * -l;
                l += k;
            } else {
                sum += values[j++];
            }
        }
        return res;
    }
    opts = opts || {};
    if (!this.raphael.is(valuesx[0], "array")) {
        valuesx = [valuesx];
    }
    if (!this.raphael.is(valuesy[0], "array")) {
        valuesy = [valuesy];
    }
    var allx = Array.prototype.concat.apply([], valuesx),
        ally = Array.prototype.concat.apply([], valuesy),
        xdim = this.g.snapEnds(Math.min.apply(Math, allx), Math.max.apply(Math, allx), valuesx[0].length - 1),
        minx = xdim.from,
        maxx = xdim.to,
        gutter = opts.gutter || 10,
        kx = (width - gutter * 2) / (maxx - minx),
        ydim = this.g.snapEnds(Math.min.apply(Math, ally), Math.max.apply(Math, ally), valuesy[0].length - 1),
        miny = ydim.from,
        maxy = ydim.to,
        ky = (height - gutter * 2) / (maxy - miny),
        len = Math.max(valuesx[0].length, valuesy[0].length),
        symbol = opts.symbol || "",
        colors = opts.colors || Raphael.fn.g.colors,
        that = this,
        columns = null,
        dots = null,
        chart = this.set(),
        path = [];

    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        len = Math.max(len, valuesy[i].length);
    }
    var shades = this.set();
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        if (opts.shade) {
            shades.push(this.path().attr({stroke: "none", fill: colors[i], opacity: opts.nostroke ? 1 : .3}));
        }
        if (valuesy[i].length > width - 2 * gutter) {
            valuesy[i] = shrink(valuesy[i], width - 2 * gutter);
            len = width - 2 * gutter;
        }
        if (valuesx[i] && valuesx[i].length > width - 2 * gutter) {
            valuesx[i] = shrink(valuesx[i], width - 2 * gutter);
        }
    }
    var axis = this.set();
    if (opts.axis) {
        var ax = (opts.axis + "").split(/[,\s]+/);
        +ax[0] && axis.push(this.g.axis(x + gutter, y + gutter, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor((width - 2 * gutter) / 20), 2));
        +ax[1] && axis.push(this.g.axis(x + width - gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 3));
        +ax[2] && axis.push(this.g.axis(x + gutter, y + height - gutter, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor((width - 2 * gutter) / 20), 0));
        +ax[3] && axis.push(this.g.axis(x + gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 1));
    }
    var lines = this.set(),
        symbols = this.set(),
        line;
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        if (!opts.nostroke) {
            lines.push(line = this.path().attr({
                stroke: colors[i],
                "stroke-width": opts.width || 2,
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-dasharray": opts.dash || ""
            }));
        }
        var sym = this.raphael.is(symbol, "array") ? symbol[i] : symbol,
            symset = this.set();
        path = [];
        for (var j = 0, jj = valuesy[i].length; j < jj; j++) {
            var X = x + gutter + ((valuesx[i] || valuesx[0])[j] - minx) * kx;
            var Y = y + height - gutter - (valuesy[i][j] - miny) * ky;
            (Raphael.is(sym, "array") ? sym[j] : sym) && symset.push(this.g[Raphael.fn.g.markers[this.raphael.is(sym, "array") ? sym[j] : sym]](X, Y, (opts.width || 2) * 3).attr({fill: colors[i], stroke: "none"}));
            path = path.concat([j ? "L" : "M", X, Y]);
        }
        symbols.push(symset);
        if (opts.shade) {
            shades[i].attr({path: path.concat(["L", X, y + height - gutter, "L",  x + gutter + ((valuesx[i] || valuesx[0])[0] - minx) * kx, y + height - gutter, "z"]).join(",")});
        }
        !opts.nostroke && line.attr({path: path.join(",")});
    }
    function createColumns(f) {
        // unite Xs together
        var Xs = [];
        for (var i = 0, ii = valuesx.length; i < ii; i++) {
            Xs = Xs.concat(valuesx[i]);
        }
        Xs.sort();
        // remove duplicates
        var Xs2 = [],
            xs = [];
        for (var i = 0, ii = Xs.length; i < ii; i++) {
            Xs[i] != Xs[i - 1] && Xs2.push(Xs[i]) && xs.push(x + gutter + (Xs[i] - minx) * kx);
        }
        Xs = Xs2;
        ii = Xs.length;
        var cvrs = f || that.set();
        for (var i = 0; i < ii; i++) {
            var X = xs[i] - (xs[i] - (xs[i - 1] || x)) / 2,
                w = ((xs[i + 1] || x + width) - xs[i]) / 2 + (xs[i] - (xs[i - 1] || x)) / 2,
                C;
            f ? (C = {}) : cvrs.push(C = that.rect(X - 1, y, Math.max(w + 1, 1), height).attr({stroke: "none", fill: "#000", opacity: 0}));
            C.values = [];
            C.symbols = that.set();
            C.y = [];
            C.x = xs[i];
            C.axis = Xs[i];
            for (var j = 0, jj = valuesy.length; j < jj; j++) {
                Xs2 = valuesx[j] || valuesx[0];
                for (var k = 0, kk = Xs2.length; k < kk; k++) {
                    if (Xs2[k] == Xs[i]) {
                        C.values.push(valuesy[j][k]);
                        C.y.push(y + height - gutter - (valuesy[j][k] - miny) * ky);
                        C.symbols.push(chart.symbols[j][k]);
                    }
                }
            }
            f && f.call(C);
        }
        !f && (columns = cvrs);
    }
    function createDots(f) {
        var cvrs = f || that.set(),
            C;
        for (var i = 0, ii = valuesy.length; i < ii; i++) {
            for (var j = 0, jj = valuesy[i].length; j < jj; j++) {
                var X = x + gutter + ((valuesx[i] || valuesx[0])[j] - minx) * kx,
                    nearX = x + gutter + ((valuesx[i] || valuesx[0])[j ? j - 1 : 1] - minx) * kx,
                    Y = y + height - gutter - (valuesy[i][j] - miny) * ky;
                f ? (C = {}) : cvrs.push(C = that.circle(X, Y, Math.abs(nearX - X) / 2).attr({stroke: "none", fill: "#000", opacity: 0}));
                C.x = X;
                C.y = Y;
                C.value = valuesy[i][j];
                C.line = chart.lines[i];
                C.shade = chart.shades[i];
                C.symbol = chart.symbols[i][j];
                C.symbols = chart.symbols[i];
                C.axis = (valuesx[i] || valuesx[0])[j];
                f && f.call(C);
            }
        }
        !f && (dots = cvrs);
    }
    chart.push(lines, shades, symbols, axis, columns, dots);
    chart.lines = lines;
    chart.shades = shades;
    chart.symbols = symbols;
    chart.axis = axis;
    chart.hoverColumn = function (fin, fout) {
        !columns && createColumns();
        columns.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.clickColumn = function (f) {
        !columns && createColumns();
        columns.click(f);
        return this;
    };
    chart.hrefColumn = function (cols) {
        var hrefs = that.raphael.is(arguments[0], "array") ? arguments[0] : arguments;
        if (!(arguments.length - 1) && typeof cols == "object") {
            for (var x in cols) {
                for (var i = 0, ii = columns.length; i < ii; i++) if (columns[i].axis == x) {
                    columns[i].attr("href", cols[x]);
                }
            }
        }
        !columns && createColumns();
        for (var i = 0, ii = hrefs.length; i < ii; i++) {
            columns[i] && columns[i].attr("href", hrefs[i]);
        }
        return this;
    };
    chart.hover = function (fin, fout) {
        !dots && createDots();
        dots.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.click = function (f) {
        !dots && createDots();
        dots.click(f);
        return this;
    };
    chart.each = function (f) {
        createDots(f);
        return this;
    };
    chart.eachColumn = function (f) {
        createColumns(f);
        return this;
    };
    return chart;
};


/* >>>>>>>>>> BEGIN source/graphing/gpie.js */
/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
/*globals Raphael*/
sc_require('graphing/graphael'); 

Raphael.fn.g.piechart = function (cx, cy, r, values, opts) {
    opts = opts || {};
    var paper = this,
        sectors = [],
        covers = this.set(),
        chart = this.set(),
        series = this.set(),
        order = [],
        len = values.length,
        angle = 0,
        total = 0,
        others = 0,
        cut = 9,
        defcut = true;
    chart.covers = covers;
    if (len == 1) {
        series.push(this.circle(cx, cy, r).attr({fill: this.g.colors[0], stroke: opt.stroke || "#fff", "stroke-width": opts.strokewidth == null ? 1 : opts.strokewidth}));
        covers.push(this.circle(cx, cy, r).attr(this.g.shim));
        total = values[0];
        values[0] = {value: values[0], order: 0, valueOf: function () { return this.value; }};
        series[0].middle = {x: cx, y: cy};
        series[0].mangle = 180;
    } else {
        function sector(cx, cy, r, startAngle, endAngle, fill) {
            var rad = Math.PI / 180,
                x1 = cx + r * Math.cos(-startAngle * rad),
                x2 = cx + r * Math.cos(-endAngle * rad),
                xm = cx + r / 2 * Math.cos(-(startAngle + (endAngle - startAngle) / 2) * rad),
                y1 = cy + r * Math.sin(-startAngle * rad),
                y2 = cy + r * Math.sin(-endAngle * rad),
                ym = cy + r / 2 * Math.sin(-(startAngle + (endAngle - startAngle) / 2) * rad),
                res = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(Math.abs(endAngle - startAngle) > 180), 1, x2, y2, "z"];
            res.middle = {x: xm, y: ym};
            return res;
        }
        for (var i = 0; i < len; i++) {
            total += values[i];
            values[i] = {value: values[i], order: i, valueOf: function () { return this.value; }};
        }
        values.sort(function (a, b) {
            return b.value - a.value;
        });
        for (var i = 0; i < len; i++) {
            if (defcut && values[i] * 360 / total <= 1.5) {
                cut = i;
                defcut = false;
            }
            if (i > cut) {
                defcut = false;
                values[cut].value += values[i];
                values[cut].others = true;
                others = values[cut].value;
            }
        }
        len = Math.min(cut + 1, values.length);
        others && values.splice(len) && (values[cut].others = true);
        for (var i = 0; i < len; i++) {
            var mangle = angle - 360 * values[i] / total / 2;
            if (!i) {
                angle = 90 - mangle;
                mangle = angle - 360 * values[i] / total / 2;
            }
            if (opts.init) {
                var ipath = sector(cx, cy, 1, angle, angle - 360 * values[i] / total).join(",");
            }
            var path = sector(cx, cy, r, angle, angle -= 360 * values[i] / total);
            var p = this.path(opts.init ? ipath : path).attr({fill: opts.colors && opts.colors[i] || this.g.colors[i] || "#666", stroke: opts.stroke || "#fff", "stroke-width": (opts.strokewidth == null ? 1 : opts.strokewidth), "stroke-linejoin": "round"});
            p.value = values[i];
            p.middle = path.middle;
            p.mangle = mangle;
            sectors.push(p);
            series.push(p);
            opts.init && p.animate({path: path.join(",")}, (+opts.init - 1) || 1000, ">");
        }
        for (var i = 0; i < len; i++) {
            var p = paper.path(sectors[i].attr("path")).attr(this.g.shim);
            opts.href && opts.href[i] && p.attr({href: opts.href[i]});
            p.attr = function () {};
            covers.push(p);
            series.push(p);
        }
    }

    chart.hover = function (fin, fout) {
        fout = fout || function () {};
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (sector, cover, j) {
                var o = {
                    sector: sector,
                    cover: cover,
                    cx: cx,
                    cy: cy,
                    mx: sector.middle.x,
                    my: sector.middle.y,
                    mangle: sector.mangle,
                    r: r,
                    value: values[j],
                    total: total,
                    label: that.labels && that.labels[j]
                };
                cover.mouseover(function () {
                    fin.call(o);
                }).mouseout(function () {
                    fout.call(o);
                });
            })(series[i], covers[i], i);
        }
        return this;
    };
    // x: where label could be put
    // y: where label could be put
    // value: value to show
    // total: total number to count %
    chart.each = function (f) {
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (sector, cover, j) {
                var o = {
                    sector: sector,
                    cover: cover,
                    cx: cx,
                    cy: cy,
                    x: sector.middle.x,
                    y: sector.middle.y,
                    mangle: sector.mangle,
                    r: r,
                    value: values[j],
                    total: total,
                    label: that.labels && that.labels[j]
                };
                f.call(o);
            })(series[i], covers[i], i);
        }
        return this;
    };
    chart.click = function (f) {
        var that = this;
        for (var i = 0; i < len; i++) {
            (function (sector, cover, j) {
                var o = {
                    sector: sector,
                    cover: cover,
                    cx: cx,
                    cy: cy,
                    mx: sector.middle.x,
                    my: sector.middle.y,
                    mangle: sector.mangle,
                    r: r,
                    value: values[j],
                    total: total,
                    label: that.labels && that.labels[j]
                };
                cover.click(function () { f.call(o); });
            })(series[i], covers[i], i);
        }
        return this;
    };
    chart.inject = function (element) {
        element.insertBefore(covers[0]);
    };
    var legend = function (labels, otherslabel, mark, dir) {
        var x = cx + r + r / 5,
            y = cy,
            h = y + 10;
        labels = labels || [];
        dir = (dir && dir.toLowerCase && dir.toLowerCase()) || "east";
        mark = paper.g.markers[mark && mark.toLowerCase()] || "disc";
        chart.labels = paper.set();
        for (var i = 0; i < len; i++) {
            var clr = series[i].attr("fill"),
                j = values[i].order,
                txt;
            values[i].others && (labels[j] = otherslabel || "Others");
            labels[j] = paper.g.labelise(labels[j], values[i], total);
            chart.labels.push(paper.set());
            chart.labels[i].push(paper.g[mark](x + 5, h, 5).attr({fill: clr, stroke: "none"}));
            chart.labels[i].push(txt = paper.text(x + 20, h, labels[j] || values[j]).attr(paper.g.txtattr).attr({fill: opts.legendcolor || "#000", "text-anchor": "start"}));
            covers[i].label = chart.labels[i];
            h += txt.getBBox().height * 1.2;
        }
        var bb = chart.labels.getBBox(),
            tr = {
                east: [0, -bb.height / 2],
                west: [-bb.width - 2 * r - 20, -bb.height / 2],
                north: [-r - bb.width / 2, -r - bb.height - 10],
                south: [-r - bb.width / 2, r + 10]
            }[dir];
        chart.labels.translate.apply(chart.labels, tr);
        chart.push(chart.labels);
    };
    if (opts.legend) {
        legend(opts.legend, opts.legendothers, opts.legendmark, opts.legendpos);
    }
    chart.push(series, covers);
    chart.series = series;
    chart.covers = covers;
    return chart;
};


/* >>>>>>>>>> BEGIN source/views/bar_graph.js */
// ==========================================================================
// Project:   SCUI.BarGraph
// ==========================================================================
/*globals SCUI Raphael*/
require('graphing/graphael');
require('graphing/gbar');
/** @class

  this view makes the awesome raphael.js bar graphs work in sproutcore

  
  @extends SC.View
*/

SCUI.BarGraph = SC.View.extend(
/** @scope SCUI.BarGraph.prototype */ {
  
  /*
  
  */
  content: null,
  
  color: 'red',
  
  _content_changed: function(){
    if(this.get('content') && this.get('isVisible')){
      console.log(this.get('content'));
      if(this._raphael) this._raphael.remove();
      this._render_view();
    }
  },
  
  didAppendToDocument: function(){    
    // this is where colorpickers created
    var that = this;
    this.invokeLater(function(){that._render_view();});
  },
  
  willDestroyLayer: function(){
    if(this._raphael) this._raphael.remove();
  },
  
  _render_view: function(){
    if(!this._raphael && this.$().get(0)){    
      var layer = this.$().get(0);
      var r = Raphael(layer),
      fin = function () {
        this.flag = r.g.popup(this.bar.x, this.bar.y, this.bar.value || "0").insertBefore(this);
      },
      fout = function () {
        this.flag.animate({opacity: 0}, 200, function () {this.remove();});
      },
      fin2 = function () {
        var y = [], res = [];
        for (var i = this.bars.length; i--;) {
          y.push(this.bars[i].y);
          res.push(this.bars[i].value || "0");
        }
        this.flag = r.g.popup(this.bars[0].x, Math.min.apply(Math, y), res.join(", ")).insertBefore(this);
      },
      fout2 = function () {
        this.flag.animate({opacity: 0}, 300, function () {this.remove();});
      };
      r.g.hbarchart(0, 0, 300, 220, this.get('content'), {stacked: true}).hover(fin, fout);
      this._raphael = r;
    }
  }
  
});


/* >>>>>>>>>> BEGIN source/views/color_picker.js */
// ==========================================================================
// Project:   SCUI.ColorPicker
// ==========================================================================
/*globals SCUI Raphael*/
require('color_picker/colorpicker');
require('color_picker/colorwheel');
/** @class

  this view makes the awesome raphael.js colorpicker work in sproutcore

  
  @extends SC.View
*/

SCUI.ColorPicker = SC.View.extend(
/** @scope SCUI.ColorPicker.prototype */ {
  
  /*
    the current color value in hex
  */
  value: "#eee",
  /*
    thie size of the color picker... be sure to leave room
    for the text box
  */
  size: 160,
  
  _valueChanged: function(){
    var value = this.get('value');
    if( this._cp){
      if(this._cp.color() !== value) this._cp.color(value);
    }
  }.observes('value'),
  
  didAppendToDocument: function(){    
    
    var pv = this.get('parentView'), frame = this.get('frame');
    var newFrame = pv ? pv.convertFrameToView(frame, null) : frame;
    // this is where colorpickers created
    
    // HACK: [MB] - Hack to get the color picker working at all times in IE by creating a fresh version everytime
    if(!this._cp || SC.browser.msie){
      
      // do some cleanup first if it's IE, then create the color picker
      if (this._cp && SC.browser.msie) {
        this._cp.remove();
      }
      
      var layer = this.$().get(0), that = this, cp;
      //compute the parent frame

      this._cp = cp = Raphael.colorpicker(newFrame.x, newFrame.y, this.get('size'), this.get('value'), layer);

      //event handler for color picker view
      this._cp.onchange = function(color){
        that.setIfChanged('value', color);
      };
    }
    else{
      this._cp.x = newFrame.x;
      this._cp.y = newFrame.y;
    }

  },
  
  willDestroyLayer: function(){
    if(this._cp) this._cp.remove();
  }
  
});


/* >>>>>>>>>> BEGIN source/views/color_well.js */
// ==========================================================================
// SCUI.ColorWell
// ==========================================================================

/** @class

  click on this view and get the color picker...
  
  @extends SC.View
  @author Mike Ball
*/

SCUI.ColorWell = SC.View.extend(
/** @scope SC.CheckboxView.prototype */ {
  
  classNames: ['color-well'],
  
  backgroundColor: '#656565',
  
  value: '',

  activeClass: 'active',
    
  displayProperties: 'value'.w(),

  render: function(context, firstTime){
    context.begin('div')
           .addStyle({width:'100%', height:'100%'})
           .addStyle({backgroundColor: this.get('value')}).setClass(this.get('activeClass'), this._isMouseDown)
           .end();
  },
  
  mouseDown: function(evt){
    if(!this.get('isEnabledInPane')) return NO;
    this.set('isActive', YES);
    this.displayDidChange();
    return YES ;
  },
  
  mouseUp: function(evt){
    if(!this.get('isEnabledInPane')) return NO;
    this._isMouseDown = false;
    this.displayDidChange();
    this._popupColorPicker();
    return YES ;
  },
  
  _popupColorPicker: function(){
    var that = this;
    if(!this._pickerPane){
      this._pickerPane = SC.PickerPane.create({
        layout: {width: 180, height: 240},
        classNames: ['color-picker', 'picker'],
        contentView: SC.View.design({
          childViews: 'picker textBox'.w(),
          
          picker: SCUI.ColorPicker.design({
            layout: {centerX: 0, top: 10, width: 160, height: 185},
            valueBinding: SC.binding('value', that)
          }),
          textBox: SC.TextFieldView.design({
            layout: { width: 160, height: 24, bottom: 10, left: 10 },
            valueBinding: SC.binding('value', that)
          })
        })
      });
    }
    this._pickerPane.popup(this, SC.PICKER_POINTER);
  }

});



/* >>>>>>>>>> BEGIN javascript.js */
/* >>>>>>>>>> BEGIN source/license.js */
/*! @license
==========================================================================
SCUI -- Sproutcore UI Framework
Copyright: ©2009 Eloqua Inc All rights reserved.
          Portions ©2009 Evin Grano

Permission is hereby granted, free of charge, to any person obtaining a 
copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, 
and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.

For more information about SCUI, visit http://www.itsgotwhatplanscrave.com

==========================================================================
@license */





