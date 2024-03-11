/*
 * @Author: hongbin
 * @Date: 2023-04-03 16:42:19
 * @LastEditors: hongbin
 * @LastEditTime: 2023-04-03 16:43:54
 * @Description: 水
 */
import { RepeatWrapping, TextureLoader, Vector3 } from "three";
import { Water as THREEWater } from "three/examples/jsm/objects/Water";

export class Water {
    constructor(waterMath: Mesh) {
        const water = new THREEWater(waterMath.geometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new TextureLoader().load(
                "/textures/waternormals.jpg",
                function (texture) {
                    texture.wrapS = texture.wrapT = RepeatWrapping;
                }
            ),
            sunDirection: new Vector3(),
            sunColor: 0xffffff,
            waterColor: "#0084f0",
        });
        water.material.uniforms["sunDirection"].value.copy(water.position);
        // water.material.uniforms["sunDirection"].value.y -= 1;
        water.material.uniforms["size"].value = 10;

        water.onAfterRender = () => {
            water.material.uniforms["time"].value += 0.0016;
        };

        waterMath.add(water);
    }
}
