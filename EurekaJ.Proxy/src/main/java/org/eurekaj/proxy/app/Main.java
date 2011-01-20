package org.eurekaj.proxy.app;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.ConnectException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.namespace.QName;
import javax.xml.ws.soap.SOAPFaultException;

import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.interceptor.LoggingInInterceptor;
import org.apache.cxf.interceptor.LoggingOutInterceptor;
import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
import org.eurekaj.proxy.parser.ParseStatistics;
import org.eurekaj.webservice.EurekaJService;
import org.eurekaj.webservice.StoreIncomingStatisticsElement;

public class Main {
	private String scriptPath;
	private Pattern filePattern = Pattern.compile(".*\\d+");
	private static final QName SERVICE_NAME = new QName("http://eurekaJService.ws.eurekaJ.org/", "EurekaJServiceService");
	private URL wsdlUrl;
	public static void main(String[] args) {
		if (args.length != 2 ) {
			System.out.println("Main needs two command line arguments. The path to look for BTrace outputfiles, and the EurekaJService URL");
		} else {
			Main main = new Main(args[0], args[1]);
		}
	}
	
	public Main(String scriptPath, String endpointUrl) {        
        JaxWsProxyFactoryBean factory = new JaxWsProxyFactoryBean();

    	//factory.getInInterceptors().add(new LoggingInInterceptor());
    	//factory.getOutInterceptors().add(new LoggingOutInterceptor());
    	factory.setServiceClass(EurekaJService.class);
    	factory.setAddress(endpointUrl);
    	EurekaJService client = (EurekaJService) factory.create();        
        
		this.scriptPath = scriptPath;
		
		while (true) {
			try {
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
								List<StoreIncomingStatisticsElement> statElemList = parseBtraceFile(scriptFile);
								client.storeIncomingStatistics(statElemList);
								scriptFile.delete();
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
			} catch (Fault cxfFault) {
				System.err.println("Unable to send contents over WebService. Retrying in 5 seconds. " + cxfFault.getMessage());
                cxfFault.printStackTrace();
			} catch (SOAPFaultException soapFault) {
				System.err.println("Unable to send contents over WebService. Retrying in 5 seconds. " + soapFault.getMessage());
                soapFault.printStackTrace();
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
		ParseStatistics parser = new ParseStatistics();
		List<StoreIncomingStatisticsElement> statElemList = new ArrayList<StoreIncomingStatisticsElement>();
		
		BufferedReader inStream = new BufferedReader(new FileReader(file));
		String line = inStream.readLine();
		while (line != null) {
			//Trim away start and end square brackets. 
			if (line.startsWith("[") && line.endsWith("]")) {
	    		line = line.substring(1, line.length()-1);
	    	} else {
	    		//If line does not start and end with square brackets, ignore line
	    		line = inStream.readLine();
	    		continue;
	    	}
	    	
			
			if (line.startsWith("Value;")) {
	    		line = line.substring("Value;".length());
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
	    	} else if (line.startsWith("GCTime;")) {
	    		line = line.substring("GCTime;".length());
	    		statElemList.addAll(parser.processGCTime(line));
	    	} else if (line.startsWith("ProfilingV1;")) {
	    		line = line.substring("ProfilingV1;".length());
	    		statElemList.addAll(parser.processBtraceProfiling(line));
	    	} 
	    	
	    	//[ThreadsReturnedByType;JSFlotAgent;java.lang.Thread;5;1272278445000]
	    	//[ThreadsStartedByType;JSFlotAgent;java.util.TimerThread;1;1272278445000]

	    	/*else if (line.startsWith("LogTracer;")) {
	    		line = line.substring("LogTracer;".length());
	    		statElemList.addAll(parser.processLogTrace(line));
	    	}*/
	    	line = inStream.readLine();
		}
		return statElemList;
	}
	
	
}
