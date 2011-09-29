var mult=null,
	width=500,
	height=500,
	frame={
		one: {
			alive: {},
			dying: {},
			found: {}
		},
		two: {
			alive: {},
			dying: {},
			found: {}
		}
	},
	frameQueue=[],
	found=false,
	tentative_winner=null,
	winner=false,
	allstop=false,
	eq=50,
	fr = "one",
	nextfr = null,
	teams=null,
	masks=null,
	sendMsg=self.postMessage,
	debug=true,
	startOutput=false,
	genCount=0,
	forceStop=false,
	loopcounter=0,
	indexShift={};

var console={};
	
console.log=function(item){
	sendMsg(["consolelog",item]);
};

console.dir=function(item){
	sendMsg(["consoledir",item]);
};

function sendDataChunk(data){
	sendMsg(["recieveDataChunk",data]);
}

self.onmessage=function(event){
	switch(event.data[0])
	{
		case "setMultiplier":
			mult=event.data[1];
			width=(width / mult)|0;
			height=(height / mult)|0;
			masks=[-(height+2)-1,
				-1,
				(height+2)-1,
				-(height+2),
				(height+2),
				-(height+2)+1,
				1,
				(height+2)+1];
			break;
		case "setTeams":
			teams=event.data[1];
			break;
		case "startProcessing":
			run();
			break;
		case "resumeProcessing":
			gameLoop();
			break;
		case "Cells":
			frame.one.alive=event.data[1][0];
			//console.log(frame.one.alive);
			if(event.data[1][1]!=undefined)
				frame.one.dying=event.data[1][1];
			break;
		case "stopProcessing":
			if(debug)
				console.log("Stop Sent");
			allstop=true;
			break;
	}
}

function createIndexShift(){
	indexShift[0/* 0*(height+2)+0 == 0 */]=width*(height+2)+height; // TL -> TB
	indexShift[height+1/* 0*(height+2)+height+1 == height+1 */]=width*(height+2)+1; // BL -> BR
	indexShift[(width+1)*(height+2)/* 0 y */]=1*(height+2)+height; // TR -> BL
	indexShift[(width+1)*(height+2)+height+1]=1*(height+2)+1; // BR -> TL

	for(var y=1;y<height+1;++y){ // Loop covering Left and Right Side. x == 0 / x == width + 1
		indexShift[y]=width*(height+2)+y; // Left to Right
		indexShift[(width+1)*(height+2)+y]=1*(height+2)+y; // Right to Left
	}
	for(var x=1;x<width+1;++x){ // Loop covering Top and Bottom Side. y == 0 / y == height + 1
		indexShift[x*(height+2)]=x*(height+2)+height; // Top to Bottom
		indexShift[x*(height+2)+(height+1)]=x*(height+2); // Bottom to Top
	}
}

function run(){
	createIndexShift();
	if(debug)
		console.log("Process Started.");
	gameLoop();
}

function gameLoop(){
	iter_count=16;
	while(--iter_count){
		if(allstop || winner)
			break;
		iter();
		fr=(fr=="one"?"two":"one");
	}
	/*if(debug){
		if(allstop)
			console.log("Process Stopped.");
		if(winner)
			console.log("Prerender Complete.");
	}*/
	
	sendDataChunk(frameQueue);
	frameQueue=[];
}

function iter(){
	if(allstop)
		return false;

	nextfr=(fr=="one"?"two":"one");

	found=false;
	tentative_winner=false;

	for(var i in frame[fr].alive)
	{
		analyzeNextLoop(i);
	}
		
	for(var team in teams){
		if(teams[team].newSpawns!=0)
		{
			if(found)
				tentative_winner=null;
			if(!found)
			{
				tentative_winner=team;
				found=true;
			}
		}
		teams[team].newSpawns=0;
	}

	if(tentative_winner)
		winner=true;

	frame[nextfr].dying=frame[fr].alive;

	if(!winner)
		frameQueue.push([frame[fr].alive,teams,undefined,frame[fr].dying]);
	else
		frameQueue.push([frame[fr].alive,teams,tentative_winner]);

	frame[fr].alive={};
	frame[fr].dying={};
	frame[fr].found={};
}

function analyzeNextLoop(mainIndex){
	//if(forceStop)
	//	return false;

	var team=frame[fr].alive[mainIndex];

	/*if(x==0 || x==499)
	{
		console.log("Gen: "+genCount+"; x: "+x+"; y: "+y+";");
	}*/
	outer:
	for(var i2=0,l2=masks.length;i2<l2;++i2){
		var maskIndex=(mainIndex|0)+masks[i2];
		
		if(indexShift[maskIndex])
			maskIndex=indexShift[maskIndex];
		if(frame[fr].dying[maskIndex])
			continue;
		if(frame[fr].alive[maskIndex])
			continue;

		if(frame[fr].found[maskIndex]==undefined)
		{
			var count=[];
			inner:
			for(var i=0,l=masks.length;i<l;++i){
				var loopIndex=maskIndex+masks[i];

				if(indexShift[loopIndex])
					loopIndex=indexShift[loopIndex];

				/*if(x==0 || x==499)
				{
					constring="Gen: "+genCount+"; x: "+x+"; y: "+y+";  | Mask: "+mask+"; x2: "+x2+"; y2: "+y2+"; Found: False;";
					conlen=constring.length;
					newlen=73-conlen;
					inner=x5+","+y5;
					innerlen=inner.length;
					correct=x4+","+y4;
					correctlen=correct.length;

					console.log(constring+repeat(" ",newlen)+"| Inner Mask: "+ x5+","+y5+";"+repeat(" ",7-innerlen)+" Corrected: "+x4+","+y4+";"+repeat(" ",8-correctlen)+"Index: "+loopIndex+"; x: "+Math.floor(loopIndex/height)+"; y:"+(loopIndex%height)+";");
				}*/

				//++loopcounter;

				if(frame[fr].alive[loopIndex]!=undefined){
					count.push(frame[fr].alive[loopIndex]);
					if(count.length==3)
						break inner;
				}
			}

			if(count.length==2){
				frame[fr].found[maskIndex]=true;

				if(count[0]!=count[1]/* && (count[0]!="neutral" || count[1]!="neutral")*/){
					frame[nextfr].alive[maskIndex]="neutral";
					++teams["neutral"].newSpawn;
				}
				else if(count[0]==count[1]){
					frame[nextfr].alive[maskIndex]=team;
					++teams[team].newSpawns;
				}
				
			}
		}
	}
}
/*
function repeat(pattern, count) {
    if (count < 1) return '';
    var result = '';
    while (count > 0) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    };
    return result;
};*/
