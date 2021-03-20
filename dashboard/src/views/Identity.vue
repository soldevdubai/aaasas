<template>

		<div>
		<p class="title"># Set Identity</p>
		<AccountSelect :label="$i18n.t('Account')" v-model="accountId" />
    <template v-if="accountId">

    <b-field label="Name">
      <b-input placeholder="My On-Chain Name"  v-model="identity.display"> </b-input>
    </b-field>
    <b-field label="Name">
      <b-input placeholder="Full Legal Name"  v-model="identity.legal"> </b-input>
    </b-field>
    <b-field label="email">
      <b-input placeholder="somebody@example.com" type="email" v-model="identity.email"> </b-input>
    </b-field>
    <b-field label="web">
      <b-input placeholder="https://example.coml" v-model="identity.web"> </b-input>
    </b-field>
    <b-field label="twitter">
      <b-input placeholder="@YourTwitterName" v-model="identity.twitter"> </b-input>
    </b-field>
    <b-field label="riot">
      <b-input placeholder="@yourname:matrix.org" v-model="identity.riot"> </b-input>
    </b-field>
    <!-- <b-field label="telephone">
      <b-input placeholder="No label" v-model="identity.tel"> </b-input>
    </b-field> -->
    <b-field>
        <PasswordInput v-model="password" :account="accountId" />
      </b-field>

      <b-button
        type="is-primary"
        icon-left="paper-plane"
        outlined
        :disabled="!accountId || !password"
        @click="shipIt"
      >
        Submit
      </b-button>
      </template>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import exec, { execResultValue } from '@/utils/transactionExecutor';
import { notificationTypes, showNotification } from '@/utils/notification';
import shouldUpdate from '@/utils/shouldUpdate';
import Connector from '@vue-polkadot/vue-api';
import { isFunction } from '@polkadot/util';

@Component({
	components: {
		AccountSelect: () => import('@/components/shared/AccountSelect.vue'),
    PasswordInput: () => import('@/components/shared/PasswordInput.vue')
	},
})
export default class SetIdentity extends Vue {
	// @Prop() public referendumId!: any;

	private accountId: string = '';
	private password: string = '';
	private identity: Record<string, string> = {
    display: '',
    email: '',
    web: '',
    twitter: '',
    riot: '',
    tel: '',
    legal: ''
  }

  private additional = [];
	private tx: string = '';


  public enhanceIdentityData(): any {
    return Object.fromEntries(Object.entries(this.identity).map(([key, val]: [string, string]) => {
      if (val) {
        return [key, {'raw': val}]
      }
      return [key, {'none': null}]
    }))
  }

		public async shipIt() {
		const { api } = (this as any).$http;

		if (!api) {
			return;
		}

		try {
			showNotification('Dispatched');
      const enhancedData = this.enhanceIdentityData();
      const x = { ...enhancedData, additional: [[{'raw': 'telephone'}, {'raw': this.identity.tel}]] }
			const tx = await exec(this.accountId, this.password, api.tx.identity.setIdentity, [x]);
			showNotification(`Identity ${tx}`, notificationTypes.success);
		} catch (e) {
			showNotification(e, notificationTypes.danger);
		}

	}

  @Watch('accountId')
  protected watchAccountChange(val: string, oldVal: string) {
    if (shouldUpdate(val, oldVal)) {
      this.fetchIdentity(val)
    }
  }

  protected async fetchIdentity(val: string) {
    const { api } = Connector.getInstance();

    try {
      const res = await api.query.identity.identityOf(val)
      if (res.isEmpty || res.isNone) {
        throw new EvalError(val)
      }

      const identity = res.unwrapOr(null)

      if (!identity) {
        throw new EvalError(val)
      }
    } catch (e) {
      console.warn(`No identity for ${e.message}`)
    }
  }


}
</script>
