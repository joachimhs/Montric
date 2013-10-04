Montric.AccountModel = DS.Model.extend({
    accountType: DS.attr('string'),
    accessTokens: DS.attr('raw')
});