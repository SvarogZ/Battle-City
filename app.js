"use strict";

//-----------------------------------------------------------------//
//---Clases--------------------------------------------------------//
//-----------------------------------------------------------------//
class Control {
	static displayName = Control.name;
	constructor(props) {
		this.up = props.up;
		this.down = props.down;
		this.left = props.left;
		this.right = props.right;
		this.fire = props.fire;
		this.start = props.start;
		this.pause = props.pause;
	}
	
	setKey(keyName,keyStatus){
		if (keyName==this.up){
			this.upPressed = keyStatus;
		}
		else if (keyName==this.down){
			this.downPressed = keyStatus;
		}
		else if (keyName==this.left){
			this.leftPressed = keyStatus;
		} 
		else if (keyName==this.right){
			this.rightPressed = keyStatus;
		} 
		else if (keyName==this.fire){
			this.firePressed = keyStatus;
		} 
		else if (keyName==this.start){
			this.startPressed = keyStatus;
		} 
		else if (keyName==this.pause){
			this.pausePressed = keyStatus;
		} 
	}
	
	getPressed(){
		if (this.upPressed){
			console.log("up pressed")
		}
	}
}

class Mesh {
	static displayName = Mesh.name;
	constructor(props) {
		this.ctx = props.ctx;
		this.color = props.color;
		this.height = props.height;
		this.width = props.width;
		this.x = props.x;
		this.y = props.y;
	}	
}

class Tank extends Mesh {
	static displayName = Tank.name;
	constructor(props) {
		super(props);
		this.control = props.control;
		this.limitRight = props.limitRight;
		this.limitLeft = props.limitLeft;
		this.limitUp = props.limitUp;
		this.limitDown = props.limitDown;
	}
	
	checkBorder(){
		const minX = this.limitLeft + this.width/2;
		const maxX = this.limitRight - this.width/2;
		const minY = this.limitUp + this.height/2;
		const maxY = this.limitDown - this.height/2
		if (this.x < minX){
			this.x = minX;
		}
		else if (this.x > maxX){
			this.x = maxX;
		}
		if (this.y < minY){
			this.y = minY;
		}
		else if (this.y > maxY){
			this.y = maxY;
		}
	}
	
	move(timeDelta){
		const step = timeDelta/5;
		if (this.control.upPressed) {
			this.y -= step;
		}
		if (this.control.downPressed) {
			this.y += step;
		}
		if (this.control.rightPressed) {
			this.x += step;
		}
		if (this.control.leftPressed) {
			this.x -= step;
		}
		this.checkBorder()
	}

	draw(){
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
	}
	
	update(timeDelta){
		this.move(timeDelta);
		this.draw();
	}
}


//-----------------------------------------------------------------//
//---Functions-----------------------------------------------------//
//-----------------------------------------------------------------//

// function to translate hex color to rgba
// works with 6 digit numbers only
// able to shift color in the black or white direction
const hex2rgba = (hex, alpha = 1, shift = 0) => {
	const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
	return `rgba(${r+shift},${g+shift},${b+shift},${alpha})`;
}

// to get a random number from given diapason (not used in the code below)
function random(min,max,bInteger=true){
    const r = (max-min) * Math.random() + min;
	return bInteger ? Math.floor(r) : r;
}

// to translate value from one range to another (not used in the code below)
function mapper(value, smin, smax, dmin, dmax){
        return ((value-smin) / (smax-smin)) * (dmax-dmin) + dmin;
}

function drawObjects(timeDelta,dataToShow){
	for (let obj of dataToShow) {
		obj.update(timeDelta);
	}
}


//-----------------------------------------------------------------//
//---Create canvas-------------------------------------------------//
//-----------------------------------------------------------------//
const screenWidth  = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*0.95;
const screenHeight = (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight)*0.95;

const canvas = document.getElementById('canvas');
canvas.width = screenWidth;
canvas.height = screenHeight;
const ctx = canvas.getContext('2d');


//-----------------------------------------------------------------//
//---Create control------------------------------------------------//
//-----------------------------------------------------------------//
const control_1 = new Control({
	up: "ArrowUp",
	down: "ArrowDown",
	left: "ArrowLeft",
	right: "ArrowRight",
	fire: "NumpadDecimal",
	start: "Enter",
	pause: "KeyP",
});

const control_2 = new Control({
	up: "KeyW",
	down: "KeyS",
	left: "KeyA",
	right: "KeyD",
	fire: "ShiftLeft",
	start: "Enter",
	pause: "KeyP",
});

const control = [control_1,control_2]

document.onkeydown = downKey;
document.onkeyup = upKey;

function downKey(e) {
	const keyName = e.code;
	//console.log("down: "+keyName)
	for (let c of control) {
		c.setKey(keyName,true);
	}
}

function upKey(e) {
	const keyName = e.code;
	//console.log("up: "+keyName)
	for (let c of control) {
		c.setKey(keyName,false);
	}
}


//-----------------------------------------------------------------//
//---Create meshes-------------------------------------------------//
//-----------------------------------------------------------------//
const tank1 = new Tank({
	ctx: ctx,
	color: "#ff22ff",
	height: 100,
	width: 100,
	x: 100,
	y: 100,
	control: control_1,
	limitRight: canvas.width,
	limitLeft: 0,
	limitUp: 0,
	limitDown: canvas.height	
});

const tank2 = new Tank({
	ctx: ctx,
	color: "#ffff22",
	height: 100,
	width: 100,
	x: 100,
	y: 300,
	control: control_2,
	limitRight: canvas.width,
	limitLeft: 0,
	limitUp: 0,
	limitDown: canvas.height
});

const dataToShow = [tank1,tank2];


//-----------------------------------------------------------------//
//---Draw the frame------------------------------------------------//
//-----------------------------------------------------------------//
function drawFrame(ctx, timeElapsed, timeDelta){
	const fps = Math.round(1000/timeDelta);
		
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, screenWidth, screenHeight);
	ctx.font = "10px Arial";
	ctx.fillStyle = "#22ffff";
	ctx.fillText(`fps:${fps}`, 10, 10);
	
	drawObjects(timeDelta,dataToShow);
}

let start, previousTimeStamp;

function step(timestamp) {
	if (start === undefined) {
		start = timestamp;
		previousTimeStamp = timestamp;
	}
	const timeElapsed = timestamp - start;
	const timeDelta = timestamp - previousTimeStamp;
		
	drawFrame(ctx, timeElapsed, timeDelta)

	previousTimeStamp = timestamp
	window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
