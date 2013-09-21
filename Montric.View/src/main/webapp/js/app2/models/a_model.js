Montric.Model = Ember.Object.extend();

Montric.Model.reopenClass({
    find: function(url, id, type, key) {
        console.log('find: ' + type + " id: " + id);
        var foundItem = this.contentArrayContains(id, type);

        if (!foundItem) {
            foundItem = type.create({ id: id, isLoaded: false});
            $.getJSON(url + "/" +  id, function(data) {
                if (data[key]) {
                    foundItem.setProperties(data[key]);
                    foundItem.set('isLoaded', true);
                    foundItem.set('isError', false);
                }
            });
            Ember.get(type, 'collection').pushObject(foundItem);
        }

        console.log('found: ' + foundItem.get('id'));
        return foundItem;
    },

    refresh: function(url, id, type, key) {
        console.log('refresh: ' + type + " id: " + id);
        var foundItem = this.contentArrayContains(id, type);
        console.log(foundItem);
        if (foundItem) {
            foundItem.set('isLoaded', false);
            $.getJSON(url + "/" +  id, function(data) {
                if (data[key]) {
                    foundItem.setProperties(data[key]);
                    foundItem.set('isLoaded', true);
                    foundItem.set('isError', false);
                }
            });
        }
    },

    contentArrayContains: function(id, type) {
        var contains = null;

        Ember.get(type, 'collection').forEach(function(item) {
            if (item.get('id') === id) {
                contains = item;
            }
        });

        return contains;
    },

    findAll: function(url, type, key) {
        console.log('findAll: ' + type + " " + url + " " + key);

        var collection = this;
        $.getJSON(url, function(data) {
            $.each(data[key], function(i, row) {
                var item = collection.contentArrayContains(row.id, type);
                if (!item) {
                    item =  type.create();
                    Ember.get(type, 'collection').pushObject(item);
                }
                item.setProperties(row);
                item.set('isLoaded', true);
                item.set('isError', false);
            });
        });

        return Ember.get(type, 'collection');
    },

    delete: function(url, type, id) {
        console.log('delete: ' + type + " " + id);
        var collection = this;
        $.ajax({
            type: 'DELETE',
            url: url + "/" + id,
            success: function(res, status, xhr) {
                if(res.deleted) {
                    var item = collection.contentArrayContains(id, type);
                    if (item) {
                        Ember.get(type, 'collection').removeObject(item);
                    }
                }
            },
            error: function(xhr, status, err) { alert('Unable to delete: ' + status + " :: " + err); }
        });
    },

    createRecord: function(url, type, model) {
        console.log('save: ' + type + " " + JSON.stringify(model));
        var collection = this;
        model.set('isSaving', true);
        $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify(model),
            success: function(res, status, xhr) {
                if (res.id) {
                    Ember.get(type, 'collection').pushObject(model);
                    model.set('isSaving', false);
                } else {
                    model.set('isError', true);
                }
            },
            error: function(xhr, status, err) { model.set('isError', false);  }
        });

        return model;
    },

    updateRecord: function(url, type, model) {
        console.log('update: ' + type + " " + model.get('id'));
        var collection = this;
        model.set('isSaving', true);
        console.log(JSON.stringify(model));
        $.ajax({
            type: "PUT",
            url: url,
            data: JSON.stringify(model),
            success: function(res, status, xhr) {
                if (res.id) {
                    model.set('isSaving', false);
                    model.setProperties(res);
                } else {
                    model.set('isError', true);
                }
            },
            error: function(xhr, status, err) { model.set('isError', false);  }
        });
    }
});