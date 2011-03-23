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
