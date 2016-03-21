var sf = require('slice-file');
var split  = require('split');
//xs.slice(-2).pipe(process.stdout);

function getLastLines(fname,n,callback){
	xs = sf(fname);
	var lista=[];
    xs.slice(-n).on('data',function(chunk){lista.push(chunk.toString().trim())})
    .on('end',function(){callback(lista)});
};

getLastLines('./data/coches.json',5,function(lista){console.log(lista);});




//stream.on('data',function(chunk){console.log(chunk.toString());});

//stream.on('data',function(chunk){console.log(chunk.toString());});
//var lista=[];
//stream.pipe(split()).on('data',function(line){console.log(line);lista.push(line);console.log(lista)})
//                    .on('end',function(){console.log(lista.length)});

