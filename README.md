# Bộ Sưu Tập Mô Hình 3D Three.js Low-Poly Stylized

Dự án tái tạo mô hình 3D phong cách **Stylized Low-Poly** hoàn toàn bằng **Three.js procedural geometry** (custom `BufferGeometry`), flat shading, hỗ trợ xoay 360°, đổi tư thế, hoạt ảnh và xuất file chuẩn 3D (`.GLB`, `.OBJ`).

---

## 🔮 1. Nhân vật Nhà Tiên Tri Seer (Seer Chibi Wizard)
- **Ảnh tham chiếu**: [seer_ref.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/references/seer_ref.png), [seer-head.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/sprites/seer-head.png), [seer-clo.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/sprites/seer-clo.png), [seer-ball.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/sprites/seer-ball.png)
- **Trang tương tác 3D**: [seer.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer.html)
- **Trang đối chiếu 1:1**: [comparison_seer.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/comparison_seer.html)
- **Tệp mã nguồn**: [seer-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/js/seer-model.js)
- **Tệp xuất 3D**:
  - [seer.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/seer.glb) (291 KB — Chuẩn glTF 2.0 Binary, 70 nodes, 44 meshes, sẵn sàng cho Game Engine)
  - [seer.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/seer.obj) (1.23 MB — Wavefront OBJ, 7.828 vertices, 4.966 faces)
- **Ảnh render thực tế**:
  - [render_seer_front.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_seer_front.png) (Mặt trước)
  - [render_seer_closeup_front.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_seer_closeup_front.png) (Cận cảnh đầu mặt trước)
  - [render_seer_closeup_34.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_seer_closeup_34.png) (Cận cảnh đầu góc 3/4)
  - [render_seer_34.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_seer_34.png) (Góc 3/4)
  - [render_seer_side.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_seer_side.png) (Góc nghiêng)
  - [render_seer_back.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_seer_back.png) (Mặt sau)
  - [comparison_seer.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/comparison_seer.png) (Đối chiếu toàn thân 1:1 với ảnh gốc)
  - [comparison_seer_closeup.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/comparison_seer_closeup.png) (Đối chiếu cận cảnh đầu 1:1 với ảnh gốc)
- **Tài liệu hướng dẫn**: [SEER_3D_MASTER_PROMPT_GUIDE.md](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/docs/SEER_3D_MASTER_PROMPT_GUIDE.md)

### Đặc điểm hình học Seer (Head Rework & Collar/Neck Refinement):
1. **Tỉ lệ Chibi cân đối (~0.77m)**: Đầu và mũ trùm đa giác gọn, chóp vòm mềm thanh thoát, cổ lộ nhẹ tự nhiên, vai phủ khăn choàng mở chữ V, eo thắt gọn, tà váy A-line xòe cân đối và đôi giày vuông bo góc lộ nhẹ dưới gấu áo.
2. **Mũ trùm mở khoang sâu hai bên (`buildHoodLoopSection`, `createSeerHoodGeos`)**: Giảm bóp vào vùng hàm (`jawPinch: -0.06` ở vành trước, `rx: 0.132 → 0.150`), đẩy sâu `neckRecede` phía dưới ra sau vai để hai vạt hood rủ tự nhiên xuống áo choàng, tạo khoảng tối có chiều sâu rõ nét ở hai bên mặt và phần trán bên trong khoang `#14061a`.
3. **Khuôn mặt Chibi thu gọn, lộ nhẹ phần cổ & cổ áo V (`createSeerHeadGeo`, `createSeerCollarCavityGeo`)**:
   - Khuôn mặt squircle gọn (`rx = 0.103, ry = 0.092, rz = 0.099`, thu nhẹ gò má và cằm ~9%) tông da đào ấm sáng (`#f6ba96`, `roughness: 0.78`) cùng má hồng nhẹ (`#ef7c92`, `opacity: 0.15`).
   - Phần cổ mượt (`NeckMesh`, `CylinderGeometry` mịn không chia cạnh gắt) lộ nhẹ ngay dưới bóng cằm, nối xuống hốc cổ áo tối chữ V (`createSeerCollarCavityGeo`) và viền khăn choàng mở mềm phía trước (`createSeerMantleGeo`).
   - Tóc mái điêu khắc mềm (`createSeerBangsGeo`) tông tím nâu sẫm (`#361b29`), `hairCapMesh` che kín đỉnh đầu, lọn tóc mai vát mỏng gọn ôm hai bên má, chân mày ngắn mảnh (`#7d4944`, nghiêng `±0.10 rad`) và mắt viên thuốc đứng ít chói (`#150e19`, `roughness: 0.76`).
4. **Áo choàng đa lớp & Đai vàng thắt eo**: Áo choàng ngoài (`#51205c`) xẻ chữ V có nếp gấp lật dày, để lộ lớp áo trong tím orchid sáng hơn (`#7d3484`) và thắt lưng vàng satin (`#d99b2e`) ôm gọn vùng eo thắt, kèm cài áo đá tím đa diện và áo choàng sau lưng hai mặt khép kín (`#391846`) có đèn `backRim` tôn khối góc sau.
5. **Tay áo loe vát gờ, ánh sáng studio & Quả cầu phép Fresnel**: Hai tay sử dụng ống loe đa vòng mượt và bàn tay khum mềm; tay phải nâng quả cầu pha lê 80 mặt (`IcosahedronGeometry` với màu facet thủ công, lõi sáng, điểm lóe, hào quang Fresnel 360° không viền cứng và 6 tia lửa bay xoay, cùng `orbLight` giới hạn tầm ngắn `0.22` tránh ám hồng lên má). Ánh sáng studio cân bằng giữ sắc da đào ấm tự nhiên và viền lưng tím dịu, hỗ trợ 4 tư thế (`idle`, `cast`, `meditate`, `tpose`).

---

## 🐺 2. Nhân vật Người Sói Chibi (Chibi Werewolf Dark Fantasy)
- **Ảnh tham chiếu**: [wolf_ref.jpg](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/references/wolf_ref.jpg)
- **Trang tương tác 3D**: [wolf.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/wolf.html)
- **Trang đối chiếu 1:1**: [comparison_wolf.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/comparison_wolf.html)
- **Tệp mã nguồn**: [wolf-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/js/wolf-model.js)
- **Tệp xuất 3D**:
  - [wolf.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/wolf.glb) (214 KB)
  - [wolf.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/wolf.obj) (573 KB)
- **Ảnh đối chiếu**: [comparison_wolf.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/comparison_wolf.png)
- **Tài liệu hướng dẫn**: [WEREWOLF_FUR_AND_LIGHTING_MASTER_PROMPT.md](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/docs/WEREWOLF_FUR_AND_LIGHTING_MASTER_PROMPT.md)

---

## 🛡️ 3. Nhân vật Hiệp Sĩ Bảo Vệ (Guard / Knight)
- **Ảnh tham chiếu**: [guard_ref.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/references/guard_ref.png)
- **Trang tương tác 3D**: [guard.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/guard.html)
- **Trang đối chiếu 1:1**: [comparison_guard.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/comparison_guard.html)
- **Tệp mã nguồn**: [guard-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/js/guard-model.js)
- **Tệp xuất 3D**:
  - [guard.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/guard.glb) (125 KB — Chuẩn glTF 2.0 Binary, sẵn sàng đưa vào Game Engine)
  - [guard.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/guard.obj) (594 KB — Wavefront OBJ)
- **Ảnh render thực tế**:
  - [render_guard_front.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_guard_front.png) (Mặt trước)
  - [render_guard_34.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_guard_34.png) (Góc 3/4)
  - [render_guard_side.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_guard_side.png) (Góc nghiêng)
  - [render_guard_back.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_guard_back.png) (Mặt sau)
  - [comparison_guard.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/comparison_guard.png) (Đối chiếu 1:1 với ảnh gốc)

### Đặc điểm hình học Guard (Knight):
1. **Mũ giáp chiến binh T-Visor & Gờ sống giữa**:
   - Vòm nón thép (`#8892a0`), đỉnh nón vuốt gờ sống sắc nét (central ridge).
   - Vành che trán nhô ra cùng thanh che mũi thẳng tắp liên kết với hai má giáp che kín hai bên, hở khe T-visor lộ gương mặt chibi.
2. **Khuôn mặt Chibi & Mắt viên thuốc**:
   - Da màu đào tươi sáng (`#f8b79b`), má bầu tròn.
   - Hai mắt đen hình capsule pill, đôi lông mày dốc mạnh mẽ (`#3d281a`).
3. **Giáp ngực thép & Giáp vai bản rộng (Chestplate & Pauldrons)**:
   - Áo giáp thân thép vát mũi nhọn chữ V phong cách low-poly.
   - Giáp vai hai tầng gập góc cứng cáp chìa ra hai bên.
   - Thắt lưng da nâu sẫm (`#452818`) với mặt khóa chữ nhật màu đồng thau ánh kim (`#9a7035`).
   - 4 vạt váy giáp bảo vệ hông (tassets) linh hoạt.
4. **Khiên gỗ tròn viền đinh tán & Núm kim loại có chóp nhọn (Buckler Shield)**:
   - Thân khiên tròn ốp gỗ plank tông nâu ấm (`#935a38`).
   - Viền kim loại bạc dày 14 đinh tán (`rivets`) nổi tròn xung quanh.
   - Núm khiên trung tâm (umbo) bằng thép vát chóp kim tự tháp bảo vệ bàn tay cầm khiên.
5. **Tay & Chân Chibi Hiệp Sĩ**:
   - Tay phải vươn ngang tư thế cảnh giác, cổ tay mang giáp ống bracer thép bọc tay áo len nâu.
   - Chân đi ủng da chiến binh gập 2 tầng (`#5a3924`), đứng vững chắc trên nền tròn đa giác.
6. **Hiệu ứng tia lửa than hồng (Floating Ember Particles)**:
   - Các hạt lửa hình thoi màu hổ phách phát sáng trôi lơ lửng quanh nhân vật mô phỏng ánh lửa trại ban đêm.

---

## 🌸 4. Nhân vật Nữ Chibi (Chibi Girl)
- **Ảnh tham chiếu**: [girl.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/references/girl.png)
- **Trang tương tác 3D**: [index.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/index.html)
- **Trang đối chiếu 1:1**: [comparison.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/comparison.html)
- **Tệp mã nguồn**: [girl-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/js/girl-model.js)
- **Tệp xuất 3D**:
  - [girl.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/girl.glb) (101 KB)
  - [girl.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/girl.obj) (640 KB)
- **Ảnh đối chiếu**: [comparison.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/comparison.png)

---

## 🧙 5. Nhân vật Phù Thủy Độc Dược (Witch Chibi)
- **Ảnh tham chiếu**: [witch_ref.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/references/witch_ref.png), [witch-head.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/sprites/witch-head.png), [witch-save.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/sprites/witch-save.png), [witch-kill.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/sprites/witch-kill.png)
- **Trang tương tác 3D**: [witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/witch.html)
- **Trang đối chiếu 1:1**: [comparison_witch.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/pages/comparison_witch.html)
- **Tệp mã nguồn**: [witch-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/js/witch-model.js)
- **Tệp xuất 3D**:
  - [witch.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/witch.glb) (347 KB / 355,832 bytes — Chuẩn glTF 2.0 Binary)
  - [witch.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/models/witch.obj) (1,481 KB / 1,516,413 bytes — Wavefront OBJ)
- **Ảnh render thực tế**:
  - [render_witch_front.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_witch_front.png) (Mặt trước)
  - [render_witch_34.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_witch_34.png) (Góc 3/4)
  - [render_witch_side.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_witch_side.png) (Góc nghiêng)
  - [render_witch_back.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/render_witch_back.png) (Mặt sau)
  - [comparison_witch.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/assets/renders/comparison_witch.png) (Đối chiếu 1:1 với ảnh gốc)
- **Tài liệu kỹ thuật**: [WITCH_3D_TECH_AND_APPEARANCE.md](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/docs/WITCH_3D_TECH_AND_APPEARANCE.md)

### Đặc điểm hình học & hiệu ứng Witch:
1. **Mũ phù thủy cân đối & Vành cụp nhẹ**: Chóp mũ 14 cạnh uốn cong móc mềm sang phải (`+X`, hạ chiều cao ~20%) kết hợp đai mỏng gọn (`#382226`) và vành mũ bo rìa hơi cụp xuống (`rOuter = 0.318`), không đổ bóng gắt che tối khuôn mặt.
2. **Tóc bob cong C-frame & Khuôn mặt Chibi**: Tóc mái 4 mảng xếp lớp bất đối xứng phủ nhẹ trên lông mày cùng lọn C-bob bo tròn ôm vào cằm (`#4e263f`), gương mặt da đào ấm sáng (`#f6bd9c`), mắt viên thuốc gọn và lông mày mảnh.
3. **Váy chữ A thon, Áo choàng vỏ 3D & Ngọc lục bảo**: Váy 12 mặt thắt eo gọn có nếp gấp dọc, áo choàng cong 3D khép kín xòe cánh phía sau, cổ áo cowl ôm cằm gắn tinh thể lục bảo 8 mặt (`#29f556`).
4. **Twin Alchemy Potions (`#26FF48` & `#CB38FF`)**: Tay áo loe bo mép vát giữ 2 bình thủy tinh trong suốt (`opacity: 0.16`) chứa dung dịch ngang, nút gỗ bần nhỏ gọn, 3 đốm phản chiếu, hào quang Fresnel suy giảm mềm ở rìa và 4 pose (`idle`, `cast`, `alchemy`, `t-pose`).

---

## 📁 Cấu trúc thư mục dự án

```
3D-shape/
├── index.html                   # 🌸 Chibi Girl 3D Viewer (Trang chính)
├── seer.html                    # 🔮 Seer 3D Viewer (Chuẩn UI/UX mẫu)
├── wolf.html                    # 🐺 Werewolf 3D Viewer
├── guard.html                   # 🛡️ Guard (Hiệp Sĩ) 3D Viewer
├── witch.html                   # 🧙 Witch (Phù Thủy Độc Dược) 3D Viewer
├── start.bat                    # Script khởi chạy nhanh máy chủ local
├── README.md                    # Tài liệu tổng quan dự án
├── js/                          # Mã nguồn tạo hình học 3D (Procedural Three.js)
│   ├── girl-model.js
│   ├── seer-model.js
│   ├── wolf-model.js
│   ├── guard-model.js
│   └── witch-model.js
├── pages/                       # Các trang phụ trợ (Đối chiếu 1:1, Preview headless)
│   ├── comparison.html
│   ├── comparison_seer.html
│   ├── comparison_wolf.html
│   ├── comparison_guard.html
│   ├── comparison_witch.html
│   ├── preview.html
│   ├── preview_seer.html
│   ├── preview_wolf.html
│   ├── preview_guard.html
│   ├── preview_witch.html
│   └── measure.html
├── assets/                      # Tài nguyên dự án
│   ├── models/                  # File 3D chuẩn (.glb, .obj)
│   ├── references/              # Ảnh mẫu concept gốc (.png, .jpg)
│   ├── renders/                 # Ảnh render xuất từ Three.js
│   └── sprites/                 # Bộ thẻ bài & phụ kiện 2D gốc
├── libs/                        # Thư viện Three.js ES Modules & addons
├── utils/                       # Tiện ích bổ trợ (TextureUtils)
├── tools/                       # Tool scripts render tự động & trích xuất kích thước
│   ├── render_seer.py
│   ├── render_guard.py
│   ├── render_witch.py
│   ├── capture_hires.py
│   └── ...
└── docs/                        # Tài liệu prompt chuẩn kỹ thuật 3D
    ├── SEER_3D_MASTER_PROMPT_GUIDE.md
    ├── GUARD_3D_TECH_AND_APPEARANCE.md
    └── WITCH_3D_TECH_AND_APPEARANCE.md
```

---

## 🚀 Khởi chạy ứng dụng

### Cách 1: Click file `start.bat` (Nhanh nhất)
Nhấp đúp vào [start.bat](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/start.bat) để mở trực tiếp trong trình duyệt. Có thể chuyển đổi qua lại mượt mà giữa cả 5 nhân vật thông qua thanh chuyển đổi:
- 🌸 **Chibi Girl**
- 🐺 **Werewolf**
- 🔮 **Seer**
- 🛡️ **Guard (Knight)**
- 🧙 **Witch (Phù Thủy)**

### Cách 2: Khởi chạy thủ công
```bash
python -m http.server 8000
```
Sau đó truy cập:
- Phù Thủy Độc Dược (Witch): `http://localhost:8000/witch.html`
- Hiệp Sĩ Bảo Vệ (Guard): `http://localhost:8000/guard.html`
- Seer (Nhà Tiên Tri): `http://localhost:8000/seer.html`
- Người sói (Werewolf): `http://localhost:8000/wolf.html`
- Cô gái Chibi: `http://localhost:8000/index.html`
- Trang so sánh 1:1 Witch: `http://localhost:8000/pages/comparison_witch.html`
- Trang so sánh 1:1 Guard: `http://localhost:8000/pages/comparison_guard.html`
- Trang so sánh 1:1 Seer: `http://localhost:8000/pages/comparison_seer.html`
- Trang so sánh 1:1 Werewolf: `http://localhost:8000/pages/comparison_wolf.html`
- Trang so sánh 1:1 Chibi Girl: `http://localhost:8000/pages/comparison.html`
