package org.eurekaJ.agent;

import java.io.IOException;
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.Instrumentation;
import java.util.Hashtable;

import javassist.ClassPool;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.log4j.Logger;
import org.eurekaJ.agent.model.ClassInstrumentationInfo;
import org.eurekaJ.agent.model.MethodInstrumentation;
import org.eurekaJ.agent.statisticReporter.StatisticReporter;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class EurekaJAgentLauncher {

	private static Instrumentation instrumentation;
	private static Hashtable<String, ClassInstrumentationInfo> instrumentationHash = new Hashtable<String, ClassInstrumentationInfo>();
	private static Hashtable<String, ClassInstrumentationInfo> subtypeInstrumentationHash = new Hashtable<String, ClassInstrumentationInfo>();
	
	private static Logger log = Logger.getLogger(EurekaJAgentLauncher.class);
	
	public static void premain(String agentArgs, Instrumentation inst) {
		System.out.println("premain is called");
		
		String configFile = System.getProperties().getProperty("org.eurekaJ.configFile");
		log.debug("Starting with config file: " + configFile);
		
		if (System.getProperties().getProperty("org.eurekaJ.agentName") == null) {
			System.getProperties().setProperty("org.eurekaJ.agentName", "DefaulAgent");
		}
		
		if (System.getProperties().getProperty("org.eurekaJ.loggrollPort") == null) {
			System.getProperties().setProperty("org.eurekaJ.loggrollPort", "8008");
		}
		
		//Initialize the static variables we use to track information
		instrumentation = inst;
		
		try {
			//Parse agent config XML File
			DocumentBuilder builder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
			Document configDocument = builder.parse(configFile);
			Element root = configDocument.getDocumentElement();
			NodeList instrumentationsList = root.getElementsByTagName("instrumentation");
			for (int i = 0; i < instrumentationsList.getLength(); i++) {
				Element instrumentation = (Element)instrumentationsList.item(i);
				StringBuilder sb = new StringBuilder();
				String methodName = getNodeValue(instrumentation, "method");
				String classType = getNodeValue(instrumentation, "classType");
				
				ClassInstrumentationInfo cii = new ClassInstrumentationInfo(getNodeValue(instrumentation, "package"),
						getNodeValue(instrumentation, "class"),
						methodName,
						classType,
						getNodeValue(instrumentation, "path"),
						getNodeValue(instrumentation, "extends"),
						getNodeValue(instrumentation, "implements"));
				
				if (cii.getPackageName().endsWith("*")) { //Wildcard No need for classname
					sb.append(cii.getPackageName());
				} else {
					sb.append(cii.getPackageName()).append(".").append(cii.getClassName());
				}
				
				if (cii.isDoesImplement() || cii.isDoesExtend()) {
					ClassInstrumentationInfo oldCii = subtypeInstrumentationHash.get(sb.toString());
					if (oldCii != null) { //Add method to existing instrumentation
						oldCii.getMethodNameHash().put(methodName, new MethodInstrumentation(methodName, classType));
					} else { //Add new ClassInstrumentationInfo
						subtypeInstrumentationHash.put(sb.toString(), cii);
					}
				} else {
					ClassInstrumentationInfo oldCii = instrumentationHash.get(sb.toString());
					if (oldCii != null) { //Add method to existing instrumentation
						oldCii.getMethodNameHash().put(methodName, new MethodInstrumentation(methodName, classType));
					} else { //Add new ClassInstrumentationInfo
						instrumentationHash.put(sb.toString(), cii);
					}
				}
				
				
			}
		} catch (ParserConfigurationException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (SAXException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
			
		try {
			ClassPool.getDefault().getClassLoader().loadClass("org.eurekaJ.agent.EurekaJStringLogger");
			ClassPool.getDefault().getClassLoader().loadClass("org.eurekaJ.agent.statisticReporter.StatisticReporter");
			ClassPool.getDefault().getClassLoader().loadClass("org.eurekaJ.agent.model.CallStackTraceBuilderFactory");
			ClassPool.getDefault().getClassLoader().loadClass("org.eurekaJ.agent.model.CallStackTraceBuilder");
			ClassPool.getDefault().getClassLoader().loadClass("org.eurekaJ.agent.model.CallStackTraceBuilderState");
			ClassPool.getDefault().getClassLoader().loadClass("org.eurekaJ.agent.model.ClassInstrumentationInfo");
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		StatisticReporter rep = new StatisticReporter();
		rep.start();
		
		ClassFileTransformer trans = new EurekaJTransformer();
		instrumentation.addTransformer(trans);
	}
	
	private static String getNodeValue(Element elem, String subelemName) {
		String nodeValue = null;
		NodeList nodeList = elem.getElementsByTagName(subelemName);
		if (nodeList.getLength() == 1) {
			Element packageElem = (Element)nodeList.item(0);
			if (packageElem.getFirstChild() != null && packageElem.getFirstChild().getNodeValue() != null) {
				nodeValue = packageElem.getFirstChild().getNodeValue();
			}
		} 

		return nodeValue;
	}
	
	public static Hashtable<String, ClassInstrumentationInfo> getInstrumentationHash() {
		return instrumentationHash;
	}
	
	public static Hashtable<String, ClassInstrumentationInfo> getSubtypeInstrumentationHash() {
		return subtypeInstrumentationHash;
	}
}
