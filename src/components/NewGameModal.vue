<template>
    <div class="modal" v-if="visible">
      <div class="modal-content">
        <h2>Create New Game</h2>
        <form @submit.prevent="confirm">
          <div class="form-group">
            <label for="pickIndex">Pick Index</label>
            <input type="number" v-model="pickIndex" id="pickIndex" required>
            <span v-if="errors.pickIndex" class="error">{{ errors.pickIndex }}</span>
          </div>
          <div class="form-group">
            <label for="secret">Secret</label>
            <input type="text" v-model="secret" id="secret" required>
          </div>
          <div class="form-group">
            <label for="bet">Bet</label>
            <input type="float" v-model="bet" id="bet" required>
            <span v-if="errors.bet" class="error">{{ errors.bet }}</span>
          </div>
          <div class="form-group">
            <label for="expiration">Expiration</label>
            <input type="datetime-local" v-model="expiration" id="expiration" required>
            <span v-if="errors.expiration" class="error">{{ errors.expiration }}</span>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Confirm</button>
            <button type="button" class="btn btn-secondary" @click="cancel">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      visible: Boolean
    },
    data() {
      return {
        pickIndex: '',
        secret: '',
        bet: '',
        expiration: '',
        errors: {}
      };
    },
    methods: {
      validateForm() {
        this.errors = {};
  
        if (![0, 1, 2].includes(parseInt(this.pickIndex))) {
          this.errors.pickIndex = "Pick Index should be 0, 1, or 2.";
        }
        if (!this.bet || isNaN(this.bet)) {
          this.errors.bet = "Bet should be a valid number.";
        }
        const expirationDate = new Date(this.expiration);
        const now = new Date();
        if (!this.expiration || expirationDate <= now) {
          this.errors.expiration = "Expiration should be greater than the current time.";
        }
  
        return Object.keys(this.errors).length === 0;
      },
      confirm() {
        if (this.validateForm()) {
          this.$emit('confirm', {
            pickIndex: this.pickIndex,
            secret: this.secret,
            bet: this.bet,
            expiration: this.expiration
          });
          this.clearForm();
        }
      },
      cancel() {
        this.$emit('cancel');
        this.clearForm();
      },
      clearForm() {
        this.pickIndex = '';
        this.secret = '';
        this.bet = '';
        this.expiration = '';
        this.errors = {};
      }
    }
  };
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    text-align: center;
  }
  .form-group {
    margin-bottom: 15px;
    text-align: left;
  }
  .form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .form-group input {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
  }
  .form-actions {
    display: flex;
    justify-content: space-between;
  }
  .btn {
    padding: 10px 20px;
    cursor: pointer;
    border: none;
    border-radius: 4px;
  }
  .btn-primary {
    background-color: #007bff;
    color: white;
  }
  .btn-secondary {
    background-color: #6c757d;
    color: white;
  }
  .error {
    color: red;
    font-size: 0.875em;
    margin-top: 5px;
  }
  </style>