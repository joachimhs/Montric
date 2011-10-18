var EurekaJView = SC.Application.create({
	EurekaJStore: SC.Store.create({commitRecordsAutomatically: NO}).from('EurekaJView.EurekaJDataSource'),
});

Flot = SC.Object.create(
  /** @scope Flot.prototype */ {

  NAMESPACE: 'Flot',
  VERSION: '0.1.0',

  // TODO: Add global constants or singleton objects needed by your app here.

  /** @note Hook up jQuery.plot */
  plot: $.plot

}) ;