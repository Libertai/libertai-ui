<template>
    <div style="display: inline-block;">
        <q-btn round dense flat icon="wallet" @click="show" class="lt-md" color="white" />
        <q-btn @click="eth_web3_login" color="primary" class="text-semibold border-primary-highlight gt-sm" rounded unelevated no-caps v-if="!account.active">
            Connect Wallet
        </q-btn>
        <q-btn-dropdown color="primary" class="text-semibold border-primary-highlight gt-sm"
        rounded unelevated no-caps
        :label="`${account.address.slice(0, 5)}...${account.address.slice(-5)}`" v-else>
            <div class="row no-wrap q-pa-md q-pt-none bg-primary border-primary-highlight">
                    <!-- <div class="column">
                        <div class="text-h6 q-mb-md">Settings</div>
                        <q-toggle v-model="mobileData" label="Use Mobile Data" />
                        <q-toggle v-model="bluetooth" label="Bluetooth" />
                    </div>

                    <q-separator vertical inset class="q-mx-lg" /> -->

                <div class="column items-center">
                    <!-- <q-avatar size="72px">
                        <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                    </q-avatar> -->

                    <div class="text-small q-mb-xs">{{ account.address }}</div>

                    <q-btn
                        color="secondary" class="text-semibold border-primary-highlight gt-sm"
                        rounded unelevated no-caps
                        label="Disconnect"
                        size="sm"
                        @click="account.disconnect"
                        v-close-popup
                    />
                </div>
            </div>
        </q-btn-dropdown>
    </div>
</template>

<script setup>
import { ethers } from "ethers";
import { ref } from 'vue'
import { aggregates, ethereum } from 'aleph-js'
import { markRaw } from 'vue'
import { useAccount } from '../stores/account'
console.log(ethers)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const account = useAccount()
const channel = ref('LIBERTAI')
const api_server = ref('https://official.aleph.cloud')

async function eth_web3_login() {
    console.log(window.ethereum)
    if (window.ethereum) {
        try {
            // Request account access if needed
            await window.ethereum.enable()
            let provider = new ethers.providers.Web3Provider(window['ethereum'] || window.web3.currentProvider);
            await account.setProvider(provider)
        } catch (error) {
            console.log(error)
            // User denied account access...
        }
    } else {
        alert('No ethereum provider detected. Please install metamask or similar.')
    }
    console.log(account)
    if (!account.active) {
        alert("Error getting web3 account")
        return
    }
}

async function broadcast() {
    let msg = await aggregates.submit(
        account.address,
        'libertai',
        {'registered': true},
        { 'account': account, 'channel': channel.value, 'api_server': api_server.value })
}
</script>

<style scoped>
.modal {
    position: fixed;
    /* Stay in place */
    z-index: 100;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
    color: #000;
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    /* Could be more or less, depending on screen size */
}

/* The Close Button */
.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}
</style>