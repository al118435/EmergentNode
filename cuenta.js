db=require('./myModule')
DB=new myDB('./data')
util=require('util')

//console.log(DB)

db.warmupEmmitter.once("warmup",() => {
      
	DB.countWords('javascript');
    // console.log(util.inspect(DB));
});

