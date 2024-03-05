// physicsWorld.js
import * as RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export class PhysicsWorld {
    constructor(scene) {
        this.scene = scene;
        this.bodies = [];
        this.colliderBodies = [];
        this.world = null;
        this.debugLines = [];
    }

    async init() {
        await RAPIER.init();
        this.world = new RAPIER.World({x: 0.0, y: -9.81, z: 0.0});
    }

    renderDebugShapes(scene, physicsWorld) {
        // 移除並清理之前的調試線條
        this.debugLines.forEach(obj => {
            scene.remove(obj);
            obj.geometry.dispose();
            obj.material.dispose();
        });
        this.debugLines = [];
    
        // 從物理世界獲取調試渲染的頂點和顏色數據
        const { vertices, colors } = physicsWorld.debugRender();
        // 創建線條的幾何體和材質
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({ vertexColors: true });
        
        // Three.js期望的是一個包含連續頂點坐標的數組
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        // 將Rapier的顏色數組轉換為Three.js可以接受的格式
        const colorAttribute = new THREE.Float32BufferAttribute(colors.length * 3, 3);
        for (let i = 0; i < colors.length; i += 4) {
            // Three.js中的顏色不包括alpha值，所以我們只復制RGB值
            colorAttribute.setXYZ(i / 4, colors[i], colors[i + 1], colors[i + 2]);
        }
        geometry.setAttribute('color', colorAttribute);
        
        // 創建線條並添加到場景中
        const lines = new THREE.LineSegments(geometry, material);
        scene.add(lines);
        this.debugLines.push(lines); // 存儲引用以便後續清理
    }

    step() { //用于推进物理世界的模拟时间
        this.world.step();
    }

    createScene(model) { //製作不動的場景
        model.traverse(child => {
            if (child.isMesh) {
                const rigidBodyDesc = RAPIER.RigidBodyDesc.fixed()
                    .setCanSleep(false);//忘記為何要不能取消監聽
                const rigidBody = this.world.createRigidBody(rigidBodyDesc);
                child.geometry.computeVertexNormals();
                /* 在某些情况下，如果几何体被动态修改或是通过一些非标准方式创建，顶点法线可能不会自动计算或更新，这时就需要手动调用这个方法来确保法线数据的正确性。 */
                child.geometry.computeBoundingBox(); //计算几何体的边界盒，它允许引擎快速判断几何体是否在摄像机视野内或与其他对象相交
                const vertices = child.geometry.attributes.position.array; //獲得模型的每個點
                const indices = child.geometry.index ? child.geometry.index.array : undefined;
                //index => 用于定义几何体中顶点的连接方式。这些索引决定了哪些顶点组合成三角形，进而构成几何体的表面

                let colliderDesc;
                if (indices) { // 用三角面的方式計算 
                    colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices);
                }
                
                this.world.createCollider(colliderDesc, rigidBody);
                child.userData.rigidBody = rigidBody; //因為很常需要設定所以乾脆直接新增到變數
            }
        });

        return model;
    }

    createRigidBody(model, position, type = 'dynamic') {
        let points = [];
        let rigidBodyDesc;
    
        /* 確認剛體格式 */
        switch (type) {
            case 'dynamic':
                rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic(); //會受力引響的物理模型
                break;
            case 'fixed':
                rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();   //不受力引響的物理模型
                break;
            case 'kinematicPositionBased':
                //代碼控制其運動而不受物理模擬（如重力或碰撞）影響的剛體
                //直接控制位置
                rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased(); 
                break;
            case 'kinematicVelocityBased':
                //給力的方向
                rigidBodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
                break;
            default:
                console.warn(`Unknown type: ${type}`);
                return;
        }
        /* 給位置和設定剛體 */
        rigidBodyDesc.setTranslation(position.x, position.y, position.z);
        const rigidBody = this.world.createRigidBody(rigidBodyDesc);
    
        /* 凸包計算 */
        model.traverse(child => {
            if (child.isMesh) {
                const positions = child.geometry.attributes.position.array;
    
                for (let i = 0; i < positions.length; i += 3) {
                    const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
                    child.localToWorld(vertex);
                    points.push(vertex.x, vertex.y, vertex.z);
                }
    
                child.userData.rigidBody = rigidBody; //把rigidBody加到屬性
            }
        });
    
        // 這個就是物理禿包計算
        const hullColliderDesc = RAPIER.ColliderDesc.convexHull(points);
        this.world.createCollider(hullColliderDesc, rigidBody);
    
        return { model, rigidBody, rigidBodyDesc };
    }


    update() {
        this.step();
        // 把所有的物理位置更新到模型上
        // 因此在模型上設定的旋轉和移動將不再有意義
        this.bodies.forEach(body => {
            const position = body.rigidBody.translation();
            const rotation = body.rigidBody.rotation();
            body.model.position.copy(position);
            body.model.setRotationFromQuaternion(
                new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
            );
        });

        // 繪製Debug線段外框
        // this.renderDebugShapes(this.scene, this.world);
    }
}