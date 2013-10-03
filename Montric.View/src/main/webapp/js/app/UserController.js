Montric.UserController = Ember.Controller.extend({
    needs: ['application', 'mainCharts'],

    init: function() {
        var controller = this;

        var cookie = Montric.readCookie("uuidToken");
        console.log('COOKIE UUID: ' + cookie);
        if (cookie) {
            this.set('uuidToken', cookie);
        }

        console.log('Calling Mozilla Persona Watch')
        navigator.id.watch({

            onlogin: function(assertion) {
                controller.set('isLoggingIn', true);

                $.ajax({
                    type: 'POST',
                    url: '/user/auth/login',
                    data: {assertion: assertion},

                    success: function(res, status, xhr) {
                        console.log(res);
                        if (res.uuidToken) {
                            console.log('setting uuidToken: ' + res.uuidToken);
                            Montric.createCookie("uuidToken", res.uuidToken, 1);
                        }

                        if (res.registered === true) {
                            //login user
                            console.log('user authenticated. Setting UUID Token');
                            controller.set('uuidToken', res.uuidToken);
                            controller.set('isLoggingIn', false);
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
                //console.log('Logout not yet implemented on server. Deleting cookie on client');
                controller.set('content', null);
                controller.set('uuidToken', null);
                //Montric.eraseCookie("uuidToken");

                /*$.ajax({
                    type: 'POST',
                    url: '/user/auth/logout',
                    success: function(xhr, status, err) {
                        console.log('onlogout: ');
                        console.log(xhr);
                        controller.eraseCookie("uuidToken");
                    },
                    error: function(xhr, status, err) {
                        console.log(xhr);
                        console.log('Error while logging out: ' + err + " status: " + status);
                    }
                });*/
            }
        })
    },

    uuidTokenObserver: function() {
        console.log('Fetching user: ' + this.get('uuidToken'));

        if (this.get('uuidToken')) {
            this.set('content', this.store.find('user', this.get('uuidToken')));
        } else {
            this.set('content', null);
            this.transitionToRoute('login.index');
        }

    }.observes('uuidToken').on('init'),

    isLoggedIn: function() {
        return this.get('content.id') != undefined && this.get('content.id') != null;
    }.property('content.id'),

    userRoleObserver: function() {
        if (this.get('content.isNotAuthenticated')) {
            console.log('user is not authenticated in Montric. Transitioning to Login');
            this.transitionToRoute('login.index');
        }else if (this.get('content.isUnregistered')) {
            console.log('user is not registered in Montric. Transitioning to Registration');
            this.transitionToRoute('login.register');
        } else if (this.get('content.isUser')) {
            console.log('user is logged in and is a user.');


            if (this.get('controllers.application.currentPath') === 'main.login.index' ||
                this.get('controllers.application.currentPath') === 'main.login.register') {

                console.log('resetting mainCharts controller');
                this.set('controllers.mainCharts.content', null);
                this.transitionToRoute('main.charts');
            }
        }
    }.observes('content.userRole')
});