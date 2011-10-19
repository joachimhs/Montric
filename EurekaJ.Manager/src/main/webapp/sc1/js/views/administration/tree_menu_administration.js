// ==========================================================================
// Project:   EurekaJView.AlertAdministrationView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/**
 * @class
 * 
 * (Document Your View Here)
 * 
 * @extends SC.View
 */
EurekaJView.TreeMenuAdministrationView = SC.View.extend(
		/** @scope EurekaJView.TreeMenuAdministrationView.prototype */ {
	childViews : 'treeMenuSelectionView deleteTreeMenuItemButtonView'.w(),
	layout : {
		top : 0,
		bottom : 0,
		left : 0,
		right : 0
	},

	treeMenuSelectionView: SC.ScrollView.design({
        layout: {top: 25, bottom: 50, left: 0, right: 0 },
        hasHorizontalScroller: YES,
        hasVerticalScroller: YES,

        contentView: SC.ListView.extend({
        	backgroundColor: '#F0F8FF',
            contentValueKey: "name",
            rowHeight: 18,
            borderStyle: SC.BORDER_NONE,
            isSelectable: NO,

            contentBinding: 'EurekaJView.instrumentationTreeAdminTreeController.arrangedObjects',
            recordType: EurekaJView.AdminstrationTreeModel,
            itemIconKey: 'itemIcon',
            contentCheckboxKey: 'isSelected',
        })
    }),
    
    deleteTreeMenuItemButtonView: SC.ButtonView.design({
        layout: {right: 10, width: 350, bottom: 10, height: 25},
        title: "Delete selected items and corresponding data.",
        action: "EurekaJView.deleteTreeMenuItemButtonAction"
    })
});