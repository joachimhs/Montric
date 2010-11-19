// ==========================================================================
// Project:   EurekaJView.InstrumentationLeafDataSource
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
EurekaJView.INSTRUMENTATION_LEAFS_QUERY = SC.Query.local(EurekaJView.InstrumentationChart, {orderby: 'name'});
EurekaJView.InstrumentationLeafDataSource = SC.DataSource.extend(
/** @scope EurekaJView.InstrumentationLeafDataSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 

  fetch: function(store, query) {

    if (query === EurekaJView.INSTRUMENTATION_LEAFS_QUERY) {

		var requestStringJson = { 'getInstrumentationChartList': { 'id' : 'instrumentationChartList', 'path' : EurekaJView.instrumentationTypeController.selectedInstrumentationTypePath}};

		SC.Request.postUrl('/jsonController.capp').header({'Accept':'application/json'}).json()
			.notify(this, 'didFetchInstrumentationChartList', store, query)
			.send(requestStringJson);

		return YES;
	}

    return NO ; // return YES if you handled the query
  },

didFetchInstrumentationChartList: function(response, store, query) {
	if (SC.ok(response)) {
		store.reset();
		SC.Logger.log("Got Chart List. Loading records");
		store.loadRecords(EurekaJView.InstrumentationChart, response.get('body').instrumentationChartList);
		store.dataSourceDidFetchQuery(query);
		SC.Logger.log("Chart List Loaded");
	} else {
		SC.Logger.log("Chart List Failed");	
		store.dataSourceDidErrorQuery(query, response);
	}
},

  // ..........................................................
  // RECORD SUPPORT
  // 
  
  retrieveRecord: function(store, storeKey) {
    
    // TODO: Add handlers to retrieve an individual record's contents
    // call store.dataSourceDidComplete(storeKey) when done.
    
    return NO ; // return YES if you handled the storeKey
  },
  
  createRecord: function(store, storeKey) {
    
    // TODO: Add handlers to submit new records to the data source.
    // call store.dataSourceDidComplete(storeKey) when done.
    
    return NO ; // return YES if you handled the storeKey
  },
  
  updateRecord: function(store, storeKey) {
    
    // TODO: Add handlers to submit modified record to the data source
    // call store.dataSourceDidComplete(storeKey) when done.

    return NO ; // return YES if you handled the storeKey
  },
  
  destroyRecord: function(store, storeKey) {
    
    // TODO: Add handlers to destroy records on the data source.
    // call store.dataSourceDidDestroy(storeKey) when done
    
    return NO ; // return YES if you handled the storeKey
  }
  
}) ;
