/** tree views **/
EurekaJ.TreeView = Ember.View.extend({
	items : null,
	allowSelectionOfNonLeafNodes: false,
	allowMultipleSelections: true,
	controller : Ember.Controller.create(),

	init : function() {
		this._super();
		this.set('controller._allowSelectionOfNonLeafNodes', this.get('allowSelectionOfNonLeafNodes'))
		this.set('controller._allowMultipleSelections', this.get('allowMultipleSelections'))
	},

	nonLeafSelectionObserver : function() {
		this.set('controller._allowSelectionOfNonLeafNodes', this.get('allowSelectionOfNonLeafNodes'))
	}.observes('allowSelectionOfNonLeafNodes'),

	multipleSelectionObserver : function() {
		this.set('controller._allowMultipleSelections', this.get('allowMultipleSelections'))
	}.observes('allowMultipleSelections'),

	template : Ember.Handlebars.compile('' +
		'{{#each view.items}}{{#if name}}' +
			'{{view EurekaJ.NodeView itemBinding="this"}}' + 
		'{{/if}}{{/each}}')
});

EurekaJ.NodeView = Ember.View.extend({
    item: null,
    
    template: Ember.Handlebars.compile('' +
        '{{view EurekaJ.NodeContentView itemBinding="view.item"}}' +

        '{{#if view.item.isExpanded}}' +
            '<div style="width: 500px;">' +
            '{{#each view.item.children}}' +
                '<div style="margin-left: 22px;">{{view EurekaJ.NodeView itemBinding="this"}}</div>' +
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
        '{{#if controller._allowSelectionOfNonLeafNodes}}' +
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

/** Tab views **/
EurekaJ.TabView = Ember.View.extend({
    selectedTabObserver : function() {
        this.rerender();
    }.observes('controller.selectedTab'),

    template : Ember.Handlebars.compile('' + 
        '<ul class="tabrow">{{#each tab in content}}' + 
            '{{view EurekaJ.TabItemView ' + 
                'tabBinding="tab" ' + 
                'targetBinding="tab.target" ' + 
                'actionBinding="tab.action"' + 
            '}}' + 
        '{{/each}}</ul>' +

        '{{#if controller.selectedTab.hasView}}' + 
            '{{view controller.selectedTab.tabView}}' + 
        '{{/if}}'
    )
});

EurekaJ.TabItemView = Ember.View.extend(Ember.TargetActionSupport, {
    tagName : 'li',

    classNameBindings : "isSelected",

    isSelected : function() {
        return this.get('controller').get('selectedTab').get('tabId') == this.get('tab').get('tabId');
    }.property('controller.selectedTab'),

    click : function() {
        this.triggerAction();

        this.get('controller').set('selectedTab', this.get('tab'));
    },

    template : Ember.Handlebars.compile('<div class="featureTabTop"></div>{{tab.tabName}}')

});
//** //Tab View **/

/** SelectableListView **/
EurekaJ.SelectableListView = Ember.View.extend({
    tagName: 'div',
    classNames: ['selectableList'],
    maxCharacters: 28,
    selectedItem: null,
    listItems: null,
    labelPropertyName: null,
    

    template: Ember.Handlebars.compile('' +
        '{{#each view.listItems}}' +
            '{{view EurekaJ.SelectableListItemView ' +
                'itemBinding="this" ' +
                'deleteActionBinding="view.deleteAction" ' +
                'maxCharactersBinding="view.maxCharacters" ' +
                'selectedItemBinding="view.selectedItem"' +
                'labelPropertyNameBinding="view.labelPropertyName"' +
            '}}' +
        '{{/each}}')
});

EurekaJ.SelectableListItemView = Ember.View.extend({
    tagName: 'div',
    classNameBindings: 'isSelected',
    deleteAction: null,
    selectedItem: null,
    labelPropertyName: null,

    liShortLabel: function() {
        var numCharacters = this.get('maxCharacters') - 10;

        if (this.get('item.id.length') > numCharacters) {
            return this.get('item.id').substr(0, numCharacters) + '...';
        }

        return this.get('item.id');
    }.property('item.id'),

    liLongLabel: function() {
        var numCharacters = this.get('maxCharacters');
        if (this.get('item') != null && this.get('item.id.length') > numCharacters)
            return this.get('item.id').substr(0, numCharacters) + '...';

        return this.get('item.id');
    }.property('item.id'),

    isSelected: function() {
        return this.get('selectedItem.id') === this.get('item').get('id');
    }.property('selectedItem'),

    click: function() {
        this.set('selectedItem', this.get('item'));
    },

    template: Ember.Handlebars.compile('' +
        '{{#if view.isSelected}}' +
            '{{view.liShortLabel}}' +
            '{{#if view.deleteAction}}' +
                '{{#view EurekaJ.BootstrapButton ' +
                    'actionBinding="view.deleteAction" ' +
                    'target="controller" ' +
                    'classNames="btn btn-danger btn-mini floatRight"}}' +
                        'Delete' +
                '{{/view}}' +
            '{{/if}}' +
        '{{else}}' +
            '{{view.liLongLabel}}' +
        '{{/if}}'
    )
});
/** //SelectableListView **/

EurekaJ.ConfirmDialogView = Ember.View.extend({
    templateName: 'confirmDialog',
    classNames: ['modal', 'hide']
});

Ember.TEMPLATES['confirmDialog'] = Ember.Handlebars.compile(
    '<div class="modal-header centerAlign">' +
        '<button type="button" class="close" data-dismiss="modal" class="floatRight">x</button>' +
        '<h1 class="centerAlign">{{view.header}}</h1>' +
    '</div>' +
    '<div class="modal-body">' +
        '{{view.message}}' +
    '</div>' +
    '<div class="modal-footer">' +
        '{{#if view.cancelAction}}' +
            '{{view EurekaJ.BootstrapButton contentBinding="view.cancelButtonLabel" actionBinding="view.cancelAction" targetBinding="view.target"}}' +
        '{{/if}}' +
        '{{#if view.okAction}}' +
            '{{view EurekaJ.BootstrapButton contentBinding="view.okButtonLabel" actionBinding="view.okAction" targetBinding="view.target"}}' +
        '{{/if}}' +
    '</div>'
    //'<div class="modal-footer">{{view EurekaJ.BootstrapButton content="Apply Changes" action="applyChartOptionsChanges" target="EurekaJ.router"}}</div>' +
);

/** SelectableLeafTree **/
EurekaJ.SelectableLeafTreeView = Ember.View.extend({
    tagName: 'div',
    classNames: ['selectableList'],
    selectedItem: null,

    template: Ember.Handlebars.compile('{{#each view.items}}{{view EurekaJ.SelectableLeafItemView itemBinding="this" selectedItemBinding="view.selectedItem"}}{{/each}}')
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