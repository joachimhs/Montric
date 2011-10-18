// ==========================================================================
// Project:   EurekaJView.InstrumentationTableModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.InstrumentationTableModel = SC.Record.extend(
/** @scope EurekaJView.InstrumentationTableModel.prototype */
{

    primaryKey: 'columnId',
    columnId: SC.Record.attr(String),
    name: SC.Record.attr(String),
    value: SC.Record.attr(Number),

    listValue: function() {
        return this.get('name') + ' avg: ' + this.get('value');
    }.property()
});
