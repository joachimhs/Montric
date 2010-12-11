// javascript:/*globals%20EurekaJView%20*//**%20@class(Document%20Your%20View%20Here)@extends%20SC.View*/EurekaJView.ChartView%20=%20SC.View.extend(/**%20@scope%20EurekaJView.ChartView.prototype%20*/%20{contentDisplayProperties:%20%27label%27.w(),content:%20SC.LabelView.design({layout:%20{centerY:%200,%20height:%2030,%20top:%205,%20left:%2010%20},controlSize:%20SC.LARGE_CONTROL_SIZE,fontWeight:%20SC.REGULAR_WEIGHT,textAlign:%20SC.ALIGN_CENTER,valueBinding:%20this.get(%27%27),}),});
// ==========================================================================
// Project:   EurekaJView.ChartView
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
EurekaJView.ChartView = Flot.GraphView.extend(SC.Control,
/** @scope GridDemo.GridFlot.prototype */ {

	contentDidChange: function() {
		SC.Logger.log('chartView did change: ');
		var content = this.get('content');
		SC.Logger.log('content: ' + content);
		SC.Logger.log('label: ' + content.get('label'));
		SC.Logger.log('data: ' + content.get('data'));
		if (content.get('label') != null) {
			this.set('data', [content.get('data')]);
			this.set('label', content.get('label'));
			this.set('showTooltip', true);
		}
		//this.set('options', content.get('options'));
	},
	
	init: function() {
		arguments.callee.base.apply(this,arguments);
		this.contentDidChange();
	}

});; if ((typeof SC !== 'undefined') && SC && SC.scriptDidLoad) SC.scriptDidLoad('eureka_j_view');