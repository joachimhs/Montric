package org.eurekaj.manager.servlets;

import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.service.AdministrationService;
import org.eurekaj.manager.service.TreeMenuService;
import org.json.JSONException;
import org.json.JSONObject;
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
 * Time: 9:34 AM
 * To change this template use File | Settings | File Templates.
 */
public class EurekaJGenericServlet extends HttpServlet {
    private TreeMenuService berkeleyTreeMenuService;
    private AdministrationService administrationService;

    public AdministrationService getAdministrationService() {
        if (administrationService == null) {
            administrationService = (AdministrationService) WebApplicationContextUtils.getWebApplicationContext(getServletContext()).getBean("administrationService");
        }
        return administrationService;
    }

    public TreeMenuService getBerkeleyTreeMenuService() {
        if (berkeleyTreeMenuService == null) {
            berkeleyTreeMenuService = (TreeMenuService) WebApplicationContextUtils.getWebApplicationContext(getServletContext()).getBean("treeMenuService");
        }
        return berkeleyTreeMenuService;
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            System.out.println("Accepted JSON: \n" + jsonObject);
        }  catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        PrintWriter writer = response.getWriter();
        writer.write(jsonResponse.toString());
        response.flushBuffer();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}
