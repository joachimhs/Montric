package org.eurekaj.proxy;

import org.eurekaj.proxy.parser.ParseStatistics;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 3/18/11
 * Time: 3:22 PM
 * To change this template use File | Settings | File Templates.
 */
public class RemoteJsonPlugin {//implements BTraceProcessProvider {
    /*private BTraceService bTraceService;

    @Override
    public String getPluginName() {
        return "RemoteJsonPlugin";
    }

    @Override
    public void process() {
        if (bTraceService != null && bTraceService.getAgentArgument("scriptdir") != null) {
            List<File> scriptOutputfileList = FileMatcher.getScriptOutputFilesInDirectory(bTraceService.getAgentArgument("scriptdir"));
            for (File scriptOutputFile : scriptOutputfileList) {
                try {
                    List<StoreIncomingStatisticsElement> statElemList = ParseStatistics.parseBtraceFile(scriptOutputFile);
                    bTraceService.println("File: " + scriptOutputFile.getAbsolutePath() + " has " + statElemList.size() + " statistics.");
                    scriptOutputFile.delete();
                } catch (IOException e) {
                    e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
                }

            }

        }
    }

    @Override
    public void setBtraceService(BTraceService bTraceService) {
        this.bTraceService = bTraceService;
    }    */
}
