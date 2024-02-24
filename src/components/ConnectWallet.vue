<template>
    <div style="display: inline-block;">
        <q-btn round dense flat icon="wallet" @click="show" class="lt-md" color="white" />
        <q-btn @click="show" color="primary" class="text-semibold border-primary-highlight gt-sm" rounded unelevated no-caps v-if="!account">
            Connect Wallet
        </q-btn>
        <q-btn @click="show" color="primary" class="text-semibold border-primary-highlight gt-sm" rounded unelevated no-caps v-else>
            Connected
        </q-btn>
        <div class="modal show" style="display:block;" v-if="shown">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Connection</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="hide"></button>
                    </div>

                    <!-- <span class="close" @click="hide">&times;</span> -->


                    <div class="modal-body">

                        <p>Good news! You can register to be one of the first to get access to advanced features.</p>
                        <p>Just connect your wallet, and prove ownership by signing a text message to validate your interest.</p>
                        <p v-if="step=='finished'">You're registered, congratulations!</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn text-white" v-if="step=='not-connected'" @click="eth_web3_login">Connect</button>
                        <button type="button" class="btn text-white" v-if="step=='connected'" @click="broadcast">Sign message</button>
                        <button type="button" class="btn text-white" v-if="step=='finished'" @click="hide">Continue chatting</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

import { aggregates, ethereum } from 'aleph-js'
import { markRaw } from 'vue';
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
    data() {
        return {
            shown: false,
            account: null,
            step: 'not-connected',
            channel: 'LIBERTAI',
            api_server: 'https://official.aleph.cloud'
        }
    },
    methods: {
        async eth_web3_login() {
            let account = null
            if (window.ethereum) {
                try {
                    // Request account access if needed
                    await window.ethereum.enable()
                    account = await ethereum.from_provider(window['ethereum'] || window.web3.currentProvider)
                } catch (error) {
                    // User denied account access...
                }
            } else {
                alert('not supported?')
            }
            console.log(account)
            if (!account) {
                alert("Error getting web3 account")
                return
            }
            this.account = markRaw(account)
            this.step = 'connected'
        },

        async broadcast() {
            let msg = await aggregates.submit(
                this.account.address,
                'libertai',
                {'registered': true},
                {
                    'account': this.account,
                    'channel': this.channel,
                    'api_server': this.api_server
                })
            console.log(msg)
            console.log(JSON.stringify(msg))
            // nuls_sign(Buffer.from(this.account.private_key, 'hex'), msg)
            // await broadcast(msg, {api_server: api_server})
            await sleep(1000)
            let status = await aggregates.fetch_one(this.account.address, 'libertai')
            console.log(status)
            if (status.registered) {
                this.step = 'finished'
            }
        },
        show() {
            this.shown = true;
        },
        hide() {
            this.shown = false;
        }
    },
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