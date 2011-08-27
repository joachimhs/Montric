/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.userController = SC.ObjectController.create(
        /** @scope EurekaJView.administrationPaneController.prototype */ {

            username: null,
            userRole: null,

            isAdmin: function() {
                SC.Logger.log('userRole: ' + this.get('userRole'));

                if (this.get('userRole') != null && this.get('userRole') == 'admin') {
                    return YES;
                } else {
                    return NO;
                }
            }.property().cacheable(),

            observesUserRole: function() {
                if (this.get('isAdmin')) {
                    EurekaJView.mainPage.get('topView').get('administrationButtonView').set('isVisible', YES);
                    EurekaJView.mainPage.get('topView').get('administrationLabelView').set('isVisible', YES);
                }
            }.observes('userRole')
        });
