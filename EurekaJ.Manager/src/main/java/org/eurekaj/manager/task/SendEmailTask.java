package org.eurekaj.manager.task;

import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.enumtypes.AlertStatus;

public class SendEmailTask implements Runnable {
	private EmailRecipientGroup emailRecipientGroup;
	private Alert alert;
	private AlertStatus oldStatus;
	private double currValue;
	private String timeString;

	public SendEmailTask(EmailRecipientGroup emailRecipientGroup, Alert alert, AlertStatus oldStatus, double currValue, String timeString) {
		super();
		this.emailRecipientGroup = emailRecipientGroup;
		this.alert = alert;
		this.oldStatus = oldStatus;
		this.currValue = currValue;
		this.timeString = timeString;
	}

	@Override
	public void run() {
		StringBuffer emailMessage = new StringBuffer();
		emailMessage.append("EurekaJ BerkeleyAlert: ").append(alert.getGuiPath()).append(" Has changed status from ").append(oldStatus.getStatusName()).append(" to status ")
				.append(alert.getStatus().getStatusName()).append(".\n Current Value: ").append(currValue).append(".\n Warning Value: ").append(alert.getWarningValue()).append(".\n Critical Value: ")
				.append(alert.getErrorValue()).append(".\n Time: ").append(timeString);

		String emailSubject = "EurekaJ BerkeleyAlert: " + alert.getStatus().getStatusName() + " : " + alert.getGuiPath();

		System.out.println("\t\tAttempting to send Email through: " + emailRecipientGroup.getSmtpServerhost() + ":" + emailRecipientGroup.getPort() + " using " + emailRecipientGroup.getSmtpUsername()
				+ " auth with " + emailRecipientGroup.getSmtpPassword() + " via SSL: " + emailRecipientGroup.isUseSSL() + " ::: " + emailSubject);

		if (emailRecipientGroup.isUseSSL()) {
			sendEmailWithSSL(emailSubject, emailMessage.toString());
		} else {
			sendEmailWithoutSSL(emailSubject, emailMessage.toString());
		}

		System.out.println("\t\tEmail Sent");
	}

	private Message buildMessage(Session session, String emailSubject, String emailMessage) throws AddressException, MessagingException {
		Message message = new MimeMessage(session);
		message.setFrom(new InternetAddress(emailRecipientGroup.getSmtpUsername()));
		message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(getRecipientsAsString()));
		message.setSubject(emailSubject);
		message.setText(emailMessage);

		return message;
	}

	private void sendEmailWithSSL(String emailSubject, String emailMessage) {
		Properties props = new Properties();
		props.put("mail.smtp.host", emailRecipientGroup.getSmtpServerhost());
		props.put("mail.smtp.socketFactory.port", "" + emailRecipientGroup.getPort());
		props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
		props.put("mail.smtp.auth", "true");
		props.put("mail.smtp.port", "" + emailRecipientGroup.getPort());
		//props.put("mail.smtp.starttls.enable", "true");

		Session session = Session.getInstance(props, new javax.mail.Authenticator() {
			protected PasswordAuthentication getPasswordAuthentication() {
				return new PasswordAuthentication(emailRecipientGroup.getSmtpUsername(), emailRecipientGroup.getSmtpPassword());
			}
		});

		try {

			Transport.send(buildMessage(session, emailSubject, emailMessage));
		} catch (MessagingException e) {
			e.printStackTrace();
		}
	}

	private void sendEmailWithoutSSL(String emailSubject, String emailMessage) {
		String host = emailRecipientGroup.getSmtpServerhost();
		int port = emailRecipientGroup.getPort();
		String username = emailRecipientGroup.getSmtpUsername();
		String password = emailRecipientGroup.getSmtpPassword();

		Properties props = new Properties();
		props.put("mail.smtp.auth", "true");
		props.put("mail.smtp.starttls.enable", "false");

		Session session = Session.getInstance(props);

		try {
			Transport transport = session.getTransport("smtp");
			transport.connect(host, port, username, password);

			Transport.send(buildMessage(session, emailSubject, emailMessage));

			System.out.println("Done");

		} catch (MessagingException e) {
			e.printStackTrace();
		}
	}

	private String getRecipientsAsString() {
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < emailRecipientGroup.getEmailRecipientList().size(); i++) {
			sb.append(emailRecipientGroup.getEmailRecipientList().get(i));
			if (i < (emailRecipientGroup.getEmailRecipientList().size() - 1)) {
				sb.append(",");
			}
		}
		return sb.toString();
	}

	private String[] getRecipients() {
		String[] emailReceiverArray = new String[emailRecipientGroup.getEmailRecipientList().size()];
		for (int i = 0; i < emailRecipientGroup.getEmailRecipientList().size(); i++) {
			emailReceiverArray[i] = emailRecipientGroup.getEmailRecipientList().get(i);
		}
		return emailReceiverArray;
	}

}
