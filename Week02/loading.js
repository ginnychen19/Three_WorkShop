import * as THREE from 'three';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export class Loadings {
    constructor(main) {
        this.main = main;
        this.scene = main.scene;

        this.loader = new OBJLoader();
        this.OBJloader = new OBJLoader();
        this.FBXLoader = new FBXLoader();
        this.GLTFloader = new GLTFLoader();

        this.textureLoader = new THREE.TextureLoader();
        this.mixer
    }
    /*
       t_物件名稱 => 表示貼圖類資源
       m_物件名稱 => 表示模型類資源
       p_物件名稱 => 表示粒子貼圖類資源
    */

    async init(fun_createSence,fun_createvehicle) {
        try {
            const [
                m_city,
                m_carbody,
                m_carWheel
            ] = await Promise.all([
                this.loadingGLTF3DModel('./assest/models/city.glb', 'city'),//實際場景
                this.loadingGLTF3DModel('./assest/models/carbody.glb', 'carbody'),//碰撞場警
                this.loadingGLTF3DModel('./assest/models/carwheel.glb', 'carWheel'),//實際場景
            ]);

            // 所有資源載入完成後執行後續操作
            fun_createSence(m_city);
            fun_createvehicle(m_carbody,m_carWheel);
            // const createScene = physicsWorld.createScene(collider.scene);
            // colliderModel = createScene;
        } catch (error) {
            console.error("Error loading resources:", error);
        }
    }

    async loadingTexture(src) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(src, resolve, undefined, reject);
        });
    }
    async loading3DModel(src, theName) {
        return new Promise((resolve, reject) => {
            this.loader.load(src, (object) => {
                object.name = theName;
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                resolve(object);
            }, undefined, reject);
        });
    }
    /* 和OBJ還有Fbx不同，gltf或glb需要找到 .scene 才是模型 */
    async loadingGLTF3DModel(src, theName) {
        return new Promise((resolve, reject) => {
            this.GLTFloader.setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/'))
                .load(src, (gltf) => {
                    gltf.name = theName;
                    gltf.scene.name = theName;
                    gltf.scene.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    resolve(gltf.scene);
                }, undefined, reject);
        });
    }

}

// async loadTextures() {
//     //粒子特效
//     // this.t_p_dot = await this.loadingTexture('../assest/img/particle/dot.png');
//     // this.t_checkerboard = await this.loadingTexture('../assest/textures/checkerboard.jpg');
// }
// async load3DModels() {
//     this.m_carbody = await this.loadingGLTF3DModel('./assest/models/carbody.glb', 'carbody');
//     this.m_carWheel = await this.loadingGLTF3DModel('./assest/models/carwheel.glb', 'carWheel');
// }
// handleLoadingComplete() {
//     // 在這裡執行所有資源載入完成後的後續操作
//     this.main.createObj(); // 呼叫主程式中 生成物的初始化方法
// }