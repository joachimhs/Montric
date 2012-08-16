EurekaJ.router = Ember.Router.create({
    enableLogging: true,
    root: Ember.Route.extend({
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
            doLogout: Ember.Route.transitionTo('login'),
            connectOutlets: function (router) {
                EurekaJ.store.findAll(EurekaJ.MainMenuModel);
                var mainMenu = EurekaJ.store.filter(EurekaJ.MainMenuModel, function(data) {
                    if (data.get('parentPath') === null) { return true; }
                });

                router.get('applicationController').connectOutlet('main', 'main');
                router.get('applicationController').connectOutlet('header', 'header');
                router.get('applicationController').connectOutlet('menu', mainMenu);
            }
        })
    })
});