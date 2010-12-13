// ==========================================================================
// Project:   EurekaJView.EurekaJDataSource
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
sc_require('models/instrumentation_tree_model.js');
EurekaJView.INSTRUMENTATION_TREE_QUERY = SC.Query.local(EurekaJView.InstrumentationTreeModel, {
    orderby: 'guiPath'
});
EurekaJView.EurekaJDataSource = SC.DataSource.extend(
/** @scope EurekaJView.EurekaJDataSource.prototype */
{

    // ..........................................................
    // QUERY SUPPORT
    // 
    fetch: function(store, query) {

        // TODO: Add handlers to fetch data for specific queries.  
        // call store.dataSourceDidFetchQuery(query) when done.
        SC.Logger.log('Calling fetch...');
        if (query === EurekaJView.INSTRUMENTATION_TREE_QUERY) {
            SC.Logger.log('fetching the tree menu...');
            var requestStringJson = {
                'getInstrumentationMenu': 'instrumentationMenu'
            };

            SC.Request.postUrl('/jsonController.capp').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchInstrumentationTreeMenu', store, query).send(requestStringJson);

            return YES;
        }else {
            SC.Logger.log('attempting query: ' + query.get('conditions'));
        }

        return NO; // return YES if you handled the query
    },

    performFetchInstrumentationTreeMenu: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Tree menu fetched');
            store.loadRecords(EurekaJView.InstrumentationTreeModel, response.get('body').instrumentationMenu);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    // ..........................................................
    // RECORD SUPPORT
    // 
    retrieveRecord: function(store, storeKey) {
        var recordType = SC.Store.recordTypeFor(storeKey);
        SC.Logger.log('Calling retrieveRecord for...' + recordType + ' with storeKey: ' + storeKey);

        if (recordType === EurekaJView.ChartSelectorModel) {
            SC.Logger.log("Getting the individual chartSelector");
            var requestStringJson = {
                'getInstrumentationMenuNode': SC.Store.idFor(storeKey)
            };

            SC.Request.postUrl('/jsonController.capp').header({
                'Accept': 'application/json'
            }).json().notify(this, this.performRetrieveChartSelectorRecord, {
                store: store,
                storeKey: storeKey
            }).send(requestStringJson);

            return YES;
        }

        if (recordType === EurekaJView.ChartGridModel) {
            SC.Logger.log("Getting Chart Grid Model");
            var requestStringJson = {
                'getInstrumentationChartData': {
                    'id': storeKey,
                    'path': SC.Store.idFor(storeKey),
                    'chartTimespan': EurekaJView.chartGridController.selectedChartTimespan,
                    'chartResolution': EurekaJView.chartGridController.selectedChartResolution
                }
            };

            SC.Request.postUrl('/jsonController.capp').header({
                'Accept': 'application/json'
            }).json().notify(this, this.performRetrieveChartGridRecord, {
                store: store,
                storeKey: storeKey
            }).send(requestStringJson);

            return YES;

        }

        return NO; // return YES if you handled the storeKey
    },

    performRetrieveChartSelectorRecord: function(response, params) {
        var store = params.store;
        var storeKey = params.storeKey;

        // normal: load into store...response == dataHash
        if (SC.$ok(response)) {
            SC.Logger.log('Finished loading ChartSelectorRecord');
            store.dataSourceDidComplete(storeKey, response.get('body'));

            // error: indicate as such...response == error
        } else store.dataSourceDidError(storeKey, response.get('body'));
    },

    performRetrieveChartGridRecord: function(response, params) {
        var store = params.store;
        var storeKey = params.storeKey;

        // normal: load into store...response == dataHash
        if (SC.$ok(response)) {
            SC.Logger.log('Finished loading ChartGridRecord');
            //SC.Logger.log(response.get('body').data);
            EurekaJView.chartGridController.triggerTimer();
            store.dataSourceDidComplete(storeKey, response.get('body'));
            // error: indicate as such...response == error
        } else store.dataSourceDidError(storeKey, response.get('body'));
    },

    createRecord: function(store, storeKey) {
        SC.Logger.log('Calling createRecord...');
        // TODO: Add handlers to submit new records to the data source.
        // call store.dataSourceDidComplete(storeKey) when done.
        return NO; // return YES if you handled the storeKey
    },

    updateRecord: function(store, storeKey) {
        SC.Logger.log('Calling updateRecord...');
        // TODO: Add handlers to submit modified record to the data source
        // call store.dataSourceDidComplete(storeKey) when done.
        return NO; // return YES if you handled the storeKey
    },

    destroyRecord: function(store, storeKey) {
        SC.Logger.log('Calling destroyRecord...');
        // TODO: Add handlers to destroy records on the data source.
        // call store.dataSourceDidDestroy(storeKey) when done
        return NO; // return YES if you handled the storeKey
    }

});
