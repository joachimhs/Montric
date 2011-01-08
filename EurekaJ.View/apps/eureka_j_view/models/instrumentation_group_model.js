// ==========================================================================
// Project:   EurekaJView.InstrumentationGroupModel
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document your Model here)

 @extends SC.Record
 @version 0.1
 */
EurekaJView.InstrumentationGroupModel = SC.Record.extend(
    /** @scope EurekaJView.InstrumentationGroupModel.prototype */ {

    primaryKey: 'name',
    name: SC.Record.attr(String),
    instrumentationGroupPath: SC.Record.toMany('EurekaJView.AdminstrationTreeModel', {isMaster: YES })

});
