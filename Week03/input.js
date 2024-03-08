export const keyboardState = { 
    accelerate: false,    //加速
    brake: false,         //煞車
    steerLeft: false,     //向左轉向
    steerRight: false,    //往右轉向
    emergencyBrake: false //緊急煞車
};
export const touchState = {
    accelerate: false,
    brake: false,
    steerLeft: false,
    steerRight: false,
    emergencyBrake: false
};

// 按鍵設定
const W = ['w', 'arrowup'];
const A = ['a', 'arrowleft']; 
const S = ['s', 'arrowdown'];
const D = ['d', 'arrowright'];
const R = ['r'];
const SPACE = [' '];
export { W, A, S, D, R, SPACE };

export class InputHandler {
    constructor() {
        this.keyboardState = keyboardState;
        this.touchState = touchState;

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
        const key = event.key.toLowerCase();
        this.keysPressed[key] = isPressed;
    }
    isPressed(keyArray) {
        return keyArray.some(key => this.keysPressed[key]);
    }

    updateKeyboardState() {/* 從這裡去更新 我們現在要執行那些動作 */
        this.keyboardState.accelerate = this.isPressed(W);          //加速
        this.keyboardState.brake = this.isPressed(S);               //煞車 or 往後?
        this.keyboardState.steerLeft = this.isPressed(A);           //向左轉
        this.keyboardState.steerRight = this.isPressed(D);          //向後轉
        this.keyboardState.emergencyBrake = this.isPressed(SPACE);  //緊急煞車
        this.keyboardState.reset = this.isPressed(R);               //歸0
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

        this.touchState.accelerate = Math.abs(dy) > this.touchThreshold && dy < 0;
        this.touchState.brake = Math.abs(dy) > this.touchThreshold && dy > 0;
        this.touchState.steerLeft = Math.abs(dx) > this.touchThreshold && dx < 0;
        this.touchState.steerRight = Math.abs(dx) > this.touchThreshold && dx > 0;
    }

    onTouchEnd(event) {
        this.touching = false;
        // 停止所有操作
        this.touchState.accelerate = false;
        this.touchState.brake = false;
        this.touchState.steerLeft = false;
        this.touchState.steerRight = false;
    }
}
