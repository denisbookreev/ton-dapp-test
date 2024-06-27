import './App.css'
import {TonConnectButton} from "@tonconnect/ui-react";
import {useMainContract} from "./hooks/useMainContract.ts";
import {useTonConnect} from "./hooks/useTonConnect.ts";
import {fromNano} from "@ton/core";

const CONTRACT_ADDRESS = 'EQBVOxREdGN2gM9UrbwWjZcrPQ77tBbPUxuh2x3I4p6RjmKh'
const MY_ADDRESS = '0QAtRvm9PzdZyG4bykLxBPpxkdSd_EHRx3rukK9NR1WuFjkY'

function App() {
    const {
        address,
        balance,
        counter,
        sendIncrement,
        sendDeposit,
        sendWithdrawalRequest,
    } = useMainContract(CONTRACT_ADDRESS)

    const {connected} = useTonConnect()

    return (
        <div>
            <div>
                <TonConnectButton/>
            </div>
            <div>
                Contract Address: {address ? address.slice(0, 30) : 'Loading'}...
                <br/>
                Contract Balance: {fromNano(balance || 0)}
                <br/>
                Counter value: {counter}
            </div>
            <div>
                {
                    connected && (
                        <a onClick={() => sendIncrement()}>
                            Increment by 5
                        </a>
                    )
                }
            </div>
            <div>
                {
                    connected && (
                        <a onClick={() => sendDeposit()}>
                            Deposit 1 TON
                        </a>
                    )
                }
            </div>
            <div>
                {
                    connected && (
                        <a onClick={() => sendWithdrawalRequest()}>
                            Request Withdraw
                        </a>
                    )
                }
            </div>
        </div>
    )
}

export default App
