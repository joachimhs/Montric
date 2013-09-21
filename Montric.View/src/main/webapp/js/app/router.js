Montric.Router.map(function () {
    this.resource("main", {path: "/"}, function () {
        this.resource("login", {path: "/login"}, function () {

        });
        this.route('charts');
        this.resource("admin", {path: "/admin"}, function() {
            this.resource('alerts', {path: "/alerts"}, function() {
                this.route('alert', {path: "/:alert_id"});
            });
            this.route('chartGroups');
            this.route('mainMenu');
            this.route('accessTokens');
            this.route('accounts');
            this.route('alertRecipients');
        });
    });
});