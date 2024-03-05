// foodManager.js
export class FoodManager {
    constructor(scene, physicsWorld, model) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;
        this.model = model;
        this.foods = [];
        this.bodies = physicsWorld.bodies;
        this.generateFood('lobster');
        this.generateFood('foodBeg');
        this.generateFood('drink');
    }

    generateFood(foodType) {
        let foodModel;
        let foodPosition;

        switch (foodType) {
            case 'lobster':
                foodModel = this.model.lobster;
                foodPosition = { x: -3.75, y: 1.75, z: 8.5 };
                break;
            case 'foodBeg':
                foodModel = this.model.foodBeg;
                foodPosition = { x: 6.825, y: 1.75, z: 2.75 };
                break;
            case 'drink':
                foodModel = this.model.bobaTea;
                foodPosition = { x: -6, y: 1.75, z: 8.25 };
                break;
            case 'carrotCake':
                foodModel = this.model.carrotCake;
                foodPosition = { x: 6, y: 1.75, z: 8.5 };
                break;
            default:
                console.warn(`Unknown food type: ${foodType}`);
                return;
        }

        const clonedModel = foodModel.scene.clone();

        // 創建動態物體，並將其添加到場景和物理世界中
        const food = this.physicsWorld.createRigidBody(
            clonedModel,
            foodPosition
        );
        food.type = foodType;

        // 將複製的模型添加到場景中
        this.scene.add(clonedModel);

        this.bodies.push(food);
        this.foods.push(food);
    }
}


