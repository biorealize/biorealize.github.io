var db;
var client;
var date;



var tempChartDuration = "2600 hrs";
var tempDataPointsFromDB =[];

$( document ).ready(function() {

    console.log( "ready!" );

	date = new Date();

    client = stitch.Stitch.initializeDefaultAppClient('experimentreport-lbyud');

	db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('BR_internal');


	/*
	client.auth
	    .loginWithCredential(new stitch.AnonymousCredential())
	    .then(generateTempData(3))
	    .catch(console.error)
	*/

});




function getTempData(){

	query = {
				elapsedTime: {
					$gte: 0.1,
					$lt: 2400
					}
				}
	options = {};


	db.collection("UserDeviceData")
	    .find(query, {limit: 1000})
	    .toArray()
	    .then(docs => {
	      //var html = docs.map(doc => `currentTemp: ${doc.currentTemp}`);
	       tempDataPointsFromDB = docs.map(doc => parseInt(`${doc.currentTemp}`));
	      //console.log(tempDataPointsFromDB);
	      renderTemperatureChart();
	    });


} 

function generateTempData(numEntries){

	for(var i=0; i<=numEntries; i++){

		randomData ={}
		randomData.user_id = "rca01";
		randomData.experiment_id = "A935B329"

		if (Math.random()>=0.5)
			direction = 1;
		else
			direction = -1;
		randomData.currentTemp = 28 + Math.floor(Math.random() * 10) * direction;
		randomData.elapsedTime = 0.1 + i;
		randomData.ts = new Date();
		randomData.device_status = "cooling";


		db.collection("UserDeviceData")
		.insertOne(randomData)
			.then(result => {
				console.log(`Successfully inserted item with _id: ${result.insertedId}`)
				})
			.catch(err => {
				console.error(`Failed to insert item: ${err}`)
			})

	}//end of for loop	
}

function renderTemperatureChart(){

	console.log("updateTemperatureChart called")

	tempDataPoints =[]

	tempDataPointsFromDB.forEach(function (arrayItem) {
	 
		tempDataPoints.push({
                x: date.setTime(date.getTime()+ 20000 ), //tempChartUpdateInterval
                y: arrayItem
                })
    	//console.log(arrayItem);
	});

	//console.log(tempDataPointsFromDB.length);
	
	temperatureChart = new CanvasJS.Chart("temperatureChartDiv", {

        zoomEnabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        title: {
            text: "Temperature",
            fontFamily: "helvetica",
            fontSize: 14,
            fontColor: 'rgba(220, 22, 90, .9)',
        },
        axisX: {
            title: "Range:" + tempChartDuration + " ",
            titleFontColor: "dimGrey",
            labelFontColor: "dimGrey",
            titleFontSize: 12,
        },
        axisY:{
            suffix: "°C",
            includeZero: false,
            labelFontColor: "lightGrey",
        }, 
        toolTip: {
            shared: true
        },
        legend: {
            cursor:"pointer",
            verticalAlign: "top",
            fontSize: 22,
            fontColor: "dimGrey"
            //itemclick : toggleDataSeries
        },
        data: [{ 
            type: "spline",
            lineDashType: "shortDash",
            xValueType: "dateTime",
            yValueFormatString: "####.00",
            xValueFormatString: "hh:mm:ss TT",
            showInLegend: false,
            lineColor: 'rgba(220, 22, 90, .9)',
            lineThickness: .7,
            name: "Temperature",
            dataPoints: tempDataPoints
            }]
    });

    temperatureChart.render();
    console.log("chart rendered")
    

}


function requestExperiment(){

 console.log("request Called");

 client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayExperiment)
    .catch(console.error)
}

function displayExperiment() {

	var query = document.getElementById("experiment_id").value;
	console.log(query);

	db.collection("UserExperiments")
	    .find({ "_id": query }, {limit: 1000})
	    .toArray()
	    .then(docs => {
	      var html = docs.map(doc => 
		`<br> <span class="label experiment_id">Experiment ID </span> <span class="label other"> 
		${doc._id} </span><br><br> <span class="label expiration_date">Expiration Date</span><span class="label other">
		${doc.expiration_date}</span><br><br><span class="label organism_media">Organism + Media</span><span class="label other"> <i> organism</i> </span><br><br><span class="label volume">Volume</span><span class="label other"> xxx </span><br><br><span class="label temperature">Temperature</span><span class="label other">
		${doc.target_temperature} </span><br><br><span class="label duration">Duration</span><span class="label other">
		${doc.duration} </span><br><br>`);
		document.getElementById("experiment_info").innerHTML = html;
		console.log(docs);
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