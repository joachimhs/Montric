Montric.Router.map(function () {
    this.resource("main", {path: "/"}, function () {
        this.resource("login", {path: "/login"}, function () {
            this.route('register');
        });
        this.route('charts');
        this.resource("admin", {path: "/admin"}, function() {
            this.resource('alerts', {path: "/alerts"}, function() {
                this.route('alert', {path: "/:alert_id"});
            });
            this.resource('chartGroups', {path: "/chartGroups"}, function() {
                this.route('chartGroup', {path: "/:chart_group_id"});
            });
            this.resource('alertRecipients', {path: "/alert_recipients"}, function() {
                this.route('alertRecipient', {path: "/:alert_recipient_id"});
            });

            this.route('mainMenuAdmin', {path: "/main_menu"});
            this.resource('accessTokens', {path: "access_tokens"}, function() {
                this.route('accessToken', {path: "/:access_token_id"});
            });
            this.route('accounts');

        });
    });
});