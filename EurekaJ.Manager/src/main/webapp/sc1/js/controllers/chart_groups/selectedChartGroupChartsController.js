/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.selectedChartGroupChartsController = SC.ArrayController.create(
    /** @scope EurekaJView.instrumentationGroupAdminController.prototype */ {
    contentBinding: 'EurekaJView.selectedChartGroupController.instrumentationGroupPath'
});