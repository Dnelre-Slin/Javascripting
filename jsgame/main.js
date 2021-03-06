class Movable {
	constructor() {
		let elems = this._getElements();
		this.list = [];
		for (let i = 0; i < elems.length; i++) {
			this.list[i] = {};
			this.list[i].element = elems[i];
			this.list[i].element.addEventListener("mousedown", e => this.onMouseDown(e, i));
			this.list[i].x = 0;
			this.list[i].y = 0;
			this.list[i].constraints = {};
			this.list[i].constraints.isX = false;
			this.list[i].constraints.isY = false;
			this.list[i].constraints.xTop = 0;
			this.list[i].constraints.xBot = 0;
			this.list[i].constraints.yTop = 0;
			this.list[i].constraints.yBot = 0;
		}
		this.offsetX = 0;
		this.offsetY = 0;
		this.index = -1;

		document.addEventListener("mousemove", e => this.onMouseMove(e));
		document.addEventListener("mouseup", e => this.onMouseUp(e));
	}

	onMouseDown(e, i) {
		e.preventDefault();
		this.offsetX = e.offsetX;
		this.offsetY = e.offsetY;
		this.index = i;
	}

	onMouseMove(e) {
		if (this.index >= 0) {
			e.preventDefault();
			let coords = this._getCoords(this.index, e.clientX - this.offsetX, e.clientY - this.offsetY);
			this._moveElement(coords.x, coords.y);
		}
	}

	onMouseUp(e) {
		if (this.index >= 0) {
			this.index = -1;
		}
	}

	setConstraints(i, isX, isY, xTop, yTop, xBot, yBot) {
		this.list[i].constraints.isX = isX;
		this.list[i].constraints.isY = isY;
		this.list[i].constraints.xTop = xTop;
		this.list[i].constraints.xBot = xBot;
		this.list[i].constraints.yTop = yTop;
		this.list[i].constraints.yBot = yBot;
	}

	setConstraintsFromPoints(i, isX, isY, x1, y1, x2, y2) {
		let xTop = x1 < x2 ? x1 : x2;
		let xBot = x1 < x2 ? x2 : x1;
		let yTop = y1 < y2 ? y1 : y2;
		let yBot = y1 < y2 ? y2 : y1;
		this.setConstraints(i, isX, isY, xTop, yTop, xBot, yBot);
	}

	getPos(i) {
		let pos = {};
		pos.x = this.list[i].x;
		pos.y = this.list[i].y;
		return pos;
	}

	// Private:

	_getElements() {
		return document.getElementsByClassName("movable")
	}

	_moveElement(x, y) {
		this.list[this.index].x = x;
		this.list[this.index].y = y;
		let res = this._constrain(this.index);
		this._setTranslate(this.index, this.list[this.index].x, this.list[this.index].y);
	}

	_constrain(i) {
		if (this.list[i].constraints.isX) {
			if (this.list[this.index].x < this.list[i].constraints.xTop) {
				this.list[this.index].x = this.list[i].constraints.xTop;
			} else if (this.list[this.index].x > this.list[i].constraints.xBot) {
				this.list[this.index].x = this.list[i].constraints.xBot;
			}
		}
		if (this.list[i].constraints.isY) {
			if (this.list[this.index].y < this.list[i].constraints.yTop) {
				this.list[this.index].y = this.list[i].constraints.yTop;
			} else if (this.list[this.index].y > this.list[i].constraints.yBot) {
				this.list[this.index].y = this.list[i].constraints.yBot;
			}
		}
	}

	_setTranslate(i, x, y) {
		this.list[i].element.style.transform = "translate(" + x +"px," + y +"px)";
	}

	_getCoords(i, x, y) {
		let coords = {};
		coords.x = x;
		coords.y = y;
		return coords;
	}
}

class MovableConstrained extends Movable {
	constructor() {
		super();
		for (let i = 0; i < this.list.length; i++) {
			this.list[i].line = {}
			this.list[i].line.x1 = 0;
			this.list[i].line.y1 = 0;
			this.list[i].line.x2 = 0;
			this.list[i].line.y2 = 0;
		}
	}

	defineLine(index, x1, y1, x2, y2) {
		this.list[index].line.x1 = x1;
		this.list[index].line.y1 = y1;
		this.list[index].line.x2 = x2;
		this.list[index].line.y2 = y2;
		this.list[index].x = x1;
		this.list[index].y = y1;
		this._setTranslate(index, x1, y1);
	}

	_getElements() {
		return document.getElementsByClassName("movableConstrained");
	}

	_getCoords(i, x, y) {
		let coords = this._projectOntoLine(this.list[i].line.x1, this.list[i].line.y1,
			 					this.list[i].line.x2, this.list[i].line.y2, x, y);
		// let coords = this._projectOntoLine(70, 70, 250, 250, x, y);
		return coords;
	}

	_projectOntoLine(p1x, p1y, p2x, p2y, x, y) {
		let t = Math.atan2(p2y-p1y, p2x-p1x);
		let c = Math.cos(t);
		let s = Math.sin(t);
		let m = -p1x*c-p1y*s;
		let res = {};
		res.x = x*c*c + y*c*s + c*m + p1x;
		res.y = x*s*c + y*s*s + s*m + p1y;
		return res;
	}
}

class MovablePinned extends MovableConstrained {
	constructor() {
		super();
		for (let i = 0; i < this.list.length; i++) {
			this.list[i].start = {};
			this.list[i].start.x = 0;
			this.list[i].start.y = 0;
			this.list[i].end = {};
			this.list[i].end.x = 0;
			this.list[i].end.y = 0;
			this.list[i].snapRadius = 0;
			this.list[i].endCallback = () => {};
			this._setTransitionEndCallback(this.list[i].element, i);
		}
	}

	definePins(index, x1, y1, x2, y2, snapRadius, endCallback = () => {}) {
		this.list[index].start.x = x1;
		this.list[index].start.y = y1;
		this.list[index].end.x = x2;
		this.list[index].end.y = y2;
		this.list[index].snapRadius = snapRadius;
		this.list[index].endCallback = endCallback;
		this.defineLine(index, x1, y1, x2, y2);
		this.setConstraintsFromPoints(index, true, true, x1, y1, x2, y2);
	}

	onMouseUp(e) {
		if (this.index >= 0) {
			this.list[this.index].element.style.transition = "transform 0.3s";
			// console.log(this.list[this.index].element.style);
			let start = this.list[this.index].start;
			let end = this.list[this.index].end;
			let x = this.list[this.index].x;
			let y = this.list[this.index].y;
			// console.log(`eEvent: clientX=${e.clientX} clientY=${e.clientY} offsetX=${e.offsetX} offsetY=${e.offsetY}`);
			if ((start.x === x && start.y === y) || (end.x === x && end.y === y)) {
				this._transEndCallback(this.index);
			}
			else if (this._withinSnapRadius(	start.x, start.y, x, y,
										this.list[this.index].snapRadius)) {
				this._moveElement(start.x, start.y);
			} else {
				this._moveElement(end.x, end.y);
			}
			// this.list[this.index].element.style.transition = "none";
			this.index = -1;
		}
	}

	_getElements() {
		return document.getElementsByClassName("movablePinned");
	}

	_withinSnapRadius(x1, y1, x2, y2, snapRadius) {
		console.log(`Pos: x1=${x1} x2=${x2} y1=${y1} y2=${y2}`);
		let dist = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		console.log("dist: " + dist);
		if (dist < snapRadius) {
			return true;
		}
		return false;
	}

	_transEndCallback(i) {
		this.list[i].element.style.transition = "none";
		if (this.list[i].end.x === this.list[i].x && this.list[i].end.y === this.list[i].y) {
			console.log("Moved to end!");
			this.list[i].endCallback();
		} else {
			console.log("Moved to start...");
		}
	}

	_setTransitionEndCallback(elem, index) {
		let tEndNames = [
			'webkitTransitionEnd',
			'transitionend',
			'oTransitionEnd otransitionend'
		]

		for (var name in tEndNames) {
			elem.addEventListener(tEndNames[name], () => this._transEndCallback(index), false);
		}
	}
}

function doProj(p1x, p1y, p2x, p2y, x, y)
{
	let t = Math.atan2(p2y-p1y, p2x-p1x);
	let c = Math.cos(t);
	let s = Math.sin(t);
	let m = -p1x*c-p1y*s;
	let res = {};
	res.x = x*c*c + y*c*s + c*m + p1x;
	res.y = x*s*c + y*s*s + s*m + p1y;
	return res;
}

function projTiny(e)
{
	let projC = doProj(500, 200, 150, 200, e.clientX, e.clientY);
	let tiny = document.getElementsByClassName("tinybox")[0];
	tiny.style.transform = "translate(" +
		projC.x +"px," + projC.y +"px)";
}

function testCB() {
	console.log("Test of callback!!! ");
}

class Paths {
	constructor(x, y, swapRadius, pathChange) {
		this.paths = [];
		this.originX = x;
		this.originY = y;
		this.swapRadius = swapRadius;
		this.pathChange = pathChange;
		this.currentPath = -1;
	}

	addPath(x, y, snapRadius, cb) {
		let path = {};
		path.endX = x;
		path.endY = y;
		path.snapRadius = snapRadius;
		path.cb = cb;
		this.paths.push(path);
		if (this.currentPath === -1) {
			this.currentPath = 0;
		}
	}

	decidePath(e, x, y) {
		let dist = this._dist(x, y, this.originX, this.originY);
		console.log("dist: " + dist + "  sr: " + this.swapRadius);
		if (dist < this.swapRadius) {
			console.log("So far so good");
			let path = this._getClosestPath(e.clientX - e.offsetX, e.clientY - e.offsetY);
			if (this.currentPath !== path) {
				this.currentPath = path;
				this.pathChange();
			}
		}
	}

	getPathAttributes() {
		let pa = {};
		pa.originX = this.originX;
		pa.originY = this.originY;
		pa.endX = this.paths[this.currentPath].endX;
		pa.endY = this.paths[this.currentPath].endY;
		pa.snapRadius = this.paths[this.currentPath].snapRadius;
		pa.cb = this.paths[this.currentPath].cb;
		return pa;
	}

	_getClosestPath(x, y) {
		if (this.paths.length > 0) {
			let index = 0;
			let closest = this._getDist(x, y, this.paths[0]);
			console.log("closest: " + closest);
			for (let i = 1; i < this.paths.length; i++) {
				let dist = this._getDist(x, y, this.paths[i]);
				console.log("dist(1): " + dist);
				if (dist < closest) {
					index = i;
					closest = dist;
				}
			}
			return index;
		}
		return undefined;
	}

	_getDist(x, y, path) {
		let res = this._doProj(this.originX, this.originY, path.endX, path.endY, x, y);
		return this._dist(res.x, res.y, x, y);
	}

	_doProj(p1x, p1y, p2x, p2y, x, y)
	{
		let t = Math.atan2(p2y-p1y, p2x-p1x);
		let c = Math.cos(t);
		let s = Math.sin(t);
		let m = -p1x*c-p1y*s;
		let res = {};
		res.x = x*c*c + y*c*s + c*m + p1x;
		res.y = x*s*c + y*s*s + s*m + p1y;
		return res;
	}

	_dist(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}
}

class Tester {
	constructor() {
		this.pathses = [];
		this.currentPathses = -1;
		this.mp = new MovablePinned();
		// this.cb0();
		document.addEventListener("mousemove", e => this.onMouseMove(e));

		let swapRadius = 30;
		this.addPathses(150, 20, swapRadius, () => this.pathChange(0));
		this.addPathsesPath(0, 150, 200, 90, () => this.setPath(1));
		this.addPathses(150, 200, swapRadius, () => this.pathChange(1));
		this.addPathsesPath(1, 150, 20, 90, (path) => this.setPath(0));
		this.addPathsesPath(1, 500, 200, 150, (path) => this.setPath(2));
		this.addPathses(500, 200, swapRadius, () => this.pathChange(2));
		this.addPathsesPath(2, 150, 200, 150, (path) => this.setPath(1));

		this.setPath(0);
	}

	onMouseMove(e) {
		let pos = this.mp.getPos(0);
		console.log(pos);
		this.pathses[this.currentPathses].decidePath(e, pos.x, pos.y);
	}

	setPath(i) {
		this.currentPathses = i;
		let pa = this.pathses[this.currentPathses].getPathAttributes();
		this.mp.definePins(0, pa.originX, pa.originY, pa.endX, pa.endY, pa.snapRadius, pa.cb);
	}

	pathChange(i) {
		this.setPath(i);
	}

	addPathses(originX, originY, swapRadius, pathChange) {
		this.pathses.push(new Paths(originX, originY, swapRadius, pathChange));
		if (this.currentPathses === -1) {
			this.currentPathses = 0;
		}
	}

	addPathsesPath(index, endX, endY, snapRadius, cb) {
		this.pathses[index].addPath(endX, endY, snapRadius, cb);
	}

	// cb0() {
	//  	this.mp.definePins(0, 150, 20, 150, 200, 90, () => this.cb1());
	// }
	// cb1() {
	//  	this.mp.definePins(0, 150, 200, 500, 200, 150, () => this.cb2());
	// }
	// cb2() {
	//  	this.mp.definePins(0, 500, 200, 150, 200, 150, () => this.cb3());
	// }
	// cb3() {
	//  	this.mp.definePins(0, 150, 200, 150, 20, 90, () => this.cb0());
	// }
}

document.addEventListener("mousemove", e => projTiny(e));

//let movable = new Movable();

// new Movable();
// let mc = new MovableConstrained();
// mc.defineLine(0, 150, 20, 150, 200);
// mc.setConstraints(0, true, true, 150, 20, 150, 200);

// let mp = new MovablePinned();
// mp.definePins(0, 150, 20, 150, 200, 90, () => testCB(mp));

// let mc = new MovableConstrained();
// mc.defineLine(0, 500, 200, 150, 200);
// mc.setConstraintsFromPoints(0, true, true, 500, 200, 150, 200);

new Tester();
