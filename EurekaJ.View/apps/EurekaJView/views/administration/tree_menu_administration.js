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
	childViews : 'deleteLabelView'.w(),
	layout : {
		top : 0,
		bottom : 0,
		left : 0,
		right : 0
	},

	deleteLabelView : SC.LabelView.design({
		layout: {left: 10, width: 80, top: 0, height: 30},
        controlSize: SC.REGULAR_CONTROL_SIZE,
        value: 'Delete Tree Menus'
	})
});