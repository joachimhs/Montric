// ==========================================================================
// Project:   EurekaJView.InstrumentationDataSource
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
sc_require('models/instrumentation_tree.js');
EurekaJView.INSTRUMENTATION_TYPE_QUERY = SC.Query.local(EurekaJView.instrumentationTypeTree, {orderby: 'guiPath'});
EurekaJView.instrumentationTypeDataSource = SC.DataSource.extend(
/** @scope EurekaJView.InstrumentationDataSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 

  fetch: function(store, query) {
	if (query === EurekaJView.INSTRUMENTATION_TYPE_QUERY) {
		var requestStringJson = { 'getInstrumentationMenu': 'instrumentationMenu'};
		
		SC.Request.postUrl('/jsonController.capp').header({'Accept':'application/json'}).json()
			.notify(this, 'didFetchInstrumentationTreeMenu', store, query)
			.send(requestStringJson);
		
		return YES;
	}

    return NO ; // return YES if you handled the query
  },

didFetchInstrumentationTreeMenu: function(response, store, query) {
	if (SC.ok(response)) {
		//var storeKeys = store.loadRecords(EurekaJView.instrumentationTypeTree, response.get('body').instrumentationMenu);
		//store.loadQueryResults(query, storeKeys);
		store.loadRecords(EurekaJView.instrumentationTypeTree, response.get('body').instrumentationMenu);
		store.dataSourceDidFetchQuery(query);
	} else {
		store.dataSourceDidErrorQuery(query, response);
	}
},

  // ..........................................................
  // RECORD SUPPORT
  // 
  
  retrieveRecord: function(store, storeKey) {
    alert('typeStore: retrieveRecord');
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
