Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '{{render header}}' +
    '{{outlet}}' +
    '{{render chartOptionsModal}}'
);

Ember.TEMPLATES['main'] = Ember.Handlebars.compile('{{outlet}}');

Ember.TEMPLATES['header'] = Ember.Handlebars.compile('' +
    '<span class="headerText">{{#linkTo main}}<img src="/img/logo-small.png" />{{/linkTo}}</span>' +
    //'{{view EurekaJ.BootstrapButton target="controller" action="doAdmin" classNames="pull-right mediumTopPadding" content="Administration" iconName="icon-cog"}}' +
    '<button class="btn btn-info btn-mini pull-right mediumTopPadding" {{action doAdmin target="controller"}}>' + 
        '<i class="icon-cog"></i>Administration' + 
    '</button>' +
    '{{view EurekaJ.BootstrapButton target="controller" action="showModal" classNames="pull-right mediumTopPadding" content="Chart Options"}}'
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
        '{{view EurekaJ.ChartView chartBinding="chart"}}<br />' +
    '{{/each}}'
);

Ember.TEMPLATES['chartMenu'] = Ember.Handlebars.compile('' +
    '<h1>Charts Menu</h1>' +
    '{{view EurekaJ.TreeView itemsBinding="content" allowSelectionOfNonLeafNodes=false allowMultipleSelections=true}}'
);

Ember.TEMPLATES['login'] = Ember.Handlebars.compile('' +
    '<div class="loginBox well">' +
        '<h1>EurekaJ Login</h1> ' +
        'Username: <br />' +
        '{{view Ember.TextField elementId="usernameInput" value=""}}<br />' +
        'Password: <br />' +
        '{{view Ember.TextField elementId="passwordInput" value=""}}<br />' +
        '{{view Ember.Checkbox elementId="remeberCheck" }} Remember me<br />' +
        '<button {{action doLogin}} class="tenPxMarginTop">Login</button>' +
    '</div>'
);

Ember.TEMPLATES['chartOptionsModal'] = Ember.Handlebars.compile('' +
    '<div class="modal-header centerAlign">' +
        '<button type="button" class="close" data-dismiss="modal" class="floatRight">x</button>' +
        '<h1 class="centerAlign">Chart Options</h1>' +
    '</div>' +
    '<div class="modal-body">' +
        '{{view EurekaJ.TabView controllerBinding="this"}}' +
    '</div>' +
    '<div class="modal-footer">' +
        '{{view EurekaJ.BootstrapButton content="Apply Changes" action="updateChartDates" target="controller"}}' +
    '</div>'
);

Ember.TEMPLATES['live-chart-options'] = Ember.Handlebars.compile('' +
    '<table>' +
    '<tr>' +
        '<td>Timezone: </td>' +
        '<td>{{view EurekaJ.Select contentBinding="applicationController.timezones" optionLabelPath="content.timezoneName" optionValuePath="content.timezoneId" selectionBinding="applicationController.selectedTimezone" prompt="Select Timezone"}}</td>' +
    '</tr><tr>' +
        '<td>Timespan: </td>' +
        '<td>{{view EurekaJ.Select contentBinding="applicationController.chartTimespans" optionLabelPath="content.timespanName" optionValuePath="content.timespanValue" selectionBinding="applicationController.selectedChartTimespan" prompt="Select Timespan"}}</td>' +
    '</tr><tr>' +
        '<td>Resolution: </td>' +
        '<td>{{view EurekaJ.Select contentBinding="applicationController.chartResolutions" optionLabelPath="content.chartResolutionName" optionValuePath="content.chartResolutionValue" selectionBinding="applicationController.selectedChartResolution" prompt="Select Resolution"}}</td>' +
    '</tr>' +
    '</table>'
);

Ember.TEMPLATES['historical-chart-options'] = Ember.Handlebars.compile('' +
    '<table>' +
    '<tr>' +
        '<td>Timezone: </td>' +
        '<td>{{view EurekaJ.Select contentBinding="applicationController.timezones" optionLabelPath="content.timezoneName" optionValuePath="content.timezoneId" selectionBinding="applicationController.selectedTimezone" prompt="Select Timezone"}}</td>' +
    '</tr><tr>' +
        '<td>From: </td>' +
        '<td>{{view Ember.TextField valueBinding="applicationController.selectedChartFromString"}}</td>' +
    '</tr><tr>' +
        '<td>To: </td>' +
        '<td>{{view Ember.TextField valueBinding="applicationController.selectedChartToString"}}</td>' +
    '</tr>' +
    '</tr><tr>' +
        '<td>Resolution: </td>' +
        '<td>{{view EurekaJ.Select contentBinding="applicationController.chartResolutions" optionLabelPath="content.chartResolutionName" optionValuePath="content.chartResolutionValue" selectionBinding="applicationController.selectedChartResolution" prompt="Select Resolution"}}</td>' +
    '</tr>' +
    '</table>'
);
/** //Browser Templates **/