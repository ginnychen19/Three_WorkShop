/*
 * @Author: hongbin
 * @Date: 2023-04-04 09:49:40
 * @LastEditors: hongbin
 * @LastEditTime: 2023-04-05 15:25:18
 * @Description: 用web Worker加载模型
 */

import Layout from "@/src/components/Three/Layout";
import { ThreeHelper } from "@/src/ThreeHelper";
import { ModelTranslate } from "@/src/ThreeHelper/worker/ModelTranslate";
import { FC } from "react";
import * as THREE from "three";
import { InterpolateLinear } from "three";

interface IProps {}

const Physics: FC<IProps> = () => {
    return (
        <Layout
            title={"用web Worker加载模型动画"}
            init={init}
            desc={"用web Worker加载模型动画"}
        />
    );
};

export default Physics;

function init(helper: ThreeHelper) {
    helper.renderer.useLegacyLights = false;
    // helper.addAxis();
    helper.addStats();
    helper.camera.position.set(0, 1, 5);
    helper.frameByFrame();
    helper.addGUI();
    helper.initLights();
    helper.useSkyEnvironment();
    helper.useRoomEnvironment();

    const skeletonAnimation = new helper.SkeletonAnimation();

    const worker = new Worker(
        new URL(
            "../../src/ThreeHelper/worker/LoadModelWorker.ts",
            import.meta.url
        )
    );

    worker.postMessage({
        type: "load",
        url: "/models/observer_mesh.glb",
    });

    worker.addEventListener("message", async (e) => {
        console.log(e.data.json);

        e.data.json.animations.forEach((animation: THREE.AnimationClip) => {
            animation.tracks.forEach((track: any) => {
                track.interpolation = THREE.InterpolateDiscrete;
            });
        });

        const root = await new THREE.ObjectLoader().parseAsync(e.data.json);
        console.log(root);
        helper.add(root);
        skeletonAnimation.init(root, root.animations);
        skeletonAnimation.console(helper.gui);
        // const gltf = ModelTranslate.parseWorkerStruct(e.data.gltf);
        // console.log("worker loaded");
        // skeletonAnimation.pushAnimationClip(gltf.animations);
        // skeletonAnimation.console(helper.gui);
    });

    helper.loadGltf("/models/observer_mesh.glb").then((gltf) => {
        // helper.add(gltf.scene);
        console.log("js loaded", gltf.scene);
        // skeletonAnimation.init(gltf.scene, gltf.animations);
        // skeletonAnimation.console(helper.gui);
    });

    helper.animation(() => {
        skeletonAnimation.update();
    });
}
