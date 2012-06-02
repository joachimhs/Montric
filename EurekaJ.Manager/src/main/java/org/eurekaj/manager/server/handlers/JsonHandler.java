package org.eurekaj.manager.server.handlers;

import static org.jboss.netty.handler.codec.http.HttpHeaders.Names.CONTENT_TYPE;
import static org.jboss.netty.handler.codec.http.HttpVersion.HTTP_1_1;
import static org.jboss.netty.handler.codec.http.HttpResponseStatus.*;

import org.jboss.netty.buffer.ChannelBuffers;
import org.jboss.netty.channel.ChannelFutureListener;
import org.jboss.netty.channel.ChannelHandlerContext;
import org.jboss.netty.channel.MessageEvent;
import org.jboss.netty.channel.SimpleChannelUpstreamHandler;
import org.jboss.netty.handler.codec.http.DefaultHttpResponse;
import org.jboss.netty.handler.codec.http.HttpResponse;
import org.jboss.netty.util.CharsetUtil;

public class JsonHandler extends SimpleChannelUpstreamHandler {

	@Override
	public void messageReceived(ChannelHandlerContext ctx, MessageEvent e) throws Exception {
		String json = "[{ \"id\": 1, \"imageTitle\": \"Bird\", \"imageUrl\": \"/img/bird.jpg\"},{ \"id\": \"2\", \"imageTitle\": \"Dragonfly\", \"imageUrl\": \"/img/dragonfly.jpg\"},{ \"id\": \"3\", \"imageTitle\": \"Fly\", \"imageUrl\": \"/img/fly.jpg\"},{ \"id\": \"4\", \"imageTitle\": \"Frog\", \"imageUrl\": \"/img/frog.jpg\"},{ \"id\": \"5\", \"imageTitle\": \"Lizard\", \"imageUrl\": \"/img/lizard.jpg\"},{ \"id\": \"6\", \"imageTitle\": \"Mountain 1\", \"imageUrl\": \"/img/mountain.jpg\"},{ \"id\": \"7\", \"imageTitle\": \"Mountain 2\", \"imageUrl\": \"/img/mountain2.jpg\"},{ \"id\": \"8\", \"imageTitle\": \"Panorama\", \"imageUrl\": \"/img/panorama.jpg\"},{ \"id\": \"9\", \"imageTitle\": \"Sheep\", \"imageUrl\": \"/img/sheep.jpg\"},{ \"id\": \"10\", \"imageTitle\": \"Waterfall\", \"imageUrl\": \"/img/waterfall.jpg\"}]";
		HttpResponse response = new DefaultHttpResponse(HTTP_1_1, OK);
        response.setHeader(CONTENT_TYPE, "text/json; charset=UTF-8");
        response.setContent(ChannelBuffers.copiedBuffer(json + "\r\n", CharsetUtil.UTF_8));
        
        // Close the connection as soon as the error message is sent.
        ctx.getChannel().write(response).addListener(ChannelFutureListener.CLOSE);
        
        return;
	}
}

