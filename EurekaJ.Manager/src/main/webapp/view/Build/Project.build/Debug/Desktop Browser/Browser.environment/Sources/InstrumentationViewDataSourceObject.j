@STATIC;1.0;t;3038;

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

