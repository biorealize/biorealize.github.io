function $c(t) {
	console.log(t);
}


//set up some constants and global variables
var BIAS = 20200;			
var spec_data = {};
var OD600INDEX = 117;
var all_elapsed_vals = [], all_optical_densities = [], all_raw_values = [];
var wavelengths = [];


function handle_RAW_SCAN_response(RAW_SCAN) {
	//dummy SHOW data, will be retrieved from MQTT (I think)
	var SHOW = {specState:6, specReady:1, specDataIndex:158, specBufferFilling:1, video_bias:0, video_max:40000, whiteLED:0, laserLED:0, whitePct:0.00, laserPct:0.00, clockPeriod:14, integrationTime:672, serialNum:"16a00106", A0:3.112979665E+02, B1:2.682851027E+00, B2:-7.479508945E-04, B3:-1.104274866E-05, B4:2.175770976E-08, B5:-1.189582572E-11};

	for (var i=1;i<=288;i++) {
		wavelengths.push(SHOW.A0 + SHOW.B1*i + SHOW.B2 * Math.pow(i,2) + SHOW.B3 * Math.pow(i,3) + SHOW.B4 * Math.pow(i,4) + SHOW.B5 * Math.pow(i,5));
	}
	
	//if we're plotting multiple datasets, this should be the aggregate of them
	all_raw_values = RAW_SCAN;

	var $chartContainer = $('#chartContainer1');
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
		.datum(snapshot.dataPoints)
		.attr("class", "line syringe" + syringe)
		.attr("d", line);
}
			
