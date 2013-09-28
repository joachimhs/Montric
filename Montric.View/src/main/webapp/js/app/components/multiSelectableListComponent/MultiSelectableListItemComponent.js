Montric.MultiSelectableListItemComponent = Ember.Component.extend({
    classNameBindings: ['active'],

    click: function() {
        console.log('CLICK: ' + this.get('node'));

        var clickedId = this.get('node.id');

        if (!clickedId) {
            clickedId = this.get('node');
        }

        var selectedNodes = this.get('selectedNodes');

        var alreadyIsSelected = false;

        selectedNodes.forEach(function(selectedItem) {
            if (selectedItem === clickedId) {
                alreadyIsSelected = true;
            }
        });

        if (alreadyIsSelected) {
            selectedNodes.removeObject(clickedId);
        } else {
            console.log('pushing object: ' + clickedId);
            selectedNodes.pushObject(clickedId);
        }
    },

    active: function() {
        var isSelected = false;
        var id = this.get('node.id');

        if (!id) {
            id = this.get('node');
        }

        if (this.get('selectedNodes')) {
            this.get('selectedNodes').forEach(function(selectedItem) {
                if (selectedItem === id) {
                    isSelected = true;
                }
            });
        }

        return isSelected;
    }.property('selectedNodes.length', 'node.id')
});