//import express package
var express = require("express");

//import mongodb package
var mongodb = require("mongodb");

//MongoDB connection URL - mongodb://host:port/dbName
var dbHost = "mongodb://10.88.206.242:27017/smcc";

//DB Object
var dbObject;

//get instance of MongoClient to establish connection
var MongoClient = mongodb.MongoClient;

//Connecting to the Mongodb instance.
//Make sure your mongodb daemon mongod is running on port 27017 on localhost
MongoClient.connect(dbHost, function(err, db){
  if ( err ) throw err;
  console.log(err);
  console.log("Succesfuly connected");
  dbObject = db;
});


function getCampaign(responseObj) {
dbObject.collection('socialfact').aggregate([
  { $group : { _id : "$campaign",count: { $sum: 1 }  }  }
]).toArray(function(err, docs){
    	
	if ( err ) throw err;
	var c = 0;
	var dataset = [];
	for ( index in docs){		
      var doc = docs[index];
     c = c+1;
	 dataset.push({"label" :doc['_id']});
	 dataset.push({"value" :doc['count']});
    }
  

   var response = {
	  "type" : "Campaign",
      "total_campaign" : c,
	  "dataset" : dataset
    };
	
	//console.log(dataset);
    responseObj.json(response);   
  });



}


function getLocation(responseObj) {
dbObject.collection('socialfact').aggregate([
  { $group : { _id : "$dataplace",count: { $sum: 1 }  }  }
]).toArray(function(err, docs){
    	
	if ( err ) throw err;
	var c = 0;
	var dataset = [];
	for ( index in docs){		
      var doc = docs[index];
     c = c+1;
	 dataset.push({"label" :doc['_id']});
	 dataset.push({"value" :doc['count']});
    }
  

   var response = {
	  "type" : "Location",
      "total_location" : c,
	  "dataset" : dataset
    };
	
	//console.log(dataset);
    responseObj.json(response);   
  });



}

function getGender(responseObj) {
dbObject.collection('socialfact').aggregate([
  {$project: {
    male: {$cond: [{$eq: ["$gender", "M"]}, 1, 0]},
    female: {$cond: [{$eq: ["$gender", "F"]}, 1, 0]},
    Unisex: {$cond: [{$eq: ["$gender", "U"]}, 1, 0]},
  }},
  {$group: { _id: null, male: {$sum: "$male"},
                        female: {$sum: "$female"},
                         unisex: {$sum: "$Unisex"},
                        total: {$sum: 1},
  }},
]).toArray(function(err, docs){
    	
	if ( err ) throw err;

	for ( index in docs){
		
      var doc = docs[index];
     
    }
    var dataset = [
      {
        "label" : "Male",
        "value" : doc['male']
      },
      {
        "label" : "Females",
        "value": doc['female']
      },
	  {
        "label" : "Unknown",
        "value": doc['unisex']
      },
	  {
        "label" : "Total",
        "value": doc['total']
      }
    ];

    var response = {
	  "type" : "Gender",
	  "total_male" : doc['male'],
	  "total_female" : doc['female'],
	  "total_unknown" : doc['unisex'],
	  "total" : doc['total'],
      "dataset" : dataset
    };
    responseObj.json(response);
  });
}
 
 
function getGenderLocation(responseObj) {
/*dbObject.collection('socialdata').aggregate([
    { "$group": {
        "_id": {
            
            "gender": "$gender",
			"location": "$dataPlace",
        },
        "totalCount": { "$sum": 1 }
    }},
    { "$group": {
        "_id": "$_id.gender",
        "Genders": { 
            "$push": { 
                "gender": "$_id.location",
                "count": "$totalCount",
               
            },
        },
        "count": { "$sum": "$totalCount" }
    }},
    
    
    { "$sort": { "count": -1 } },
])*/dbObject.collection('socialdata').aggregate([
    { "$group": {
        "_id": {
            "location": "$dataPlace",
            "gender": "$gender",
           
        },
        "names":{ "$addToSet": {"username":"$contributorName","tweetcount": "$userPostCount"}},
       
        "totalCount": { "$sum": 1 }
    }},
    { "$group": {
        "_id": "$_id.gender",
        "Locations": { 
            "$addToSet": { 
                "loc": "$_id.location",
                "count": "$totalCount",
                "names": "$names",
               
               
            },
        },
        "count": { "$sum": "$totalCount" }
    }},
    
    
    { "$sort": { "count": -1 } },
]).toArray(function(err, docs){
    	
	if ( err ) throw err;
	var dataset = [];
	var child = [];

	var editeditems = [];
for (index in docs){
	var settings = [];
	var doc = docs[index];
	for ( C in doc['Locations']){
		var d = doc['Locations'][C];
		var childrens=[];
		for(E in d['names']){
			
		 var f = d['names'][E];
			childrens.push({
				"name": f['username'],
				"size": f['tweetcount'],
			});
		}
		settings.push({
							"name": d['loc'],
							"size": d['count'],
							"children" : childrens
					 });
	}			
	if(doc['_id'] != "U") {
	editeditems.push({
		
		"name": doc['_id'],
		"children": settings
		});  
	}
}
    var response = {
	  "name" : "kitkat",
      "children":editeditems
    };
    responseObj.json(response);
  });
}	
 
 
 
//create express app
var app = express();

app.get("/getGender", function(req, res){
	res.setHeader("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');  
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  getGender(res); 
});

app.get("/getLoc", function(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');  
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  getLocation(res); 
});

app.get("/getGenderLocation", function(req, res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');  
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  getGenderLocation(res); 
});


app.get("/getCampaign", function(req, res){
	res.setHeader("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');  
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  getCampaign(res); 
});
app.listen("3300", function(){
  console.log('Server up: http://localhost:3300');
});