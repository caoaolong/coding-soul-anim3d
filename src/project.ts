import {makeProject} from '@motion-canvas/core';

import example from './scenes/example?scene';
import axes from './scenes/axes?scene';

export default makeProject({
  scenes: [example, axes],
});
