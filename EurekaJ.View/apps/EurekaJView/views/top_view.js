// ==========================================================================
// Project:   EurekaJView.ChartViewTwo
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.TopView = SC.View.extend(
{
	childViews: 'logoView administrationButtonView administrationLabelView'.w(),
	logoView: SC.ImageView.design({
        layout: {left: 10, width: 430, height: 60, top: 5},
        value: static_url('images/eurekaj_logo_w_text_60x60.png'),
        toolTip: 'EurekaJ Profiler',
    }),
    
    administrationButtonView: SC.ImageView.design(SCUI.SimpleButton, {
        layout: {right: 25, width: 49, height: 49, top: 5},
        value: static_url('images/ej_tools_49.png'),
        toolTip: 'Administration',
        action: 'showAdministrationPaneAction',
        isVisible: false
    }),

    administrationLabelView: SC.LabelView.design(SCUI.SimpleButton, {
        layout: {right: 10, width: 100, height: 25, top: 55},
        value: 'Administration',
        textAlign: SC.ALIGN_RIGHT,
        action: 'showAdministrationPaneAction',
        fontWeight: SC.BOLD_WEIGHT,
        isVisible: false
    }).classNames('greylabel')
	
});