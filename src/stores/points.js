import { defineStore } from 'pinia'

import models from '../utils/models.js'
import { aggregates, ethereum } from 'aleph-js'

export const usePoints = defineStore('points', {
  state: () => ({
    points_source: "0xCBFc3EeC41CBBfCAcc50337d712890C47a14ba99",
    api_server: 'https://official.aleph.cloud',
    points: {},
    pending_points: {},
    info: {
      first_time: 0,
      last_time: 0,
      pending_time: 0,
      ratio: 0,
      reward_start: 0,
      daily_decay: 0,
      total_rewards: 0,
      boosted_addresses: []
    }
  }),
  getters: {
    
  },
  actions: {
    // any amount of arguments, return a promise or not
    async update() {
      const points = await aggregates.fetch_one(this.points_source, 'points')
      console.log("points", points)
      this.points = points

      const pending_points = await aggregates.fetch_one(this.points_source, 'pending_points')
      console.log("pending_points", points)
      this.pending_points = pending_points

      const info = await aggregates.fetch_one(this.points_source, 'info')
      console.log("info", points)
      this.info = info
    },

    getAddressPoints(address) {
      // check if the address is in the points (it's an object)
      if (address in this.points) {
        return this.points[address]
      }
      // if not, return 0
      return 0
    },

    getAddressPendingPoints(address) {
      // check if the address is in the points (it's an object)
      if (address in this.pending_points) {
        return this.pending_points[address]
      }
      // if not, return 0
      return 0
    },

    getAddressRealtimePendingPointsInfo(address) {
      const currentTime = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
      const pendingPoints = this.getAddressPendingPoints(address);
      const lastTime = this.info.last_time;
      const pendingTime = this.info.pending_time;
      const totalDuration = pendingTime - lastTime;
      const currentDuration = currentTime - lastTime;
      const hourlyRate = pendingPoints / totalDuration * 3600;
      const currentPendingPoints = (pendingPoints / totalDuration) * currentDuration;
      return {
        hourlyRate: hourlyRate,
        pending: currentPendingPoints
      };
    },

    getAddressRealtimePoints(address) {
      const pendingInfo = this.getAddressRealtimePendingPointsInfo(address);
      return this.getAddressPoints(address) + pendingInfo.pending;
    }
  },
})

