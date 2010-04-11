package org.eurekaj.proxy.app;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.namespace.QName;

import org.apache.cxf.interceptor.Fault;
import org.eurekaj.proxy.parser.StatisticsParser;
import org.eurekaj.webservice.EurekaJService;
import org.eurekaj.webservice.EurekaJServiceService;
import org.eurekaj.webservice.StoreIncomingStatisticsElement;

public class Main {
	private String scriptPath;
	private Pattern filePattern = Pattern.compile(".*\\d+");
	private static final QName SERVICE_NAME = new QName("http://webservice.eurekaj.org/", "EurekaJServiceService");
	private URL wsdlUrl;
	public static void main(String[] args) {
		if (args.length != 2 ) {
			System.out.println("Main needs two command line arguments. The path to look for BTrace outputfiles, and the EurekaJService URL");
		} else {
			Main main = new Main(args[0], args[1]);
		}
	}
	
	public Main(String scriptPath, String wsdlFileStr) {
        try {
        	wsdlUrl = new URL(wsdlFileStr);
        } catch (MalformedURLException e) {
            System.err.println("Unable to connect to Manager via : " + wsdlFileStr);
            e.printStackTrace();
            System.exit(1);
        }
        
        EurekaJServiceService ss = new EurekaJServiceService();//wsdlUrl, SERVICE_NAME);
        EurekaJService port = ss.getEurekaJServicePort();
        
		this.scriptPath = scriptPath;
		
		while (true) {
			File file = new File(scriptPath);
			if (file != null && file.exists() && file.isDirectory()) {
				for (File scriptFile : file.listFiles()) {
					String filename = scriptFile.getName();
					Matcher matcher = filePattern.matcher(filename);
					boolean match = matcher.matches();
					if (match) {
						Long startMillis = Calendar.getInstance().getTimeInMillis();
						System.out.println("Attemting to send file contents of file:  " + scriptFile.getName());
						try {
							//System.out.println((Calendar.getInstance().getTimeInMillis() - startMillis) + " :: Parsing contents...");
							List<StoreIncomingStatisticsElement> statElemList = parseBtraceFile(scriptFile);
							//System.out.println((Calendar.getInstance().getTimeInMillis() - startMillis) + " :: Finished parsing contents. Read " + statElemList.size() + " elements from file,");
							//System.out.println((Calendar.getInstance().getTimeInMillis() - startMillis) + " :: Sending elements over Webservice");
							port.storeIncomingStatistics(statElemList);
							//System.out.println((Calendar.getInstance().getTimeInMillis() - startMillis) + " :: Deleting file " + scriptFile.getName());
							scriptFile.delete();
							//System.out.println((Calendar.getInstance().getTimeInMillis() - startMillis) + " :: Finished with file\n\n");
						} catch (IOException e) {
							System.err.println(e.getMessage() + "Unable to parse or delete file: " + scriptFile.getName());
						} catch (Fault cxfFault) {
							System.err.println("Unable to send file contents to manager: " + cxfFault.getMessage());
						}
					}
				}
			} else {
				System.err.println("Argument is not a valid directory with BTrace Output files: " + scriptPath);
			}
			
			try {
				Thread.sleep(5000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
	}
	
	private List<StoreIncomingStatisticsElement> parseBtraceFile(File file) throws IOException {
		StatisticsParser parser = new StatisticsParser();
		List<StoreIncomingStatisticsElement> statElemList = new ArrayList<StoreIncomingStatisticsElement>();
		
		BufferedReader inStream = new BufferedReader(new FileReader(file));
		String line = inStream.readLine();
		while (line != null) {
			//Trim away start and end square brackets. 
			if (line.startsWith("[") && line.endsWith("]")) {
	    		line = line.substring(1, line.length()-1);
	    	} else {
	    		//If line does not start and end with square branckets, ignore line
	    		line = inStream.readLine();
	    		continue;
	    	}
	    	
	    	if (line.startsWith("ClassInstrumentation;")) {
	    		//Remove padding from line
	    		line = line.substring("ClassInstrumentation;".length());
	    		statElemList.addAll(parser.processClassInstrumentation(line));
	    	} else if (line.startsWith("TotalExecTime;")) {
	    		line = line.substring("TotalExecTime;".length());
	    		statElemList.addAll(parser.processExecTime(line));
	    	} else if (line.startsWith("CallsPerInterval;")) {
	    		line = line.substring("CallsPerInterval;".length());
	    		statElemList.addAll(parser.processCallsPerInterval(line));
	    	} else if (line.startsWith("ValueInstrumentation;")) {
	    		line = line.substring("ValueInstrumentation;".length());
	    		statElemList.addAll(parser.processValueInstrumentation(line));
	    	} else if (line.startsWith("HeapMemory;" )) {
	    		line = line.substring("HeapMemory;".length());
	    		statElemList.addAll(parser.processHeapMemory(line));
	    	} else if(line.startsWith("NonHeapMemory;")) {
	    		line = line.substring("NonHeapMemory;".length());
	    		statElemList.addAll(parser.processNonHeapMemory(line));
	    	} else if (line.startsWith("MemoryPool;")) {
	    		line = line.substring("MemoryPool;".length());
	    		statElemList.addAll(parser.processMemoryPool(line));
	    	} else if(line.startsWith("Threads;")) {
	    		line = line.substring("Threads;".length());
	    		statElemList.addAll(parser.processThreads(line));
	    	} else if (line.startsWith("GroupInstrumentation;")) {
	    		line = line.substring("GroupInstrumentation;".length());
	    		statElemList.addAll(parser.processGroupInstumentation(line));
	    	} else if (line.startsWith("ThreadType;")) {
	    		line = line.substring("ThreadType;".length());
	    		statElemList.addAll(parser.processThreadType(line));
	    	} else if (line.startsWith("GCTime;")) {
	    		line = line.substring("GCTime;".length());
	    		statElemList.addAll(parser.processGCTime(line));
	    	} else if (line.startsWith("ValueInstrumentation;")) {
	    		line = line.substring("ValueInstrumentation;".length());
	    		statElemList.addAll(parser.processValueInstumentation(line));
	    	} /*else if (line.startsWith("LogTracer;")) {
	    		line = line.substring("LogTracer;".length());
	    		statElemList.addAll(parser.processLogTrace(line));
	    	}*/
	    	line = inStream.readLine();
		}
		return statElemList;
	}
	
	
}
