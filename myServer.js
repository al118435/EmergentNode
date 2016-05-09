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
var MongoClient = require('mongodb');
var assert=require("assert");



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
		

		var name= req.body["@id"];
		
		// Creamos el dataset que le enviamos por post
		DB.createDataset(name,req.body);
		
		//add JsonLd to mongo db

	MongoClient.connect("mongodb://practicas:practicas@ds017852.mlab.com:17852/mydb", {native_parser:true}, 
	    function(err, db) {
		assert.equal(null, err);
		
		db.collection('jsonld').insertOne(req.body, 
		     function(err, result) {
			  assert.equal(null, err);
			  console.log(result.insertedId);
			  console.log(err);
			  db.close();
			});
	  });
		
		twit.get('search/tweets.json',{q:req.body["query"]},function(error,data,status){


			for(idx in data.statuses){
				tweet  = data.statuses[idx];
				/*
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
				
				
				if (tweet.place ===null) {
					lugar= "unknown";
				}else{
					lugar = tweet.place.bounding_box.coordinates;
				}
				
				coordenadas=null;
				lugar="a";
				objDataset={"id":tweet.id_str, "tweet":JSON.stringify(tweet.text), "coordinates":coordenadas, "place":lugar}; 
				DB.insertObject(name, objDataset);
				
			}

		});

	
		res.send({'result':'unknown'});	
		
		}


});
//
//
//
//
//app.get("Metodo para obtener get de mongoDB") (por hacer---2a parte de la practica)
//
//
//
//
//
/**
 * 
 *  Actualiza el stream <name> con el dataset que devuelva twitter
 *	GET /stream/<name>?limit=$
 *
 */

app.get('/stream/:name', function(req, res){
	
	twit.get('search/tweets.json',{q:req.params.name},function(error,data,status){

		// var
		var id_list=[];
		//console.log(util.inspect(data));
		
		for (var i =0; i < req.query.limit; i++) {
				
			id_list.push(data.statuses[i].id_str);
		}

		res.send({'result':id_list});
	
	});

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

app.get('/stream/graph', function(req, res){
	res.send({'result':unknown});
});
/**
 *
 *	GET /stream/<name>/geo 
 *
*/
app.get('/stream/:name/geo', function(req, res){

	DB.geo(req.params.name, function(data){
		console.log(util.inspect(data));

	});
	res.send({'result': [40, 1]});
});


var db = require('./myModule');

var DB = new db.myDB('./data');

//do not run the server till the database is up
db.warmupEmmitter.once("warmup",() => {
   app.listen(8012);
   console.log("Web server running on port 8012");
});

