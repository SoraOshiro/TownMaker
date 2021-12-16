import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';

let obj;

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.y = 2;
  camera.position.z = 15;

  const scene = new THREE.Scene();

  const color = 0xF8F8FF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  const gltfLoader = new GLTFLoader();
  gltfLoader.load('./test.gltf',function(data){
    const gltf = data;
    obj = gltf.scene;
    scene.add(obj);
  });



  function render(time) {
    time *= 0.001;  // convert time to seconds



    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();