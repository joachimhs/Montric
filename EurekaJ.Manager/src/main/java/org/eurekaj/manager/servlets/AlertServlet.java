package org.eurekaj.manager.servlets;

import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.json.ParseJsonObjects;
import org.eurekaj.manager.perst.alert.Alert;
import org.json.JSONException;
import org.json.JSONObject;

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
 * Time: 9:15 AM
 * To change this template use File | Settings | File Templates.
 */
public class AlertServlet extends EurekaJGenericServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            System.out.println("Accepted JSON: \n" + jsonObject);

            if (jsonObject.has("getAlerts")) {
                jsonResponse = BuildJsonObjectsUtil.generateAlertsJson(getBerkeleyTreeMenuService().getAlerts());
                System.out.println("Got Alerts:\n" + jsonResponse);

            }

            if (jsonObject.has("alertInstrumentationNode")) {
                Alert parsedAlert = ParseJsonObjects.parseAlertJson(jsonObject);
                if (parsedAlert != null && parsedAlert.getAlertName() != null && parsedAlert.getAlertName().length() > 0) {
                    getBerkeleyTreeMenuService().persistAlert(parsedAlert);

                }
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
