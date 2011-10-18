EurekaJView.InstrumentationTreeController = SC.ArrayProxy.create({
	
	observesContent: function() {
		SC.Logger.log(this.get('content'))
	}.observes('content')
});