Montric.ChartGroup = DS.Model.extend({
    chartGroups: DS.hasMany('adminMenu'),
    selectedChartGroups: []
});