import { defineStore } from 'pinia';

import { Get } from 'aleph-sdk-ts/dist/messages/aggregate';

export const usePoints = defineStore('points', {
  state: () => ({
    points_source: '0xCBFc3EeC41CBBfCAcc50337d712890C47a14ba99',
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
      boosted_addresses: [],
    },
  }),
  getters: {},
  actions: {
    // any amount of arguments, return a promise or not
    async update() {
      const aggregateGetConfiguration = {
        APIServer: this.api_server,
        address: this.points_source,
        limit: 1,
      };
      const pointsData = await Get(aggregateGetConfiguration);
      this.points = pointsData.points;
      this.info = pointsData.info;
      this.pending_points = pointsData.pending_points;
      console.log('points', this.points);
      console.log('info', this.info);
      console.log('pending_points', this.pending_points);
    },

    getAddressPoints(address) {
      // check if the address is in the points (it's an object)
      if (address in this.points) {
        return this.points[address];
      }
      // if not, return 0
      return 0;
    },

    getAddressPendingPoints(address) {
      // check if the address is in the points (it's an object)
      if (address in this.pending_points) {
        let points = this.pending_points[address];
        if (points > 0) {
          return points;
        }
      }
      // if not, return 0
      return 0;
    },

    getAddressRealtimePendingPointsInfo(address) {
      const currentTime = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
      const pendingPoints = this.getAddressPendingPoints(address);
      const lastTime = this.info.last_time;
      const pendingTime = this.info.pending_time;
      const totalDuration = pendingTime - lastTime;
      const currentDuration = currentTime - lastTime;
      const hourlyRate = (pendingPoints / totalDuration) * 3600;
      const currentPendingPoints = (pendingPoints / totalDuration) * currentDuration;
      return {
        hourlyRate: hourlyRate,
        pending: Math.max(currentPendingPoints, 0),
      };
    },

    getAddressRealtimePoints(address) {
      const pendingInfo = this.getAddressRealtimePendingPointsInfo(address);
      return this.getAddressPoints(address) + pendingInfo.pending;
    },
  },
});
