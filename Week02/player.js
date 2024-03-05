import * as THREE from 'three';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import * as RAPIER from '@dimforge/rapier3d';

export class Player {
    constructor(main) {
        this.main = main;
        this.scene = main.scene;
        this.playerMesh;
        this.LD = main.LD;

        this.loader = new OBJLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.Texturenum = 0;
        this.moveDistance = 1;

        this.canJump = false;
        this.jumpVelocity = 15;

        this.speed = 5;
        // this.rotationQuaternion = new CANNON.Quaternion();
    }
    init() {
        this.addmesh();
        // console.log(RAPIER);
    }


    addmesh() {
        console.log("我進入 Player 的 init 了!")
        let that = this; //先轉換this指向
        /* 車身 */
        const loader = new GLTFLoader().setPath('./assest/models/');
        loader.load('carbody.glb', function (gltf) {
            that.carbody = gltf.scene;
            that.carbody.position.set(0, 15, 0);
            that.scene.add(that.carbody);


            console.log(that.carbody.position);
            that.main.camera.position.set(0, 300, 500);
            that.main.camera.lookAt(that.carbody.position);
        });

        // that.carbody.add(that.scene.camera); //相機追蹤
        /* 輪胎 */
        loader.load('carwheel.glb', function (gltf) {
            that.carwheel = gltf.scene;
            that.carwheel01 = that.carwheel.clone();
            that.carwheel01.position.set(-36, 0, -52);
            that.carwheel02 = that.carwheel.clone();
            that.carwheel02.position.set(36, 0, -52);
            that.carwheel03 = that.carwheel.clone();
            that.carwheel03.position.set(36, 0, 52);
            that.carwheel04 = that.carwheel.clone();
            that.carwheel04.position.set(-36, 0, 52);
            that.carbody.add(that.carwheel01, that.carwheel02, that.carwheel03, that.carwheel04);
        });

    }
    jump(that) {
        /* 這段是用來檢測是否是遇到可起跳的表面 */
        // 在沒有使用物理的情況可以直接判斷當前位置是否是位置有在00

    }
    movement() {
        if (this.carbody) {
            if (this.main.keys.includes("w") || this.main.keys.includes('ArrowUp')) {
                this.carbody.translateZ(-this.moveDistance * this.speed);
            }
            if (this.main.keys.includes("s") || this.main.keys.includes('ArrowDown')) {
                this.carbody.translateZ(this.moveDistance * this.speed);
            }
            if (this.main.keys.includes("a") || this.main.keys.includes('ArrowLeft')) {
                this.carbody.rotation.y -= 0.05;
            }
            if (this.main.keys.includes("d") || this.main.keys.includes('ArrowRight')) {
                this.carbody.rotation.y += 0.05;
            }
        }
    }
    setState() {
    }
}

