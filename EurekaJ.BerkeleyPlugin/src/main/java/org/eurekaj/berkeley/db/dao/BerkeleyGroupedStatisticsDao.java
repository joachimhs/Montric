/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
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
