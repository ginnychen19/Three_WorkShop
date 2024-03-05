export class InputHandler {
    constructor(main) {
        /* 我的key直接更新到main裡 */
        this.main = main;
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    handleKeyDown(e) {
        e.preventDefault();
        let theKey = e.key.toLowerCase();
        if (
            theKey === 's' ||
            theKey === 'arrowdown' ||
            theKey === 'w' ||
            theKey === 'arrowup' ||
            theKey === 'a' ||
            theKey === 'arrowleft' ||
            theKey === 'd' ||
            theKey === 'arrowright' ||
            theKey === " " ||
            theKey === "b"
        ) {
            if (!this.main.keys.includes(theKey)) {
                this.main.keys.push(theKey);
            }
        }
        if (theKey.toLowerCase() === 'q') {
            this.main.keys.push(theKey);
        }
    }

    handleKeyUp(e) {
        e.preventDefault();
        let theKey = e.key.toLowerCase();
        if (
            theKey === 's' ||
            theKey === 'arrowdown' ||
            theKey === 'w' ||
            theKey === 'arrowup' ||
            theKey === 'a' ||
            theKey === 'arrowleft' ||
            theKey === 'd' ||
            theKey === 'arrowright' ||
            theKey === " " ||
            theKey === "b" ||
            theKey === "q"
        ) {
            const index = this.main.keys.indexOf(theKey);
            if (index !== -1) {//-1等於找不到
                this.main.keys.splice(index, 1);
            }
        }
    }
}
