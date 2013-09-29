Montric.AccessTokensController = Ember.ArrayController.extend({
    newAccessTokenName: null,

    actions: {
        createNewAccessToken: function () {
            if (this.newAccessTokenIsValid()) {
                var newAccessToken = this.store.createRecord('accessToken', {
                    id: Math.uuid(16, 16),
                    accessTokenName: this.get('newAccessTokenName')
                });

                newAccessToken.save();

                this.set('newAccessTokenName', '');
            } else {
                Montric.log('New Access Token Name Not Valid!');
            }

            console.log(this.get('content.length'));
        }
    },


    newAccessTokenIsValid: function () {
        var newNameIsValid = (this.get('newAccessTokenName') && this.get('newAccessTokenName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (accessToken) {
            if (accessToken.get('accessTokenName') === this.get('newAccessTokenName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    }
});