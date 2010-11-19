// ==========================================================================
// Project:   EurekaJView.InstrumentationTree Fixtures
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals EurekaJView */

sc_require('models/instrumentation_type');

EurekaJView.instrumentationTypeTree.FIXTURES = [

  // TODO: Add your data fixtures here.
  // All fixture records must have a unique primary key (default 'guid').  See 
  // the example below.

   { 	guid: 1,
     	name: "A",
     	isSelected: true,
 	 	parentPath: null,
	 	guiPath: "A",
	 	treeItemIsExpanded: NO},
  	
	{ 	guid: 2,
	  	name: "B",
	  	isSelected: false,
 	 	parentPath: "A",
		guiPath: "A:B",
	 	treeItemIsExpanded: NO },
	
	{ 	guid: 3,
	  	name: "C",
	  	isSelected: false,
 	 	parentPath: "A",
		guiPath: "A:C",
	 	treeItemIsExpanded: NO },
		
	{ 	guid: 4,
	  	name: "D",
	  	isSelected: false,
 	 	parentPath: "A:B",
		guiPath: "A:B:D",
	 	treeItemIsExpanded: NO },
			
	{ 	guid: 5,
	  	name: "E",
	  	isSelected: false,
 	 	parentPath : "A:B",
		guiPath: "A:B:E",
	 	treeItemIsExpanded: NO },
				
	{ 	guid: 6,
	  	name: "F",
	  	isSelected: false,
 	 	parentPath: "A:B:E",
		guiPath: "A:B:E:F",
	 	treeItemIsExpanded: NO }

];
