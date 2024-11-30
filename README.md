---

# Building a Simple Scene

## Introduction to Three.js

- **WebGL -** A JavaScript API that enables creation and display of 3D content inside the browser using the graphical processing unity (GPU)
    - Is a low-level API, which can make it hard to code for.
    - WebGL operates directly on the GPU using shaders written in GLSL (OpenGL Shading Language). This is why it can feel "low-level" compared to abstracted libraries like Three.js.
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

- The **`renderer.domElement`** is essentially an **`<canvas>`** element created by Three.js

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
- It's best practice to handle window resizing dynamically by attaching a **`resize`** event listener. Without this, resizing the browser window will not update the camera aspect ratio or renderer size.

```jsx
javascriptwindow.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

## Create a Plane

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

- To convert **degrees** to **radians:**

```jsx
const toRadians = (degrees) => degrees * (Math.PI / 180);
plane.rotation.x = toRadians(90);

```

# Three.js Scene Object

## Three.js Objects

- Most objects in Three.js are instances of the object 3D base class, so they share common properties.
    - Add `return scene;` to the bottom of the init() function.
    - Change the init() call at the bottom to `var scene = init()`
    - Variables declared with var, let, or const (even at the top level of a script) are scoped to the module, not the global object. You can declare it without using `var`, `let`, or `const` , but it’s better to declare it with one of those and then add it to the window object with `window.scene = scene;`
    - Now you can type in the object name in a browser’s dev tool console to return the object’s properties.
    - Almost all objects have a property called `visible`. If you try to change the scene object to false, nothing will happen since we just rendered the 3D scene once on load. We will need to have real time rendering to do that…

## requestAnimationFrame() function

- To make real time rendering, we will need to replace this code in our scene `renderer.render(scene, camera);` with a call to a new function called `update(renderer, scene, camera);` .

    ```jsx
    // This function uses the recursion and the requestAnimationFrame to continuously render the scene, giving us real-time rendering (the framerate syncs to the display's refresh rate, probably 59 or 60)
    function update(renderer, scene, camera) {
      renderer.render(scene, camera);
      requestAnimationFrame(function() {
        update(renderer, scene, camera);
      })
    }
    ```

- Now typing `scene.visible = false` in the browser console will disable visibility of the entire scene, since the rendering of it syncs to your display’s refresh rate.

## Other Object3D Properties

### Parents and Children

- Other common 3D Object Properties are `Children` and `Parent`
    - 3D Scenes are rendered in a hierarchy where there is a parent - child relationship between objects.
    - A **Scene** is a `Parent` object to the `Children` objects inside of it.
    - You can make objects inside of a scene be the `Parent` of other objects as well.
        - This is useful since changing properties like position or rotation on the `Parent` will change any `Children` inside of it as well.

        ```jsx
          // scene.add(box); instead of adding the box to the scene, we will add the box to the plane.
          plane.add(box);
          scene.add(plane);
          // now if we move the plane, we will move the box as well.
          plane.position.y = 1;
        ```

- Transformations (position, rotation, scale) of children are relative to their parent's coordinate space.

### Name Property

- Another shared property is the `name` property. We can use it to assign name to objects, which makes it easy to reference them with the `getObjectByName()` ****method.
- We can give our plane object a name with `plane.name = 'plane-1';`
- Then we can refer to it with `getObjectByName()` and change it’s rotation in the update method. This will cause it to have an animated rotation since it’s in the update method which refreshes 60 times per second.

```jsx
function update(renderer, scene, camera) {
  renderer.render(scene, camera);

  var plane = scene.getObjectByName('plane-1');
  plane.rotation.y += 0.001;
  plane.rotation.z += 0.001;

  requestAnimationFrame(function () {
    update(renderer, scene, camera);
  });
}
```

- The `traverse()` method allows use to traverse up and down the hierarchy, allowing us to reference an object’s children and/or parents.
- The callback in **`traverse()`** is applied to all objects in the scene, including the parent itself.

```jsx
  // This will traverse through all the children of the scene and apply the function to each child. In this case, we are scaling the x-axis of each child by 0.001.
  scene.traverse(function(child) {
    child.scale.x += 0.001;
  })
```

## Add Fog To A Scene

- **`THREE.Fog(color, near, far)`** creates linear fog that starts at **`near`** and fully obscures objects at **`far`**.
- **`THREE.FogExp2(color, density)`** creates exponential fog that increases based on the density parameter.
    - `scene.fog = new THREE.FogExp2(0xffffff, 0.1);`
        - This will add fog to the scene. The first parameter is the color of the fog, and the second parameter is the density of the fog.

# Lights

## Lighting in Three.js

## Light Types

## dat.GUI

## Orbit Controls

## Shadows

## Add More Objects to the Scene

## SpotLight

## DirectionalLight

## AmbientLight

## RectAreaLight

# Animation

## Random() function

## Math.sin() and Math.cos()

## Add Noise

## Camera

## Animation Rig part 1

## Animation Rig part 2

## Tween.js

# Materials and Textures

# Geometries

# Particles

# Post-Processing
