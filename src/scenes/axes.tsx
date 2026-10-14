import {makeScene2D} from '@motion-canvas/2d';
import {tween, waitFor} from '@motion-canvas/core';
import {
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Scene,
} from 'three';
import {Three} from '../components/Three';
import {createCoordinateFrame} from '../three/createAxes';

const AXIS_LENGTH = 5;
const CAMERA_DISTANCE = 13;

const threeScene = new Scene();

const camera = new PerspectiveCamera(40);
camera.position.set(
  CAMERA_DISTANCE,
  CAMERA_DISTANCE * 0.75,
  CAMERA_DISTANCE,
);
camera.lookAt(AXIS_LENGTH * 0.35, AXIS_LENGTH * 0.25, AXIS_LENGTH * 0.35);

threeScene.add(
  createCoordinateFrame({
    length: AXIS_LENGTH,
    radius: 0.012,
    size: AXIS_LENGTH,
    divisions: 10,
  }),
);

threeScene.add(new AmbientLight(0xffffff, 0.55));
const directional = new DirectionalLight(0xffffff, 1.1);
directional.position.set(6, 10, 5);
threeScene.add(directional);

export default makeScene2D(function* (view) {
  view.add(
    <Three
      width={() => view.width()}
      height={() => view.height()}
      camera={camera}
      scene={threeScene}
      background={'#0f172a'}
    />,
  );

  // 绕图表角缓慢环绕，便于看清三面网格
  const focusX = AXIS_LENGTH * 0.35;
  const focusY = AXIS_LENGTH * 0.25;
  const focusZ = AXIS_LENGTH * 0.35;

  yield* tween(5, value => {
    const angle = value * Math.PI * 2;
    camera.position.set(
      focusX + Math.cos(angle) * CAMERA_DISTANCE,
      focusY + CAMERA_DISTANCE * 0.45,
      focusZ + Math.sin(angle) * CAMERA_DISTANCE,
    );
    camera.lookAt(focusX, focusY, focusZ);
  });

  yield* waitFor(0.2);
});
