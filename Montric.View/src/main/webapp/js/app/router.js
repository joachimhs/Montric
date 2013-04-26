Montric.Router.map(function() {
    this.route("login", {path: "/"});
    this.resource("main", {path: "/main"}, function() {
        this.route("dashboard");
        this.route("charts");
        this.route("chartGroups");
        this.route("alerts");
        this.resource("administration", {path: "/administration"}, function() {
            this.route('alerts');
            this.route('chartGroups');
            this.route('emailRecipients');
            this.route('menuAdmin');
        });
    });
});

Montric.ApplicationRoute = Ember.Route.extend({
    events: {
        doAdmin: function() {
            this.transitionTo('administration.index');
        }
    },

    setupController: function(controller, model) {
        this._super(controller, model);
        var chartOptionsModalController = this.controllerFor('chartOptionsModal');
        chartOptionsModalController.set('applicationController', controller);
    }
});


Montric.LoginRoute = Ember.Route.extend({
    events: {
        doLogin: function() {
            console.log('logging in!');
            this.transitionTo('main.index');
        }
    }
});

Montric.MainIndexRoute = Ember.Route.extend({
    redirect: function() {
        console.log('redirecting to Dashboard!');
        this.transitionTo('main.dashboard');
    }
});

Montric.MainDashboardRoute = Ember.Route.extend({

});

Montric.MainChartsRoute = Ember.Route.extend({
    model: function() {
        return Montric.MainMenuModel.find();
    },

    setupController: function(controller, model) {
        this._super(controller, model);
        console.log('MainChartsRoute setupController: ' + controller);

        Montric.MainMenuModel.find();
        var mainMenu = Montric.store.filter(Montric.MainMenuModel, function(data) {
            if (data.get('parent') === null) { return true; }
        });

        var chartsController = this.controllerFor('charts');
        var chartMenuController = this.controllerFor('chartMenu');
        chartsController.set('mainChartsController', controller);
        chartMenuController.set('mainChartsController', controller);

        controller.set('rootNodes', mainMenu);
        controller.set('content', Montric.MainMenuModel.find());
    }
});

/*Montric.router = Ember.Router.create({
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
                if(!Montric.appValuesController.get('showLiveCharts')) {
                    Montric.appValuesController.updateChartDates();
                }
                router.get('mainController').reloadCharts();
            },

            historicalChartsSelected: function(router) {
                Montric.appValuesController.set('showLiveCharts', false);
            },

            liveChartsSelected: function(router) {
                Montric.appValuesController.set('showLiveCharts', true);
            },

            connectOutlets: function (router) {
                Montric.store.findAll(Montric.MainMenuModel);
                var mainMenu = Montric.store.filter(Montric.MainMenuModel, function(data) {
                    if (data.get('parentPath') === null) { return true; }
                });

                router.get('applicationController').connectOutlet('main');
                router.get('menuController').set('content', mainMenu);
                router.get('applicationController').connectOutlet('header', 'header');

            },
            exit: function() {
                Montric.log('exit Home');
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
                Montric.log('connecting outlets for admin');
                router.get('applicationController').connectOutlet('admin');
                router.get('applicationController').connectOutlet('header', 'header');

                router.get('adminAlertController').connectControllers('adminMenu');
                router.get('adminChartGroupController').connectControllers('adminMenu');
                router.get('adminEmailGroupController').connectControllers('adminMenu');

                Montric.store.findAll(Montric.AdminMenuModel);
                var mainMenu = Montric.store.filter(Montric.AdminMenuModel, function(data) {
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
                    Montric.store.commit();
                },

                createNewAlert: function() {
                    Montric.router.get('adminAlertController').createNewAlert();
                },

                deleteSelectedAlert: function() {
                    $("#adminAlertConfirmDialog").modal({show: true});
                },

                doCancelAlertDeletion: function(router) {
                    $("#adminAlertConfirmDialog").modal('hide');
                },

                doConfirmDeletion: function(router) {
                    console.log('doConfirmDeletion');
                    var selectedItem = Montric.router.get('adminAlertController.selectedItem');
                    if (selectedItem) {
                        selectedItem.deleteRecord();
                    }
                    Montric.store.commit();
                    $("#adminAlertConfirmDialog").modal('hide');
                },

                enter: function() {
                    Montric.adminTabBarController.selectTabWithId('alerts');
                },
                connectOutlets: function(router) {
                    Montric.log('connecting outlets for Alerts');
                    router.get('adminController').connectOutlet('adminTabContent', 'adminAlert', Montric.store.findAll(Montric.AlertModel));
                }
            }),

            chartGroups: Ember.Route.extend({
                route: '/chartGroups',
                enter: function() {
                    Montric.adminTabBarController.selectTabWithId('chartGroups');
                },

                createNewChartGroup: function() {
                    Montric.router.get('adminChartGroupController').createNewChartGroup();
                },

                doCommitChartGroup: function() {
                    Montric.store.commit();
                },

                doAddCheckedNodes: function() {
                    Montric.router.get('adminChartGroupController').doAddCheckedNodes();
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
                    Montric.store.commit();
                    $("#chartGroupConfirmDialog").modal('hide');
                },

                deleteSelectedChartPathGroup: function() {
                    $("#chartGroupPathsConfirmDialog").modal({show: true});
                },

                doCancelPathDeletion: function(router) {
                    $("#chartGroupPathsConfirmDialog").modal('hide');
                },

                doConfirmPathDeletion: function(router) {
                    Montric.router.get('adminChartGroupController').deleteSelectedChartPathGroup();
                    $("#chartGroupPathsConfirmDialog").modal('hide');
                },

                connectOutlets: function(router) {
                    Montric.log('connecting outlets for chartGroups');
                    router.get('adminController').connectOutlet('adminTabContent', 'adminChartGroup', Montric.store.findAll(Montric.ChartGroupModel));
                    router.get('selectedChartGroupController').connectControllers('adminChartGroup');
                }
            }),

            emailRecipients: Ember.Route.extend({
                route: '/emailRecipients',

                createNewEmailGroup: function() {
                    Montric.router.get('adminEmailGroupController').createNewEmailGroup();
                },

                deleteSelectedEmailGroup: function() {
                    $("#emailGroupConfirmDialog").modal({show: true});
                },

                doCancelDeletion: function(router) {
                    $("#emailGroupConfirmDialog").modal('hide');
                },

                doConfirmDeletion: function(router) {
                    Montric.router.get('adminEmailGroupController').deleteSelectedEmailGroup();
                    $("#emailGroupConfirmDialog").modal('hide');
                },

                deleteSelectedEmailRecipient: function() {
                    $("#emailAddressConfirmDialog").modal({show: true});
                },

                doCancelAddressDeletion: function(router) {
                    $("#emailAddressConfirmDialog").modal('hide');
                },

                doConfirmAddressDeletion: function(router) {
                    Montric.router.get('adminEmailGroupController').deleteSelectedEmailRecipient();
                    $("#emailAddressConfirmDialog").modal('hide');
                },

                doCommitEmailGroup: function() {
                    Montric.store.commit();
                },

                doAddEmailRecipient: function() {
                    Montric.router.get('adminEmailGroupController').doAddEmailRecipient();
                },

                enter: function() {
                    Montric.adminTabBarController.selectTabWithId('emailRecipients');
                },

                connectOutlets: function(router) {
                    Montric.log('connecting outlets for emailRecipients');
                    router.get('adminController').connectOutlet('adminTabContent', 'adminEmailGroup', Montric.store.findAll(Montric.EmailGroupModel));
                }
            }),

            menuAdmin: Ember.Route.extend({
                route: '/menuAdmin',
                enter: function() {
                    Montric.adminTabBarController.selectTabWithId('menuAdmin');
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
                    Montric.store.commit();
                    $("#menuAdminConfirmDialog").modal('hide');
                },

                connectOutlets: function(router) {
                    Montric.log('connecting outlets for menuAdmin');
                    router.get('adminController').connectOutlet('adminTabContent', 'adminTabContent');
                    router.get('adminTabContentController').connectControllers('adminMenu');
                }
            })
        })

    })
});*/