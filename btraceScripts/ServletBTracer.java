package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;
import com.sun.btrace.Profiler;
import java.util.Deque;

@BTrace public class ServletBTracer {
	    @Property(name="servletProfiler") private static Profiler servletProfiler = Profiling.newProfiler();
	
		private static void recordServletEntry(String pcn, String pmn, Long timePeriod) {
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";");
			Strings.append(a, pcn);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));

	        Profiling.recordEntry(servletProfiler, str(a));
		}
		
		private static void recordServletExit(String pcn, String pmn, Long timePeriod, long duration) {
			Appendable a = Strings.newStringBuilder(true);
			Strings.append(a, property("btrace.agent"));
			Strings.append(a, ";");
			Strings.append(a, pcn);
			Strings.append(a, ";");
			Strings.append(a, pmn);
			Strings.append(a, ";");
			Strings.append(a, str(timePeriod));

	        Profiling.recordExit(servletProfiler, str(a), duration);
		}
		
	 	@OnMethod(clazz="+javax.servlet.http.HttpServlet", method="/.*/", location=@Location(value=Kind.ENTRY))
	    public static void servletDoMethodsBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeNanos() / 15000000000l)*15000);
			recordServletEntry(pcn, pmn, timePeriod);
			
	    }
	
		@OnMethod(clazz="+javax.servlet.http.HttpServlet", method="/.*/", location=@Location(Kind.RETURN))
		public static void servletDoMethodsAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeNanos() / 15000000000l)*15000);
			recordServletExit(pcn, pmn, timePeriod, time);
		}
		
		@OnMethod(clazz="+org.eurekaj.manager.servlets.EurekaJGenericServlet", method="/.*/", location=@Location(value=Kind.ENTRY))
	    public static void eurekaJServletsDoMethodsBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeNanos() / 15000000000l)*15000);
			recordServletEntry(pcn, pmn, timePeriod);
			
	    }
	
		@OnMethod(clazz="+org.eurekaj.manager.servlets.EurekaJGenericServlet", method="/.*/", location=@Location(Kind.RETURN))
		public static void eurekaJServletsDoMethodsAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeNanos() / 15000000000l)*15000);
			recordServletExit(pcn, pmn, timePeriod, time);
		}
		
		@OnMethod(clazz="+javax.servlet.Servlet", method="/.*/", location=@Location(value=Kind.ENTRY))
	    public static void ServiceMethodBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeNanos() / 15000000000l)*15000);
			recordServletEntry(pcn, pmn, timePeriod);
	    }
	
		@OnMethod(clazz="+javax.servlet.Servlet", method="/.*/", location=@Location(Kind.RETURN)
	    )
	    public static void servletServiceAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((timeNanos() / 15000000000l)*15000);
			recordServletExit(pcn, pmn, timePeriod, time);
	    }
	
		@OnTimer(7500)
	    public static void printAverage() {			
			String profilingFormat = strcat("[ProfilingV1;", property("btrace.agent"));
			Profiling.printSnapshot("", servletProfiler, "[ProfilingV1;%1$s;%2$s;%3$s;%4$s;%5$s;%6$s;%7$s;%8$s;%9$s;%10$s;Frontend:Servlets]");
			Profiling.reset(servletProfiler);
		}
}