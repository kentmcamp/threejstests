import "./style.css";

function init() {
  var scene = new THREE.Scene();
  var gui = new dat.GUI();
  var clock = new THREE.Clock();

  var enableFog = true;
  if (enableFog) {
    scene.fog = new THREE.FogExp2(0xffffff, 0.01);
  }

  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );

  var cameraZRotation = new THREE.Group();
  var cameraZPosition = new THREE.Group();
  var cameraXRotation = new THREE.Group();
  var cameraXPosition = new THREE.Group();
  var cameraYRotation = new THREE.Group();
  var cameraYPosition = new THREE.Group();

  cameraZRotation.name = "cameraZRotation";
  cameraZPosition.name = "cameraZPosition";
  cameraXRotation.name = "cameraXRotation";
  cameraXPosition.name = "cameraXPosition";
  cameraYRotation.name = "cameraYRotation";
  cameraYPosition.name = "cameraYPosition";

  cameraZRotation.add(camera);
  cameraZPosition.add(cameraYPosition);
  cameraXRotation.add(cameraZPosition);
  cameraXPosition.add(cameraXRotation);
  cameraYRotation.add(cameraXRotation);
  cameraYPosition.add(cameraZRotation);
  scene.add(cameraYRotation);

  cameraYPosition.position.y = 1;
  cameraZPosition.position.z = 100;
  cameraXRotation.rotation.x = -Math.PI / 2;

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

  new TWEEN.Tween({val: 0})
    .to({val: Math.PI / 2}, 2000)
    .delay(5000)
    .easing(TWEEN.Easing.Quintic.InOut)
    .onUpdate(function() {
      cameraYRotation.rotation.y = this.val;
    })
    .start();



  gui.add(cameraZPosition.position, 'z', 0, 100);
  gui.add(cameraYRotation.rotation, 'y', -Math.PI, Math.PI);
  gui.add(cameraXRotation.rotation, 'x', -Math.PI, Math.PI);
  gui.add(cameraZRotation.rotation, 'z', -Math.PI, Math.PI);



  var renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;

  // Add Objects
  var plane = getPlane(100, 100);
  var sphere = getSphere(0.05);
  var boxGrid = getBoxGrid(20, 2.5);
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

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff);
  document.getElementById("app").appendChild(renderer.domElement);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  update(renderer, scene, camera, controls, clock);
  return scene;
}

// A Directional Light is a parallel light ray that is emitted from a single point in a specific direction via a cone. Simulates sunlight.
function getDirectionalLight(intensity) {
  var light = new THREE.DirectionalLight(0xffffff, intensity);
  light.castShadow = true;
  light.shadow.camera.left = -40;
  light.shadow.camera.bottom = -40;
  light.shadow.camera.right = 40;
  light.shadow.camera.top = 40;

  light.shadow.mapSize.width = 4096;
  light.shadow.mapSize.height = 4096;
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

function getBoxGrid(amount, separationMultiplier) {
  var group = new THREE.Group();

  for (var i = 0; i < amount; i++) {
    var obj = getBox(1, 5, 1);

    obj.position.x = i * separationMultiplier;
    obj.position.y = obj.geometry.parameters.height / 2;
    group.add(obj);
    for (var j = 1; j < amount; j++) {
      var obj = getBox(1, 5, 1);
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


function update(renderer, scene, camera, controls, clock) {
  renderer.render(scene, camera);
  controls.update();
  TWEEN.update();

  var timeElapsed = clock.getElapsedTime();

  var cameraZRotation = scene.getObjectByName("cameraZRotation");
  cameraZRotation.rotation.z = noise.simplex2(timeElapsed, timeElapsed) * 0.05;

  var boxGrid = scene.getObjectByName("boxGrid");
  boxGrid.children.forEach(function (child, index) {
    child.scale.y = (noise.simplex2(timeElapsed + index, timeElapsed + index) + 1) / 2 + 0.001;
    child.position.y = child.scale.y / 2;
  });

  requestAnimationFrame(function () {
    update(renderer, scene, camera, controls, clock);
  });
}

var scene = init();
window.scene = scene;
