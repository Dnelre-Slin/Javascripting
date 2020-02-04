class Movable {
	constructor() {
		let elems = document.getElementsByClassName("movable");
		this.list = [];
		for (let i = 0; i < elems.length; i++) {
			this.list[i] = {};
			this.list[i].element = elems[i];
			this.list[i].element.addEventListener("mousedown", e => this.onMouseDown(e, i));
			this.list[i].x = 0;
			this.list[i].y = 0;
		}
		this.x = 0;
		this.y = 0;
		this.index = -1;

		document.addEventListener("mousemove", e => this.onMouseMove(e));
		document.addEventListener("mouseup", e => this.onMouseUp(e));
	}

	onMouseDown(e, i) {
		this.x = e.clientX;
		this.y = e.clientY;
		this.index = i;
	}

	onMouseMove(e) {
		if (this.index >= 0)
		{
			this.list[this.index].x = e.clientX - this.x + this.list[this.index].x;
			this.list[this.index].y = e.clientY - this.y + this.list[this.index].y;
			this.list[this.index].element.style.transform = "translate(" +
				this.list[this.index].x +"px," + this.list[this.index].y +"px)";
			this.x = e.clientX;
			this.y = e.clientY;
		}
	}

	onMouseUp(e) {
		if (this.index >= 0)
		{
			/*this.list[this.index].x = e.clientX - this.x + this.list[this.index].x;
			this.list[this.index].y = e.clientY - this.y + this.list[this.index].y;
			this.list[this.index].element.style.transform = "translate(" +
				this.list[this.index].x +"px," + this.list[this.index].y +"px)";*/
			this.index = -1;
		}
	}
}

//let movable = new Movable();
new Movable();
