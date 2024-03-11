/*
 * @Author: hongbin
 * @Date: 2023-04-05 18:05:48
 * @LastEditors: hongbin
 * @LastEditTime: 2023-04-09 15:34:51
 * @Description:渐变
 */
import Layout from "@/src/components/Three/Layout";
import { ThreeHelper } from "@/src/ThreeHelper";
import { FC } from "react";
import * as THREE from "three";

import vertexShader from "../../src/pages/gradual/shader/vt.glsl";
import fragmentShader from "../../src/pages/gradual/shader/gm.glsl";

interface IProps {}

const Gradual: FC<IProps> = () => {
    return <Layout title={"颜色渐变"} init={init} desc={"颜色渐变"} />;
};

export default Gradual;

function init(helper: ThreeHelper) {
    helper.addStats();
    helper.addAxis();
    helper.camera.position.set(0, 10, 30);
    helper.frameByFrame();
    helper.addGUI();
    helper.initLights();

    const shader = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            upColor: { value: new THREE.Color("#f00") },
            upColor2: { value: new THREE.Color("#00ff1a") },
            downColor: { value: new THREE.Color("#030303") },
            time: { value: 0 },
            speed: { value: 1 },
        },
    });

    const shaders = [] as THREE.ShaderMaterial[];

    const { random } = Math;
    for (let i = 0; i < 100; i++) {
        const height = 2 + random() * 10;
        const itemShader = shader.clone();
        shaders.push(itemShader);
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(
                random() * 2,
                height,
                random() * 2,
                10,
                10,
                10
            ),
            itemShader
        );

        itemShader.uniforms.height = { value: height };
        itemShader.uniforms.upColor.value.g = random();
        itemShader.uniforms.upColor2.value.g = random();
        itemShader.uniforms.speed.value = (0.5 - random()) * 5;

        box.position.x = (0.5 - random()) * 30;
        box.position.y = height / 2;
        box.position.z = (0.5 - random()) * 30;

        helper.add(box);
    }
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(100, 0.1, 100),
        new THREE.MeshStandardMaterial({
            color: "#030303",
        })
    );

    helper.add(floor);

    helper.animation(() => {
        shaders.forEach((shader) => {
            shader.uniforms.time.value += 0.01;
        });
    });
}
