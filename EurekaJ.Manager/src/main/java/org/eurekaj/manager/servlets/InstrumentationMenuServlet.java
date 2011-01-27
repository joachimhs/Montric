package org.eurekaj.manager.servlets;

import org.eurekaj.manager.berkeley.treemenu.TreeMenuNode;
import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.service.TreeMenuService;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 1/20/11
 * Time: 9:12 AM
 * To change this template use File | Settings | File Templates.
 */
public class InstrumentationMenuServlet extends EurekaJGenericServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            System.out.println("Accepted JSON: \n" + jsonObject);

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

                System.out.println("Got Tree Type Menu:\n" + jsonResponse);
            }

            if (jsonObject.has("getInstrumentationMenuNode")) {
                String nodeId = jsonObject.getString("getInstrumentationMenuNode");
                TreeMenuNode node = getBerkeleyTreeMenuService().getTreeMenu(nodeId);
                jsonResponse = BuildJsonObjectsUtil.buildInstrumentationNode(node).toString();
                System.out.println("Got Node: \n" + jsonResponse);
            }

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        PrintWriter writer = response.getWriter();
        writer.write(jsonResponse.toString());
        response.flushBuffer();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}
