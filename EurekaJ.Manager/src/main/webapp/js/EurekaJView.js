var EurekaJView = SC.Application.create({
	EurekaJStore: SC.Store.create({commitRecordsAutomatically: NO}).from('EurekaJView.EurekaJDataSource'),
});