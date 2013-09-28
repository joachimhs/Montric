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
    }.property('nodeType')
});