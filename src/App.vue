<template>
  <div id="app">
    <!-- Top Section -->
    <header :class="headerClass">
      <h1>Rock Paper Scissors Game</h1>
      <div class="button-container">
        <div class="network-switcher">
          <select id="network" v-model="selectedNetwork" @change="switchNetwork">
            <option v-for="network in networks" :key="network.id" :value="network.id">{{ network.name }}</option>
          </select>
        </div>
        <div class="wallet-dropdown">
          <button class="wallet-button" @click="connectWallet">
            <span v-if="walletAddress">{{ truncatedAddress }}</span>
            <span v-else>Connect Wallet</span>
          </button>
          <div v-if="walletAddress" class="dropdown-content">
            <button @click="switchAccount">Switch Account</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Bottom Section -->
    <main class="main">
      <div class="game-rooms">
        <div v-for="room in gameRooms" :key="room.id" class="game-room">
          <GameRoomCard
            :room="room"
          />
        </div>
        <button @click="openNewGameModal" class="create-game-button">New Game</button>
      </div>
    </main>

    <NewGameModal
      :visible="isModalVisible"
      @confirm="newGame"
      @cancel="closeNewGameModal"
    />
  </div>
</template>

<script>
import { useMetaMaskWallet } from "vue-connect-wallet";
import { reactive, ref, onMounted } from 'vue';
import GameRoomCard from './components/GameRoomCard.vue';
import NewGameModal from './components/NewGameModal.vue';
import { useGameRoomsStore } from './stores/gameRooms';
import { queryGames, createGame, listenToEvents } from './services/contractService';

export default {
  components: {
    GameRoomCard,
    NewGameModal
  },
  setup() {
    const walletAddress = reactive({ value: "" });
    const walletMT = useMetaMaskWallet();
    const selectedNetwork = ref(11155111);
    const gameRoomsStore = useGameRoomsStore();
    const isModalVisible = ref(false);

    const networks = [
      { id: 11155111, name: 'Sepolia Testnet' },
      { id: 31337, name: 'Localhost Testnet' },
      { id: 1, name: 'Ethereum Mainnet' },
      // Add more networks as needed
    ];

    onMounted(async () => {
      try {
          const choices = ["Rock", "Paper", "Scissors"];
          const stat = ["None", "Created", "Joined", "Revealed", "Expired", "Settled"];
          const results = await queryGames();
          for (let index = 0; index < results.length; index++) {
            const newGameId = index + 1;
            const player1 = results[index][0][0];
            const player2 = results[index][1][0];
            const choice1 = choices[results[index][0][3]];
            const choice2 = choices[results[index][1][3]];
            const createTime = null;
            const expiration = results[index][3].toString();
            const betInWei = results[index][0][1].toString();
            const len = Math.max(betInWei.length - 18, 0);
            const integerPart = len > 0 ? betInWei.slice(0, len) : "0";
            const fractionalPart = betInWei.slice(len).padStart(18, '0');
            const bet = `${integerPart}.${fractionalPart}`;
            const status = stat[results[index][2].toString()];
            console.log(newGameId, player1, player2, choice1, choice2, createTime, expiration, bet, status)
            gameRoomsStore.initGame(newGameId, player1, player2, choice1, choice2, createTime, expiration, bet, status);
          }

          await listenToEvents(gameRoomsStore); // Assuming listenToEvents returns a Promise
      } catch (error) {
          console.error('Error while listening to events:', error);
          // You can handle the error here, e.g., show an error message to the user
      }
    });

    return {
      walletAddress,
      walletMT,
      networks,
      selectedNetwork,
      gameRoomsStore,
      isModalVisible,
    };
  },
  computed: {
    gameRooms() {
      return this.gameRoomsStore.gameRooms;
    },
    truncatedAddress() {
      if (!this.walletAddress.value) return '';
      const address = this.walletAddress.value;
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },
    headerClass() {
      return this.isDarkBackground ? 'header dark' : 'header light';
    },
    isDarkBackground() {
      // You can determine the background color dynamically if needed
      // For now, let's assume it's light
      return false;
    }
  },
  methods: {
    async connectWallet() {
      const accounts = await this.walletMT.connect();
      if (typeof accounts === "string") {
        console.error("An error occurred: " + accounts);
      } else {
        this.walletAddress.value = accounts[0];
      }
    },
    async switchAccount() {
      await this.walletMT.switchAccounts();
    },
    async switchNetwork() {
      try {
        await this.walletMT.switchOrAddChain(this.selectedNetwork);
      } catch (error) {
        console.error("Failed to switch network:", error);
        // Handle the error, for example, by showing an error message to the user
        this.selectedNetwork = this.walletMT.chainId; // Revert to the previous network
      }
    },
    openNewGameModal() {
      this.isModalVisible = true;
    },
    closeNewGameModal() {
      this.isModalVisible = false;
    },
    async newGame({ pickIndex, secret, bet, expiration }) {
      this.closeNewGameModal();
      await createGame(pickIndex, secret, bet, expiration);
    },
  },
};
</script>

<style scoped>
@import './style.css';

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
}

.header.light {
  background-color: #ffffff;
  color: #000000;
}

.header.dark {
  background-color: #000000;
  color: #ffffff;
}

.button-container {
  display: flex;
  align-items: center;
}

.network-switcher,
.wallet-dropdown {
  margin-left: 20px;
  height: 40px; /* Ensure both elements have the same height */
}

.network-switcher select {
  height: 100%;
}

.wallet-button {
  margin: 0px;
  padding: 12px 20px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
}

.wallet-button:hover {
  background-color: #0056b3;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: white;
  min-width: 120px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

.wallet-dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-content button {
  color: black;
  padding: 12px 12px;
  text-decoration: none;
  display: block;
  border: none;
  background: none;
  width: 100%;
}

.main {
  padding: 20px;
}

.game-rooms {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.game-room {
  width: fit-content;
}

.create-game-button {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 110px;
  padding: 20px;
  cursor: pointer;
  background-color: white;
  color: rgb(238, 235, 235);
  border: none;
  border-radius: 4px;
  width: 200px;
  font-size: 4ch;
}

.create-game-button:hover {
  background-color: #0056b3;
}

.game-room-card {
  width: 250px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.game-room-card h2 {
  font-size: 16px;
  margin: 0 0 10px;
}

.game-room-card p {
  margin: 0;
}
</style>