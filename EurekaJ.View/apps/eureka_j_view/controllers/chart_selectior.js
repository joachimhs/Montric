// ==========================================================================
// Project:   EurekaJView.chartSelectiorController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.chartSelectorController = SC.ArrayController.create(
/** @scope EurekaJView.chartSelectiorController.prototype */
{
    allowsMultipleSelection: YES,

    observesSelection: function() {
        if (this.didChangeFor('selectionDidChange', 'selection') && this.getPath('selection.firstObject.guiPath')) {
            SC.Logger.log('selected Chart Paths: ' + this.getPath('selection').getEach('guiPath'));
			EurekaJView.chartGridController.set('content', this.getPath('selection').getEach('chartGrid'));
        }
    }.observes('selection')

});
