
    var pubnub = new PubNub({

        subscribeKey: "sub-c-0b2aaa44-a779-11e6-be20-0619f8945a4f",
        publishKey: "pub-c-722b1270-6c2b-423d-98f6-cb21c18a2265",
        
    });

    //node-red: once per run
    //node-red2: real-time array data
    pubnub.subscribe({ channels: ['rca01_in', 'rca01_out', 
                                  'rca01cam_in','rca01cam_out', 
                                  'rca01plate_in', 'rca01plate_out',
                                  'rca01AS7262_in','rca01AS7262_out',
                                  'c12880MA_16H00363_in', 'c12880MA_16H00363_out'] });
    //xxxx_in - sends input commands to machine
    //xxxx_out - receive commands from camera
    //xxxx_out2 - receive commands from machine
    
    //in: Interface sends info to both camera module and reactor
    //out1 is for image link input from camera module
    //out2 is for data input from reactor

    pubnub.addListener({

        message: function (m) {
          var channelName = m.channel;

            //console.log(m.message.RAW_SCAN);



            if ( channelName ==='rca01cam_out') {

              field = String(m.message[0]);
              
                if (field ==='img_path'){

                  formatURLforNewImg(m); 

                  setTimeout(function(){ 
                      document.getElementById("previewImageButton").value="Load ->";
                      document.getElementById("previewImageButton").style="display:visible";
                   }, 500);

                  //setTimeout(function(){ 
                  //    
                  // }, 2000);

                  console.log("new path arrived");
              }
            }
            if (channelName ==='rca01_out') 
            {
                //console.log("parsing info from reactor");

                  //try{
                    parseInformationfromReactor(m);   
                   //}
                   // catch(err){
                    //console.log("parsing run info error");
                  //}
            }
            if (channelName ==='rca01plate_out') 
            {

                  //console.log("new message from plate");
                  try{
                     parseInformationfromPlatePeripheral(m);                   }
                  catch(err){
                    ;//console.log("parsing run info error");
                  }
                  
            }
            if (channelName ==='rca01AS7262_out') 
            {

                  updateColorSensorChart(m);  
                  updateColorSensorPeripheralImage();
                  console.log("new message from sensor");
            }
            if (channelName ==='c12880MA_16H00363_out') 
            {

                  updateSpecChart(m);
                  updateSpecPeripheralImage();  
                  console.log("new message from spec");
                  //console.log(m.message.RAW_SCAN);
            }



        }
        });  
 