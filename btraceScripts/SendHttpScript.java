package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import com.sun.btrace.aggregation.*;
import static com.sun.btrace.BTraceUtils.*;

@BTrace public class SendHttpScript {

	@OnTimer(15000)
	public static void sendLoggedContents() {
		sendScriptOutputOverHttp(strcat("http://", property("eurekaj.manager.host")), property("eurekaj.manager.path"), property("eurekaj.manager.port") );
	}

}
