package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;

@BTrace public class TraceMem {

@OnTimer(7500)
public static void printMem() {
	Long timePeriod = ((long)(timeNanos() / 15000000000l)*15000);
	StringBuffer sb = newStringBuffer();
    append(sb, "[HeapMemory;");
	append(sb, property("btrace.agentname"));
	append(sb, ";");
	append(sb, (max(heapUsage()))); 
	append(sb, ";");
	append(sb, (used(heapUsage()))); 
	append(sb, ";");
	append(sb, (committed(heapUsage()))); 
	append(sb, ";");
	append(sb, (init(heapUsage()))); 
	append(sb, ";");
	append(sb, (timePeriod)); 
	append(sb, "]");
	println(str(sb));
	
	sb = newStringBuffer();
	append(sb, "[NonHeapMemory;");
	append(sb, property("btrace.agentname"));
	append(sb, ";");
	append(sb, (max(nonHeapUsage()))); 
	append(sb, ";");
	append(sb, (used(nonHeapUsage()))); 
	append(sb, ";");
	append(sb, (committed(nonHeapUsage()))); 
	append(sb, ";");
	append(sb, (init(nonHeapUsage()))); 
	append(sb, ";");
	append(sb, (timePeriod)); 
	append(sb, "]");
	println(str(sb));
	
	sb = newStringBuffer();
	append(sb, "[Threads;");
	append(sb, property("btrace.agentname"));
	append(sb, ";");
	append(sb, (threadCount())); 
	append(sb, ";");
	append(sb, (peakThreadCount())); 
	append(sb, ";");
	append(sb, (totalStartedThreadCount())); 
	append(sb, ";");
	append(sb, (timePeriod)); 
	append(sb, "]");
	println(str(sb));
	
	sb = newStringBuffer();
	append(sb, "[ValueInstrumentation;");
	append(sb, property("btrace.agentname"));
	append(sb, ";Memory;");
	append(sb, "Heap:%_Used;"); 
	append(sb, ((used(heapUsage()) *100)/ max(heapUsage()))); 
	append(sb, ";");
	append(sb, (timePeriod)); 
	append(sb, "]");
	println(str(sb));
	
	sb = newStringBuffer();
	append(sb, "[ValueInstrumentation;");
	append(sb, property("btrace.agentname"));
	append(sb, ";Memory;");
	append(sb, "NonHeap:%_Used;"); 
	append(sb, ((used(nonHeapUsage()) *100)/ max(nonHeapUsage()))); 
	append(sb, ";");
	append(sb, (timePeriod)); 
	append(sb, "]");
	println(str(sb));
}

}