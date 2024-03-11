/*
 * @Author: hongbin
 * @Date: 2023-04-06 08:31:19
 * @LastEditors: hongbin
 * @LastEditTime: 2023-04-06 09:12:24
 * @Description: 后期效果
 */
import Layout from "@/src/components/Three/Layout";
import { ThreeHelper } from "@/src/ThreeHelper";
import { FC } from "react";
import * as THREE from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

interface IProps {}

const Physics: FC<IProps> = () => {
    return <Layout title={"后期效果"} init={init} desc={"后期效果"} />;
};

export default Physics;

async function init(helper: ThreeHelper) {
    helper.renderer.useLegacyLights = false;
    helper.addStats();
    helper.camera.position.set(0, 0, 30);
    helper.frameByFrame();
    helper.addGUI();
    helper.transparentBackGround();
    helper.renderer.domElement.style["background"] =
        "linear-gradient(45deg, #fc0000, #3e00fd)";

    const ENTIRE_SCENE = 0,
        BLOOM_SCENE = 1;

    const bloomLayer = new THREE.Layers();
    bloomLayer.set(BLOOM_SCENE);

    const params = {
        exposure: 1,
        bloomStrength: 5,
        bloomThreshold: 0,
        bloomRadius: 0,
        scene: "Scene with Glow",
    };

    const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
    const materials = {};

    const { renderer, scene, camera } = helper;
    // const renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.toneMapping = THREE.ReinhardToneMapping;
    // document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x404040));

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,
        0.4,
        0.85
    );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;

    const bloomComposer = new EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const finalPass = new ShaderPass(
        new THREE.ShaderMaterial({
            uniforms: {
                baseTexture: { value: null },
                bloomTexture: { value: bloomComposer.renderTarget2.texture },
            },
            vertexShader: `varying vec2 vUv;

			void main() {

				vUv = uv;

				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			}
`,
            fragmentShader: `uniform sampler2D baseTexture;
                uniform sampler2D bloomTexture;
    
                varying vec2 vUv;
    
                void main() {
    
                    gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
    
                }`,
            defines: {},
        }),
        "baseTexture"
    );
    finalPass.needsSwap = true;

    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderScene);
    finalComposer.addPass(finalPass);

    const raycaster = new THREE.Raycaster();

    const mouse = new THREE.Vector2();

    window.addEventListener("pointerdown", onPointerDown);

    setupScene();

    function onPointerDown(event: any) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, false);
        if (intersects.length > 0) {
            const object = intersects[0].object;
            object.layers.toggle(BLOOM_SCENE);
            render();
        }
    }

    window.onresize = function () {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);

        bloomComposer.setSize(width, height);
        finalComposer.setSize(width, height);

        render();
    };

    function setupScene() {
        scene.traverse(disposeMaterial);
        scene.children.length = 0;

        const geometry = new THREE.IcosahedronGeometry(1, 15);

        for (let i = 0; i < 50; i++) {
            const color = new THREE.Color();
            color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

            const material = new THREE.MeshBasicMaterial({ color: color });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.x = Math.random() * 10 - 5;
            sphere.position.y = Math.random() * 10 - 5;
            sphere.position.z = Math.random() * 10 - 5;
            sphere.position
                .normalize()
                .multiplyScalar(Math.random() * 4.0 + 2.0);
            sphere.scale.setScalar(Math.random() * Math.random() + 0.5);
            scene.add(sphere);

            if (Math.random() < 0.25) sphere.layers.enable(BLOOM_SCENE);
        }

        render();
    }

    function disposeMaterial(obj: Object3D) {
        //@ts-ignore
        if (obj.material) {
            //@ts-ignore
            obj.material.dispose();
        }
    }

    function render() {
        switch (params.scene) {
            case "Scene only":
                renderer.render(scene, camera);
                break;
            case "Glow only":
                renderBloom(false);
                break;
            case "Scene with Glow":
            default:
                // render scene with bloom
                renderBloom(true);

                // render the entire scene, then render bloom scene on top
                finalComposer.render();
                break;
        }
    }

    helper.render = render;

    function renderBloom(mask: boolean) {
        if (mask === true) {
            scene.traverse(darkenNonBloomed);
            bloomComposer.render();
            scene.traverse(restoreMaterial);
        } else {
            camera.layers.set(BLOOM_SCENE);
            bloomComposer.render();
            camera.layers.set(ENTIRE_SCENE);
        }
    }

    function darkenNonBloomed(obj: any) {
        if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
            //@ts-ignore
            materials[obj.uuid] = obj.material;
            obj.material = darkMaterial;
        }
    }

    function restoreMaterial(obj: Object3D) {
        //@ts-ignore
        if (materials[obj.uuid]) {
            //@ts-ignore
            obj.material = materials[obj.uuid];
            //@ts-ignore
            delete materials[obj.uuid];
        }
    }
}

// {
//     const black = new THREE.Mesh(
//         new THREE.BoxGeometry(8, 3, 1),
//         new THREE.MeshStandardMaterial({ color: "#000" })
//     );
//     black.position.x += 2;
//     helper.add(black);
//     const red = new THREE.Mesh(
//         new THREE.SphereGeometry(1, 32, 32),
//         new THREE.MeshStandardMaterial({ color: "#f00" })
//     );

//     const green = new THREE.Mesh(
//         new THREE.SphereGeometry(1, 32, 32),
//         new THREE.MeshStandardMaterial({ color: "#00f" })
//     );
//     green.position.x += 2;
//     const yellow = new THREE.Mesh(
//         new THREE.SphereGeometry(1, 32, 32),
//         new THREE.MeshStandardMaterial({ color: "#ff0" })
//     );
//     yellow.position.x += 4;

//     helper.add(red, green, yellow);}
//     }
