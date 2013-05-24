package org.eurekaj.scriptcache;

import java.util.List;

public class ScriptCache {
	private String cacheName;
	private List<ScriptFile> scriptList;
	private String minifiedScriptContent;
	private String scriptContent;
	private Long expires = 0l;
	private String htmlContents;

	public ScriptCache(String cacheName, List<ScriptFile> scriptList, Long expires, String htmlContents) {
		super();
		this.cacheName = cacheName;
		this.scriptList = scriptList;
		minifiedScriptContent = "";
		scriptContent = "";
		for (ScriptFile sf : scriptList) {
			minifiedScriptContent += "//" + sf.getFileSrc() + "\r\n";
			minifiedScriptContent += sf.getFileContents() + "\r\n\r\n";
			scriptContent += sf.getFileContents() + "\r\n\r\n";
		}
		
		this.expires = expires;
		this.htmlContents = htmlContents;
	}

	public String getCacheName() {
		return cacheName;
	}

	public void setCacheName(String cacheName) {
		this.cacheName = cacheName;
	}

	public List<ScriptFile> getScriptList() {
		return scriptList;
	}

	public void setScriptList(List<ScriptFile> scriptList) {
		this.scriptList = scriptList;
	}

	public String getMinifiedScriptContent() {
		return minifiedScriptContent;
	}

	public void setMinifiedScriptContent(String minifiedScriptContent) {
		this.minifiedScriptContent = minifiedScriptContent;
	}

	public String getScriptContent() {
		return scriptContent;
	}

	public void setScriptContent(String scriptContent) {
		this.scriptContent = scriptContent;
	}

	public Long getExpires() {
		return expires;
	}

	public void setExpires(Long expires) {
		this.expires = expires;
	}

	public boolean isExpired() {
		return expires <= System.currentTimeMillis();
	}
	
	public String getHtmlContents() {
		return htmlContents;
	}
	
	public void setHtmlContents(String htmlContents) {
		this.htmlContents = htmlContents;
	}
	
}
