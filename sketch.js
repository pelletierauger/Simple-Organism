let looping = true;
let socket, cnvs, ctx, canvasDOM;
let fileName = "./frames/sketch";
let maxFrames = 20;
let o;
let qtree;
let boundary;

function setup() {
    socket = io.connect('http://localhost:8080');
    cnvs = createCanvas(windowWidth, windowWidth / 16 * 9);
    ctx = cnvs.drawingContext;
    canvasDOM = document.getElementById('defaultCanvas0');
    rectMode(CENTER);
    boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
    qtree = new Quadtree(boundary, 4);
    // for (let i = 0; i < 500; i++) {
    //     let p = new Point(random(width), random(height));
    //     qtree.insert(p);
    // }
    frameRate(30);
    background(180);
    fill(0);
    noStroke();
    // stroke(0, 100);
    if (!looping) {
        noLoop();
    }
    o = new Organism();
    o.addCell({
            pos: createVector(width / 2, height / 2),
            vel: createVector(0, 0),
            size: 50
        },
        null);
}

function draw() {

    background(180);
    if (frameCount < 150 && frameCount % 5 == 0) {
        //     for (let i = 0; i < 5; i++) {
        o.grow();
        //     }
    }
    o.update();
    qtree = new Quadtree(boundary, 4);
    o.feedQTree();
    o.show();
    // qtree.show();
    if (mouseIsPressed) {
        o.addCell({
                pos: createVector(mouseX, mouseY),
                vel: createVector(0, 0),
                size: 20
            },
            null);
    }
    if (exporting && frameCount < maxFrames) {
        frameExport();
    }
}

function keyPressed() {
    if (keyCode === 32) {
        if (looping) {
            noLoop();
            looping = false;
        } else {
            loop();
            looping = true;
        }
    }
    if (key == 'o' || key == 'O') {
        // background(180);
        o.grow();
        // o.show();
    }
    if (key == 'p' || key == 'P') {
        frameExport();
    }
    if (key == 'r' || key == 'R') {
        window.location.reload();
    }
    if (key == 'm' || key == 'M') {
        redraw();
    }
}