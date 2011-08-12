package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;
import com.sun.btrace.Profiler;
import java.util.Deque;

@BTrace public class EurekaJProfiler {
	    @Property(name="eurekaJProfiler") private static Profiler eurekaJProfiler = Profiling.newProfiler();
	
		public static void registerProfilerBefore(String pcn, String pmn) {
			Long timePeriod = ((long) (timeMillis() / 15000) * 15000);
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";");
			Strings.append(a, pcn);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));

	        Profiling.recordEntry(eurekaJProfiler, str(a));
		}
		
		public static void registerProfilerAfter(String pcn, String pmn, long time) {
			Long timePeriod = ((long) (timeMillis() / 15000) * 15000);
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";");
			Strings.append(a, pcn);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));
			
	        Profiling.recordExit(eurekaJProfiler, str(a), time);
		}
	
	 	@OnMethod(clazz="/org\\.eurekaj\\.manager\\.service\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY) )
	    public static void serviceBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			registerProfilerBefore(pcn, pmn);
	    }

	    @OnMethod(clazz="/org\\.eurekaj\\.manager\\.service\\..*/", method="/.*/",location=@Location(Kind.RETURN) )
	    public static void serviceAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			registerProfilerAfter(pcn, pmn, time);
	    }
	
		@OnMethod(clazz="/org\\.eurekaj\\.manager\\.dao\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY) )
	    public static void daoBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			registerProfilerBefore(pcn, pmn);
	    }

	    @OnMethod(clazz="/org\\.eurekaj\\.manager\\.dao\\..*/", method="/.*/",location=@Location(Kind.RETURN) )
	    public static void daoAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			registerProfilerAfter(pcn, pmn, time);
	    }
	
		@OnMethod(clazz="/org\\.eurekaj\\.manager\\.task\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY) )
	    public static void taskBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			registerProfilerBefore(pcn, pmn);
	    }

	    @OnMethod(clazz="/org\\.eurekaj\\.manager\\.task\\..*/", method="/.*/",location=@Location(Kind.RETURN) )
	    public static void taskAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			registerProfilerAfter(pcn, pmn, time);
	    }
	
		@OnTimer(7500)
	    public static void printAverage() {			
			String profilingFormat = strcat("[ProfilingV1;", property("btrace.agent"));
			Profiling.printSnapshot("", eurekaJProfiler, "[ProfilingV1;%1$s;%2$s;%3$s;%4$s;%5$s;%6$s;%7$s;%8$s;%9$s;%10$s;Custom]");
			Profiling.reset(eurekaJProfiler);
		}
}