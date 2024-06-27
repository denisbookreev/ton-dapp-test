import {
  Address,
  Contract,
  Cell,
  beginCell,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode
} from '@ton/core'

export interface MainContractConfig {
  number: number
  recent_address: Address
  owner_address: Address
}

const mainContractConfigToCell = (config: MainContractConfig): Cell => {
  return beginCell()
    .storeUint(config.number, 32)
    .storeAddress(config.recent_address)
    .storeAddress(config.owner_address)
    .endCell()
}

export class MainContract implements Contract {
  constructor (
    readonly address: Address,
    readonly init?: { code: Cell, data: Cell }
  ) {}

  static createFromConfig (code: Cell, config: MainContractConfig, workchain = 0) {
      const data = mainContractConfigToCell(config)
      const init = { code, data }
      const address = contractAddress(workchain, init)

      return new MainContract(address, init)
  }

  async sendDeploy (provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().storeUint(2, 32).endCell()
    })
  }

  async sendIncrement (
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    increment_by: number,
  ) {
    const msg_body = beginCell()
      .storeUint(1, 32)
      .storeUint(increment_by, 32)
      .endCell()

    console.log(msg_body, sender, value)

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    })
  }

  async sendDeposit (provider: ContractProvider, sender: Sender, value: bigint) {
    const msg_body = beginCell()
      .storeUint(2, 32)
      .endCell()

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    })
  }

  async sendNoCodeDeposit (provider: ContractProvider, sender: Sender, value: bigint) {
    const msg_body = beginCell().endCell()

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    })
  }

  async sendWithdrawalRequest (provider: ContractProvider, sender: Sender, value: bigint, amount: bigint) {
    const msg_body = beginCell().storeUint(3, 32).storeCoins(amount).endCell()

    console.log(msg_body, value, amount)

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msg_body,
    })
  }

  async getData (provider: ContractProvider) {
    const { stack } = await provider.get('get_contract_storage_data', [])
    return {
      number: stack.readNumber(),
      sender: stack.readAddress(),
      owner_address: stack.readAddress(),
    }
  }

  async getBalance (provider: ContractProvider): Promise<number> {
    const { stack } = await provider.get('balance', []);
    return stack.readNumber()
  }
}
