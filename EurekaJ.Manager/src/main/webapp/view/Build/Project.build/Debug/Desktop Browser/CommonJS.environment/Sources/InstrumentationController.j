@STATIC;1.0;I;21;Foundation/CPObject.ji;37;InstrumentationViewDataSourceObject.ji;16;JsonController.jt;5130;

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

