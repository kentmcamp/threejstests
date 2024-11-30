import "./style.css";

function init() {
  var scene = new THREE.Scene();
  var gui = new dat.GUI();

  var enableFog = false;
  if (enableFog) {
    scene.fog = new THREE.FogExp2(0xffffff, 0.1); // This will add fog to the scene. The first parameter is the color of the fog, and the second parameter is the density of the fog.
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
  var box = getBox(1, 1, 1);
  var plane = getPlane(20, 20);
  var pointLight = getPointLight(1);
  var sphere = getSphere(0.05);

  plane.name = 'plane-1';

  // scene.add(box); instead of adding the box to the scene, we will add the box to the plane.
  scene.add(box);
  scene.add(plane);
  scene.add(pointLight);
  pointLight.add(sphere); // This will add the sphere to the point light for visual reference.

  box.position.y = box.geometry.parameters.height / 2; // This will make the box sit on the plane.
  plane.rotation.x = Math.PI / 2; // Three.js does not use degrees, it uses radians. So we need to convert 90 degrees to radians.
  pointLight.position.y = 1.5;

  pointLight.intensity = 2;

  // GUI Controls
  gui.add(pointLight, 'intensity', 0, 10); //First the object, then the property, then the min value, and then the max value.
  gui.add(pointLight.position, 'x', -3, 2);
  gui.add(pointLight.position, 'y', 0, 5);
  gui.add(pointLight.position, 'z', -5, 5);

  camera.lookAt(box.position);

  // Set the size of the renderer
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Set the background color of the renderer
  renderer.setClearColor(0xffffff); // This will set the background color of the renderer to white.

  // We need to append the rendered to the DOM
  document.getElementById("app").appendChild(renderer.domElement);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);

  update(renderer, scene, camera, controls);

  return scene;
}

function getPointLight(intensity) {
  var light = new THREE.PointLight(0xffffff, intensity);
  light.castShadow = true;
  return light;
}

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

// This function uses the recursion and the requestAnimationFrame to continuously render the scene, giving us real-time rendering (60 frames per second).
function update(renderer, scene, camera, controls) {
  renderer.render(scene, camera);

  controls.update();

  requestAnimationFrame(function () {
    update(renderer, scene, camera, controls);
  });
}

var scene = init();
window.scene = scene;
