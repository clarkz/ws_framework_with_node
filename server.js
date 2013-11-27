    //
    // require the native http module, as well as director.
    //
    var http = require('http'),
    	url = require('url'),
        director = require('director');

    var utils = require("./utils/utils");
    var avm = require("./data_sources/avm_history");
    
    //
    // create some logic to be routed to.
    //
    function helloWorld() {
        this.res.writeHead(200, { 'Content-Type': 'text/plain' });
        var urlParts = url.parse(this.req.url);
        this.res.end('hello world ' + urlParts.query);
    }

    function showHelp(){
    	router
        this.res.writeHead(200, { 'Content-Type': 'text/plain' });
        this.res.end('hope this can help...');
    }
    //
    // define a routing table.
    //
    var router = new director.http.Router({
    	'/': {
    		get: showHelp
    	},
        '/hello': {
            get: helloWorld
        },
        '/avm': {
            get: function(){
            	var request = this.req;
            	var response = this.res;
            	var queryParams = utils.convertQueryParams2Dict(url.parse(request.url).query);
            	avm.getAvmHistory(queryParams, function(result){
            		var srst = {};
            		srst['area_level'] = queryParams['level'];
            		srst['area_name'] = queryParams['area'];
            		srst['state'] =  queryParams['state'];
            		srst['avms'] = result;
            		response.writeHead(200, { 'Content-Type': 'text/plain' });
            		response.end(JSON.stringify(srst));
            	});
            }
        }
    });

    //
    // setup a server and when there is a request, dispatch the
    // route that was requested in the request object.
    //
    var server = http.createServer(function (req, res) {
        router.dispatch(req, res, function (err) {
            if (err) {
                res.writeHead(404);
                res.end();
            }
        });
    });

    //
    // You can also do ad-hoc routing, similar to `journey` or `express`.
    // This can be done with a string or a regexp.
    //
    router.get('/bonjour', helloWorld);
    router.get(/hola/, helloWorld);

router.on('/param/:foo/:bar/:bazz', function(foo, bar, bazz){
          this.res.writeHead(200, { 'Content-Type': 'text/plain' });
          this.res.end('foo = ' + foo + ', bar = ' + bar + ', bazz = ' + bazz);
          });

    //
    // set the server to listen on port `8080`.
    //
    server.listen(8080);

