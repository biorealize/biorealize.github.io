			function $c(t) {
				console.log(t);
			}

			
			//set up some constants and global variables
			var BIAS = 20200;			
			var spec_data = {};
			var OD600INDEX = 117;
			var all_elapsed_vals = [], all_optical_densities = [], all_raw_values = [];
			var wavelengths = [];
		
			
			$( document ).ready(function() {
				receive_RAW_SCAN();
				//$('.control_syringe').on('change', set_timestamp_options(event));
				//$('.control_timestring').on('change', plot_all_syringes_over_time);
				$('#syringe1').on('change', plot_all_syringes_over_time);
				$('#wavelength1').on('change', plot_all_syringes_over_time);
				$('#syringe2').on('change', function(e) {
					set_timestamp_options();
					plot_data_for_syringe_at_timestamp(e);
				});
				$('#timestring2').on('change', plot_data_for_syringe_at_timestamp);
			});
			//get data, parse it, and pass it off to graphing functions
			function receive_RAW_SCAN() {
				//dummy spectral data, will be received from MQTT
				$.get(location.origin + '/d3_viz/' + 'MDS_16FEB2018_spectral_samples.dat', function(data, status) {
					raw_data = data;
					//dummy SHOW data, will be retrieved from MQTT
					var SHOW = {specState:6, specReady:1, specDataIndex:158, specBufferFilling:1, video_bias:0, video_max:40000, whiteLED:0, laserLED:0, whitePct:0.00, laserPct:0.00, clockPeriod:14, integrationTime:672, serialNum:"16a00106", A0:3.112979665E+02, B1:2.682851027E+00, B2:-7.479508945E-04, B3:-1.104274866E-05, B4:2.175770976E-08, B5:-1.189582572E-11};
					// make an empty array to hold the wavelength values for each sample
					// load the array with calculated wavelengths, using a 5th order polynomial calculation
					for (var i=1;i<=288;i++) {
						wavelengths.push(SHOW.A0 + SHOW.B1*i + SHOW.B2*parseFloat(i^2) + SHOW.B3*parseFloat(i^3) + SHOW.B4*parseFloat(i^4) + SHOW.B5*parseFloat(i^5));
					}
					
					//use regex to extract info from MQTT result
					var re = /@annotate:Spectral Sample for (\d), date=(.*)\s\(.*\n@spec:RAW_SCAN=\[(.*)\]/gm;
					do {
						var m = re.exec(data);
						if (m) {
							var syringe = m[1].toString();
							if (spec_data[syringe] === undefined) {
								spec_data[syringe] = [];
							}
							//convert date string to UNIX timestamp in seconds
							var ts = new Date(m[2]).getTime() / 1000;
							//convert datapoints to array
							var d = m[3].split(',');
							spec_data[syringe].push({timestamp:ts, dataPoints:d, timeString:m[2]});
							all_raw_values = all_raw_values.concat(d);
						}
					} while (m);
					
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
					set_syringe_options();
					set_wavelength_options();
					set_timestamp_options();
					$c(spec_data);
					
					//plot the first graphs
					$('.control_syringe').trigger('change');
				});
			}
			
			function set_syringe_options() {
				var options = '';
				for (var syringe in spec_data) {
					var selected = options ? '' : ' selected="selected"'; //make first option selected
					options += "<option value='" + syringe + "'" + selected + ">" + syringe + "</option>";
				}
				//set the syringes menu
				$('.control_syringe').html(options);
			}
			
			function set_timestamp_options() {
				var options = '';
				var $syringe = $('.control_timestring').siblings('.control_syringe');
				var syringe = $syringe.val();
				for (var ts in spec_data[syringe]) {
					options += "<option value='" + spec_data[syringe][ts].timeString + "'>" + spec_data[syringe][ts].timeString + "</option>";
				}
				$('.control_timestring').html(options);
			}
			
			function set_wavelength_options() {
				var options = '';
				for (var i = 0; i < wavelengths.length; i++) {
					var selected = i == OD600INDEX ? ' selected="selected"' : ''; //select OD600
					options += "<option value='" + i + "'" + selected + ">" + Math.round(wavelengths[i]) + "</option>";
				}
				$('.control_wavelength').html(options);
			}
			
			//Slow Growth Curve
			function plot_all_syringes_over_time(event) {
				//I could hard-code the chart container div and its controls, but this makes it more flexible: the divs are selected by whatever control triggers this function.
				var $chartContainer = $(event.target).parents('.chartContainer');
				var $syringe = $chartContainer.find('.control_syringe');
				var wavelengthIndex = $chartContainer.find('.control_wavelength').val();
				
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

				for (var syringe in spec_data) {
					if ($syringe.val().indexOf(syringe) < 0) {
						continue;
					}
					g.append("path")
						.datum(spec_data[syringe])
						.attr("class", "line syringe" + syringe)
						.attr("d", line);
				}

		  }
			
			function plot_data_for_syringe_at_timestamp(event) {
				//I could hard-code the chart container div and its controls, but this makes it more flexible: the divs are selected by whatever control triggers this function.
				var $chartContainer = $(event.target).parents('.chartContainer');
				var syringe = $chartContainer.find('.control_syringe').val();
				var timeString = $chartContainer.find('.control_timestring').val();

				var snapshot = spec_data[syringe].filter(function(obj) {
					return obj.timeString == timeString;
				})[0];
				
				$chartContainer.find('svg').remove();
				var svg = d3.select('#' + $chartContainer.attr('id'))
					.insert("svg")
					.attr("class", "spectrometer_data");
				var margin = {top: 20, right: 20, bottom: 50, left: 60};
				var graph_w = $('svg.spectrometer_data').width() - margin.right - margin.left;
				var graph_h = $('svg.spectrometer_data').height() - margin.top - margin.bottom;
				var g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
				//var xDomain = d3.extent([0, spec_data[syringe][0].dataPoints.length]);
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
			
