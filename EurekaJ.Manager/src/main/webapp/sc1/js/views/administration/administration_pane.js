// ==========================================================================
// Project:   EurekaJView.AdministrationPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
EurekaJView.AdministrationPaneView = SC.SheetPane.extend(
    /** @scope EurekaJView.AdministrationPaneView.prototype */ {
    defaultResponder: EurekaJView,

    contentView: SC.View.extend({


        childViews: 'administrationContentView hideAdministrationPanelButtonView'.w(),
        layout: { top: 0, left: 0, bottom: 0, right: 0 },

        administrationContentView: SC.TabView.design({
            layout: {
                top: 10,
                bottom: 50,
                left: 10,
                right: 10
            },
            nowShowing: 'EurekaJView.AlertAdministrationView',
            itemTitleKey: 'title',
            itemValueKey: 'value',
            items: [
                {title: 'Alerts', value: 'EurekaJView.AlertAdministrationView'},
                {title: 'Chart Groups', value: 'EurekaJView.InstrumentationGroupsAdministrationView'},
                {title: 'Email Recipients', value: 'EurekaJView.EmailRecipientsAdministrationView'}
                //{title: 'Instrumentation Menu', value: 'EurekaJView.TreeMenuAdministrationView'}
            ]

        }),

        hideAdministrationPanelButtonView: SC.ButtonView.extend({
            layout: {
                width: 80,
                bottom: 20,
                height: 24,
                centerX: 0
            },
            title: "Close",
            action: "hideAdministrationPaneAction"
        })
    })

});
