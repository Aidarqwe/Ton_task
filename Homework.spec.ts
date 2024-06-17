import { Blockchain, SandboxContract, TreasuryContract, printTransactionFees } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Homework } from '../wrappers/Homework';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Homework', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Homework');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let homework: SandboxContract<Homework>;
    let admin: SandboxContract<TreasuryContract>;
    let user: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        admin = await blockchain.treasury("admin");
        user = await blockchain.treasury("user");

        homework = blockchain.openContract(Homework.createFromConfig({
            admin: admin.address
        }, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await homework.sendDeploy(deployer.getSender(), toNano('2'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: homework.address,
            deploy: true,
            success: true,
        });
    });

    it('should send accept funds on balance', async () => {
        const userBalanceBefore = await user.getBalance();

        const sendAcceptFundsRes = await homework.sendAcceptFunds(user.getSender(), toNano('3'));
        expect(sendAcceptFundsRes.transactions).toHaveTransaction({
            from: user.address,
            to: homework.address,
            success: true,
            op: 0xa4d8086f,
            value: toNano("3")
        });

        const userBalanceAfter = await user.getBalance();
        expect(userBalanceAfter).toBeLessThan(userBalanceBefore);

        printTransactionFees(sendAcceptFundsRes.transactions);
    });

    it('should be error 99', async () => {

        const sendFundsRes = await homework.sendAcceptFunds(user.getSender(), toNano('1'));
        expect(sendFundsRes.transactions).toHaveTransaction({
            from: user.address,
            to: homework.address,
            success: false,
            op: 0xa4d8086f,
            value: toNano("1"),
            exitCode: 99,
            inMessageBounceable: true
        });

        printTransactionFees(sendFundsRes.transactions);
    });

    it('should admin withdraw', async () => {    // Проблема с написанем теста
  
        const sendAcceptFundsRes = await homework.sendAdminWithdraw(admin.getSender());
        expect(sendAcceptFundsRes.transactions).toHaveTransaction({
            from: admin.address,
            to: homework.address,
            success: false,
            op: 0x217e5898,
            exitCode: 101,
            value: toNano("1")
        });


        printTransactionFees(sendAcceptFundsRes.transactions);
    });
});
