// modelLoader.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class ModelLoader {
    constructor(scene) {
        this.scene = scene;
        this.loader = new GLTFLoader();

        // 創建一個 DRACOLoader 實例
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
        dracoLoader.setDecoderConfig({ type: 'js' });
        this.loader.setDRACOLoader(dracoLoader);

        this.worker = new Worker(new URL('./modelLoaderWorker.js', import.meta.url));
    }

    load(url) {
        return new Promise((resolve, reject) => {
            this.worker.postMessage({ action: 'load', url: url });

            this.worker.onmessage = (event) => {
                if (event.data.action === 'loaded') { const arrayBuffer = event.data.model;
                    /* 用gltfloader的.parse 還原gltf - 
                       https://threejs.org/docs/#examples/zh/loaders/GLTFLoader
                       arrayBuffer指的是指整個GLTF文件，
                       arrayBuffer 不只是包含 mesh 的頂點訊息，連材質之類的都有。
                       在 WebGL 和 Three.js 的上下文中
                       ArrayBuffer 可以包含任何类型的二進制數據。
                       */
                    this.loader.parse(arrayBuffer, '', (gltf) => {
                        resolve(gltf);
                    }, reject);
                }
            };
        });
    }

    async loadModels() {
        try {
            /* 01.分開載入所有模型
               每一個模型都使用Promise.all等待
               load()的方法中
               我們會給worker傳入我們要做什麼(action: 'load') 還有給模型位置
               
               當worker收到後，用fetch方法找我們給的URL
               然後再把fetch到的內容存入arrayBuffer
               並且這表示載好了，我們就需要從worker裡postMessage回去
               
               回到load()，我們設定onmessage
               */
            const city8 = await Promise.all([
                this.load('./assets/city9.glb')
            ]);
            const chassis = await Promise.all([
                this.load('./assets/truck1.glb')
            ]);
            const wheel = await Promise.all([
                this.load('./assets/wheelTruck1.glb')
            ]);
            const lobster = await Promise.all([
                this.load('./assets/lobster.glb')
            ]);
            const foodBeg = await Promise.all([
                this.load('./assets/foodBeg.glb')
            ]);
            const bobaTea = await Promise.all([
                this.load('./assets/bobaTea.glb')
            ]);
            const carrotCake = await Promise.all([
                this.load('./assets/carrotCake.glb')
            ]);

            /* 02.當所有模型載入好後，我們把所有模型存成我們自己的格式
            */
            /* 在這裡使用扩展运算符 (...) 是因為我們Promise.all回傳的資料會被包一層[陣列]!
               扩展运算符 (...) 可以看作是在“展开”数组，或者说是把数组中的元素逐个“复制”到新的数组中。
               例如，我有 array1 = [1, 2] 和 array2 = [3, 4]
               当我执行 const combinedArray = [...array1, ...array2]; 
               combinedArray 将会是 [1, 2, 3, 4]，而不是 [[1, 2], [3, 4]]。
            */

            const loadModel = [...city8, ...city8, ...chassis, ...wheel, ...lobster, ...foodBeg, ...bobaTea, ...carrotCake];

            const models = {
                collider: loadModel[0],
                map: loadModel[1],
                chassis: loadModel[2],
                wheel: loadModel[3],
                lobster: loadModel[4],
                foodBeg: loadModel[5],
                bobaTea: loadModel[6],
                carrotCake: loadModel[7],
            };

            /* 03.給所有的模型都開啟陰影選項
            */
            [models.collider.scene, models.map.scene, models.chassis.scene, models.wheel.scene, models.lobster.scene, models.foodBeg.scene, models.bobaTea.scene, models.carrotCake.scene].forEach(model => {
                model.traverse(function (child) {
                    if (child.isMesh && child.name !== 'wall') {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
            });

            return models;
        } catch (error) {
            console.error('加載模型出錯：', error);
            return null;
        }
    }
}