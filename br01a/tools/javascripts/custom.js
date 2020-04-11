var db;
var client;
var experiment = {};

var pubnub = new PubNub({
	subscribeKey: "sub-c-0b2aaa44-a779-11e6-be20-0619f8945a4f",
	publishKey: "pub-c-722b1270-6c2b-423d-98f6-cb21c18a2265",
})


$( document ).ready(function() {

    console.log( "ready!" );
    d = new Date();
    document.getElementById("start_time").value = d;
    d.setMonth(6);
    document.getElementById("expiration_date").value = d;

    client = stitch.Stitch.initializeDefaultAppClient('experimentdesign-roriu');

	db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('BR_internal');


    

});

jQuery(document).ready(($) => {


	pubnub.subscribe({
		channels: ['NFC_TAG_CLIENT'] 
	})
	
	pubnub.addListener({
		message: function (m) {
			var channelName = m.channel
			console.log('message came in: ', m)
			console.log(channelName)
			$('#log').append('<p>' + JSON.stringify(m.message) + '</p>')
			if (m.message.type == 'get') {
				$('#json_received').val(JSON.stringify(m.message.tag))
			}
		}
	})


	$('input[name=media_type]').click((e) => {


		var $this = $(e.currentTarget)

		if ($this.is(':checked')) {

			if ($this.attr('id') == 'media_type_solid') {
				console.log('solid clicked');

				$('#plate_type_group, #sealed_row').show()
				$('.liquid_input').hide()
				switchPlate()
				var table = $('.plate').filter((i, d) => {
					return $(d).is(':visible')
				})
				table.find('input').eq(0).focus()
				//$('.plate').is(':visible').find('input').eq(0).focus()
			} else {
				$('#plate_type_group, .form-row.plate, #sealed_row').hide()
				$('.liquid_input').show()
			}
		}
	})
	
	
	var switchPlate = () => {
		$('.form-row.plate').hide()
		if ($('#media_type_solid').is(':checked')) {
			var plate = $('#plate_type').val()
			$('#' + plate).show()
		}
	}
	$('#plate_type').change(switchPlate).change()

	
	$('#submit_nfc_form').submit((e) => {

		e.preventDefault()

		collectExperimentData(e);

		console.log("nfc submitted");
		
		/*
		const newRecord = {
			"user_id" : userid,
			"_id" : id,
			"start_time" : start, 
			"expiration_date" : expiration,
			"organism_media" : org_media,
			"duration" : duration,
			"target_temperature" : temp,
			"plate_type" : plateType,  
			'tube_type': tubeType, 
			'sensor_type': sensorType,
			'payload': payload,
			'sensing_interval': interval,
			}; 
			*/

		//payload, 

		db.collection("UserExperiments")
			.insertOne(experiment)
	  		.then(result => {
	  			console.log(`Successfully inserted item with _id: ${result.insertedId}`)
	  			document.getElementById("datarecordstatus").innerHTML = result.insertedId + " recorded successfully";
	  			})
	  		.catch(err => {
	  			if (err.message.indexOf("11000") != -1){	
	  				document.getElementById("datarecordstatus").innerHTML = document.getElementById("_id").value + 
	  				" exists, would you like to <a id='myLink' href='#' class='ahref_rewrite' onclick='rewriteNFC();return false;'>rewrite the experiment?</a>"
	  				console.error(`Failed to insert item: ${err}`) 
	  				}
				}
	  			)


	})



	$('#request_nfc_form').submit((e) => {
		//loadDB();
		e.preventDefault()
		retrieveTag($('#request_id').val())
	})
})

var $c = (t) => {
	console.log(t)
}

var config = () => {
	const config = {}

	if (window.location.hostname == '') { //this is for local testing with local MongoDB
		config.apiUrl = 'http://localhost:4001'
	} else {
		config.apiUrl = 'http://18.191.34.33:4000'
	}
	return config
}


var sendTag = (tagObj) => {
	const message = {
		cmnd: 'ADD_NFC',
		data: tagObj
	}
	pubnub.publish({
		message: message,
		channel: 'SERVER',
		meta: getMeta()
	})
}

var retrieveTag = (tag) => {
	const message = {
		cmnd: 'GET_NFC',
		data: tag
	}
	pubnub.publish({
		message: message,
		channel: 'SERVER',
		meta: getMeta()
	})
}

var getMeta = () => {
	return {
		'uuid': pubnub.getUUID(),
		'v': 1
	}
}

function collectExperimentData(){


		//var $this = $(e.currentTarget)
		var fields = ['_id', 'user_id',
					'start_time', 
					'expiration_date', 
					//'organism_media',
					'duration', 
					'target_temperature', 
					'sensing_interval', 
					'sensor_type']

		for (var i = 0; i < fields.length; i++) {
			experiment[fields[i]] = document.getElementById(fields[i]).value;
			//experiment[fields[i]] = $this.find('#' + fields[i]).val()
			//console.log()
		}

		sensorType = document.getElementById("sensor_type");
		experiment.sensor_type = sensorType.options[sensorType.selectedIndex].text;
		//experiment.sensor_type = $this.find('#sensor_type').val()
		
		if (document.getElementById('media_type_solid').checked == true){

			experiment.media_type = 'solid'
			experiment.plate_type = document.getElementById('plate_type').value
		

			//var $plate = $this.find('.form-row.plate:visible').find('table')
			
			plateType = document.getElementById("plate_type");
			console.log(plateType.options[plateType.selectedIndex].value);

			if (plateType.options[plateType.selectedIndex].value == 'plate_6_well'){
				var table = document.getElementById("plate_6_well_table");
			}
			else if (plateType.options[plateType.selectedIndex].value == 'plate_12_well') {
				var table = document.getElementById("plate_12_well_table");
			}
			else if (plateType.options[plateType.selectedIndex].value == 'plate_24_well') {
				var table = document.getElementById("plate_24_well_table");
			}
			var plate_payload={}

		    for (var r = 0, n = table.rows.length; r < n; r++) {
		    	var chr = String.fromCharCode(65 + r)
		        for (var c = 0, m = table.rows[r].cells.length; c < m; c++) {
		            plate_payload[chr+c] = table.rows[r].cells[c].childNodes[0].value;
		        }
    		}
    		console.log(plate_payload);
			

			experiment.plate_type = plateType.options[plateType.selectedIndex].value 
			experiment.plate_payload = plate_payload

			if (document.getElementById("sealed_yes").value=='true')
				experiment.sealed = 'true';
			else
				experiment.sealed = 'false';
			//experiment.sealed = $this.find('input[name=sealed]:checked').val() == 'true'
			experiment.tube_type =  "";
			experiment.tube_payload =  "";

		} else {
			experiment.media_type = 'liquid'
			experiment.tube_payload = document.getElementById("tube_payload").value;

			tubeType = document.getElementById("tube_type");
			experiment.tube_type =  tubeType.options[tubeType.selectedIndex].value;

			experiment.plate_type =  "";
			experiment.plate_payload =  "";
			experiment.sealed = "";
			console.log(tube_payload);
			//experiment.tube = $this.find('#tube_type').val()
		}
		/*
		if ($this.find('input[name=media_type]:checked').val() == 'solid') {
			experiment.media_type = 'solid'
			experiment.plate_type = $this.find('#plate_type').val()
			var load = {}
			var $plate = $this.find('.form-row.plate:visible').find('table')
			$plate.find('tr').each((i, row) => {
				var chr = String.fromCharCode(65 + i)
				$(row).find('td').each((j, td) => {
					load[chr + j] = $(td).find('input[type=text]').val()
				})
			})
			experiment.load = load
			experiment.sealed = $this.find('input[name=sealed]:checked').val() == 'true'
		} else {
			experiment.media_type = 'liquid'
			experiment.tube = $this.find('#tube_type').val()
		}*/
		$('#json_sent').val(JSON.stringify(experiment))
		//	sendTag(experiment)

}//end of collectExperiment

function requestExperiment(){

 console.log("request Called");

 client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayExperiment)
    .catch(console.error)
}


function rewriteNFC(){

	collectExperimentData();

	const query = { "_id": document.getElementById("experiment_id").value };
	const options = { "upsert": false };

	db.collection("UserExperiments")
			.updateOne(query, experiment, options)
			.then(result => {
			    const { matchedCount, modifiedCount } = result;
			    if(matchedCount && modifiedCount) {
			    document.getElementById("datarecordstatus").innerHTML = document.getElementById("_id").value + " <span class='ahref_rewrite_success'> is updated. </span>"
			      console.log(`Successfully updated experiment`)
			    }
			  })
			  .catch(err => console.error(`Failed to add review: ${err}`))

	//console.log("rewriting the experiment")



}


//.find({}, {limit: 1000})

function displayExperiment() {

var query = document.getElementById("experiment_id").value;

db.collection("UserExperiments")
    .find({ "_id": query }, {limit: 1000})
    .toArray()
    .then(docs => {
      var html = docs.map(doc => 
`user_id: ${doc.user_id}, _id: ${doc._id}, start_time: ${doc.start_time}, expiration_date: ${doc.expiration_date}, duration: ${doc.duration}, target_temperature: ${doc.target_temperature}, sensing_type: ${doc.sensing_interval}`);
      document.getElementById("json_received").innerHTML = html;
      console.log(docs);
    });

}

function submitExperiment(){

 console.log("submit Called");

 client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(recordExperiment)
    .catch(console.error)
}



// function recordExperiment(){

// 	_id =  document.getElementById("experiment_id").value;
// 	userid =  document.getElementById("user_id").value;
// 	start = document.getElementById("start_time").value;
// 	expiration = document.getElementById("expiration_date").value;
// 	org_media = "";
// 	temp = document.getElementById("temperature").value;
// 	//volume = document.getElementById("volume").value;
// 	duration = document.getElementById("duration").value;
// 	plateType = document.getElementById("plate_type").value;
// 	tubeType = document.getElementById("tube_type").value;
// 	sensorType = document.getElementById("sensor_type").value;
// 	//payload = document.getElementById("peripheral_payload").value;
// 	payload = {};
// 	interval = document.getElementById("sensing_interval").value;

	
// 	const newRecord = {
// 			"user_id" : userid,
// 			"_id" : _id,//experiment_id
// 			"start_time" : start, 
// 			"expiration_date" : expiration,
// 			"organism_media" : org_media,
// 			"duration" : duration,
// 			"target_temperature" : temp,
// 			"plate_type" : plateType,  
// 			'tube_type': tubeType, 
// 			'sensor_type': sensorType,
// 			'payload': payload,
// 			'sensing_interval': interval,
// 			}; 
			

// 	//collection.find({Name: msg.Name}, {$exists: true}).toArray(function(err, doc) //find if a value exists

// 	//var checkKey = db.collection('UserExperiments').find({"user_id": id}, {$exists: true})
	
// 	/*db.collection('UserExperiments').find({'id': "61F23E1C"}, {$exists: true}).toArray(function(err, doc) //find if a value exists
// 	{     
// 	    if(doc) //if it does
// 	    {
// 	        console.log(doc); // print out what it sends back
// 	    }
// 	    else if(!doc) // if it does not 
// 	    {
// 	        console.log("Not in docs");
// 	    }
// 	});*/


// 	//db.collection("UserExperiments")
// 	//	.insertOne(newRecord)
//   	//	.then(result => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
//   	//	.catch(err => console.error(`Failed to insert item: ${err}`))
// 	db.collection("UserExperiments")
// 		.insertOne(newRecord)
//   		.then(result => {
//   			console.log(`Successfully inserted item with _id: ${result.insertedId}`)
//   			document.getElementById("datarecordstatus").innerHTML = result.insertedId + " recorded successfully";
//   			})
//   		.catch(err => {
//   			if (err.message.indexOf("11000") != -1)
//   				document.getElementById("datarecordstatus").innerHTML = _id + " exists";
//   			console.error(`Failed to insert item: ${err}`)
// 			}
//   			)
// }





// function tableToJson(table) {
//     var data = [];

//     // first row needs to be headers
//     var headers = [];
//     for (var i=0; i<table.rows[0].cells.length; i++) {
//         headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi,'');
//     }

//     // go through cells
//     for (var i=1; i<table.rows.length; i++) {

//         var tableRow = table.rows[i];
//         var rowData = {};

//         for (var j=0; j<tableRow.cells.length; j++) {

//             rowData[ headers[j] ] = tableRow.cells[j].innerHTML;

//         }

//         data.push(rowData);
//     }       

//     return data;
// }

/*
{ "experiment" :
	{
	id: 79E4464,
	"client" : "Lacolombe",
	"location" : 19102,
	"start_time:" : Monday08April2019_09/37/28AM,
	"duration" : 3600,
	"plate_type" : "6_well_plate",
	"load":
	     [
{
		"A1" : organismA",
		"A2" : organismB",
		"A3" : organismC",
		"B1" : organismD",
		"B2" : organismE",
		"B3" : organismF",  
		}
     ],
	"target_temperature" : 37,
	"imaging_frequency" : 3600,
	"end_time": <filled when completed>
	}
}
*/