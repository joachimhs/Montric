package org.eurekaj.cappuccino;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;
import org.json.JSONObject;

public class JSONServlet extends HttpServlet {
	
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// TODO Auto-generated method stub
		super.doGet(req, resp);
		doProcessJSON(req, resp);
	}
	
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// TODO Auto-generated method stub
		super.doPost(req, resp);
		doProcessJSON(req, resp);
	}
	
	private void doProcessJSON(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException {
		InputStream in = req.getInputStream();
	    BufferedReader r = new BufferedReader(new InputStreamReader(in));
	    
	    int numChars = 0;
	    String contents = "";
	    char[] buffer = new char[25];
	    while ((numChars = r.read(buffer)) > 0) {
	    	contents += new String(buffer);
	    	buffer = new char[25];
	    }
	    JSONObject jsonObject;
		try {
			jsonObject = new JSONObject(contents);
			System.out.println("Accepted JSON: \n" + jsonObject);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	    
	}
}
