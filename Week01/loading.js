import * as THREE from 'three';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
export class Loadings {
    constructor(main) {
        this.main = main;
        this.scene = main.scene;

        this.OBJloader = new OBJLoader();
        this.FBXloader = new FBXLoader();

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
        this.m_iceCream = await this.loading3DModel('../assest/models/ice-cream.obj', 'ice_cream');
        
    }

    async loadingTexture(src) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(src, resolve, undefined, reject);
        });
    }
    async loading3DModel(src, theName) {
        const that = this;
        return new Promise((resolve, reject) => {
            const extension = src.split('.').pop().toLowerCase();// 判断文件扩展名
            let loader;
            if (extension === 'obj') {
                loader = this.OBJloader;
            } else if (extension === 'fbx') {
                loader = this.FBXloader;
            } else {
                reject(new Error('沒有此格式'));
                return;
            }

            loader.load(src, (object) => {
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

