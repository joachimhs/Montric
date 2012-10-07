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
                    EurekaJ.log('createNewAlert router action');
                    if (EurekaJ.router.get('adminAlertController').newAlertIsValid()) {
                        EurekaJ.store.createRecord(EurekaJ.AlertModel, {alertName: EurekaJ.router.get('adminAlertController.newAlertName')});
                        EurekaJ.router.get('adminAlertController').set('newAlertName', '');
                    } else {
                        EurekaJ.log('New Alert Name Not Valid!');
                    }
                },

                deleteSelectedAlert: function() {
                    var selectedItem = EurekaJ.router.get('adminAlertController.selectedItem');
                    if (selectedItem) {
                        selectedItem.deleteRecord();
                    }
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
                    EurekaJ.log('createNewChartGroup router action');
                    if (EurekaJ.router.get('adminChartGroupController').newChartGroupIsValid()) {
                        EurekaJ.store.createRecord(EurekaJ.ChartGroupModel, {chartGroupName: EurekaJ.router.get('adminChartGroupController.newChartGroupName')});
                        EurekaJ.router.get('adminChartGroupController').set('newChartGroupName', '');
                    } else {
                        EurekaJ.log('New Chart Group Not Valid!');
                    }
                },

                doAddCheckedNodes: function() {
                    var adminNodes = EurekaJ.store.findAll(EurekaJ.AdminMenuModel);
                    var selectedNodes = adminNodes.filter(function(node) { return node.get('isSelected'); });

                    var selectedChartGroup = EurekaJ.router.get('adminChartGroupController.selectedItem');
                    if (selectedChartGroup) {
                        console.log(selectedChartGroup.get('chartGroupPath'));
                        selectedChartGroup.get('chartGroupPath').pushObjects(selectedNodes);
                    } else {
                        console.log('NO SELECTED CHART GROUP');
                    }

                    selectedNodes.forEach(function(node) {
                        console.log(node.get('id'));
                        node.set('isSelected', false);
                    });
                },


                connectOutlets: function(router) {
                    EurekaJ.log('connecting outlets for chartGroups');
                    router.get('adminController').connectOutlet('adminTabContent', 'adminChartGroup', EurekaJ.store.findAll(EurekaJ.ChartGroupModel));
                    router.get('adminChartGroupController').connectControllers('selectedChartGroup');
                    router.get('selectedChartGroupController').connectControllers('adminChartGroup');
                    router.get('selectedChartGroupPathController').connectControllers('selectedChartGroup');
                    router.get('selectedChartGroupController').connectControllers('selectedChartGroupPath');

                }
            }),

            emailRecipients: Ember.Route.extend({
                route: '/emailRecipients',
                enter: function() {
                    EurekaJ.adminTabBarController.selectTabWithId('emailRecipients');
                },
                connectOutlets: function(router) {
                    EurekaJ.log('connecting outlets for emailRecipients');
                    router.get('adminController').connectOutlet({
                        viewClass: EurekaJ.EmailRecipientsTabView,
                        outletName: 'adminTabContent'
                    });
                }
            }),

            menuAdmin: Ember.Route.extend({
                route: '/menuAdmin',
                enter: function() {
                    EurekaJ.adminTabBarController.selectTabWithId('menuAdmin');
                },connectOutlets: function(router) {
                    EurekaJ.log('connecting outlets for menuAdmin');
                    router.get('adminController').connectOutlet({
                        viewClass: EurekaJ.MenuAdminTabView,
                        outletName: 'adminTabContent'
                    });
                }
            })
        })

    })
});