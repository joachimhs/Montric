EurekaJ.router = Ember.Router.create({
    enableLogging: true,
    location: 'history',
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
                console.log('exit Home');
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
                console.log('connecting outlets for admin');
                router.get('applicationController').connectOutlet('admin');
                router.get('applicationController').connectOutlet('header', 'header');
            },

            index: Ember.Route.extend({
                route: '/',
                redirectsTo: 'alerts'
            }),

            alerts: Ember.Route.extend({
                route: '/alerts',
                enter: function() {
                    EurekaJ.adminTabBarController.selectTabWithId('alerts');
                },
                connectOutlets: function(router) {
                    console.log('connecting outlets for Alerts');
                    router.get('adminController').connectOutlet({
                        viewClass: EurekaJ.AlertTabView,
                        outletName: 'adminTabContent'
                        //controller: newsView.view.controller.content,
                    });
                }
            }),

            chartGroups: Ember.Route.extend({
                route: '/chartGroups',
                enter: function() {
                    EurekaJ.adminTabBarController.selectTabWithId('chartGroups');
                },
                connectOutlets: function(router) {
                    console.log('connecting outlets for chartGroups');
                    router.get('adminController').connectOutlet({
                        viewClass: EurekaJ.ChartGroupTabView,
                        outletName: 'adminTabContent'
                    });
                }
            }),

            emailRecipients: Ember.Route.extend({
                route: '/emailRecipients',
                enter: function() {
                    EurekaJ.adminTabBarController.selectTabWithId('emailRecipients');
                },
                connectOutlets: function(router) {
                    console.log('connecting outlets for emailRecipients');
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
                    console.log('connecting outlets for menuAdmin');
                    router.get('adminController').connectOutlet({
                        viewClass: EurekaJ.MenuAdminTabView,
                        outletName: 'adminTabContent'
                    });
                }

            })
        })

    })
});