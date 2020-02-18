
    var pubnub = new PubNub({

        subscribeKey: "sub-c-0b2aaa44-a779-11e6-be20-0619f8945a4f",
        publishKey: "pub-c-722b1270-6c2b-423d-98f6-cb21c18a2265",
        
    });

    //node-red: once per run
    //node-red2: real-time array data
    pubnub.subscribe({ channels: ['psu01_in', 'psu01_out', 
                                  'psu01_cam_in','psu01_cam_out', 
                                  'psu01_plate_in', 'psu01_plate_out',
                                  'psu01_AS7262_in','psu01_AS7262_out',
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
            //testing the 
            if (channelName ==='psu01_out') 
            {
                //console.log("parsing info from reactor");
                //console.log(m.message);
                  //try{
                    parseInformationfromReactor(m);   
                   //}
                   // catch(err){
                    //console.log("parsing run info error");
                  //}
            }

            if ( channelName ==='psu01_cam_out') {

                //console.log(m.message);
                parseInformationfromCamera(m)
            }

            if (channelName ==='psu01_plate_out') 
            {

                  //console.log("new message from plate");
                  try{
                     parseInformationfromPlatePeripheral(m);                   }
                  catch(err){
                    ;//console.log("parsing run info error");
                  }
                  
            }
            if (channelName ==='psu01_AS7262_out') 
            {
                  //console.log(m.message);
                  parseInformationfromColorSensor(m);
                  console.log("new message from sensor");
            }
            if (channelName ==='c12880MA_16H00363_out') 
            {
                 //console.log(m.message); 
                 parseInformationfromSpec(m);
                 console.log("new message from spec");
            }



        }
        });  
 