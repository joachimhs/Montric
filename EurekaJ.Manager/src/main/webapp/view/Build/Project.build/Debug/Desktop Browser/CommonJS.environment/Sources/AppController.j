@STATIC;1.0;I;21;Foundation/CPObject.ji;27;InstrumentationController.ji;37;InstrumentationViewDataSourceObject.jt;1839;

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

