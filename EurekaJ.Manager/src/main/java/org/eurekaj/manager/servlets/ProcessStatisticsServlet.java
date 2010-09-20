package org.eurekaJ.manager.servlets;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eurekaJ.manager.service.StatisticsParser;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

public class ProcessStatisticsServlet extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// TODO Auto-generated method stub
		System.out.println("**********");
		System.out.println("Entering doPost()");
		
		WebApplicationContext wac = WebApplicationContextUtils.getWebApplicationContext(getServletContext());
		StatisticsParser statisticsParser = (StatisticsParser)wac.getBean("statisticsParser");
		
		InputStream in = req.getInputStream();
	    BufferedReader r = new BufferedReader(new InputStreamReader(in));
	    
	    int numLines = 0;
	    String line;
	    while ((line = r.readLine())!=null) {
	    	line = line.trim();
	    	numLines++;
	    	if (line.startsWith("[") && line.endsWith("]")) {
	    		line = line.substring(1, line.length()-1);
	    	} else {
	    		continue;
	    	}
	    	
	    	if (line.startsWith("ClassInstrumentation;")) {
	    		//Remove padding from line
	    		line = line.substring("ClassInstrumentation;".length());
				statisticsParser.processClassInstrumentation(line);
	    	} else if (line.startsWith("TotalExecTime;")) {
	    		line = line.substring("TotalExecTime;".length());
	    		statisticsParser.processExecTime(line);
	    	} else if (line.startsWith("CallsPerInterval;")) {
	    		line = line.substring("CallsPerInterval;".length());
	    		statisticsParser.processCallsPerInterval(line);
	    	} else if (line.startsWith("ValueInstrumentation;")) {
	    		line = line.substring("ValueInstrumentation;".length());
	    		statisticsParser.processValueInstrumentation(line);
	    	} else if (line.startsWith("HeapMemory;" )) {
	    		line = line.substring("HeapMemory;".length());
	    		statisticsParser.processHeapMemory(line);
	    	} else if(line.startsWith("NonHeapMemory;")) {
	    		line = line.substring("NonHeapMemory;".length());
	    		statisticsParser.processNonHeapMemory(line);
	    	} else if (line.startsWith("MemoryPool;")) {
	    		line = line.substring("MemoryPool;".length());
	    		statisticsParser.processMemoryPool(line);
	    	} else if(line.startsWith("Threads;")) {
	    		line = line.substring("Threads;".length());
	    		statisticsParser.processThreads(line);
	    	} else if (line.startsWith("GroupInstrumentation;")) {
	    		line = line.substring("GroupInstrumentation;".length());
	    		statisticsParser.processGroupInstumentation(line);
	    	} else if (line.startsWith("ThreadType;")) {
	    		line = line.substring("ThreadType;".length());
	    		statisticsParser.processThreadType(line);
	    	} else if (line.startsWith("GCTime;")) {
	    		line = line.substring("GCTime;".length());
	    		statisticsParser.processGCTime(line);
	    	} else if (line.startsWith("ValueInstrumentation;")) {
	    		line = line.substring("ValueInstrumentation;".length());
	    		statisticsParser.processValueInstumentation(line);
	    	} else if (line.startsWith("LogTracer;")) {
	    		line = line.substring("LogTracer;".length());
	    		statisticsParser.processLogTrace(line);
	    	}
	    	
	    	/* else if (line.startsWith("CallStacktrace: ")) {
	    		line = line.substring("CallStacktrace: ".length());
	    		statisticsParser.processCallStacktrace(line);
	    	} else if (line.startsWith("HeapMemory: " )) {
	    		line = line.substring("HeapMemory: ".length());
	    		statisticsParser.processHeapMemory(line);
	    	} else if(line.startsWith("NonHeapMemory: ")) {
	    		line = line.substring("NonHeapMemory: ".length());
	    		statisticsParser.processNonHeapMemory(line);
	    	} else if (line.startsWith("MemoryPool: ")) {
	    		line = line.substring("MemoryPool: ".length());
	    		statisticsParser.processMemoryPool(line);
	    	} else if(line.startsWith("Threads: ")) {
	    		line = line.substring("Threads: ".length());
	    		statisticsParser.processThreads(line);
	    	} else if (line.startsWith("ThreadType: ")) {
	    		line = line.substring("ThreadType: ".length());
	    		statisticsParser.processThreadType(line);
	    	} else if (line.startsWith("GroupInstrumentation: ")) {
	    		line = line.substring("GroupInstrumentation: ".length());
	    		statisticsParser.processGroupInstumentation(line);
	    	} else if (line.startsWith("ValueInstrumentation: ")) {
	    		line = line.substring("ValueInstrumentation: ".length());
	    		statisticsParser.processValueInstumentation(line);
	    	}*/
		}
		
	    /*try {
			statisticsService.deleteOldLiveStatistics(1l);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}*/
		
		System.out.println("**********" + numLines);
	}
	
}
