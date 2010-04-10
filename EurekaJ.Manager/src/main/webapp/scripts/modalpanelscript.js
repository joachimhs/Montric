var infoWindowAMShown = false;
var infoWindowAMTimer;
function showModalInfoWindow()
{
	 infoWindowAMTimer = setTimeout("if(!infoWindowAMShown){Richfaces.showModalPanel('ajaxLoadingModalBox');infoWindowAMShown=true;}", 350);
}
function hideModalInfoWindow()
{
	 if (infoWindowAMShown){Richfaces.hideModalPanel('ajaxLoadingModalBox');infoWindowAMShown=false;}else{if(infoWindowAMTimer)clearTimeout(infoWindowAMTimer);}
}