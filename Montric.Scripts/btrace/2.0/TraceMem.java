package org.eurekaj.btracers;

import net.java.btrace.annotations.BTrace;
import net.java.btrace.annotations.OnTimer;
import static net.java.btrace.ext.sys.Memory.*;
import static net.java.btrace.ext.sys.Env.*;
import static net.java.btrace.ext.Strings.*;
import static net.java.btrace.ext.Time.*;
import static net.java.btrace.ext.Printer.*;
import static net.java.btrace.ext.Threads.*;

@BTrace
public class TraceMem {

	@OnTimer(7500)
	public static void printMem() {
		Long timePeriod = ((long) (millis() / 15000) * 15000);
		Appendable sb = newStringBuilder();
		append(sb, "[Memory;");
		append(sb, property("btrace.agent"));
		append(sb, ";");
		append(sb, str(max(heapUsage())));
		append(sb, ";Heap;");
		append(sb, str(used(heapUsage())));
		append(sb, ";");
		append(sb, str(committed(heapUsage())));
		append(sb, ";");
		append(sb, str(init(heapUsage())));
		append(sb, ";");
		append(sb, str(timePeriod));
		append(sb, "]");
		println(str(sb));

		sb = newStringBuilder();
		append(sb, "[Memory;");
		append(sb, property("btrace.agent"));
		append(sb, ";NonHeap;");
		append(sb, str(max(nonHeapUsage())));
		append(sb, ";");
		append(sb, str(used(nonHeapUsage())));
		append(sb, ";");
		append(sb, str(committed(nonHeapUsage())));
		append(sb, ";");
		append(sb, str(init(nonHeapUsage())));
		append(sb, ";");
		append(sb, str(timePeriod));
		append(sb, "]");
		println(str(sb));

		sb = newStringBuilder();
		append(sb, "[Value;");
		append(sb, property("btrace.agent"));
		append(sb, ";Memory:");
		append(sb, "Heap:%_Used;");
		append(sb, str((used(heapUsage()) * 100) / max(heapUsage())));
		append(sb, ";n;value;1;");
		append(sb, str(timePeriod));
		append(sb, "]");
		println(str(sb));

		sb = newStringBuilder();
		append(sb, "[Value;");
		append(sb, property("btrace.agent"));
		append(sb, ";Memory:");
		append(sb, "NonHeap:%_Used;");
		append(sb, str((used(nonHeapUsage()) * 100) / max(nonHeapUsage())));
		append(sb, ";n;value;1;");
		append(sb, str(timePeriod));
		append(sb, "]");
		println(str(sb));

		sb = newStringBuilder();
		append(sb, "[MemoryPool;");
		append(sb, property("btrace.agent"));
		append(sb, ";%1$s;%2$d;%3$d;%4$d;%5$d;");
		append(sb, str(timePeriod));
		append(sb, "]");

		println(getMemoryPoolUsage(str(sb)));
	}

}