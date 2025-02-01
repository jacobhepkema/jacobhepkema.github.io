// Made by Jacob Hepkema - 2023
// First Three.js mini project, made with help from ChatGPT, copilot, 
// StackOverflow and the Three.js docs, not in that order :)

// MIT License:
// Copyright 2023 Jacob Hepkema
// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the “Software”), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.


var renderer, camera, controls, scene;
let mouse = new THREE.Vector2();

// define the matching nucleotides
const matchingNucleotide = {
    A: 'T',
    T: 'A',
    C: 'G',
    G: 'C'
};

// define the colors of the nucleotides
const colors = {
    A: 0x82cf63, // Green
    T: 0xde6254, // Red
    C: 0x82c6ed, // Blue
    G: 0xdbd63d // Yellow
};

// set the dimensions of the nucleotide box
const width = 5;
const height = 20;
const depth = 5;

function init() {
    // Could add { antialias: true } to the renderer to make it smoother, but
    // it's probably slower.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xffffff));
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    resize();
    window.onresize = resize;

    // Set up the camera to view the scene
    camera.position.z = 400;
    camera.position.y = 0;
    camera.rotation.z = -45 * Math.PI / 180;

    // Create the DNA strand
    const n_sequences = 1;
    const mid_point = n_sequences / 2;
    const spacing = 120;
    const seq_length = 200;
    const nucleotides = ['A', 'T', 'C', 'G'];

    for (let i = 0; i < n_sequences; i++) {
        // create random DNA sequence of a certain length
        let sequence = '';
        for (let j = 0; j < seq_length; j++) {
            const randomIndex = Math.floor(Math.random() * nucleotides.length);
            sequence += nucleotides[randomIndex];
        }
        createDNA(sequence, new THREE.Vector3((-sequence.length * 8) / 2, spacing * (-1 * mid_point + i), 0));
    }

    window.addEventListener('mousemove', onMouseMove, false);
}

function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function createNucleotide(nucleotide, position, rotation) {
    // create a new group to hold the nucleotide pair
    const dna = new THREE.Group();

    // create the first nucleotide box
    const box1 = new THREE.BoxGeometry(width, height, depth);
    const material1 = new THREE.MeshBasicMaterial({ color: colors[nucleotide] });
    const nucleotide1 = new THREE.Mesh(box1, material1);

    // set the position of the first nucleotide box
    nucleotide1.position.set(0, height / 2, 0);
    dna.add(nucleotide1);

    // create the second nucleotide box
    const material2 = new THREE.MeshBasicMaterial({ color: colors[matchingNucleotide[nucleotide]] });
    const nucleotide2 = new THREE.Mesh(box1, material2);

    // set the position of the second nucleotide box
    nucleotide2.position.set(0, -height / 2, 0);
    dna.add(nucleotide2);

    // set the position of the nucleotide pair group
    dna.position.copy(position);

    // add the rotation to the nucleotide pair group
    dna.rotation.x = rotation;
    dna.userData.type = 'nucleotide';
    // add the nucleotide pair group to the scene
    scene.add(dna);
}

function createBackbone(position, rotation) {
    // create a new group to hold the nucleotide pair
    const backbone = new THREE.Group();

    // create the backbone box
    const backboneWidth = 8;
    const backboneHeight = 4;
    const backboneDepth = 8;
    const backboneBox = new THREE.BoxGeometry(backboneWidth, backboneHeight, backboneDepth);
    const backboneMaterial = new THREE.MeshBasicMaterial({ color: 0x525252 });
    const backbone1 = new THREE.Mesh(backboneBox, backboneMaterial);
    const backbone2 = new THREE.Mesh(backboneBox, backboneMaterial);

    backbone1.position.set(0, height + (backboneHeight / 2), depth / 2);
    backbone2.position.set(0, -height - (backboneHeight / 2), depth / 2);

    // rotate the backbones to orient towards next nucleotide
    backbone1.rotation.y = Math.PI / 5;
    backbone2.rotation.y = -1 * Math.PI / 5;

    // add the backbone boxes to the nucleotide pair group
    backbone.add(backbone1);
    backbone.add(backbone2);

    // set the position of the nucleotide pair group
    backbone.position.copy(position);
    backbone.rotation.x = rotation;
    backbone.userData.type = 'backbone';
    scene.add(backbone);
}

function createDNA(sequence, startPosition) {
    let position = new THREE.Vector3(startPosition.x, startPosition.y, startPosition.z);
    const nucleotideWidth = 15;
    const fullTurnAngle = Math.PI * 2;
    const smallTurnAngle = fullTurnAngle / 10;
    let totalAngle = 0;
    let pos_offset_y = 0;

    for (let i = 0; i < sequence.length; i++) {
        const nucleotide = sequence[i];
        createNucleotide(nucleotide, position, totalAngle);
        createBackbone(position, totalAngle);
        position.x += nucleotideWidth;
        totalAngle += smallTurnAngle;
        position.y += pos_offset_y;
        pos_offset_y = Math.sin(totalAngle) * 10;
    }
}

// Animate the DNA rotation
function animate() {
    requestAnimationFrame(animate);
    // rotate each DNA strand separately
    scene.children.forEach((child) => {
        if (child.userData.type === 'nucleotide') {
            child.rotation.x += 0.01;
        }
        else if (child.userData.type === 'backbone') {
            child.rotation.x += 0.01;
        }
    });
    // rotate the whole scene using mouse x and y
    scene.rotation.y = THREE.MathUtils.lerp(scene.rotation.y, (mouse.x * Math.PI) / 10, 0.1)
    scene.rotation.x = THREE.MathUtils.lerp(scene.rotation.x, (mouse.y * Math.PI) / 10, 0.1)

    renderer.render(scene, camera);
}
init(); animate();
