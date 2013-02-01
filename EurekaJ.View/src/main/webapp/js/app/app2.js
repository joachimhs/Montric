EurekaJ = Ember.Application.create();

EurekaJ.Router.map(function() {
    this.route("login", {path: "/"});
    this.resource("main", {path: "/main"}, function() {
        this.route("dashboard");
        this.route("charts");
        this.route("chartGroups");
        this.route("alerts");
        this.route("administration");
    });
});

EurekaJ.LoginRoute = Ember.Route.extend({
    events: {
        doLogin: function() {
            console.log('logging in!');
            this.transitionTo('main.index');
        }
    }
});

EurekaJ.MainIndexRoute = Ember.Route.extend({
    redirect: function() {
        console.log('redirecting to Dashboard!');
        this.transitionTo('main.dashboard');
    }
});

EurekaJ.MainDashboardRoute = Ember.Route.extend({

});

EurekaJ.MainChartsRoute = Ember.Route.extend({
    model: function() {
        return EurekaJ.MainMenuModel.find();
    },

    setupController: function(controller, model) {
        this._super(controller, model);
        console.log('MainChartsRoute setupController: ' + controller);

        EurekaJ.MainMenuModel.find();
        var mainMenu = EurekaJ.store.filter(EurekaJ.MainMenuModel, function(data) {
            if (data.get('parent_id') === null) { return true; }
        });

        var chartsController = this.controllerFor('charts');
        var chartMenuController = this.controllerFor('chartMenu');
        chartsController.set('mainChartsController', controller);
        chartMenuController.set('mainChartsController', controller);

        controller.set('rootNodes', mainMenu);
        controller.set('content', EurekaJ.MainMenuModel.find());
    }
});

EurekaJ.MainChartsController = Ember.ArrayController.extend({

    isSelectedObserver: function() {
        if (this.get('content')) {
            var selectedNodes = this.get('content').filter(function(node) {
                if (node.get('isSelected')) { return true; }
            });

            this.set('selectedNodes', selectedNodes);
        }
    }.observes('content.@each.isSelected')
});

EurekaJ.ChartsController = Ember.ArrayController.extend({
    contentBinding: 'mainChartsController.selectedNodes',
    mainChartsController: null

});

EurekaJ.ChartMenuController = Ember.ArrayController.extend({
    contentBinding: 'mainChartsController.rootNodes',
    mainChartsController: null
});


EurekaJ.HeaderView = Ember.View.extend({
    elementId: 'headerArea'
});

EurekaJ.MainDashboardView = Ember.View.extend({
    elementId: 'mainContentArea'
});

EurekaJ.ChartsView = Ember.View.extend({
    elementId: 'chartsArea',
    templateName: 'charts'
});

EurekaJ.ChartMenuView = Ember.View.extend({
    elementId: 'menuArea'
});

EurekaJ.BootstrapButton = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'button',
    classNames: ['button'],
    disabled: false,

    click: function() {
        if (!this.get('disabled')) {
            this.triggerAction();
        }
    },

    template: Ember.Handlebars.compile('{{#if view.iconName}}<i {{bindAttr class="view.iconName"}}></i>{{/if}}{{view.content}}')
});

Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '{{render header}}' +
    '{{outlet}}'
);

Ember.TEMPLATES['header'] = Ember.Handlebars.compile('' +
    '<span class="headerText">{{#linkTo main}}<img src="/img/logo-small.png" />{{/linkTo}}</span>' +
    '{{view EurekaJ.BootstrapButton target="controller" action="doAdmin" classNames="btn-info btn-mini pull-right mediumTopPadding" content="Administration" iconName="icon-cog"}}' +
    '{{view EurekaJ.BootstrapButton classNames="btn-info btn-mini pull-right mediumTopPadding" content="Chart Options"}}'
);

Ember.TEMPLATES['main/dashboard'] = Ember.Handlebars.compile('' +
    '{{#linkTo main.charts}}Charts{{/linkTo}}<br />' +
    '{{#linkTo main.alerts}}Alerts{{/linkTo}}<br />' +
    '{{#linkTo main.chartGroups}}Chart Groups{{/linkTo}}<br />' +
    '{{#linkTo main.charts}}Adminisration{{/linkTo}}<br />'
);

Ember.TEMPLATES['main/charts'] = Ember.Handlebars.compile('' +
    '{{render chartMenu}}' +
    '{{render charts}}'
);

Ember.TEMPLATES['charts'] = Ember.Handlebars.compile('' +
    '{{#each controller}}' +
        '{{view EurekaJ.ChartView chartBinding="chart"}}<br />' +
    '{{/each}}'
);

Ember.TEMPLATES['chartMenu'] = Ember.Handlebars.compile('' +
    '<h1>Charts Menu</h1>' +
    '{{view EurekaJ.TreeView itemsBinding="content"}}'
);

Ember.TEMPLATES['login'] = Ember.Handlebars.compile('' +
    '<div class="loginBox well">' +
        '<h1>EurekaJ Login</h1> ' +
        'Username: <br />' +
        '{{view Ember.TextField elementId="usernameInput" value=""}}<br />' +
        'Password: <br />' +
        '{{view Ember.TextField elementId="passwordInput" value=""}}<br />' +
        '{{view Ember.Checkbox elementId="remeberCheck" }} Remember me<br />' +
        '<button {{action doLogin}} class="tenPxMarginTop">Login</button>' +
    '</div>'
);

EurekaJ.Adapter = DS.RESTAdapter.extend();

EurekaJ.Adapter.map(EurekaJ.ChartSeriesModel, {
    seriesValues: { embedded: 'always' }
});

EurekaJ.Adapter.map(EurekaJ.ChartModel, {
    series: { embedded: 'always'}
});

EurekaJ.store = DS.Store.create({
    //adapter: EurekaJ.Adapter,
    adapter:  EurekaJ.Adapter.create({ bulkCommit: false }),
    revision: 11
});

/** tree views **/
EurekaJ.TreeView = Ember.View.extend({
    tagName: 'div',
    items: null,
    allowMultipleSelections: true,
    allowSelectionOfNonLeafNodes: false,

    template: Ember.Handlebars.compile('{{#each view.items}}{{#if name}}{{view EurekaJ.NodeView itemBinding="this" allowSelectionOfNonLeafNodesBinding="view.allowSelectionOfNonLeafNodes"}}{{/if}}{{/each}}')
});

EurekaJ.NodeView = Ember.View.extend({
    item: null,

    template: Ember.Handlebars.compile('' +
        '{{view EurekaJ.NodeContentView itemBinding="view.item" allowSelectionOfNonLeafNodesBinding="view.allowSelectionOfNonLeafNodes"}}' +

        '{{#if view.item.isExpanded}}' +
            '<div style="width: 500px;">' +
            '{{#each view.item.children}}' +
                '<div style="margin-left: 22px;">{{view EurekaJ.NodeView itemBinding="this" allowSelectionOfNonLeafNodesBinding="view.allowSelectionOfNonLeafNodes"}}</div>' +
            '{{/each}}' +
            '</div>' +
        '{{/if}}'),
    tagName: 'div',

    isSelectedObserver: function() {
        console.log('isSelectedObserver: ' + this.get('controller'));
        this.get('controller').updateSelectedNodes();
    }.observes('content.children.@each.isSelected')
});

EurekaJ.NodeContentView = Ember.View.extend({
    template: Ember.Handlebars.compile('' +
        '{{#if view.item.allowSelectionOfNonLeafNodes}}' +
            '{{#unless view.item.hasChildren}}<span style="margin-left: 12px;">&nbsp;</span>{{/unless}}' +
            '{{view Ember.Checkbox checkedBinding="view.item.isSelected"}}' +
        '{{else}}' +
            '{{#unless view.item.hasChildren}} ' +
                '<span style="margin-right: 7px;">&nbsp;</span>' +
                '{{view Ember.Checkbox checkedBinding="view.item.isSelected"}}' +
            '{{/unless}}' +
        '{{/if}}' +

        '{{view EurekaJ.NodeArrowView itemBinding="view.item"}}' +
        '{{view EurekaJ.NodeTextView itemBinding="view.item" classNames="treeMenuText"}}'),
    tagName: 'span',
    classNames: ['pointer']
});

EurekaJ.NodeTextView = Ember.View.extend({
    template: Ember.Handlebars.compile('{{view.item.name}}'),
    tagName: 'span',

    click: function(evt) {
        if(this.get('item.hasChildren')) {
            this.get('item').set('isExpanded', !this.get('item.isExpanded'));
        } else {
            this.get('item').set('isSelected', !this.get('item.isSelected'));
        }
    }
});

EurekaJ.NodeArrowView = Ember.View.extend({
    template: Ember.Handlebars.compile('' +
        '{{#if view.item.hasChildren}}' +
            '{{#if view.item.isExpanded}}' +
                '<span class="downarrow"></span>' +
            '{{else}}' +
                '<span class="rightarrow"></span>' +
            '{{/if}}' +
        '{{/if}}'),

    tagName: 'span',

    click: function(evt) {
        this.get('item').set('isExpanded', !this.get('item').get('isExpanded'));
    }
});
/** //Tree views **/

EurekaJ.ChartView = Ember.View.extend({
    templateName: 'chart',
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
    }.observes('chart.chartValue'),

    numChartsObserver: function() {
        this.rerender();
    }.observes('controller.content.length'),

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

EurekaJ.initialize();