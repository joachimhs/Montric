EurekaJ Profiler
======================================
 
EurekaJ is an Open Source, Standards based profiler tool for Java applications. 
The project will develop a complete Java Profiler solution (EurekaJ Profiler) consisting 
of an agent that can be installed and started together with the application that monitoring 
is intended for. In addition a Manager application will receive data from multiple agents, 
accumulate data and make it possible for developer, operations, application managers, 
technical managers, etc. to log in and view both live and historical data from the last 30 days

The goal is to develop a general application for monitoring Java applications with the following main goals:

* Complete Agent functionality with the possibility to decide upon a degree of monitoring per application (customized instrumentation)
* A Manager Application that is scalable with both number of agents, users and data storage needs in mind
* A complete Manager application that provides its users with the possibility to see crucial information regarding the monitored applications performance and resource consumptions (memory, CPU, Threads, IO, etc), as well as errors and exceptions
* The possibility to set up alerts for any measurements passed from any agent to the Manager application, as well as sending alerts via multiple channels (Email, SNMP, etc.)

EurekaJ Profilers main goal is to work as a complete Java Profiler by being:

* Fine-grained: Low-level methods can be monitored
* Consolidated: All collected statistics is routed to the same logical server having the possibility to deliver a consolidated view
* Constant: Monitoring will take place 24/7
* Effective: Gathering monitoring data shall have a small as possible negative effect on the performance of the monitored application
* Realtime: The collected data will be visualized, reported and alerted on in real-time
* Historical: Data is stored in 30 days for visualization, comparisong and reporting of historical data.

## Screenshot
![EurekaJ Profiler] (http://eurekaj.haagen.name/images/eurekaj_screenshot.png)

## Downloads
I will frequently post new versions to the followign URL: http://nightly.haagen.name/EurekaJ/

## Contributors

* Joachim Haagen Skeie

## Acknowledgements

EurekaJ Profiler includes code from a number of different open source projects
including:

* [BTrace](http://kenai.com/projects/btrace)
* [SproutCore](http://www.sproutcore.com/)
* [Flot](http://code.google.com/p/flot/)

For a full list of third-party libraries and framework, point your browser to: http://confluence.haagen.name/display/eurekaj/Third+Party+Libraries
