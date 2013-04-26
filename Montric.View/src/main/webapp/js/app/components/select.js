EurekaJ.Select = Ember.Select.extend({
    //JHS: The following overrides the Ember.Select code. Fixes a bug in 1.0-pre
    //where the selection would always be the first item in the list when the
    //view is first rendered. This will be fixed in 1.0-final
    _triggerChange: function() {
        var selection = this.get('selection');
        var value = this.get('value');

        if (selection) { this.selectionDidChange(); }
        if (value) { this.valueDidChange(); }

        this._change();
    }
});