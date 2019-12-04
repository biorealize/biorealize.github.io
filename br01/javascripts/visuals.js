
    var pubnub = new PubNub({

        subscribeKey: "sub-c-0b2aaa44-a779-11e6-be20-0619f8945a4f",
        publishKey: "pub-c-722b1270-6c2b-423d-98f6-cb21c18a2265",
        
    });

    //node-red: once per run
    //node-red2: real-time array data
    pubnub.subscribe({ channels: ['br01_in', 'br01_out', 'br01_out2', 'c12880MA_16H00363_in', 'c12880MA_16H00363_out'] });
    //xxxx_in - sends input commands to machine
    //xxxx_out - receive commands from camera
    //xxxx_out2 - receive commands from machine
    
    //in: Interface sends info to both camera module and reactor
    //out1 is for image link input from camera module
    //out2 is for data input from reactor

    pubnub.addListener({

        message: function (m) {
          var channelName = m.channel;
          console.log('message came in: ', m);


            if ( channelName ==='br01_out') {

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
            else if (channelName ==='br01_out2') 
            {
                //if (eon in m.message){
                  //console.log('parsing instruction');
                  parseInstructions(m);
                //}
            }
        }
        });  
 
  //var channel = 'node-red';
//the temperature



  
  eon.chart({
    channels: ['c12880MA_16H00363_out'],
    history: false,
    flow: false,
    generate: {
          bindto: '#spectra',
          data: {
            labels: false,
            type: "bar"
          }
    },
    legend: {
      show: false
    },
    bar: {
      width: 10
    },
    pubnub: pubnub,
    limit: 1,

    transform: function(m) {
          return {
            eon: {
            '0':m.eon.spec[0],
            '1':m.eon.spec[4],
            '2':m.eon.spec[8],
            '3':m.eon.spec[12],
            '4':m.eon.spec[16],
            '5':m.eon.spec[20],
            '6':m.eon.spec[24],
            '7':m.eon.spec[28],
            '8':m.eon.spec[32],
            '9':m.eon.spec[36],
            '10':m.eon.spec[40],
            '11':m.eon.spec[44],
            '12':m.eon.spec[48],
            '13':m.eon.spec[52],
            '14':m.eon.spec[56],
            '15':m.eon.spec[60],
            '16':m.eon.spec[64],
            '17':m.eon.spec[68],
            '18':m.eon.spec[72],
            '19':m.eon.spec[76],
            '20':m.eon.spec[80],
            '21':m.eon.spec[84],
            '22':m.eon.spec[88],
            '23':m.eon.spec[92],
            '24':m.eon.spec[96],
            '25':m.eon.spec[100],
            '26':m.eon.spec[104],
            '27':m.eon.spec[108],
            '28':m.eon.spec[112],
            '29':m.eon.spec[116],
            '30':m.eon.spec[120],
            '31':m.eon.spec[124],
            '32':m.eon.spec[128],
            '33':m.eon.spec[132],
            '34':m.eon.spec[136],
            '35':m.eon.spec[140],
            '36':m.eon.spec[144],
            '37':m.eon.spec[148],
            '38':m.eon.spec[152],
            '39':m.eon.spec[156],
            '40':m.eon.spec[160],
            '41':m.eon.spec[164],
            '42':m.eon.spec[168],
            '43':m.eon.spec[172],
            '44':m.eon.spec[176],
            '45':m.eon.spec[180],
            '46':m.eon.spec[184],
            '47':m.eon.spec[188],
            '48':m.eon.spec[192],
            '49':m.eon.spec[196],
            '50':m.eon.spec[200],
            '51':m.eon.spec[204],
            '52':m.eon.spec[208],
            '53':m.eon.spec[212],
            '54':m.eon.spec[216],
            '55':m.eon.spec[220],
            '56':m.eon.spec[224],
            '57':m.eon.spec[228],
            '58':m.eon.spec[232],
            '59':m.eon.spec[236],
            '60':m.eon.spec[240],
            '61':m.eon.spec[244],
            '62':m.eon.spec[248],
            '63':m.eon.spec[252],
            '64':m.eon.spec[256],
            '65':m.eon.spec[260],
            '66':m.eon.spec[264],
            '67':m.eon.spec[268],
            '68':m.eon.spec[272],
            '69':m.eon.spec[276],
            '70':m.eon.spec[280],
            '71':m.eon.spec[284],
            '72':m.eon.spec[287]
            }
          };
        }
  });

  //the temperature

  eon.chart({
    channels: ['br01_out2'],
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
              }//end of axis
            },//end of generated
    pubnub: pubnub,
    limit: 20,

    transform: function(m) {
      return { eon: {
        temperature: m.eon.temperature
      }}
    }
  });


  eon.chart({
    channels: ['br01_out2'],
    
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