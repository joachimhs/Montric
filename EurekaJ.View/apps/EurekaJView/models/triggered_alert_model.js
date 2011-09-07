// ==========================================================================
// Project:   EurekaJView.TriggeredAlertModel
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
EurekaJView.TriggeredAlertModel = SC.Record.extend(
/** @scope EurekaJView.TriggeredAlertModel.prototype */ {

    primaryKey: 'generatedID',
    generatedID: SC.Record.attr(Number),
    alertName: SC.Record.attr(String),
    triggeredDate: SC.Record.attr(Number),
    errorValue: SC.Record.attr(Number),
    warningValue: SC.Record.attr(Number),
    triggeredValue: SC.Record.attr(Number),
    
    formattedTriggeredDate: function() {
    	var datetime = SC.DateTime.create(this.get('triggeredDate'));
    	return datetime.toFormattedString("%d/%m/%Y %H:%M:%S");
    }.property('triggeredDate'),
    
    alertType: function() {
    	var alertType = 'NORMAL';
        if (this.get('triggeredValue') >= this.get('errorValue')) {
            alertType = 'CRITICAL';
        } else if (this.get('triggeredValue') >= this.get('warningValue')) {
            alertType = 'WARNING';
        }
        
        return alertType;
    }.property('triggeredValue'),
    
    summaryContent: function() {
        var datetime = SC.DateTime.create(this.get('triggeredDate'));
        var alertType = this.get('alertType');
        return  this.get('alertName') + ' ' + alertType + " " + datetime.toFormattedString("%d/%m/%Y %H:%M:%S") + " " + this.get('errorValue') + " " + this.get('warningValue') + " " + this.get('triggeredValue');
    }.property('generatedID').cacheable()
}) ;
