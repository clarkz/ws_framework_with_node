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
    var account = require("./data_sources/account");
    
//    var paramdef = require("./param_def/qp");
    var paramDef = require("./query_param_def/query_parameters");;
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
    		
//    		console.log('end point: ' + rtk + '\r\n');
    		var def = paramDef.getQueryParamDefByPath(rtk);
    		if(!def) continue;

    		var sampleQuery = '';

    		hpcnt += '<li>';
    		hpcnt += '<h3 class="service-title">' + def['name'] + '</h3>';
    		if(def['description']){
    			hpcnt += '<div class="service-note">' + def['description'] + '</div>';
    		}
   			hpcnt += '<table class="service-desc">';
   			hpcnt += '<tr><td><span class="service-item">end point</span></td>';
   			hpcnt += '<td><span class="service-item-value">/' + rtk + '</span></td>';
   			hpcnt += '</tr>';
   			if(def['parameters']){
   	   			hpcnt += '<tr><td><span class="service-item">query parameters</span></td>';
   	   			hpcnt += '<td>';
   	   			hpcnt += '<table class="service-param-desc">';
   	   			hpcnt += '<tr class="param-table-header"><th class="param-name">name</th><th class="param-value">value</th><th class="param-desc">description</th></tr>';
   	   			for(var info in def['parameters']){
   	   				var paramdef = def['parameters'][info];
   	   	   			hpcnt += '<tr>';
   	   				hpcnt += '<td class="param-name">' + info + '</td>';
   	   				var parvaltag = '<td></td>';
   	   				if(paramdef['values']){
   	   					parvaltag = '<td class="param-value">' + paramdef['values'] + '</td>';
   	   				}
   	   				hpcnt += parvaltag;
   	   				var pardesctag = '<td></td>';
   	   				if(paramdef['description']){
   	   					pardesctag = '<td class="param-desc">' + paramdef['description'] + '</td>';
   	   				}
   	   				hpcnt += pardesctag;
   	   	   			hpcnt += '</tr>';

   	   	   			if(paramdef['example']){
   	   					sampleQuery += (sampleQuery? '&' : '') + info + '=' + paramdef['example'];
   	   				}
   	   			}
   	   			hpcnt += '</table>';
   	   			hpcnt += '</td>';
   			}
   			var postbody = (def['post'] && def['post']['example']? def['post']['example']: '');
   			hpcnt += '<tr><td><span class="service-item">query example' + (postbody?' (post)' : '') + '</span></td>';
   			var queryUrl = rtk + (sampleQuery?'?' + sampleQuery : '');
   			var html4post = '';
   			var postcls = '';
   			if(postbody){
   				html4post += '<textarea rows="5" cols="40">';
   				html4post += postbody;
   				html4post += '</textarea>';
   				html4post += '<pre></pre>';
   				postcls = 'class="cls-lnk-post" ';
   			}
   			hpcnt += '<td><div class="cls-query-example">\
   						<a ' + postcls + 'href="' + queryUrl + '">' + queryUrl + '</a>\
   						' + html4post + '\
   						</div></td>';
   			hpcnt += '</tr>';
   			
   			if(def['examples']){
   	   			hpcnt += '<tr><td><span class="service-item service-more-examples-title">more examples</span></td>';
   				hpcnt += '<td class="service-more-examples"><ul>';
   				for(var exp in def['examples']){
   					hpcnt += '<li>';
   		   			queryUrl = rtk + (def['examples'][exp]['queryParams']?'?' + def['examples'][exp]['queryParams'] : '');
   		   			if(def['examples'][exp]['description']){
   	   					hpcnt += '<p>' + def['examples'][exp]['description'] + '</p>'; 
   		   			}
   		   			hpcnt += '<a href="' + queryUrl + '">' + queryUrl + '</a>';
   					hpcnt += '</li>';
   				}
   				hpcnt += '</ul></td></tr>';
   			}
   			hpcnt += '</table>';
    		hpcnt += '</li>';
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
        '/account': {
        	post: function(){
            	var request = this.req;
            	var response = this.res;
               	account.authenticate(request, response, function(err, hash, userId){
               		response.writeHead(200, { 'Content-Type': 'text/plain' });
               		response.end('authentication token for ' + userId + ' is: ' + hash);
               	});
        	}
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

		if(req.method == 'POST'){
			var postContent = '';
			req.on('data', function(data){
				postContent += data;
				if(postContent.length > 2048){
					postContent = '';
					this.rep.wirteHead(413, {'Content-Type': 'text/plain'}).end();
					this.rep.connection.destroy();
				}
			});
			req.on('end', function(data){
				req.postContent = postContent;
			});
		}
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
	console.log('web server is listening on port ' + serverport + "\r\npress [Ctrl]+C to stop.");
    server.listen(serverport);

