# Tài Liệu Kỹ Thuật & Tạo Hình Nhân Vật 3D: Hunter (Thợ Săn)

Tài liệu đặc tả kiến trúc công nghệ, hình học thủ tục (Procedural 3D), hệ thống vật liệu PBR low-poly, ánh sáng rừng tối cách điệu, bảng màu mặc định, hệ thống 4 pose, xuất mô hình (`.GLB`/`.OBJ`) và kết quả kiểm chứng của nhân vật thứ 6 — **Hunter (Thợ Săn)** trong bộ sưu tập `3D-shape`.

---

## 1. Tổng Quan Kiến Trúc & Công Nghệ Nền Tảng

- **Engine đồ họa**: Three.js r160 (ES Modules cục bộ từ `libs/three.module.js`, `libs/OrbitControls.js`, `libs/GLTFExporter.js`, `libs/OBJExporter.js`), chạy hoàn toàn offline không dùng CDN.
- **Phong cách mỹ thuật**: **Chibi Low-Poly Stylized**, dựng hình thủ tục thuần JavaScript bằng `THREE.BufferGeometry` kết hợp chuẩn hóa mặt phẳng (`makeFlat` -> `toNonIndexed()` + `computeVertexNormals()`) cho trang phục, mũ, túi đeo, bốt và súng săn; riêng khuôn mặt `faceMesh` giữ pháp tuyến nội suy mịn trên form vuông-thuôn Chibi.
- **Tính độc lập tuyệt đối**: Toàn bộ hình học, khớp xương và vật liệu của Hunter được đóng gói riêng trong [hunter-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/js/hunter-model.js), không can thiệp hay chỉnh sửa bất kỳ tệp model nào của 5 nhân vật trước (*Chibi Girl*, *Werewolf*, *Seer*, *Guard*, *Witch*).
- **Tách biệt bối cảnh & model**: Bối cảnh rừng tối cách điệu (`viewerEnvGroup` gồm cây thông, bụi cỏ, tảng đá low-poly) chỉ nằm trong `scene` của [hunter.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/hunter.html) và có nút bật/tắt riêng — **không gắn vào `hunterData.model`**, đảm bảo tệp `.glb` và `.obj` xuất ra chỉ chứa duy nhất nhân vật Hunter.
- **Hệ tệp liên quan**:
  - Mã nguồn mô hình: [hunter-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/js/hunter-model.js)
  - Trình xem tương tác chính: [hunter.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/hunter.html)
  - Trang preview headless & xuất file: [preview_hunter.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/preview_hunter.html)
  - Trang đối chiếu 1:1 với ảnh mẫu: [comparison_hunter.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/comparison_hunter.html)
  - Script render & export tự động: [render_hunter.py](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/tools/render_hunter.py)
  - Ảnh mẫu concept gốc: [hunter_ref.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/references/hunter_ref.png)

---

## 2. Phân Tích Ảnh Tham Chiếu & Tinh Chỉnh Giải Phẫu Hình Học (Hunter V6)

Đối chiếu trực tiếp theo [hunter_ref.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/references/hunter_ref.png):

- **Tỷ lệ 3 Vùng Cơ Thể & Giải Phẫu V5–V6**:
  - **Phân bổ chiều cao & Dáng Chibi đầm chắc (outsole `+0.002m`)**: Đầu + Mũ (`37.1%` so với concept `42.2%`) — Thân + Cổ (`37.7%` vs `35.2%`) — Chân + Bốt (`25.2%` vs `22.5%`).
  - **Cụm Cằm – Cổ – Cổ Áo Sơ Mi & Áo Trong (V6 Phase 2)**: Loại bỏ hoàn toàn mảng phồng sáng trước ngực; cổ 3D liền khối (`neckGroup` `[0, 0.351, 0.002]`, `headGroup` `[0, 0.3745, 0.002]`, `neck_w/face_w = 0.259`) nối khít đáy cằm (`faceMinY = 0.3755`) xuống khe cổ áo chữ V gọn gàng; hai lá cổ áo `collarWingL/R` gập nổi chữ `< >` với bóng nếp vải ấm `shirtShadowMat` bên dưới trước nền áo sơ mi phẳng `createHunterShirtGeo` & nẹp khuy mảnh (`shirtPlacketStrip`); vẫn giữ khớp xoay không hở (`zeroGap = true`, `headNeckOverlap = 0.0175–0.0512`, `neckTorsoOverlap = 0.0291`).
  - **Mũ Trapper Hat dáng xiên rộng & Tai mũ ôm sát (`hunterHatGroup` `[0, 0.126, 0.001]`)**: Chóp mũ hạ đỉnh thấp rộng rãi với các mặt đa giác vát xiên dần vào tâm (không trụ đứng), lưỡi trai 8 đoạn uốn mượt theo cung trán và thu gọn thái dương (`v_visor_lip = 0.770`), phần bẻ sau (`createTrapperBackSkirtGeo`, `tSpan = 0.72π`) thu gọn gọn sau tai mũ, cặp tai mũ (`x = ±0.108`) ôm khít hai bên má Rounded-Square (`face_w/H = 0.269`, mắt `[±0.033, 0.056, 0.0758]`).
  - **Vai Ghi-lê Khép Đỉnh & Tay 2 Khúc Mềm Mại (V6 Phase 3)**: Đỉnh vai ghi-lê `createVestSideHalfGeo` khép kín dốc vào viền cổ (`rx = 0.045 -> 0.080 -> 0.093`, loại bỏ hốc rỗng vai trên góc 3/4), thắt eo `rx = 0.081` và kết thúc ở 2 vạt ngắn xòe nhẹ (`y = -0.106`, `vest_hem_w/H = 0.274`); hai tay `[±0.074, 0.324, 0.002]` dùng `upperArmGeo`/`forearmGeo` bo tròn gối khớp khuỷu không gãy khúc (`rightArmChain.rotZ = -0.98`, `rightElbowPivot.rotZ = 0.13` và bàn tay trái màn hình có ngón cái tạc liền `rightThumb`; `leftArmChain.rotZ = 0.45`, `leftElbowPivot = (-0.22, 0.04, 0.40)`).
  - **Bàn Tay Phải Màn Hình Cầm Súng Mitten (V6 Phase 1)**: `createTubePathGeo` tạo bàn tay mitten gập ôm ngang qua cổ báng súng mảnh (`leftPalmHeel`, `leftMittenFingers` 4 ngón gập lộ đốt tay, `leftThumbWrap` ngón cái đối diện ôm cạnh trên, `leftHandGripPivot.rot = (0.05, 0.14, -1.14)`), cổ tay thu gọn vào măng-sét `leftArmCuff` và súng không xuyên cắt qua ngón (`v_muzzle = 0.790` vs `0.787`).
- **Quy ước trục & trái/phải chuẩn camera chính diện (`+Z`)**:
  - **Màn hình trái (`-X`, tay phải `rightArmGroup`)**: Tay áo sơ mi kem xắn gấu nâu đậm, bàn tay Chibi mở hơi gập khuỷu tự nhiên; bên hông `-X` đeo **túi da (`satchelGroup`)**.
  - **Dây đeo chéo (`crossbodyStrap`)**: Vắt qua đỉnh vai `+X`, chéo qua ngực ngoài vạt áo ghi-lê xuống túi `-X` và vòng khép kín phía sau lưng.
  - **Màn hình phải (`+X`, tay trái `leftArmGroup`)**: Tay trái nắm chặt cổ tay cầm báng súng ngay sau khóa nòng (`leftHandGripPivot`), nòng thép hướng chéo lên ngoài phải (`v_muzzle = 0.787` khớp chính xác `0.787` ở concept).

---

## 3. Cây Phân Cấp Scene Graph (`THREE.Group` Hierarchy)

Nhóm gốc `hunterGroup` (`name = 'ChibiHunter'`) tổ chức phân tầng rõ ràng:

- `hunterGroup` (`ChibiHunter`)
  - `torsoGroup` (`[0, 0.268, 0]`):
    - `shirtGroup` (`createHunterShirtGeo` ngực áo phẳng gài dưới vai ghi-lê, `shirtPlacketStrip` mảnh, `collarWingL/R` gập chéo `< >` có bóng nếp `collarShadowL/R` bằng `shirtShadowMat`, `collarBackRim` `y = 0.086` & `collarRecess` ẩn sâu)
    - `vestGroup` (`createVestSideHalfGeo` vai xuôi khép đỉnh `rx = 0.045 -> 0.080 -> 0.093`, thắt eo `rx = 0.081`, vạt ngắn loe nhẹ 2 cánh tới `y = -0.106`, mảng lưng liền khối, 2 cúc áo tại `x = 0.020`)
    - `pelvisBlock` (khối chuyển tiếp hông dưới vạt áo tới `y = -0.118` ôm đầu đùi)
    - `beltGroup` (`beltStrapsMesh` bo vát mềm `rx = 0.082..0.090 -> 0.084`, khóa bạc ngang rỗng)
    - `crossbodyStrap` (`createCrossbodyStrapGeo` vòng kín 360° ôm nổi qua ngực, đỉnh vai và lưng)
    - `satchelGroup` (`[-0.114, -0.102, 0.024]`: thân túi đáy bo tròn, nắp gập cong, dây đeo + móc cài)
  - `neckGroup` (`[0, 0.351, 0.002]`): `neckBase` liền khối + `upperNeck` (cùng tông da mặt giảm sáng nhẹ `0.95x`, lồng gọn trong cổ áo chữ V)
  - `headGroup` (`[0, 0.3745, 0.002]`, tâm xoay ngay gốc cổ):
    - `faceMesh` (`createHunterHeadGeo`, dáng Rounded-Square Chibi má đầy bo hàm tự nhiên)
    - `rightEye`, `leftEye` (`±0.033, 0.056, 0.0758`, mắt oval khảm bán mờ)
    - `rightBrow`, `leftBrow` (`±0.033, 0.080, 0.0755`, lông mày nghiêng nhẹ `rotZ = ∓0.15`)
    - `hairGroup` (`createHunterBackHairGeo` phủ kín gáy, `foreheadRootBand`, lọn mái bất đối xứng, tóc mai gọn sau tai mũ)
    - `hunterHatGroup` (`[0, 0.126, 0.001]`: `createTrapperCrownGeo` chóp vát xiên rộng, `createTrapperVisorGeo` 8 đoạn ôm trán, `createTrapperBackSkirtGeo` gập gọn sau gáy, hai tai mũ `createEarFlapGeo` ôm sát má tại `x = ±0.108`)
  - `rightLegGroup` (`[-0.056, 0.158, 0.002]`, `rotY = -0.09`): `pantLegGeo` (đùi đầy `rx = 0.047` -> gối thắt `rx = 0.033` -> gấu quần xắn `rx = 0.040`), `bootCuffGeo`, `createHunterBootGeo` (đế tại `y = +0.002`)
  - `leftLegGroup` (`[0.056, 0.158, 0.002]`, `rotY = +0.09`): `pantLegGeo`, `bootCuffGeo`, `createHunterBootGeo`
  - `rightArmGroup` (`[-0.074, 0.324, 0.002]`): `rightArmChain` (`upperArmGeo` -> `rightElbowPivot` -> `forearmGeo` -> `armCuffGeo` -> `wristGeo` -> `rightHand` + `rightThumb` tạc bằng `createTubePathGeo`)
  - `leftArmGroup` (`[0.074, 0.324, 0.002]`): `leftArmChain` (`upperArmGeo` -> `leftElbowPivot` -> `forearmGeo` -> `leftArmCuff` -> `leftWrist` -> `leftHandGripPivot`):
    - `leftPalmHeel`, `leftMittenFingers`, `leftThumbWrap` (bàn tay mitten gập ôm báng súng tạc bằng `createTubePathGeo`)
    - `rifleGroup` (súng săn một nòng gắn gọn trong `leftHandGripPivot`)

---

## 4. Đặc Tả Vật Liệu PBR (`materials`)

| Nhóm vật liệu | Roughness V4 | Metalness V4 | FlatShading | Ghi chú phân tách chất liệu |
| :--- | :---: | :---: | :---: | :--- |
| Mũ Trapper (`hatCrownMat`, `hatBrimMat`, `hatFlapMat`) | `0.82–0.84` | `0.03` | `true` | Nỉ/dạ mờ, giữ rõ cạnh vát low-poly |
| Tóc, Mắt & Lông mày (`hairMat`, `eyeMat`, `browMat`) | `0.68–0.78` | `0.02–0.03` | `true` / `false` (mắt) | Mắt bán mờ tránh lóa giả |
| Áo ghi-lê (`vestMat`) & Quần / Bốt (`bootsMat`) | `0.78` / `0.76` | — | `true` | Vải thô & da bốt lì |
| Túi da (`satchelMat`) & Dây đeo (`strapMat`) | `0.56` / `0.62` | — | `true` | Da satin bắt sáng nhỉnh hơn áo ghi-lê |
| Da mặt & cổ (`skinMat`, `neckSkinMat`) | `0.72–0.76` | `0.02` | `false` | Nội suy mịn khuôn mặt Chibi |
| Gỗ báng súng (`rifleWoodMat`) | `0.60` | — | `true` | Gỗ nâu ấm có ánh satin nhẹ |
| Kim loại nòng súng (`rifleMetalMat`) & Khóa thắt lưng (`buckleMat`) | `0.30` / `0.34` | `0.74` / `0.72` | `true` | Bắt sáng kim loại rõ nét dưới đèn Studio V4 |

---

## 5. Hệ Thống API & 4 Tư Thế (`Poses`)

Hàm `createHunterCharacter(customColors = {})` trả về API đồng nhất với toàn dự án:
- `setPose(poseName)`:
  1. `idle`: Dáng đứng chuẩn theo ảnh concept, hai chân đứng vững, tay trái giữ súng gọn bên hông.
  2. `ready`: Tư thế cảnh giác săn mồi, tay & súng hạ sẵn sàng và trụ chân vững.
  3. `patrol`: Dáng bước tuần tra rừng, tay phải và hai chân đánh nhịp tự nhiên không xuyên vạt áo.
  4. `t-pose` (chấp nhận bí danh `tpose`): Giang ngang hai tay chuẩn Rig T-Pose, súng vẫn khóa chặt trong nắm tay trái.
- `setColors(newColors)`: Đổi màu thời gian thực các bộ phận nhân vật (UI `hunter.html` hiển thị 15 ô chọn màu trực tiếp + nút reset mặc định).
- `setWireframe(enabled)`: Bật/tắt chế độ khung dây trên toàn bộ vật liệu.
- `setEffects({ breathe })` & `update(elapsedTime, options)`: Điều khiển nhịp thở nhẹ nhàng ở đầu (`headGroup.y = 0.3745`), cổ (`neckGroup.y = 0.351`), thân (`torsoGroup.y = 0.268`) và độ rung nhẹ cánh tay / túi đeo hông.
- `dispose()`: Giải phóng toàn bộ hình học và vật liệu.

---

## 6. Kết Quả Kiểm Chứng & Đo Đạc Chuẩn Hóa (Hunter V6)

1. **Xuất mô hình 3D sạch (không chứa bối cảnh `viewerEnvGroup`)**:
   - [hunter.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/hunter.glb): `478,076` bytes (`~466.9 KB`), glTF 2.0 nhị phân hợp lệ, `101` nodes, `78` meshes, `has_viewer_env = False`.
   - [hunter.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/hunter.obj): `2,080,621` bytes (`~2,031.9 KB`), `13,694` vertices, `5,472` faces, `80` groups.
2. **Ảnh render đa góc & đối chiếu chuẩn hóa chiều cao (9 góc + 1 bảng so sánh)**:
   - [render_hunter_concept.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_hunter_concept.png), [render_hunter_front.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_hunter_front.png), [render_hunter_34.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_hunter_34.png), [render_hunter_side.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_hunter_side.png), [render_hunter_back.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_hunter_back.png), [render_hunter_top.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_hunter_top.png), [render_hunter_closeup_head.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_hunter_closeup_head.png), [render_hunter_closeup_torso.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_hunter_closeup_torso.png), [render_hunter_closeup_rifle.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_hunter_closeup_rifle.png), [comparison_hunter.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/comparison_hunter.png) (chuẩn hóa cùng chiều cao nhân vật `470 px` từ `apex = 74.6px` tới `sole = 544.6px`).
3. **Đo đạc đối chiếu mốc chuẩn hóa theo chiều cao tổng (`v = (foot_y - y) / H`, `Concept 287×393 / H=315 px` vs `Render V6 720×986 / H=547 px`)**:
   - Đỉnh mũ `v_apex`: `1.000` vs `1.000` (`+0.000`), rộng chóp `crown_w/H`: `0.402` vs `0.362` (`+0.040`), khóa thắt lưng `buckle_w/H`: `0.062` vs `0.060` (`+0.002`).
   - Lưỡi trai `v_visor_lip`: `0.770` vs `0.749` (`+0.021`), đáy tóc mái `v_bangs_bot`: `0.737` vs `0.717` (`+0.020`), tâm mắt `v_eye`: `0.679` vs `0.656` (`+0.023`), rộng mặt `face_w/H`: `0.269` vs `0.229` (`+0.040`).
   - Vùng cằm & cổ 3D lồng khít cổ áo: `v_chin = 0.629` vs `0.578` (`+0.051`), `neck_vis_% = 6.9%` vs `7.6%`, `neck_w/face_w = 0.259`; kiểm thử xoay `headGroup` ở các góc `[0,0,0]`, `[0.2, 0.45, 0.14]` và `[-0.18, -0.45, -0.14]` đều giữ `zeroGap = true` (`headNeckOverlap = 0.0175–0.0512`, `neckTorsoOverlap = 0.0291`).
   - Thân & gấu áo: rộng eo ghi-lê `vest_waist_w/H = 0.263` vs `0.235`, rộng gấu `vest_hem_w/H = 0.274` vs `0.222`, khóa thắt lưng `v_buckle = 0.337` vs `0.317`, gấu áo `v_coat_hem = 0.252` vs `0.225` (`legs_boots = 25.2%` vs `22.5%`).
   - Súng săn: mũi súng `v_muzzle = 0.790` vs `0.787` (`+0.003`), đáy báng gỗ `v_butt_bot = 0.122` vs `0.178` (`-0.056`).
4. **Kiểm thử tự động UI & hồi quy 6 nhân vật**:
   - `hunter.html` không có lỗi console/pageerror (`0` lỗi), đổi đủ 4 pose (`ready`, `patrol`, `t-pose`, `idle`), bật/tắt rừng tối, thở, wireframe, xoay tự động, đổ bóng và đổi 15 bộ chọn màu thời gian thực (`#9c6246` -> `#224466` -> `#9c6246`).
   - Các trang [index.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/index.html), [wolf.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/wolf.html), [seer.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer.html), [guard.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/guard.html), [witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/witch.html) và [comparison_hunter.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/comparison_hunter.html) đều đạt `ok=True` (không lỗi runtime WebGL/Three.js qua kiểm thử CDP `test_cdp.mjs`; riêng `index.html` có log 404 của `favicon.ico` mặc định trình duyệt) và chụp ảnh kiểm chứng ổn định qua `verify_hunter.py`.

