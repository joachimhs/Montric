EurekaJ.router = Ember.Router.create({
    enableLogging: true,
    //location: 'history',
    root: Ember.Route.extend({
        doHome: Ember.Route.transitionTo('home'),
        doAdmin: Ember.Route.transitionTo('admin.alerts'),
        doLogout: Ember.Route.transitionTo('login'),

        index: Ember.Route.extend({
            route: '/',
            redirectsTo: 'login'
        }),
        login: Ember.Route.extend({
            route: '/login',
            doLogin: Ember.Route.transitionTo('home'),
            connectOutlets: function (router) {
                router.get('applicationController').connectOutlet('login');
            }
        }),
        home: Ember.Route.extend({
            route: '/home',

            applyChartOptionsChanges: function(router) {
                if(!EurekaJ.appValuesController.get('showLiveCharts')) {
                    EurekaJ.appValuesController.updateChartDates();
                }
                router.get('mainController').reloadCharts();
            },

            historicalChartsSelected: function(router) {
                EurekaJ.appValuesController.set('showLiveCharts', false);
            },

            liveChartsSelected: function(router) {
                EurekaJ.appValuesController.set('showLiveCharts', true);
            },

            connectOutlets: function (router) {
                EurekaJ.store.findAll(EurekaJ.MainMenuModel);
                var mainMenu = EurekaJ.store.filter(EurekaJ.MainMenuModel, function(data) {
                    if (data.get('parentPath') === null) { return true; }
                });

                router.get('applicationController').connectOutlet('main');
                router.get('menuController').set('content', mainMenu);
                router.get('applicationController').connectOutlet('header', 'header');

            },
            exit: function() {
                EurekaJ.log('exit Home');
            }
        }),
        admin: Ember.Route.extend({
            route: '/admin',
            redirectTo: 'alerts',

            doAlerts: Ember.Router.transitionTo('alerts'),
            doChartGroups: Ember.Router.transitionTo('chartGroups'),
            doEmailRecipients: Ember.Router.transitionTo('emailRecipients'),
            doMenuAdmin: function() {
                Ember.Router.transitionTo('alerts')
            },

            connectOutlets: function(router) {
                EurekaJ.log('connecting outlets for admin');
                router.get('applicationController').connectOutlet('admin');
                router.get('applicationController').connectOutlet('header', 'header');

                router.get('adminAlertController').connectControllers('adminMenu');
                router.get('adminChartGroupController').connectControllers('adminMenu');
                router.get('adminEmailGroupController').connectControllers('adminMenu');

                EurekaJ.store.findAll(EurekaJ.AdminMenuModel);
                var mainMenu = EurekaJ.store.filter(EurekaJ.AdminMenuModel, function(data) {
                    if (data.get('parentPath') === null) { return true; }
                });

                router.get('adminMenuController').set('content', mainMenu);
            },

            index: Ember.Route.extend({
                route: '/',
                redirectsTo: 'alerts'
            }),

            alerts: Ember.Route.extend({
                route: '/alerts',

                doCommitAlert: function() {
                    EurekaJ.store.commit();
                },

                createNewAlert: function() {
                    EurekaJ.router.get('adminAlertController').createNewAlert();
                },

                deleteSelectedAlert: function() {
                    $("#adminAlertConfirmDialog").modal({show: true});
                },

                doCancelAlertDeletion: function(router) {
                    $("#adminAlertConfirmDialog").modal('hide');
                },

                doConfirmDeletion: function(router) {
                    console.log('doConfirmDeletion');
                    var selectedItem = EurekaJ.router.get('adminAlertController.selectedItem');
                    if (selectedItem) {
                        selectedItem.deleteRecord();
                    }
                    EurekaJ.store.commit();
                    $("#adminAlertConfirmDialog").modal('hide');
                },

                enter: function() {
                    EurekaJ.adminTabBarController.selectTabWithId('alerts');
                },
                connectOutlets: function(router) {
                    EurekaJ.log('connecting outlets for Alerts');
                    router.get('adminController').connectOutlet('adminTabContent', 'adminAlert', EurekaJ.store.findAll(EurekaJ.AlertModel));
                }
            }),

            chartGroups: Ember.Route.extend({
                route: '/chartGroups',
                enter: function() {
                    EurekaJ.adminTabBarController.selectTabWithId('chartGroups');
                },

                createNewChartGroup: function() {
                    EurekaJ.router.get('adminChartGroupController').createNewChartGroup();
                },

                doCommitChartGroup: function() {
                    EurekaJ.store.commit();
                },

                doAddCheckedNodes: function() {
                    EurekaJ.router.get('adminChartGroupController').doAddCheckedNodes();
                },

                deleteSelectedChartGroup: function() {
                    $("#chartGroupConfirmDialog").modal({show: true});
                },

                doCancelDeletion: function(router) {
                    $("#chartGroupConfirmDialog").modal('hide');
                },

                doConfirmDeletion: function(router) {
                    var selectedItem = router.get('adminChartGroupController.selectedItem');
                    if (selectedItem) {
                        selectedItem.deleteRecord();
                    }
                    EurekaJ.store.commit();
                    $("#chartGroupConfirmDialog").modal('hide');
                },

                deleteSelectedChartPathGroup: function() {
                    $("#chartGroupPathsConfirmDialog").modal({show: true});
                },

                doCancelPathDeletion: function(router) {
                    $("#chartGroupPathsConfirmDialog").modal('hide');
                },

                doConfirmPathDeletion: function(router) {
                    EurekaJ.router.get('adminChartGroupController').deleteSelectedChartPathGroup();
                    $("#chartGroupPathsConfirmDialog").modal('hide');
                },

                connectOutlets: function(router) {
                    EurekaJ.log('connecting outlets for chartGroups');
                    router.get('adminController').connectOutlet('adminTabContent', 'adminChartGroup', EurekaJ.store.findAll(EurekaJ.ChartGroupModel));
                    router.get('selectedChartGroupController').connectControllers('adminChartGroup');
                }
            }),

            emailRecipients: Ember.Route.extend({
                route: '/emailRecipients',

                createNewEmailGroup: function() {
                    EurekaJ.router.get('adminEmailGroupController').createNewEmailGroup();
                },

                deleteSelectedEmailGroup: function() {
                    $("#emailGroupConfirmDialog").modal({show: true});
                },

                doCancelDeletion: function(router) {
                    $("#emailGroupConfirmDialog").modal('hide');
                },

                doConfirmDeletion: function(router) {
                    EurekaJ.router.get('adminEmailGroupController').deleteSelectedEmailGroup();
                    $("#emailGroupConfirmDialog").modal('hide');
                },

                deleteSelectedEmailRecipient: function() {
                    $("#emailAddressConfirmDialog").modal({show: true});
                },

                doCancelAddressDeletion: function(router) {
                    $("#emailAddressConfirmDialog").modal('hide');
                },

                doConfirmAddressDeletion: function(router) {
                    EurekaJ.router.get('adminEmailGroupController').deleteSelectedEmailRecipient();
                    $("#emailAddressConfirmDialog").modal('hide');
                },

                doCommitEmailGroup: function() {
                    EurekaJ.store.commit();
                },

                doAddEmailRecipient: function() {
                    EurekaJ.router.get('adminEmailGroupController').doAddEmailRecipient();
                },

                enter: function() {
                    EurekaJ.adminTabBarController.selectTabWithId('emailRecipients');
                },

                connectOutlets: function(router) {
                    EurekaJ.log('connecting outlets for emailRecipients');
                    router.get('adminController').connectOutlet('adminTabContent', 'adminEmailGroup', EurekaJ.store.findAll(EurekaJ.EmailGroupModel));
                }
            }),

            menuAdmin: Ember.Route.extend({
                route: '/menuAdmin',
                enter: function() {
                    EurekaJ.adminTabBarController.selectTabWithId('menuAdmin');
                },

                doCommitMenu: function(router) {
                    $("#menuAdminConfirmDialog").modal({show: true});
                },

                doCancelDeletion: function(router) {
                    $("#menuAdminConfirmDialog").modal('hide');
                },

                doConfirmDeletion: function(router) {
                    var selectedNodes = router.get('adminMenuController.selectedNodes');
                    selectedNodes.forEach(function(node) {
                        node.deleteRecord();
                    })
                    router.get('adminMenuController').deselectAllNodes();
                    EurekaJ.store.commit();
                    $("#menuAdminConfirmDialog").modal('hide');
                },

                connectOutlets: function(router) {
                    EurekaJ.log('connecting outlets for menuAdmin');
                    router.get('adminController').connectOutlet('adminTabContent', 'adminTabContent');
                    router.get('adminTabContentController').connectControllers('adminMenu');
                }
            })
        })

    })
});