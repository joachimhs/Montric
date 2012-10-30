/** tree views **/
EurekaJ.TreeView = Ember.View.extend({
    tagName: 'div',
    content: null,
    allowMultipleSelections: true,
    allowSelectionOfNonLeafNodes: false,

    template: Ember.Handlebars.compile('{{#each content}}{{#if name}}{{view EurekaJ.NodeView contentBinding="this" allowSelectionOfNonLeafNodesBinding="view.allowSelectionOfNonLeafNodes"}}{{/if}}{{/each}}'),

    isSelectedObserver: function() {
        console.log('isSelectedObserver');
    }.observes('content.@each.children.@each.isSelected')
});

EurekaJ.NodeView = Ember.View.extend({
    template: Ember.Handlebars.compile('' +
        '{{view EurekaJ.NodeContentView contentBinding="node" allowSelectionOfNonLeafNodesBinding="view.allowSelectionOfNonLeafNodes"}}' +

        '{{#if this.isExpanded}}' +
            '<div style="width: 500px;">' +
            '{{#each this.children}}' +
                '<div style="margin-left: 22px;">{{view EurekaJ.NodeView contentBinding="this" allowSelectionOfNonLeafNodesBinding="view.allowSelectionOfNonLeafNodes"}}</div>' +
            '{{/each}}' +
            '</div>' +
        '{{/if}}'),
    tagName: 'div'
});

EurekaJ.NodeContentView = Ember.View.extend({
    template: Ember.Handlebars.compile('' +
        '{{#if view.allowSelectionOfNonLeafNodes}}' +
            '{{#unless hasChildren}}<span style="margin-left: 12px;">&nbsp;</span>{{/unless}}' +
            '{{view Ember.Checkbox checkedBinding="isSelected"}}' +
        '{{else}}' +
            '{{#unless hasChildren}} ' +
                '<span style="margin-right: 7px;">&nbsp;</span>' +
                '{{view Ember.Checkbox checkedBinding="isSelected"}}' +
            '{{/unless}}' +
        '{{/if}}' +

        '{{view EurekaJ.NodeArrowView contentBinding="this"}}' +
        '{{view EurekaJ.NodeTextView contentBinding="this" classNames="treeMenuText"}}'),
    tagName: 'span',
    classNames: ['pointer']
});

EurekaJ.NodeTextView = Ember.View.extend({
    template: Ember.Handlebars.compile('{{name}}'),
    tagName: 'span',

    click: function(evt) {
        if(this.get('content.hasChildren')) {
            this.get('content').set('isExpanded', !this.get('content').get('isExpanded'));
        } else {
            this.get('content').set('isSelected', !this.get('content').get('isSelected'));
        }
    }
});

EurekaJ.NodeArrowView = Ember.View.extend({
    template: Ember.Handlebars.compile('' +
        '{{#if hasChildren}}' +
            '{{#if isExpanded}}' +
                '<span class="downarrow"></span>' +
            '{{else}}' +
                '<span class="rightarrow"></span>' +
            '{{/if}}' +
        '{{/if}}'),

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
        EurekaJ.log(this.get('controller').get('selectedTab').get('tabId'));
        this.rerender();
    }.observes('controller.selectedTab'),

    template: Ember.Handlebars.compile('<ul class="tabrow">{{#each tab in content}}{{view EurekaJ.TabItemView tabBinding="tab" targetBinding="tab.target" actionBinding="tab.action"}}{{/each}}</ul>{{#if controller.selectedTab.hasView}}{{view controller.selectedTab.tabView}}{{/if}}')
});

EurekaJ.TabItemView = Ember.View.extend(Ember.TargetActionSupport, {
    content: null,
    tagName: 'li',

    classNameBindings: "isSelected",

    isSelected: function() {
        return this.get('controller').get('selectedTab').get('tabId') == this.get('tab').get('tabId');
    }.property('controller.selectedTab'),

    click: function() {
        this.triggerAction();

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
    tagName: 'div',
    classNames: ['selectableList'],
    maxCharacters: 28,
    selectedItem: null,
    listItems: null,

    template: Ember.Handlebars.compile('{{#each view.listItems}}{{view EurekaJ.SelectableListItemView itemBinding="this" deleteActionBinding="view.deleteAction" maxCharactersBinding="view.maxCharacters" selectedItemBinding="view.selectedItem"}}{{/each}}')
});

EurekaJ.SelectableListItemView = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'div',
    classNameBindings: 'isSelected',
    deleteAction: null,
    selectedItem: null,

    liShortLabel: function() {
        var numCharacters = this.get('maxCharacters') - 10;

        if (this.get('item.id.length') > numCharacters) {
            return this.get('item.id').substr(0, numCharacters) + '...';
        }

        return this.get('item.id');
    }.property('item.id'),

    liLongLabel: function() {
        var numCharacters = this.get('maxCharacters');
        if (this.get('item') != null && this.get('item.id.length') > numCharacters) return this.get('item.id').substr(0, numCharacters) + '...';

        return this.get('item.id');
    }.property('item.id'),

    isSelected: function() {
        return this.get('selectedItem.id') === this.get('item').get('id');
    }.property('selectedItem').cacheable(),

    click: function() {
        this.set('selectedItem', this.get('item'));
    },

    template: Ember.Handlebars.compile('' +
        '{{#if view.isSelected}}' +
            '{{view.liShortLabel}}' +
            '{{#if view.deleteAction}}' +
                '{{#view EurekaJ.BootstrapButton actionBinding="view.deleteAction" target="EurekaJ.router" classNames="btn btn-danger btn-mini floatRight"}}Delete{{/view}}' +
            '{{/if}}' +
        '{{else}}' +
            '{{view.liLongLabel}}' +
        '{{/if}}')
});
/** //SelectableListView **/

/** SelectableLeafTree **/
EurekaJ.SelectableLeafTreeView = Ember.View.extend({
    tagName: 'div',
    controller: null,
    classNames: ['selectableList'],
    selectedItem: null,

    template: Ember.Handlebars.compile('{{#each arrangedContent}}{{view EurekaJ.SelectableLeafItemView itemBinding="this" selectedItemBinding="view.selectedItem"}}{{/each}}')
});

EurekaJ.SelectableLeafItemView = Ember.View.extend({
    tagName: 'div',
    classNameBindings: 'isSelected',
    classNames: ['treeItemMarginLeft', 'pointer'],
    selectedItem: null,

    isSelected: function() {
        if (this.get('item.id')) {
            return this.get('selectedItem') === this.get('item.id');
        } else {
            return this.get('selectedItem') === this.get('item');
        }
    }.property('selectedItem').cacheable(),

    template: Ember.Handlebars.compile('' +
        '{{view EurekaJ.SelectableLeafItemContentView itemBinding="this" selectedItemBinding="view.selectedItem"}}' +
        '{{#if isExpanded}}' +
            '{{#each children}}' +
              '{{view EurekaJ.SelectableLeafItemView itemBinding="this" selectedItemBinding="view.selectedItem"}}' +
            '{{/each}}' +
        '{{/if}}'
    )
});

EurekaJ.SelectableLeafItemContentView = Ember.View.extend({
    tagName: 'div',
    classNames: ['fullWidth'],
    selectedItem: null,

    template: Ember.Handlebars.compile('' +
        '{{#if hasChildren}}' +
            '{{#if isExpanded}}' +
                '<span class="downarrow"></span>' +
            '{{else}}' +
                '<span class="rightarrow"></span>' +
            '{{/if}}' +
        '{{/if}}' +
        '{{name}}'
    ),

    click: function() {
        if (this.get('item.children.length') && this.get('item.children.length') > 0) {
            //item has children
            this.get('item').set('isExpanded', !this.get('item.isExpanded'));
        } else {
            //leaf node
            console.log(this.get('selectedItem'));
            console.log(this.get('item'));
            if (this.get('item.id')) {
                this.set('selectedItem', this.get('item.id'));
            } else {
                this.set('selectedItem', this.get('item'));
            }
        }
    }
});

/** //SelectableLeafTree **/

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

        console.log('data');
        console.log(data);

        if (chart) {
            d3.select('#' + elementId + ' svg')
                .datum(data)
                .call(chart);
        }
    }.observes('content.chart.chartValue'),

    numChartsObserver: function() {
        this.rerender();
    }.observes('EurekaJ.router.mainController.content.length'),

    didInsertElement : function() {
        console.log('ChartView didInsertElement');
        if (this.get('content').get('chart') != null) {
            console.log(this.get('content.chart.chartValue'));
            var thisView = this;
            var numCharts = EurekaJ.router.get('mainController').get('content').get('length');
            var height = (this.$().height() / numCharts) - (numCharts * 6);
            var width = this.$().width();

            var elementId = this.get('elementId');
            var data = jQuery.parseJSON(this.get('content').get('chart').get('chartValue'));

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

EurekaJ.Select = Ember.Select.extend({
    //JHS: The following overrides the Ember.Select code. Fixes a bug in 1.0-pre
    //where the selection would always be the first item in the list when the
    //view is first rendered. This will be fixed in 1.0-final
    _triggerChange: function() {
        var selection = this.get('selection');
        var value = this.get('value');

        if (selection) { this.selectionDidChange(); }
        if (value) { this.valueDidChange(); }

        this._change();
    }
});

EurekaJ.ConfirmDialogView = Ember.View.extend({
    templateName: 'confirmDialog',
    classNames: ['modal', 'hide']
})