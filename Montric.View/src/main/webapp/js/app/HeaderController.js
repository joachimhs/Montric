Montric.HeaderController = Ember.Controller.extend({
    needs: ['user', 'application'],

    actions: {
        savingChartOptions: function() {
            console.log('calling application controller to update chart dates');
            this.get('controllers.application').updateChartDates();
        },

        showLiveCharts: function() {
            console.log('Header Controller showLiveCharts');
            this.set('controllers.application.showLiveCharts', true);
        },

        showHistoricCharts: function() {
            console.log('Header Controller showHistoricCharts');
            this.set('controllers.application.showLiveCharts', false);
        }
    }
});