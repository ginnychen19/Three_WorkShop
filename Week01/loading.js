import * as THREE from 'three';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


export class Loadings {
    constructor(main) {
        this.main = main;
        this.scene = main.scene;

        this.loader = new OBJLoader();
        // this.OBJloader = new OBJLoader();
        this.GLTFloader = new GLTFLoader();

        this.textureLoader = new THREE.TextureLoader();

        this.mixer

        this.loadingCount = 0;
        this.loadingMax = 2;
    }
    /*
       t_物件名稱 => 表示貼圖類資源
       m_物件名稱 => 表示模型類資源
       p_物件名稱 => 表示粒子貼圖類資源
    */

    async init() {
        try {
            await Promise.all([
                this.loadTextures(),
                this.load3DModels(),
            ]);

            // 所有資源載入完成後執行後續操作
            this.handleLoadingComplete();
        } catch (error) {
            console.error("Error loading resources:", error);
        }
    }
    async loadTextures() {
        //粒子特效
        // this.t_p_dot = await this.loadingTexture('../assest/img/particle/dot.png');
        // this.t_checkerboard = await this.loadingTexture('../assest/textures/checkerboard.jpg');
    }

    async load3DModels() {
        this.m_carbody = await this.loading3DModel('./assest/models/carbody.obj', 'carbody');
        this.m_carWheel = await this.loading3DModel('./assest/models/carwheel.obj', 'carWheel');
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
    async loadingGLTF3DModel(src, theName) {
        return new Promise((resolve, reject) => {
            this.GLTFloader.load(src, (object) => {
                object.name = theName;
                object.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        // child.castShadow = true;
                        // child.receiveShadow = true;
                    }
                });
                resolve(object);
            }, undefined, reject);
        });
    }

    handleLoadingSuccess() {
        this.loadingCount++;
        this.checkLoadingComplete();
    }

    handleLoadingError() {
        // 在需要處理載入失敗的情況下執行相應的邏輯
    }

    checkLoadingComplete() {
        if (this.loadingCount === this.loadingMax) {
            // 所有資源都已經成功載入，執行後續操作
            this.handleLoadingComplete();
        }
    }

    handleLoadingComplete() {
        // 在這裡執行所有資源載入完成後的後續操作
        this.main.createObj(); // 呼叫主程式中 生成物的初始化方法
    }
}
