import {
  map
} from 'min-dash';

import { Moddle } from 'moddle';

//const fs = require('fs');


export function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

export function createModelBuilder(base) {

  var cache = {};

  if (!base) {
    throw new Error('[test-util] must specify a base directory');
  }

  function createModel(packageNames) {

    var packages = map(packageNames, function(f) {
      var pkg = cache[f];
      var jsonPath = base + f + '.json';

      // Sample JS object
var obj = {
	"name": "TemporalData",
	"prefix": "td",
	"uri": "http://TemporalData",
	"xml": {
		"tagAlias": "lowerCase"
	},
	"associations": [],
	"types": [

    {
			"name": "DurationConstraintTask",
			"superClass": ["Element"],
			"properties": [{
					"name": "contigency",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "maxDuration",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "minDuration",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "prepLabel",
					"isAttr": true,
					"type": "String"
				}
			]
		},
		{
			"name": "StartNode",
			"superClass": ["Element"],
			"properties": [{
					"name": "id",
					"isAttr": true,
					"type": "String"
				},
				{
					"name": "x",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "y",
					"isAttr": true,
					"type": "Integer"
				}
			]
		},
		{
			"name": "PNode",
			"superClass": ["Element"],
			"properties": [{
					"name": "id",
					"isAttr": true,
					"type": "String"
				},
				{
					"name": "x",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "y",
					"isAttr": true,
					"type": "Integer"
				}
			]
		},
		{
			"name": "EndNode",
			"superClass": ["Element"],
			"properties": [{
					"name": "id",
					"isAttr": true,
					"type": "String"
				},
				{
					"name": "x",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "y",
					"isAttr": true,
					"type": "Integer"
				}
			]
		},
		{
			"name": "CustomConnector",
			"superClass": ["Element"],
			"properties": [{
					"name": "id",
					"isAttr": true,
					"type": "String"
				},
				{
					"name": "waypoints",
					"isAttr": true,
					"type": "String"
				},
				{
					"name": "source",
					"isAttr": true,
					"type": "String"
				},
				{
					"name": "target",
					"isAttr": true,
					"type": "String"
				}
			]
		},
		{
			"name": "DurationConstraintGateway",
			"superClass": ["Element"],
			"properties": [{
					"name": "maxDuration",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "minDuration",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "prepLabel",
					"isAttr": true,
					"type": "String"
				}
			]
		},
		{
			"name": "TemporalConstraint",
			"superClass": ["Element"],
			"properties": [{
					"name": "id",
					"isAttr": true,
					"type": "String"
				},
				{
					"name": "value",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "constraintType",
					"isAttr": true,
					"type": "Integer"
				},
				{
					"name": "waypoints",
					"isAttr": true,
					"type": "String"
				},
				{
					"name": "source",
					"isAttr": true,
					"type": "String"
				},
				{
					"name": "target",
					"isAttr": true,
					"type": "String"
				}
			]
		}

	]

};




      if (!pkg) {
        try {
          ;
          //pkg = cache[f] = JSON.parse(base + f + '.json');
          //pkg = readTextFile(file, function(text){
            //  var data = JSON.parse(text);

            //fetch(jsonPath)
                //.then(res => res.json())
              //  .then(data => jsonFile = JSON.parse(JSON.stringify(data)));

            pkg = cache[f] = obj;
                    //  });
        } catch (e) {
          throw new Error('[Helper] failed to parse as JSON: ' +  e.message);
        }
      }

      return pkg;
    });

    return new Moddle(packages);
  }

  return createModel;
}
