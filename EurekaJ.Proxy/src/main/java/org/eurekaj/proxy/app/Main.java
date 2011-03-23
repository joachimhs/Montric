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
import org.eurekaj.proxy.FileMatcher;
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
                List<File> scriptOutputfileList = FileMatcher.getScriptOutputFilesInDirectory(scriptPath);

                for (File scriptOutputfile : scriptOutputfileList) {
                    List<StoreIncomingStatisticsElement> statElemList = ParseStatistics.parseBtraceFile(scriptOutputfile);
                    client.storeIncomingStatistics(statElemList);
                    scriptOutputfile.delete();
                }
            } catch (IOException ioe) {
                ioe.printStackTrace();
            }

            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
		}
	}
	
	
}
