// ==========================================================================
// Project:   EurekaJView.alertChartController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.alertChartController = SC.TreeController.create(
    /** @scope EurekaJView.alertChartController.prototype */ {

    allowsMultipleSelection: NO,

    populate: function() {
        var rootNode = SC.Object.create({
            treeItemIsExpanded: YES,
            name: "Instrumentations",
            treeItemChildren: function() {
                var query = SC.Query.local(EurekaJView.AdminstrationTreeModel, 'parentPath = {parentPath}', {parentPath: null});
                return EurekaJView.EurekaJStore.find(query);
            }.property()
        });

        this.set('content', rootNode)
    }

});
