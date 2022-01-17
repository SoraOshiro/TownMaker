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
  }
  connect(){
  }
  rotate(h,w,direction){
    const direcList = {'N':0,'E':90,'S':180,'W':270};
    let nowDirection = this.field[h][w].getDirection();
    let angle = direcList[nowDirection] - direcList[direction];
    console.log(direcList[nowDirection], direcList[direction], angle);
    console.log(this.field[h][w]);
    //this.field[h][w].rotation.y = Math.PI*angle/180;
    //this.field[h][w].rotateY(THREE.Math.degToRad(angle));
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
    //this.renderer = new THREE.WebGLRenderer({canvas});
    this.scene = new THREE.Scene();
    this.fov = 60;
    this.aspect = 2;  // the canvas default
    this.near = 0.1;
    this.far = 200;
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
    this.color = 0xF8F8FF;
    this.intensity = 1;
    this.light = new THREE.AmbientLight(this.color, this.intensity);
    this.gltfLoader = new GLTFLoader();
    this.nameList = {'test_house':'../model/test_fix.gltf',
    'building1':'../model/Building/Building1/Bilding.001.gltf',
    'building2':'../model/Building/Building2/Building.002.gltf',
    'building3':'../model/Building/Building3/Building.003.gltf',
    'building4':'../model/Building/Building4/Building.004.gltf',
    'building5':'../model/Building/Building5/Building.005.gltf',
    'building6':'../model/Building/Building6/Building.006.gltf',
    'road_none':'../model/Road/Road_None/Road_None.gltf',
    'road_normal':'../model/Road/Road_Nomal/Road_Nomal.gltf',
    'road_corner':'../model/Road/Road_Corner/Road_Corner.gltf',
    'road_cross':'../model/Road/Road_Cross/Road_Cross.gltf',
    'road_tjunc':'../model/Road/Road_T-junc/Road_T-junc.gltf',
    'road_end':'../model/Road/Road_End/Road_End.gltf',
    'house1':'../model/House/House.001.gltf',
    'house2':'../model/House/House.002.gltf',
    'house3':'../model/House/House.003.gltf',
    'house4':'../model/House/House.004.gltf',
    'house5':'../model/House/House.005.gltf',
    'house6':'../model/House/House.006.gltf',
    'house7':'../model/House/House.007.gltf',
    'house8':'../model/House/House.008.gltf',
    'house9':'../model/House/House.009.gltf',
    'car':'../model/car.gltf',
    'test_car':'../model/TestCar.gltf',
    'people':'../model/TestHuman.gltf'};
    this.centerFlag = false;
    this.pointCenter = [0,0,0]; //x,y,z
    this.angleValue = {'N':0,'E':90,'S':180,'W':270};
  }
  setPointCenter(point){
    this.pointCenter[0] = point[0];
    this.pointCenter[1] = point[1];
    this.pointCenter[2] = point[2];
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
    let h = -1*(posH - fieldCenterH+1+this.pointCenter[2]);
    let y = this.pointCenter[1];
    let w = posW - fieldCenterW+1+this.pointCenter[0];
    console.log([h,y,w]);
    return [h,y,w];
  }
  load(cell,lenH,lenW,posH,posW){
    let pos = this.calcPos(lenH,lenW,posH,posW);
    if(cell.getName() == 'empty'){
      this.loadCell(pos);
    }else{
      let objName = this.nameList[cell.getName()];
      let className = cell.constructor.name;
      let direc = this.angleValue[cell.getDirection()];
      this.loadGltf(objName,pos,className,direc);
    }
  }
  loadCell(pos){
    let boxWidth = 0.95;
    let boxHeight = 0.02;
    let boxDepth = 0.95;
    let geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    let col = 0x008000;
    let material = new THREE.MeshBasicMaterial({color: col});
    let cellmodel = new THREE.Mesh(geometry, material);
    cellmodel.position.set(pos[0],pos[1]+0.05,pos[2]);
    //console.log(cellmodel);
    this.scene.add(cellmodel);
  }
  loadGltf(name,pos,cls,angle){
    this.gltfLoader.load(name,(data)=>{
      const gltf = data;
      const gltfModel = gltf.scene;
      gltfModel.position.set(pos[0],pos[1]+0.08,pos[2]);
      if(cls == 'Road'){
        gltfModel.scale.set(0.27,0.27,0.27);
      }else{
        gltfModel.scale.set(0.085,0.085,0.085);
      }
      if(angle != 0){
        gltfModel.rotation.set(0,Math.PI*angle/180,0);
      }
      console.log(gltfModel);
      this.scene.add(gltfModel);
    });
  }
}

class Viewer_AR extends View{
  constructor(canvas){
    super(canvas);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.point;
    this.options = {requiredFeatures: [ 'hit-test','dom-overlay' ]};
    this.container = document.createElement('div');
    this.instObjButton = document.createElement('div');
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry( 0.075, 0.1, 32 ).rotateX( - Math.PI / 2 ),
      new THREE.MeshBasicMaterial({color:0x1e90ff})
    );
    this.hitTestSource = null;
    this.hitTestSourceRequested = false;
  }
  initView(){
    console.log("init viewer_ar");
    this.container.id = "container";
    document.body.appendChild( this.container );
    this.instObjButton.id = "instButton";
    this.instObjButton.innerHTML = "INSTALLATION";
    this.container.appendChild(this.instObjButton);
    //this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.xr.enabled = true;
    this.scene.add(this.light);

    this.options.domOverlay = {root : document.getElementById('container')};
    document.body.appendChild(ARButton.createButton(this.renderer, this.options));

    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);
  }
  animate(){
    this.renderer.setAnimationLoop(this.render);
  }
  render(time,frame){
    //console.log("rendering viewer ar");
    console.log(frame);
    if ( frame ) {
      this.instObjButton.innerHTML = "framing now";
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const session = this.renderer.xr.getSession();
      //console.log(session);
      //console.log("now frame");
      if ( this.hitTestSourceRequested === false ) {
        //console.log("hitTestSourceRequested");
        session.requestReferenceSpace('viewer').then((referenceSpace)=>{
          session.requestHitTestSource( { space: referenceSpace } ).then((source)=>{
            this.hitTestSource = source;
          } );
        } );
        session.addEventListener( 'end',()=>{
          this.hitTestSourceRequested = false;
          this.hitTestSource = null;
        } );
        this.hitTestSourceRequested = true;
      }
  
      if ( this.hitTestSource ) {
        const hitTestResults = frame.getHitTestResults( this.hitTestSource );
        if ( hitTestResults.length ) {
          //console.log("hit-test reticle true");
          const hit = hitTestResults[ 0 ];
          this.reticle.visible = true;
          this.reticle.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );
        } else {
          //console.log("hit-test reticle false");
          this.reticle.visible = false;
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
}

class Viewer_2D extends View{
  constructor(canvas){
    super(canvas);
    this.renderer = new THREE.WebGLRenderer({canvas});
  }
  initView(){
    this.scene.add(this.light);
    this.setSceneBackGroundCol("white");
    this.camera.position.set(-4,2.5,0);
    this.camera.lookAt(0,0,0);
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
    requestAnimationFrame(() => { this.render(); });
    this.renderer.render(this.scene, this.camera);
  }
}

function main(){
  const view = new Viewer_2D(document.querySelector('#c'));
  //view.setPointCenter([0,-1,0]);
  const city = new City(4,4);

  city.initField();
  
  //const view = new Viewer_AR(document.querySelector('#c'));

  view.initView();
  
  view.viewField(city.getField());

  city.editCell(0,0,1,'building1',1,1,"S",101);
  city.editCell(0,1,1,'building2',1,1,"S",102);
  city.editCell(0,3,1,'building3',1,1,"S",103);
  
  city.editCell(2,0,1,'house7',1,1,"S",100);
  city.editCell(2,1,1,'house8',1,1,"S",100);
  city.editCell(2,3,1,'house9',1,1,"W",100);
  city.editCell(3,1,1,'house9',1,1,"N",100);
  city.editCell(3,3,1,'house1',1,1,"N",100);

  city.editCell(3,0,1,'test_car',1,1,"N",100);

  city.editCell(0,2,2,'road_normal',1,1,"W",200);
  city.editCell(1,0,2,'road_normal',1,1,"S",201);
  city.editCell(1,1,2,'road_normal',1,1,"S",202);
  city.editCell(1,2,2,'road_cross',1,1,"S",203);
  city.editCell(1,3,2,'road_normal',1,1,"S",204); 
  city.editCell(2,2,2,'road_normal',1,1,"W",205);
  city.editCell(3,2,2,'road_normal',1,1,"W",206); 

  

  view.viewField(city.getField());
  view.render();
  //view.animate();
  
}

main();
