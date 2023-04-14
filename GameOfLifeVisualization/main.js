// main.js

const numRows = 100;
const numCols = 100;
const numGenerations = 1000;

let grid = create2DArray(numRows, numCols);
let nextGrid = create2DArray(numRows, numCols);

function create2DArray(rows, cols) {
    let arr = new Array(rows);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(cols).fill(0);
    }
    return arr;
}

function initializeRPentomino() {
    const midRow = Math.floor(numRows / 2);
    const midCol = Math.floor(numCols / 2);
    grid[midRow - 1][midCol] = 1;
    grid[midRow][midCol] = 1;
    grid[midRow][midCol - 1] = 1;
    grid[midRow + 1][midCol + 1] = 1;
    grid[midRow + 1][midCol] = 1;
}


function computeNextGeneration() {
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            let neighbors = countNeighbors(row, col);
            if (grid[row][col] === 1) {
                nextGrid[row][col] = neighbors === 2 || neighbors === 3 ? 1 : 0;
            } else {
                nextGrid[row][col] = neighbors === 3 ? 1 : 0;
            }
        }
    }
    grid = nextGrid.slice();
}

function countNeighbors(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let newRow = (row + i + numRows) % numRows;
            let newCol = (col + j + numCols) % numCols;
            count += grid[newRow][newCol];
        }
    }
    return count;
}

initializeRPentomino();

// main.js (continued)

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

const cubeSize = 0.8;
const gap = 0.2;

function createCube(row, col) {
    const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
    const randomMaterial = new THREE.MeshBasicMaterial({ color: randomColor });

    const cube = new THREE.Mesh(geometry, randomMaterial);
    cube.position.x = (col - numCols / 2) * (cubeSize + gap);
    cube.position.y = (row - numRows / 2) * (cubeSize + gap);
    return cube;
}


const maxGenerationsToShow = 3;

function updateCubes() {
    const objectsToRemove = [];

    scene.traverse((object) => {
        if (object.isMesh) {
            object.userData.generation += 1;
            if (object.userData.generation >= maxGenerationsToShow) {
                objectsToRemove.push(object);
            } else {
                object.position.z -= (cubeSize + gap);
                object.material.opacity = 1 - object.userData.generation / maxGenerationsToShow;
                object.material.transparent = true;
            }
        }
    });

    objectsToRemove.forEach((object) => {
        scene.remove(object);
    });

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (grid[row][col] === 1) {
                const cube = createCube(row, col);
                cube.userData.generation = 0;
                scene.add(cube);
            }
        }
    }
}


camera.position.z = numRows * (cubeSize + gap);

function animate() {

    updateCubes();
    renderer.render(scene, camera);

    requestAnimationFrame(animate);
}

animate();

// Camera controls
document.addEventListener('keydown', (event) => {
    const key = event.key;

    const moveSpeed = 1;
    const rotationSpeed = 0.1;

    if (key === 'ArrowUp') {
        camera.position.y += moveSpeed;
    } else if (key === 'ArrowDown') {
        camera.position.y -= moveSpeed;
    } else if (key === 'ArrowLeft') {
        camera.position.x -= moveSpeed;
    } else if (key === 'ArrowRight') {
        camera.position.x += moveSpeed;
    } else if (key === ' ') {
        camera.position.z -= moveSpeed;
    } else if (key === 'b') {
        camera.position.z += moveSpeed;
    } else if (key === 'a') {
        camera.rotation.y += rotationSpeed;
    } else if (key === 'd') {
        camera.rotation.y -= rotationSpeed;
    } else if (key === 's') {
        camera.rotation.x += rotationSpeed;
    } else if (key === 'f') {
        camera.rotation.x -= rotationSpeed;
    } else if (key === 'z') {
        computeNextGeneration();
    }

});
