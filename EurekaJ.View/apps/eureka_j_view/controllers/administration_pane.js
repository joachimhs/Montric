// ==========================================================================
// Project:   EurekaJView.administrationPaneController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.administrationPaneController = SC.ObjectController.create(
    /** @scope EurekaJView.administrationPaneController.prototype */ {

    alertTypes: [
        {'typeName': 'Greater Than', 'alertType': 'greater_than'},
        {'typeName': 'Equals', 'alertType': 'equals'},
        {'typeName': 'Less Than', 'alertType': 'less_than'}
    ]
});
