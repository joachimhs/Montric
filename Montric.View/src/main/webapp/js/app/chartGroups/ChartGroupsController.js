Montric.ChartGroupsController = Ember.ArrayController.extend({
    needs: 'admin',
    sortProperties: ['id'],
    sortAscending: true,

    actions: {
        createNewChartGroup: function () {
            if (this.newChartGroupIsValid()) {
                var newChartGroup = this.store.createRecord('chartGroup', {id: this.get('newChartGroupName')});
                newChartGroup.save();
                this.set('newChartGroupName', '');
            } else {
                Montric.log('New Chart Group Not Valid!');
            }
        }
    },

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

    resetSelectedNodes: function() {
        console.log('ChartGroupsController: resetSelectedNodes!!');
        this.get('controllers.admin').resetSelectedNodes();
    }
});