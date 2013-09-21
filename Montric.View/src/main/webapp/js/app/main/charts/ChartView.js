Montric.ChartView = Ember.View.extend({
    classNames: ['eurekajChart'],
    resizeHandler: null,
    nvd3Chart: null,

    contentObserver: function() {
        console.log('ChartView contentObserver!');
        var elementId = this.get('elementId');
        var series = this.get('chart.series');
        console.log('series: ' + series);
        console.log(series);

        if (series) {

            var palette = new Rickshaw.Color.Palette( { scheme: "munin" } );

            series.forEach(function(serie) {
                if (!serie.color) {
                    serie.color = palette.color()
                }
            });

            var view = this;
            Ember.run.next(function() {
                view.rerender();
            });
        }
    }.observes('chart.series'),

    didInsertElement : function() {
        console.log('ChartView didInsertElement');
        console.log(this.get('chart'));
        if (this.get('chart.series') != null) {
            var elementId = this.get('elementId');
            var series = this.get('chart.series');

            var viewElement = document.getElementById(elementId);

            var chartElement = document.createElement('div');
            chartElement.id = elementId + "_chart";
            chartElement.className = 'chart';
            viewElement.appendChild(chartElement);

            var legendContainerElement = document.createElement('div');
            legendContainerElement.id = elementId + "_legend_container";
            legendContainerElement.className = 'legend';
            chartElement.appendChild(legendContainerElement);

            var legendHeaderElement = document.createElement('div');
            legendHeaderElement.id = elementId + "_legend_header";
            legendHeaderElement.className = 'legend_header';
            legendHeaderElement.innerHTML = this.get('chart.name');
            legendContainerElement.appendChild(legendHeaderElement);

            var legendElement = document.createElement('div');
            legendElement.id = elementId + "_legend";
            legendContainerElement.appendChild(legendElement);

            var sliderElement = document.createElement('div');
            sliderElement.id = elementId + "_slider";
            viewElement.appendChild(sliderElement);

            var thisView = this;

            console.log('CONTROLLER: ' + this.get('controller.selectedNodes.length'));
            var numCharts = this.get('controller.selectedNodes.length');

            var height = (this.$().height() / numCharts) - (numCharts * 6);
            var width = this.$().width() -100;

            $("#" + elementId).css('height', height + 'px');
            $("#" + elementId).css('width', width + 'px');


            var graph = new Rickshaw.Graph( {
                element: document.getElementById(elementId + "_chart"),
                width: width,
                height: height,
                renderer: 'line',
                series: series,
                min: 0
            } );

            graph.render();

            var legend = new Rickshaw.Graph.Legend( {
                graph: graph,
                element: document.getElementById(elementId + '_legend')

            } );

            var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {

                render: function(args) {

                    var graph = this.graph;

                    var points = args.points;
                    var point = points.filter( function(p) { return p.active } ).shift();

                    if (point.value.y === null) return;

                    var hoverHtml = "";

                    var hoverHtml = '<span class="date">' + new Date(point.value.x).toUTCString() + '</span><br />';

                    args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {
                        if (!d.series.color) {
                            d.series.color = "#E1DBAB";
                        }
                        hoverHtml += '<span class="detail_swatch" style="background-color: ' + d.series.color + '"></span>';
                        hoverHtml += d.name + ": " + d.formattedYValue + "<br />";
                    });

                    var formattedXValue = point.formattedXValue;
                    var formattedYValue = point.formattedYValue;

                    this.element.innerHTML = '';
                    this.element.style.left = graph.x(point.value.x) + 'px';

                    var xLabel = document.createElement('div');

                    xLabel.className = 'x_label';
                    xLabel.innerHTML = formattedXValue;
                    this.element.appendChild(xLabel);

                    var item = document.createElement('div');
                    item.id = elementId + "_hoverdiv";
                    item.className = 'item';

                    // invert the scale if this series displays using a scale
                    var series = point.series;
                    var actualY = series.scale ? series.scale.invert(point.value.y) : point.value.y;

                    item.innerHTML = hoverHtml;//this.formatter(series, point.value.x, actualY, formattedXValue, formattedYValue, point);
                    item.style.top = this.graph.y(point.value.y0 + point.value.y) + 'px';

                    this.element.appendChild(item);

                    var dot = document.createElement('div');

                    dot.className = 'dot';
                    dot.style.top = item.style.top;
                    dot.style.borderColor = series.color;

                    this.element.appendChild(dot);

                    if (point.active) {
                        item.className = 'item leftitem active';
                        dot.className = 'dot active';
                    }

                    this.show();

                    if (typeof this.onRender == 'function') {
                        this.onRender(args);
                    }

                    //If item moves over to the right half of the chart, move the hover detail to the left instead
                    if (this.graph.x(point.value.x) > (width / 2)) {
                        var itemWidth = $('#' + elementId + "_hoverdiv").outerWidth();
                        item.className = 'item rightitem active';
                        $('#' + elementId + "_hoverdiv").css({
                            left: $('#' + elementId + "_hoverdiv").position().left - itemWidth - 25 + "px"
                        });

                        item.style.left = item.style.left - itemWidth;
                    }
                }
            });

            var hover = new Hover( { graph: graph } );

            var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
                graph: graph,
                legend: legend
            } );

            var highlight = new Rickshaw.Graph.Behavior.Series.Highlight( {
                graph: graph
            });

            var axes = new Rickshaw.Graph.Axis.X( {
                graph: graph,
                ticks: 9,
                tickFormat: function(x) {
                    return dateFormat(x, "dd/mm HH:MM:ss");
                }
            } );

            var y_ticks = new Rickshaw.Graph.Axis.Y( {
                graph: graph,
                tickFormat: Rickshaw.Fixtures.Number.formatKMBT
            } );
            y_ticks.render();
            axes.render();

        }
    }
});
