// controls.js
import * as THREE from 'three';
import { keyboardState, touchState } from './gameState';

export class VehicleControls {
    constructor(scene, physicsWorld, chassis, wheels, controls, camera, gui) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.chassis = chassis;
        this.chassisDynamic = physicsWorld.createRigidBody(chassis, {x: 0, y: 3, z: 3}, 'dynamic', 1200);
        this.chassisDynamic.rigidBodyDesc
            .setCanSleep(false)
            .setLinearDamping(0.8)
            .setAngularDamping(0.3);
        this.wheels = wheels;
        this.controls = controls;
        this.camera = camera;

        this.chassis.add(this.wheels[0], this.wheels[1], this.wheels[2], this.wheels[3]);
        this.scene.add(this.chassis);

        this.gameState = {};

        this.vehicleInit();

        this.gui = gui;
        this.guiInit();
    }

    guiInit() {
        this.vehicleParams = {
            suspensionRestLength: 0.2,
            suspensionStiffness: 30,
            maxSuspensionTravel: 0.15,
            frictionSlip: 1.5,
            sideFrictionStiffness: 1,
            maxSuspensionForce: 100000,
            suspensionCompression: 1,
            suspensionRelaxation: 1
        };

        this.gui.add(this.vehicleParams, 'suspensionRestLength', 0.1, 0.6).onChange(value => {
            // 設定懸掛的靜止長度，即輪子在未受力時離車身的距離。調整這個值可以改變車輛的高度，影響車輛的重心和穩定性
            this.wheels.forEach((_, i) => {
                this.vehicleController.setWheelSuspensionRestLength(i, value);
            });
        });
        this.gui.add(this.vehicleParams, 'suspensionStiffness', 15, 100).onChange(value => {
            // 設定懸掛的硬度。懸掛硬度越高，車輛對路面不平的響應越小，但過硬的懸掛可能會降低舒適性和輪胎的抓地力
            this.wheels.forEach((_, i) => {
                this.vehicleController.setWheelSuspensionStiffness(i, value);
            });
        });
        this.gui.add(this.vehicleParams, 'maxSuspensionTravel', 0.1, 0.3).onChange(value => {
            // 設定懸掛的最大行程，即懸掛可以壓縮的最大距離。適當的懸掛行程可以提供良好的路感和足夠的吸震效果，提高車輛的過彎性能和舒適性
            this.wheels.forEach((_, i) => {
                this.vehicleController.setWheelMaxSuspensionTravel(i, value);
            });
        });
        this.gui.add(this.vehicleParams, 'frictionSlip', 0.5, 2.0).onChange(value => {
            // 設定輪胎的摩擦滑移值，這個值影響輪胎與地面之間的摩擦力。較高的值增加摩擦力，提高車輛的抓地力，有助於減少轉向時的滑動或翻車風險
            this.wheels.forEach((_, i) => {
                this.vehicleController.setWheelFrictionSlip(i, value);
            });
        });
        this.gui.add(this.vehicleParams, 'sideFrictionStiffness', 0.5, 2.0).onChange(value => {
            // 設定輪胎側向摩擦的硬度。這個參數影響輪胎在側向受力時的反應，直接關係到轉向時的車輛穩定性和抓地性
            this.wheels.forEach((_, i) => {
                this.vehicleController.setWheelSideFrictionStiffness(i, value);
            });
        });
        this.gui.add(this.vehicleParams, 'maxSuspensionForce', 10000, 100000).onChange(value => {
            // 設定懸掛可以承受的最大力量。這個值確保了在極端條件下，懸掛不會被過度壓縮，從而保持車輛的穩定性和防止車輛底盤碰撞地面
            this.wheels.forEach((_, i) => {
                this.vehicleController.setWheelMaxSuspensionForce(i, value);
            });
        });
        this.gui.add(this.vehicleParams, 'suspensionCompression', 0.1, 1.0).onChange(value => {
            // 設定懸掛壓縮時的阻尼比率。這個參數影響懸掛壓縮（如過坎時）的速度，適當的阻尼可以提高車輛的穩定性和舒適性
            this.wheels.forEach((_, i) => {
                this.vehicleController.setWheelSuspensionCompression(i, value);
            });
        });
        this.gui.add(this.vehicleParams, 'suspensionRelaxation', 0.1, 1.0).onChange(value => {
            // 設定懸掛回彈時的阻尼比率。這個參數影響懸掛在壓縮後回到正常狀態的速度，合理的設定有助於保持車輛的平衡和提高輪胎的抓地力
            this.wheels.forEach((_, i) => {
                this.vehicleController.setWheelSuspensionRelaxation(i, value);
            });
        });
    }

    vehicleInit() {
        this.vehicleController = this.physicsWorld.world.createVehicleController(this.chassisDynamic.rigidBody);

        const suspensionRestLength = 0.2;
        const suspensionStiffness = 30; // 懸掛系統
        const maxSuspensionTravel = 0.15;
        
        this.wheels.forEach((wheel, i) => {
            const boundingBox = new THREE.Box3().setFromObject(wheel);
            const radius = (boundingBox.max.y - boundingBox.min.y) * 0.5;
        
            this.vehicleController.addWheel(
                wheel.position,
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(0, 0, 1),
                suspensionRestLength,
                radius
            );
        });

        // 配置悬挂系统
        this.wheels.forEach((_, i) => {
            // 設定懸掛的靜止長度，即輪子在未受力時離車身的距離。調整這個值可以改變車輛的高度，影響車輛的重心和穩定性
            this.vehicleController.setWheelSuspensionRestLength(i, suspensionRestLength);
            // 設定輪胎的摩擦滑移值，這個值影響輪胎與地面之間的摩擦力。較高的值增加摩擦力，提高車輛的抓地力，有助於減少轉向時的滑動或翻車風險
            this.vehicleController.setWheelFrictionSlip(i, 1.5);
            // 設定輪胎側向摩擦的硬度。這個參數影響輪胎在側向受力時的反應，直接關係到轉向時的車輛穩定性和抓地性
            this.vehicleController.setWheelSideFrictionStiffness(i, 1);
            // 設定懸掛的硬度。懸掛硬度越高，車輛對路面不平的響應越小，但過硬的懸掛可能會降低舒適性和輪胎的抓地力
            this.vehicleController.setWheelSuspensionStiffness(i, suspensionStiffness);
            // 設定懸掛可以承受的最大力量。這個值確保了在極端條件下，懸掛不會被過度壓縮，從而保持車輛的穩定性和防止車輛底盤碰撞地面
            this.vehicleController.setWheelMaxSuspensionForce(i, 100000);
            // 設定懸掛的最大行程，即懸掛可以壓縮的最大距離。適當的懸掛行程可以提供良好的路感和足夠的吸震效果，提高車輛的過彎性能和舒適性
            this.vehicleController.setWheelMaxSuspensionTravel(i, maxSuspensionTravel);
            // 設定懸掛壓縮時的阻尼比率。這個參數影響懸掛壓縮（如過坎時）的速度，適當的阻尼可以提高車輛的穩定性和舒適性
            this.vehicleController.setWheelSuspensionCompression(i, 1.0);
            // 設定懸掛回彈時的阻尼比率。這個參數影響懸掛在壓縮後回到正常狀態的速度，合理的設定有助於保持車輛的平衡和提高輪胎的抓地力
            this.vehicleController.setWheelSuspensionRelaxation(i, 1.0);
        });
    }
    
    update() {
        this.mergeInputStates();

        // 定义加速和刹车力
        const accelerateForce = 3000;
        const brakeForce = 3000;
        const emergencyBrakeForce = 5000;
        // 根据车辆当前速度调整转向灵敏度
        const maxSpeedForTurning = 8; // 定义最大速度，超过此速度转向幅度将减小
        let currentSpeed = this.vehicleController.currentVehicleSpeed();
        let steerAngle = Math.PI / 8; // 默认转向角度
        
        // 如果当前速度超过了定义的最大速度，减小转向角度
        if (currentSpeed > maxSpeedForTurning) {
            // 根据速度调整转向角度，速度越高，转向角度越小
            steerAngle *= (maxSpeedForTurning / currentSpeed); // 示例调整方式，可根据需要进行调整
        }

        if (this.gameState.emergencyBrake) {
            // 急煞
            this.vehicleController.setWheelBrake(2, emergencyBrakeForce);
            this.vehicleController.setWheelBrake(3, emergencyBrakeForce);
        } else if (this.gameState.drift) {
            // 甩尾
            // 減少後輪的摩擦力以促進滑動
            this.vehicleController.setWheelFrictionSlip(2, 1.0); // 假設值，需要根據效果進行調整
            this.vehicleController.setWheelFrictionSlip(3, 1.0);
            // 同時對後輪施加煞車力
            this.vehicleController.setWheelBrake(2, brakeForce);
            this.vehicleController.setWheelBrake(3, brakeForce);
        } else {
            // 恢復後輪的摩擦力
            this.vehicleController.setWheelFrictionSlip(2, 1.5);
            this.vehicleController.setWheelFrictionSlip(3, 1.5);
            // 移除煞車力
            this.vehicleController.setWheelBrake(2, 0);
            this.vehicleController.setWheelBrake(3, 0);
        }

        // 转向逻辑保持不变
        const engineForce = Number(this.gameState.accelerate) * accelerateForce - Number(this.gameState.brake) * brakeForce;
        this.vehicleController.setWheelEngineForce(0, engineForce);
        this.vehicleController.setWheelEngineForce(1, engineForce);

        const currentSteering = this.vehicleController.wheelSteering(0) || 0;
        const steerDirection = Number(this.gameState.steerLeft) - Number(this.gameState.steerRight);
        const steering = THREE.MathUtils.lerp(currentSteering, steerAngle * steerDirection, 0.5);

        this.vehicleController.setWheelSteering(0, steering);
        this.vehicleController.setWheelSteering(1, steering);

        this.vehicleController.updateVehicle(this.physicsWorld.world.timestep);

        const translation = this.chassisDynamic.rigidBody.translation();
        const rotation = this.chassisDynamic.rigidBody.rotation();
        this.chassis.position.copy(translation);
        this.chassis.quaternion.copy(rotation);

        this.wheels?.forEach((wheel, i) => {
            const connection = this.vehicleController.wheelChassisConnectionPointCs(i)?.y || 0;
            const suspension = this.vehicleController.wheelSuspensionLength(i) || 0;
            const steering = this.vehicleController.wheelSteering(i) || 0;
            const rotationZ = this.vehicleController.wheelRotation(i) || 0;

            wheel.position.setY(connection - suspension);
            wheel.children[0].rotation.y = steering;
            wheel.children[0].rotation.z = -rotationZ;
        });

        if (this.gameState.reset) {
            this.resetVehicle();
        }

        this.updateCamera();
    }

    mergeInputStates() {
        // 合并键盘和触控输入状态
        for (let action in keyboardState) {
            this.gameState[action] = keyboardState[action] || touchState[action];
        }
    }

    updateCamera() {
        const cameraOffset = new THREE.Vector3(-15, 5, 0);

        const offset = cameraOffset.clone().applyQuaternion(this.chassis.quaternion);
        const targetPosition = this.chassis.position.clone().add(offset);


        this.camera.position.lerp(targetPosition, 0.05);


        const lookAtTarget = new THREE.Vector3().lerpVectors(this.camera.position, this.chassis.position, 0.001);


        this.camera.lookAt(lookAtTarget);
    }

    resetVehicle() {
        // 重置车辆位置和速度的逻辑
        this.chassisDynamic.rigidBody.setTranslation({x: 0, y: 3, z: 2});
        this.chassisDynamic.rigidBody.setRotation({x: 0, y: 0, z: 0, w: 1});
        this.chassisDynamic.rigidBody.setLinvel({x: 0, y: 0, z: 0});
        this.chassisDynamic.rigidBody.setAngvel({x: 0, y: 0, z: 0});
        // 重置状态
        Object.keys(keyboardState).forEach(key => {
            keyboardState[key] = false;
            touchState[key] = false;
        });
    }
}