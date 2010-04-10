package org.eurekaJ.agent;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.IllegalClassFormatException;
import java.security.ProtectionDomain;
import java.util.ArrayList;
import java.util.Hashtable;
import java.util.List;

import javassist.CannotCompileException;
import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtMethod;
import javassist.LoaderClassPath;
import javassist.NotFoundException;
import javassist.bytecode.AccessFlag;

import org.apache.log4j.Logger;
import org.eurekaJ.agent.model.ClassInstrumentationInfo;
import org.eurekaJ.agent.model.MethodInstrumentation;

public class EurekaJTransformer implements ClassFileTransformer {

	private static String logdef = "private static org.apache.log4j.Logger _log;";
	private String[] ignore = new String[] { "sun/", "java/", "javax/", "org/apache/jasper/servlet/JspServlet", "org/apache/jasper/runtime/HttpJspBase" };
	private static Hashtable<ClassLoader, ClassLoader> classLoaders = new Hashtable<ClassLoader, ClassLoader>();
	private static ClassPool classPool = new ClassPool(true);
	private static Logger log = Logger.getLogger(EurekaJTransformer.class);

	public EurekaJTransformer() {

	}

	private CtClass makeClass(byte[] classFileBuffer) {
		CtClass madeClass = null;

		try {
			madeClass = classPool.makeClass(new ByteArrayInputStream(classFileBuffer, 0, classFileBuffer.length));
			if (madeClass == null) {
				log.error("Unable to load class: " + madeClass);
			}
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (RuntimeException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}

		return madeClass;
	}

	private ClassInstrumentationInfo getSubtypeInstrumentation(CtClass ctClass) {
		ClassInstrumentationInfo cii = null;
		
		//Check if class implements an instrumented interface
		for (CtClass currClassInterface : getImplementations(ctClass)) {
			ClassInstrumentationInfo cii2 = EurekaJAgentLauncher.getSubtypeInstrumentationHash().get(currClassInterface.getName().replaceAll("/", "."));
			if (cii2 != null && cii2.isDoesImplement()) {
				log.info("Class " + currClassInterface.getName().replaceAll("/", ".") + " is instrumented as implements. Instrumenting class: " + ctClass.getName());
				cii = cii2;
				break;
			}
		}
		
		//if interface is not instrumented, try superclass
		CtClass superClass = getSuperclass(ctClass);
		if (superClass != null) {
			//Class has a superclass
			ClassInstrumentationInfo cii2 = EurekaJAgentLauncher.getSubtypeInstrumentationHash().get(superClass.getName().replaceAll("/", "."));
			if (cii2 != null && cii2.isDoesExtend()) {
				cii = cii2;
			}
		}
		
				
		return cii;
	}

	private ClassInstrumentationInfo getWildcardInstrumentation(CtClass ctClass, String fullyQualifiedPackageName) {
		ClassInstrumentationInfo cii = null;

		String[] parts = fullyQualifiedPackageName.split("\\.");
		while (parts.length > 0) {
			// Slit package name and look back in the hierarchy
			String tempName = "";
			for (int i = 0; i < parts.length; i++) {
				tempName += parts[i] + ".";
			}
			tempName += "*";
			ClassInstrumentationInfo cii2 = EurekaJAgentLauncher.getInstrumentationHash().get(tempName);
			if (cii2 != null) { // Matching wildcard package
				cii = cii2;
				break;
			}
			// Reduce parts array by 1
			String[] parts2 = new String[parts.length - 1];
			System.arraycopy(parts, 0, parts2, 0, parts2.length);
			parts = parts2;
		}

		return cii;
	}

	/**
	 * Check if this class is known in the loader. Add it to the loader if it is
	 * not already added VERY important in JEE environments
	 * 
	 * @param loader
	 */
	private void loadClassInClassloader(ClassLoader loader) {
		if (!classLoaders.containsKey(loader)) {
			classPool.insertClassPath(new LoaderClassPath(loader));
			classLoaders.put(loader, loader);
		}
	}
	
	private boolean isStatic(int acccessFlags) {
		return (acccessFlags & AccessFlag.STATIC) != 0;
	}

	private CtClass getSuperclass(CtClass currClass) {
		if (currClass == null) {
			return null;
		}
		CtClass superClass = null;
		try {
			superClass = currClass.getSuperclass();
		} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			// e.printStackTrace();
		}

		return superClass;
	}

	private List<CtClass> getImplementations(CtClass currClass) {
		List<CtClass> implementations = new ArrayList<CtClass>();
		try {
			for (CtClass impl : currClass.getInterfaces()) {
				implementations.add(impl);
			}
		} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			// e.printStackTrace();
			implementations.clear();
		}

		return implementations;
	}

	public boolean instrumentMethod(CtClass currClass, CtMethod method, ClassInstrumentationInfo cii) {
		boolean methodInstrumented = false;

		if (currClass.getName().endsWith("Servlet")) {
			log.info("\t\tInstrumenting Servlet: " + currClass.getName());
		}
		
		try {
			MethodInstrumentation mi = cii.getMethod(method.getName());
			if (currClass.getName().endsWith("Servlet")) {
				log.info("\t\tInstrumenting Servlet Method: " + mi + " :: " + method.getName());
			}
			if (method.getMethodInfo().isConstructor() || method.getName().startsWith("class") ||
					method.getName().startsWith("get") || method.getName().startsWith("set") ||
					method.getName().startsWith("is")) {
				// Simple methods and constructors not supported yet.
			} else if (mi != null) {
				if (mi.getClassType().equalsIgnoreCase("Increment")) {
					addIncrement(currClass, method.getName(), cii);
				} else if (mi.getClassType().equalsIgnoreCase("Decrement")) {
					addDecrement(currClass, method.getName(), cii);
				} else {
					addTiming(currClass, method.getName(), cii);
					/*
					 * TODO: if (valueInstrumentation) {
					 * addValueInstrumentation(currClass, method.getName(),
					 * cii); }
					 */
				}
				methodInstrumented = true;
			}
		} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (CannotCompileException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		return methodInstrumented;
	}
	
	private boolean ignoreClass(String className) {
		boolean ignoreVal = false;
		/*for (int i = 0; i < ignore.length; i++) {
			if (className.startsWith(ignore[i])) {
				if (className.startsWith("java/sql") || className.startsWith("javax/faces/webapp") || className.endsWith("Servlet")) {
					ignoreVal = false;
				} else {
					ignoreVal = true;
				}
			}
		}*/
		return ignoreVal;
	}

	public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined, ProtectionDomain protectionDomain, byte[] classfileBuffer)
			throws IllegalClassFormatException {
		// TODO Auto-generated method stub

		if (ignoreClass(className)) {
			return classfileBuffer;
		}
		
		//Make Class
		CtClass currClass = makeClass(classfileBuffer);
		if (currClass == null) { //If class cannot be made, return as is. 
			return classfileBuffer;
		}

		byte[] bytestream = null;
		boolean methodInstrumented = false;
		String fullyQualifiedPackageName = className.replace("/", ".");		

		//Get Subtype instrumentation (both extends and implements)
		ClassInstrumentationInfo cii = getSubtypeInstrumentation(currClass);
		if (cii == null) {
			//Try up to 6 levels up
			for (int i = 0; i < 10; i++) {
				CtClass superClass = getSuperclass(currClass);
				if (superClass != null) {
					cii = getSubtypeInstrumentation(superClass);
				}
			}
		}

		if (cii == null) {
			// No match for Superclass or interface. Looking for direct match
			cii = EurekaJAgentLauncher.getInstrumentationHash().get(fullyQualifiedPackageName);
			// TODO: If direct match, and instrumentation is value, mark it so
			// that
			// the value can be returned
		}

		if (cii == null) {
			// No match for superclass or exact class. Look for wildcard in package
			cii = getWildcardInstrumentation(currClass, fullyQualifiedPackageName);
		}

		if (cii != null) {
			log.info("Class is instrumented: " + cii + " :: " + className);
			loadClassInClassloader(loader);

			try {
				if (currClass != null && !currClass.isInterface() && !currClass.getClassFile().isAbstract() && !currClass.isFrozen()) {
					// addLogging(currClass, className);
					CtMethod[] declaredMethods = currClass.getDeclaredMethods();
					for (CtMethod method : declaredMethods) {
						methodInstrumented = instrumentMethod(currClass, method, cii);
					}
				}

				if (methodInstrumented) {
					bytestream = currClass.toBytecode();
				}
			} catch (CannotCompileException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}

		return bytestream;
	}

	private void addTiming(CtClass clas, String mname, ClassInstrumentationInfo cii) throws NotFoundException, CannotCompileException, IOException {
		// get the method information
		StringBuffer before = new StringBuffer().append("{");
		StringBuffer after = new StringBuffer().append("{");
		
		MethodInstrumentation mi = cii.getMethod(mname);
		CtMethod oldMethod = clas.getDeclaredMethod(mname);
		oldMethod.addLocalVariable("_eurekaJTimingStart", CtClass.longType);
		//CtClass stackTraceClass = classPool.get("org.eurekaJ.agent.model.CallStackTraceBuilder");
		//oldMethod.addLocalVariable("_eurekaJStackTraceBuilder", stackTraceClass);
		
		if (clas.getPackageName().endsWith("sql") || clas.getName().endsWith("Statement")) {
			log.info("\n\n\n\t\t\tSQL Instrumetation: " + clas.getPackageName() + " ::: " + clas.getName());
		}
		
		before.append("_eurekaJTimingStart = System.currentTimeMillis();\n");
		//before.append("org.eurekaJ.agent.model.CallStackTraceBuilderFactory.getCallStackTraceBuilder().enter(\"" + mname + "\", \"" + oldMethod.getSignature() + "\", \"" + clas.getName() + "\", \"" + mi.getClassType() + "\", \"" + cii.getPath() + "\",_eurekaJTimingStart);\n"); 
		
		// Report statistic for this classtype only (overall)
		after.append("org.eurekaJ.agent.EurekaJStringLogger.addGroupStatistics(\"" + mi.getClassType()
				+ "\", (System.currentTimeMillis() - _eurekaJTimingStart), _eurekaJTimingStart, \"" + mi.getClassType() + "\");\n");
		// Report statistic for this classtype and path (overall)
		after.append("org.eurekaJ.agent.EurekaJStringLogger.addGroupStatistics(\"" + mi.getClassType() + ":" + cii.getPath()
				+ "\", (System.currentTimeMillis() - _eurekaJTimingStart), _eurekaJTimingStart, \"" + mi.getClassType() + "\");\n");
		// Report statistic for this classtype, path and class (overall)
		after.append("org.eurekaJ.agent.EurekaJStringLogger.addGroupStatistics(\"" + mi.getClassType() + ":" + cii.getPath() + ":" + clas.getName()
				+ "\", (System.currentTimeMillis() - _eurekaJTimingStart), _eurekaJTimingStart, \"" + mi.getClassType() + "\");\n");
		// Report statistic for this method call (classtype, path, class and method)
		after.append("org.eurekaJ.agent.EurekaJStringLogger.addStatistic(\"" + clas.getName() + " " + mname
				+ "\", (System.currentTimeMillis() - _eurekaJTimingStart), _eurekaJTimingStart, \"" + mi.getClassType() + "\", \"" + cii.getPath() + "\");\n");
		
		
		//after.append("org.eurekaJ.agent.model.CallStackTraceBuilderFactory.getCallStackTraceBuilder().leave(System.currentTimeMillis() - _eurekaJTimingStart);\n");
		
		oldMethod.insertBefore(before.append("}").toString());
		oldMethod.insertAfter(after.append("}").toString());
		
	}

	private void addIncrement(CtClass clas, String mname, ClassInstrumentationInfo cii) throws NotFoundException, CannotCompileException, IOException {
		CtMethod oldMethod = clas.getDeclaredMethod(mname);
		log.info("\tadding increment for class: " + clas.getName() + " method: " + mname);
		// Report increment value for this path
		oldMethod.insertBefore("org.eurekaJ.agent.EurekaJStringLogger.addIncrement(\"" + cii.getPath() + "\");\n");
		
	}

	private void addDecrement(CtClass clas, String mname, ClassInstrumentationInfo cii) throws NotFoundException, CannotCompileException, IOException {
		CtMethod oldMethod = clas.getDeclaredMethod(mname);
		// Report increment value for this path
		log.info("\tadding decrement for class: " + clas.getName() + " method: " + mname);
		oldMethod.insertBefore("org.eurekaJ.agent.EurekaJStringLogger.addDecrement(\"" + cii.getPath() + "\");\n");
	}

	private void addValueInstrumentation(CtClass clas, String mname, ClassInstrumentationInfo cii) throws NotFoundException, CannotCompileException,
			IOException {
		CtMethod oldMethod = clas.getDeclaredMethod(mname);
		String returntype = oldMethod.getReturnType().getName();

		log.info("Class " + clas.getName() + " has unknown return type: " + returntype);
		if (returntype.equals("int") || returntype.equals("java.lang.Integer") || returntype.equals("long") || returntype.equals("java.lang.Long")
				|| returntype.equals("double") || returntype.equals("java.lang.Double") || returntype.equals("float") || returntype.equals("java.lang.Float")) {
			// Get return value

		}

		/*
		 * String fqcn = clas.getName(); String oldMethodSignature =
		 * oldMethod.getSignature(); // Keep any modifiers that may exist on the
		 * method being replaced int modifiers = oldMethod.getModifiers(); int
		 * accessFlags = oldMethod.getMethodInfo().getAccessFlags(); //
		 * System.out.println("old method: " + oldMethod.getSignature());
		 * 
		 * // MethodInfo info = oldMethod.getMethodInfo();
		 * 
		 * // rename old method to synthetic name, then duplicate the method
		 * with // original name for use as interceptor String newMethodname =
		 * mname + "$impl"; oldMethod.setName(newMethodname); CtMethod
		 * implMethod = CtNewMethod.copy(oldMethod, mname, clas, null);
		 * 
		 * // start the body text generation by saving the start time to local
		 * // variable, then call the timed method; // the actual code generated
		 * needs to depend on whether the timed method // returns a value String
		 * type = oldMethod.getReturnType().getName();
		 * 
		 * StringBuffer body = new StringBuffer();
		 * body.append("{\nlong eurekaJTimingstart = System.currentTimeMillis();\n"
		 * ); body.append(
		 * "org.eurekaJ.agent.model.CallStackTraceBuilder eurekaJStackTraceBuilder = org.eurekaJ.agent.model.CallStackTraceBuilderFactory.getCallStackTraceBuilder();\n"
		 * ); // System.out.println("eurekaJStackTraceBuilder.enter(\"" + mname
		 * + // "\", \"" + oldMethodSignature + "\", \"" + fqcn + //
		 * "\",eurekaJTimingstart);");
		 * body.append("eurekaJStackTraceBuilder.enter(\"" + mname + "\", \"" +
		 * oldMethodSignature + "\", \"" + fqcn + "\",eurekaJTimingstart);\n");
		 * if (!type.equals("void")) { body.append(type + " result = "); }
		 * body.append(newMethodname + "($$);\n");
		 * 
		 * // finish body text generation with call to print the timing //
		 * information, and return saved value(if not void) //
		 * body.append("_log.info(\"Call to method " + mname + //
		 * " took \" + (System.currentTimeMillis() - start) + \" (ms) \");\n");
		 * body.append(
		 * "org.eurekaJ.agent.EurekaJStringLogger.appendToBuffer(\"ClassInstrumentation: DefaultAgent "
		 * + clas.getName() + " " + mname +
		 * " \" + eurekaJTimingstart + \" \" + (System.currentTimeMillis() - eurekaJTimingstart) + \" "
		 * + cii.getClassType() + " " + cii.getPath() + "\");\n");
		 * 
		 * body.append(
		 * "eurekaJStackTraceBuilder.leave(System.currentTimeMillis() - eurekaJTimingstart);\n"
		 * );
		 * 
		 * if (!type.equals("void")) { body.append("return result;\n"); }
		 * body.append("}");
		 * 
		 * // print the generated code block just to show what was done //
		 * System.out.println("Interceptor method body:"); //
		 * System.out.println(body.toString());
		 * 
		 * // replace the body of the interceptor method with generated code
		 * block // and add it to class implMethod.setBody(body.toString());
		 * 
		 * // Transfer the modifiers over from the old method to the newly
		 * created // one implMethod.setModifiers(modifiers);
		 * implMethod.getMethodInfo().setAccessFlags(accessFlags);
		 * 
		 * // System.out.println("new impl method: " +
		 * implMethod.getSignature()); // System.out.println("new method: " +
		 * oldMethod.getSignature());
		 * 
		 * clas.addMethod(implMethod);
		 */
	}
}
