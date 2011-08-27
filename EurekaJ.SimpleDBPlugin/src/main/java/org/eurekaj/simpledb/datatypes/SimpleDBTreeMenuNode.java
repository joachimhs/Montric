/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
package org.eurekaj.simpledb.datatypes;

import com.amazonaws.services.simpledb.model.Attribute;
import com.amazonaws.services.simpledb.model.ReplaceableAttribute;
import org.eurekaj.api.datatypes.TreeMenuNode;
import org.eurekaj.simpledb.SimpleDBUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 5/7/11
 * Time: 11:30 AM
 * To change this template use File | Settings | File Templates.
 */
public class SimpleDBTreeMenuNode  implements TreeMenuNode, Comparable<TreeMenuNode> {
    String guiPath;
	String nodeLive;

    public SimpleDBTreeMenuNode() {
    }

    public SimpleDBTreeMenuNode(String guiPath, String nodeLive) {
        this.guiPath = guiPath;
        this.nodeLive = nodeLive;
    }

    public SimpleDBTreeMenuNode(TreeMenuNode treeMenuNode) {
        this.guiPath = treeMenuNode.getGuiPath();
        this.nodeLive = treeMenuNode.getNodeLive();
    }

    public SimpleDBTreeMenuNode(List<Attribute> attributeList) {
        Map<String, String> attributeMap = SimpleDBUtil.getAttributesAStringMap(attributeList);

        setGuiPath(attributeMap.get("guiPath"));
        setNodeLive(attributeMap.get("nodeLive"));
    }

    public List<ReplaceableAttribute> getAmazonSimpleDBAttribute() {
        List<ReplaceableAttribute> replaceableAttributeList = new ArrayList<ReplaceableAttribute>();
        replaceableAttributeList.add(new ReplaceableAttribute("guiPath", this.getGuiPath(), true));
        replaceableAttributeList.add(new ReplaceableAttribute("nodeLive", this.getNodeLive(), true));

        return replaceableAttributeList;
    }

    @Override
    public String getGuiPath() {
        return guiPath;
    }

    @Override
    public String getNodeLive() {
        return nodeLive;
    }

    public void setGuiPath(String guiPath) {
        this.guiPath = guiPath;
    }

    public void setNodeLive(String nodeLive) {
        this.nodeLive = nodeLive;
    }

    @Override
    public int compareTo(TreeMenuNode other) {
		if (other == null || other.getGuiPath() == null) {
			return 1;
		}

		if (this.getGuiPath() == null) {
			return -1;
		}

		return this.getGuiPath().compareTo(other.getGuiPath());
	}
}
