/* >>>>>>>>>> BEGIN source/sproutcore/calendar/views/calendar.js */
// ==========================================================================
// Project:  XT.Calendar
// Copyright: ©2011 Umberto Nicoletti (umberto.nicoletti@gmail.com) 
// Licensed under the MIT License (same as SC as of Feb/2011)
// ==========================================================================
/*globals XT */

/** @class
  Bind your controller on the "theDate" so that it is notified of user changes and/or
  it notifies the calendar of the new date.

  Dependencies: depends on the www.datejs.com (MIT Licensed) library for date calculations. Simply
  drop http://datejs.googlecode.com/files/date.js in your SC app.

  @extends SC.View
*/
XT.Calendar = SC.View.extend(
/** @scope XT.Calendar.prototype */ {
    // TODO: use localization to properly render Month and WOD names
    nomeMesi:["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],
    nomiGiorni:["Lu","Ma","Me","Gi","Ve","Sa","Do"],

    theDate: null,
    // save the first date of the period shown in the calendar
    firstOfPeriod:null,

    displayProperties: ["theDate"],

    render: function(context, firstTime) {
        var theDate=null;
        theDate=this.get("theDate");
        if (!theDate) {
            theDate=Date.today();
            this.theDate=theDate;
        }

        var firtsOfMonth=Date.parse((1900+theDate.getYear())+"/"+(theDate.getMonth()+1)+"/"+1);
        var daysToPreviousSunday=firtsOfMonth.getDay()==0 ? 6 : firtsOfMonth.getDay()-1;
        var firstOfPeriod=firtsOfMonth.add(-1*(daysToPreviousSunday)).days();
        this.saveFirstOfPeriod(theDate);
        
        var mese=this.get("nomeMesi")[theDate.getMonth()];
        var anno=1900+theDate.getYear();

        context=context.begin("table").attr("border","0").classNames(["calendar"]);
        // table head
        context=context.begin("tr").begin("td").id("previous").classNames(["header"]).push("&lt;").end().begin("td").classNames(["header"]).attr("colspan","5").attr("align","center").push(mese+" "+anno).end().begin("td").id("next").classNames(["header"]).push("&gt;").end().end();

        var day=0;
        for(var i=1;i<7;i++) {
            context=context.begin("tr");
            for(var j=1;j<8;j++) {
                day++;
                var id="day"+day;
                //console.log(firstOfPeriod+" == "+Date.today()+ " ? "+ firstOfPeriod==Date.today());
                if (firstOfPeriod.getMonth()!=theDate.getMonth()) {
                    context=context.begin("td").id(id).classNames(["not-this-month"]).push(firstOfPeriod.getDate()).end();
                } else if (firstOfPeriod.equals(theDate)) {
                    context=context.begin("td").id(id).classNames(["the-date"]).push(firstOfPeriod.getDate()).end();
                } else if (firstOfPeriod.equals(Date.today())) {
                    context=context.begin("td").id(id).classNames(["today"]).push(firstOfPeriod.getDate()).end();
                } else {
                    context=context.begin("td").id(id).push(firstOfPeriod.getDate()).end();
                }
                firstOfPeriod.add(1).days();
            }
            context=context.end();
        }
        context=context.begin("tr");
        for(var j=0;j<7;j++) {
            // show day of week
            context=context.begin("td").classNames(["day-of-week"]).push(this.get("nomiGiorni")[j]).end();
        }
        context=context.end();

        context.end();// close table        
    },

    saveFirstOfPeriod: function(d) {
        var firtsOfMonth=Date.parse((1900+d.getYear())+"/"+(d.getMonth()+1)+"/"+1);
        this.set("firstOfPeriod",firtsOfMonth.add(-1*(firtsOfMonth.getDay()-1)).days());
    },

    mouseDown: function(evt) {
        return YES;
    },

    mouseUp: function(evt) {
        if (evt.srcElement && evt.srcElement.id) {
            if (evt.srcElement.id=="previous") {
                var d=new Date(this.get("theDate").getTime());
                this.set("theDate",d.add(-1).months());
            }
            if (evt.srcElement.id=="next") {
                var d=new Date(this.get("theDate").getTime());
                this.set("theDate",d.add(1).months());
            }
            if (evt.srcElement.id.substr(0,3)=="day") {
                //console.log("    on "+evt.srcElement.id);
                var days=parseInt(evt.srcElement.id.substr(3))-1;
                //console.log(this.get("firstOfPeriod"));
                var newDate=this.get("firstOfPeriod").add(days).days();
                //console.log(" + "+days+" = " + newDate);
                this.set("theDate", newDate);
            }
        }
        return YES;
    },

    touchEnd: function(touch) {
        if (touch.event) this.mouseUp(touch.event);
    }
});

