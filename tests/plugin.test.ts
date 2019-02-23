import { Joker } from '.';

describe.skip('joker.register', () => {
  it('can register a single function', async () => {
    const fn = res => {
      console.log(res);
    };
    new Joker().register('fn', fn);
    expect(new Joker()).toHaveProperty('fn');
    await new Joker()
      // @ts-ignore
      .fn()
      .end();
  });

  it('can register multiple functions at once', async () => {
    const fn1 = () => {
      console.log('fn1');
    };
    const fn2 = () => {
      console.log('fn2');
    };

    new Joker().register({ fn1, fn2 });

    expect(new Joker()).toHaveProperty('fn1');
    expect(new Joker()).toHaveProperty('fn2');

    await new Joker()
      // @ts-ignore
      .fn1()
      .fn2()
      .end();
  });
});
