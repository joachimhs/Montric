CREATE DEFINER=`root`@`localhost` PROCEDURE `ProcessIncomingStatistics`()
begin 

declare v_userID int;
declare v_packageAndClassname varchar(255);
declare v_method varchar(255);
declare v_timestamp datetime;
declare v_flooredVal int;
declare v_executionTime int;
declare v_classType varchar(150);
declare v_guiPath varchar(255);
declare v_url varchar(255);
declare v_callsPerInterval int;
declare v_value double;
declare v_stacktrace varchar(4000);

declare startID int;
declare stopID int;
declare g_userID int;
declare g_guiPath varchar(500);
declare g_classType varchar(255);

declare done int default 0;


declare statCursor cursor for 	select i.UserID, i.PackageAndClassname, i.Method, FROM_UNIXTIME((convert(UNIX_TIMESTAMP(I.Timestamp)/15, UNSIGNED))*15) as timeperiod, floor(UNIX_TIMESTAMP(I.Timestamp)/15) as flooredVal, 								avg(i.ExecutionTime) as avgExecTime, i.ClassType, i.GUIPath, i.URL, i.CallsPerInterval, i.Value, i.Stacktrace
							from IncomingStatistics i
							where i.rowstatus = "N"
							group by i.GUIPath, flooredVal
							order by flooredVal desc;

declare guiCursor cursor for 	select ls.UserID, ls.GUIPath, max(ls.ClassType) from LiveStatistics ls
							where ls.Timestamp > now() - interval 60 minute
							group by ls.UserID, ls.GUIPath
							order by ls.UserID, ls.GUIPath;

DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;


open statCursor;
		
	select min(i.IncomingStatisticsID), max(i.IncomingStatisticsID) into startID, stopID from IncomingStatistics i where i.rowstatus = "N";
	if startID is null then
		set done = 1;
	end if;

while not done do
	fetch statCursor into v_userID, v_packageAndClassname, v_method, v_timestamp, v_flooredVal, v_executionTime, v_classType, v_guiPath, v_url, v_callsPerInterval, v_value, v_stacktrace;
	if v_classType is null or v_classType = "" then
		set v_classType = "Custom";
	end if;

	if v_guiPath is null then
		set v_guiPath = "";
	end if;

	insert into LiveStatistics(UserID, AvgExecutionTime, Timestamp, GUIPath, URL, CallsPerInterval, Value, ClassType)			
	values(v_userID, v_executionTime, v_timestamp, v_guiPath, v_url, v_callsPerInterval, v_value, v_classType)
	on duplicate key update  CallsPerInterval = CallsPerInterval + v_callsPerInterval, AvgExecutionTime = ((AvgExecutionTime * CallsPerInterval) + (v_executionTime * v_callsPerInterval)) / (CallsPerInterval + v_callsPerInterval), Value = v_value;
end while;

	update IncomingStatistics i set i.rowstatus = "P" where i.IncomingStatisticsID between startID and stopID;

	delete from IncomingStatistics where rowstatus = "P";
close statCursor;

open guiCursor;
set done = 0;
while not done do
	
	fetch guiCursor into g_userID, g_guiPath, g_classType;
	
	if g_userID is not null then
		if g_classType is null or g_classType = "" then
			set g_classType = "Custom";
		end if;

		if g_guiPath is null then
			set g_guiPath = "";
		end if;

	
		insert into TreeMenuNode(UserID, GUIPath, NodeLive, NodeUpdated, ClassType) values(g_userID, g_guiPath, "Y", now(), g_classType) on duplicate key update NodeLive = "Y", NodeUpdated = now(), ClassType = g_classType;
	end if;
end while;
close guiCursor;

update TreeMenuNode tmn set tmn.NodeLive = "N" where tmn.NodeUpdated is null;
update TreeMenuNode tmn set tmn.NodeUpdated = null;
end