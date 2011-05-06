package org.eurekaj.api.dao;

import java.util.List;

import org.eurekaj.api.datatypes.*;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;

public interface TreeMenuDao {

	public List<TreeMenuNode> getTreeMenu();

	public TreeMenuNode getTreeMenu(String guiPath);

}
