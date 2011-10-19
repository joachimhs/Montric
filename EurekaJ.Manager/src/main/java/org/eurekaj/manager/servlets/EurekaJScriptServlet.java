package org.eurekaj.manager.servlets;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class EurekaJScriptServlet extends HttpServlet {
	private static final String RESOURCE_FOLDER = "/";
	private final String[] scriptArray = {"/sc1/js/core.js",
												"/sc1/js/controllers/administration_pane.js",
	                                            "/sc1/js/controllers/alert_administration.js",
	                                            "/sc1/js/controllers/alert_chart.js",
	                                            "/sc1/js/controllers/alert_notification.js",
	                                            "/sc1/js/controllers/alert_selection_delegate.js",
	                                            "/sc1/js/controllers/chart_grid.js",
	                                            "/sc1/js/controllers/chart_groups/chart_group_selection_delegate.js",
	                                            "/sc1/js/controllers/chart_groups/chart_groups_admin_controller.js",
	                                            "/sc1/js/controllers/chart_groups/chartGroupChartsTreeController.js",
	                                            "/sc1/js/controllers/chart_groups/selectedChartGroupChartsController.js",
	                                            "/sc1/js/controllers/chart_groups/selectedChartGroupController.js",
	                                            "/sc1/js/controllers/edit_alert.js",
	                                            "/sc1/js/controllers/edit_email_group.js",
	                                            "/sc1/js/controllers/email_administration.js",
	                                            "/sc1/js/controllers/email_recipients.js",
	                                            "/sc1/js/controllers/instrumentation_tree.js",
	                                            "/sc1/js/controllers/instumentation_group_chart.js",
	                                            "/sc1/js/controllers/tree_menu_selection_delegate.js",
	                                            "/sc1/js/controllers/triggeredAlertListController.js",
	                                            "/sc1/js/controllers/user/user_controller.js",
	                                            "/sc1/js/core_action.js",
	                                            "/sc1/js/core_statechart.js",
	                                            "/sc1/js/models/instrumentation_tree_model.js",
	                                            "/sc1/js/models/triggered_alert_model.js",
	                                            "/sc1/js/data_sources/eureka_j.js",
	                                            "/sc1/js/models/adminstration_tree_model.js",
	                                            "/sc1/js/models/alert_model.js",
	                                            "/sc1/js/models/chart_data_model.js",
	                                            "/sc1/js/models/chart_grid_model.js",
	                                            "/sc1/js/models/chart_series_model.js",
	                                            "/sc1/js/models/email_group_model.js",
	                                            "/sc1/js/models/email_recipient_model.js",
	                                            "/sc1/js/models/instrumentation_group_model.js",
	                                            "/sc1/js/models/instrumentation_table_model.js",
	                                            "/sc1/js/date.js",
	                                            "/sc1/js/statechart/showingChartPanel/showingChartPanel.js",
	                                            "/sc1/js/statechart/showingInformationPanel/showingInformationPanel.js",
	                                            "/sc1/js/statechart/showingTopPanel/showingAdminPanel.js",
	                                            "/sc1/js/statechart/showingTopPanel/showingTopPanel.js",
	                                            "/sc1/js/statechart/showingTreePanel/showingTreePanel.js",
	                                            "/sc1/js/views/administration/administration_pane.js",
	                                            "/sc1/js/views/administration/alert_administration.js",
	                                            "/sc1/js/views/administration/email_recipients_administration.js",
	                                            "/sc1/js/views/administration/tree_menu_administration.js",
	                                            "/sc1/js/views/calendar.js",
	                                            "/sc1/js/views/chart/chart_view.js",
	                                            "/sc1/js/views/chart/chart_grid.js",
	                                            "/sc1/js/views/informationPanel/historical_statistics_options.js",
	                                            "/sc1/js/views/informationPanel/information_panel.js",
	                                            "/sc1/js/views/informationPanel/live_statistics_options.js",
	                                            "/sc1/js/views/instrumentationTree/instrumentation_group_list_item.js",
	                                            "/sc1/js/views/instrumentationTree/instrumentation_groups_administration.js",
	                                            "/sc1/js/views/instrumentationTree/instrumentation_tree_list_item.js",
	                                            "/sc1/js/views/instrumentationTree/instrumentation_tree_view.js",
	                                            "/sc1/js/views/top_view.js",
	                                            "/sc1/js/main_page.js",
	                                            "/sc1/js/main.js"};

	
	@Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		StringBuffer scripts = new StringBuffer();
		
		for (String scriptFilename : scriptArray) {
			String absoluteFilePath = getServletContext().getRealPath(scriptFilename);
            BufferedReader inStream = new BufferedReader(new InputStreamReader(new FileInputStream(absoluteFilePath)));
            String nextLine = inStream.readLine();
            while (nextLine != null) {
            	scripts.append(nextLine);
            	scripts.append("\n");
            	nextLine = inStream.readLine();
            }
            scripts.append("\n");
		}
		
		PrintWriter writer = response.getWriter();
		writer.write(scripts.toString());
		
		response.setContentType("text/javascript");
        response.flushBuffer();
	}
}
