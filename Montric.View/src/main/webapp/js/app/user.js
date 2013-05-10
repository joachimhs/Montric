Montric.UserController = Ember.ObjectController.extend({
    needs: ['application', 'account'],

    init: function() {
        this._super();
        this.set('content', Ember.Object.create());
        console.log('UserController init');
        var controller = this;
        var cookieUser = Montric.get('cookieUser');
        if (cookieUser == null) {
            console.log('not logged in via Cookie, watching for Mozilla Persona');
            navigator.id.watch({
                loggedInUser: null,
                onlogin: function(assertion) {
                    Montric.set('isLoggingIn', true);
                    $.ajax({
                        type: 'POST',
                        url: '/user/auth/login',
                        data: {assertion: assertion},
                        success: function(res, status, xhr) {
                            console.log(res);
                            if (res.uuidToken) {
                                console.log('setting uuidToken: ' + res.uuidToken);
                                controller.createCookie("uuidToken", res.uuidToken, 1);
                            }

                            if (res.registered === true) {
                                //login user
                                console.log('user authenticated. Fetching user: ' + res.uuidToken);
                                controller.set('content', Montric.User.find(res.uuidToken));
                            } else {
                                console.log('onLogin success. Not Registered');
                                controller.set('newUuidToken', res.uuidToken);
                                controller.transitionToRoute('login.register');
                            }
                        },
                        error: function(xhr, status, err) { console.log("error: " + status + " error: " + err); }
                    });
                },

                onlogout: function() {
                    $.ajax({
                        type: 'POST',
                        url: '/user/auth/logout',
                        success: function(xhr, status, err) {
                            console.log('onlogout: ');
                            console.log(xhr);
                            //controller.set('content.id', null);
                            //controller.set('content.authLevel', null);
                            //controller.eraseCookie("uuidToken");
                        },
                        error: function(xhr, status, err) { console.log("error: " + status + " error: " + err); }
                    });
                }
            });
        } else {
            console.log('logged in via Cookie!');
            console.log(Montric.get('cookieUser'));
            console.log(Montric.get('cookieUser').get('userRole'));
            this.set('content', Montric.get('cookieUser'));
        }
    },

    updateUser: function() {
        this.set('content', Montric.User.find('currentUser'));
    },

    userObserver: function() {
        var userRegistered = Montric.get('userRegistered');
        var userRole = this.get('userRole');

        if (Montric.get('isLoggingIn') && this.get('isUser')) {
            Montric.set('isLoggingIn', false);
            this.transitionToRoute('main.charts');
        }

        if (this.get('isUser')) {
            this.set('controllers.account.content', Montric.Account.find(this.get('accountName')));
        }
    }.observes('content.userRole', 'Montric.userRegistered'),

    createCookie:function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    },

    readCookie:function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    eraseCookie:function (name) {
        this.createCookie(name, "", -1);
    }
});

Montric.LoginRegisterRoute = Ember.Route.extend({
    model: function() {
        return Ember.Object.create();
    }
});

Montric.LoginRegisterController = Ember.ObjectController.extend({
    needs: ['user'],

    accountNameValidationError: null,
    firstNameValidationError: null,
    lastNameValidationError: null,
    countryValidationError: null,
    companyValidationError: null,
    usageValidationError: null,

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
                        Montric.set('userRegistered', true);
                        controller.get('controllers.user').updateUser();
                    } else {
                        alert('Unable to Register');
                    }

                },
                error: function(xhr, status, err) { console.log("error: " + status + " error: " + err); }
            });
        }
    },

    validateFieldContent: function(fieldContent, fieldLength) {
        return (fieldContent != null && fieldContent.length >= fieldLength);
    }

});

Ember.TEMPLATES['login/register'] = Ember.Handlebars.compile('' +
    '<div class="registerBox well">' +
        '{{#if controllers.user.newUuidToken}}' +
            '<h1>Register a new Account!</h1>' +
            '<p>You have successfully logged in via Mozilla persona, but you email address is currently not associated with a Montric account.</p>' +
            '<p>In order to set up an account for you, we need some additional information!</p>' +
            '<form class="form-horizontal">' +
                '<div class="control-group">' +
                    '<label class="control-label">Account Name</label>' +
                    '<div class="controls">' +
                        '{{view Ember.TextField valueBinding="accountName"}}' +
                        '{{#if accountNameValidationError}}' +
                            '<span class="help-inline">{{accountNameValidationError}}</span>' +
                        '{{/if}}' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="inputFirstName">First Name</label>' +
                    '<div class="controls">' +
                        '{{view Ember.TextField valueBinding="firstName"}}' +
                        '{{#if firstNameValidationError}}' +
                            '<span class="help-inline">{{firstNameValidationError}}</span>' +
                        '{{/if}}' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="inputLastName">Last Name</label>' +
                    '<div class="controls">' +
                        '{{view Ember.TextField valueBinding="lastName"}}' +
                        '{{#if lastNameValidationError}}' +
                            '<span class="help-inline">{{lastNameValidationError}}</span>' +
                        '{{/if}}' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="inputCompany">Company</label>' +
                    '<div class="controls">' +
                        '{{view Ember.TextField valueBinding="company"}}' +
                        '{{#if companyValidationError}}' +
                            '<span class="help-inline">{{companyValidationError}}</span>' +
                        '{{/if}}' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="inputCountry">Country</label>' +
                    '<div class="controls">' +
                        '{{view Ember.TextField valueBinding="country"}}' +
                        '{{#if countryValidationError}}' +
                            '<span class="help-inline">{{countryValidationError}}</span>' +
                        '{{/if}}' +
                    '</div>' +
                '</div>' +
                '<div class="control-group">' +
                    '<label class="control-label" for="inputUsage">What will you use Montric for?</label>' +
                    '<div class="controls">' +
                        '{{view Ember.TextArea valueBinding="usage" rows="7"}}' +
                        '{{#if usageValidationError}}' +
                            '<span class="help-inline">{{usageValidationError}}</span>' +
                        '{{/if}}' +
                    '</div>' +
                '</div>' +
                '<div class="form-actions" style="background: none;">' +
                    '<button type="submit" class="btn btn-primary" {{action "registerNewAccount"}}>Register New Account</button>' +
                '</div>' +
            '{{else}}' +
                '<h1>Waiting for Mozilla Persona...</h1>' +
            '{{/if}}' +
        '</form>' +
    '</div>'
);
