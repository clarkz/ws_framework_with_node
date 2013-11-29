var utils = require("../utils/utils");

var connConfig4Account = {
		userName: 'orca',
	    password: '4*lZCIyx',
	    server: 'QAZ02SQL863.corp.homestore.net',
	    options: {
	    	database: 'Account',
	    	instanceName: 'VSQL02'
	    }
	};

var connConfig4UserCache = {
		userName: 'orca',
	    password: '4*lZCIyx',
	    server: 'QAZ02SQL863.corp.homestore.net',
	    options: {
	    	database: 'UserCache',
	    	instanceName: 'VSQL02'
	    }
	};

module.exports = {
		authenticate: function(request, response, callback){
			var post = null;
			try{
				post = JSON.parse(request.postContent);
			}catch(err){
				console.log('error in authenticate:\r\n' + err);
				callback(err, null);
			}
			
			callback(null, '1234567890abcdefgh', post.user_name);
		},
		verify: function(hash){
			
		}
};
