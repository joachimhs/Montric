package org.eurekaj.api.datatypes;

import java.util.Comparator;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/5/11
 * Time: 9:42 PM
 * To change this template use File | Settings | File Templates.
 */
public interface TreeMenuNode extends Comparable<TreeMenuNode> {
    public String getGuiPath();
    public String getNodeLive();

    public class TreeMenuNodeComparator implements Comparator<TreeMenuNode> {

        @Override
        public int compare(TreeMenuNode thisNode, TreeMenuNode otherNode) {
            if (otherNode == null || otherNode.getGuiPath() == null) {
                return 1;
            }

            if (thisNode.getGuiPath() == null) {
                return -1;
            }

            return thisNode.getGuiPath().compareTo(otherNode.getGuiPath());
        }
    }
}
