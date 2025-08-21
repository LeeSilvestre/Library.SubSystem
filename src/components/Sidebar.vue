<template>
  <aside :class="`${is_expanded ? 'is_expanded' : ''}`">
    <img class="sna-logo" src="/src/assets/SNA Logo with BG.png" alt="">
    <h2 class="sp-text fs-3">Saint Nicholas Academy</h2>
    <p></p>
    <div class="menu-toggle-wrap">
    <button class="menu-toggle" @click="ToggleMenu">
        <div class="material-icons">
          keyboard_double_arrow_right
        </div>
      </button>
    </div>
      <hr>

    <div class="menu">
      <router-link class="button" to="/librarydashboard">
        <span class="material-icons">dashboard</span>
        <span class="text">Dashboard</span>
      </router-link>
      
      <router-link class="button" to="/bookinventory">
        <span class="material-icons">inventory</span>
        <span class="text">Book Inventory</span>
      </router-link>

      <div @click="toggleDropdown('students')" class="button dropdown-button">
        <span class="material-icons">school</span>
        <span class="text">Students</span>
        <span class="material-icons dropdown-icon">{{ isStudentsOpen ? 'expand_less' : 'expand_more' }}</span>
      </div>
      <div v-show="isStudentsOpen" class="dropdown">
        <router-link class="button dropdown-item" to="/pendingbooks">
          <span class="text">Borrowed Books</span>
        </router-link>
        <router-link class="button dropdown-item" to="/overdue">
          <span class="text">Overdue Books</span>
        </router-link>
        <router-link class="button dropdown-item" to="/pendingreceipt">
          <span class="text">With Fine</span>
        </router-link>
        <router-link class="button dropdown-item" to="/records">
          <span class="text">Borrow Records</span>
        </router-link>
      </div>

      <div @click="toggleDropdown('faculty')" class="button dropdown-button">
        <span class="material-icons">groups</span>
        <span class="text">Faculty</span>
        <span class="material-icons dropdown-icon">{{ isFacultyOpen ? 'expand_less' : 'expand_more' }}</span>
      </div>
      <div v-show="isFacultyOpen" class="dropdown">
        <router-link class="button dropdown-item" to="/facultypending">
          <span class="text">Borrowed Books</span>
        </router-link>
        <router-link class="button dropdown-item" to="/facultyreceipt">
          <span class="text">With Fine</span>
        </router-link>
        <router-link class="button dropdown-item" to="/facultyrecords">
          <span class="text">Records</span>
        </router-link>
      </div>

      <div @click="toggleDropdown('rental')" class="button dropdown-button">
        <span class="material-icons">payments</span>
        <span class="text">Rental</span>
        <span class="material-icons dropdown-icon">{{ isRentalOpen ? 'expand_less' : 'expand_more' }}</span>
      </div>
      <div v-show="isRentalOpen" class="dropdown">
        <router-link class="button dropdown-item" to="/rentalbooks">
          <span class="text">Rental Books</span>
        </router-link>
        <router-link class="button dropdown-item" to="/rentalreceipt">
          <span class="text">With Fine</span>
        </router-link>
        <router-link class="button dropdown-item" to="/rentalrecords">
          <span class="text">Rental Records</span>
        </router-link>
      </div>
      <router-link class="button" to="/loggingreport">
        <span class="material-icons">summarize</span>
        <span class="text">Logging Report</span>
      </router-link>
      <!--<router-link class="button" to="/reports">
        <span class="material-icons">report</span>
        <span class="text">Report</span>
      </router-link>-->
      <!--<router-link class="button" to="/receipt">
        <span class="material-icons">receipt</span>
        <span class="text">Receipt</span>
      </router-link>-->
      
    </div>

    <div class="menu-logout">
      <router-link class="button" to="/">
        <span class="material-icons">logout</span>
        <span class="text">Logout</span>
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const is_expanded = ref(localStorage.getItem("is_expanded") === "true")
const isStudentsOpen = ref(false)
const isFacultyOpen = ref(false)
const isRentalOpen = ref(false)
const router = useRouter()

const ToggleMenu = () => {
  is_expanded.value = !is_expanded.value
  localStorage.setItem("is_expanded", is_expanded.value)
}

const selectFirstItem = (section) => {
  if (section === 'students') {
    router.push('/pendingbooks')
  } else if (section === 'faculty') {
    router.push('/facultypending')
  } else if (section === 'rental') {
    router.push('/rentalbooks')
  }
}

const toggleDropdown = (section) => {
  if (section === 'students') {
    isStudentsOpen.value = !isStudentsOpen.value
    isFacultyOpen.value = false
    isRentalOpen.value = false
    if (isStudentsOpen.value) {
      selectFirstItem('students')
    }
  } else if (section === 'faculty') {
    isFacultyOpen.value = !isFacultyOpen.value
    isStudentsOpen.value = false
    isRentalOpen.value = false
    if (isFacultyOpen.value) {
      selectFirstItem('faculty')
    }
  } else if (section === 'rental') {
    isRentalOpen.value = !isRentalOpen.value
    isStudentsOpen.value = false
    isFacultyOpen.value = false
    if (isRentalOpen.value) {
      selectFirstItem('rental')
    }
  }
};
</script>

<style lang="scss" scoped>
aside {
  display: flex;
  flex-direction: column;
  width: calc(2.5rem + 40px);
  min-height: 100vh;
  overflow: hidden;
  padding: 1rem;
  background-color: var(--dark);
  color: var(--light);
  transition: 0.2s ease-out;
  

  .sna-logo {
    height: 2.5rem;
    width: 2.5rem;
    transition: 0.2s ease-out;
    border-radius: 1.1rem;
  }

  .sp-text {
    display: none;
    transition: 0.2s ease-out;
  }

  .menu-toggle-wrap {
    display: flex;
    justify-content: flex-end;
    //position: relative;
    top: 0;
    transition: 0.2s ease-out;
    margin: 5px;

    .menu-toggle {
      transition: 0.2s ease-out;

      .material-icons {
        font-size: 2rem;
        color: var(--light);
        transition: 0.2s ease-out;
      }

      &:hover {
        .material-icons {
          color: var(--primary);
          transform: translateX(0.5rem);
        }
      }
    }
  }

  .button .text {
    opacity: 0;
    transition: 0.3s ease-out;
  }

  .menu {
    margin: -0 -1rem;

    .button {
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: 0.8rem 1rem;
      margin-bottom: 0.5rem;
      transition: 0.2s ease-out;

      .material-icons {
        font-size: 2rem;
        color: var(--light);
        transition: 0.2s ease-out;
      }

      .text {
        color: var(--light);
        transition: 0.2s ease-out;
      }

      &:hover,
      &.router-link-exact-active {
        background-color: #fff;
        margin-left: 0.5rem;
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;

        .material-icons,
        .text {
          color: var(--dark);
        }
      }
    }

    .dropdown-button {
      cursor: pointer;
    }
  }

  .dropdown {
    display: flex;
    flex-direction: column;
    margin-left: 1rem;

    .dropdown-item {
      cursor: pointer;
    }
  }

  .menu-logout {
    margin: -0 -1rem;
    transition: 0.2s ease-out;
    flex: 1;
    display: flex;
    align-items: flex-end;

    .button {
      display: flex;
      align-items: center;
      text-decoration: none;
      padding: 0.8rem 1rem;
      margin-bottom: 0.5rem;
      transition: 0.2s ease-out;

      .material-icons {
        font-size: 2rem;
        color: var(--light);
        transition: 0.2s ease-out;
      }

      .text {
        color: var(--light);
        transition: 0.2s ease-out;
      }

      &:hover,
      &.router-link-exact-active {
        .material-icons,
        .text {
          color: var(--primary);
        }
      }
    }
  }

  &.is_expanded {
    width: var(--sidebar-width);

    .menu-logout {
      display: flex;
      align-items: flex-end;
      margin: -0 2rem;
      transition: 0.2s ease-out;
    }

    .sna-logo {
      height: 9rem;
      width: 9rem;
      transition: 0.2s ease-out;
      align-self: center;
      border-radius: 5rem;
    }

    .sp-text {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      color: #fff;
      opacity: 1;
      display: block;
      transition: 0.2s ease-out;
      text-align: center;
    }

    .menu-toggle-wrap {
      top: -4rem;
      left: 0.5rem;

      .menu-toggle {
        transform: rotate(-180deg);
      }
    }

    .button .text {
      opacity: 1;
    }

    .button {
      .material-icons {
        margin-right: 1rem;
      }
    }
  }

  @media (max-width: 768px) {
    z-index: 99;
  }
}
</style>
