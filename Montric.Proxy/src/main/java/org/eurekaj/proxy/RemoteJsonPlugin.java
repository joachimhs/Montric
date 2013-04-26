/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
package org.eurekaj.proxy;

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
