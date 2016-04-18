var application_root=__dirname,
    express = require("express"),
    path = require("path")

var app = express();

app.use(express.static(path.join(application_root,"public")));

var bodyparser=require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());


//prueba
//TWITTER
var util = require('util');
var twitter = require('twitter');
var twit = new twitter({
consumer_key: 'Q1yBIWyhwajwlOEqZV8Mw',
consumer_secret: 'pEihqo1RgizDU7BtOBika6VxAcGK42uTr3cm36npE',
access_token_key: '135457106-vO3VFVu3v6gOh4T0mPBS2gYZoF6vobjTBrS0ctry',
access_token_secret: '4Ei0ylK7Z0TKIA5alS8LMll9drEDpzmPNhvIUbVSKlg'
});




// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// baseurl
app.get('/',function(req,res){
    res.sendFile("public/hola.html",{root:application_root});
});


/**
 * 
 * Devuelve un fichero estatico
 *
 * */

app.get('/public/:file',function(req,res){
	res.sendFile("public/"+req.params.file,{root:application_root});
});


/**
 *
 * Devuelve los datasets actuales
 *
 */
app.get('/streams',function(req,res){
    res.send({result: DB.getDatasets()});
});


/**
 *  Crea un nuevo dataset
 *
 * POST /stream  name y query en el body
 *
 */
app.post('/stream', function(req, res){

	if(req.body!==null){

		console.log("hay body");
		

		var name= req.body["name"];
		console.log('--------',name,'-------------');
		// Creamos el dataset que le enviamos por post
		DB.createDataset(name, {'name':name});
		
		twit.get('search/tweets.json',{q:req.body["query"]},function(error,data,status){
			console.log(util.inspect(data));


			for(idx in data.statuses){
				tweet  = data.statuses[idx];
				/**
				console.log(tweet.text);
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$");
				
				console.log(tweet.place.bounding_box.coordinates);
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$");
				if(tweet.coordinates===null){
					coordenadas=null;
				}else{
					coordenadas=tweet.coordinates.coordinates;
				}
				*/
				coordenadas=null;
				objDataset={"id":tweet.id_str, "tweet":JSON.stringify(tweet.text), "coordinates":coordenadas}; 
				DB.insertObject(name, objDataset);
				
			}

		});

	
	
		
		}

res.send({'result':'unknown'});

});



/**
 * 
 *  Actualiza el stream <name> con el dataset que devuelva twitter
 *	PUT /stream/<name>
 *
 */

app.put('stream/:name', function(req, res){
	


	// utilizar twit.get('search/tweets.json'
	res.send({'result':'unknown'});

});


/**
 *
 *	Muestra  las N ultimas palabras del stream <name>
 * 	GET /stream/<name>/words?top=N
 */
app.get('/stream/:name/words',function(req,res){

   top= req.query.top !== undefined ? req.query.top : 10;
	
    DB.countWords(req.params.name, top, function(data){
    	res.send({'result':data});

    });
});


/**
 *
 * GET /stream/<name>/polaridad 
 *
 */
app.get('/stream/:name/polaridad', function(req, res){
	
	DB.polaridad(req.params.name, function(data){
		res.send({'result':data});
	});


});


/**
 *
 *	GET /stream/<name>/geo 
 *
*/
app.get('/stream/:name/geo', function(req, res){

	res.send({'result':'unknown'});
});


var db = require('./myModule');

var DB = new db.myDB('./data');

//do not run the server till the database is up
db.warmupEmmitter.once("warmup",() => {
   app.listen(8012);
   console.log("Web server running on port 8012");
});

