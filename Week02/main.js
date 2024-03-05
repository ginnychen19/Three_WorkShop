import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { Loadings } from './loading.js';
import { InputHandler } from './input.js';
import { Player } from './player.js';
import { Camera } from './camera.js';

import { PhysicsWorld } from './physicsWorld.js';


class ThreeScene {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.scene = new THREE.Scene();
        this.Camera = new Camera(this);
        this.camera = this.Camera.camera;
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);//兩個都要有
        this.controls.enabled = true; //啟用縮放
        // this.controls.enableZoom = true; //啟用縮放
        // this.controls.enablePan = false; //關閉平移
        this.controls.enableDamping = true; // 啟用阻尼效果
        this.controls.dampingFactor = 0.25; // 阻尼系數

        

        this.LD = new Loadings(this);

        this.Input = new InputHandler(this);
        this.keys = [];
        this.player = new Player(this);

        this.physicsWorld = new PhysicsWorld(this.scene);

        this.height = window.innerHeight;
        this.width = window.innerWidth;

        this.onWindowResize(this);
    }
    async init() {
        await this.LD.init();
        this.createScene();
        this.creatSkybox();
        this.createLights();
        this.createRenderer();

        this.Camera.init();

        this.player.init();

        animate();
    }
    update() {
        this.Camera.update();
        this.player.movement();

        this.physicsWorld.update();
    }

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
        this.directionalLight = new THREE.DirectionalLight("#AAAAFF", 0.5);
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

    createObj() {
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

        // /* 日 */
        // const geometry = new THREE.SphereGeometry(2, 16, 16);
        // const sphere = new THREE.Mesh(geometry, Mt_map[1]);
        // sphere.position.set(0, 20, 0);
        // this.scene.add(sphere);
        // /* 地板 */
        const planeGeom = new THREE.PlaneGeometry(2500, 2500, 1, 1);
        const plane = new THREE.Mesh(planeGeom, Mt_map[0]);
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(0, -1, 0);
        this.scene.add(plane);

    }
}



const app = new ThreeScene();
app.init();

function animate() {
    requestAnimationFrame(animate);
    app.update();


    // 加入這行，讓渲染器每秒一直跑，更新畫面
    app.renderer.render(app.scene, app.camera);

    // 會有這行是因為我還把Render丟到額外的檔
    // if (app.Render.finalComposer) {
    //     app.Render.update();
    // }
}










// // 檢查是否為移動裝置，如果是，則不處理 PixelRatio 設定
// if (!window.matchMedia("(pointer: coarse)").matches) {//是pc
//     this.renderer.setPixelRatio(window.devicePixelRatio);
//     this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//     this.renderer.antialias = true;
// } else {
//     // 設為 BasicShadowMap 可以提高效能但陰影質量較差
//     // this.renderer.shadowMap.type = THREE.BasicShadowMap;
//     this.renderer.setPixelRatio(1);
//     this.renderer.shadowMap.type = THREE.PCFShadowMap;
// }



