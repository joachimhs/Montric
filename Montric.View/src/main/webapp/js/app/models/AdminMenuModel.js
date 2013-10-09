Montric.AdminMenu = DS.Model.extend({
    name: DS.attr('string'),
    nodeType: DS.attr('string'),
    parent: DS.belongsTo('adminMenu'),
    children: DS.hasMany('adminMenu'),

    isSelected: false,
    isExpanded: false,

    hasChildren: function() {
        return this.get('children').get('length') > 0;
    }.property('children').cacheable(),

    isLeaf: function() {
        return this.get('children').get('length') == 0;
    }.property('children').cacheable(),

    isAlert: function() {
        return this.get('nodeType') === 'alert';
    }.property('nodeType'),

    isExpandedObserver: function() {
        console.log('isExpanded: ' + this.get('id'));
        if (this.get('isExpanded')) {
            var children = this.get('children.content');
            if (children) {
                console.log('Sorting children');
                children.sort(Montric.AdminMenu.compareNodes);
            }
        }
    }.observes('isExpanded')
});

Montric.AdminMenu.reopenClass({
    compareNodes: function(nodeOne, nodeTwo) {
        if (nodeOne.get('id') > nodeTwo.get('id'))
            return 1;
        if (nodeOne.get('id') < nodeTwo.get('id'))
            return -1;
        return 0;
    }
});