    //
    // require the native http module, as well as director.
    //
    var http = require('http'),
    	url = require('url'),
        director = require('director'),
        path = require("path"),
        fs = require("fs"),
        serverport = process.argv[2] || 8080;

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

    function populateHelpContent(){
    	var hpcnt = '<ul>';
    	for(var rtk in router.routes){
    		if(rtk.toLowerCase() == 'get') continue;
    		
    		var rv = router.routes[rtk];
    		hpcnt += '<li><a href="' + rtk + '">' + rtk + '</a></li>';
    	}
    	hpcnt += '</ul>';
    	return hpcnt;
    }
    
    function showHelp(){
//    	var hprep = this.rep;
    	var hpres = this.res;
    	fs.readFile('./help_template.html', function(err, html){
    		if(err){
    			hpres.writeHead(404);
    			hpres.end();
				console.log(err);
    			return;
    		}
    		
    		var helpContent = populateHelpContent();
    		var htmlContent = (html + '').replace('$doc_content$', helpContent);
    		
    		hpres.writeHeader(200, {"Content-Type": "text/html"});
    		hpres.write(htmlContent);
    		hpres.end();
    	});
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

	    // server static files
	    // http://stackoverflow.com/questions/6084360/node-js-as-a-simple-web-server
		var uri = url.parse(req.url).pathname, filename = path.join(process.cwd(), uri);

    	fs.exists(filename, function(exists) {
    		if(!exists || fs.statSync(filename).isDirectory()) {
    	        router.dispatch(req, res, function (err) {
    	            if (err) {
    	                res.writeHead(404);
    	                res.end();
    	            }
    	        });
    			return;
    		}

    		var contentTypesByExtension = {
    				'.html': "text/html",
    				'.css': "text/css",
    				'.js': "text/javascript"
    		};

    		fs.readFile(filename, "binary", function(err, file) {
    			if(err) {        
    				res.writeHead(500, {"Content-Type": "text/plain"});
    				res.write(err + "\n");
    				res.end();
    				return;
    			}

    			var headers = {};
    			var contentType = contentTypesByExtension[path.extname(filename)];
    			if (contentType) headers["Content-Type"] = contentType;
    			res.writeHead(200, headers);
    			res.write(file, "binary");
    			res.end();
    		});
    	});
    });
    //
    // You can also do ad-hoc routing, similar to `journey` or `express`.
    // This can be done with a string or a regexp.
    //
    router.get('/bonjour', helloWorld);
    router.get(/hola/, helloWorld);

    //
    // set the server to listen on port `8080`.
    //
	console.log('web server is listening on port ' + serverport);
    server.listen(serverport);

