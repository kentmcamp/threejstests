# Learning 3D Graphics on the Web with Three.js (LinkedIn Learning)

---

# Building a Simple Scene

## Introduction to Three.js

- **WebGL -** A JavaScript API that enables creation and display of 3D content inside the browser using the graphical processing unity (GPU)
    - Is a low-level API, which can make it hard to code for.
- **Three.js -** An open-source JavaScript library that abstracts away the complexity of WebGL and allows you to create real-time 3D content in a much easier manner.

## Set Up The Environment

[GitHub - mrdoob/three.js: JavaScript 3D Library.](https://github.com/mrdoob/three.js)

[three.js/build at master · mrdoob/three.js](https://github.com/mrdoob/three.js/tree/master/build)

[three.js editor](https://threejs.org/editor/)

```jsx
console.log(THREE); // This should output THREE object in the console, confirming that the library is imported correctly.
```

## Scene Essentials

- A **Scene** is a required object for all Three.js projects.
    - A Scene object is a container for other 3D objects you plan to work with.
- A **Camera** is another required object.
- A **Renderer** is the final required object. Different renderers allow for different visual effects.

```jsx
function init() {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  var renderer = new THREE.WebGLRenderer();

  // Set the size of the renderer
  renderer.setSize(window.innerWidth, window.innerHeight);

  // We need to append the rendered to the DOM
  document.getElementById("app").appendChild(renderer.domElement);
  renderer.render(scene, camera);
}

init();
```

## Populate The Scene

- 3D Objects are made of two parts:
    - The **Geometry** the defines the shape of the mesh (the verticies)
    - The **Materials** which defines the textures and shader effects projected onto the mesh.

    ```jsx
    function getBox(w,h,d) {
      var geometry = new THREE.BoxGeometry(1, 1, 1);
      var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Mesh basic material is not affected by light, so is always visible and has a constant color.
      var mesh = new THREE.Mesh(geometry, material);

      return mesh;
    }

    //then in the init function:
      var box = getBox(1, 1, 1);
      scene.add(box);
    ```

    - The above still won’t work, because both the box mesh and the camera are in position 0,0,0 (the origin). We can move the camera to see the box.

    ```jsx
    function init() {
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        1000
      );
      camera.position.z = 5;
      var renderer = new THREE.WebGLRenderer();

      // Create a box
      var box = getBox(1, 1, 1);
      scene.add(box);

      // Set the size of the renderer
      renderer.setSize(window.innerWidth, window.innerHeight);

      // We need to append the rendered to the DOM
      document.getElementById("app").appendChild(renderer.domElement);
      renderer.render(scene, camera);
    }
    ```

- Along with moving the camera’s position and rotation directly, we can use the `lookAt` method to have the camera point at specific point or object.
    - `camera.lookAt(new THREE.Vector3(0, 0, 0));`
    - `camera.lookAt(box.position);`

## Create a Good Plane

```jsx
import "./style.css";

function init() {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.x = 1;
  camera.position.y = 2;
  camera.position.z = 7;

  var renderer = new THREE.WebGLRenderer();

  // Add Objects
  var box = getBox(1, 1, 1);
  var plane = getPlane(4, 4);

  scene.add(box);
  scene.add(plane);
  box.position.y = box.geometry.parameters.height / 2; // This will make the box sit on the plane.

  plane.rotation.x = Math.PI / 2; // Three.js does not use degrees, it uses radians. So we need to convert 90 degrees to radians.

  camera.lookAt(box.position);

  // Set the size of the renderer
  renderer.setSize(window.innerWidth, window.innerHeight);

  // We need to append the rendered to the DOM
  document.getElementById("app").appendChild(renderer.domElement);
  renderer.render(scene, camera);
}

function getBox(w, h, d) {
  var geometry = new THREE.BoxGeometry(w, h, d);
  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Mesh basic material is not affected by light, so is always visible and has a constant color.
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getPlane(w, h) {
  var geometry = new THREE.PlaneGeometry(w, h);
  var material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide, // This will make the plane visible from both sides.
  });
  var mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

init();

```

# Three.js Scene Object

# Lights

# Animation

# Materials and Textures

# Geometries

# Particles

# Post-Processing
