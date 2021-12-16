import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from '../three.js-master/examples/jsm/webxr/ARButton.js';

let container;
let camera, scene, renderer;
let controller;
let light;

let changeObjButton;
let instObjButton;
let pickedCheckTxt;
let ptxt = "None";
let logCheck;
let ltxt = "None";

let reticle;
let obj;
let srcObj = './test.gltf';

let gltfLoader;

let hitTestSource = null;
let hitTestSourceRequested = false;

let isButtonPushed = false;

let options;

let changeObj;
let instObj;

let raycasterDirectionPos;


class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0; 
    this.originPos = new THREE.Vector3();
    this.originQt = new THREE.Quaternion();
    this.originScale = new THREE.Vector3();
    this.direcPos = new THREE.Vector3();
    this.direcQt = new THREE.Quaternion();
    this.direcScale = new THREE.Vector3();
    this.direcPosNormalize = null;
  }
  pick(origin, direction, scene) {
    ltxt = "hoge";
    ptxt = "not picked";
    logCheck.innerHTML = ltxt;

    origin.matrixWorld.decompose(this.originPos,this.originQt,this.originScale);
    direction.matrixWorld.decompose(this.direcPos,this.direcQt,this.direcScale);
    this.direcPosNormalize = this.direcPos.normalize();

    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    this.raycaster.set(this.originPos, this.direcPosNormalize)
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      ptxt = "picked!";
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex(0xFFFF00);
    }
    pickedCheckTxt.innerHTML = ptxt;
  }
}

let pickHelper;

init();
animate();

function init() {

  container = document.createElement( 'div' );
  container.id = "container";
  document.body.appendChild( container );

  changeObjButton = document.createElement('div');
  changeObjButton.id = "chgButton";
  changeObjButton.innerHTML = "Change Object!";
  container.appendChild(changeObjButton);

  instObjButton = document.createElement('div');
  instObjButton.id = "instButton";
  instObjButton.innerHTML = "INSTALLATION";
  container.appendChild(instObjButton);

  pickedCheckTxt = document.createElement('div');
  pickedCheckTxt.id = "pickedCheck";
  pickedCheckTxt.innerHTML = ptxt;
  container.appendChild(pickedCheckTxt);

  logCheck = document.createElement('div');
  logCheck.id = "logCheck";
  logCheck.innerHTML = ltxt;
  container.appendChild(logCheck);


  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );

  light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
  light.position.set( 0.5, 1, 0.25 );
  scene.add( light );

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.xr.enabled = true;
  container.appendChild( renderer.domElement );

  options = {
    requiredFeatures: [ 'hit-test','dom-overlay' ]
  }

  options.domOverlay = {root : document.getElementById('container')};
  
  document.body.appendChild( ARButton.createButton( renderer, options ) );

  gltfLoader = new GLTFLoader();

  instObj = document.getElementById("instButton");
  instObj.onclick = onSelect;

  changeObj = document.getElementById("chgButton");
  changeObj.onclick = changeInstObject;

  reticle = new THREE.Mesh(
    new THREE.RingGeometry( 0.075, 0.1, 32 ).rotateX( - Math.PI / 2 ),
    new THREE.MeshBasicMaterial({color:0x1e90ff})
  );

  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add( reticle );
  window.addEventListener( 'resize', onWindowResize );

  pickHelper = new PickHelper();
}

function onSelect(){
  if (reticle.visible){
    /*
    gltfLoader.load(srcObj,function(data){
      const gltf = data;
      obj = gltf.scene;
      obj.scale.set(0.03,0.03,0.03);
      obj.position.setFromMatrixPosition( reticle.matrix );
      scene.add(obj);
    });
    */
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const material = new THREE.MeshPhongMaterial({color: 0x0000cd}); 
    const cube = new THREE.Mesh(geometry, material);
    cube.position.setFromMatrixPosition( reticle.matrix );
    cube.scale.set(0.25,0.25,0.25);
    scene.add(cube);
  }

}

function changeInstObject(){
  if (isButtonPushed == false){
    srcObj = './TestCar.gltf';
    isButtonPushed = true;
  }else{
    srcObj = './test.gltf';
    isButtonPushed = false;
  }
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  renderer.setAnimationLoop( render );
}

function render( time, frame ) {
  time *= 0.001; 

  if ( frame ) {
    const referenceSpace = renderer.xr.getReferenceSpace();
    const session = renderer.xr.getSession();

    if ( hitTestSourceRequested === false ) {
      session.requestReferenceSpace( 'viewer' ).then( function ( referenceSpace ) {
        session.requestHitTestSource( { space: referenceSpace } ).then( function ( source ) {
          hitTestSource = source;
        } );
      } );
      session.addEventListener( 'end', function () {
        hitTestSourceRequested = false;
        hitTestSource = null;
      } );
      hitTestSourceRequested = true;
    }

    if ( hitTestSource ) {
      const hitTestResults = frame.getHitTestResults( hitTestSource );
      if ( hitTestResults.length ) {
        const hit = hitTestResults[ 0 ];
        reticle.visible = true;
        reticle.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );

        pickHelper.pick(camera, reticle, scene);
      } else {
        reticle.visible = false;
      }
    }
  }
  renderer.render( scene, camera );
}