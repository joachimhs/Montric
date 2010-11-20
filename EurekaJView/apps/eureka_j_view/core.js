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
  instrumentationTypeStore: SC.Store.create({commitRecordsAutomatically: YES}).from('EurekaJView.instrumentationTypeDataSource'),
  instrumentationTreeStore: SC.Store.create({commitRecordsAutomatically: YES}).from('EurekaJView.InstrumentationTreeSource'),
  instrumentationLeafStore: SC.Store.create({commitRecordsAutomatically: YES}).from('EurekaJView.InstrumentationLeafDataSource'),
  instrumentationChartDataStore: SC.Store.create({commitRecordsAutomatically: YES}).from('EurekaJView.InstrumentationChartDataSource')

  // TODO: Add global constants or singleton objects needed by your app here.

}) ;
