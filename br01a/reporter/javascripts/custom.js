var db;
var client;
var date;
var imgFileNames;
var imgFileLocations;


var tempChartDuration = " 2400 secs";
var tempDataPointsFromDB =[];
var tempDatePointsFromDB = [];
//var imgFileNames;
//var imgFileLocations;

$( document ).ready(function() {

    console.log( "ready!" );

	date = new Date();

    client = stitch.Stitch.initializeDefaultAppClient('experimentreport-lbyud');

	db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('BR_internal');

	
	//document.getElementById("img_range_from").value = date.toISOString();
	//date.setMinutes(2400);
	//document.getElementById("img_range_to").value = date.toISOString();

	
	client.auth
	    .loginWithCredential(new stitch.AnonymousCredential())
	    .then(findFirstImgEntry)
	    .then(findLastImgEntry)
	    //.then(generateImgData())
	    //.then(generateTempData(3))
	    .catch(console.error)
	

});




function getTempData(){

	timeRangeFrom = document.getElementById("temp_range_from").value;
	timeRangeTo = document.getElementById("temp_range_to").value;

	query = {
				"elapsed_time": {
					$gte: parseFloat(timeRangeFrom),
					$lt: parseInt(timeRangeTo)
					}
				}
	options = {};
	//console.log ("getTempData called")

	db.collection("UserDeviceData")
	    .find(query, {limit: 1000})
	    .toArray()
	    .then(docs => {
	      //var html = docs.map(doc => `currentTemp: ${doc.currentTemp}`);
	       tempDataPointsFromDB = docs.map(doc => parseFloat(`${doc.current_temp}`));
	       tempDatePointsFromDB = docs.map(doc => `${doc.ts}`);
	      //console.log(tempDataPointsFromDB);
	      renderTemperatureChart();
	    });


} 

function generateImgData(){

	imgList = ["Thursday05March2020_03/35/29PM",
				"Wednesday11March2020_11/10/49AM",
				"Tuesday03March2020_05/04/57PM",
				"Tuesday03March2020_05/04/09PM",
				"Tuesday03March2020_05/01/48PM"];

	for (var i = 0; i < imgList.length; i++) {

			randomData ={}

			newDate = new Date();
			randomData._id = newDate;
			randomData.user_id = "rca01";
			randomData.experiment_id = "61F23E1C";
			randomData.image_type = ".png";
			randomData.file_name = imgList[i];
			randomData.file_location = "https://raw.githubusercontent.com/biorealize/biorealize.github.io/master/br01a/secure/32257200d0c20fa83c570f1d4fd414c18253d2cc/data/";

			db.collection("UserImgs")
			.insertOne(randomData)
				.then(result => {
					console.log(`Successfully inserted item with _id: ${result.insertedId}`)
					})
				.catch(err => {
					console.error(`Failed to insert item: ${err}`)
				})

			//The entries are paced a minute apart
			newDate.setMinutes(i);

		}//end of for loop	

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

	for(var i=0; i<tempDataPointsFromDB.length;i++){

		//console.log(tempDatePointsFromDB[i]);
		tempDataPoints.push({
                x: new Date(tempDatePointsFromDB[i]), //tempChartUpdateInterval
                y: tempDataPointsFromDB[i]
                })
    	//console.log(arrayItem);
	}

	//console.log(tempDataPointsFromDB.length);
	
	temperatureChart = new CanvasJS.Chart("temperatureChart", {

        zoomEnabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        title: {
            text: "Temperature",
            fontFamily: "helvetica",
            fontSize: 14,
            fontColor: 'rgba(220, 22, 90, .9)',
        },
        axisX: {
            //title: "Range:" + tempChartDuration + " ",
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

function findFirstImgEntry(){

	db.collection("UserImgs")
		.find({}, {limit: 1, sort: {$natural:1} })
	    .toArray()
	    .then(docs => {
	       firstImageName = docs.map(doc => `${doc._id}`);
	       //console.log(firstImageName);

	       	//remove the Eastern Standard Time from the date
	      	/*
	      	var index = firstImageName[0].indexOf("GMT");

			if(~index) {
			  str = firstImageName[0].substr(0, index);
			}*/
			d = new Date(firstImageName[0]).toLocaleString('en-US');
			//console.log(d);
	      document.getElementById("img_range_from").value = d;
	    });

}

function findLastImgEntry(){

	db.collection("UserImgs")
		.find({}, {limit: 1, sort: {$natural:-1} })
	    .toArray()
	    .then(docs => {
	       lastImageName = docs.map(doc => `${doc._id}`);
	       //console.log(lastImageName);

	      	//remove the Eastern Standard Time from the date
	      	
	      	/*
	      	var index = lastImageName[0].indexOf("GMT");
			
			if(~index) {
			  str = lastImageName[0].substr(0, index);
			}*/

			d = new Date(lastImageName[0]).toLocaleString('en-US');
			//console.log(d);
	      document.getElementById("img_range_to").value = d;
	    });

}

function renderExperimentImgs(){


	client.auth
	    .loginWithCredential(new stitch.AnonymousCredential())
	    .catch(console.error)

	//https://steveridout.github.io/mongo-object-time/
	exp_id = document.getElementById("experiment_id").value;

	/*
	query = { "experiment_id": exp_id,
			  "_id" : {
			  		"$gte": new Date("2015-07-07T00:00:00.000Z"),
			        "$lt": new Date("2020-07-08T00:00:00.000Z")}
			}
	*/
	//console.log(new Date(document.getElementById("img_range_from").value))
	query = { "experiment_id": exp_id,
			  "_id" : {
			  		"$gte": new Date(document.getElementById("img_range_from").value),
			        "$lt": new Date(document.getElementById("img_range_to").value)}
			}

	db.collection("UserImgs")
	    .find(query, {limit: 1000})
	    .toArray()
	    .then(docs => {
	       imgFileNames = docs.map(doc => `${doc.file_name}`);
	       imgFileLocations = docs.map(doc => `${doc.file_location}`);
	       visualizePreviews();
	    })
	    ;

	    //console.log(imgFileNames.length);

}

function visualizeTemperature(){

	getTempData();

}
function loadLatestAnalysis(){

	var transImage = document.getElementById("trans_gif");
	var latestAnalysisImage = document.getElementById("latest_analysis_img");
	latestAnalysisImage.src = "images/6well_inv.png"; //adding a cache breaker to the end
	latestAnalysisImage.width = 256;
	latestAnalysisImage.height = 192;	

	console.log("latest analysis loaded");

}
//Wednesday15April2020_07:21:15PM.png
function visualizePreviews(){


	var html = "";
	
	//console.log(imgFileNames.length);

	for (var i = 0; i < imgFileNames.length; i++) {

		var data = String(imgFileNames[i]);

		var url = data.split("/")[2]+"";
        //formatted_url = url.split(' ').join('%20');
        //console.log(imgFileNames[i]);
        //formatted_url = data.replace(/\//g, '%3A');
        formatted_url = data.replace(/\//g, ':');
		//console.log(String(imgFileLocations[0]) + formatted_url + ".png");
		//console.log(String(imgFileLocations[0]) + formatted_url + ".png");

		if (formatted_url.indexOf("Bad") == -1)
			html += "<img id=loading_"+ String(imgFileNames[i]) +" class='preview_imgs' src="+ String(imgFileLocations[0]) + formatted_url + " >";
	 	
	 	//console.log(String(imgFileLocations[0]) + url + ".png");
	}
	
	document.getElementById("experiment_images").innerHTML = html;


	/*
	imgFileNames.forEach(function (arrayItem) {

		var data = String(arrayItem);

		var url = data.split("/")[2]+"";
        //formatted_url = url.split(' ').join('%20');
        //console.log(arrayItem);
        //formatted_url = data.replace(/\//g, '%3A');
        formatted_url = data.replace(/\//g, ':');
		//console.log(formatted_url);

	 	html += "<img id=loading"+ String(arrayItem) +" class='preview_imgs' src="+ String(imgFileLocations[0]) + formatted_url + ".png";
	 	//console.log(String(imgFileLocations[0]) + formatted_url + ".png");
	 	//console.log(String(imgFileLocations[0]) + url + ".png");

	});
	*/

	
	//console.log(html);	

//ttps://raw.githubusercontent.com/biorealize/biorealize.github.io/master/br01a/secure/32257200d0c20fa83c570f1d4fd414c18253d2cc/data/Tuesday03March2020_05%3A08%3A04PM.png

}

function reloadButtonsEnable(visible){

	if (visible==true){
		document.getElementById("experiment_imgs_settings").style="display:visible";
		document.getElementById("loadPreviewsButton").value="->";

		document.getElementById("temp_graph_settings").style="display:visible";
		document.getElementById("loadPreviewsButton").value="->";
    }
    else{
		document.getElementById("loadPreviewsButton").value="";
		document.getElementById("experiment_imgs_settings").style="display:none";

		document.getElementById("temp_graph_settings").style="display:none";
		document.getElementById("loadPreviewsButton").value="";

    }

}

function reportExperiment(){

 console.log("request Called");

 client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayExperimentInfo)
    .then(getTempData)
    .then(loadLatestAnalysis)
    .then(reloadButtonsEnable(true)) 
    //.then(renderExperimentImgs)
    .catch(console.error)
}

function displayExperimentInfo() {

	var query = document.getElementById("experiment_id").value;
	console.log(query);

	db.collection("UserExperiments")
	    .find({ "_id": query }, {limit: 1000})
	    .toArray()
	    .then(docs => {
	      var html = docs.map(doc => 
		`<br> <span class="label experiment_id">Experiment ID </span> <span class="label other"> 
		${doc._id} </span><br><br> <span class="label expiration_date">Expiration Date</span><span class="label other">
		${doc.expiration_date}</span><br><br><span class="label organism_media">Organism + Media</span><span class="label other">
		${doc.media_type}</span><br><br><span class="label volume">Volume</span><span class="label other"> 
		${doc.plate_type}</span><br><br><span class="label temperature">Temperature</span><span class="label other">
		${doc.target_temp} </span><br><br><span class="label duration">Duration</span><span class="label other">
		${doc.duration} </span><br><br>`);

	    var duration = docs.map(doc => parseInt(`${doc.duration}`));

	    document.getElementById("temp_range_to").value = duration[0];
	    //console.log(duration[0]);
		document.getElementById("experiment_info").innerHTML = html;
		//console.log(docs);
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