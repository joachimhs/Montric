/**
    EurekaJ Profiler - http://eurekaj.haagen.name
    
    Copyright (C) 2010-2011 Joachim Haagen Skeie

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/
package org.eurekaj.manager.util;

/**
 * Created by IntelliJ IDEA.
 * User: jhs
 * Date: 2/23/11
 * Time: 3:26 PM
 * To change this template use File | Settings | File Templates.
 */
public class ChartDataPoint {
    private Number x;
        private Number y;
        private String pointLabel;

        public ChartDataPoint() {
                super();
        }

        public ChartDataPoint(Number x, Number y) {
                super();
                this.x = x;
                this.y = y;
                this.pointLabel = null;
        }

        public ChartDataPoint(Number x, Number y, String pointLabel) {
                super();
                this.x = x;
                this.y = y;
                this.pointLabel = pointLabel;
        }

        public Number getX() {
                return x;
        }

        public void setX(Number x) {
                this.x = x;
        }

        public void setX(Object xObj) {
                if (xObj instanceof Number) {
                        this.x = (Number)xObj;
                } else if (xObj instanceof String) {
                        Double d = new Double((String)xObj);
                        this.x = d;
                }
        }

        public Number getY() {
                return y;
        }

        public void setY(Number y) {
                this.y = y;
        }

        public void setY(Object yObj) {
                if (yObj instanceof Number) {
                        this.y = (Number)yObj;
                } else if (yObj instanceof String) {
                        Double d = new Double((String)yObj);
                        this.y = d;
                }
        }

        public String getPointLabel() {
                return pointLabel;
        }

        public void setPointLabel(String pointLabel) {
                this.pointLabel = pointLabel;
        }

        public String toString() {
                StringBuilder sb = new StringBuilder();
                sb.append("(").append(x).append(",").append(y).append("): ").append(pointLabel);
                return sb.toString();
        }
}
