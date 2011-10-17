var set = SC.set, get = SC.get;

// TODO: Be explicit in the class documentation that you
// *MUST* set the value of a checkbox through SproutCore.
// Updating the value of a checkbox directly via jQuery objects
// will not work.

EurekaJView.Checkbox = SC.View.extend({
  title: null,
  value: false,
  icon: null,

  classNames: ['sc-checkbox'],

  defaultTemplate: SC.Handlebars.compile('<label><input type="checkbox" {{bindAttr checked="value"}}><img {{bindAttr src="icon"}} />{{title}}</label>'),

  change: function() {
    SC.run.once(this, this._updateElementValue);
    // returning false will cause IE to not change checkbox state
  },

  _updateElementValue: function() {
    var input = this.$('input:checkbox');
    set(this, 'value', input.prop('checked'));
  }
});
