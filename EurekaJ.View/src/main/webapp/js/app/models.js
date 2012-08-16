EurekaJ.MainMenuModel = DS.Model.extend({
    path: DS.attr('string'),
    name: DS.attr('string'),
    nodeType: DS.attr('string'),
    parentPath: DS.belongsTo('EurekaJ.MainMenuModel'),
    isSelected: false,
    isExpanded: true,
    children: DS.hasMany('EurekaJ.MainMenuModel'),
    chart: DS.belongsTo('EurekaJ.ChartModel'),

    hasChildren: function() {
        return this.get('children').get('length') > 0;
    }.property('children').cacheable(),

    selectedObserver: function() {
        if (this.get('isSelected') === true) {
            EurekaJ.router.get('mainController').selectNode(this);
        } else {
            EurekaJ.router.get('mainController').deselectNode(this);
        }
    }.observes('isSelected')
});

EurekaJ.MainMenuModel.reopenClass({
    url: 'mainMenu.json'
});

EurekaJ.ChartModel = DS.Model.extend({
    value: DS.attr('string')
});

EurekaJ.ChartModel.reopenClass({
    url: 'cumulativeLineData.json'
})