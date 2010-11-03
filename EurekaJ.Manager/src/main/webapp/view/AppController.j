@import <Foundation/CPObject.j>
@import "InstrumentationController.j"
@import "InstrumentationViewDataSourceObject.j"

@implementation AppController : CPObject {
    @outlet CPWindow    theWindow; //this "outlet" is connected automatically by the Cib
	CPViewController	bottomViewController;
	@outlet CPView		bottomContentsView;
	@outlet CPView		topButtonView;
}

- (void)awakeFromCib {
	CPLogRegister(CPLogConsole);
	
    /*var theWindow = [[CPWindow alloc] initWithContentRect:CGRectMakeZero() styleMask:CPBorderlessBridgeWindowMask],
    contentView = [theWindow contentView];
	
	[self setupTabView:contentView]
	
	[theWindow orderFront:self];
	
	[self clickJsonButton];*/
	
}

- (void)applicationDidFinishLaunching:(CPNotification)aNotification {
		[CPMenu setMenuBarVisible:NO];
}

- (@action)topMenuButtonClick:(id)sender {
	CPLog.debug("TopMenuButton Clicked");
	
	//for (subView in [bottomContentsView subviews]) {
	//	CPLog.debug("Attempting to remove subview: %@", subView);
	//    [subView removeFromSuperview];
	//}
	
	var cibName;
	
	if ([bottomViewController view]) {
		[[bottomViewController view] removeFromSuperview];
	}
	
	switch([sender tag]) {
		case "instrumentationButton":
			cibName = "InstrumentationView";
			break;
	}
	
	CPLog.debug("Loading view:%@", cibName);
	bottomViewController = [[CPViewController alloc] initWithCibName:cibName bundle:nil];
	[[bottomViewController view] setFrame: [bottomContentsView bounds]];
	[bottomContentsView addSubview:[bottomViewController view]];
	CPLog.debug("Number of subviews: %@", [[bottomContentsView subviews] count]);
}


//- (@action) clickJsonButton:(id)sender {
- (void) clickJsonButton {
    var myFirstJSONObject = { "sliderValue" : 1 }

    var content = [CPString JSONFromObject:myFirstJSONObject];
    var contentLength = [[CPString alloc] initWithFormat:@"%d", [content length]];

    var request = [[CPURLRequest alloc] initWithURL:@"http://localhost:8081/JSONServlet"];
    [request setHTTPMethod:@"POST"]; 
    [request setHTTPBody:content]; 
    [request setValue:contentLength forHTTPHeaderField:@"Content-Length"]; 
    [request setValue:"text/plain;charset=UTF-8" forHTTPHeaderField:@"Content-Type"]; 
    postConnection = [CPURLConnection connectionWithRequest:request delegate:self]; 
}

@end
