EurekaJ.AdminMenuModel = DS.Model.extend({
    name: DS.attr('string'),
    nodeType: DS.attr('string'),
    parent: DS.belongsTo('EurekaJ.AdminMenuModel'),
    children: DS.hasMany('EurekaJ.AdminMenuModel'),
    chart: DS.belongsTo('EurekaJ.ChartModel'),

    isSelected: false,
    isExpanded: false,

    hasChildren: function() {
        return this.get('children').get('length') > 0;
    }.property('children.length'),

    isLeaf: function() {
        return this.get('children').get('length') == 0;
    }.property('children.length')
});