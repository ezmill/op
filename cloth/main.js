var scene, camera, renderer, controls;
var container;
var loader;
var w = window.innerWidth;
var h = window.innerHeight;
var mouseX, mouseY;
var mapMouseX, mapMouseY;
var time = 0;
var rtt;
var globalUniforms = {
    time: {
        type: "f",
        value: 0.0
    },
    resolution: {
        type: "v2",
        value: new THREE.Vector2(w, h)
    },
    step_w: {
        type: "f",
        value: 1 / w
    },
    step_h: {
        type: "f",
        value: 1 / h
    },
    mouseX: {
        type: "f",
        value: 1.0
    },
    mouseY: {
        type: "f",
        value: 1.0
    },
}
var cloths = [];

initOutputScene();

function addLights() {
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.75);
    outputScene.add(hemiLight)
    light = new THREE.PointLight(0xffffff, 10.0);
    light.position.x = 0;
    light.position.y = 100;
    outputScene.add(light);

    light.castShadow = true;

    // light.shadowCameraVisible = true
    // light.shadowMapWidth = 10000;
    // light.shadowMapHeight = 10000;
    // light.shadowCascadeWidth = 10000;
    // light.shadowCascadeHeight = 10000;

}


function initOutputScene() {

    outputCamera = new THREE.PerspectiveCamera(50, w / h, 0.001, 100000);
    outputCamera.position.set(0, 0, 1000);
    controls = new THREE.OrbitControls(outputCamera);

    //different camera for render targets - interesting results when outputCameraRTT is substituted with outputCamera in the outputDraw function
    outputCameraRTT = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -100000, 100000);
    outputCameraRTT.position.z = 100;

    outputRenderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,
        alpha: true
    });
    outputRenderer.setSize(w, h);
    outputRenderer.setClearColor(0xffffff, 1);
    outputRenderer.setBlending(THREE.CustomBlending, THREE.SubtractEquation, THREE.DstColorFactor, THREE.SrcColorFactor);

    container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(outputRenderer.domElement);

    outputScene = new THREE.Scene();

    //feedback loop setup
    initCloth();

    //if you press space bar it'll take a screenshot - useful for being crazy prolific
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('resize', onWindowResize, false);

    addLights();
    outputAnimate();
}
function initCloth() {
    // arrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 50, 0xff0000);
    // arrow.position.set(-200, 0, -200);
    cw = xSegs;
    ch = ySegs;
    pins = [];
    for(var i = 0; i <= cw; i++) {
        pins.push(i);
    }

    for(var i = 0; i < 1; i++){
        var clothGeometry = new THREE.ParametricGeometry(clothFunction, cw, ch);
        clothGeometry.dynamic = true;
        clothGeometry.computeFaceNormals();
        cloths.push(clothGeometry);
    }

    // object = new THREE.Mesh(cloths[0], new THREE.MeshBasicMaterial({
    //     color: 0xffffff,
    //     side: 2,
    //     map: THREE.ImageUtils.loadTexture("tex/redstripe.png"),
    //     transparent: true
    // }));
    // object.position.set(0, 50, 50);
    // // object.rotation.set(Math.PI, 0, 0);
    // object.castShadow = true;
    // object.receiveShadow = true;
    // outputScene.add(object);
    var tex = THREE.ImageUtils.loadTexture("tex/stripe.png");
    for(var i = 0; i < 1; i++){
        var object = new THREE.Mesh(cloths[i], new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: 2,
            map: tex,
            transparent: true
        }));
        object.position.set(0, 0, 50*i);
        // object.rotation.set(Math.PI, 0, 0);
        object.castShadow = true;
        object.receiveShadow = true;
        outputScene.add(object);
    }

    // object2 = new THREE.Mesh(cloths[1], new THREE.MeshBasicMaterial({
    //     color: 0xffffff,
    //     side: 2,
    //     map: THREE.ImageUtils.loadTexture("tex/bluestripe.png"),
    //     transparent: true
    // }));
    // object2.position.set(5, 50, -50);
    // // object.rotation.set(Math.PI, 0, 0);
    // object2.castShadow = true;
    // object2.receiveShadow = true;
    // outputScene.add(object2);


    // object3 = new THREE.Mesh(cloths[2], new THREE.MeshBasicMaterial({
    //     color: 0xffffff,
    //     side: 2,
    //     map: THREE.ImageUtils.loadTexture("tex/greenstripe.png"),
    //     transparent: true
    // }));    
    // object3.position.set(5, 50, 0);
    // // object.rotation.set(Math.PI, 0, 0);
    // object3.castShadow = true;
    // object3.receiveShadow = true;
    // outputScene.add(object3);
    backWall = new THREE.Mesh(new THREE.PlaneBufferGeometry(2800, 1600), new THREE.MeshBasicMaterial({map: tex, side: 2, transparent: true}));
    backWall.position.z = -1000
    backWall.scale.set(2,2,2)
    outputScene.add(backWall)

    floorG = new THREE.PlaneBufferGeometry(10000,10000);
    floorM = new THREE.MeshBasicMaterial({color:0xffffff});
    floor = new THREE.Mesh(floorG, floorM);
    floor.receiveShadow = true;
    floor.castShadow = true;
    floor.rotation.x = -Math.PI/2;
    floor.position.y = -200;
    // outputScene.add(floor);

}

function outputAnimate() {
    window.requestAnimationFrame(outputAnimate);
    outputDraw();
}

function outputDraw() {

    // time += 0.5;
    // inputTexture.needsUpdate = true;
    time = Date.now();

    // windStrength = 0;
    windStrength = Math.cos( time / 7000 ) * 10 + 20;
    windForce.set(Math.sin(time / 2000), Math.cos(time / 3000), Math.sin(time / 1000)).normalize().multiplyScalar(windStrength);
    // arrow.setLength(windStrength);
    // arrow.setDirection(windForce);

    simulate(time);
    // var timer = Date.now() * 0.0002;

    var p = cloth.particles;

    for(var i = 0, il = p.length; i < il; i++) {
        for(var j = 0; j < cloths.length; j++){
            cloths[j].vertices[i].copy(p[i].position);
        }
    }
    for(var j = 0; j < cloths.length; j++){
        cloths[j].computeFaceNormals();
        cloths[j].computeVertexNormals();
        cloths[j].normalsNeedUpdate = true;
        cloths[j].verticesNeedUpdate = true;

    }
    // expand(1.01);// - similar to translateVs

    outputRenderer.render(outputScene, outputCamera);




}


function createModel(geometry, x, y, z, scale, rotX, rotY, rotZ, customMaterial) {
    var material = customMaterial;
    var modelMesh = new THREE.Mesh(geometry, material);
    var scale = scale;
    modelMesh.position.set(x, y, z);
    modelMesh.scale.set(scale, scale, scale);
    modelMesh.rotation.set(rotX, rotY, rotZ);
    outputScene.add(modelMesh);
}

function loadModel(model, x, y, z, scale, rotX, rotY, rotZ, customMaterial) {
    var loader = new THREE.BinaryLoader(true);
    loader.load(model, function(geometry) {
        createModel(geometry, x, y, z, scale, rotX, rotY, rotZ, customMaterial);
    })
}

function map(value, max, minrange, maxrange) {
    return ((max - value) / (max)) * (maxrange - minrange) + minrange;
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX);
    mouseY = (event.clientY);
    mapMouseX = map(mouseX, window.innerWidth, -1.0, 1.0);
    mapMouseY = map(mouseY, window.innerHeight, -1.0, 1.0);
    globalUniforms.mouseX.value = mapMouseX;
    globalUniforms.mouseY.value = mapMouseY;
}

function onWindowResize(event) {
    globalUniforms.resolution.value.x = window.innerWidth;
    globalUniforms.resolution.value.y = window.innerHeight;
    w = window.innerWidth;
    h = window.innerHeight;
    outputRenderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {

}


function onKeyDown(event) {
    if (event.keyCode == "32") {
        screenshot();

        function screenshot() {
            var blob = dataURItoBlob(outputRenderer.domElement.toDataURL('image/png'));
            var file = window.URL.createObjectURL(blob);
            var img = new Image();
            img.src = file;
            img.onload = function(e) {
                window.open(this.src);
            }
        }

        function dataURItoBlob(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            // write the bytes of the string to a typed array
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {
                type: mimeString
            });
        }

        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }
}