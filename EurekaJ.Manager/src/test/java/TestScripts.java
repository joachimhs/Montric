import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.junit.Test;


public class TestScripts {

	@Test
	public void TestScripts() {
		File dir = new File("/Users/joahaa/Projects/eurekaj/EurekaJ.View/src/main/webapp/js/app");
		List<String> toplevelFileList = new ArrayList<String>();
		List<String> recursiveFileList = new ArrayList<String>();
		for (File currFile : dir.listFiles()) {
			if (currFile.isDirectory()) {
				work(currFile, recursiveFileList);
			} else {
				toplevelFileList.add(currFile.getAbsolutePath().substring(59));
			}
		}
		
		for (String filename : toplevelFileList) {
			System.out.println("<script type=\"text/javascript\" charset=\"utf-8\" src=\"" + filename + "\"></script>");
		}
		
		for (String filename : recursiveFileList) {
			System.out.println("<script type=\"text/javascript\" charset=\"utf-8\" src=\"" + filename + "\"></script>");
		}
	}
	
	private void work(File file, List<String> recursiveFileList) {
		for (File currFile : file.listFiles()) {
			if (currFile.isDirectory()) {
				work(currFile, recursiveFileList);
			} else {
				recursiveFileList.add(currFile.getAbsolutePath().substring(59));
			}
		}
	}
}
