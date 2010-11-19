// ==========================================================================
// Project:   Flot
// Copyright: ©2010 Bo Xiao <mail.xiaobo@gmail.com>, Inc.
// ==========================================================================
/*globals Flot */

/** @namespace

  My cool new framework.  Describe your framework.
  
  @extends SC.Object
*/
sc_require('excanvas.js');
sc_require('jquery.js');
sc_require('jquery.flot.js');
sc_require('jquery.flot.crosshair.js');
sc_require('jquery.flot.fillbetween.js');
sc_require('jquery.flot.image.js');
sc_require('jquery.flot.navigate.js');
sc_require('jquery.flot.pie.js');
sc_require('jquery.flot.selection.js');
sc_require('jquery.flot.stack.js');
sc_require('jquery.flot.threshold.js');

Flot = SC.Object.create(
  /** @scope Flot.prototype */ {

  NAMESPACE: 'Flot',
  VERSION: '0.1.0',

  // TODO: Add global constants or singleton objects needed by your app here.

  /** @note Hook up jQuery.plot */
  plot: $.plot

}) ;


