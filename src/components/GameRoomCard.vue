<template>
  <div class="game-room-card">
    <h3>Game Room {{ room.id }}</h3>
    <p>Status: {{ room.status }}</p>
    <p>Player1: {{ formatPlayer(room.player1) }}</p>
    <p>Player2: {{ formatPlayer(room.player2) }}</p>
    <p v-if="room.status === 'Settled'">Winner: {{ room.winner }}</p>
    <button v-if="room.status === 'Created'" @click="openJoinModal">Join Game</button>
    <button v-if="room.status === 'Joined'" @click="openRevealModal">Reveal</button>
    <button v-if="room.status === 'Revealed'" @click="openRevealModal">Reveal</button>

    <div v-if="showJoinModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeJoinModal">&times;</span>
        <h2>Join Game</h2>
        <div>
          <label for="choice">Choose:</label>
          <select v-model="joinChoice">
            <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div>
          <label for="secret">Secret:</label>
          <input type="password" v-model="joinSecret" />
        </div>
        <button @click="submitJoinGame">Submit</button>
      </div>
    </div>
    
    <div v-if="showRevealModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeRevealModal">&times;</span>
        <h2>Reveal Game</h2>
        <div>
          <label for="choice">Choose:</label>
          <select v-model="revealChoice">
            <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
          </select>
        </div>
        <div>
          <label for="secret">Secret:</label>
          <input type="password" v-model="revealSecret" />
        </div>
        <button @click="submitRevealGame">Submit</button>
      </div>
    </div>
  </div>
</template>

<script>
import { joinGame, revealGame } from '../services/contractService';

export default {
  props: {
    room: Object,
  },
  data() {
    return {
      showJoinModal: false,
      showRevealModal: false,
      joinChoice: "",
      joinSecret: "",
      revealChoice: "",
      revealSecret: "",
      options: ["Rock", "Paper", "Scissors"],
    };
  },
  methods: {
    formatPlayer(address) {
      if (address === null) {
        address = "0x0000000000000000000000000000000000000000";
      }
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },
    openJoinModal() {
      this.showJoinModal = true;
    },
    closeJoinModal() {
      this.showJoinModal = false;
      this.joinChoice = "";
      this.joinSecret = "";
    },
    openRevealModal() {
      this.showRevealModal = true;
    },
    closeRevealModal() {
      this.showRevealModal = false;
      this.revealChoice = "";
      this.revealSecret = "";
    },
    async submitJoinGame() {
      const roomId = this.room.id;
      const bet = this.room.bet;
      const pickIndex = this.options.indexOf(this.joinChoice);
      const secret = this.joinSecret;
      await joinGame(roomId, bet, pickIndex, secret)
        .then(() => {
          this.closeJoinModal();
          // this.$emit('join', this.room.id);
        })
        .catch((error) => {
          console.error('Error joining game:', error);
        });
    },
    async submitRevealGame() {
      const roomId = this.room.id;
      const pickIndex = this.options.indexOf(this.revealChoice);
      const secret = this.revealSecret;
      await revealGame(roomId, pickIndex, secret)
        .then(() => {
          this.closeRevealModal();
          // this.$emit('reveal', this.room.id);
        })
        .catch((error) => {
          console.error('Error revealing game:', error);
        });
    },
  },
};
</script>

<style scoped>
.game-room-card {
  border: 1px solid #ccc;
  padding: 20px;
  margin: 10px;
  border-radius: 8px;
  width: calc(50% - 20px);
  box-sizing: border-box;
  text-align: center;
}

button {
  padding: 10px 20px;
  margin: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 10px;
}

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

label {
  display: block;
  margin: 10px 0 5px;
}

input,
select {
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}
</style>
