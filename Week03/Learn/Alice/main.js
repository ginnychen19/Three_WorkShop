// main.js
import * as THREE from 'three';
import * as dat from 'dat.gui';
import { initializeScene, onWindowResize } from './sceneSetup';
import { PhysicsWorld } from './physicsWorld';
import { ModelLoader } from './modelLoader';
import { FoodManager } from './foodManager';
import { Vehicle } from './vehicle';
import { Controls } from './controls';

async function main() {
    const { scene, camera, renderer } = initializeScene();
    onWindowResize(camera, renderer);

    const gui = new dat.GUI();

    const physicsWorld = new PhysicsWorld(scene, gui);
    await physicsWorld.init();

    let foodManager;
    let vehicle;
    let colliderModel;
    let sceneModel;

    async function loadModels() {
        const modelLoader = new ModelLoader(scene);
        try {
            const models = await modelLoader.loadModels();
            const { collider, map, chassis, wheel, lobster, foodBeg, bobaTea, carrotCake } = models;

            scene.add(map.scene);
            sceneModel = map.scene;

            foodManager = new FoodManager(scene, physicsWorld, { lobster, foodBeg, bobaTea, carrotCake });

            const createScene = physicsWorld.createScene(collider.scene);
            colliderModel = createScene;

            // sceneModel.traverse(function(object) {
            //     if (object.isMesh) {
            //         object.material.transparent = true;
            //         object.material.onBeforeCompile = shader => {
            //             shader.fragmentShader =
            //                 shader.fragmentShader.replace(
            //                     '#include <color_fragment>',
            //                                             `
            //                     #include <color_fragment>
            //                     float far = 5.0;
            //                     float near = -0.5;
            //                     float z = gl_FragCoord.z*gl_FragCoord.w;
            //                     if( z < far ) 
            //                     {
            //                         float size = 30.0;
            //                         float scale = 0.8*size*(1.0-smoothstep( far, near, z ));
            //                         vec4 xy = size*round(gl_FragCoord/size);
            //                         if( distance(xy,gl_FragCoord) < scale ) discard;
            //                     }
            //                     else discard;
            //                     `
            //                 );
            //         }
            //     }
            // });

            const controls = new Controls();

            vehicle = new Vehicle(scene, physicsWorld, chassis.scene, wheel.scene, controls, camera, gui);

        } catch (error) {
            console.error('加載模型出錯：', error);
        }
    }

    loadModels();

    // 物理世界更新循環
    const clock = new THREE.Clock();

    function update() {
        const deltaTime = clock.getDelta();

        if (vehicle) {
            vehicle.update();
            dir = new THREE.Vector3().subVectors(camera.position, vehicle.chassis.position).normalize();
        }

        physicsWorld.update();

        const frustum = new THREE.Frustum();
        const projectionMatrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(projectionMatrix);

        if (colliderModel) {
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

        renderer.render(scene, camera);
        renderer.setAnimationLoop(update);
    }

    // 開始更新循環
    update();

}

main();

