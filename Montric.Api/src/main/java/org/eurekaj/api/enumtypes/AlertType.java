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
package org.eurekaj.api.enumtypes;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 12:07 AM
 * To change this template use File | Settings | File Templates.
 */
public enum AlertType {
    GREATER_THAN("greater_than"),
    EQUALS("equals"),
    LESS_THAN("less_than");

    private final String typeName;

    AlertType(String typeName) {
        this.typeName = typeName;
    }

    public String getTypeName() {
        return typeName;
    }

    public static AlertType fromValue(String typeName) {
        for (AlertType c: AlertType.values()) {
            if (c.getTypeName().equals(typeName)) {
                return c;
            }
        }
        
        //Return default value if none is selected
        return GREATER_THAN;
    }
}
