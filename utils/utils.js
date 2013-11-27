var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

module.exports = {
	    convertQueryParams2Dict: function(query){
	    	var result = {};
	    	if(!query) return result;

	    	var params = query.split('&');
	    	for(var i = 0; i < params.length; i++){
	    		var kvps = params[i].split('=');
	    		if(kvps.length != 2) continue;
	    		result[kvps[0]] = kvps[1];
	    	}
	    	
	    	return result;
	    },
	    
	    openSqlServer: function(config, sqlQuery, callback){
    		var connection = new Connection(config);
    		connection.on('connect', function(err) {
    				if(err){
    					console.log(err);
    					callback(err);
    					return;
    				}
    				runDbQuery();
    		    }
    		);
    		function runDbQuery() {
    			var results = [];
    			var request = new Request(sqlQuery, function(err, rowCount) {
    				if (err) {
    					console.log(err);
    			    } else {
    			    	callback(null, results);
    			    }
    			});

    			request.on('row', function(columns) {
    				var item = {};
    			    columns.forEach(function(column) {
    			    	item[column.metadata.colName] = column.value + '';
    			    });
    			    
    			    results.push(item);
    			});

    			connection.execSql(request);
    		}
	    }
};
