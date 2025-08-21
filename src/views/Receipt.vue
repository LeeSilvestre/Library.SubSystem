<template>
  <main>
    <div class="center-container" ref="centerContainer">
      <div class="total-student">
        <div class="logo-circle">
          <img src="/src/assets/SNA Logo with BG.png" alt="Logo">
        </div>
        <h1>LIBRARY</h1>
        <p class="date">Date: {{ currentDate }}</p>
        <form>
          <div>
            <label for="name">Name: </label>
            <input type="text" id="name" name="name" placeholder="Enter your name">
          </div>
          <div>
            <label for="year">Year: </label>
            <input type="text" id="grade" name="grade" placeholder="Enter your year">
          </div>
          <div>
            <label for="address">Address: </label>
            <input type="text" id="section" name="section" placeholder="Enter your address">
          </div>
          <div>
            <label for="lost-book">Lost Book: </label>
            <input type="number" id="lost-book" name="lost-book" placeholder="Enter amount" @input="updateTotalAmount">
          </div>
          <div>
            <label for="damaged-book">Damaged Book: </label>
            <input type="number" id="damaged-book" name="damaged-book" placeholder="Enter amount" @input="updateTotalAmount">
          </div>
          <div>
            <label for="overdue-book">Overdue Book: </label>
            <input type="number" id="overdue-book" name="overdue-book" placeholder="Enter amount" @input="updateTotalAmount">
          </div>
          <div class="total-amount">
            <label for="total">Total Amount:</label>
            <input type="text" id="total" name="total" :value="totalAmount" readonly>
          </div>
        </form>
        <div class="signature">
          <p>Librarian Signature</p>
        </div>
      </div>
    </div>
    <button @click="downloadPDF">Print PDF</button>
  </main>
</template>

<script>
import html2pdf from 'html2pdf.js';
export default {
  data() {
    return {
      books: [],
      currentDate: new Date().toLocaleDateString(),
      formData: {
        name: '',
        year: '',
        address: ''
      },
      lostBookAmount: 0,
      damagedBookAmount: 0,
      overdueBookAmount: 0,
    };
  },
  computed: {
    totalAmount() {
      return (this.lostBookAmount + this.damagedBookAmount + this.overdueBookAmount).toFixed(2);
    }
  },
  methods: {
    updateTotalAmount() {
      this.lostBookAmount = parseFloat(document.getElementById('lost-book').value) || 0;
      this.damagedBookAmount = parseFloat(document.getElementById('damaged-book').value) || 0;
      this.overdueBookAmount = parseFloat(document.getElementById('overdue-book').value) || 0;
    },
    downloadPDF() {
      const element = this.$refs.centerContainer;
      const options = {
        margin: 1,
        filename: 'receipt.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      Object.keys(this.formData).forEach(key => {
        if (this.formData[key].trim() === '') {
          this.formData[key] = '';
        }
      });
      html2pdf().from(element).set(options).save();
    }
  }
  
};
</script>

<style lang="scss" scoped>
.center-container {
  width: 80%;
  max-width: 600px;
  min-width: 300px;
  margin: 0 auto;
  position: relative;

  .total-student {
    padding: 1rem;
    background: linear-gradient(135deg, #ece9e6, #ffffff);
    margin-bottom: 2rem;
    color: var(--dark);
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    text-align: left;
    position: relative;
    font-family: Arial, sans-serif;

    .logo-circle {
      position: absolute;
      top: 10px;
      left: 20px;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid #08176d;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;

      img {
        width: 100%;
        height: auto;
      }
    }

    h1 {
      text-align: center;
      margin-bottom: 1rem;
    }

    .date {
      text-align: center;
      margin-bottom: 1rem;
    }

    form {
      display: flex;
      flex-direction: column;

      div {
        margin-bottom: 1.5rem;

        label {
          display: inline-block;
          width: 200px;
          color: #08176d;
          font-weight: bold;
        }

        input {
          width: 100%;
          padding: 0.5rem;
          border: none;
          border-bottom: 2px solid #08176d;
          border-radius: 0;
          background: transparent;
          color: #333;
          font-size: 1rem;

          &:focus {
            outline: none;
            border-bottom: 2px solid #12016d;
          }

          &::placeholder {
            color: #999;
          }
        }
      }

      .total-amount {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #08176d;
        display: flex;
        justify-content: space-between;
        align-items: center;

        label {
          color: #08176d;
          font-weight: bold;
          font-size: 1.1rem;
        }

        input {
          width: 150px;
          padding: 0.5rem;
          border: none;
          border-bottom: 2px solid #08176d;
          border-radius: 0;
          background: transparent;
          color: #333;
          font-size: 1rem;
          text-align: right;
        }
      }
    }

    .signature {
      margin-top: 2rem;
      text-align: right;

      p {
        display: inline-block;
        border-top: 1px solid #000;
        padding-top: 0.5rem;
        width: 200px;
      }
    }
  }
}
</style>
