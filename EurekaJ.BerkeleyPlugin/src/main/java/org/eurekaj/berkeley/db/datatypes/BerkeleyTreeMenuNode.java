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
package org.eurekaj.berkeley.db.datatypes;

import com.sleepycat.persist.model.Entity;
import com.sleepycat.persist.model.PrimaryKey;
import org.eurekaj.api.datatypes.TreeMenuNode;

@Entity
public class BerkeleyTreeMenuNode implements TreeMenuNode, Comparable<TreeMenuNode> {
	@PrimaryKey String guiPath;
	String nodeLive;
	
	public BerkeleyTreeMenuNode() {
		
	}
	
	public BerkeleyTreeMenuNode(String guiPath, String nodeLive) {
		super();
		this.guiPath = guiPath;
		this.nodeLive = nodeLive;
	}
	
	public String getGuiPath() {
		return guiPath;
	}
	public void setGuiPath(String guiPath) {
		this.guiPath = guiPath;
	}

	public String getNodeLive() {
		return nodeLive;
	}
	public void setNodeLive(String nodeLive) {
		this.nodeLive = nodeLive;
	}

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
