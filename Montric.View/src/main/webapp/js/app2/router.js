Montric.Router.map(function() {
    this.resource("main", {path: "/"}, function() {
        this.resource("login", {path: "/login"}, function() {
            this.route("register", {path: "/register"});
            this.route("selectAccount", {path: "/select_account"});
        });
        this.route("activation");
        this.route("charts");
        this.route("chartGroups");
        this.route("alerts");
        this.resource("administration", {path: "/administration"}, function() {
            this.route('alerts');
            this.route('chartGroups');
            this.route('emailRecipients');
            this.route('menuAdmin');
            this.route('accessTokens');
            this.route('accounts');
            this.route('alertRecipients');
        });
    });
});

Montric.ApplicationRoute = Ember.Route.extend({
    actions: {
        doAdmin: function() {
            this.transitionTo('administration.index');
        }
    },

    redirect: function(controller) {
        Montric.set('appInitialized', true);

        var cookieUser = Montric.get('cookieUser');

        if (cookieUser == null) {
            this.transitionTo('login');
        } else if (cookieUser.get('isUser')) {
            this.transitionTo('main.charts');
        } else if (cookieUser.get('userRole') === 'unregistered') {
            this.transitionTo('login.register');
        }
    },

    setupController: function(controller, model) {
        this._super(controller, model);
        var chartOptionsModalController = this.controllerFor('chartOptionsModal');
        chartOptionsModalController.set('applicationController', controller);
    }
});

Montric.LoginRoute = Ember.Route.extend({
    actions: {
        doLogin: function() {
            console.log('logging in!');
            //this.transitionTo('main.index');
            navigator.id.request();
        }
    }
});

Montric.MainIndexRoute = Ember.Route.extend({
    redirect: function() {
        console.log('redirecting to Charts!');
        this.transitionTo('main.charts');
    }
});

Montric.MainDashboardRoute = Ember.Route.extend({

});

Montric.MainChartsRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('mainMenuModel');
    },

    setupController: function(controller, model) {
        this._super(controller, model);
        console.log('MainChartsRoute setupController: ' + controller);

        this.store.find('mainMenuModel');
        var mainMenu = this.store.filter('mainMenuModel', function(data) {
            if (data.get('parent') === null) { return true; }
        });

        var chartsController = this.controllerFor('charts');
        var chartMenuController = this.controllerFor('chartMenu');
        chartsController.set('mainChartsController', controller);
        chartMenuController.set('mainChartsController', controller);

        controller.set('rootNodes', mainMenu);
    }
});