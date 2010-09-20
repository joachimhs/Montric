package org.eurekaJ.manager.model.frontend;

public class TreeMenuNodeData {
	private String key;
	private String label;
	
	public TreeMenuNodeData(String key, String label) {
		super();
		this.key = key;
		this.label = label;
	}
	
	public TreeMenuNodeData() {
		// TODO Auto-generated constructor stub
	}

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}
	
}
