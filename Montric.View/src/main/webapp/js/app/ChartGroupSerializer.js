Montric.ChartGroupSerializer = DS.RESTSerializer.extend({
    serialize: function(chartGroup, options) {
        var json = {
            chartGroups: chartGroup.get('chartGroups').mapProperty('id')
        }

        json.id = chartGroup.get('id');

        return json;
    }
});

/*

App.PostSerializer = DS.RESTSerializer.extend({
    serialize: function(post, options) {
        var json = {
            POST_TTL: post.get('title'),
            POST_BDY: post.get('body'),
            POST_CMS: post.get('comments').mapProperty('id')
        }

        if (options.includeId) {
            json.POST_ID_ = post.get('id');
        }

        return json;
    }

    */


