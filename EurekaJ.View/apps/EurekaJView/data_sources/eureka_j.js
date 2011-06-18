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
sc_require('models/triggered_alert_model.js');
EurekaJView.INSTRUMENTATION_TREE_QUERY = SC.Query.local(EurekaJView.InstrumentationTreeModel, {
    orderby: 'guiPath'
});
EurekaJView.ADMINISTRATION_TREE_QUERY = SC.Query.local(EurekaJView.AdminstrationTreeModel, {
    orderby: 'guiPath'
});

EurekaJView.ALERTS_QUERY = SC.Query.local(EurekaJView.AlertModel, {
    orderby: 'alertName'
});

EurekaJView.INSTRUMENTATION_GROUPS_QUERY = SC.Query.local(EurekaJView.InstrumentationGroupModel, {
    orderby: 'instrumentaionGroupName'
});

EurekaJView.EMAIL_GROUPS_QUERY = SC.Query.local(EurekaJView.EmailGroupModel, {
    orderby: 'emailGroupName'
});

EurekaJView.TRIGGERED_ALERTS_QUERY = SC.Query.local(EurekaJView.TriggeredAlertModel, {
    orderby: 'triggeredDate'
});

EurekaJView.LOGGED_IN_USER_QUERY = SC.Query.local(EurekaJView.UserModel, {});

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

            SC.Request.postUrl('/instrumentationMenu').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchInstrumentationTreeMenu', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.ADMINISTRATION_TREE_QUERY) {
            SC.Logger.log('fetching the Administration tree menu...');
            var requestStringJson = {
                'getInstrumentationMenu': 'administrationMenu',
                'includeCharts': true,
                'nodeType' : 'chart'
            };

            SC.Request.postUrl('/instrumentationMenu').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchAdminTreeMenu', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.ALERTS_QUERY) {
            SC.Logger.log('fetching alerts...');
            var requestStringJson = {
                'getAlerts': true
            };

            SC.Request.postUrl('/alert').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchAlerts', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.INSTRUMENTATION_GROUPS_QUERY) {
            SC.Logger.log('fetching instrumentation groups...');
            var requestStringJson = {
                'getInstrumentationGroups': true
            };

            SC.Request.postUrl('/instrumentationGroup').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchInstrumentationGroups', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.EMAIL_GROUPS_QUERY) {
            SC.Logger.log('fetching email groups...');
            var requestStringJson = {
                'getEmailGroups': true
            };

            SC.Request.postUrl('/email').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchEmailGroups', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.TRIGGERED_ALERTS_QUERY) {
            SC.Logger.log('fetching triggered alerts...');
            var requestStringJson = {
                'getTriggeredAlerts': true
            };

            SC.Request.postUrl('/alert').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchTriggeredAlerts', store, query).send(requestStringJson);

            return YES;
        }

        if (query === EurekaJView.LOGGED_IN_USER_QUERY) {
            SC.Logger.log('fetching logged in user...');
            var requestStringJson = {
                'getLoggedInUser': true
            };

            SC.Request.postUrl('/user').header({
                'Accept': 'application/json'
            }).json().notify(this, 'performFetchLoggedInUser', store, query).send(requestStringJson);

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

    performFetchInstrumentationGroups: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Instrumentation Groups Fetched');
            store.loadRecords(EurekaJView.InstrumentationGroupModel, response.get('body').instrumentationGroups);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchEmailGroups: function(response, store, query) {
        if (SC.ok(response)) {
            SC.Logger.log('Email Groups Fetched');
            store.loadRecords(EurekaJView.EmailGroupModel, response.get('body').emailGroups);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchTriggeredAlerts: function(response, store, query) {
        if (SC.ok(response)) {
            store.loadRecords(EurekaJView.TriggeredAlertModel, response.get('body').triggeredAlerts);
            store.dataSourceDidFetchQuery(query);
        } else {
            store.dataSourceDidErrorQuery(query, response);
        }
    },

    performFetchLoggedInUser: function(response, store, query) {
        if (SC.ok(response)) {
            EurekaJView.userController.set('username', response.get('body').loggedInUser.username);
            EurekaJView.userController.set('userRole', response.get('body').loggedInUser.userRole);
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

        if (recordType === EurekaJView.ChartGridModel) {
            SC.Logger.log("Getting Chart Grid Model");
            var requestStringJson = {};

            if (EurekaJView.chartGridController.get('showHistoricalData') === NO) {
                requestStringJson = {
                    'getInstrumentationChartData': {
                        'id': storeKey,
                        'path': SC.Store.idFor(storeKey),
                        'chartTimespan': EurekaJView.chartGridController.selectedChartTimespan,
                        'chartResolution': EurekaJView.chartGridController.selectedChartResolution,
                        'chartOffsetMs': EurekaJView.chartGridController.selectedTimeZoneOffset * 60 * 60 * 1000
                    }
                };
            } else {
                var fromMs = EurekaJView.chartGridController.selectedChartFrom.get('milliseconds');
                var toMs = EurekaJView.chartGridController.selectedChartTo.get('milliseconds');
                requestStringJson = {
                    'getInstrumentationChartData': {
                        'id': storeKey,
                        'path': SC.Store.idFor(storeKey),
                        'chartFrom': fromMs,
                        'chartTo': toMs,
                        'chartResolution': EurekaJView.chartGridController.selectedChartResolution,
                        'chartOffsetMs': EurekaJView.chartGridController.selectedTimeZoneOffset * 60 * 60 * 1000
                    }
                };
            }

            SC.Request.postUrl('/chart').header({
                'Accept': 'application/json'
            }).json().notify(this, this.performRetrieveChartGridRecord, {
                                                                            store: store,
                                                                            storeKey: storeKey
                                                                        }).send(requestStringJson);

            return YES;

        }

        if (recordType === EurekaJView.EmailRecipientModel) {
            SC.Logger.log("Getting Email Recipient Model");
            var requestStringJson = {
                'getEmailRecipient': SC.Store.idFor(storeKey)
            };

            SC.Request.postUrl('/email').header({
                'Accept': 'application/json'
            }).json().notify(this, this.performRetrieveEmailRecipientRecord, {
                                                                                 store: store,
                                                                                 storeKey: storeKey
                                                                             }).send(requestStringJson);

            return YES;
        }

        return NO; // return YES if you handled the storeKey
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

    performRetrieveEmailRecipientRecord: function(response, params) {
        var store = params.store;
        var storeKey = params.storeKey;

        // normal: load into store...response == dataHash
        if (SC.$ok(response)) {
            SC.Logger.log('Finished loading Email Recipient');
            store.dataSourceDidComplete(storeKey, response.get('body'));

            // error: indicate as such...response == error
        } else store.dataSourceDidError(storeKey, response.get('body'));
    },

    createRecord: function(store, storeKey) {
        SC.Logger.log('Calling createRecord... ');
        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.AlertModel)) {
            SC.Request.postUrl('/alert').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didCreateAlert, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.InstrumentationGroupModel)) {
            SC.Request.postUrl('/instrumentationGroup').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didCreateInstrumentationGroup, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.EmailGroupModel)) {
            SC.Request.postUrl('/email').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didCreateEmailGroup, store, storeKey)
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

    didCreateInstrumentationGroup: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            store.dataSourceDidComplete(storeKey);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    didCreateEmailGroup: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            store.dataSourceDidComplete(storeKey);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    updateRecord: function(store, storeKey) {
        SC.Logger.log('Calling updateRecord...');
        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.AlertModel)) {
            SC.Request.postUrl('/alert').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didUpdateAlert, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.InstrumentationGroupModel)) {
            SC.Request.postUrl('/instrumentationGroup').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didUpdateInstrumentationGroup, store, storeKey)
                    .send(store.readDataHash(storeKey));
            return YES;
        }

        if (SC.kindOf(store.recordTypeFor(storeKey), EurekaJView.EmailGroupModel)) {
            SC.Request.postUrl('/email').header({
                'Accept': 'application/json'
            }).json()
                    .notify(this, this.didUpdateEmailGroup, store, storeKey)
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

    didUpdateInstrumentationGroup: function(response, store, storeKey) {
        if (SC.$ok(response)) {
            var data = response.get('body');
            if (data) data = data.content; // if hash is returned; use it.
            store.dataSourceDidComplete(storeKey, data);
        } else {
            store.dataSourceDidError(storeKey, response);
        }
    },

    didUpdateEmailGroup: function(response, store, storeKey) {
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
