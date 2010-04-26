package org.eurekaj.btracers;

import com.sun.btrace.AnyType;
import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;

@BTrace public class ThreadCounter {
	private static Aggregation threadsStartedCount = newAggregation(AggregationFunction.COUNT);
	private static Aggregation threadsReturnedCount = newAggregation(AggregationFunction.COUNT);
	
	@OnMethod(
        clazz="+java.lang.Thread",
        method="run",
		location=@Location(value=Kind.ENTRY, clazz="/.*/", method="/.*/")
    )
    public static void threadEntry(@ProbeMethodName String probeMethod, @ProbeClassName String probeClass) { // all calls to the info methods with signature "(String)"
		AggregationKey key = newAggregationKey(probeClass);
		
		addToAggregation(threadsStartedCount, key, 1);
    }

	@OnMethod(
        clazz="+java.lang.Thread",
        method="run",
		location=@Location(value=Kind.RETURN, clazz="/.*/", method="/.*/")
    )
    public static void threadReturn(@ProbeMethodName String probeMethod, @ProbeClassName String probeClass) { // all calls to the info methods with signature "(String)"
		AggregationKey key = newAggregationKey(probeClass);
		
		
		addToAggregation(threadsReturnedCount, key, 1);
    }

	@OnTimer(7500)
    public static void printAverage() {
		//TotalExecTime: agentname package.Class method timeperiod exectime classType
		//CallsPerInterval: agentname package.Class method timeperiod callsWithinTimeperiod classType
		
		String startedThreadFormat = strcat("[ThreadsStartedByType;", property("btrace.agentname"));
		printAggregation("", threadsStartedCount,  strcat(startedThreadFormat, ";%1$s;%2$s]"));
		println("");
		String returnedThreadFormat = strcat("[ThreadsReturnedByType;", property("btrace.agentname"));
		printAggregation("", threadsReturnedCount,  strcat(returnedThreadFormat, ";%1$s;%2$s]"));
    }
} 
