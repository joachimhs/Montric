package org.eurekaj.manager.servlets;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eurekaj.manager.berkeley.statistics.LiveStatistics;
import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.perst.alert.Alert;
import org.eurekaj.manager.perst.statistics.GroupedStatistics;
import org.eurekaj.manager.service.TreeMenuService;
import org.eurekaj.manager.util.ChartUtil;
import org.jsflot.xydata.XYDataList;
import org.jsflot.xydata.XYDataSetCollection;
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
		String jsonResponse = "";

		JSONObject jsonObject;
		jsonObject = extractRequestJSONContents(request);
		System.out.println("Accepted JSON: \n" + jsonObject);
		if (jsonObject.has("getInstrumentationMenu")) {
			String menuId = jsonObject.getString("getInstrumentationMenu");
			jsonResponse = buildInstrumentationMenu(menuId);
			System.out.println("Got Tree Type Menu:\n" + jsonResponse);
		}
		
		if (jsonObject.has("getInstrumentationTree")) {
			JSONObject keyObject = jsonObject.getJSONObject("getInstrumentationTree");
			String menuId = keyObject.getString("id");
			String path = keyObject.getString("path");
			
			List<TreeMenuNode> menuList = new ArrayList<TreeMenuNode>();
			for (TreeMenuNode node : berkeleyTreeMenuService.getTreeMenu()) {
				if (node.getGuiPath().startsWith(path)) {
					menuList.add(new TreeMenuNode(node.getGuiPath().substring(path.length()+1), node.getNodeLive()));
				}
			}
			jsonResponse = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject(menuId, menuList, 0, 15).toString();
			//jsonResponse = BuildJsonObjectsUtil.buildTreeMenuJsonObject(berkeleyTreeMenuService.getTreeMenu());
			System.out.println("Got Tree Menu:\n" + jsonResponse);
		}
		
		if (jsonObject.has("getInstrumentationChartList")) {
			JSONObject keyObject = jsonObject.getJSONObject("getInstrumentationChartList");
			String listId = keyObject.getString("id");
			String path = keyObject.getString("path");
			
			List<TreeMenuNode> leafList = new ArrayList<TreeMenuNode>();
			for (TreeMenuNode node : berkeleyTreeMenuService.getTreeMenu()) {
				if (node.getGuiPath().startsWith(path)) {
					leafList.add(new TreeMenuNode(node.getGuiPath(), node.getNodeLive()));
				}
			}
			
			GroupedStatistics groupedStatistics = berkeleyTreeMenuService.getGroupedStatistics(path);
			
			jsonResponse = BuildJsonObjectsUtil.buildLeafNodeList(listId, path, leafList, groupedStatistics).toString();
			System.out.println("Got Chart List:\n" + jsonResponse);
			
		}
		
		if (jsonObject.has("getInstrumentationChartData")) {
			JSONObject keyObject = jsonObject.getJSONObject("getInstrumentationChartData");
			String chartId = keyObject.getString("id");
			String path = keyObject.getString("path");
			
			Calendar nowCal = Calendar.getInstance();
			Calendar thenCal = Calendar.getInstance();
			thenCal.add(Calendar.MINUTE, 15 * -1);
			Long fromPeriod = thenCal.getTime().getTime() / 15000;
			Long toPeriod = nowCal.getTime().getTime() / 15000;
			
			List<LiveStatistics> liveList = berkeleyTreeMenuService.getLiveStatistics(path, fromPeriod, toPeriod);
			Collections.sort(liveList);
			GroupedStatistics groupedStatistics = berkeleyTreeMenuService.getGroupedStatistics(path);
			XYDataSetCollection valueCollection = new XYDataSetCollection();
			
			if (groupedStatistics != null) {
				//There are grouped statistics, all must be added to the chart
				for (String gsPath : groupedStatistics.getGroupedPathList()) {
					liveList = berkeleyTreeMenuService.getLiveStatistics(gsPath, fromPeriod, toPeriod);
					Collections.sort(liveList);
					String seriesLabel = gsPath;
					if (gsPath.length() > path.length() + 1) {
						seriesLabel = gsPath.substring(path.length() + 1, gsPath.length());
					}
					for (XYDataList dataList : ChartUtil.generateDataset(liveList, seriesLabel, null, thenCal.getTime(), nowCal.getTime(), 15).getDataList()) {
						valueCollection.addDataList(dataList);
					}
				}
			} else {
				Alert alert = berkeleyTreeMenuService.getAlert(path);
				
				String seriesLabel = path;
				if (seriesLabel.contains(":")) {
					seriesLabel = seriesLabel.substring(path.lastIndexOf(":") + 1, path.length());
				}
				valueCollection = ChartUtil.generateDataset(liveList, seriesLabel, alert, thenCal.getTime(), nowCal.getTime(), 15);
			}
			
			jsonResponse = BuildJsonObjectsUtil.generateChartData(chartId, path, valueCollection);
			System.out.println("Got Chart Data:\n" + jsonResponse);
		}
		PrintWriter writer = response.getWriter();
		writer.write(jsonResponse.toString());
		response.flushBuffer();
	}

	private JSONObject extractRequestJSONContents(HttpServletRequest request) throws IOException, JSONException {
		JSONObject jsonRequestObject = new JSONObject();

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
	
	private String buildInstrumentationMenu(String menuId) throws JSONException {
		return BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject(menuId, berkeleyTreeMenuService.getTreeMenu(), 0, 15).toString();
	}

}
