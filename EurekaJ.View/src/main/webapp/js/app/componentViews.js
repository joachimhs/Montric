/** tree views **/
EurekaJ.TreeView = Ember.View.extend({
    tagName: 'div',
    content: null,
    allowMultipleSelections: true,

    template: Ember.Handlebars.compile('{{#each content}}{{view EurekaJ.NodeView contentBinding="this"}}{{/each}}'),

    isSelectedObserver: function() {
        console.log('isSelectedObserver');
    }.observes('content.@each.children.@each.isSelected')
});

EurekaJ.NodeView = Ember.View.extend({
    templateName: 'tree-node',
    tagName: 'div'
});

EurekaJ.NodeContentView = Ember.View.extend({
    templateName: 'tree-node-content',
    tagName: 'span',
    classNames: ['pointer']
});

EurekaJ.NodeTextView = Ember.View.extend({
    templateName: 'tree-node-text',
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
        EurekaJ.log(this.get('controller').get('selectedTab').get('tabId'));
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
    maxCharacters: 28,

    template: Ember.Handlebars.compile('{{#each arrangedContent}}{{view EurekaJ.SelectableListItem itemBinding="this" deleteActionBinding="view.deleteAction" maxCharactersBinding="maxCharacters"}}{{/each}}')
});

EurekaJ.SelectableListItem = Ember.View.extend(Ember.TargetActionSupport, {
    tagName: 'li',
    classNameBindings: 'isSelected',
    deleteAction: null,

    liShortLabel: function() {
        var numCharacters = this.get('maxCharacters') - 12;
        if (this.get('item.id') && this.get('item').get('id').length > numCharacters) return this.get('item.id').substr(0, numCharacters) + '...';

        return this.get('item.id');
    }.property('item.id'),

    liLongLabel: function() {
        var numCharacters = this.get('maxCharacters');
        if (this.get('item') != null && this.get('item.id').length > numCharacters) return this.get('item.id').substr(0, numCharacters) + '...';

        return this.get('item.id');
    }.property('item.id'),

    isSelected: function() {
        return this.get('controller.selectedItem.id') == this.get('item').get('id');
    }.property('controller.selectedItem').cacheable(),

    click: function() {
        this.get('controller').set('selectedItem', this.get('item'));
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
    tagName: 'ul',
    controller: null,
    classNames: ['selectableList'],

    template: Ember.Handlebars.compile('{{#each arrangedContent}}{{view EurekaJ.SelectableLeafItemView itemBinding="this" selectedItemBinding="view.selectedItem"}}{{/each}}')
});

EurekaJ.SelectableLeafItemView = Ember.View.extend({
    tagName: 'li',
    classNameBindings: 'isSelected',
    classNames: ['treeItemMarginLeft'],

    isSelected: function() {
        return this.get('selectedItem.id') == this.get('item').get('id');
    }.property('selectedItem').cacheable(),

    template: Ember.Handlebars.compile('' +
        '{{view EurekaJ.SelectableLeafItemContentView itemBinding="this" selectedItemBinding="view.selectedItem"}}' +
        '{{#if this.isExpanded}}' +
            '{{#each this.children}}' +
              '{{view EurekaJ.SelectableLeafItemView itemBinding="this" selectedNodeBinding="selectedNode" selectedItemBinding="view.selectedItem"}}' +
            '{{/each}}' +
        '{{/if}}'
    )
});

EurekaJ.SelectableLeafItemContentView = Ember.View.extend({
    tagName: 'div',
    classNames: ['fullWidth'],

    template: Ember.Handlebars.compile('{{view Ember.View templateName="tree-node-arrow"}}{{name}}'),

    click: function() {
        if (this.get('item.children.length') && this.get('item.children.length') > 0) {
            //item has children
            this.get('item').set('isExpanded', !this.get('item.isExpanded'));
        } else {
            //leaf node
            this.set('selectedItem', this.get('item'));
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