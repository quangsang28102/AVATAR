# Tài Liệu Kỹ Thuật & Tạo Hình Nhân Vật 3D: Witch (Phù Thủy Độc Dược)

Tài liệu đặc tả kiến trúc công nghệ, hình học thủ tục (Procedural 3D), hệ thống vật liệu, ánh sáng, hiệu ứng **Twin Alchemy Glow**, bảng màu, hệ thống pose, xuất mô hình (`.GLB`/`.OBJ`) và kết quả kiểm chứng của nhân vật thứ 5 — **Witch (Phù Thủy)** trong bộ sưu tập `3D-shape`.

---

## 1. Tổng Quan Kiến Trúc & Công Nghệ Nền Tảng

- **Engine đồ họa**: Three.js (ES Modules cục bộ từ `libs/three.module.js`, `libs/OrbitControls.js`, `libs/GLTFExporter.js`, `libs/OBJExporter.js`), không dùng bundler hay CDN bên ngoài.
- **Phong cách mỹ thuật**: **Chibi Low-Poly Stylized**, kết hợp dựng hình thủ tục thuần JavaScript trên `THREE.BufferGeometry` với chuẩn hóa mặt phẳng (`makeFlat` -> `toNonIndexed()` + `computeVertexNormals()`).
- **Tính độc lập**: Witch là thực thể thứ 5 hoàn toàn độc lập với 4 nhân vật cũ (*Chibi Girl*, *Werewolf*, *Seer*, *Guard*). Toàn bộ hình học, vật liệu, bộ xương nhóm (`THREE.Group`) và hiệu ứng được đóng gói riêng trong [witch-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/js/witch-model.js).
- **Hệ tệp liên quan**:
  - Mã nguồn mô hình: [witch-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/js/witch-model.js)
  - Trình xem tương tác chính: [witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/witch.html)
  - Trang preview headless & xuất file: [preview_witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/preview_witch.html)
  - Trang đối chiếu 1:1 với ảnh mẫu: [comparison_witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/comparison_witch.html)
  - Script render & export tự động: [render_witch.py](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/tools/render_witch.py)
  - Ảnh mẫu & sprite tham chiếu: [witch_ref.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/references/witch_ref.png), [witch-head.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/sprites/witch-head.png), [witch-save.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/sprites/witch-save.png), [witch-kill.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/sprites/witch-kill.png)

---

## 2. Phân Tích Ảnh Tham Chiếu & Tỷ Lệ Tổng Thể

Đối chiếu trực tiếp theo [witch_ref.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/references/witch_ref.png):

- **Tỷ lệ Chibi**: Mũ phù thủy cỡ lớn có chóp uốn cong móc về phía màn hình phải (`+X`), đầu tròn hơi vuông bầu bĩnh, phần thân váy chữ A gọn gàng và đôi bốt tím đậm thấp lộ rõ bên dưới gấu váy.
- **Tọa độ không gian**:
  - Trục `+Y` hướng lên trên, mặt đáy giày đặt sát sàn (`y = 0.002` giúp khử shadow acne trên mặt phẳng sàn `y = 0`).
  - Trục `+Z` hướng về phía camera chính diện.
  - Phía màn hình trái (`-X`) là **tay phải (`rightArmGroup`)** cầm **bình thuốc xanh lục (`#26FF48`)**.
  - Phía màn hình phải (`+X`) là **tay trái (`leftArmGroup`)** cầm **bình thuốc tím (`#CB38FF`)**.

---

## 3. Cây Phân Cấp Scene Graph (`THREE.Group` Hierarchy)

Nhóm gốc `witchGroup` mang tên `ChibiWitch` tổ chức phân tầng để cô lập hoàn toàn khi xoay khớp theo pose hoặc xuất glTF:

- `witchGroup` (`ChibiWitch`)
  - `torsoGroup` (`y = 0.275`):
    - `dressGroup` (`dressMesh`)
    - `capeGroup` (`capeMesh` — vỏ áo choàng cong khép kín dày 0.018m)
    - `collarGroup` (`collarMesh`, `neckCore`)
    - `emeraldGemGroup` (`emeraldBezel`, `emeraldGemMesh`, `emeraldHighlight`)
  - `headGroup` (`y = 0.556`):
    - `faceGroup` (`headMesh`)
    - `eyeGroup` (`rightEye`, `leftEye`)
    - `eyebrowGroup` (`rightBrow`, `leftBrow`)
    - `hairGroup` (`backHairShell`, `topHairCap`, `rightSideLock`, `leftSideLock`, `bangLeftOuter`, `bangLeftCenter`, `bangRightMain`, `bangRightOuter`)
    - `witchHatGroup` (`hatBrim`, `hatBand`, `hatCrown`, `curvedTip`)
  - `rightLegGroup` (`[-0.062, 0.08, 0.004]`): `legUpper`, `shoe`
  - `leftLegGroup` (`[0.062, 0.08, 0.004]`): `legUpper`, `shoe`
  - `rightArmGroup` (`[-0.094, 0.430, 0.008]`):
    - `rightArmChain` (`rightSleeve`, `rightSleeveInner`, `rightHand`)
    - `greenPotionGroup` (thủy tinh pha lê trong suốt, chất lỏng xanh, nút bần gọn, 3 đốm phản chiếu, `haloInnerMesh` có Fresnel fade, `PointLight`, `greenParticles`)
  - `leftArmGroup` (`[0.094, 0.430, 0.008]`):
    - `leftArmChain` (`leftSleeve`, `leftSleeveInner`, `leftHand`)
    - `purplePotionGroup` (thủy tinh pha lê trong suốt, chất lỏng tím, nút bần gọn, 3 đốm phản chiếu, `haloInnerMesh` có Fresnel fade, `PointLight`, `purpleParticles`)
  - `magicEffectsGroup`

---

## 4. Đặc Tả Hình Học Thủ Tục Từng Bộ Phận

### 4.1 Mũ Phù Thủy Uốn Cong (`witchHatGroup`)
- **Vành mũ (`createWitchBrimGeo`)**: Mesh khép kín 14 phân đoạn xuyên tâm dựng từ lát cắt profile 6 điểm (mặt trên dốc cong xuống nhẹ ở mép ngoài `rOuter = 0.318` thay vì đĩa phẳng), tắt `hatBrim.castShadow = false` để tránh đổ bóng đen gắt xuống khuôn mặt.
- **Đai mũ (`hatBand`)**: Hình trụ vát 14 cạnh mỏng gọn (`CylinderGeometry(0.172, 0.192, 0.044, 14)`) ôm sát chân chóp.
- **Chóp uốn móc (`createLoftedSegmentGeo`)**: Ghép nối liền mạch `lowerCrownRings` (4 vòng từ `r = 0.186`) và `upperTipRings` (6 vòng từ `0.098` uốn cong dần sang `+X`, đỉnh cao tại `y = 0.312`, cụp mềm xuống ở `r = 0.002`), giảm chiều cao tổng thể ~20% để cân đối tỷ lệ đầu–thân.
- Toàn bộ cụm `witchHatGroup` đặt tại `y = 0.064, z = -0.006` (không scale toàn cục thô).

### 4.2 Đầu, Khuôn Mặt & Tóc Bob Cong (`headGroup`)
- **Khối đầu (`createWitchHeadGeo`)**: Biến dạng lưới cầu `(16 × 12)` kích thước mở rộng `rx = 0.134, ry = 0.108, rz = 0.118` bo vuông bầu mềm hai má squircle để lộ khuôn mặt sáng rõ hơn dưới mũ.
- **Mắt & Lông mày**: Hai mắt capsule nhỏ gọn đặt thẳng đứng (`CapsuleGeometry(0.0145, 0.020, 4, 8)` tại `x = ±0.052, y = -0.018, z = 0.106`). Hai lông mày mảnh ngắn (`0.028 × 0.0065 × 0.009`) nghiêng `±0.14 rad` ở `y = 0.014`. Không dựng mũi hay miệng.
- **Tóc mái & Lọn C-Bob ôm má (`hairGroup`)**:
  - `backHairShell`: Bề mặt cung vòm thuôn gọn theo gáy (`createBackHairGeo`), hoàn toàn mở phía mặt trước (`+Z`).
  - `rightSideLock`, `leftSideLock`: Loft đa vòng (`createLoftedSegmentGeo`, bottom -> top cho normal hướng ngoài) uốn cong vào cằm tạo dáng chữ C ôm sát hai bên má (`x = ±0.098..±0.148`).
  - 4 mảng tóc mái (`bangLeftOuter`, `bangLeftCenter`, `bangRightMain`, `bangRightOuter`) dựng bằng `createTaperedPanelGeo` hạ nhẹ xuống sát trên lông mày tạo đường cắt bất đối xứng tự nhiên.

### 4.3 Thân Váy Chữ A, Áo Choàng Liền Mạch & Ngọc Lục Bảo (`torsoGroup`)
- **Váy chữ A (`createWitchDressGeo`)**: 12 cạnh đa giác thon gọn hơn (`rx = 0.104` vai -> `0.098` thắt eo -> `0.190` gấu váy), tích hợp nếp gấp dọc nhẹ (`pleatAmp`) và gờ sống trước.
- **Áo choàng lưng (`capeGroup`)**: Vỏ 3D cong khép kín có độ dày thật `0.018m` (`createWitchCapeGeo`, `10` phân đoạn vòm từ `0.90π` đến `2.10π`, xòe rộng dần tới `rx = 0.296` ở `y = -0.205`) ôm vai và lượn phía sau không cắt xuyên váy.
- **Cổ áo cowl & Đá ngực**: Cổ áo phủ vai `createWitchCollarGeo` trũng V mềm ôm sát cằm không hở vòng cổ tối; đá lục bảo 8 mặt sắc nét (`OctahedronGeometry(0.0165, 0)`) đặt trong đài tối `emeraldBezel` kèm chấm phản quang nhỏ (`emeraldHighlight`).

### 4.4 Tay Áo Loe Bo Mép & Bốt Ngắn (`rightArmGroup`, `leftArmGroup`, `Legs`)
- **Tay áo chuông**: `createLoftedSegmentGeo` 5 vòng (`y = -0.138 .. -0.004`) tạo cổ tay bo vát gọn gàng thay cho ống trụ thô, gắn đĩa che tối `darkCavityMat` thụt sâu `y = -0.130`. Vai thu gọn về `x = ±0.094, y = 0.430` với dáng buông xuôi tự nhiên `(-0.46, 0, ∓0.58)`.
- **Bàn tay & Bốt**: Bàn tay cầu nhỏ (`radius = 0.030`, `y = -0.154`) ôm sát cạnh dưới-trong của bình cầu thủy tinh (`dist ≈ 0.071m` cho bình `r = 0.072`); đôi bốt `createWitchBootGeo` bo vát mềm đặt tại `x = ±0.062`.

### 4.5 Hai Bình Độc Dược Pha Lê & Fresnel Halo (`createPotionBottle`)
Mỗi bình (`bulbRadius = 0.072, liquidRadius = 0.064`) gồm 6 thành phần đồng trục:
1. **Chất lỏng phát sáng (`liquidBody` + `liquidTop`)**: Nửa cầu `thetaFillStart = 0.42π` (~60% dung tích) kết hợp đĩa mặt thoáng `CircleGeometry` phẳng nằm ngang.
2. **Bình thủy tinh trong suốt (`glassBulb`, `glassNeck`, `glassLip`)**: Thủy tinh trắng trung tính cực trong (`#ffffff`, `opacity: 0.16`, `depthWrite: false`) giúp nhìn rõ khoảng trống phía trên; cổ và miệng bình gọn gàng (`0.022..0.030`).
3. **Nút bần gọn (`corkOuter`, `corkPlug`)**: Trụ gỗ bần tỷ lệ cân đối (`r = 0.0185 -> 0.016, h = 0.020`) màu `#b57442`.
4. **3 đốm phản chiếu thủy tinh (`upperSpec`, `dotSpec`, `neckSpec`)**: Mảnh `MeshBasicMaterial` trắng `opacity: 0.85` giả lập vệt bóng thủy tinh.
5. **Hào quang Fresnel mềm 360° (`haloInnerMesh`)**: Cầu bán kính `0.094` dùng `onBeforeCompile` trên `MeshBasicMaterial` để suy giảm alpha theo góc nhìn `pow(abs(dot(N, V)), 2.4)`, triệt tiêu hoàn toàn viền cắt tròn cứng ở mọi góc quay.
6. **Nguồn sáng cục bộ kiểm soát spill (`PointLight`)**: Cường độ nhẹ `0.10`, tầm ngắn `distance: 0.21` đặt chếch ngoài `[±0.034, -0.012, 0.030]` giữ ánh sáng lan nhẹ quanh tay mà không ám xanh lên cằm hay loang tím gắt lên mặt váy.

---

## 5. Bảng Màu Mặc Định & Hệ Vật Liệu (`WITCH_DEFAULT_COLORS`)

| Khóa màu | Mã Hex mặc định | Bộ phận áp dụng | Tinh chỉnh vật liệu chính |
| --- | --- | --- | --- |
| `hat` | `#7c319c` | Mũ phù thủy & vành mũ | `roughness: 0.78`, `flatShading: true` |
| `hatBand` | `#382226` | Đai mỏng quanh chân mũ | `roughness: 0.84` |
| `hair` | `#4e263f` | Tóc bob cong, mái chẻ, lọn ôm má | `emissiveIntensity: 0.22` (giữ rõ sắc tím-nâu dưới bóng mũ) |
| `skin` | `#f6bd9c` | Đầu Chibi và hai bàn tay | `roughness: 0.76`, `flatShading: false` |
| `eyes` | `#140f17` | Hai mắt viên thuốc | `roughness: 0.28`, `metalness: 0.04` (bóng dịu không gắt) |
| `eyebrows` | `#451f29` | Hai lông mày mảnh ngắn | `roughness: 0.85` |
| `dress` | `#5c2a73` | Thân váy chữ A chính | `roughness: 0.84`, `DoubleSide` |
| `dressLight` | `#6c3485` | Cổ áo phủ vai cowl (`collarMat`) | `roughness: 0.80` |
| `sleeve` | `#4b1f62` | Hai ống tay áo loe bo mép | `roughness: 0.82` |
| `cape` | `#331544` | Vỏ áo choàng cong 3D | `roughness: 0.86` |
| `emerald` | `#29f556` | Đá lục bảo cài ngực | Albedo `#0eb834` + `emissiveIntensity: 0.62` |
| `greenPotion` | `#26ff48` | Bình thuốc bên màn hình trái | Albedo `#014e10`, emissive `#00e829` (`0.88`), mặt trên `#058e1c` |
| `purplePotion` | `#cb38ff` | Bình thuốc bên màn hình phải | Albedo `#4a047e`, emissive `#b81eff` (`0.88`), mặt trên `#aa24e6` |
| `cork` | `#b57442` | Nút gỗ đậy miệng 2 bình | `roughness: 0.86` |
| `shoes` | `#462654` | Đôi bốt ngắn bo cạnh | `roughness: 0.76` |

---

## 6. Hệ Thống Chiếu Sáng Scene & Cân Bằng Tone Mapping

Trong [witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/witch.html) và [preview_witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/preview_witch.html):

- **Renderer**: `WebGLRenderer` bật `PCFSoftShadowMap`, `ACESFilmicToneMapping` với `toneMappingExposure = 1.08`.
- **Nền studio**: Nền tối `#181322` kết hợp `FogExp2(0x181322, 0.055)` (trên `witch.html`) và bục tròn `#20192b`.
- **5 nguồn sáng định hướng / môi trường**:
  - `HemisphereLight(0xf3ebff, 0x3b2a4d, 0.85)` tăng độ nảy tím môi trường.
  - `keyLight` `DirectionalLight(0xfff5ec, 1.25)` tại `(-2.2, 4.0, 3.2)` đổ bóng `2048×2048`.
  - `fillLight` `DirectionalLight(0xc2b2e6, 0.72)` tại `(3.0, 2.0, 2.6)`.
  - `frontLight` `DirectionalLight(0xfff1e6, 0.68)` đặt thấp ở `(0, 0.75, 3.8)` giúp khuôn mặt Chibi dưới vành mũ sáng rõ ấm áp.
  - `backRim` `DirectionalLight(0xe5b8ff, 0.88)` tại `(-1.6, 2.2, -2.6)` tạo viền sáng hồng tím mềm dọc một bên mũ và áo choàng.

---

## 7. Tư Thế (Poses) & Hiệu Ứng Twin Alchemy Glow

### 7.1 Hệ Thống 4 Tư Thế (`setPose(poseName)`)
1. `idle`: Hai tay áo buông xuôi tự nhiên `(-0.46, 0, ∓0.58)`; bình thuốc xanh ở `(-0.244, 0.338, 0.078)`, bình tím ở `(+0.244, 0.338, 0.078)`; nhịp thở & nhấp nhô nhẹ theo sóng sine (`update`).
2. `cast`: Nâng hai cánh tay lên cao về phía trước (`rightArmGroup.rotation = (-0.32, 0, -0.32)`, `leftArmGroup` đối xứng) đồng thời xoay bù bình thuốc giữ mặt thoáng chất lỏng luôn thăng bằng nằm ngang; đẩy độ sáng pha chế `poseBoost = 1.28`.
3. `alchemy`: Đưa hai tay cùng hai bình thuốc khép về phía trước trung tâm (`greenPotionGroup` cục bộ `(-0.104, -0.088, 0.158)`, khoảng cách hai bình đo kiểm chứng đạt `0.396` — không va chạm giao cắt); `poseBoost = 1.22`.
4. `t-pose` (chấp nhận cả bí danh `tpose`): Duỗi ngang hai cánh tay vuông góc thân (`|x| = 0.294`), bình thuốc khóa chặt theo lòng bàn tay.

### 7.2 Bộ Điều Khiển Hiệu Ứng (`setEffects(opts)`)
Hỗ trợ 5 tham số độc lập đồng bộ thời gian thực trên UI của [witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/witch.html) và query params của [preview_witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/preview_witch.html):
- `greenGlow` (`boolean`): Bật/tắt toàn bộ emissive, hào quang, PointLight và nhóm hạt phép của bình xanh.
- `purpleGlow` (`boolean`): Bật/tắt độc lập cho bình tím.
- `intensity` (`0.0 .. 1.0`): Thanh trượt điều chỉnh cường độ phát sáng đồng bộ đá lục bảo + 2 bình thuốc.
- `particles` (`boolean`): Hiện/ẩn 12 hạt tinh thể nhỏ gọn `OctahedronGeometry(0.0046, 0)` (`6` hạt xanh + `6` hạt tím) bay xoắn chậm quanh miệng và thân bình.
- `breathe` (`boolean`): Bật/tắt nhịp thở phần đầu/thân và dao động tay tự nhiên trong `update(elapsedTime)`.

---

## 8. API Export & Kiểm Chứng Định Dạng `.GLB` / `.OBJ`

Hàm khởi tạo `createWitchCharacter(customColors = {})` trả về đối tượng thống nhất chuẩn kiến trúc của toàn repo:
- `model`, `group` (alias `ChibiWitch`)
- `parts` (16 nhóm con: `headGroup`, `witchHatGroup`, `torsoGroup`, `dressGroup`, `collarGroup`, `capeGroup`, `emeraldGemGroup`, `rightArmGroup`, `leftArmGroup`, `greenPotionGroup`, `purplePotionGroup`, `rightLegGroup`, `leftLegGroup`, `magicEffectsGroup`, `greenParticleGroup`, `purpleParticleGroup`)
- `materials` (26 vật liệu chuẩn trong bảng `materials`)
- Phương thức: `setColors(newColors)`, `setWireframe(enabled)`, `setPose(poseName)`, `setEffects(opts)`, `update(elapsedTime, options)`, `dispose()`

### Thông số xuất thực tế sau lượt kiểm định cuối:
- **glTF Binary ([witch.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/witch.glb))**:
  - Dung lượng: `355,832` bytes (magic `glTF` version `2`)
  - Tổng cấu trúc: `93` nodes, `58` meshes, `28` materials, đầy đủ 21 tên node chính.
- **Wavefront OBJ ([witch.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/witch.obj))**:
  - Dung lượng: `1,516,413` bytes
  - Hình học: `9,514` vertices, `4,874` faces, `68` object groups, `0` giá trị `NaN`.

---

## 9. Kết Quả Render & Kiểm Định Tự Động

- **Các ảnh render & đối chiếu đã tạo và kiểm tra bằng mắt**:
  - [render_witch_front.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_witch_front.png) (`118,141` bytes)
  - [render_witch_34.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_witch_34.png) (`101,393` bytes)
  - [render_witch_side.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_witch_side.png) (`77,362` bytes)
  - [render_witch_back.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_witch_back.png) (`85,208` bytes)
  - [comparison_witch.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/comparison_witch.png) (`266,728` bytes)
- **Kiểm tra logic & UI tự động (13/13 assertions đạt)**:
  - Xác nhận đầy đủ API, vị trí hai bình đúng bên (`greenX=-0.244, purpleX=0.244`), 4 pose (`idle`, `cast`, `alchemy`, `t-pose`) chuyển đổi không xuyên cắt, bật/tắt độc lập `greenGlow`/`purpleGlow`/`particles`/`breathe`, cập nhật màu động `setColors`, `setWireframe`, giải phóng bộ nhớ `dispose()`, và kiểm tra đủ 5 nút điều hướng nhân vật trên cả `index.html`, `wolf.html`, `seer.html`, `guard.html`, `witch.html`.

