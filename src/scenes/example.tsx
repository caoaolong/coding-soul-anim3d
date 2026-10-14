import {makeScene2D} from '@motion-canvas/2d';
import {tween, waitFor} from '@motion-canvas/core';
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
} from 'three';
import {Three} from '../components/Three';

const threeScene = new Scene();

const camera = new PerspectiveCamera(45);
camera.position.set(2.5, 2, 4);
camera.lookAt(0, 0, 0);

const cube = new Mesh(
  new BoxGeometry(1, 1, 1),
  new MeshStandardMaterial({color: '#4fc3f7'}),
);
threeScene.add(cube);

threeScene.add(new AmbientLight(0xffffff, 0.45));
const directional = new DirectionalLight(0xffffff, 1.2);
directional.position.set(4, 6, 3);
threeScene.add(directional);

export default makeScene2D(function* (view) {
  // Create your animations here

  view.add(
    <Three
      width={() => view.width()}
      height={() => view.height()}
      camera={camera}
      scene={threeScene}
      background={'#111827'}
    />,
  );

  yield* tween(2, value => {
    cube.rotation.y = value * Math.PI * 2;
    cube.rotation.x = value * Math.PI * 0.35;
  });

  yield* waitFor(0.3);
});
