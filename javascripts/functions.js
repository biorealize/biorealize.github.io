        
        var ws;
        var wsUri = "ws:";
        var loc = window.location;
        
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

        if (machineDriveEnabled)
            sendMachineMessage( msgToMachine  );
        
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
            msgToMachine = topicPrefix +  ':' +  'White 1' + ';' ;
       
        sendInterfaceMessage( msgToWeb, msgToMachine  );

        if (machineDriveEnabled)
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

            msgToWeb = '<b> Spectrometer reading @ </b>'  + timeStamp ;

            msgToMachine = "@spec:RAW_;" 

            sendInterfaceMessage( msgToWeb, ''  );

            if (machineDriveEnabled)
                sendMachineMessage( msgToMachine  );

       }

       function specLightOffFunction(){

            msgToWeb = 'Spec <b> White </b> Light is ' + '<b>'+ 'off' + '</b>' ;

            msgToMachine = topicPrefix +  ':' +  'White 0' + ';' ;

            sendInterfaceMessage( msgToWeb, msgToMachine  );
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

