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
        this.editCell(h,w,0,"empty",1,1,"S",cnt);
        cnt = cnt+1;
      }
    }
  }
  editCell(y,x,ObjType,name,height,width,direction,group){
    // ObjType = 0:Empty, 1:Building, 2:Road
    console.log("edit cell");
    let msFlag = false;

    for (let i=y;i<y+height;i++){
      for (let j=x;j<x+width;j++){
        if (ObjType == 0){
          if(msFlag == false){
            this.field[i][j] = new Empty(name,height,width,direction,group,"master");
            msFlag = true;
          }else{
            this.field[i][j] = new Empty(name,height,width,direction,group,"slave");
          }
        }else if(ObjType == 1){
          if(msFlag == false){
            this.field[i][j] = new Building(name,height,width,direction,group,"master");
            msFlag = true;
          }else{
            this.field[i][j] = new Building(name,height,width,direction,group,"slave");
          }
        }else if(ObjType == 2){
          if(msFlag == false){
            this.field[i][j] = new Road(name,height,width,direction,group,"master");
            msFlag = true;
          }else{
            this.field[i][j] = new Road(name,height,width,direction,group,"slave");
          }
        }else{
          console.log("city.editCell ObjType error : cant use number %d . valiable num is 0,1,2.", ObjType);
        }
      }
    }

    /*
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
    */
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

class View{
  constructor(canvas){
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
    this.gltfLoader = new GLTFLoader();
    this.nameList = {'building':'../model/test.gltf','house1':'../model/TestHuman.gltf'};
    this.pointCenter = [0,0]; //x,y
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
        this.load(field[i][j],field.length,field[i].length,i,j);
      }
    }
  }
  calcPos(lenH,lenW,posH,posW){
    let fieldCenterH = (lenH/2) + 0.5;
    let fieldCenterW = (lenW/2) + 0.5;
    let h = posH - fieldCenterH+1+pointCenter[1];
    let w = posW - fieldCenterW+1+pointCenter[0];
    return [h,w];
  }
  load(cell,lenH,lenW,posH,posW){
    let pos = this.calcPos(lenH,lenW,posH,posW);
    if(cell.getName() == 'empty'){
      this.loadCell(pos);
    }else{
      let objName = this.nameList[cell.getName()];
      this.loadGltf(objName,pos);
    }
  }
  loadCell(pos){
    let boxWidth = 0.95;
    let boxHeight = 0.02;
    let boxDepth = 0.95;
    let geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    let col = 0xFF0000+pos[1]*15;
    let material = new THREE.MeshBasicMaterial({color: col});
    let cellmodel = new THREE.Mesh(geometry, material);
    cellmodel.position.set(pos[0],0,pos[1]);
    console.log(cellmodel);
    this.scene.add(cellmodel);
  }
  loadGltf(name,pos){
    this.gltfLoader.load(name,(data)=>{
      const gltf = data;
      const gltfModel = gltf.scene;
      gltfModel.position.set(pos[0],0,pos[1]);
      gltfModel.scale.set(0.1,0.1,0.1);
      console.log(gltfModel);
      this.scene.add(gltfModel);
    });
  }
}

class Viewer_AR extends View{}

class Viewer_2D extends View{
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
    requestAnimationFrame(() => { this.render(); });
    this.renderer.render(this.scene, this.camera);
  }
}

function init(){
  const city = new City(2,2);
  city.initField();
  
  const view = new Viewer_2D(document.querySelector('#c'));
  view.initView();
  view.viewField(city.getField());
  city.editCell(1,0,1,'building',1,1,"S",100);

  view.viewField(city.getField());
  view.render();
  
}

init();
