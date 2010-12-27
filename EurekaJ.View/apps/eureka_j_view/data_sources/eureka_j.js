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
EurekaJView.ADMINISTRATION_TREE_QUERY = SC.Query.local(EurekaJView.AdminstrationTreeModel, {
    orderby: 'guiPath'
});

EurekaJView.ALERTS_QUERY = SC.Query.local(EurekaJView.AlertModel, {
    orderby: 'alertName'
});
EurekaJView.EurekaJDataSource = SC.DataSource.extend(
    /** @scope EurekaJView.EurekaJDataSource.prototype */
{

    // ..........................................................
    // QUERY SUPPORT
    // 
    fetch: function(store, query) {
        SC.Logger.log('Calling fetch... ' + query.conditions);
        if (query === EurekaJView.INSTRUMENTATION_TREE_QUERY) {
            SC.Logger.log('fetching the tree menu...');
            var requestStringJson = {
                'getInstrumentationMenu': 'instrumentationMenu',
                'includeCharts': true
            };

            SC.Request.postUrl('/jsonController.capp').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchInstrumentationTreeMenu', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.ADMINISTRATION_TREE_QUERY) {
            SC.Logger.log('fetching the alert tree menu...');
            var requestStringJson = {
                'getInstrumentationMenu': 'administrationMenu',
                'includeCharts': true
            };

            SC.Request.postUrl('/jsonController.capp').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchAdminTreeMenu', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.ALERTS_QUERY) {
            SC.Logger.log('fetching alerts...');
            var requestStringJson = {
                'getAlerts': true
            };

            SC.Request.postUrl('/jsonController.capp').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchAlerts', store, query).send(requestStringJson);

            return YES;
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

    performFetchAdminTreeMenu: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Admin tree fetched');
            store.loadRecords(EurekaJView.AdminstrationTreeModel, response.get('body').administrationMenu);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchAlerts: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Alerts Fetched');
            store.loadRecords(EurekaJView.AlertModel, response.get('body').alerts);
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
            EurekaJView.chartGridController.addAlertToChart();
            // error: indicate as such...response == error
        } else store.dataSourceDidError(storeKey, response.get('body'));
    },

    createRecord: function(store, storeKey) {
        SC.Logger.log('Calling createRecord... ');
        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.AlertModel)) {
            SC.Request.postUrl('/jsonController.capp').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didCreateAlert, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }
        return NO; // return YES if you handled the storeKey
    },

    didCreateAlert: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            store.dataSourceDidComplete(storeKey);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    updateRecord: function(store, storeKey) {
        SC.Logger.log('Calling updateRecord...');
        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.AlertModel)) {
            SC.Request.postUrl('/jsonController.capp').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didUpdateAlert, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }
        return NO; // return YES if you handled the storeKey
    },

    didUpdateAlert: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            var data = response.get('body');
            if (data) data = data.content; // if hash is returned; use it.
            store.dataSourceDidComplete(storeKey, data);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    destroyRecord: function(store, storeKey) {
        SC.Logger.log('Calling destroyRecord...');
        // TODO: Add handlers to destroy records on the data source.
        // call store.dataSourceDidDestroy(storeKey) when done
        return NO; // return YES if you handled the storeKey
    }

});
