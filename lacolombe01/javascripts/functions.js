    window.onload = function(){

    document.getElementById("togBtn").checked=false; 

   }


    function takeImgFunction(){
        pubnub.publish({

                channel : 'lacolombe01s_in',
                message : { device: 'take_img'},
                callback : function(m){
                    callbackonsole.log(m)
                }
            });


    }

    function parseInstructions(m){

    	var experimentId = m.message.eon.run.syringe_id;
    	var date = m.message.eon.run.date;
    	var organismMedia = m.message.eon.run.instructions.organism_media;
    	var volume = m.message.eon.run.instructions.volume+ ' ml';
    	var targetTemperature = m.message.eon.run.instructions.target_temperature + ' C';
    	var duration = ((m.message.eon.run.instructions.duration) / 3600) + ' hrs' ;
    	//var obj2 = JSON.parse(obj.message);
    	//var obj3 = JSON.parse(obj2.eon);
    	//var temp = JSON.parse(obj3.Temperature);
        //document.getElementById("instructions").innerHTML =  "<span style=\"color:#355ea3\">" + "Syringe ID" + "</span>" + '&nbsp &nbsp &nbsp &nbsp'+ "<span style=\"color:black\">" + data + "</span>"; ; 
        
        document.getElementById("instructions").innerHTML = 
        '<br> <span class="label syringe_id">Experiment ID </span> <span class="label other">' + experimentId +  
        '</span><br><br> <span class="label date">Date</span><span class="label other">'+ date +
        '</span><br><br><span class="label organism_media">Organism + Media</span><span class="label other"> <i>'+ organismMedia +
        '</i> </span><br><br><span class="label volume">Volume</span><span class="label other">'+ volume +
        '</span><br><br><span class="label temperature">Temperature</span><span class="label other">'+ targetTemperature +
        '</span><br><br><span class="label duration">Duration</span><span class="label other">'+ duration + 
        '</span><br><br>'


        //document.getElementsByClassName(".switch").style.opacity = "1"; 
        document.getElementById("button_label").style.opacity = "1"; 
        document.getElementById("togBtn").checked=true; 

        var specFreq = m.message.eon.run.instructions.spec_interval;
        var agitationMode = m.message.eon.run.instructions.agitation_mode; 
        var LidStatus = m.message.eon.run.instructions.lid ;
        var LEDStatus = m.message.eon.run.instructions.led ;
        var UVStatus = m.message.eon.run.instructions.uv ;

        document.getElementById("devicetatus").innerHTML = 
        '<span class="label status">Spec Frequency:</span><span class="label status">'+ specFreq +
        '</span><br><span class="label status">Agitation Mode:</span><span class="label status">'+ agitationMode +
        '</span><br><span class="label status">Lid:</span><span class="label status">'+ LidStatus +
        '</span><br><span class="label status">LED:</span><span class="label status">'+ LEDStatus +
        '</span><br><span class="label status">UV:</span><span class="label status">'+ UVStatus +
        '</span><br>'

        var currentTemp = m.message.eon.temperature ;
        document.getElementById("currentTemperature").innerHTML = 
        '<span class="label status">Temperature:</span><span style="color:#ff9800">'+ currentTemp +
        '</span><br>'



    }


    function UpdateButton(chkButton) {
        if (chkButton.checked){
            //console.log("checked");
            pubnub.publish({
                channel : 'lacolombe01s_in',
                message : { device: 'start'},
                callback : function(m){
                    callbackonsole.log(m)
                }
            });
        }
        else{
            pubnub.publish({
                channel : 'lacolombe01s_in',
                message : { device: 'stop'},
                callback : function(m){
                    callbackonsole.log(m)
                }
            });
            //console.log("not checked");
        }

    }