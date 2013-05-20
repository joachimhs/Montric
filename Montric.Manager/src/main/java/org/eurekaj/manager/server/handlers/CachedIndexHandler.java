package org.eurekaj.manager.server.handlers;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.scriptcache.ScriptCache;
import org.eurekaj.scriptcache.ScriptFile;
import org.eurekaj.scriptcache.ScriptHash;
import org.jboss.netty.buffer.ChannelBuffer;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpHeaders;
import org.jboss.netty.handler.codec.http.HttpRequest;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import static org.jboss.netty.handler.codec.http.HttpMethod.GET;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.METHOD_NOT_ALLOWED;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.OK;
import static org.jboss.netty.handler.codec.http.HttpVersion.HTTP_1_1;


public class CachedIndexHandler extends EurekaJGenericChannelHandler {
	private static Logger logger = Logger.getLogger(CachedIndexHandler.class.getName());
	private int maxCacheSeconds;
	private String rootPath;
	
	public CachedIndexHandler(String rootPath, int maxCacheSeconds) {
		this.rootPath = rootPath;
		this.maxCacheSeconds = maxCacheSeconds;
	}
	
	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		HttpRequest request = (HttpRequest) e.getMessage();
        if (request.getMethod() != GET) {
            sendError(ctx, METHOD_NOT_ALLOWED);
            return;
        }
        
        //For the Cached Index Handler, we are always serving /index.html with the
        //content type text/html
        String path = "/index.html";
        String contentType = "text/html";
        
        ScriptCache cache = ScriptHash.getScriptCache(path);
        if (cache == null || cache.isExpired()) {
        	//If file is not cached, or cache is expired, update the cache.
        	logger.info("Updating index.html from filesystem path: " + path);
        	cache = updateScriptCacheForPath(path);
        } 
        
        String htmlContents = cache.getHtmlContents();
        
        DefaultHttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);;
        response.setHeader(HttpHeaders.Names.CONTENT_TYPE, contentType);

        writeContentsToBuffer(ctx, htmlContents, "text/html");
	}
	
	private ScriptCache updateScriptCacheForPath(String path) throws IOException {
		Long before = System.currentTimeMillis();
		List<ScriptFile> scriptPathList = new ArrayList<ScriptFile>();
		
		Document htmlDocument = parseHtmlPage(path);
		
		//extract out the JavaScript tags with src attribute and replace with a single
		//call to a cached minified script file
		if (htmlDocument != null) {
			Elements elements = htmlDocument.select("head");
			Element headElement = elements.get(0);
			
			Elements scriptElements = headElement.getElementsByTag("script");
			for (Element scriptElement : scriptElements) {
				String scriptSrc = scriptElement.attr("src");
				if (scriptSrc == null || scriptSrc.startsWith("http")) {
					//Keep the script as-is
				} else if (scriptSrc != null && scriptSrc.endsWith(".js")) {
					File minifiedScriptFile = new File(rootPath + File.separatorChar + scriptSrc.substring(0, scriptSrc.length() - 3) + "-min.js");
					ChannelBuffer cb = null;
					if (minifiedScriptFile != null && minifiedScriptFile.isFile()) {
						cb = getFileContent(rootPath, scriptSrc.substring(0, scriptSrc.length() - 3) + "-min.js");
					} else {
						cb = getFileContent(rootPath, scriptSrc);
					}
					
					//cache and remove this <script src tag from the DOM 
					scriptPathList.add(new ScriptFile(scriptSrc, cb.toString(Charset.defaultCharset())));
					scriptElement.remove();
				}
			}
			
			//Append a new script element to the head-tag representing the cached and
			//minified script
			headElement.appendElement("script")
				.attr("src", "/cachedScript" + path + ".js")
				.attr("type", "text/javascript")
				.attr("charset", "utf-8");
		}
		
		//Create or update the script contents for this HTML file path 
		ScriptCache cache = ScriptHash.updateScriptContents(path, scriptPathList, htmlDocument.html(), System.currentTimeMillis() + (maxCacheSeconds * 1000));
		logger.info("Finished extracting script contents took: " + (System.currentTimeMillis() - before) + " ms.");
		
		return cache;
	}

	/**
	 * Simple method for parsing the HTML contents
	 * 
	 * @param path
	 * @return
	 * @throws IOException
	 */
	private Document parseHtmlPage(String path) throws IOException {
		Document htmlDocument = null;
		
		File input = new File(this.rootPath + path);
		if (input != null && input.exists() && input.isFile()) {
			htmlDocument = Jsoup.parse(input, "UTF-8");
		}
		return htmlDocument;
	}
}
