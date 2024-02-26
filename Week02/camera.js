import * as THREE from 'three';
import gsap from "gsap";

export class Camera {
    constructor(main) {
        this.main = main;
        this.scene = main.scene;
        this.renderer = main.renderer;

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);

        this.railRadius = 50; //假設攝影機軌道半徑為20單位
        this.zoon = 5;
        this.zoonMax = 30;
        this.zoonMin = 20;
        this.cursor = new THREE.Vector2(); // 建立一個Vector2來記錄滑鼠位置。

        this.canUseMouse = true;
        this.cameraState = "init";

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }
    init() {
        const that = this; 
       
        // if (this.cameraState == "init") {
        //     const gsapTL = gsap.timeline();
        //     this.camera.position.set(0, 50, 50);
        //     // this.camera.rotation.set(10 * (Math.PI / 180), 0, 0)
        //     gsapTL.to(
        //         this.camera.position,
        //         {
        //             x: 0,
        //             y: 20,
        //             z: 80,
        //             duration: 2,
                   
        //         }
        //     );
        //     gsapTL.to(
        //         this.camera.position,
        //         {
        //             x: 0,
        //             y: 20,
        //             z: 80,
        //             duration: 1,
        //             onEnd: function () {

        //             }
        //         }
        //     );
        // }
    }
    update() {
    }
}