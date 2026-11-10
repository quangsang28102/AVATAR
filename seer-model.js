import * as THREE from 'three';

// Exact color palette matching reference image (seer_ref.png)
export const SEER_DEFAULT_COLORS = {
  hoodOuter:     '#662879', // Mũ trùm chính (tím hoàng gia low-poly bão hòa chuẩn)
  hoodHighlight: '#7e3590', // Mũ vùng sáng
  hoodShadow:    '#481a54', // Mũ vùng tối
  hoodRim:       '#5c226e', // Viền mép mũ đồng màu vải, đổ bóng tự nhiên
  hoodInner:     '#1c0a1e', // Lòng trong mũ & bóng tối sâu che chở khuôn mặt
  hair:          '#24142b', // Mảng tóc đen tím sẫm trong mũ (mái tóc & hai bên)
  skin:          '#f6b29f', // Da mặt đào chibi tươi tắn mềm mại
  skinHighlight: '#ffd8cc', // Điểm sáng da
  skinShadow:    '#df897d', // Vùng chuyển tiếp da
  blush:         '#ee788e', // Chi tiết má hồng / mảng hồng hai bên má
  eyebrows:      '#98504a', // Lông mày ngắn phớt nhẹ
  eyes:          '#180a16', // Mắt đen bóng oval đứng tối giản (dạng viên thuốc)
  mantle:        '#541e5e', // Áo phủ vai (cowl) tím sẫm
  broochSetting: '#3a1140', // Đài cài áo kim cương tím sẫm
  gem:           '#eb4eff', // Viên đá phép thuật trước ngực (tím hồng sáng vừa)
  gemHighlight:  '#ffd4ff', // Điểm sáng tâm viên đá
  belt:          '#cca038', // Đai vàng đồng dịu ở eo
  innerRobe:     '#94388b', // Vạt giữa áo trong (orchid tím hồng sáng)
  robeDark:      '#561c5e', // Nếp áo tối hai bên
  capeBack:      '#2b0d2d', // Áo choàng ngoài phía sau xòe rộng
  orbColor:      '#c836f6', // Quả cầu phép thuật tím pha lê
  orbCore:       '#ffffff', // Lõi phát sáng trắng bên trong
  shoes:         '#1c0a1a'  // Chân/giày nhỏ tối màu giấu dưới gấu áo
};

// Helper: Ensure crisp faceted low-poly flat shading
export function makeFlat(geo) {
  const nonIndexed = geo.toNonIndexed();
  nonIndexed.computeVertexNormals();
  return nonIndexed;
}

export function createSeerCharacter(customColors = {}) {
  const colors = { ...SEER_DEFAULT_COLORS, ...customColors };
  const seerRoot = new THREE.Group();
  seerRoot.name = "SeerRoot";

  // --- MATERIALS ---
  const hoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hoodOuter),
    roughness: 0.84,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const hoodRimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hoodRim),
    roughness: 0.86,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const hoodInnerMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hoodInner),
    roughness: 0.96,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.skin),
    roughness: 0.72,
    metalness: 0.0,
    flatShading: false
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.hair),
    roughness: 0.85,
    metalness: 0.0,
    flatShading: true
  });

  const blushMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.blush),
    roughness: 0.90,
    metalness: 0.0,
    transparent: true,
    opacity: 0.38,
    depthWrite: false
  });

  const browMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.eyebrows),
    roughness: 0.80,
    metalness: 0.0,
    flatShading: true
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.eyes),
    roughness: 0.10,
    metalness: 0.08,
    flatShading: true
  });

  const mantleMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.mantle),
    roughness: 0.86,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const broochSettingMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.broochSetting),
    roughness: 0.65,
    metalness: 0.15,
    flatShading: true
  });

  const gemMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.gem),
    emissive: new THREE.Color(colors.gem),
    emissiveIntensity: 0.60,
    roughness: 0.10,
    metalness: 0.12,
    flatShading: true
  });

  const beltMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.belt),
    roughness: 0.38,
    metalness: 0.25,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const innerRobeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.innerRobe),
    roughness: 0.84,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const robeDarkMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.robeDark),
    roughness: 0.88,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const capeBackMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.capeBack),
    roughness: 0.92,
    metalness: 0.0,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const orbMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xffffff),
    vertexColors: true,
    emissive: new THREE.Color('#ba1ae0'),
    emissiveIntensity: 0.35,
    roughness: 0.10,
    metalness: 0.10,
    flatShading: true,
    transparent: true,
    opacity: 0.85
  });

  const orbCoreMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0xffffff),
    transparent: true,
    opacity: 0.96
  });

  const shoesMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(colors.shoes),
    roughness: 0.85,
    metalness: 0.0,
    flatShading: true
  });

  // Master BodyRoot
  const bodyRoot = new THREE.Group();
  bodyRoot.name = "BodyRoot";
  seerRoot.add(bodyRoot);

  // ==========================================
  // 1. SHOES (Chân nhỏ giấu gần hết dưới gấu áo - P2)
  // ==========================================
  const shoesGroup = new THREE.Group();
  shoesGroup.name = "Shoes";

  const shoeGeo = makeFlat(new THREE.BoxGeometry(0.050, 0.018, 0.055));
  const lShoe = new THREE.Mesh(shoeGeo, shoesMat);
  lShoe.position.set(-0.060, 0.009, 0.105);
  lShoe.castShadow = true;
  shoesGroup.add(lShoe);

  const rShoe = new THREE.Mesh(shoeGeo.clone(), shoesMat);
  rShoe.position.set(0.060, 0.009, 0.105);
  rShoe.castShadow = true;
  shoesGroup.add(rShoe);

  bodyRoot.add(shoesGroup);

  // ==========================================
  // 2. ROBE & SKIRT (Chibi A-line Trapezoid)
  // - Gấu áo hạ thấp (Y = 0.022) để che kín chân
  // - Vạt trung tâm tím hồng sáng, hai bên tím đậm
  // ==========================================
  const robeGroup = new THREE.Group();
  robeGroup.name = "RobeGroup";
  bodyRoot.add(robeGroup);

  const rv = {
    // Hem (Y = 0.022)
    hemMidFront:   [ 0.00,  0.022,  0.205],
    hemFrontL:     [-0.11,  0.022,  0.190],
    hemFrontR:     [ 0.11,  0.022,  0.190],
    hemSideL:      [-0.245, 0.022,  0.07 ],
    hemSideR:      [ 0.245, 0.022,  0.07 ],
    hemBackL:      [-0.18,  0.022, -0.14 ],
    hemBackR:      [ 0.18,  0.022, -0.14 ],
    hemMidBack:    [ 0.00,  0.022, -0.16 ],

    // Waist (Y = 0.45)
    wMidFront:     [ 0.00,  0.45,   0.125],
    wFrontL:       [-0.065, 0.45,   0.115],
    wFrontR:       [ 0.065, 0.45,   0.115],
    wSideL:        [-0.125, 0.45,   0.035],
    wSideR:        [ 0.125, 0.45,   0.035],
    wBackL:        [-0.095, 0.45,  -0.08 ],
    wBackR:        [ 0.095, 0.45,  -0.08 ],
    wMidBack:      [ 0.00,  0.45,  -0.09 ],

    // Chest / Under Mantle (Y = 0.63)
    cMidFront:     [ 0.00,  0.63,   0.13 ],
    cFrontL:       [-0.075, 0.63,   0.12 ],
    cFrontR:       [ 0.075, 0.63,   0.12 ],
    cSideL:        [-0.135, 0.63,   0.045],
    cSideR:        [ 0.135, 0.63,   0.045],
    cBackL:        [-0.105, 0.63,  -0.085],
    cBackR:        [ 0.105, 0.63,  -0.085],
    cMidBack:      [ 0.00,  0.63,  -0.095]
  };

  const robeGeo = new THREE.BufferGeometry();
  const rTris = [];
  function addRTri(a, b, c) { rTris.push(...a, ...b, ...c); }
  function addRQuad(a, b, c, d) { addRTri(a, b, c); addRTri(a, c, d); }

  // Skirt Sides & Back (Dark purple)
  addRQuad(rv.wFrontL, rv.hemFrontL, rv.hemSideL, rv.wSideL);
  addRQuad(rv.wSideR, rv.hemSideR, rv.hemFrontR, rv.wFrontR);
  addRQuad(rv.wSideL, rv.hemSideL, rv.hemBackL, rv.wBackL);
  addRQuad(rv.wBackR, rv.hemBackR, rv.hemSideR, rv.wSideR);
  addRQuad(rv.wBackL, rv.hemBackL, rv.hemMidBack, rv.wMidBack);
  addRQuad(rv.wMidBack, rv.hemMidBack, rv.hemBackR, rv.wBackR);

  // Upper Torso under mantle
  addRQuad(rv.cFrontL, rv.wFrontL, rv.wSideL, rv.cSideL);
  addRQuad(rv.cSideR, rv.wSideR, rv.wFrontR, rv.cFrontR);
  addRQuad(rv.cSideL, rv.wSideL, rv.wBackL, rv.cBackL);
  addRQuad(rv.cBackR, rv.wBackR, rv.wSideR, rv.cSideR);
  addRQuad(rv.cBackL, rv.wBackL, rv.wMidBack, rv.cMidBack);
  addRQuad(rv.cMidBack, rv.wMidBack, rv.wBackR, rv.cBackR);

  robeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rTris), 3));
  robeGeo.computeVertexNormals();
  const robeMesh = new THREE.Mesh(robeGeo, robeDarkMat);
  robeMesh.castShadow = true;
  robeMesh.receiveShadow = true;
  robeGroup.add(robeMesh);

  // Front-Center Pleat (Bright Orchid Magenta)
  const centerGeo = new THREE.BufferGeometry();
  const cTris = [];
  function addCTri(a, b, c) { cTris.push(...a, ...b, ...c); }
  function addCQuad(a, b, c, d) { addCTri(a, b, c); addCTri(a, c, d); }

  addCQuad(rv.wFrontL, rv.wMidFront, rv.hemMidFront, rv.hemFrontL);
  addCQuad(rv.wMidFront, rv.wFrontR, rv.hemFrontR, rv.hemMidFront);
  addCQuad(rv.cFrontL, rv.cMidFront, rv.wMidFront, rv.wFrontL);
  addCQuad(rv.cMidFront, rv.cFrontR, rv.wFrontR, rv.wMidFront);

  centerGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cTris), 3));
  centerGeo.computeVertexNormals();
  const centerMesh = new THREE.Mesh(centerGeo, innerRobeMat);
  centerMesh.castShadow = true;
  robeGroup.add(centerMesh);

  // ==========================================
  // 3. GOLD WAIST BELT (Đai vàng mảnh, ngắn hơn, bị che 2 bên - P2)
  // ==========================================
  const beltGroup = new THREE.Group();
  beltGroup.name = "WaistBelt";

  // Đai vàng mảnh gọn chuẩn ảnh mẫu (rộng X = 0.088, cao Y = 0.022, mỏng dẹt áp sát thân Z = 0.008)
  const beltGeo = makeFlat(new THREE.BoxGeometry(0.088, 0.022, 0.008));
  const beltMesh = new THREE.Mesh(beltGeo, beltMat);
  beltMesh.position.set(0, 0.448, 0.128);
  beltMesh.rotation.x = -0.16;
  beltMesh.castShadow = true;
  beltGroup.add(beltMesh);

  bodyRoot.add(beltGroup);

  // ==========================================
  // 4. OUTER CAPE (Áo choàng ngoài xòe rộng 2 bên)
  // ==========================================
  const capeGroup = new THREE.Group();
  capeGroup.name = "CapeGroup";

  const capeGeo = new THREE.BufferGeometry();
  const capTris = [];
  function addCapTri(a, b, c) { capTris.push(...a, ...b, ...c); }
  function addCapQuad(a, b, c, d) { addCapTri(a, b, c); addCapTri(a, c, d); }

  const capv = {
    // Shoulder anchor (Y = 0.66)
    shL:      [-0.19, 0.66, -0.04],
    shR:      [ 0.19, 0.66, -0.04],
    shMid:    [ 0.00, 0.66, -0.12],

    // Mid waist spread (Y = 0.36)
    midL:     [-0.30, 0.36, -0.05],
    midR:     [ 0.30, 0.36, -0.05],
    midBack:  [ 0.00, 0.36, -0.18],

    // Hem spread (Y = 0.022)
    hemL:     [-0.35, 0.022, -0.07],
    hemR:     [ 0.35, 0.022, -0.07],
    hemBackL: [-0.18, 0.022, -0.20],
    hemBackR: [ 0.18, 0.022, -0.20],
    hemMid:   [ 0.00, 0.022, -0.22]
  };

  addCapQuad(capv.shL, capv.shMid, capv.midBack, capv.midL);
  addCapQuad(capv.shMid, capv.shR, capv.midR, capv.midBack);
  addCapQuad(capv.midL, capv.midBack, capv.hemBackL, capv.hemL);
  addCapQuad(capv.midBack, capv.hemBackL, capv.hemMid, capv.midBack);
  addCapQuad(capv.midBack, capv.midR, capv.hemR, capv.hemBackR);
  addCapQuad(capv.midBack, capv.hemBackR, capv.hemMid, capv.midBack);

  capeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(capTris), 3));
  capeGeo.computeVertexNormals();
  const capeMesh = new THREE.Mesh(capeGeo, capeBackMat);
  capeMesh.castShadow = true;
  capeGroup.add(capeMesh);
  bodyRoot.add(capeGroup);

  // ==========================================
  // 5. SHOULDER MANTLE / COWL & DIAMOND BROOCH (P2)
  // ==========================================
  const mantleGroup = new THREE.Group();
  mantleGroup.name = "ShoulderMantle";

  const mantleGeo = new THREE.BufferGeometry();
  const mTris = [];
  function addMTri(a, b, c) { mTris.push(...a, ...b, ...c); }
  function addMQuad(a, b, c, d) { addMTri(a, b, c); addMTri(a, c, d); }

  const mv = {
    // Neck collar ring (Y = 0.70)
    neckCenter: [ 0.00, 0.64,  0.185],
    neckFrontL: [-0.12, 0.68,  0.155],
    neckFrontR: [ 0.12, 0.68,  0.155],
    neckSideL:  [-0.20, 0.68,  0.05 ],
    neckSideR:  [ 0.20, 0.68,  0.05 ],
    neckBackL:  [-0.15, 0.68, -0.10 ],
    neckBackR:  [ 0.15, 0.68, -0.10 ],
    neckMidBack:[ 0.00, 0.68, -0.13 ],

    // Mantle draped lower edge (Y = 0.56 - 0.60)
    gemNode:    [ 0.00, 0.58,  0.195],
    drapeFrontL:[-0.14, 0.57,  0.165],
    drapeFrontR:[ 0.14, 0.57,  0.165],
    drapeSideL: [-0.24, 0.55,  0.05 ],
    drapeSideR: [ 0.24, 0.55,  0.05 ],
    drapeBackL: [-0.17, 0.55, -0.11 ],
    drapeBackR: [ 0.17, 0.55, -0.11 ],
    drapeMidBack:[0.00, 0.55, -0.14 ]
  };

  addMQuad(mv.neckFrontL, mv.neckCenter, mv.gemNode, mv.drapeFrontL);
  addMQuad(mv.neckCenter, mv.neckFrontR, mv.drapeFrontR, mv.gemNode);
  addMQuad(mv.neckSideL, mv.neckFrontL, mv.drapeFrontL, mv.drapeSideL);
  addMQuad(mv.neckFrontR, mv.neckSideR, mv.drapeSideR, mv.drapeFrontR);
  addMQuad(mv.neckBackL, mv.neckSideL, mv.drapeSideL, mv.drapeBackL);
  addMQuad(mv.neckSideR, mv.neckBackR, mv.drapeBackR, mv.drapeSideR);
  addMQuad(mv.neckMidBack, mv.neckBackL, mv.drapeBackL, mv.drapeMidBack);
  addMQuad(mv.neckBackR, mv.neckMidBack, mv.drapeMidBack, mv.drapeBackR);

  mantleGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mTris), 3));
  mantleGeo.computeVertexNormals();
  const mantleMesh = new THREE.Mesh(mantleGeo, mantleMat);
  mantleMesh.castShadow = true;
  mantleGroup.add(mantleMesh);

  // Small Diamond Gem Brooch (Section 9: Hình kim cương nhỏ, tím hồng sáng vừa, đài cài gọn)
  const broochGroup = new THREE.Group();
  broochGroup.name = "BroochGroup";
  broochGroup.position.set(0, 0.612, 0.198);

  // Slim 4-point Diamond Setting Bezel
  const bezelGeo = new THREE.BufferGeometry();
  const bv = [
     0.00,  0.026, 0.00, // Top
     0.021, 0.00,  0.00, // Right
     0.00, -0.026, 0.00, // Bottom
    -0.021, 0.00,  0.00, // Left
     0.00,  0.00, -0.010 // Back
  ];
  const bIndices = [
    0, 1, 4,  1, 2, 4,  2, 3, 4,  3, 0, 4
  ];
  bezelGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bv), 3));
  bezelGeo.setIndex(bIndices);
  const bezelMesh = new THREE.Mesh(makeFlat(bezelGeo), broochSettingMat);
  broochGroup.add(bezelMesh);

  // 3D Rhombus Diamond Gem
  const gemGeo = new THREE.BufferGeometry();
  const gv = [
     0.00,  0.00,  0.018, // Center apex
     0.00,  0.021, 0.004, // Top
     0.017, 0.00,  0.004, // Right
     0.00, -0.021, 0.004, // Bottom
    -0.017, 0.00,  0.004, // Left
     0.00,  0.00, -0.007  // Back
  ];
  const gIndices = [
    0, 1, 2,  0, 2, 3,  0, 3, 4,  0, 4, 1,
    5, 2, 1,  5, 3, 2,  5, 4, 3,  5, 1, 4
  ];
  gemGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gv), 3));
  gemGeo.setIndex(gIndices);
  const gemMesh = new THREE.Mesh(makeFlat(gemGeo), gemMat);
  gemMesh.castShadow = true;
  broochGroup.add(gemMesh);

  mantleGroup.add(broochGroup);
  bodyRoot.add(mantleGroup);

  // ==========================================
  // 6. HEAD & HOOD (Khôi phục mảng tóc sẫm trong mũ & chi tiết má hồng 2 bên)
  // ==========================================
  const headPivot = new THREE.Group();
  headPivot.name = "HeadPivot";
  headPivot.position.set(0, 0.68, 0.02);
  bodyRoot.add(headPivot);

  // --- 6A. Cute Chibi Face, Hair & Blush ---
  const faceGroup = new THREE.Group();
  faceGroup.name = 'FaceGroup';
  faceGroup.position.set(0, 0.10, 0.04);

  // 1. Single Seamless Chibi Peach Face (Má đầy tròn đáng yêu, smooth shading)
  const faceGeo = new THREE.CylinderGeometry(0.134, 0.120, 0.165, 32);
  faceGeo.scale(1.10, 0.95, 0.82);
  faceGeo.computeVertexNormals();
  const faceMesh = new THREE.Mesh(faceGeo, skinMat);
  faceMesh.position.set(0, -0.016, 0.035);
  faceMesh.castShadow = false;
  faceMesh.receiveShadow = false;
  faceGroup.add(faceMesh);

  // 2. Mảng tóc sẫm trên đỉnh đầu & lòng trong mũ (Solid Hair Cap)
  const hairCapGeo = new THREE.CylinderGeometry(0.140, 0.140, 0.150, 32);
  hairCapGeo.scale(1.12, 0.96, 0.86);
  hairCapGeo.computeVertexNormals();
  const hairCapMesh = new THREE.Mesh(hairCapGeo, hairMat);
  hairCapMesh.position.set(0, 0.090, 0.025);
  faceGroup.add(hairCapMesh);

  // 3. Mái tóc sẫm ngang trán (Watertight Solid Bangs Visor)
  // Khối hình trụ đặc ôm sát trán, mép ngang phẳng chuẩn mực theo ảnh mẫu
  const bangsGeo = new THREE.CylinderGeometry(
    0.144, // radiusTop
    0.148, // radiusBottom
    0.084, // height
    32,    // radialSegments
    1,     // heightSegments
    false, // openEnded: false -> đóng kín đáy và nắp phẳng tuyệt đối
    -Math.PI * 0.42, // thetaStart (~-75 deg)
    Math.PI * 0.84   // thetaLength (~150 deg)
  );
  bangsGeo.scale(1.12, 1.0, 0.86);
  bangsGeo.computeVertexNormals();

  const bangsMesh = new THREE.Mesh(bangsGeo, hairMat);
  // Y = 0.106 -> mép cắt ngang phẳng tuyệt đối tại Y = 0.106 - 0.042 = 0.064
  bangsMesh.position.set(0, 0.106, 0.035);
  bangsMesh.castShadow = false;
  bangsMesh.receiveShadow = false;
  faceGroup.add(bangsMesh);

  // 4. Mảng tóc hai bên ôm má (Side Hair Locks ôm sát vành má)
  const sideHairGeo = new THREE.BoxGeometry(0.034, 0.088, 0.072);
  sideHairGeo.computeVertexNormals();

  const lSideHair = new THREE.Mesh(sideHairGeo, hairMat);
  lSideHair.position.set(-0.128, 0.015, 0.086);
  lSideHair.rotation.y = 0.20;
  faceGroup.add(lSideHair);

  const rSideHair = new THREE.Mesh(sideHairGeo.clone(), hairMat);
  rSideHair.position.set(0.128, 0.015, 0.086);
  rSideHair.rotation.y = -0.20;
  faceGroup.add(rSideHair);

  // 5. Lông mày ngắn phớt nhẹ (ngay dưới mép mái tóc, khoảng cách trán thoáng đãng)
  const browGeo = new THREE.BoxGeometry(0.030, 0.005, 0.006);
  browGeo.computeVertexNormals();
  const lBrow = new THREE.Mesh(browGeo, browMat);
  lBrow.position.set(-0.058, 0.025, 0.144);
  lBrow.rotation.z = -0.08;
  faceGroup.add(lBrow);

  const rBrow = new THREE.Mesh(browGeo.clone(), browMat);
  rBrow.position.set(0.058, 0.025, 0.144);
  rBrow.rotation.z = 0.08;
  faceGroup.add(rBrow);

  // 6. Hai mắt oval đứng nhỏ tối giản (dạng viên thuốc đen bóng)
  const eyeLGeo = new THREE.CylinderGeometry(0.013, 0.013, 0.042, 16);
  eyeLGeo.scale(0.85, 1, 0.50);
  eyeLGeo.computeVertexNormals();
  const eyeL = new THREE.Mesh(eyeLGeo, eyeMat);
  eyeL.position.set(-0.058, -0.016, 0.142);
  faceGroup.add(eyeL);

  const eyeR = new THREE.Mesh(eyeLGeo.clone(), eyeMat);
  eyeR.position.set(0.058, -0.016, 0.142);
  faceGroup.add(eyeR);

  // 7. Chi tiết má hồng / mảng hồng hai bên má (Rosy Cheek Blush mềm mại, ửng hồng tự nhiên)
  const blushGeo = new THREE.SphereGeometry(0.016, 16, 8);
  blushGeo.scale(1.25, 0.70, 0.15);
  blushGeo.computeVertexNormals();

  const blushL = new THREE.Mesh(blushGeo, blushMat);
  blushL.position.set(-0.090, -0.024, 0.129);
  blushL.rotation.y = 0.26;
  faceGroup.add(blushL);

  const blushR = new THREE.Mesh(blushGeo.clone(), blushMat);
  blushR.position.set(0.090, -0.024, 0.129);
  blushR.rotation.y = -0.26;
  faceGroup.add(blushR);

  headPivot.add(faceGroup);

  // --- 6B. Faceted Dome Hood (Vòm mũ tròn mềm, viền chữ V mượt) ---
  const hoodGroup = new THREE.Group();
  hoodGroup.name = "HoodGroup";

  const hv = {
    // Dome Crown (Y = 0.44)
    peakTop:      [ 0.00,  0.44,  0.02 ],
    peakFrontTop: [ 0.00,  0.35,  0.15 ],
    peakBackTop:  [ 0.00,  0.35, -0.16 ],
    peakL:        [-0.19,  0.33,  0.03 ],
    peakR:        [ 0.19,  0.33,  0.03 ],

    // Outer Rim of Face Opening
    rimApex:      [ 0.00,  0.27,  0.21 ],
    rimBrowL:     [-0.14,  0.22,  0.190],
    rimBrowR:     [ 0.14,  0.22,  0.190],
    rimCheekL:    [-0.25,  0.10,  0.150],
    rimCheekR:    [ 0.25,  0.10,  0.150],
    rimJawL:      [-0.16, -0.05,  0.170],
    rimJawR:      [ 0.16, -0.05,  0.170],
    rimChin:      [ 0.00, -0.07,  0.180],

    // Inner Rim (Recessed by ~0.025 in Z)
    inApex:       [ 0.00,  0.25,  0.185],
    inBrowL:      [-0.12,  0.20,  0.165],
    inBrowR:      [ 0.12,  0.20,  0.165],
    inCheekL:     [-0.22,  0.09,  0.125],
    inCheekR:     [ 0.22,  0.09,  0.125],
    inJawL:       [-0.14, -0.04,  0.145],
    inJawR:       [ 0.14, -0.04,  0.145],
    inChin:       [ 0.00, -0.06,  0.155],

    // Hood Sides & Back
    midCheekL:    [-0.27,  0.15,  0.02 ],
    midCheekR:    [ 0.27,  0.15,  0.02 ],
    backMid:      [ 0.00,  0.15, -0.20 ],
    backL:        [-0.20,  0.14, -0.15 ],
    backR:        [ 0.20,  0.14, -0.15 ],
    napeMid:      [ 0.00, -0.07, -0.16 ],
    napeL:        [-0.15, -0.07, -0.12 ],
    napeR:        [ 0.15, -0.07, -0.12 ]
  };

  // 1. Hood Outer Shell
  const hoodShellGeo = new THREE.BufferGeometry();
  const sTris = [];
  function addSTri(a, b, c) { sTris.push(...a, ...b, ...c); }
  function addSQuad(a, b, c, d) { addSTri(a, b, c); addSTri(a, c, d); }

  // Crown facets
  addSTri(hv.peakTop, hv.peakFrontTop, hv.peakL);
  addSTri(hv.peakTop, hv.peakR, hv.peakFrontTop);
  addSTri(hv.peakTop, hv.peakL, hv.peakBackTop);
  addSTri(hv.peakTop, hv.peakBackTop, hv.peakR);

  // Forehead slope to rim
  addSQuad(hv.peakFrontTop, hv.rimApex, hv.rimBrowL, hv.peakL);
  addSQuad(hv.peakFrontTop, hv.peakR, hv.rimBrowR, hv.rimApex);

  // Temples & cheek slopes to rim
  addSQuad(hv.peakL, hv.rimBrowL, hv.rimCheekL, hv.midCheekL);
  addSQuad(hv.peakR, hv.midCheekR, hv.rimCheekR, hv.rimBrowR);

  // Lower cheeks & jaw to rim
  addSQuad(hv.midCheekL, hv.rimCheekL, hv.rimJawL, hv.napeL);
  addSQuad(hv.midCheekR, hv.napeR, hv.rimJawR, hv.rimCheekR);

  // Under chin to nape
  addSQuad(hv.rimJawL, hv.rimChin, hv.napeMid, hv.napeL);
  addSQuad(hv.rimChin, hv.rimJawR, hv.napeR, hv.napeMid);

  // Back of hood
  addSQuad(hv.peakL, hv.midCheekL, hv.backL, hv.peakBackTop);
  addSQuad(hv.peakR, hv.peakBackTop, hv.backR, hv.midCheekR);
  addSQuad(hv.midCheekL, hv.napeL, hv.backMid, hv.backL);
  addSQuad(hv.midCheekR, hv.backR, hv.backMid, hv.napeR);
  addSTri(hv.peakBackTop, hv.backL, hv.backMid);
  addSTri(hv.peakBackTop, hv.backMid, hv.backR);
  addSTri(hv.backMid, hv.napeL, hv.napeMid);
  addSTri(hv.backMid, hv.napeMid, hv.napeR);

  hoodShellGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sTris), 3));
  hoodShellGeo.computeVertexNormals();
  const hoodShellMesh = new THREE.Mesh(hoodShellGeo, hoodMat);
  hoodShellMesh.castShadow = true;
  hoodShellMesh.receiveShadow = true;
  hoodGroup.add(hoodShellMesh);

  // 2. Hood Front Rim (3D Lip Rim)
  const lipGeo = new THREE.BufferGeometry();
  const lipTris = [];
  function addLTri(a, b, c) { lipTris.push(...a, ...b, ...c); }
  function addLQuad(a, b, c, d) { addLTri(a, b, c); addLTri(a, c, d); }

  addLQuad(hv.rimApex, hv.rimBrowL, hv.inBrowL, hv.inApex);
  addLQuad(hv.rimBrowL, hv.rimCheekL, hv.inCheekL, hv.inBrowL);
  addLQuad(hv.rimCheekL, hv.rimJawL, hv.inJawL, hv.inCheekL);
  addLQuad(hv.rimJawL, hv.rimChin, hv.inChin, hv.inJawL);
  addLQuad(hv.rimChin, hv.rimJawR, hv.inJawR, hv.inChin);
  addLQuad(hv.rimJawR, hv.rimCheekR, hv.inCheekR, hv.inJawR);
  addLQuad(hv.rimCheekR, hv.rimBrowR, hv.inBrowR, hv.inCheekR);
  addLQuad(hv.rimBrowR, hv.rimApex, hv.inApex, hv.inBrowR);

  lipGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lipTris), 3));
  lipGeo.computeVertexNormals();
  const lipMesh = new THREE.Mesh(lipGeo, hoodRimMat);
  lipMesh.castShadow = true;
  hoodGroup.add(lipMesh);

  // 3. Hood Inner Cavity (Lòng trong mũ sâu tối bao trùm sau đầu)
  const cavityGeo = new THREE.BufferGeometry();
  const cavTris = [];
  function addCT(a, b, c) { cavTris.push(...a, ...b, ...c); }

  const cavBack = [ 0.00, 0.12, -0.06 ];
  addCT(hv.inApex, hv.inBrowL, cavBack);
  addCT(hv.inBrowL, hv.inCheekL, cavBack);
  addCT(hv.inCheekL, hv.inJawL, cavBack);
  addCT(hv.inJawL, hv.inChin, cavBack);
  addCT(hv.inChin, hv.inJawR, cavBack);
  addCT(hv.inJawR, hv.inCheekR, cavBack);
  addCT(hv.inCheekR, hv.inBrowR, cavBack);
  addCT(hv.inBrowR, hv.inApex, cavBack);

  cavityGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cavTris), 3));
  cavityGeo.computeVertexNormals();
  const cavityMesh = new THREE.Mesh(cavityGeo, hoodInnerMat);
  hoodGroup.add(cavityMesh);

  headPivot.add(hoodGroup);

  // ==========================================
  // 7. ARMS & SLEEVES & HANDS (P0: Tay nâng quả cầu & Tay còn lại)
  // ==========================================

  // --- 7A. Right Arm (Viewer's Left - Nâng Quả Cầu) ---
  // Kinematics chính xác:
  // - Vai: (-0.13, 0.59, 0.04)
  // - Khuỷu tay: (-0.19, 0.52, 0.09)
  // - Cổ tay / Bàn tay: (-0.245, 0.510, 0.225)
  // - LÒNG BÀN TAY NGỬA THẲNG LÊN (+Y thế giới) ngay DƯỚI quả cầu
  const armRightPivot = new THREE.Group();
  armRightPivot.name = "ArmRightPivot";
  armRightPivot.position.set(-0.13, 0.59, 0.04);
  // Góc quay vai khớp vector từ vai đến khuỷu tay
  armRightPivot.rotation.set(-2.191, 0.609, 2.466);

  const upperLen = 0.105;
  const rUpperArmGeo = makeFlat(new THREE.CylinderGeometry(0.046, 0.058, upperLen, 6));
  rUpperArmGeo.rotateX(Math.PI * 0.5);
  const rUpperArm = new THREE.Mesh(rUpperArmGeo, mantleMat);
  rUpperArm.position.set(0, 0, -upperLen * 0.5);
  armRightPivot.add(rUpperArm);

  // Elbow Pivot & Forearm (Gập tự nhiên, vươn thẳng tới dưới đáy quả cầu)
  const rForearmGroup = new THREE.Group();
  rForearmGroup.name = "RightForearm";
  rForearmGroup.position.set(0, 0, -upperLen);
  // Góc quay cẳng tay để vươn thẳng tới vị trí (-0.245, 0.510, 0.225)
  rForearmGroup.rotation.set(0.653, 0.488, 0.036);

  // Flared Bell Sleeve (Dừng sớm ở Z = -0.095 để lộ trọn vẹn bàn tay và cổ tay)
  const sleeveLen = 0.095;
  const rSleeveGeo = makeFlat(new THREE.CylinderGeometry(0.088, 0.052, sleeveLen, 6));
  rSleeveGeo.rotateX(Math.PI * 0.5);
  const rSleeve = new THREE.Mesh(rSleeveGeo, mantleMat);
  rSleeve.position.set(0, 0, -sleeveLen * 0.5);
  rSleeve.castShadow = true;
  rForearmGroup.add(rSleeve);

  // Right Hand & Cupped Palm (LÒNG BÀN TAY NẰM NGAY DƯỚI ĐÁY QUẢ CẦU)
  const rHand = new THREE.Group();
  rHand.name = "RightHand";
  // Vươn ra khỏi miệng tay áo tới đúng tọa độ dưới quả cầu
  rHand.position.set(0, 0, -0.142);
  // Xoay cổ tay để lòng bàn tay (+Y) ngửa thẳng lên trời (+Y thế giới)
  rHand.rotation.set(0.068, 0, 0);

  // Lòng bàn tay màu da đào ngửa phẳng
  const rPalmGeo = makeFlat(new THREE.BoxGeometry(0.056, 0.016, 0.052));
  const rPalm = new THREE.Mesh(rPalmGeo, skinMat);
  rPalm.position.set(0, 0.008, 0);
  rHand.add(rPalm);

  // Các ngón tay gom mềm, cong nhẹ lên ôm lấy phần đáy trước của quả cầu
  for (let f = -1; f <= 1; f++) {
    const finger = new THREE.Mesh(makeFlat(new THREE.BoxGeometry(0.013, 0.015, 0.024)), skinMat);
    finger.position.set(f * 0.015, 0.014, -0.028);
    finger.rotation.x = 0.38; // ngón cong nhẹ lên
    rHand.add(finger);
  }

  // Ngón cái tách nhẹ tự nhiên hướng về phía cơ thể
  const rThumb = new THREE.Mesh(makeFlat(new THREE.BoxGeometry(0.013, 0.014, 0.020)), skinMat);
  rThumb.position.set(0.028, 0.014, -0.008);
  rThumb.rotation.z = -0.40;
  rThumb.rotation.x = 0.20;
  rHand.add(rThumb);

  rForearmGroup.add(rHand);
  armRightPivot.add(rForearmGroup);
  bodyRoot.add(armRightPivot);

  // --- 7B. Left Arm (Viewer's Right - Tay còn lại, Section 6) ---
  // - Hướng xuống nhẹ dọc thân, không quá dang ngang
  // - Bàn tay nhỏ lộ ra vừa đủ, tư thế tự nhiên
  const armLeftPivot = new THREE.Group();
  armLeftPivot.name = "ArmLeftPivot";
  armLeftPivot.position.set(0.13, 0.60, 0.03);
  // Rủ tự nhiên dọc theo thân ở góc 25°
  armLeftPivot.rotation.set(0.06, -0.08, -0.44);

  const lUpperArmGeo = makeFlat(new THREE.CylinderGeometry(0.048, 0.062, 0.09, 6));
  lUpperArmGeo.rotateZ(-Math.PI * 0.5);
  const lUpperArm = new THREE.Mesh(lUpperArmGeo, mantleMat);
  lUpperArm.position.set(0.045, 0, 0);
  armLeftPivot.add(lUpperArm);

  const lForearmGroup = new THREE.Group();
  lForearmGroup.name = "LeftForearm";
  lForearmGroup.position.set(0.09, 0, 0);
  lForearmGroup.rotation.set(0.10, -0.05, 0.05);

  const lSleeveGeo = makeFlat(new THREE.CylinderGeometry(0.095, 0.058, 0.115, 6));
  lSleeveGeo.rotateZ(Math.PI * 0.5);
  const lSleeve = new THREE.Mesh(lSleeveGeo, mantleMat);
  lSleeve.position.set(0.058, 0, 0);
  lSleeve.castShadow = true;
  lForearmGroup.add(lSleeve);

  const lHand = new THREE.Group();
  lHand.name = "LeftHand";
  lHand.position.set(0.120, 0, 0);
  lHand.rotation.set(0.14, 0, -0.14);

  const lPalmGeo = makeFlat(new THREE.BoxGeometry(0.046, 0.016, 0.042));
  const lPalm = new THREE.Mesh(lPalmGeo, skinMat);
  lHand.add(lPalm);

  for (let f = -1; f <= 1; f++) {
    const finger = new THREE.Mesh(makeFlat(new THREE.BoxGeometry(0.012, 0.015, 0.022)), skinMat);
    finger.position.set(f * 0.012, -0.002, 0.024);
    finger.rotation.x = 0.15;
    lHand.add(finger);
  }

  const lThumb = new THREE.Mesh(makeFlat(new THREE.BoxGeometry(0.011, 0.013, 0.018)), skinMat);
  lThumb.position.set(-0.026, -0.002, 0.008);
  lThumb.rotation.y = -0.45;
  lHand.add(lThumb);

  lForearmGroup.add(lHand);
  armLeftPivot.add(lForearmGroup);
  bodyRoot.add(armLeftPivot);

  // ==========================================
  // 8. MAGIC CRYSTAL ORB
  // Cấu trúc pha lê 3 lớp: Lõi phát sáng nội tại, vỏ đa diện phân tầng sắc tím, và vầng hào quang phép thuật
  // - Vị trí: X = -0.245, Y = 0.625, Z = 0.225 (giữ nguyên chuẩn tuyệt đối)
  // ==========================================
  const orbAnchor = new THREE.Group();
  orbAnchor.name = "MagicOrbAnchor";
  orbAnchor.position.set(-0.245, 0.625, 0.225);

  // 1. Faceted Crystal Shell with Per-Facet Shading (Tương phản góc cạnh rõ rệt)
  const baseIco = new THREE.IcosahedronGeometry(0.088, 1);
  const orbGeo = baseIco.toNonIndexed();
  const posAttr = orbGeo.attributes.position;
  const count = posAttr.count;
  const colorsAttr = new Float32Array(count * 3);

  // Dải màu pha lê: highlight đón sáng rực rỡ (#ffffff), tím hồng sáng (#f495ff), tím magenta rực (#d428f2), tím thạch anh sẫm (#78109c)
  const cHighlight = new THREE.Color('#ffffff'); // Facet đón góc phản chiếu gắt nhất đạt trắng tinh
  const cHigh      = new THREE.Color('#f495ff'); // Facet phía trên đón ánh sáng tím hồng sáng
  const cMid       = new THREE.Color('#d428f2'); // Sắc tím magenta rực rỡ đặc trưng
  const cLow       = new THREE.Color('#78109c'); // Sắc tím thạch anh sẫm ở các mặt phía dưới

  for (let i = 0; i < count; i += 3) {
    const ax = posAttr.getX(i), ay = posAttr.getY(i), az = posAttr.getZ(i);
    const bx = posAttr.getX(i + 1), by = posAttr.getY(i + 1), bz = posAttr.getZ(i + 1);
    const cx = posAttr.getX(i + 2), cy = posAttr.getY(i + 2), cz = posAttr.getZ(i + 2);

    // Tính vector pháp tuyến mặt phẳng của tam giác
    const vBAx = bx - ax, vBAy = by - ay, vBAz = bz - az;
    const vCAx = cx - ax, vCAy = cy - ay, vCAz = cz - az;
    const nx = vBAy * vCAz - vBAz * vCAy;
    const ny = vBAz * vCAx - vBAx * vCAz;
    const nz = vBAx * vCAy - vBAy * vCAx;
    const len = Math.hypot(nx, ny, nz) || 1;

    // Tích vô hướng với hướng phản chiếu chính (chếch trước-trên)
    const dotLight = (nx * 0.35 + ny * 0.75 + nz * 0.56) / len;

    // Nội suy màu sắc pha lê theo góc phản chiếu
    const facetColor = new THREE.Color();
    if (dotLight > 0.62) {
      const t = Math.min(1.0, (dotLight - 0.62) / 0.38);
      facetColor.copy(cHigh).lerp(cHighlight, t);
    } else if (dotLight > 0.10) {
      const t = (dotLight - 0.10) / 0.52;
      facetColor.copy(cMid).lerp(cHigh, t);
    } else {
      const t = Math.max(0.0, (dotLight + 0.65) / 0.75);
      facetColor.copy(cLow).lerp(cMid, t);
    }

    for (let v = 0; v < 3; v++) {
      colorsAttr[(i + v) * 3]     = facetColor.r;
      colorsAttr[(i + v) * 3 + 1] = facetColor.g;
      colorsAttr[(i + v) * 3 + 2] = facetColor.b;
    }
  }

  orbGeo.setAttribute('color', new THREE.BufferAttribute(colorsAttr, 3));
  orbGeo.computeVertexNormals();
  const orbMesh = new THREE.Mesh(orbGeo, orbMat);
  orbAnchor.add(orbMesh);

  // 2. Inner Glowing Core (Lõi phát sáng nội tại chiếu xuyên qua vỏ pha lê)
  const coreGeo = makeFlat(new THREE.IcosahedronGeometry(0.056, 0));
  const coreMesh = new THREE.Mesh(coreGeo, orbCoreMat);
  orbAnchor.add(coreMesh);

  // 3. Magical Aura / Halo (Vầng hào quang huyền ảo lan tỏa mềm mại)
  let auraSprite = null;
  if (typeof document !== 'undefined') {
    try {
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      g.addColorStop(0.00, 'rgba(255, 205, 255, 0.85)');
      g.addColorStop(0.30, 'rgba(230, 80, 255, 0.45)');
      g.addColorStop(0.65, 'rgba(175, 40, 230, 0.16)');
      g.addColorStop(1.00, 'rgba(120, 15, 180, 0.00)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 128, 128);
      const spriteTex = new THREE.CanvasTexture(c);
      const spriteMat = new THREE.SpriteMaterial({
        map: spriteTex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });
      auraSprite = new THREE.Sprite(spriteMat);
      auraSprite.scale.set(0.30, 0.30, 1.0);
      orbAnchor.add(auraSprite);
    } catch (e) {
      console.warn('Canvas aura sprite not created:', e);
    }
  }

  // 4. Soft Purple Magical Light (Nguồn sáng tỏa ra xung quanh)
  const orbLight = new THREE.PointLight(0xdf55ff, 2.8, 2.2, 1.2);
  orbAnchor.add(orbLight);

  seerRoot.add(orbAnchor);

  // ==========================================
  // HELPER METHODS: Colors, Wireframe, Poses, Animation Tick
  // ==========================================
  function setColors(newColors) {
    if (newColors.hoodOuter) hoodMat.color.set(newColors.hoodOuter);
    if (newColors.hoodRim) hoodRimMat.color.set(newColors.hoodRim);
    if (newColors.hoodInner) hoodInnerMat.color.set(newColors.hoodInner);
    if (newColors.skin) skinMat.color.set(newColors.skin);
    if (newColors.eyes) eyeMat.color.set(newColors.eyes);
    if (newColors.mantle) mantleMat.color.set(newColors.mantle);
    if (newColors.gem) {
      gemMat.color.set(newColors.gem);
      gemMat.emissive.set(newColors.gem);
    }
    if (newColors.belt) beltMat.color.set(newColors.belt);
    if (newColors.innerRobe) innerRobeMat.color.set(newColors.innerRobe);
    if (newColors.robeDark) robeDarkMat.color.set(newColors.robeDark);
    if (newColors.capeBack) capeBackMat.color.set(newColors.capeBack);
    if (newColors.orbColor) {
      orbMat.color.set(newColors.orbColor);
      orbLight.color.set(newColors.orbColor);
      if (typeof auraSprite !== 'undefined' && auraSprite && auraSprite.material) {
        auraSprite.material.color.set(newColors.orbColor);
      }
    }
  }

  function setWireframe(enabled) {
    [hoodMat, hoodRimMat, hoodInnerMat, skinMat, browMat, eyeMat, mantleMat, broochSettingMat, gemMat, beltMat, innerRobeMat, robeDarkMat, capeBackMat, orbMat, shoesMat]
      .forEach(m => { m.wireframe = enabled; });
  }

  function setPose(poseName) {
    if (poseName === 'default' || poseName === 'idle') {
      armRightPivot.rotation.set(-2.191, 0.609, 2.466);
      rForearmGroup.rotation.set(0.653, 0.488, 0.036);
      armLeftPivot.rotation.set(0.06, -0.08, -0.44);
      lForearmGroup.rotation.set(0.10, -0.05, 0.05);
      headPivot.rotation.set(0, 0, 0);
      orbAnchor.position.set(-0.245, 0.625, 0.225);
    } else if (poseName === 'cast') {
      armRightPivot.rotation.set(-1.80, 0.50, 2.20);
      rForearmGroup.rotation.set(0.40, 0.45, -0.10);
      armLeftPivot.rotation.set(0.25, -0.20, -0.70);
      headPivot.rotation.set(0.04, -0.04, 0);
      orbAnchor.position.set(-0.22, 0.78, 0.32);
    } else if (poseName === 'tpose') {
      armRightPivot.rotation.set(0, 0, Math.PI * 0.5);
      rForearmGroup.rotation.set(0, 0, 0);
      armLeftPivot.rotation.set(0, 0, -Math.PI * 0.5);
      lForearmGroup.rotation.set(0, 0, 0);
      headPivot.rotation.set(0, 0, 0);
      orbAnchor.position.set(-0.48, 0.60, 0);
    } else if (poseName === 'meditate') {
      armRightPivot.rotation.set(-1.50, 0.40, 1.80);
      rForearmGroup.rotation.set(0.20, 0.55, -0.40);
      armLeftPivot.rotation.set(0.45, -0.35, -0.30);
      lForearmGroup.rotation.set(0.20, -0.55, 0.40);
      headPivot.rotation.set(0.06, 0, 0);
      orbAnchor.position.set(0, 0.58, 0.26);
    }
  }

  // Animation Update Tick (Idle float of the orb + subtle magical breathing)
  const baseOrbY = 0.625;
  function update(time = performance.now() * 0.001) {
    if (orbAnchor) {
      orbAnchor.position.y = baseOrbY + Math.sin(time * 2.2) * 0.010;
      orbAnchor.rotation.y = time * 0.55;
      orbAnchor.rotation.x = Math.sin(time * 1.5) * 0.08;
    }
    if (headPivot) {
      headPivot.position.y = 0.68 + Math.sin(time * 1.8) * 0.002;
    }
  }

  return {
    model: seerRoot,
    parts: {
      bodyRoot,
      shoesGroup,
      robeGroup,
      beltGroup,
      capeGroup,
      mantleGroup,
      broochGroup,
      headPivot,
      faceGroup,
      hoodGroup,
      armRightPivot,
      armLeftPivot,
      orbAnchor
    },
    materials: {
      hoodMat,
      hoodRimMat,
      hoodInnerMat,
      skinMat,
      hairMat,
      blushMat,
      browMat,
      eyeMat,
      mantleMat,
      broochSettingMat,
      gemMat,
      beltMat,
      innerRobeMat,
      robeDarkMat,
      capeBackMat,
      orbMat,
      orbCoreMat,
      shoesMat
    },
    setColors,
    setWireframe,
    setPose,
    update
  };
}
