<template>
    <header class="header sticky-lg-top">
        <div class="header-content">
            <div class="sna-label fs-3"><strong>LIBRARY PANEL</strong></div>
            <div class="clock">{{ currentTime }}</div>
        </div>
    </header>
</template>

<script>
export default {
    name: 'Header',
data() {
    return {
      currentTime: ''
    };
  },
  mounted() {
    this.updateTime();
    setInterval(this.updateTime, 1000); // Update time every second
  },
  methods: {
    updateTime() {
      const now = new Date();
      const options = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      this.currentTime = now.toLocaleDateString('en-US', options);
    }
}
}
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    background: #374974;
    height: var(--header-height);
    width: 100%;
    .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
  }
    
    .sna-label{
        flex: 1;
        color: #e2e2e2;
        align-self: center;
        margin-left: 1rem;
    }
    .clock {
    color: #e2e2e2;
    align-self: center;
    margin-right: 1rem;
  }
 
}

</style>