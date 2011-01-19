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
EurekaJView.EmailGroupModel = SC.Record.extend(
/** @scope EurekaJView.AlertModel.prototype */ {

    primaryKey: 'emailGroupName',
    emailGroupName: SC.Record.attr(String),
    smtpHost: SC.Record.attr(String),
    smtpUsername: SC.Record.attr(String),
    smtpPassword: SC.Record.attr(String),
    smtpPort: SC.Record.attr(Number),
    smtpUseSSL: SC.Record.attr(Boolean),
    emailAddresses: SC.Record.toMany('EurekaJView.EmailGroupModel', {isMaster: YES })
}) ;
