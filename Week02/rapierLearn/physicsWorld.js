// physicsWorld.js
import * as RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export class PhysicsWorld {
    constructor(scene) {
        this.scene = scene;
        this.world = null;
        this.debugLines = [];
    }

    async init() {
        await RAPIER.init();
        this.world = new RAPIER.World({x: 0.0, y: -9.81, z: 0.0});
    }

    renderDebugShapes(scene, physicsWorld) {
        // 移除並清理之前的調試線條
        this.debugLines.forEach(obj => {
            scene.remove(obj);
            obj.geometry.dispose();
            obj.material.dispose();
        });
        this.debugLines = [];
    
        // 從物理世界獲取調試渲染的頂點和顏色數據
        const { vertices, colors } = physicsWorld.debugRender();
        // 創建線條的幾何體和材質
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ vertexColors: true });
        
        // Three.js期望的是一個包含連續頂點坐標的數組
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        // 將Rapier的顏色數組轉換為Three.js可以接受的格式
        const colorAttribute = new THREE.Float32BufferAttribute(colors.length * 3, 3);
        for (let i = 0; i < colors.length; i += 4) {
            // Three.js中的顏色不包括alpha值，所以我們只復制RGB值
            colorAttribute.setXYZ(i / 4, colors[i], colors[i + 1], colors[i + 2]);
        }
        geometry.setAttribute('color', colorAttribute);
        
        // 創建線條並添加到場景中
        const lines = new THREE.LineSegments(geometry, material);
        scene.add(lines);
        this.debugLines.push(lines); // 存儲引用以便後續清理
    }

    step() {
        this.world.step();
    }


    update() {
        this.step();
        this.renderDebugShapes(this.scene, this.world);
    }
}