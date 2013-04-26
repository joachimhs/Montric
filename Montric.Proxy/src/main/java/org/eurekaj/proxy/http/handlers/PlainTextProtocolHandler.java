package org.eurekaj.proxy.http.handlers;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.http.examples.client.ClientGZipContentCompression;
import org.apache.log4j.Logger;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.proxy.StoreIncomingStatisticsElement;
import org.eurekaj.proxy.parser.ParseStatistics;

public class PlainTextProtocolHandler extends AbstractHandler {
	private static final Logger log = Logger.getLogger(PlainTextProtocolHandler.class);
	private ClientGZipContentCompression gzipClient;
	private String prepend;
	public PlainTextProtocolHandler(ClientGZipContentCompression gzipClient) {
		this.gzipClient = gzipClient;
		prepend = System.getProperty("org.eurekaj.proxy.prependPTPStatsWith", "");
		if (!prepend.endsWith(":")) {
			prepend += ":";
		}
	}
	
	/**
	 * This method will handle incoming PlainTextProtocol messages over HTTP. The contents will be passed on to EurekaJ Manager.
	 */
	@Override
	public void handle(String target, 
			Request baseRequest, 
			HttpServletRequest request, 
			HttpServletResponse response) throws IOException, ServletException {
		
		InputStream in = request.getInputStream();
        StringWriter writer = new StringWriter();
        IOUtils.copy(in, writer);
        String ptpString = writer.toString();
        String responseString = "";
        try {
        	List<StoreIncomingStatisticsElement> statElemList = parsePlainTextProtocol(ptpString);
        	String string = ParseStatistics.convertStatListToJson(statElemList, gzipClient.getPassword()).toString();
			int statusCode = gzipClient.sendGzipOverHttp(string);
			responseString = statElemList.size() + " records OK.";
			log.info("Sent PTP contents to EurekaJ. EurekaJ responded with status code: " + statusCode);
		} catch (Exception e) {
			responseString = "-1 Unable to parse and/or transmit records to EurekaJ";
		}
        
        log.info("Sending response back to PTP source: " + responseString);
		
        response.setContentType("text/html;charset=utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        baseRequest.setHandled(true);
        response.getWriter().println(responseString);
    }
	
	private List<StoreIncomingStatisticsElement> parsePlainTextProtocol(String ptpString) {
		List<StoreIncomingStatisticsElement> statElemList = new ArrayList<StoreIncomingStatisticsElement>();
		
		String[] lines = ptpString.split("\n");
		if (lines != null) {
			for (String line : lines) {
				StoreIncomingStatisticsElement elem = parsePtpLine(line);
				if (elem != null) {
					statElemList.add(elem);
				}
			}
		}
		
		return statElemList;
	}
	
	/**
	 * Parsing a PlainTextProtocol PUTVAL line and returning a populated instance of {@link StoreIncomingStatisticsElement}
	 * @param ptpLine
	 * @return {@link StoreIncomingStatisticsElement}
	 */
	private StoreIncomingStatisticsElement parsePtpLine(String ptpLine) {
		StoreIncomingStatisticsElement stat = null;
		String[] ptpParts = ptpLine.split(" ");
		if (ptpParts.length == 4) {
			stat = new StoreIncomingStatisticsElement();
			stat.setGuiPath(addPrependToGuiPath(ptpParts[1].replace("/", ":"), prepend));
			String[] timeVal = ptpParts[3].split(":");
			if (timeVal.length >= 2) {
				stat.setTimeperiod(parseDouble(timeVal[0]).longValue() / 15);
				stat.setValue(timeVal[1].trim());
			}
			stat.setValueType(ValueType.VALUE.value());
			stat.setUnitType(UnitType.N.value());
		}	
		
		return stat;
	}
	
	/**
	 * Prepending a EurekaJ Path to the PTP input. 
	 * @param guiPath
	 * @param prepend
	 * @return
	 */
	private static String addPrependToGuiPath(String guiPath, String prepend) {
		String newGuiPath = null;
		if (guiPath.contains(":")) {
			int index = guiPath.indexOf(":");
			newGuiPath = guiPath.substring(0, index +1) + prepend + guiPath.substring(index+1, guiPath.length());
		} else {
			newGuiPath = prepend + guiPath;
		}
		
		return newGuiPath;
	}
		
	public static Double parseDouble(String input) {
		Double val = null;
		
		try {
			val = Double.parseDouble(input);
		} catch (NumberFormatException nfe) {
			val = null;
		}
		
		return val;
	}
	
	public static Integer parseInteger(String input, Integer defaultInt) {
		Integer val = null;
		
		try {
			val = Integer.parseInt(input);
		} catch (NumberFormatException nfe) {
			val = defaultInt;
		}
		
		return val;
	}
	
}
