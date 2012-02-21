// ==========================================================================
// Project:   EurekaJView.ChartGridModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.ChartDataModel = SC.Record.extend(
/** @scope EurekaJView.ChartGridModel.prototype */ {
	primaryKey: 'chartDataKey',
    chartDataKey: SC.Record.attr(String),
    chartDataX: SC.Record.attr(Number),
    chartDataY: SC.Record.attr(Number),

    flotData: function() {
        SC.Logger.log('building up flotData JSON');
        var flotDataArray = [];
        flotDataArray.push(this.get('chartDataX'));
        flotDataArray.push(this.get('chartDataY'));
    }.property('chartDataX', 'chartDataY').cacheable()

}) ;
