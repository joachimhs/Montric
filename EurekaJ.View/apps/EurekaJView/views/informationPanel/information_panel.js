// ==========================================================================
// Project:   EurekaJView.AdministrationPaneView
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

        (Document Your View Here)

 @extends SC.View
 */
sc_require('views/calendar')
EurekaJView.InformationPanelView = SC.View.extend(
/** @scope EurekaJView.AdministrationPaneView.prototype */ {
    defaultResponder: EurekaJView,
    childViews: 'informationPanelTabView triggeredAlertHeadlineLabelView triggeredAlertScrollView'.w(),
    isVisible: NO,

    informationPanelTabView: SC.TabView.design({
        layout: {
            top: 0,
            height: 200,
            left: 5,
            right: 5
        },
        nowShowing: 'EurekaJView.LiveStatisticsOptionsView',
        itemTitleKey: 'title',
        itemValueKey: 'value',
        // itemActionKey: 'action',
        items: [
            {action: 'testAction', title: 'Live', value: 'EurekaJView.LiveStatisticsOptionsView'},
            {action: 'testAction', title: 'Historical', value: 'EurekaJView.HistoricalStatisticsOptionsView'}
        ]

    }),

    triggeredAlertHeadlineLabelView: SC.LabelView.design({
        layout: {
            centerY: 0,
            centerX: 0,
            height: 30,
            top: 210,
            left: 5,
            right: 5
        },
        controlSize: SC.REGULAR_CONTROL_SIZE,
        fontWeight: SC.BOLD_WEIGHT,
        textAlign: SC.ALIGN_CENTER,
        value: 'TRIGGERED ALERTS'
    }).classNames(['greylabel', 'underlined']),

    triggeredAlertScrollView: SC.ScrollView.design({
        layout: {
            top: 230,
            bottom: 25,
            left: 5,
            right: 5
        },

        contentView: SC.TableView.design({
            layout: {
                width: 450
            },
            exampleView: SC.TableRowView,
            recordType: EurekaJView.TriggeredAlertModel,
            contentBinding: 'EurekaJView.triggeredAlertListController.arrangedObjects',
            
            columns: [
                      SC.TableColumn.create({
                          key: 'formattedTriggeredDate',
                          label: 'Triggered Date',
                          width: 100
                      }),
                      SC.TableColumn.create({
                          key: 'alertType',
                          label: 'Alert Type',
                          width: 75
          			}),
          			SC.TableColumn.create({
                          key: 'triggeredValue',
                          label: 'Triggered Value',
                          width: 75
          			}),
          			SC.TableColumn.create({
                        key: 'alertName',
                        label: 'Alert Name',
                        width: 75
        			})
                   ]
        })


    })

});
