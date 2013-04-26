EurekaJ.ChartView = Ember.View.extend({
    classNames: ['eurekajChart'],
    resizeHandler: null,
    nvd3Chart: null,

    /*init: function() {
var view = this;

var resizeHandler = function() {
view.rerender();
};

this.set('resizeHandler', resizeHandler);
$(window).bind('resize', this.get('resizeHandler'));
},

willDestroy: function() {
$(window).unbind('resize', this.get('resizeHandler'));
},*/

    contentObserver: function() {
        var elementId = this.get('elementId');
        var data = jQuery.parseJSON(this.get('chart').get('chartValue'));
        var chart = this.get('nvd3Chart');

        console.log('contentObserver data');
        console.log(data);

        if (chart) {
            d3.select('#' + elementId + ' svg')
                .datum(data)
                .call(chart);
        }
        var view = this;
        /*Ember.run.next(function() {
console.log('.-------<<<>>>-------.');
view.rerender();
});*/

    }.observes('chart.chartValue'),

    didInsertElement : function() {
        console.log('ChartView didInsertElement');
        console.log(this.get('chart'));
        if (this.get('chart') != null) {
            console.log(this.get('content.chartValue'));
            var thisView = this;
            var numCharts = this.get('controller').get('content').get('length');
            var height = (this.$().height() / numCharts) - (numCharts * 6);
            var width = this.$().width();

            var elementId = this.get('elementId');
            var data = jQuery.parseJSON(this.get('chart').get('chartValue'));

            console.log('data');
            console.log(data);

            var view = this;

            nv.addGraph(function() {
                console.log('nv.addGraph');
                var chart = nv.models.lineChart()
                    .x(function(d) { return d[0] })
                    .y(function(d) { return d[1] })// //adjusting, 100% is 1.00, not 100 as it is in the data
                    .color(d3.scale.category10().range())
                    .forceY(0);

                chart.xAxis
                    .tickFormat(function(d) {
                        return d3.time.format('%d/%m %H:%M:%S')(new Date(d))
                    });

                chart.yAxis.tickFormat(function(yValue) {
                    var retVal = Math.round(yValue*1000)/1000;
                    if (yValue >= 1000 && yValue < 1000000) {
                        retVal = yValue / 1000;
                        retVal = retVal + "k";
                    }
                    if (yValue >= 1000000 && yValue < 1000000000) {
                        retVal = yValue / 1000000;
                        retVal = retVal + "m";
                    }
                    if (yValue >= 1000000000 && yValue < 1000000000000) {
                        retVal = yValue / 1000000000;
                        retVal = retVal + "g";
                    }
                    if (yValue >= 1000000000000 && yValue < 1000000000000000) {
                        retVal = yValue / 1000000000000;
                        retVal = retVal + "t";
                    }
                    return retVal;
                });

                chart.yAxis.showMaxMin(false);
                chart.xAxis.showMaxMin(false);

                $("#" + elementId).css('height', height + 'px');
                $("#" + elementId).css('width', width + 'px');

                d3.select('#' + elementId).append('svg')
                    .datum(data)
                    .transition().duration(500)
                    .call(chart);

                thisView.set('nvd3Chart', chart);
                //TODO: Figure out a good way to do this automatically
                //nv.utils.windowResize(chart.update);
            });
        }
    }
});
