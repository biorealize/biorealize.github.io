

//<![CDATA[
window.onload=function(){
 	
 //dimensions of the current base image)
 	mds = Snap("#mdsDrawing");
	
	mds.attr({
            viewBox: [0, 0, 655, 330]
            });

	//var mds_bb = mds.getBBox();
	//mds.circle(mds_bb.cx+50, mds_bb.cy+50, 50);
	/*
	Snap.load('images/mds_frame.svg', function (response) {
    var mds_frame = response;
    mds.append(mds_frame);
    });
	*/
	mds_g = mds.g();

	frame = mds_g.image('images/biorealize_node_graphic.svg', 0,0, 300, 320 );


	//We get the latest temperature from the machine
	//getTempFunction();

	//Snap.load('images/mds_wheel.svg', function (response) {
    //var mds_wheel = response;
    //mds.append(mds_wheel);
    //});

    

	//wheel_group.animate({ transform: 'r45' }, 2000 );
	//var bbox = wheel_group.getBBox();
	//var t = new Snap.Matrix();

	//t.rotate(45, bbox.cx, bbox.cy); //rotate it 45 degress, around center x of triangle
	// and center y minus half the hight, to get the point were the top is.
	//wheel_group.animate({ transform: t.toTransformString()}, 2000);

	//wheel_group.animate({transform: 'r45,' + bbox.cx + ',' + bbox.cy}, 4000);
	//wheel_group.animate({ transform: "r180," + bbox.cx + ',' + bbox.cy}, 9000, mina.easeout );

	//
	//var bb = this.getBBox();

	//animate(attrs, duration, [easing], [callback])

	//wheel_group.animate({ transform: "r180," + bbox.cx + ',' + bbox.cy + "s3,3," + bbox.cx + "," + bbox.cy}, 6000);

	//wheel_group.animate({ transform: 'r2R360' }, 1000, mina.linear );

}//]]> 

function openElectroporatorLid(active){

	if (active)
		electroporatorLid.animate({ transform: 't0,-75'}, 2000, mina.easout);
	else
		electroporatorLid.animate({ transform: 't0,0'}, 2000, mina.easout);
}

function displayTemperature(newTemp){

	  document.getElementById("machineStatusBox").innerHTML =  "<span style=\"color:#355ea3\">" + "Incubator @ " + newTemp + "C"+ "</span>"; 
}

function moveSyringeToMedia(syringe, duration){

	syringebbox = syringe.node.getBoundingClientRect();

		  x = syringebbox.left;
          y = syringebbox.top;
          w = syringebbox.right - syringebbox.left;
          h = syringebbox.bottom - syringebbox.top;

	var moveDistance = 't ' + (syringebbox.left-200) + ',0';
	
	//var currentRotation = syringe.transform().string;
	//alert( currentRotation);
	//var selectedSyringe = wheel_group.select("#syringe1");

	syringe.animate({ transform: moveDistance}, duration, mina.easout);

	sendInterfaceMessage( moveDistance  );
	//sendInterfaceMessage( syringe.transform().string  );// + '&nbsp &nbsp &nbsp &nbsp' + matrixObj.y);
	//syringe.animate({ transform: 't90,' + 50}, 500, mina.easeout);

}

function moveMediaTube(angle, duration){

	//if (tubeNo==1)


	//var unloadingCarouselMatrix = new Snap.Matrix();
		//unloadingCarouselMatrix.scale(4,2);            // play with scaling before and after the rotate 
		//unloadingCarouselMatrix.translate(387,-.5);      // this translate will not be applied to the rotation
		
	//	unloadingCarousel.transform(unloadingCarouselMatrix);
		 /*
		 unloadingCarouselbbox = unloadingCarousel.node.getBoundingClientRect();//getBBox();

		  x = unloadingCarouselbbox.left;
          y = unloadingCarouselbbox.top;
          w = unloadingCarouselbbox.right - unloadingCarouselbbox.left;
          h = unloadingCarouselbbox.bottom - unloadingCarouselbbox.top;
		*/


		//wheel_group.transform('r45');
		var mediaCarouselBoundingbox =mediaCarousel.getBBox();
		//var bb = mds.getBBox();

		//var diffX = bbox.cx;
		//var diffY = bbox.cy; 

		mediaCarouselTransformAngle = "r"+ angle + "," + mediaCarouselBoundingbox.cx+ ',' + mediaCarouselBoundingbox.cy; 
	    //wheel_group.animate({ transform: '' + transformAngle}, 2000);
	    
	    //wheel_group.transform('r' + newAngle);
	    mediaCarousel.animate({ transform: '' + mediaCarouselTransformAngle}, duration, mina.easout);

			/*
	      var old_matrix = unloadingCarousel.transform().localMatrix,
		  
		  unloadingCarouselbbox = unloadingCarousel.node.getBoundingClientRect();//getBBox();

		  x = unloadingCarouselbbox.left;
          y = unloadingCarouselbbox.top;
          w = unloadingCarouselbbox.right - unloadingCarouselbbox.left;
          h = unloadingCarouselbbox.bottom - unloadingCarouselbbox.top;
			*/
		  //sendInterfaceMessage( unloadingCarousel.transform().globalMatrix.string );

		  //new_matrix = old_matrix.rotate(45, x+(w/2), y+(h/2));
		  //var new_string = new_matrix.toTransformString();

		  //unloadingCarousel.animate({ transform: new_matrix},1000, mina.easeout);	
	
		//unloadingCarouselTransform = "r"+ newAngle + "," + x+(w/2) + ',' + y+(h/2); 
		//unloadingCarousel.animate({ transform: '' + unloadingCarouselTransform}, duration, mina.easout);

		//unloadingCarousel.transform('t387,-0.5').rotate(newAngle, unloadCarouselbbox.cx, unloadCarouselbbox.cy);

		//unloadingCarouselMatrix

		//unloadingCarousel.animate({ transform: unloadingCarouselMatrix },1000, mina.easeout);	
	//var unloadCarouselbbox = unloadingCarousel.getBBox();
	//var unloadingCarouseltrans = unloadingCarousel.transform().globalMatrix;
		//console.log(unloadingCarousel.transform().globalMatrix);
	//#var x = trans.x( unloadCarouselbbox.cx, unloadCarouselbbox.cy );
	//#var y = trans.y( unloadCarouselbbox.cx, unloadCarouselbbox.cy );

	//unloadCarouselTransformAngle = "r"+ newAngle + "," + unloadCarouselbbox.cx+ ',' +  unloadCarouselbbox.cy; 
	//transformAngle = "r"+ newAngle + "," + 0+ ',' +  0 + ' ' + 't387,-.5'; 
	//unloadingCarousel.transform(unloadingCarouselMatrix);
	

}

function animateWheel(newAngle, duration){

	//wheel_group.transform('r45');
	var wbbox = wheel.getBBox();
	//var bb = mds.getBBox();

	//var diffX = bbox.cx;
	//var diffY = bbox.cy; 
	


	/*
	if (machineDriveEnabled){
		floatAngle = parseFloat(newAngle);
		//transformAngle = "r"+ (floatAngle*50) + "," + wbbox.cx+ ',' +  wbbox.cy; 
		transformAngle = "r"+ (floatAngle*50) + "," + wbbox.cx+ ',' +  wbbox.cy; 
	}
	else{
		transformAngle = "r"+ newAngle + "," + wbbox.cx+ ',' +  wbbox.cy; 
	}
	*/
    transformAngle = "r"+ newAngle + "," + wbbox.cx+ ',' +  wbbox.cy; 

    //wheel_group.animate({ transform: '' + transformAngle}, 2000);
    
    //wheel_group.transform('r' + newAngle);
    wheel_group.animate({ transform: '' + transformAngle}, duration);

    //sendInterfaceMessage( wheel_group.transform().string );
}