// ==========================================================================
// Project:   EurekaJView.InstrumentationChartModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.InstrumentationChartModel = SC.Record.extend(
/** @scope EurekaJView.InstrumentationChartModel.prototype */ {

	guid: SC.Record.attr(Number),
  	label: SC.Record.attr(String),
	data: SC.Record.attr(Array),

}) ;
