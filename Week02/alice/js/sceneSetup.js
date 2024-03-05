// 預設Three.js 起手式 

/*
    initializeScene(){
        創建場景
        創建渲染器
        創建相機
        創建光
    }
    onWindowResize(){
        調整窗口大小時的事件處理
    }
*/

import * as THREE from 'three';

export function initializeScene() {
    // 創建場景
    const scene = new THREE.Scene();

    // 創建渲染器
    // 處理 z-fight(深度衝突) => logarithmicDepthBuffer
    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor(0xd1fcff);

    // 創建相機
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
    );
    camera.position.set(0, 5, -10);
    camera.lookAt(0, 0, 0);

    // 創建方向光
    const directionalLight = new THREE.DirectionalLight('#FFFFED', 0.8);
    directionalLight.position.set(100, 200, 100); // 根据需要调整
    directionalLight.castShadow = true;
    directionalLight.shadow.bias = -0.005;
    directionalLight.shadow.mapSize.width = 2048; // 增加阴影贴图分辨率
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 1000; // 根据地图大小调整
    directionalLight.shadow.camera.left = -1000; // 根据地图大小调整
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.top = 1000;
    directionalLight.shadow.camera.bottom = -1000;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.5);
    scene.add(hemisphereLight);

    // 創建環境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    return { scene, camera, renderer };
}

// 調整窗口大小時的事件處理
export function onWindowResize(camera, renderer) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}