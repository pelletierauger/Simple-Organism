let Point = function(x, y, userData) {
    this.x = x;
    this.y = y;
    this.userData = userData;
};

let Rectangle = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
};

Rectangle.prototype.contains = function(point) {
    return (
        point.x >= this.x - this.w &&
        point.x <= this.x + this.w &&
        point.y >= this.y - this.h &&
        point.y <= this.y + this.h);
};

Rectangle.prototype.intersects = function(range) {
    let r = range;
    return !(r.x - r.w >  this.x + this.w ||
        r.x + r.w < this.x - this.w ||
        r.y - r.h > this.y + this.h ||
        r.y + r.h < this.y - this.h
    );
};

let Quadtree = function(boundary, n) {
    this.boundary = boundary;
    this.capacity = n;
    this.points = [];
    this.divided = false;
};

Quadtree.prototype.insert = function(point) {
    // console.log("Trying to insert!");
    if (!this.boundary.contains(point)) {
        return false;
    }
    if (this.points.length < this.capacity) {
        this.points.push(point);
        return true;
    } else {
        if (!this.divided) {
            this.subdivide();
        }
        if (this.northwest.insert(point)) {
            return true;
        } else if (this.northeast.insert(point)) {
            return true;
        } else if (this.southwest.insert(point)) {
            return true;
        } else if (this.southeast.insert(point)) {
            return true;
        };
    }
};

Quadtree.prototype.subdivide = function(p) {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w * 0.5;
    let h = this.boundary.h * 0.5;
    let nw = new Rectangle(x - w, y - h, w, h);
    this.northwest = new Quadtree(nw, this.capacity);
    let ne = new Rectangle(x + w, y - h, w, h);
    this.northeast = new Quadtree(ne, this.capacity);
    let sw = new Rectangle(x - w, y + h, w, h);
    this.southwest = new Quadtree(sw, this.capacity);
    let se = new Rectangle(x + w, y + h, w, h);
    this.southeast = new Quadtree(se, this.capacity);
    this.divided = true;
};

Quadtree.prototype.query = function(range, found) {
    if (!found) {
        found = [];
    }
    if (!this.boundary.intersects(range)) {
        return;
    } else {
        for (let p of this.points) {
            if (range.contains(p)) {
                found.push(p);
            }
        }
        if (this.divided) {
            this.northwest.query(range, found);
            this.northeast.query(range, found);
            this.southwest.query(range, found);
            this.southeast.query(range, found);
        }
        return found;
    }
    return found;
};

Quadtree.prototype.show = function() {
    stroke(0, 125);
    noFill();
    // ellipse(trhis.boundary.x, this.boundary.y, 2);
    rect(this.boundary.x, this.boundary.y, this.boundary.w * 2 - 0, this.boundary.h * 2 - 0);
    if (this.divided) {
        this.northwest.show();
        this.northeast.show();
        this.southwest.show();
        this.southeast.show();
    }
    fill(0);
    for (let i = 0; i < this.points.length; i++) {
        ellipse(this.points[i].x, this.points[i].y, 4);
    }
};