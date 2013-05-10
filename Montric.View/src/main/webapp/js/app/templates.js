Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '{{render header}}' +
    '{{outlet}}' +
    '{{render chartOptionsModal}}'
);

Ember.TEMPLATES['main'] = Ember.Handlebars.compile('{{outlet}}');

Ember.TEMPLATES['header'] = Ember.Handlebars.compile('' +
    '<span class="headerText">{{#linkTo main}}<img src="/img/logo-small.png" />{{/linkTo}}</span>' +
    //'{{view Montric.BootstrapButton target="controller" action="doAdmin" classNames="pull-right mediumTopPadding" content="Administration" iconName="icon-cog"}}' +
    '{{#if controllers.user.isUser}}' +
        '<button class="btn btn-primary pull-right mediumTopPadding" {{action doAdmin target="controller"}}>' +
            '<i class="icon-cog"></i>Administration' +
        '</button>' +
    '{{/if}}' +
    '{{#if controllers.user.isAdmin}}' +
        '{{view Montric.BootstrapButton target="controller" action="showModal" classNames="pull-right mediumTopPadding" content="Chart Options"}}' +
    '{{/if}}'
);

Ember.TEMPLATES['main/dashboard'] = Ember.Handlebars.compile('' +
    '{{#linkTo main.charts}}Charts{{/linkTo}}<br />' +
    '{{#linkTo main.alerts}}Alerts{{/linkTo}}<br />' +
    '{{#linkTo main.chartGroups}}Chart Groups{{/linkTo}}<br />' +
    '{{#linkTo administration.index}}Adminisration{{/linkTo}}<br />'
);

Ember.TEMPLATES['main/charts'] = Ember.Handlebars.compile('' +
    '{{render chartMenu}}' +
    '{{render charts}}'
);

Ember.TEMPLATES['charts'] = Ember.Handlebars.compile('' +
    '{{#each controller}}' +
        //'<h1>{{name}}</h1>' +
        '{{view Montric.ChartView chartBinding="chart"}}<br />' +
    '{{/each}}'
);

Ember.TEMPLATES['chartMenu'] = Ember.Handlebars.compile('' +
    '<h1>Charts Menu</h1>' +
    '{{view Montric.TreeView itemsBinding="content" allowSelectionOfNonLeafNodes=false allowMultipleSelections=true}}'
);

Ember.TEMPLATES['login'] = Ember.Handlebars.compile('{{outlet}}');

Ember.TEMPLATES['login/index'] = Ember.Handlebars.compile('' +
    '<div class="loginBox well">' +
        '<h1>Montric Login</h1>' +
        '<p>Montric is currently in Beta. You are free to register an account, but your data will only be retained for one week. Throughout the beta-period we will expand the retention. Towards the end of the beta-period we will add subscription plans with different retention lengths.</p>' +
        '{{#if controllers.user.isLoggingIn}}' +
            '<div style="margin-top: 20px; text-align: center;"><a href="#" class="persona-button"><span>Signing In... Please Wait</span></a></div>' +
        '{{else}}' +
            '<div style="margin-top: 20px; text-align: center;"><a href="#" class="persona-button" {{action doLogin}}><span>Sign in with Mozilla Persona</span></a></div>' +
        '{{/if}}' +
    '</div>'
);

Ember.TEMPLATES['main/activation'] = Ember.Handlebars.compile(
    '<div class="loginBox well">' +
        '<h1>Awaiting Activation</h1>' +
        '<p>Your account have been registered, but is awaiting activation by a site administrator. We apologize for the delay. </p>' +
        '<p>As we progress through the private beta and move towards the public beta, this process will be removed! </p>' +
        '<p>You will receive an email to your registered email address when we have processed your request.</p>' +
    '</div>'
);

Ember.TEMPLATES['chartOptionsModal'] = Ember.Handlebars.compile('' +
    '<div class="modal-header centerAlign">' +
        '<button type="button" class="close" data-dismiss="modal" class="floatRight">x</button>' +
        '<h1 class="centerAlign">Chart Options</h1>' +
    '</div>' +
    '<div class="modal-body">' +
        '{{view Montric.TabView controllerBinding="this"}}' +
    '</div>' +
    '<div class="modal-footer">' +
        '{{view Montric.BootstrapButton content="Apply Changes" action="updateChartDates" target="controller"}}' +
    '</div>'
);

Ember.TEMPLATES['live-chart-options'] = Ember.Handlebars.compile('' +
    '<table>' +
    '<tr>' +
        '<td>Timezone: </td>' +
        '<td>{{view Montric.Select contentBinding="applicationController.timezones" optionLabelPath="content.timezoneName" optionValuePath="content.timezoneId" selectionBinding="applicationController.selectedTimezone" prompt="Select Timezone"}}</td>' +
    '</tr><tr>' +
        '<td>Timespan: </td>' +
        '<td>{{view Montric.Select contentBinding="applicationController.chartTimespans" optionLabelPath="content.timespanName" optionValuePath="content.timespanValue" selectionBinding="applicationController.selectedChartTimespan" prompt="Select Timespan"}}</td>' +
    '</tr><tr>' +
        '<td>Resolution: </td>' +
        '<td>{{view Montric.Select contentBinding="applicationController.chartResolutions" optionLabelPath="content.chartResolutionName" optionValuePath="content.chartResolutionValue" selectionBinding="applicationController.selectedChartResolution" prompt="Select Resolution"}}</td>' +
    '</tr>' +
    '</table>'
);

Ember.TEMPLATES['historical-chart-options'] = Ember.Handlebars.compile('' +
    '<table>' +
    '<tr>' +
        '<td>Timezone: </td>' +
        '<td>{{view Montric.Select contentBinding="applicationController.timezones" optionLabelPath="content.timezoneName" optionValuePath="content.timezoneId" selectionBinding="applicationController.selectedTimezone" prompt="Select Timezone"}}</td>' +
    '</tr><tr>' +
        '<td>From: </td>' +
        '<td>{{view Ember.TextField valueBinding="applicationController.selectedChartFromString"}}</td>' +
    '</tr><tr>' +
        '<td>To: </td>' +
        '<td>{{view Ember.TextField valueBinding="applicationController.selectedChartToString"}}</td>' +
    '</tr>' +
    '</tr><tr>' +
        '<td>Resolution: </td>' +
        '<td>{{view Montric.Select contentBinding="applicationController.chartResolutions" optionLabelPath="content.chartResolutionName" optionValuePath="content.chartResolutionValue" selectionBinding="applicationController.selectedChartResolution" prompt="Select Resolution"}}</td>' +
    '</tr>' +
    '</table>'
);
/** //Browser Templates **/