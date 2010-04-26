package org.eurekaj.btracers;

import com.sun.btrace.AnyType;
import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;

@BTrace public class ThreadCounter {
	private static Aggregation threadsLiveCount = newAggregation(AggregationFunction.COUNT);
	
	@OnMethod(
        clazz="+java.lang.Thread",
        method="run",
		location=@Location(value=Kind.ENTRY, clazz="/.*/", method="/.*/")
    )
    public static void threadEntry(@ProbeMethodName String probeMethod, @ProbeClassName String probeClass) { // all calls to the info methods with signature "(String)"
		AggregationKey key = newAggregationKey(probeClass);
		
		addToAggregation(threadsLiveCount, key, 1);
    }

	@OnMethod(
        clazz="+java.lang.Thread",
        method="run",
		location=@Location(value=Kind.RETURN, clazz="/.*/", method="/.*/")
    )
    public static void threadReturn(@ProbeMethodName String probeMethod, @ProbeClassName String probeClass) { // all calls to the info methods with signature "(String)"
		AggregationKey key = newAggregationKey(probeClass);
		
		addToAggregation(threadsLiveCount, key, -1);
    }

	@OnTimer(7500)
    public static void printAverage() {
		Long timePeriod = ((long)(timeNanos() / 15000000000l)*15000);
		String timePeriodStr = strcat(str(timePeriod), "]");		
		
		String liveThreadFormat = strcat("[ValueInstrumentation;", property("btrace.agentname"));
		printAggregation("", threadsLiveCount,  strcat(strcat(liveThreadFormat, ";Threads;%1$s:ThreadCount;%2$s;"), timePeriodStr));
    }
} 
