// ==========================================================================
// Project:   EurekaJView.UserModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.UserModel = SC.Record.extend(
/** @scope EurekaJView.UserModel.prototype */ {

    primaryKey: 'username',
    username: SC.Record.attr(String),
    userRole: SC.Record.attr(String)
});
