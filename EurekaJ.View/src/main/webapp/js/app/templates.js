Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '{{outlet}}' +
    '{{outlet header}}' +
    '{{view Ember.View templateName="chartOptionsModal"}}'
);

Ember.TEMPLATES['chartOptionsModal'] = Ember.Handlebars.compile('' +
    '<div id="chartOptionsModal" class="modal hide">' +
        '<div class="modal-header centerAlign">' +
            '<button type="button" class="close" data-dismiss="modal" class="floatRight">×</button>' +
            '<h1 class="centerAlign">Chart Options</h1>' +
        '</div>' +
        '<div class="modal-body">' +
            '{{view EurekaJ.TabView controllerBinding="EurekaJ.chartOptionsTabBarController"}}' +
            //'{{view EurekaJ.LiveChartOptionsView}}' +
        '</div>' +
        '<div class="modal-footer">{{view EurekaJ.BootstrapButton content="Apply Changes"}}</div>' +
    '</div>'
);

Ember.TEMPLATES['live-chart-options'] = Ember.Handlebars.compile('' +
    '<table>' +
    '<tr>' +
        '<td>Timezone: </td>' +
        '<td>{{view Ember.Select contentBinding="EurekaJ.appValuesController.timezones" optionLabelPath="content.timezoneName" optionValuePath="content.timezoneId" selectionBinding="EurekaJ.appValuesController.selectedTimezone" prompt="Select Timezone"}}</td>' +
    '</tr><tr>' +
        '<td>Timespan: </td>' +
        '<td>{{view Ember.Select contentBinding="EurekaJ.appValuesController.chartTimespans" optionLabelPath="content.timespanName" optionValuePath="content.timespanValue" selectionBinding="EurekaJ.appValuesController.selectedChartTimespan" prompt="Select Timespan"}}</td>' +
    '</tr><tr>' +
        '<td>Resolution: </td>' +
        '<td>{{view Ember.Select contentBinding="EurekaJ.appValuesController.chartResolutions" optionLabelPath="content.chartResolutionName" optionValuePath="content.chartResolutionValue" selectionBinding="EurekaJ.appValuesController.selectedChartResolution" prompt="Select Resolution"}}</td>' +
    '</tr>' +
    '</table>'
);

Ember.TEMPLATES['login-page'] = Ember.Handlebars.compile('' +
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

Ember.TEMPLATES['chart'] = Ember.Handlebars.compile('' +
    '<h1>{{name}}</h1>'
    //'<svg> </svg>'
);

Ember.TEMPLATES['admin'] = Ember.Handlebars.compile('' +
    '{{view EurekaJ.TabView controllerBinding="EurekaJ.adminTabBarController"}}' +
    '{{outlet adminTabContent}}'
);

Ember.TEMPLATES['header'] = Ember.Handlebars.compile('' +
    '<span class="headerText"><a {{action doHome}} href="#">EurekaJ:Live</a></span>' +
    '{{view EurekaJ.AdministrationButton target="EurekaJ.router" action="doAdmin" classNames="btn-info btn-mini pull-right" content="Administration" iconName="icon-cog"}}' +
    '{{view EurekaJ.ChartOptionsButton classNames="btn-info btn-mini pull-right" content="Chart Options"}}'
);

Ember.TEMPLATES['main'] = Ember.Handlebars.compile('' +
    '{{view EurekaJ.MenuView controllerBinding="EurekaJ.router.menuController"}}' +
    '<div id="chartsArea">{{#each controller}}' +
        '{{view EurekaJ.ChartView contentBinding="this"}}<br />' +
    '{{/each}}</div>'

    /*'<div class="modal hide fade eurekaJModal" id="administrationModal">' +
        '<div class="modal-header centerAlign"><button type="button" class="close" data-dismiss="modal">×</button><h1>Administration</h1></div>' +
        '<div class="modal-body"><div style="width: 900px;"><p>Modal Body</p></div></div>' +
        '<div class="modal-footer"><p><a href="#" class="btn" data-dismiss="modal">Close</a></p></div>' +
    '</div>'*/
);

Ember.TEMPLATES['main-menu'] = Ember.Handlebars.compile('' +
    '<h1>Main Menu</h1>' +
        '{{#each controller}}' +
            '{{view EurekaJ.NodeView contentBinding="this"}}' +
        '{{/each}}' +
    '</ul>'
);

/** Tree Menu Templates **/
Ember.TEMPLATES['tree-node'] = Ember.Handlebars.compile('' +
        '{{view EurekaJ.NodeContentView contentBinding="node"}}' +

        '{{#if this.isExpanded}}' +
            '<div style="width: 500px;">' +
            '{{#each this.children}}' +
                '<div style="margin-left: 22px;">{{view EurekaJ.NodeView contentBinding="this"}}</div>' +
            '{{/each}}' +
            '</div>' +
        '{{/if}}'
);

Ember.TEMPLATES['tree-node-text'] = Ember.Handlebars.compile('' +
    '{{name}}'
);

Ember.TEMPLATES['tree-node-content'] = Ember.Handlebars.compile('' +
    '{{#unless hasChildren}}' +
        '<span style="margin-right: 7px;">&nbsp;</span>' +
        '{{view Ember.Checkbox checkedBinding="isSelected"}}' +
    '{{/unless}}' +

    '{{view EurekaJ.NodeArrowView contentBinding="this"}}' +
    '{{view EurekaJ.NodeTextView contentBinding="this" classNames="treeMenuText"}}'
);

Ember.TEMPLATES['tree-node-arrow'] = Ember.Handlebars.compile('' +
    '{{#if hasChildren}}' +
        '{{#if isExpanded}}' +
            '<span class="downarrow"></span>' +
        '{{else}}' +
            '<span class="rightarrow"></span>' +
        '{{/if}}' +
    '{{/if}}'
);
/** //Tree Menu Templates **/