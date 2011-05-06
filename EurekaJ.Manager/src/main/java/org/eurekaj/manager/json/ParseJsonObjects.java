package org.eurekaj.manager.json;

import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.api.enumtypes.AlertType;
import org.eurekaj.manager.datatypes.ManagerAlert;
import org.eurekaj.manager.datatypes.ManagerEmailRecipientGroup;
import org.eurekaj.manager.datatypes.ManagerGroupedStatistics;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 12/21/10
 * Time: 8:49 PM
 * To change this template use File | Settings | File Templates.
 */
public class ParseJsonObjects {

    public static Alert parseAlertJson(JSONObject jsonAlert) {
        ManagerAlert parsedAlert = null;

        if (jsonAlert.has("alertName")) {
            parsedAlert = new ManagerAlert();
            parsedAlert.setAlertName(parseStringFromJson(jsonAlert, "alertName"));
            parsedAlert.setWarningValue(parseIntegerFromJson(jsonAlert, "alertWarningValue").doubleValue());
            parsedAlert.setErrorValue(parseIntegerFromJson(jsonAlert, "alertErrorValue").doubleValue());
            parsedAlert.setGuiPath(parseStringFromJson(jsonAlert, "alertInstrumentationNode"));
            parsedAlert.setAlertDelay(parseIntegerFromJson(jsonAlert, "alertDelay"));
            parsedAlert.setActivated(parseBooleanFromJson(jsonAlert, "alertActivated"));
            parsedAlert.setSelectedAlertType(AlertType.valueOf(parseStringFromJson(jsonAlert, "alertType")));
            parsedAlert.setSelectedEmailSenderList(getStringArrayFromJson(jsonAlert, "alertNotifications"));
        }
        return parsedAlert;
    }

    public static GroupedStatistics parseInstrumentationGroup(JSONObject jsonGroup) {
        ManagerGroupedStatistics groupedStatistics = null;

        if (jsonGroup.has("instrumentaionGroupName") && jsonGroup.has("instrumentationGroupPath")) {
            groupedStatistics = new ManagerGroupedStatistics();
            groupedStatistics.setName(parseStringFromJson(jsonGroup, "instrumentaionGroupName"));
            groupedStatistics.setGroupedPathList(getStringArrayFromJson(jsonGroup, "instrumentationGroupPath"));
        }

        return groupedStatistics;
    }

    public static EmailRecipientGroup parseEmailGroup(JSONObject jsonEmailGroup) {
        ManagerEmailRecipientGroup emailRecipientGroup = new ManagerEmailRecipientGroup();

        emailRecipientGroup.setEmailRecipientGroupName(parseStringFromJson(jsonEmailGroup, "emailGroupName"));
        emailRecipientGroup.setPort(parseIntegerFromJson(jsonEmailGroup, "smtpPort"));
        emailRecipientGroup.setUseSSL(parseBooleanFromJson(jsonEmailGroup, "smtpUseSSL"));
        emailRecipientGroup.setSmtpServerhost(parseStringFromJson(jsonEmailGroup, "smtpHost"));
        emailRecipientGroup.setSmtpUsername(parseStringFromJson(jsonEmailGroup, "smtpUsername"));
        emailRecipientGroup.setSmtpPassword(parseStringFromJson(jsonEmailGroup, "smtpPassword"));
        emailRecipientGroup.setEmailRecipientList(getStringArrayFromJson(jsonEmailGroup, "emailAddresses"));

        return emailRecipientGroup;
    }

    public static String parseStringFromJson(JSONObject json, String key) {
        String stringValue = null;

        try {
            stringValue = json.getString(key);
        } catch (JSONException e) {
            stringValue = null;
        }

        return stringValue;
    }

    public static List<String> getStringArrayFromJson(JSONObject json, String key) {
        List<String> groupList = new ArrayList<String>();
        try {
            JSONArray groupJsonArray = json.getJSONArray(key);
            for (int index = 0; index < groupJsonArray.length(); index++) {
                groupList.add(groupJsonArray.getString(index));
            }
        } catch (JSONException e) {
            //Nothing really
        }

        return groupList;
    }

    public static Integer parseIntegerFromJson(JSONObject json, String key) {
        Integer intValue = null;
        try {
            intValue = Integer.parseInt(parseStringFromJson(json, key));
        } catch (NumberFormatException nfe) {
            intValue = null;
        }

        return intValue;
    }

    public static Long parseLongFromJson(JSONObject json, String key) {
        Long longValue = null;
        try {
            longValue = Long.parseLong(parseStringFromJson(json, key));
        } catch (NumberFormatException nfe) {
            longValue = null;
        }

        return longValue;
    }

    public static Boolean parseBooleanFromJson(JSONObject json, String key) {
        Boolean boolValue = null;

        try {
            boolValue = json.getBoolean(key);
        } catch (JSONException e) {
            boolValue = false;
        }

        return boolValue;
    }
}
