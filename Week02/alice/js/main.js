// main.js
/*
  把整個 main()包成 async/await
  01.建立基礎世界 + Resize
  02.建立物理世界，包含產生凸包碰狀與debugger
  03.load模型
  04.處理需要更新的內容

*/
import * as THREE from 'three';
import { initializeScene, onWindowResize } from './sceneSetup';
import { PhysicsWorld } from './physicsWorld';
import { ModelLoader } from './modelLoader';
import { FoodManager } from './foodManager';
import { Vehicle } from './vehicle';
import { Controls } from './controls';

async function main() {
    /* 01.建立基礎世界 + Resize */
    const { scene, camera, renderer, orbitControls } = initializeScene();
    onWindowResize(camera, renderer);
    /* 02.建立物理世界，包含產生凸包碰狀與debugger */
    const physicsWorld = new PhysicsWorld(scene);
    await physicsWorld.init();

    let foodManager;
    let vehicle;
    let colliderModel;
    let sceneModel;

    /* 03.load模型 */
    async function loadModels() {
        const modelLoader = new ModelLoader(scene);
        try {
            const [collider, sceneM, chassis, wheel, lobster, foodBeg, bobaTea, carrotCake] = await Promise.all([
                modelLoader.load('./assets/city8.glb'),//碰撞場警
                modelLoader.load('./assets/city8.glb'),//實際場景
                modelLoader.load('./assets/truck1.glb'),
                modelLoader.load('./assets/wheelTruck1.glb'),
                modelLoader.load('./assets/lobster.glb'),
                modelLoader.load('./assets/foodBeg.glb'),
                modelLoader.load('./assets/bobaTea.glb'),
                modelLoader.load('./assets/carrotCake.glb'),
            ]);

            [chassis.scene, wheel.scene, lobster.scene, foodBeg.scene, bobaTea.scene, carrotCake.scene].forEach(model => {
                model.traverse(object => {
                    if (object.isMesh && object.name !== 'wall') {
                        object.castShadow = true; // 啟用投射陰影
                        object.receiveShadow = true; // 啟用接收陰影
                    }
                });
            });

            /* 加入場景 */
            //01.加入實體場景
            sceneModel = sceneM.scene;//把場景的模型加入到世界
            scene.add(sceneModel);
            sceneModel.traverse(object => {
                if (object.isMesh && object.name === 'wall') {
                    object.material.transparent = true;
                    object.material.opacity = 0;
                }
            });
            //02.加入食物測試
            foodManager = new FoodManager(scene, physicsWorld, { lobster, foodBeg, bobaTea, carrotCake });

            //03.加入碰撞場景
            const createScene = physicsWorld.createScene(collider.scene);
            colliderModel = createScene;

            //04.加入鍵盤監聽 
            const controls = new Controls();
            //05.加入汽車 Vehicle 這個檔 (Vehicle將在這裏面引用)
            vehicle = new Vehicle(scene, physicsWorld, chassis.scene, wheel.scene, controls, camera);

        } catch (error) {
            console.error('加載模型出錯：', error);
        }
    }
    loadModels();

    /* 04.處理需要更新的內容 */
    const clock = new THREE.Clock();// 物理世界更新循環
    function update() {
        /* 04-1 取得當前偵數 */
        const deltaTime = clock.getDelta();

        /* 04-2 更新物理世界 */
        if (vehicle) vehicle.update(); //如果車子存在了，update()
        physicsWorld.update(); //凸包位置，debugger位置

        /* 04-3 製作視錐體剃除 */
        const frustum = new THREE.Frustum();
        const projectionMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(projectionMatrix);
        if (colliderModel) {/* 物理模型的渲染剃除 */
            colliderModel.traverse(function (object) {
                if (object.isMesh) {
                    // 檢查對象是否在視錐體內
                    if (frustum.intersectsObject(object)) {
                        object.userData.rigidBody.setEnabled(true);

                    } else {
                        object.userData.rigidBody.setEnabled(false);
                    }
                }
            });
        }
        if (sceneModel) {
            sceneModel.traverse(function (object) {
                if (object.isMesh) {
                    // 檢查對象是否在視錐體內
                    if (frustum.intersectsObject(object)) {
                        object.visible = true; // 對象在視野內，應該渲染
                        object.castShadow = true; // 啟用投射陰影
                        object.receiveShadow = true; // 啟用接收陰影
                    } else {
                        object.visible = false; // 對象不在視野內，不進行渲染
                        object.castShadow = false; // 啟用投射陰影
                        object.receiveShadow = false; // 啟用接收陰影
                    }
                }
            });
        }
        /* 04-4 渲染畫面 */
        renderer.render(scene, camera);
        renderer.setAnimationLoop(update);
        /* 
           renderer 內建函數
           setAnimationLoop 可以用來代替 requestAnimationFrame 的 內建函數。
           對於 WebXR 項目，必須使用此函數。 
        */

    }

    update();

}

main();

