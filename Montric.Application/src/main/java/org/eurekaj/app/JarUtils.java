package org.eurekaj.app;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.jar.JarInputStream;
import java.util.jar.Manifest;
import java.util.zip.ZipEntry;

import org.apache.log4j.Logger;


public final class JarUtils {
	private static Logger logger = Logger.getLogger(JarUtils.class.getName());

	public static void unjar(String filePath, File dest) throws IOException {
		logger.info("Unjar-ing " + filePath + " to destination: " + dest.getAbsolutePath());
		BufferedInputStream in = new BufferedInputStream(new FileInputStream(filePath));
		
		if (!dest.exists()) {
			dest.mkdirs();
		}
		if (!dest.isDirectory()) {
			throw new IOException("Destination must be a directory.");
		}
		
		JarInputStream jin = new JarInputStream(in);
		byte[] buffer = new byte[1024];

		ZipEntry entry = jin.getNextEntry();
		while (entry != null) {
			String fileName = entry.getName();
			if (fileName.charAt(fileName.length() - 1) == '/') {
				fileName = fileName.substring(0, fileName.length() - 1);
			}
			if (fileName.charAt(0) == '/') {
				fileName = fileName.substring(1);
			}
			if (File.separatorChar != '/') {
				fileName = fileName.replace('/', File.separatorChar);
			}
			File file = new File(dest, fileName);
			if (entry.isDirectory()) {
				// make sure the directory exists
				file.mkdirs();
				jin.closeEntry();
			} else {
				// make sure the directory exists
				File parent = file.getParentFile();
				if (parent != null && !parent.exists()) {
					parent.mkdirs();
				}

				// dump the file
				OutputStream out = new FileOutputStream(file);
				int len = 0;
				while ((len = jin.read(buffer, 0, buffer.length)) != -1) {
					out.write(buffer, 0, len);
				}
				out.flush();
				out.close();
				jin.closeEntry();
				file.setLastModified(entry.getTime());
			}
			entry = jin.getNextEntry();
		}
		/*
		 * Explicity write out the META-INF/MANIFEST.MF so that any headers such
		 * as the Class-Path are see for the unpackaged jar
		 */
		Manifest mf = jin.getManifest();
		if (mf != null) {
			File file = new File(dest, "META-INF/MANIFEST.MF");
			File parent = file.getParentFile();
			if (parent.exists() == false) {
				parent.mkdirs();
			}
			OutputStream out = new FileOutputStream(file);
			mf.write(out);
			out.flush();
			out.close();
		}
		jin.close();
	}
}
