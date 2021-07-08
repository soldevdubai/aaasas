<template>
  <div class="columns">
    <div class="column is-7 is-offset-3">
      <section>
        <br />
        <Loader v-model="isLoading" />
        <div class="box">
          <p class="title is-size-3">
            {{ $t('login.title') }}
          </p>

          <p class="sub-title is-size-6">
            {{ $t('login.account') }}
          </p>
          <AccountSelect
        :label="$i18n.t('Account')"
        v-model="account"
        :tooltipVisible="false"
      />
      <hr/>
      <p class="sub-title is-size-6">
            {{ $t('login.email') }}
          </p>
          <b-field :label="$i18n.t('login.mail')">
            <b-input
              placeholder="someone@example.com"
              v-model="email"
              expanded
              spellcheck="true"
            ></b-input>
          </b-field>
          <b-field>
            <b-button
              :disabled="!emailValid"
              icon-left="envelope"
              @click="handleMagic"
              outlined
            >
              {{ $t("login.submit") }}
            </b-button>
          </b-field>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts" >
import { Component, Mixins } from 'vue-property-decorator';
import getMagicInstance from '@/magic'
import WithKeyring from '@/utils/WithKeyring';
import { notificationTypes, showNotification } from '@/utils/notification';

const components = {
  Loader: () => import('@/components/shared/Loader.vue'),
  AccountSelect: () => import('@/components/shared/AccountSelect.vue'),
  Identity: () => import('@/components/shared/format/Identity.vue')
};

@Component({ components })
export default class Login extends Mixins(WithKeyring) {
  protected isLoading: boolean = false;
  protected email: string = '';

  set account(account: string) {
    console.log('setAuth', account);
    this.$store.dispatch('setAuth', { address: account });
  }

  get account() {
    return this.$store.getters.getAuthAddress;
  }

  get emailValid() {
    return /^[a-zA-Z0-9]{2,}@[a-zA-Z0-9]{2,}\.[\.a-zA-Z0-9]{2,}$/.test(this.email)
  }

  protected async handleMagic() {
    const magic = getMagicInstance()
    await magic.auth.loginWithMagicLink({ email: this.email });
    this.isLoading = true;
    await this.handleSingIn();
    this.isLoading = false;
    showNotification(this.$t('login.success').toString(), notificationTypes.success);
    (window as any).dot = magic.polkadot
  }
  async handleSingIn() {
   await this.loadMagicAccounts().then(acc => {
     if (acc) {
       this.account = acc;
     }
   });

  }




}
</script>
