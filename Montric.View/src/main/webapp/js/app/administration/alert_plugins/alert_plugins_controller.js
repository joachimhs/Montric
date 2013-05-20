Montric.AdministrationAlertPluginsController = Ember.ArrayController.extend({
    newAdminPluginName: null,
    selectedItem: null,

    newAlertPluginNameIsValid: function () {
        var newNameIsValid = (this.get('newAdminPluginName') && this.get('newAdminPluginName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (alertPlugin) {
            if (accessToken.get('id') === this.get('newAdminPluginName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewAlertPlugin: function () {
        if (this.newAlertPluginNameIsValid()) {
            var createdAlertPlugin = Montric.AlertPlugin.create({
                id: this.get('newAdminPluginName')
            });


            /*var createdAccessToken = Montric.AccessToken.create({
                id: Math.uuid(16, 16),
                accessTokenName: this.get('newAccessTokenName')
            });

            var newAccessToken = Montric.AccessToken.createRecord(createdAccessToken);
            this.set('newAccessToken', newAccessToken);*/
        } else {
            Montric.log('New Access Token Name Not Valid!');
        }

        console.log(this.get('content.length'));
    }
});
