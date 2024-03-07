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
    constructor(main, physicsWorld, chassis, wheels, wheelsKinematic, controls, camera) {
        this.main = main;
        this.scene = main.scene;
        this.physicsWorld = physicsWorld;//取得物理世界
        this.chassis = chassis; //汽車模型 - 從主線程取得
        /* 車身設定 */
        //請注意，車身需要設定重量，這邊用1200
        this.chassisDynamic = physicsWorld.createRigidBody(chassis, { x: 0, y: 3, z: 4 }, 'dynamic', 1200);
        this.chassisDynamic.rigidBodyDesc
            .setCanSleep(false)
            .setAngularDamping(0.8)
            .setLinearDamping(0.3);
        /* 要設質量 */
        this.wheels = wheels;
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
            // 設定懸掛的靜止長度，即輪子在未受力時離車身的距離。調整這個值可以改變車輛的高度，影響車輛的重心和穩定性
            this.vehicleController.setWheelSuspensionRestLength(i, suspensionRestLength); // 設定第 i 個車輪懸吊彈簧的剩餘長度。
            // 設定輪胎的摩擦滑移值，這個值影響輪胎與地面之間的摩擦力。較高的值增加摩擦力，提高車輛的抓地力，有助於減少轉向時的滑動或翻車風險
            this.vehicleController.setWheelFrictionSlip(i, 1); // 設定輪子摩擦力比較能避免轉向時翻車，設定 1 以下
            // 設定輪胎側向摩擦的硬度。這個參數影響輪胎在側向受力時的反應，直接關係到轉向時的車輛穩定性和抓地性
            this.vehicleController.setWheelSideFrictionStiffness(i, 1); // 輪胎與其上方的對撞機之間的摩擦係數。數值越大，側面摩擦力越強。
            // 設定懸掛的硬度。懸掛硬度越高，車輛對路面不平的響應越小，但過硬的懸掛可能會降低舒適性和輪胎的抓地力
            this.vehicleController.setWheelSuspensionStiffness(i, suspensionStiffness); // 車輪懸吊剛度，影響車子有多彈跳
            // 設定懸掛可以承受的最大力量。這個值確保了在極端條件下，懸掛不會被過度壓縮，從而保持車輛的穩定性和防止車輛底盤碰撞地面
            this.vehicleController.setWheelMaxSuspensionForce(i, 10000); // 設置第 i 個車輪懸架施加的最大力。
            // 設定懸掛的最大行程，即懸掛可以壓縮的最大距離。適當的懸掛行程可以提供良好的路感和足夠的吸震效果，提高車輛的過彎性能和舒適性
            this.vehicleController.setWheelMaxSuspensionTravel(i, maxSuspensionTravel); // 設置第 i 個車輪懸架在其靜止長度之前和之後可以行駛的最大距離。
            // 設定懸掛壓縮時的阻尼比率。這個參數影響懸掛壓縮（如過坎時）的速度，適當的阻尼可以提高車輛的穩定性和舒適性
            this.vehicleController.setWheelSuspensionCompression(i, 1.0); // 第 i 個車輪的懸吊壓縮時的阻尼。
            // 設定懸掛回彈時的阻尼比率。這個參數影響懸掛在壓縮後回到正常狀態的速度，合理的設定有助於保持車輛的平衡和提高輪胎的抓地力
            this.vehicleController.setWheelSuspensionRelaxation(i, 1.0); // 設定第 i 個車輪的懸吊釋放時的阻尼。如果懸吊出現超調，請增加此值
        });
    }




    /* 物理移動計算 */
    update() {
        /* A.讓按件或是手指有輸入時，連動沒使用的那個 */
        this.mergeInputStates();

        // 定義加速力與煞車力
        const accelerateForce = 3000;     //加速力
        const brakeForce = 3000;          //煞車力
        const emergencyBrakeForce = 5000; //急煞車力

        // 依照車輛目前速度調整轉向靈敏度
        // 這是為了讓車子旋轉時不會翻車
        const maxSpeedForTurning = 8; // 定义最大速度，超过此速度转向幅度将减小
        let currentSpeed = this.vehicleController.currentVehicleSpeed();
        let steerAngle = Math.PI / 8; // 默认转向角度
        
        // 如果当前速度超过了定义的最大速度，减小转向角度
        if (currentSpeed > maxSpeedForTurning) {
            // 根据速度调整转向角度，速度越高，转向角度越小
            steerAngle *= (maxSpeedForTurning / currentSpeed); // 示例调整方式，可根据需要进行调整
        }


        // 檢查是否有急剎車輸入，這裡需要您根據實際的輸入系統來設定檢測方式
        // 假設急剎車是一個單獨的輸入而不是普通剎車輸入的高強度版本
        /* B.煞車邏輯處理 */
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




        /* C.加速邏輯 */
        // Number(this.gameState.accelerate) 換成0或1
        // 舊的 const engineForce = Number(this.gameState.accelerate) * accelerateForce;
        const engineForce = Number(this.gameState.accelerate) * accelerateForce - Number(this.gameState.brake) * brakeForce;
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

