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