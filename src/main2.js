function init() {
	var scene = new THREE.Scene();
	var gui = new dat.GUI();

	// initialize objects
	var sphereMaterial = getMaterial('standard', 'rgb(0, 0, 255)');
	var sphere = getSphere(sphereMaterial, 1, 24);

	var planeMaterial = getMaterial('standard', 'rgb(255, 255, 255)');
	var plane = getPlane(planeMaterial, 30);

	var lightLeft = getSpotLight(1, 'rgb(255, 220, 180)');
	var lightRight = getSpotLight(1, 'rgb(255, 220, 180)');

	// manipulate objects
	sphere.position.y = sphere.geometry.parameters.radius;
	plane.rotation.x = Math.PI/2;

	lightLeft.position.x = -5;
	lightLeft.position.y = 2;
	lightLeft.position.z = -4;

	lightRight.position.x = 5;
	lightRight.position.y = 2;
	lightRight.position.z = -4;

	// dat.gui
	var folder1 = gui.addFolder('light_1');
	folder1.add(lightLeft, 'intensity', 0, 10);
	folder1.add(lightLeft.position, 'x', -5, 15);
	folder1.add(lightLeft.position, 'y', -5, 15);
	folder1.add(lightLeft.position, 'z', -5, 15);

	var folder2 = gui.addFolder('light_2');
	folder2.add(lightRight, 'intensity', 0, 10);
	folder2.add(lightRight.position, 'x', -5, 15);
	folder2.add(lightRight.position, 'y', -5, 15);
	folder2.add(lightRight.position, 'z', -5, 15);

	// Material Settings
	// cubeMap Loading
	var path = '/src/textures/cubemap/';
	var format = '.jpg';
	var urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];
	var reflectionCube = new THREE.CubeTextureLoader().load(urls);
	reflectionCube.format = THREE.RGBFormat;

	scene.background = reflectionCube;


	var loader = new THREE.TextureLoader();
	planeMaterial.map = loader.load('/src/textures/dirtFloor01.png');
	planeMaterial.bumpMap = loader.load('/src/textures/dirtFloor01.png');
	planeMaterial.roughnessMap = loader.load('/src/textures/dirtFloor01.png');
	sphereMaterial.roughnessMap = loader.load('/src/textures/fingerprints.jpg');

	planeMaterial.bumpScale = 0;
	planeMaterial.metalness = 0.05;
	planeMaterial.roughness = 0.05;

	sphereMaterial.envMap = reflectionCube;

	var maps = ['map', 'bumpMap', 'roughnessMap'];
	maps.forEach(function(mapName) {
		var texture = planeMaterial[mapName];
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(32, 32);
	})

	var folder3 = gui.addFolder('Roughness and Metalness');
	folder3.add(planeMaterial, 'roughness', 0, 1);
	folder3.add(planeMaterial, 'metalness', 0, 1);
	folder3.add(planeMaterial, 'bumpScale', 0, 1);
	folder3.open();

	// add objects to the scene
	scene.add(sphere);
	scene.add(plane);
	scene.add(lightLeft);
	scene.add(lightRight);

	// camera
	var camera = new THREE.PerspectiveCamera(
		45, // field of view
		window.innerWidth / window.innerHeight, // aspect ratio
		1, // near clipping plane
		1000 // far clipping plane
	);
	camera.position.z = 7;
	camera.position.x = -2;
	camera.position.y = 7;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	// renderer
	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	document.getElementById('app').appendChild(renderer.domElement);

	var controls = new THREE.OrbitControls( camera, renderer.domElement );

	update(renderer, scene, camera, controls);

	return scene;
}

function getSphere(material, size, segments) {
	var geometry = new THREE.SphereGeometry(size, segments, segments);
	var obj = new THREE.Mesh(geometry, material);
	obj.castShadow = true;

	return obj;
}

function getMaterial(type, color) {
	var selectedMaterial;
	var materialOptions = {
		color: color === undefined ? 'rgb(255, 255, 255)' : color,
	};

	switch (type) {
		case 'basic':
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
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
			selectedMaterial = new THREE.MeshlambertMaterial(materialOptions);
			break;
	}

	return selectedMaterial;
}

function getSpotLight(intensity, color) {
	color = color === undefined ? 'rgb(255, 255, 255)' : color;
	var light = new THREE.SpotLight(color, intensity);
	light.castShadow = true;
	light.penumbra = 0.5;

	//Set up shadow properties for the light
	light.shadow.mapSize.width = 4096;  // default: 512
	light.shadow.mapSize.height = 4096; // default: 512
	light.shadow.bias = 0.001;

	return light;
}

function getPlane(material, size) {
	var geometry = new THREE.PlaneGeometry(size, size);
	material.side = THREE.DoubleSide;
	var obj = new THREE.Mesh(geometry, material);
	obj.receiveShadow = true;

	return obj;
}

function update(renderer, scene, camera, controls) {
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(function() {
		update(renderer, scene, camera, controls);
	});
}

var scene = init();
