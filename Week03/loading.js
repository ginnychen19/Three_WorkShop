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

        // 創建一個 DRACOLoader 實例
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
        this.dracoLoader.setDecoderConfig({ type: 'js' });
        this.GLTFloader.setDRACOLoader(this.dracoLoader);

        this.worker = new Worker(new URL('./modelLoaderWorker.js', import.meta.url));

        this.textureLoader = new THREE.TextureLoader();
        this.mixer
    }
    /*
       t_物件名稱 => 表示貼圖類資源
       m_物件名稱 => 表示模型類資源
       p_物件名稱 => 表示粒子貼圖類資源
    */

    async init(fun_createSence, fun_createvehicle) {
        try {
            const m_city = await Promise.all([
                this.loadingGLTF3DModel('./assest/models/city.glb', 'city')
            ]);
            const m_carbody = await Promise.all([
                this.loadingGLTF3DModel('./assest/models/carbody.glb', 'carbody')
            ]);
            const m_carWheel = await Promise.all([
                this.loadingGLTF3DModel('./assest/models/carwheel.glb', 'carWheel')
            ]);


            // 所有資源載入完成後執行後續操作
            fun_createSence(...m_city);
            fun_createvehicle(...m_carbody, ...m_carWheel);
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

                    }
                });
                resolve(object);
            }, undefined, reject);
        });
    }
    /* 和OBJ還有Fbx不同，gltf或glb需要找到 .scene 才是模型 */

    async loadingGLTF3DModel(src, theName) {
        return new Promise((resolve, reject) => {
            // 傳資訊給worker
            this.worker.postMessage({ action: 'load', url: src });

            // worker返回模型資訊，解析的工作回到主線程
            this.worker.onmessage = (event) => {
                if (event.data.action === 'loaded') {
                    const arrayBuffer = event.data.model;

                    // 用GLTFloader的.parse方法
                    this.GLTFloader.parse(arrayBuffer, '', (gltf) => {
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
                }
            };
        });
    }

}


// async loadingGLTF3DModel(src, theName) {
//     return new Promise((resolve, reject) => {
//         this.GLTFloader.setDRACOLoader(new DRACOLoader().setDecoderPath('three/examples/jsm/libs/draco/gltf/'))
//             .load(src, (gltf) => {
//                 gltf.name = theName;
//                 gltf.scene.name = theName;
//                 gltf.scene.traverse(function (child) {
//                     if (child instanceof THREE.Mesh) {
//                         child.castShadow = true;
//                         child.receiveShadow = true;
//                     }
//                 });
//                 resolve(gltf.scene);
//             }, undefined, reject);
//     });
// }
