EurekaJ Profiler
======================================

# Moving towards 1.5
EurekaJ is currently under heavy reconstruction. The Server side is migrating from Jetty to Netty, while the frontend 
is migrating away from SproutCore towards Ember.js. Release 1.5 is an exciting release of EurekaJ and will include a number
of new features that will make EurekaJ a lot more useable and approachable moving forward. 

Sadly, most of the API calls will change slighty. So if you are passing in statistics to EurekaJ without using EurekaJ Proxy,
you will have to update your methods. On the positive side the APIs in version 1.5 is a LOT cleaner and consistent. The
method in which you send in statisitcs will also be simplified a lot in verison 1.5, making it possible to pass in 
statistics from any source that can send text via HTTP (i.e. curl). 

Haagen Software will also be hosting a live verison of EurekaJ, offered in a Software as a Service manner to make it easier 
for you to get going if you don't want to operate your own installation of EurekaJ. 

Version 1.5 will introduce the concepts of accounts, so that you can use a single installation of EurekaJ to monitor 
multiple systems that you don't want to share data between. All users will be authenticated via Mozilla Persona. 

##Screenshots
Below you will find a few screenshots of what the current 1.5 development version looks like.

###Viewing Statistics
![Viewing Statistics] (http://stuff.haagen.name/ej1.png)

###Configuring Charts
![Configuring Charts] (http://stuff.haagen.name/ej2.png)

###Administrering your account
![Administrering your account] (http://stuff.haagen.name/ej3.png)

###Disabling lines inside the charts
![Disabling lines inside the charts] (http://stuff.haagen.name/ej4.png)

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

EurekaJ Profiler's main goal is to work as a complete Java Profiler by being:

* Fine-grained: Low-level methods can be monitored
* Consolidated: All collected statistics are routed to the same logical server having the possibility to deliver a consolidated view
* Constant: Monitoring will take place 24/7
* Effective: Gathering monitoring data shall have a small as possible negative effect on the performance of the monitored application
* Realtime: The collected data will be visualized, reported and alerted on in real-time
* Historical: Data is stored in 30 days for visualization, comparison and reporting of historical data.

## Screenshot
![EurekaJ Profiler] (http://eurekaj.haagen.name/images/eurekaj_screenshot.png)

## Downloads
I will frequently post new versions to the followign URL: http://nightly.haagen.name/EurekaJ/

## Final Release

As of 8th September 2011, EurekaJ 1.0 is FINAL! The final release can be downloaded from this GitHub page's Download link above. You can still get the nightly build if you would rather get it fresh from the press :) 

## Contributors

* Joachim Haagen Skeie

## Acknowledgements

EurekaJ Profiler includes code from a number of different open source projects
including:

* [BTrace](http://kenai.com/projects/btrace)
* [SproutCore](http://www.sproutcore.com/)
* [Flot](http://code.google.com/p/flot/)

For a full list of third-party libraries and framework, point your browser to: http://confluence.haagen.name/display/eurekaj/Third+Party+Libraries
