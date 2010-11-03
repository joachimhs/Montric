var ObjectiveJ={};
(function(_1,_2){
if(!this.JSON){
JSON={};
}
(function(){
function f(n){
return n<10?"0"+n:n;
};
if(typeof Date.prototype.toJSON!=="function"){
Date.prototype.toJSON=function(_3){
return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z";
};
String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(_4){
return this.valueOf();
};
}
var cx=new RegExp("[\\u0000\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]","g");
var _5=new RegExp("[\\\\\\\"\\x00-\\x1f\\x7f-\\x9f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]","g");
var _6,_7,_8={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r","\"":"\\\"","\\":"\\\\"},_9;
function _a(_b){
_5.lastIndex=0;
return _5.test(_b)?"\""+_b.replace(_5,function(a){
var c=_8[a];
return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
})+"\"":"\""+_b+"\"";
};
function _c(_d,_e){
var i,k,v,_f,_10=_6,_11,_12=_e[_d];
if(_12&&typeof _12==="object"&&typeof _12.toJSON==="function"){
_12=_12.toJSON(_d);
}
if(typeof _9==="function"){
_12=_9.call(_e,_d,_12);
}
switch(typeof _12){
case "string":
return _a(_12);
case "number":
return isFinite(_12)?String(_12):"null";
case "boolean":
case "null":
return String(_12);
case "object":
if(!_12){
return "null";
}
_6+=_7;
_11=[];
if(Object.prototype.toString.apply(_12)==="[object Array]"){
_f=_12.length;
for(i=0;i<_f;i+=1){
_11[i]=_c(i,_12)||"null";
}
v=_11.length===0?"[]":_6?"[\n"+_6+_11.join(",\n"+_6)+"\n"+_10+"]":"["+_11.join(",")+"]";
_6=_10;
return v;
}
if(_9&&typeof _9==="object"){
_f=_9.length;
for(i=0;i<_f;i+=1){
k=_9[i];
if(typeof k==="string"){
v=_c(k,_12);
if(v){
_11.push(_a(k)+(_6?": ":":")+v);
}
}
}
}else{
for(k in _12){
if(Object.hasOwnProperty.call(_12,k)){
v=_c(k,_12);
if(v){
_11.push(_a(k)+(_6?": ":":")+v);
}
}
}
}
v=_11.length===0?"{}":_6?"{\n"+_6+_11.join(",\n"+_6)+"\n"+_10+"}":"{"+_11.join(",")+"}";
_6=_10;
return v;
}
};
if(typeof JSON.stringify!=="function"){
JSON.stringify=function(_13,_14,_15){
var i;
_6="";
_7="";
if(typeof _15==="number"){
for(i=0;i<_15;i+=1){
_7+=" ";
}
}else{
if(typeof _15==="string"){
_7=_15;
}
}
_9=_14;
if(_14&&typeof _14!=="function"&&(typeof _14!=="object"||typeof _14.length!=="number")){
throw new Error("JSON.stringify");
}
return _c("",{"":_13});
};
}
if(typeof JSON.parse!=="function"){
JSON.parse=function(_16,_17){
var j;
function _18(_19,key){
var k,v,_1a=_19[key];
if(_1a&&typeof _1a==="object"){
for(k in _1a){
if(Object.hasOwnProperty.call(_1a,k)){
v=_18(_1a,k);
if(v!==_44){
_1a[k]=v;
}else{
delete _1a[k];
}
}
}
}
return _17.call(_19,key,_1a);
};
cx.lastIndex=0;
if(cx.test(_16)){
_16=_16.replace(cx,function(a){
return "\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4);
});
}
if(/^[\],:{}\s]*$/.test(_16.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){
j=eval("("+_16+")");
return typeof _17==="function"?_18({"":j},""):j;
}
throw new SyntaxError("JSON.parse");
};
}
}());
var _1b=new RegExp("([^%]+|%[\\+\\-\\ \\#0]*[0-9\\*]*(.[0-9\\*]+)?[hlL]?[cbBdieEfgGosuxXpn%@])","g");
var _1c=new RegExp("(%)([\\+\\-\\ \\#0]*)([0-9\\*]*)((.[0-9\\*]+)?)([hlL]?)([cbBdieEfgGosuxXpn%@])");
_2.sprintf=function(_1d){
var _1d=arguments[0],_1e=_1d.match(_1b),_1f=0,_20="",arg=1;
for(var i=0;i<_1e.length;i++){
var t=_1e[i];
if(_1d.substring(_1f,_1f+t.length)!=t){
return _20;
}
_1f+=t.length;
if(t.charAt(0)!="%"){
_20+=t;
}else{
var _21=t.match(_1c);
if(_21.length!=8||_21[0]!=t){
return _20;
}
var _22=_21[1],_23=_21[2],_24=_21[3],_25=_21[4],_26=_21[6],_27=_21[7];
var _28=null;
if(_24=="*"){
_28=arguments[arg++];
}else{
if(_24!=""){
_28=Number(_24);
}
}
var _29=null;
if(_25==".*"){
_29=arguments[arg++];
}else{
if(_25!=""){
_29=Number(_25.substring(1));
}
}
var _2a=(_23.indexOf("-")>=0);
var _2b=(_23.indexOf("0")>=0);
var _2c="";
if(RegExp("[bBdiufeExXo]").test(_27)){
var num=Number(arguments[arg++]);
var _2d="";
if(num<0){
_2d="-";
}else{
if(_23.indexOf("+")>=0){
_2d="+";
}else{
if(_23.indexOf(" ")>=0){
_2d=" ";
}
}
}
if(_27=="d"||_27=="i"||_27=="u"){
var _2e=String(Math.abs(Math.floor(num)));
_2c=_2f(_2d,"",_2e,"",_28,_2a,_2b);
}
if(_27=="f"){
var _2e=String((_29!=null)?Math.abs(num).toFixed(_29):Math.abs(num));
var _30=(_23.indexOf("#")>=0&&_2e.indexOf(".")<0)?".":"";
_2c=_2f(_2d,"",_2e,_30,_28,_2a,_2b);
}
if(_27=="e"||_27=="E"){
var _2e=String(Math.abs(num).toExponential(_29!=null?_29:21));
var _30=(_23.indexOf("#")>=0&&_2e.indexOf(".")<0)?".":"";
_2c=_2f(_2d,"",_2e,_30,_28,_2a,_2b);
}
if(_27=="x"||_27=="X"){
var _2e=String(Math.abs(num).toString(16));
var _31=(_23.indexOf("#")>=0&&num!=0)?"0x":"";
_2c=_2f(_2d,_31,_2e,"",_28,_2a,_2b);
}
if(_27=="b"||_27=="B"){
var _2e=String(Math.abs(num).toString(2));
var _31=(_23.indexOf("#")>=0&&num!=0)?"0b":"";
_2c=_2f(_2d,_31,_2e,"",_28,_2a,_2b);
}
if(_27=="o"){
var _2e=String(Math.abs(num).toString(8));
var _31=(_23.indexOf("#")>=0&&num!=0)?"0":"";
_2c=_2f(_2d,_31,_2e,"",_28,_2a,_2b);
}
if(RegExp("[A-Z]").test(_27)){
_2c=_2c.toUpperCase();
}else{
_2c=_2c.toLowerCase();
}
}else{
var _2c="";
if(_27=="%"){
_2c="%";
}else{
if(_27=="c"){
_2c=String(arguments[arg++]).charAt(0);
}else{
if(_27=="s"||_27=="@"){
_2c=String(arguments[arg++]);
}else{
if(_27=="p"||_27=="n"){
arg++;
_2c="";
}
}
}
}
_2c=_2f("","",_2c,"",_28,_2a,false);
}
_20+=_2c;
}
}
return _20;
};
function _2f(_32,_33,_34,_35,_36,_37,_38){
var _39=(_32.length+_33.length+_34.length+_35.length);
if(_37){
return _32+_33+_34+_35+pad(_36-_39," ");
}else{
if(_38){
return _32+_33+pad(_36-_39,"0")+_34+_35;
}else{
return pad(_36-_39," ")+_32+_33+_34+_35;
}
}
};
function pad(n,ch){
return Array(MAX(0,n)+1).join(ch);
};
CPLogDisable=false;
var _3a="Cappuccino";
var _3b=["fatal","error","warn","info","debug","trace"];
var _3c=_3b[3];
var _3d={};
for(var i=0;i<_3b.length;i++){
_3d[_3b[i]]=i;
}
var _3e={};
CPLogRegister=function(_3f,_40){
CPLogRegisterRange(_3f,_3b[0],_40||_3b[_3b.length-1]);
};
CPLogRegisterRange=function(_41,_42,_43){
var min=_3d[_42];
var max=_3d[_43];
if(min!==_44&&max!==_44){
for(var i=0;i<=max;i++){
CPLogRegisterSingle(_41,_3b[i]);
}
}
};
CPLogRegisterSingle=function(_45,_46){
if(!_3e[_46]){
_3e[_46]=[];
}
for(var i=0;i<_3e[_46].length;i++){
if(_3e[_46][i]===_45){
return;
}
}
_3e[_46].push(_45);
};
CPLogUnregister=function(_47){
for(var _48 in _3e){
for(var i=0;i<_3e[_48].length;i++){
if(_3e[_48][i]===_47){
_3e[_48].splice(i--,1);
}
}
}
};
function _49(_4a,_4b,_4c){
if(_4c==_44){
_4c=_3a;
}
if(_4b==_44){
_4b=_3c;
}
var _4d=(typeof _4a[0]=="string"&&_4a.length>1)?_2.sprintf.apply(null,_4a):String(_4a[0]);
if(_3e[_4b]){
for(var i=0;i<_3e[_4b].length;i++){
_3e[_4b][i](_4d,_4b,_4c);
}
}
};
CPLog=function(){
_49(arguments);
};
for(var i=0;i<_3b.length;i++){
CPLog[_3b[i]]=(function(_4e){
return function(){
_49(arguments,_4e);
};
})(_3b[i]);
}
var _4f=function(_50,_51,_52){
var now=new Date();
_51=(_51==null?"":" ["+_51+"]");
if(typeof _2.sprintf=="function"){
return _2.sprintf("%4d-%02d-%02d %02d:%02d:%02d.%03d %s%s: %s",now.getFullYear(),now.getMonth()+1,now.getDate(),now.getHours(),now.getMinutes(),now.getSeconds(),now.getMilliseconds(),_52,_51,_50);
}else{
return now+" "+_52+_51+": "+_50;
}
};
CPLogConsole=function(_53,_54,_55){
if(typeof console!="undefined"){
var _56=_4f(_53,_54,_55);
var _57={"fatal":"error","error":"error","warn":"warn","info":"info","debug":"debug","trace":"debug"}[_54];
if(_57&&console[_57]){
console[_57](_56);
}else{
if(console.log){
console.log(_56);
}
}
}
};
CPLogAlert=function(_58,_59,_5a){
if(typeof alert!="undefined"&&!CPLogDisable){
var _5b=_4f(_58,_59,_5a);
CPLogDisable=!confirm(_5b+"\n\n(Click cancel to stop log alerts)");
}
};
var _5c=null;
CPLogPopup=function(_5d,_5e,_5f){
try{
if(CPLogDisable||window.open==_44){
return;
}
if(!_5c||!_5c.document){
_5c=window.open("","_blank","width=600,height=400,status=no,resizable=yes,scrollbars=yes");
if(!_5c){
CPLogDisable=!confirm(_5d+"\n\n(Disable pop-up blocking for CPLog window; Click cancel to stop log alerts)");
return;
}
_60(_5c);
}
var _61=_5c.document.createElement("div");
_61.setAttribute("class",_5e||"fatal");
var _62=_4f(_5d,null,_5f);
_61.appendChild(_5c.document.createTextNode(_62));
_5c.log.appendChild(_61);
if(_5c.focusEnabled.checked){
_5c.focus();
}
if(_5c.blockEnabled.checked){
_5c.blockEnabled.checked=_5c.confirm(_62+"\nContinue blocking?");
}
if(_5c.scrollEnabled.checked){
_5c.scrollToBottom();
}
}
catch(e){
}
};
var _63="<style type=\"text/css\" media=\"screen\"> body{font:10px Monaco,Courier,\"Courier New\",monospace,mono;padding-top:15px;} div > .fatal,div > .error,div > .warn,div > .info,div > .debug,div > .trace{display:none;overflow:hidden;white-space:pre;padding:0px 5px 0px 5px;margin-top:2px;-moz-border-radius:5px;-webkit-border-radius:5px;} div[wrap=\"yes\"] > div{white-space:normal;} .fatal{background-color:#ffb2b3;} .error{background-color:#ffe2b2;} .warn{background-color:#fdffb2;} .info{background-color:#e4ffb2;} .debug{background-color:#a0e5a0;} .trace{background-color:#99b9ff;} .enfatal .fatal,.enerror .error,.enwarn .warn,.eninfo .info,.endebug .debug,.entrace .trace{display:block;} div#header{background-color:rgba(240,240,240,0.82);position:fixed;top:0px;left:0px;width:100%;border-bottom:1px solid rgba(0,0,0,0.33);text-align:center;} ul#enablers{display:inline-block;margin:1px 15px 0 15px;padding:2px 0 2px 0;} ul#enablers li{display:inline;padding:0px 5px 0px 5px;margin-left:4px;-moz-border-radius:5px;-webkit-border-radius:5px;} [enabled=\"no\"]{opacity:0.25;} ul#options{display:inline-block;margin:0 15px 0px 15px;padding:0 0px;} ul#options li{margin:0 0 0 0;padding:0 0 0 0;display:inline;} </style>";
function _60(_64){
var doc=_64.document;
doc.writeln("<html><head><title></title>"+_63+"</head><body></body></html>");
doc.title=_3a+" Run Log";
var _65=doc.getElementsByTagName("head")[0];
var _66=doc.getElementsByTagName("body")[0];
var _67=window.location.protocol+"//"+window.location.host+window.location.pathname;
_67=_67.substring(0,_67.lastIndexOf("/")+1);
var div=doc.createElement("div");
div.setAttribute("id","header");
_66.appendChild(div);
var ul=doc.createElement("ul");
ul.setAttribute("id","enablers");
div.appendChild(ul);
for(var i=0;i<_3b.length;i++){
var li=doc.createElement("li");
li.setAttribute("id","en"+_3b[i]);
li.setAttribute("class",_3b[i]);
li.setAttribute("onclick","toggle(this);");
li.setAttribute("enabled","yes");
li.appendChild(doc.createTextNode(_3b[i]));
ul.appendChild(li);
}
var ul=doc.createElement("ul");
ul.setAttribute("id","options");
div.appendChild(ul);
var _68={"focus":["Focus",false],"block":["Block",false],"wrap":["Wrap",false],"scroll":["Scroll",true],"close":["Close",true]};
for(o in _68){
var li=doc.createElement("li");
ul.appendChild(li);
_64[o+"Enabled"]=doc.createElement("input");
_64[o+"Enabled"].setAttribute("id",o);
_64[o+"Enabled"].setAttribute("type","checkbox");
if(_68[o][1]){
_64[o+"Enabled"].setAttribute("checked","checked");
}
li.appendChild(_64[o+"Enabled"]);
var _69=doc.createElement("label");
_69.setAttribute("for",o);
_69.appendChild(doc.createTextNode(_68[o][0]));
li.appendChild(_69);
}
_64.log=doc.createElement("div");
_64.log.setAttribute("class","enerror endebug enwarn eninfo enfatal entrace");
_66.appendChild(_64.log);
_64.toggle=function(_6a){
var _6b=(_6a.getAttribute("enabled")=="yes")?"no":"yes";
_6a.setAttribute("enabled",_6b);
if(_6b=="yes"){
_64.log.className+=" "+_6a.id;
}else{
_64.log.className=_64.log.className.replace(new RegExp("[\\s]*"+_6a.id,"g"),"");
}
};
_64.scrollToBottom=function(){
_64.scrollTo(0,_66.offsetHeight);
};
_64.wrapEnabled.addEventListener("click",function(){
_64.log.setAttribute("wrap",_64.wrapEnabled.checked?"yes":"no");
},false);
_64.addEventListener("keydown",function(e){
var e=e||_64.event;
if(e.keyCode==75&&(e.ctrlKey||e.metaKey)){
while(_64.log.firstChild){
_64.log.removeChild(_64.log.firstChild);
}
e.preventDefault();
}
},"false");
window.addEventListener("unload",function(){
if(_64&&_64.closeEnabled&&_64.closeEnabled.checked){
CPLogDisable=true;
_64.close();
}
},false);
_64.addEventListener("unload",function(){
if(!CPLogDisable){
CPLogDisable=!confirm("Click cancel to stop logging");
}
},false);
};
CPLogDefault=(typeof window==="object"&&window.console)?CPLogConsole:CPLogPopup;
var _44;
if(typeof window!=="undefined"){
window.setNativeTimeout=window.setTimeout;
window.clearNativeTimeout=window.clearTimeout;
window.setNativeInterval=window.setInterval;
window.clearNativeInterval=window.clearInterval;
}
NO=false;
YES=true;
nil=null;
Nil=null;
NULL=null;
ABS=Math.abs;
ASIN=Math.asin;
ACOS=Math.acos;
ATAN=Math.atan;
ATAN2=Math.atan2;
SIN=Math.sin;
COS=Math.cos;
TAN=Math.tan;
EXP=Math.exp;
POW=Math.pow;
CEIL=Math.ceil;
FLOOR=Math.floor;
ROUND=Math.round;
MIN=Math.min;
MAX=Math.max;
RAND=Math.random;
SQRT=Math.sqrt;
E=Math.E;
LN2=Math.LN2;
LN10=Math.LN10;
LOG2E=Math.LOG2E;
LOG10E=Math.LOG10E;
PI=Math.PI;
PI2=Math.PI*2;
PI_2=Math.PI/2;
SQRT1_2=Math.SQRT1_2;
SQRT2=Math.SQRT2;
function _6c(_6d){
this._eventListenersForEventNames={};
this._owner=_6d;
};
_6c.prototype.addEventListener=function(_6e,_6f){
var _70=this._eventListenersForEventNames;
if(!_71.call(_70,_6e)){
var _72=[];
_70[_6e]=_72;
}else{
var _72=_70[_6e];
}
var _73=_72.length;
while(_73--){
if(_72[_73]===_6f){
return;
}
}
_72.push(_6f);
};
_6c.prototype.removeEventListener=function(_74,_75){
var _76=this._eventListenersForEventNames;
if(!_71.call(_76,_74)){
return;
}
var _77=_76[_74],_78=_77.length;
while(_78--){
if(_77[_78]===_75){
return _77.splice(_78,1);
}
}
};
_6c.prototype.dispatchEvent=function(_79){
var _7a=_79.type,_7b=this._eventListenersForEventNames;
if(_71.call(_7b,_7a)){
var _7c=this._eventListenersForEventNames[_7a],_7d=0,_7e=_7c.length;
for(;_7d<_7e;++_7d){
_7c[_7d](_79);
}
}
var _7f=(this._owner||this)["on"+_7a];
if(_7f){
_7f(_79);
}
};
var _80=0,_81=null,_82=[];
function _83(_84){
var _85=_80;
if(_81===null){
window.setNativeTimeout(function(){
var _86=_82,_87=0,_88=_82.length;
++_80;
_81=null;
_82=[];
for(;_87<_88;++_87){
_86[_87]();
}
},0);
}
return function(){
var _89=arguments;
if(_80>_85){
_84.apply(this,_89);
}else{
_82.push(function(){
_84.apply(this,_89);
});
}
};
};
var _8a=null;
if(window.ActiveXObject!==_44){
var _8b=["Msxml2.XMLHTTP.3.0","Msxml2.XMLHTTP.6.0"],_8c=_8b.length;
while(_8c--){
try{
var _8d=_8b[_8c];
new ActiveXObject(_8d);
_8a=function(){
return new ActiveXObject(_8d);
};
break;
}
catch(anException){
}
}
}
if(!_8a){
_8a=window.XMLHttpRequest;
}
CFHTTPRequest=function(){
this._isOpen=false;
this._requestHeaders={};
this._mimeType=null;
this._eventDispatcher=new _6c(this);
this._nativeRequest=new _8a();
var _8e=this;
this._stateChangeHandler=function(){
_a1(_8e);
};
this._nativeRequest.onreadystatechange=this._stateChangeHandler;
if(CFHTTPRequest.AuthenticationDelegate!==nil){
this._eventDispatcher.addEventListener("HTTP403",function(){
CFHTTPRequest.AuthenticationDelegate(_8e);
});
}
};
CFHTTPRequest.UninitializedState=0;
CFHTTPRequest.LoadingState=1;
CFHTTPRequest.LoadedState=2;
CFHTTPRequest.InteractiveState=3;
CFHTTPRequest.CompleteState=4;
CFHTTPRequest.AuthenticationDelegate=nil;
CFHTTPRequest.prototype.status=function(){
try{
return this._nativeRequest.status||0;
}
catch(anException){
return 0;
}
};
CFHTTPRequest.prototype.statusText=function(){
try{
return this._nativeRequest.statusText||"";
}
catch(anException){
return "";
}
};
CFHTTPRequest.prototype.readyState=function(){
return this._nativeRequest.readyState;
};
CFHTTPRequest.prototype.success=function(){
var _8f=this.status();
if(_8f>=200&&_8f<300){
return YES;
}
return _8f===0&&this.responseText()&&this.responseText().length;
};
CFHTTPRequest.prototype.responseXML=function(){
var _90=this._nativeRequest.responseXML;
if(_90&&(_8a===window.XMLHttpRequest)){
return _90;
}
return _91(this.responseText());
};
CFHTTPRequest.prototype.responsePropertyList=function(){
var _92=this.responseText();
if(CFPropertyList.sniffedFormatOfString(_92)===CFPropertyList.FormatXML_v1_0){
return CFPropertyList.propertyListFromXML(this.responseXML());
}
return CFPropertyList.propertyListFromString(_92);
};
CFHTTPRequest.prototype.responseText=function(){
return this._nativeRequest.responseText;
};
CFHTTPRequest.prototype.setRequestHeader=function(_93,_94){
this._requestHeaders[_93]=_94;
};
CFHTTPRequest.prototype.getResponseHeader=function(_95){
return this._nativeRequest.getResponseHeader(_95);
};
CFHTTPRequest.prototype.getAllResponseHeaders=function(){
return this._nativeRequest.getAllResponseHeaders();
};
CFHTTPRequest.prototype.overrideMimeType=function(_96){
this._mimeType=_96;
};
CFHTTPRequest.prototype.open=function(_97,_98,_99,_9a,_9b){
this._isOpen=true;
this._URL=_98;
this._async=_99;
this._method=_97;
this._user=_9a;
this._password=_9b;
return this._nativeRequest.open(_97,_98,_99,_9a,_9b);
};
CFHTTPRequest.prototype.send=function(_9c){
if(!this._isOpen){
delete this._nativeRequest.onreadystatechange;
this._nativeRequest.open(this._method,this._URL,this._async,this._user,this._password);
this._nativeRequest.onreadystatechange=this._stateChangeHandler;
}
for(var i in this._requestHeaders){
if(this._requestHeaders.hasOwnProperty(i)){
this._nativeRequest.setRequestHeader(i,this._requestHeaders[i]);
}
}
if(this._mimeType&&"overrideMimeType" in this._nativeRequest){
this._nativeRequest.overrideMimeType(this._mimeType);
}
this._isOpen=false;
try{
return this._nativeRequest.send(_9c);
}
catch(anException){
this._eventDispatcher.dispatchEvent({type:"failure",request:this});
}
};
CFHTTPRequest.prototype.abort=function(){
this._isOpen=false;
return this._nativeRequest.abort();
};
CFHTTPRequest.prototype.addEventListener=function(_9d,_9e){
this._eventDispatcher.addEventListener(_9d,_9e);
};
CFHTTPRequest.prototype.removeEventListener=function(_9f,_a0){
this._eventDispatcher.removeEventListener(_9f,_a0);
};
function _a1(_a2){
var _a3=_a2._eventDispatcher;
_a3.dispatchEvent({type:"readystatechange",request:_a2});
var _a4=_a2._nativeRequest,_a5=["uninitialized","loading","loaded","interactive","complete"];
if(_a5[_a2.readyState()]==="complete"){
var _a6="HTTP"+_a2.status();
_a3.dispatchEvent({type:_a6,request:_a2});
var _a7=_a2.success()?"success":"failure";
_a3.dispatchEvent({type:_a7,request:_a2});
_a3.dispatchEvent({type:_a5[_a2.readyState()],request:_a2});
}else{
_a3.dispatchEvent({type:_a5[_a2.readyState()],request:_a2});
}
};
function _a8(_a9,_aa,_ab){
var _ac=new CFHTTPRequest();
if(_a9.pathExtension()==="plist"){
_ac.overrideMimeType("text/xml");
}
if(_2.asyncLoader){
_ac.onsuccess=_83(_aa);
_ac.onfailure=_83(_ab);
}else{
_ac.onsuccess=_aa;
_ac.onfailure=_ab;
}
_ac.open("GET",_a9.absoluteString(),_2.asyncLoader);
_ac.send("");
};
_2.asyncLoader=YES;
_2.Asynchronous=_83;
_2.determineAndDispatchHTTPRequestEvents=_a1;
var _ad=0;
objj_generateObjectUID=function(){
return _ad++;
};
CFPropertyList=function(){
this._UID=objj_generateObjectUID();
};
CFPropertyList.DTDRE=/^\s*(?:<\?\s*xml\s+version\s*=\s*\"1.0\"[^>]*\?>\s*)?(?:<\!DOCTYPE[^>]*>\s*)?/i;
CFPropertyList.XMLRE=/^\s*(?:<\?\s*xml\s+version\s*=\s*\"1.0\"[^>]*\?>\s*)?(?:<\!DOCTYPE[^>]*>\s*)?<\s*plist[^>]*\>/i;
CFPropertyList.FormatXMLDTD="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">";
CFPropertyList.Format280NorthMagicNumber="280NPLIST";
CFPropertyList.FormatOpenStep=1,CFPropertyList.FormatXML_v1_0=100,CFPropertyList.FormatBinary_v1_0=200,CFPropertyList.Format280North_v1_0=-1000;
CFPropertyList.sniffedFormatOfString=function(_ae){
if(_ae.match(CFPropertyList.XMLRE)){
return CFPropertyList.FormatXML_v1_0;
}
if(_ae.substr(0,CFPropertyList.Format280NorthMagicNumber.length)===CFPropertyList.Format280NorthMagicNumber){
return CFPropertyList.Format280North_v1_0;
}
return NULL;
};
CFPropertyList.dataFromPropertyList=function(_af,_b0){
var _b1=new CFMutableData();
_b1.setRawString(CFPropertyList.stringFromPropertyList(_af,_b0));
return _b1;
};
CFPropertyList.stringFromPropertyList=function(_b2,_b3){
if(!_b3){
_b3=CFPropertyList.Format280North_v1_0;
}
var _b4=_b5[_b3];
return _b4["start"]()+_b6(_b2,_b4)+_b4["finish"]();
};
function _b6(_b7,_b8){
var _b9=typeof _b7,_ba=_b7.valueOf(),_bb=typeof _ba;
if(_b9!==_bb){
_b9=_bb;
_b7=_ba;
}
if(_b7===YES||_b7===NO){
_b9="boolean";
}else{
if(_b9==="number"){
if(FLOOR(_b7)===_b7){
_b9="integer";
}else{
_b9="real";
}
}else{
if(_b9!=="string"){
if(_b7.slice){
_b9="array";
}else{
_b9="dictionary";
}
}
}
}
return _b8[_b9](_b7,_b8);
};
var _b5={};
_b5[CFPropertyList.FormatXML_v1_0]={"start":function(){
return CFPropertyList.FormatXMLDTD+"<plist version = \"1.0\">";
},"finish":function(){
return "</plist>";
},"string":function(_bc){
return "<string>"+_bd(_bc)+"</string>";
},"boolean":function(_be){
return _be?"<true/>":"<false/>";
},"integer":function(_bf){
return "<integer>"+_bf+"</integer>";
},"real":function(_c0){
return "<real>"+_c0+"</real>";
},"array":function(_c1,_c2){
var _c3=0,_c4=_c1.length,_c5="<array>";
for(;_c3<_c4;++_c3){
_c5+=_b6(_c1[_c3],_c2);
}
return _c5+"</array>";
},"dictionary":function(_c6,_c7){
var _c8=_c6._keys,_8c=0,_c9=_c8.length,_ca="<dict>";
for(;_8c<_c9;++_8c){
var key=_c8[_8c];
_ca+="<key>"+key+"</key>";
_ca+=_b6(_c6.valueForKey(key),_c7);
}
return _ca+"</dict>";
}};
var _cb="A",_cc="D",_cd="f",_ce="d",_cf="S",_d0="T",_d1="F",_d2="K",_d3="E";
_b5[CFPropertyList.Format280North_v1_0]={"start":function(){
return CFPropertyList.Format280NorthMagicNumber+";1.0;";
},"finish":function(){
return "";
},"string":function(_d4){
return _cf+";"+_d4.length+";"+_d4;
},"boolean":function(_d5){
return (_d5?_d0:_d1)+";";
},"integer":function(_d6){
var _d7=""+_d6;
return _ce+";"+_d7.length+";"+_d7;
},"real":function(_d8){
var _d9=""+_d8;
return _cd+";"+_d9.length+";"+_d9;
},"array":function(_da,_db){
var _dc=0,_dd=_da.length,_de=_cb+";";
for(;_dc<_dd;++_dc){
_de+=_b6(_da[_dc],_db);
}
return _de+_d3+";";
},"dictionary":function(_df,_e0){
var _e1=_df._keys,_8c=0,_e2=_e1.length,_e3=_cc+";";
for(;_8c<_e2;++_8c){
var key=_e1[_8c];
_e3+=_d2+";"+key.length+";"+key;
_e3+=_b6(_df.valueForKey(key),_e0);
}
return _e3+_d3+";";
}};
var _e4="xml",_e5="#document",_e6="plist",_e7="key",_e8="dict",_e9="array",_ea="string",_eb="true",_ec="false",_ed="real",_ee="integer",_ef="data";
var _f0=function(_f1,_f2,_f3){
var _f4=_f1;
_f4=(_f4.firstChild);
if(_f4!==NULL&&((_f4.nodeType)===8||(_f4.nodeType)===3)){
while((_f4=(_f4.nextSibling))&&((_f4.nodeType)===8||(_f4.nodeType)===3)){
}
}
if(_f4){
return _f4;
}
if((String(_f1.nodeName))===_e9||(String(_f1.nodeName))===_e8){
_f3.pop();
}else{
if(_f4===_f2){
return NULL;
}
_f4=_f1;
while((_f4=(_f4.nextSibling))&&((_f4.nodeType)===8||(_f4.nodeType)===3)){
}
if(_f4){
return _f4;
}
}
_f4=_f1;
while(_f4){
var _f5=_f4;
while((_f5=(_f5.nextSibling))&&((_f5.nodeType)===8||(_f5.nodeType)===3)){
}
if(_f5){
return _f5;
}
var _f4=(_f4.parentNode);
if(_f2&&_f4===_f2){
return NULL;
}
_f3.pop();
}
return NULL;
};
CFPropertyList.propertyListFromData=function(_f6,_f7){
return CFPropertyList.propertyListFromString(_f6.rawString(),_f7);
};
CFPropertyList.propertyListFromString=function(_f8,_f9){
if(!_f9){
_f9=CFPropertyList.sniffedFormatOfString(_f8);
}
if(_f9===CFPropertyList.FormatXML_v1_0){
return CFPropertyList.propertyListFromXML(_f8);
}
if(_f9===CFPropertyList.Format280North_v1_0){
return _fa(_f8);
}
return NULL;
};
var _cb="A",_cc="D",_cd="f",_ce="d",_cf="S",_d0="T",_d1="F",_d2="K",_d3="E";
function _fa(_fb){
var _fc=new _fd(_fb),_fe=NULL,key="",_ff=NULL,_100=NULL,_101=[],_102=NULL;
while(_fe=_fc.getMarker()){
if(_fe===_d3){
_101.pop();
continue;
}
var _103=_101.length;
if(_103){
_102=_101[_103-1];
}
if(_fe===_d2){
key=_fc.getString();
_fe=_fc.getMarker();
}
switch(_fe){
case _cb:
_ff=[];
_101.push(_ff);
break;
case _cc:
_ff=new CFMutableDictionary();
_101.push(_ff);
break;
case _cd:
_ff=parseFloat(_fc.getString());
break;
case _ce:
_ff=parseInt(_fc.getString(),10);
break;
case _cf:
_ff=_fc.getString();
break;
case _d0:
_ff=YES;
break;
case _d1:
_ff=NO;
break;
default:
throw new Error("*** "+_fe+" marker not recognized in Plist.");
}
if(!_100){
_100=_ff;
}else{
if(_102){
if(_102.slice){
_102.push(_ff);
}else{
_102.setValueForKey(key,_ff);
}
}
}
}
return _100;
};
function _bd(_104){
return _104.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&apos;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
};
function _105(_106){
return _106.replace(/&quot;/g,"\"").replace(/&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&");
};
function _91(_107){
if(window.DOMParser){
return (new window.DOMParser().parseFromString(_107,"text/xml").documentElement);
}else{
if(window.ActiveXObject){
XMLNode=new ActiveXObject("Microsoft.XMLDOM");
var _108=_107.match(CFPropertyList.DTDRE);
if(_108){
_107=_107.substr(_108[0].length);
}
XMLNode.loadXML(_107);
return XMLNode;
}
}
return NULL;
};
CFPropertyList.propertyListFromXML=function(_109){
var _10a=_109;
if(_109.valueOf&&typeof _109.valueOf()==="string"){
_10a=_91(_109);
}
while(((String(_10a.nodeName))===_e5)||((String(_10a.nodeName))===_e4)){
_10a=(_10a.firstChild);
}
if(_10a!==NULL&&((_10a.nodeType)===8||(_10a.nodeType)===3)){
while((_10a=(_10a.nextSibling))&&((_10a.nodeType)===8||(_10a.nodeType)===3)){
}
}
if(((_10a.nodeType)===10)){
while((_10a=(_10a.nextSibling))&&((_10a.nodeType)===8||(_10a.nodeType)===3)){
}
}
if(!((String(_10a.nodeName))===_e6)){
return NULL;
}
var key="",_10b=NULL,_10c=NULL,_10d=_10a,_10e=[],_10f=NULL;
while(_10a=_f0(_10a,_10d,_10e)){
var _110=_10e.length;
if(_110){
_10f=_10e[_110-1];
}
if((String(_10a.nodeName))===_e7){
key=((String((_10a.firstChild).nodeValue)));
while((_10a=(_10a.nextSibling))&&((_10a.nodeType)===8||(_10a.nodeType)===3)){
}
}
switch(String((String(_10a.nodeName)))){
case _e9:
_10b=[];
_10e.push(_10b);
break;
case _e8:
_10b=new CFMutableDictionary();
_10e.push(_10b);
break;
case _ed:
_10b=parseFloat(((String((_10a.firstChild).nodeValue))));
break;
case _ee:
_10b=parseInt(((String((_10a.firstChild).nodeValue))),10);
break;
case _ea:
if((_10a.getAttribute("type")==="base64")){
_10b=(_10a.firstChild)?CFData.decodeBase64ToString(((String((_10a.firstChild).nodeValue)))):"";
}else{
_10b=_105((_10a.firstChild)?((String((_10a.firstChild).nodeValue))):"");
}
break;
case _eb:
_10b=YES;
break;
case _ec:
_10b=NO;
break;
case _ef:
_10b=new CFMutableData();
_10b.bytes=(_10a.firstChild)?CFData.decodeBase64ToArray(((String((_10a.firstChild).nodeValue))),YES):[];
break;
default:
throw new Error("*** "+(String(_10a.nodeName))+" tag not recognized in Plist.");
}
if(!_10c){
_10c=_10b;
}else{
if(_10f){
if(_10f.slice){
_10f.push(_10b);
}else{
_10f.setValueForKey(key,_10b);
}
}
}
}
return _10c;
};
kCFPropertyListOpenStepFormat=CFPropertyList.FormatOpenStep;
kCFPropertyListXMLFormat_v1_0=CFPropertyList.FormatXML_v1_0;
kCFPropertyListBinaryFormat_v1_0=CFPropertyList.FormatBinary_v1_0;
kCFPropertyList280NorthFormat_v1_0=CFPropertyList.Format280North_v1_0;
CFPropertyListCreate=function(){
return new CFPropertyList();
};
CFPropertyListCreateFromXMLData=function(data){
return CFPropertyList.propertyListFromData(data,CFPropertyList.FormatXML_v1_0);
};
CFPropertyListCreateXMLData=function(_111){
return CFPropertyList.dataFromPropertyList(_111,CFPropertyList.FormatXML_v1_0);
};
CFPropertyListCreateFrom280NorthData=function(data){
return CFPropertyList.propertyListFromData(data,CFPropertyList.Format280North_v1_0);
};
CFPropertyListCreate280NorthData=function(_112){
return CFPropertyList.dataFromPropertyList(_112,CFPropertyList.Format280North_v1_0);
};
CPPropertyListCreateFromData=function(data,_113){
return CFPropertyList.propertyListFromData(data,_113);
};
CPPropertyListCreateData=function(_114,_115){
return CFPropertyList.dataFromPropertyList(_114,_115);
};
CFDictionary=function(_116){
this._keys=[];
this._count=0;
this._buckets={};
this._UID=objj_generateObjectUID();
};
var _117=Array.prototype.indexOf,_71=Object.prototype.hasOwnProperty;
CFDictionary.prototype.copy=function(){
return this;
};
CFDictionary.prototype.mutableCopy=function(){
var _118=new CFMutableDictionary(),keys=this._keys,_119=this._count;
_118._keys=keys.slice();
_118._count=_119;
var _11a=0,_11b=this._buckets,_11c=_118._buckets;
for(;_11a<_119;++_11a){
var key=keys[_11a];
_11c[key]=_11b[key];
}
return _118;
};
CFDictionary.prototype.containsKey=function(aKey){
return _71.apply(this._buckets,[aKey]);
};
CFDictionary.prototype.containsValue=function(_11d){
var keys=this._keys,_11e=this._buckets,_8c=0,_11f=keys.length;
for(;_8c<_11f;++_8c){
if(_11e[keys[_8c]]===_11d){
return YES;
}
}
return NO;
};
CFDictionary.prototype.count=function(){
return this._count;
};
CFDictionary.prototype.countOfKey=function(aKey){
return this.containsKey(aKey)?1:0;
};
CFDictionary.prototype.countOfValue=function(_120){
var keys=this._keys,_121=this._buckets,_8c=0,_122=keys.length,_123=0;
for(;_8c<_122;++_8c){
if(_121[keys[_8c]]===_120){
++_123;
}
}
return _123;
};
CFDictionary.prototype.keys=function(){
return this._keys.slice();
};
CFDictionary.prototype.valueForKey=function(aKey){
var _124=this._buckets;
if(!_71.apply(_124,[aKey])){
return nil;
}
return _124[aKey];
};
CFDictionary.prototype.toString=function(){
var _125="{\n",keys=this._keys,_8c=0,_126=this._count;
for(;_8c<_126;++_8c){
var key=keys[_8c];
_125+="\t"+key+" = \""+String(this.valueForKey(key)).split("\n").join("\n\t")+"\"\n";
}
return _125+"}";
};
CFMutableDictionary=function(_127){
CFDictionary.apply(this,[]);
};
CFMutableDictionary.prototype=new CFDictionary();
CFMutableDictionary.prototype.copy=function(){
return this.mutableCopy();
};
CFMutableDictionary.prototype.addValueForKey=function(aKey,_128){
if(this.containsKey(aKey)){
return;
}
++this._count;
this._keys.push(aKey);
this._buckets[aKey]=_128;
};
CFMutableDictionary.prototype.removeValueForKey=function(aKey){
var _129=-1;
if(_117){
_129=_117.call(this._keys,aKey);
}else{
var keys=this._keys,_8c=0,_12a=keys.length;
for(;_8c<_12a;++_8c){
if(keys[_8c]===aKey){
_129=_8c;
break;
}
}
}
if(_129===-1){
return;
}
--this._count;
this._keys.splice(_129,1);
delete this._buckets[aKey];
};
CFMutableDictionary.prototype.removeAllValues=function(){
this._count=0;
this._keys=[];
this._buckets={};
};
CFMutableDictionary.prototype.replaceValueForKey=function(aKey,_12b){
if(!this.containsKey(aKey)){
return;
}
this._buckets[aKey]=_12b;
};
CFMutableDictionary.prototype.setValueForKey=function(aKey,_12c){
if(_12c===nil||_12c===_44){
this.removeValueForKey(aKey);
}else{
if(this.containsKey(aKey)){
this.replaceValueForKey(aKey,_12c);
}else{
this.addValueForKey(aKey,_12c);
}
}
};
CFData=function(){
this._rawString=NULL;
this._propertyList=NULL;
this._propertyListFormat=NULL;
this._JSONObject=NULL;
this._bytes=NULL;
this._base64=NULL;
};
CFData.prototype.propertyList=function(){
if(!this._propertyList){
this._propertyList=CFPropertyList.propertyListFromString(this.rawString());
}
return this._propertyList;
};
CFData.prototype.JSONObject=function(){
if(!this._JSONObject){
try{
this._JSONObject=JSON.parse(this.rawString());
}
catch(anException){
}
}
return this._JSONObject;
};
CFData.prototype.rawString=function(){
if(this._rawString===NULL){
if(this._propertyList){
this._rawString=CFPropertyList.stringFromPropertyList(this._propertyList,this._propertyListFormat);
}else{
if(this._JSONObject){
this._rawString=JSON.stringify(this._JSONObject);
}else{
throw new Error("Can't convert data to string.");
}
}
}
return this._rawString;
};
CFData.prototype.bytes=function(){
return this._bytes;
};
CFData.prototype.base64=function(){
return this._base64;
};
CFMutableData=function(){
CFData.call(this);
};
CFMutableData.prototype=new CFData();
function _12d(_12e){
this._rawString=NULL;
this._propertyList=NULL;
this._propertyListFormat=NULL;
this._JSONObject=NULL;
this._bytes=NULL;
this._base64=NULL;
};
CFMutableData.prototype.setPropertyList=function(_12f,_130){
_12d(this);
this._propertyList=_12f;
this._propertyListFormat=_130;
};
CFMutableData.prototype.setJSONObject=function(_131){
_12d(this);
this._JSONObject=_131;
};
CFMutableData.prototype.setRawString=function(_132){
_12d(this);
this._rawString=_132;
};
CFMutableData.prototype.setBytes=function(_133){
_12d(this);
this._bytes=_133;
};
CFMutableData.prototype.setBase64String=function(_134){
_12d(this);
this._base64=_134;
};
var _135=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/","="],_136=[];
for(var i=0;i<_135.length;i++){
_136[_135[i].charCodeAt(0)]=i;
}
CFData.decodeBase64ToArray=function(_137,_138){
if(_138){
_137=_137.replace(/[^A-Za-z0-9\+\/\=]/g,"");
}
var pad=(_137[_137.length-1]=="="?1:0)+(_137[_137.length-2]=="="?1:0),_139=_137.length,_13a=[];
var i=0;
while(i<_139){
var bits=(_136[_137.charCodeAt(i++)]<<18)|(_136[_137.charCodeAt(i++)]<<12)|(_136[_137.charCodeAt(i++)]<<6)|(_136[_137.charCodeAt(i++)]);
_13a.push((bits&16711680)>>16);
_13a.push((bits&65280)>>8);
_13a.push(bits&255);
}
if(pad>0){
return _13a.slice(0,-1*pad);
}
return _13a;
};
CFData.encodeBase64Array=function(_13b){
var pad=(3-(_13b.length%3))%3,_13c=_13b.length+pad,_13d=[];
if(pad>0){
_13b.push(0);
}
if(pad>1){
_13b.push(0);
}
var i=0;
while(i<_13c){
var bits=(_13b[i++]<<16)|(_13b[i++]<<8)|(_13b[i++]);
_13d.push(_135[(bits&16515072)>>18]);
_13d.push(_135[(bits&258048)>>12]);
_13d.push(_135[(bits&4032)>>6]);
_13d.push(_135[bits&63]);
}
if(pad>0){
_13d[_13d.length-1]="=";
_13b.pop();
}
if(pad>1){
_13d[_13d.length-2]="=";
_13b.pop();
}
return _13d.join("");
};
CFData.decodeBase64ToString=function(_13e,_13f){
return CFData.bytesToString(CFData.decodeBase64ToArray(_13e,_13f));
};
CFData.decodeBase64ToUtf16String=function(_140,_141){
return CFData.bytesToUtf16String(CFData.decodeBase64ToArray(_140,_141));
};
CFData.bytesToString=function(_142){
return String.fromCharCode.apply(NULL,_142);
};
CFData.encodeBase64String=function(_143){
var temp=[];
for(var i=0;i<_143.length;i++){
temp.push(_143.charCodeAt(i));
}
return CFData.encodeBase64Array(temp);
};
CFData.bytesToUtf16String=function(_144){
var temp=[];
for(var i=0;i<_144.length;i+=2){
temp.push(_144[i+1]<<8|_144[i]);
}
return String.fromCharCode.apply(NULL,temp);
};
CFData.encodeBase64Utf16String=function(_145){
var temp=[];
for(var i=0;i<_145.length;i++){
var c=_145.charCodeAt(i);
temp.push(_145.charCodeAt(i)&255);
temp.push((_145.charCodeAt(i)&65280)>>8);
}
return CFData.encodeBase64Array(temp);
};
var _146,_147,_148=0;
function _149(){
if(++_148!==1){
return;
}
_146={};
_147={};
};
function _14a(){
_148=MAX(_148-1,0);
if(_148!==0){
return;
}
delete _146;
delete _147;
};
var _14b=new RegExp("^"+"(?:"+"([^:/?#]+):"+")?"+"(?:"+"(//)"+"("+"(?:"+"("+"([^:@]*)"+":?"+"([^:@]*)"+")?"+"@"+")?"+"([^:/?#]*)"+"(?::(\\d*))?"+")"+")?"+"([^?#]*)"+"(?:\\?([^#]*))?"+"(?:#(.*))?");
var _14c=["url","scheme","authorityRoot","authority","userInfo","user","password","domain","portNumber","path","queryString","fragment"];
function _14d(aURL){
if(aURL._parts){
return aURL._parts;
}
var _14e=aURL.string(),_14f=_14e.match(/^mhtml:/);
if(_14f){
_14e=_14e.substr("mhtml:".length);
}
if(_148>0&&_71.call(_147,_14e)){
aURL._parts=_147[_14e];
return aURL._parts;
}
aURL._parts={};
var _150=aURL._parts,_151=_14b.exec(_14e),_8c=_151.length;
while(_8c--){
_150[_14c[_8c]]=_151[_8c]||NULL;
}
_150.portNumber=parseInt(_150.portNumber,10);
if(isNaN(_150.portNumber)){
_150.portNumber=-1;
}
_150.pathComponents=[];
if(_150.path){
var _152=_150.path.split("/"),_153=_150.pathComponents,_8c=0,_154=_152.length;
for(;_8c<_154;++_8c){
var _155=_152[_8c];
if(_155){
_153.push(_155);
}else{
if(_8c===0){
_153.push("/");
}
}
}
_150.pathComponents=_153;
}
if(_14f){
_150.url="mhtml:"+_150.url;
_150.scheme="mhtml:"+_150.scheme;
}
if(_148>0){
_147[_14e]=_150;
}
return _150;
};
CFURL=function(aURL,_156){
aURL=aURL||"";
if(aURL instanceof CFURL){
if(!_156){
return aURL;
}
var _157=aURL.baseURL();
if(_157){
_156=new CFURL(_157.absoluteURL(),_156);
}
aURL=aURL.string();
}
if(_148>0){
var _158=aURL+" "+(_156&&_156.UID()||"");
if(_71.call(_146,_158)){
return _146[_158];
}
_146[_158]=this;
}
if(aURL.match(/^data:/)){
var _159={},_8c=_14c.length;
while(_8c--){
_159[_14c[_8c]]="";
}
_159.url=aURL;
_159.scheme="data";
_159.pathComponents=[];
this._parts=_159;
this._standardizedURL=this;
this._absoluteURL=this;
}
this._UID=objj_generateObjectUID();
this._string=aURL;
this._baseURL=_156;
};
CFURL.prototype.UID=function(){
return this._UID;
};
var _15a={};
CFURL.prototype.mappedURL=function(){
return _15a[this.absoluteString()]||this;
};
CFURL.setMappedURLForURL=function(_15b,_15c){
_15a[_15b.absoluteString()]=_15c;
};
CFURL.prototype.schemeAndAuthority=function(){
var _15d="",_15e=this.scheme();
if(_15e){
_15d+=_15e+":";
}
var _15f=this.authority();
if(_15f){
_15d+="//"+_15f;
}
return _15d;
};
CFURL.prototype.absoluteString=function(){
if(this._absoluteString===_44){
this._absoluteString=this.absoluteURL().string();
}
return this._absoluteString;
};
CFURL.prototype.toString=function(){
return this.absoluteString();
};
function _160(aURL){
aURL=aURL.standardizedURL();
var _161=aURL.baseURL();
if(!_161){
return aURL;
}
var _162=((aURL)._parts||_14d(aURL)),_163,_164=_161.absoluteURL(),_165=((_164)._parts||_14d(_164));
if(_162.scheme||_162.authority){
_163=_162;
}else{
_163={};
_163.scheme=_165.scheme;
_163.authority=_165.authority;
_163.userInfo=_165.userInfo;
_163.user=_165.user;
_163.password=_165.password;
_163.domain=_165.domain;
_163.portNumber=_165.portNumber;
_163.queryString=_162.queryString;
_163.fragment=_162.fragment;
var _166=_162.pathComponents;
if(_166.length&&_166[0]==="/"){
_163.path=_162.path;
_163.pathComponents=_166;
}else{
var _167=_165.pathComponents,_168=_167.concat(_166);
if(!_161.hasDirectoryPath()&&_167.length){
_168.splice(_167.length-1,1);
}
if(_166.length&&(_166[0]===".."||_166[0]===".")){
_169(_168,YES);
}
_163.pathComponents=_168;
_163.path=_16a(_168,_166.length<=0||aURL.hasDirectoryPath());
}
}
var _16b=_16c(_163),_16d=new CFURL(_16b);
_16d._parts=_163;
_16d._standardizedURL=_16d;
_16d._standardizedString=_16b;
_16d._absoluteURL=_16d;
_16d._absoluteString=_16b;
return _16d;
};
function _16a(_16e,_16f){
var path=_16e.join("/");
if(path.length&&path.charAt(0)==="/"){
path=path.substr(1);
}
if(_16f){
path+="/";
}
return path;
};
function _169(_170,_171){
var _172=0,_173=0,_174=_170.length,_175=_171?_170:[],_176=NO;
for(;_172<_174;++_172){
var _177=_170[_172];
if(_177===""){
continue;
}
if(_177==="."){
_176=_173===0;
continue;
}
if(_177!==".."||_173===0||_175[_173-1]===".."){
_175[_173]=_177;
_173++;
continue;
}
if(_173>0&&_175[_173-1]!=="/"){
--_173;
}
}
if(_176&&_173===0){
_175[_173++]=".";
}
_175.length=_173;
return _175;
};
function _16c(_178){
var _179="",_17a=_178.scheme;
if(_17a){
_179+=_17a+":";
}
var _17b=_178.authority;
if(_17b){
_179+="//"+_17b;
}
_179+=_178.path;
var _17c=_178.queryString;
if(_17c){
_179+="?"+_17c;
}
var _17d=_178.fragment;
if(_17d){
_179+="#"+_17d;
}
return _179;
};
CFURL.prototype.absoluteURL=function(){
if(this._absoluteURL===_44){
this._absoluteURL=_160(this);
}
return this._absoluteURL;
};
CFURL.prototype.standardizedURL=function(){
if(this._standardizedURL===_44){
var _17e=((this)._parts||_14d(this)),_17f=_17e.pathComponents,_180=_169(_17f,NO);
var _181=_16a(_180,this.hasDirectoryPath());
if(_17e.path===_181){
this._standardizedURL=this;
}else{
var _182=_183(_17e);
_182.pathComponents=_180;
_182.path=_181;
var _184=new CFURL(_16c(_182),this.baseURL());
_184._parts=_182;
_184._standardizedURL=_184;
this._standardizedURL=_184;
}
}
return this._standardizedURL;
};
function _183(_185){
var _186={},_187=_14c.length;
while(_187--){
var _188=_14c[_187];
_186[_188]=_185[_188];
}
return _186;
};
CFURL.prototype.string=function(){
return this._string;
};
CFURL.prototype.authority=function(){
var _189=((this)._parts||_14d(this)).authority;
if(_189){
return _189;
}
var _18a=this.baseURL();
return _18a&&_18a.authority()||"";
};
CFURL.prototype.hasDirectoryPath=function(){
var _18b=this._hasDirectoryPath;
if(_18b===_44){
var path=this.path();
if(!path){
return NO;
}
if(path.charAt(path.length-1)==="/"){
return YES;
}
var _18c=this.lastPathComponent();
_18b=_18c==="."||_18c==="..";
this._hasDirectoryPath=_18b;
}
return _18b;
};
CFURL.prototype.hostName=function(){
return this.authority();
};
CFURL.prototype.fragment=function(){
return ((this)._parts||_14d(this)).fragment;
};
CFURL.prototype.lastPathComponent=function(){
if(this._lastPathComponent===_44){
var _18d=this.pathComponents(),_18e=_18d.length;
if(!_18e){
this._lastPathComponent="";
}else{
this._lastPathComponent=_18d[_18e-1];
}
}
return this._lastPathComponent;
};
CFURL.prototype.path=function(){
return ((this)._parts||_14d(this)).path;
};
CFURL.prototype.pathComponents=function(){
return ((this)._parts||_14d(this)).pathComponents;
};
CFURL.prototype.pathExtension=function(){
var _18f=this.lastPathComponent();
if(!_18f){
return NULL;
}
_18f=_18f.replace(/^\.*/,"");
var _190=_18f.lastIndexOf(".");
return _190<=0?"":_18f.substring(_190+1);
};
CFURL.prototype.queryString=function(){
return ((this)._parts||_14d(this)).queryString;
};
CFURL.prototype.scheme=function(){
var _191=this._scheme;
if(_191===_44){
_191=((this)._parts||_14d(this)).scheme;
if(!_191){
var _192=this.baseURL();
_191=_192&&_192.scheme();
}
this._scheme=_191;
}
return _191;
};
CFURL.prototype.user=function(){
return ((this)._parts||_14d(this)).user;
};
CFURL.prototype.password=function(){
return ((this)._parts||_14d(this)).password;
};
CFURL.prototype.portNumber=function(){
return ((this)._parts||_14d(this)).portNumber;
};
CFURL.prototype.domain=function(){
return ((this)._parts||_14d(this)).domain;
};
CFURL.prototype.baseURL=function(){
return this._baseURL;
};
CFURL.prototype.asDirectoryPathURL=function(){
if(this.hasDirectoryPath()){
return this;
}
var _193=this.lastPathComponent();
if(_193!=="/"){
_193="./"+_193;
}
return new CFURL(_193+"/",this);
};
function _194(aURL){
if(!aURL._resourcePropertiesForKeys){
aURL._resourcePropertiesForKeys=new CFMutableDictionary();
}
return aURL._resourcePropertiesForKeys;
};
CFURL.prototype.resourcePropertyForKey=function(aKey){
return _194(this).valueForKey(aKey);
};
CFURL.prototype.setResourcePropertyForKey=function(aKey,_195){
_194(this).setValueForKey(aKey,_195);
};
CFURL.prototype.staticResourceData=function(){
var data=new CFMutableData();
data.setRawString(_196.resourceAtURL(this).contents());
return data;
};
function _fd(_197){
this._string=_197;
var _198=_197.indexOf(";");
this._magicNumber=_197.substr(0,_198);
this._location=_197.indexOf(";",++_198);
this._version=_197.substring(_198,this._location++);
};
_fd.prototype.magicNumber=function(){
return this._magicNumber;
};
_fd.prototype.version=function(){
return this._version;
};
_fd.prototype.getMarker=function(){
var _199=this._string,_19a=this._location;
if(_19a>=_199.length){
return null;
}
var next=_199.indexOf(";",_19a);
if(next<0){
return null;
}
var _19b=_199.substring(_19a,next);
if(_19b==="e"){
return null;
}
this._location=next+1;
return _19b;
};
_fd.prototype.getString=function(){
var _19c=this._string,_19d=this._location;
if(_19d>=_19c.length){
return null;
}
var next=_19c.indexOf(";",_19d);
if(next<0){
return null;
}
var size=parseInt(_19c.substring(_19d,next),10),text=_19c.substr(next+1,size);
this._location=next+1+size;
return text;
};
var _19e=0,_19f=1<<0,_1a0=1<<1,_1a1=1<<2,_1a2=1<<3,_1a3=1<<4;
var _1a4={},_1a5={},_1a6=new Date().getTime(),_1a7=0,_1a8=0;
CFBundle=function(aURL){
aURL=_1a9(aURL).asDirectoryPathURL();
var _1aa=aURL.absoluteString(),_1ab=_1a4[_1aa];
if(_1ab){
return _1ab;
}
_1a4[_1aa]=this;
this._bundleURL=aURL;
this._resourcesDirectoryURL=new CFURL("Resources/",aURL);
this._staticResource=NULL;
this._isValid=NO;
this._loadStatus=_19e;
this._loadRequests=[];
this._infoDictionary=new CFDictionary();
this._eventDispatcher=new _6c(this);
};
CFBundle.environments=function(){
return ["Browser","ObjJ"];
};
CFBundle.bundleContainingURL=function(aURL){
aURL=new CFURL(".",_1a9(aURL));
var _1ac,_1ad=aURL.absoluteString();
while(!_1ac||_1ac!==_1ad){
var _1ae=_1a4[_1ad];
if(_1ae&&_1ae._isValid){
return _1ae;
}
aURL=new CFURL("..",aURL);
_1ac=_1ad;
_1ad=aURL.absoluteString();
}
return NULL;
};
CFBundle.mainBundle=function(){
return new CFBundle(_1af);
};
function _1b0(_1b1,_1b2){
if(_1b2){
_1a5[_1b1.name]=_1b2;
}
};
CFBundle.bundleForClass=function(_1b3){
return _1a5[_1b3.name]||CFBundle.mainBundle();
};
CFBundle.prototype.bundleURL=function(){
return this._bundleURL;
};
CFBundle.prototype.resourcesDirectoryURL=function(){
return this._resourcesDirectoryURL;
};
CFBundle.prototype.resourceURL=function(_1b4,_1b5,_1b6){
if(_1b5){
_1b4=_1b4+"."+_1b5;
}
if(_1b6){
_1b4=_1b6+"/"+_1b4;
}
var _1b7=(new CFURL(_1b4,this.resourcesDirectoryURL())).mappedURL();
return _1b7.absoluteURL();
};
CFBundle.prototype.mostEligibleEnvironmentURL=function(){
if(this._mostEligibleEnvironmentURL===_44){
this._mostEligibleEnvironmentURL=new CFURL(this.mostEligibleEnvironment()+".environment/",this.bundleURL());
}
return this._mostEligibleEnvironmentURL;
};
CFBundle.prototype.executableURL=function(){
if(this._executableURL===_44){
var _1b8=this.valueForInfoDictionaryKey("CPBundleExecutable");
if(!_1b8){
this._executableURL=NULL;
}else{
this._executableURL=new CFURL(_1b8,this.mostEligibleEnvironmentURL());
}
}
return this._executableURL;
};
CFBundle.prototype.infoDictionary=function(){
return this._infoDictionary;
};
CFBundle.prototype.valueForInfoDictionaryKey=function(aKey){
return this._infoDictionary.valueForKey(aKey);
};
CFBundle.prototype.hasSpritedImages=function(){
var _1b9=this._infoDictionary.valueForKey("CPBundleEnvironmentsWithImageSprites")||[],_8c=_1b9.length,_1ba=this.mostEligibleEnvironment();
while(_8c--){
if(_1b9[_8c]===_1ba){
return YES;
}
}
return NO;
};
CFBundle.prototype.environments=function(){
return this._infoDictionary.valueForKey("CPBundleEnvironments")||["ObjJ"];
};
CFBundle.prototype.mostEligibleEnvironment=function(_1bb){
_1bb=_1bb||this.environments();
var _1bc=CFBundle.environments(),_8c=0,_1bd=_1bc.length,_1be=_1bb.length;
for(;_8c<_1bd;++_8c){
var _1bf=0,_1c0=_1bc[_8c];
for(;_1bf<_1be;++_1bf){
if(_1c0===_1bb[_1bf]){
return _1c0;
}
}
}
return NULL;
};
CFBundle.prototype.isLoading=function(){
return this._loadStatus&_19f;
};
CFBundle.prototype.isLoaded=function(){
return this._loadStatus&_1a3;
};
CFBundle.prototype.load=function(_1c1){
if(this._loadStatus!==_19e){
return;
}
this._loadStatus=_19f|_1a0;
var self=this,_1c2=this.bundleURL(),_1c3=new CFURL("..",_1c2);
if(_1c3.absoluteString()===_1c2.absoluteString()){
_1c3=_1c3.schemeAndAuthority();
}
_196.resolveResourceAtURL(_1c3,YES,function(_1c4){
var _1c5=_1c2.absoluteURL().lastPathComponent();
self._staticResource=_1c4._children[_1c5]||new _196(_1c2,_1c4,YES,NO);
function _1c6(_1c7){
self._loadStatus&=~_1a0;
var _1c8=_1c7.request.responsePropertyList();
self._isValid=!!_1c8||CFBundle.mainBundle()===self;
if(_1c8){
self._infoDictionary=_1c8;
}
if(!self._infoDictionary){
_1ca(self,new Error("Could not load bundle at \""+path+"\""));
return;
}
if(self===CFBundle.mainBundle()&&self.valueForInfoDictionaryKey("CPApplicationSize")){
_1a8=self.valueForInfoDictionaryKey("CPApplicationSize").valueForKey("executable")||0;
}
_1ce(self,_1c1);
};
function _1c9(){
self._isValid=CFBundle.mainBundle()===self;
self._loadStatus=_19e;
_1ca(self,new Error("Could not load bundle at \""+self.bundleURL()+"\""));
};
new _a8(new CFURL("Info.plist",self.bundleURL()),_1c6,_1c9);
});
};
function _1ca(_1cb,_1cc){
_1cd(_1cb._staticResource);
_1cb._eventDispatcher.dispatchEvent({type:"error",error:_1cc,bundle:_1cb});
};
function _1ce(_1cf,_1d0){
if(!_1cf.mostEligibleEnvironment()){
return _1d1();
}
_1d2(_1cf,_1d3,_1d1);
_1d4(_1cf,_1d3,_1d1);
if(_1cf._loadStatus===_19f){
return _1d3();
}
function _1d1(_1d5){
var _1d6=_1cf._loadRequests,_1d7=_1d6.length;
while(_1d7--){
_1d6[_1d7].abort();
}
this._loadRequests=[];
_1cf._loadStatus=_19e;
_1ca(_1cf,_1d5||new Error("Could not recognize executable code format in Bundle "+_1cf));
};
function _1d3(){
if((typeof CPApp==="undefined"||!CPApp||!CPApp._finishedLaunching)&&typeof OBJJ_PROGRESS_CALLBACK==="function"&&_1a8){
OBJJ_PROGRESS_CALLBACK(MAX(MIN(1,_1a7/_1a8),0),_1a8,_1cf.path());
}
if(_1cf._loadStatus===_19f){
_1cf._loadStatus=_1a3;
}else{
return;
}
_1cd(_1cf._staticResource);
function _1d8(){
_1cf._eventDispatcher.dispatchEvent({type:"load",bundle:_1cf});
};
if(_1d0){
_1d9(_1cf,_1d8);
}else{
_1d8();
}
};
};
function _1d2(_1da,_1db,_1dc){
var _1dd=_1da.executableURL();
if(!_1dd){
return;
}
_1da._loadStatus|=_1a1;
new _a8(_1dd,function(_1de){
try{
_1a7+=_1de.request.responseText().length;
_1df(_1da,_1de.request.responseText(),_1dd);
_1da._loadStatus&=~_1a1;
_1db();
}
catch(anException){
_1dc(anException);
}
},_1dc);
};
function _1e0(_1e1){
return "mhtml:"+new CFURL("MHTMLTest.txt",_1e1.mostEligibleEnvironmentURL());
};
function _1e2(_1e3){
if(_1e4===_1e5){
return new CFURL("dataURLs.txt",_1e3.mostEligibleEnvironmentURL());
}
if(_1e4===_1e6||_1e4===_1e7){
return new CFURL("MHTMLPaths.txt",_1e3.mostEligibleEnvironmentURL());
}
return NULL;
};
function _1d4(_1e8,_1e9,_1ea){
if(!_1e8.hasSpritedImages()){
return;
}
_1e8._loadStatus|=_1a2;
if(!_1eb()){
return _1ec(_1e0(_1e8),function(){
_1d4(_1e8,_1e9,_1ea);
});
}
var _1ed=_1e2(_1e8);
if(!_1ed){
_1e8._loadStatus&=~_1a2;
return _1e9();
}
new _a8(_1ed,function(_1ee){
try{
_1a7+=_1ee.request.responseText().length;
_1df(_1e8,_1ee.request.responseText(),_1ed);
_1e8._loadStatus&=~_1a2;
}
catch(anException){
_1ea(anException);
}
_1e9();
},_1ea);
};
var _1ef=[],_1e4=-1,_1f0=0,_1e5=1,_1e6=2,_1e7=3;
function _1eb(){
return _1e4!==-1;
};
function _1ec(_1f1,_1f2){
if(_1eb()){
return;
}
_1ef.push(_1f2);
if(_1ef.length>1){
return;
}
_1ef.push(function(){
var size=0,_1f3=CFBundle.mainBundle().valueForInfoDictionaryKey("CPApplicationSize");
if(!_1f3){
return;
}
switch(_1e4){
case _1e5:
size=_1f3.valueForKey("data");
break;
case _1e6:
case _1e7:
size=_1f3.valueForKey("mhtml");
break;
}
_1a8+=size;
});
_1f4([_1e5,"data:image/gif;base64,R0lGODlhAQABAIAAAMc9BQAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",_1e6,_1f1+"!test",_1e7,_1f1+"?"+_1a6+"!test"]);
};
function _1f5(){
var _1f6=_1ef.length;
while(_1f6--){
_1ef[_1f6]();
}
};
function _1f4(_1f7){
if(_1f7.length<2){
_1e4=_1f0;
_1f5();
return;
}
var _1f8=new Image();
_1f8.onload=function(){
if(_1f8.width===1&&_1f8.height===1){
_1e4=_1f7[0];
_1f5();
}else{
_1f8.onerror();
}
};
_1f8.onerror=function(){
_1f4(_1f7.slice(2));
};
_1f8.src=_1f7[1];
};
function _1d9(_1f9,_1fa){
var _1fb=[_1f9._staticResource];
function _1fc(_1fd){
for(;_1fd<_1fb.length;++_1fd){
var _1fe=_1fb[_1fd];
if(_1fe.isNotFound()){
continue;
}
if(_1fe.isFile()){
var _1ff=new _317(_1fe.URL());
if(_1ff.hasLoadedFileDependencies()){
_1ff.execute();
}else{
_1ff.loadFileDependencies(function(){
_1fc(_1fd);
});
return;
}
}else{
if(_1fe.URL().absoluteString()===_1f9.resourcesDirectoryURL().absoluteString()){
continue;
}
var _200=_1fe.children();
for(var name in _200){
if(_71.call(_200,name)){
_1fb.push(_200[name]);
}
}
}
}
_1fa();
};
_1fc(0);
};
var _201="@STATIC",_202="p",_203="u",_204="c",_205="t",_206="I",_207="i";
function _1df(_208,_209,_20a){
var _20b=new _fd(_209);
if(_20b.magicNumber()!==_201){
throw new Error("Could not read static file: "+_20a);
}
if(_20b.version()!=="1.0"){
throw new Error("Could not read static file: "+_20a);
}
var _20c,_20d=_208.bundleURL(),file=NULL;
while(_20c=_20b.getMarker()){
var text=_20b.getString();
if(_20c===_202){
var _20e=new CFURL(text,_20d),_20f=_196.resourceAtURL(new CFURL(".",_20e),YES);
file=new _196(_20e,_20f,NO,YES);
}else{
if(_20c===_203){
var URL=new CFURL(text,_20d),_210=_20b.getString();
if(_210.indexOf("mhtml:")===0){
_210="mhtml:"+new CFURL(_210.substr("mhtml:".length),_20d);
if(_1e4===_1e7){
var _211=_210.indexOf("!"),_212=_210.substring(0,_211),_213=_210.substring(_211);
_210=_212+"?"+_1a6+_213;
}
}
CFURL.setMappedURLForURL(URL,new CFURL(_210));
var _20f=_196.resourceAtURL(new CFURL(".",URL),YES);
new _196(URL,_20f,NO,YES);
}else{
if(_20c===_205){
file.write(text);
}
}
}
}
};
CFBundle.prototype.addEventListener=function(_214,_215){
this._eventDispatcher.addEventListener(_214,_215);
};
CFBundle.prototype.removeEventListener=function(_216,_217){
this._eventDispatcher.removeEventListener(_216,_217);
};
CFBundle.prototype.onerror=function(_218){
throw _218.error;
};
CFBundle.prototype.bundlePath=function(){
return this._bundleURL.absoluteURL().path();
};
CFBundle.prototype.path=function(){
CPLog.warn("CFBundle.prototype.path is deprecated, use CFBundle.prototype.bundlePath instead.");
return this.bundlePath.apply(this,arguments);
};
CFBundle.prototype.pathForResource=function(_219){
return this.resourceURL(_219).absoluteString();
};
var _21a={};
function _196(aURL,_21b,_21c,_21d){
this._parent=_21b;
this._eventDispatcher=new _6c(this);
var name=aURL.absoluteURL().lastPathComponent()||aURL.schemeAndAuthority();
this._name=name;
this._URL=aURL;
this._isResolved=!!_21d;
if(_21c){
this._URL=this._URL.asDirectoryPathURL();
}
if(!_21b){
_21a[name]=this;
}
this._isDirectory=!!_21c;
this._isNotFound=NO;
if(_21b){
_21b._children[name]=this;
}
if(_21c){
this._children={};
}else{
this._contents="";
}
};
_196.rootResources=function(){
return _21a;
};
_2.StaticResource=_196;
function _1cd(_21e){
_21e._isResolved=YES;
_21e._eventDispatcher.dispatchEvent({type:"resolve",staticResource:_21e});
};
_196.prototype.resolve=function(){
if(this.isDirectory()){
var _21f=new CFBundle(this.URL());
_21f.onerror=function(){
};
_21f.load(NO);
}else{
var self=this;
function _220(_221){
self._contents=_221.request.responseText();
_1cd(self);
};
function _222(){
self._isNotFound=YES;
_1cd(self);
};
new _a8(this.URL(),_220,_222);
}
};
_196.prototype.name=function(){
return this._name;
};
_196.prototype.URL=function(){
return this._URL;
};
_196.prototype.contents=function(){
return this._contents;
};
_196.prototype.children=function(){
return this._children;
};
_196.prototype.parent=function(){
return this._parent;
};
_196.prototype.isResolved=function(){
return this._isResolved;
};
_196.prototype.write=function(_223){
this._contents+=_223;
};
function _224(_225){
var _226=_225.schemeAndAuthority(),_227=_21a[_226];
if(!_227){
_227=new _196(new CFURL(_226),NULL,YES,YES);
}
return _227;
};
_196.resourceAtURL=function(aURL,_228){
aURL=_1a9(aURL).absoluteURL();
var _229=_224(aURL),_22a=aURL.pathComponents(),_8c=0,_22b=_22a.length;
for(;_8c<_22b;++_8c){
var name=_22a[_8c];
if(_71.call(_229._children,name)){
_229=_229._children[name];
}else{
if(_228){
if(name!=="/"){
name="./"+name;
}
_229=new _196(new CFURL(name,_229.URL()),_229,YES,YES);
}else{
throw new Error("Static Resource at "+aURL+" is not resolved (\""+name+"\")");
}
}
}
return _229;
};
_196.prototype.resourceAtURL=function(aURL,_22c){
return _196.resourceAtURL(new CFURL(aURL,this.URL()),_22c);
};
_196.resolveResourceAtURL=function(aURL,_22d,_22e){
aURL=_1a9(aURL).absoluteURL();
_22f(_224(aURL),_22d,aURL.pathComponents(),0,_22e);
};
_196.prototype.resolveResourceAtURL=function(aURL,_230,_231){
_196.resolveResourceAtURL(new CFURL(aURL,this.URL()).absoluteURL(),_230,_231);
};
function _22f(_232,_233,_234,_235,_236){
var _237=_234.length;
for(;_235<_237;++_235){
var name=_234[_235],_238=_71.call(_232._children,name)&&_232._children[name];
if(!_238){
_238=new _196(new CFURL(name,_232.URL()),_232,_235+1<_237||_233,NO);
_238.resolve();
}
if(!_238.isResolved()){
return _238.addEventListener("resolve",function(){
_22f(_232,_233,_234,_235,_236);
});
}
if(_238.isNotFound()){
return _236(null,new Error("File not found: "+_234.join("/")));
}
if((_235+1<_237)&&_238.isFile()){
return _236(null,new Error("File is not a directory: "+_234.join("/")));
}
_232=_238;
}
_236(_232);
};
function _239(aURL,_23a,_23b){
var _23c=_196.includeURLs(),_23d=new CFURL(aURL,_23c[_23a]).absoluteURL();
_196.resolveResourceAtURL(_23d,NO,function(_23e){
if(!_23e){
if(_23a+1<_23c.length){
_239(aURL,_23a+1,_23b);
}else{
_23b(NULL);
}
return;
}
_23b(_23e);
});
};
_196.resolveResourceAtURLSearchingIncludeURLs=function(aURL,_23f){
_239(aURL,0,_23f);
};
_196.prototype.addEventListener=function(_240,_241){
this._eventDispatcher.addEventListener(_240,_241);
};
_196.prototype.removeEventListener=function(_242,_243){
this._eventDispatcher.removeEventListener(_242,_243);
};
_196.prototype.isNotFound=function(){
return this._isNotFound;
};
_196.prototype.isFile=function(){
return !this._isDirectory;
};
_196.prototype.isDirectory=function(){
return this._isDirectory;
};
_196.prototype.toString=function(_244){
if(this.isNotFound()){
return "<file not found: "+this.name()+">";
}
var _245=this.name();
if(this.isDirectory()){
var _246=this._children;
for(var name in _246){
if(_246.hasOwnProperty(name)){
var _247=_246[name];
if(_244||!_247.isNotFound()){
_245+="\n\t"+_246[name].toString(_244).split("\n").join("\n\t");
}
}
}
}
return _245;
};
var _248=NULL;
_196.includeURLs=function(){
if(_249){
return _249;
}
var _249=[];
if(!_1.OBJJ_INCLUDE_PATHS&&!_1.OBJJ_INCLUDE_URLS){
_249=["Frameworks","Frameworks/Debug"];
}else{
_249=(_1.OBJJ_INCLUDE_PATHS||[]).concat(_1.OBJJ_INCLUDE_URLS||[]);
}
var _24a=_249.length;
while(_24a--){
_249[_24a]=new CFURL(_249[_24a]).asDirectoryPathURL();
}
return _249;
};
var _24b="accessors",_24c="class",_24d="end",_24e="function",_24f="implementation",_250="import",_251="each",_252="outlet",_253="action",_254="new",_255="selector",_256="super",_257="var",_258="in",_259="pragma",_25a="mark",_25b="=",_25c="+",_25d="-",_25e=":",_25f=",",_260=".",_261="*",_262=";",_263="<",_264="{",_265="}",_266=">",_267="[",_268="\"",_269="@",_26a="#",_26b="]",_26c="?",_26d="(",_26e=")",_26f=/^(?:(?:\s+$)|(?:\/(?:\/|\*)))/,_270=/^[+-]?\d+(([.]\d+)*([eE][+-]?\d+))?$/,_271=/^[a-zA-Z_$](\w|$)*$/;
function _272(_273){
this._index=-1;
this._tokens=(_273+"\n").match(/\/\/.*(\r|\n)?|\/\*(?:.|\n|\r)*?\*\/|\w+\b|[+-]?\d+(([.]\d+)*([eE][+-]?\d+))?|"[^"\\]*(\\[\s\S][^"\\]*)*"|'[^'\\]*(\\[\s\S][^'\\]*)*'|\s+|./g);
this._context=[];
return this;
};
_272.prototype.push=function(){
this._context.push(this._index);
};
_272.prototype.pop=function(){
this._index=this._context.pop();
};
_272.prototype.peak=function(_274){
if(_274){
this.push();
var _275=this.skip_whitespace();
this.pop();
return _275;
}
return this._tokens[this._index+1];
};
_272.prototype.next=function(){
return this._tokens[++this._index];
};
_272.prototype.previous=function(){
return this._tokens[--this._index];
};
_272.prototype.last=function(){
if(this._index<0){
return NULL;
}
return this._tokens[this._index-1];
};
_272.prototype.skip_whitespace=function(_276){
var _277;
if(_276){
while((_277=this.previous())&&_26f.test(_277)){
}
}else{
while((_277=this.next())&&_26f.test(_277)){
}
}
return _277;
};
_2.Lexer=_272;
function _278(){
this.atoms=[];
};
_278.prototype.toString=function(){
return this.atoms.join("");
};
_2.preprocess=function(_279,aURL,_27a){
return new _27b(_279,aURL,_27a).executable();
};
_2.eval=function(_27c){
return eval(_2.preprocess(_27c).code());
};
var _27b=function(_27d,aURL,_27e){
this._URL=new CFURL(aURL);
_27d=_27d.replace(/^#[^\n]+\n/,"\n");
this._currentSelector="";
this._currentClass="";
this._currentSuperClass="";
this._currentSuperMetaClass="";
this._buffer=new _278();
this._preprocessed=NULL;
this._dependencies=[];
this._tokens=new _272(_27d);
this._flags=_27e;
this._classMethod=false;
this._executable=NULL;
this._classLookupTable={};
this._classVars={};
var _27f=new objj_class();
for(var i in _27f){
this._classVars[i]=1;
}
this.preprocess(this._tokens,this._buffer);
};
_27b.prototype.setClassInfo=function(_280,_281,_282){
this._classLookupTable[_280]={superClassName:_281,ivars:_282};
};
_27b.prototype.getClassInfo=function(_283){
return this._classLookupTable[_283];
};
_27b.prototype.allIvarNamesForClassName=function(_284){
var _285={},_286=this.getClassInfo(_284);
while(_286){
for(var i in _286.ivars){
_285[i]=1;
}
_286=this.getClassInfo(_286.superClassName);
}
return _285;
};
_2.Preprocessor=_27b;
_27b.Flags={};
_27b.Flags.IncludeDebugSymbols=1<<0;
_27b.Flags.IncludeTypeSignatures=1<<1;
_27b.prototype.executable=function(){
if(!this._executable){
this._executable=new _287(this._buffer.toString(),this._dependencies,this._URL);
}
return this._executable;
};
_27b.prototype.accessors=function(_288){
var _289=_288.skip_whitespace(),_28a={};
if(_289!=_26d){
_288.previous();
return _28a;
}
while((_289=_288.skip_whitespace())!=_26e){
var name=_289,_28b=true;
if(!/^\w+$/.test(name)){
throw new SyntaxError(this.error_message("*** @accessors attribute name not valid."));
}
if((_289=_288.skip_whitespace())==_25b){
_28b=_288.skip_whitespace();
if(!/^\w+$/.test(_28b)){
throw new SyntaxError(this.error_message("*** @accessors attribute value not valid."));
}
if(name=="setter"){
if((_289=_288.next())!=_25e){
throw new SyntaxError(this.error_message("*** @accessors setter attribute requires argument with \":\" at end of selector name."));
}
_28b+=":";
}
_289=_288.skip_whitespace();
}
_28a[name]=_28b;
if(_289==_26e){
break;
}
if(_289!=_25f){
throw new SyntaxError(this.error_message("*** Expected ',' or ')' in @accessors attribute list."));
}
}
return _28a;
};
_27b.prototype.brackets=function(_28c,_28d){
var _28e=[];
while(this.preprocess(_28c,NULL,NULL,NULL,_28e[_28e.length]=[])){
}
if(_28e[0].length===1){
_28d.atoms[_28d.atoms.length]="[";
_28d.atoms[_28d.atoms.length]=_28e[0][0];
_28d.atoms[_28d.atoms.length]="]";
}else{
var _28f=new _278();
if(_28e[0][0].atoms[0]==_256){
_28d.atoms[_28d.atoms.length]="objj_msgSendSuper(";
_28d.atoms[_28d.atoms.length]="{ receiver:self, super_class:"+(this._classMethod?this._currentSuperMetaClass:this._currentSuperClass)+" }";
}else{
_28d.atoms[_28d.atoms.length]="objj_msgSend(";
_28d.atoms[_28d.atoms.length]=_28e[0][0];
}
_28f.atoms[_28f.atoms.length]=_28e[0][1];
var _290=1,_291=_28e.length,_292=new _278();
for(;_290<_291;++_290){
var pair=_28e[_290];
_28f.atoms[_28f.atoms.length]=pair[1];
_292.atoms[_292.atoms.length]=", "+pair[0];
}
_28d.atoms[_28d.atoms.length]=", \"";
_28d.atoms[_28d.atoms.length]=_28f;
_28d.atoms[_28d.atoms.length]="\"";
_28d.atoms[_28d.atoms.length]=_292;
_28d.atoms[_28d.atoms.length]=")";
}
};
_27b.prototype.directive=function(_293,_294,_295){
var _296=_294?_294:new _278(),_297=_293.next();
if(_297.charAt(0)==_268){
_296.atoms[_296.atoms.length]=_297;
}else{
if(_297===_24c){
_293.skip_whitespace();
return;
}else{
if(_297===_24f){
this.implementation(_293,_296);
}else{
if(_297===_250){
this._import(_293);
}else{
if(_297===_255){
this.selector(_293,_296);
}
}
}
}
}
if(!_294){
return _296;
}
};
_27b.prototype.hash=function(_298,_299){
var _29a=_299?_299:new _278(),_29b=_298.next();
if(_29b===_259){
_29b=_298.skip_whitespace();
if(_29b===_25a){
while((_29b=_298.next()).indexOf("\n")<0){
}
}
}else{
throw new SyntaxError(this.error_message("*** Expected \"pragma\" to follow # but instead saw \""+_29b+"\"."));
}
};
_27b.prototype.implementation=function(_29c,_29d){
var _29e=_29d,_29f="",_2a0=NO,_2a1=_29c.skip_whitespace(),_2a2="Nil",_2a3=new _278(),_2a4=new _278();
if(!(/^\w/).test(_2a1)){
throw new Error(this.error_message("*** Expected class name, found \""+_2a1+"\"."));
}
this._currentSuperClass="objj_getClass(\""+_2a1+"\").super_class";
this._currentSuperMetaClass="objj_getMetaClass(\""+_2a1+"\").super_class";
this._currentClass=_2a1;
this._currentSelector="";
if((_29f=_29c.skip_whitespace())==_26d){
_29f=_29c.skip_whitespace();
if(_29f==_26e){
throw new SyntaxError(this.error_message("*** Can't Have Empty Category Name for class \""+_2a1+"\"."));
}
if(_29c.skip_whitespace()!=_26e){
throw new SyntaxError(this.error_message("*** Improper Category Definition for class \""+_2a1+"\"."));
}
_29e.atoms[_29e.atoms.length]="{\nvar the_class = objj_getClass(\""+_2a1+"\")\n";
_29e.atoms[_29e.atoms.length]="if(!the_class) throw new SyntaxError(\"*** Could not find definition for class \\\""+_2a1+"\\\"\");\n";
_29e.atoms[_29e.atoms.length]="var meta_class = the_class.isa;";
}else{
if(_29f==_25e){
_29f=_29c.skip_whitespace();
if(!_271.test(_29f)){
throw new SyntaxError(this.error_message("*** Expected class name, found \""+_29f+"\"."));
}
_2a2=_29f;
_29f=_29c.skip_whitespace();
}
_29e.atoms[_29e.atoms.length]="{var the_class = objj_allocateClassPair("+_2a2+", \""+_2a1+"\"),\nmeta_class = the_class.isa;";
if(_29f==_264){
var _2a5={},_2a6=0,_2a7=[],_2a8,_2a9={};
while((_29f=_29c.skip_whitespace())&&_29f!=_265){
if(_29f===_269){
_29f=_29c.next();
if(_29f===_24b){
_2a8=this.accessors(_29c);
}else{
if(_29f!==_252){
throw new SyntaxError(this.error_message("*** Unexpected '@' token in ivar declaration ('@"+_29f+"')."));
}
}
}else{
if(_29f==_262){
if(_2a6++===0){
_29e.atoms[_29e.atoms.length]="class_addIvars(the_class, [";
}else{
_29e.atoms[_29e.atoms.length]=", ";
}
var name=_2a7[_2a7.length-1];
_29e.atoms[_29e.atoms.length]="new objj_ivar(\""+name+"\")";
_2a5[name]=1;
_2a7=[];
if(_2a8){
_2a9[name]=_2a8;
_2a8=NULL;
}
}else{
_2a7.push(_29f);
}
}
}
if(_2a7.length){
throw new SyntaxError(this.error_message("*** Expected ';' in ivar declaration, found '}'."));
}
if(_2a6){
_29e.atoms[_29e.atoms.length]="]);\n";
}
if(!_29f){
throw new SyntaxError(this.error_message("*** Expected '}'"));
}
this.setClassInfo(_2a1,_2a2==="Nil"?null:_2a2,_2a5);
var _2a5=this.allIvarNamesForClassName(_2a1);
for(ivar_name in _2a9){
var _2aa=_2a9[ivar_name],_2ab=_2aa["property"]||ivar_name;
var _2ac=_2aa["getter"]||_2ab,_2ad="(id)"+_2ac+"\n{\nreturn "+ivar_name+";\n}";
if(_2a3.atoms.length!==0){
_2a3.atoms[_2a3.atoms.length]=",\n";
}
_2a3.atoms[_2a3.atoms.length]=this.method(new _272(_2ad),_2a5);
if(_2aa["readonly"]){
continue;
}
var _2ae=_2aa["setter"];
if(!_2ae){
var _2af=_2ab.charAt(0)=="_"?1:0;
_2ae=(_2af?"_":"")+"set"+_2ab.substr(_2af,1).toUpperCase()+_2ab.substring(_2af+1)+":";
}
var _2b0="(void)"+_2ae+"(id)newValue\n{\n";
if(_2aa["copy"]){
_2b0+="if ("+ivar_name+" !== newValue)\n"+ivar_name+" = [newValue copy];\n}";
}else{
_2b0+=ivar_name+" = newValue;\n}";
}
if(_2a3.atoms.length!==0){
_2a3.atoms[_2a3.atoms.length]=",\n";
}
_2a3.atoms[_2a3.atoms.length]=this.method(new _272(_2b0),_2a5);
}
}else{
_29c.previous();
}
_29e.atoms[_29e.atoms.length]="objj_registerClassPair(the_class);\n";
}
if(!_2a5){
var _2a5=this.allIvarNamesForClassName(_2a1);
}
while((_29f=_29c.skip_whitespace())){
if(_29f==_25c){
this._classMethod=true;
if(_2a4.atoms.length!==0){
_2a4.atoms[_2a4.atoms.length]=", ";
}
_2a4.atoms[_2a4.atoms.length]=this.method(_29c,this._classVars);
}else{
if(_29f==_25d){
this._classMethod=false;
if(_2a3.atoms.length!==0){
_2a3.atoms[_2a3.atoms.length]=", ";
}
_2a3.atoms[_2a3.atoms.length]=this.method(_29c,_2a5);
}else{
if(_29f==_26a){
this.hash(_29c,_29e);
}else{
if(_29f==_269){
if((_29f=_29c.next())==_24d){
break;
}else{
throw new SyntaxError(this.error_message("*** Expected \"@end\", found \"@"+_29f+"\"."));
}
}
}
}
}
}
if(_2a3.atoms.length!==0){
_29e.atoms[_29e.atoms.length]="class_addMethods(the_class, [";
_29e.atoms[_29e.atoms.length]=_2a3;
_29e.atoms[_29e.atoms.length]="]);\n";
}
if(_2a4.atoms.length!==0){
_29e.atoms[_29e.atoms.length]="class_addMethods(meta_class, [";
_29e.atoms[_29e.atoms.length]=_2a4;
_29e.atoms[_29e.atoms.length]="]);\n";
}
_29e.atoms[_29e.atoms.length]="}";
this._currentClass="";
};
_27b.prototype._import=function(_2b1){
var _2b2="",_2b3=_2b1.skip_whitespace(),_2b4=(_2b3!==_263);
if(_2b3===_263){
while((_2b3=_2b1.next())&&_2b3!==_266){
_2b2+=_2b3;
}
if(!_2b3){
throw new SyntaxError(this.error_message("*** Unterminated import statement."));
}
}else{
if(_2b3.charAt(0)===_268){
_2b2=_2b3.substr(1,_2b3.length-2);
}else{
throw new SyntaxError(this.error_message("*** Expecting '<' or '\"', found \""+_2b3+"\"."));
}
}
this._buffer.atoms[this._buffer.atoms.length]="objj_executeFile(\"";
this._buffer.atoms[this._buffer.atoms.length]=_2b2;
this._buffer.atoms[this._buffer.atoms.length]=_2b4?"\", YES);":"\", NO);";
this._dependencies.push(new _2b5(new CFURL(_2b2),_2b4));
};
_27b.prototype.method=function(_2b6,_2b7){
var _2b8=new _278(),_2b9,_2ba="",_2bb=[],_2bc=[null];
_2b7=_2b7||{};
while((_2b9=_2b6.skip_whitespace())&&_2b9!==_264&&_2b9!==_262){
if(_2b9==_25e){
var type="";
_2ba+=_2b9;
_2b9=_2b6.skip_whitespace();
if(_2b9==_26d){
while((_2b9=_2b6.skip_whitespace())&&_2b9!=_26e){
type+=_2b9;
}
_2b9=_2b6.skip_whitespace();
}
_2bc[_2bb.length+1]=type||null;
_2bb[_2bb.length]=_2b9;
if(_2b9 in _2b7){
throw new SyntaxError(this.error_message("*** Method ( "+_2ba+" ) uses a parameter name that is already in use ( "+_2b9+" )"));
}
}else{
if(_2b9==_26d){
var type="";
while((_2b9=_2b6.skip_whitespace())&&_2b9!=_26e){
type+=_2b9;
}
_2bc[0]=type||null;
}else{
if(_2b9==_25f){
if((_2b9=_2b6.skip_whitespace())!=_260||_2b6.next()!=_260||_2b6.next()!=_260){
throw new SyntaxError(this.error_message("*** Argument list expected after ','."));
}
}else{
_2ba+=_2b9;
}
}
}
}
if(_2b9===_262){
_2b9=_2b6.skip_whitespace();
if(_2b9!==_264){
throw new SyntaxError(this.error_message("Invalid semi-colon in method declaration. "+"Semi-colons are allowed only to terminate the method signature, before the open brace."));
}
}
var _2bd=0,_2be=_2bb.length;
_2b8.atoms[_2b8.atoms.length]="new objj_method(sel_getUid(\"";
_2b8.atoms[_2b8.atoms.length]=_2ba;
_2b8.atoms[_2b8.atoms.length]="\"), function";
this._currentSelector=_2ba;
if(this._flags&_27b.Flags.IncludeDebugSymbols){
_2b8.atoms[_2b8.atoms.length]=" $"+this._currentClass+"__"+_2ba.replace(/:/g,"_");
}
_2b8.atoms[_2b8.atoms.length]="(self, _cmd";
for(;_2bd<_2be;++_2bd){
_2b8.atoms[_2b8.atoms.length]=", ";
_2b8.atoms[_2b8.atoms.length]=_2bb[_2bd];
}
_2b8.atoms[_2b8.atoms.length]=")\n{ with(self)\n{";
_2b8.atoms[_2b8.atoms.length]=this.preprocess(_2b6,NULL,_265,_264);
_2b8.atoms[_2b8.atoms.length]="}\n}";
if(this._flags&_27b.Flags.IncludeDebugSymbols){
_2b8.atoms[_2b8.atoms.length]=","+JSON.stringify(_2bc);
}
_2b8.atoms[_2b8.atoms.length]=")";
this._currentSelector="";
return _2b8;
};
_27b.prototype.preprocess=function(_2bf,_2c0,_2c1,_2c2,_2c3){
var _2c4=_2c0?_2c0:new _278(),_2c5=0,_2c6="";
if(_2c3){
_2c3[0]=_2c4;
var _2c7=false,_2c8=[0,0,0];
}
while((_2c6=_2bf.next())&&((_2c6!==_2c1)||_2c5)){
if(_2c3){
if(_2c6===_26c){
++_2c8[2];
}else{
if(_2c6===_264){
++_2c8[0];
}else{
if(_2c6===_265){
--_2c8[0];
}else{
if(_2c6===_26d){
++_2c8[1];
}else{
if(_2c6===_26e){
--_2c8[1];
}else{
if((_2c6===_25e&&_2c8[2]--===0||(_2c7=(_2c6===_26b)))&&_2c8[0]===0&&_2c8[1]===0){
_2bf.push();
var _2c9=_2c7?_2bf.skip_whitespace(true):_2bf.previous(),_2ca=_26f.test(_2c9);
if(_2ca||_271.test(_2c9)&&_26f.test(_2bf.previous())){
_2bf.push();
var last=_2bf.skip_whitespace(true),_2cb=true,_2cc=false;
if(last==="+"||last==="-"){
if(_2bf.previous()!==last){
_2cb=false;
}else{
last=_2bf.skip_whitespace(true);
_2cc=true;
}
}
_2bf.pop();
_2bf.pop();
if(_2cb&&((!_2cc&&(last===_265))||last===_26e||last===_26b||last===_260||_270.test(last)||last.charAt(last.length-1)==="\""||last.charAt(last.length-1)==="'"||_271.test(last)&&!/^(new|return|case|var)$/.test(last))){
if(_2ca){
_2c3[1]=":";
}else{
_2c3[1]=_2c9;
if(!_2c7){
_2c3[1]+=":";
}
var _2c5=_2c4.atoms.length;
while(_2c4.atoms[_2c5--]!==_2c9){
}
_2c4.atoms.length=_2c5;
}
return !_2c7;
}
if(_2c7){
return NO;
}
}
_2bf.pop();
if(_2c7){
return NO;
}
}
}
}
}
}
}
_2c8[2]=MAX(_2c8[2],0);
}
if(_2c2){
if(_2c6===_2c2){
++_2c5;
}else{
if(_2c6===_2c1){
--_2c5;
}
}
}
if(_2c6===_24e){
var _2cd="";
while((_2c6=_2bf.next())&&_2c6!==_26d&&!(/^\w/).test(_2c6)){
_2cd+=_2c6;
}
if(_2c6===_26d){
if(_2c2===_26d){
++_2c5;
}
_2c4.atoms[_2c4.atoms.length]="function"+_2cd+"(";
if(_2c3){
++_2c8[1];
}
}else{
_2c4.atoms[_2c4.atoms.length]=_2c6+"= function";
}
}else{
if(_2c6==_269){
this.directive(_2bf,_2c4);
}else{
if(_2c6==_26a){
this.hash(_2bf,_2c4);
}else{
if(_2c6==_267){
this.brackets(_2bf,_2c4);
}else{
_2c4.atoms[_2c4.atoms.length]=_2c6;
}
}
}
}
}
if(_2c3){
throw new SyntaxError(this.error_message("*** Expected ']' - Unterminated message send or array."));
}
if(!_2c0){
return _2c4;
}
};
_27b.prototype.selector=function(_2ce,_2cf){
var _2d0=_2cf?_2cf:new _278();
_2d0.atoms[_2d0.atoms.length]="sel_getUid(\"";
if(_2ce.skip_whitespace()!=_26d){
throw new SyntaxError(this.error_message("*** Expected '('"));
}
var _2d1=_2ce.skip_whitespace();
if(_2d1==_26e){
throw new SyntaxError(this.error_message("*** Unexpected ')', can't have empty @selector()"));
}
_2cf.atoms[_2cf.atoms.length]=_2d1;
var _2d2,_2d3=true;
while((_2d2=_2ce.next())&&_2d2!=_26e){
if(_2d3&&/^\d+$/.test(_2d2)||!(/^(\w|$|\:)/.test(_2d2))){
if(!(/\S/).test(_2d2)){
if(_2ce.skip_whitespace()==_26e){
break;
}else{
throw new SyntaxError(this.error_message("*** Unexpected whitespace in @selector()."));
}
}else{
throw new SyntaxError(this.error_message("*** Illegal character '"+_2d2+"' in @selector()."));
}
}
_2d0.atoms[_2d0.atoms.length]=_2d2;
_2d3=(_2d2==_25e);
}
_2d0.atoms[_2d0.atoms.length]="\")";
if(!_2cf){
return _2d0;
}
};
_27b.prototype.error_message=function(_2d4){
return _2d4+" <Context File: "+this._URL+(this._currentClass?" Class: "+this._currentClass:"")+(this._currentSelector?" Method: "+this._currentSelector:"")+">";
};
function _2b5(aURL,_2d5){
this._URL=aURL;
this._isLocal=_2d5;
};
_2.FileDependency=_2b5;
_2b5.prototype.URL=function(){
return this._URL;
};
_2b5.prototype.isLocal=function(){
return this._isLocal;
};
_2b5.prototype.toMarkedString=function(){
var _2d6=this.URL().absoluteString();
return (this.isLocal()?_207:_206)+";"+_2d6.length+";"+_2d6;
};
_2b5.prototype.toString=function(){
return (this.isLocal()?"LOCAL: ":"STD: ")+this.URL();
};
var _2d7=0,_2d8=1,_2d9=2,_2da=0;
function _287(_2db,_2dc,aURL,_2dd){
if(arguments.length===0){
return this;
}
this._code=_2db;
this._function=_2dd||NULL;
this._URL=_1a9(aURL||new CFURL("(Anonymous"+(_2da++)+")"));
this._fileDependencies=_2dc;
if(_2dc.length){
this._fileDependencyStatus=_2d7;
this._fileDependencyCallbacks=[];
}else{
this._fileDependencyStatus=_2d9;
}
if(this._function){
return;
}
this.setCode(_2db);
};
_2.Executable=_287;
_287.prototype.path=function(){
return this.URL().path();
};
_287.prototype.URL=function(){
return this._URL;
};
_287.prototype.functionParameters=function(){
var _2de=["global","objj_executeFile","objj_importFile"];
return _2de;
};
_287.prototype.functionArguments=function(){
var _2df=[_1,this.fileExecuter(),this.fileImporter()];
return _2df;
};
_287.prototype.execute=function(){
var _2e0=_2e1;
_2e1=CFBundle.bundleContainingURL(this.URL());
var _2e2=this._function.apply(_1,this.functionArguments());
_2e1=_2e0;
return _2e2;
};
_287.prototype.code=function(){
return this._code;
};
_287.prototype.setCode=function(code){
this._code=code;
var _2e3=this.functionParameters().join(",");
this._function=new Function(_2e3,code);
};
_287.prototype.fileDependencies=function(){
return this._fileDependencies;
};
_287.prototype.hasLoadedFileDependencies=function(){
return this._fileDependencyStatus===_2d9;
};
var _2e4=0,_2e5=[],_2e6={};
_287.prototype.loadFileDependencies=function(_2e7){
var _2e8=this._fileDependencyStatus;
if(_2e7){
if(_2e8===_2d9){
return _2e7();
}
this._fileDependencyCallbacks.push(_2e7);
}
if(_2e8===_2d7){
if(_2e4){
throw "Can't load";
}
_2e9(this);
}
};
function _2e9(_2ea){
_2e5.push(_2ea);
_2ea._fileDependencyStatus=_2d8;
var _2eb=_2ea.fileDependencies(),_8c=0,_2ec=_2eb.length,_2ed=_2ea.referenceURL(),_2ee=_2ed.absoluteString(),_2ef=_2ea.fileExecutableSearcher();
_2e4+=_2ec;
for(;_8c<_2ec;++_8c){
var _2f0=_2eb[_8c],_2f1=_2f0.isLocal(),URL=_2f0.URL(),_2f2=(_2f1&&(_2ee+" ")||"")+URL;
if(_2e6[_2f2]){
if(--_2e4===0){
_2f3();
}
continue;
}
_2e6[_2f2]=YES;
_2ef(URL,_2f1,_2f4);
}
};
function _2f4(_2f5){
--_2e4;
if(_2f5._fileDependencyStatus===_2d7){
_2e9(_2f5);
}else{
if(_2e4===0){
_2f3();
}
}
};
function _2f3(){
var _2f6=_2e5,_8c=0,_2f7=_2f6.length;
_2e5=[];
for(;_8c<_2f7;++_8c){
_2f6[_8c]._fileDependencyStatus=_2d9;
}
for(_8c=0;_8c<_2f7;++_8c){
var _2f8=_2f6[_8c],_2f9=_2f8._fileDependencyCallbacks,_2fa=0,_2fb=_2f9.length;
for(;_2fa<_2fb;++_2fa){
_2f9[_2fa]();
}
_2f8._fileDependencyCallbacks=[];
}
};
_287.prototype.referenceURL=function(){
if(this._referenceURL===_44){
this._referenceURL=new CFURL(".",this.URL());
}
return this._referenceURL;
};
_287.prototype.fileImporter=function(){
return _287.fileImporterForURL(this.referenceURL());
};
_287.prototype.fileExecuter=function(){
return _287.fileExecuterForURL(this.referenceURL());
};
_287.prototype.fileExecutableSearcher=function(){
return _287.fileExecutableSearcherForURL(this.referenceURL());
};
var _2fc={};
_287.fileExecuterForURL=function(aURL){
var _2fd=_1a9(aURL),_2fe=_2fd.absoluteString(),_2ff=_2fc[_2fe];
if(!_2ff){
_2ff=function(aURL,_300,_301){
_287.fileExecutableSearcherForURL(_2fd)(aURL,_300,function(_302){
if(!_302.hasLoadedFileDependencies()){
throw "No executable loaded for file at URL "+aURL;
}
_302.execute(_301);
});
};
_2fc[_2fe]=_2ff;
}
return _2ff;
};
var _303={};
_287.fileImporterForURL=function(aURL){
var _304=_1a9(aURL),_305=_304.absoluteString(),_306=_303[_305];
if(!_306){
_306=function(aURL,_307,_308){
_149();
_287.fileExecutableSearcherForURL(_304)(aURL,_307,function(_309){
_309.loadFileDependencies(function(){
_309.execute();
_14a();
if(_308){
_308();
}
});
});
};
_303[_305]=_306;
}
return _306;
};
var _30a={},_30b={};
_287.fileExecutableSearcherForURL=function(_30c){
var _30d=_30c.absoluteString(),_30e=_30a[_30d],_30f={};
if(!_30e){
_30e=function(aURL,_310,_311){
var _312=(_310&&_30c||"")+aURL,_313=_30b[_312];
if(_313){
return _314(_313);
}
var _315=(aURL instanceof CFURL)&&aURL.scheme();
if(_310||_315){
if(!_315){
aURL=new CFURL(aURL,_30c);
}
_196.resolveResourceAtURL(aURL,NO,_314);
}else{
_196.resolveResourceAtURLSearchingIncludeURLs(aURL,_314);
}
function _314(_316){
if(!_316){
throw new Error("Could not load file at "+aURL);
}
_30b[_312]=_316;
_311(new _317(_316.URL()));
};
};
_30a[_30d]=_30e;
}
return _30e;
};
var _318={};
function _317(aURL){
aURL=_1a9(aURL);
var _319=aURL.absoluteString(),_31a=_318[_319];
if(_31a){
return _31a;
}
_318[_319]=this;
var _31b=_196.resourceAtURL(aURL).contents(),_31c=NULL,_31d=aURL.pathExtension();
if(_31b.match(/^@STATIC;/)){
_31c=_31e(_31b,aURL);
}else{
if(_31d==="j"||!_31d){
_31c=_2.preprocess(_31b,aURL,_27b.Flags.IncludeDebugSymbols);
}else{
_31c=new _287(_31b,[],aURL);
}
}
_287.apply(this,[_31c.code(),_31c.fileDependencies(),aURL,_31c._function]);
this._hasExecuted=NO;
};
_2.FileExecutable=_317;
_317.prototype=new _287();
_317.prototype.execute=function(_31f){
if(this._hasExecuted&&!_31f){
return;
}
this._hasExecuted=YES;
_287.prototype.execute.call(this);
};
_317.prototype.hasExecuted=function(){
return this._hasExecuted;
};
function _31e(_320,aURL){
var _321=new _fd(_320);
var _322=NULL,code="",_323=[];
while(_322=_321.getMarker()){
var text=_321.getString();
if(_322===_205){
code+=text;
}else{
if(_322===_206){
_323.push(new _2b5(new CFURL(text),NO));
}else{
if(_322===_207){
_323.push(new _2b5(new CFURL(text),YES));
}
}
}
}
var fn=_317._lookupCachedFunction(aURL);
if(fn){
return new _287(code,_323,aURL,fn);
}
return new _287(code,_323,aURL);
};
var _324={};
_317._cacheFunction=function(aURL,fn){
aURL=typeof aURL==="string"?aURL:aURL.absoluteString();
_324[aURL]=fn;
};
_317._lookupCachedFunction=function(aURL){
aURL=typeof aURL==="string"?aURL:aURL.absoluteString();
return _324[aURL];
};
var _325=1,_326=2,_327=4,_328=8;
objj_ivar=function(_329,_32a){
this.name=_329;
this.type=_32a;
};
objj_method=function(_32b,_32c,_32d){
this.name=_32b;
this.method_imp=_32c;
this.types=_32d;
};
objj_class=function(_32e){
this.isa=NULL;
this.super_class=NULL;
this.sub_classes=[];
this.name=NULL;
this.info=0;
this.ivars=[];
this.method_list=[];
this.method_hash={};
this.method_store=function(){
};
this.method_dtable=this.method_store.prototype;
this.allocator=function(){
};
this._UID=-1;
};
objj_object=function(){
this.isa=NULL;
this._UID=-1;
};
class_getName=function(_32f){
if(_32f==Nil){
return "";
}
return _32f.name;
};
class_isMetaClass=function(_330){
if(!_330){
return NO;
}
return ((_330.info&(_326)));
};
class_getSuperclass=function(_331){
if(_331==Nil){
return Nil;
}
return _331.super_class;
};
class_setSuperclass=function(_332,_333){
_332.super_class=_333;
_332.isa.super_class=_333.isa;
};
class_addIvar=function(_334,_335,_336){
var _337=_334.allocator.prototype;
if(typeof _337[_335]!="undefined"){
return NO;
}
_334.ivars.push(new objj_ivar(_335,_336));
_337[_335]=NULL;
return YES;
};
class_addIvars=function(_338,_339){
var _33a=0,_33b=_339.length,_33c=_338.allocator.prototype;
for(;_33a<_33b;++_33a){
var ivar=_339[_33a],name=ivar.name;
if(typeof _33c[name]==="undefined"){
_338.ivars.push(ivar);
_33c[name]=NULL;
}
}
};
class_copyIvarList=function(_33d){
return _33d.ivars.slice(0);
};
class_addMethod=function(_33e,_33f,_340,_341){
if(_33e.method_hash[_33f]){
return NO;
}
var _342=new objj_method(_33f,_340,_341);
_33e.method_list.push(_342);
_33e.method_dtable[_33f]=_342;
if(!((_33e.info&(_326)))&&(((_33e.info&(_326)))?_33e:_33e.isa).isa===(((_33e.info&(_326)))?_33e:_33e.isa)){
class_addMethod((((_33e.info&(_326)))?_33e:_33e.isa),_33f,_340,_341);
}
return YES;
};
class_addMethods=function(_343,_344){
var _345=0,_346=_344.length,_347=_343.method_list,_348=_343.method_dtable;
for(;_345<_346;++_345){
var _349=_344[_345];
if(_343.method_hash[_349.name]){
continue;
}
_347.push(_349);
_348[_349.name]=_349;
}
if(!((_343.info&(_326)))&&(((_343.info&(_326)))?_343:_343.isa).isa===(((_343.info&(_326)))?_343:_343.isa)){
class_addMethods((((_343.info&(_326)))?_343:_343.isa),_344);
}
};
class_getInstanceMethod=function(_34a,_34b){
if(!_34a||!_34b){
return NULL;
}
var _34c=_34a.method_dtable[_34b];
return _34c?_34c:NULL;
};
class_getClassMethod=function(_34d,_34e){
if(!_34d||!_34e){
return NULL;
}
var _34f=(((_34d.info&(_326)))?_34d:_34d.isa).method_dtable[_34e];
return _34f?_34f:NULL;
};
class_copyMethodList=function(_350){
return _350.method_list.slice(0);
};
class_replaceMethod=function(_351,_352,_353){
if(!_351||!_352){
return NULL;
}
var _354=_351.method_dtable[_352],_355=NULL;
if(_354){
_355=_354.method_imp;
}
_354.method_imp=_353;
return _355;
};
var _356=function(_357){
var meta=(((_357.info&(_326)))?_357:_357.isa);
if((_357.info&(_326))){
_357=objj_getClass(_357.name);
}
if(_357.super_class&&!((((_357.super_class.info&(_326)))?_357.super_class:_357.super_class.isa).info&(_327))){
_356(_357.super_class);
}
if(!(meta.info&(_327))&&!(meta.info&(_328))){
meta.info=(meta.info|(_328))&~(0);
objj_msgSend(_357,"initialize");
meta.info=(meta.info|(_327))&~(_328);
}
};
var _358=new objj_method("forward",function(self,_359){
return objj_msgSend(self,"forward::",_359,arguments);
});
class_getMethodImplementation=function(_35a,_35b){
if(!((((_35a.info&(_326)))?_35a:_35a.isa).info&(_327))){
_356(_35a);
}
var _35c=_35a.method_dtable[_35b];
if(!_35c){
_35c=_358;
}
var _35d=_35c.method_imp;
return _35d;
};
var _35e={};
objj_allocateClassPair=function(_35f,_360){
var _361=new objj_class(_360),_362=new objj_class(_360),_363=_361;
if(_35f){
_363=_35f;
while(_363.superclass){
_363=_363.superclass;
}
_361.allocator.prototype=new _35f.allocator;
_361.method_store.prototype=new _35f.method_store;
_361.method_dtable=_361.method_store.prototype;
_362.method_store.prototype=new _35f.isa.method_store;
_362.method_dtable=_362.method_store.prototype;
_361.super_class=_35f;
_362.super_class=_35f.isa;
}else{
_361.allocator.prototype=new objj_object();
}
_361.isa=_362;
_361.name=_360;
_361.info=_325;
_361._UID=objj_generateObjectUID();
_362.isa=_363.isa;
_362.name=_360;
_362.info=_326;
_362._UID=objj_generateObjectUID();
return _361;
};
var _2e1=nil;
objj_registerClassPair=function(_364){
_1[_364.name]=_364;
_35e[_364.name]=_364;
_1b0(_364,_2e1);
};
class_createInstance=function(_365){
if(!_365){
throw new Error("*** Attempting to create object with Nil class.");
}
var _366=new _365.allocator();
_366.isa=_365;
_366._UID=objj_generateObjectUID();
return _366;
};
var _367=function(){
};
_367.prototype.member=false;
with(new _367()){
member=true;
}
if(new _367().member){
var _368=class_createInstance;
class_createInstance=function(_369){
var _36a=_368(_369);
if(_36a){
var _36b=_36a.isa,_36c=_36b;
while(_36b){
var _36d=_36b.ivars;
count=_36d.length;
while(count--){
_36a[_36d[count].name]=NULL;
}
_36b=_36b.super_class;
}
_36a.isa=_36c;
}
return _36a;
};
}
object_getClassName=function(_36e){
if(!_36e){
return "";
}
var _36f=_36e.isa;
return _36f?class_getName(_36f):"";
};
objj_lookUpClass=function(_370){
var _371=_35e[_370];
return _371?_371:Nil;
};
objj_getClass=function(_372){
var _373=_35e[_372];
if(!_373){
}
return _373?_373:Nil;
};
objj_getMetaClass=function(_374){
var _375=objj_getClass(_374);
return (((_375.info&(_326)))?_375:_375.isa);
};
ivar_getName=function(_376){
return _376.name;
};
ivar_getTypeEncoding=function(_377){
return _377.type;
};
objj_msgSend=function(_378,_379){
if(_378==nil){
return nil;
}
var isa=_378.isa;
if(!((((isa.info&(_326)))?isa:isa.isa).info&(_327))){
_356(isa);
}
var _37a=isa.method_dtable[_379];
if(!_37a){
_37a=_358;
}
var _37b=_37a.method_imp;
switch(arguments.length){
case 2:
return _37b(_378,_379);
case 3:
return _37b(_378,_379,arguments[2]);
case 4:
return _37b(_378,_379,arguments[2],arguments[3]);
}
return _37b.apply(_378,arguments);
};
objj_msgSendSuper=function(_37c,_37d){
var _37e=_37c.super_class;
arguments[0]=_37c.receiver;
if(!((((_37e.info&(_326)))?_37e:_37e.isa).info&(_327))){
_356(_37e);
}
var _37f=_37e.method_dtable[_37d];
if(!_37f){
_37f=_358;
}
var _380=_37f.method_imp;
return _380.apply(_37c.receiver,arguments);
};
method_getName=function(_381){
return _381.name;
};
method_getImplementation=function(_382){
return _382.method_imp;
};
method_setImplementation=function(_383,_384){
var _385=_383.method_imp;
_383.method_imp=_384;
return _385;
};
method_exchangeImplementations=function(lhs,rhs){
var _386=method_getImplementation(lhs),_387=method_getImplementation(rhs);
method_setImplementation(lhs,_387);
method_setImplementation(rhs,_386);
};
sel_getName=function(_388){
return _388?_388:"<null selector>";
};
sel_getUid=function(_389){
return _389;
};
sel_isEqual=function(lhs,rhs){
return lhs===rhs;
};
sel_registerName=function(_38a){
return _38a;
};
objj_eval=function(_38b){
var url=_2.pageURL;
var _38c=_2.asyncLoader;
_2.asyncLoader=NO;
var _38d=_2.preprocess(_38b,url,0);
if(!_38d.hasLoadedFileDependencies()){
_38d.loadFileDependencies();
}
_1._objj_eval_scope={};
_1._objj_eval_scope.objj_executeFile=_287.fileExecuterForURL(url);
_1._objj_eval_scope.objj_importFile=_287.fileImporterForURL(url);
var code="with(_objj_eval_scope){"+_38d._code+"\n//*/\n}";
var _38e;
_38e=eval(code);
_2.asyncLoader=_38c;
return _38e;
};
_2.objj_eval=objj_eval;
_149();
var _38f=new CFURL(window.location.href),_390=document.getElementsByTagName("base"),_391=_390.length;
if(_391>0){
var _392=_390[_391-1],_393=_392&&_392.getAttribute("href");
if(_393){
_38f=new CFURL(_393,_38f);
}
}
var _394=new CFURL(window.OBJJ_MAIN_FILE||"main.j"),_1af=new CFURL(".",new CFURL(_394,_38f)).absoluteURL(),_395=new CFURL("..",_1af).absoluteURL();
if(_1af===_395){
_395=new CFURL(_395.schemeAndAuthority());
}
_196.resourceAtURL(_395,YES);
_2.pageURL=_38f;
_2.bootstrap=function(){
_396();
};
function _396(){
_196.resolveResourceAtURL(_1af,YES,function(_397){
var _398=_196.includeURLs(),_8c=0,_399=_398.length;
for(;_8c<_399;++_8c){
_397.resourceAtURL(_398[_8c],YES);
}
_287.fileImporterForURL(_1af)(_394.lastPathComponent(),YES,function(){
_14a();
_39f(function(){
var _39a=window.location.hash.substring(1),args=[];
if(_39a.length){
args=_39a.split("/");
for(var i=0,_399=args.length;i<_399;i++){
args[i]=decodeURIComponent(args[i]);
}
}
var _39b=window.location.search.substring(1).split("&"),_39c=new CFMutableDictionary();
for(var i=0,_399=_39b.length;i<_399;i++){
var _39d=_39b[i].split("=");
if(!_39d[0]){
continue;
}
if(_39d[1]==null){
_39d[1]=true;
}
_39c.setValueForKey(decodeURIComponent(_39d[0]),decodeURIComponent(_39d[1]));
}
main(args,_39c);
});
});
});
};
var _39e=NO;
function _39f(_3a0){
if(_39e){
return _3a0();
}
if(window.addEventListener){
window.addEventListener("load",_3a0,NO);
}else{
if(window.attachEvent){
window.attachEvent("onload",_3a0);
}
}
};
_39f(function(){
_39e=YES;
});
if(typeof OBJJ_AUTO_BOOTSTRAP==="undefined"||OBJJ_AUTO_BOOTSTRAP){
_2.bootstrap();
}
function _1a9(aURL){
if(aURL instanceof CFURL&&aURL.scheme()){
return aURL;
}
return new CFURL(aURL,_1af);
};
objj_importFile=_287.fileImporterForURL(_1af);
objj_executeFile=_287.fileExecuterForURL(_1af);
objj_import=function(){
CPLog.warn("objj_import is deprecated, use objj_importFile instead");
objj_importFile.apply(this,arguments);
};
})(window,ObjectiveJ);
