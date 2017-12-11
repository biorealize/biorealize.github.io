        
        var ws;
        var wsUri = "ws:";
        var loc = window.location;
        
        var topicName = "@spec";

        var syringeProxyPrefix = '@i2cSerialProxy' ;  
        var electroporatorPrefix = '@electroporator';
        var purifierPrefix = '@purifier'; 

        var wheelPrefix = '@wheel';
        var pumpPrefix = '@mediapump';
        var carouselPrefix = '@carousel';
        var heaterPrefix = '@heater';
        var specPrefix = '@spec';
        var tempPrefix = '@temp'; 

        var incubatorPrefix = '@incubator' ;

        console.log(loc);

        if (loc.protocol === "https:") { wsUri = "wss:"; }
        // This needs to point to the web socket in the Node-RED flow
        // ... in this case it's ws/simple
        //wsUri += "//" + loc.host + loc.pathname.replace("simple","ws/MicrobialDesignStudio ");
        wsUri = "ws://" + loc.host + "/ws/MicrobialDesignStudio";
        wsUri = wsUri.replace(":3000",":1880");
		if (wsUri == "ws:///ws/MicrobialDesignStudio"){
			wsUri = "ws://162.243.1.23:1880/ws/MicrobialDesignStudio";
		}
        
        //When page served through localhost
        //wsUri = "ws://127.0.0.1:1880/ws/MicrobialDesignStudio";
        //When pi is remotely accessed
        //wsUri = "ws://10.251.138.240:1880/ws/MicrobialDesignStudio";
        //wsUri += "//" + loc.host + loc.pathname.replace("simple","ws/MicrobialDesignStudio ");
        //wsUri += "//" + loc.host.replace(':3000', ':1880') + loc.pathname.replace("simple","ws/MicrobialDesignStudio ");
       //wsUri += "//" + '127.0.0.1:1880' + loc.pathname.replace("simple","ws/MicrobialDesignStudio ");
/*
		var ws;
	   
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
                        type: "line",
                        lineThickness: 1,
                        dataPoints: dataPoints
                    }
                    ]
                });
                chart.render();
            }       
                     
            
            // setCalibrationData() is used to push new calibration data into the MCU controlling the spec
       function specLightOnFunction(){

            topicName = '@spec';
            msgToWeb = 'Spec <b> White </b> Light is ' + '<b>'+ 'on' + '</b>' ;
            msgToMachine = specPrefix +  ':' +  'WHITE 1' + ';' ;

            sendInterfaceMessage( msgToWeb, msgToMachine  );
            sendMachineMessage( msgToMachine  );

       }

       function specUVOnFunction(){

            topicName = '@spec';
            msgToWeb = 'Spec <b> UV </b> Light is ' + '<b>'+ 'on' + '</b>' ;

            msgToMachine = specPrefix +  ':' +  'UVLASER 1' + ';' ;

            sendInterfaceMessage( msgToWeb, msgToMachine  );
            sendMachineMessage( msgToMachine  );

       }

       function specUVOffFunction(){

            topicName = '@spec';
            msgToWeb = 'Spec <b> UV </b> Light is ' + '<b>'+ 'off' + '</b>' ;

            msgToMachine = specPrefix +  ':' +  'UVLASER 0' + ';' ;

            sendInterfaceMessage( msgToWeb, msgToMachine  );
            sendMachineMessage( msgToMachine  );

       }


       function specShowFunction(){
            topicName = '@spec';
            msgToMachine = specPrefix +  ':' +  'SHOW' + ';' ;
            sendMachineMessage( msgToMachine  );

       }

       function specStartFunction(){
            topicName = '@spec';
            msgToMachine = specPrefix +  ':' +  'START' + ';' ;
            sendMachineMessage( msgToMachine  );

       }

       function specStopFunction(){
            topicName = '@spec';
            msgToMachine = specPrefix +  ':' +  'STOP' + ';' ;
            sendMachineMessage( msgToMachine  );

       }

       function specRawSpectrumFunction(){

            topicName = '@spec';
            timeStamp = getFormattedDate();

            msgToWeb = '<b> Spectrometer reading @ </b>'  + timeStamp ;

            msgToMachine = specPrefix +  ':' +  'RAW_' + ';' ;

            sendInterfaceMessage( msgToWeb, ''  );
            sendMachineMessage( msgToMachine  );

       }

       function specLightOffFunction(){

            topicName = '@spec';

            msgToWeb = 'Spec <b> White </b> Light is ' + '<b>'+ 'off' + '</b>' ;

            msgToMachine = specPrefix +  ':' +  'WHITE 0' + ';' ;

            sendInterfaceMessage( msgToWeb, msgToMachine  );
            sendMachineMessage( msgToMachine  );

       }

       function setSpecCalibrationButtonFunction(){
            
            topicName = '@spec';
            
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
            
            topicName = '@spec';

            var message = ":CLOCK_PERIOD";
            message += " " + document.getElementById('clockPeriod').value + ';';
            sendMachineMessage(message);
            }
            

        function electroporatorLidButtonFunction(){

            action = $("#electroporatorLidPosition").children(":selected").attr("value");
            

            //OPEN or CLOSE
            
            msgToWeb = 'Electroporator lid is ' + '<b>'+ action.toUpperCase() + '</b>' ;
            msgToMachine = electroporatorPrefix +  ':' + action.toUpperCase() + ';' ;

            sendMachineMessage( msgToMachine  );
            sendInterfaceMessage ( msgToWeb, msgToMachine ) ;
            
        }
   
        function electroporateButtonFunction(){

            setting = $("#transformationSetting").children(":selected").attr("value");
            

            //yeast vs. ecoli

            if (setting=='yeast'){
                
                msgToWeb = 'Transformation is prepared for ' + '<b>'+ setting.toUpperCase() + '</b>' ;
                msgToMachine = electroporatorPrefix +  ':' + 'FIRE' + ';';
            }
            else if (setting=='ecoli'){
                
                msgToWeb = 'Transformation is prepared for ' + '<b>'+ setting.toUpperCase() + '</b>' ;
                msgToMachine = electroporatorPrefix +  ':' + 'FIRE' + ';';             
            }
            

            //sendMachineMessage( msgToMachine  );
            sendInterfaceMessage ( msgToWeb, msgToMachine ) ;
        }

        function carouselButtonFunction(){

                carouselNo = $("#carouselNo").children(":selected").attr("value");
                carouselStation = $("#carouselStation").children(":selected").attr("value");

                var carouselNoInt = parseInt(carouselNo) - 1 ;
                
                msgToWeb = 'Carousel: '+ '<b>' + carouselNoInt.toString() + '</b>' + ' moving to ' + '<b>'+carouselStation+'</b>' ;
                
                if (carouselStation != '4')
                    msgToMachine = carouselPrefix +  ':' + 'MOVE ' + carouselNoInt.toString() + ' ' +carouselStation +';' ;       
                else
                    msgToMachine = carouselPrefix +  ':' + 'HOME;' ;

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage ( msgToWeb, msgToMachine ) ;

        }

        function pumpButtonFunction(){
                
                pumpDuration = $("#pumpDuration").children(":selected").attr("value");

                msgToWeb = 'Pump active for '+ '<b>' + pumpDuration + '</b>'+ ' milisecs.' ;
                msgToMachine = pumpPrefix +  ':' + 'PUMP ' + pumpDuration +';' ;       

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage ( msgToWeb, msgToMachine ) ;
        }


        function wheelPosButtonFunction(){
                
                
                wheelPosFree = document.getElementById('wheelPosFree').value;

                //check if input box has an input
                if (wheelPosFree.length > 0){
                wheelPos =  wheelPosFree;
                } 
                //else look at the value from dropdown
                else{
                 wheelPos = $("#wheelPosition").children(":selected").attr("value");
                }

                

                //"@wheel:set incustepper 0;"
                //msg = wheelprefix + ':set ' + 'incustepper' +  wheelNo;"
                //sendMachineMessage("@wheel:set incustepper 0;");

                msgToWeb = 'Incustepper to: '+ wheelPos ;
                msgToMachine = wheelPrefix +  ':' + 'set incustepper ' + wheelPos +';' ;       

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage ( msgToWeb, msgToMachine ) ;
                
         }

        function wheelSpeedButtonFunction(){
                
                
                wheelSpeed  = document.getElementById('wheelSpeed').value;
                
                //"@wheel:set incustepper 0;"
                //msg = wheelprefix + ':set ' + 'incustepper' +  wheelNo;"
                //sendMachineMessage("@wheel:set incustepper 0;");

                msgToWeb = 'Incustepper speed: '+ wheelSpeed ;
                msgToMachine = wheelPrefix +  ':' + 'set incuspeed ' + wheelSpeed +';' ;       

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage ( msgToWeb, msgToMachine ) ;
                
         }


        function syringeButtonFunction(){
                

                syringeNo = $("#syringeNo").children(":selected").attr("value");
                syringeAmount = $("#syringeAmount").children(":selected").attr("value");
                syringeAction = $("#syringeAction").children(":selected").attr("value");

                //@i2cSerialProxy:SY_E 17;
                if (syringeAction=='extend') 
                	msgToMachine = syringeProxyPrefix + ':' + 'SY' + '_E ' + syringeNo +';' ;
                else if (syringeAction=='retract')
					msgToMachine = syringeProxyPrefix + ':' + 'SY' + '_Z ' + syringeNo +';' ;

				msgToWeb = 'Syringe # ' + syringeNo + ' ' +syringeAction + ' ' + syringeAmount + ' ml.'
                document.getElementById("status").innerHTML =   "<span style=\"color:#355ea3\">" + msgToWeb; + "</span>"; 

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage ( msgToWeb, msgToMachine ) ;
                
                
         }

        function plungerButtonFunction(){
                

                syringeNo = $("#syringeNo").children(":selected").attr("value");
                syringeAmount = $("#syringeAmount").children(":selected").attr("value");

                //@i2cSerialProxy:PL_M 17 10;
                msgToMachine = syringeProxyPrefix + ':' + 'PL_M' + ' ' +syringeNo + ' ' + syringeAmount + ';' ;


                msgToWeb = 'Syringe # ' + syringeNo + ' ' + syringeAmount + ' dispensed'
                document.getElementById("status").innerHTML =   "<span style=\"color:#355ea3\">" + msgToWeb; + "</span>"; 

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage ( msgToWeb, msgToMachine ) ;
                
                
         }


        function mediaMagazineButtonFunction(){
                

                mediaMagazinePosition = $("#mediaType").children(":selected").attr("value");

                //msgToMachine = purifierPrefix +  ':' + 'set magazine ' + mediaMagazinePosition + ';' ;  
                msgToMachine = purifierPrefix +  ':' + 'SPIN ' + mediaMagazinePosition + ';' ;

                msgToWeb = 'Media magazine is moving to ' + mediaMagazinePosition;
                document.getElementById("status").innerHTML =   "<span style=\"color:#355ea3\">" + msgToWeb; + "</span>"; 

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage ( msgToWeb, msgToMachine ) ;
                
         }

        function centrifugeButtonFunction(){

            speed = $("#centrifugeSpeed").children(":selected").attr("value");


            msgToWeb = 'Centrifuge Speed is ' + speed;
            document.getElementById("status").innerHTML =   "<span style=\"color:#355ea3\">" + msgToWeb; + "</span>"; 

            //The new centrifuge code accepts :CENT <speed>;
            //msgToMachine = purifierPrefix +  ':' + 'set centrifuge ' + speed + ';' ;
            msgToMachine = purifierPrefix +  ':' + 'CENT ' + speed + ';' ;

            sendMachineMessage(msgToMachine);
            sendInterfaceMessage ( msgToWeb, msgToMachine ) ;

        }
                
        function specSelectButtonFunction(){

            specNo = $("#specNo").children(":selected").attr("value");
            msgToWeb = 'Spec' + specNo + ' is selected';

            specPrefix = specNo;

        }



         function getIncuTempButtonFunction(){

                topicName = '@incubator';

                //msgToWeb = 'Incubator Temp is <b>' + currentTemp +  '</b>'; 
                msgToMachine = tempPrefix +  ':' + 'get temp 0;' ;   

                sendMachineMessage(msgToMachine);
                //sendInterfaceMessage ( msgToWeb, msgToMachine ) ;

                //sendMachineMessage("@heater:set heater 1;");
         }  

         function heaterButtonOnFunction(){

                msgToWeb = 'Heater is <b>On</b>'; 
                msgToMachine = heaterPrefix +  ':' + 'set heater 1;' ;   

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage ( msgToWeb, msgToMachine ) ;

                //sendMachineMessage("@heater:set heater 1;");
         }  

         function heaterButtonOffFunction(){

                msgToWeb = 'Heater is <b>Off</b>'; 
                msgToMachine = heaterPrefix +  ':' + 'set heater 0;' ;   

                sendMachineMessage(msgToMachine);
                sendInterfaceMessage ( msgToWeb, msgToMachine ) ;
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