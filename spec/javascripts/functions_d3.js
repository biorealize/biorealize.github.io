function $c(t) {
	console.log(t);
}

$( document ).ready(function() {
	calculateWavelengths();
	$('#wavelength1').on('change', plotGrowthCurve);
});

//set up some constants and global variables
var BIAS = 20200;			
var spec_data = {};
var OD650INDEX = 139;
var all_elapsed_vals = [], all_optical_densities = [], all_raw_values = [];
var wavelengths = [];

var google_sheet_id = '1FHydfrAs34V6Be5BVDhmdnkZGCruWiXPVBj_J-fVgt0', google_sheetname = 'Form Responses 1', google_api_key = 'AIzaSyAuvcTlGn_Nwz6wQbksx0Vvc7eyq-DRZAc';
var google_row_index = 2; //starting row of Google Sheet, skips header row

//This will get recalculated whenever the spec is recalibrated?
function calculateWavelengths() {
	//dummy SHOW data, will be retrieved from MQTT (I think)
	var SHOW = {specState:6, specReady:1, specDataIndex:158, specBufferFilling:1, video_bias:0, video_max:40000, whiteLED:0, laserLED:0, whitePct:0.00, laserPct:0.00, clockPeriod:14, integrationTime:672, serialNum:"16a00106", A0:3.112979665E+02, B1:2.682851027E+00, B2:-7.479508945E-04, B3:-1.104274866E-05, B4:2.175770976E-08, B5:-1.189582572E-11};

	for (var i=1;i<=288;i++) {
		wavelengths.push(SHOW.A0 + SHOW.B1*i + SHOW.B2 * Math.pow(i,2) + SHOW.B3 * Math.pow(i,3) + SHOW.B4 * Math.pow(i,4) + SHOW.B5 * Math.pow(i,5));
	}
	set_wavelength_options();
}

function set_wavelength_options() {
	var options = '';
	for (var i = 0; i < wavelengths.length; i++) {
		var selected = i == OD650INDEX ? ' selected="selected"' : ''; //select OD600
		options += "<option value='" + i + "'" + selected + ">" + Math.round(wavelengths[i]) + "</option>";
	}
	$('.control_wavelength').html(options);
}



function updateGrowthCurve() {
	$.get("https://sheets.googleapis.com/v4/spreadsheets/" + google_sheet_id + "/values/'" + google_sheetname + "'!" + google_row_index + ":100000?key=" + google_api_key, function(data, status) {
		//if no new data (or no data at all), return
		if (data.values === undefined) {
			return;
		}
		//only select new rows in each query
		google_row_index += data.values.length;
		var syringe, row;
		for (var i in data.values) {
			row = data.values[i];
			timeString = row[0];
			var ts = new Date(timeString).getTime() / 1000;
			syringe = parseInt(row[1]);
			if (spec_data[syringe] === undefined) {
				spec_data[syringe] = [];
			}
			var dataPoints = row.slice(2);
			//dang race condition: if the script on the Google Sheet hasn't finished splitting the string, we need to do it here.
			if (dataPoints.length == 1) {
				dataPoints = JSON.parse(dataPoints);
			}
			spec_data[syringe].push({timestamp:ts, dataPoints:dataPoints, timeString:timeString});
		}
		//calculate OD, elapsed time for each timestamp for each syringe
		//to calculate the x and y domains properly, we need an array of all values for all syringes
		for (var syringe in spec_data) {
			for (var i=0; i<spec_data[syringe].length; i++) {
				var elapsed = (spec_data[syringe][i].timestamp - spec_data[syringe][0].timestamp) / 60;
				spec_data[syringe][i].elapsed = elapsed;
				all_elapsed_vals.push(elapsed);
				
				spec_data[syringe][i].opticalDensities = [];
				for (var j=0; j<spec_data[syringe][i].dataPoints.length; j++) {
					var OD = Math.max(-Math.log10((spec_data[syringe][i].dataPoints[j] - BIAS) / (spec_data[syringe][0].dataPoints[j] - BIAS)), 0);
					spec_data[syringe][i].opticalDensities.push(OD);
					all_optical_densities.push(OD);
				}
			}
		}
		$c(spec_data);
		plotGrowthCurve();
	});
}

function plotGrowthCurve() {
	var $chartContainer = $('#chartContainer1');
	$chartContainer.show();
	var wavelengthIndex = $chartContainer.find('.control_wavelength').val();
	var syringe = 1;

	$chartContainer.find('svg').remove();
	var svg = d3.select('#' + $chartContainer.attr('id'))
		.insert("svg")
		.attr("class", "spectrometer_data");
	var margin = {top: 20, right: 20, bottom: 50, left: 50};
	var graph_w = $('svg.spectrometer_data').width() - margin.right - margin.left;
	var graph_h = $('svg.spectrometer_data').height() - margin.top - margin.bottom;
	var g = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var xDomain = d3.extent(all_elapsed_vals);
	var yDomain = d3.extent(all_optical_densities);
						
	var x = d3.scaleLinear()
		.rangeRound([0, graph_w])
		.domain(xDomain);						

	var y = d3.scaleLinear()
		.rangeRound([graph_h, 0])
		.domain(yDomain);

	var xAxis = d3.axisBottom(x)
	var yAxis = d3.axisLeft(y)				
		.ticks(yDomain[1] * 5);
		
	//https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
	function make_x_gridlines() {
		return d3.axisBottom(x);
	}

	function make_y_gridlines() {
		return d3.axisLeft(y)
			.ticks(yDomain[1] * 5);
	}

	// add the X gridlines
	  g.append("g")			
		  .attr("class", "grid")
		  .attr("transform", "translate(0," + graph_h + ")")
		  .call(make_x_gridlines()
			  .tickSize(-graph_h)
			  .tickFormat("")
		  );

	  // add the Y gridlines
	  g.append("g")			
		  .attr("class", "grid")
		  .call(make_y_gridlines()
			  .tickSize(-graph_w)
			  .tickFormat("")
		  );
	
	
	g.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graph_h + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "middle")
		.attr("y", 0)
		.attr("dy", "3em")
		.attr("x", graph_w/2)
		.text("Elapsed Time, Minutes");

	g.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "middle")
		.attr("y", 0)
		.attr("dy", "-3em")
		.attr("x", -graph_h/2)
		.attr("transform", "rotate(-90)")
		.text("Absorbance at " + Math.round(wavelengths[wavelengthIndex]) + " nm");


	var line = d3.line()
		.x(function(d) { return x(d.elapsed); })
		.y(function(d) { return y(d.opticalDensities[wavelengthIndex]); });

	g.append("path")
		.datum(spec_data[syringe])
		.attr("class", "line syringe" + syringe)
		.attr("d", line);

}

function handle_RAW_SCAN_response(RAW_SCAN) {
	//if we're plotting multiple datasets, this should be the aggregate of them
	all_raw_values = RAW_SCAN;

	var $chartContainer = $('#chartContainer2');
	$chartContainer.show();
	var syringe = 1;//hard coded for now

	$chartContainer.find('svg').remove();
	var svg = d3.select('#' + $chartContainer.attr('id'))
		.insert("svg")
		.attr("class", "spectrometer_data");

	var margin = {top: 20, right: 20, bottom: 50, left: 60};
	var graph_w = $('svg.spectrometer_data').width() - margin.right - margin.left;
	var graph_h = $('svg.spectrometer_data').height() - margin.top - margin.bottom;
	var g = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	var xDomain = d3.extent(wavelengths);
	var yDomain = d3.extent(all_raw_values);
	
	var x = d3.scaleLinear()
		.rangeRound([0, graph_w])
		.domain(xDomain);						

	var y = d3.scaleLinear()
		.rangeRound([graph_h, 0])
		.domain(yDomain);

	var xAxis = d3.axisBottom(x)
	var yAxis = d3.axisLeft(y);
		
	//https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
	function make_x_gridlines() {
		return d3.axisBottom(x);
	}

	function make_y_gridlines() {
		return d3.axisLeft(y);
	}

	// add the X gridlines
	  g.append("g")			
		  .attr("class", "grid")
		  .attr("transform", "translate(0," + graph_h + ")")
		  .call(make_x_gridlines()
			  .tickSize(-graph_h)
			  .tickFormat("")
		  );

	  // add the Y gridlines
	  g.append("g")			
		  .attr("class", "grid")
		  .call(make_y_gridlines()
			  .tickSize(-graph_w)
			  .tickFormat("")
		  );
	
	
	g.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + graph_h + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "x label")
		.attr("text-anchor", "middle")
		.attr("y", 0)
		.attr("dy", "3em")
		.attr("x", graph_w/2)
		.text("Wavelength");

	g.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "y label")
		.attr("text-anchor", "middle")
		.attr("y", 0)
		.attr("dy", "-4em")
		.attr("x", -graph_h/2)
		.attr("transform", "rotate(-90)")
		.text("AD Count");


	var line = d3.line()
		.x(function(d, i) { return x(wavelengths[i]); })
		.y(function(d) { return y(d); });

	g.append("path")
		.datum(all_raw_values)
		.attr("class", "line syringe" + syringe)
		.attr("d", line);

}
			
