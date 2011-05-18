package org.eurekaj.proxy;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 3/23/11
 * Time: 9:02 PM
 * To change this template use File | Settings | File Templates.
 */
public class FileMatcher {
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
            System.err.println("Argument is not a valid directory with BTrace Output files: " + scriptPath);
        }

        return scriptOutputFileList;
    }
}
