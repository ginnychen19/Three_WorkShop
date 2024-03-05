// modelLoader.js
// 使用GLTFLoader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();
    }

    load(url) {
        return new Promise((resolve, reject) => {
            this.loader.load(url, (gltf) => {
                resolve(gltf);
            }, undefined, (error) => {
                reject(error);
    });
        });
    }
}