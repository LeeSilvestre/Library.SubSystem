import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter ({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            redirect: 'librarylogin'

        },
        {
            path: '/librarylogin',
            component: () => import('../views/AdminLogin.vue')

        },
        {
            path: '/librarydashboard',
            component: () => import('../views/Dashboard.vue')
        },
        {
            path: '/bookinventory',
            component: () => import('../views/Student Profile.vue')
        },
        {
            path: '/pendingbooks',
            component: () => import('../views/Pending Books.vue')
        },

        {
            path: '/records',
            component: () => import('../views/Records.vue')
        },

        {
            path: '/overdue',
            component: () => import('../views/Overdue.vue')
        },
        
        {
            path: '/facultypending',
            component: () => import('../views/Faculty Pending.vue')
        },

        {
            path: '/facultyrecords',
            component: () => import('../views/Faculty Records.vue')
        },

        {
            path: '/categories',
            component: () => import('../views/Categories.vue')
        },

        {
            path: '/bookarchives',
            component: () => import('../views/BookArchives.vue')
        },

        {
            path: '/categoryarchives',
            component: () => import('../views/CategoryArchives.vue')
        },

        {
            path: '/rentalbooks',
            component: () => import('../views/RentalBooks.vue')
        },
        {
            path: '/rentalrecords',
            component: () => import('../views/RentalRecords.vue')
        },

        {
            path: '/loggingreport',
            component: () => import('../views/LoggingReport.vue')
        },   

        {
            path: '/reports',
            component: () => import('../views/Report.vue')
        },  

        {
            path: '/receipt',
            component: () => import('../views/Receipt.vue')
        },    
        
        {
            path: '/pendingreceipt',
            component: () => import('../views/PendingReceipt.vue')
        },      
        {
            path: '/facultyreceipt',
            component: () => import('../views/FacultyPendingReceipt.vue')
        },    
        {
            path: '/rentalreceipt',
            component: () => import('../views/RentalReceipt.vue')
        },     

    ]
})

export default router