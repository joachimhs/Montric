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
    templateName: 'header',
    tagName: 'div',
    classNames: ['navbar',  'navbar-fixed-top']
});

EurekaJ.AdminView = Ember.View.extend({
    elementId: 'adminArea',
    templateName: 'admin'
});

EurekaJ.AdminTabContentView = Ember.View.extend({
    elementId: 'adminTabContentArea',
    templateName: 'adminTabContent'
});

EurekaJ.AdminAlertView = Ember.View.extend({
    elementId: 'alertTabView',
    templateName: 'alertTabContent'
});

EurekaJ.ChartGroupTabView = Ember.View.extend({
    elementId: 'chartGroupTabView',
    template: Ember.Handlebars.compile('ChartGroupTabView')
});

EurekaJ.EmailRecipientsTabView = Ember.View.extend({
    elementId: 'emailRecipientsTabView',
    template: Ember.Handlebars.compile('EmailRecipientsTabView')
});

EurekaJ.MenuAdminTabView = Ember.View.extend({
    elementId: 'menuAdminTabView',
    template: Ember.Handlebars.compile('MenuAdminTabView')
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

/** Tab views **/
EurekaJ.TabView = Ember.View.extend({
    tagName: 'div',
    controller: null,

    selectedTabObserver: function() {
        console.log(this.get('controller').get('selectedTab').get('tabId'));
        this.rerender();
    }.observes('controller.selectedTab'),

    template: Ember.Handlebars.compile('<ul class="tabrow">{{#each tab in content}}{{view EurekaJ.TabItemView tabBinding="tab"}}{{/each}}</ul>{{#if controller.selectedTab.hasView}}{{view controller.selectedTab.tabView}}{{/if}}')
});

EurekaJ.TabItemView = Ember.View.extend(Ember.TargetActionSupport, {
    content: null,
    tagName: 'li',

    classNameBindings: "isSelected",

    isSelected: function() {
        return this.get('controller').get('selectedTab').get('tabId') == this.get('tab').get('tabId');
    }.property('controller.selectedTab'),

    click: function() {
        this.get('controller').set('selectedTab', this.get('tab'));
        if (this.get('tab').get('tabState')) {
            EurekaJ.router.transitionTo(this.get('tab').get('tabState'));
        }

    },

    template: Ember.Handlebars.compile('<div class="featureTabTop"></div>{{tab.tabName}}')
});
//** //Tab View **/

/** SelectableListView **/
EurekaJ.SelectableListView = Ember.View.extend({
    tagName: 'ul',
    controller: null,
    classNames: ['selectableList'],

    selectedTabObserver: function() {
        console.log(this.get('controller').get('selectedItem').get('id'));
    }.observes('controller.selectedItem'),

    template: Ember.Handlebars.compile('{{#each arrangedContent}}{{view EurekaJ.SelectableListItem itemBinding="this"}}{{/each}}')
});

EurekaJ.SelectableListItem = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'li',
    classNameBindings: 'isSelected',

    isSelected: function() {
        return this.get('controller.selectedItem.id') == this.get('item').get('id');
    }.property('controller.selectedItem').cacheable(),

    click: function() {
        this.get('controller').set('selectedItem', this.get('item'));
    },

    template: Ember.Handlebars.compile('{{id}}')
});
/** //SelectableListView **/

EurekaJ.LiveChartOptionsView = Ember.View.extend({
    templateName: 'live-chart-options'
});

EurekaJ.ChartView = Ember.View.extend({
    templateName: 'chart',
    classNames: ['eurekajChart'],
    resizeHandler: null,
    content: null,
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
        var data = jQuery.parseJSON(this.get('content').get('chart').get('chartValue'));
        var chart = this.get('nvd3Chart');
        d3.select('#' + elementId + ' svg')
            .datum(data)
            .transition().duration(500)
            .call(chart);
    }.observes('content.chart.chartValue'),

    numChartsObserver: function() {
        this.rerender();
    }.observes('EurekaJ.router.mainController.content.length'),

    didInsertElement : function() {
        if (this.get('content').get('chart') != null) {

            var thisView = this;
            var numCharts = EurekaJ.router.get('mainController').get('content').get('length');
            var height = (this.$().height() / numCharts) - (numCharts * 8) - 18;
            var width = this.$().width();

            var elementId = this.get('elementId');
            var data = jQuery.parseJSON(this.get('content').get('chart').get('chartValue'));

            var view = this;

            nv.addGraph(function() {
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
                    .call(chart);

                thisView.set('nvd3Chart', chart);
                //TODO: Figure out a good way to do this automatically
                //nv.utils.windowResize(chart.update);
            });
        }
    }
});

/** Bootstrap Views **/
EurekaJ.BootstrapButton = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'button',
    classNames: ['button'],
    template: Ember.Handlebars.compile('{{#if view.iconName}}<i {{bindAttr class="view.iconName"}}></i>{{/if}}{{view.content}}')
});

EurekaJ.ChartOptionsButton = EurekaJ.BootstrapButton.extend({
    click: function() {
        $("#chartOptionsModal").modal({show: true});
    }
})

EurekaJ.AdministrationButton = EurekaJ.BootstrapButton.extend({
    click: function() {
        console.log('EurekaJ.AdministrationButton');
        EurekaJ.get('router').send('doAdmin')
    }
});

//** //Bootstrap Views **/