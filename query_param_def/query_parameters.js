var paramap = {
	'avm': {
		"parameters": {
	    	"level": {"values": "state, county, city, zip", "description": "define level of the query area", "required": true, "example": "zip"},
	    	"state": {"description": "the state that the search area belongs to", "required": true, "example": "ca"},
	    	"area": {"description": "the state that the search area belongs to", "required": true, "example": "90212"}
		},
		"name": "Avm history",
		"description": "Get Avm historial data in a given area, area can be state, county, city or zip code",
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
