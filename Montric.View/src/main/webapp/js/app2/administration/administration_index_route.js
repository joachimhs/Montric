Montric.AdministrationIndexRoute = Ember.Route.extend({
    redirect: function(controller) {
        this.controllerFor('administration').resetSelectedTab();
        this.transitionTo('administration.alerts');
    }
});