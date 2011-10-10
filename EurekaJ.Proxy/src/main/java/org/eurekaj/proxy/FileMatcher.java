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

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;

public class FileMatcher {
	private static final Logger log = Logger.getLogger(FileMatcher.class);
	
    private static Pattern filePattern = Pattern.compile(".*\\d+");

    public static List<File> getScriptOutputFilesInDirectory(String scriptPath) {
        List<File> scriptOutputFileList = new ArrayList<File>();
        File file = new File(scriptPath);
        if (file != null && file.exists() && file.isDirectory()) {
            for (File scriptFile : file.listFiles()) {
                String filename = scriptFile.getName();
                Matcher matcher = filePattern.matcher(filename);
                boolean match = matcher.matches();
                if (match) {
                    scriptOutputFileList.add(scriptFile);
                }
            }
        } else {
            log.error("Argument is not a valid directory with BTrace Output files: " + scriptPath);
        }

        return scriptOutputFileList;
    }
}
