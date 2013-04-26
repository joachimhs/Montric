package org.eurekaJ.agent;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.concurrent.TimeUnit;

public class TopAgent {
	private String agentName;
	private PrintWriter writer;
	private String outputFilename;
	
	public static void main(String args[]) {
		String agentName = "";
		String outputFilename = null;
		
		if (args.length >= 1) {
			outputFilename = args[0];
			
			if (args.length != 2) {
				System.err.println("No Agent name specified as second commandline argument. Using the local hostname as agentname");
				
				try {
					agentName=InetAddress.getLocalHost().getHostName();
				} catch (UnknownHostException e) {
					System.err.println("Unable to get Host information. Terminating: " + e.getMessage());
					System.exit(-1);
				}
			} else {
				agentName = args[0];
			}
		} else {
			System.err.println("To run the agent, you need at least one commandline argument specifying where to output data");
			System.exit(-1);
		}
		
		TopAgent agent = null;
		try {
			agent = new TopAgent(agentName, outputFilename);
		} catch (IOException e1) {
			System.err.println("Unable to create output file: " + outputFilename);
			System.exit(-1);
		}
		
		while (true) {
			agent.getCPUInformation();
			try {
				Thread.sleep(5000);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
    }
	
	public TopAgent(String agentName, String outputFileName) throws IOException {
		this.writer = new PrintWriter(new BufferedWriter(new FileOutputWriter(new File(outputFileName), 100)));
		this.agentName = agentName;
	}
	
	private void getCPUInformation() {
		try {
        	Long timePeriod = ((long)(System.nanoTime() / 15000000000l)*15000);
        	
            Runtime rt = Runtime.getRuntime();
            //Process pr = rt.exec("cmd /c dir");
            Process pr = rt.exec("/usr/bin/top -l 1");

            BufferedReader input = new BufferedReader(new InputStreamReader(pr.getInputStream()));

            String line=null;
            Double usagePercent = 0.0d;
            Double systemPercent = 0.0d;
            Double idlePercent = 0.0d;
            
            while((line=input.readLine()) != null) {
            	if (line.startsWith("CPU usage: ")) {
            		usagePercent = parseUsagePercent(line);
            		systemPercent = parseSystemPercent(line);
            		idlePercent = parseIdlePercent(line);
            	}
            }

            StringBuffer usedPercentSB = new StringBuffer();
            usedPercentSB.append("[ValueInstrumentation;")
            	.append(agentName)
            	.append(";CPU")
            	.append(";Used_%;")
            	.append(usagePercent.longValue()).append(";")
            	.append(timePeriod).append("]");
            
            StringBuffer systemPercentSB = new StringBuffer();
            systemPercentSB.append("[ValueInstrumentation;")
            	.append(agentName)
            	.append(";CPU")
            	.append(";System_%;")
            	.append(systemPercent.longValue()).append(";")
            	.append(timePeriod).append("]");
            
            StringBuffer idlePercentSB = new StringBuffer();
            idlePercentSB.append("[ValueInstrumentation;")
            	.append(agentName)
            	.append(";CPU")
            	.append(";Idle_%;")
            	.append(idlePercent.longValue()).append(";")
            	.append(timePeriod).append("]");
            
            writer.println(usedPercentSB.toString());
            writer.println(systemPercentSB.toString());
            writer.println(idlePercentSB.toString());
            writer.flush();

        } catch(Exception e) {
            System.out.println(e.toString());
            e.printStackTrace();
        }
	}
	
	private Double parseUsagePercent(String line) {
		Double usage = 0.0d;
		
		if (line.startsWith("CPU usage: ")) {
        	String[] cpuParams = line.split(" ");
        	if (cpuParams.length == 8 && cpuParams[2].endsWith("%")) {
        		usage = Double.parseDouble(cpuParams[2].substring(0, cpuParams[2].length() -1));
        		return usage;
        	}
        }
		
		return usage;
	}
	
	
	
	private Double parseSystemPercent(String line) {
		Double usage = 0.0d;
		
		if (line.startsWith("CPU usage: ")) {
        	String[] cpuParams = line.split(" ");
        	if (cpuParams.length == 8 && cpuParams[4].endsWith("%")) {
        		usage = Double.parseDouble(cpuParams[4].substring(0, cpuParams[4].length() -1));
        		return usage;
        	}
        }
		
		return usage;
	}
	
	private Double parseIdlePercent(String line) {
		Double usage = 0.0d;
		
		if (line.startsWith("CPU usage: ")) {
        	String[] cpuParams = line.split(" ");
        	if (cpuParams.length == 8 && cpuParams[6].endsWith("%")) {
        		usage = Double.parseDouble(cpuParams[6].substring(0, cpuParams[6].length() -1));
        		return usage;
        	}
        }
		
		return usage;
	}
}
