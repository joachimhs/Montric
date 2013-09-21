Montric.LiviconView = Ember.View.extend({
    tagName: 'span',
    classNames: ['livicon'],

    //template: Ember.Handlebars.compile('<span class="livicon" {{bindAttr data-name="view.dataName"}} data-color="black" {{bindAttr data-size="view.dataSize"}} style="margin-right: 10px;">'),

    dataNameObserver: function() {
        console.log('dataNameObserver; ' + this.get('dataName'));
        this.rerender();
    }.observes('dataName'),

    didInsertElement: function() {
        this.createLivicon();
    },

    createLivicon: function() {
        var elementId = this.get('elementId');
        var size = this.get('dataSize');
        var iconname = this.get('dataName');
        var color = "black";
        var hovercolor = "blue";
        var animate = true;
        var looped = true;
        var iteration = false;
        var customduration = 600;
        var defeventtype = "hover";
        var icondata = null;
        var scalefactor = size/32;
        var onparent = this.$().parent();

        $("#" + elementId).css({"width":size,"height":size});
        $("#" + elementId).attr("data-name", iconname);
        $("#" + elementId).attr("data-size", size);
        $("#" + elementId).attr("data-color", color);

        var customattr = $("#" + elementId).data();
        console.log(customattr);

        var eventtype = customattr.eventtype||customattr.et ? customattr.eventtype||customattr.et : defeventtype;

        console.log('eventtype: ' + eventtype);

        if (iconname in liviconsdata) {
            icondata = liviconsdata[iconname];
        } else {
            icondata = liviconsdata[defname];
        };

        console.log(icondata);

        Raphael(elementId, size, size).createLivicon(elementId, iconname, size, color, hovercolor, animate, looped, iteration, customduration, eventtype, icondata, scalefactor, onparent);
    }
});