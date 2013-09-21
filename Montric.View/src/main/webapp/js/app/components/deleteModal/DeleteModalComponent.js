Montric.DeleteModalComponent = Ember.Component.extend({
    classNames: ["modal", "fade"],

    actions: {
        deleteItem: function() {
            var item = this.get('item');
            console.log('deleteItem: ' + item);
            if (item) {
                item.deleteRecord();
                item.save();
                $("#" + this.get('elementId')).modal('hide');
            }
        }
    }
});