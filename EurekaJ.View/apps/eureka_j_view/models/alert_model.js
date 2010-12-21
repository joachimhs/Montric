// ==========================================================================
// Project:   EurekaJView.AlertModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.AlertModel = SC.Record.extend(
/** @scope EurekaJView.AlertModel.prototype */ {

    primaryKey: 'alertName',
    alertName: SC.Record.attr(String),
    alertActivated: SC.Record.attr(Boolean),
    alertInstrumentationNode: SC.Record.attr(String),//SC.Record.toOne('EurekaJView.InstrumentationTreeModel', {isMaster: YES }),
    alertWarningValue: SC.Record.attr(Number),
    alertErrorValue: SC.Record.attr(Number),
    alertType: SC.Record.attr(String),
    alertDelay: SC.Record.attr(Number)
}) ;
