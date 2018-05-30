        
        var ws;
        var wsUri = "ws:";
        var loc = window.location;

        var client;
        
        var topicName = "@spec";

        var topicPrefix = "InteractiveCommand.";

        var currentExperimentNo = 1;
        var specSamplingDuration = '10:00'

        var syringeProxyPrefix = '@i2cSerialProxy' ;  
        var electroporatorPrefix = '@electroporator';
        var purifierPrefix = '@purifier'; 

        var wheelPrefix = '@IncubatorWheel';
        var pumpPrefix = '@mediapump';
        var carouselPrefix = '@carousel';
        var heaterPrefix = '@heater';
        var specPrefix = '@spec';
        var tempPrefix = '@temp'; 

        var incubatorPrefix = '@incubator' ;

        var mds;
        var frame;
        var wheel_group;
        var wheel;
        var mds_g;
        var wheel_angle = 0 ;
        var wheel_xPos = 190;
        var wheel_yPos = 22;

        var machineDriveEnabled;

        var syringe1;
        var syringe2;
        var syringe5;
        var syringe6;
        var mediaCarousel;
        var organismCarousel;
        var electroporatorLid; 

        var msgToWeb;

        console.log(loc);



        /*
        if (loc.protocol === "https:") { wsUri = "wss:"; }
        // This needs to point to the web socket in the Node-RED flow
        // ... in this case it's ws/simple
        //wsUri += "//" + loc.host + loc.pathname.replace("simple","ws/MicrobialDesignStudio ");
        wsUri = "ws://" + loc.host + "/ws/MicrobialDesignStudio";
        wsUri = wsUri.replace(":3000",":1880");

        if (wsUri == "ws:///ws/MicrobialDesignStudio"){
            wsUri = "ws://162.243.1.23:1880/ws/MicrobialDesignStudio"; //Droplet URL
            //wsUri = "ws://192.168.128.15:1880/ws/MicrobialDesignStudio";
        }
        */
        
        //When page served through localhost
        //wsUri = "ws://127.0.0.1:1880/ws/MicrobialDesignStudio";
        //When pi is remotely accessed
        //wsUri = "ws://10.251.138.240:1880/ws/MicrobialDesignStudio";
        //wsUri += "//" + loc.host + loc.pathname.replace("simple","ws/MicrobialDesignStudio ");
        //wsUri += "//" + loc.host.replace(':3000', ':1880') + loc.pathname.replace("simple","ws/MicrobialDesignStudio ");
       //wsUri += "//" + '127.0.0.1:1880' + loc.pathname.replace("simple","ws/MicrobialDesignStudio ");

       /*
        function wsConnect() {
            console.log("connect",wsUri);
            ws = new WebSocket(wsUri);
            //var line = "";    // either uncomment this for a building list of messages
            /*
            ws.onmessage = function(msg) {
                var line = "";  // or uncomment this to overwrite the existing message
                // parse the incoming message as a JSON object
                var data = msg.data;
                //console.log(data);
                // build the output from the topic and payload parts of the object
                line += "<p>"+data+"</p>";
                // replace the messages div with the new "line"
                document.getElementById('messages').innerHTML = line;
                //ws.send(JSON.stringify({data:data}));
            }
            
            ws.onmessage = function(msg) {
                    var line = "";  // or uncomment this to overwrite the existing message
                    // parse the incoming message as a JSON object
                    var data = msg.data;
                    
                    // pay attention to the message only if it is part of the @spec topic
                    
                    if ((topicName == specPrefix) && (data.indexOf(topicName)) == 0 ){
                    
                       // strip the topic prefix off the message
                        data = data.substr(topicName.length, data.length);
                        
                        // If there is a name and an "=", then the message is a JSON payload that needs a special handler
                        // the left of the '=' is the name of the handler function, 
                        // and the right of the '=' is a JSON statement that has the on which the handler will act
                        var eqAt = data.search('=');
                        if (eqAt > 0){
                            // Get the var name
                            // for example, a message like "TEST={x:1,y:2,z:3"} will yield a var named "TEST"
                            var varName = data.substr(0,eqAt);
                            
                            // convert the JSON into a local value
                            // whose name matches varName
                            var functionArg = eval(data);
                            
                            // build up a statement that will invoke the handler function,
                            // passing the structure as an argument
                            // for example, a message like "TEST={x:1,y:2,z:3"} 
                            // will cause evalExpression to have the value 'handle_TEST_response(TEST)'
                            // which, when evaluated, will pass the TEST object to the handle_TEST function
                            var evalExpression = "handle_" + varName + "_response(" + varName + ")" 
                            eval(evalExpression);
                            
                        }
                        else{
                            //console.log(data);
                            // build the output from the topic and payload parts of the object
                            line += "<p>"+data+"</p>";
                            // replace the messages div with the new "line"
                            document.getElementById('messages').innerHTML = line;
                            //ws.send(JSON.stringify({data:data}));
                        }
                    }

                    
                    else if ((topicName == incubatorPrefix) && (data.indexOf(topicName)) == 0 ){ 
                        
                        data = data.substr(topicName.length, data.length);
                        
                        var temp = data;
                        msgToWeb = 'Incubator <b> '+ temp +'</b>' ;
        
                        sendInterfaceMessage( msgToWeb, '' );
                    }
                        
                }
            ws.onopen = function() {
                // update the status div with the connection status
                document.getElementById('status').innerHTML = 'Connected to ' + '<b>'+ wsUri+'</b>';
                //ws.send("Open for data");
                console.log("connected");
            }
            ws.onclose = function() {
                // update the status div with the connection status
                document.getElementById('status').innerHTML = "not connected";
                // in case of lost connection tries to reconnect every 3 secs
                setTimeout(wsConnect,3000);
            }
        }
        */

        /*Sets the MQTT credentials*/

        function setMQTTCredentionals(){


            serverName = document.getElementById('server').value;
            portNo = document.getElementById('port').value;
            userName = document.getElementById('username').value;
            password = document.getElementById('password').value;

            client = new Paho.MQTT.Client(serverName, parseInt(portNo), "web_" + parseInt(Math.random() * 100, 10));//

            client.onConnectionLost = onConnectionLost;
            client.onMessageArrived = onMessageArrived;

            var options = {
                useSSL: true,
                //userName: "buwynvxd",
                userName: userName, //"bpbgifio",
                password: password, //"TaxZFQ5IkTjE",
                //password: "AhFmFn2ibFAS",
                onSuccess:onConnect,
                onFailure:doFail
              }

            client.connect(options);

            sendInterfaceMessage( 'Connected to Server', '');
        }

        function connectPlatformButtonFunction(){

            setMQTTCredentionals();
            hideServerSettings();

        }

        function hideServerSettings() {
            var x = document.getElementById("serverSettingsDisplayBox");
            var y = document.getElementById("status");
            if (x.style.display === "none") {
                x.style.display = "block";
                y.style.display = "none";
            } else {
                x.style.display = "none";
                y.style.display = "block";
            }
        } 

            // handler for SHOW response
        function handle_SHOW_response(arg){
                for(var propt in SHOW){
                    var textBox;
                    textBox = document.getElementById(propt);
                    if( textBox === null){}
                    else{
                        textBox.value = eval('arg.' + propt);
                    }
                }
            }


			function $c(t) {
				console.log(t);
			}

            
			//set up some constants and global variables
			var BIAS = 20200;			
			var spec_data = {};
			var OD600INDEX = 117;
			var allXVals = [], allYVals = [];
		
			
			//get data, parse it, and pass it off to graphing functions
            function receive_RAW_SCAN() {
				//dummy spectral data, will be received from MQTT
				$.get(location.href + 'MDS_16FEB2018_spectral_samples.dat', function(data, status) {
            		raw_data = data;
            		//dummy SHOW data, will be retrieved from MQTT
            		var SHOW = {specState:6, specReady:1, specDataIndex:158, specBufferFilling:1, video_bias:0, video_max:40000, whiteLED:0, laserLED:0, whitePct:0.00, laserPct:0.00, clockPeriod:14, integrationTime:672, serialNum:"16a00106", A0:3.112979665E+02, B1:2.682851027E+00, B2:-7.479508945E-04, B3:-1.104274866E-05, B4:2.175770976E-08, B5:-1.189582572E-11};
            		// make an empty array to hold the wavelength values for each sample
					var wl=[];
					// load the array with calculated wavelengths, using a 5th order polynomial calculation
					for (var i=1;i<=288;i++) {
						wl.push(SHOW.A0 + SHOW.B1*i + SHOW.B2*i^2 + SHOW.B3*i^3 + SHOW.B4*i^4 + SHOW.B5*i^5);
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
            				spec_data[syringe].push({timestamp:ts, dataPoints:d});
            			}
            		} while (m);
            		
            		//calculate OD, elapsed time for each timestamp for each syringe
            		//to calculate the x and y domains properly, we need an array of all values for all syringes
					for (var syringe in spec_data) {
						for (var i=0; i<spec_data[syringe].length;i++) {
							var OD = Math.max(-Math.log10((spec_data[syringe][i].dataPoints[OD600INDEX] - BIAS) / (spec_data[syringe][0].dataPoints[OD600INDEX] - BIAS)), 0);
							spec_data[syringe][i].OD600 = OD;
							allYVals.push(OD);
							
							var elapsed = (spec_data[syringe][i].timestamp - spec_data[syringe][0].timestamp) / 60;
							spec_data[syringe][i].elapsed = elapsed;
							allXVals.push(elapsed);
						}
					}					
					plot_all_syringes_over_time();
					
         	  	});
            }
            
            function plot_all_syringes_over_time() {
            	d3.select('#chartContainer')
					.select("svg")
					.remove();
				var svg = d3.select('#chartContainer')
					.insert("svg")
					.attr("class", "spectrometer_data");
				var margin = {top: 20, right: 20, bottom: 50, left: 50};
				var graph_w = $('svg.spectrometer_data').width() - margin.right - margin.left;
				var graph_h = $('svg.spectrometer_data').height() - margin.top - margin.bottom;
				var g = svg.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
				var xDomain = d3.extent(allXVals);
				var yDomain = d3.extent(allYVals);
									
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
					//.attr("transform", "translate(" + graph_w + ", 0)")
					.call(yAxis)
					.append("text")
					.attr("class", "y label")
					.attr("text-anchor", "middle")
					.attr("y", 0)
					.attr("dy", "-3em")
					.attr("x", -graph_h/2)
					.attr("transform", "rotate(-90)")
					.text("Absorbance at 600 nm");


				var line = d3.line()
					.x(function(d) { return x(d.elapsed); })
					.y(function(d) { return y(d.OD600); });

				for (var syringe in spec_data) {
					g.append("path")
						.datum(spec_data[syringe])
						.attr("class", "line syringe" + syringe)
						.attr("d", line);
				}

          }
            
            /* DEMO CODE DISPLAYING VARIOUS GRAPHS */
            function plot_data_for_syringe_at_timestamp(syringe, timestamp) {
				//dummy spectral data, will be received from MQTT
				$.get(location.href + 'MDS_16FEB2018_spectral_samples.dat', function(data, status) {
				});
            }
            
			function handle_RAW_SCAN_response(RAW_SCAN){
                var dataPoints=[];
                for (var i = 0; i < RAW_SCAN.length; i++) { 
                    dataPoints.push({y:RAW_SCAN[i]});
                }
                
                
                var chrt = document.getElementById('chartContainer');
                //var chart = new CanvasJS.Chart("chartContainer", {
                var chart = new CanvasJS.Chart(chrt, {

                    theme: "theme2",//theme1

                    title:{
                        text: "Raw Spectrum",
                        fontFamily: 'Arial',
                        fontWeight: 'light',              
                    },
          
                      axisX:{
                        title: 'Wavelength',
                        titleFontFamily: 'Arial',
                        tickThickness: 1,
                        tickLength: 5,
                        gridThickness: 1,
                        lineThickness: 1

                      },

                      axisY:{
                        title: "AD count",
                        titleFontFamily: 'Arial',
                        tickThickness: 1,
                        tickLength: 5,
                        gridThickness: 1,
                        lineThickness: 1


                      },
                    animationEnabled: true,   // change to true
                    

                    data: [              
                    {
                        // Change type to "bar", "area", "spline", "pie",etc.
                        //type: "splineArea",
                        type: "line",
                        lineThickness: 1,
                        dataPoints: dataPoints
                    }
                    ]
                });
                chart.render();
            }       
        
        function handleDriveMachineCheckboxClick(cb){
            
            machineDriveEnabled = cb.checked;
            msgToWeb = 'Machine Enable: ' + machineDriveEnabled ;
            sendInterfaceMessage( msgToWeb, '');

        }
           
        function initPlatformButtonFunction(){

            msgToWeb = 'Initializing Platform' ;
            //msgToMachine = topicPrefix +':'+ 'Init' + ';' ; Interactive
            //msgToMachine = topicPrefix + 'Init()'
            //sendInterfaceMessage( msgToWeb, msgToMachine  );
            //sendMachineMessage( msgToMachine  );

            //animateWheel(180, 1000);
            //animateWheel(360, 4000);
            //animateWheel(0, 1000);
            
            msgToMachine = topicPrefix + 'Init()';
            sendInterfaceMessage( msgToWeb, msgToMachine  );

            if (machineDriveEnabled)
                sendMachineMessage( msgToMachine  );

            //sendMachineMessage( msgToMachine  );
            //sendInterfaceMessage( msgToWeb, msgToMachine  );
            //InteractiveCommand.Agitate(1)
        } 



        function loadMediaButtonFunction(){


        currentExperimentNo = $("#selectExperimentMenu").children(":selected").attr("value");

        msgToWeb = 'Experiment <b> '+ currentExperimentNo + '</b> is ' + '<b>'+ 'starting' + '</b>' ;
        //msgToMachine = topicPrefix + ':' + 'Run' + ' ' + currentExperimentNo +';' ;


        if (currentExperimentNo=='1'){
            animateWheel(180, 1000);
            moveMediaTube(0,1000);    
        }
        else if (currentExperimentNo=='2'){
            animateWheel(135, 1000);
            moveMediaTube(45,1000);
        }
        else if (currentExperimentNo=='5'){
            animateWheel(0, 1000);
            moveMediaTube(180,1000);
        }
        else if (currentExperimentNo=='6'){
            animateWheel(315, 2000);
            moveMediaTube(225,1000);
        }

        
        //if (currentExperimentNo!=0)
        //    currentExperimentNo -= 1;
        
        msgToMachine = topicPrefix + 'LoadMedia('+ currentExperimentNo + ')';

        sendInterfaceMessage( msgToWeb, msgToMachine  );

        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );
        
        }

        function runExperimentButtonFunction(){

        currentExperimentNo = $("#selectExperimentMenu").children(":selected").attr("value");

        msgToWeb = 'Loading <b>  Media </b> to Experiment <b> '+ currentExperimentNo + '</b>' ;
        
        //msgToMachine = topicPrefix + ':' + 'LoadMedia' + ' ' + currentExperimentNo +';' ;


        if (currentExperimentNo=='1'){
            moveSyringeToMedia(syringe1, 500);
        }
        else if (currentExperimentNo=='2'){
            moveSyringeToMedia(syringe2, 500);
        }
        else if (currentExperimentNo=='5'){
            moveSyringeToMedia(syringe3, 500);
        }
        else if (currentExperimentNo=='6'){
            moveSyringeToMedia(syringe4, 500);
        }


        if (currentExperimentNo!=0)
            currentExperimentNo -= 1;

        msgToMachine = topicPrefix + 'LoadMedia(' + currentExperimentNo + ')';


        sendInterfaceMessage( msgToWeb, msgToMachine  );

        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );
        
        }


        function loadOrganismButtonFunction(){

        currentExperimentNo = $("#selectExperimentMenu").children(":selected").attr("value");

        msgToWeb = 'Loading <b> Organism </b> for Experiment <b> '+ currentExperimentNo + '</b>' ;
        //msgToMachine = topicPrefix + ':' + 'LoadOrganism' + ' ' + currentExperimentNo +';' ;


        //if (currentExperimentNo!=0)
        //    currentExperimentNo -= 1;

        msgToMachine = topicPrefix + 'LoadOrganism(' + currentExperimentNo + ')';

        sendInterfaceMessage( msgToWeb, msgToMachine  );


        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );
        
        }


        function startChangeSyringeButtonFunction(){

        currentExperimentNo = $("#selectExperimentMenu").children(":selected").attr("value");

        msgToWeb = 'Changing <b> Syringe </b> for Experiment <b> '+ currentExperimentNo + '</b>' ;

        //if (currentExperimentNo!=0)
        //    currentExperimentNo -= 1;

        msgToMachine = topicPrefix + 'StartChangeSyringe(' + currentExperimentNo + ')';

        sendInterfaceMessage( msgToWeb, msgToMachine  );
        
        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );

        }

        function finishChangeSyringeButtonFunction(){

        currentExperimentNo = $("#selectExperimentMenu").children(":selected").attr("value");

        msgToWeb = 'Placing back <b> Syringe </b> for Experiment <b> '+ currentExperimentNo + '</b>' ;
       
        //if (currentExperimentNo!=0)
        //    currentExperimentNo -= 1;

        msgToMachine = topicPrefix + 'FinishChangeSyringe(' + currentExperimentNo + ')';

        sendInterfaceMessage( msgToWeb, msgToMachine  );

        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );
        }

        function setTempButtonFunction(){

        newTemp = $("#incubateTempratureMenu").children(":selected").attr("value");

        msgToWeb = 'Incubator temp set to <b> '+ newTemp  + '</b>' ;
        msgToMachine = '@heater:set_temp_sp ' + newTemp + ';';  

        sendInterfaceMessage( msgToWeb, msgToMachine  );

        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );
        
        }

        function getTempFunction(){
        /* this function is not called by the interface */

        msgToMachine = '@heater:print_temp_sp;';  

        sendInterfaceMessage( msgToMachine  );

        //if (machineDriveEnabled)
        sendInterfaceMessage( msgToWeb, msgToMachine  );
        
        }



        function incubateStartButtonFunction(){

        currentExperimentNo = $("#selectExperimentMenu").children(":selected").attr("value");
        incubationDuration  = $("#incubateDurationMenu").children(":selected").attr("value"); 
        specSamplingDuration  = $("#specSamplingDurationMenu").children(":selected").attr("value"); 
        

        msgToWeb = '<b>Start incubating </b> Experiment<b> '+ currentExperimentNo + '</b> for '+ incubationDuration ;


        //if (currentExperimentNo!=0)
        //    currentExperimentNo -= 1;

        msgToMachine = topicPrefix + ':' + 'Incubate' + ' ' + currentExperimentNo + ' ' + incubationDuration + ' ' + specSamplingDuration + ';' ;

        //sendInterfaceMessage( msgToWeb, msgToMachine  );
        //sendMachineMessage( msgToMachine  );
        //var angleList = [0, 45, 90, 180, 270, 360];
        //var i = Math.floor(Math.random() * (angleList.length))
        //angle = angleList[i];

        
        //wheel_angle += 45;

        //if (wheel_angle>360)
        //    wheel_angle = 0;
        
 
           
        //animateWheel(wheel_angle, 500);

        msgToMachine = topicPrefix + 'Agitate('+ 1 + ')';

        sendInterfaceMessage( msgToWeb, msgToMachine  );
        
        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );
            
        }


        function incubateStopButtonFunction(){

        currentExperimentNo = $("#selectExperimentMenu").children(":selected").attr("value");
        incubationDuration  = $("#incubateDurationMenu").children(":selected").attr("value"); 
        specSamplingDuration  = $("#specSamplingDurationMenu").children(":selected").attr("value"); 

        msgToWeb = '<b>Stop incubation </b> Experiment<b> '+ currentExperimentNo + '</b> for '+ incubationDuration ;


        //if (currentExperimentNo!=0)
        //    currentExperimentNo -= 1;

        msgToMachine = topicPrefix + 'Agitate('+ 0 + ')';


        sendInterfaceMessage( msgToWeb, msgToMachine  );
        
        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );

        }


        function unloadCultureButtonFunction(){

        currentExperimentNo = $("#selectExperimentMenu").children(":selected").attr("value");
 
        msgToWeb = '<b> Stop Incubation </b> for Experiment<b> '+ currentExperimentNo + '</b> ';
        //msgToMachine = topicPrefix + ':' + 'Unload' + ' ' + currentExperimentNo +';' ;

        //if (currentExperimentNo!=0)
        //    currentExperimentNo -= 1;
        
        msgToMachine = topicPrefix + 'Unload(' + currentExperimentNo + ')'

        sendInterfaceMessage( msgToWeb, msgToMachine  );

        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );
        


        }


            // setCalibrationData() is used to push new calibration data into the MCU controlling the spec
       function specLightOnFunction(){

            //topicName = '@spec';
            msgToWeb = 'Spec <b> White </b> Light is ' + '<b>'+ 'on' + '</b>' ;
            //msgToMachine = topicPrefix +  ':' +  'White 1' + ';' ;
            msgToMachine = '@spec:White 1;'
       
        sendInterfaceMessage( msgToWeb, msgToMachine  );

        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );
        

       }

       function specLightOffFunction(){

            msgToWeb = 'Spec <b> White </b> Light is ' + '<b>'+ 'off' + '</b>' ;

            //msgToMachine = topicPrefix +  ':' +  'White 0' + ';' ;
            msgToMachine = '@spec:White 0;'

            sendInterfaceMessage( msgToWeb, msgToMachine  );
            sendMachineMessage( msgToMachine  );

       }


       function specUVOnFunction(){

            msgToWeb = 'Spec <b> UV </b> Laser is ' + '<b>'+ 'on' + '</b>' ;
            msgToMachine = topicPrefix +  ':' +  'UVLaser 1' + ';' ;


            sendInterfaceMessage( msgToWeb, msgToMachine  );

            if (machineDriveEnabled)
                sendMachineMessage( msgToMachine  );
        

       }

       function specUVOffFunction(){

            msgToWeb = 'Spec <b> UV </b> Laser is ' + '<b>'+ 'off' + '</b>' ;

            msgToMachine = topicPrefix +  ':' +  'UVLaser 0' + ';' ;
        
            sendInterfaceMessage( msgToWeb, msgToMachine  );

            if (machineDriveEnabled)
                sendMachineMessage( msgToMachine  );
        
       }

       function openElectroporatorLidButtonFunction(){

            msgToWeb = 'Electroporator <b>Lid </b> is ' + '<b>'+ 'open' + '</b>' ;
            msgToMachine = '@Universal' +  ':' +  'SET lid 1' + ';' ;

            openElectroporatorLid(1);

            sendInterfaceMessage( msgToWeb, msgToMachine  );

            if (machineDriveEnabled)
                sendMachineMessage( msgToMachine  );
       }

       function closeElectroporatorLidButtonFunction(){

            msgToWeb = 'Electroporator <b>Lid </b> is ' + '<b>'+ 'closed' + '</b>' ;
            msgToMachine = '@Universal' +  ':' +  'SET lid 0' + ';' ;

            openElectroporatorLid(0);

            sendInterfaceMessage( msgToWeb, msgToMachine  );

            if (machineDriveEnabled)
                sendMachineMessage( msgToMachine  );
       }


       function specShowFunction(){

            currentExperimentForSpecNo = $("#displaySpecForExperimentMenu").children(":selected").attr("value");
            msgToWeb = '<b> Show Spec </b> for Experiment<b> '+ currentExperimentForSpecNo + '</b> ';
            
            //msgToMachine = topicPrefix + ':' + 'ShowSpec' + ' ' + currentExperimentNo +';' ;

            if (currentExperimentForSpecNo=='1'){
                animateWheel(225, 1000);
    
            }
            else if (currentExperimentForSpecNo=='2'){
                animateWheel(180, 1000);

            }
            else if (currentExperimentForSpecNo=='5'){
                animateWheel(45, 1000);

            }
            else if (currentExperimentForSpecNo=='6'){
                animateWheel(0, 2000);

            }


            //if (currentExperimentForSpecNo!=0)
            //    currentExperimentForSpecNo -= 1;

            msgToMachine = topicPrefix + 'ShowSpec(' + currentExperimentForSpecNo + ')';

            sendInterfaceMessage( msgToWeb, '');

            if (machineDriveEnabled)
                sendMachineMessage( msgToMachine  );
                
            //temp, just for demo
            receive_RAW_SCAN();

       }

       //hit start //
       function specStartFunction(){

            msgToWeb = '<b> Spectrometer started </b>' ;
            msgToMachine = "@spec:START;" 

            sendInterfaceMessage( msgToWeb, ''  );

            if (machineDriveEnabled)
                sendMachineMessage( msgToMachine  );

       }
        /*
       function specStopFunction(){

            msgToMachine = topicPrefix +  ':' +  'Stop' + ';' ;
            sendMachineMessage( msgToMachine  );

       }
       */

       function specRawSpectrumFunction(){

            timeStamp = getFormattedDate();

            msgToWeb = '<b> Spectrometer reading @ time </b>'  + timeStamp ;

            msgToMachine = "@spec:RAW_;" 

            sendInterfaceMessage( msgToWeb, ''  );

            if (machineDriveEnabled)
                sendMachineMessage( msgToMachine  );

       }



       function setSpecCalibrationButtonFunction(){
            
            var message = ":CALIBRATE";
            message += " " + document.getElementById('serial').value;
            message += " " + document.getElementById('A0').value;
            message += " " + document.getElementById('B1').value;           
            message += " " + document.getElementById('B2').value;
            message += " " + document.getElementById('B3').value;
            message += " " + document.getElementById('B4').value;
            message += " " + document.getElementById('B5').value;
            message +=";"
            
            sendMachineMessage(message);
            }

            // setClockRate() is used to set a new clock rate
        
        function setClockPeriodButtonFunction(){

            var message = ":CLOCK_PERIOD";
            message += " " + document.getElementById('clockPeriod').value + ';';
            sendMachineMessage(message);
            }
            
        function sendMachineMessage(m) {
                if (ws) { ws.send(m); }
            }


        /*Functions added for GUI */
         
        function sendInterfaceMessage(m1, m2){

            document.getElementById("status").innerHTML =  "<span style=\"color:#355ea3\">" + m1 + "</span>" + '&nbsp &nbsp &nbsp &nbsp'+ "<span style=\"color:black\">" + m2 + "</span>"; ; 

        }



         function sendRawCommandFunction(){

                msgToMachine = document.getElementById('rawCommandForDebug').value;
                msgToWeb = 'Debug: ' + msgToMachine ;

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage (msgToWeb, msgToMachine ) ;

         } 

         function getFormattedDate() {
                var date = new Date();

                var month = date.getMonth() + 1;
                var day = date.getDate();
                var hour = date.getHours();
                var min = date.getMinutes();
                var sec = date.getSeconds();

                month = (month < 10 ? "0" : "") + month;
                day = (day < 10 ? "0" : "") + day;
                hour = (hour < 10 ? "0" : "") + hour;
                min = (min < 10 ? "0" : "") + min;
                sec = (sec < 10 ? "0" : "") + sec;

                var str =  hour + ":" + min + ":" + sec + "   " + date.getFullYear() + "-" + month + "-" + day ;
                //var str = day + "_" +  hour + ":" + min + ":" + sec;

                /*alert(str);*/

                return str;
        }


function loadRawSVG(filename){

var svgRaw;

var ajax = new XMLHttpRequest();
ajax.open('GET', filename, true);
ajax.send();

ajax.onload = function(e) {
    svgRaw =  ajax.responseText;
     //console.log(svgRaw);
    return svgRaw;
    }
}//end of loadRawSVG function

