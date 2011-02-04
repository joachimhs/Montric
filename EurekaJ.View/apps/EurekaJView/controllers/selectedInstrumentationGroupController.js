// ==========================================================================
// Project:   EurekaJView.instrumentationGroupAdminController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.selectedInstrumentationGroupController = SC.ArrayController.create(
    /** @scope EurekaJView.instrumentationGroupAdminController.prototype */ {
    contentBinding: 'EurekaJView.editInstrumentationGroupController.instrumentationGroupPath'
});
