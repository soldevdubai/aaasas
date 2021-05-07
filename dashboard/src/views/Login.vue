<template>
  <div class="columns">
    <div class="column is-7 is-offset-3">
      <section>
        <br />
        <b-loading
          is-full-page
          v-model="isLoading"
          :can-cancel="true"
        ></b-loading>
        <div class="box">
          <p class="title is-size-3">
            <!-- {{ $t('mint.context') }} -->
            Login
          </p>

          <AccountSelect
        :label="$i18n.t('Account')"
        v-model="account"
        :tooltipVisible="false"
      />
      <hr/>
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
              v-if="emailValid"
              type="is-info"
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
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import getMagicInstance from '@/magic'

const components = {
  AccountSelect: () => import('@/components/shared/AccountSelect.vue'),
  Identity: () => import('@/components/shared/format/Identity.vue')
};

@Component({ components })
export default class Login extends Vue {
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
  }




}
</script>
