package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;

@BTrace public class TraceMem {

@OnTimer(7500)
public static void printMem() {
	Long timePeriod = ((long)(timeNanos() / 15000000000l)*15000);
    print("[HeapMemory;");
	print(property("btrace.agentname")); print(";");
	print(max(heapUsage())); print(";");
	print(used(heapUsage())); print(";");
	print(committed(heapUsage())); print(";");
	print(init(heapUsage())); print(";");
	print(timePeriod); println("]");
	
	print("[NonHeapMemory;");
	print(property("btrace.agentname")); print(";");
	print(max(nonHeapUsage())); print(";");
	print(used(nonHeapUsage())); print(";");
	print(committed(nonHeapUsage())); print(";");
	print(init(nonHeapUsage())); print(";");
	print(timePeriod);println("]");
	
	print("[Threads;");
	print(property("btrace.agentname")); print(";");
	print(threadCount()); print(";");
	print(peakThreadCount()); print(";");
	print(totalStartedThreadCount()); print(";");
	print(timePeriod); println("]");
	
	print("[ValueInstrumentation;");
	print(property("btrace.agentname")); print(";");
	print("Memory"); print(";");
	print("Heap:%_Used"); print(";");
	print((used(heapUsage()) *100)/ max(heapUsage())); print(";");
	print(timePeriod); println("]");
	
	print("[ValueInstrumentation;");
	print(property("btrace.agentname")); print(";");
	print("Memory"); print(";");
	print("NonHeap:%_Used"); print(";");
	print((used(nonHeapUsage()) *100)/ max(nonHeapUsage())); print(";");
	print(timePeriod); println("]");
}

}