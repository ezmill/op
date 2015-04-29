var scene, camera, renderer;
var outputCamera, outputControls, outputRenderer, outputScene, outputGeometry, outputMaterial, outputMesh;
var globalUniforms;
var mouseX, mouseY;
var cameraRTT;
var fbo;
var w = window.innerWidth;
var h = window.innerHeight;
var time = 0.0;
var inc = 0.0;
var translate = false;
var addFrames = true;
var mesh;
var meshes = [];
var rotWorldMatrix;

setup();
function setup(){
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, w / h, 1, 100000);
    camera.position.set(0,0, 750);
	cameraRTT = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -10000, 10000 );
	cameraRTT.position.z = 0;
	controls = new THREE.OrbitControls(camera);


	renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 1);

	container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(renderer.domElement);
    var materials = [];
    var textures = [];
    var strings = ["../cloth/tex/thinredstripe.png", "../cloth/tex/thingreenstripe.png", "../cloth/tex/thinbluestripe.png"]
    for(var i = 0; i < 3; i++){
        var tex = THREE.ImageUtils.loadTexture(strings[i]);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;  
        tex.minFilter = THREE.NearestFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.antialias = true;
        textures.push(tex);
    }
    
    // var repeat = 16;
    // tex.repeat.set( repeat, repeat );  
    var urls = [];
    for (var i = 0; i < 2; i++) {
        var url = "../cloth/tex/rgbstripe.png";
        urls.push(url);
    }
    texCube = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeRefractionMapping, function() {});
    skyCube = new THREE.Mesh(new THREE.BoxGeometry(5000,5000,5000), new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("../cloth/tex/thinrgbstripe.png"), side:2}));
    // scene.add(skyCube);
    globalUniforms = {
		time: { type: "f", value: 0.0 } ,
		resolution: {type: "v2", value: new THREE.Vector2(w,h)},
		step_w: {type: "f", value: 1/w},
		step_h: {type: "f", value: 1/h},
		mouseX: {type: "f", value: 1.0},
		mouseY: {type: "f", value: 1.0},
        texture: {type: "t", value: tex},
        texture2: {type: "t", value: tex},
	}

    for(var i = 0; i < 3; i++){
        var material = new THREE.ShaderMaterial( {
            uniforms: {        
                texture: {type: "t", value: textures[i]},
            },
            vertexShader: document.getElementById( 'vs' ).textContent,
            fragmentShader: document.getElementById( 'passFs' ).textContent,
            side: 2,
            transparent: true  
        } );
        materials.push(material);
    }
    
    // material = new THREE.MeshBasicMaterial( {
    //     side:2,
    //     map: tex
    // } );
    CustomSinCurve = THREE.Curve.create(
        function ( scale ) { //custom curve constructor
            this.scale = (scale === undefined) ? 1 : scale;
        },
        
        function ( t ) { //getPoint: t is between 0-1
            var tx = t * 3 - 1.5,
                // ty = Math.sin( 2 * Math.PI * t ),
                ty = 0,
                tz = 0;
            
            return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
        }
    );


    for(var i = 0; i< 1; i++){
        path = new CustomSinCurve( 200 );

        var mesh = new THREE.Mesh( 
        // new THREE.IcosahedronGeometry( 20, 4 ), 
        new THREE.TubeGeometry(
            /*new THREE.Curves.TrefoilKnot(), */
            path,
            200, 
            200, 
            100, 
            false),
            materials[i%3] 
        );
        meshes.push(mesh);
        // mesh.rotateOnAxis( rotationAxis, i*0.1 );
        // rotateAroundWorldAxis(mesh, new THREE.Vector3(1,0,0), 30 * Math.PI/180);
        var pivot = new THREE.Object3D();
        pivot.position.set(Math.random()*(window.innerWidth - window.innerWidth/2)/2, 
                           Math.random()*(window.innerHeight - window.innerHeight/2)/2,
                           Math.random()*(window.innerWidth - window.innerWidth/2)/2);
        pivot.rotation.set(Math.random()*7, 
                           Math.random()*7,
                           Math.random()*7);
        // pivot.position.x = 0;
        // pivot.position.z = 300*i;
        // mesh.position.x = -150;
        pivot.add( mesh );
        // pivot.rotation.set(0, Math.PI/2, i*0.01)//*/(Math.PI*2))
        // pivot.rotateOnAxis( rotationAxis, i*0.1 );

        scene.add( pivot );
        // scene.add( mesh );
    }
    window.addEventListener("keydown", onKeyDown);
	draw();
    console.log( path.cacheArcLengths[200])
}
function draw(){
	window.requestAnimationFrame(draw);
    for(var j = 0; j < meshes.length; j++){
        // meshes[j].geometry.verticesNeedUpdate = true;
        // for(var i = 0; i < meshes[j].geometry.vertices.length; i++){
        //     // meshes[j].geometry.vertices[i].x += Math.sin((i-i/2)/1000.001 + time*10);
        // //     // meshes[j].geometry.vertices[i].y += Math.sin((i-i/2)/500.001 + time);
        // //     // meshes[j].geometry.vertices[i].z += Math.cos((i-i/2)/500.001 + time);

        // }
        meshes[j].rotation.x = Date.now()*0.0001;
        meshes[j].rotation.y = Date.now()*0.0001;
        meshes[j].rotation.z = Date.now()*0.0001;
        meshes[j].position.x += Math.sin(Date.now()*0.0001)*0.2;
        meshes[j].position.y += Math.sin(Date.now()*0.0001)*0.2;
        meshes[j].position.z += Math.sin(Date.now()*0.0001)*0.2;
    }

	// time+=0.01;
    // camera.lookAt(0,0,0);
    // camera.rotation.y = Date.now()*0.0001;
	// globalUniforms.time.value = time;

	renderer.render(scene, camera);

}


function map(value, max, minrange, maxrange) {
    return ((max - value) / (max)) * (maxrange - minrange) + minrange;
}

function onDocumentMouseMove(event) {
    unMappedMouseX = (event.clientX);
    unMappedMouseY = (event.clientY);
    mouseX = map(unMappedMouseX, window.innerWidth, -1.0, 1.0);
    mouseY = map(unMappedMouseY, window.innerHeight, -1.0, 1.0);
    globalUniforms.mouseX.value = mouseX;
    globalUniforms.mouseY.value = mouseY;
}
function onKeyDown(event) {
    if (event.keyCode == "32") {
        screenshot();

        function screenshot() {
            var blob = dataURItoBlob(renderer.domElement.toDataURL('image/png'));
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

