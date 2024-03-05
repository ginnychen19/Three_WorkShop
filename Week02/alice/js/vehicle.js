import * as RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { VehicleControls } from './vehicleControls';

/* 

  汽車 模型處理 和 物理移動計算 + 按件狀態檢查

  */
export class Vehicle {
    constructor(scene, physicsWorld, chassis, wheel, controls, camera) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.chassis = chassis; //車身模型
        this.chassis.children[0].rotation.y = Math.PI * -0.5; //車身
        this.wheel = wheel;     //輪胎模型
        this.controls = controls; //鍵盤與按鈕控制
        this.camera = camera;

        this.wheels = []; 
        this.wheelsKinematic = [];
        this.addWheels(); //加入車輪模型
        /* 在這裡引用 */
        this.vehicleControls = new VehicleControls(this.scene, this.physicsWorld, this.chassis, this.wheels, this.wheelsKinematic, this.controls, this.camera);
    }
  
    addWheels() {
        this.wheels[0] = this.wheel.clone();
        this.wheels[1] = this.wheel.clone();
        this.wheels[2] = this.wheel.clone();
        this.wheels[3] = this.wheel.clone();

        this.wheels[1].rotation.y = Math.PI;  //給模型轉向
        this.wheels[3].rotation.y = Math.PI;

        /* 這裡的位置相對於車身 */
        this.wheels[0].position.set(1.2, 0.3, -0.85);
        this.wheels[1].position.set(1.2, 0.3, 0.85);
        this.wheels[2].position.set(-1.25, 0.3, -0.85);
        this.wheels[3].position.set(-1.25, 0.3, 0.85);
    }
  
    update() {
        /* 在這裡執行
           01.物理移動計算 ( this.vehicleControls )
           02.按件狀態檢查 ( this.controls.updateKeyboardState )
         */
        this.vehicleControls.update();
        this.controls.updateKeyboardState();
    }
}