package org.eurekaj.proxy.app;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.StringWriter;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.DefaultHttpClient;

import com.google.gson.Gson;

public class ParseRiakStats {
	public static void main(String[] args) throws ClientProtocolException, IOException {
		ParseRiakStats riakStats = new ParseRiakStats();	
		riakStats.parseRiakStats(args);
	}
	
	public void parseRiakStats(String[] args)  {
		while (true) {
			try {
				for (String ip : args) {
					DefaultHttpClient httpclient = new DefaultHttpClient();
					HttpGet get = new HttpGet("http://" + ip + ":8098/stats");
					StringEntity requestEntity = new StringEntity("");
			        requestEntity.setContentType("text/plain");
		
			        HttpResponse response = httpclient.execute(get);
			        int statusCode = response.getStatusLine().getStatusCode();
			        HttpEntity entity = response.getEntity();
		
			        
			        StringWriter writer = new StringWriter();
			        IOUtils.copy(entity.getContent(), writer, "UTF-8");
			        String theString = writer.toString();
			        
			        System.out.println(theString);
			        
			        RiakData rd = new Gson().fromJson(theString, RiakData.class);
			        
			        StringBuffer sb = new StringBuffer();
			        long millis = System.currentTimeMillis();
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Gets;").append(rd.vnode_gets).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Gets Total;").append(rd.vnode_gets_total).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Puts;").append(rd.vnode_puts).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Puts Total;").append(rd.vnode_puts_total).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Index Reads;").append(rd.vnode_index_reads).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Index Reads Total;").append(rd.vnode_index_reads_total).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Index Writes;").append(rd.vnode_index_writes).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Index Writes Total;").append(rd.vnode_index_writes_total).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Index Deletes;").append(rd.vnode_index_deletes).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":VNode:Index Deletes Total;").append(rd.vnode_index_deletes_total).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Gets;").append(rd.node_gets).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Gets Total;").append(rd.node_gets_total).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Puts;").append(rd.node_puts).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Puts Total;").append(rd.node_puts_total).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Object Size Mean;").append(rd.node_get_fsm_objsize_mean).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Object Size 95 Percentile;").append(rd.node_get_fsm_objsize_95).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Object Size 99 Percentile;").append(rd.node_get_fsm_objsize_99).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Object Size 100 Percentile;").append(rd.node_get_fsm_objsize_100).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Get Response Time Mean;").append(rd.node_get_fsm_time_mean).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Get Response Time 95 Percentile;").append(rd.node_get_fsm_time_95).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Get Response Time 99 Percentile;").append(rd.node_get_fsm_time_99).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Get Response Time 100 Percentile;").append(rd.node_get_fsm_time_100).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Put Response Time Mean;").append(rd.node_put_fsm_time_mean).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Put Response Time 95 Percentile;").append(rd.node_put_fsm_time_95).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Put Response Time 99 Percentile;").append(rd.node_put_fsm_time_99).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":Node:Put Response Time 100 Percentile;").append(rd.node_put_fsm_time_100).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":System:Memory Used;").append(rd.memory_processes_used).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":System:Read Repairs;").append(rd.read_repairs).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":System:Read Repairs Total;").append(rd.read_repairs_total).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":System:Read Repairs Coordinated;").append(rd.coord_read_repairs).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":System:Num Processes;").append(rd.sys_processes_count).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":System:Protocol Buffers Connected;").append(rd.pcb_connects).append(";n;value;1;").append(millis).append("]\n");
			        sb.append("[Value;Riak Cluster;").append(ip).append(":System:Protocol Buffers Active;").append(rd.pcb_active).append(";n;value;1;").append(millis).append("]\n");
			        
			        writeContentsToFile("/srv/btrace/scripts/riak.btrace.1", sb.toString());
					
				}
			} catch (IOException ioe) {
				ioe.printStackTrace();
			}
			
			try {
				Thread.sleep(7500);
			} catch (InterruptedException e) {
				//Not much to do here, really...
				e.printStackTrace();
			}
		}
	}
	
	private void writeContentsToFile(String filename, String contents) {
		try {
			BufferedWriter fileOutputStream = new BufferedWriter(new FileWriter(filename, true));
			fileOutputStream.append(contents);
			fileOutputStream.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	public class RiakData {
		public String vnode_gets;
		public String vnode_gets_total;
		public String vnode_puts;
		public String vnode_puts_total;
		public String vnode_index_reads;
		public String vnode_index_reads_total;
		public String vnode_index_writes;
		public String vnode_index_writes_total;
		public String vnode_index_deletes;
		public String vnode_index_deletes_total;
		public String node_gets;
		public String node_gets_total;
		public String node_puts;
		public String node_puts_total;
		public String node_get_fsm_objsize_mean;
		public String node_get_fsm_objsize_95;
		public String node_get_fsm_objsize_99;
		public String node_get_fsm_objsize_100;
		public String node_get_fsm_time_mean;
		public String node_get_fsm_time_95;
		public String node_get_fsm_time_99;
		public String node_get_fsm_time_100;
		public String node_put_fsm_time_mean;
		public String node_put_fsm_time_95;
		public String node_put_fsm_time_99;
		public String node_put_fsm_time_100;
		public String memory_processes_used;
		public String read_repairs;
		public String read_repairs_total;
		public String sys_processes_count;
		public String coord_read_repairs;
		public String pcb_connects;
		public String pcb_active;
		
	}
}
