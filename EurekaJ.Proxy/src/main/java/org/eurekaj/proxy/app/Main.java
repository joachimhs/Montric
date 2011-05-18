package org.eurekaj.proxy.app;

import org.apache.http.examples.client.ClientGZipContentCompression;
import org.eurekaj.proxy.FileMatcher;
import org.eurekaj.proxy.parser.ParseStatistics;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.regex.Pattern;

public class Main {
	private String scriptPath;
	private Pattern filePattern = Pattern.compile(".*\\d+");

    public static void main(String[] args) {
		if (args.length != 2 ) {
			System.out.println("Main needs two command line arguments. The path to look for BTrace outputfiles, and the EurekaJService URL");
		} else {
			Main main = new Main(args[0], args[1]);
		}
	}
	
	public Main(String scriptPath, String endpointUrl) {        
		this.scriptPath = scriptPath;
		
		while (true) {
            try {
                List<File> scriptOutputfileList = FileMatcher.getScriptOutputFilesInDirectory(scriptPath);

                for (File scriptOutputfile : scriptOutputfileList) {
                    String json = ParseStatistics.parseBtraceFile(scriptOutputfile);
                    System.out.println("Attempting to send JSON contents of: " + scriptOutputfile.getName() + " length: " + json.length());
                    ClientGZipContentCompression gzipClient = new ClientGZipContentCompression();
                    int statusCode = gzipClient.sendGzipOverHttp(endpointUrl, json);
                    if (statusCode != 200) {
                        System.out.println("Unable to send JSON data. Status Code: " + statusCode + " contents:\n" + json);
                    }
                    //System.out.println(json);
                    scriptOutputfile.delete();
                }
            } catch (IOException ioe) {
                ioe.printStackTrace();
            } catch (Exception e) {
                e.printStackTrace();;
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
