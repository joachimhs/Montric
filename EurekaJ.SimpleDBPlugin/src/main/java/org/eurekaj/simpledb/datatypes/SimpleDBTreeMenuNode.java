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
