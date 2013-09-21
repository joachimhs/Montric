package org.eurekaj.alert.email.service;

import java.util.Properties;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.apache.log4j.Logger;
import org.eurekaj.api.datatypes.Alert;
import org.eurekaj.api.datatypes.EmailRecipientGroup;
import org.eurekaj.api.enumtypes.AlertStatus;
import org.eurekaj.api.util.ListToString;

public class SendAlertEmailTask implements Runnable {
	private static Logger log = Logger.getLogger(SendAlertEmailTask.class);
	private EmailRecipientGroup emailRecipientGroup;
	private Alert alert;
	private AlertStatus oldStatus;
	private double currValue;
	private String timeString;
	
	public SendAlertEmailTask(EmailRecipientGroup emailRecipientGroup, Alert alert, AlertStatus oldStatus, double currValue, String timeString) {
		super();
		this.emailRecipientGroup = emailRecipientGroup;
		this.alert = alert;
		this.oldStatus = oldStatus;
		this.currValue = currValue;
		this.timeString = timeString;
	}
	
	@Override
	public void run() {
		String emailSubject = "EurekaJ Alert: " + alert.getStatus().getStatusName() + " : " + alert.getGuiPath();
		
		log.info("\t\tAttempting to send Email through: " + emailRecipientGroup.getSmtpServerhost() + ":" + emailRecipientGroup.getPort() + " using " + emailRecipientGroup.getSmtpUsername()
				+ " auth with " + emailRecipientGroup.getSmtpPassword() + " via SSL: " + emailRecipientGroup.isUseSSL() + " ::: " + emailSubject);
		
		StringBuffer emailMessage = new StringBuffer();
		emailMessage.append("EurekaJ Alert: ").append(alert.getGuiPath()).append(" Has changed status from ").append(oldStatus.getStatusName()).append(" to status ")
				.append(alert.getStatus().getStatusName()).append(".\n Current Value: ").append(currValue).append(".\n Warning Value: ").append(alert.getWarningValue()).append(".\n Critical Value: ")
				.append(alert.getErrorValue()).append(".\n Time: ").append(timeString);

		

	
		if (emailRecipientGroup.isUseSSL()) {
			sendEmailWithSSL(emailSubject, emailMessage.toString());
		} else {
			sendEmailWithoutSSL(emailSubject, emailMessage.toString());
		}

		log.debug("\t\tEmail Sent");
	}

	private Message buildMessage(Session session, String emailSubject, String emailMessage) throws AddressException, MessagingException {
		Message message = new MimeMessage(session);
		message.setFrom(new InternetAddress(emailRecipientGroup.getSmtpUsername()));
		message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(ListToString.convertFromList(emailRecipientGroup.getEmailRecipientList(), ",")));
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

			log.debug("Done");

		} catch (MessagingException e) {
			e.printStackTrace();
		}
	}
}
