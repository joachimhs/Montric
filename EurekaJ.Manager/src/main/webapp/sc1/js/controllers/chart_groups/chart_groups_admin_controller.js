/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.chartGroupsAdminController = SC.ArrayController.create(
    /** @scope EurekaJView.instrumentationGroupAdminController.prototype */ {

    newInstrumentationGroupName: null,
    allowsMultipleSelection: NO,
    showEditInstrumentationGroupView: NO,

    observesSelection: function(){
        if (this.getPath('selection.firstObject.instrumentaionGroupName')  != undefined) {
            this.set('showEditInstrumentationGroupView', YES);
            EurekaJView.chartGroupChartsTreeController.populate();
        } else {
            this.set('showEditInstrumentationGroupView', NO);
        }
    }.observes('selection'),

    newChartGroupIsValid: function() {
        var newNameIsValid = (this.get('newInstrumentationGroupName') && this.get('newInstrumentationGroupName').length >= 1);

        var unique = true;
        this.get('content').forEach(function(chartGroup) {
            if (chartGroup.get('instrumentaionGroupName') == this.get('newInstrumentationGroupName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },
    
    alertPaneDidDismiss: function(pane, status) {
        switch(status) {
          case SC.BUTTON1_STATUS:
            EurekaJView.deleteSelectedChartGroupApprovedAction();
            break;

          case SC.BUTTON2_STATUS:
            //Cancel... Noting to do really
            break;
        }
    }

});
