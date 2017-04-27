import mongodb from "mongodb";
var dbGlobal ;
var server = new mongodb.Server("127.0.0.1", 3001, {});
var Database = new mongodb.Db('meteor', server, {w: 1});
var MongoClient = require('mongodb').MongoClient;

var mongoConnectionCallback = function(callback){
	MongoClient.connect("mongodb://localhost:3001/meteor", function(err, db) {  
	    if(err){
	    	callback(undefined,err)
	    }else{
	    	callback(db,undefined);
	    } 
	});
}
export default mongoConnectionCallback;