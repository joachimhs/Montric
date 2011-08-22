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
