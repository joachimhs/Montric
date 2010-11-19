// ==========================================================================
// Project:   EurekaJView.chartController
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
EurekaJView.chartController = SC.ArrayController.create(
/** @scope EurekaJView.chartController.prototype */ {

  	content: [
		SC.Object.create({label: 'set1', data:[[0,0]]}),
		SC.Object.create({label: 'set2', data:[[0,0]]})	
	],
	options: SC.Object.create({}),
	
	addRandomData: function() {
		var data = this.get('content').copy() ;
		data.objectAt(0).get('data').pushObject([data.objectAt(0).getPath('data.length') + 1, Math.random()*10]);
		data.objectAt(1).get('data').pushObject([data.objectAt(1).getPath('data.length') + 1, Math.random()*10]);
		this.set('content', data) ;
	}

});
