Montric.UserController = Ember.Controller.extend({
    init: function() {
        var controller = this;

        var cookie = this.readCookie("uuidToken");
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
                            controller.createCookie("uuidToken", res.uuidToken, 1);
                        }

                        if (res.registered === true) {
                            //login user
                            console.log('user authenticated. Setting UUID Token');
                            controller.set('uuidToken', res.uuidToken);
                            controller.set('isLoggingIn', false);
                        } else {
                            console.log('onLogin success. Not Registered');
                            controller.set('newUuidToken', res.uuidToken);
                            //controller.transitionToRoute('login.register');
                        }
                    },
                    error: function(xhr, status, err) { console.log("error: " + status + " error: " + err); }
                });
            },

            onlogout: function() {
                console.log('Logout not yet implemented on server. Deleting cookie on client');
                controller.set('content', null);
                controller.eraseCookie("uuidToken");

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
        }

    }.observes('uuidToken').on('init'),

    isLoggedIn: function() {
        return this.get('content.id') != undefined && this.get('content.id') != null;
    }.property('content.id'),

    userRoleObserver: function() {
        if (this.get('content.isUnregistered')) {
            console.log('user is not registered in Montric. Transitioning to Registration');
            this.transitionToRoute('login.register');
        } else if (this.get('content.isUser')) {
            console.log('user is logged in and is a user. Transitioning to charts');
            //this.transitionToRoute('main.charts');
            this.transitionToRoute('alerts');
        }
    }.observes('content.userRole'),

    createCookie: function(name, value, days) {
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