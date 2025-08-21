<template>
  <main>
    <div class="top-container">
      <h1 class="bg-title">Dashboard</h1>
      <div class="pendingBooks">
        <span class="material-icons">dashboard</span>
        <span class="text">Dashboard</span>
      </div>
    </div>
    <hr>
    <div class="main-content">
      <div class="top">
        <div class="jhs">
          <div class="total-container">
            <h3><span class="material-icons">school</span>Junior High</h3>
            <v-card flat>
              <v-list-item>
                <v-list-item-content>
                  <div class="total-equipment">
                    <div class="top">
                      <v-card-text>
                        <h2>Attendee Today:</h2>
                        <br>
                        <h1>{{ juniorHighCount }}</h1>
                      </v-card-text>
                    </div>
                    <div class="bottom">
                      <div class="per-item">
                        <v-card-text class="borrowed">
                          <h5>Active Borrow Records:</h5>
                          <br>
                          <h4 style="color:green">{{ borrowedBooks.junior }}</h4>
                        </v-card-text>
                        <v-card-text class="overdue">
                          <h5>Active Overdue Records:</h5>
                          <br>
                          <h4 style="color: orange">{{ overdueBooks.junior }}</h4>
                        </v-card-text>
                        <v-card-text class="damaged">
                          <h5>Records With Fine:</h5>
                          <br>
                          <h4 style="color: red">{{ damagedBooks.junior }}</h4>
                        </v-card-text>
                      </div>
                    </div>
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-card>
          </div>
        </div>
        <div class="shs">
          <div class="total-container">
            <h3><span class="material-icons">school</span>Senior High</h3>
            <v-card flat>
              <v-list-item>
                <v-list-item-content>
                  <div class="total-equipment">
                    <div class="top">
                      <v-card-text>
                        <h2>Attendee Today:</h2>
                        <br>
                        <h1>{{ seniorHighCount }}</h1>
                      </v-card-text>
                    </div>
                    <div class="bottom">
                      <div class="per-item">
                        <v-card-text class="borrowed">
                          <h5>Active Borrow Records:</h5>
                          <br>
                          <h4 style="color:green">{{ borrowedBooks.senior }}</h4>
                        </v-card-text>
                        <v-card-text class="overdue">
                          <h5>Active Overdue Records:</h5>
                          <br>
                          <h4 style="color: orange">{{ overdueBooks.senior }}</h4>
                        </v-card-text>
                        <v-card-text class="damaged">
                          <h5>Records With Fine:</h5>
                          <br>
                          <h4 style="color: red">{{ damagedBooks.senior }}</h4>
                        </v-card-text>
                      </div>
                    </div>
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-card>
          </div>
        </div>
      </div>
      <div class="bottom-container">
        <TotalBorrowedChart
          :juniorHighData="juniorHighData"
          :seniorHighData="seniorHighData"
        />
      </div>
    </div>
  </main>
</template>

<script>
import TotalBorrowedChart from '../components/TotalBorrowedChart.vue';
import axios from 'axios';

export default {
  components: {
    TotalBorrowedChart,
  },
  data() {
    return {
      juniorHighCount: 0,
      seniorHighCount: 0,
      borrowedBooks: { junior: 0, senior: 0 },
      overdueBooks: { junior: 0, senior: 0 },
      damagedBooks: { junior: 0, senior: 0 },
      juniorHighData: [],  // Default empty array
      seniorHighData: [],  // Default empty array
    };
  },
  methods: {
    async fetchDashboardData() {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch all logs
        const logsResponse = await axios.get('/library/logs');
        const logs = logsResponse.data;

        // Fetch all students
        const studentsResponse = await axios.get('/student');
        const studentsResponseData = studentsResponse.data;

        // Check format of students data
        if (studentsResponseData.status !== 200 || !Array.isArray(studentsResponseData.student)) {
          console.error('Unexpected students data format:', studentsResponseData);
          return;
        }

        const students = studentsResponseData.student;

        // Map student ID to grade level
        const gradeLevels = students.reduce((acc, student) => {
          if (student.student_id && student.grade_level) {
            acc[student.student_id] = student.grade_level;
          }
          return acc;
        }, {});

        // Filter logs for today's date and count attendees
        const counts = { junior: 0, senior: 0 };
        logs.forEach(log => {
          const logDate = log.login_date.split('T')[0]; // Extract date from datetime
          if (logDate === today) {
            const gradeLevel = gradeLevels[log.student_id];
            if (gradeLevel < 11) {
              counts.junior += 1;
            } else {
              counts.senior += 1;
            }
          }
        });

        this.juniorHighCount = counts.junior;
        this.seniorHighCount = counts.senior;

        // Fetch borrow status data
        const borrowStatusResponse = await axios.get('/library/borrowstatus');
        const borrowStatusData = borrowStatusResponse.data;

        // Initialize counters
        const borrowCounts = { junior: 0, senior: 0 };
        const overdueCounts = { junior: 0, senior: 0 };
        const fineCounts = { junior: 0, senior: 0 };

        borrowStatusData.forEach(record => {
          const gradeLevel = gradeLevels[record.student_id];
          if (gradeLevel) {
            if (gradeLevel < 11) {
              // Junior High
              if (record.borrow_status === 0) {
                borrowCounts.junior += 1;
              } else if (record.borrow_status === 1) {
                overdueCounts.junior += 1;
              } else if ([5, 6, 7].includes(record.borrow_status)) {
                fineCounts.junior += 1;
              }
            } else {
              // Senior High
              if (record.borrow_status === 0) {
                borrowCounts.senior += 1;
              } else if (record.borrow_status === 1) {
                overdueCounts.senior += 1;
              } else if ([5, 6, 7].includes(record.borrow_status)) {
                fineCounts.senior += 1;
              }
            }
          }
        });

        this.borrowedBooks.junior = borrowCounts.junior;
        this.borrowedBooks.senior = borrowCounts.senior;
        this.overdueBooks.junior = overdueCounts.junior;
        this.overdueBooks.senior = overdueCounts.senior;
        this.damagedBooks.junior = fineCounts.junior;
        this.damagedBooks.senior = fineCounts.senior;

        // Optionally, handle the data for charts or additional processing
        // Example: this.juniorHighData = ...
        // Example: this.seniorHighData = ...

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
  },
  mounted() {
    this.fetchDashboardData();
  },
};
</script>



<style scoped>
.top-container {
  display: flex;
  margin: 0.5rem;
}

.bg-title {
  z-index: -1;
  position: absolute;
  opacity: 10%;
  margin-top: -40px;
  font-size: 100px;
  font-family: Impact, fantasy;
}

.pendingBooks {
  flex: 1;

    .material-icons {
        position: relative;
        color: var(--dark);
        font-size: 2.5rem;
      }
}

.material-icons {
  position: relative;
  color: var(--dark);
  font-size: 2.5rem;
}

.text {
  position: relative;
  color: var(--dark);
  font-size: 2.5rem;
  font-weight: 900;
  bottom: 0.5rem;
  text-shadow: 0 1px 1px;
  margin-left: 1rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  margin-right: 10px;
  gap: 2rem;
}

.top {
  display: flex;
}

.jhs, .shs {
  flex: 1;
}

.total-container {
  margin-right: 1rem;
  flex: 0.5;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.200);
  padding: 1.5rem;
  border-left: 6px solid var(--dark);
  color: var(--dark);
}

h3 {
  text-shadow: 0 0 1px;
  font-size: 20px;
  position: relative;
  bottom: 15px;
}

.material-icons {
  position: relative;
  font-size: 35px;
  top: 12px;
  right: 2px;
}

.total-equipment {
  display: flex;
  flex-direction: column;
}

.top {
  text-align: center;
  padding: 1rem;
  flex: 0.5;
}

h2 {
  color: var(--dark-alt);
  font-weight: 900;
  text-shadow: 0 0 1px;
}

h1 {
  font-size: 46px;
  color: var(--grey);
  font-weight: 900;
}

.bottom {
  flex: 0.5;
  padding: 1rem;
}

h5 {
  color: var(--dark-alt);
  font-weight: 700;
}

h4 {
  font-weight: 900;
  color: var(--grey);
}

.per-item {
  display: flex;
  padding: 0.5rem;
  text-align: center;
  border-radius: 5px;
  gap: 1.5rem;
  padding: 1rem;
}

.borrowed, .overdue, .damaged {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.200);
  border-radius: 10px;
}

.borrowed {
  border-top: 8px solid green;
}

.overdue {
  border-top: 8px solid orange;
}

.damaged {
  border-top: 8px solid red;
}

.v-card {
  border-radius: 10px;
  padding: 0.5rem;
}

.v-list-item-title {
  text-shadow: 0 0 1px;
  font-size: 20px;
  position: relative;
  color: var(--dark);
  padding: 0.5rem;
}

.bottom-container {
  outline: 2px solid;
}
</style>
