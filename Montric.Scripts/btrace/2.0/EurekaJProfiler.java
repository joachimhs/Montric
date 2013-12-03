package org.eurekaj.btracers;

import net.java.btrace.annotations.BTrace;
import net.java.btrace.annotations.OnTimer;
import net.java.btrace.annotations.OnMethod;
import net.java.btrace.annotations.Property;
import net.java.btrace.annotations.ProbeClassName;
import net.java.btrace.annotations.ProbeMethodName;
import net.java.btrace.annotations.Location;
import net.java.btrace.annotations.Duration;
import net.java.btrace.annotations.Kind;

import net.java.btrace.ext.profiling.Profiler;

import static net.java.btrace.ext.Time.*;
import static net.java.btrace.ext.collections.Collections.*;
import static net.java.btrace.ext.sys.Env.*;
import static net.java.btrace.ext.Printer.*;
import static net.java.btrace.ext.Strings.*;
import static net.java.btrace.ext.profiling.Profiling.*;

@BTrace public class EurekaJProfiler {
	    @Property(name="eurekaJProfiler") private static Profiler eurekaJProfiler = newProfiler();
		
		public static void registerProfilerAfter(String pcn, String pmn, long time) {
			Long timePeriod = ((long) (millis() / 15000) * 15000);
			
			Appendable a = newStringBuilder(true);
			append(a, property("btrace.agent"));
			append(a, ";");
			append(a, pcn);
			append(a, ";");
			append(a, pmn);
			append(a, ";");
			append(a, str(timePeriod));
			
	        recordExit(eurekaJProfiler, str(a), time);
		}
	
	 	@OnMethod(clazz="/org\\.eurekaj\\.manager\\.service\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY) )
	    public static void serviceBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
	 		Long timePeriod = ((long) (millis() / 15000) * 15000);
			
			Appendable a = newStringBuilder(true);
			append(a, property("btrace.agent"));
			append(a, ";");
			append(a, pcn);
			append(a, ";");
			append(a, pmn);
			append(a, ";");
			append(a, str(timePeriod));

	        recordEntry(eurekaJProfiler, str(a));
	    }

	    @OnMethod(clazz="/org\\.eurekaj\\.manager\\.service\\..*/", method="/.*/",location=@Location(Kind.RETURN) )
	    public static void serviceAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
	    	Long timePeriod = ((long) (millis() / 15000) * 15000);
			
			Appendable a = newStringBuilder(true);
			append(a, property("btrace.agent"));
			append(a, ";");
			append(a, pcn);
			append(a, ";");
			append(a, pmn);
			append(a, ";");
			append(a, str(timePeriod));
			
	        recordExit(eurekaJProfiler, str(a), time);
	    }
	
		@OnMethod(clazz="/org\\.eurekaj\\.manager\\.dao\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY) )
	    public static void daoBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((long) (millis() / 15000) * 15000);
			
			Appendable a = newStringBuilder(true);
			append(a, property("btrace.agent"));
			append(a, ";");
			append(a, pcn);
			append(a, ";");
			append(a, pmn);
			append(a, ";");
			append(a, str(timePeriod));

	        recordEntry(eurekaJProfiler, str(a));
	    }

	    @OnMethod(clazz="/org\\.eurekaj\\.manager\\.dao\\..*/", method="/.*/",location=@Location(Kind.RETURN) )
	    public static void daoAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
	    	Long timePeriod = ((long) (millis() / 15000) * 15000);
			
			Appendable a = newStringBuilder(true);
			append(a, property("btrace.agent"));
			append(a, ";");
			append(a, pcn);
			append(a, ";");
			append(a, pmn);
			append(a, ";");
			append(a, str(timePeriod));
			
	        recordExit(eurekaJProfiler, str(a), time);
	    }
	
		@OnMethod(clazz="/org\\.eurekaj\\.manager\\.task\\..*/", method="/.*/", location=@Location(value=Kind.ENTRY) )
	    public static void taskBefore(@ProbeClassName String pcn, @ProbeMethodName String pmn) {
			Long timePeriod = ((long) (millis() / 15000) * 15000);
			
			Appendable a = newStringBuilder(true);
			append(a, property("btrace.agent"));
			append(a, ";");
			append(a, pcn);
			append(a, ";");
			append(a, pmn);
			append(a, ";");
			append(a, str(timePeriod));

	        recordEntry(eurekaJProfiler, str(a));
	    }

	    @OnMethod(clazz="/org\\.eurekaj\\.manager\\.task\\..*/", method="/.*/",location=@Location(Kind.RETURN) )
	    public static void taskAfter(@Duration long time, @ProbeClassName String pcn, @ProbeMethodName String pmn) {
	    	Long timePeriod = ((long) (millis() / 15000) * 15000);
			
			Appendable a = newStringBuilder(true);
			append(a, property("btrace.agent"));
			append(a, ";");
			append(a, pcn);
			append(a, ";");
			append(a, pmn);
			append(a, ";");
			append(a, str(timePeriod));
			
	        recordExit(eurekaJProfiler, str(a), time);
	    }
	
		@OnTimer(7500)
	    public static void printAverage() {			
			String profilingFormat = strcat("[ProfilingV1;", property("btrace.agent"));
			printSnapshot("", snapshotAndReset(eurekaJProfiler), "[ProfilingV1;%1$s;%2$s;%3$s;%4$s;%5$s;%6$s;%7$s;%8$s;%9$s;%10$s;Custom]");
		}
}