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
EurekaJView.ChartGridModel = SC.Record.extend(
/** @scope EurekaJView.ChartGridModel.prototype */ {
	primaryKey: 'instrumentationNode',
    chart: SC.Record.attr(Array),
    instrumentationNode: SC.Record.attr(String),
    table: SC.Record.toMany('EurekaJView.InstrumentationTableModel'),

    isChart:  function() {
        SC.Logger.log("isChart: " + this.get('chart'))
        if ((this.get('chart'))) {
            return true;
        }

        return false;
    }.property(),

    isTable:  function() {
        SC.Logger.log("isTable: " + this.get('table'))
        var isTableBoolean = false;
        this.get('table').forEach(function(o) {
            isTableBoolean = true;
        }, this);

        return isTableBoolean;
    }.property()
});
