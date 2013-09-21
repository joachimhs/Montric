Montric.MainChartsController = Ember.ArrayController.extend({
    needs: ['application'],

    contentIsLoadedObserver: function() {
        console.log('Main Menu Content isLoaded: ' + this.get('content.isLoaded'));

        var rootNodes = Ember.A();
        console.log('Starting iteration over menu nodes');
        this.get('content').forEach(function(node) {
            if (node.get('parent') === null) {
                rootNodes.pushObject(node);
            }
        });

        console.log('Finished iterating over menu nodes. found ' + rootNodes.get('length') + " root nodes");
        this.set('rootNodes', rootNodes);
    }.observes('content.isLoaded'),

    isSelectedObserver: function() {
        if (this.get('content')) {
            var selectedNodes = this.get('content').filter(function(node) {
                if (node.get('isSelected')) { return true; }
            });

            this.set('selectedNodes', selectedNodes);
        }
    }.observes('content.@each.isSelected'),

    selectedNodesObserver: function() {
        if (this.get('selectedNodes.length')) {
            var length = this.get('selectedNodes.length')
            var showLiveCharts = this.get('controllers.application').get('showLiveCharts');
            if (length > 0 && this.get('chartTimerId') == null) {
                //start timer
                this.startTimer();
            } else if (length == 0 || !showLiveCharts){
                //stop timer if started
                this.stopTimer();
            }
        } else {
            this.stopTimer();
        }
    }.observes('selectedNodes.length'),

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
        this.get('selectedNodes').forEach(function (node) {
            controller.reloadChart(node.get('chart'));
        });
    },

    reloadChart: function (chart) {
        if (chart && !chart.get('isDirty') && chart.get('isLoaded')) {
            chart.reload();
        }
    }
});