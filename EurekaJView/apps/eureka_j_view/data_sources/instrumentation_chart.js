// ==========================================================================
// Project:   EurekaJView.InstrumentationChartDataSource
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
EurekaJView.INSTRUMENTATION_CHART_DATA_QUERY = SC.Query.local(EurekaJView.InstrumentationChartModel);
EurekaJView.InstrumentationChartDataSource = SC.DataSource.extend(
/** @scope EurekaJView.InstrumentationChartDataSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 

  fetch: function(store, query) {

    if (query === EurekaJView.INSTRUMENTATION_CHART_DATA_QUERY) {

		var requestStringJson = { 'getInstrumentationChartData': { 'id' : 'instrumentationChartData', 'path' : EurekaJView.instrumentationChartController.selectedInstrumentationTypePath}};

		SC.Request.postUrl('/jsonController.capp').header({'Accept':'application/json'}).json()
			.notify(this, 'didFetchInstrumentationChartData', store, query)
			.send(requestStringJson);

		return YES;
	}
	

    return NO ; // return YES if you handled the query
  },

  didFetchInstrumentationChartData: function(response, store, query) {
	if (SC.ok(response)) {
		store.reset();
		SC.Logger.log("Got Chart Data. Loading...");
		
		EurekaJView.chartController.set('chartSeries', response.get('body').instrumentationChartData);
		EurekaJView.chartController.triggerTimer();
		store.dataSourceDidFetchQuery(query);
		SC.Logger.log("Chart Data Loaded");
		
		
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
