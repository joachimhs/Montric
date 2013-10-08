package org.eurekaj.plugins.riak.dao;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;
import org.eurekaj.api.dao.TreeMenuDao;
import org.eurekaj.api.datatypes.Statistics;
import org.eurekaj.api.datatypes.basic.BasicStatistics;

import com.basho.riak.client.IRiakClient;
import com.basho.riak.client.RiakException;
import com.basho.riak.client.RiakRetryFailedException;
import com.basho.riak.client.bucket.Bucket;
import com.basho.riak.client.query.indexes.BucketIndex;

public class RiakTreeMenuDao implements TreeMenuDao {
	private static final Logger logger = Logger.getLogger(RiakTreeMenuDao.class.getName());
	private IRiakClient riakClient;
	
	public RiakTreeMenuDao(IRiakClient riakClient) {
		super();
		this.riakClient = riakClient;
	}

	@Override
	public void persistTreeMenu(Statistics statistics) {
		//logger.info("Persisting tree menu: " + statistics.getGuiPath() + " for account: " + statistics.getAccountName());
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Statistics;" + statistics.getAccountName()).execute();
            myBucket.store(statistics.getGuiPath(), statistics).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }
		
	}
	
	@Override
	public List<Statistics> getTreeMenu(String accountName) {
		List<Statistics> statList = new ArrayList<Statistics>();

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Statistics;" + accountName).execute();

            for (String key : myBucket.fetchIndex(BucketIndex.index).withValue("$key").execute()) {
            	statList.add(myBucket.fetch(key, BasicStatistics.class).execute());
            }
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
            e.printStackTrace();
        }

        return statList;
	}

	@Override
	public Statistics getTreeMenu(String guiPath, String accountName) {
		BasicStatistics statistics = null;

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Statistics;" + accountName).execute();
            statistics = myBucket.fetch(guiPath, BasicStatistics.class).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }

        return statistics;
	}

	@Override
	public void deleteTreeMenu(String guiPath, String accountName) {
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Statistics;" + accountName).execute();
            myBucket.delete(guiPath).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
