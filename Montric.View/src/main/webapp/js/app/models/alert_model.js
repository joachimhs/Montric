EurekaJ.AlertModel = DS.Model.extend({
    alertActivated: DS.attr('boolean'),
    //alertSource: DS.belongsTo('EurekaJ.AdminMenuModel'),
    alertSource: DS.attr('string'),
    //alertNotifications: DS.hasMany('EurekaJ.EmailGroupModel'),
    alertNotifications: DS.attr('string'),
    //alertPlugins: SC.Record.toMany('EurekaJView.AlertPluginModel', {isMaster: YES}),
    alertWarningValue: DS.attr('number'),
    alertErrorValue: DS.attr('number'),
    alertType: DS.attr('string'),
    alertDelay: DS.attr('number'),
    
    alertNotificationArray: function() {
        var notifications = [];
        var returnNotifications = [];

        if (this.get('alertNotifications') && this.get('alertNotifications').length >= 2) {
            notifications = jQuery.parseJSON(this.get('alertNotifications'));
        }

        console.log(notifications);
        notifications.forEach(function(notification) {
            returnNotifications.pushObject(notification)
        });

        return returnNotifications;
    }.property('alertNotifications')
});