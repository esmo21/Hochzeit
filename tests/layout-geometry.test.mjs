import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROOM_WIDTH_CM, ROOM_HEIGHT_CM, normalizeRotation, isValidRotation,
  rotatedBounds, clampToRoom, rotateFurniture
} from '../js/layout-geometry.mjs';
const approx = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

test('bisherige 0°/90°/180°/270°-Layouts bleiben maßstabsgetreu', () => {
  for (const [degrees,w,h] of [[0,70,160],[90,160,70],[180,70,160],[270,160,70]]) {
    const b = rotatedBounds(70,160,degrees);
    approx(b.w,w); approx(b.h,h);
  }
});

test('45°-Drehung erzeugt echte schräge Rechtecke mit korrekter Bounding-Box', () => {
  const d=rotatedBounds(70,160,45);
  approx(d.w,230/Math.sqrt(2)); approx(d.h,230/Math.sqrt(2));
  const chair=rotatedBounds(45,45,45);
  approx(chair.w,45*Math.sqrt(2)); approx(chair.h,45*Math.sqrt(2));
});

test('8 Schritte +45° und ein Schritt -45° erlauben alle Winkel', () => {
  const item={x:300,y:300,rotation:0};
  for(let i=1;i<=8;i++){
    rotateFurniture(item,70,160,45);
    assert.equal(item.rotation,(i*45)%360);
  }
  approx(item.x,300); approx(item.y,300);
  rotateFurniture(item,70,160,-45);
  assert.equal(item.rotation,315);
  assert.equal(normalizeRotation(-90),270);
  assert.equal(isValidRotation(135),true);
  assert.equal(isValidRotation(35),false);
});

test('Drehen erhält die Tischmitte, sofern ausreichend Platz ist', () => {
  const item={x:400,y:450,rotation:0};
  const before=rotatedBounds(89.5,140,0);
  const center=[item.x+before.w/2,item.y+before.h/2];
  rotateFurniture(item,89.5,140,45);
  const after=rotatedBounds(89.5,140,45);
  approx(item.x+after.w/2,center[0]);
  approx(item.y+after.h/2,center[1]);
});

test('Wände begrenzen gedrehte Tische und Stühle bei allen 45°-Winkeln', () => {
  for (const [width,height] of [[70,160],[69.5,70],[80,119],[89.5,140],[45,45]]) {
    for (let angle=0;angle<360;angle+=45) {
      const item={x:ROOM_WIDTH_CM-5,y:ROOM_HEIGHT_CM-5,rotation:angle};
      clampToRoom(item,width,height);
      const bounds=rotatedBounds(width,height,angle);
      assert.ok(item.x >= 0 && item.y >= 0);
      assert.ok(item.x+bounds.w <= ROOM_WIDTH_CM+1e-7);
      assert.ok(item.y+bounds.h <= ROOM_HEIGHT_CM+1e-7);
    }
  }
});

test('Drehen am Raumrand verschiebt Möbel nur so weit wie nötig nach innen', () => {
  const item={x:850,y:950,rotation:0};
  clampToRoom(item,70,160);
  rotateFurniture(item,70,160,45);
  const b=rotatedBounds(70,160,45);
  assert.ok(item.x+b.w<=ROOM_WIDTH_CM+1e-7);
  assert.ok(item.y+b.h<=ROOM_HEIGHT_CM+1e-7);
});
