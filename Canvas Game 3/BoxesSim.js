var canvas = document.getElementById("outputCanvas");
var c =canvas;var ctx = canvas.getContext("2d");

var runDate= Date.now();

fArr=[//cool, functions in an array!
	function interPer(n0,percent,iter){while(iter>0){iter--;n0*=percent;}return n0;},
	function sayTime(){nowDate= Date.now();nowDate-=runDate;return nowDate/1000;}
]

//OLD \/ | NEW /\ | 12/12/2019//

function whiteout() {
	ctx.fillStyle = "rgba(255, 255, 255, 1)";
	ctx.fillRect(0,0,c.width,c.height);
}whiteout();

function cSize(wid,len) {
	c.width=wid;
	c.height=len;
	whiteout();
}

function drawline([x1,y1],[x2,y2],lnWid=1,rgb="rgb(0,0,0)",yAdjust=true) {
	y1=-y1+c.height;y2=-y2+c.height;
	ctx.beginPath();
	ctx.moveTo(x1,y1);ctx.lineTo(x2, y2);
	ctx.lineWidth=lnWid;ctx.strokeStyle=rgb;
	ctx.stroke(); 
}

function drawArr(arr=[0,100],rgb="rgb(0,0,0)",Scale=10){
	if(arr.length<2){return "too small"}
	for(i=0;i<arr.length-1;i++){
		drawline([i*Scale,arr[i]],[(i+1)*Scale,arr[i+1]],1,rgb);
	}
}

function drawGrid(xScale=50,yScale=50){//whiteout();
	lnColor="rgba(0,0,0,0.25)";
	for(ig=0;ig<c.width;ig+=xScale){drawline([ig,0],[ig,c.height],1,lnColor);}
	for(ig=0;ig<c.height;ig+=yScale){drawline([0,ig],[c.width,ig],1,lnColor);}
}



//============================================//
function rollDice(dice=[20]){
	sum=0;
	for(i=0;i<dice.length;i++){
		sum+=Math.ceil(Math.random()*dice[i]);//if(dice[i]==10||dice[i]==100){sum--;}
	}return sum;
}

function genColor(){
	return Math.floor(Math.random()*226)+25;
}

//==//
DegToRad=Math.PI/180;
RadToDeg=180/Math.PI;
accLimit=0.04;
smlNum=0.00000000001;
function cot(tanVal){return 1/Math.tan(tanVal*DegToRad);};

function className(x=0){this.x=x;};var myClass = new className();

function solidWall([x,y],wid,height,angle,acc,hid,hidDebug){
	this.pos=[x,y];
	this.posVel=[0,0];
	this.wid=wid;
	this.height=height;
	this.cenPos=[
		this.pos[0]+this.wid*0.5,
		this.pos[1]+this.height*0.5
	];
	this.excel=acc;
	this.faceAng=angle;//Math.PI
	this.hidden=hid;
	this.hidDebug=hidDebug;
	this.vecAdd=function([mag1,mag2]){
		mag3=Math.sqrt(mag1**2+mag2**2);
		if(mag3===0){return [0,0];};
		deg3=Math.acos(mag1/mag3)*RadToDeg;//console.log(deg3);
		if(mag2<0){deg3*=-1};
		return [deg3,mag3];
	}
	this.vecTPos=function([x3,y3],[angle,mag],mag2=1){
		x2=Math.cos(angle*DegToRad)*mag*mag2+x3;//console.log(x1,y1);
		y2=Math.sin(angle*DegToRad)*mag*mag2+y3;
		return [x2,y2];
	}
	this.debugLine=function([x1,y1],myVector,lnLen=1,lnWid=1,rgb="rgb(0,0,0)"){
		ctx.beginPath();
		pos2=this.vecTPos([x1,y1],myVector,lnLen);
		ctx.moveTo(x1,y1);ctx.lineTo(...pos2);
		ctx.lineWidth=lnWid;ctx.strokeStyle=rgb;
		ctx.stroke();
	}
	this.drawSelf=function(){
		if(this.hidden){return 1;}
		ctx.beginPath();
		ctx.rect(this.pos[0],this.pos[1],this.wid,this.height);
		ctx.fillStyle="black";
		ctx.fill();
		if(this.hidDebug){return 2;}
		this.debugLine(this.cenPos,[this.faceAng,20]);
		this.debugLine(this.cenPos,[0,this.posVel[0]],100,2,"red");
		this.debugLine(this.cenPos,[90,this.posVel[1]],100,2,"blue");
		this.debugLine(this.cenPos,this.vecAdd(this.posVel),100,2,"purple");
		//console.log(this.vecAdd(this.posVel),this.posVel);
		return 99;
	}
	this.newPos=function(x1,y1){
		this.faceAng%=360;
		this.pos[0]+=x1;
		this.pos[1]+=y1;
		this.cenPos=[
			this.pos[0]+this.wid*0.5,
			this.pos[1]+this.height*0.5
		];	
	}
	this.moving=function(angVel=0,magVal=0){//console.log(45);
		this.faceAng+=angVel;
		this.excel+=magVal;
		if(this.excel>accLimit){this.excel=accLimit;
		}else if(this.excel<-accLimit){this.excel=-accLimit;}
	}
	this.applyVel=function(){
		deExcel=1.5;
		if(Math.abs(this.excel)>0){this.excel/=deExcel;}
		if(Math.abs(this.excel)<0.01){this.excel=0};
		this.posVel[0]+=Math.cos(this.faceAng*DegToRad)*this.excel;
		this.posVel[1]+=Math.sin(this.faceAng*DegToRad)*this.excel;
		this.newPos(this.posVel[0],this.posVel[1]);
	}
}

function myRay(){
	this.pos=[10,200];//x,y
	this.posVel=[4,-1];
	this.posAcc=[0,-0.2];
	this.gravAcc=[0,0.01];
	this.innerBounds=[
		[c.width,0],
		[0,c.height],
		[c.width,c.height],
		[0,0]
	];
	this.updateVel=function(){
		this.pos[0]+=this.posVel[0];
		this.pos[1]+=this.posVel[1];
		this.posVel[0]+=this.posAcc[0];
		this.posVel[1]+=this.posAcc[1];
		this.posAcc[0]+=this.gravAcc[0];
		this.posAcc[1]+=this.gravAcc[1];
	}
	this.getAngle=function([va1,vm1],[va2,vm2]){
		ul1=Math.sqrt(va1**2+vm1**2);
		ul2=Math.sqrt(va2**2+vm2**2);
		vl0=va1*va2+vm1*vm2;
		angle=Math.acos(vl0/(ul1*ul2))*RadToDeg;
		return angle;
	}
	this.vecTPos=function([x3,y3],[angle,mag],mag2=1){
		x2=Math.cos(angle*DegToRad)*mag*mag2+x3;//console.log(x1,y1);
		y2=Math.sin(angle*DegToRad)*mag*mag2+y3;
		return [x2,y2];
	}
	this.drawVector=function([x1,y1],myVector,lnWid=1,rgb="rgb(0,0,0)"){
		ctx.beginPath();
		pos2=this.vecTPos([x1,y1],myVector);
		ctx.moveTo(x1,y1);ctx.lineTo(...pos2);
		ctx.lineWidth=lnWid;ctx.strokeStyle=rgb;
		ctx.stroke();
	}
	this.intSect=function([x1,y1],a1,[x2,y2],a2){
		if(a1===0){a1=smlNum;}
		if(a2===0){a2=0.1*smlNum;}
		tan1=Math.tan(a1*DegToRad);
		tan2=Math.tan(a2*DegToRad);
		ct1=1/tan1;
		ct2=1/tan2;//console.log(tan1,tan2);
		x3=(tan2*x2-tan1*x1+y1-y2)/(tan2-tan1);
		//console.log((tan2*x2-tan1*x1+y1-y2),(tan2-tan1));
		y3=(-y1*ct1+y2*ct2+x1-x2)/(ct2-ct1);
		return [x3,y3];
	}
	this.distance=function([x1,y1],[x2,y2]){
		distVal=Math.sqrt((y2-y1)**2+(x2-x1)**2);
		//if(x2<x1){distVal*=-1;}
		return distVal;
	}
	this.drawOrigin=function([x1,y1],radius=3,lnWid=1,rgb="rgb(0,0,0)"){
		ctx.beginPath();
		ctx.arc(x1,y1,radius,0,2*Math.PI);
		ctx.lineWidth=lnWid;ctx.strokeStyle=rgb;
		ctx.stroke(); 
	}
	this.reflection=function(ang1,ang2){
		mag=200
		o1=[190,140];
		o2=[140,140];
		v1=[ang1,mag];
		v2=[ang2,mag];
		ang3=-ang1;
		o3=this.intSect(o1,ang1,o2,ang2);
		mag3=mag-this.distance(o1,o3);
		if(o2[0]<o1[0]){mag3*=-1;}
		v3=[ang3,mag3];
		lWidth=5;
		lWidth2=lWidth;
		rgb1="rgb(152,63,80)";
		rgb2="rgb(63,152,110)";
		rgb3="rgb(150,30,63)";
		this.drawVector(o1,v1,lWidth,rgb1);
		this.drawVector(o2,v2,lWidth,rgb2);
		this.drawVector(o3,v3,lWidth,rgb3);
		this.drawOrigin(o1,3,lWidth2,rgb1);
		this.drawOrigin(o2,3,lWidth2,rgb2);
		this.drawOrigin(o3,3,lWidth2,rgb3);
		return [...o3,...v3];
	}
	this.boundry=function(){
		box=this.innerBounds;
		l1=[
			this.pos[0]+this.posVel[0],
			this.pos[1]+this.posVel[1]
		];
		if(l1[0]>box[2]){
			this.reflection(l1,[box[0],box[2]]);
		}
	}
	this.debugLine=function([x1,y1],[x2,y2],lnWid=1,rgb="rgb(0,0,0)"){
		ctx.beginPath();
		pos2=[x1+x2,y1+y2];
		ctx.moveTo(x1,y1);ctx.lineTo(...pos2);
		ctx.lineWidth=lnWid;ctx.strokeStyle=rgb;
		ctx.stroke();
	}
	this.drawPath=function(){
		iter=300;
		for(i=0;i<iter;i++){
			this.debugLine(this.pos,this.posVel,2);
			this.updateVel();
		}
	}
}
var testRay= new myRay();
testRay.reflection(121,89);
//==//

var drawaObj=[];

drawaObj[drawaObj.length]= new solidWall([100,100],20,20,0,0,false,false);
drawaObj[drawaObj.length]= new solidWall([150,150],40,40,0,0,false,false);

var refreshInterval;
var inputInterval;
var globalRate=50;

function controlMaster(refresh=true,input=true){
	if(refresh){controlRefresh(false);}else{controlRefresh();}
	if(input){controlInput(false);}else{controlInput();}
}

function controlRefresh(off=true,rate=globalRate){
	if(off){clearInterval(refreshInterval);return 1;}
	refreshInterval=setInterval(canvasRefresh, rate);
}
function controlInput(off=true,rate=globalRate){
	if(off){clearInterval(inputInterval);return 1;}
	inputInterval=setInterval(canvasInput, rate);
}

function canvasRefresh(){
	whiteout();
	for(i=0;i<drawaObj.length;i++){
		drawaObj[i].applyVel();
		drawaObj[i].drawSelf();
	}//console.log(98);
}
function canvasInput(){
	subject=drawaObj[0];
	if(keyPressedTF[27]){controlInput();}//esc
	if(keyPressedTF[87]){subject.moving(0,0.02);}//w
	if(keyPressedTF[83]){subject.moving(0,-0.02);}//s
	//if(keyPressedTF[68]){subject.moving(1);}//d
	//if(keyPressedTF[65]){subject.moving(-1);}//a
	if(keyPressedTF[81]){subject.moving(-1);}//q
	if(keyPressedTF[69]){subject.moving(1);}//e
	//console.log(97);
}

//=============//
var myBody=document.getElementById("myBody");
var keyPressedTF=[];

myBody.addEventListener(
	'keydown',
	function(event){
		keyPressedTF[event.which]=true;
		//console.log(keyPressedTF);
});
//
myBody.addEventListener(
	'keyup',
	function(event){
		keyPressedTF[event.which]=false;
});