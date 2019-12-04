    var formatted_url = "";

    var currentTemp = 37.0;
    var chart; 
    var colorSensorChart;
    var dataPoints1 = [];
    var updateInterval = 10000;
    // initial value
    var yValue1 = 37; 
    var time = new Date;


    window.onload = function () {

    document.getElementById("togBtn").checked=false; 

    setInterval(function(){ 

        takeImgFunction();

    }, 43200000);


    chart = new CanvasJS.Chart("temperatureOverview", {

        zoomEnabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        title: {
            text: "Temperature",
            fontFamily: "helvetica",
            fontSize: 14,
            fontColor: 'rgba(220, 22, 90, .9)',
        },
        axisX: {
            title: "Updates every 30 secs",
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
            fontColor: "dimGrey",
            itemclick : toggleDataSeries
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
            dataPoints: dataPoints1
            }]
    });

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


    function toggleDataSeries(e) {
        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }



    function updateChart() {   
        // pushing the new values
        dataPoints1.push({
                x: time.setTime(time.getTime()+ updateInterval), //time.getTime() + updateInterval,
                y: currentTemp
                });
        chart.render();
    }

    //updateColorSensorChart();
    setInterval(function(){updateChart()}, updateInterval);

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

        /*
        var boilerColor, deltaY, yVal;
        var dps = chart.options.data[0].dataPoints;
        
        for (var i = 0; i < dps.length; i++) {
            deltaY = Math.round(2 + Math.random() *(-2-2));
            yVal = deltaY + dps[i].y > 0 ? dps[i].y + deltaY : 0;
            boilerColor = yVal > 200 ? "#FF2500" : yVal >= 170 ? "#FF6000" : yVal < 170 ? "#6B8E23 " : null;
            dps[i] = {label: "Boiler "+(i+1) , y: yVal, color: boilerColor};
        }*/
        colorSensorChart.options.data[0].dataPoints = dps; 
        colorSensorChart.render();
    };


   function loadNewImgFunction(){

       if (formatted_url !== "")
            document.images[2].src = formatted_url;

   }
   

    function takeImgFunction(){
        
        document.getElementById("previewImageButton").value=""; 
        document.images[2].src = "images/loading.gif";

        pubnub.publish({

                channel : 'rca01_in',
                message : { device: 'take_img'},
                callback : function(m){
                    console.log(m)
                }
            });

        pubnub.publish({

                channel : 'rca01plate_in',
                message : { LEDstatus: 'colorAllWhite'},
                callback : function(m){
                    console.log(m)
                }
            });



        //after 1 seconds stop the image take and revert back to interval
        setTimeout(function(){ 

        pubnub.publish({

                channel : 'rca01_in',
                message : { device: 'take_img_interval'},
                callback : function(m){
                    console.log(m)
                }
            });

        pubnub.publish({

                channel : 'rca01plate_in',
                message : { LEDstatus: 'colorAllOff'},
                callback : function(m){
                    console.log(m)
                }
            });


        }, 5000);


    }

    function readColorFunction(){

    pubnub.publish({

                channel : 'rca01AS7262_in',
                message : {'AS7262status':'read'},
                callback : function(m){
                    console.log(m)
                }
            });


    //console.log("Spec cleared after 3 secs");
    }

    function readSpecFunction(){

    pubnub.publish({

                channel : 'c12880MA_16H00363_in',
                message : {'spec':'read'},
                callback : function(m){
                    console.log(m)
                }
            });

    //console.log("Spec reading initiated");

            //after 1 seconds stop the image take and revert back to interval
    setTimeout(function(){ 

        pubnub.publish({

                channel : 'c12880MA_16H00363_in',
                message : { 'spec': 'clear'},
                callback : function(m){
                    console.log(m)
                }
            });

        }, 3000);

    //console.log("Spec cleared after 3 secs");
    }

    function asyncImageLoader(url){
        return new Promise( (resolve, reject) => {
        var image = new Image()
        image.src = url
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('could not load image'))
        })
    }

    function loadAsyncImage(m){
 

        var image = document.images[2]; //2 corresponds to the clear image
        var downloadingImage = new Image();
        downloadingImage.onload = function(){
            image.src = this.src;   
            };




        var data = m.message[1]+"";
        var url = data.split("/")[2]+"";
        formatted_url = url.split(' ').join('%20');
        formatted_url = "https://raw.githubusercontent.com/biorealize/biorealize.github.io/master/rca01/data/" + data;
        //downloadingImage.src = formatted_url;
        console.log(formatted_url);  
                



        //downloadingImage.src = "https://www.dropbox.com/s/b4ymnx6io3oh22p/Saturday%2030%20March%202019%2002%3A20%3A12PM.jpg?raw=1";
        
        //convert message into string
        //var url = data.split("/")[2] + "";
        //formatted_url = url.split(' ').join('%20') + '?raw=1';
        //console.log(formatted_url);

        //downloadingImage.src = "https://www.dropbox.com/s/b4ymnx6io3oh22p/" + formatted_url;
        
        //downloadingImage.src = "https://www.dropbox.com/preview/BR_Imaging/" +formatted_url;
        
        //setTimeout(function(){ 



        //}, 1000);


        //downloadingImage.src = "https://www.dropbox.com/s/b4ymnx6io3oh22p/Saturday%2030%20March%202019%2002%3A20%3A12PM.jpg?raw=1";
    }

    function parseInformationfromPlatePeripheral(m){

        console.log('parsing plate peripheral information');

        document.getElementById("deviceinfo").innerHTML = 
        '<img src="images/breactor_nowell_outline_wht.svg" class="left">'+
        '<input onclick="takeImgFunction()" type="button" value="Analyze" id="takeImageButton" />'+
        '<input onclick="loadNewImgFunction()" type="button" value=" " id="previewImageButton" />'
    }

    function parseInformationfromReactor(m){

        //console.log('parsing reactor information');


        try{
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
        }
        catch(err)
            {
                ;//console.log('parsing reactor experiment info error');
            }


        //document.getElementsByClassName(".switch").style.opacity = "1"; 
        document.getElementById("button_label").style.opacity = "1"; 
        //document.getElementById("togBtn").checked=true; 

        var specFreq = m.message.run.spec_frequency;
        var spinSpeed = m.message.run.spin_speed; 
        var LidStatus = m.message.run.lid ;

        document.getElementById("devicetatus").innerHTML = 
        '<span class="label status">Spec Frequency:</span><span class="label status">'+ specFreq +
        '</span><br><span class="label status">Agitation Mode:</span><span class="label status">'+ spinSpeed +
        '</span><br><span class="label status">Lid:</span><span class="label status">'+ LidStatus +
        '</span><br>'

        currentTemp = m.message.run.current_temp ;
        
        document.getElementById("currentTemperature").innerHTML = 
        '<span class="label status">Temperature:</span><span style="color:#ff9800">'+ currentTemp +
        '</span><br>'

    }


    function UpdateButton(chkButton) {
        if (chkButton.checked){
            //console.log("checked");
            pubnub.publish({
                channel : 'rca01_in',
                message : { cmd: 'start'},
                callback : function(m){
                    callbackonsole.log(m)
                }
            });
        }
        else{
            pubnub.publish({
                channel : 'rca01_in',
                message : { cmd: 'stop'},
                callback : function(m){
                    callbackonsole.log(m)
                }
            });
            //console.log("not checked");
        }

    }