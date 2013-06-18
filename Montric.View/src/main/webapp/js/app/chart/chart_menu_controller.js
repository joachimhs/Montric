Montric.ChartMenuController = Ember.ArrayController.extend({
    needs: ['mainCharts'],
    contentBinding: 'controllers.mainCharts.rootNodes',
});