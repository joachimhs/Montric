Ember.TEMPLATES['application'] = Ember.Handlebars.compile('' +
    '{{outlet header}}' +
    '{{outlet}}' +
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
        '</div>' +
        '<div class="modal-footer">{{view EurekaJ.BootstrapButton content="Apply Changes" action="applyChartOptionsChanges" target="EurekaJ.router"}}</div>' +
    '</div>'
);

Ember.TEMPLATES['confirmDialog'] = Ember.Handlebars.compile(
    '<div class="modal-header centerAlign">' +
        '<button type="button" class="close" data-dismiss="modal" class="floatRight">×</button>' +
        '<h1 class="centerAlign">{{view.header}}</h1>' +
    '</div>' +
    '<div class="modal-body">' +
        '{{view.message}}' +
    '</div>' +
    '<div class="modal-footer">' +
        '{{#if view.cancelAction}}' +
            '{{view EurekaJ.BootstrapButton contentBinding="view.cancelButtonLabel" actionBinding="view.cancelAction" targetBinding="view.target"}}' +
        '{{/if}}' +
        '{{#if view.okAction}}' +
            '{{view EurekaJ.BootstrapButton contentBinding="view.okButtonLabel" actionBinding="view.okAction" targetBinding="view.target"}}' +
        '{{/if}}' +
    '</div>'
    //'<div class="modal-footer">{{view EurekaJ.BootstrapButton content="Apply Changes" action="applyChartOptionsChanges" target="EurekaJ.router"}}</div>' +
);

Ember.TEMPLATES['live-chart-options'] = Ember.Handlebars.compile('' +
    '<table>' +
    '<tr>' +
        '<td>Timezone: </td>' +
        '<td>{{view EurekaJ.Select contentBinding="EurekaJ.appValuesController.timezones" optionLabelPath="content.timezoneName" optionValuePath="content.timezoneId" selectionBinding="EurekaJ.appValuesController.selectedTimezone" prompt="Select Timezone"}}</td>' +
    '</tr><tr>' +
        '<td>Timespan: </td>' +
        '<td>{{view EurekaJ.Select contentBinding="EurekaJ.appValuesController.chartTimespans" optionLabelPath="content.timespanName" optionValuePath="content.timespanValue" selectionBinding="EurekaJ.appValuesController.selectedChartTimespan" prompt="Select Timespan"}}</td>' +
    '</tr><tr>' +
        '<td>Resolution: </td>' +
        '<td>{{view EurekaJ.Select contentBinding="EurekaJ.appValuesController.chartResolutions" optionLabelPath="content.chartResolutionName" optionValuePath="content.chartResolutionValue" selectionBinding="EurekaJ.appValuesController.selectedChartResolution" prompt="Select Resolution"}}</td>' +
    '</tr>' +
    '</table>'
);

Ember.TEMPLATES['historical-chart-options'] = Ember.Handlebars.compile('' +
    '<table>' +
    '<tr>' +
        '<td>Timezone: </td>' +
        '<td>{{view EurekaJ.Select contentBinding="EurekaJ.appValuesController.timezones" optionLabelPath="content.timezoneName" optionValuePath="content.timezoneId" selectionBinding="EurekaJ.appValuesController.selectedTimezone" prompt="Select Timezone"}}</td>' +
    '</tr><tr>' +
        '<td>From: </td>' +
        '<td>{{view Ember.TextField valueBinding="EurekaJ.appValuesController.selectedChartFromString"}}</td>' +
    '</tr><tr>' +
        '<td>To: </td>' +
        '<td>{{view Ember.TextField valueBinding="EurekaJ.appValuesController.selectedChartToString"}}</td>' +
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

Ember.TEMPLATES['chart'] = Ember.Handlebars.compile('<h1>{{name}}</h1>');

Ember.TEMPLATES['admin'] = Ember.Handlebars.compile('' +
    '{{view EurekaJ.TabView controllerBinding="EurekaJ.adminTabBarController"}}' +
    '{{outlet adminTabContent}}'
);

Ember.TEMPLATES['header'] = Ember.Handlebars.compile('' +
    '<span class="headerText"><a {{action doHome}} href="#"><img src="/img/logo-small.png" /></a></span>' +
    '{{view EurekaJ.AdministrationButton target="EurekaJ.router" action="doAdmin" classNames="btn-info btn-mini pull-right mediumTopPadding" content="Administration" iconName="icon-cog"}}' +
    '{{view EurekaJ.ChartOptionsButton classNames="btn-info btn-mini pull-right mediumTopPadding" content="Chart Options"}}'
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

Ember.TEMPLATES['alertTabContent'] = Ember.Handlebars.compile('' +
    '{{view Ember.View templateName="adminAlertLeftMenu"}}'
);

Ember.TEMPLATES['adminAlertLeftMenu'] = Ember.Handlebars.compile('' +
    '<div id="adminTabLeftMenu">' +
        '{{view Ember.TextField valueBinding="newAlertName" classNames="input-medium search-query mediumTopPadding"}}' +
        '<button class="btn" {{action createNewAlert}}>Add</button>' +
        '{{view EurekaJ.SelectableListView listItemsBinding="content" deleteAction="deleteSelectedAlert" selectedItemBinding="controller.selectedItem"}}' +
    '</div>' +

    '{{#if selectedItem}}<div id="adminTabRightContent">' +
        '<h1>{{selectedItem.id}}</h1>' +
        '<table class="table adminTable">' +
            '<tr>' +
                '<td>Activated:</td>' +
                '<td colspan="3">{{view Ember.Checkbox checkedBinding="selectedItem.alertActivated"}}</td>' +
            '</tr>' +
            '<tr>' +
                '<td>Error Value:</td>' +
                '<td>{{view Ember.TextField valueBinding="selectedItem.alertErrorValue" classNames="input-mini"}}</td>' +
                '<td>Warning Value:</td>' +
                '<td>{{view Ember.TextField valueBinding="selectedItem.alertWarningValue" classNames="input-mini"}}</td>' +
            '</tr>' +
            '<tr>' +
                '<td>Alert Type:</td>' +
                '<td>{{view EurekaJ.Select classNames="input-medium" valueBinding="selectedItem.alertType" contentBinding="alertTypes" optionLabelPath="content.value" optionValuePath="content.key"}}</td>' +
                '<td>Alert Delay:</td>' +
                '<td>{{view Ember.TextField valueBinding="selectedItem.alertDelay" classNames="input-mini"}}</td>' +
            '</tr>' +
            '<tr>' +
                '<td>Alert Source:</td>' +
                '<td colspan="3">' +
                    //'{{view EurekaJ.TreeView controllerBinding="adminMenuController"}}' +
                    '<div>{{#if selectedItem.alertSource}}{{selectedItem.alertSource}}{{else}}None Selected{{/if}}</div>' +
                    '<div style="max-height: 250px; overflow: scroll; margin-bottom: 15px;" class="azureBlueBackground azureBlueBorderThin">' +
                        '{{view EurekaJ.SelectableLeafTreeView controllerBinding="adminMenuController" selectedItemBinding="selectedItem.alertSource"}}' +
                    '</div>' +
                '</td>' +
            '</tr>' +
            '<tr>' +
                '<td>Email Notification:</td>' +
                '<td>_List of notifications_</td>' +
                '<td>Plugin Notification:</td>' +
                '<td>_List of pluigns_</td>' +
            '</tr>' +
            '<tr class="footer">' +
                '<td colspan="4"><button {{action doCommitAlert}} class="btn" style="width: 100%;">Save Alert</button></td>' +
            '</tr>' +
        '</table>' +
    '</div>{{/if}}' +
    '{{view EurekaJ.ConfirmDialogView elementId="adminAlertConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelAlertDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="EurekaJ.router" header="Delete Alert?" message="Are you sure you want to delete the selected alert? This action will permanently remove the alert from the system. This action cannot be undone!"}}'
);

Ember.TEMPLATES['menuAdminTabContent'] = Ember.Handlebars.compile('' +
    '<div class="fullWidth">' +
        '<h1>Delete Menu Items</h1>' +
        '<table class="table adminTable">' +
        '<tr>' +
            '<td style="width: 150px;">Main Menu:</td>' +
            '<td><div style="max-height: 350px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
                '{{view EurekaJ.TreeView controllerBinding="controller.adminMenuController" allowSelectionOfNonLeafNodes="true"}}' +
            '</div></td>' +
        '</tr>' +
        '<tr>' +
            '<td colspan="2"><button {{action doCommitMenu}} class="btn" style="width: 100%;">Delete Selected Menu Items</button></td>' +
        '</tr>' +
        '</table>'+
    '</div>' +
    '{{view EurekaJ.ConfirmDialogView elementId="menuAdminConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="EurekaJ.router" header="Delete Tree Menu Items?" message="Are you sure you want to delete the selected items? This action will permanently remove the menu items from the system. This action cannot be undone!"}}'

);

Ember.TEMPLATES['chartGroupTabContent'] = Ember.Handlebars.compile('' +
    '<div id="adminTabLeftMenu">' +
        '{{view Ember.TextField valueBinding="newChartGroupName" classNames="input-medium search-query mediumTopPadding"}}' +
        '<button class="btn" {{action createNewChartGroup}}>Add</button>' +
        '{{view EurekaJ.SelectableListView listItemsBinding="controller.content" deleteAction="deleteSelectedChartGroup" selectedItemBinding="controller.selectedItem"}}' +
    '</div>' +

    '{{#if selectedItem}}<div id="adminTabRightContent">' +
        '<h1>{{selectedItem.id}}</h1>' +
        '<table class="table adminTable">' +
        '<tr>' +
            '<td style="width: 150px;">Select nodes:</td>' +
            '<td>' +
                '<div style="max-height: 250px; min-height: 250px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
                    '{{view EurekaJ.TreeView controllerBinding="controller.adminMenuController"}}' +
                '</div>' +
                '<button {{action doAddCheckedNodes}} class="btn" style="width: 100%;">Add selected Charts to Chart Group</button>' +
            '</td>' +
        '</tr>' +
        '<tr>' +
            '<td style="width: 150px;">Selected Nodes:</td>' +
            '<td>' +
                '<div style="max-height: 150px; max-height: 150px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
                    '{{view EurekaJ.SelectableListView listItemsBinding="selectedItem.chartGroups" deleteAction="deleteSelectedChartPathGroup" maxCharacters="120" selectedItemBinding="controller.selectedChartGroupPath"}}' +
                '</div>' +
            '</td>' +
        '</tr>' +
        '<tr class="footer">' +
            '<td colspan="2"><button {{action doCommitChartGroup}} class="btn" style="width: 100%;">Save Chart Group</button></td>' +
        '</tr>' +
    '</div>{{/if}}' +
    '{{view EurekaJ.ConfirmDialogView elementId="chartGroupConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="EurekaJ.router" header="Delete Chart Group?" message="Are you sure you want to delete the selected chart group? This action will permanently remove the menu items from the system. This action cannot be undone!"}}' +
    '{{view EurekaJ.ConfirmDialogView elementId="chartGroupPathsConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelPathDeletion" okButtonLabel="Delete" okAction="doConfirmPathDeletion" target="EurekaJ.router" header="Delete Chart Group Path?" message="Are you sure you want to delete the selected chart group path? This action will permanently remove the menu items from the system. This action cannot be undone!"}}'
);

Ember.TEMPLATES['emailRecipientsTabContent'] = Ember.Handlebars.compile('' +
    '<div id="adminTabLeftMenu">' +
        '{{view Ember.TextField valueBinding="newEmailGroupName" classNames="input-medium search-query mediumTopPadding"}}' +
        '<button class="btn" {{action createNewEmailGroup}}>Add</button>' +
        '{{view EurekaJ.SelectableListView listItemsBinding="controller.content" deleteAction="deleteSelectedEmailGroup" selectedItemBinding="controller.selectedItem"}}' +
    '</div>' +

    '{{#if selectedItem}}<div id="adminTabRightContent">' +
        '<h1>{{selectedItem.id}}</h1>' +
        '<table class="table adminTable">' +
        '<tr>' +
            '<td style="width: 150px;">SMTP Host:</td>' +
            '<td colspan="3">{{view Ember.TextField valueBinding="selectedItem.smtpHost" classNames="almostFillWidth"}}</td>' +
        '</tr>' +
        '<tr>' +
            '<td style="width: 150px;">SMTP Username</td>' +
            '<td>{{view Ember.TextField valueBinding="selectedItem.smtpUsername" classNames="almostFillWidth"}}</td>' +
            '<td style="width: 150px;">SMTP Password</td>' +
            '<td>{{view Ember.TextField valueBinding="selectedItem.smtpPassword" classNames="almostFillWidth"}}</td>' +
        '</tr>' +
        '<tr>' +
            '<td style="width: 150px;">SMTP Port</td>' +
            '<td>{{view Ember.TextField valueBinding="selectedItem.smtpPort" classNames="almostFillWidth"}}</td>' +
            '<td style="width: 150px;">SMTP Use SSL ?</td>' +
            '<td>{{view Ember.Checkbox checkedBinding="selectedItem.smtpUseSSL"}}</td>' +
        '</tr>' +
        '<tr>' +
            '<td>Email Recipients:</td>' +
            '<td colspan="2">{{view Ember.TextField valueBinding="controller.newEmailRecipient" classNames="almostFillWidth"}}</td>' +
            '<td><button class="btn" style="width: 100%;" {{action doAddEmailRecipient}}>Add</button></td>' +
        '</tr>' +
        '<tr>' +
            '<td colspan="4">' +
            '<div style="max-height: 150px; max-height: 150px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
                '{{view EurekaJ.SelectableListView listItemsBinding="selectedItem.emailRecipients" deleteAction="deleteSelectedEmailRecipient" maxCharacters="120" selectedItemBinding="controller.selectedEmailRecipient"}}' +
            '</div>' +
            '</td>' +
        '</tr>' +
        '<tr class="footer">' +
            '<td colspan="4"><button {{action doCommitEmailGroup}} class="btn" style="width: 100%;">Save Email Group</button></td>' +
        '</tr>' +
    '</div>{{/if}}' +
    '{{view EurekaJ.ConfirmDialogView elementId="emailGroupConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="EurekaJ.router" header="Delete Email Group?" message="Are you sure you want to delete the selected email group? This action will permanently remove the menu items from the system. This action cannot be undone!"}}' +
    '{{view EurekaJ.ConfirmDialogView elementId="emailAddressConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelAddressDeletion" okButtonLabel="Delete" okAction="doConfirmAddressDeletion" target="EurekaJ.router" header="Delete Email Address?" message="Are you sure you want to delete the selected email address? This action will permanently remove the menu items from the system. This action cannot be undone!"}}'
);

Ember.TEMPLATES['main-menu'] = Ember.Handlebars.compile('' +
    '<h1>Main Menu</h1>' +
        /*'{{#each controller}}' +
            '{{view EurekaJ.NodeView contentBinding="this"}}' +
        '{{/each}}' +*/
    '{{view EurekaJ.TreeView contentBinding="controller.content"}}'
);

/** Browser Templates **/
Ember.TEMPLATES['browser-template'] = Ember.Handlebars.compile('' +
    'browser{{content}}{{#each content}}' +
        '{{view EurekaJ.BrowserListView contentBinding="this"}}' +
    '{{/each}}'
);

Ember.TEMPLATES['browser-list-template'] = Ember.Handlebars.compile('' +
    '{{view EurekaJ.BrowserItemView contentBinding="this"}}' +

    '{{#if isExpanded}}' +
        '{{children}}{{view EurekaJ.BrowserView contentBinding="children"}}' +
    '{{/if}}'
);

Ember.TEMPLATES['browser-item-template'] = Ember.Handlebars.compile('' +
    '{{name}}'
);

/** //Browser Templates **/