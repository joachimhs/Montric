package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;
import java.util.Deque;

@BTrace public class GCTimeTracer {
	private static Deque<Long> gcTimes = newDeque();
		
	@OnTimer(15000)
    public static void printGcTime() {
		Long timePeriod = ((long) (timeMillis() / 15000) * 15000);
		
		if (size(gcTimes) >= 4) {
			double gcTime = ((double)(peekLast(gcTimes) - (double)peekFirst(gcTimes))  * 100d) / ((double)size(gcTimes) * 15000d);
			
			removeFirst(gcTimes);
			
			Appendable sb = Strings.newStringBuilder();
			Strings.append(sb, "[GCTime;");
			Strings.append(sb, property("btrace.agent"));
			Strings.append(sb, ";");
			Strings.append(sb, str(gcTime)); 
			Strings.append(sb, ";");
			Strings.append(sb, str(timePeriod)); 
			Strings.append(sb, "]");
			println(str(sb));
		}
		
		addLast(gcTimes, getTotalGcTime());
	}
}