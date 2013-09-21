Montric.AdministrationAccessTokensController = Ember.ArrayController.extend({
    needs: ['administrationMenu'],

    newAccessTokenName: null,
    selectedItem: null,

    newAccessTokenIsValid: function () {
        var newNameIsValid = (this.get('newAccessTokenName') && this.get('newAccessTokenName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (accessToken) {
            if (accessToken.get('accessTokenName') === this.get('newAccessTokenName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewAccessToken: function () {
        console.log(Ember.typeOf(this.get('content')) === 'array');

        if (this.newAccessTokenIsValid()) {
            var createdAccessToken = Montric.AccessToken.create({
                id: Math.uuid(16, 16),
                accessTokenName: this.get('newAccessTokenName')
            });

            var newAccessToken = Montric.AccessToken.createRecord(createdAccessToken);
            this.set('newAccessToken', newAccessToken);
        } else {
            Montric.log('New Access Token Name Not Valid!');
        }

        console.log(this.get('content.length'));
    }
});