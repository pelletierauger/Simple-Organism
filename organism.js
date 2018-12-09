let Organism = function() {
    this.cells = [];
};

Organism.prototype.addCell = function(obj, parent) {
    if (this.cells.length < 10000) {
        let c = new Cell(obj, parent);
        this.cells.push(c);
    }

};

Organism.prototype.feedQTree = function() {
    for (let i = 0; i < this.cells.length; i++) {
        this.cells[i].feedQTree();
    }
};

Organism.prototype.grow = function() {
    let l = this.cells.length;
    if (l < 10000) {
        for (let i = 0; i < l; i++) {
            this.cells[i].mitosis();
        }
    }
};

Organism.prototype.update = function() {
    for (let i = this.cells.length - 1; i >= 0; i--) {
        if (this.cells[i].deleting && this.cells[i].sizeScalar <= 0) {
            this.cells.splice(i, 1);
        }
        if (this.cells[i]) {
            this.cells[i].align();
            this.cells[i].applyBehaviors();
            this.cells[i].update();
        }
    }
};

Organism.prototype.move = function() {
    for (let i = 0; i < this.cells.length; i++) {
        this.cells[i].pos.x += random(-1, 1);
        this.cells[i].pos.y += random(-1, 1);
    }
};

Organism.prototype.show = function() {
    for (let i = 0; i < this.cells.length; i++) {
        this.cells[i].show();
    }
};

Organism.prototype.deleteCells = function(n, t) {
    // t is the amount of frames over which we want to delete the cells.
    t = 1 / t;
    n = Math.min(n, this.cells.length);
    for (let i = 0; i < n; i++) {
        this.cells[i].deleting = true;
        this.cells[i].deletingFactor = t;
    }
};

let Cell = function(obj, parent) {
    this.pos = obj.pos;
    this.vel = obj.vel;
    this.acc = createVector(0, 0);

    this.maxSpeed = 0.01;
    this.maxForce = 0.02;
    this.desiredSeparation = 0.1;
    this.friction = 1.0;

    this.size = obj.size;
    this.parent = parent || null;
    this.split = false;
    this.glSize = 142;
    this.sizeScalar = 1;
    this.deleting = false;
    this.deletingFactor = null;
};

Cell.prototype.feedQTree = function() {
    let p = new Point(this.pos.x, this.pos.y, this);
    qtree.insert(p);
};

Cell.prototype.applyForce = function(force) {
    this.acc.add(force);
};

Cell.prototype.align = function() {
    let perceptionRadius = 0.05;
    // console.log("yeeah!!!");
    let steering = createVector();
    let total = 0;
    let neighbors = this.gatherNeighbors(perceptionRadius);
    if (neighbors) {
        for (let i = 0; i < neighbors.length; i++) {
            let n = neighbors[i].userData;
            steering.add(n.vel);
            total++;
        }
        if (total > 0) {
            // console.log("whoaza!");
            steering.div(total);
            // steering.mult(0.1);
            steering.setMag(this.maxSpeed);
            steering.sub(this.vel);
            steering.limit(this.maxForce);
            this.acc.add(steering);
        }
    }
};

Cell.prototype.separate = function(neighbors) {
    var desiredSeparation = this.desiredSeparation;
    var sum = new p5.Vector(0, 0);
    var count = 0;
    for (var i = 0; i < neighbors.length; i++) {
        let v = neighbors[i].userData;
        // if (v.parent !== this.parent) {
        var d = p5.Vector.dist(this.pos, v.pos);
        if (d > 0 && d < desiredSeparation) {
            // console.log("YALLOW!");
            var diff = p5.Vector.sub(this.pos, v.pos);
            diff.normalize();
            diff.div(d);
            sum.add(diff);
            count++;
        }
        // }
    }
    if (count > 0) {
        sum.div(count);
        sum.normalize;
        sum.mult(this.maxSpeed);

        var steer = p5.Vector.sub(sum, this.vel);
        steer.limit(this.maxForce);
        return (steer);
    }
    return (new p5.Vector(0, 0));
};


Cell.prototype.gatherNeighbors = function(r) {
    // console.log("gatherin!");
    let range = new Rectangle(this.pos.x, this.pos.y, r, r);
    return qtree.query(range);
};

Cell.prototype.applyBehaviors = function() {
    let repellers = this.gatherNeighbors(globalDesire);
    if (repellers) {
        // console.log(repellers);
        // for (let i = 0; i < repellers.length; i++) {
        var separateForce = this.separate(repellers);
        // var mult = repellers[i].mult;
        separateForce.mult(0.1);
        this.applyForce(separateForce);
        // }
    }
};

Cell.prototype.update = function(force) {
    // if (!this.split) {
    if (this.deleting) {
        this.sizeScalar -= this.deletingFactor;
    }
    let xSign = Math.sign(this.vel.x);
    let ySign = Math.sign(this.vel.y);
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    let padding = 0.1;
    if (this.pos.x < -padding - 1) {
        this.pos.x = 1 + padding;
    } else if (this.pos.x > 1 + padding) {
        this.pos.x = -padding - 1;
    } else if (this.pos.y < -padding - 1) {
        this.pos.y = 1 + padding;
    } else if (this.pos.y > 1 + padding) {
        this.pos.y = -padding - 1;
    }

    if (xSign !== Math.sign(this.vel.x) || ySign !== Math.sign(this.vel.y)) {
        // console.log("Looks like there was bump!");
        socket.emit('note', 220);
        this.glSize = 300;
    } else {
        this.glSize = 142;
    }
    // this.vel.mult(this.friction);
    this.acc.set(0, 0);
    // }
};

Cell.prototype.mitosis = function() {
    if (!this.split) {
        let neighbors = this.gatherNeighbors(50);
        if (neighbors && neighbors.length < 8) {
            let that = this;
            let s = this.size * 0.75
            for (let i = 0; i < TWO_PI; i += TWO_PI / 10) {
                let x = cos(i) * random(TWO_PI) * s * 5;
                let y = sin(i) * random(TWO_PI) * s * 5;
                o.addCell({
                    pos: createVector(that.pos.x, that.pos.y),
                    vel: createVector(that.vel.x + x, that.vel.y + y),
                    size: s
                }, that);
            }
            this.split = true;
        }

    }
};

Cell.prototype.show = function() {
    // ellipse(this.pos.x, this.pos.y, this.size);
    vertices.push(this.pos.x, this.pos.y, 0.0);
    sizes.push(this.glSize * this.sizeScalar);
    // if (this.parent) {
    //     line(this.pos.x, this.pos.y, this.parent.pos.x, this.parent.pos.y);
    // }
};