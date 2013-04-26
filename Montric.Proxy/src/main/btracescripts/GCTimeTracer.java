package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;
import java.util.Deque;

@BTrace public class GCTimeTracer {
	private static Deque<Long> gcTimes = newDeque();
		
	@OnTimer(15000)
    public static void printGcTime() {
		Long timePeriod = ((long)(timeNanos() / 15000000000l)*15000);
		
		if (size(gcTimes) >= 60) {
			long gcTime = ((peekLast(gcTimes) - peekFirst(gcTimes) * 100)) / (size(gcTimes) * 15000);
			
			removeFirst(gcTimes);
			
			StringBuffer sb = newStringBuffer();
			append(sb, "[GCTime;");
			append(sb, property("btrace.agentname"));
			append(sb, ";");
			append(sb, gcTime); 
			append(sb, ";");
			append(sb, (timePeriod)); 
			append(sb, "]");
			println(str(sb));
		}
		
		addLast(gcTimes, getTotalGcTime());
	}
}