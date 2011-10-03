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
	dying={};
	
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
}

function drawdying(index){
	var x=(index/height) | 0,
		y=index%height,
		team=dying[index];

	dot(x,y,teams[team].dying);
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
				};
				prep.gen=prep.gen+event.data[1].length;
				renderLoop=prep.gen;
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
	},100);
}

function stop(){
	clearInterval(iter_handle);
	workerData("stopProcessing");
	allstop=true;
}

function iter(){
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width*mult, height*mult);

	for(var i in alive)
		drawalive(i);
	
	for(var r in dying)
		drawdying(r);
	
	if(winner){
	}
	else
		{}
}