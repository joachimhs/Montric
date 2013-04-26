Montric.AdminMenuModel = DS.Model.extend({
    name: DS.attr('string'),
    nodeType: DS.attr('string'),
    parent: DS.belongsTo('Montric.AdminMenuModel'),
    children: DS.hasMany('Montric.AdminMenuModel'),
    chart: DS.belongsTo('Montric.ChartModel'),

    isSelected: false,
    isExpanded: false,

    hasChildren: function() {
        return this.get('children').get('length') > 0;
    }.property('children.length'),

    isLeaf: function() {
        return this.get('children').get('length') == 0;
    }.property('children.length')
});