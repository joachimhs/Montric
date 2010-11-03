package org.eurekaj.cappuccino;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.service.TreeMenuService;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class JSONController {
	private TreeMenuService berkeleyTreeMenuService;

	public TreeMenuService getBerkeleyTreeMenuService() {
		return berkeleyTreeMenuService;
	}

	public void setBerkeleyTreeMenuService(TreeMenuService berkeleyTreeMenuService) {
		this.berkeleyTreeMenuService = berkeleyTreeMenuService;
	}

	@RequestMapping(value = "/jsonController.capp", method = RequestMethod.POST)
	public void getJsonData(HttpServletRequest request, HttpServletResponse response) throws IOException, JSONException {
		JSONObject jsonResponse = new JSONObject();

		JSONObject jsonObject;
		jsonObject = extractRequestJSONContents(request);
		System.out.println("Accepted JSON: \n" + jsonObject);
		boolean getMenu = jsonObject.getBoolean("getInstrumentationMenu");
		if (getMenu) {
			jsonResponse.append("instrumentationMenu", BuildJsonObjectsUtil.buildTreeMenuJsonObject(berkeleyTreeMenuService.getTreeMenu()));
			//jsonResponse = BuildJsonObjectsUtil.buildTreeMenuJsonObject(berkeleyTreeMenuService.getTreeMenu());
			System.out.println("Got Tree Menu:\n" + jsonResponse.toString(3));
		}
		
		PrintWriter writer = response.getWriter();
		writer.write(jsonResponse.toString());
		response.flushBuffer();
	}

	private JSONObject extractRequestJSONContents(HttpServletRequest request) throws IOException, JSONException {
		JSONObject jsonRequestObject = null;

		InputStream in = request.getInputStream();

		BufferedReader r = new BufferedReader(new InputStreamReader(in));

		int numChars = 0;
		String contents = "";
		char[] buffer = new char[25];
		while ((numChars = r.read(buffer)) > 0) {
			contents += new String(buffer);
			buffer = new char[25];
		}

		if (contents.length() > 2) {
			jsonRequestObject = new JSONObject(contents);
		}

		return jsonRequestObject;
	}

}
