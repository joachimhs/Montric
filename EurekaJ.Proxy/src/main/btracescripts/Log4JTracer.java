package org.eurekaj.btracers;

import com.sun.btrace.AnyType;
import com.sun.btrace.annotations.*;
import static com.sun.btrace.BTraceUtils.*;

@BTrace public class Log4JTracer {
    @OnMethod(clazz="/org\\.apache\\.log4j\\.helpers\\..*/", method="write",
              location=@Location(value=Kind.CALL, clazz="/.*/", method="/.*/"))
    public static void n(@Self Object self, @ProbeClassName String pcm, @ProbeMethodName String pmn,
                         @TargetInstance Object instance, @TargetMethodOrField String method, String text) { // all calls to the info methods with signature "(String)"
		//print(strcat("Context: ", strcat(pcm, strcat("#", pmn)))); print(":"); println(method);
		print("[LogTracer;");
		print(property("btrace.agentname")); print(";");
		print(timeMillis()); print(";");
		print(str(text));
		println("]");
    }
} 
