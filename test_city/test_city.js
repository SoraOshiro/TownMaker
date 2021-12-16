import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from '../three.js-master/examples/jsm/webxr/ARButton.js';


class City{
  constructor(height,width){
    this.width = width;
    this.height = height;
    this.field = [];
  }
  getField(){
    return this.field;
  }
  initField(){
    console.log("init field");
    let cnt = 0;
    for(let h=0;h<this.height;h++){
      this.field[h] = [];
      for(let w=0;w<this.width;w++){
        //this.field[h][w] = new Empty("empty",1,1,"S",cnt);
        this.editCell(h,w,0,"empty",1,1,"S",cnt);
        cnt = cnt+1;
      }
    }
  }
  editCell(h,w,ObjType,name,hsize,wsize,direction,group){
    // ObjType = 0:Empty, 1:Building, 2:Road
    console.log("edit cell");
    let msFlag = false;
    if (ObjType == 0){
      for (let i=h;i<h+hsize;i++){
        for (let j=w;j<w+wsize;j++){
          if(msFlag == false){
            this.field[i][j] = new Empty(name,hsize,wsize,direction,group,"master");
            msFlag = true;
          }else{
            this.field[i][j] = new Empty(name,hsize,wsize,direction,group,"slave");
          }
        }
      }
      
      //this.field[h][w] = new Empty(name,hsize,wsize,direction,group,"master");
    }else if(ObjType == 1){
      for (let i=h;i<h+hsize;i++){
        for (let j=w;j<w+wsize;j++){
          if(msFlag == false){
            this.field[i][j] = new Building(name,hsize,wsize,direction,group,"master");
            msFlag = true;
          }else{
            this.field[i][j] = new Building(name,hsize,wsize,direction,group,"slave");
          }
        }
      }
    }else if(ObjType == 2){
      for (let i=h;i<h+hsize;i++){
        for (let j=w;j<w+wsize;j++){
          if(msFlag == false){
            this.field[i][j] = new Road(name,hsize,wsize,direction,group,"master");
            msFlag = true;
          }else{
            this.field[i][j] = new Road(name,hsize,wsize,direction,group,"slave");
          }
        }
      }
    }else{
      console.log("city.editCell ObjType error : cant use number %d . valiable num is 0,1,2.", ObjType);
    }
  }
  connect(){
  }
  rotate(h,w,direction){
    this.field[h][w].setDirection(direction);
  }
}

class Cell{
  constructor(name,sizeHeight,sizeWidth,direction,group,state){
    this.name = name;
    this.sizeHeight = sizeHeight;
    this.sizeWidth = sizeWidth;
    this.direction = direction;
    this.group = group;
    this.state = state; // master, slave
  }
  setName(name){
    this.name = name;
  }
  getName(){
    return this.name;
  }
  setSizeHeight(sizeHeight){
    this.sizeHeight = sizeHeight;
  }
  getSizeHeight(){
    return this.sizeHeight;
  }
  setSizeWidth(sizeWidth){
    this.sizeWidth = sizeWidth;
  }
  getSizeWidth(){
    return this.sizeWidth;
  }
  setDirection(direction){
    this.direction = direction;
  }
  getDirection(){
    return this.direction;
  }
  setGroup(group){
    this.group = group;
  }
  getGroup(){
    return this.group;
  }
  setState(state){
    this.state = state;
  }
  getState(){
    return this.state;
  }
}

class Building extends Cell{}
class Road extends Cell{}
class Empty extends Cell{}

/*
class load3DModel{
  constructor(){
    this.nameList = new Map([
      ['building','../model/test.gltf'],
      ['house1','../model/TestHuman.gltf']
    ]);
  }
  calcPos(lenH,lenW,posH,posW){
    let fieldCenterH = (lenH/2) + 0.5;
    let fieldCenterW = (lenW/2) + 0.5;
    let h = posH - fieldCenterH + 1;
    let w = posW - fieldCenterW + 1;
    return [h,w];
  }
  load(cell,lenH,lenW,posH,posW){
    let pos = this.calcPos(lenH,lenW,posH,posW);
    let obj;
    //console.log(cell.getName());
    if(cell.getName() == 'empty'){
      obj = this.loadCell(pos);
    }else{
      let objName = this.nameList.get(cell.getName());
      console.log(objName);
      obj = this.loadGltf(objName,pos);
      console.log(this.model);
    }
    //console.log(obj);
    return obj;
  }
  loadCell(pos){
    let boxWidth = 0.95;
    let boxHeight = 0.02;
    let boxDepth = 0.95;
    let geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    let material = new THREE.MeshBasicMaterial({color: 0x44aa88});
    let cellmodel = new THREE.Mesh(geometry, material);
    cellmodel.position.set(pos[0],0,pos[1]);
    //console.log(cellmodel);
    return cellmodel;
  }
  loadGltf(name,pos){
    const gltfLoader = new GLTFLoader();
    let model;
    let gltf;
    let gltfModel;
    console.log(name);
    gltfLoader.load(name,function(data){
      gltf = data;
      gltfModel = gltf.scene;
      gltfModel.position.set(pos[0],0,pos[1]);
      console.log(gltfModel);
    });
    console.log(gltf);
  }
}
*/

class View{
  constructor(canvas){
    //this.canvas = document.querySelector('#c');
    this.renderer = new THREE.WebGLRenderer({canvas});
    this.scene = new THREE.Scene();
    this.fov = 60;
    this.aspect = 2;  // the canvas default
    this.near = 0.1;
    this.far = 200;
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
    this.color = 0xF8F8FF;
    this.intensity = 1;
    this.light = new THREE.DirectionalLight(this.color, this.intensity);
    //this.loadModel = new load3DModel();
    this.gltfLoader = new GLTFLoader();
    this.nameList = new Map([
      ['building','../model/TestCar.gltf'],
      ['house1','../model/TestHuman.gltf']
    ]);
  }
  initView(){
    this.scene.add(this.light);
    this.setSceneBackGroundCol("black");
    this.camera.position.set(0,5,0);
    this.camera.lookAt(0,0,0);
  }
  setSceneBackGroundCol(col){
    this.scene.background = new THREE.Color(col);
  }
  viewField(field){
    for(let i=0;i<field.length;i++){
      for(let j=0;j<field[i].length;j++){
        //console.log(field[i][j]);
        //let obj = this.loadModel.load(field[i][j],field.length,field[i].length,i,j);
        //console.log(obj);
        this.load(field[i][j],field.length,field[i].length,i,j);
        //this.scene.add(obj);
      }
    }
  }
  calcPos(lenH,lenW,posH,posW){
    let fieldCenterH = (lenH/2) + 0.5;
    let fieldCenterW = (lenW/2) + 0.5;
    let h = posH - fieldCenterH + 1;
    let w = posW - fieldCenterW + 1;
    return [h,w];
  }
  load(cell,lenH,lenW,posH,posW){
    let pos = this.calcPos(lenH,lenW,posH,posW);
    //console.log(cell.getName());
    if(cell.getName() == 'empty'){
      this.loadCell(pos);
    }else{
      let objName = this.nameList.get(cell.getName());
      //console.log(objName);
      this.loadGltf(objName,pos);
    }
  }
  loadCell(pos){
    let boxWidth = 0.95;
    let boxHeight = 0.02;
    let boxDepth = 0.95;
    let geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    let col = 0xFF0000 + pos[0]*10*30 + pos[1]*30;
    let material = new THREE.MeshBasicMaterial({color: col});
    let cellmodel = new THREE.Mesh(geometry, material);
    cellmodel.position.set(pos[0],0,pos[1]);
    console.log(cellmodel);
    this.scene.add(cellmodel);
  }
  loadGltf(name,pos){
    //console.log(name);
    this.gltfLoader.load(name,(data)=>{
      const gltf = data;
      const gltfModel = gltf.scene;
      gltfModel.position.set(pos[0],0,pos[1]);
      gltfModel.scale.set(0.1,0.1,0.1);
      console.log(gltfModel);
      this.scene.add(gltfModel);
    });
  }
  render(){
    let cvs = this.renderer.domElement;
    let pixelRatio = window.devicePixelRatio;
    let width = cvs.clientWidth * pixelRatio | 0;
    let height = cvs.clientHeight * pixelRatio | 0;
    let needResize = cvs.width !== width || cvs.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = cvs.clientWidth / cvs.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    
    //this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => { this.render(); });
    this.renderer.render(this.scene, this.camera);
  }
}

function init(){
  const city = new City(4,4);
  city.initField();
  
  const view = new View(document.querySelector('#c'));
  view.initView();
  view.viewField(city.getField());
  city.editCell(1,1,1,'building',1,1,"S",100);

  view.viewField(city.getField());
  //view.render();
  view.render();
  
}

init();
