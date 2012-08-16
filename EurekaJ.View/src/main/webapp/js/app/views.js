EurekaJ.ApplicationView = Ember.View.extend({
    elementId: 'mainArea',
    templateName: 'application'
});

EurekaJ.LoginView = Ember.View.extend({
    elementId: 'loginArea',
    templateName: 'login-page'
});

EurekaJ.MainView = Ember.View.extend({
    elementId: 'mainContentArea',
    templateName: 'main'
});

EurekaJ.MenuView = Ember.View.extend({
    elementId: 'menuArea',
    templateName: 'main-menu'
});

EurekaJ.HeaderView = Ember.View.extend({
    elementId: 'headerArea',
    templateName: 'header'
});

/** tree views **/
EurekaJ.NodeView = Ember.View.extend({
    templateName: 'tree-node',
    tagName: 'div'
});

EurekaJ.NodeContentView = Ember.View.extend({
    templateName: 'tree-node-content',
    tagName: 'span'
});

EurekaJ.NodeTextView = Ember.View.extend({
    templateName: 'tree-node-text',
    tagName: 'span',

    click: function(evt) {
        this.get('content').set('isExpanded', !this.get('content').get('isExpanded'));
    }
});

EurekaJ.NodeArrowView = Ember.View.extend({
    templateName: 'tree-node-arrow',
    tagName: 'span',

    click: function(evt) {
        this.get('content').set('isExpanded', !this.get('content').get('isExpanded'));
    }
});
/** //Tree views **/

EurekaJ.ChartView = Ember.View.extend({
    templateName: 'chart',
    classNames: ['eurekajChart'],
    resizeHandler: null,
    content: null,

    init: function() {
        var view = this;

        var resizeHandler = function() {
            view.rerender();
        };

        this.set('resizeHandler', resizeHandler);
        $(window).bind('resize', this.get('resizeHandler'));
    },

    willDestroy: function() {
        $(window).unbind('resize', this.get('resizeHandler'));
    },

    contentObserver: function() {
        this.rerender();
    }.observes('content.chart.value'),

    numChartsObserver: function() {
        this.rerender();
    }.observes('EurekaJ.router.mainController.content.length'),

    didInsertElement : function() {
        if (this.get('content').get('chart') != null) {

            var numCharts = EurekaJ.router.get('mainController').get('content').get('length');
            var height = (this.$().height() / numCharts) - (numCharts * 8) - 18;
            var width = this.$().width();

            var elementId = this.get('elementId');
            var data = jQuery.parseJSON(this.get('content').get('chart').get('value'));

            var view = this;

            nv.addGraph(function() {
                var chart = nv.models.cumulativeLineChart()
                    .x(function(d) { return d[0] })
                    .y(function(d) { return d[1]/100 })// //adjusting, 100% is 1.00, not 100 as it is in the data
                    .color(d3.scale.category10().range());

                chart.xAxis
                    .tickFormat(function(d) {
                        return d3.time.format('%x')(new Date(d))
                    });

                chart.yAxis
                    .tickFormat(d3.format(',.1%'));

                $("#" + elementId).css('height', height + 'px');
                $("#" + elementId).css('width', width + 'px');

                d3.select('#' + elementId).append('svg')
                    .datum(data)
                    .call(chart);

                //TODO: Figure out a good way to do this automatically
                //nv.utils.windowResize(chart.update);
            });
        }
    }
});