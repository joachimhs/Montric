// ==========================================================================
// Project:   EurekaJView.administrationPaneController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your Controller Here)

 @extends SC.Object
 */
EurekaJView.administrationPaneController = SC.ObjectController.create(
    /** @scope EurekaJView.administrationPaneController.prototype */ {

    administrationPane : null,
    alertTypes: [
        {'typeName': 'Greater Than', 'alertType': 'greater_than'},
        {'typeName': 'Equals', 'alertType': 'equals'},
        {'typeName': 'Less Than', 'alertType': 'less_than'}
    ],
    instrumentationSourceNodes: null,

    showAdministrationPane: function(view) {
        var pane = SC.SheetPane.create({
            layout: { width: 700, centerX: 0, height: 500 },
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
                        {title: 'Instrumentation Groups', value: 'EurekaJView.InstrumentationGroupsAdministrationView'},
                        {title: 'Email Recipients', value: 'EurekaJView.EmailRecipientsAdministrationView'}
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
                    action: "remove",
                    target: "EurekaJView.administrationPaneController.administrationPane"
                })
            })
        })
        pane.append();
        this.set('administrationPane', pane);
        EurekaJView.EurekaJStore.find(EurekaJView.ALERTS_QUERY);
        EurekaJView.alertAdministrationController.updateAlerts();
    }
});
