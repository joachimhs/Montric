package org.eurekaj.api.datatypes;

import java.util.List;

import org.eurekaj.api.datatypes.basic.IdObject;

public interface AlertRecipient {
	public String getId();
	public String getAccountName();
	public String getPluginName();
	public List<String> getRecipients();
}
