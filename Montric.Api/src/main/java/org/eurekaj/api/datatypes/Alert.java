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

import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.enumtypes.AlertType;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 12:15 AM
 * To change this template use File | Settings | File Templates.
 */
public interface Alert {

    public String getAlertName();

    public String getAccountName();

    public String getGuiPath();

    public boolean isActivated();

    public Double getErrorValue();

    public Double getWarningValue();

    public AlertType getSelectedAlertType();

    public long getAlertDelay();

    public AlertStatus getStatus();

    public List<String> getSelectedEmailSenderList();
    
    public List<String> getSelectedAlertPluginList();
}
