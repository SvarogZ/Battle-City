"use strict";

//-----------------------------------------------------------------//
//---Clases--------------------------------------------------------//
//-----------------------------------------------------------------//
class MainFrame {
	static displayName = MainFrame.name;
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
			obj.update(this.ctx, this.width, this.height, timeDelta, this.objects);
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
		this.id = props.id;
		this.color = props.color;
		this.height = props.height;
		this.width = props.width;
		this.x = props.x;
		this.y = props.y;
	}
	
	getId(){
		return this.id;
	}
	
	getBondary(){
		return {
			minX: this.x - this.width / 2,
			maxX: this.x + this.width / 2,
			minY: this.y - this.height / 2,
			maxY: this.y + this.height / 2,
		}
	}
	
	update(){
		//decalration
	}
}

class StaticMesh extends Mesh {
	static displayName = StaticMesh.name;
	constructor(props) {
		super(props);
	}

	draw(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
	}
	
	//overwrite
	update(ctx){
		this.draw(ctx);
	}
}

class DynamicMesh extends Mesh {
	static displayName = DynamicMesh.name;
	constructor(props) {
		super(props);
		this.speed = props.speed;
		this.moving = false;
		this.newX = this.x;
		this.newY = this.y;
	}
	
	//overwrite
	getBondary(){
		return {
			minX: this.newX - this.width / 2,
			maxX: this.newX + this.width / 2,
			minY: this.newY - this.height / 2,
			maxY: this.newY + this.height / 2,
		}
	}
	
	checkOverlap(frameWidth, frameHeight, overlapObjects){
		
		const thisBondaries = this.getBondary();
		
		//check frame
		if (thisBondaries.minX < 0 || thisBondaries.maxX > frameWidth){
			this.newX = this.x;
		}
		if (thisBondaries.minY < 0 || thisBondaries.maxY > frameHeight){
			this.newY = this.y;
		}
		
		//check overlapping objects
		for (let obj of overlapObjects) {
			if (this.id != obj.getId()){
				const bondaries = obj.getBondary();
				if (thisBondaries.minX < bondaries.maxX && thisBondaries.maxX > bondaries.minX && thisBondaries.minY < bondaries.maxY && thisBondaries.maxY > bondaries.minY){
					this.newX = this.x;
					this.newY = this.y;
					break;
				}
			}
		}
		
		this.x = this.newX;
		this.y = this.newY;
	}
	
	move(timeDelta){
		//declaration
	}

	draw(ctx){
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
	}
	
	//overwrite
	update(ctx, frameWidth, frameHeight, timeDelta, overlapObjects){
		this.move(timeDelta);
		if (this.moving) {
			this.checkOverlap(frameWidth, frameHeight, overlapObjects);
			this.moving = false;
		}
		this.draw(ctx);
	}
}

class ControlledMesh extends DynamicMesh {
	static displayName = ControlledMesh.name;
	constructor(props) {
		super(props);
		this.control = props.control;
	}
	
	//overwrite
	move(timeDelta){
		const step = Math.round(timeDelta * this.speed);
		if (this.control.upPressed) {
			this.newY = this.y - step;
			this.moving = true;
		}
		if (this.control.downPressed) {
			this.newY = this.y + step;
			this.moving = true;
		}
		if (this.control.rightPressed) {
			this.newX = this.x + step;
			this.moving = true;
		}
		if (this.control.leftPressed) {
			this.newX = this.x - step;
			this.moving = true;
		}
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
const block1 = new StaticMesh({
	id: "block1",
	color: "#1122ff",
	height: 100,
	width: 100,
	x: 100,
	y: 250,
});

const tank1 = new ControlledMesh({
	id: "tank1",
	color: "#ff22ff",
	height: 100,
	width: 100,
	x: 100,
	y: 100,
	speed: 0.1,
	control: control_1,
});

const tank2 = new ControlledMesh({
	id: "tank2",
	color: "#ffff22",
	height: 100,
	width: 100,
	x: 100,
	y: 400,
	speed: 0.2,
	control: control_2,
});

const dataToShow = [block1,tank1,tank2];


//-----------------------------------------------------------------//
//---Create frame-------------------------------------------------//
//-----------------------------------------------------------------//
const screenWidth  = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*0.95;
const screenHeight = (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight)*0.95;

const frame = new MainFrame ({
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
		
	
	frame.drawFrame(timeElapsed, timeDelta);

	previousTimeStamp = timestamp;
	window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
