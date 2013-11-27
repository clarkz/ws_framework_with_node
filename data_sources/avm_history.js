var connFinder = require("../utils/db_conn_lookup");
var utils = require("../utils/utils");

module.exports = {
	    getAvmHistory : function(queryParams, callback){
	        connFinder.getConnectionStringByState(queryParams['state'], function(connObj){
	        	var connConfig = {
	        			userName: connObj.uid,
	        			password: connObj.pwd,
	        		    server: connObj.server_prefix, //connObj.server_name,
	        		    options: {
	        		    	database: connObj.database_name,
	        		    	instanceName: connObj.instance_name
	        		    }
	        	};
	        	utils.openSqlServer(connConfig, getSqlQuery(queryParams['level'], queryParams['state'], queryParams['area']), function(err, recordsets){
    				var result = [];
    				for(var i = 0; i < recordsets.length; i++){
    					result.push(recordsets[i]);
    				}
                    callback(result);
	        	});
	        });
	    }
};

var getSqlQuery = function(level, state, areaName){
	if(!level) level = '';
	if(!state) state = '';
	if(!areaName) areaName = '';
	
	if(level.toLowerCase() == 'state') areaName = state;
	
	var sateQueryTemplate = "\
	declare @current_from_date datetime, @state_fips varchar(64) \
	SELECT @current_from_date = DATEADD(dd,1,to_date) FROM Dataquick_hist_aggregates.dbo.dm_effective_periods order by period_id desc \
	select @current_from_date as from_date, null as to_date, avm_avg \
	from Dataquick_aggregates.dbo.states_aggregates a \
	where a.state_code = '{0}' \
	union all \
	select p.from_date as from_date, p.to_date as to_date, a.avm_avg \
	from Dataquick_hist_aggregates.dbo.fct_states_aggregates a, \
	Dataquick_hist_aggregates.dbo.dm_effective_periods p, \
	Property.dbo.states s \
	where a.period_id = p.period_id \
	and s.state_abbreviation = '{0}' \
	and a.state_id = s.state_fips \
	order by from_date \
	";
	
	var stateQuery = sateQueryTemplate.replace(/\{0\}/g, state);
	var sqlQuery = "exec Property.dbo.pr_get_avm_aggregation_history '" + state + "', '" + level + "', '" + areaName.replace(/\'/, "''") + "'";

	if (level == 'state') return stateQuery;
	return sqlQuery;
};
