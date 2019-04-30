    
    var pubnub = new PubNub({

        subscribeKey: "sub-c-0b2aaa44-a779-11e6-be20-0619f8945a4f",
        publishKey: "pub-c-722b1270-6c2b-423d-98f6-cb21c18a2265",
        
    });

    //node-red: once per run
    //node-red2: real-time array data
    pubnub.subscribe({ channels: ['levante01s_in', 'levante01s_out', 'levante01s_out2'] });
    
    //in: Interface sends info to both camera module and reactor
    //out1 is for image link input from camera module
    //out2 is for data input from reactor

pubnub.addListener({

        message: function (m) {
          var channelName = m.channel;
          console.log('message came in: ', m);


            if ( channelName ==='levante01s_out') {

              field = String(m.message[0]);
              
              //if (field === 'eon')
              //if (eon in m.message)
              //parseInstructions(m);
              //else if (m.message[1] + "" === m.message)
                if (field ==='img_path'){

                  loadAsyncImage(m); 

                  setTimeout(function(){ 
                      document.getElementById("previewImageButton").value=">"; 
                   }, 500);

                  console.log("new path arrived");
              }
            }
            else if (channelName ==='levante01s_out2') 
            {
                //if (eon in m.message){
                  parseInstructions(m);
                  console.log("parsing");
                //}
            }

        }
        });  

  //var channel = 'node-red';

  eon.chart({
    channels: ['node-red2'],
    xType: 'custom',
    xId: 'spectra_timestamp',
    
    generate: {
      bindto: '#spectra',
      point: {
        r: 1
      },
      data: {
        type: 'spline',
        colors: {
          spectra: 'lightblue'
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%H:%m:%S',
            fit: false
          },
          label: {
            text: 'Spectral distribution over time'
          }
        },
        y: {
          label: {
            text: 'Wavelengths',
            position: 'outer-middle'
          },
          tick: {
            format: function (d) {
              var df = Number( d3.format('.2f')(d) );
              return df;
            }
          }
        }
      }
    },
    pubnub: pubnub,
    limit: 288,
  });

  //the temperature

  eon.chart({
    channels: ['levante01s_out2'],
    generate: {
      bindto: '#temperature', //was #od
      point: {
        r: 1
      },
      data: {
        type: 'area-spline',
        colors: {
          temperature: 'deeppink'
        }
      },
      axis: {
        x: {
          type: 'timeseries',
          tick: {
            format: '%H:%m:%S',
            fit: false
          },
          label: {
            text: 'Temperature over time', //Optical density over time
          }
        },
        y: {
          label: {
            text: 'Celcius', //Absorbance
            position: 'outer-middle'
          },
          tick: {
            format: function (d) {
              var df = Number( d3.format('.2f')(d) );
              return df;
            }
          }
        }
      }
    },
    pubnub: pubnub,
    limit: 20,

    transform: function(m) {
      return { eon: {
        temperature: m.eon.temperature
      }}
    }
  });


  eon.chart({
    channels: ['levante01s_out2'],
    
    oninit: function()
    {
        d3
          .select(el)
          .select("svg")
          .append("text")
          .attr("x", "50%" )
          .attr("y", "100%")
          .style("text-anchor", "middle")
          .text("Time Elapsed");  
    },

    generate: {
      bindto: '#time',
      data: {
        type:'gauge'
      },
      gauge: {
        label: {
            format: function(value, ratio) {
                return value;
            },
            show: false // to turn off the min/max labels.
        },
        min: 0,
        max: 86400
      },
      color: {
        //pattern: ['#FF0000', '#F6C600', '#60B044'],
        pattern:['#F6C600'],
        //threshold: {
        //  values: [341, 682]
        //}
      }
    },
        pubnub: pubnub,
    limit: 30,
    transform: function(m) {

      var elapsed = m.eon.run.time_elapsed;
      //var remainingMinutes = Math.floor(remainingSeconds / 60);
    
      return { eon: {
        time_elapsed: elapsed}
      }

    }
  });