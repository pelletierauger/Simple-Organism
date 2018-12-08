let looping = true;
let socket, cnvs, ctx, canvasDOM;
let fileName = "./frames/sketch";
let maxFrames = 20;
let o;
let qtree;
let boundary;
let vertices;
let globalDesire;

function setup() {
    pixelDensity(1);
    socket = io.connect('http://localhost:8080');
    cnvs = createCanvas(windowWidth, windowHeight, WEBGL);

    gl = canvas.getContext('webgl');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // gl.viewport(0, 0, cnvs.width, cnvs.height);
    setShaders();

    ctx = cnvs.drawingContext;
    canvasDOM = document.getElementById('defaultCanvas0');
    // rectMode(CENTER);
    boundary = new Rectangle(0, 0, 2, 2);
    qtree = new Quadtree(boundary, 0.01);
    // for (let i = 0; i < 500; i++) {
    //     let p = new Point(random(width), random(height));
    //     qtree.insert(p);
    // }
    frameRate(30);
    if (!looping) {
        noLoop();
    }
    o = new Organism();
    for (let i = 0; i < 250; i++) {
        let v = 0.0001;
        o.addCell({
                pos: createVector(random(-1, 1), random(-1, 1)),
                vel: createVector(random(-v, v), random(-v, v)),
                size: 5
            },
            null);
    }
}

function draw() {
    globalDesire = map(sin(frameCount * 0.01), -1, 1, 0.1, 0.01);
    vertices = [];
    // vertices.push(0, 0, 0.0);
    // vertices.push(-1, 0, 0.0);
    // vertices.push(1, 0, 0.0);
    // vertices.push(0, -1, 0.0);
    // vertices.push(0, 1, 0.0);
    // if (frameCount < 50 && frameCount % 5 == 0) {
    //     o.grow();
    // }
    // for (let i = 0; i < 1; i++) {
    o.update();
    qtree = new Quadtree(boundary, 0.01);
    o.feedQTree();
    // }
    o.show();
    drawVertices();
    // qtree.show();
    if (mouseIsPressed) {
        let mX = map(mouseX, 0, width, -1, 1);
        let mY = map(mouseY, 0, height, 1, -1);
        let v = 0.0001;

        o.addCell({
                pos: createVector(mX, mY),
                vel: createVector(random(-v, v), random(-v, v)),
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