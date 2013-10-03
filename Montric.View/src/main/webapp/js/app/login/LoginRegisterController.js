Montric.LoginRegisterController = Ember.Controller.extend({
    needs: ['user'],

    accountNameValidationError: null,
    firstNameValidationError: null,
    lastNameValidationError: null,
    countryValidationError: null,
    companyValidationError: null,
    usageValidationError: null,

    actions: {
        registerNewAccount: function() {
            var validated = true;
            if (!this.validateFieldContent(this.get('accountName'), 3)) {
                this.set('accountNameValidationError', 'Account Name must contain at least 3 characters!');
                validated = false;
            } else {
                this.set('accountNameValidationError', null);
            }

            if (!this.validateFieldContent(this.get('firstName'), 3)) {
                this.set('firstNameValidationError', 'First Name must contain at least 3 characters!');
                validated = false;
            } else {
                this.set('firstNameValidationError', null);
            }

            if (!this.validateFieldContent(this.get('lastName'), 3)) {
                this.set('lastNameValidationError', 'Last Name must contain at least 3 characters!');
                validated = false;
            } else {
                this.set('lastNameValidationError', null);
            }

            if (!this.validateFieldContent(this.get('country'), 3)) {
                this.set('countryValidationError', 'Country must contain at least 3 characters!');
                validated = false;
            } else {
                this.set('countryValidationError', null);
            }

            if (!this.validateFieldContent(this.get('company'), 2)) {
                this.set('companyValidationError', 'Company must contain at least 2 characters!');
                validated = false;
            } else {
                this.set('companyValidationError', null);
            }

            if (validated) {
                var controller = this;

                $.ajax({
                    type: 'POST',
                    url: '/user/auth/register',
                    data: JSON.stringify({
                        accountName: this.get('accountName'),
                        firstName: this.get('firstName'),
                        lastName: this.get('lastName'),
                        country: this.get('country'),
                        company: this.get('company'),
                        usage: this.get('usage'),
                        authLevel: this.get('authLevel')
                    }),
                    success: function(res, status, xhr) {
                        console.log(res);
                        if (res.uuidToken && res.registered === true) {
                            console.log('user registered: getting user with token: ' + res.uuidToken);
                            controller.set('controllers.user.uuidToken', res.uuidToken);
                        } else {
                            alert('Unable to Register');
                        }

                    },
                    error: function(xhr, status, err) { console.log("error: " + status + " error: " + err); }
                });
            }
        }
    },

    validateFieldContent: function(fieldContent, fieldLength) {
        return (fieldContent != null && fieldContent.length >= fieldLength);
    }

});