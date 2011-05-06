package org.eurekaj.berkeley.db;

import java.io.File;

import com.sleepycat.je.DatabaseException;
import com.sleepycat.je.Environment;
import com.sleepycat.je.EnvironmentConfig;
import com.sleepycat.persist.EntityStore;
import com.sleepycat.persist.StoreConfig;
import org.eurekaj.api.dao.*;
import org.eurekaj.berkeley.db.dao.BerkeleySmtpDaoImpl;
import org.eurekaj.berkeley.db.dao.BerkeleyAlertDao;
import org.eurekaj.berkeley.db.dao.BerkeleyGroupedStatisticsDao;
import org.eurekaj.berkeley.db.dao.BerkeleyTreeMenuDao;
import org.eurekaj.spi.db.EurekaJDBPluginService;

public class BerkeleyDbEnv extends EurekaJDBPluginService {

	private Environment environment;
	private File dbFile;
	private EntityStore treeMenuStore;
	private EntityStore liveStatisticsStore;
	private EntityStore groupedStatisticsStore;
	private EntityStore alertStore;
	private EntityStore smtpServerStore;
	private EntityStore dashboardStore;
    private EntityStore triggeredAlertStore;
	private EntityStore logStore;

    private AlertDao alertDao;
    private GroupedStatisticsDao groupedStatisticsDao;
    private LiveStatisticsDao liveStatisticsDao;
    private SmtpDao smtpDao;
    private TreeMenuDao treeMenuDao;
	
	public BerkeleyDbEnv() {

		/*BerkeleyShutdownHook shutdownHook = new BerkeleyShutdownHook();
		shutdownHook.setDbEnv(this);
		Runtime.getRuntime().addShutdownHook(shutdownHook);*/
	}

    public String getPluginName() {
        return "Berkeley";
    }
	
	public void setup() {
        String dbAbsPath = System.getProperty("eurekaj.db.absPath");
		dbFile = new File(dbAbsPath);
		if (dbFile == null || !dbFile.exists()) {
			dbFile.mkdir();
		}

		EnvironmentConfig environmentconfig = new EnvironmentConfig();
		StoreConfig storeConfig = new StoreConfig(); 
		
		environmentconfig.setReadOnly(false);
		storeConfig.setReadOnly(false);
		
		environmentconfig.setAllowCreate(true);
		storeConfig.setAllowCreate(true);
		environment = new Environment(dbFile, environmentconfig);
		
		treeMenuStore = new EntityStore(environment, "TreeMenuStore", storeConfig);
		liveStatisticsStore = new EntityStore(environment, "LiveStatisticsStore", storeConfig);
		groupedStatisticsStore = new EntityStore(environment, "GroupedStatisticsStore", storeConfig);
		alertStore = new EntityStore(environment, "AlertStore", storeConfig);
		smtpServerStore = new EntityStore(environment, "SmtpServerStore", storeConfig);
		dashboardStore = new EntityStore(environment, "DashboardStore", storeConfig);
		logStore = new EntityStore(environment, "logStore", storeConfig);
        triggeredAlertStore = new EntityStore(environment, "TriggeredAlertStore", storeConfig);

        alertDao = new BerkeleyAlertDao(this);
        groupedStatisticsDao = new BerkeleyGroupedStatisticsDao(this);
        liveStatisticsDao = new BerkeleyTreeMenuDao(this);
        smtpDao = new BerkeleySmtpDaoImpl(this);
        treeMenuDao = new BerkeleyTreeMenuDao(this);
	}

    @Override
    public void tearDown() {
        this.close();
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
    public SmtpDao getSmtpDao() {
        return smtpDao;
    }

    @Override
    public TreeMenuDao getTreeMenuDao() {
        return treeMenuDao;
    }

    public Environment getEnvironment() {
		return environment;
	}

	public EntityStore getTreeMenuStore() {
		return treeMenuStore;
	}

	public EntityStore getLiveStatisticsStore() {
		return liveStatisticsStore;
	}

	public EntityStore getAlertStore() {
		return alertStore;
	}

	public EntityStore getSmtpServerStore() {
		return smtpServerStore;
	}

	public EntityStore getDashboardStore() {
		return dashboardStore;
	}

	public EntityStore getGroupedStatisticsStore() {
		return groupedStatisticsStore;
	}

	public EntityStore getLogStore() {
		return logStore;
	}

    public EntityStore getTriggeredAlertStore() {
        return triggeredAlertStore;
    }

    public void close() {
		if (treeMenuStore != null) {
			try {
				treeMenuStore.close();
			} catch (DatabaseException dbe) {
				System.err.println("Error closing treeMenuStore" + dbe.toString());
                dbe.printStackTrace();
			}
		}
		
		if (liveStatisticsStore != null) {
			try {
				liveStatisticsStore.close();
			} catch (DatabaseException dbe) {
				System.err.println("Error closing treeMenuStore" + dbe.toString());
                dbe.printStackTrace();
			}
		}
		
		if (groupedStatisticsStore != null) {
			try {
				groupedStatisticsStore.close();
			} catch (DatabaseException dbe) {
				System.err.println("Error closing groupedStatisticsStore" + dbe.toString());
                dbe.printStackTrace();
			}
		}
		
		if (alertStore != null) {
			try {
				alertStore.close();
			} catch (DatabaseException dbe) {
				System.err.println("Error closing alertStore" + dbe.toString());
                dbe.printStackTrace();
			}
		}
		
		if (smtpServerStore != null) {
			try {
				smtpServerStore.close();
			} catch (DatabaseException dbe) {
				System.err.println("Error closing smtpServerStore" + dbe.toString());
                dbe.printStackTrace();
			}
		}
		
		if (dashboardStore != null) {
			try {
				dashboardStore.close();
			} catch (DatabaseException dbe) {
				System.err.println("Error closing dashboardStore" + dbe.toString());
                dbe.printStackTrace();
			}
		}
		
		if (logStore != null) {
			try {
				logStore.close();
			} catch (DatabaseException dbe) {
				System.err.println("Error closing logStore" + dbe.toString());
                dbe.printStackTrace();
			}
		}

        if (triggeredAlertStore != null) {
			try {
				triggeredAlertStore.close();
			} catch (DatabaseException dbe) {
				System.err.println("Error closing triggeredAlertStore" + dbe.toString());
                dbe.printStackTrace();
			}
		}
		
		if (environment != null) {
            try {
            	environment.close();
            } catch(DatabaseException dbe) {
                System.err.println("Error closing environment" + dbe.toString());
                dbe.printStackTrace();
            }
        }
	}
}
