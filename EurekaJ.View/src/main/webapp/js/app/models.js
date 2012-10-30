EurekaJ.MainMenuModel = DS.Model.extend({
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

    isLeaf: function() {
        return this.get('children').get('length') == 0;
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
    name: DS.attr('string'),
    nodeType: DS.attr('string'),
    parentPath: DS.belongsTo('EurekaJ.AdminMenuModel'),
    isSelected: false,
    isExpanded: false,
    children: DS.hasMany('EurekaJ.AdminMenuModel'),



    hasChildren: function() {
        return this.get('children').get('length') > 0;
    }.property('children').cacheable(),

    selectedObserver: function() {
        if (this.get('isSelected') === true) {
            EurekaJ.router.get('adminMenuController').selectNode(this);
        } else {
            EurekaJ.router.get('adminMenuController').deselectNode(this);
        }
    }.observes('isSelected')
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
    tabClickedAction: null,

    hasView: function() {
        return this.get('tabView') != null;
    }.property('tabView').cacheable()
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