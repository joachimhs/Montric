package org.eurekaJ.agent;

import java.io.BufferedReader;
import java.io.InputStreamReader;

public class TestTop {

	public static void main(String args[]) {
		 
        try {
            Runtime rt = Runtime.getRuntime();
            //Process pr = rt.exec("cmd /c dir");
            Process pr = rt.exec("/usr/bin/top -l 1");

            BufferedReader input = new BufferedReader(new InputStreamReader(pr.getInputStream()));

            String line=null;

            while((line=input.readLine()) != null) {
                System.out.println(line);
            }

            int exitVal = pr.waitFor();
            System.out.println("Exited with error code "+exitVal);

        } catch(Exception e) {
            System.out.println(e.toString());
            e.printStackTrace();
        }
    }
}
