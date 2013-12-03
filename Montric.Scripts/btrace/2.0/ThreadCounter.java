package org.eurekaj.btracers;

import net.java.btrace.annotations.*;
import static net.java.btrace.ext.sys.Memory.*;
import static net.java.btrace.ext.sys.Env.*;
import static net.java.btrace.ext.Strings.*;
import static net.java.btrace.ext.Time.*;
import static net.java.btrace.ext.Printer.*;
import static net.java.btrace.ext.Threads.*;

import net.java.btrace.ext.aggregations.Aggregation;
import net.java.btrace.ext.aggregations.Aggregations;
import net.java.btrace.ext.aggregations.AggregationFunction;
import net.java.btrace.ext.aggregations.AggregationKey;

@BTrace public class ThreadCounter {
	private static Aggregation threadsLiveCount = Aggregations.newAggregation(AggregationFunction.COUNT);
	@TLS private static Thread currThread;
	
	@OnMethod(
        clazz="+java.lang.Thread",
        method="run",
		location=@Location(value=Kind.ENTRY, clazz="/.*/", method="/.*/")
    )
    public static void threadEntry(@ProbeMethodName String probeMethod, @ProbeClassName String probeClass) { // all calls to the info methods with signature "(String)"
		AggregationKey key = Aggregations.newAggregationKey(probeClass);
		currThread = currentThread();
		
		Aggregations.addToAggregation(threadsLiveCount, key, 1);
    }

	@OnMethod(
        clazz="+java.lang.Thread",
        method="run",
		location=@Location(value=Kind.RETURN, clazz="/.*/", method="/.*/")
    )
    public static void threadReturn(@ProbeMethodName String probeMethod, @ProbeClassName String probeClass) { // all calls to the info methods with signature "(String)"
		AggregationKey key = Aggregations.newAggregationKey(probeClass);
		
		Aggregations.addToAggregation(threadsLiveCount, key, -1);
    }

	@OnTimer(15000)
    public static void printAverage() {
		Long timePeriod = ((long) (millis() / 15000) * 15000);
		String timePeriodStr = strcat(str(timePeriod), "]");		
		
		String liveThreadFormat = strcat("[Value;", property("btrace.agent"));
		Aggregations.printAggregation("", threadsLiveCount,  strcat(strcat(liveThreadFormat, ";Threads:%1$s:ThreadCount;%2$s;n;value;1;"), timePeriodStr));
		
		Appendable sb = newStringBuilder();
		append(sb, "[Threads;");
		append(sb, property("btrace.agent"));
		append(sb, ";Threads;");
		append(sb, str(threadCount()));
		append(sb, ";");
		append(sb, str(peakThreadCount()));
		append(sb, ";");
		append(sb, str(totalStartedThreadCount()));
		append(sb, ";");
		append(sb, str(timePeriod));
		append(sb, "]");
		println(str(sb));
    }
} 
