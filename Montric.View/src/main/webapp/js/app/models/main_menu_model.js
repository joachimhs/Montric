EurekaJ.MainMenuModel = DS.Model.extend({
    name: DS.attr('string'),
    nodeType: DS.attr('string'),
    parent: DS.belongsTo('EurekaJ.MainMenuModel'),
    children: DS.hasMany('EurekaJ.MainMenuModel'),
    chart: DS.belongsTo('EurekaJ.ChartModel'),

    isSelected: false,
    isExpanded: false,

    hasChildren: function() {
        return this.get('children').get('length') > 0;
    }.property('children').cacheable(),

    isLeaf: function() {
        return this.get('children').get('length') == 0;
    }.property('children').cacheable()
});