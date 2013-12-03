package org.eurekaj.plugins.riak;

import com.basho.riak.client.IRiakClient;
import com.basho.riak.client.RiakException;
import com.basho.riak.client.RiakFactory;
import com.basho.riak.client.raw.pbc.PBClientConfig;
import com.basho.riak.client.raw.pbc.PBClusterConfig;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import org.apache.log4j.Logger;
import org.eurekaj.api.dao.*;
import org.eurekaj.api.datatypes.LiveStatistics;
import org.eurekaj.api.datatypes.basic.BasicLiveStatistics;
import org.eurekaj.api.datatypes.basic.BasicMetricHour;
import org.eurekaj.api.enumtypes.UnitType;
import org.eurekaj.api.enumtypes.ValueType;
import org.eurekaj.plugins.riak.dao.RiakAccountDao;
import org.eurekaj.plugins.riak.dao.RiakAlertDao;
import org.eurekaj.plugins.riak.dao.RiakAlertEvaluationQueueDao;
import org.eurekaj.plugins.riak.dao.RiakAlertRecipientDao;
import org.eurekaj.plugins.riak.dao.RiakGroupedStatisticsDao;
import org.eurekaj.plugins.riak.dao.RiakLiveStatisticsDao;
import org.eurekaj.plugins.riak.dao.RiakTreeMenuDao;
import org.eurekaj.spi.db.EurekaJDBPluginService;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Created with IntelliJ IDEA.
 * User: joahaa
 * Date: 3/3/13
 * Time: 1:39 AM
 * To change this template use File | Settings | File Templates.
 */
public class RiakEnv extends EurekaJDBPluginService {
    private static Logger logger = Logger.getLogger(RiakEnv.class.getName());

    private boolean isLoadedOK = false;
    private LiveStatisticsDao liveStatisticsDao;
    private AlertDao alertDao;
    private AccountDao accountDao;
    private GroupedStatisticsDao groupedStatisticsDao;
    private TreeMenuDao treeMenuDao;
    private AlertRecipientDao alertRecipientDao;
    private AlertEvaluationQueueDao alertEvaluationQueueDao;

    private IRiakClient riakClient;
    private Cache<String, BasicMetricHour> metricHourCache;

    public static void main(String[] args) {
        RiakEnv env = new RiakEnv();
        env.setup();

        String aarstallString = args[0];
        Integer aarstall = Integer.parseInt(aarstallString);
        String accountName = args[1];
        String metricName = args[2];

        DateTime fromDate = new DateTime(aarstall, 01, 01, 0, 0, 0);
        DateTime toDate = new DateTime(aarstall, 12, 31, 23, 59, 59);
        Long from15SecPeriod = fromDate.getMillis() / 15000;
        Long to15SecPeriod = toDate.getMillis() / 15000;

        long numMetrics = to15SecPeriod - from15SecPeriod;
        long index = 0;

        List<LiveStatistics> liveStatisticsList = new ArrayList<LiveStatistics>();
        while (index <= numMetrics) {
            liveStatisticsList.add(new BasicLiveStatistics("EurekaJAgent:Memory:Heap:Used", "ACCOUNT", from15SecPeriod + index, new Double(index), ValueType.AGGREGATE.value(), UnitType.N.value(), 1l));
            index++;
        }

        env.getLiveStatissticsDao().storeIncomingStatistics(liveStatisticsList);

        System.out.println("Stored " + index + " values in the database");

        int expectedNumMetrics = (4 * 60 * 3) + 1; //3 hours worth of metrics
        List<LiveStatistics> statList = env.getLiveStatissticsDao().getLiveStatistics("Test:A", "ACCOUNT", from15SecPeriod, to15SecPeriod);
    }
    @Override
    public String getPluginName() {
        return "RiakPlugin";  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void setup() {
    	if (!isLoadedOK) {
	    	List<String> riakIps = new ArrayList<>();
	    	
	    	String hosts = System.getProperty("montric.db.riak.hosts");
			
			logger.info("Riak Hosts: " + hosts);
			
	    	if (hosts == null) {
				logger.error("No Riak Hosts specified. Specify in montric.db.riak.hosts");
				throw new RuntimeException("Property montric.db.riak.hosts is NULL. Please configure as a space separated list of IP addressesin config.properties");
			}
	
			
			if (hosts.contains(" ")) {
				String[] riakHosts = hosts.split(" ");
				for (String host : riakHosts) {
					riakIps.add(host);
				}			
			} else {
				riakIps.add(hosts);
			}
	    	
	        try {
	            performSetup(riakIps.toArray(new String[riakIps.size()]));
	        } catch (RiakException e) {
	            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
	        }
	        isLoadedOK = true;
    	}
    }

    private void performSetup(String[] riakIps) throws RiakException {
        metricHourCache = CacheBuilder.newBuilder()
                .concurrencyLevel(4)
                .maximumSize(1000000l)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .build();
        // Riak Protocol Buffers client with supplied IP and Port
        PBClusterConfig riakClusterConfig = new PBClusterConfig(20);
        // See above examples for client config options
        PBClientConfig riakClientConfig = PBClientConfig.defaults();
        //riakClusterConfig.addHosts(riakClientConfig, "192.168.1.102", "192.168.1.104", "192.168.1.105");
        riakClusterConfig.addHosts(riakClientConfig, riakIps);
        riakClient = RiakFactory.newClient(riakClusterConfig);

        liveStatisticsDao = new RiakLiveStatisticsDao(riakClient, metricHourCache);
        alertDao = new RiakAlertDao(riakClient);
        accountDao = new RiakAccountDao(riakClient);
        groupedStatisticsDao = new RiakGroupedStatisticsDao(riakClient);
        treeMenuDao = new RiakTreeMenuDao(riakClient);
        alertRecipientDao = new RiakAlertRecipientDao(riakClient);
        alertEvaluationQueueDao = new RiakAlertEvaluationQueueDao(riakClient);
    }

    @Override
    public void tearDown() {
        riakClient.shutdown();
    }

    @Override
    public AlertDao getAlertDao() {
        return alertDao;
    }

    @Override
    public GroupedStatisticsDao getGroupedStatisticsDao() {
        return groupedStatisticsDao;
    }

    @Override
    public LiveStatisticsDao getLiveStatissticsDao() {
        return liveStatisticsDao;
    }

    @Override
    public AlertRecipientDao getAlertRecipientDao() {
    	return alertRecipientDao;
    }

    @Override
    public TreeMenuDao getTreeMenuDao() {
        return treeMenuDao;
    }

    @Override
    public AccountDao getAccountDao() {
        return accountDao;
    }
    
    @Override
    public AlertEvaluationQueueDao getAlertEvaluationQueueDao() {
    	return alertEvaluationQueueDao;
    }
}
