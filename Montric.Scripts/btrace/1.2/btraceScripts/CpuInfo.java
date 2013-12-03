package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;

import java.util.Deque;

@BTrace
public class CpuInfo {
	private static Deque<Long> sysTimeQueue = newDeque();
	private static Deque<Double> totalCpuTimeQueue = newDeque();
	
	@OnTimer(15000)
	public static void printCpu() {
		Long timePeriod = ((timeMillis() / 15000) * 15000);
		Appendable sb = Strings.newStringBuilder();
		Strings.append(sb, "[Value;");
		Strings.append(sb, property("btrace.agent"));			//agentName
		Strings.append(sb, ";CPU:");							//path
		Strings.append(sb, "Number of Processors;");			//path
		Strings.append(sb, str(numberOfProcessors()));	//value
		Strings.append(sb, ";n;value;1;");						//unitType;valueType;count
		Strings.append(sb, str(timePeriod));					//timestamp
		Strings.append(sb, "]");
		println(str(sb));

		sb = Strings.newStringBuilder();
		Strings.append(sb, "[Value;");
		Strings.append(sb, property("btrace.agent"));
		Strings.append(sb, ";CPU:");
		Strings.append(sb, "System Load Average;");
		Strings.append(sb, str(systemLoadAverage()));
		Strings.append(sb, ";n;value;1;");
		Strings.append(sb, str(timePeriod));
		Strings.append(sb, "]");
		println(str(sb));
		
		Double totalCpuTime = processCPUTime();
		sb = Strings.newStringBuilder();
		Strings.append(sb, "[Value;");
		Strings.append(sb, property("btrace.agent"));
		Strings.append(sb, ";CPU:");
		Strings.append(sb, "Process CPU Time;");
		Strings.append(sb, str(totalCpuTime));
		Strings.append(sb, ";ns;value;1;");
		Strings.append(sb, str(timePeriod));
		Strings.append(sb, "]");
		println(str(sb));
		
		if (size(totalCpuTimeQueue) >= 4 && size(sysTimeQueue) >= 4) {
			Double cpuPercent = ((peekLast(totalCpuTimeQueue) - peekFirst(totalCpuTimeQueue)) * 100) / ((peekLast(sysTimeQueue) - peekFirst(sysTimeQueue)));
			
			removeFirst(totalCpuTimeQueue);
			removeFirst(sysTimeQueue);
			
			sb = Strings.newStringBuilder();
			Strings.append(sb, "[Value;");
			Strings.append(sb, property("btrace.agent"));
			Strings.append(sb, ";CPU:");
			Strings.append(sb, "CPU Utilization (%);");
			Strings.append(sb, str(cpuPercent));
			Strings.append(sb, ";n;value;1;");
			Strings.append(sb, str(timePeriod));
			Strings.append(sb, "]");
			println(str(sb));
		}
		
		addLast(sysTimeQueue, timeMillis());
		addLast(totalCpuTimeQueue, totalCpuTime);
	}

}