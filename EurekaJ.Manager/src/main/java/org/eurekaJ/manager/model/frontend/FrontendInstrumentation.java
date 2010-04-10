package org.eurekaJ.manager.model.frontend;

import java.sql.ResultSet;
import java.sql.SQLException;

public class FrontendInstrumentation {
	private Long frontendInstrumentationID;
	private Long userID;
	private String agentName;
	private String packageAndClassname;
	private String method;
	private String prefix;
	private byte instrumentationLive;
	
	public FrontendInstrumentation() {
		// TODO Auto-generated constructor stub
	}

	public FrontendInstrumentation(Long frontendInstrumentationID, Long userID, String agentName, String packageAndClassname, String method, String prefix,
			byte instrumentationLive) {
		super();
		this.frontendInstrumentationID = frontendInstrumentationID;
		this.userID = userID;
		this.agentName = agentName;
		this.packageAndClassname = packageAndClassname;
		this.method = method;
		this.prefix = prefix;
		this.instrumentationLive = instrumentationLive;
	}

	public Long getFrontendInstrumentationID() {
		return frontendInstrumentationID;
	}

	public void setFrontendInstrumentationID(Long frontendInstrumentationID) {
		this.frontendInstrumentationID = frontendInstrumentationID;
	}

	public Long getUserID() {
		return userID;
	}

	public void setUserID(Long userID) {
		this.userID = userID;
	}

	public String getAgentName() {
		return agentName;
	}

	public void setAgentName(String agentName) {
		this.agentName = agentName;
	}

	public String getPackageAndClassname() {
		return packageAndClassname;
	}

	public void setPackageAndClassname(String packageAndClassname) {
		this.packageAndClassname = packageAndClassname;
	}

	public String getMethod() {
		return method;
	}

	public void setMethod(String method) {
		this.method = method;
	}

	public String getPrefix() {
		return prefix;
	}

	public void setPrefix(String prefix) {
		this.prefix = prefix;
	}

	public byte getInstrumentationLive() {
		return instrumentationLive;
	}

	public void setInstrumentationLive(byte instrumentationLive) {
		this.instrumentationLive = instrumentationLive;
	}
	
	public void populate(ResultSet rs) {
		try {
			frontendInstrumentationID = rs.getLong("FrontendInstrumentationID");
			userID = rs.getLong("UserID");
			agentName = rs.getString("AgentName");
			packageAndClassname = rs.getString("PackageAndClassname");
			method = rs.getString("Method");
			prefix = rs.getString("Prefix");
			instrumentationLive = rs.getByte("InstrumentationLive");
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
}
