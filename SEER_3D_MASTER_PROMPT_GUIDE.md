# HƯỚNG DẪN CHUẨN HÓA & MASTER PROMPT TẠO NHÂN VẬT 3D THREE.JS
## (Stylized Low-Poly Chibi Character — Đúc kết từ nhân vật SEER)

---

# MỤC LỤC
1. [PHẦN I: PHÂN TÍCH KỸ THUẬT & BÀI HỌC TỪ SEER (CASE STUDY)](#phần-i-phân-tích-kỹ-thuật--bài-học-từ-seer-case-study)
2. [PHẦN II: TOÀN VĂN PROMPT MẪU ĐẶC TẢ NHÂN VẬT SEER](#phần-ii-toàn-văn-prompt-mẫu-đặc-tả-nhân-vật-seer)
3. [PHẦN III: BỘ KHUNG MASTER PROMPT TÁI SỬ DỤNG CHO MỌI NHÂN VẬT (UNIVERSAL TEMPLATE)](#phần-iii-bộ-khung-master-prompt-tái-sử-dụng-cho-mọi-nhân-vật-universal-template)
4. [PHẦN IV: SỔ TAY KỸ THUẬT THREE.JS & CHECKLIST NGHIỆM THU](#phần-iv-sổ-tay-kỹ-thuật-threejs--checklist-nghiệm-thu)

---

# PHẦN I: PHÂN TÍCH KỸ THUẬT & BÀI HỌC TỪ SEER (CASE STUDY)

Để tạo ra một nhân vật 3D bằng mã nguồn Three.js thuần túy (Procedural Geometry) đạt độ chính xác cao so với concept art 2D, các yếu tố kỹ thuật sau đây đã được chứng minh là then chốt qua quá trình hoàn thiện nhân vật Seer:

---

## 1.1. Ngôn ngữ thẩm mỹ (Aesthetic Language)
* **Phong cách cốt lõi**: **Stylized Low-Poly Faceted Chibi Fantasy**.
* **Đặc trưng mặt phẳng (Facet)**: Mọi khối hình đều được cấu tạo từ các mặt tam giác/tứ giác rõ ràng, có cạnh vát sắc sảo (faceted). Tuyệt đối **không bật smooth shading** trên toàn bộ nhân vật.
* **Chất liệu Matte (Không bóng nhựa)**: Sử dụng `MeshLambertMaterial` hoặc `MeshStandardMaterial` với `roughness = 0.9 - 1.0`, `metalness = 0.0`. Không để vật liệu phản chiếu specular bóng lóa dạng nhựa (plastic toy look).
* **Độ tương phản màu sắc**: Các mảng màu cùng tông (như tím đậm áo choàng, tím hồng tà áo, tím phát sáng quả cầu) phải có sự chênh lệch sắc độ (value contrast) đủ lớn để các facet tự tạo ra chiều sâu mà không cần texture phức tạp.

---

## 1.2. Tỷ lệ vàng nhân vật Chibi ($H = 1$)
Đặt tổng chiều cao nhân vật từ gót chân đến chóp đầu là $H = 1.0$:
* **Tỷ lệ Đầu : Thân**: $1 : 1$ (Vùng đầu + mũ chiếm từ $Y = 0.50$ đến $Y = 1.00$; Vùng thân + áo choàng chiếm từ $Y = 0.00$ đến $Y = 0.50$).
* **Không làm cổ dài**: Đầu gắn trực tiếp vào vai và được che phủ bởi cổ áo/áo choàng mantle.
* **Chi vi áo choàng lớn hơn thân**: Áo choàng ngoài xòe rộng sang hai bên tạo dáng đứng hình tháp vững chãi (Silhouette chữ A), che kín toàn bộ chân, chỉ để lộ mũi giày tối màu sát mặt đất.

---

## 1.3. Cấu trúc Geometry Mở & Rỗng vs Khối Kín (Bài học Mũ Trùm Đầu)
> [!IMPORTANT]
> **Lỗi thường gặp (P0)**: Khi tạo mũ trùm (hood) hoặc nón bảo hộ, developer thường dùng một khối đa diện kín (như Cylinder hay Polyhedron), dẫn đến việc bít hoàn toàn mặt nhân vật hoặc mặt phẳng che mất khuôn mặt.

### Giải pháp kỹ thuật chuẩn:
* **Mũ trùm phải là vỏ rỗng 2 lớp**:
  * `HoodOuterShell`: Vỏ ngoài gồm các mặt đa giác màu tím.
  * `HoodInnerCavity`: Khoang bên trong lùi sâu vào trục Z, tô màu tối (`#1a0826` hoặc `#12041d`) tạo hiệu ứng bóng đổ bí ẩn tự nhiên.
  * **Vành mở phía trước (Front Rim)**: Tạo đường viền vát nhọn hình mũi tên hoặc vòng cung, chừa khoảng trống thực sự trên trục Z để khuôn mặt đặt lọt vào trong.

---

## 1.4. Tạo hình khuôn mặt Chibi
* **Khuôn mặt tối giản**: Khuôn mặt chibi không vẽ mũi hay miệng tả thực. Chỉ gồm:
  * Khối mặt hình hộp vát nhẹ màu da đào (`#fcd3b6` hoặc `#f5c4a5`).
  * **Đôi mắt hạt đậu / oval đứng**: Hai khối nhỏ màu đen tuyền/nâu đậm (`#18121e`), đặt cân đối ở nửa dưới khuôn mặt.
  * **Tóc mái (Bangs)**: Khối tóc phẳng màu đen tím cắt ngang phía trên lông mày để tạo chiều sâu và độ dễ thương.
  * **Má hồng (Blush)**: Hai mặt phẳng nhỏ màu hồng phấn (`#f596aa`) đặt nhẹ hai bên má với độ trong suốt tinh tế.

---

## 1.5. Kỹ thuật Ôm sát Thân Áo (Bài học Đai Vàng & Phụ kiện)
> [!WARNING]
> **Lỗi thường gặp**: Tạo đai lưng hoặc trang sức ngực bằng khối hộp `BoxGeometry` có độ dày (Depth Z) quá lớn, khiến khi nhìn góc nghiêng 3/4 hoặc nhìn từ cạnh bên, chi tiết bị nhô ra như một thanh gỗ/khối bậc thang thô kệch.

### Giải pháp kỹ thuật chuẩn:
* **Làm mỏng triệt để trục Z**: Đai thắt lưng chỉ cần độ dày $Z \approx 0.008$ (so với chiều rộng $X = 0.088$, cao $Y = 0.022$).
* **Khớp độ nghiêng của tà áo**: Áo choàng xòe ra phía trước theo một góc nghiêng, đai lưng phải được xoay cùng góc (`rotation.x = -0.16 rad`) và lùi sát vào bề mặt vải ($Z \approx 0.128$).
* **Không để chi tiết đâm xuyên quá mức**: Phụ kiện chỉ cần nhô cao hơn bề mặt vải từ $0.003$ đến $0.005$ đơn vị để vừa tránh z-fighting, vừa trông như dải ruy băng phẳng mịn.

---

## 1.6. Kỹ thuật Quả cầu Phép Ma thuật Đa lớp (Magic Orb Depth)
> [!TIP]
> Một quả cầu 3D phát sáng phẳng lì (flat emission) sẽ trông giống vòng tròn 2D hoặc bóng đèn đồ chơi. Để có cảm giác quả cầu pha lê ma thuật có ma lực bên trong, cần thiết kế kiến trúc 3 tầng:

1. **Lớp lõi năng lượng bên trong (Inner Core)**: `IcosahedronGeometry(radius * 0.55)`, chất liệu `MeshBasicMaterial` màu trắng tím cực sáng (`#f5d0fe`), phát quang rực rỡ từ tâm.
2. **Lớp vỏ tinh thể đa diện bên ngoài (Outer Faceted Shell)**: `IcosahedronGeometry(radius, detail=1)`, chất liệu `MeshLambertMaterial` màu tím đậm (`#a824e8`), bán trong suốt (`transparent: true, opacity: 0.82`), kích hoạt flat-shading để từng facet khúc xạ ánh sáng theo các hướng khác nhau.
3. **Nguồn sáng & Hào quang (Lighting & Aura)**:
   * Một `THREE.PointLight` màu tím hồng (`#d946ef`, intensity 1.5, distance 0.8) đặt tại tâm quả cầu để chiếu ánh sáng động lên bàn tay, ngực và vành mũ của nhân vật.
   * Vòng hào quang mềm mờ (Glow Sprite/Halo) bao quanh quả cầu.

---

## 1.7. Dáng tay nâng & Tương tác Đạo cụ (Pose Interaction)
* **Tay nâng quả cầu**: Cẳng tay đưa ra trước và hơi chếch sang một bên; cổ tay ngửa lên, các đốt ngón tay hơi khum nhẹ (cupped hand) tạo cảm giác đỡ nâng. Quả cầu nằm lơ lửng nhẹ cách lòng bàn tay một khoảng nhỏ ($0.02 - 0.04 H$).
* **Tay còn lại**: Hạ xuôi tự nhiên theo thân, tay áo rộng bao quanh và để lộ bàn tay nhỏ nhắn.

---

# PHẦN II: TOÀN VĂN PROMPT MẪU ĐẶC TẢ NHÂN VẬT SEER

Bạn có thể sử dụng nguyên văn prompt dưới đây khi cần tái tạo lại Seer hoặc làm mẫu tham khảo chuẩn mực:

```markdown
# PROMPT: THIẾT KẾ & TÁI TẠO 3D NHÂN VẬT SEER TRONG THREE.JS

## I. VAI TRÒ VÀ MỤC TIÊU
Bạn là Senior Three.js Developer, 3D Technical Artist chuyên về Stylized Low-Poly Chibi Character.
Nhiệm vụ: Dựng nhân vật 3D hoàn chỉnh "SEER — Pháp sư Tiên tri Ma thuật Tím" bằng mã nguồn Three.js thuần túy, có thể xoay 360 độ, đổi màu, animate idle và xuất file GLB/OBJ chuẩn game engine.

## II. PHONG CÁCH & TỶ LỆ CHUẨN
- Phong cách: 3D Low-Poly Faceted Chibi Fantasy. Các mặt đa giác rõ nét (flat shading), vát cạnh sắc bén, vật liệu matte không bóng nhựa.
- Tổng chiều cao nhân vật: Chuẩn hóa H = 1.0 (trục Y từ 0.00 đến 1.00).
- Tỷ lệ Chibi:
  * Vùng đầu & mũ trùm: Chiếm từ Y = 0.50 đến Y = 1.00 (~50% chiều cao).
  * Vùng thân & áo choàng: Chiếm từ Y = 0.00 đến Y = 0.50 (~50% chiều cao).
  * Chiều ngang mũ trùm: ~0.45 H.
  * Chiều ngang áo choàng ngoài chân váy: ~0.60 H (dáng chữ A vững chãi, che kín chân).
  * Đường kính quả cầu ma thuật: ~0.18 H.

## III. CHI TIẾT CẤU TRÚC HÌNH KHỐI (GEOMETRY ARCHITECTURE)
1. MŨ TRÙM ĐẦU (HOOD):
   - Không được tạo khối đặc che kín mặt. Mũ phải là khoang rỗng mở rộng phía trước hình vòm nhọn.
   - Vỏ ngoài gồm các diện tam giác tím đậm (#6b21a8). Mặt trong lòng mũ màu tím đen tối (#1a0826) tạo chiều sâu bí ẩn.
2. KHUÔN MẶT CHIBI (FACE):
   - Đặt lọt vào trong khoang mũ tại Y ≈ 0.65, Z ≈ 0.06.
   - Khuôn mặt màu da sáng (#fed7aa), phẳng vát nhẹ.
   - Tóc mái màu tím đen cắt ngang trên trán.
   - Hai mắt hình oval đứng màu đen tuyền (#18181b), không vẽ mũi miệng.
   - Hai má hồng phấn (#f472b6) mờ nhẹ hai bên.
3. TRANG PHỤC NHIỀU TẦNG (ROBE & CAPE):
   - Áo choàng phủ vai (Mantle): Ôm quanh cổ và vai, xếp nếp đa giác màu tím trung (#7e22ce).
   - Viên đá ngực: Hình thoi/kim cương đính chính giữa cổ áo màu tím sáng (#c084fc), viền kim loại tối.
   - Tà áo trước (Front Robe): Vạt áo màu hồng tím (#a21caf) buông thẳng từ ngực xuống gấu áo.
   - Đai lưng vàng (Waist Belt): Đai nhỏ màu vàng mù tạt (#eab308), rộng X = 0.088, cao Y = 0.022, siêu mỏng Z = 0.008, ôm sát xiên theo mặt tà áo (rotation.x = -0.16 rad).
   - Áo choàng ngoài (Outer Cape): Xòe rộng sang hai bên và phía sau màu tím sẫm (#581c87).
4. TAY & QUẢ CẦU PHÉP THUẬT:
   - Tay phải (bên trái ảnh): Giơ ra trước, ống tay áo loe rộng, bàn tay nhỏ ngửa lòng bàn tay hướng lên đỡ lấy quả cầu.
   - Quả cầu ma thuật (Floating Magic Orb):
     * Lơ lửng ngay trên bàn tay tại vị trí X ≈ -0.32, Y ≈ 0.54, Z ≈ 0.18.
     * Cấu trúc 2 tầng: Lõi phát quang trắng tím (#fae8ff) + Vỏ tinh thể đa giác 20 mặt (Icosahedron) màu tím ngọc (#c026d3) có độ trong suốt và bắt sáng facet.
     * Tích hợp PointLight màu tím tím phát sáng hắt lên người nhân vật.
   - Tay trái (bên phải ảnh): Hạ nhẹ tự nhiên bên sườn, tay áo vát chéo để lộ bàn tay nhỏ.

## IV. BẢNG MÀU CHÍNH (HEX COLOR PALETTE)
- Mũ & Áo choàng ngoài: #6b21a8 & #581c87 (Purple Dark)
- Vạt áo trong & Tà trước: #a21caf & #86198f (Magenta Purple)
- Khăn choàng vai: #7e22ce
- Da mặt: #fed7aa (Peach Skin)
- Mắt & Tóc: #18181b (Deep Black Purple)
- Đai lưng: #eab308 (Gold/Mustard)
- Viên đá & Quả cầu: #c084fc, #d946ef, #fae8ff (Arcane Violet & Core Light)

## V. YÊU CẦU MÃ NGUỒN THREE.JS
- Sử dụng hàm tiện ích makeFlat() để biến đổi BufferGeometry sang non-indexed và computeVertexNormals() phẳng cho mọi bộ phận.
- Tổ chức scene dạng cây phân cấp rõ ràng (Root -> BodyGroup, HeadGroup, ArmLeftGroup, ArmRightGroup, CapeGroup, OrbGroup).
- Thiết lập ánh sáng 3 điểm: DirectionalLight chính ấm, DirectionalLight phụ dịu mát, Rim light phía sau tạo viền sáng tím hồng ma thuật.
- Hỗ trợ xuất file GLB (THREE.GLTFExporter) và OBJ (THREE.OBJExporter).
```

---

# PHẦN III: BỘ KHUNG MASTER PROMPT TÁI SỬ DỤNG CHO MỌI NHÂN VẬT (UNIVERSAL TEMPLATE)

Khi bạn muốn tạo một nhân vật mới (ví dụ: Chiến binh Giáp sắt, Cung thủ Yêu tinh, Sát thủ Bóng đêm, Thầy luyện thú...), hãy sao chép mẫu template dưới đây và điền vào các trường `{{...}}`.

```markdown
# PROMPT: THIẾT KẾ NHÂN VẬT 3D THREE.JS — [{{TEN_NHAN_VAT}}]

## I. VAI TRÒ VÀ MỤC TIÊU
Bạn là Senior Three.js Developer, 3D Character Artist & Technical Artist chuyên dựng nhân vật 3D game theo phong cách **Stylized Low-Poly Chibi Fantasy**.
Nhiệm vụ: Dựng hoàn chỉnh nhân vật **[{{TEN_NHAN_VAT}}] — [{{NGHE_NGHIEP_VAI_TRO}}]** bằng geometry 3D thực trong Three.js dựa trên ảnh concept tham chiếu được cung cấp.

Mô hình phải:
- Dựng hoàn toàn bằng geometry code trong Three.js (BufferGeometry / Primitives tinh chỉnh).
- Có cấu trúc phân cấp linh hoạt, sẵn sàng xoay 360°, đổi skin/màu sắc và tạo animation (idle, walk, attack).
- Xuất được file chuẩn GLB và OBJ.

---

## II. PHONG CÁCH VÀ TỶ LỆ TỔNG THỂ

### 2.1. Phong cách hình khối & Vật liệu
- **3D Low-Poly Stylized Faceted**: Mọi khối đều cấu tạo từ các mặt đa giác phẳng rõ nét, góc cạnh dứt khoát.
- **Flat Shading bắt buộc**: Mọi mesh đều sử dụng non-indexed geometry với vertex normals phẳng (`makeFlat()`). Không dùng smooth shading.
- **Vật liệu Matte**: `MeshLambertMaterial` hoặc `MeshStandardMaterial` (`roughness: 0.95`, `metalness: 0.05`). Không bóng nhựa gắt.
- **Ánh sáng**: Hệ thống 3 điểm sáng + 1 Rim Light (ánh sáng viền phía sau) làm nổi bật đường nét hình thể nhân vật trên nền tối.

### 2.2. Bảng tỷ lệ vàng (Quy chuẩn tổng chiều cao H = 1.0)
| Bộ phận | Tỷ lệ mục tiêu | Ghi chú tạo hình |
|---|---|---|
| Chiều cao toàn thân | 1.0 H | Từ đáy chân/đế đến đỉnh đầu/nón |
| Vùng Đầu & Mũ/Nón | 0.45 – 0.50 H | Đầu to đặc trưng Chibi (Y: 0.50 -> 1.00) |
| Chiều ngang Đầu/Mũ | 0.40 – 0.46 H | Rộng ngang cân đối với chiều cao đầu |
| Vùng Thân & Trang phục | 0.40 – 0.45 H | Thân ngắn, gắn liền vai (Y: 0.10 -> 0.50) |
| Chiều dài Chân / Gấu váy | 0.10 – 0.15 H | Chân ngắn hoặc váy dài che kín chân |
| Chiều dài Cánh tay | 0.25 – 0.30 H | Tay ngắn chibi, ống tay rộng |
| Kích thước Vũ khí/Đạo cụ | {{KICH_THUOC_DAO_CU}} | Đạo cụ cầm tay hoặc lơ lửng |

---

## III. ĐẶC ĐIỂM NHẬN DIỆN BẮT BUỘC (TOP 10 MUST-HAVES)
1. {{DAC_DIEM_1}}: [Ví dụ: Tóc / Mũ / Tai thú / Sừng đặc trưng]
2. {{DAC_DIEM_2}}: [Ví dụ: Khuôn mặt chibi tối giản, mắt oval]
3. {{DAC_DIEM_3}}: [Ví dụ: Áo giáp vai / Khăn choàng cổ]
4. {{DAC_DIEM_4}}: [Ví dụ: Áo thân / Giáp ngực]
5. {{DAC_DIEM_5}}: [Ví dụ: Thắt lưng / Dải đai bụng]
6. {{DAC_DIEM_6}}: [Ví dụ: Tà váy / Quần / Giáp chân]
7. {{DAC_DIEM_7}}: [Ví dụ: Tư thế tay trái (cầm vũ khí / nâng bùa)]
8. {{DAC_DIEM_8}}: [Ví dụ: Tư thế tay phải (thả lỏng / cầm khiên)]
9. {{DAC_DIEM_9}}: [Ví dụ: Đạo cụ chính (gậy phép / kiếm / quả cầu / sách)]
10. {{DAC_DIEM_10}}: [Ví dụ: Phụ kiện lưng (áo choàng cape / cánh / balo)]

---

## IV. ĐẶC TẢ CHI TIẾT HÌNH KHỐI (GEOMETRY SPECIFICATION)

### 4.1. Vùng Đầu & Mặt (Head & Face)
- **Cấu trúc nền**: Khối hộp vát đa diện hoặc Cylinder 8-10 cạnh làm gốc khuôn mặt.
- **Khuôn mặt**: Màu da `{{HEX_MAU_DA}}`. Chi tiết gồm 2 mắt oval đứng màu `{{HEX_MAU_MAT}}`. Không làm mũi/miệng realistic.
- **Tóc / Mũ / Nón**:
  - Nếu có mũ/nón: Phải dựng dạng **khoang rỗng mở** (Open Cavity Shell), mặt trong tối màu, không bít kín khuôn mặt.
  - Nếu có tóc: Dựng từng lọn tóc dạng khối chóp đa giác vát nhọn (faceted spikes), xếp lớp tự nhiên.

### 4.2. Vùng Thân & Trang phục (Torso & Armor/Clothing)
- **Thân trên**: Khối hình thang ngược hoặc giáp ngực đa giác.
- **Phụ kiện thắt lưng / Đai eo**:
  * Độ dày trục Z phải cực mỏng ($Z \le 0.010$) để áp sát mặt vải/giáp, tuyệt đối không nhô ra thành gờ hộp dày khi nhìn nghiêng.
  * Xoay góc tilt nhẹ khớp theo độ lài tự nhiên của vạt áo.
- **Thân dưới / Váy / Áo choàng**:
  * Dựng bằng BufferGeometry đa diện hoặc Cylinder xòe chữ A che phủ chân.

### 4.3. Cánh tay & Dáng bàn tay (Arms & Hands)
- Ống tay áo/Giáp tay hình lăng trụ vát thuôn về cổ tay.
- Bàn tay chibi nhỏ hình nêm/hộp vát góc, ngón tay dạng khối đơn giản (stylized mitten/mitten-cut fingers).
- Khớp góc nâng/hạ tay tự nhiên theo tư thế concept art.

### 4.4. Đạo cụ, Vũ khí & Hiệu ứng đặc biệt (Props & VFX)
- {{MO_TA_CHI_TIET_DAO_CU}}
- Nếu là vật thể phát sáng/phép thuật:
  * Kiến trúc tối thiểu 2 lớp (Lõi phát quang Emissive Core + Vỏ tinh thể Faceted Outer Shell).
  * Gắn kèm nguồn sáng PointLight cục bộ cùng tông màu chiếu động lên nhân vật.

---

## V. BẢNG MÀU CHÍNH (COLOR PALETTE & MATERIALS)
| Thành phần | Mã Màu Hex | Loại Material | Tính chất đặc thù |
|---|---|---|---|
| Da mặt / Bàn tay | `{{HEX_DA}}` | `MeshLambertMaterial` | Màu da mềm mại, không specular |
| Trang phục chủ đạo 1 | `{{HEX_MAU_CHINH}}` | `MeshLambertMaterial` | Tông màu nhận diện chính |
| Trang phục phụ / Điểm nhấn | `{{HEX_MAU_PHU}}` | `MeshLambertMaterial` | Tạo độ tương phản sắc độ |
| Chi tiết kim loại / Đai | `{{HEX_KIM_LOAI}}` | `MeshStandardMaterial` | `metalness: 0.3`, `roughness: 0.6` |
| Vũ khí / Đạo cụ | `{{HEX_VU_KHI}}` | `MeshLambertMaterial` | Diện cắt đa giác rõ nét |
| Hiệu ứng phát sáng | `{{HEX_PHAT_SANG}}` | `MeshBasicMaterial` | `emissive` cao, PointLight hỗ trợ |

---

## VI. QUY CHUẨN MÃ NGUỒN THREE.JS & KIỂM TRA CHẤT LƯỢNG

### 6.1. Kiến trúc Code
- Đóng gói toàn bộ nhân vật trong một hàm: `create{{TEN_NHAN_VAT}}Model() -> THREE.Group`.
- Phân tách các `THREE.Group` con:
  * `rootGroup`: Tọa độ gốc tại chân nhân vật (Y = 0).
  * `headGroup`: Đầu, mặt, tóc, mũ/nón.
  * `bodyGroup`: Thân, ngực, áo, đai lưng, chân váy.
  * `armLeftGroup` & `armRightGroup`: Cánh tay, cẳng tay, bàn tay (gốc xoay tại khớp vai).
  * `propGroup`: Vũ khí, đạo cụ, khiên, sách, hiệu ứng.
- Hàm hỗ trợ `makeFlat(geom)`: Ép chuyển đổi non-indexed và tính lại `computeVertexNormals()`.

### 6.2. Kiểm tra chất lượng (Quality Checklist)
- [ ] Không có mặt đen / normals ngược (winding order chuẩn counter-clockwise).
- [ ] Không có hiện tượng chớp nháy đè mặt (Z-fighting).
- [ ] Đai áo và huy hiệu áp sát thân hình, không lồi thô khi nhìn góc nghiêng (Side View).
- [ ] Kiểm tra 4 góc nhìn chuẩn: Front View, 3/4 View, Side View, Back View.
- [ ] Xuất file `{{TEN_FILE}}.glb` và `{{TEN_FILE}}.obj` dung lượng tối ưu (< 1MB).
```

---

# PHẦN IV: SỔ TAY KỸ THUẬT THREE.JS & CHECKLIST NGHIỆM THU

Phần này dành riêng cho Developer và Technical Artist khi trực tiếp viết mã hoặc review sản phẩm 3D.

---

## 4.1. Đoạn mã cốt lõi: Hàm Flat-Shading Chuẩn (`makeFlat`)
Để đảm bảo Three.js không bao giờ làm mịn (smooth) các mặt phẳng của nhân vật low-poly, luôn áp dụng hàm chuyển đổi sau trước khi gán vào `THREE.Mesh`:

```javascript
/**
 * Chuyển đổi BufferGeometry sang dạng non-indexed và tính lại vertex normals.
 * Đảm bảo mỗi tam giác có pháp vector độc lập, tạo nên bề mặt facet sắc cạnh.
 */
function makeFlat(geometry) {
  // Nếu geometry có index, chuyển thành non-indexed để tách rời các đỉnh dùng chung
  const nonIndexed = geometry.toNonIndexed ? geometry.toNonIndexed() : geometry;
  nonIndexed.computeVertexNormals();
  return nonIndexed;
}
```

---

## 4.2. Kỹ thuật Dựng Vành Mũ Trùm Rỗng (Open Hood Geometry)
Thay vì dùng hình khối kín, tạo mũ trùm bằng danh sách đỉnh thủ công (`THREE.BufferGeometry`):

```javascript
// Ví dụ tạo khoang mũ trùm hở mặt phía trước:
const hoodGeo = new THREE.BufferGeometry();
const vertices = [];

// Hàm thêm tam giác đa giác với hướng pháp vector chuẩn
function addTri(p1, p2, p3) {
  vertices.push(...p1, ...p2, ...p3);
}

// 1. Tạo các mặt ngoài bao bọc đỉnh, lưng và hai bên má
// 2. Để trống hoàn toàn mặt trước tại trục Z > 0
// 3. Tạo các mặt viền gấp mép vào trong khoang (inner lining) với màu tối
hoodGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
hoodGeo.computeVertexNormals();
```

---

## 4.3. Thiết lập Scene, Camera & Chiếu sáng Chuẩn Casual Game
Nhân vật stylized chibi trông đẹp nhất với góc nhìn camera ít méo và hệ thống ánh sáng 3 điểm:

```javascript
// 1. Camera FOV thấp (Isometric Feel)
const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.6, 2.4);
camera.lookAt(0, 0.5, 0);

// 2. Hệ thống ánh sáng 3 điểm + Rim Light
// Ambient Light dịu nhẹ giữ cho vùng tối không bị đen kịt
const ambientLight = new THREE.AmbientLight(0x2a1b3d, 1.2);
scene.add(ambientLight);

// Key Light: Ánh sáng chính phía trước bên phải, tông ấm nhẹ
const keyLight = new THREE.DirectionalLight(0xfff1e6, 1.8);
keyLight.position.set(2, 3, 2.5);
keyLight.castShadow = true;
scene.add(keyLight);

// Fill Light: Ánh sáng bù bên trái, tông tím xanh dịu
const fillLight = new THREE.DirectionalLight(0x8b5cf6, 1.0);
fillLight.position.set(-2, 1.5, 1.5);
scene.add(fillLight);

// Rim Light (Back Light): Viền sáng cực quan trọng tạo độ tách biệt khỏi phông nền
const rimLight = new THREE.DirectionalLight(0xf472b6, 2.2);
rimLight.position.set(0, 2, -3);
scene.add(rimLight);
```

---

## 4.4. Checklist Nghiệm thu Theo Mức độ Ưu tiên (P0 - P1 - P2)

Khi so sánh render 3D với concept art 2D, thực hiện kiểm tra theo thứ tự ưu tiên sau:

| Ưu tiên | Hạng mục kiểm tra | Tiêu chuẩn đạt |
|---|---|---|
| **P0 (Bắt buộc)** | **Mặt & Vùng mở của Mũ/Tóc** | Khuôn mặt lộ rõ, nằm lọt trong khoang mũ/tóc; không có đa giác bít kín mặt. |
| **P0 (Bắt buộc)** | **Dáng tay & Đạo cụ chính** | Tay đỡ quả cầu/vũ khí phải đúng bên (trái/phải); bàn tay ngửa hoặc cầm nắm tự nhiên; đạo cụ lơ lửng đúng vị trí. |
| **P1 (Rất quan trọng)** | **Tỷ lệ Chibi 1:1** | Đầu + mũ chiếm ~50% chiều cao; thân hình tháp chữ A vững vàng, che kín chân; không làm người dài/gầy. |
| **P1 (Rất quan trọng)** | **Chiều sâu Hiệu ứng Phép/Vũ khí** | Đạo cụ phát sáng phải có lõi sáng + vỏ đa giác + điểm sáng PointLight hắt sáng, không dùng 1 khối phẳng lì. |
| **P2 (Hoàn thiện)** | **Độ dẹp của Đai lưng & Phụ kiện** | Đai áo và huy hiệu phải mỏng dẹp ($Z \le 0.01$), áp sát tà áo, không lồi thành gờ hộp khi nhìn nghiêng. |
| **P2 (Hoàn thiện)** | **Chi tiết Má hồng & Mắt** | Mắt hạt đậu đen nằm ở nửa dưới mặt; má hồng đặt nhẹ hai bên; tóc mái gọn gàng. |
| **P2 (Hoàn thiện)** | **Export & File Size** | File GLB xuất ra đầy đủ mesh, màu sắc và vật liệu, dung lượng nhẹ (< 500KB), import vào Blender/Godot hoạt động ngay. |

---

# LỜI KẾT
Tài liệu này cung cấp toàn bộ tri thức và kinh nghiệm thực chiến từ quá trình dựng và tinh chỉnh nhân vật Seer. Bạn có thể lưu giữ file này làm tài liệu cẩm nang kỹ thuật cho team, hoặc sao chép **Phần III (Master Prompt Template)** gửi cho AI mỗi khi cần triển khai bất kỳ nhân vật 3D mới nào!

