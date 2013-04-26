package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import static com.sun.btrace.ext.Collections.*;
import java.util.Deque;

@BTrace
public class CpuInfo {
	private static Deque<Long> sysTimeQueue = com.sun.btrace.ext.Collections.BTraceDeque();
	private static Deque<Double> totalCpuTimeQueue = com.sun.btrace.ext.Collections.BTraceDeque();
	
	@OnTimer(15000)
	public static void printCpu() {
		Long timePeriod = ((long) (com.sun.btrace.ext.Time.millis() / 15000) * 15000);
/*		Appendable sb = Strings.newStringBuilder();
		Strings.append(sb, "[Value;");
		Strings.append(sb, Sys.Env.property("btrace.agent"));
		Strings.append(sb, ";CPU;");
		Strings.append(sb, "Number of Processors;");
		Strings.append(sb, Strings.str(Sys.VM.numberOfProcessors()));
		Strings.append(sb, ";n;value;");
		Strings.append(sb, Strings.str(timePeriod));
		Strings.append(sb, "]");
		println(Strings.str(sb));

		sb = Strings.newStringBuilder();
		Strings.append(sb, "[Value;");
		Strings.append(sb, Sys.Env.property("btrace.agent"));
		Strings.append(sb, ";CPU;");
		Strings.append(sb, "System Load Average;");
		Strings.append(sb, Strings.str(Sys.VM.systemLoadAverage()));
		Strings.append(sb, ";n;value;");
		Strings.append(sb, Strings.str(timePeriod));
		Strings.append(sb, "]");
		println(Strings.str(sb));
		
		Double totalCpuTime = Sys.VM.processCPUTime();
		sb = Strings.newStringBuilder();
		Strings.append(sb, "[Value;");
		Strings.append(sb, Sys.Env.property("btrace.agent"));
		Strings.append(sb, ";CPU;");
		Strings.append(sb, "Process CPU Time;");
		Strings.append(sb, Strings.str(totalCpuTime));
		Strings.append(sb, ";ns;value;");
		Strings.append(sb, Strings.str(timePeriod));
		Strings.append(sb, "]");
		println(Strings.str(sb));
		
		if (size(totalCpuTimeQueue) >= 4 && size(sysTimeQueue) >= 4) {
			Double cpuPercent = ((peekLast(totalCpuTimeQueue) - peekFirst(totalCpuTimeQueue)) * 100) / ((peekLast(sysTimeQueue) - peekFirst(sysTimeQueue)));
			
			Collections.BTraceDeque.removeFirst(totalCpuTimeQueue);
			Collections.BTraceDeque.removeFirst(sysTimeQueue);
			
			sb = Strings.newStringBuilder();
			Strings.append(sb, "[Value;");
			Strings.append(sb, property("btrace.agent"));
			Strings.append(sb, ";CPU;");
			Strings.append(sb, "CPU Utilization (%);");
			Strings.append(sb, Strings.str(cpuPercent));
			Strings.append(sb, ";n;value;");
			Strings.append(sb, Strings.str(timePeriod));
			Strings.append(sb, "]");
			println(str(sb));
		}
		
		Collections.BTraceDeque.addLast(sysTimeQueue, Time.millis());
		Collections.BTraceDeque.addLast(totalCpuTimeQueue, totalCpuTime);*/
	}

}