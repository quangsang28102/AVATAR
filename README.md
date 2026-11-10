# Bộ Sưu Tập Mô Hình 3D Three.js Low-Poly Stylized

Dự án tái tạo mô hình 3D phong cách **Stylized Low-Poly** hoàn toàn bằng **Three.js procedural geometry** (custom `BufferGeometry`), flat shading, hỗ trợ xoay 360°, đổi tư thế, hoạt ảnh và xuất file chuẩn 3D (`.GLB`, `.OBJ`).

---

## 🔮 1. Nhân vật Nhà Tiên Tri Seer (Seer Chibi Wizard)
- **Ảnh tham chiếu**: [seer_ref.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer_ref.png), [seer-head.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer-head.png), [seer-clo.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer-clo.png), [seer-ball.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer-ball.png)
- **Trang tương tác 3D**: [seer.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer.html)
- **Trang đối chiếu 1:1**: [comparison_seer.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/comparison_seer.html)
- **Tệp mã nguồn**: [seer-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer-model.js)
- **Tệp xuất 3D**:
  - [seer.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer.glb) (95 KB — Chuẩn glTF 2.0 Binary, sẵn sàng cho Game Engine)
  - [seer.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/seer.obj) (249 KB — Wavefront OBJ)
- **Ảnh render thực tế**:
  - [render_seer_front.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/render_seer_front.png) (Mặt trước)
  - [render_seer_34.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/render_seer_34.png) (Góc 3/4)
  - [render_seer_side.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/render_seer_side.png) (Góc nghiêng)
  - [render_seer_back.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/render_seer_back.png) (Mặt sau)
  - [comparison_seer.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/comparison_seer.png) (Đối chiếu 1:1 với ảnh gốc)

### Đặc điểm hình học Seer (Refinement V2 Chuẩn Mẫu 100%):
1. **Tỉ lệ Chibi chuẩn (2.2 Heads Height)**: Tỉ lệ đầu lớn chiếm ~50% chiều cao tổng thể, thân và váy ngắn gọn, gấu áo xòe nhẹ sát đất.
2. **Mũ trùm vòm đa giác (Faceted Dome Hood)**: Vòm mũ tròn gọn với chóp vát low-poly (Y = 0.44), vành mũ uốn cong hình vòm gothic mở rộng bao quanh khuôn mặt, lòng trong mũ tím sẫm (`#1e0c20`) tạo chiều sâu tự nhiên.
3. **Khuôn mặt Chibi tròn đầy & Tóc mái liền khối**:
   - Mặt tròn má bầu bĩnh màu da đào tươi (`#f6b29f`).
   - Tóc mái bằng cắt ngang trán màu tím than sẫm (`#261228`), lọn tóc mai ôm sát má và tai, không để lộ bất kỳ khe hở nào.
   - Hai mắt đen bóng hình viên thuốc đứng (capsule pill 2:1), lông mày ngắn phớt nhẹ, hai má ửng hồng đào dễ thương.
4. **Áo phủ vai & Cài áo Cabochon (Cowl & Brooch Gem)**: Áo phủ vai xếp nếp mềm mại tụ về viên đá ngực hình oval cabochon phát quang hồng tím rực rỡ (`#ea4cff`) lồng trong đài cài tím sẫm.
5. **Thắt lưng vàng ấm (Warm Gold Belt)**: Đai vàng (`#d89d32`) nằm ngang eo thon gọn, tôn dáng A-line của tà áo.
6. **Váy chữ A & Áo choàng xòe rộng (Pleated Robe & Fanned Cape)**:
   - Mặt trước có dải xếp nếp trung tâm hình thang màu tím orchid tươi sáng (`#94388b`), hai bên là nếp áo tím sẫm (`#581e60`).
   - Phía sau là hai vạt áo choàng tím đen (`#2d0e30`) xòe rộng như đôi cánh chạm sát mặt sàn.
7. **Cánh tay chuông & Quả cầu pha lê ngực**:
   - Tay phải gập góc nâng ở tầm ngực, các ngón tay chibi khum nhẹ ôm lấy đáy quả cầu pha lê đa diện 80 mặt (`#c836f6`), bên trong có lõi phát sáng trắng và nguồn sáng điểm tím chiếu lên bàn tay, ngực và má phải.
   - Tay trái buông xuôi 35° tự nhiên, ống tay loe rủ mềm mại, bàn tay nhỏ thò ra ngoài.
   - Hoạt ảnh bay bổng nhịp nhàng (levitation float) theo chu kỳ sóng sine.

---

## 🐺 2. Nhân vật Người Sói Chibi (Chibi Werewolf Dark Fantasy)
- **Ảnh tham chiếu**: [wolf_ref.jpg](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/wolf_ref.jpg)
- **Trang tương tác 3D**: [wolf.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/wolf.html)
- **Trang đối chiếu 1:1**: [comparison_wolf.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/comparison_wolf.html)
- **Tệp mã nguồn**: [wolf-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/wolf-model.js)
- **Tệp xuất 3D**:
  - [wolf.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/wolf.glb) (214 KB)
  - [wolf.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/wolf.obj) (573 KB)
- **Ảnh đối chiếu**: [comparison_wolf.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/comparison_wolf.png)

---

## 🌸 3. Nhân vật Nữ Chibi (Chibi Girl)
- **Ảnh tham chiếu**: [girl.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/girl.png)
- **Trang tương tác 3D**: [index.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/index.html)
- **Trang đối chiếu 1:1**: [comparison.html](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/comparison.html)
- **Tệp mã nguồn**: [girl-model.js](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/girl-model.js)
- **Tệp xuất 3D**:
  - [girl.glb](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/girl.glb) (101 KB)
  - [girl.obj](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/girl.obj) (640 KB)
- **Ảnh đối chiếu**: [comparison.png](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/comparison.png)

---

## 🚀 Khởi chạy ứng dụng

### Cách 1: Click file `start.bat` (Nhanh nhất)
Nhấp đúp vào [start.bat](file:///c:/Users/QuangSang/OneDrive/Desktop/3D-shape/start.bat) để mở trực tiếp trong trình duyệt. Có thể chuyển đổi qua lại mượt mà giữa cả 3 nhân vật thông qua thanh chuyển đổi:
- 🌸 **Chibi Girl**
- 🐺 **Werewolf**
- 🔮 **Seer**

### Cách 2: Khởi chạy thủ công
```bash
python -m http.server 8000
```
Sau đó truy cập:
- Seer (Nhà Tiên Tri): `http://localhost:8000/seer.html`
- Người sói (Werewolf): `http://localhost:8000/wolf.html`
- Cô gái Chibi: `http://localhost:8000/index.html`
- Trang so sánh 1:1 Seer: `http://localhost:8000/comparison_seer.html`
