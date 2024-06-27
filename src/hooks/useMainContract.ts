import {useTonClient} from "./useTonClient.ts";
import {useEffect, useState} from "react";
import {MainContract, MainContractConfig} from "../contracts/MainContract.ts";
import {useAsyncInitialize} from "./useAsyncInitialize.ts";
import {Address} from "@ton/core";
import {toNano} from "@ton/core";
import {useTonConnect} from "./useTonConnect.ts";

export function useMainContract(contractAddress) {
    const client = useTonClient();
    const {sender} = useTonConnect()
    const [contractData, setContractData] = useState<null | MainContractConfig>(null)

    const mainContract = useAsyncInitialize(async () => {
        if (!client) return;

        const contract = new MainContract(Address.parse(contractAddress))

        return client.open(contract)
    }, [client])

    const [balance, setBalance] = useState<null | number>(null)

    const [pollCounter, setPollCounter] = useState(0)

    useEffect(() => {
        const pollTimeout = setInterval(() => {
            setPollCounter(prevState => prevState + 1)
        }, 10 * 1000);
        return () => clearInterval(pollTimeout)
    }, []);

    useEffect(() => {
        console.log('fetch data')
        if (!mainContract) return

        mainContract.getData().then(data => {
            setContractData({
                number: data.number,
                recent_address: data.sender,
                owner_address: data.owner_address,
            })
        });

        mainContract.getBalance().then(data => {
            setBalance(data)
        })
    }, [mainContract, pollCounter]);

    const sendIncrement = async () => {
        return mainContract?.sendIncrement(sender, toNano("0.05"), 5)
    }
    const sendDeposit = async () => {
        return mainContract?.sendDeposit(sender, toNano("1"))
    }
    const sendWithdrawalRequest = async () => {
        return mainContract?.sendWithdrawalRequest(sender, toNano("0.05"), toNano('0.3'))
    }

    return {
        address: mainContract?.address?.toString(),
        balance,
        pollCounter,
        ...contractData,
        counter: contractData?.number,

        sendIncrement,
        sendDeposit,
        sendWithdrawalRequest,
    }
}
