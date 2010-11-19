// ==========================================================================
// Project:   EurekaJView.InstrumentationChart
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.InstrumentationChart = SC.Record.extend(
/** @scope EurekaJView.InstrumentationChart.prototype */ {

  	guid: SC.Record.attr(Number),
  	name: SC.Record.attr(String),
	isSelected: SC.Record.attr(Boolean),
	parentPath: SC.Record.attr(String),
	guiPath: SC.Record.attr(String),

}) ;
