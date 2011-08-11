/*
 * ====================================================================
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 * ====================================================================
 *
 * This software consists of voluntary contributions made by many
 * individuals on behalf of the Apache Software Foundation.  For more
 * information on the Apache Software Foundation, please see
 * <http://www.apache.org/>.
 *
 */

package org.apache.http.examples.client;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.GZIPInputStream;

import org.apache.http.*;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.client.params.AuthPolicy;
import org.apache.http.cookie.Cookie;
import org.apache.http.entity.HttpEntityWrapper;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HTTP;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import sun.security.util.Password;

/**
 * Demonstration of the use of protocol interceptors to transparently
 * modify properties of HTTP messages sent / received by the HTTP client.
 * <p/>
 * In this particular case HTTP client is made capable of transparent content
 * GZIP compression by adding two protocol interceptors: a request interceptor
 * that adds 'Accept-Encoding: gzip' header to all outgoing requests and
 * a response interceptor that automatically expands compressed response
 * entities by wrapping them with a uncompressing decorator class. The use of
 * protocol interceptors makes content compression completely transparent to
 * the consumer of the {@link org.apache.http.client.HttpClient HttpClient}
 * interface.
 */
public class ClientGZipContentCompression {
    private List<Cookie> cookieList = null;
    private boolean loggedIn = false;
    private String username;
    private String password;
    private String endpoint;

    public ClientGZipContentCompression(String endpoint, String username, String password) {
        this.endpoint = endpoint;
        this.username = username;
        this.password = password;
    }

    private void resetHttpConnection() {
        cookieList =  null;
    }

    public int sendGzipOverHttp(String contents) throws Exception {
        if (!loggedIn) {
            logon();
        }

        int statusCode = -1;
        DefaultHttpClient httpclient = new DefaultHttpClient();

        httpclient.getCookieStore().clear();
        for (Cookie cookie : cookieList) {
            httpclient.getCookieStore().addCookie(cookie);
        }

        try {
            httpclient.addRequestInterceptor(new HttpRequestInterceptor() {

                public void process(
                        final HttpRequest request,
                        final HttpContext context) throws HttpException, IOException {
                    if (!request.containsHeader("Accept-Encoding")) {
                        request.addHeader("Accept-Encoding", "gzip");
                    }
                }

            });

            httpclient.addResponseInterceptor(new HttpResponseInterceptor() {

                public void process(
                        final HttpResponse response,
                        final HttpContext context) throws HttpException, IOException {
                    HttpEntity entity = response.getEntity();
                    Header ceheader = entity.getContentEncoding();
                    if (ceheader != null) {
                        HeaderElement[] codecs = ceheader.getElements();
                        for (int i = 0; i < codecs.length; i++) {
                            if (codecs[i].getName().equalsIgnoreCase("gzip")) {
                                response.setEntity(
                                        new GzipDecompressingEntity(response.getEntity()));
                                return;
                            }
                        }
                    }
                }

            });

            statusCode = postJsonContentsToServer(endpoint, contents, httpclient);
            if (statusCode != 200) {
                //Reset HTTP Connection
                resetHttpConnection();

                //Attempt login
                logon();
            }
        } finally {
            // When HttpClient instance is no longer needed,
            // shut down the connection manager to ensure
            // immediate deallocation of all system resources
            httpclient.getConnectionManager().shutdown();
        }

        return statusCode;
    }

    private int postJsonContentsToServer(String endpoint, String contents, DefaultHttpClient httpclient) throws IOException {
        int statusCode;HttpPost httpPost = new HttpPost(endpoint + "/liveStatistics");
        StringEntity requestEntity = new StringEntity(contents);
        requestEntity.setContentType("text/plain");

        httpPost.setEntity(requestEntity);
        HttpResponse response = httpclient.execute(httpPost);
        statusCode = response.getStatusLine().getStatusCode();
        HttpEntity entity = response.getEntity();
        return statusCode;
    }

    public void logon() {
        while (cookieList == null || cookieList.isEmpty()) {
            DefaultHttpClient httpclient = new DefaultHttpClient();
            try {

                //POST username and password
                HttpPost httpost = new HttpPost(endpoint + "/j_spring_security_check");

                List<NameValuePair> nvps = new ArrayList<NameValuePair>();
                nvps.add(new BasicNameValuePair("j_username", username));
                nvps.add(new BasicNameValuePair("j_password", password));

                httpost.setEntity(new UrlEncodedFormEntity(nvps, HTTP.UTF_8));

                HttpResponse response = httpclient.execute(httpost);
                HttpEntity entity = response.getEntity();
                EntityUtils.consume(entity);
                List<Cookie> cookies = httpclient.getCookieStore().getCookies();

                //Store cookies
                if (!cookies.isEmpty()) {
                    cookieList = cookies;
                }

                //Attempt to send an empty JSON object of stats to verify login
                int statusCode = postJsonContentsToServer(endpoint + "/liveStatistics", "{}", httpclient);

                //If server side returns status code 200, user is logged in
                if (statusCode == 200) {
                    loggedIn = true;
                } else {
                    System.err.println("EurekaJ Proxy is not logged in. Verify login credentials.");
                }
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            } catch (IOException e) {
                e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            } finally {
                // When HttpClient instance is no longer needed,
                // shut down the connection manager to ensure
                // immediate deallocation of all system resources
                httpclient.getConnectionManager().shutdown();
            }
        }
    }

    static class GzipDecompressingEntity extends HttpEntityWrapper {

        public GzipDecompressingEntity(final HttpEntity entity) {
            super(entity);
        }

        @Override
        public InputStream getContent()
                throws IOException, IllegalStateException {

            // the wrapped entity's getContent() decides about repeatability
            InputStream wrappedin = wrappedEntity.getContent();

            return new GZIPInputStream(wrappedin);
        }

        @Override
        public long getContentLength() {
            // length of ungzipped content is not known
            return -1;
        }

    }

}
