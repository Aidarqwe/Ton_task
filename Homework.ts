import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export type HomeworkConfig = {
    admin: Address;
};

export function homeworkConfigToCell(config: HomeworkConfig): Cell {
    return beginCell()
            .storeAddress(config.admin)
        .endCell();
}

export class Homework implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Homework(address);
    }

    static createFromConfig(config: HomeworkConfig, code: Cell, workchain = 0) {
        const data = homeworkConfigToCell(config);
        const init = { code, data };
        return new Homework(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendAcceptFunds(provider: ContractProvider, via: Sender, value: bigint){
        await provider.internal(via, {
            value, 
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0xa4d8086f, 32)
            .endCell(),
        });
    }

    async sendAdminWithdraw(provider: ContractProvider, via: Sender){
        await provider.internal(via, {
            value: toNano("1"), 
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x217e5898, 32)
            .endCell(),
        });
    }


}
