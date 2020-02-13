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
		this.x = 0;
		this.y = 0;
		this.index = -1;

		// this.centerX = 50;
		// this.centerY = 50;

		document.addEventListener("mousemove", e => this.onMouseMove(e));
		document.addEventListener("mouseup", e => this.onMouseUp(e));
	}

	onMouseDown(e, i) {
		let coords = this._getCoords(i, e.clientX, e.clientY);
		this.x = coords.x;
		this.y = coords.y;
		this.index = i;
	}

	onMouseMove(e) {
		if (this.index >= 0) {
			let coords = this._getCoords(this.index, e.clientX, e.clientY);
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

	// Private:

	_getElements() {
		return document.getElementsByClassName("movable")
	}

	_moveElement(x, y) {
		this.list[this.index].x += x - this.x;
		this.list[this.index].y += y - this.y;
		this.x = x;
		this.y = y;
		this._setTranslate(this.index, this.list[this.index].x, this.list[this.index].y);
		// this.list[this.index].element.style.transform = "translate(" +
		// 	this.list[this.index].x +"px," + this.list[this.index].y +"px)";
	}

	_setTranslate(i, x, y) {
		if (this.list[i].constraints.isX) {
			if (x < this.list[i].constraints.xTop) {
				x = this.list[i].constraints.xTop;
			} else if (x > this.list[i].constraints.xBot) {
				x = this.list[i].constraints.xBot;
			}
		}
		if (this.list[i].constraints.isY) {
			if (y < this.list[i].constraints.yTop) {
				y = this.list[i].constraints.yTop;
			} else if (y > this.list[i].constraints.yBot) {
				y = this.list[i].constraints.yBot;
			}
		}
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
		let coords = this._projectOntoLine(this.list[i].line.x1,this.list[i].line.y1,
			 					this.list[i].line.x2, this.list[i].line.x2, x, y);
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
	let projC = doProj(150, 20, 150, 200, e.clientX, e.clientY);
	let tiny = document.getElementsByClassName("tinybox")[0];
	tiny.style.transform = "translate(" +
		projC.x +"px," + projC.y +"px)";
}

document.addEventListener("mousemove", e => projTiny(e));

//let movable = new Movable();
new Movable();
let mc = new MovableConstrained();
mc.defineLine(0, 150, 20, 150, 200);
mc.setConstraints(0, true, true, 150, 20, 150, 200);
