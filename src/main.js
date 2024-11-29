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
