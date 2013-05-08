package org.eurekaj.plugins.riak.dao;

import java.util.ArrayList;
import java.util.List;

import org.eurekaj.api.dao.GroupedStatisticsDao;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.api.datatypes.basic.BasicGroupedStatistics;

import com.basho.riak.client.IRiakClient;
import com.basho.riak.client.RiakException;
import com.basho.riak.client.RiakRetryFailedException;
import com.basho.riak.client.bucket.Bucket;
import com.basho.riak.client.query.indexes.BucketIndex;

public class RiakGroupedStatisticsDao implements GroupedStatisticsDao {
	private IRiakClient riakClient;
	
	
	public RiakGroupedStatisticsDao(IRiakClient riakClient) {
		super();
		this.riakClient = riakClient;
	}

	@Override
	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics) {
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Grouped Statistics;" + groupedStatistics.getAccountName()).execute();
            myBucket.store(groupedStatistics.getName(), groupedStatistics).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }

	}

	@Override
	public GroupedStatistics getGroupedStatistics(String name, String accountName) {
		BasicGroupedStatistics groupedStatistics = null;

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Grouped Statistics;" + accountName).execute();
            groupedStatistics = myBucket.fetch(name, BasicGroupedStatistics.class).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }

        return groupedStatistics;
	}

	@Override
	public List<GroupedStatistics> getGroupedStatistics(String accountName) {
		List<GroupedStatistics> gsList = new ArrayList<GroupedStatistics>();

        Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Grouped Statistics;" + accountName).execute();

            for (String key : myBucket.fetchIndex(BucketIndex.index).withValue("$key").execute()) {
                gsList.add(myBucket.fetch(key, BasicGroupedStatistics.class).execute());
            }
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
            e.printStackTrace();
        }

        return gsList;
	}

	@Override
	public void deleteGroupedChart(String groupName, String accountName) {
		Bucket myBucket = null;
        try {
            myBucket = riakClient.fetchBucket("Grouped Statistics;" + accountName).execute();
            myBucket.delete(groupName).execute();
        } catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
