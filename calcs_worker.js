var mult=null,
	width=500,
	height=500,
	alive={},
	nextAlive={},
	dying={},
	found={},
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
	rightEdge=null;

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
			rightEdge=(width)*height;
			masks=[
				[-1, -1,-(height)-1],
				[0, -1,-1],
				[1, -1,(height)-1], 
				[-1, 0,-(height)],
				[1, 0,(height)],
				[-1, 1,-(height)+1],
				[0, 1,1],
				[1, 1,(height)+1]];
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
			alive=event.data[1][0];
			//console.log(frame.one.alive);
			if(event.data[1][1]!=undefined)
				dying=event.data[1][1];
			break;
		case "stopProcessing":
			if(debug)
				console.log("Stop Sent");
			frameQueue=[];
			allstop=true;
			break;
	}
}

function run(){
	if(debug)
		console.log("Process Started.");
	gameLoop();
}

function gameLoop(){
	iter_count=16;
	//while(--iter_count){
		//if(allstop || winner)
			//break;
		iter();
		//return false;
	//}
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

	found=false;
	tentative_winner=false;

	for(var i in alive)
	{
		analyzeNextLoop(i);
	}

	//forceStop=true;
		
	for(var team in teams){
		if(teams[team].newSpawns!=0)
		{
			if(found)
				tentative_winner=null;
			if(!found)
			{
				//tentative_winner=team;
				found=true;
			}
		}
		teams[team].newSpawns=0;
	}

	if(tentative_winner)
		winner=true;

	if(!winner)
		frameQueue.push([alive,teams,undefined,dying]);
	else
		frameQueue.push([alive,teams,tentative_winner]);

	dying=alive;
	alive=nextAlive;
	found={};
}
function analyzeNextLoop(index){
	var x=(index/height) | 0,
		y=index%height;

	//if(forceStop)
		//return false;

	var team=alive[index];

	/*if(x==0 || x==499)
	{
		console.log("Gen: "+genCount+"; x: "+x+"; y: "+y+";");
	}*/
	outer:
	for(var i2=0,l2=masks.length;i2<l2;++i2){
		var x2=x+masks[i2][0],
			y2=y+masks[i2][1],
			maskIndex=(index | 0)+masks[i2][2];

		if(x2<0)
		{
			x2 += width;
			maskIndex += rightEdge;
			console.log(x2 + ", " + y2 + " :: " + typeof index + " / " + maskIndex + ", " + (x2*height+y2));
		}
		else if(x2 >= width)
		{
			x2 -= width;
			maskIndex -= rightEdge;
		}
		if(y2<0)
		{
			y2 += height;
			maskIndex += height;
		}
		else if(y2 >= height)
		{
			y2 -= height;
			maskIndex -= height;
		}

			
		if(dying[maskIndex])
			continue;
		if(alive[maskIndex])
			continue;

		if(found[maskIndex]==undefined)
		{
			var count=[];
			inner:
			for(var i=0,l=masks.length;i<l;++i){
				var x4=x2+masks[i][0],
					y4=y2+masks[i][1],
					loopIndex=maskIndex+masks[i][2];

				if(x4<0)
				{
					x4 += width;
					loopIndex += rightEdge;
				}
				else if(x4 >= width)
				{
					x4 -= width;
					loopIndex -= rightEdge;
				}
				if(y4<0)
				{
					y4 += height;
					loopIndex += height;
				}
				else if(y4 >= height)
				{
					y4 -= height;
					loopIndex -= height;
				}

				if(alive[loopIndex]!=undefined){
					count.push(alive[loopIndex]);
					if(count.length==3)
						break inner;
				}
			}

			if(count.length==2){
				found[maskIndex]=true;

				if(count[0]!=count[1]/* && (count[0]!="neutral" || count[1]!="neutral")*/){
					nextAlive[maskIndex]="neutral";
					++teams["neutral"].newSpawn;
				}
				else if(count[0]==count[1]){
					nextAlive[maskIndex]=team;
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
