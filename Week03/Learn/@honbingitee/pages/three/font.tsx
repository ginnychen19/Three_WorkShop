/*
 * @Author: hongbin
 * @Date: 2023-04-05 18:05:48
 * @LastEditors: hongbin
 * @LastEditTime: 2023-04-05 19:20:16
 * @Description:凹凸字体
 */
import Layout from "@/src/components/Three/Layout";
import { ThreeHelper } from "@/src/ThreeHelper";
import { FC } from "react";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

import * as THREE from "three";

interface IProps {}

const Physics: FC<IProps> = () => {
    return <Layout title={"立体文字"} init={init} desc={"立体文字"} />;
};

export default Physics;

async function init(helper: ThreeHelper) {
    helper.renderer.useLegacyLights = false;
    helper.addStats();
    helper.camera.position.set(0, 0, 30);
    helper.frameByFrame();
    helper.addGUI();
    helper.useSkyEnvironment(true);
    // helper.useRoomEnvironment();
    helper.initLights3();

    const fontLoad = new FontLoader();
    const font = await fontLoad.loadAsync("/font/xs.json");
    console.log(font);

    if (!font) throw new Error("not font!");

    const fontGeometry = new TextGeometry("抗疫先锋", {
        font,
        size: 5,
        height: 0.3,
        curveSegments: 1,
        bevelEnabled: true,
        bevelThickness: 0.7,
        bevelSize: 0.2,
        bevelSegments: 12,
    });
    fontGeometry.center();

    const fontMesh = new THREE.Mesh(
        fontGeometry,
        new THREE.MeshStandardMaterial({
            color: new THREE.Color("#727170").convertLinearToSRGB(),
            roughness: 0.1,
            metalness: 1,
            emissive: new THREE.Color("#f3a319").convertLinearToSRGB(),
            emissiveIntensity: 0.1,
        })
    );

    helper.add(fontMesh);

    return;
    const length = 12,
        width = 8;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, width);
    shape.lineTo(length, width);
    shape.lineTo(length, 0);
    shape.lineTo(0, 0);

    const extrudeSettings = {
        steps: 2,
        depth: 16,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 10,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffaaaa,
        wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    helper.add(mesh);
}
