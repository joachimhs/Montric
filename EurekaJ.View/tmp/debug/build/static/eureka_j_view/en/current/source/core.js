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

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.
  //store: SC.Store.create().from(SC.Record.fixtures)
  EurekaJStore: SC.Store.create({commitRecordsAutomatically: NO}).from('EurekaJView.EurekaJDataSource')
  // TODO: Add global constants or singleton objects needed by your app here.

}) ;
; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('eureka_j_view');