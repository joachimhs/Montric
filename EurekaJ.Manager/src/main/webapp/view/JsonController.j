@import <Foundation/CPObject.j>

@implementation JsonController : CPObject {
	
}

//- (@action) clickJsonButton:(id)sender {
- (void) sendJSON:(CPString)jsonObjectString delegate:(id) aDelegate {
    //var content = [CPString JSONFromObject:myFirstJSONObject];
    var contentLength = [[CPString alloc] initWithFormat:@"%d", [jsonObjectString length]];

	CPLog.debug("Sending JSON: %@", jsonObjectString);

    var request = [[CPURLRequest alloc] initWithURL:@"http://localhost:8081/jsonController.capp"];
    [request setHTTPMethod:@"POST"]; 
    [request setHTTPBody:jsonObjectString]; 
    [request setValue:contentLength forHTTPHeaderField:@"Content-Length"]; 
    [request setValue:"text/plain;charset=UTF-8" forHTTPHeaderField:@"Content-Type"]; 
    postConnection = [CPURLConnection connectionWithRequest:request delegate:aDelegate]; 
	
}

@end