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

EurekaJ.AlertTabView = Ember.View.extend({
    elementId: 'alertTabView',
    template: Ember.Handlebars.compile('AlertTabView')
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

EurekaJ.LiveChartOptionsView = Ember.View.extend({
    templateName: 'live-chart-options'
})

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
    }.observes('content.chart.chartValue'),

    numChartsObserver: function() {
        this.rerender();
    }.observes('EurekaJ.router.mainController.content.length'),

    didInsertElement : function() {
        if (this.get('content').get('chart') != null) {

            var numCharts = EurekaJ.router.get('mainController').get('content').get('length');
            var height = (this.$().height() / numCharts) - (numCharts * 8) - 18;
            var width = this.$().width();

            var elementId = this.get('elementId');
            var data = jQuery.parseJSON(this.get('content').get('chart').get('chartValue'));

            console.log('data for chart:');
            console.log(data);
            console.log(this.get('content'));
            console.log(this.get('content').get('chart'));
            console.log(this.get('content').get('chart').get('chartValue'));
            console.log(this.get('content').get('chart').get('id'));

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

/** Bootstrap Views **/
EurekaJ.BootstrapButton = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'button',
    classNames: ['btn'],
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