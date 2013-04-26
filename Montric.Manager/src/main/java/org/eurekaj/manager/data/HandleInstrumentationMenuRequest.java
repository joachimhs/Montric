package org.eurekaj.manager.data;

public class HandleInstrumentationMenuRequest {// implements Handler<Buffer> {
	/*private HttpServerRequest req;
	private static Logger log = Logger.getLogger(HandleInstrumentationMenuRequest.class.getName());
	public HandleInstrumentationMenuRequest(HttpServerRequest req) {
		this.req = req;
	}
	
	@Override
	public void handle(Buffer buffer) {
		long before = System.currentTimeMillis();
		System.out.println("handle Instrumemtation Menu");
		//Parse Buffer contents
		InstrumentationMenuDataServer menu = new InstrumentationMenuDataServer();
		try {
			String instrumentationhandler = menu.buildInstrumentationMenu(buffer.toString());
			log.info("built menu. Took: " + (System.currentTimeMillis() - before) + " ms.");
			//System.out.println(instrumentationhandler);
			req.response.setChunked(true);
			req.response.write(instrumentationhandler);
			log.info("wrote menu. Took: " + (System.currentTimeMillis() - before) + " ms.");
			req.response.end();
			log.info("Ending response. Took: " + (System.currentTimeMillis() - before) + " ms.");
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}		
		
		long after = System.currentTimeMillis() - before;
		log.info("Completed instrumentaiton menu. Took: " + after + " ms.");
	}
	 */
}
