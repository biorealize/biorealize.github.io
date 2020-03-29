var pubnub = new PubNub({
	subscribeKey: "sub-c-0b2aaa44-a779-11e6-be20-0619f8945a4f",
	publishKey: "pub-c-722b1270-6c2b-423d-98f6-cb21c18a2265",
})

var client;
var db;

jQuery(document).ready(($) => {


	displayOnLoad();

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
			console.log('solid clicked');
			if ($this.attr('id') == 'media_type_solid') {
				$('#peripheral_type_group, #sealed_row').show()
				$('.liquid_input').hide()
				switchPlate()
				var table = $('.plate').filter((i, d) => {
					return $(d).is(':visible')
				})
				table.find('input').eq(0).focus()
				//$('.plate').is(':visible').find('input').eq(0).focus()
			} else {
				$('#peripheral_type_group, .form-row.plate, #sealed_row').hide()
				$('.liquid_input').show()
			}
		}
	})
	
	
	var switchPlate = () => {
		$('.form-row.plate').hide()
		if ($('#media_type_solid').is(':checked')) {
			var plate = $('#peripheral_type').val()
			$('#' + plate).show()
		}
	}
	$('#peripheral_type').change(switchPlate).change()
	
	$('#submit_nfc_form').submit((e) => {
		e.preventDefault()
		var experiment = {}
		var $this = $(e.currentTarget)
		var fields = ['id', 'client', 'location', 'start_time', 'expiration_date', 'duration', 'target_temperature', 'imaging_frequency', 'peripheral_payload' ]
		for (var i = 0; i < fields.length; i++) {
			experiment[fields[i]] = $this.find('#' + fields[i]).val()
		}
		if ($this.find('input[name=media_type]:checked').val() == 'solid') {
			experiment.media_type = 'solid'
			experiment.peripheral_type = $this.find('#peripheral_type').val()
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
			experiment.syringe = $this.find('#syringe').val()
		}
		$('#json_sent').val(JSON.stringify(experiment))
		sendTag(experiment)
	})


	$('#request_nfc_form').submit((e) => {
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

function displayOnLoad(){
	
	  client = stitch.Stitch.initializeDefaultAppClient('experimentdesign-clijb');

	  db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('BR_internal');

	  client.auth.loginWithCredential(new stitch.AnonymousCredential()).then(user =>
	    db.collection('Experiments').updateOne({owner_id: client.auth.user.id}, {$set:{number:42}}, {upsert:true})
	  ).then(() =>
	    db.collection('Experiments').find({owner_id: client.auth.user.id}, { limit: 100}).asArray()
	  ).then(docs => {
	      console.log("Found docs", docs)
	      console.log("[MongoDB Stitch] Connected to Stitch")
	  }).catch(err => {
	    console.error(err)
	  });

}
	
function displayRecordsOnLoad() {
 		clientPromise.then(stitchClient => {
     	client = stitchClient;
     	db = client.service('mongodb', 'mongodb-atlas').db('your-database-name');
     		return client.login().then(displayRecords)
 		});
	}

/*
{ "experiment" :
	{
	id: 79E4464,
	"client" : "Lacolombe",
	"location" : 19102,
	"start_time:" : Monday08April2019_09/37/28AM,
	"duration" : 3600,
	"peripheral_type" : "6_well_plate",
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