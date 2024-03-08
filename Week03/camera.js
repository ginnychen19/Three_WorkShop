import * as THREE from 'three';
import gsap from "gsap";

export class Camera {
    constructor(main) {
        this.main = main;
        this.scene = main.scene;
        this.renderer = main.renderer;

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
        this.camera.position.set(0, 25, 50);
        this.camera.lookAt(0, 0, 0);
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