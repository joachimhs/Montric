Montric.MainMenuModel = DS.Model.extend({
    name: DS.attr('string'),
    nodeType: DS.attr('string'),
    parent: DS.belongsTo('Montric.MainMenuModel'),
    children: DS.hasMany('Montric.MainMenuModel'),
    chart: DS.belongsTo('Montric.ChartModel'),

    isSelected: false,
    isExpanded: false,

    hasChildren: function() {
        return this.get('children').get('length') > 0;
    }.property('children').cacheable(),

    isLeaf: function() {
        return this.get('children').get('length') == 0;
    }.property('children').cacheable()
});