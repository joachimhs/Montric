Ember.TEMPLATES['administration/alertRecipients'] = Ember.Handlebars.compile('' +
    '<div id="adminTabLeftMenu">' +
        '{{view Ember.TextField valueBinding="newAdminRecipientName" classNames="input-medium mediumTopPadding"}}' +
        '<button class="btn" {{action createNewAlertRecipient}}>Add</button>' +
        '{{view Montric.SelectableListView listItemsBinding="content" deleteAction="deleteSelectedAlertRecipient" selectedItemBinding="controller.selectedItem"}}' +
    '</div>' +

    '{{#if selectedItem}}' +
        '<div id="adminTabRightContent">' +
            '<h1>{{selectedItem.id}}</h1>' +
            '<table class="table">' +
            '<tr>' +
                '<td>Alert Plugin:</td>' +
                '<td colspan="2">' +
                    '{{view Montric.Select classNames="input-medium" valueBinding="selectedItem.pluginName" contentBinding="controllers.alertPlugins" optionLabelPath="content.id" optionValuePath="content.id"}}' +
                '</td>' +
            '</tr>' +
            '<tr>' +
                '<td>Recipients:</td>' +
                '<td>' +
                    '{{view Ember.TextField valueBinding="controller.newRecipient" classNames="almostFillWidth"}}' +
                '</td>' +
                '<td><button class="btn" style="width: 100%;" {{action doAddRecipient}}>Add</button></td>' +
            '</tr>' +
            '<tr>' +
                '<td colspan="3">' +
                    '<div style="max-height: 150px; max-height: 150px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
                        '{{view Montric.SelectableListView listItemsBinding="selectedItem.recipients" deleteAction="deleteSelectedRecipient" maxCharacters="120" selectedItemBinding="controller.selectedRecipient"}}' +
                    '</div>' +
                '</td>' +
            '</tr>' +
            '<tr class="footer">' +
                '<td colspan="3"><button {{action doCommitAlertRecipient}} class="btn" style="width: 100%;">Save Alert Recipient</button></td>' +
            '</tr>' +
            '</table>' +
        '</div>' +
    '{{/if}}' +
    '{{view Montric.ConfirmDialogView elementId="adminAlertRecipientConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelAlertRecipientDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="controller" header="Delete Alert Recipient?" message="Are you sure you want to delete the selected alert recipient? This action will permanently remove the alert recipient from the system. This action cannot be undone!"}}'
);