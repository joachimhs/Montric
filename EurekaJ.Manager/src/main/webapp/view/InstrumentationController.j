@import <Foundation/CPObject.j>
@import "InstrumentationViewDataSourceObject.j"
@import "JsonController.j"

@implementation InstrumentationController : CPObject {
	@outlet CPView						instrumentationView;
	@outlet CPView						instrumentationContentsView;
	CPOutlineView						outlineView;
	JsonController						jsonController;
	CPDictionary						menuDict;
	InstrumentationViewDataSourceObject	menuDataSource;
}

- (InstrumentationView)instrumentationView {
	return instrumentationView;
}

- (instrumentationContentsView)instrumentationContentsView {
	return instrumentationContentsView;
}

- (void)awakeFromCib {
	CPLog.debug("InstrumentationController awakeFromCib");
	[[CPNotificationCenter defaultCenter]
	    addObserver:self
	    selector:@selector(outlineViewSelectionDidChange:)
	    name:CPOutlineViewSelectionDidChangeNotification
	    object:nil];
	
	jsonController = [[JsonController alloc] init];
	var instrumentationMenuJsonObject = { "getInstrumentationMenu" : true };
	//menuDict = [jsonController sendJSON:[CPString JSONFromObject:instrumentationMenuJsonObject] delegate:self];
	
	[self setupInstrumentationView];
	
	//menuDict = [CPDictionary dictionaryWithObjects:[[@"glossary 1"], [@"proj 1", @"proj 2", @"proj 3"]] forKeys:[@"Glossaries", @"Projects"]];
	var myFirstJSONObject = { "Instrumentations" : [["a", "b"], ["c", "d"]]}
	menuDict = [CPDictionary dictionaryWithJSObject:myFirstJSONObject recursively:YES];
	
	[outlineView setDataSource:[[InstrumentationViewDataSourceObject alloc] initWithDict:menuDict]];
}

//Handle XHR Response
-(void)connection:(CPURLConnection)connection didReceiveData:(CPString)data {
	CPLog.debug("Received JSON Data. %@", data);
	var dict = [CPDictionary dictionaryWithJSObject:[data objectFromJSON]];
	[self handleXhrResponse:dict];
}

- (void)handleXhrResponse:(CPDictionary) aDict {
	[outlineView setDataSource:[[InstrumentationViewDataSourceObject alloc] initWithDict:aDict]];
}

- (void)outlineViewSelectionDidChange:(CPNotification)notification {
	var outlineView = [notification object];
	var selectedRow = [[outlineView selectedRowIndexes] firstIndex];
	var item = [outlineView itemAtRow:selectedRow];
	
	if (item) {
	    // code for loading cibs into contentView		
		CPLog.debug("New tree item clicked: %@", item);
	}
}

- (void)setupInstrumentationView {
	var navigationArea = [[CPView alloc] initWithFrame:CGRectMake(0.0, 0.0, CGRectGetWidth([instrumentationView bounds]), CGRectGetHeight([instrumentationView bounds]))];
	
	// This view will grow in height, but stay fixed width attached to the left side of the screen.
    [navigationArea setAutoresizingMask:CPViewHeightSizable | CPViewMaxXMargin];
	
	[instrumentationView addSubview:navigationArea];
	[self setupInstrumentationTree]
	
	var contentArea = [[CPView alloc] initWithFrame:CGRectMake(0.0, 0.0, CGRectGetWidth([instrumentationContentsView bounds]), CGRectGetHeight([instrumentationContentsView bounds]))];
    
 //   [contentArea setBackgroundColor:[CPColor blueColor]];
    
    // This view will grow in both height an width.
    [contentArea setAutoresizingMask:CPViewWidthSizable | CPViewHeightSizable];
    
    [instrumentationContentsView addSubview:contentArea];
}

- (void)setupInstrumentationTree {
	var scrollView = [[CPScrollView alloc] initWithFrame:CGRectMake(0.0, 0.0, CGRectGetWidth([instrumentationView bounds]), CGRectGetHeight([instrumentationView bounds]))];
    [scrollView setAutohidesScrollers:NO];
	[scrollView setAutoresizingMask:CPViewWidthSizable | CPViewHeightSizable];
    
	outlineView = [[CPOutlineView alloc] initWithFrame:[[scrollView contentView] bounds]];
	[outlineView setDataSource:[[InstrumentationViewDataSourceObject alloc] init]];
	
    [outlineView setBackgroundColor:[CPColor colorWithHexString:@"e0ecfa"]];

    var textColumn = [[CPTableColumn alloc] initWithIdentifier:@"TextColumn"];
    [textColumn setWidth:250.0];
    [outlineView setRowHeight:24.0];

    [outlineView setCornerView:nil];
	[outlineView setHeaderView:nil];

    [outlineView addTableColumn:textColumn];
    [outlineView setOutlineTableColumn:textColumn];

	//[outlineView setDelegate:[[BDOutlineViewDelegateObject alloc] init]];
	//[outlineView setTarget:[[BDOutlineViewTargetObject alloc] init]];

	[outlineView setDoubleAction:@selector(myTableDoubleClickAction:)];

	[outlineView setAllowsMultipleSelection:YES];
	[outlineView setAllowsEmptySelection:YES];
	
	[outlineView setAutoresizingMask:CPViewWidthSizable | CPViewHeightSizable];

	[outlineView setAllowsColumnResizing:YES];
	[outlineView setColumnAutoresizingStyle:CPTableViewUniformColumnAutoresizingStyle];
	
	[scrollView setDocumentView:outlineView];
	[instrumentationView addSubview:scrollView];
}


@end