Montric.Alert = DS.Model.extend({
    alertActivated: DS.attr('boolean'),
    //alertSource: DS.belongsTo('Montric.AdminMenuModel'),
    alertSource: DS.attr('string'),
    //alertNotifications: DS.hasMany('Montric.EmailGroupModel'),
    alertNotifications: DS.attr('raw'),
    //alertPlugins: SC.Record.toMany('EurekaJView.AlertPluginModel', {isMaster: YES}),
    alertWarningValue: DS.attr('number'),
    alertErrorValue: DS.attr('number'),
    alertType: DS.attr('string'),
    alertDelay: DS.attr('number')
});