@implementation InstrumentationViewDataSourceObject: CPObject
{
	CPDictionary	items;
}

//- (void)setItems:(CPDictionary)items {
//	[self root] = items;
//}

- (void)init {
	self = [super init];
	//items = [CPDictionary dictionaryWithObjects:[[@"glossary 1"], [@"proj 1", @"proj 2", @"proj 3"]] forKeys:[@"Glossaries", @"Projects"]];
	return self
}

- (void)initWithDict:(CPDictionary)aDictionary {
	self = [super init];
	items = aDictionary;
	return self
}

- (id)outlineView:(CPOutlineView)outlineView child:(int)index ofItem:(id)item {
    CPLog("outlineView:%@ child:%@ ofItem:%@", outlineView, index, item);

    if (item === nil) {
        var keys = [items allKeys];
        CPLog.debug("Returnung for root: %@", [keys objectAtIndex:index]);
        return [keys objectAtIndex:index];
    } else {
        var values = [items objectForKey:item];
        CPLog.debug("Returning for item: %@. Value: %@", item, [values objectAtIndex:index]);
        return [values objectAtIndex:index];
    }
}

- (BOOL)outlineView:(CPOutlineView)outlineView isItemExpandable:(id)item {
    CPLog("outlineView:%@ isItemExpandable:%@", outlineView, item);
    
    var values = [items objectForKey:item];
    CPLog.debug(([values count] > 0));
    return ([values count] > 0);
}

- (int)outlineView:(CPOutlineView)outlineView numberOfChildrenOfItem:(id)item
{
    CPLog("outlineView:%@ numberOfChildrenOfItem:%@", outlineView, item);

    if (item === nil)
    {
        CPLog.debug("returning number of items for root:%@", [items count]);
        return [items count];
    }
    else
    {
        var values = [items objectForKey:item];
        CPLog.debug("Returning number of items for key: %@. Items: %@", item, [values count]);
        return [values count];
    }
}

- (id)outlineView:(CPOutlineView)outlineView objectValueForTableColumn:(CPTableColumn)tableColumn byItem:(id)item {
    CPLog("outlineView:%@ objectValueForTableColumn:%@ byItem:%@", outlineView, tableColumn, item);

    CPLog.debug(item);
    
    return item;   
}

@end