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
package org.eurekaJ.manager.alert;

import org.junit.Ignore;
import org.junit.Test;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: Jan 1, 2010
 * Time: 10:49:45 PM
 * To change this template use File | Settings | File Templates.
 */
public class AlertValidatorTaskTest {

   @Test
   @Ignore
    public void testAvgExecTimeBreached() {
       //List<BerkeleyLiveStatistics> statList, int alertOn, double threshold, String alertType

/*       List<BerkeleyLiveStatistics> statList = new ArrayList<BerkeleyLiveStatistics>();
       BerkeleyLiveStatistics s1 = new BerkeleyLiveStatistics();
       //100 ms = 1 000 000 000 nanoseconds
       s1.setTotalExecutionTime(1000000000d);
       s1.setCallsPerInterval(10l);
       statList.add(s1);

       BerkeleyLiveStatistics s2 = new BerkeleyLiveStatistics();
       //100 ms = 1 000 000 000 nanoseconds
       s2.setTotalExecutionTime(910000000d);
       s2.setCallsPerInterval(10l);
       statList.add(s2);

       AlertValidatorTask avt = new AlertValidatorTask();
       assertTrue(avt.thresholdBreached(statList, BerkeleyAlert.ALERT_ON_AVG_EXECTIME, 90d, BerkeleyAlert.GREATER_THAN));
*/
   }
}
