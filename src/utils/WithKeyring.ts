import { Component, Vue, Watch } from 'vue-property-decorator';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { KeyringPair } from '@polkadot/keyring/types';
import { u8aToHex } from '@polkadot/util';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { enableExtension } from '@/extension';
import correctFormat from '@/utils/ss58Format'

import {
  web3Accounts,
  isWeb3Injected
} from '@polkadot/extension-dapp';
import { getPrefixByStoreUrl } from '@/utils/chain'
import getMagicInstance from '@/magic';

export type KeyringAccount = KeyringPair | InjectedAccountWithMeta;

@Component
export default class WithKeyring extends Vue {
  protected keyringLoaded: boolean = false;
  protected keyringAccounts: KeyringPair[] = [];
  protected importedAccounts: InjectedAccountWithMeta[] = [];
  protected magicAccounts: InjectedAccountWithMeta[] = [];
  protected keys: any = '';

  public async mountWasmCrypto(): Promise<void> {
    await cryptoWaitReady();
    // console.log('wasmCrypto loadedX');
    await this.loadKeyring();
    // console.log('keyring initX');
  }

  public async loadKeyring(): Promise<void> {
    this.keyringLoaded = true;
    this.keys = keyring;
    this.mapAccounts();
    await this.extensionAccounts();
    await this.loadMagicAccounts();
  }

  public mapAccounts(): void {
    this.keyringAccounts = keyring.getPairs();
  }

  get chainProperties() {
    return this.$store.getters.getChainProperties;
  }

  get ss58Format(): number {
    return this.chainProperties?.ss58Format
  }

  public async extensionAccounts() {
    if (!isWeb3Injected) {
      console.warn('Extension not working, reload might fix things')
      await enableExtension();
    }

    this.importedAccounts = await web3Accounts({ ss58Format: correctFormat(this.ss58Format) >= 0 ? correctFormat(this.ss58Format) : correctFormat(this.prefixByStore)  });
  }

  public async loadMagicAccounts() {
    const magic = getMagicInstance()
    const magicIsLoggedIn = magic.user.isLoggedIn()
    if (await magicIsLoggedIn) {
      const acc = await (magic.polkadot as any).getAccount();
      this.magicAccounts = [{ address: keyring.encodeAddress(acc, correctFormat(this.ss58Format)), meta: {source: 'magic', name: 'Email'} }]
      return this.magicAccounts[0].address;
   }
  }

  get prefixByStore() {
    return correctFormat(getPrefixByStoreUrl())
  }

  public allAcctounts(): KeyringAccount[] {
    return [...this.keyringAccounts, ...this.importedAccounts, ...this.magicAccounts]
  }


  public created(): void {
    this.mountWasmCrypto();
  }

  public getPair(address: string): KeyringPair {
    return keyring.getPair(address);
  }

  public vueU8aToHex(publicKey: Uint8Array): string {
    return u8aToHex(publicKey);
  }

  @Watch('ss58Format')
  handleChange(val: string) {
    console.log('ss58Format', val)
    // https://github.com/polkadot-js/ui/pull/494
    keyring.setSS58Format(Number(val))
  }

  // public passwordRequired(address: string): boolean {
  //   if (this.importedAccounts.some(acc => acc.address === address)) {
  //     return true
  //   }

  //   return isAccountLocked(address)
  // }
}
