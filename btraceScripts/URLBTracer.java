package org.eurekaj.btracers;

import com.sun.btrace.annotations.*;
import static com.sun.btrace.BTraceUtils.*;
import java.net.*;

@BTrace public class URLBTracer {
	@TLS private static URL url;

    @OnMethod(
        clazz="java.net.URL",
        method="openConnection"
    )
    public static void openURL(URL self) {
        url = self;
    }

    @OnMethod(
        clazz="java.net.URL",
        method="openConnection"
    )
    public static void openURL(URL self, Proxy p) {
        url = self;
    }

    @OnMethod(
        clazz="java.net.URL",
        method="openConnection",
        location=@Location(Kind.RETURN)
    )
    public static void openURL() {
        if (url != null) {
            println(strcat("open ", str(url)));
            url = null;
        }
    }
}