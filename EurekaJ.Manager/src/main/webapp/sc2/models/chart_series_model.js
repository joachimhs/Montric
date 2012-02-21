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
EurekaJView.ChartSeriesModel = SC.Record.extend(
/** @scope EurekaJView.ChartGridModel.prototype */ {
	primaryKey: 'label',
    data: SC.Record.attr(Array, {defaultValue: []}),
    label: SC.Record.attr(String, {defaultValue: 'Series Loading...'}),

    flotSeries: [{'label': 'Series Loading'}],

    observesData: function() {
        SC.Logger.log('building up flotSeries JSON: ' + this.get('data'));
        /*var dataArray = [];

        this.get('data').forEach(function(currData) {
            dataArray.push(currData.get('flotData'));
        }, this);*/

        var flotSeriesJson = {   'label': this.get('label'),
                                'data': this.get('data')
                             };
        this.set('flotSeries', flotSeriesJson);
    }.observes('data')

}) ;
