// ==========================================================================
// Project:   EurekaJView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @namespace

 My cool new app.  Describe your application.

 @extends SC.Object
 */
EurekaJView = SC.Application.create(
    /** @scope EurekaJView.prototype */ {

    NAMESPACE: 'EurekaJView',
    VERSION: '0.1.0',

    //Create the EurekaJ Store
    EurekaJStore: SC.Store.create({commitRecordsAutomatically: NO}).from('EurekaJView.EurekaJDataSource')
    //EurekaJStore: SC.Store.create().from(SC.Record.fixtures)
});

