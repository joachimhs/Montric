package org.eurekaJ.agent;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class FileOutputWriter extends Writer {
	final private ReentrantReadWriteLock writerLock = new ReentrantReadWriteLock();
    // @GuardedBy writerLock
	private FileWriter currentFileWriter;
	private String path, baseName;
    private int counter = 1;
    private int maxRolls;
    private long lastTimeStamp = System.currentTimeMillis();
    private long interval;
    private TimeUnit unit;
    
    public FileOutputWriter(File output) throws IOException {
        this(output, 5);
    }
    
    public FileOutputWriter(File output, int maxRolls) throws IOException {
        currentFileWriter = new FileWriter(output);
        path = output.getParentFile().getAbsolutePath();
        baseName = output.getName();
        this.maxRolls = maxRolls;
        this.interval = 5000;
        this.unit = TimeUnit.MILLISECONDS;
    }
    
    @Override
    final public void close() throws IOException {
        try {
            writerLock.readLock().lock();
            currentFileWriter.close();
        } finally {
            writerLock.readLock().unlock();
        }
    }

    @Override
    final public void flush() throws IOException {        	
    	try {
            writerLock.readLock().lock();
            currentFileWriter.flush();
        } finally {
            writerLock.readLock().unlock();
        }
        
        if (needsRoll()) {
            nextWriter();
        }
    }

    @Override
    final public void write(char[] cbuf, int off, int len) throws IOException {
        try {
            writerLock.readLock().lock();
            currentFileWriter.write(cbuf, off, len);
        } finally {
            writerLock.readLock().unlock();
        }
    }

    private void nextWriter() {
        try {
            writerLock.writeLock().lock();
            currentFileWriter = getNextWriter();
        } catch (IOException e) {
            System.err.println("Unable to get the next writer");
        } finally {
            writerLock.writeLock().unlock();
        }
    }

    private FileWriter getNextWriter() throws IOException {
    	currentFileWriter.close();
    	File scriptOutputFile_renameFrom = new File(path + File.separator + baseName);
    	File scriptOutputFile_renameTo = new File(path + File.separator + baseName + "." + (counter++));
    	
        if (scriptOutputFile_renameTo.exists()) {
        	scriptOutputFile_renameTo.delete();
        }
        scriptOutputFile_renameFrom.renameTo(scriptOutputFile_renameTo);
        scriptOutputFile_renameFrom = new File(path + File.separator + baseName);
        if (counter > maxRolls) {
            counter = 1;
        }
        return new FileWriter(scriptOutputFile_renameFrom);
    }
    
    private boolean needsRoll() {
        long currTime = System.currentTimeMillis();
        long myInterval =  currTime- lastTimeStamp;
        if (unit.convert(myInterval, TimeUnit.MILLISECONDS) >= interval) {
            lastTimeStamp = currTime;
            return true;
        }
        return false;
    }
}
