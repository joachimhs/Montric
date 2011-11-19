// ==========================================================================
// Project:   EurekaJView.AlertPluginModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.AlertPluginModel = SC.Record.extend(
/** @scope EurekaJView.AlertModel.prototype */ {

    primaryKey: 'alertPluginName',
    alertPluginName: SC.Record.attr(String)
});
