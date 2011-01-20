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
       //List<LiveStatistics> statList, int alertOn, double threshold, String alertType

/*       List<LiveStatistics> statList = new ArrayList<LiveStatistics>();
       LiveStatistics s1 = new LiveStatistics();
       //100 ms = 1 000 000 000 nanoseconds
       s1.setTotalExecutionTime(1000000000d);
       s1.setCallsPerInterval(10l);
       statList.add(s1);

       LiveStatistics s2 = new LiveStatistics();
       //100 ms = 1 000 000 000 nanoseconds
       s2.setTotalExecutionTime(910000000d);
       s2.setCallsPerInterval(10l);
       statList.add(s2);

       AlertValidatorTask avt = new AlertValidatorTask();
       assertTrue(avt.thresholdBreached(statList, Alert.ALERT_ON_AVG_EXECTIME, 90d, Alert.GREATER_THAN));
*/
   }
}
