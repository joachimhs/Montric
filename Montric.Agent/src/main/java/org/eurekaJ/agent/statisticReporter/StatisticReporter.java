package org.eurekaJ.agent.statisticReporter;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.lang.management.ClassLoadingMXBean;
import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.MemoryPoolMXBean;
import java.lang.management.MemoryUsage;
import java.lang.management.ThreadMXBean;
import java.net.Socket;
import java.util.Calendar;
import java.util.List;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.log4j.FileAppender;
import org.apache.log4j.Logger;
import org.apache.log4j.PatternLayout;
import org.apache.log4j.varia.ExternallyRolledFileAppender;
import org.eurekaJ.agent.EurekaJStringLogger;

public class StatisticReporter extends Thread {
	private static Logger log = Logger.getLogger(StatisticReporter.class);
	private static boolean firstStart = true;
	private long lastGcCollectionCount = 0;
	private long lastGcCollectionTime = 0;
	private long msSpentInGC = 0;
	private long statsLastReported = 0;

	public StatisticReporter() {
		log.getAppender("EurekaJAgentLogger");
		try {
			log.addAppender(new FileAppender(new PatternLayout(), "eurekaJtestlogfile.log", true));

		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void run() {
		System.out.println("starting StatisticsReporter");
		while (true) {
			if (firstStart) {
				// If application is just started, wait 25 seconds before
				// anything happens in this Thread.
				try {
					Thread.sleep(25000);
				} catch (InterruptedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				firstStart = false;
			}
			try {
				String agentName = System.getProperties().getProperty("org.eurekaJ.agentName");
				Long millis = Calendar.getInstance().getTimeInMillis() - 5;
				millis = ((long)(millis / 15000)) * 15000; //Round down to nearest 15 second period 00, 15, 30, 45
				
				ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
				// System.out.println("Number of threads currently active: " +
				// threadBean.getThreadCount());
				long[] ids = threadBean.getAllThreadIds();
				EurekaJStringLogger.appendToBuffer("Threads: " + agentName + " " + threadBean.getThreadCount() + " " + threadBean.getPeakThreadCount() + " "
						+ threadBean.getTotalStartedThreadCount() + " " + millis);

				/*
				 * Hashtable<String, Long> threadTypes = new Hashtable<String,
				 * Long>(); for (long id : ids) { ThreadInfo ti =
				 * threadBean.getThreadInfo(id);
				 * 
				 * Long numThreads = threadTypes.get(ti.getClass().getName());
				 * if (numThreads == null) { numThreads = 1l; } else {
				 * numThreads += 1l; } threadTypes.put(ti.getClass().getName(),
				 * numThreads); }
				 * 
				 * for (String key : threadTypes.keySet()) { Long val =
				 * threadTypes.get(key);
				 * EurekaJStringLogger.appendToBuffer("ThreadType: " + key + " "
				 * + val + " " + millis); }
				 */
				
				long timeSpentInGc = 0;
				long diffGcCount = 0;
				List<GarbageCollectorMXBean> gcBeanList = ManagementFactory.getGarbageCollectorMXBeans();
				long totalGcCollectionTime = 0;
				long totalGcCollectionCount = 0;
				for (GarbageCollectorMXBean gcBean : gcBeanList) {
					totalGcCollectionTime += gcBean.getCollectionTime();
					totalGcCollectionCount += gcBean.getCollectionCount();
				}
				
				if (totalGcCollectionCount > lastGcCollectionCount) {
					//There have been at least one GC
					diffGcCount = totalGcCollectionCount - lastGcCollectionCount;
	            	long diffGcTime = totalGcCollectionTime - lastGcCollectionTime;
	            	long diffExectime = millis - statsLastReported;
	            	
	            	//Calculate time spent in GC since last time.
	            	if (diffGcTime > 0) {
	            		timeSpentInGc = (diffExectime / diffGcTime) * 100;
	            	}
	            	
	            	lastGcCollectionCount = totalGcCollectionCount;
	            	lastGcCollectionTime = totalGcCollectionTime;
	            	statsLastReported = millis;
	            	msSpentInGC = diffGcTime;
				}
				
				EurekaJStringLogger.appendToBuffer("GCTime: " + agentName + " " + diffGcCount + " " + timeSpentInGc + " " + msSpentInGC + " " + millis);
				
				MemoryMXBean memBean = ManagementFactory.getMemoryMXBean();
				MemoryUsage heapMemUsage = memBean.getHeapMemoryUsage();

				EurekaJStringLogger.appendToBuffer("HeapMemory: " + agentName + " " + heapMemUsage.getMax() + " " + heapMemUsage.getUsed() + " "
						+ heapMemUsage.getCommitted() + " " + heapMemUsage.getInit() + " " + millis);

				MemoryUsage nonHeapMemUsage = memBean.getNonHeapMemoryUsage();
				EurekaJStringLogger.appendToBuffer("NonHeapMemory: " + agentName + " " + nonHeapMemUsage.getMax() + " " + nonHeapMemUsage.getUsed() + " "
						+ nonHeapMemUsage.getCommitted() + " " + nonHeapMemUsage.getInit() + " " + millis);

				EurekaJStringLogger.appendToBuffer("ObjectsPendingFinalization: " + agentName + " " + memBean.getObjectPendingFinalizationCount());

				List<MemoryPoolMXBean> memPoolList = ManagementFactory.getMemoryPoolMXBeans();
				for (MemoryPoolMXBean memPool : memPoolList) {
					EurekaJStringLogger.appendToBuffer("MemoryPool: " + agentName + " " + memPool.getName().replaceAll(" ", "_") + " "
							+ memPool.getUsage().getMax() + " " + memPool.getUsage().getUsed() + " " + memPool.getUsage().getCommitted() + " "
							+ memPool.getUsage().getInit() + " " + millis);
				}

				ClassLoadingMXBean classLoadingBean = ManagementFactory.getClassLoadingMXBean();
				EurekaJStringLogger.appendToBuffer("Classloader: " + agentName + " " + classLoadingBean.getTotalLoadedClassCount() + " "
						+ classLoadingBean.getLoadedClassCount() + " " + classLoadingBean.getUnloadedClassCount());
				
				List<GarbageCollectorMXBean> cgBeans = ManagementFactory.getGarbageCollectorMXBeans();
				for (GarbageCollectorMXBean cgBean : cgBeans) {
					System.out.println("CarbageCollection: " + cgBean.getName() + " " + cgBean.getCollectionCount() + " " + cgBean.getCollectionTime());
					String[] memPoolNames = cgBean.getMemoryPoolNames();
					for (String memPool : memPoolNames) {
						echo("\t: " + memPool);
					}
				}
				
				
				

//				MBeanServer mbeanServer = ManagementFactory.getPlatformMBeanServer();
//				Set<ObjectInstance> mbeans = mbeanServer.queryMBeans(null, null); // Get
//				// //
//				// all
//				// //
//				// MBEANS
//				for (ObjectInstance mbean : mbeans) {
//					mbean.getObjectName();
//					MBeanInfo info = mbeanServer.getMBeanInfo(mbean.getObjectName());
//
//					echo("\n****************************\nCLASSNAME: \t" + info.getClassName());
//					echo("DESCRIPTION: \t" + info.getDescription());
//					echo("\tATTRIBUTES");
//					MBeanAttributeInfo[] attrInfo = info.getAttributes();
//					if (attrInfo.length > 0) {
//						for (int i = 0; i < attrInfo.length; i++) {
//							Object attribute = mbeanServer.getAttribute(mbean.getObjectName(), attrInfo[i].getName());
//							echo("\t\t ** NAME: \t" + attrInfo[i].getName());
//							echo("\t\t    DESCR: \t" + attrInfo[i].getDescription());
//							echo("\t\t    TYPE: \t" + attrInfo[i].getType() + "\tREAD: " + attrInfo[i].isReadable() + "\tWRITE: " + attrInfo[i].isWritable());
//							echo("\t\t    VALUE: \t" + attribute);
//						}
//					} else
//						echo("\t\t ** No attributes **");
//					echo("\tCONSTRUCTORS");
//					MBeanConstructorInfo[] constrInfo = info.getConstructors();
//					for (int i = 0; i < constrInfo.length; i++) {
//						echo("\t\t ** NAME: \t" + constrInfo[i].getName());
//						echo("\t\t    DESCR: \t" + constrInfo[i].getDescription());
//						echo("\t\t    PARAM: \t" + constrInfo[i].getSignature().length + " parameter(s)");
//					}
//					echo("\tOPERATIONS");
//					MBeanOperationInfo[] opInfo = info.getOperations();
//					if (opInfo.length > 0) {
//						for (int i = 0; i < opInfo.length; i++) {
//							echo("\t\t ** NAME: \t" + opInfo[i].getName());
//							echo("\t\t    DESCR: \t" + opInfo[i].getDescription());
//							echo("\t\t    PARAM: \t" + opInfo[i].getSignature().length + " parameter(s)");
//						}
//					} else
//						echo("\t\t ** No operations ** ");
//					echo("\tNOTIFICATIONS");
//					MBeanNotificationInfo[] notifInfo = info.getNotifications();
//					if (notifInfo.length > 0) {
//						for (int i = 0; i < notifInfo.length; i++) {
//							echo("\t\t ** NAME: \t" + notifInfo[i].getName());
//							echo("\t\t    DESCR: \t" + notifInfo[i].getDescription());
//							String notifTypes[] = notifInfo[i].getNotifTypes();
//							for (int j = 0; j < notifTypes.length; j++) {
//								echo("\t\t\t    TYPE: \t" + notifTypes[j]);
//							}
//						}
//					} else
//						echo("\t\t ** No notifications **");

					/*
					 * MBeanAttributeInfo[] mattrArray = info.getAttributes();
					 * for (MBeanAttributeInfo mattr : mattrArray) {
					 * System.out.println("\tJMX: " + mbean.getObjectName() +
					 * " " + mattr.getName() + " " + mattr.getType()); Object
					 * attribute = mbeanServer.getAttribute(
					 * mbean.getObjectName(), mattr.getName());
					 * System.out.println("\t\t: " + attribute.toString());
					 * 
					 * if (mattr.getType().equals("java.lang.String")) {
					 * System.out.println("\t\t\t: " +
					 * mbeanServer.getAttribute(mbean.getObjectName(),
					 * attribute.toString())); }
					 * 
					 * }
					 */

				/*
				 * JMXServiceURL jmxurl = newJMXServiceURL(
				 * "service:jmx:rmi://127.0.0.1/jndi/rmi://127.0.0.1:1090/jmxconnector"
				 * ); JMXConnector connector =
				 * JMXConnectorFactory.connect(jmxurl); MBeanServerConnection
				 * jmxServer = connector.getMBeanServerConnection(); String[]
				 * domains = jmxServer.getDomains(); for (String domain :
				 * domains) { System.out.println("\tJMXDomain: " + domain); }
				 */

			} catch (Exception e) {
				e.printStackTrace();
			}

			// Sleep for 7,5 seconds before sending over statistics.
			try {
				Thread.sleep(7500);
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

			EurekaJStringLogger.getAndClearBufferContents();
			EurekaJStringLogger.logAndClearGroupStat();
			EurekaJStringLogger.logValueStat();
			if (roll()) {

				// System.out.println("**********************");
				// System.out.println("Trasferring statistics to server");
				// System.out.println("**********************");
				// String bufferContents =
				// EurekaJStringLogger.getAndClearBufferContents();

				// System.out.println("Sending Buffer to Server. " +
				// bufferContents.length() + " characters.");

				try {
					File f = new File("agentLogfile.log.1");
					log.debug("File Length = " + f.length());

					PostMethod postMethod = new PostMethod("http://eurekajdemo.haagen.name:8092/ProcessStatisticsServlet");
					postMethod.setRequestBody(new FileInputStream(f));
					postMethod.setRequestHeader("Content-type", "text/plain; charset=UTF-8");

					HttpClient client = new HttpClient();

					int statusCode1 = client.executeMethod(postMethod);

					String response = postMethod.getResponseBodyAsString();
					log.debug("Response from Manger: " + statusCode1 + " response: " + response);

					log.debug("statusLine>>>" + postMethod.getStatusLine());
					postMethod.releaseConnection();
					f.delete();

				} catch (IOException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}
			}
		}
	}

	private void echo(String echo) {
		System.out.println(echo);
	}

	public boolean roll() {
		boolean rolled = false;

		String portStr = System.getProperties().getProperty("org.eurekaJ.loggrollPort");
		int port = -1;
		try {
			port = Integer.parseInt(portStr);
		} catch (NumberFormatException nfe) {
			port = 8008;
		}

		try {
			Socket socket = new Socket("localhost", port);
			DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
			DataInputStream dis = new DataInputStream(socket.getInputStream());
			dos.writeUTF(ExternallyRolledFileAppender.ROLL_OVER);
			String rc = dis.readUTF();
			if (ExternallyRolledFileAppender.OK.equals(rc)) {
				System.out.println("Roll over signal acknowledged by remote appender.");
				rolled = true;
			} else {
				System.out.println("Unexpected return code " + rc + " from remote entity.");
			}
		} catch (IOException e) {
			System.out.println("Could not send roll signal on host localhost:8008." + e);
		}

		return rolled;
	}
}
