import { Magic } from 'magic-sdk';
import { PolkadotExtension } from '@magic-ext/polkadot';
import { getStoreUrl } from './utils/chain';
import shouldUpdate from './utils/shouldUpdate';

let magic: Magic;
let currentUrl: string;

const createMagic = (rpcUrl: string) => {
  magic = new Magic('pk_test_17C94EB0375E3A08', {
    extensions: {
      polkadot: new PolkadotExtension({
        rpcUrl
      })
    }
  });
};

const getMagicInstance = () => {
  if (!magic || shouldUpdate(getStoreUrl(), currentUrl)) {
    currentUrl = getStoreUrl();
    createMagic(getStoreUrl());
  }

  return magic;
};

export default getMagicInstance;
