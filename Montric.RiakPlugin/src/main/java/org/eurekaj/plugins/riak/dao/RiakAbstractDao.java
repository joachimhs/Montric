package org.eurekaj.plugins.riak.dao;

import java.util.ArrayList;
import java.util.List;

import com.basho.riak.client.IRiakClient;
import com.basho.riak.client.RiakException;
import com.basho.riak.client.RiakRetryFailedException;
import com.basho.riak.client.bucket.Bucket;
import com.basho.riak.client.query.indexes.BucketIndex;

public class RiakAbstractDao {
	public static <E> List<E> getListFromRiakBucket(IRiakClient riakClient, String bucketName, E type, Class<E> clazz) {
		List<E> resultList = new ArrayList<>();
		
		Bucket bucket = null;
		try {
			bucket = riakClient.fetchBucket(bucketName).execute();
			
			for (String key : bucket.fetchIndex(BucketIndex.index).withValue("$key").execute()) {
				resultList.add(bucket.fetch(key, clazz).execute());
			}
		} catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        } catch (RiakException e) {
            e.printStackTrace();
        }
		
		return resultList;
	}
	
	public static <E> E getObjectFromBucket(IRiakClient riakClient, String bucketName, String key, E type, Class<E> clazz) {
		E returnObject = null;
		
		Bucket bucket = null;
		try {
			bucket = riakClient.fetchBucket(bucketName).execute();
			returnObject = bucket.fetch(key, clazz).execute();
		} catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }   
		
		return returnObject;
	}
	
	public static <E> void persistObjectInBucket(IRiakClient riakClient, String bucketName, String key, E type) {
		Bucket bucket = null;
		try {
			bucket = riakClient.fetchBucket(bucketName).execute();
			bucket.store(key, type).execute();
		} catch (RiakRetryFailedException rrfe) {
            rrfe.printStackTrace();
        }
	}
	
	public static <E> void deleteObjectInBucket(IRiakClient riakClient, String bucketName, String key)  {
		Bucket bucket = null;
		try {
			bucket = riakClient.fetchBucket(bucketName).execute();
			bucket.delete(key).execute();
		} catch (RiakException re) {
			re.printStackTrace();
		}
	}
}

