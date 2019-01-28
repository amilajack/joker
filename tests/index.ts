import path from 'path';

import { default as Joker} from '../src';
export { default as Joker } from '../src';

export function jokerFixture() {
  return new Joker().cwd(path.join(__dirname, 'fixtures'));
}
