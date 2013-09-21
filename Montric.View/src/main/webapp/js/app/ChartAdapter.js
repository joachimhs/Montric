Montric.ChartAdapter = DS.RESTAdapter.extend({
    find: function(store, type, id) {
        console.log('Montric.ChartAdapter find: ' + id);
        return this.ajax(this.buildURL(type.typeKey, id), 'GET');
    },

    buildURL: function(type, id) {
        var host = Ember.get(this, 'host'),
            namespace = Ember.get(this, 'namespace'),
            url = [];

        if (host) { url.push(host); }
        if (namespace) { url.push(namespace); }

        url.push(Ember.String.pluralize(type));
        if (id) { url.push(id); }

        url = url.join('/');
        if (!host) { url = '/' + url; }

        var queryString = this.buildQueryString();

        return url + queryString;
    },

    buildQueryString: function() {
        var queryString = "?tz=" + Montric.get('selectedTimezone');
        if (Montric.get('showLiveCharts')) {
            queryString += "&ts=" + Montric.get('selectedChartTimespan');
        } else {
            queryString += "&chartFrom=" + Montric.get('selectedChartFromMs');
            queryString += "&chartTo=" + Montric.get('selectedChartToMs');
        }
        queryString += "&rs=" + Montric.get('selectedChartResolution');

        return queryString;
    }
});