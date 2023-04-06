// p5.disableFriendlyErrors = true;

var pts = [];
var render;
var w_, h_;
var spheres;
var materialColor;
var emissionColor;
var img;

function preload() {
  img = loadImage("background.jpeg");
}

function setup() {
  createCanvas(512, 512);
  pixelDensity(1);
  background(0);

  // randomSeed(4);

  w_ = 1 / width;
  h_ = 1 / height;

  render = [];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      render.push({ r: 0, g: 0, b: 0 });
    }
  }

  materialColor = createVector(1, 1, 1);
  emissionColor = createVector(0, 0, 0);

  spheres = [];
  // for (let i = 0; i < 5; i++) {
  //   spheres.push(
  //     new Sphere(
  //       random(-5, 5),
  //       random(-5, 5),
  //       random(0, 5),
  //       random(0, 2),
  //       random(),
  //       random(),
  //       random(),
  //       false
  //     )
  //   );
  // }

  setMaterialColor(1, 1, 1);
  setEmissionColor(1, 1, 1);
  addSphere(0, -500, 2, 499, 0, 1);
  setEmissionColor(0, 0, 0);
  addSphere(0, 0, -501, 499, 0, 0);
  setMaterialColor(0.2, 1, 0.2);
  addSphere(0, 500, 2, 499, 0, 0);
  setMaterialColor(1, 0.2, 0.2);
  addSphere(-500, 0, 2, 499, 0, 0);
  setMaterialColor(0.2, 0.2, 1);
  addSphere(500, 0, 2, 499, 0, 0);
  setMaterialColor(0.2, 0.2, 0.2);
  addSphere(0, 0, 502, 499, 0, 0);

  setMaterialColor(1, 1, 1);
  addSphere(-0.5, 0, 2, 0.375, 0.5, 0);
  addSphere(0.5, 0, 2, 0.375, 1, 0);
  // addSphere(0, 0.25, 2, 0.5, 0, 0);

  // setEmissionColor(1, 1, 1);
  // addSphere(0, -2.9, 2, 2, 0, 1);

  // for (let i = 0; i < 5; i++) {
  //   // setMaterialColor(1 - i / 5, 1 - i / 5, 1 - i / 5);
  //   addSphere((i - 2) * 1.2, 0, 2, 0.5, i / 4, 0);
  // }

  // addSphere(0, 0, 2, 0.2, 0, 1);

  // setMaterialColor(1, 0.2, 0.2);
  // spheres.push(new Sphere(-1.4, 0.7, 2, 0.3, 0));
  // setMaterialColor(0.2, 1, 0.2);
  // spheres.push(new Sphere(-0.5, 0.6, 2, 0.4, 0));
  // setMaterialColor(0.2, 0.2, 1);
  // spheres.push(new Sphere(0.6, 0.5, 2, 0.5, 0));
  // setMaterialColor(1, 1, 1);
  // spheres.push(new Sphere(2, 0.3, 2, 0.7, 0));
  // spheres.push(new Sphere(0, -1, -2, 1, 10));
  // setMaterialColor(0.2, 0.2, 0.2);
  // spheres.push(new Sphere(-2.1, 0.8, 2, 0.2, 0));

  loadPixels();

  //   createEasyCam();
  //   document.oncontextmenu = ()=>false;

  // for (let i = 0; i < 1000; i++) {
  //   pts.push(randomHemisphere(createVector(1, 0, 0), createVector(-1, 0, 0)))
  // }
}

function draw() {
  background(0);

  for (let i = 0; i < 64; i++) {
    // let x = [0, 0.5, 0, 0.5];
    // let y = [0, 0, 0.5, 0.5];
    // Render(random(), random());
    // Render(x[i], y[i]);
    Render(0, 0);
  }
  displayRender(64);

  // translate(width / 2, height / 2);
  // stroke(255);
  // strokeWeight(1);
  // for (let i = 0; i < 1000; i++) {
  //   push();
  //   translate(p5.Vector.mult(pts[i], 50));
  //   point(0, 0, 0);
  //   pop();
  // }

  noLoop();
}

function Render(offx, offy) {
  for (let i = 0; i < height; i++) {
    const y = (i - offy) * 2 * h_ - 1;
    for (let j = 0; j < width; j++) {
      const x = (j + offx) * 2 * h_ - width / height;
      const index = j + i * width;

      let totalLight = rayTrace(x, y);

      // totalLight.set(p5.Vector.mult(col, lit));

      render[index].r += totalLight.x;
      render[index].g += totalLight.y;
      render[index].b += totalLight.z;
    }
  }
}

function rayTrace(x, y) {
  let ray = new Ray(x, y);
  let totalLight = createVector(0, 0, 0);
  let rayColor = createVector(1, 1, 1);

  for (let collisions = 0; collisions < 32; collisions++) {
    let hitInfo = calculateHit(ray.p, ray.d);
    let material = hitInfo.mat;

    if (hitInfo.hit) {
      let reflectedRay = p5.Vector.reflect(ray.d, hitInfo.nrm);
      ray.d.set(randomHemisphere(ray.d, hitInfo.nrm));
      ray.d.lerp(reflectedRay, material.spec).normalize();
      ray.p.set(hitInfo.pos);

      let emission = p5.Vector.mult(material.litCol, material.lit);
      totalLight.add(p5.Vector.mult(emission, rayColor));
      rayColor.mult(material.col);
    } else {
      // totalLight.add(p5.Vector.mult(environColor(ray.d), rayColor));
      // totalLight.add(p5.Vector.mult(imageBackground(ray.d), rayColor));
      break;
    }
  }

  return totalLight;
}

function calculateHit(p, d) {
  let hitInfo = {
    hit: false,
    dst: Infinity,
  };

  for (let i in spheres) {
    let hit = spheres[i].hit(p, p5.Vector.sub(p, spheres[i].p), d);

    if (hit.hit && hit.dst < hitInfo.dst) {
      hitInfo = hit;
    }
  }

  return hitInfo;
}

function displayRender(n) {
  for (let i in render) {
    pixels[i * 4 + 0] = (render[i].r * 255) / n;
    pixels[i * 4 + 1] = (render[i].g * 255) / n;
    pixels[i * 4 + 2] = (render[i].b * 255) / n;
  }
  updatePixels();
}

function addSphere(x, y, z, r, lit, spc) {
  spheres.push(new Sphere(x, y, z, r, lit, spc));
}

function setMaterialColor(r, g, b) {
  materialColor.set(r, g, b);
}

function setEmissionColor(r, g, b) {
  emissionColor.set(r, g, b);
}

function imageBackground(d) {
  // let u = floor(map(atan2(d.z, d.x), -PI, PI, 0, img.width));
  // let v = floor(map(atan(d.y), -PI / 2, PI / 2, 0, img.height));
  let u = floor(map(atan2(d.z, d.x), -PI, PI, 0, 64));
  let v = floor(map(atan(d.y), -PI / 2, PI / 2, 0, 32));

  // let c = img.get(u, v);
  let c = (u + v) % 2;

  // return createVector(c[0] / 255, c[1] / 255, c[2] / 255);
  return createVector(c, c, c);
}

function environColor(d) {
  //   let skyColor1 = createVector(0.2, 0.7, 0.9).mult(1);
  //   let skyColor2 = createVector(1, 1, 1).mult(1);
  //   let skyT = pow(smoothstep(0, 0.4, d.y), 0.35);
  //   let skyColor = p5.Vector.lerp(skyColor1, skyColor2, skyT);

  //   let groundColor = createVector(0.3, 0.3, 0.3);
  //   let groundT = smoothstep(-1, 1, d.y * 0.5 + 0.5);

  //   let showSun = groundT > 0;
  //   let sunPos = createVector(0, 0, 1).normalize();
  //   let sun = pow(max(0, sunPos.dot(d)), 100) * 1000 * showSun;

  //   return p5.Vector.lerp(groundColor, skyColor, groundT).add(sun, sun, sun);
  let skyColorHorizon = createVector(1, 1, 1);
  let skyColorZenith = createVector(0.2, 0.7, 0.9);
  let groundColor = createVector(0.4, 0.4, 0.4);

  let skyGradientT = pow(smoothstep(0, 0.4, -d.y), 0.35);
  let skyGradient = p5.Vector.lerp(
    skyColorHorizon,
    skyColorZenith,
    skyGradientT
  );
  let sunPos = createVector(-0.5, -0.5, 1).normalize();
  let sun = pow(max(0, p5.Vector.dot(d, sunPos)), 1000) * 10;

  // let groundToSkyT = smoothstep(0, 0.01, -d.y);
  return d.y < 0 ? skyGradient.add(sun, sun, sun) : groundColor;
}

function smoothstep(a, b, x) {
  if (x <= 0) return a;
  if (x >= 1) return b;
  return x * x * (3 - 2 * x) * (b - a) + a;
}

function randomHemisphere(d, n) {
  let randVec = p5.Vector.random3D();
  if (p5.Vector.dot(randVec, n) > 0) {
    return randVec.mult(-1);
  }
  return randVec;
}

class Ray {
  constructor(x, y) {
    this.p = createVector(0, 0, 0);
    this.d = createVector(x, y, 1.5).normalize();

    // let t = -PI / 6;
    // this.d.set(
    //   this.d.x,
    //   cos(t) * this.d.y - sin(t) * this.d.z,
    //   sin(t) * this.d.y + cos(t) * this.d.z
    // );
    // let t = -PI;
    // this.d.set(
    //   cos(t) * this.d.x - sin(t) * this.d.z,
    //   this.d.y,
    //   sin(t) * this.d.x + cos(t) * this.d.z
    // );
  }
}

class Sphere {
  constructor(x, y, z, r, spec, lit) {
    this.p = createVector(x, y, z);
    this.r = r;
    this.r2 = r * r;
    this.material = new Material(spec, lit);
  }

  hit(p0, p, d) {
    let a = p5.Vector.dot(d, d);
    let b = 2 * p5.Vector.dot(p, d);
    let c = p5.Vector.dot(p, p) - this.r2;
    let discriminant = b * b - 4 * a * c;
    let hit = { hit: false };

    if (discriminant >= 0) {
      let dst = (-b - sqrt(discriminant)) / (2 * a);

      if (dst >= 0) {
        hit = {
          hit: true,
          dst: dst,
          mat: this.material,
          pos: p5.Vector.mult(d, dst).add(p0),
          nrm: p5.Vector.mult(d, dst).add(p).normalize(),
        };
      }
    }

    return hit;
  }
}

class Material {
  constructor(spec, lit) {
    this.col = materialColor.copy();
    this.litCol = emissionColor.copy();
    this.spec = spec;
    this.lit = lit;
  }
}
