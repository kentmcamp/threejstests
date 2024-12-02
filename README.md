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

- To have lighting affect the objects, we need a different type of material then the `MeshBaseMaterial()`
- In this case, we’ll use `MeshPhongMaterial()`

## Point Light

- `PointLight` - Emitted from a single point in all directions.
    - `var light = new THREE.PointLight(0xffffff, intensity)`
    - It’s a good idea to create a simple sphere or other mesh with a basic material and make it the child of the light, so you have a visual reference.

## dat.GUI

- `dat.GUI` is a library for creating user interfaces that control variables.
    - Provides a way to alter a scene values in real time.

    [dat.gui/build at master · dataarts/dat.gui](https://github.com/dataarts/dat.gui/tree/master/build)

- `var gui = new dat.GUI();` This will create a GUI
- After creating a GUI, we can add controls to it by specifying the object, the property we want to change, then the min and max values.

    ```jsx
      // GUI Controls
      gui.add(pointLight, 'intensity', 0, 10);
      gui.add(pointLight.position, 'y', 0, 5);
    ```

- For the `Y Position`, we need to reference the parent object. Since `y` is inside of pointLight’s position property, we use `pointLight.position` for the object name.

## Orbit Controls

- Allows you to rotate the camera around the scene with the mouse

    [three.js/examples/jsm/controls/OrbitControls.js at master · mrdoob/three.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js)


### OrbitControls.js

```jsx
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finger swipe

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the object orbits around
	this.target = new THREE.Vector3();

	// How far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// How far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to enable damping (inertia)
	// If damping is enabled, you must call controls.update() in your animation loop
	this.enableDamping = false;
	this.dampingFactor = 0.25;

	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
	// Set to false to disable zooming
	this.enableZoom = true;
	this.zoomSpeed = 1.0;

	// Set to false to disable rotating
	this.enableRotate = true;
	this.rotateSpeed = 1.0;

	// Set to false to disable panning
	this.enablePan = true;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	// If auto-rotate is enabled, you must call controls.update() in your animation loop
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// Set to false to disable use of the keys
	this.enableKeys = true;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	// for reset
	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	//
	// public methods
	//

	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

	};

	this.reset = function () {

		scope.target.copy( scope.target0 );
		scope.object.position.copy( scope.position0 );
		scope.object.zoom = scope.zoom0;

		scope.object.updateProjectionMatrix();
		scope.dispatchEvent( changeEvent );

		scope.update();

		state = STATE.NONE;

	};

	// this method is exposed, but perhaps it would be better if we can make it private...
	this.update = function () {

		var offset = new THREE.Vector3();

		// so camera.up is the orbit axis
		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
		var quatInverse = quat.clone().inverse();

		var lastPosition = new THREE.Vector3();
		var lastQuaternion = new THREE.Quaternion();

		return function update() {

			var position = scope.object.position;

			offset.copy( position ).sub( scope.target );

			// rotate offset to "y-axis-is-up" space
			offset.applyQuaternion( quat );

			// angle from z-axis around y-axis
			spherical.setFromVector3( offset );

			if ( scope.autoRotate && state === STATE.NONE ) {

				rotateLeft( getAutoRotationAngle() );

			}

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			// restrict theta to be between desired limits
			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

			// restrict phi to be between desired limits
			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

			spherical.makeSafe();

			spherical.radius *= scale;

			// restrict radius to be between desired limits
			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

			// move target to panned location
			scope.target.add( panOffset );

			offset.setFromSpherical( spherical );

			// rotate offset back to "camera-up-vector-is-up" space
			offset.applyQuaternion( quatInverse );

			position.copy( scope.target ).add( offset );

			scope.object.lookAt( scope.target );

			if ( scope.enableDamping === true ) {

				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

			} else {

				sphericalDelta.set( 0, 0, 0 );

			}

			scale = 1;
			panOffset.set( 0, 0, 0 );

			// update condition is:
			// min(camera displacement, camera rotation in radians)^2 > EPS
			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

			if ( zoomChanged ||
				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

				scope.dispatchEvent( changeEvent );

				lastPosition.copy( scope.object.position );
				lastQuaternion.copy( scope.object.quaternion );
				zoomChanged = false;

				return true;

			}

			return false;

		};

	}();

	this.dispose = function () {

		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
		scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );

		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		window.removeEventListener( 'keydown', onKeyDown, false );

		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

	};

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

	var state = STATE.NONE;

	var EPS = 0.000001;

	// current position in spherical coordinates
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();

	var scale = 1;
	var panOffset = new THREE.Vector3();
	var zoomChanged = false;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function rotateLeft( angle ) {

		sphericalDelta.theta -= angle;

	}

	function rotateUp( angle ) {

		sphericalDelta.phi -= angle;

	}

	var panLeft = function () {

		var v = new THREE.Vector3();

		return function panLeft( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
			v.multiplyScalar( - distance );

			panOffset.add( v );

		};

	}();

	var panUp = function () {

		var v = new THREE.Vector3();

		return function panUp( distance, objectMatrix ) {

			v.setFromMatrixColumn( objectMatrix, 1 ); // get Y column of objectMatrix
			v.multiplyScalar( distance );

			panOffset.add( v );

		};

	}();

	// deltaX and deltaY are in pixels; right and down are positive
	var pan = function () {

		var offset = new THREE.Vector3();

		return function pan( deltaX, deltaY ) {

			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

			if ( scope.object instanceof THREE.PerspectiveCamera ) {

				// perspective
				var position = scope.object.position;
				offset.copy( position ).sub( scope.target );
				var targetDistance = offset.length();

				// half of the fov is center to top of screen
				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

				// we actually don't use screenWidth, since perspective camera is fixed to screen height
				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

			} else if ( scope.object instanceof THREE.OrthographicCamera ) {

				// orthographic
				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

			} else {

				// camera neither orthographic nor perspective
				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
				scope.enablePan = false;

			}

		};

	}();

	function dollyIn( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	function dollyOut( dollyScale ) {

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			zoomChanged = true;

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
			scope.enableZoom = false;

		}

	}

	//
	// event callbacks - update the object state
	//

	function handleMouseDownRotate( event ) {

		//console.log( 'handleMouseDownRotate' );

		rotateStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownDolly( event ) {

		//console.log( 'handleMouseDownDolly' );

		dollyStart.set( event.clientX, event.clientY );

	}

	function handleMouseDownPan( event ) {

		//console.log( 'handleMouseDownPan' );

		panStart.set( event.clientX, event.clientY );

	}

	function handleMouseMoveRotate( event ) {

		//console.log( 'handleMouseMoveRotate' );

		rotateEnd.set( event.clientX, event.clientY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleMouseMoveDolly( event ) {

		//console.log( 'handleMouseMoveDolly' );

		dollyEnd.set( event.clientX, event.clientY );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyIn( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyOut( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleMouseMovePan( event ) {

		//console.log( 'handleMouseMovePan' );

		panEnd.set( event.clientX, event.clientY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleMouseUp( event ) {

		// console.log( 'handleMouseUp' );

	}

	function handleMouseWheel( event ) {

		// console.log( 'handleMouseWheel' );

		if ( event.deltaY < 0 ) {

			dollyOut( getZoomScale() );

		} else if ( event.deltaY > 0 ) {

			dollyIn( getZoomScale() );

		}

		scope.update();

	}

	function handleKeyDown( event ) {

		//console.log( 'handleKeyDown' );

		switch ( event.keyCode ) {

			case scope.keys.UP:
				pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function handleTouchStartRotate( event ) {

		//console.log( 'handleTouchStartRotate' );

		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchStartDolly( event ) {

		//console.log( 'handleTouchStartDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyStart.set( 0, distance );

	}

	function handleTouchStartPan( event ) {

		//console.log( 'handleTouchStartPan' );

		panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

	}

	function handleTouchMoveRotate( event ) {

		//console.log( 'handleTouchMoveRotate' );

		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
		rotateDelta.subVectors( rotateEnd, rotateStart );

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		// rotating across whole screen goes 360 degrees around
		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

		rotateStart.copy( rotateEnd );

		scope.update();

	}

	function handleTouchMoveDolly( event ) {

		//console.log( 'handleTouchMoveDolly' );

		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

		var distance = Math.sqrt( dx * dx + dy * dy );

		dollyEnd.set( 0, distance );

		dollyDelta.subVectors( dollyEnd, dollyStart );

		if ( dollyDelta.y > 0 ) {

			dollyOut( getZoomScale() );

		} else if ( dollyDelta.y < 0 ) {

			dollyIn( getZoomScale() );

		}

		dollyStart.copy( dollyEnd );

		scope.update();

	}

	function handleTouchMovePan( event ) {

		//console.log( 'handleTouchMovePan' );

		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

		panDelta.subVectors( panEnd, panStart );

		pan( panDelta.x, panDelta.y );

		panStart.copy( panEnd );

		scope.update();

	}

	function handleTouchEnd( event ) {

		//console.log( 'handleTouchEnd' );

	}

	//
	// event handlers - FSM: listen for events and reset state
	//

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( event.button === scope.mouseButtons.ORBIT ) {

			if ( scope.enableRotate === false ) return;

			handleMouseDownRotate( event );

			state = STATE.ROTATE;

		} else if ( event.button === scope.mouseButtons.ZOOM ) {

			if ( scope.enableZoom === false ) return;

			handleMouseDownDolly( event );

			state = STATE.DOLLY;

		} else if ( event.button === scope.mouseButtons.PAN ) {

			if ( scope.enablePan === false ) return;

			handleMouseDownPan( event );

			state = STATE.PAN;

		}

		if ( state !== STATE.NONE ) {

			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );

			scope.dispatchEvent( startEvent );

		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		if ( state === STATE.ROTATE ) {

			if ( scope.enableRotate === false ) return;

			handleMouseMoveRotate( event );

		} else if ( state === STATE.DOLLY ) {

			if ( scope.enableZoom === false ) return;

			handleMouseMoveDolly( event );

		} else if ( state === STATE.PAN ) {

			if ( scope.enablePan === false ) return;

			handleMouseMovePan( event );

		}

	}

	function onMouseUp( event ) {

		if ( scope.enabled === false ) return;

		handleMouseUp( event );

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

		event.preventDefault();
		event.stopPropagation();

		handleMouseWheel( event );

		scope.dispatchEvent( startEvent ); // not sure why these are here...
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

		handleKeyDown( event );

	}

	function onTouchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;

				handleTouchStartRotate( event );

				state = STATE.TOUCH_ROTATE;

				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;

				handleTouchStartDolly( event );

				state = STATE.TOUCH_DOLLY;

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;

				handleTouchStartPan( event );

				state = STATE.TOUCH_PAN;

				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) {

			scope.dispatchEvent( startEvent );

		}

	}

	function onTouchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.enableRotate === false ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

				handleTouchMoveRotate( event );

				break;

			case 2: // two-fingered touch: dolly

				if ( scope.enableZoom === false ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

				handleTouchMoveDolly( event );

				break;

			case 3: // three-fingered touch: pan

				if ( scope.enablePan === false ) return;
				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

				handleTouchMovePan( event );

				break;

			default:

				state = STATE.NONE;

		}

	}

	function onTouchEnd( event ) {

		if ( scope.enabled === false ) return;

		handleTouchEnd( event );

		scope.dispatchEvent( endEvent );

		state = STATE.NONE;

	}

	function onContextMenu( event ) {

		event.preventDefault();

	}

	//

	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
	scope.domElement.addEventListener( 'wheel', onMouseWheel, false );

	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start

	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

Object.defineProperties( THREE.OrbitControls.prototype, {

	center: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
			return this.target;

		}

	},

	// backward compatibility

	noZoom: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			return ! this.enableZoom;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
			this.enableZoom = ! value;

		}

	},

	noRotate: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			return ! this.enableRotate;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
			this.enableRotate = ! value;

		}

	},

	noPan: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			return ! this.enablePan;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
			this.enablePan = ! value;

		}

	},

	noKeys: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			return ! this.enableKeys;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
			this.enableKeys = ! value;

		}

	},

	staticMoving: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			return ! this.enableDamping;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
			this.enableDamping = ! value;

		}

	},

	dynamicDampingFactor: {

		get: function () {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			return this.dampingFactor;

		},

		set: function ( value ) {

			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
			this.dampingFactor = value;

		}

	}

} );
```

- Make a **`OrbitControls`** variable to instantiate the orbit controls: `var controls = new THREE.OrbitControls(camera, renderer.domElement);`
- Make `controls` an argument for the update function. Pass the controls variable to it when called in `init()`.
    - Don’t forget to put it as an argument for the recursive call inside of the update function.
- Add `controls.update()` to the function

    ```jsx
    function update(renderer, scene, camera, controls) {
      renderer.render(scene, camera);

      controls.update();

      requestAnimationFrame(function () {
        update(renderer, scene, camera, controls);
      });
    }
    ```


## Shadows

- First create shadowmap in the init() function: `renderer.shadowMap.enabled = true;`
- Then you have to set light objects to cast shadows: `light.castShadow = true`
- Set objects that should cast shadows (objects) to do so: `mesh.castShadow = true;`
- Set objects that receive shadows (floors/walls/etc.) to do so: `mesh.receiveShadow = true`

## Add More Objects to the Scene

- For further testing, the single box object was replaced by a grid of boxes, creating using the following function:

    ```jsx
    function getBoxGrid(amount, separationMultiplier) {
      var group = new THREE.Group();

      for (var i = 0; i < amount; i++) {
        var obj = getBox(1, 1, 1);

        obj.position.x = i * separationMultiplier;
        obj.position.y = obj.geometry.parameters.height / 2;
        group.add(obj);
        for (var j = 1; j < amount; j++) {
          var obj = getBox(1, 1, 1);
          obj.position.x = i * separationMultiplier;
          obj.position.y = obj.geometry.parameters.height / 2;
          obj.position.z = j * separationMultiplier;
          group.add(obj);
        }
      }
      group.position.x = -(separationMultiplier * (amount - 1)) / 2;
      group.position.z = -(separationMultiplier * (amount - 1)) / 2;

      return group;
    }
    ```


## SpotLight

- A Spot Light is a light that is emitted from a single point in a specific direction via a cone.
    - `var light = new THREE.SpotLight(0xffffff, intensity);`
- Another property, `penumbra` changes the softness of a light.
    - `gui.add(spotLight, "penumbra", 0, 1);`
- You need to adjust the bias value on the light shadow to decrease artifacts that happens to shadows when softer, more detailed lighting is applied.
- **Shadow Bias** is a small offset applied to the shadow map depth values to prevent self-shadowing artifacts. Increasing the bias can reduce `shadow acne` but can cause other artifact issues like `peter-panning` which is when shadows appeared detached from objects.
    - `light.shadow.bias = 0.001;`
- By default, shadow maps are `512 x 512` pixel resolution (this may of been updated to `1024 x 1024`. You can change it via the light’s `shadow.mapSize` width and height properties:

    ```
      light.shadow.mapSize.width = 2048;
      light.shadow.mapSize.height = 2048;
    ```


## DirectionalLight

- A Directional Light is a **parallel** light ray that is emitted from a single point in a specific direction via a cone. These are used to simulate major lights like the sun.
- `var light = new THREE.DirectionalLight(0xffffff, intensity);`
- You can change the size of the light source with `shadow.camera`

    ```
      light.shadow.camera.left = -10;
      light.shadow.camera.bottom = -10;
      light.shadow.camera.right = 5;
      light.shadow.camera.top = 5;
    ```

- This is a useful object to create a camera helper for. A camera helper is a wireframe that displays placement, scale, and rotation.
- `var helper = new THREE.CameraHelper(directionalLight.shadow.camera);`

## AmbientLight

- Ambient light is a light that is emitted from all directions. It is used to simulate the light that is reflected off the surfaces of the objects.
- `var light = new THREE.AmbientLight(rgb(10,30,50), intensity);`
    - Ambient Light does not cast shadows.

# Animation

## Random() function

- The `Math.random()` function is what it sounds like.

    ```jsx
    function update(renderer, scene, camera, controls) {
      renderer.render(scene, camera);

      var boxGrid = scene.getObjectByName("boxGrid");
      boxGrid.children.forEach(function (child) {
        child.scale.y = Math.random();
        child.position.y = child.scale.y / 2; // This will make the boxes stand on the plane.
      })

      controls.update();

      requestAnimationFrame(function () {
        update(renderer, scene, camera, controls);
      });
    }
    ```

- Don’t forget to give the object your animating a name, such as [`boxGrid.name](http://boxgrid.name/) = "boxGrid";`
    - Just because I named the variable boxGrid, does not mean that it’s name property is boxGrid, that has to be set manually.

## Math.sin() and Math.cos()

- Sine and Cosine function generate a value between minus one and one.
- We will use the `getElapsedTime()` method with `Math.sin()` to get the elapsed time since the start of the application and feed it into the sine function.
- For the getElapsedTime() you need to create a clock object  with `var clockName = new THREE.Clock();` and pass it into the update function.

    ```jsx
    function update(renderer, scene, camera, controls, clock) {
      renderer.render(scene, camera);
      controls.update();

      var timeElapsed = clock.getElapsedTime(); // Time elapsed since the javascript started running

      var boxGrid = scene.getObjectByName("boxGrid");
      boxGrid.children.forEach(function (child, index) {
        child.scale.y = (Math.sin(timeElapsed * 3 + index) + 1) / 2 + 0.001; // Sine function will give us a value between -1 and 1. We add 1 to make it between 0 and 2. Then we divide it by 2 to make it between 0 and 1. We add 0.001 to avoid the scale being 0 and the object entering the same plane as the ground plane. We can multiply the timeElapsed by a number to make the animation faster or slower, in this case 2. We also incorporated the forEach loop's index to make the animation different for each box.
        child.position.y = child.scale.y / 2;
      });

      requestAnimationFrame(function () {
        update(renderer, scene, camera, controls, clock);
      });
    }
    ```


## Add Noise

- Perlin Noise library:

    [GitHub - josephg/noisejs: Javascript 2D Perlin & Simplex noise functions](https://github.com/josephg/noisejs)

- We can change the `Math.sin()` function we used to `noise.simplex2()` which will give a random result.

    ```jsx
    function update(renderer, scene, camera, controls, clock) {
      renderer.render(scene, camera);
      controls.update();

      var timeElapsed = clock.getElapsedTime();

      var boxGrid = scene.getObjectByName("boxGrid");
      boxGrid.children.forEach(function (child, index) {
        var x = timeElapsed * 1 + index;
        child.scale.y = (noise.simplex2(x, x) + 1) / 2 + 0.001;
        child.position.y = child.scale.y / 2;
      });

      requestAnimationFrame(function () {
        update(renderer, scene, camera, controls, clock);
      });
    }
    ```

- `noise.simplex2()` takes two arguments:
    - `x` width in 2D space
    - `y` height in 2D space

## Camera

- For a **Orthographic Camera,** use this method with different arguments:

    ```jsx
      var camera = new THREE.OrthographicCamera(
        -15, // Left boundary of view frustum
        15, // Right boundary of view frustum
        15, // Top boundary of view frustum
        -15, // Bottom boundary of view frustum
        0.001, // Near Clipping Plane
        1000 // Far Clipping Plane
      );
    ```


## Animation Rig part 1

- Helper objects that facilitate the animation process. An armature for character animation is a type of animation rig.
- For our camera rig, we start by making a `group` and adding the properties we wish to transform. Notice they are added in groups in a hierarchy.

    ```jsx

      var cameraZRotation = new THREE.Group();
      var cameraZPosition = new THREE.Group();
      var cameraXRotation = new THREE.Group();
      var cameraYRotation = new THREE.Group();
      var cameraYPosition = new THREE.Group();

      cameraZRotation.name = "cameraZRotation";
      cameraZPosition.name = "cameraZPosition";
      cameraXRotation.name = "cameraXRotation";
      cameraYRotation.name = "cameraYRotation";
      cameraYPosition.name = "cameraYPosition";

      cameraZRotation.add(camera);
      cameraYPosition.add(cameraZRotation);
      cameraZPosition.add(cameraYPosition);
      cameraXRotation.add(cameraZPosition);
      cameraYRotation.add(cameraXRotation);
      scene.add(cameraYRotation);

      cameraYPosition.position.y = 1; // to have the camera above the ground
      cameraZPosition.position.z = 70;
      cameraXRotation.rotation.x = -Math.PI / 2;

      gui.add(cameraZPosition.position, 'z', 0, 100);
      gui.add(cameraYRotation.rotation, 'y', -Math.PI, Math.PI);
      gui.add(cameraXRotation.rotation, 'x', -Math.PI, Math.PI);
      gui.add(cameraZRotation.rotation, 'z', -Math.PI, Math.PI);
    ```

    - Note that three.js uses radians instead of degrees for rotation. This is because radians (the measurement around the circles’ edge) require less calculations then degrees (splitting up the circle into 360 sections).
- In the update function, we get the camera x, y, and z names we assigned the groups to animate the camera.

    ```jsx
    function update(renderer, scene, camera, controls, clock) {
      renderer.render(scene, camera);
      controls.update();

      var timeElapsed = clock.getElapsedTime();

      var cameraZPosition = scene.getObjectByName("cameraZPosition");
      var cameraZRotation = scene.getObjectByName("cameraZRotation");
      var cameraXRotation = scene.getObjectByName("cameraXRotation");

      cameraZPosition.position.z -= 0.25;
      cameraZRotation.rotation.z = noise.simplex2(timeElapsed, timeElapsed) * 0.05;
      if (cameraXRotation.rotation.x < 0) {
        cameraXRotation.rotation.x += 0.01;
      }

      var boxGrid = scene.getObjectByName("boxGrid");
      boxGrid.children.forEach(function (child, index) {
        child.scale.y = (noise.simplex2(timeElapsed + index, timeElapsed + index) + 1) / 2 + 0.001;
        child.position.y = child.scale.y / 2;
      });

      requestAnimationFrame(function () {
        update(renderer, scene, camera, controls, clock);
      });
    }
    ```


## Tween.js

- Tween.js gives you more control over the duration, timing, and style of animations using ease-in and ease-out curves.

    [GitHub - tweenjs/tween.js: JavaScript/TypeScript animation engine](https://github.com/tweenjs/tween.js)

- With `Tween.js` we don’t need to have animations in the update() function, we just need to call `TWEEN.update();` in the function, and have our animation code in the main body somewhere.
- Removed the `cameraZPosition` and `cameraXRotation` and put them in the `init()` function with `Tween.js`

    ```jsx
    new TWEEN.Tween({ val: 100 })
      .to({ val: -50 }, 12000)
      .onUpdate(function() {
        cameraZPosition.position.z = this.val;
      })
      .start();

    new TWEEN.Tween({val: -Math.PI / 2})
      .to({val: 0}, 4000)
      .delay(4000)
      .easing(TWEEN.Easing.Quintic.InOut)
      .onUpdate(function() {
        cameraXRotation.rotation.x = this.val;
      })
      .start();
    ```

    - The first argument is the starting value.
    - `.to` arguments are the ending value and the time it will take in milliseconds.
    - `.delay` is the delay before starting the animation, again in milliseconds.
    - `.easing` sets the type of animation curve. To see all curves:

        [Tween.js / graphs](https://sole.github.io/tween.js/examples/03_graphs.html)

    - `.onUpdate` takes a call back function, where you set the property you are animating based on the arguments names.
    - `.start` don’t forget to enter this to start them.

# Materials and Textures

## MeshBasicMaterial

- Here is a new function for easily getting different types of materials:

    ```jsx
    var sphereMaterial = getMaterial('basic', 'rgb(0, 0, 255)');
    var sphere = getSphere(sphereMaterial, 1, 24);

    var planeMaterial = getMaterial('basic', 'rgb(255, 0, 0)');
    var plane = getPlane(planeMaterial, 30);

    function getMaterial(type, color) {
    	var selectedMaterial;
    	var materialOptions = {
    		color: color === undefined ? 'rgb(255, 255, 255)' : color,
    	};

    	switch (type) {
    		case 'basic':
    			selectedMaterial = new THREE.MeshBasicMaterial(materialOions);
    			break;
    		case 'lambert':
    			selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);
    			break;
    		case 'phong':
    			selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);
    			break;
    		case 'standard':
    			selectedMaterial = new THREE.MeshStandardMaterial(materialOptions);
    			break;
    		default:
    			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
    			break;
    	}

    	return selectedMaterial;
    }
    ```

- `MeshBasicMaterial` - Most basic material in Three.js. Doesn't react to light. Renders the geometry with a solid color or texture, making it useful for flat, non-realistic objects or debugging purposes.
    - `selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);`

    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/6e4f1703-05aa-48c7-8e5b-75f6c7a90caa/image.png)


## MeshLambertMaterial and MeshPhongMaterial

- `MeshLambertMaterial` - Reacts to light but does not produce sharp highlights. Simulates diffuse lighting (uniform light reflection). Ideal for matte or non-reflective surfaces that should appear soft.
    - `selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);`

    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/cecc69a0-84d3-4303-8419-57c4da4f3259/image.png)

- `MeshPhongMaterial` - Includes both diffuse and specular reflections. Useful for shiny, polished, more detailed highlights.
    - `selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);`

    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/b1201da7-5dbf-4e20-8cba-08224c1b57a8/image.png)

    - `Phong` material has a `shininess` property we can change to adjust specular light reflects (aka highlights).

        ```jsx
        var folder3 = gui.addFolder('Shininess');
        folder3.add(sphereMaterial, 'shininess', 0, 1000);
        ```

        ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/41f0b36b-c29f-44a6-a30d-6259e7264a65/image.png)

        ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/bdeb85c6-be48-4379-ab86-e0710d46199a/image.png)


## MeshStandardMaterial

- `MeshStandardMaterial` - A physically-based material (PBR). Creates more realistic lighting and shading effects. Uses the `metalness` / `roughness` model to most modern game engines and 3D renderers use. Both properties use a value between 0 and 1.
    - `selectedMaterial = new THREE.MeshStandardMaterial(materialOptions);`

    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/e3eb8c8d-467c-4cc9-94c3-cbf462c20b00/image.png)

    - `Roughness` - Controls the surface’s smoothness and how it scatters light.  `0` is a smooth, polished surface and `1` is a rough, textured surface.
    - `Metalness` - Controls the reflectivity and color of the reflections to simulate a metallic surface. `0` is non-metallic surface and `1` is a fully metallic surface.

## Texture Maps

### Texture Mapping

- 2D images mapped to the material, which is wrapped around the mesh.
- We first need to instantiate a texture loader object:
    - `var loader = new THREE.TextureLoader();`
- Then we map the texture image to the mesh’s material, in this case it’s a 64bit dirt texture:

    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/31176245-d545-45dd-960b-41c8114c250e/image.png)

    - `planeMaterial.map = loader.load('/src/textures/dirtFloor01.png');`
- Finally, in order to tile the image (instead of just having it be 1x1 scale on the mesh surface) we save the loading code to it’s own variable, set the different axis to repeat, and then set how much we want it to repeat for axis:

    ```
    var texture = planeMaterial.map;
    texture.wrapS = THREE.RepeatWrapping; // repeat along the x-axis
    texture.wrapT = THREE.RepeatWrapping; // repeat along the y-axis
    texture.repeat.set(10, 10); // how many times the image will repeat/tile.
    ```

    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/fcd4e414-e176-4df1-847f-d33f0846b6ff/image.png)

- **NOTE:** In computer graphics (especially texture mapping), **`S`** and **`T`** are often used instead of `X` and `Y` for width and height. This is to avoid confusing texture mapping direction with the `X`, `Y`, and `Z` coordinates of objects in 3D space.

### Bump Mapping

- `Bump Maps` is a texture that is used to simulate the surface of the material in terms of how it reacts to lighting, without actually changing the geometry.
- They use greyscale values to inform the lighting. So darker colored areas will have darker light and shadows, and lighter colored areas will have highlights and specular lighting.
    - **NOTE:** The `bumpMap` doesn’t need to be greyscale itself, it is just that only it’s tonal values are used to inform the lighting, so if you need a `bumpMap` that is different then the texture image, you should just make it in greyscale.
    - Since both the texture and bump map will need the same texture wrapping and tiling code, we can put it in a `forEach()` loop:
    - `bumpScale` determines how strongly the effect is applied. It ranges from `0` to `1` .

    ```jsx
    	// Material Settings
    	var loader = new THREE.TextureLoader();
    	planeMaterial.map = loader.load('/src/textures/dirtFloor01.png');
    	planeMaterial.bumpMap = loader.load('/src/textures/dirtFloor01.png');
    	planeMaterial.bumpScale = 0.05;

    	var maps = ['map', 'bumpMap'];
    	maps.forEach(function(mapName) {
    		var texture = planeMaterial[mapName];
    		texture.wrapS = THREE.RepeatWrapping;
    		texture.wrapT = THREE.RepeatWrapping;
    		texture.repeat.set(10, 10);
    	})
    ```

    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/f48f61f8-c162-4960-83c9-1d55e5bb159d/image.png)


## Roughness Maps

- Controls the roughness of t he material’s surface. Defines how smooth or rough the surface appears, affecting the way light scatters when it hits it.
- Again they use the greyscale of an image, with dark values causing smoother areas (more reflective) and lighter areas representing rougher areas (less reflective).

    ```jsx
    // Material Settings
    var loader = new THREE.TextureLoader();
    planeMaterial.map = loader.load('/src/textures/dirtFloor01.png');
    planeMaterial.bumpMap = loader.load('/src/textures/dirtFloor01.png');
    planeMaterial.roughnessMap = loader.load('/src/textures/checkerboard.jpg');

    planeMaterial.bumpScale = 0.05;

    var maps = ['map', 'bumpMap', 'roughnessMap'];
    maps.forEach(function(mapName) {
    	var texture = planeMaterial[mapName];
    	texture.wrapS = THREE.RepeatWrapping;
    	texture.wrapT = THREE.RepeatWrapping;
    	texture.repeat.set(10, 10);
    })
    ```

    - For this example, I used a checkerboard texture to make the effect easier to see:

        ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/eb63da3a-a4e5-46f6-add0-9a413c2c057b/image.png)


## Environment Maps

- Used to simulate reflective surfaces. The texture applied is often a cube or panoramic map of the surrounding environment.
    - `sphereMaterial.envMap = reflectionCube;`

### Cubemap

```jsx
	var path = '/src/textures/cubemap/';
	var format = '.jpg';
	var urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];
	var reflectionCube = new THREE.CubeTextureLoader().load(urls);
	reflectionCube.format = THREE.RGBFormat;
```

![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/97df4559-1f0d-45e5-ad42-87380310e87a/2e95bbba-ed64-489b-bdae-a56031f96dbd/image.png)

### Skybox

- We can use the `cubeMap` as a skybox as well:
    - `scene.background = reflectionCube`

# Geometries

## Primitive Geometries

## Manipulating Vertices

## External Geometries

# Particles

## Creating a Particle System

## Animating the Particle System

## Particle System from Geometry

## Stats.js

# Post-Processing

## Post-processing

## EffectComposer

## Other Shaders
