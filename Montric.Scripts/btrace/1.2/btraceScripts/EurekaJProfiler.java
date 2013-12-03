package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;
import com.sun.btrace.Profiler;
import java.util.Deque;

@BTrace public class EurekaJProfiler {
	    @Property(name="eurekaJProfiler") private static Profiler eurekaJProfiler = Profiling.newProfiler();
	
	 	@OnMethod(clazz="/org\\.eurekaj\\.manager\\.service\\..*/", method="/[get|persist|delete|store].*/", location=@Location(value=Kind.ENTRY) )
	    public static void serviceBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
	 		Long timePeriod = ((timeMillis() / 15000) * 15000);
			
	 		int lastDotIndex = lastIndexOf(pcn, ".") + 1;
			String className = substr(pcn, lastDotIndex);
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";Service:");
			Strings.append(a, className);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));

	        Profiling.recordEntry(eurekaJProfiler, str(a));
	    }

	    @OnMethod(clazz="/org\\.eurekaj\\.manager\\.service\\..*/", method="/[get|persist|delete|store].*/",location=@Location(Kind.RETURN) )
	    public static void serviceAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeMillis() / 15000) * 15000);
			
			int lastDotIndex = lastIndexOf(pcn, ".") + 1;
			String className = substr(pcn, lastDotIndex);
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";Service:");
			Strings.append(a, className);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));
			
	        Profiling.recordExit(eurekaJProfiler, str(a), time);
	    }
	    
	    @OnMethod(clazz="+org.eurekaj.api.dao.MontricDao", method="/[get|persist|delete|store].*/", location=@Location(value=Kind.ENTRY))
	    public static void daoBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeMillis() / 15000) * 15000);
			
			int lastDotIndex = lastIndexOf(pcn, ".") + 1;
			String className = substr(pcn, lastDotIndex);
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";DAO:");
			Strings.append(a, className);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));

	        Profiling.recordEntry(eurekaJProfiler, str(a));
	    }

	    @OnMethod(clazz="+org.eurekaj.api.dao.MontricDao", method="/[get|persist|delete|store].*/", location=@Location(value=Kind.RETURN))
	    public static void daoAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeMillis() / 15000) * 15000);
			
			int lastDotIndex = lastIndexOf(pcn, ".") + 1;
			String className = substr(pcn, lastDotIndex); 
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";DAO:");
			Strings.append(a, className);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));
			
	        Profiling.recordExit(eurekaJProfiler, str(a), time);
	    }
	    
	    @OnMethod(clazz="+org.eurekaj.manager.server.handlers.EurekaJGenericChannelHandler", method="messageReceived", location=@Location(value=Kind.RETURN))
	    public static void handlerBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeMillis() / 15000) * 15000);
			
			int lastDotIndex = lastIndexOf(pcn, ".") + 1;
			String className = substr(pcn, lastDotIndex); 
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";Handlers:");
			Strings.append(a, className);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));

	        Profiling.recordEntry(eurekaJProfiler, str(a));
	    }

	    @OnMethod(clazz="+org.eurekaj.manager.server.handlers.EurekaJGenericChannelHandler", method="messageReceived",location=@Location(Kind.RETURN) )
	    public static void handlerAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeMillis() / 15000) * 15000);
			
			int lastDotIndex = lastIndexOf(pcn, ".") + 1;
			String className = substr(pcn, lastDotIndex); 
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";Handlers:");
			Strings.append(a, className);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));
			
	        Profiling.recordExit(eurekaJProfiler, str(a), time);
	    }
	
		@OnMethod(clazz="/org\\.eurekaj\\.manager\\.task\\..*/", method="run", location=@Location(value=Kind.ENTRY) )
	    public static void taskBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeMillis() / 15000) * 15000);
			
			int lastDotIndex = lastIndexOf(pcn, ".") + 1;
			String className = substr(pcn, lastDotIndex); 
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";Task:");
			Strings.append(a, className);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));

	        Profiling.recordEntry(eurekaJProfiler, str(a));
	    }

	    @OnMethod(clazz="/org\\.eurekaj\\.manager\\.task\\..*/", method="run",location=@Location(Kind.RETURN) )
	    public static void taskAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeMillis() / 15000) * 15000);
			
			int lastDotIndex = lastIndexOf(pcn, ".") + 1;
			String className = substr(pcn, lastDotIndex);
			
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";Task:");
			Strings.append(a, className);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));
			
	        Profiling.recordExit(eurekaJProfiler, str(a), time);
	    }
	
		@OnTimer(7500)
	    public static void printAverage() {			
			String profilingFormat = strcat("[ProfilingV1;", property("btrace.agent"));
			Profiling.printSnapshot("", eurekaJProfiler, "[ProfilingV1;%1$s;%2$s;%3$s;%4$s;%5$s;%6$s;%7$s;%8$s;%9$s;%10$s;Classes]");
			Profiling.reset(eurekaJProfiler);
		}
}