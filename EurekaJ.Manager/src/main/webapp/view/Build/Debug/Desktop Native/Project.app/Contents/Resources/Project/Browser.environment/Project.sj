@STATIC;1.0;p;15;AppController.jt;1958;@STATIC;1.0;I;21;Foundation/CPObject.ji;27;InstrumentationController.ji;37;InstrumentationViewDataSourceObject.jt;1839;

objj_executeFile("Foundation/CPObject.j", NO);
objj_executeFile("InstrumentationController.j", YES);
objj_executeFile("InstrumentationViewDataSourceObject.j", YES);

{var the_class = objj_allocateClassPair(CPObject, "AppController"),
meta_class = the_class.isa;class_addIvars(the_class, [new objj_ivar("theWindow"), new objj_ivar("bottomViewController"), new objj_ivar("bottomContentsView"), new objj_ivar("topButtonView")]);
objj_registerClassPair(the_class);
class_addMethods(the_class, [new objj_method(sel_getUid("awakeFromCib"), function $AppController__awakeFromCib(self, _cmd)
{ with(self)
{
 CPLogRegister(CPLogConsole);
}
},["void"]), new objj_method(sel_getUid("applicationDidFinishLaunching:"), function $AppController__applicationDidFinishLaunching_(self, _cmd, aNotification)
{ with(self)
{
  objj_msgSend(CPMenu, "setMenuBarVisible:", NO);
}
},["void","CPNotification"]), new objj_method(sel_getUid("topMenuButtonClick:"), function $AppController__topMenuButtonClick_(self, _cmd, sender)
{ with(self)
{
 CPLog.debug("TopMenuButton Clicked");
 var cibName;
 if (objj_msgSend(bottomViewController, "view")) {
  objj_msgSend(objj_msgSend(bottomViewController, "view"), "removeFromSuperview");
 }
 switch(objj_msgSend(sender, "tag")) {
  case "instrumentationButton":
   cibName = "InstrumentationView";
   break;
 }
 CPLog.debug("Loading view:%@", cibName);
 bottomViewController = objj_msgSend(objj_msgSend(CPViewController, "alloc"), "initWithCibName:bundle:", cibName, nil);
 objj_msgSend(objj_msgSend(bottomViewController, "view"), "setFrame:",  objj_msgSend(bottomContentsView, "bounds"));
 objj_msgSend(bottomContentsView, "addSubview:", objj_msgSend(bottomViewController, "view"));
 CPLog.debug("Number of subviews: %@", objj_msgSend(objj_msgSend(bottomContentsView, "subviews"), "count"));
}
},["@action","id"])]);
}

p;27;InstrumentationController.jt;5238;@STATIC;1.0;I;21;Foundation/CPObject.ji;37;InstrumentationViewDataSourceObject.ji;16;JsonController.jt;5130;

objj_executeFile("Foundation/CPObject.j", NO);
objj_executeFile("InstrumentationViewDataSourceObject.j", YES);
objj_executeFile("JsonController.j", YES);

{var the_class = objj_allocateClassPair(CPObject, "InstrumentationController"),
meta_class = the_class.isa;class_addIvars(the_class, [new objj_ivar("instrumentationView"), new objj_ivar("instrumentationContentsView"), new objj_ivar("jsonController")]);
objj_registerClassPair(the_class);
class_addMethods(the_class, [new objj_method(sel_getUid("instrumentationView"), function $InstrumentationController__instrumentationView(self, _cmd)
{ with(self)
{
 return instrumentationView;
}
},["InstrumentationView"]), new objj_method(sel_getUid("instrumentationContentsView"), function $InstrumentationController__instrumentationContentsView(self, _cmd)
{ with(self)
{
 return instrumentationContentsView;
}
},["instrumentationContentsView"]), new objj_method(sel_getUid("awakeFromCib"), function $InstrumentationController__awakeFromCib(self, _cmd)
{ with(self)
{
 CPLog.debug("InstrumentationController awakeFromCib");
 objj_msgSend(objj_msgSend(CPNotificationCenter, "defaultCenter"), "addObserver:selector:name:object:", self, sel_getUid("outlineViewSelectionDidChange:"), CPOutlineViewSelectionDidChangeNotification, nil);

 jsonController = objj_msgSend(objj_msgSend(JsonController, "alloc"), "init");
 var instrumentationMenuJsonObject = { "getInstrumentationMenu" : true };
 objj_msgSend(jsonController, "sendJSON:", objj_msgSend(CPString, "JSONFromObject:", instrumentationMenuJsonObject));
 objj_msgSend(self, "setupInstrumentationView");
}
},["void"]), new objj_method(sel_getUid("outlineViewSelectionDidChange:"), function $InstrumentationController__outlineViewSelectionDidChange_(self, _cmd, notification)
{ with(self)
{
 var outlineView = objj_msgSend(notification, "object");
 var selectedRow = objj_msgSend(objj_msgSend(outlineView, "selectedRowIndexes"), "firstIndex");
 var item = objj_msgSend(outlineView, "itemAtRow:", selectedRow);

 if (item) {

  CPLog.debug("New tree item clicked: %@", item);
 }
}
},["void","CPNotification"]), new objj_method(sel_getUid("setupInstrumentationView"), function $InstrumentationController__setupInstrumentationView(self, _cmd)
{ with(self)
{
 var navigationArea = objj_msgSend(objj_msgSend(CPView, "alloc"), "initWithFrame:", CGRectMake(0.0, 0.0, CGRectGetWidth(objj_msgSend(instrumentationView, "bounds")), CGRectGetHeight(objj_msgSend(instrumentationView, "bounds"))));


    objj_msgSend(navigationArea, "setAutoresizingMask:", CPViewHeightSizable | CPViewMaxXMargin);

 objj_msgSend(instrumentationView, "addSubview:", navigationArea);
 objj_msgSend(self, "setupInstrumentationTree")

 var contentArea = objj_msgSend(objj_msgSend(CPView, "alloc"), "initWithFrame:", CGRectMake(0.0, 0.0, CGRectGetWidth(objj_msgSend(instrumentationContentsView, "bounds")), CGRectGetHeight(objj_msgSend(instrumentationContentsView, "bounds"))));




    objj_msgSend(contentArea, "setAutoresizingMask:", CPViewWidthSizable | CPViewHeightSizable);

    objj_msgSend(instrumentationContentsView, "addSubview:", contentArea);
}
},["void"]), new objj_method(sel_getUid("setupInstrumentationTree"), function $InstrumentationController__setupInstrumentationTree(self, _cmd)
{ with(self)
{
 var scrollView = objj_msgSend(objj_msgSend(CPScrollView, "alloc"), "initWithFrame:", CGRectMake(0.0, 0.0, CGRectGetWidth(objj_msgSend(instrumentationView, "bounds")), CGRectGetHeight(objj_msgSend(instrumentationView, "bounds"))));
    objj_msgSend(scrollView, "setAutohidesScrollers:", NO);
 objj_msgSend(scrollView, "setAutoresizingMask:", CPViewWidthSizable | CPViewHeightSizable);

 var outlineView = objj_msgSend(objj_msgSend(CPOutlineView, "alloc"), "initWithFrame:", objj_msgSend(objj_msgSend(scrollView, "contentView"), "bounds"));

    objj_msgSend(outlineView, "setBackgroundColor:", objj_msgSend(CPColor, "colorWithHexString:", "e0ecfa"));

    var textColumn = objj_msgSend(objj_msgSend(CPTableColumn, "alloc"), "initWithIdentifier:", "TextColumn");
    objj_msgSend(textColumn, "setWidth:", 250.0);
    objj_msgSend(outlineView, "setRowHeight:", 24.0);

    objj_msgSend(outlineView, "setCornerView:", nil);
 objj_msgSend(outlineView, "setHeaderView:", nil);

    objj_msgSend(outlineView, "addTableColumn:", textColumn);
    objj_msgSend(outlineView, "setOutlineTableColumn:", textColumn);




 objj_msgSend(outlineView, "setDoubleAction:", sel_getUid("myTableDoubleClickAction:"));
 objj_msgSend(outlineView, "setDataSource:", objj_msgSend(objj_msgSend(InstrumentationViewDataSourceObject, "alloc"), "init"));

 objj_msgSend(outlineView, "setAllowsMultipleSelection:", YES);
 objj_msgSend(outlineView, "setAllowsEmptySelection:", YES);

 objj_msgSend(outlineView, "setAutoresizingMask:", CPViewWidthSizable | CPViewHeightSizable);

 objj_msgSend(outlineView, "setAllowsColumnResizing:", YES);
 objj_msgSend(outlineView, "setColumnAutoresizingStyle:", CPTableViewUniformColumnAutoresizingStyle);

 objj_msgSend(scrollView, "setDocumentView:", outlineView);
 objj_msgSend(instrumentationView, "addSubview:", scrollView);
}
},["void"])]);
}

p;37;InstrumentationViewDataSourceObject.jt;3057;@STATIC;1.0;t;3038;

{var the_class = objj_allocateClassPair(CPObject, "InstrumentationViewDataSourceObject"),
meta_class = the_class.isa;class_addIvars(the_class, [new objj_ivar("root")]);
objj_registerClassPair(the_class);
class_addMethods(the_class, [new objj_method(sel_getUid("init"), function $InstrumentationViewDataSourceObject__init(self, _cmd)
{ with(self)
{
 self = objj_msgSendSuper({ receiver:self, super_class:objj_getClass("InstrumentationViewDataSourceObject").super_class }, "init");
 items = objj_msgSend(CPDictionary, "dictionaryWithObjects:forKeys:", [["glossary 1"], ["proj 1", "proj 2", "proj 3"]], ["Glossaries", "Projects"]);
 return self
}
},["void"]), new objj_method(sel_getUid("outlineView:child:ofItem:"), function $InstrumentationViewDataSourceObject__outlineView_child_ofItem_(self, _cmd, outlineView, index, item)
{ with(self)
{
    CPLog("outlineView:%@ child:%@ ofItem:%@", outlineView, index, item);

    if (item === nil) {
        var keys = objj_msgSend(items, "allKeys");
        CPLog.debug("Returnung for root: %@", objj_msgSend(keys, "objectAtIndex:", index));
        return objj_msgSend(keys, "objectAtIndex:", index);
    } else {
        var values = objj_msgSend(items, "objectForKey:", item);
        CPLog.debug("Returning for item: %@. Value: %@", item, objj_msgSend(values, "objectAtIndex:", index));
        return objj_msgSend(values, "objectAtIndex:", index);
    }
}
},["id","CPOutlineView","int","id"]), new objj_method(sel_getUid("outlineView:isItemExpandable:"), function $InstrumentationViewDataSourceObject__outlineView_isItemExpandable_(self, _cmd, outlineView, item)
{ with(self)
{
    CPLog("outlineView:%@ isItemExpandable:%@", outlineView, item);

    var values = objj_msgSend(items, "objectForKey:", item);
    CPLog.debug((objj_msgSend(values, "count") > 0));
    return (objj_msgSend(values, "count") > 0);
}
},["BOOL","CPOutlineView","id"]), new objj_method(sel_getUid("outlineView:numberOfChildrenOfItem:"), function $InstrumentationViewDataSourceObject__outlineView_numberOfChildrenOfItem_(self, _cmd, outlineView, item)
{ with(self)
{
    CPLog("outlineView:%@ numberOfChildrenOfItem:%@", outlineView, item);

    if (item === nil)
    {
        CPLog.debug("returning number of items for root:%@", objj_msgSend(items, "count"));
        return objj_msgSend(items, "count");
    }
    else
    {
        var values = objj_msgSend(items, "objectForKey:", item);
        CPLog.debug("Returning number of items for key: %@. Items: %@", item, objj_msgSend(values, "count"));
        return objj_msgSend(values, "count");
    }
}
},["int","CPOutlineView","id"]), new objj_method(sel_getUid("outlineView:objectValueForTableColumn:byItem:"), function $InstrumentationViewDataSourceObject__outlineView_objectValueForTableColumn_byItem_(self, _cmd, outlineView, tableColumn, item)
{ with(self)
{
    CPLog("outlineView:%@ objectValueForTableColumn:%@ byItem:%@", outlineView, tableColumn, item);

    CPLog.debug(item);

    return item;
}
},["id","CPOutlineView","CPTableColumn","id"])]);
}

p;16;JsonController.jt;1134;@STATIC;1.0;I;21;Foundation/CPObject.jt;1089;

objj_executeFile("Foundation/CPObject.j", NO);

{var the_class = objj_allocateClassPair(CPObject, "JsonController"),
meta_class = the_class.isa;objj_registerClassPair(the_class);
class_addMethods(the_class, [new objj_method(sel_getUid("sendJSON:"), function $JsonController__sendJSON_(self, _cmd, jsonObjectString)
{ with(self)
{

    var contentLength = objj_msgSend(objj_msgSend(CPString, "alloc"), "initWithFormat:", "%d", objj_msgSend(jsonObjectString, "length"));

 CPLog.debug("Sending JSON: %@", jsonObjectString);

    var request = objj_msgSend(objj_msgSend(CPURLRequest, "alloc"), "initWithURL:", "http://localhost:8081/JSONServlet");
    objj_msgSend(request, "setHTTPMethod:", "POST");
    objj_msgSend(request, "setHTTPBody:", jsonObjectString);
    objj_msgSend(request, "setValue:forHTTPHeaderField:", contentLength, "Content-Length");
    objj_msgSend(request, "setValue:forHTTPHeaderField:", "text/plain;charset=UTF-8", "Content-Type");
    postConnection = objj_msgSend(CPURLConnection, "connectionWithRequest:delegate:", request, self);
}
},["void","CPString"])]);
}

p;6;main.jt;295;@STATIC;1.0;I;23;Foundation/Foundation.jI;15;AppKit/AppKit.ji;15;AppController.jt;209;objj_executeFile("Foundation/Foundation.j", NO);
objj_executeFile("AppKit/AppKit.j", NO);
objj_executeFile("AppController.j", YES);
main= function(args, namedArgs)
{
    CPApplicationMain(args, namedArgs);
}

e;