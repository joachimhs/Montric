// ==========================================================================
// Project:   EurekaJView.InstrumentationTreeSource
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
EurekaJView.INSTRUMENTATION_TREE_QUERY = SC.Query.remote(EurekaJView.instrumentationTypeTree, {orderby: 'guiPath'});
EurekaJView.InstrumentationTreeSource = SC.DataSource.extend(
/** @scope EurekaJView.InstrumentationTreeSource.prototype */ {

  // ..........................................................
  // QUERY SUPPORT
  // 

  fetch: function(store, query) {
	//alert('InstrumentationTreeSource fetch()1');
	if (query === EurekaJView.INSTRUMENTATION_TREE_QUERY && EurekaJView.instrumentationTypeController.selectedInstrumentationTypePath) {
		//alert('InstrumentationTreeSource fetch()2');
		var requestStringJson = { 'getInstrumentationTree': { 'id' : 'instrumentationMenu', 'path' : EurekaJView.instrumentationTypeController.selectedInstrumentationTypePath}};

		SC.Request.postUrl('/jsonController.capp').header({'Accept':'application/json'}).json()
			.notify(this, 'didFetchInstrumentationTreeMenu', store, query)
			.send(requestStringJson);

		return YES;
	}

    return NO ; // return YES if you handled the query
  },

didFetchInstrumentationTreeMenu: function(response, store, query) {
	if (SC.ok(response)) {
		store.reset();
		store.loadRecords(EurekaJView.instrumentationTree, response.get('body').instrumentationMenu);
		store.dataSourceDidFetchQuery(query);
	} else {
		store.dataSourceDidErrorQuery(query, response);
	}
},

  // ..........................................................
  // RECORD SUPPORT
  // 
  
  retrieveRecord: function(store, storeKey) {
    alert('Tree: retrieveRecord');
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
