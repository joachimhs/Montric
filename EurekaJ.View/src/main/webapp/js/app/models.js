/*EurekaJ.ChartModel = DS.Model.extend({
    series: DS.hasMany('EurekaJ.ChartSeriesModel'),
    mainMenu: DS.belongsTo('EurekaJ.MainMenuModel')
});

EurekaJ.ChartSeriesModel = DS.Model.extend({
    name: DS.attr('string'),
    seriesValues: DS.hasMany('EurekaJ.ChartSeriesValueModel'),
    chart: DS.belongsTo('EurekaJ.ChartModel')
});

EurekaJ.ChartSeriesValueModel = DS.Model.extend({
    x: DS.attr('number'),
    y: DS.attr('number')
});*/

EurekaJ.ChartModel = DS.Model.extend({
    chartValue: DS.attr('string')
});

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

EurekaJ.AdminMenuModel.reopenClass({
    url: 'mainMenu.json'
});

EurekaJ.TabModel = Ember.Object.extend({
    tabId: null,
    tabName: null,
    tabState: null,
    tabView: null,
    tabClickedAction: null,

    hasView: function() {
        return this.get('tabView') != null;
    }.property('tabView').cacheable(),
});

EurekaJ.AlertModel = DS.Model.extend({
    alertActivated: DS.attr('boolean'),
    //alertSource: DS.belongsTo('EurekaJ.AdminMenuModel'),
    alertSource: DS.attr('string'),
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
    chartGroupPath: DS.attr('string'),
    chartGroups: function() {
        var groups = [];
        var returnGroups = [];

        if (this.get('chartGroupPath') && this.get('chartGroupPath').length >= 2) {
            groups = jQuery.parseJSON(this.get('chartGroupPath'));
        }

        console.log(groups);
        groups.forEach(function(group) {
            returnGroups.pushObject(Ember.Object.create({id: group}))
        });

        return returnGroups;
    }.property('chartGroupPath').cacheable()
});

EurekaJ.ChartGroupModel.reopenClass({
    url: 'chartGroup'
});

EurekaJ.EmailGroupModel = DS.Model.extend({
    emailGroupName: DS.attr('string'),
    smtpHost: DS.attr('string'),
    smtpUsername: DS.attr('string'),
    smtpPassword: DS.attr('string'),
    smtpPort: DS.attr('number'),
    smtpUseSSL: DS.attr('boolean'),
    emailAddresses: DS.attr('string'),

    emailRecipients: function(key, value) {
        var addresses = [];
        var returnAddresses = [];

        if (this.get('emailAddresses').length >= 2) {
            addresses = jQuery.parseJSON(this.get('emailAddresses'));
        }

        addresses.forEach(function(address) {
            returnAddresses.pushObject(Ember.Object.create({id: address}));
        });

        return returnAddresses;
    }.property('emailAddresses').cacheable()
});

EurekaJ.EmailGroupModel.reopenClass({
    url: 'email'
});

/*EurekaJ.EmailRecipientModel = DS.Model.extend({
    emailAddress: DS.attr('string')
});*/