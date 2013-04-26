Ember.TEMPLATES['administration'] = Ember.Handlebars.compile('' +
    '<div><h1>EurkeaJ Administration</h1></div>' +
    '{{view Montric.TabView controllerBinding="this"}}' +
    '{{outlet}}'
);

Ember.TEMPLATES['administration/alerts'] = Ember.Handlebars.compile('' +
    '{{view Ember.View templateName="adminAlertLeftMenu"}}'
);

Ember.TEMPLATES['administration/chartGroups'] = Ember.Handlebars.compile('' +
    '<div id="adminTabLeftMenu">' +
        '{{view Ember.TextField valueBinding="newChartGroupName" classNames="input-medium search-query mediumTopPadding"}}' +
        '<button class="btn" {{action createNewChartGroup}}>Add</button>' +
        '{{view Montric.SelectableListView labelPropertyName="id" listItemsBinding="controller.content" deleteAction="deleteSelectedChartGroup" selectedItemBinding="controller.selectedItem"}}' +
    '</div>' +

    '{{#if selectedItem}}<div id="adminTabRightContent">' +
        '<h1>{{selectedItem.id}}</h1>' +
        '<table class="table adminTable">' +
        '<tr>' +
            '<td style="width: 150px;">Select nodes:</td>' +
            '<td>' +
                '{{controllers.administrationMenu.length}}<div style="max-height: 250px; min-height: 250px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
                '{{view Montric.TreeView itemsBinding="controllers.administrationMenu.rootNodes"}}' +
                '</div>' +
                '<button {{action doAddCheckedNodes}} class="btn" style="width: 100%;">Add selected Charts to Chart Group</button>' +
            '</td>' +
        '</tr>' +
        '<tr>' +
            '<td style="width: 150px;">Selected Nodes:</td>' +
            '<td>' +
                '<div style="max-height: 150px; max-height: 150px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
                '{{view Montric.SelectableListView listItemsBinding="selectedItem.chartGroups" deleteAction="deleteSelectedChartPathGroup" maxCharacters="120" selectedItemBinding="controller.selectedChartGroupPath"}}' +
                '</div>' +
            '</td>' +
        '</tr>' +
        '<tr class="footer">' +
            '<td colspan="2"><button {{action doCommitChartGroup}} class="btn" style="width: 100%;">Save Chart Group</button></td>' +
        '</tr>' +
    '</div>{{/if}}' +
    '{{view Montric.ConfirmDialogView elementId="chartGroupConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="controller" header="Delete Chart Group?" message="Are you sure you want to delete the selected chart group? This action will permanently remove the menu items from the system. This action cannot be undone!"}}' +
    '{{view Montric.ConfirmDialogView elementId="chartGroupPathsConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelPathDeletion" okButtonLabel="Delete" okAction="doConfirmPathDeletion" target="controller" header="Delete Chart Group Path?" message="Are you sure you want to delete the selected chart group path? This action will permanently remove the menu items from the system. This action cannot be undone!"}}'
);

Ember.TEMPLATES['administration/emailRecipients'] = Ember.Handlebars.compile('' +
    '<div id="adminTabLeftMenu">' +
        '{{view Ember.TextField valueBinding="newEmailGroupName" classNames="input-medium search-query mediumTopPadding"}}' +
        '<button class="btn" {{action createNewEmailGroup}}>Add</button>' +
        '{{view Montric.SelectableListView listItemsBinding="controller.content" deleteAction="deleteSelectedEmailGroup" selectedItemBinding="controller.selectedItem"}}' +
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
                    '{{view Montric.SelectableListView listItemsBinding="selectedItem.emailRecipients" deleteAction="deleteSelectedEmailRecipient" maxCharacters="120" selectedItemBinding="controller.selectedEmailRecipient"}}' +
                '</div>' +
            '</td>' +
        '</tr>' +
        '<tr class="footer">' +
        '<td colspan="4"><button {{action doCommitEmailGroup}} class="btn" style="width: 100%;">Save Email Group</button></td>' +
        '</tr>' +
    '</div>{{/if}}' +
    '{{view Montric.ConfirmDialogView elementId="emailGroupConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="controller" header="Delete Email Group?" message="Are you sure you want to delete the selected email group? This action will permanently remove the menu items from the system. This action cannot be undone!"}}' +
    '{{view Montric.ConfirmDialogView elementId="emailAddressConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelAddressDeletion" okButtonLabel="Delete" okAction="doConfirmAddressDeletion" target="controller" header="Delete Email Address?" message="Are you sure you want to delete the selected email address? This action will permanently remove the menu items from the system. This action cannot be undone!"}}'
);

Ember.TEMPLATES['administration/menuAdmin'] = Ember.Handlebars.compile('' +
    '<div class="fullWidth">' +
        '<h1>Delete Menu Items</h1>' +
        '<table class="table adminTable">' +
        '<tr>' +
            '<td style="width: 150px;">Main Menu:</td>' +
            '<td><div style="max-height: 350px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
            '{{view Montric.TreeView itemsBinding="controllers.administrationMenu.rootNodes" allowSelectionOfNonLeafNodes="true"}}<div>&nbsp;</div>' +
        '</div></td>' +
        '</tr>' +
        '<tr>' +
            '<td colspan="2"><button {{action doCommitMenu}} class="btn" style="width: 100%;">Delete Selected Menu Items</button></td>' +
        '</tr>' +
        '</table>'+
    '</div>' +
    '{{view Montric.ConfirmDialogView elementId="menuAdminConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="controller" header="Delete Tree Menu Items?" message="Are you sure you want to delete the selected items? This action will permanently remove the menu items from the system. This action cannot be undone!"}}'
);

Ember.TEMPLATES['adminAlertLeftMenu'] = Ember.Handlebars.compile('' +
    '<div id="adminTabLeftMenu">' +
        '{{view Ember.TextField valueBinding="newAlertName" classNames="input-medium search-query mediumTopPadding"}}' +
            '<button class="btn" {{action createNewAlert}}>Add</button>' +
        '{{view Montric.SelectableListView listItemsBinding="content" deleteAction="deleteSelectedAlert" selectedItemBinding="controller.selectedItem"}}' +
    '</div>' +

    '{{#if selectedItem}}<div id="adminTabRightContent">' +
        '<h1>{{selectedItem.id}}</h1>' +
        '<table class="table">' +
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
            '<td>{{view Montric.Select classNames="input-medium" valueBinding="selectedItem.alertType" contentBinding="alertTypes" optionLabelPath="content.value" optionValuePath="content.key"}}</td>' +
            '<td>Alert Delay:</td>' +
            '<td>{{view Ember.TextField valueBinding="selectedItem.alertDelay" classNames="input-mini"}}</td>' +
        '</tr>' +
        '<tr>' +
            '<td>Alert Source:</td>' +
            '<td colspan="3">' +

            '<div>{{#if selectedItem.alertSource}}{{selectedItem.alertSource}}{{else}}None Selected{{/if}}</div>' +
            '<div style="max-height: 250px; overflow: scroll; margin-bottom: 15px;" class="azureBlueBackground azureBlueBorderThin">' +
                '{{view Montric.SelectableLeafTreeView itemsBinding="controllers.administrationMenu.rootNodes" selectedItemBinding="selectedItem.alertSource"}}' +
            '</div>' +
        '</td>' +
        '</tr>' +
        '<tr>' +
            '<td>Email Notification:</td>' +
            '<td>{{view Montric.MultiSelectableListView listItemsBinding="emailGroups" selectedItemsBinding="selectedItem.alertNotificationArray"}}</td>' +
            '<td>Plugin Notification:</td>' +
            '<td>_List of pluigns_</td>' +
        '</tr>' +
        '<tr class="footer">' +
            '<td colspan="4"><button {{action doCommitAlert}} class="btn" style="width: 100%;">Save Alert</button></td>' +
        '</tr>' +
        '</table>' +
    '</div>{{/if}}' +
    '{{view Montric.ConfirmDialogView elementId="adminAlertConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelAlertDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="controller" header="Delete Alert?" message="Are you sure you want to delete the selected alert? This action will permanently remove the alert from the system. This action cannot be undone!"}}'
);