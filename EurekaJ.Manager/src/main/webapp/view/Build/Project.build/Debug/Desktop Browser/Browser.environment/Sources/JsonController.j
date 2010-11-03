@STATIC;1.0;I;21;Foundation/CPObject.jt;1089;

objj_executeFile("Foundation/CPObject.j", NO);

{var the_class = objj_allocateClassPair(CPObject, "JsonController"),
meta_class = the_class.isa;objj_registerClassPair(the_class);
class_addMethods(the_class, [new objj_method(sel_getUid("sendJSON:"), function $JsonController__sendJSON_(self, _cmd, jsonObjectString)
{ with(self)
{

    var contentLength = objj_msgSend(objj_msgSend(CPString, "alloc"), "initWithFormat:", "%d", objj_msgSend(jsonObjectString, "length"));

 CPLog.debug("Sending JSON: %@", jsonObjectString);

    var request = objj_msgSend(objj_msgSend(CPURLRequest, "alloc"), "initWithURL:", "http://localhost:8081/JSONServlet");
    objj_msgSend(request, "setHTTPMethod:", "POST");
    objj_msgSend(request, "setHTTPBody:", jsonObjectString);
    objj_msgSend(request, "setValue:forHTTPHeaderField:", contentLength, "Content-Length");
    objj_msgSend(request, "setValue:forHTTPHeaderField:", "text/plain;charset=UTF-8", "Content-Type");
    postConnection = objj_msgSend(CPURLConnection, "connectionWithRequest:delegate:", request, self);
}
},["void","CPString"])]);
}

