Montric.ChartGroupModel = DS.Model.extend({
    chartGroupPath: DS.attr('string'),
    chartGroups: function() {
        var groups = [];
        var returnGroups = [];

        if (this.get('chartGroupPath') && this.get('chartGroupPath').length >= 2) {
            groups = jQuery.parseJSON(this.get('chartGroupPath'));
        }

        console.log(groups);
        groups.forEach(function(group) {
            returnGroups.pushObject(Ember.Object.create({id: group}))
        });

        return returnGroups;
    }.property('chartGroupPath')
});