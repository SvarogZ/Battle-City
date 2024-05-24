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
		
		this.drawObjects(timeElapsed, timeDelta);
		
		this.ctx.font = "10px Arial";
		this.ctx.fillStyle = "#22ffff";
		this.ctx.fillText(`fps:${fps}`, 10, 10);
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
		const xOffset = this.width/2;
		const yOffset = this.height/2;
		return {
			minX: this.x - xOffset,
			maxX: this.x + xOffset,
			minY: this.y - yOffset,
			maxY: this.y + yOffset,
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
		const xOffset = this.width/2;
		const yOffset = this.height/2;
		return {
			minX: this.newX - xOffset,
			maxX: this.newX + xOffset,
			minY: this.newY - yOffset,
			maxY: this.newY + yOffset,
		}
	}
	
	resetMove(){
		//decalration
	}
	
	checkOverlap(frameWidth, frameHeight, overlapObjects){
		
		const thisBondaries = this.getBondary();
		
		//check frame
		if (thisBondaries.minX < 0 || thisBondaries.maxX > frameWidth){
			this.newX = this.x;
			this.resetMove();
		}
		if (thisBondaries.minY < 0 || thisBondaries.maxY > frameHeight){
			this.newY = this.y;
			this.resetMove();
		}
		
		//check overlapping objects
		for (let obj of overlapObjects) {
			if (this.id != obj.getId()){
				const bondaries = obj.getBondary();
				if (thisBondaries.minX < bondaries.maxX && thisBondaries.maxX > bondaries.minX && thisBondaries.minY < bondaries.maxY && thisBondaries.maxY > bondaries.minY){
					const xOffset = this.width/2;
					const yOffset = this.height/2;
					if (this.x-xOffset < bondaries.maxX && this.x+xOffset > bondaries.minX){
						this.newY = this.y;
					}
					if (this.y-yOffset < bondaries.maxY && this.y+yOffset > bondaries.minY){
						this.newX = this.x;
					}
					this.resetMove();
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

class AIMesh extends DynamicMesh {
	static displayName = AIMesh.name;
	constructor(props) {
		super(props);
		this.timer = 0;
		this.maxTime = 10;
		this.control = ({
			up: false,
			down: false,
			left: false,
			right: false,
			fire: false,
		});
	}
	
	//overwrite
	resetMove(){
		this.timer = this.maxTime - 1;
	}
	
	//overwrite
	move(timeDelta){
		this.timer += timeDelta/1000;
		//console.log("AI timer: "+this.timer)
		
		if (Math.floor(this.timer)%2!=0){
			const rendonNumber = random(0, this.maxTime - this.timer);
			if (rendonNumber < 2){
				this.timer = 0;
				const rendonDirection = random(0,5);
				if (rendonDirection ==1){
					this.control.up=true;
					this.control.down=false;
					this.control.left=false;
					this.control.right=false;
				}
				else if (rendonDirection ==2){
					this.control.up=false;
					this.control.down=true;
					this.control.left=false;
					this.control.right=false;
				}
				else if (rendonDirection ==3){
					this.control.up=false;
					this.control.down=false;
					this.control.left=true;
					this.control.right=false;
				}
				else if (rendonDirection ==4){
					this.control.up=false;
					this.control.down=false;
					this.control.left=false;
					this.control.right=true;
				}
				else {
					this.control.up=false;
					this.control.down=false;
					this.control.left=false;
					this.control.right=false;
				}
			}
		}
		
		const step = Math.round(timeDelta * this.speed);
		if (this.control.up) {
			this.newY = this.y - step;
			this.moving = true;
		}
		if (this.control.down) {
			this.newY = this.y + step;
			this.moving = true;
		}
		if (this.control.right) {
			this.newX = this.x + step;
			this.moving = true;
		}
		if (this.control.left) {
			this.newX = this.x - step;
			this.moving = true;
		}
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
const obstapleObjects = [];
const gridSize = 40;

const obsticleArray = [
[1,1,0,0],
[1,0,0,1],
[1,0,1,1],
[2,0,0,1],
];

for (const i in obsticleArray) {
	for (const j in obsticleArray[i]) {
		let blockName;
		let blockColor;
		const space = obsticleArray[i][j];
		if (space == 0){
			continue;
		}
		else if (space == 1){
			blockName = "concrete";
			blockColor = "#333333";
		}
		else if (space == 2){
			blockName = "grass";
			blockColor = "#007700";
		}
		const block = new StaticMesh({
			id: blockName+"_"+i+":"+j,
			color: blockColor,
			height: gridSize,
			width: gridSize,
			x: gridSize/2+j*gridSize,
			y: gridSize/2+i*gridSize,
		});
		obstapleObjects.push(block)
	}
}

const tank1 = new ControlledMesh({
	id: "tank1",
	color: "#119900",
	height: gridSize*0.7,
	width: gridSize*0.7,
	x: 60,
	y: 180,
	speed: 0.1,
	control: control_1,
});

const tank2 = new ControlledMesh({
	id: "tank2",
	color: "#000099",
	height: gridSize*0.7,
	width: gridSize*0.7,
	x: 200,
	y: 25,
	speed: 0.2,
	control: control_2,
});

const AITank1 = new AIMesh({
	id: "AITank1",
	color: "#990000",
	height: gridSize*0.7,
	width: gridSize*0.7,
	x: 60,
	y: 65,
	speed: 0.05,
});

const objectsToShow = [...obstapleObjects,tank1,tank2,AITank1];


//-----------------------------------------------------------------//
//---Create frame-------------------------------------------------//
//-----------------------------------------------------------------//
//const screenWidth  = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)*0.95;
//const screenHeight = (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight)*0.95;
const screenWidth = 640;
const screenHeight = 480;

const frame = new MainFrame ({
	width: screenWidth,
	height: screenHeight,
	backgroundColor: "#000000",
	objects: objectsToShow,
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
