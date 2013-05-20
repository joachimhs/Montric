package org.eurekaj.scriptcache;

import java.util.Hashtable;
import java.util.List;

public class ScriptHash {
	private static Hashtable<String, ScriptCache> scriptHash = new Hashtable<String, ScriptCache>();
	
	public static ScriptCache updateScriptContents(String htmlFilePath, List<ScriptFile> scriptFiles, String htmlContent, long expires) {
		ScriptCache cacheFromHash = scriptHash.get(htmlFilePath);
		if (cacheFromHash != null) {
			//Remove the old script cache
			scriptHash.remove(htmlFilePath);
		}
		
		cacheFromHash = new ScriptCache(htmlFilePath, scriptFiles, expires, htmlContent);		
		scriptHash.put(htmlFilePath, cacheFromHash);
		return cacheFromHash;
	}
	
	public static ScriptCache getScriptCache(String htmlFilePath) {
		return scriptHash.get(htmlFilePath);
	}
}