// ==========================================================================
// Project:   EurekaJView.alertChartController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.alertChartController = SC.ArrayController.create(
/** @scope EurekaJView.alertChartController.prototype */ {

    observesSelection: function() {
        if (this.didChangeFor('selectionDidChange', 'selection') && this.getPath('selection.firstObject.name')) {
            SC.Logger.log('selected Alert Chart: ' + this.getPath('selection.firstObject.name'));
            EurekaJView.editAlertController.get('content').set('alertChartName', this.getPath('selection.firstObject.name'));
        }
        //
    }.observes('selection')

}) ;
