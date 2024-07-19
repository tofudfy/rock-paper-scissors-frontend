import { defineStore } from 'pinia';

export const useGameRoomsStore = defineStore('gameRooms', {
  state: () => ({
    gameRooms: [
      { 
        id: 0, 
        player1: null, player2: null,
        choice1: null, choice2: null,
        createTime: null, expiration: null, 
        bet: null,
        status: 'None',
        winner: null
      },
    ],
  }),
  persist: {
    enabled: false
  },
  actions: {
    initGame(newGameId, player1, player2, choice1, choice2, createTime, expiration, bet, status) {
      const index = this.gameRooms.findIndex(card => card.id == newGameId);
      if (index === -1) {
        this.gameRooms.push({ 
            id: newGameId, 
            player1: player1, player2: player2,
            choice1: choice1, choice2: choice2,
            createTime: createTime, expiration: expiration, 
            bet: bet,
            status: status,
            winner: null
        });
      }
    },
    createGame(newGameId, creator, bet, createTime, expiration) {
        const index = this.gameRooms.findIndex(card => card.id == newGameId);
        if (index === -1) {
            this.gameRooms.push({ 
                id: newGameId, 
                player1: creator, player2: null,
                choice1: null, choice2: null,
                createTime: createTime, expiration: expiration, 
                bet: bet,
                status: 'Created' 
            });
        }
    },
    joinGame(gameId, player2) {
        const index = this.gameRooms.findIndex(card => card.id === gameId);
        if (index !== -1) {
            this.gameRooms[index].player2 = player2;
            this.gameRooms[index].status = 'Joined';
        }
    },
    revealGame(gameId, player, choice) {
        const index = this.gameRooms.findIndex(card => card.id === gameId);
        if (index !== -1) {
            if (this.gameRooms[index].player1 == player) {
                this.gameRooms[index].choice1 = choice
            } 

            if (this.gameRooms[index].player2 == player) {
                this.gameRooms[index].choice2 = choice
            }         
        } 
    },
  },
});