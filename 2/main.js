//lots o' globals - input scene and output scene should be easy to differentiate between
var inputCamera, inputControls, inputRenderer, inputScene, inputGeometry, inputMaterial, inputMesh;
var outputCamera, outputControls, outputRenderer, outputScene, outputGeometry, outputMaterial, outputMesh;
var container;
var w = window.innerWidth;
var h = window.innerHeight;
var planeGeometry;
var mouseX, mouseY;
var time = 0.0;
var shards = [];
//kick things off 
var globalUniforms = {
    time: { type: 'f', value: time },
    resolution: { type: 'v2', value: new THREE.Vector2(w, h) },
    mouseX: { type: 'f', value: 0.0 },
    mouseY: { type: 'f', value: 0.0 }
}

initInputScene();

function initInputScene() {
    //input scene - basic three.js setup and loop functionality
    inputCamera = new THREE.PerspectiveCamera(45, w / h, 1, 100000);
    inputCamera.position.set(0, 0, 750);

    //orbit controls for input scene - make sure only input or output scene has controls, not both
    inputControls = new THREE.OrbitControls(inputCamera);

    inputRenderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    inputRenderer.setSize(w, h);
    inputRenderer.setClearColor(0xffffff, 1);
    inputRenderer.setBlending(THREE.CustomBlending, THREE.SubtractEquation, THREE.DstColorFactor, THREE.SrcColorFactor);

    inputScene = new THREE.Scene();


    var urls = [], urls2 = [], urls3 = [];
    for (var i = 0; i < 6; i++) {
        var url = "../tex/stripe.jpg", url2 = "../tex/stripe.jpg", url3 = "../tex/stripe.jpg";
        urls.push(url);
        urls2.push(url2);
        urls3.push(url3);
    }
    texCube = THREE.ImageUtils.loadTextureCube(urls3, THREE.CubeRefractionMapping, function() {});
    texCube2 = THREE.ImageUtils.loadTextureCube(urls2, THREE.CubeRefractionMapping, function() {});
    texCube3 = THREE.ImageUtils.loadTextureCube(urls, THREE.CubeRefractionMapping, function() {});

    dazzleMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, envMap: texCube3, side: THREE.DoubleSide, refractionRatio: 0.5});
    dazzleMaterial2 = new THREE.MeshBasicMaterial({color: 0xffffff, envMap: texCube2, side: THREE.DoubleSide});
    spheres = [];
    // for(var i = 0; i < 1; i++){
    //      sphereGeometry = new THREE.SphereGeometry(1000,100,100);
    //     sphere = new THREE.Mesh(sphereGeometry, dazzleMaterial);
    //     sphere.position.set(Math.random()*200 - 100, 6, Math.random()*200 - 100)
    //     inputScene.add(sphere);
    //     spheres.push(sphere);   
    // }

                var shader = THREE.ShaderLib[ "cube" ];
                shader.uniforms[ "tCube" ].value = texCube;

                var material = new THREE.ShaderMaterial( {

                    fragmentShader: shader.fragmentShader,
                    vertexShader: shader.vertexShader,
                    uniforms: shader.uniforms,
                    depthWrite: false,
                    side: THREE.BackSide

                } ),

                mesh = new THREE.Mesh( new THREE.BoxGeometry( 10000, 10000, 10000 ), material );
                inputScene.add( mesh );

    // for(var j = 0; j<2; j++){
    //     for(var i = 1; i < 25; i++){
    //         loadModel("../shards/"+i+".js", Math.random()*5000 - 2500, Math.random()*5000 - 2500, Math.random()*5000 - 2500,3000.0,0,0,0, dazzleMaterial);
    //     }
    //     for(var i = 25; i < 50; i++){
    //         loadModel("../shards/"+i+".js", Math.random()*5000 - 2500, Math.random()*5000 - 2500, Math.random()*5000 - 2500,3000.0,0,0,0, dazzleMaterial2);
    //     }
    // }
    // canvas = document.createElement("canvas");
    // canvas.width = w;
    // canvas.height = h;
    // ctx = canvas.getContext("2d");
    // canvasTex = new THREE.Texture(canvas);
    // canvasTex.needsUpdate = true;
    // planeMaterial = new THREE.ShaderMaterial({
    //     uniforms: {
    //         time: globalUniforms.time,
    //         resolution: globalUniforms.resolution,
    //         mouseX: globalUniforms.mouseX,
    //         mouseY: globalUniforms.mouseY,
    //         texture: {type: 't', value: canvasTex}
    //     },
    //     vertexShader: document.getElementById("vs").textContent,
    //     fragmentShader: document.getElementById("sineFs").textContent
    // });
    // var planeGeometry = new THREE.PlaneBufferGeometry(w,h);
    // plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // inputScene.add(plane);

    // inputAnimate	();
    var roomWidth = 200;
    var roomHeight = 120;
    var roomDepth = 200;
    var wallThickness = 2;
    floorGeometry = new THREE.BoxGeometry(roomWidth, wallThickness, roomDepth);
    floorMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: 2,
        map: THREE.ImageUtils.loadTexture("../tex/stripe10.jpg")
    });
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, 0, 0);
    // inputScene.add(floor);

    leftWallGeometry = new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth);
    leftWallMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: THREE.ImageUtils.loadTexture("../tex/stripe10.jpg")
    })
    leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
    leftWall.position.set(-roomWidth / 2, roomHeight / 2, 0);
    // inputScene.add(leftWall);

    backWallGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness);
    backWallMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: THREE.ImageUtils.loadTexture("../tex/stripe10.jpg")
    })
    backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.set(0, roomHeight / 2, -roomDepth / 2);
    // inputScene.add(backWall);


    rightWallGeometry = new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth);
    rightWallMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: THREE.ImageUtils.loadTexture("../tex/stripe10.jpg")
    });
    rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
    rightWall.position.set(roomWidth / 2, roomHeight / 2, 0);
    // inputScene.add(rightWall);

    //takes input scene and makes it a texture, as well as starting feedback loop
    initOutputScene();
}

function inputAnimate() {
    window.requestAnimationFrame(inputAnimate);
    inputDraw();
}

function inputDraw() {
    // canvasDraw();
    // planeMaterial.uniforms.time.value += 0.01;
    // canvasTex.needsUpdate = true;
    for(var i = 0; i < shards.length; i++){
        shards[i].rotation.x = Date.now()*0.0001;
    }
    inputRenderer.render(inputScene, inputCamera);
}

function initOutputScene() {

    outputCamera = new THREE.PerspectiveCamera(50, w / h, 1, 100000);
    outputCamera.position.set(0, 0, 750);
    //different camera for render targets - interesting results when outputCameraRTT is substituted with outputCamera in the outputDraw function
    outputCameraRTT = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, -10000, 10000 );
    outputCameraRTT.position.z = 100;

    outputRenderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    outputRenderer.setSize(w, h);
    outputRenderer.setClearColor(0xffffff, 1);
    outputRenderer.setBlending(THREE.CustomBlending, THREE.SubtractEquation, THREE.DstColorFactor, THREE.SrcColorFactor);

    container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(outputRenderer.domElement);

    outputScene = new THREE.Scene();
    controls = new THREE.OrbitControls(outputCamera);
    //takes input scene and makes it into a texture for frame differencing
    initInputTexture();

    //feedback loop setup
    initFrameDifferencing();

    //if you press space bar it'll take a screenshot - useful for being crazy prolific
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    outputAnimate();
}

function initInputTexture() {
    inputTexture = new THREE.Texture(inputRenderer.domElement);;
    inputTexture.needsUpdate = true;
}

function feedbackObject(uniforms, vertexShader, fragmentShader) {
    this.scene = new THREE.Scene();
    this.renderTarget = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat});
    this.material = new THREE.ShaderMaterial({
        uniforms: uniforms, //uniforms object from constructor
        vertexShader: document.getElementById(vertexShader).textContent,
        fragmentShader: document.getElementById(fragmentShader).textContent
    });
    this.mesh = new THREE.Mesh(planeGeometry, this.material);
    this.mesh.position.set(0, 0, 0);
    this.scene.add(this.mesh);
}

function initFrameDifferencing() {
    planeGeometry = new THREE.PlaneBufferGeometry(w, h);

    feedbackObject1 = new feedbackObject({
        time: globalUniforms.time,
        resolution: globalUniforms.resolution,
        texture: { type: 't', value: inputTexture },
        mouseX: globalUniforms.mouseX,
        mouseY: globalUniforms.mouseY
    }, "vs", 
    "fbFs"); //string for fragment shader id - the only lines that really matter in this function, or the only lines you'll wanna change

    feedbackObject2 = new feedbackObject({
        time: globalUniforms.time,
        resolution: globalUniforms.resolution,
        texture: { type: 't', value: feedbackObject1.renderTarget }, //use previous feedback object's texture
        texture2: { type: 't', value: inputTexture }, // p sure this line doesnt do anything lol
        mouseX: globalUniforms.mouseX,
        mouseY: globalUniforms.mouseY
    }, "vs", 
    "flow2"); //these first three/four fragment shader object things are where most of the feedback loop is happening

    frameDifferencer = new feedbackObject({
        time: globalUniforms.time,
        resolution: globalUniforms.resolution,
        texture: { type: 't', value: feedbackObject1.renderTarget },
        texture2: { type: 't', value: feedbackObject2.renderTarget },
        texture3: { type: 't', value: inputTexture },
        mouseX: globalUniforms.mouseX,
        mouseY: globalUniforms.mouseY
    }, "vs", 
    "diffFs"); //differencing fs - leave this one alone

    feedbackObject3 = new feedbackObject({
        time: globalUniforms.time,
        resolution: globalUniforms.resolution,
        texture: { type: 't', value: frameDifferencer.renderTarget },
        mouseX: globalUniforms.mouseX,
        mouseY: globalUniforms.mouseY
    }, "vs", 
    "fs"); //this fs also contributes to feedback loop

    feedbackObject4 = new feedbackObject({
        time: globalUniforms.time,
        resolution: globalUniforms.resolution,
        texture: { type: 't', value: feedbackObject3.renderTarget },
        mouseX: globalUniforms.mouseX,
        mouseY: globalUniforms.mouseY
    }, "vs", 
    "colorFs"); //this fs is basically post-processing

    feedbackObject1.material.uniforms.texture.value = frameDifferencer.renderTarget; //previous frame as input

    outputMaterial = new THREE.MeshBasicMaterial({
        map: feedbackObject4.renderTarget
    });
    outputMesh = new THREE.Mesh(planeGeometry, outputMaterial);


    for(var j = 0; j<2; j++){
        for(var i = 1; i < 25; i++){
            loadModel("../shards/"+i+".js", Math.random()*5000 - 2500, Math.random()*5000 - 2500, Math.random()*5000 - 2500,3000.0,0,0,0, new THREE.MeshBasicMaterial({color: 0xff0000}));
        }
        for(var i = 25; i < 50; i++){
            loadModel("../shards/"+i+".js", Math.random()*5000 - 2500, Math.random()*5000 - 2500, Math.random()*5000 - 2500,3000.0,0,0,0, new THREE.MeshBasicMaterial({color: 0xff0000}));
        }
    }

    outputScene.add(outputMesh);



}

function outputAnimate() {
    window.requestAnimationFrame(outputAnimate);
    outputDraw();
}

function outputDraw() {

    time += 0.05;
    inputDraw();
    inputTexture.needsUpdate = true;

    // expand(1.01);// - similar to translateVs


    //render all the render targets to their respective scenes
    outputRenderer.render(feedbackObject2.scene, outputCameraRTT, feedbackObject2.renderTarget, true);
    outputRenderer.render(frameDifferencer.scene, outputCameraRTT, frameDifferencer.renderTarget, true);
    outputRenderer.render(feedbackObject3.scene, outputCameraRTT, feedbackObject3.renderTarget, true);
    outputRenderer.render(feedbackObject4.scene, outputCameraRTT, feedbackObject4.renderTarget, true);

    outputRenderer.render(outputScene, outputCamera);

    //get new frame
    outputRenderer.render(feedbackObject1.scene, outputCameraRTT, feedbackObject1.renderTarget, true);

    // swap buffers - this is why feedbackObject3's fragment shader contributes to feedback loop but feedbackObject3 is just post-processing i think
    var a = feedbackObject3.renderTarget;
    feedbackObject3.renderTarget = feedbackObject1.renderTarget;
    feedbackObject1.renderTarget = a;


}

//utility functions and event listeners
function expand(expand) {
    frameDifferencer.mesh.scale.set(expand, expand, expand);
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
function createModel(geometry, x, y, z, scale, rotX, rotY, rotZ, customMaterial){
        var material = customMaterial
        inputMesh = new THREE.Mesh(geometry, material);
        var scale = scale;
        inputMesh.position.set(x,y,z);
        inputMesh.scale.set(scale,scale,scale);
        inputMesh.rotation.set(rotX, rotY, rotZ);
        outputMesh.add(inputMesh);
        shards.push(inputMesh);
    }

function loadModel(model, x, y, z, scale, rotX, rotY, rotZ, customMaterial){
    var loader = new THREE.BinaryLoader(true);
    loader.load(model, function(geometry){
        createModel(geometry, x, y, z, scale, rotX, rotY, rotZ, customMaterial);
    })
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
    ctx.strokeStyle = "#00FFFF";
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
function canvasDraw(){
    // time+=0.01;
    ctx.fillStyle = "#000000";
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
        // var r = Math.floor(map(i, w, 0, 255));
        var r = Math.floor(map(0.5+0.5*Math.cos(time), 1, 0, 255));
        var g = Math.floor(map(0.5+0.5*Math.sin(time), 1, 0, 255));
        var b = Math.floor(map(0.5+0.5*Math.cos(time*3/2), 1, 0, 255));
        var color = "rgba("+r+","+g+", "+b+", "+alpha+")";
        bezierX(i, 0, i, canvas.height, /*color*/ hslaColor(i/5, 100, 50, alpha));  

    }
    // ctx.rotate(Math.PI/1000);


}

function hslaColor(h,s,l,a)
  {
    return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
  }