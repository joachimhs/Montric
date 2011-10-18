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

        administrationToolbarView: SC.ToolbarView.extend({
            childViews: 'labelView'.w(),
            layout: {top: 0, left: 0, right: 0, height: 40 },
            anchorLocation: SC.ANCHOR_TOP,

            labelView: SC.LabelView.extend({
                layout: {centerY: 0, centerX:0, height: 40, top: 10, width: 250 },
                controlSize: SC.LARGE_CONTROL_SIZE,
                fontWeight: SC.BOLD_WEIGHT,
                value: 'EurekaJ Administration'
            }).classNames('whitelabel')
        }),

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
                {title: 'Email Recipients', value: 'EurekaJView.EmailRecipientsAdministrationView'},
                {title: 'Instrumentation Menu', value: 'EurekaJView.TreeMenuAdministrationView'}
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
