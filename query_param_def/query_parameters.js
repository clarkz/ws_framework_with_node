var paramap = {
	'avm': {
		"name": "Avm history",
		"description": "Get Avm historial data in a given area, area can be state, county, city or zip code",
		"parameters": {
	    	"level": {"values": "state, county, city, zip", "description": "define level of the query area", "required": true, "example": "zip"},
	    	"state": {"description": "the state that the search area belongs to", "required": true, "example": "ca"},
	    	"area": {"description": "the state that the search area belongs to", "required": true, "example": "90212"},
	    	"client_id": {"description": "identify of the caller.", "required": true, "example": "mapi_demo"}
		},
		"examples": [
		             	{
		             		"queryParams": "level=state&state=tx",
		             		"description": "avm in a state"
		             	},
		             	{
		             		"queryParams": "level=county&state=ca&area=orange",
		             		"description": "query avm history in a county"
		             	},
		             	{
		             		"queryParams": "level=city&state=wa&area=seattle",
		             		"description": "avm history for a city"
		             	},
		             ]
    },
    'account': {
    	"name": "Broker Account Service",
		"description": "Authenticate login request, verify user hash",
		"parameters": {
	    	"client_id": {"description": "identify of the caller.", "required": true, "example": "mapi_demo"}
		},
		"post": {
			"example": '{"user_name": "jack", "password": "zhang"}',
			"description": "use post to send the user id and password."
		}
    },
    'hello': {
    	"name": "Say hi",
    	"description": "bla..."
    }
};

var formatQueryPath = function(queryParth){
	if(queryParth && queryParth.length > 0 && queryParth[queryParth.length - 1] == '/'){
		queryParth = queryParth.substring(0, queryParth.length - 1);
	}
	return queryParth.toLowerCase();
};

module.exports = {
		getQueryParamDefByPath: function(queryPath){
			return paramap[formatQueryPath(queryPath)];
		}
};
