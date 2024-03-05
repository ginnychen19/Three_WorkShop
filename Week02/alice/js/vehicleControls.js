// controls.js
/* 

  汽車 物理處理 和 移動控制
  A.在constructor先預處理
    01.汽車模型的加入- 包含車身與輪胎
    02.執行車身物理建立- vehicleInit()

  B.vehicleInit()
    01.用 createVehicleController(車身剛體) 製作車子物理
    02.配置悬挂系统

  C.在Update()執行物理移動計算
    01.讓按件或是手指有輸入時，連動沒使用的那個
    02.煞車邏輯處理
    03.加速邏輯
    04.加速邏輯
    05.更新位置與旋轉量到實體模型上
    06.重新定位
    07.相機跟隨

  */
import * as THREE from 'three';
import { keyboardState, touchState } from './gameState';

/* 我原本的結構幾乎把東西初始化在constructor，但這有時會讓我比較難取得其他物件! */
export class VehicleControls {
    constructor(scene, physicsWorld, chassis, wheels, wheelsKinematic, controls, camera) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;//取得物理世界
        this.chassis = chassis; //汽車模型 - 從主線程取得
        /* 車身設定 */
        this.chassisDynamic = physicsWorld.createRigidBody(chassis, { x: 0, y: 3, z: 4 }, 'dynamic', 'carBody');
        this.chassisDynamic.rigidBodyDesc
            .setCanSleep(false)
            .setAngularDamping(0.1)
            .setLinearDamping(0.1);
        /* 要設質量 */
        this.wheels = wheels;
        this.wheelsKinematic = []; //沒用到
        this.controls = controls;
        this.camera = camera;

        /* 把實體模型加入到車身模型和世界 */
        this.chassis.add(this.wheels[0], this.wheels[1], this.wheels[2], this.wheels[3]);
        this.scene.add(this.chassis);

        this.gameState = {};
        this.vehicleInit(); //執行車身物理建立
    }

    vehicleInit() {
        /* 01.建立汽車控制套件 */
        this.vehicleController = this.physicsWorld.world.createVehicleController(this.chassisDynamic.rigidBody);

        const suspensionRestLength = 0.2;  // 懸掛靜止長度
        const suspensionStiffness = 40;    // 懸掛系統 - 懸吊剛度
        const maxSuspensionTravel = 0.125; // 設置第 i 個車輪懸架在其靜止長度之前和之後可以行駛的最大距離

        /* 02.給每個輪子 */
        this.wheels.forEach((wheel, i) => {
            const boundingBox = new THREE.Box3().setFromObject(wheel); //取得AABB模型邊框
            const radius = (boundingBox.max.y - boundingBox.min.y) * 0.5;

            // addWheel - https://rapier.rs/javascript3d/classes/DynamicRayCastVehicleController.html#addWheel
            this.vehicleController.addWheel(
                wheel.position,              //車輪相對於底盤的位置
                new THREE.Vector3(0, -1, 0), //車輪懸吊相對於底盤的方向。光線投射將沿著這個方向發生以偵測地面
                new THREE.Vector3(0, 0, 1),  //車輪的車軸軸線，相對於底盤
                suspensionRestLength,        //車輪懸吊彈簧的剩餘長度
                radius                       //車輪的半徑
            );
        });

        /* 03.配置悬挂系统 */
        this.wheels.forEach((_, i) => {
            this.vehicleController.setWheelSuspensionRestLength(i, suspensionRestLength); // 設定第 i 個車輪懸吊彈簧的剩餘長度。
            this.vehicleController.setWheelFrictionSlip(i, 1); // 設定輪子摩擦力比較能避免轉向時翻車，設定 1 以下
            this.vehicleController.setWheelSideFrictionStiffness(i, 1); // 輪胎與其上方的對撞機之間的摩擦係數。數值越大，側面摩擦力越強。
            this.vehicleController.setWheelSuspensionStiffness(i, suspensionStiffness); // 車輪懸吊剛度，影響車子有多彈跳
            this.vehicleController.setWheelMaxSuspensionForce(i, 10000); // 設置第 i 個車輪懸架施加的最大力。
            this.vehicleController.setWheelMaxSuspensionTravel(i, maxSuspensionTravel); // 設置第 i 個車輪懸架在其靜止長度之前和之後可以行駛的最大距離。
            this.vehicleController.setWheelSuspensionCompression(i, 1.0); // 第 i 個車輪的懸吊壓縮時的阻尼。
            this.vehicleController.setWheelSuspensionRelaxation(i, 1.0); // 設定第 i 個車輪的懸吊釋放時的阻尼。如果懸吊出現超調，請增加此值
        });
    }

    /* 物理移動計算 */
    update() {
        /* A.讓按件或是手指有輸入時，連動沒使用的那個 */
        this.mergeInputStates();

        // 定義加速力與煞車力
        const accelerateForce = 15;     //加速力
        const brakeForce = 12;          //煞車力
        const emergencyBrakeForce = 30; //急煞車力

        // 依照車輛目前速度調整轉向靈敏度
        // 檢查是否有急剎車輸入，這裡需要您根據實際的輸入系統來設定檢測方式
        // 假設急剎車是一個單獨的輸入而不是普通剎車輸入的高強度版本
        // 前輪動 + 前輪轉

        /* B.煞車邏輯處理 */
        const isEmergencyBraking = this.gameState.emergencyBrake;
        // 計算煞車力，如果是急煞車則使用急煞車力
        const totalBrakeForce = isEmergencyBraking ? emergencyBrakeForce : brakeForce;
        // 如果有煞車輸入，則應用煞車力到所有輪子
        if (this.gameState.brake || isEmergencyBraking) {
            for (let i = 0; i < this.wheels.length; i++) {
                this.vehicleController.setWheelBrakeForce(i, totalBrakeForce);
            }
        } else {
            // 沒有煞車輸入時，確保煞車力為0
            for (let i = 0; i < this.wheels.length; i++) {
                this.vehicleController.setWheelBrakeForce(i, 0);
            }
        }
        /* C.加速邏輯 */
        // Number(this.gameState.accelerate) 換成0或1
        const engineForce = Number(this.gameState.accelerate) * accelerateForce;
        this.vehicleController.setWheelEngineForce(0, engineForce); //兩個前輪往前
        this.vehicleController.setWheelEngineForce(1, engineForce);

        /* D.加速邏輯 */
        //获取车辆当前的转向角度。这里尝试获取第一个轮子（通常是前轮）的转向角度，如果没有获取到，则默认为0
        const currentSteering = this.vehicleController.wheelSteering(0) || 0;
        //如果玩家向左转= 1；向右转 = -1；两者都不按或都按下 = 0
        const steerDirection = Number(this.gameState.steerLeft) - Number(this.gameState.steerRight);
        //
        const steering = THREE.MathUtils.lerp(currentSteering, steerAngle * steerDirection, 0.5);

        this.vehicleController.setWheelSteering(0, steering);
        this.vehicleController.setWheelSteering(1, steering);

        /* E.更新位置與旋轉量到實體模型上 */
        //使用物理世界的时间步长更新车辆的物理状态。这是在物理引擎中进行一次模拟迭代，确保车辆的物理表现与游戏世界保持同步
        this.vehicleController.updateVehicle(this.physicsWorld.world.timestep);

        //更新車身位置與旋轉量
        const translation = this.chassisDynamic.rigidBody.translation();
        this.chassis.position.copy(translation);
        const rotation = this.chassisDynamic.rigidBody.rotation();
        this.chassis.quaternion.copy(rotation);
        //更新車輪位置與旋轉量
        this.wheels?.forEach((wheel, i) => {
            /* 車輪高度的連接點 */
            const connection = this.vehicleController.wheelChassisConnectionPointCs(i)?.y || 0;
            /* 懸掛-当前的压缩长度 (做車輪彈跳效果...) */
            const suspension = this.vehicleController.wheelSuspensionLength(i) || 0;
            /* 当前的转向角度 - 左右轉 */
            const steering = this.vehicleController.wheelSteering(i) || 0;
            /* 轮子自身的旋转 - 前後轉 */
            const rotationZ = this.vehicleController.wheelRotation(i) || 0;

            wheel.position.setY(connection - suspension);
            wheel.children[0].rotation.y = steering;
            wheel.children[0].rotation.z = -rotationZ;
        });

        /* 看是否有按下重新定位 */
        if (this.gameState.reset) {
            this.resetVehicle();
        }

        /* 更新相機跟隨 */
        this.updateCamera();
    }

    mergeInputStates() {
        // 合併鍵盤和觸控輸入狀態
        // 讓案鍵在操控或手指在操控的狀態可以被一起更新
        for (let action in keyboardState) {
            this.gameState[action] = keyboardState[action] || touchState[action];
        }
    }

    updateCamera() { //在update()中使用
        /* 特地這樣寫是因為不想把相機直接丟進車身模型裡，這樣就可以做一樣的計算但是相機是加入到Sence裡 */
        /* 相機距離車體的相對距離 */
        const cameraOffset = new THREE.Vector3(-15, 5, 0);
        /*  這邊有很多數值計算相關語法 - https://www.cnblogs.com/vadim-web/p/13359036.html  */
        /*  offset = 將車體的Quaternion變成向量後，計算到cameraOffset裡 */
        const offset = cameraOffset.clone().applyQuaternion(this.chassis.quaternion);
        /*  targetPosition = 車身位置加上 + offset的位置 */
        const targetPosition = this.chassis.position.clone().add(offset);
        /*  執行這段時，相機位置會越來越靠近targetPosition的位置，這個相比於每秒直接更新到目標位置，更能降低抖動的可能性 */
        this.camera.position.lerp(targetPosition, 0.05); //這是為了平滑相機的移動
        /*  lookAtTarget非常接近相机当前位置 (避免视角快速跳变引起的不适感) */
        const lookAtTarget = new THREE.Vector3().lerpVectors(this.camera.position, this.chassis.position, 0.001);
        /* 讓相機始終會看向目標車體 */
        this.camera.lookAt(lookAtTarget);
    }

    /* 當車子翻車時 */
    resetVehicle() {
        this.chassisDynamic.rigidBody.setTranslation({ x: 0, y: 3, z: 2 });
        this.chassisDynamic.rigidBody.setRotation({ x: 0, y: 0, z: 0, w: 1 }); /// 四元数-旋轉量為0
        this.chassisDynamic.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }); //重設加速度
        this.chassisDynamic.rigidBody.setAngvel({ x: 0, y: 0, z: 0 }); //重設角速度
        // 重置状态
        Object.keys(keyboardState).forEach(key => {
            keyboardState[key] = false;
            touchState[key] = false;
        });
    }

}

