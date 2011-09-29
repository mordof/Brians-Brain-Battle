var battlefield=document.getElementById("battlefield"),
	ctx=battlefield.getContext('2d'),
	worker=new Worker('calcs_worker.js'),
	mult=1,
	width=(500/mult)|0,
	height=(500/mult)|0,
	iter_handle=null,
	eg_iters=50,
	winner=false,
	winner_label=null,
	frameQueues=[],
	allstop=false,
	loopInit=false,
	preRender=false,
	renderComplete=false;
	mainLoop=0,
	renderLoop=0,
	prep={
		gen: 0,
		cells_alive: 0,
		cells_dead: 0
	},
	play={
		gen: 0,
		cells_alive: 0,
		cells_dead: 0
	},
	gen=0,
	teams={
		"one": {
			alive: "#40B6EC",
			dying: "#152951",
			newSpawns: 0
		},
		"two": {
			alive: "#F62F46",
			dying: "#6C141E",
			newSpawns: 0
		},
		"three": {
			alive: "#56D038",
			dying: "#215116",
			newSpawns: 0
		},
		"neutral": {
			alive: "#7F908A",
			dying: "#272822",
			newSpawns: 0
		}
	},
	alive={},
	dying={},
	dead={};

/**
 * TODO:  
 *
 * - Optimize pre-rendering (change from push/shift to unshift/pop)
 * - Add in 
 *
 *
 *
 *
 *
 *
 */

function dot(x, y, col){
	ctx.fillStyle= col;
	ctx.fillRect(x*mult, y*mult, 1*mult-(mult>2.5?0.5:0), 1*mult-(mult>2.5?0.5:0));
}

function fullDot(x, y, col){
	ctx.fillStyle= col;
	ctx.fillRect(x*mult, y*mult, 1*mult-(mult>1?0.5:0)-0.5, 1*mult-(mult>1?0.5:0)-0.5);
}

function drawalive(index){
	var x=(index/height) | 0,
		y=index%height,
		team=alive[index];

	dot(x,y,teams[team].alive);
	cellcount_alive++;
}

function drawdying(index){
	var x=(index/height) | 0,
		y=index%height,
		team=dying[index];

	dot(x,y,teams[team].dying);
	cellcount_dead++;
}

function drawdead(index){
	var x=(index/height) | 0,
		y=index%height;

	fullDot(x,y,"#000");
}

function debugData(string){
	document.getElementById("data").innerHTML=string;
}

worker.onmessage=function(event){
	switch(event.data[0]){
		case "consolelog":
			console.log(event.data[1]);
			break;
		case "consoledir":
			console.dir(event.data[1]);
			break
		case "recieveDataChunk":
			if(event.data[1].length>0){
				for(var i=0,l=event.data[1].length;i<l;++i){
					frameQueues.unshift(event.data[1][i]);
					//console.log(frame);
				};
				prep.gen=prep.gen+event.data[1].length;
				renderLoop=prep.gen;
				//console.log(event.data[1][2]);
				if(event.data[1][event.data[1].length-1][2]==undefined)
					workerData("resumeProcessing");
				else
				{
					renderComplete=true;
					console.timeEnd("benchMark time:");
				}
					
			}
			break;
		default:
			console.log(event.data[0]);
	}
}

function workerData(key, data){
	var tmparr=[];
	tmparr[0]=key;
	if(data)
		tmparr[1]=data;
	worker.postMessage(tmparr);
}

function runPreRender(){
	preRender=true;
	run();
}

function addLive(x, y, team){
	alive[x*height+y]=team;
}

function addDying(x, y, team){
	dying[x*height+y]=team;
}

function run(){
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width*mult, height*mult);

	console.time("benchMark time:");

	if(iter_handle)
		clearInterval(iter_handle);

	workerData("setMultiplier",mult);
	workerData("setTeams",teams);

	alive={};

	addLive(125, 125, "one");
	addLive(125, 126, "one");

	addLive(250, 250, "two");
	addLive(250, 251, "two");

	addLive(375, 375, "three");
	addLive(375, 376, "three");

/*
	
	alive[100,101]="two";

	alive[150,150]="three";
	alive[150,151]="three";


	alive[25,25]="one";
	alive[25,26]="one";

	alive[50,50]="two";
	alive[50,51]="two";

	alive[75,75]="three";
	alive[75,76]="three";

	alive[50,50]="one";
	alive[50,51]="one";
	alive[51,50]="one";
	alive[51,51]="one";

	dying[49,50]="one";
	dying['51-49']="one";
	dying['52-51']="one";
	dying['50-52']="one";

	alive['30-50']="two";
	alive['30-51']="two";
	alive['32-49']="two";
	alive['32-52']="two";
	alive['34-48']="two";
	alive['34-53']="two";
	alive['36-47']="two";
	alive['36-49']="two";
	alive['36-52']="two";
	alive['36-54']="two";
	alive['39-47']="two";
	alive['39-49']="two";
	alive['39-52']="two";
	alive['39-54']="two";

	dying['31-50']="two";
	dying['31-51']="two";
	dying['33-49']="two";
	dying['33-52']="two";
	dying['35-48']="two";
	dying['35-53']="two";
	dying['37-47']="two";
	dying['37-49']="two";
	dying['37-52']="two";
	dying['37-54']="two";
	dying['38-48']="two";
	dying['38-53']="two";


	alive['60-60']="two";
	alive['60-61']="two";
	alive['61-60']="two";
	alive['61-61']="two";

	dying['59-60']="two";
	dying['61-59']="two";
	dying['62-61']="two";
	dying['60-62']="two";


	alive['70-70']="three";
	alive['70-71']="three";
	alive['71-70']="three";
	alive['71-71']="three";

	dying['69-70']="three";
	dying['71-69']="three";
	dying['72-71']="three";
	dying['70-72']="three";


	alive['40-40']="two";
	alive['40-41']="two";
	alive['41-40']="two";
	alive['41-41']="two";	

	*/
	workerData("Cells",[alive,dying]);
	workerData("startProcessing");

	iter_handle=setInterval(function(){
		if(!preRender || renderComplete)
		{
			tmparr=frameQueues.pop();
			if(tmparr==undefined)
			{
				console.log('caught up to pre-render');
				return true;
			}
			alive=tmparr[0];
			dying=tmparr[3];
			//console.log(dying);
			teams=tmparr[1];
			if(tmparr[2]!=undefined){
				winner=true;
				winner_label=tmparr[2];
				clearInterval(iter_handle);
			}
			iter();
		}
		else
			debugData("PreRender Generations: "+renderLoop);
	},75);
}

function stop(){
	clearInterval(iter_handle);
	workerData("stopProcessing");
	allstop=true;
}

function iter(){
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width*mult, height*mult);
	cellcount_alive=0;
	cellcount_dead=0;

	if(!winner)
		gen++;

	document.getElementById("data").innerHTML=gen;

	// For a faded overlay and not clearing the full screen ::
	// WARNING: slow canvas drawing
	//for(var d in dead)
	//	drawdead(d);

	for(var i in alive)
		drawalive(i);
	
	for(var r in dying)
		drawdying(r);
	
	if(winner){
		//document.getElementById("data").innerHTML="WINNER: "+winner_label+"; Generations taken: "+gen+";";
		//console.timeEnd('check');
	}
	else
		{}//document.getElementById("data").innerHTML="Alive: "+ cellcount_alive+";<br/>Dead: "+cellcount_dead+";<br />Generation: "+gen+";";

	dead=dying;
}