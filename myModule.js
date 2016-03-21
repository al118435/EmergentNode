var gb=require('glob');
var fs=require('fs');
var sf=require('slice-file');

var events = require('events');
var warmupEmmitter = new events.EventEmitter();

myDB = function(dataDir){
        this.dataDir=dataDir+"/";
        this.datasets=[];
        this.lastID=0;
        this.count={};
        this.warmup();
        
}

myDB.prototype.warmup = function(){
     var dataDir=this.dataDir
     files= gb.glob(this.dataDir+'*.json',{sync:true});

     this.datasets=files.map(function(e){
                     return e.trim().replace(dataDir,"").replace(".json","")
                    });

     filesTocheck=this.datasets.length;

     for(var idx in this.datasets){
        var name=this.datasets[idx]
        
        var count=this.count;
        this.count[name]=0;

        this.getLastObjects(name,1,function(data,name){

                 if (data.result!==null){
                    if (data.result.length>0){
                       console.log("[db].",name,"has",data.result[0]["n"],"objects");
                       count[name]=data.result[0]["n"];
                    }
                 }
                 filesTocheck--;
                 if (filesTocheck==0){
                     warmupEmmitter.emit('warmup');
                 }
                 return true;
        });
     }

     setTimeout(() => {warmupEmmitter.emit('warmup')});
     return true;
}

myDB.prototype.getDatasets = function(){
      
	var results=[];
	for(var key in this.count){
		results.push([key, this.count[key]]);
	}
	results.sort(function(a,b){return b[1]-a[1]});

      return results;
}

myDB.prototype.filename = function(name){
	   return this.dataDir+name+".json";
}

myDB.prototype.getTimeStamp = function(){
     var date=new Date().toISOString();
     return date;
}

myDB.prototype.createDataset = function(name,data){
     if (this.datasets.indexOf(name) === -1){
         this.datasets.push(name);
         this.count[name]=0;
         data.type="metadata";
         data.timestamp=this.getTimeStamp();
         fs.appendFile(this.filename(name),JSON.stringify(data)+"\n");
         return true;
      }
      else { return false; }
}

myDB.prototype.insertObject = function(name,data){
      if (this.datasets.indexOf(name) === -1 ){
        return false;
      }

      data.timestamp=this.getTimeStamp();
      data.id=this.lastID;
      this.lastID=data.id+1;
      if (this.count[name]!== null){
         this.count[name]++;
         data.n=this.count[name];
		console.log(this.count);

      }else{data.n=0;}

      fs.appendFileSync(this.filename(name),JSON.stringify(data)+"\n", encoding='utf8');

      return true;
}

myDB.prototype.getLastObjects= function(name,n,callback){
    if (this.datasets.indexOf(name) !== -1 ){
        xs = sf(this.filename(name));
        var lista=[];
        xs.slice(-n)
        .on('data',function(chunk){
            object=JSON.parse(chunk.toString().trim());
            if (!(object.type !== null && object.type === "metadata")){
                lista.push(JSON.parse(chunk.toString().trim()))
            } 
        })
        .on('end',function(){
          callback({result: lista},name)
        });
      }
      else{callback({error:'no valid dataset '+name},name);}
}

myDB.prototype.deleteDataset= function(name){
    if (this.datasets.indexOf(name) !=-1 ){
        fs.unlinkSync(this.filename(name));
        this.datasets.splice(this.datasets.indexOf(name),1);
        return true;
      }
    else {return false; }

}
/**
 *
 *
 *
 *
 */

myDB.prototype.countWords = function(name){
	

	if(this.datasets.indexOf(name !=-1)){
		xs = sf(this.filename(name));
		var dict={};
		// Comprobar que la primera lin es el header y no existe object.twit probar slice 1
		xs.slice(0).on('data', function(chunk){
			
			//console.log(chunk.toString());
			object=JSON.parse(chunk.toString().trim());
			console.log(object);
			console.log(object.twit);
			console.log('----------------------------------------');
		});
	
	}else{
		console.log('adios');
	}

	
	
}


//myDB.prototype.getDatasetInfo = function(name){}
//return the first line of the filename of name

//myDB.prototype.searchDataset = function(keyword){}

//myDB.prototype.countWords = function(name){}


exports.myDB = myDB;
exports.warmupEmmitter = warmupEmmitter;




