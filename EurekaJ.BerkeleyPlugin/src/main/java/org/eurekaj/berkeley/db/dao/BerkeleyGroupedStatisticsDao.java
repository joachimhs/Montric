package org.eurekaj.berkeley.db.dao;

import com.sleepycat.persist.EntityCursor;
import com.sleepycat.persist.PrimaryIndex;
import org.eurekaj.api.dao.GroupedStatisticsDao;
import org.eurekaj.api.datatypes.GroupedStatistics;
import org.eurekaj.berkeley.db.BerkeleyDbEnv;
import org.eurekaj.berkeley.db.datatypes.BerkeleyGroupedStatistics;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 5/6/11
 * Time: 10:04 AM
 * To change this template use File | Settings | File Templates.
 */
public class BerkeleyGroupedStatisticsDao implements GroupedStatisticsDao {
    private BerkeleyDbEnv dbEnvironment;

    private PrimaryIndex<String, BerkeleyGroupedStatistics> groupedStatPrimaryIdx;

    public BerkeleyGroupedStatisticsDao(BerkeleyDbEnv dbEnvironment) {
        this.dbEnvironment = dbEnvironment;
        groupedStatPrimaryIdx = this.dbEnvironment.getGroupedStatisticsStore().getPrimaryIndex(String.class, BerkeleyGroupedStatistics.class);
    }


    @Override
    public BerkeleyGroupedStatistics getGroupedStatistics(String name) {
		return groupedStatPrimaryIdx.get(name);
	}

    @Override
	public List<GroupedStatistics> getGroupedStatistics() {
		List<GroupedStatistics> retList = new ArrayList<GroupedStatistics>();
		EntityCursor<BerkeleyGroupedStatistics> pi_cursor = groupedStatPrimaryIdx.entities();
		try {
		    for (BerkeleyGroupedStatistics node : pi_cursor) {
		        retList.add(node);
		    }
		// Always make sure the cursor is closed when we are done with it.
		} finally {
			pi_cursor.close();
		}
		return retList;
	}

    @Override
	public void persistGroupInstrumentation(GroupedStatistics groupedStatistics) {
        BerkeleyGroupedStatistics berkeleyGroupedStatistics = new BerkeleyGroupedStatistics(groupedStatistics);
		groupedStatPrimaryIdx.put(berkeleyGroupedStatistics);

	}
}
