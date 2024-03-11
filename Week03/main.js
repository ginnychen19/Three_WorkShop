import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { PhysicsWorld } from './physicsWorld.js';
import { Loadings } from './loading.js';
import { InputHandler } from './input.js';
import { Camera } from './camera.js';
import { Player } from './player.js';

class ThreeScene {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
        this.scene = new THREE.Scene();
        this.Camera = new Camera(this);
        this.camera = this.Camera.camera;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enabled = true;
        // this.controls.enableZoom = true; 
        // this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;

        /* 物理世界必須優先啟動 */
        this.physicsWorld = new PhysicsWorld(this);
        this.LD = new Loadings(this);

        /* 鍵盤與手指移動輸入控制 */
        this.Input = new InputHandler(this);

        this.clock = new THREE.Clock();// 世界更新循環
        this.height = window.innerHeight;
        this.width = window.innerWidth;
        this.onWindowResize(this);
    }
    async init() {
        await this.physicsWorld.init();
        //要把加入碰撞場景，加入鍵盤監聽 ，加入汽車 Vehicle 這個檔在完成this.LD.init()才可以加入
        await this.LD.init(this.createObj.bind(this), this.createvehicle.bind(this));

        this.createScene();
        this.creatSkybox();
        this.createLights();
        this.createRenderer();

        this.Camera.init();

        this.animate(); // 放在這裡是因為必須等到模型Loading結束
    }
    update() {
        this.Camera.update();
        if (this.player) this.player.update();
        this.physicsWorld.update();
    }
    animate() {
        const deltaTime = this.clock.getDelta();
        this.update();
        this.renderer.render(this.scene, this.camera);
        this.renderer.setAnimationLoop(this.animate.bind(this));
    }


    /* 建立基礎世界 + Resize */
    createScene() {
        this.scene.fog = new THREE.Fog(0xffffaa, 1000, 2000)
        // this.scene.fog = new THREE.FogExp2(0xffffaa, 0.001);
        this.scene.background = new THREE.Color(0xffffaa);
    }
    creatSkybox() {
    }
    createLights() {
        //環境光
        const ambiColor = "#ffffff";
        this.ambientLight = new THREE.AmbientLight(ambiColor, 1.0);

        //半球光
        this.hemisphereLight = new THREE.HemisphereLight("#FFFFFF", "#AAAAFF");
        this.hemisphereLight.intensity = 0.5;
        this.hemisphereLight.position.set(0, 20, 0);

        //直射光
        this.directionalLight = new THREE.DirectionalLight("#AAAAFF", 1.0);
        this.directionalLight.position.set(0, 20, 10);
        this.directionalLight.castShadow = true; //是否造成陰影
        this.directionalLight.shadow.mapSize.x = 1024; //陰影細緻度
        this.directionalLight.shadow.mapSize.y = 1024;
        // 直射光- 調整陰影相機的遠近剪裁面
        this.directionalLight.shadow.camera.near = 0;
        this.directionalLight.shadow.camera.far = 400;
        this.directionalLight.shadow.camera.top = 120;
        this.directionalLight.shadow.camera.right = 120;
        this.directionalLight.shadow.camera.bottom = - 120;
        this.directionalLight.shadow.camera.left = - 120;
        // this.directionalLight.shadow.bias = -0.009;

        this.scene.add(this.ambientLight, this.hemisphereLight, this.directionalLight);
    }
    createRenderer() {
        /* 建立渲染器 */
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        $(this.renderer.domElement).addClass("canvas3D");
        $("#webgl").append(this.renderer.domElement);
    }
    onWindowResize(that) {
        window.addEventListener('resize', function (e) {
            that.camera.aspect = window.innerWidth / window.innerHeight;
            that.camera.updateProjectionMatrix();
            that.renderer.setSize(window.innerWidth, window.innerHeight);
            that.windowWidth = window.innerWidth;
            that.windowHeight = window.innerHeight;
        });
    }


    /* 測試加入物件 */
    createObj(m_city) {
        const that = this;
        const Mt_map = [
            new THREE.MeshLambertMaterial({
                color: 0x434343,
                // side: THREE.DoubleSide,
            }),
            new THREE.MeshLambertMaterial({
                color: 0xFFFF00,
                // side: THREE.DoubleSide,
            }),
        ]

        /* 地板 */
        const planeGeom = new THREE.PlaneGeometry(500, 500, 1, 1);
        const plane = new THREE.Mesh(planeGeom, Mt_map[0]);
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(0, 0, 0);
        this.scene.add(plane);

        /* 加入城市場景模型 */
        // gltf取得貼圖的方式 
        m_city.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.side = THREE.DoubleSide;
                // console.log(child.material.side);
            }
        });
        m_city.position.set(0, 1, 0);
        this.scene.add(m_city);

        /* 給城市場景模型加入凸包物理 */
        const createCityCollider = this.physicsWorld.createScene(m_city);
        this.co_city = createCityCollider;

    }
    createvehicle(m_carbody, m_carWheel) {
        /* 汽車模型建立 + 控制邏輯 */
        this.player = new Player(this, this.physicsWorld, m_carbody, m_carWheel, this.Input, this.camera);
        this.player.init();
    }
}

const app = new ThreeScene();
app.init();



