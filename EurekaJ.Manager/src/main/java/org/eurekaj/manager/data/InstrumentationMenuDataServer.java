package org.eurekaj.manager.data;

import java.io.IOException;

import org.eurekaj.api.datatypes.Statistics;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.service.AdministrationService;
import org.eurekaj.manager.service.AdministrationServiceImpl;
import org.eurekaj.manager.service.TreeMenuService;
import org.eurekaj.manager.service.TreeMenuServiceImpl;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONTokener;

public class InstrumentationMenuDataServer {
	private TreeMenuService berkeleyTreeMenuService;
    private AdministrationService administrationService;

    public AdministrationService getAdministrationService() {
        if (administrationService == null) {
            administrationService = new AdministrationServiceImpl();
        }
        return administrationService;
    }

    public TreeMenuService getBerkeleyTreeMenuService() {
        if (berkeleyTreeMenuService == null) {
            berkeleyTreeMenuService = new TreeMenuServiceImpl();
        }
        return berkeleyTreeMenuService;
    }
    
	public String buildInstrumentationMenu(String jsonBody) throws IOException {
		String jsonResponse = "";
		try {
			//Append and prepend { and } if its missing - SC 2
	        if (!jsonBody.startsWith("{")) {
	        	jsonBody = "{" + jsonBody;
	        }
	        
	        if (!jsonBody.endsWith("}")) {
	        	jsonBody = jsonBody + "}";
	        }
	        
            JSONObject jsonObject = new JSONObject(new JSONTokener(jsonBody));
            jsonResponse = buildInstrumentationMenu(jsonResponse, jsonObject);
            jsonResponse = buildInstrumentationMenuNode(jsonResponse,jsonObject);
            deleteInstrumentationMenuNode(jsonObject);

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }
		
		return jsonResponse;
	}
	
	
	private String buildInstrumentationMenuNode(String jsonResponse, JSONObject jsonObject) throws JSONException {
		if (jsonObject.has("getInstrumentationMenuNode")) {
		    String nodeId = jsonObject.getString("getInstrumentationMenuNode");
		    Statistics node = getBerkeleyTreeMenuService().getTreeMenu(nodeId, "ACCOUNT");
		    jsonResponse = BuildJsonObjectsUtil.buildInstrumentationNode(node).toString();
		    System.out.println("Got Node: \n" + jsonResponse);
		}
		return jsonResponse;
	}
	
	private String buildInstrumentationMenu(String jsonResponse, JSONObject jsonObject) throws JSONException {
		if (jsonObject.has("getInstrumentationMenu")) {
		    String menuId = jsonObject.getString("getInstrumentationMenu");
		    boolean includeCharts = jsonObject.has("includeCharts") && jsonObject.getBoolean("includeCharts");

		    String includeChartType = null;
		    if (jsonObject.has("nodeType")) {
		        includeChartType = jsonObject.getString("nodeType");
		    }
		    jsonResponse = BuildJsonObjectsUtil.buildTreeTypeMenuJsonObject(menuId,
		            getBerkeleyTreeMenuService().getTreeMenu(),
		            getBerkeleyTreeMenuService().getAlerts(),
		            getBerkeleyTreeMenuService().getGroupedStatistics(),
		            0, 15, includeCharts, includeChartType).toString();

		    //log.debug("Got Tree Type Menu:\n" + jsonResponse);
		}
		return jsonResponse;
	}

	private void deleteInstrumentationMenuNode(JSONObject jsonObject) throws JSONException {
		if (jsonObject.has("deleteInstrumentationMenuNodes")) {
			JSONArray nodes = jsonObject.getJSONArray("deleteInstrumentationMenuNodes");
			for (int i = 0; i < nodes.length(); i++) {
				String guiPath = nodes.getString(i);
				getBerkeleyTreeMenuService().deleteTreeMenuNode(guiPath, "ACCOUNT");
			}
			
		}
	}
}
