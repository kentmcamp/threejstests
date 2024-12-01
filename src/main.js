import "./style.css";

function init() {
  var scene = new THREE.Scene();
  var gui = new dat.GUI();
  var clock = new THREE.Clock();

  var enableFog = false;
  if (enableFog) {
    scene.fog = new THREE.FogExp2(0xffffff, 0.1);
  }

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
  renderer.shadowMap.enabled = true;

  // Add Objects
  var plane = getPlane(20, 20);
  var sphere = getSphere(0.05);
  var boxGrid = getBoxGrid(6, 1.5);
  var directionalLight = getDirectionalLight(1);
  var helper = new THREE.CameraHelper(directionalLight.shadow.camera);

  boxGrid.name = "boxGrid";
  plane.name = "plane-1";

  scene.add(plane);
  scene.add(boxGrid);
  scene.add(directionalLight);

  directionalLight.add(sphere);
  directionalLight.add(helper);

  plane.rotation.x = Math.PI / 2;
  directionalLight.position.x = 13;
  directionalLight.position.y = 10;
  directionalLight.position.z = 10;

  // GUI Controls
  gui.add(directionalLight, "intensity", 0, 10);
  gui.add(directionalLight.position, "x", -30, 30);
  gui.add(directionalLight.position, "y", -30, 30);
  gui.add(directionalLight.position, "z", 0, 180);

  camera.lookAt(boxGrid.position);

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.getElementById("app").appendChild(renderer.domElement);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  update(renderer, scene, camera, controls, clock);
  return scene;
}

// A Point Light is a light that is emitted from a single point in all directions via a sphere. Simulates a light bulb.
// function getPointLight(intensity) {
//   var light = new THREE.PointLight(0xffffff, intensity);
//   light.castShadow = true;
//   return light;
// }

// A Spot Light is a light that is emitted from a single point in a specific direction via a cone. Simulates a flashlight.
// function getSpotLight(intensity) {
//   var light = new THREE.SpotLight(0xffffff, intensity);
//   light.castShadow = true;
//   light.shadow.bias = 0.001;
//   light.shadow.mapSize.width = 2048;
//   light.shadow.mapSize.height = 2048;
//   return light;
// }

// A Directional Light is a parallel light ray that is emitted from a single point in a specific direction via a cone. Simulates sunlight.
function getDirectionalLight(intensity) {
  var light = new THREE.DirectionalLight(0xffffff, intensity);
  light.castShadow = true;
  light.shadow.camera.left = -10;
  light.shadow.camera.bottom = -10;
  light.shadow.camera.right = 5;
  light.shadow.camera.top = 5;
  return light;
}

// Ambient light is a light that is emitted from all directions. It is used to simulate the light that is reflected off the surfaces of the objects.
// function getAmbientLight(intensity) {
//   var light = new THREE.AmbientLight(new THREE.Color(10 / 255, 10 / 255, 150 / 255), intensity);


//   return light;
// }

// Rectangular Area Light or Hemisphere light is a light that is emitted from a single point in all directions via a sphere. It is used to simulate the light that is reflected off the surfaces of the objects.
// function getRectAreaLight(intensity) {
//   var light = new THREE.RectAreaLight(0xffffff, intensity, 4, 4);
//   light.position.set(0, 4, 0);
//   light.lookAt(new THREE.Vector3(0, 0, 0));
//   return light;
// }

function getSphere(size) {
  var geometry = new THREE.SphereGeometry(size, 12, 12);
  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Mesh basic material is not affected by light, so is always visible and has a constant color.
  var mesh = new THREE.Mesh(geometry, material);

  return mesh;
}

function getBox(w, h, d) {
  var geometry = new THREE.BoxGeometry(w, h, d);
  var material = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Mesh basic material is not affected by light, so is always visible and has a constant color.
  var mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

function getPlane(w, h) {
  var geometry = new THREE.PlaneGeometry(w, h);
  var material = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide, // This will make the plane visible from both sides.
  });
  var mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

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

// This function uses the recursion and the requestAnimationFrame to continuously render the scene, giving us real-time rendering (60 frames per second).
function update(renderer, scene, camera, controls, clock) {
  renderer.render(scene, camera);
  controls.update();

  var timeElapsed = clock.getElapsedTime(); // Time elapsed since the javascript started running

  var boxGrid = scene.getObjectByName("boxGrid");
  boxGrid.children.forEach(function (child, index) {
    child.scale.y = (Math.sin(timeElapsed * 3 + index) + 1) / 2 + 0.001; // Sine function will give us a value between -1 and 1. We add 1 to make it between 0 and 2. Then we divide it by 2 to make it between 0 and 1. We add 0.001 to avoid the scale being 0 and the object entering the same plane as the ground plane. We can multiply the timeElapsed by a number to make the animation faster or slower, in this case 2. We also incorporated the forEach loop's index to make the animation different for each box. Obvcioulsy, we could
    child.position.y = child.scale.y / 2;
  });

  requestAnimationFrame(function () {
    update(renderer, scene, camera, controls, clock);
  });
}

var scene = init();
window.scene = scene;
