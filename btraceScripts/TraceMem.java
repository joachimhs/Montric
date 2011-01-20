package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;

@BTrace
public class TraceMem {

	@OnTimer(7500)
	public static void printMem() {
		Long timePeriod = ((long) (timeNanos() / 15000000000l) * 15000);
		Appendable sb = Strings.newStringBuilder();
		Strings.append(sb, "[HeapMemory;");
		Strings.append(sb, property("btrace.agent"));
		Strings.append(sb, ";");
		Strings.append(sb, str(max(heapUsage())));
		Strings.append(sb, ";");
		Strings.append(sb, str(used(heapUsage())));
		Strings.append(sb, ";");
		Strings.append(sb, str(committed(heapUsage())));
		Strings.append(sb, ";");
		Strings.append(sb, str(init(heapUsage())));
		Strings.append(sb, ";");
		Strings.append(sb, str(timePeriod));
		Strings.append(sb, "]");
		println(str(sb));

		sb = Strings.newStringBuilder();
		Strings.append(sb, "[NonHeapMemory;");
		Strings.append(sb, property("btrace.agent"));
		Strings.append(sb, ";");
		Strings.append(sb, str(max(nonHeapUsage())));
		Strings.append(sb, ";");
		Strings.append(sb, str(used(nonHeapUsage())));
		Strings.append(sb, ";");
		Strings.append(sb, str(committed(nonHeapUsage())));
		Strings.append(sb, ";");
		Strings.append(sb, str(init(nonHeapUsage())));
		Strings.append(sb, ";");
		Strings.append(sb, str(timePeriod));
		Strings.append(sb, "]");
		println(str(sb));

		sb = Strings.newStringBuilder();
		Strings.append(sb, "[Threads;");
		Strings.append(sb, property("btrace.agent"));
		Strings.append(sb, ";");
		Strings.append(sb, str(threadCount()));
		Strings.append(sb, ";");
		Strings.append(sb, str(peakThreadCount()));
		Strings.append(sb, ";");
		Strings.append(sb, str(totalStartedThreadCount()));
		Strings.append(sb, ";");
		Strings.append(sb, str(timePeriod));
		Strings.append(sb, "]");
		println(str(sb));

		sb = Strings.newStringBuilder();
		Strings.append(sb, "[Value;");
		Strings.append(sb, property("btrace.agent"));
		Strings.append(sb, ";Memory;");
		Strings.append(sb, "Heap:%_Used;");
		Strings.append(sb, str((used(heapUsage()) * 100) / max(heapUsage())));
		Strings.append(sb, ";n;");
		Strings.append(sb, str(timePeriod));
		Strings.append(sb, "]");
		println(str(sb));

		sb = Strings.newStringBuilder();
		Strings.append(sb, "[Value;");
		Strings.append(sb, property("btrace.agent"));
		Strings.append(sb, ";Memory;");
		Strings.append(sb, "NonHeap:%_Used;");
		Strings.append(sb, str((used(nonHeapUsage()) * 100) / max(nonHeapUsage())));
		Strings.append(sb, ";n;");
		Strings.append(sb, str(timePeriod));
		Strings.append(sb, "]");
		println(str(sb));

		sb = Strings.newStringBuilder();
		Strings.append(sb, "[MemoryPool;");
		Strings.append(sb, property("btrace.agent"));
		Strings.append(sb, ";%1$s;%2$d;%3$d;%4$d;%5$d;");
		Strings.append(sb, str(timePeriod));
		Strings.append(sb, "]");

		println(Sys.Memory.getMemoryPoolUsage(str(sb)));
	}

}