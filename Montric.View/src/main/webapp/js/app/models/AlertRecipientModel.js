Montric.AlertRecipient = DS.Model.extend({
    accountName: DS.attr('string'),
    pluginName: DS.attr('string'),
    recipients: DS.attr('raw'),

    selectedRecipients: []
});