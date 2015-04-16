var scene, camera, renderer, controls;
var container;
var loader;
var w = window.innerWidth;
var h = window.innerHeight;
var mouseX, mouseY;
var globalUniforms;
var time = 0;
var video, videoLoaded = false, camTex;
var scene1, scene2;
var rt1, rt2;
var material1, material2;
var planeGeometry;
var mesh1, mesh2;
var mouseX, mouseY;
var time = 0.0;
var shards = [];

initScene();
function initScene(){
	container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(50, w / h, 1, 1000000);
    camera.position.set(0,0, 750);//test
    cameraRTT = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -10000, 10000 );
	cameraRTT.position.z = 100;

	controls = new THREE.OrbitControls(camera);


    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer:true});
    renderer.setSize(w, h);
    renderer.setClearColor(0xffffff, 1);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    initGlobalUniforms();
    initCanvasTex();
	document.addEventListener( 'keydown', onKeyDown, false );

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    // document.addEventListener('mousedown', onDocumentMouseDown, false);

    animate();
}
function initGlobalUniforms(){
	globalUniforms = {
		time: {type: 'f', value: time},
		resolution: {type: 'v2', value: new THREE.Vector2(w,h)},
		mouseX: {type: 'f', value: 0.0},
		mouseY: {type: 'f', value: 0.0}
	}
}
function initCanvasTex(){
	canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = w;
	ctx = canvas.getContext("2d");

    tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    camTex = tex;

    var urls = [];
    for (var i = 0; i < 6; i++) {
        var url = "tex/stripe6.jpg";
        urls.push(url);
    }
    texCube = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeRefractionMapping, function() {});

    var urls2 = [];
    for (var i = 0; i < 6; i++) {
        var url = "tex/stripe7.jpg";
        urls2.push(url);
    }
    texCube2 = THREE.ImageUtils.loadTextureCube(urls2, THREE.CubeRefractionMapping, function() {});
    initFrameDifferencing();


}
function initCameraTex(){
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
    if (navigator.getUserMedia) {       
        navigator.getUserMedia({video: true, audio: false}, function(stream){
        	var url = window.URL || window.webkitURL;
			video = document.createElement("video");
	        video.src = url ? url.createObjectURL(stream) : stream;
	        // video.src = "satin.mp4";
	        // video.loop = true;
	        // video.playbackRate = 0.25;
	        video.play();
	        videoLoaded = true;
	        tex = new THREE.Texture(video);
	        tex.needsUpdate = true;
	        camTex = tex;
	        initFrameDifferencing();
        }, function(error){
		   console.log("Failed to get a stream due to", error);
	    });
	}
}

function initFrameDifferencing(){
	planeGeometry = new THREE.PlaneBufferGeometry(w,h);
	// planeGeometry = new THREE.BoxGeometry(w,h,1000);

	scene1 = new THREE.Scene();
	rt1 = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
	material1 = new THREE.ShaderMaterial({
		uniforms: {
			time: globalUniforms.time,
			resolution: globalUniforms.resolution,
			texture: {type: 't', value: camTex},
			mouseX: globalUniforms.mouseX,
			mouseY: globalUniforms.mouseY
		},
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("fs").textContent
	});
	mesh1 = new THREE.Mesh(planeGeometry, material1);
	mesh1.position.set(0, 0, 0);
	scene1.add(mesh1);

	scene2 = new THREE.Scene();
	rt2 = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
	material2 = new THREE.ShaderMaterial({
		uniforms: {
			time: globalUniforms.time,
			resolution: globalUniforms.resolution,
			texture: {type: 't', value: rt1},
			texture2: {type: 't', value: camTex},
			mouseX: globalUniforms.mouseX,
			mouseY: globalUniforms.mouseY
		},
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("fs").textContent
	});
	mesh2 = new THREE.Mesh(planeGeometry, material2);
	mesh2.position.set(0, 0, 0);
	scene2.add(mesh2);

	sceneDiff = new THREE.Scene();
	rtDiff = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
	materialDiff = new THREE.ShaderMaterial({
		uniforms: {
			time: globalUniforms.time,
			resolution: globalUniforms.resolution,
			mouseX: globalUniforms.mouseX,
			mouseY: globalUniforms.mouseY,
			texture: {type: 't', value: rt1},
			texture2: {type: 't', value: rt2},
			texture3: {type: 't', value: camTex} 
		},
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("diffFs").textContent
	});
	meshDiff = new THREE.Mesh(planeGeometry, materialDiff);
	sceneDiff.add(meshDiff);

	sceneFB = new THREE.Scene();
	rtFB = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
	materialFB = new THREE.ShaderMaterial({
		uniforms: {
			time: globalUniforms.time,
			resolution: globalUniforms.resolution,
			mouseX: globalUniforms.mouseX,
			mouseY: globalUniforms.mouseY,
			texture: {type: 't', value: rtDiff}

		},
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("fs").textContent
	});
	meshFB = new THREE.Mesh(planeGeometry, materialFB);
	sceneFB.add(meshFB);

	sceneFB2 = new THREE.Scene();
	rtFB2 = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat });
	materialFB2 = new THREE.ShaderMaterial({
		uniforms: {
			time: globalUniforms.time,
			resolution: globalUniforms.resolution,
			mouseX: globalUniforms.mouseX,
			mouseY: globalUniforms.mouseY,
			texture: {type: 't', value: rtFB}
		},
		vertexShader: document.getElementById("vs").textContent,
		fragmentShader: document.getElementById("sineFs").textContent
	});
	// shader = THREE.EdgeShader;
	// shader = THREE.RGBShiftShader;
	// materialFB2 = new THREE.ShaderMaterial({
	// 	uniforms:shader.uniforms,
	// 	vertexShader: shader.vertexShader,
	// 	fragmentShader: shader.fragmentShader
	// })
	// materialFB2.uniforms["tDiffuse"].value = rtFB;
	// materialFB2.uniforms.mouseX = {type: 'f', value: mouseX};
	// materialFB2.uniforms.mouseY = {type: 'f', value: mouseY};
	meshFB2 = new THREE.Mesh(planeGeometry, materialFB2);
	sceneFB2.add(meshFB2);

	material = new THREE.MeshBasicMaterial({map: rtFB2});
	mesh = new THREE.Mesh(planeGeometry, material);
	scene.add(mesh);

	// sphereGeometry = new THREE.SphereGeometry(100,100,100);
	    dazzleMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, envMap: texCube, side: THREE.DoubleSide});
	    dazzleMaterial2 = new THREE.MeshBasicMaterial({color: 0xffffff, envMap: texCube2, side: THREE.DoubleSide});

	sphereGeometry = new THREE.CircleGeometry(100,100,100);
    loader = new THREE.BinaryLoader(true);
  //   // for(var j = 0; j<25; j++){
    for(var i = 0; i < 25; i++){
		loader.load("shards/"+i+".js", function(geometry) {
	        createShard(geometry, dazzleMaterial);
	    });
    }
    for(var i = 25; i < 50; i++){
		loader.load("shards/"+i+".js", function(geometry) {
	        createShard(geometry, dazzleMaterial2);
	    });
    }
    // }

 //    for (var i = 0; i < 10; i++) {
	// 	var sphere = new THREE.Mesh(sphereGeometry, dazzleMaterial);
	//     sphere.position.set(Math.random()*w - w/2, Math.random()*h -h/2, 1);
	// // sphere.rotation.z = Math.PI/6;
	// 	scene.add(sphere);
	//  };

	// loader.load("glass-model.js", function(geometry) {


}
function createShard(geometry, material) {
    var shard = new THREE.Mesh(geometry, material);
    var scale = 1000.0;
    // shard.position.set(0,0,100);
    shard.position.set(Math.random()*w - w/2, Math.random()*h - h/2, 100);
    shard.scale.set(scale, scale, scale);
    scene.add(shard);
    shards.push(shard);
}
function animate(){
	window.requestAnimationFrame(animate);
	draw();
}
function bezierX(x1, y1, x2, y2, hue){

    ctx.beginPath();

   // ctx.moveTo(x1+(0.5+ 0.5*Math.sin(time)*canvas.width), y1);
    //ctx.lineTo(x2+(0.5+ 0.5*Math.sin(time)*canvas.width), y2);
    // ctx.moveTo(x1+Math.cos(time/5)*canvas.width, y1);
    ctx.moveTo(x1, y1);
    // ctx.lineTo(x2-Math.sin(time/5)*canvas.width, y2);
    ctx.lineTo(x2, y2);

    ctx.lineWidth = lineWidth;
    
    // line color
    ctx.strokeStyle = "#0000FF";
    ctx.stroke();   
}
function bezierY(x1, y1, x2, y2, hue){
    ctx.beginPath();

    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    ctx.lineWidth = lineWidth;
    
    // line color
    ctx.strokeStyle = "#0000FF";
    ctx.stroke();  
}
var time = 0.5;
function many(){
    // time+=0.01;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var wy = canvas.width;
    var hy = 50;
    var wx = 50;
    var hx = canvas.height;
    var amp = 75;
    var distX = 20;
    var distY = 20;
    var alpha = 1.0;
    lineWidth = 10;

   for(var j = -canvas.height; j < canvas.height*2; j+=distY){
    	var r = Math.floor(map(0.5+0.5*Math.cos(time*4/3), 1, 0, 255));
    	var g = Math.floor(map(j, h, 0, 255));
    	var b = Math.floor(map(0.5+0.5*Math.sin(time/2), 1, 0, 255));
    	var color = "rgba("+r+","+g+", "+b+", "+alpha+")";
        // bezierY(0,j, canvas.width, j,  color /*hslaColor(j/5, 100, 50, alpha)*/);  
    }
    for(var i = -canvas.width; i < canvas.width*2; i+=distX){
    	var r = Math.floor(map(i, w, 0, 255));
    	var g = Math.floor(map(0.5+0.5*Math.sin(time), 1, 0, 255));
    	var b = Math.floor(map(0.5+0.5*Math.cos(time*3/2), 1, 0, 255));
    	var color = "rgba("+r+","+g+", "+b+", "+alpha+")";
        bezierX(i, 0, i, canvas.height, color /*hslaColor(i/5, 100, 50, alpha)*/);  

    }
    // ctx.rotate(Math.PI/1000);


}

function hslaColor(h,s,l,a)
  {
    return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
  }


// many();
function draw(){
	time+=0.01;
	many();
    camTex.needsUpdate = true;
    globalUniforms.time.value = time;
    for(var i = 0; i < shards.length; i++){
    	shards[i].rotation.x = Date.now()*0.0001;
    }
    // expand(1.01);
    // materialDiff.uniforms.texture.value = rtFB;
    material1.uniforms.texture.value = rtDiff;

	renderer.render(scene2, cameraRTT, rt2, true);

	renderer.render(sceneDiff, cameraRTT, rtDiff, true);

	renderer.render(sceneFB, cameraRTT, rtFB, true);
	renderer.render(sceneFB2, cameraRTT, rtFB2, true);

	renderer.render(scene, camera);

    renderer.render(scene1, cameraRTT, rt1, true);


    var a = rtFB;
    rtFB = rt1;
    rt1 = a;

}

function expand(expand){
		meshDiff.scale.set(expand,expand,expand);
}
function map(value,max,minrange,maxrange) {
    return ((max-value)/(max))*(maxrange-minrange)+minrange;
}

function onDocumentMouseMove(event){
	unMappedMouseX = (event.clientX );
    unMappedMouseY = (event.clientY );
    mouseX = map(unMappedMouseX, window.innerWidth, -1.0,1.0);
    mouseY = map(unMappedMouseY, window.innerHeight, -1.0,1.0);

    // materialFB2.uniforms.mouseX.value = mouseX;
    globalUniforms.mouseX.value = mouseX;
    // materialFB2.uniforms.mouseY.value = mouseY;
    globalUniforms.mouseY.value = mouseY;
}
function onKeyDown( event ){
	if( event.keyCode == "32"){
		screenshot();
		
function screenshot(){
	// var i = renderer.domElement.toDataURL('image/png');
	var blob = dataURItoBlob(renderer.domElement.toDataURL('image/png'));
	var file = window.URL.createObjectURL(blob);
	var img = new Image();
	img.src = file;
    img.onload = function(e) {
	    // window.URL.revokeObjectURL(this.src);
	    window.open(this.src);

    }
	 // window.open(i)
	// insertAfter(img, );
}
//
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

		    return new Blob([ia], {type:mimeString});
		}
		function insertAfter(newNode, referenceNode) {
		    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		}
	}
}