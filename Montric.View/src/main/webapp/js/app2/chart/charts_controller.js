Montric.ChartsController = Ember.ArrayController.extend({
    needs: 'application',
    contentBinding: 'mainChartsController.selectedNodes',
    mainChartsController: null,
    chartTimerId: null,

    contentLengthObserver: function() {
        var content = this.get('content');
        var length = 0;
        if (content) {
            length = content.get('length');
        }
        var showLiveCharts = this.get('controllers.application').get('showLiveCharts');
        if (length > 0 && this.get('chartTimerId') == null) {
            //start timer
            this.startTimer();
        } else if (length == 0 || !showLiveCharts){
            //stop timer if started
            this.stopTimer();
        }
    }.observes('content.length'),

    startTimer: function() {
        var controller = this;
        var intervalId = setInterval(function () {
            Ember.run(function() {
                if (controller.get('controllers.application').get('showLiveCharts')) {
                    controller.reloadCharts();
                }
            });
        }, 15000);

        this.set('chartTimerId', intervalId);
    },

    stopTimer: function() {
        if (this.get('chartTimerId') != null) {
            Montric.log('stopping timer');
            clearInterval(this.get('chartTimerId'));
            this.set('chartTimerId', null);
        }
    },

    reloadCharts: function () {
        var controller = this;
        this.get('content').forEach(function (node) {
            controller.reloadChart(node.get('chart'));
        });
    },

    reloadChart: function (chart) {
        if (chart && !chart.get('isDirty') && chart.get('isLoaded')) {
            chart.reload();
        }
    }
});