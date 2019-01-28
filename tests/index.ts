import path from 'path';
// import Joker from '../src';

import { default as Joker} from '../src';
export { default as Joker } from '../src';

export function jokerFixture() {
  return new Joker().cwd(path.join(__dirname, 'test', 'fixtures'));
}

