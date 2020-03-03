    var formatted_url = "";

    var currentTemp;
    var currentOD;
    var temperatureChart; 
    var colorSensorChart;
    var growthChart;
    var colorSensorGrowthChart;
    var tempDataPoints = [];
    var spectraHistory = [];
    var odDataPoints = [];
    var odHistory = [];
    var OD_BIAS = 20200;
    var OD_600INDEX = 117;
    var tempChartUpdateInterval = 20000;
    var growthChartUpdateInterval = 5000;
    // initial value
   // var yValue1 = 37; 
    var time = new Date;


    window.onload = function () {

    pingPeripherals();    

    document.getElementById("togBtn").checked=false; 


    temperatureChart = new CanvasJS.Chart("temperatureOverview", {

        zoomEnabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        title: {
            text: "Temperature",
            fontFamily: "helvetica",
            fontSize: 14,
            fontColor: 'rgba(220, 22, 90, .9)',
        },
        axisX: {
            title: "Updates every " + tempChartUpdateInterval/1000 + " secs",
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
    
    

    function toggleDataSeries(e) {
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        temperatureChart.render();
        growthChart.render();
    }



    function updateTemperatureChart() {   
        // pushing the new values
        tempDataPoints.push({
                x: time.setTime(time.getTime()+ tempChartUpdateInterval), 
                y: currentTemp
                });
        temperatureChart.render();
    }

    //updateColorSensorChart();
    setInterval(function(){updateTemperatureChart()}, tempChartUpdateInterval);

    

     //updateColorSensorChart();
    //setInterval(function(){updategrowthChart()}, growthChartUpdateInterval);

    }//end of onload

    function updateColorSensorChart(m) {

        var dps = [
                    { label: "450", y: m.message.violet, color: '#0000ff'},//violet
                    { label: "500", y: m.message.blue, color: '#009900' },//blue
                    { label: "550", y: m.message.green, color: '#ffff00' },//green
                    { label: "570", y: m.message.yellow, color: '#ffc000' },//yellow
                    { label: "600", y: m.message.orange, color: '#ff6c00' },//orange
                    { label: "650", y: m.message.red, color: '#ff0000' }//red
                ];

        colorSensorChart.options.data[0].dataPoints = dps; 
        colorSensorChart.render();

        updateGrowthChart(m.message.orange, 'AS7262');        
        /*
        var boilerColor, deltaY, yVal;
        var dps = chart.options.data[0].dataPoints;
        
        for (var i = 0; i < dps.length; i++) {
            deltaY = Math.round(2 + Math.random() *(-2-2));
            yVal = deltaY + dps[i].y > 0 ? dps[i].y + deltaY : 0;
            boilerColor = yVal > 200 ? "#FF2500" : yVal >= 170 ? "#FF6000" : yVal < 170 ? "#6B8E23 " : null;
            dps[i] = {label: "Boiler "+(i+1) , y: yVal, color: boilerColor};
        }*/

    };


   function loadNewImgFunction(){

        var newImage = document.getElementById("loadingImg");

        if (formatted_url !== "")
            newImage.src = formatted_url;

        //also make new image button visible
        document.getElementById("takeImageButton").style="display:visible";

        setTimeout(function(){ 
            document.getElementById("previewImageButton").style="display:none";
        }, 1000);
        //newImage.src = "images/loading.gif";
   }
   

    function takeImgFunction(){
        
        document.getElementById("previewImageButton").value=""; 
        var image = document.getElementsByClassName("loadingImg");
        image = "images/loading.gif";
        //document.images[3].src = "images/loading.gif";

        
        console.log("Taking image")
        
        pubnub.publish({

                channel : 'br01a_cam_in',
                message : { 
                            'device': {
                                        'cmd':'take_img',
                                        'exposure': 2000,
                                        'ring_led_brightness': 0
                                        }
                            }, //take_img_with_ring
                callback : function(m){
                    console.log(m)
                }
            });

        /*
       pubnub.publish({

                channel : 'rca01cam_in',
                message : { 'device': 'take_img'}, //take_img_with_ring
                callback : function(m){
                    console.log(m)
                }
            });
        */
         

        pubnub.publish({

                channel : 'br01a_plate_in',
                message : { 'device' : 'colorAllWhite'},
                callback : function(m){
                    console.log(m)
                }
            });



        setTimeout(function(){ 

                pubnub.publish({

                        channel : 'br01a_plate_in',
                        message : { 'device' : 'colorAllOff'},
                        callback : function(m){
                            console.log(m)
                        }
                    });

                console.log("Taking image completed")
                
                }, 4000);
    
        

    }

    function readColorFunction(){

    console.log("color sensor called")    

    pubnub.publish({

                channel : 'br01a_AS7262_in',
                message : {'device':'read'},
                callback : function(m){
                    console.log(m)
                }
            });


    //console.log("Spec cleared after 3 secs");
    }




    function readSpecFunction(){

    console.log("spec called")

    pubnub.publish({

                channel : 'c12880MA_16H00363_in',
                message : {'device':'read'},
                callback : function(m){
                    console.log(m)
                }
            });

    //console.log("Spec reading initiated");

            //after 1 seconds stop the image take and revert back to interval


    //console.log("Spec cleared after 3 secs");
    }


    function formatURLforNewImg(m){
 
        var data = m.message[1]+"";
        var url = data.split("/")[2]+"";
        formatted_url = url.split(' ').join('%20');
        formatted_url = "https://raw.githubusercontent.com/biorealize/biorealize.github.io/master/br01a/secure/32257200d0c20fa83c570f1d4fd414c18253d2cc/data/" + data;

        //var updatedStatus = document.getElementById("devicestatus").innerHTML

        document.getElementById("imagerecordstatus").innerHTML  = 
            '<br><span class="label status">Image</span><span class="label data">'+ data + '</span><br>'

        console.log(formatted_url);  
                
    }


    function updateColorSensorPeripheralImage(){

        console.log('Connected to the Color Sensor Peripheral');

        document.getElementById("deviceinfo").innerHTML = 
        '<img src="images/breactor_60mlsyringe_wSpec_outline_wht.svg" class="left">'+
        '<input onclick="readColorFunction()" type="button" value="Analyze Color" id="readColorSensorButton" />'

    }   

    function updateSpecPeripheralImage(){

        console.log('Connected to the Spec Peripheral');

        document.getElementById("deviceinfo").innerHTML = 
        '<img src="images/breactor_60mlsyringe_wSpec_outline_wht.svg" class="left">'+
        '<input onclick="readSpecFunction()" type="button" value="Spec " id="readSpecButton" />'

    }  

    function parseInformationfromPlatePeripheral(m){

        console.log('parsing plate peripheral information');

        field = String(m.message.hw);

        if (field ==='connected'){

            existingStatus = document.getElementById("devicestatus").innerHTML
            document.getElementById("devicestatus").innerHTML = existingStatus + 
            '<br><span class="label status">Backlit Plate</span><span class="label data">' + field + '</span><br>';
        }
        else {

            document.getElementById("deviceinfo").innerHTML = 
            '<img src="images/breactor_nowell_outline_wht.svg" class="left">'+
            '<br><input onclick="loadNewImgFunction()" type="button" value=">" style="display:none" id="previewImageButton" />' + 
            '<input onclick="takeImgFunction()" type="button" value="Take New Img" style="display:none" id="takeImageButton" />'
           
        }

    }

    function parseInformationfromColorSensor(m){

        field = String(m.message.hw);

        if (field ==='connected'){

            existingStatus = document.getElementById("devicestatus").innerHTML
            document.getElementById("devicestatus").innerHTML = existingStatus + 
            '<br><span class="label status">Color Sensor</span><span class="label data">' + field + '</span><br>'
        }
        else {

            loadColorSensorChart();
            loadGrowthChart();
            
            updateColorSensorChart(m);  
            updateColorSensorPeripheralImage();
        }
    }

    function parseInformationfromSpec(m){

        field = String(m.message.hw);

        if (field ==='connected'){
            //console.log("camera connected");
            existingStatus = document.getElementById("devicestatus").innerHTML
            document.getElementById("devicestatus").innerHTML = existingStatus + 
            '<br><span class="label status">Spec</span><span class="label data">' + field + '</span><br>'
        }
        else {

            loadGrowthChart();
            updateSpecChart(m);
            updateSpecPeripheralImage();  
        }


    }


    function parseInformationfromCamera(m){

        field = String(m.message[0]);
              
        if (field ==='img_path'){

            formatURLforNewImg(m); 

            setTimeout(function(){ 
                document.getElementById("previewImageButton").value="Load ->";
                document.getElementById("previewImageButton").style="display:visible";
            }, 500);

            console.log("new path arrived");
        }

        else if (field ==='hw'){

            //console.log("camera connected");
            existingStatus = document.getElementById("devicestatus").innerHTML
            document.getElementById("devicestatus").innerHTML = existingStatus + 
            '<br><span class="label status">Camera</span><span class="label data">' + m.message[1]+'<br>';

        }

    }//end of parseInformationfromCamera

    function parseInformationfromReactor(m){

        console.log('parsing reactor information');

        if (m.message[0] === "hw" ){
            existingStatus = document.getElementById("devicestatus").innerHTML
            document.getElementById("devicestatus").innerHTML = existingStatus + 
            '<br><span class="label status">Reactor</span><span class="label data">' + m.message[1] + '<br>';
        }

        if (m.message.hasOwnProperty("experiment") ){
                    //console.log(m.message.hasOwnProperty("experiment"));
        	var experimentId = m.message.experiment.id;
        	var expDate = m.message.experiment.expiration_date;
        	var organismMedia = m.message.experiment.organism_media;
        	var volume = m.message.experiment.volume + ' ml' ;
        	var targetTemperature = m.message.experiment.target_temp + ' °C';
        	var duration = m.message.experiment.duration + ' mins' ;
        	//var obj2 = JSON.parse(obj.message);
        	//var obj3 = JSON.parse(obj2.eon);
        	//var temp = JSON.parse(obj3.Temperature);
            //document.getElementById("instructions").innerHTML =  "<span style=\"color:#355ea3\">" + "Syringe ID" + "</span>" + '&nbsp &nbsp &nbsp &nbsp'+ "<span style=\"color:black\">" + data + "</span>"; ; 
            
            document.getElementById("instructions").innerHTML = 
            '<br> <span class="label syringe_id">Experiment ID </span> <span class="label other">' + experimentId +  
            '</span><br><br> <span class="label date">Expiration Date</span><span class="label other">'+ expDate +
            '</span><br><br><span class="label organism_media">Organism + Media</span><span class="label other"> <i>'+ organismMedia +
            '</i> </span><br><br><span class="label volume">Volume</span><span class="label other">'+ volume +
            '</span><br><br><span class="label temperature">Temperature</span><span class="label other">'+ targetTemperature +
            '</span><br><br><span class="label duration">Duration</span><span class="label other">'+ duration + 
            '</span><br><br>'


            //document.getElementsByClassName(".switch").style.opacity = "1"; 
            document.getElementById("button_label").style.opacity = "1"; 
            document.getElementById("togBtn").checked=true;
            document.getElementById("spin_box_id").checked=false;
            checkBox = document.getElementById("spin_box_id"); 
            checkBox.style="display:visible";
            label = document.getElementById("spin_check_label");
            label.innerHTML="Spin"; 
        }

        if (m.message.hasOwnProperty("run") ) {

            //console.log(m.message.run.elapsed_time);

            var specFreq = m.message.run.spec_frequency;
            var spinSpeed = m.message.run.spin_speed; 
            var lidStatus = m.message.run.lid ;
            var elapsedTime = m.message.run.elapsed_time;
            var runStatus = m.message.run.status;
            var recordID = m.message.run.record_id;
            var timestamp = m.message.run.ts;

            document.getElementById("devicestatus").innerHTML = 
            '<br><span class="label status">Sensor Frequency:</span><span class="label data">'+ specFreq + '</span><br>' +
            '<br><span class="label status">Agitation Mode:</span><span class="label data">'+ spinSpeed + '</span><br>' +  
            '<br><span class="label status">Lid:</span><span class="label data">'+ lidStatus + '</span><br>'

            currentTemp = m.message.run.current_temp;
            //currentTemp = currentTemp.slice(0,-4);
            currentTemp = parseFloat(currentTemp);
            elapsedTime = parseFloat(  elapsedTime/60 ).toFixed(2);
            console.log(m.message.run.record_id);
            console.log(m.message.run.ts);
            
            document.getElementById("currenttemperature").innerHTML = 
            '<span class="label other">Chamber is </span><span style="color:#F0F0F0">'+ currentTemp + ' °C' + ' (and ' + runStatus + ')'
            '</span><br><br>'
            document.getElementById("elapsedtime").innerHTML = 
            '<span class="label other"> Elapsed Time:</span><span style="color:#ff9800">'+ elapsedTime + ' min' + '</span><br>'
            document.getElementById("datarecordstatus").innerHTML = 
            '<br><span class="label status">Data Record:</span><span class="label data">'+ recordID + '</span><br>' +   
            '<br><span class="label status">Timestamp:</span><span class="label data">'+ timestamp + '</span><br>' 

        }
 
    }//parseInformationfromReactor

    function initNewExperiment(){
        console.log("initNewExperiment called");
        pubnub.publish({

                channel : 'br01a_in',
                message : { cmd: 'init'},
                callback : function(m){
                    console.log(m)
                }
            });

    }

    function UpdateSpinStatus(chkButton){

        if (chkButton.checked){
            //console.log("checked called");
            pubnub.publish({
                channel : 'br01a_in',
                message : { cmd: 'spin'},
                callback : function(m){
                    callbackonsole.log(m)
                }
            });
    
    }
        else{
            //console.log("unchecked called");
            pubnub.publish({
                channel : 'br01a_in',
                message : { cmd: 'nospin'},
                callback : function(m){
                    callbackonsole.log(m)
                }
            });
            //console.log("not checked");
        }


    }

    function UpdateButton(chkButton) {

        if (chkButton.checked){
            //console.log("checked");
            checkBox = document.getElementById("spin_box_id"); 
            checkBox.style="display:visible";
            label = document.getElementById("spin_check_label");
            label.innerHTML="Spin";

            pubnub.publish({
                channel : 'br01a_in',
                message : { cmd: 'start'},
                callback : function(m){
                    callbackonsole.log(m)
                }
            });
        }
        else{
            checkBox = document.getElementById("spin_box_id"); 
            checkBox.style="display:none";
            label = document.getElementById("spin_check_label");
            label.innerHTML="";
            
            pubnub.publish({
                channel : 'br01a_in',
                message : { cmd: 'stop'},
                callback : function(m){
                    callbackonsole.log(m)
                }
            });
            //console.log("not checked");
        }

    }

    function updateSpecChart(m){

                var RAW_SCAN = m.message.RAW_SCAN;

                //Replace this show with an actual reading from the spec
                var SHOW = {specState:6, specReady:1, specDataIndex:158, specBufferFilling:1, video_bias:0, video_max:40000, whiteLED:0, laserLED:0, whitePct:0.00, laserPct:0.00, clockPeriod:14, integrationTime:672, serialNum:"16a00106", A0:3.112979665E+02, B1:2.682851027E+00, B2:-7.479508945E-04, B3:-1.104274866E-05, B4:2.175770976E-08, B5:-1.189582572E-11};
                // make an empty array to hold the wavelength values for each sample
                // load the array with calculated wavelengths, using a 5th order polynomial calculation
       
                var wavelengths = [];
                for (var i=1;i<=RAW_SCAN.length;i++) {
                    wavelengths.push(SHOW.A0 + SHOW.B1*i + SHOW.B2 * Math.pow(i,2) + SHOW.B3 * Math.pow(i,3) + SHOW.B4 * Math.pow(i,4) + SHOW.B5 * Math.pow(i,5));
                }

                var dataPoints=[];
                for (var i = 0; i < RAW_SCAN.length; i++) { 
                    dataPoints.push({y:RAW_SCAN[i]});
                }
                
                //pass latest Raw Scan for OD 600 calculation, which updates the growth chart
                updateGrowthChart( RAW_SCAN[OD_600INDEX], 'SPEC');
                
                //this raw_spec_chart
                var chrt = document.getElementById('colorSensorOverview');
                //var chart = new CanvasJS.Chart("chartContainer", {
                var rawSpectrumChart = new CanvasJS.Chart(chrt, {

                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    title:{
                        text: "Raw Spectrum",
                        fontFamily: 'helvetica',
                        fontSize: 14,
                        fontColor: 'rgba(220, 22, 90, .9)',              
                    },
          
                      axisX:{
                        title: 'Wavelength',
                        titleFontFamily: 'helvetica',
                        tickThickness: .5,
                        tickLength: 5,
                        gridThickness: .5,
                        lineThickness: .5,
                        titleFontColor: "dimGrey",
                        labelFontColor: "dimGrey",
                        titleFontSize: 12,

                      },

                      axisY:{
                        title: "AD count",
                        titleFontFamily: 'helvetica',
                        tickThickness: .5,
                        tickLength: 5,
                        gridThickness: .5,
                        lineThickness: .5,
                        titleFontColor: "dimGrey",
                        labelFontColor: "lightGrey",
                        titleFontSize: 12,

                      },
                    animationEnabled: true,   // change to true
                    

                    data: [              
                    {
                        // Change type to "bar", "area", "spline", "pie",etc.
                        //type: "splineArea",
                        type: "line",
                        lineThickness: 1,
                        dataPoints: dataPoints,//wavelengths
                    }
                    ]
                });
                rawSpectrumChart.render();
            }


function updateGrowthChart(currentRawSpectra, source){

        //currentOD = Math.round(2 + Math.random() *(-2-2));        
        
        //currentOD = Math.max(-Math.log10((spec_data[syringe][i].dataPoints[j] - BIAS) / (spec_data[syringe][0].dataPoints[j] - BIAS)), 0);
        if (spectraHistory.length>0){
            //lastOD= odHistory[odHistory.length - 1];
            firstSpectra = spectraHistory[0];
            
            if(source.includes('SPEC')){
                OD_BIAS = 5500; //20200
            }else{
                OD_BIAS = 1000;
            }

            lastSpectra = currentRawSpectra-OD_BIAS;
            currentOD = Math.max(-Math.log10( lastSpectra / firstSpectra ), 0);
            
            console.log("spectral History length: " + spectraHistory.length);
            console.log("CurrentRaw: " + currentRawSpectra);
            console.log("OD_BIAS: " +  OD_BIAS);
            console.log("last Spectra: " + lastSpectra);
            console.log("first Spectra: " + firstSpectra)
            console.log("currentOD: " + currentOD);
            
        }
        else{
            //this should be replaced by a calibration reading
            currentOD = 0.001;
        }

        odHistory.push(currentOD);
        spectraHistory.push(currentRawSpectra);

        console.log(spectraHistory.length);
        console.log(currentOD);

        //Push the newly calculated OD to the graph to visualize
        odDataPoints.push({
                x: time.setTime(time.getTime()+ growthChartUpdateInterval), 
                y: currentOD
                });
        growthChart.render();

    }//end of updateGrowthChart

function pingPeripherals(){
        
        //pings each peripheral with 2 sec delays.

        setTimeout(function() {

        console.log("pinging reactor");
        
        pubnub.publish({
                channel : 'br01a_in',
                message : { cmd: 'echo'},
                callback : function(m){
                    callbackonsole.log(m)
                }
        });

        }, 500);

        setTimeout(function() {

        console.log("pinging camera");
            
        pubnub.publish({

                channel : 'br01a_cam_in',
                message : { 
                            'device': {
                                        'cmd':'echo'
                                        }
                            }, //take_img_with_ring
                callback : function(m){
                    console.log(m)
                }
            });

        }, 1000);


        setTimeout(function() {

        console.log("pinging plate");
            
        pubnub.publish({

                channel : 'br01a_plate_in',
                message : { 'device' : 'echo'},
                callback : function(m){
                    console.log(m)
                }
            });

        }, 1500);


        setTimeout(function() {

        console.log("pinging color sensor");
            

        pubnub.publish({

                channel : 'rca01AS7262_in',
                message : {'device':'echo'},
                callback : function(m){
                    console.log(m)
                }
            });

        }, 2000);


        setTimeout(function() {

        console.log("pinging spec");
            
        pubnub.publish({

                channel : 'c12880MA_16H00363_in',
                message : {'device':'echo'},
                callback : function(m){
                    console.log(m)
                }
            });

        }, 2500);

        
        
}//end of ping peripherals

function loadGrowthChart(){

        growthChart = new CanvasJS.Chart("growthOverTime", {

        zoomEnabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        title: {
            text: "Growth",
            fontFamily: "helvetica",
            fontSize: 14,
            fontColor: 'rgba(220, 22, 90, .9)',
        },
        axisX: {
            title: "Updates every " + growthChartUpdateInterval/1000 + " secs",
            titleFontColor: "dimGrey",
            labelFontColor: "dimGrey",
            titleFontSize: 12,
        },
        axisY:{
            suffix: " OD",
            includeZero: true,
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
            type: "splineArea",
            lineDashType: "shortDash",
            xValueType: "dateTime",
            yValueFormatString: "####.00",
            xValueFormatString: "hh:mm:ss TT",
            showInLegend: false,
            lineColor: 'rgba(220, 22, 90, .9)',
            lineThickness: .7,
            name: "Growth",
            dataPoints: odDataPoints,
            }]
    });

    growthChart.render();

}

function loadColorSensorChart(){

    colorSensorChart = new CanvasJS.Chart("colorSensorOverview", {

                zoomEnabled: false,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                title: {
                    text: "Spectral Distribution",
                    fontSize: 14,
                    fontColor: 'rgba(220, 22, 90, .9)',
                    fontFamily: "helvetica",
                },
                axisX: {
                    titleFontColor: "lightGrey",
                    labelFontColor: "lightGrey",
                    titleFontSize: 12,

                },
                axisY: {
                    title: "Spectra",
                    labelFontColor: "lightGrey",
                    titleFontSize: 12,
                    fontFamily: "helvetica",
                },
                data: [{
                    type: "column", 
                    yValueFormatString: "###",
                    lineColor: 'rgba(220, 22, 90, .9)',
                    lineThickness: .7,
                    name: "Wavelength",
                    indexLabel: "{y}",
                    dataPoints: [
                        { label: "450", y: 206 },//violet
                        { label: "500", y: 163 },//blue
                        { label: "550", y: 154 },//green
                        { label: "570", y: 176 },//yellow
                        { label: "600", y: 184 },//orange
                        { label: "650", y: 122 }//red
                    ]
                }]
            });

    colorSensorChart.render(); 
}