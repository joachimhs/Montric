package org.eurekaj.btracers;

import net.java.btrace.annotations.BTrace;
import net.java.btrace.annotations.OnTimer;
import net.java.btrace.ext.collections.BTraceDeque;
import static net.java.btrace.ext.Time.*;
import static net.java.btrace.ext.collections.Collections.*;
import static net.java.btrace.ext.Strings.*;
import static net.java.btrace.ext.sys.Env.*;
import static net.java.btrace.ext.Printer.*;
import static net.java.btrace.ext.sys.Memory.*;


import java.util.Deque;

@BTrace public class GCTimeTracer {
	private static Deque<Long> gcTimes = newDeque();
		
	@OnTimer(15000)
    public static void printGcTime() {
		Long timePeriod = ((long) (millis() / 15000) * 15000);
		
		if (size(gcTimes) >= 4) {
			double gcTime = ((double)(peekLast(gcTimes) - (double)peekFirst(gcTimes))  * 100d) / ((double)size(gcTimes) * 15000d);
			
			removeFirst(gcTimes);
			
			Appendable sb = newStringBuilder();
			append(sb, "[Value;");
			append(sb, property("btrace.agent"));
			append(sb, ";GC:Time Spent In GC;");
			append(sb, str(gcTime)); 
			append(sb, ";");
			append(sb, str(timePeriod)); 
			append(sb, "]");
			println(str(sb));
		}
		
		addLast(gcTimes, getTotalGcTime());
	}
}