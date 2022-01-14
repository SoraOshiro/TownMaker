import * as THREE from '../js/three.module.js';
import { GLTFLoader } from '../js/GLTFLoader.js';
import { ARButton } from '../js/ARButton.js';

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
    /*
    const direcList = {'N':0,'E':90,'S':180,'W':270};
    let nowDirection = this.field[h][w].getDirection();
    let angle = direcList[nowDirection] - direcList[direction];
    console.log(direcList[nowDirection], direcList[direction], angle);
    console.log(this.field[h][w]);
    //this.field[h][w].rotation.y = Math.PI*angle/180;
    //this.field[h][w].rotateY(THREE.Math.degToRad(angle));
    this.field[h][w].setDirection(direction);
    */
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

//各Viewerの親
class View{
  constructor(){
    this.scene = new THREE.Scene();
    this.fov = 70;
    this.aspect = window.innerWidth / window.innerHeight;
    this.near = 0.01;
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
  viewSingleField(field,pos){
    let i = pos[0];
    let j = pos[1];
    this.load(field[i][j],field.length,field[i].length,i,j);
  }
  calcPos(lenH,lenW,posH,posW){
    let val = 0.2;
    let fieldCenterH = (lenH/2)+0.5;
    let fieldCenterW = (lenW/2)+0.5;
    let h = (val*(posH-fieldCenterH+1)+this.pointCenter[0]);
    let y = this.pointCenter[1];
    let w = (val*(posW-fieldCenterW+1)+this.pointCenter[2]);
    //console.log([h,y,w]);
    return [h,y,w];
  }
  load(cell,lenH,lenW,posH,posW){
    let pos = this.calcPos(lenH,lenW,posH,posW);
    if(cell.getName() == 'empty'){
      this.loadCell(pos,posH,posW);
    }else{
      let objName = this.nameList[cell.getName()];
      let className = cell.constructor.name;
      let direc = this.angleValue[cell.getDirection()];
      this.loadGltf(objName,pos,className,direc,posH,posW);
    }
  }
  loadCell(pos,h,w){
    let val = 0.2;
    let boxWidth = 0.95 * val;
    let boxHeight = 0.02 * val;
    let boxDepth = 0.95 * val;
    let geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    let col = 0x008000;
    let material = new THREE.MeshBasicMaterial({color: col});
    let cellmodel = new THREE.Mesh(geometry, material);
    cellmodel.position.set(pos[0],pos[1]+0.05,pos[2]);
    //cellmodel.scale.set(0.25,0.25,0.25);
    cellmodel.name = [h,w];
    //console.log(cellmodel.name);
    //console.log(cellmodel);
    this.scene.add(cellmodel);
  }
  loadGltf(name,pos,cls,angle,h,w){
    let val = 0.2;
    let modelScale = [0,0,0];
    if(cls == 'Road'){
      //gltfModel.scale.set(0.27*val,0.27*val,0.27*val);
      modelScale[0]=0.27*val;
      modelScale[1]=0.27*val;
      modelScale[2]=0.27*val;
    }else{
      //gltfModel.scale.set(0.085*val,0.085*val,0.085*val);
      modelScale[0]=0.085*val;
      modelScale[1]=0.085*val;
      modelScale[2]=0.085*val;
    }
    this.gltfLoader.load(name,(data)=>{
      const gltf = data;
      const gltfModel = gltf.scene;
      gltfModel.position.set(pos[0],pos[1]+0.08,pos[2]);
      gltfModel.scale.set(modelScale[0],modelScale[1],modelScale[2]);
      if(angle != 0){
        gltfModel.rotation.set(0,Math.PI*angle/180,0);
      }
      gltfModel.name = [h,w];
      //console.log(gltfModel.name);
      //console.log(gltfModel);
      this.scene.add(gltfModel);
    });
  }
}

// ARモード用のViewer
class Viewer_AR extends View{
  constructor(){
    super();
    this.container = document.createElement('div');
    this.overlay = document.getElementById("overlay");
    this.windowStateAngle = document.getElementById("state_angle");
    this.windowStateObject = document.getElementById("state_object");
    this.state_set_field = document.getElementById("setFieldButton");
    this.state_update_object = document.getElementById("updateObjectButton");
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    //this.options = {requiredFeatures: [ 'hit-test','dom-overlay' ]};
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry( 0.03, 0.05, 32 ).rotateX( - Math.PI / 2 ),
      new THREE.MeshBasicMaterial({color:0x1e90ff})
    );
    this.hitTestSource = null;
    //this.hitTestSourceRequested = false;
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
    this.collectObject = 'empty';
    this.collectObjectType = 0;
    this.collectAngle = 'N';
    this.objectCoordinate = null;
    this.originObject = null;
  }
  initView(){
    console.log("init viewer_ar");
    this.reticle.name = [-100,-100];
    document.body.appendChild(this.container);
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.xr.enabled = true;
    this.scene.add(this.light);
    this.container.appendChild(this.renderer.domElement);

    //document.body.appendChild(ARButton.createButton(this.renderer, this.options));
    document.body.appendChild(ARButton.createButton(
        this.renderer,
        { requiredFeatures: [ 'hit-test' ], overlay: this.overlay },
        (s)=>{this.onSessionStarted(s)}
      )
    );

    this.state_update_object.style.display = "none";
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);
    window.addEventListener('resize', ()=>{this.onWindowResize()});
  }
  onSessionStarted(session) {
    session.requestReferenceSpace('viewer').then((referenceSpace)=>{
      session.requestHitTestSource({ space: referenceSpace }).then((source)=>{
        this.hitTestSource = source;
      });
    });
    session.addEventListener('end', ()=>{
      this.hitTestSource = null;
    });
  }
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  animate(){
    this.renderer.setAnimationLoop((a,b)=>{this.render(a,b)});
  }
  render(timestamp, frame) {
    if (frame) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      if (this.hitTestSource) {

        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length) {
          const hit = hitTestResults[0];

          this.reticle.visible = true;
          this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
          this.pick();
        } else {
          this.reticle.visible = false;
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
  pick() {
    this.camera.matrixWorld.decompose(this.originPos,this.originQt,this.originScale);
    this.reticle.matrixWorld.decompose(this.direcPos,this.direcQt,this.direcScale);
    this.direcPosNormalize = this.direcPos.normalize();
    if (this.pickedObject) {
      this.pickedObject = undefined;
    }
    this.raycaster.set(this.originPos, this.direcPosNormalize)
    const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);
    if (intersectedObjects.length) {
      this.pickedObject = intersectedObjects[0].object;
      this.setObjectCoordinate();
    }
  }
  setObjectCoordinate(){
    let obj = this.pickedObject;
    while(true){
      if(Array.isArray(obj.name) == false){
        obj = obj.parent
      }else{
        break;
      }
    }
    if(obj.name != [-100,-100]){
      this.originObject = obj;
      this.objectCoordinate = obj.name;
    }
  }
  setCollectObject(objName,objType){
    this.collectObject = objName;
    this.collectObjectType = objType;
    this.setWindowStateObject();
  }
  setCollectAngle(angle){
    this.collectAngle = angle;
    this.setWIndowStateAngle();
  }
  updateObject(city,view){
    this.scene.remove(this.originObject);
    city.editCell(this.objectCoordinate[0],this.objectCoordinate[1],this.collectObjectType,this.collectObject,1,1,this.collectAngle,10);
    this.viewSingleField(city.getField(),[this.objectCoordinate[0],this.objectCoordinate[1]]);
  }
  setField(city){
    if(this.reticle.visible){
      this.setPointCenter([this.direcPos.x,this.direcPos.y,this.direcPos.z]);
      city.initField();
      this.viewField(city.getField());
      this.state_set_field.style.display = "none";
      this.state_update_object.style.display = "block";
    }
  }
  setWindowStateObject(){
    const img_src = {
    'building1':'../img/Building.001.png',
    'building2':'../img/Building.002.png',
    'building3':'../img/Building.003.png',
    'building4':'../img/Building.004.png',
    'building5':'../img/Building.005.png',
    'building6':'../img/Building.006.png',
    'road_none':'../img/Road_None.png',
    'road_normal':'../img/Road_Normal.png',
    'road_corner':'../img/Road_Corner.png',
    'road_cross':'../img/Road_Cross.png',
    'road_tjunc':'../img/Road_T-junc.png',
    'road_end':'../img/Road_End.png',
    'house1':'../img/House.001.png',
    'house2':'../img/House.002.png',
    'house3':'../img/House.003.png',
    'house4':'../img/House.004.png',
    'house5':'../img/House.005.png',
    'house6':'../img/House.006.png',
    'house7':'../img/House.007.png',
    'house8':'../img/House.008.png',
    'house9':'../img/House.009.png',
    'empty':'../img/empty.png'};
    let src = img_src[this.collectObject];
    this.windowStateObject.innerHTML = "<img id='nowCollectObject' src='"+src+"'>";
  }
  setWIndowStateAngle(){
    const show_angle = {
    'N':'きた',
    'E':'ひがし',
    'W':'にし',
    'S':'みなみ'};
    this.windowStateAngle.innerHTML = "えらんだむき : "+show_angle[this.collectAngle];
  }
}

// マウスモード用のViewer
class Viewer_2D extends View{
  constructor(canvas){
    super();
    this.renderer = new THREE.WebGLRenderer({canvas});
    this.raycaster = new THREE.Raycaster();
    this.collectObject = null;
    this.collectObjectType = null;
    this.collectAngle = 'N';
    this.pickedObject = null;
    this.objectCoordinate = null;
    this.originObject = null;
    this.mouse = new THREE.Vector2();
  }
  initView(){
    this.scene.add(this.light);
    this.setSceneBackGroundCol("white");
    this.camera.position.set(0,1,0.01);
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
    this.pick();
    requestAnimationFrame(() => { this.render(); });
    this.renderer.render(this.scene, this.camera);
  }
  pick() {
    if (this.pickedObject) {
      this.pickedObject = undefined;
    }
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);
    if (intersectedObjects.length) {
      this.pickedObject = intersectedObjects[0].object;
      //console.log(this.pickedObject.name);
      this.setObjectCoordinate();
    }
  }
  onMouseMove(event){
    //const pos = getCanvasRelativePosition(event);
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / (window.innerHeight*0.8) ) * 2 + 1;
    //console.log(this.mouse);
  }
  clearPickPosition(){
    this.mouse.x = -100000;
    this.mouse.y = -100000;
  }
  setObjectCoordinate(){
    //console.log(this.pickedObject);
    //console.log(this.pickedObject.name);
    //console.log(this.pickedObject.parent.name);
    let obj = this.pickedObject;
    while(true){
      if(Array.isArray(obj.name) == false){
        obj = obj.parent
      }else{
        //console.log('hogehoge');
        break;
      }
    }
    //console.log(obj.name);
    this.originObject = obj;
    this.objectCoordinate = obj.name;
  }
  setCollectObject(objName,objType){
    this.collectObject = objName;
    this.collectObjectType = objType;
    console.log('setCollectObject : '+this.collectObject+', '+this.collectObjectType);
  }
  setCollectAngle(angle){
    this.collectAngle = angle;
    console.log('setCollectAngle : '+this.collectAngle);
  }
  updateObject(city,view){
    console.log("now trying remove objects position is "+this.originObject.name);
    this.scene.remove(this.originObject);
    city.editCell(this.objectCoordinate[0],this.objectCoordinate[1],this.collectObjectType,this.collectObject,1,1,this.collectAngle,10);
    this.viewSingleField(city.getField(),[this.objectCoordinate[0],this.objectCoordinate[1]]);
  }
  testObj(){
    console.log(this,this.originObject);
  }
}

function main(){
  /*
  const view = new Viewer_2D(document.querySelector('#c'));
  view.setPointCenter([0,0,0]);
  const city = new City(3,3);
  city.initField();
  city.editCell();
  view.initView();
  city.editCell(0,0,1,'building1',1,1,"S",101);
  city.editCell(1,0,2,'road_none',1,1,"S",101);
  city.editCell(2,0,2,'road_normal',1,1,"S",101);
  city.editCell(0,1,1,'house1',1,1,"S",101);
  view.viewField(city.getField());
  view.render();
  */  
  
  const view = new Viewer_AR();
  const city = new City(3,3);
  view.initView();
  view.animate();
  

  //addEventListener置き場
  //document.getElementById('c').addEventListener('click', ()=>{view.testObj()});
  //document.getElementById('c').addEventListener('click', ()=>{view.updateObject(city,view)});
  //document.getElementById('c').addEventListener('mousemove', (e)=>{view.onMouseMove(e)});
  document.getElementById('setFieldButton').addEventListener('click', ()=>{view.setField(city)});
  document.getElementById('updateObjectButton').addEventListener('click', ()=>{view.updateObject(city,view)});

  document.getElementById('angle_N').addEventListener('click', ()=>{view.setCollectAngle('N')});
  document.getElementById('angle_E').addEventListener('click', ()=>{view.setCollectAngle('E')});
  document.getElementById('angle_S').addEventListener('click', ()=>{view.setCollectAngle('S')});
  document.getElementById('angle_W').addEventListener('click', ()=>{view.setCollectAngle('W')});
  document.getElementById('building1').addEventListener('click', ()=>{view.setCollectObject('building1',1)});
  document.getElementById('building2').addEventListener('click', ()=>{view.setCollectObject('building2',1)});
  document.getElementById('building3').addEventListener('click', ()=>{view.setCollectObject('building3',1)});
  document.getElementById('building4').addEventListener('click', ()=>{view.setCollectObject('building4',1)});
  document.getElementById('building5').addEventListener('click', ()=>{view.setCollectObject('building5',1)});
  document.getElementById('building6').addEventListener('click', ()=>{view.setCollectObject('building6',1)});
  document.getElementById('house1').addEventListener('click', ()=>{view.setCollectObject('house1',1)});
  document.getElementById('house2').addEventListener('click', ()=>{view.setCollectObject('house2',1)});
  document.getElementById('house3').addEventListener('click', ()=>{view.setCollectObject('house3',1)});
  document.getElementById('house4').addEventListener('click', ()=>{view.setCollectObject('house4',1)});
  document.getElementById('house5').addEventListener('click', ()=>{view.setCollectObject('house5',1)});
  document.getElementById('house6').addEventListener('click', ()=>{view.setCollectObject('house6',1)});
  document.getElementById('house7').addEventListener('click', ()=>{view.setCollectObject('house7',1)});
  document.getElementById('house8').addEventListener('click', ()=>{view.setCollectObject('house8',1)});
  document.getElementById('house9').addEventListener('click', ()=>{view.setCollectObject('house9',1)});
  document.getElementById('road_none').addEventListener('click', ()=>{view.setCollectObject('road_none',2)});
  document.getElementById('road_normal').addEventListener('click', ()=>{view.setCollectObject('road_normal',2)});
  document.getElementById('road_corner').addEventListener('click', ()=>{view.setCollectObject('road_corner',2)});
  document.getElementById('road_cross').addEventListener('click', ()=>{view.setCollectObject('road_cross',2)});
  document.getElementById('road_tjunc').addEventListener('click', ()=>{view.setCollectObject('road_tjunc',2)});
  document.getElementById('road_end').addEventListener('click', ()=>{view.setCollectObject('road_end',2)});
  document.getElementById('empty').addEventListener('click', ()=>{view.setCollectObject('empty',0)});
}

main();
