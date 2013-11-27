var utils = require("../utils/utils");

// https://npmjs.org/package/mssql

//var centralPartitionConnStr = 'Driver={SQL Server Native Client 11.0};Server=QAZ02SQL864;Database=MPRRedirect;UID=orca;PWD=4*lZCIyx';
var connConfig = {
		userName: 'orca',
	    password: '4*lZCIyx',
	    server: 'QAZ02SQL864',
	    options: {
	    	database: 'MPRRedirect',
//	    	instanceName: connObj.instance_name
	    }
	};

module.exports = {
	getConnectionStringByState: function(state, callback){
    	utils.openSqlServer(connConfig, getSqlQuery(state), function(err, recordset){
			if(err){
				console.log("Error while querying the connstr for state " + state + "\r\n" + err);
				return;
			}

			if(recordset.length != 1){
				console.log("Didnot find the correct matching record for state " + state + "\r\n");
				return;
			}

			var svdt = getServerNameDetail(recordset[0]['server_name']);
			recordset[0]['server_prefix'] = svdt.serverName;
			recordset[0]['instance_name'] = svdt.instanceName;
			recordset[0]['port'] = 58467;
            callback(recordset[0]);
    	});
	}
};

var getSqlQuery = function(state){
	return "select p.* from MPRRedirect.dbo.states s join MPRRedirect.dbo.partitions p on p.partition_id = s.partition_id where p.partition_status_id = 1 and s.state_abbreviation = '" + state + "'";
};

var getServerNameDetail = function(sn){
	var pos = sn.indexOf('\\');
	if(pos < 0) return {serverName: sn, instanceName: ''};
	return {serverName: sn.substring(0, pos), instanceName: sn.substring(pos + 1, sn.length)};
};
