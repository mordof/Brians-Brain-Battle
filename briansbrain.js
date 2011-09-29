var battlefield=document.getElementById("battlefield"),
	ctx=battlefield.getContext('2d'),
	mult=1,
	width=500/mult,
	height=500/mult,
	frame={
		one: {
			alive: {},
			dying: {},
			dead: {},
			found: {}
		},
		two: {
			alive: {},
			dying: {},
			dead: {},
			found: {}
		}
	},
	iter_handle=null,
	fr = "one",
	nextfr = null,
	eg_iters=50,
	winner=false,
	gen=0,
	cellcount_alive=0,
	cellcount_dead=0,
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
	masks=[
		[-1, -1],
		[0, -1],
		[1, -1], 
		[-1, 0],
		[1, 0],
		[-1, 1],
		[0, 1],
		[1, 1]
	]; 

/*  devyn's original item. the spaceship thing
frame.one.alive['30-50']=true;
frame.one.alive['30-51']=true;
frame.one.alive['32-49']=true;
frame.one.alive['32-52']=true;
frame.one.alive['34-48']=true;
frame.one.alive['34-53']=true;
frame.one.alive['36-47']=true;
frame.one.alive['36-49']=true;
frame.one.alive['36-52']=true;
frame.one.alive['36-54']=true;
frame.one.alive['39-47']=true;
frame.one.alive['39-49']=true;
frame.one.alive['39-52']=true;
frame.one.alive['39-54']=true;

frame.one.dying['31-50']=true;
frame.one.dying['31-51']=true;
frame.one.dying['33-49']=true;
frame.one.dying['33-52']=true;
frame.one.dying['35-48']=true;
frame.one.dying['35-53']=true;
frame.one.dying['37-47']=true;
frame.one.dying['37-49']=true;
frame.one.dying['37-52']=true;
frame.one.dying['37-54']=true;
frame.one.dying['38-48']=true;
frame.one.dying['38-53']=true;
*/

function dot(x, y, col){
	ctx.fillStyle= col;
	ctx.fillRect(x*mult, y*mult, 1*mult, 1*mult);
}

function calcalive(item){
	var obj=item.split("-"),
		x=parseInt(obj[0],10),
		y=parseInt(obj[1],10),
		team=frame[fr].alive[x+"-"+y];

	dot(x,y,teams[team].alive);

	cellcount_alive++;

	masks.map(function(mask){
		x2=x+mask[0];
		y2=y+mask[1];

		if(x2<0)
			x2=width + x2;
		if(x2 >= width)
			x2 = x2 - width;
		if(y2<0)
			y2=height + y2;
		if(y2 >= height)
			y2 = y2 - height;

		if(frame[fr].dying[x2+"-"+y2])
			return false;
		if(frame[fr].alive[x2+"-"+y2])
			return false;

		if(frame[fr].found[x2+"-"+y2]==undefined)
		{
			var count=[];

			for(var i=0,l=masks.length;i<l;i++){
				x4=x2+masks[i][0];
				y4=y2+masks[i][1];

				if(x4<0)
					x4=width + x4;
				if(x4 >= width)
					x4 = x4 - width;
				if(y4<0)
					y4=height + y4;
				if(y4 >= height)
					y4 = y4 - height;

				if(frame[fr].alive[x4+"-"+y4]!=undefined){
					count.push(frame[fr].alive[x4+"-"+y4]);
					if(count.length==3)
						break;
				}
					
			}

			if(count.length==2){
				frame[fr].found[x2+"-"+y2]=true;

				if(count[0]==count[1]){
					frame[nextfr].alive[x2+"-"+y2]=team;
					teams[team].newSpawns++;	
				}
				else {
					frame[nextfr].alive[x2+"-"+y2]="neutral";
					teams["neutral"].newSpawns++;
				}
				
				
			}
		}
	});
}

function drawdying(item){
	var obj=item.split("-"),
		x=obj[0],
		y=obj[1],
		team=frame[fr].dying[x+"-"+y];

	dot(x,y,teams[team].dying);
	cellcount_dead++;
}

function drawdead(item){
	var obj=item.split("-"),
		x=obj[0],
		y=obj[1];

	dot(x,y,"#000");
}

function run(){
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width*mult, height*mult);

	clearInterval(iter_handle);

	frame.one.alive={};
	frame.one.dying={};
	frame.one.found={};
	frame.two.alive={};
	frame.two.dying={};
	frame.two.found={};

	gen=0;

	if(mult==1)
	{
		frame.one.alive['50-50']="one";
		frame.one.alive['50-51']="one";

		frame.one.alive['100-100']="two";
		frame.one.alive['100-101']="two";

		frame.one.alive['150-150']="three";
		frame.one.alive['150-151']="three";

	}
	else
	{ 
		// 5 - 100x100
		frame.one.alive['25-25']="one";
		frame.one.alive['25-26']="one";

		frame.one.alive['50-50']="two";
		frame.one.alive['50-51']="two";

		frame.one.alive['75-75']="three";
		frame.one.alive['75-76']="three";
	}
	

	console.time('test');

	iter_handle=setInterval(function(){
		iter(); 
		fr=(fr=="one"?"two":"one");
	}, 10);
}

function stop(){
	clearInterval(iter_handle);
}

function iter(){
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, width*mult, height*mult);
	cellcount_alive=0;
	cellcount_dead=0;
	
	found=false;
	tentative_winner=null;
	nextfr=(fr=="one"?"two":"one");
	if(!winner)
		gen++;

	//for(var dead in frame[fr].dead){
	//	drawdead(dead);
	//}
	for(var prop in frame[fr].alive){
		calcalive(prop);
	}
	for(var prop2 in frame[fr].dying){
		drawdying(prop2);
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
	if(tentative_winner){
		winner=true;
		document.getElementById("data").innerHTML="WINNER: "+tentative_winner+"; Generations taken: "+gen+";";
		eg_iters--;
		console.timeEnd('test');
		if(eg_iters==0)
			clearInterval(iter_handle);
	}
	else
		document.getElementById("data").innerHTML="Alive: "+ cellcount_alive+";<br/>Dead: "+cellcount_dead+";<br />Generation: "+gen+";";

	//console.log(frame[fr].alive);
	frame[nextfr].dying=frame[fr].alive;
	//frame[nextfr].dead=frame[fr].dying;
	frame[fr].alive={};
	frame[fr].dying={};
	frame[fr].found={};
}