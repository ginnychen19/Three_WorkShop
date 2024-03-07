#  跳跳的 Three.js 工作坊

![工作坊進度圖](workshop.jpg)

Week01 - 無加入物理的汽車移動 <br>
https://gotoo.co/demo/elizabeth/Frontend_Workshop/three/week01/ <br>
在使用別人模型的情況下，了解了一些模型的預處理相關 <br>
因為之前都用OBJ，現在更加熟悉FBX格式和Gltf / Glb的格式上，在three.js上取用的差別 <br>
和OBJ還有Fbx不同，gltf或glb需要找到 .scene 才是模型  <br>

在移動上，最簡單的方法就是用前後控制移動、左右控制轉向 <br>
和之前，在我旋轉完還需要換算成向量，才能分別計算出X 和 Z 需要每秒分別移動多少才能符合當前向量比起來 <br>
.translateZ(移動量) / .translateX(移動量) <br>
這個方法可以讓我的移動是直接依據當前方向，很方便 <br>

但缺點是，因為左右方向永遠相對於車體，所以如果使用者的車頭朝向鏡頭時，操作會變得不直覺 <br>

---

Week02 - 加入rapier物理的汽車移動 <br>
https://gotoo.co/demo/elizabeth/Frontend_Workshop/three/week02/ <br>
程式結構參考(請看Alice/js裡的檔案) <br>
https://docs.google.com/document/d/1eJ6tfdh5je4Y-UFvU216HdclHQliD-MBvc6II3D1Q6c/edit?usp=sharing <br>

為了加入rapier物理，我大改了原來的代碼結構 main.js <br>
因為沒有使用特定打包工具的rapier可能會載入較慢，所以需要在初始化時就使用異步等待 <br>
請小心，再加入rapier時，如果不是用bundler打包器，而是其他打包器，請使用 npm i @dimforge/rapier3d-compat 下載 <br>
我這裡還額外下載了npm i @parcel/packager-wasm <br>

同時，我把需要執行requestAnimationFrame的部分包進class ThreeScene裡 <br>
因為原本的寫法可能會導致我需要 async/await的 init()還沒執行完，但update()的內容已經開始執行 <br>
同時我也把requestAnimationFrame()變成Three.js的內建語法.setAnimationLoop() <br>
        
在loading的部分，我原本的結構會在異步裡又一次使用異步 <br>
更新的結構中，直接用await Promise.all 這會讓我的的異步執行得更順利 <br>
同時，為了確保後續操作都是在模型完成loading，我把需要建立模型的操作都包成callback Function 這樣就可以結構清晰的丟進loading.js執行 <br>

input.js的部分，我也大改了判斷方式 <br>
原本的判斷方式在處理煞車時容易出現衝突  <br>
現在的寫法變成檢查每個按鍵是否為True(有被按下的狀態) <br>
然後在移動時就可以判斷所有的狀態，如果狀態為True，則執行該加速/煞車/轉向  <br>

player.js 的部分，主要處理了汽車模型、汽車物理的建立 <br>
有很多製作上要注意的地方，因為物理世界模擬得很真實，所以如果加了物理 <br>
在尺寸上要小心，因為重量、體積這些計算都會影響到力，像我目前車子的寬是 1.44m <br>
比較重要的是理解車子的懸吊系統才會了解我們再設定的那些參數到底影響什麼部分  <br>

在使用rapier製作車子物理時，請注意車輪模型要在車體的鋼體設定完成之後才可以加入! <br>
還有在模型上，車身和車輪的原模型需要呈現90°垂直 (因為放進物理世界同方向會有問題)  <br>
這邊的鏡頭跟隨有大量使用到.lerp的計算，這可以讓鏡頭在轉向或移動時變得更加平滑! <br>

不過目前設定的數值似乎還是容易在後輪移動 + 強制煞車時翻車 <br>

這邊有很多數值計算相關語法 - https://www.cnblogs.com/vadim-web/p/13359036.html <br>

---

Week03 - 各種優化 <br>
https://gotoo.co/demo/elizabeth/Frontend_Workshop/three/week03/ <br>
