/*!
 * License Agreement.
 *
 * Ajax4jsf 1.1 - Natural Ajax for Java Server Faces (JSF)
 *
 * Copyright (C) 2007 Exadel, Inc.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License version 2.1 as published by the Free Software Foundation.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA
 */

/*!
 * JSMin.java 2006-02-13
 * 
 * Copyright (c) 2006 John Reilly (www.inconspicuous.org)
 * 
 * This work is a translation from C to Java of jsmin.c published by
 * Douglas Crockford.  Permission is hereby granted to use the Java 
 * version under the same conditions as the jsmin.c on which it is
 * based.  
 * 
 * 
 * 
 * 
 * jsmin.c 2003-04-21
 * 
 * Copyright (c) 2002 Douglas Crockford (www.crockford.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * The Software shall be used for Good, not Evil.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package org.eurekaj.manager.util;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PushbackInputStream;

import org.apache.log4j.Logger;

public class JSMin {
        private static final int EOF = -1;

        private PushbackInputStream in;
        private OutputStream out;

        private int theA;
        private int theB;
        
        private int line;
        
        private int column;
        
        private static Logger logger = Logger.getLogger(JSMin.class.getName());
        
        public JSMin(InputStream in, OutputStream out) {
                this.in = new PushbackInputStream(in, 2);
                this.out = out;
                this.line = 0;
                this.column = 0;
        }

        /**
         * isAlphanum -- return true if the character is a letter, digit,
         * underscore, dollar sign, or non-ASCII character.
         */
        static boolean isAlphanum(int c) {
                return ( (c >= 'a' && c <= 'z') || 
                                 (c >= '0' && c <= '9') || 
                                 (c >= 'A' && c <= 'Z') || 
                                 c == '_' || 
                                 c == '$' || 
                                 c == '\\' || 
                                 c > 126);
        }

        /**
         * get -- return the next character from stdin. Watch out for lookahead. If
         * the character is a control character, translate it to a space or
         * linefeed.
         */
        int get() throws IOException {
                int c = in.read();
                
                if(c == '\n'){
                        line++;
                        column = 0;
                } else {
                        column++;
                }

                if (c >= ' ' || c == '\n' || c == EOF) {
                        return c;
                }

                if (c == '\r') {
                        column = 0;
                        return '\n';
                }
                
                return ' ';
        }

        
        
        /**
         * Get the next character without getting it.
         */
        int peek() throws IOException {
                int lookaheadChar = in.read();
                in.unread(lookaheadChar);
                return lookaheadChar;
        }
        
        int peek(int numCharsAhead) throws IOException {
        	if (numCharsAhead <= 1) {
        		return peek();
        	}
        	
        	//Read next numCharsAhead characters into array
        	int[] lookaheadCharArray = new int[numCharsAhead];
        	for (int i = 0; i < numCharsAhead; i++) {
        		lookaheadCharArray[i] = in.read();
        	}
        	
        	//unread characters back into InputStream in reverse order
        	for (int i = lookaheadCharArray.length -1; i >= 0; i--) {
        		in.unread(lookaheadCharArray[i]);
        	}
        	
        	//return the very last element of the array
        	return lookaheadCharArray[lookaheadCharArray.length - 1];
        }

        /**
         * next -- get the next character, excluding comments. peek() is used to see
         * if a '/' is followed by a '/' or '*'.
         */
        int next() throws IOException, UnterminatedCommentException {
                int c = get();
                //first /
                if (c == '/') {
                	int secondChar = peek();
                	int thirdChar = peek(2);
                	
                	
                	if (secondChar == '/') {
                		//second /, line comment
                		for (;;) {
                            c = get();
                            if (c <= '\n') {
                                    return c;
                            }
                		}
                	} else if (secondChar == '*') { // && thirdChar != '!') {
                		//block comment
                		get();
                        for (;;) {
                        	int newChar = get();
                        	if (newChar == '*') {
                        		//Possible start of endcomment
                        		if (peek() == '/') {
                        			//end of block comment
                        			get();
                        			return ' ';
                        		}
                        	} else if (newChar == EOF) {
                        		throw new UnterminatedCommentException(line,column);
                        	}
                        }
                	} else {
                		//default
                		return c;
                	}
                }
                return c;
        }

        /**
         * action -- do something! What you do is determined by the argument: 1
         * Output A. Copy B to A. Get the next B. 2 Copy B to A. Get the next B.
         * (Delete A). 3 Get the next B. (Delete B). action treats a string as a
         * single character. Wow! action recognizes a regular expression if it is
         * preceded by ( or , or =.
         */

        void action(int d) throws IOException, UnterminatedRegExpLiteralException,
                        UnterminatedCommentException, UnterminatedStringLiteralException {
                switch (d) {
                case 1:
                        out.write(theA);
                case 2:
                        theA = theB;

                        if (theA == '\'' || theA == '"') {
                                for (;;) {
                                        out.write(theA);
                                        theA = get();
                                        if (theA == theB) {
                                                break;
                                        }
                                        if (theA <= '\n') {
                                                throw new UnterminatedStringLiteralException(line,column);
                                        }
                                        if (theA == '\\') {
                                                out.write(theA);
                                                theA = get();
                                        }
                                }
                        }
                        
                case 3:
                        theB = next();
                        if (theB == '/' && (theA == '(' || theA == ',' || theA == '=' ||
                                        theA == ':' || theA == '[' || theA == '!' || 
                                        theA == '&' || theA == '|' || theA == '?' || 
                                        theA == '{' || theA == '}' || theA == ';' || 
                                        theA == '\n')) {
               
                                out.write(theA);
                                out.write(theB);
                                for (;;) {
                                        theA = get();
                                        if (theA == '/') {
                                                break;
                                        } else if (theA == '\\') {
                                                out.write(theA);
                                                theA = get();
                                        } else if (theA <= '\n') {
                                        	logger.info(out.toString());
                                                throw new UnterminatedRegExpLiteralException(line,column);
                                        }
                                        out.write(theA);
                                }
                                theB = next();
                        }
                }
        }

        /**
         * jsmin -- Copy the input to the output, deleting the characters which are
         * insignificant to JavaScript. Comments will be removed. Tabs will be
         * replaced with spaces. Carriage returns will be replaced with linefeeds.
         * Most spaces and linefeeds will be removed.
         */
        public void jsmin() throws IOException, UnterminatedRegExpLiteralException, UnterminatedCommentException, UnterminatedStringLiteralException{
                theA = '\n';
                action(3);
                while (theA != EOF) {
                        switch (theA) {
                        case ' ':
                                if (isAlphanum(theB)) {
                                        action(1);
                                } else {
                                        action(2);
                                }
                                break;
                        case '\n':
                                switch (theB) {
                                case '{':
                                case '[':
                                case '(':
                                case '+':
                                case '-':
                                        action(1);
                                        break;
                                case ' ':
                                        action(3);
                                        break;
                                default:
                                        if (isAlphanum(theB)) {
                                                action(1);
                                        } else {
                                                action(2);
                                        }
                                }
                                break;
                        default:
                                switch (theB) {
                                case ' ':
                                        if (isAlphanum(theA)) {
                                                action(1);
                                                break;
                                        }
                                        action(3);
                                        break;
                                case '\n':
                                        switch (theA) {
                                        case '}':
                                        case ']':
                                        case ')':
                                        case '+':
                                        case '-':
                                        case '"':
                                        case '\'':
                                                action(1);
                                                break;
                                        default:
                                                if (isAlphanum(theA)) {
                                                        action(1);
                                                } else {
                                                        action(3);
                                                }
                                        }
                                        break;
                                default:
                                        action(1);
                                        break;
                                }
                        }
                }
                out.flush();
        }

        public static class UnterminatedCommentException extends Exception {
                public UnterminatedCommentException(int line,int column) {
                        super("Unterminated comment at line "+line+" and column "+column);
                }
        }

        public static class UnterminatedStringLiteralException extends Exception {
                public UnterminatedStringLiteralException(int line,int column) {
                        super("Unterminated string literal at line "+line+" and column "+column);
                }
        }

        public static class UnterminatedRegExpLiteralException extends Exception {
                public UnterminatedRegExpLiteralException(int line,int column) {
                        super("Unterminated regular expression at line "+line+" and column "+column);
                }
        }

        public static void main(String arg[]) {
                try {
                        JSMin jsmin = new JSMin(new FileInputStream(arg[0]), System.out);
                        jsmin.jsmin();
                } catch (FileNotFoundException e) {
                        e.printStackTrace();
                } catch (ArrayIndexOutOfBoundsException e) {
                        e.printStackTrace();                    
                } catch (IOException e) {
                        e.printStackTrace();
                } catch (UnterminatedRegExpLiteralException e) {
                        e.printStackTrace();
                } catch (UnterminatedCommentException e) {
                        e.printStackTrace();
                } catch (UnterminatedStringLiteralException e) {
                        e.printStackTrace();
                }
        }



}