package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;
import com.sun.btrace.Profiler;
import java.util.Deque;

@BTrace public class CustomBtracer {
	    @Property(name="componentProfiler") private static Profiler componentProfiler = Profiling.newProfiler();
	    @Property(name="demoProfiler") private static Profiler demoProfiler = Profiling.newProfiler();
	
	    @OnMethod(clazz="/org\\.jsflot\\.components\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY))
	    public static void componentPaintBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeNanos() / 15000000000l)*15000);
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";");
			Strings.append(a, pcn);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));

	        Profiling.recordEntry(componentProfiler, str(a));
	    }

	    @OnMethod(
	        clazz="/org\\.jsflot\\.components\\..*/",
	        method="/.*/",
	        location=@Location(Kind.RETURN)
	    )
	    public static void componentPaintAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeNanos() / 15000000000l)*15000);
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";");
			Strings.append(a, pcn);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));
			
	        Profiling.recordExit(componentProfiler, str(a), time);
	    }
	
	       	@OnMethod(clazz="/org\\.jsflot\\.demo\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY))
		    public static void demoPaintBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
				Long timePeriod = ((timeNanos() / 15000000000l)*15000);

				Appendable a = Strings.newStringBuilder(true);
				Strings.append(a, property("btrace.agent"));
				Strings.append(a, ";");
				Strings.append(a, pcn);
				Strings.append(a, ";");
				Strings.append(a, pmn);
				Strings.append(a, ";");
				Strings.append(a, str(timePeriod));

		        Profiling.recordEntry(demoProfiler, str(a));
		    }

		    @OnMethod(
		        clazz="/org\\.jsflot\\.demo\\..*/",
		        method="/.*/",
		        location=@Location(Kind.RETURN)
		    )
		    public static void demoPaintAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
				Long timePeriod = ((timeNanos() / 15000000000l)*15000);

				Appendable a = Strings.newStringBuilder(true);
				Strings.append(a, property("btrace.agent"));
				Strings.append(a, ";");
				Strings.append(a, pcn);
				Strings.append(a, ";");
				Strings.append(a, pmn);
				Strings.append(a, ";");
				Strings.append(a, str(timePeriod));

		        Profiling.recordExit(demoProfiler, str(a), time);
		    }
	
		@OnTimer(7500)
	    public static void printAverage() {			
			String profilingFormat = strcat("[ProfilingV1;", property("btrace.agent"));
			Profiling.printSnapshot("", componentProfiler, "[ProfilingV1;%1$s;%2$s;%3$s;%4$s;%5$s;%6$s;%7$s;%8$s;%9$s;%10$s;Custom]");
			Profiling.reset(componentProfiler);
			
			Profiling.printSnapshot("", demoProfiler, "[ProfilingV1;%1$s;%2$s;%3$s;%4$s;%5$s;%6$s;%7$s;%8$s;%9$s;%10$s;Custom]");
			Profiling.reset(demoProfiler);
		}
}