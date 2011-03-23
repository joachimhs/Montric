/*
* Copyright 2008-2010 Sun Microsystems, Inc.  All Rights Reserved.
* DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
*
* This code is free software; you can redistribute it and/or modify it
* under the terms of the GNU General Public License version 2 only, as
* published by the Free Software Foundation.  Sun designates this
* particular file as subject to the "Classpath" exception as provided
* by Sun in the LICENSE file that accompanied this code.
*
* This code is distributed in the hope that it will be useful, but WITHOUT
* ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
* FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
* version 2 for more details (a copy is included in the LICENSE file that
* accompanied this code).
*
* You should have received a copy of the GNU General Public License version
* 2 along with this work; if not, write to the Free Software Foundation,
* Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
*
* Please contact Sun Microsystems, Inc., 4150 Network Circle, Santa Clara,
* CA 95054 USA or visit www.sun.com if you need additional information or
* have any questions.
*/

package com.sun.btrace.samples;

import static com.sun.btrace.BTraceUtils.*;

import java.sql.Statement;
import java.util.Map;

import com.sun.btrace.AnyType;
import com.sun.btrace.aggregation.Aggregation;
import com.sun.btrace.aggregation.AggregationFunction;
import com.sun.btrace.aggregation.AggregationKey;
import com.sun.btrace.annotations.*;

/**
* BTrace script to print timings for all executed JDBC statements on an event. Demonstrates
* different types of aggregation function.
* <p>
*
* @author Christian Glencross 
*/
@BTrace
public class JdbcQueries {

   private static Map<Statement, String> preparedStatementDescriptions = Collections.newWeakMap();

//   private static Aggregation histogram = Aggregations.newAggregation(AggregationFunction.QUANTIZE);

   private static Aggregation average = Aggregations.newAggregation(AggregationFunction.AVERAGE);

//   private static Aggregation max = Aggregations.newAggregation(AggregationFunction.MAXIMUM);

//   private static Aggregation min = Aggregations.newAggregation(AggregationFunction.MINIMUM);

//   private static Aggregation sum = Aggregations.newAggregation(AggregationFunction.SUM);

   private static Aggregation count = Aggregations.newAggregation(AggregationFunction.COUNT);

//   private static Aggregation globalCount = Aggregations.newAggregation(AggregationFunction.COUNT);

   @TLS
   private static String preparingStatement;

   @TLS
   private static String executingStatement;

   /**
    * If "--stack" is passed on command line, print the Java stack trace of the JDBC statement.
    * 
    * Otherwise we print the SQL.
    */
   private static boolean useStackTrace = Sys.$(2) != null && Strings.strcmp("--stack", Sys.$(2)) == 0;

   // The first couple of probes capture whenever prepared statement and callable statements are
   // instantiated, in order to let us track what SQL they contain.

   /**
    * Capture SQL used to create prepared statements.
    * 
    * @param args
    *            the list of method parameters. args[1] is the SQL.
    */
   @OnMethod(clazz = "+org.apache.derby.iapi.jdbc.EngineConnection", method = "/prepare(Call|Statement)/")
   public static void onPrepare(AnyType[] args) {
//		print("onPrepare: ");
//		println(str(args[0]));
		
       preparingStatement = useStackTrace ? Threads.jstackStr() : str(args[0]);
   }

   /**
    * Cache SQL associated with a prepared statement.
    * 
    * @param arg
    *            the return value from the prepareXxx() method.
    */
   @OnMethod(clazz = "+org.apache.derby.iapi.jdbc.EngineConnection", method = "/prepare(Call|Statement)/", location = @Location(Kind.RETURN))
   public static void onPrepareReturn(@Return Statement preparedStatement) {
//		println("onPrepareReturn");
       if (preparingStatement != null) {
           Collections.put(preparedStatementDescriptions, preparedStatement, preparingStatement);
           preparingStatement = null;
       }
   }

   // The next couple of probes intercept the execution of a statement. If it execute with no-args,
   // then it must be a prepared statement or callable statement. Get the SQL from the probes up above.
   // Otherwise the SQL is in the first argument.

   @OnMethod(clazz = "+org.apache.derby.impl.jdbc.EmbedStatement", method = "/execute($|Update|Query|Batch)/")
   public static void onExecute(@Self Object currentStatement,  @ProbeMethodName String pmn, AnyType[] args) {
//		print("onExecute: ");
//		print(pmn);
//		print(" - ");
       if (args.length == 0) {
           // No SQL argument; lookup the SQL from the prepared statement
           executingStatement = Collections.get(preparedStatementDescriptions, currentStatement);
       } else {
           // Direct SQL in the first argument
           executingStatement = useStackTrace ? Threads.jstackStr() : str(args[0]);
       }
//		println(executingStatement);
   }

   @OnMethod(clazz = "+org.apache.derby.impl.jdbc.EmbedStatement", method = "/execute($|Update|Query|Batch)/", location = @Location(Kind.RETURN))
   public static void onExecuteReturn(@Duration long durationL) {
//		print("onExecuteReturn: ");
//		println(str(durationL));
		Long timePeriod = ((timeNanos() / 15000000000l)*15000);
		
       if (executingStatement == null) {
           return;
       }
		
		
       AggregationKey key = Aggregations.newAggregationKey(executingStatement, timePeriod);
//       Aggregations.addToAggregation(histogram, key, duration);
       Aggregations.addToAggregation(average, key, durationL);
//       Aggregations.addToAggregation(max, key, duration);
//       Aggregations.addToAggregation(min, key, duration);
//       Aggregations.addToAggregation(sum, key, duration);
       Aggregations.addToAggregation(count, key, durationL);
//       Aggregations.addToAggregation(globalCount, duration);

       executingStatement = null;
   }

   @OnTimer(7500)
   public static void onEvent() {		
		String valueStringFormat = strcat("[Value;", property("btrace.agent"));
		Aggregations.printAggregation("", average, strcat(valueStringFormat, ";Backend;SQL:%1$s:Average Execution Time;%3$d;ns;average;%2$s]"));
		
		Aggregations.printAggregation("", count, strcat(valueStringFormat, ";Backend;SQL:%1$s:Calls Per Interval;%3$d;n;aggregate;%2$s]"));
	
		// Top 10 queries only
       	Aggregations.truncateAggregation(average, 0);
		Aggregations.truncateAggregation(count, 0);
   }

}