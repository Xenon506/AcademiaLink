// JavaScript for AcademiaLink Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initDashboard();
    
    // Initialize charts
    initCharts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
});

// Initialize the dashboard
function initDashboard() {
    console.log('AcademiaLink Dashboard initialized');
    
    // Set current date in the dashboard header
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.querySelector('.dashboard-header p').textContent += ` ${currentDate.toLocaleDateString('en-US', options)}`;
    
    // Initialize mobile menu toggle
    initMobileMenu();
    
    // Initialize notifications
    initNotifications();
    
    // Initialize calendar
    initCalendar();
}

// Initialize mobile menu
function initMobileMenu() {
    const menuToggle = document.createElement('button');
    menuToggle.classList.add('menu-toggle');
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(menuToggle);
    
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target) && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
}

// Initialize notifications
function initNotifications() {
    const notificationBadge = document.querySelector('.notification-badge');
    const notificationModal = createNotificationModal();
    
    notificationBadge.addEventListener('click', function() {
        notificationModal.style.display = 'flex';
    });
}

// Create notification modal
function createNotificationModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.id = 'notifications-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h2>Notifications</h2>
            <div class="notifications-list">
                <div class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-assignment"></i>
                    </div>
                    <div class="notification-content">
                        <h4>New Assignment Posted</h4>
                        <p>Advanced Calculus - Assignment 3 is now available</p>
                        <span class="notification-time">2 hours ago</span>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <div class="notification-content">
                        <h4>Upcoming Deadline</h4>
                        <p>Computer Science Project due in 3 days</p>
                        <span class="notification-time">5 hours ago</span>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon">
                        <i class="fas fa-comment"></i>
                    </div>
                    <div class="notification-content">
                        <h4>New Forum Reply</h4>
                        <p>Dr. Chen replied to your question in Calculus forum</p>
                        <span class="notification-time">1 day ago</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    return modal;
}

// Initialize calendar
function initCalendar() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            // Remove active class from all days
            calendarDays.forEach(d => d.classList.remove('active'));
            
            // Add active class to clicked day
            this.classList.add('active');
            
            // Show events for this day
            showDayEvents(this.textContent);
        });
    });
}

// Show events for a specific day
function showDayEvents(day) {
    // In a real application, this would fetch events from an API
    // For now, we'll use mock data
    const events = {
        '15': [
            { title: 'Advanced Calculus Exam', time: '9:00 AM - 11:00 AM', location: 'Room 305' },
            { title: 'Computer Science Lab', time: '2:00 PM - 4:00 PM', location: 'Lab B' }
        ],
        '18': [
            { title: 'Computer Science Project Submission', time: '11:59 PM', location: 'Online' }
        ],
        '21': [
            { title: 'Physics Seminar', time: '2:00 PM - 4:00 PM', location: 'Auditorium B' }
        ],
        'default': [
            { title: 'No events scheduled', time: '', location: '' }
        ]
    };
    
    const dayEvents = events[day] || events['default'];
    const modal = createDayEventsModal(day, dayEvents);
    modal.style.display = 'flex';
}

// Create day events modal
function createDayEventsModal(day, events) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    
    let eventsHTML = '';
    events.forEach(event => {
        eventsHTML += `
            <div class="event-item">
                <div class="event-icon">
                    <i class="fas fa-calendar-day"></i>
                </div>
                <div class="event-details">
                    <h4>${event.title}</h4>
                    <p>${event.time} | ${event.location}</p>
                </div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h2>Events for October ${day}</h2>
            <div class="events-list">
                ${eventsHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', function() {
        modal.remove();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
    
    return modal;
}

// Initialize charts
function initCharts() {
    // Course progress chart
    const progressCtx = document.createElement('canvas');
    progressCtx.id = 'progress-chart';
    document.querySelector('.dashboard-grid').appendChild(progressCtx);
    
    const progressChart = new Chart(progressCtx, {
        type: 'bar',
        data: {
            labels: ['Advanced Calculus', 'Computer Science', 'Physics', 'Literature', 'History'],
            datasets: [{
                label: 'Completion %',
                data: [75, 60, 85, 45, 30],
                backgroundColor: [
                    'rgba(74, 109, 167, 0.7)',
                    'rgba(122, 154, 204, 0.7)',
                    'rgba(244, 122, 96, 0.7)',
                    'rgba(40, 167, 69, 0.7)',
                    'rgba(255, 193, 7, 0.7)'
                ],
                borderColor: [
                    'rgb(74, 109, 167)',
                    'rgb(122, 154, 204)',
                    'rgb(244, 122, 96)',
                    'rgb(40, 167, 69)',
                    'rgb(255, 193, 7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Upcoming deadlines chart
    const deadlinesCtx = document.createElement('canvas');
    deadlinesCtx.id = 'deadlines-chart';
    document.querySelector('.dashboard-grid').appendChild(deadlinesCtx);
    
    const deadlinesChart = new Chart(deadlinesCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Upcoming Deadlines',
                data: [3, 5, 2, 4, 6, 1, 0],
                fill: false,
                borderColor: 'rgb(244, 122, 96)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Menu item clicks
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // In a real application, this would load the appropriate content
            const sectionName = this.querySelector('span').textContent;
            document.querySelector('.dashboard-header h1').textContent = sectionName;
            
            // Close mobile menu if open
            document.querySelector('.sidebar').classList.remove('active');
        });
    });
    
    // Course item clicks
    const courseItems = document.querySelectorAll('.course-item');
    courseItems.forEach(item => {
        item.addEventListener('click', function() {
            // In a real application, this would navigate to the course page
            const courseName = this.querySelector('h4').textContent;
            showCourseModal(courseName);
        });
    });
    
    // Activity item clicks
    const activityItems = document.querySelectorAll('.activity-item');
    activityItems.forEach(item => {
        item.addEventListener('click', function() {
            // In a real application, this would navigate to the activity detail
            const activityText = this.querySelector('h4').textContent;
            console.log(`Activity clicked: ${activityText}`);
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('keyup', debounce(function(e) {
        if (e.key === 'Enter') {
            performSearch(this.value);
        }
    }, 300));
}

// Show course modal
function showCourseModal(courseName) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    
    // Mock course data
    const courseData = {
        'Advanced Calculus': {
            instructor: 'Dr. Michael Chen',
            progress: 75,
            nextAssignment: 'Problem Set 5',
            dueDate: 'October 20, 2023'
        },
        'Computer Science': {
            instructor: 'Prof. Sarah Johnson',
            progress: 60,
            nextAssignment: 'Project Milestone 2',
            dueDate: 'October 18, 2023'
        },
        'Physics': {
            instructor: 'Dr. Robert Williams',
            progress: 85,
            nextAssignment: 'Lab Report 4',
            dueDate: 'October 22, 2023'
        }
    };
    
    const data = courseData[courseName] || {
        instructor: 'Unknown',
        progress: 0,
        nextAssignment: 'None',
        dueDate: 'N/A'
    };
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h2>${courseName}</h2>
            <div class="course-details">
                <p><strong>Instructor:</strong> ${data.instructor}</p>
                <p><strong>Progress:</strong> ${data.progress}%</p>
                <p><strong>Next Assignment:</strong> ${data.nextAssignment}</p>
                <p><strong>Due Date:</strong> ${data.dueDate}</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-filled">View Course</button>
                <button class="btn btn-outline">View Assignments</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', function() {
        modal.remove();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

// Perform search
function performSearch(query) {
    if (query.trim() === '') return;
    
    // In a real application, this would call a search API
    console.log(`Searching for: ${query}`);
    
    // Show search results modal
    const modal = document.createElement('div');
    modal.classList.add('modal');
    
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h2>Search Results for "${query}"</h2>
            <div class="search-results">
                <p>No results found. This would display actual search results in a real application.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', function() {
        modal.remove();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

// Load initial data
function loadInitialData() {
    // In a real application, this would fetch data from APIs
    // For now, we'll use mock data
    
    // Simulate loading time
    setTimeout(() => {
        // Update notification count
        const notificationCount = Math.floor(Math.random() * 5) + 1;
        document.querySelector('.badge').textContent = notificationCount;
        
        // Update activity feed
        updateActivityFeed();
        
        // Update upcoming deadlines
        updateUpcomingDeadlines();
    }, 1000);
}

// Update activity feed
function updateActivityFeed() {
    // Mock activity data
    const activities = [
        {
            icon: 'fas fa-assignment',
            title: 'Assignment Submitted',
            description: 'You submitted Advanced Calculus Problem Set 4',
            time: '2 hours ago'
        },
        {
            icon: 'fas fa-comment',
            title: 'New Forum Reply',
            description: 'Dr. Chen replied to your question in Calculus forum',
            time: '5 hours ago'
        },
        {
            icon: 'fas fa-file',
            title: 'New Resource Available',
            description: 'Lecture slides for Computer Science Week 5 are now available',
            time: '1 day ago'
        }
    ];
    
    const activityList = document.querySelector('.activity-list');
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('li');
        activityItem.classList.add('activity-item');
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Update upcoming deadlines
function updateUpcomingDeadlines() {
    // Mock deadline data
    const deadlines = [
        {
            title: 'Computer Science Project',
            due: 'October 18, 2023',
            course: 'Computer Science',
            priority: 'high'
        },
        {
            title: 'Physics Lab Report',
            due: 'October 22, 2023',
            course: 'Physics',
            priority: 'medium'
        },
        {
            title: 'History Essay',
            due: 'October 25, 2023',
            course: 'History',
            priority: 'low'
        }
    ];
    
    const deadlinesList = document.querySelector('.deadlines-list');
    if (deadlinesList) {
        deadlinesList.innerHTML = '';
        
        deadlines.forEach(deadline => {
            const deadlineItem = document.createElement('div');
            deadlineItem.classList.add('deadline-item', deadline.priority);
            
            deadlineItem.innerHTML = `
                <div class="deadline-title">${deadline.title}</div>
                <div class="deadline-course">${deadline.course}</div>
                <div class="deadline-date">Due: ${deadline.due}</div>
            `;
            
            deadlinesList.appendChild(deadlineItem);
        });
    }
}

// Utility function: Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Utility function: Format date
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDashboard,
        debounce,
        formatDate
    };
}
