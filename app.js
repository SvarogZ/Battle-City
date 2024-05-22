"use strict";

//-----------------------------------------------------------------//
//---Clases--------------------------------------------------------//
//-----------------------------------------------------------------//
class MainFraim {
	static displayName = MainFraim.name;
	constructor(props) {
		this.width = props.width;
		this.height = props.height;
		this.backgroundColor = props.backgroundColor;
		this.objects = props.objects;
		this.pause = true;
		this.manu = true;
		
		const canvas = document.getElementById('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		
		this.ctx = canvas.getContext('2d');
	}
	
	drawObjects(timeElapsed, timeDelta){
		for (let obj of this.objects) {
			obj.update(this.ctx, this.width, this.height, timeDelta);
		}
	}
	
	drawFrame(timeElapsed, timeDelta){
		const fps = Math.round(1000/timeDelta);
		
		this.ctx.fillStyle = this.backgroundColor;
		this.ctx.fillRect(0, 0, screenWidth, screenHeight);
		this.ctx.font = "10px Arial";
		this.ctx.fillStyle = "#22ffff";
		this.ctx.fillText(`fps:${fps}`, 10, 10);
	
		this.drawObjects(timeElapsed, timeDelta);
	}
}

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
		this.color = props.color;
		this.height = props.height;
		this.width = props.width;
		this.x = props.x;
		this.y = props.y;
	}
	
	update(ctx, frameWidth, frameHeight, timeDelta){
		//declaration
	}
}

class Tank extends Mesh {
	static displayName = Tank.name;
	constructor(props) {
		super(props);
		this.control = props.control;
		this.speed = props.speed;
	}
	
	checkBorder(frameWidth, frameHeight){
		const minX = 0 + this.width / 2;
		const maxX = frameWidth - this.width / 2;
		const minY = 0 + this.height / 2;
		const maxY = frameHeight - this.height / 2;
		
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
	
	move(frameWidth, frameHeight, timeDelta){
		const step = timeDelta * this.speed;
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
		
		this.checkBorder(frameWidth, frameHeight)
	}

	draw(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
	}
	
	update(ctx, frameWidth, frameHeight, timeDelta){
		this.move(frameWidth, frameHeight, timeDelta);
		this.draw(ctx);
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
	color: "#ff22ff",
	height: 100,
	width: 100,
	x: 100,
	y: 100,
	control: control_1,
	speed: 0.1,
});

const tank2 = new Tank({
	color: "#ffff22",
	height: 100,
	width: 100,
	x: 100,
	y: 300,
	control: control_2,
	speed: 0.2,
});

const dataToShow = [tank1,tank2];


//-----------------------------------------------------------------//
//---Create frame-------------------------------------------------//
//-----------------------------------------------------------------//
const screenWidth  = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*0.95;
const screenHeight = (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight)*0.95;

const frame = new MainFraim ({
	width: screenWidth,
	height: screenHeight,
	backgroundColor: "#000000",
	objects: dataToShow,
});


//-----------------------------------------------------------------//
//---Draw the frame------------------------------------------------//
//-----------------------------------------------------------------//
let start, previousTimeStamp;

function step(timestamp) {
	if (start === undefined) {
		start = timestamp;
		previousTimeStamp = timestamp;
	}
	const timeElapsed = timestamp - start;
	const timeDelta = timestamp - previousTimeStamp;
		
	
	frame.drawFrame(timeElapsed, timeDelta)

	previousTimeStamp = timestamp
	window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
