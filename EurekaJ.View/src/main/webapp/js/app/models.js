EurekaJ.MainMenuModel = DS.Model.extend({
    path: DS.attr('string'),
    name: DS.attr('string'),
    nodeType: DS.attr('string'),
    parentPath: DS.belongsTo('EurekaJ.MainMenuModel'),
    isSelected: false,
    isExpanded: false,
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

EurekaJ.AdminMenuModel = DS.Model.extend({
    path: DS.attr('string'),
    name: DS.attr('string'),
    nodeType: DS.attr('string'),
    parentPath: DS.belongsTo('EurekaJ.AdminMenuModel'),
    isSelected: false,
    isExpanded: false,
    children: DS.hasMany('EurekaJ.AdminMenuModel'),
    chart: DS.belongsTo('EurekaJ.ChartModel'),

    hasChildren: function() {
        return this.get('children').get('length') > 0;
    }.property('children').cacheable()
});

EurekaJ.AdminMenuModel.reopenClass({
    url: 'mainMenu.json'
});

EurekaJ.ChartModel = DS.Model.extend({
    chartValue: DS.attr('string')
});

EurekaJ.ChartModel.reopenClass({
    url: 'chart.json'
    //url: 'cumulativeLineData.json'
})

EurekaJ.TabModel = Ember.Object.extend({
    tabId: null,
    tabName: null,
    tabState: null,
    tabView: null,

    hasView: function() {
        EurekaJ.log('tabView: ' + this.get('tabId'));
        EurekaJ.log(this.get('tabView'));
        return this.get('tabView') != null;
    }.property('tabView').cacheable()
});

EurekaJ.AlertModel = DS.Model.extend({
    primaryKey: 'alertName',
    alertName: DS.attr('string'),
    alertActivated: DS.attr('boolean'),
    alertSource: DS.belongsTo('EurekaJ.AdminMenuModel'),
    //alertNotifications: SC.Record.toMany('EurekaJView.EmailGroupModel', {isMaster: YES}),
    //alertPlugins: SC.Record.toMany('EurekaJView.AlertPluginModel', {isMaster: YES}),
    alertWarningValue: DS.attr('number'),
    alertErrorValue: DS.attr('number'),
    alertType: DS.attr('string'),
    alertDelay: DS.attr('number')
});

EurekaJ.AlertModel.reopenClass({
    url: 'alert'
});

EurekaJ.ChartGroupModel = DS.Model.extend({
    primaryKey: 'chartGroupName',
    chartGroupName: DS.attr('string'),
    chartGroupPath: DS.hasMany('EurekaJ.AdminMenuModel')
});

EurekaJ.ChartGroupModel.reopenClass({
    url: 'chartGroup'
});