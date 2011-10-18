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
EurekaJView.EmailRecipientModel = SC.Record.extend(
/** @scope EurekaJView.AlertModel.prototype */ {

    primaryKey: 'emailAddress',
    emailAddress: SC.Record.attr(String)
});
