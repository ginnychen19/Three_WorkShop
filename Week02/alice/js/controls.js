import { keyboardState, touchState } from './gameState';
import { A, D, S, W, R, SPACE } from './utils';

export class Controls {
    constructor() {
        this.keysPressed = {};       //紀錄案件
        this.accelerate = false;     //加速
        this.brake = false;          //煞車
        this.steerLeft = false;      //向左轉向
        this.steerRight = false;     //往右轉向
        this.emergencyBrake = false; //緊急煞車
        this.reset = false;          //回到原點

        this.touchStart = { x: 0, y: 0 }; //joystick可使用 (手機端移動)
        this.touching = false;
        this.touchThreshold = 30;    //觸摸門檻

        document.addEventListener('keydown', (event) => this.updateKey(event, true), false);
        document.addEventListener('keyup', (event) => this.updateKey(event, false), false);

        document.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
    }

    updateKey(event, isPressed) {
        /* 更新 keysPressed，先取得現在是按哪個鍵，然後那個鍵設定成isPressed的狀態 */
        /* keyup時，isPressed狀態就會被取消 */
        const key = event.key.toLowerCase();
        this.keysPressed[key] = isPressed;
    }
    isPressed(keyArray) {
        /* 接受一个按键数组，检查是否有任何一个按键在 keysPressed 中被标记为按下 */
        /* .some方法 https://noob.tw/js-every-some/
           是用來檢查陣列裡面是否有一些符合條件。
           只要有一個以上符合條件就會回傳 true，全部都不是的話會回傳 false。
        */
        return keyArray.some(key => this.keysPressed[key]);
    }

    updateKeyboardState() {
        /* 從這裡去更新 我們現在要執行那些動作 */
        keyboardState.accelerate = this.isPressed(W);          //加速
        keyboardState.brake = this.isPressed(S);               //煞車 or 往後?
        keyboardState.steerLeft = this.isPressed(A);           //向左轉
        keyboardState.steerRight = this.isPressed(D);          //向後轉
        keyboardState.emergencyBrake = this.isPressed(SPACE);  //緊急煞車
        keyboardState.reset = this.isPressed(R);               //歸0
    }

    onTouchStart(event) {
        const touch = event.touches[0];
        this.touchStart.x = touch.clientX;
        this.touchStart.y = touch.clientY;
        this.touching = true;
    }

    onTouchMove(event) {
        if (!this.touching) return;

        const touch = event.touches[0];
        const dx = touch.clientX - this.touchStart.x;
        const dy = touch.clientY - this.touchStart.y;

        touchState.accelerate = Math.abs(dy) > this.touchThreshold && dy < 0;
        touchState.brake = Math.abs(dy) > this.touchThreshold && dy > 0;
        touchState.steerLeft = Math.abs(dx) > this.touchThreshold && dx < 0;
        touchState.steerRight = Math.abs(dx) > this.touchThreshold && dx > 0;
    }

    onTouchEnd(event) {
        this.touching = false;
        // 停止所有操作
        touchState.accelerate = false;
        touchState.brake = false;
        touchState.steerLeft = false;
        touchState.steerRight = false;
    }
}