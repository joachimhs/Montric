EurekaJ.AdministrationRoute = Ember.Route.extend({
    events: {
        adminAlertsSelected: function() {
            console.log('adminAlertsSelected');
            this.transitionTo('administration.alerts');
        },
        adminChartGroupsSelected: function() {
            console.log('adminChartGroupsSelected');
            this.transitionTo('administration.chartGroups');
        },
        adminEmailRecipientsSelected: function() {
            console.log('adminEmailRecipientsSelected');
            this.transitionTo('administration.emailRecipients');
        },
        adminMenuAdminSelected: function() {
            console.log('adminMenuAdminSelected');
            this.transitionTo('administration.menuAdmin');
        }
    },

    setupController : function(controller) {
        this._super(controller);
        var content = [];

        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'alerts',
            tabName : 'Alerts',
            tabState : 'administration.alerts',
            target : "controller",
            action : "adminAlertsSelected"
        }));
        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'chartGroups',
            tabName : 'Chart Group',
            tabState : 'administration.chartGroups',
            target : "controller",
            action : "adminChartGroupsSelected"
        }));
        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'emailRecipients',
            tabName : 'EmailRecipients',
            tabState : 'administration.emailRecipients',
            target : "controller",
            action : "adminEmailRecipientsSelected"
        }));
        content.pushObject(EurekaJ.TabModel.create({
            tabId : 'menuAdmin',
            tabName : 'Main Menu Admin',
            tabState : 'administration.menuAdmin',
            target : "controller",
            action : "adminMenuAdminSelected"
        }));
        controller.set('content', content);
        controller.resetSelectedTab();

        var adminMenuController = this.controllerFor('administrationMenu');
        EurekaJ.AdminMenuModel.find();
        var mainMenu = EurekaJ.store.filter(EurekaJ.AdminMenuModel, function(data) {
            if (data.get('parent') === null) {
                return true;
            }
        });

        adminMenuController.set('rootNodes', mainMenu);
        adminMenuController.set('content', EurekaJ.AdminMenuModel.find());
    }
});

EurekaJ.AdministrationIndexRoute = Ember.Route.extend({
    redirect: function(controller) {
        this.controllerFor('administration').resetSelectedTab();
        this.transitionTo('administration.alerts');
    }
});

EurekaJ.AdministrationAlertsRoute = Ember.Route.extend({
    model: function() {
        return EurekaJ.AlertModel.find();
    },

    setupController: function(controller, models) {
        this._super(controller, models);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('alerts');
        }
    }
});

EurekaJ.AdministrationChartGroupsRoute = Ember.Route.extend({
    model: function() {
        return EurekaJ.ChartGroupModel.find();
    },

    setupController: function(controller) {
        this._super(controller);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('chartGroups');
        }
    }
});

EurekaJ.AdministrationMenuAdminRoute = Ember.Route.extend({
    setupController: function(controller) {
        this._super(controller);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('menuAdmin');
        }
    }
});

EurekaJ.AdministrationEmailRecipientsRoute = Ember.Route.extend({
    model: function() {
        return EurekaJ.EmailGroupModel.find();
    },

    setupController: function(controller) {
        this._super(controller);
        var adminController = this.controllerFor('administration');
        if (adminController) {
            adminController.selectTabWithId('emailRecipients');
        }
    }
});

EurekaJ.AdministrationMenuController = Ember.ArrayController.extend({
    isSelectedObserver: function() {
        if (this.get('content')) {
            var selectedNodes = this.get('content').filter(function(node) {
                if (node.get('isSelected')) { return true; }
            });

            this.set('selectedNodes', selectedNodes);
        }
    }.observes('content.@each.isSelected'),

    deselectAllNodes: function() {
        this.get('selectedNodes').forEach(function(node) {
            console.log('setting isSelected to false for: ' + node.get('id'));
            node.set('isSelected', false);
        });
    }
});

EurekaJ.AdministrationController = Ember.ArrayController.extend({
    resetSelectedTab: function () {
        this.set('selectedTab', this.get('content').objectAt(0));
    },

    selectTabWithId: function(tabId) {
        var selectedIndex = 0;
        var index = 0;
        if (this.get('content')) {
            this.get('content').forEach(function (tab) {
                if (tab.get('tabId') === tabId) {
                    selectedIndex = index;
                }
                index++;
            })
        }
        this.set('selectedTab', this.get('content').objectAt(selectedIndex));
    }
});

EurekaJ.AdministrationChartGroupsController = Ember.ArrayController.extend({
    needs: ['administrationMenu'],
    newChartGroupName: '',
    adminMenuController: null,

    newChartGroupIsValid: function () {
        var newNameIsValid = (this.get('newChartGroupName') && this.get('newChartGroupName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (chartGroup) {
            if (chartGroup.get('id') === this.get('newChartGroupName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewChartGroup: function () {
        if (this.newChartGroupIsValid()) {
            EurekaJ.store.createRecord(EurekaJ.ChartGroupModel, {"id": this.get('newChartGroupName')});
            EurekaJ.store.commit();
            this.set('newChartGroupName', '');
        } else {
            EurekaJ.log('New Chart Group Not Valid!');
        }
    },

    doAddCheckedNodes: function () {
        console.log('doAddCheckedNodes');
        var selectedChartGroup = this.get('selectedItem');
        var chartGroups = [];

        var selectedNodes = this.get('controllers.administrationMenu.selectedNodes');
        if (selectedChartGroup) {
            chartGroups.pushObjects(selectedChartGroup.get('chartGroups'));

            selectedNodes.forEach(function (node) {
                var addGroup = true;
                chartGroups.forEach(function (existingGroup) {
                    if (existingGroup.get('id') === node.get('id')) addGroup = false;
                });
                if (addGroup)
                    chartGroups.pushObject(Ember.Object.create({id: node.get('id')}));
            });

            selectedChartGroup.set('chartGroupPath', '["' + chartGroups.getEach('id').join('","') + '"]');
        } else {
            console.log('NO SELECTED CHART GROUP');
        }
        selectedNodes.setEach('isSelected', false);
    },

    deleteSelectedChartPathGroup: function () {
        var selectedChartGroup = this.get('selectedItem');

        var selectedChartGroupPath = this.get('selectedChartGroupPath');
        if (selectedChartGroupPath) {
            console.log('selectedChartGroupPath: ' + selectedChartGroupPath);
            selectedChartGroup.get('chartGroups').removeObject(selectedChartGroupPath);
            selectedChartGroup.set('chartGroupPath', '["' + selectedChartGroup.get('chartGroups').getEach('id').join('","') + '"]');
        }
    },

    deleteSelectedChartGroup: function() {
        $("#chartGroupConfirmDialog").modal({show: true});
    },

    doCancelDeletion: function(router) {
        $("#chartGroupConfirmDialog").modal('hide');
    },

    doConfirmDeletion: function(router) {
        var selectedItem = this.get('selectedItem');
        if (selectedItem) {
            selectedItem.deleteRecord();
        }
        EurekaJ.store.commit();
        $("#chartGroupConfirmDialog").modal('hide');
    },

    doCommitChartGroup: function() {
        EurekaJ.store.commit();
    }
});

EurekaJ.AdministrationAlertsController = Ember.ArrayController.extend({
    needs: ['administrationMenu'],

    newAlertName: null,
    selectedItem: null,
    alertTypes: [
        {"key": "greater_than", "value": "Greater than"},
        {"key": "less_than", "value": "Less than"},
        {"key": "equals", "value": "Equal to"}
    ],

    sortAscending: true,
    sortProperties: ['alertName'],

    newAlertIsValid: function () {
        var newNameIsValid = (this.get('newAlertName') && this.get('newAlertName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (alert) {
            if (alert.get('alertName') === this.get('newAlertName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewAlert: function () {
        if (this.newAlertIsValid()) {
            EurekaJ.AlertModel.createRecord({id: this.get('newAlertName')});
            EurekaJ.store.commit();
        } else {
            EurekaJ.log('New Alert Name Not Valid!');
        }
    },

    deleteSelectedAlert: function() {
        $("#adminAlertConfirmDialog").modal({show: true});
    },

    doCancelAlertDeletion: function() {
        $("#adminAlertConfirmDialog").modal('hide');
    },

    doConfirmDeletion: function(item) {
        console.log('doConfirmDeletion');
        var selectedItem = this.get('selectedItem');
        if (selectedItem) {
            selectedItem.deleteRecord();
        }
        EurekaJ.store.commit();
        $("#adminAlertConfirmDialog").modal('hide');
    },

    doCommitAlert: function() {
        EurekaJ.store.commit();
    }
});

EurekaJ.AdministrationEmailRecipientsController = Ember.ArrayController.extend({
    needs: ['administrationMenu'],
    newEmailGroupName: '',
    newEmailRecipient: '',
    adminMenuController: null,

    newEmailGroupIsValid: function () {
        var newNameIsValid = (this.get('newEmailGroupName') && this.get('newEmailGroupName').length >= 1);

        var unique = true;
        this.get('content').forEach(function (chartGroup) {
            if (chartGroup.get('id') === this.get('newEmailGroupName')) {
                unique = false;
            }
        }, this);

        return unique && newNameIsValid;
    },

    createNewEmailGroup: function () {
        if (this.newEmailGroupIsValid()) {
            EurekaJ.store.createRecord(EurekaJ.EmailGroupModel, {
                "id": this.get('newEmailGroupName'),
                "smtpHost": "",
                "smtpUsername": "",
                "smtpPassword": "",
                "smtpPort": 465,
                "smtpUseSSL": true,
                "emailAddresses": "[]"});
            this.set('newEmailGroupName', '');
        } else {
            EurekaJ.log('New Email Group Not Valid!');
        }
        //EurekaJ.store.commit();
    },

    doAddEmailRecipient: function () {
        console.log('doAddEmailRecipient');
        var emailRecipient = this.get('newEmailRecipient');
        var selectedEmailGroup = this.get('selectedItem');

        var oldEmailAddresses = selectedEmailGroup.get('emailRecipients');
        oldEmailAddresses.pushObject(Ember.Object.create({id: emailRecipient}));

        var newAddresses = [];

        oldEmailAddresses.forEach(function (address) {
            newAddresses.pushObject(address.get('id'));
        });

        selectedEmailGroup.set('emailAddresses', '["' + newAddresses.join('","') + '"]');

        console.log(newAddresses);

        this.set('newEmailRecipient', '');
    },

    deleteSelectedEmailGroup: function() {
        $("#emailGroupConfirmDialog").modal({show: true});
    },

    doCancelDeletion: function(router) {
        $("#emailGroupConfirmDialog").modal('hide');
    },

    doConfirmDeletion: function(router) {
        var selectedEmailGroup = this.get('selectedItem');
        if (selectedEmailGroup) {
            selectedEmailGroup.deleteRecord();
        }
        EurekaJ.store.commit();
        this.set('selectedItem', null);
    },

    deleteSelectedEmailRecipient: function() {
        $("#emailAddressConfirmDialog").modal({show: true});
    },

    doCancelAddressDeletion: function(router) {
        $("#emailAddressConfirmDialog").modal('hide');
    },

    doConfirmAddressDeletion: function(router) {
        var newAddresses = [];

        var selectedEmailRecipient = this.get('selectedEmailRecipient');
        if (selectedEmailRecipient) {
            this.get('selectedItem.emailRecipients').forEach(function (emailRecipient) {
                if (emailRecipient.get('id') !== selectedEmailRecipient.get('id')) {
                    newAddresses.pushObject(emailRecipient.get('id'));
                }
            });
        }

        this.get('selectedItem').set('emailAddresses', '["' + newAddresses.join('","') + '"]');
        $("#emailAddressConfirmDialog").modal('hide');
    },

    doCommitEmailGroup: function() {
        EurekaJ.store.commit();
    }
});

EurekaJ.AdministrationMenuAdminController = Ember.ArrayController.extend({
    needs: ['administrationMenu'],

    doCommitMenu: function(router) {
        $("#menuAdminConfirmDialog").modal({show: true});
    },

    doCancelDeletion: function(router) {
        $("#menuAdminConfirmDialog").modal('hide');
    },

    doConfirmDeletion: function(router) {
        var selectedNodes = this.get('controllers.administrationMenu.selectedNodes');
        selectedNodes.forEach(function(node) {
            node.deleteRecord();
        });
        this.get('controllers.administrationMenu').deselectAllNodes();
        EurekaJ.store.commit();
        $("#menuAdminConfirmDialog").modal('hide');
    }
}),

EurekaJ.AdministrationView = Ember.View.extend({
    elementId: 'mainContentArea'
});

EurekaJ.AdministrationAlertsView = Ember.View.extend({
    elementId: 'alertTabView'
});

Ember.TEMPLATES['administration'] = Ember.Handlebars.compile('' +
    '<div><h1>EurkeaJ Administration</h1></div>' +
    '{{view EurekaJ.TabView controllerBinding="this"}}' +
    '{{outlet}}'
);

Ember.TEMPLATES['administration/alerts'] = Ember.Handlebars.compile('' +
    '{{view Ember.View templateName="adminAlertLeftMenu"}}'
);

Ember.TEMPLATES['administration/chartGroups'] = Ember.Handlebars.compile('' +
    '<div id="adminTabLeftMenu">' +
        '{{view Ember.TextField valueBinding="newChartGroupName" classNames="input-medium search-query mediumTopPadding"}}' +
        '<button class="btn" {{action createNewChartGroup}}>Add</button>' +
        '{{view EurekaJ.SelectableListView labelPropertyName="id" listItemsBinding="controller.content" deleteAction="deleteSelectedChartGroup" selectedItemBinding="controller.selectedItem"}}' +
    '</div>' +

    '{{#if selectedItem}}<div id="adminTabRightContent">' +
        '<h1>{{selectedItem.id}}</h1>' +
        '<table class="table adminTable">' +
        '<tr>' +
            '<td style="width: 150px;">Select nodes:</td>' +
            '<td>' +
                '{{controllers.administrationMenu.length}}<div style="max-height: 250px; min-height: 250px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
                '{{view EurekaJ.TreeView itemsBinding="controllers.administrationMenu.rootNodes"}}' +
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
    '{{view EurekaJ.ConfirmDialogView elementId="chartGroupConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="controller" header="Delete Chart Group?" message="Are you sure you want to delete the selected chart group? This action will permanently remove the menu items from the system. This action cannot be undone!"}}' +
    '{{view EurekaJ.ConfirmDialogView elementId="chartGroupPathsConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelPathDeletion" okButtonLabel="Delete" okAction="doConfirmPathDeletion" target="controller" header="Delete Chart Group Path?" message="Are you sure you want to delete the selected chart group path? This action will permanently remove the menu items from the system. This action cannot be undone!"}}'
);

Ember.TEMPLATES['administration/emailRecipients'] = Ember.Handlebars.compile('' +
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
    '{{view EurekaJ.ConfirmDialogView elementId="emailGroupConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="controller" header="Delete Email Group?" message="Are you sure you want to delete the selected email group? This action will permanently remove the menu items from the system. This action cannot be undone!"}}' +
    '{{view EurekaJ.ConfirmDialogView elementId="emailAddressConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelAddressDeletion" okButtonLabel="Delete" okAction="doConfirmAddressDeletion" target="controller" header="Delete Email Address?" message="Are you sure you want to delete the selected email address? This action will permanently remove the menu items from the system. This action cannot be undone!"}}'
);

Ember.TEMPLATES['administration/menuAdmin'] = Ember.Handlebars.compile('' +
    '<div class="fullWidth">' +
        '<h1>Delete Menu Items</h1>' +
        '<table class="table adminTable">' +
        '<tr>' +
            '<td style="width: 150px;">Main Menu:</td>' +
            '<td><div style="max-height: 350px; overflow: scroll; width: 100%" class="azureBlueBackground azureBlueBorderThin">' +
            '{{view EurekaJ.TreeView itemsBinding="controllers.administrationMenu.rootNodes" allowSelectionOfNonLeafNodes="true"}}<div>&nbsp;</div>' +
        '</div></td>' +
        '</tr>' +
        '<tr>' +
            '<td colspan="2"><button {{action doCommitMenu}} class="btn" style="width: 100%;">Delete Selected Menu Items</button></td>' +
        '</tr>' +
        '</table>'+
    '</div>' +
    '{{view EurekaJ.ConfirmDialogView elementId="menuAdminConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="controller" header="Delete Tree Menu Items?" message="Are you sure you want to delete the selected items? This action will permanently remove the menu items from the system. This action cannot be undone!"}}'
);

Ember.TEMPLATES['adminAlertLeftMenu'] = Ember.Handlebars.compile('' +
    '<div id="adminTabLeftMenu">' +
        '{{view Ember.TextField valueBinding="newAlertName" classNames="input-medium search-query mediumTopPadding"}}' +
            '<button class="btn" {{action createNewAlert}}>Add</button>' +
        '{{view EurekaJ.SelectableListView listItemsBinding="content" deleteAction="deleteSelectedAlert" selectedItemBinding="controller.selectedItem"}}' +
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
            '<td>{{view EurekaJ.Select classNames="input-medium" valueBinding="selectedItem.alertType" contentBinding="alertTypes" optionLabelPath="content.value" optionValuePath="content.key"}}</td>' +
            '<td>Alert Delay:</td>' +
            '<td>{{view Ember.TextField valueBinding="selectedItem.alertDelay" classNames="input-mini"}}</td>' +
        '</tr>' +
        '<tr>' +
            '<td>Alert Source:</td>' +
            '<td colspan="3">' +

            '<div>{{#if selectedItem.alertSource}}{{selectedItem.alertSource}}{{else}}None Selected{{/if}}</div>' +
            '<div style="max-height: 250px; overflow: scroll; margin-bottom: 15px;" class="azureBlueBackground azureBlueBorderThin">' +
                '{{view EurekaJ.SelectableLeafTreeView itemsBinding="controllers.administrationMenu.rootNodes" selectedItemBinding="selectedItem.alertSource"}}' +
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
    '{{view EurekaJ.ConfirmDialogView elementId="adminAlertConfirmDialog" cancelButtonLabel="Cancel" cancelAction="doCancelAlertDeletion" okButtonLabel="Delete" okAction="doConfirmDeletion" target="controller" header="Delete Alert?" message="Are you sure you want to delete the selected alert? This action will permanently remove the alert from the system. This action cannot be undone!"}}'
);