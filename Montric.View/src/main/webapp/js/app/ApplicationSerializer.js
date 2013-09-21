Montric.ApplicationSerializer = DS.RESTSerializer.extend({});

Montric.RawTransform = DS.Transform.extend({
    deserialize: function(serialized) {
        return serialized;
    },
    serialize: function(deserialized) {
        return deserialized;
    }
});