import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from '../three.js-master/examples/jsm/webxr/ARButton.js';

let container;
let camera, scene, renderer;
let controller;

let changeObjButton;
let instObjButton;

let reticle;
let obj;
let srcObj = './test.gltf';

let hitTestSource = null;
let hitTestSourceRequested = false;

let isButtonPushed = false;

let options;

let changeObj;
let instObj;

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

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );

  const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
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
  
  /*
  const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);

  function onSelect() {
    if ( reticle.visible ) {
      const material = new THREE.MeshPhongMaterial( { color: 0x191970} );
      const mesh = new THREE.Mesh( geometry, material );
      mesh.position.setFromMatrixPosition( reticle.matrix );
      scene.add( mesh );
    }
  }
  */

  const gltfLoader = new GLTFLoader();
  function onSelect(){
    if (reticle.visible){
      gltfLoader.load(srcObj,function(data){
        const gltf = data;
        obj = gltf.scene;
        obj.scale.set(0.03,0.03,0.03);
        obj.position.setFromMatrixPosition( reticle.matrix );
        scene.add(obj);
      });
    }
  }

  instObj = document.getElementById("instButton");
  instObj.onclick = onSelect;

  function changeInstObject(){
    if (isButtonPushed == false){
      srcObj = './Lamborghini/car.gltf';
      isButtonPushed = true;
    }else{
      srcObj = './test.gltf';
      isButtonPushed = false;
    }
  }

  changeObj = document.getElementById("chgButton");
  changeObj.onclick = changeInstObject;

  /*
  controller = renderer.xr.getController( 0 );
  controller.addEventListener( 'select', onSelect );
  scene.add( controller );
  */

  reticle = new THREE.Mesh(
    new THREE.RingGeometry( 0.075, 0.1, 32 ).rotateX( - Math.PI / 2 ),
    new THREE.MeshBasicMaterial({color:0x1e90ff})
  );

  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add( reticle );
  window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  renderer.setAnimationLoop( render );
}

function render( timestamp, frame ) {

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
      } else {
        reticle.visible = false;
      }
    }
  }
  renderer.render( scene, camera );
}