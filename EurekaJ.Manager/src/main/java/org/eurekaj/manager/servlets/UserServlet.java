package org.eurekaj.manager.servlets;

import org.eurekaj.manager.json.BuildJsonObjectsUtil;
import org.eurekaj.manager.security.SecurityManager;
import org.json.JSONException;
import org.json.JSONObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Created by IntelliJ IDEA.
 * User: joahaa
 * Date: 6/18/11
 * Time: 7:31 PM
 * To change this template use File | Settings | File Templates.
 */
public class UserServlet extends EurekaJGenericServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String jsonResponse = "";

        try {
            JSONObject jsonObject = BuildJsonObjectsUtil.extractRequestJSONContents(request);
            System.out.println("Accepted JSON: \n" + jsonObject);

            if (jsonObject.has("getLoggedInUser") && SecurityManager.isAuthenticated() ) {
                String username = SecurityManager.getAuthenticatedUsername();
                String userRole = "user";
                if (SecurityManager.isAuthenticatedAsAdmin()) {
                    userRole = "admin";
                }

                jsonResponse = BuildJsonObjectsUtil.buildUserData(username, userRole);
            }

        } catch (JSONException jsonException) {
            throw new IOException("Unable to process JSON Request", jsonException);
        }

        PrintWriter writer = response.getWriter();
        if (jsonResponse.length() <= 2) {
            jsonResponse = "{\"loggedInUser\": null}";
        }
        writer.write(jsonResponse);
        response.flushBuffer();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }

}
