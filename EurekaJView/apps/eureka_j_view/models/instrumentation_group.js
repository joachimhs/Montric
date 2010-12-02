// ==========================================================================
// Project:   EurekaJView.InstrumentationGroup
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.InstrumentationGroup = SC.Record.extend(
/** @scope EurekaJView.InstrumentationGroup.prototype */ {

  	guid: SC.Record.attr(String),
  	instrumentationGroupName: SC.Record.attr(String),
	instrumentationGroupSource: SC.Record.attr(String),
	instrumentationGroupCharts: SC.Record.attr(Array),
}) ;
