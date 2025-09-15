// JavaScript for AcademiaLink

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.classList.add('mobile-menu-btn');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    
    const headerContent = document.querySelector('.header-content');
    headerContent.appendChild(mobileMenuBtn);
    
    const navMenu = document.querySelector('nav ul');
    const authButtons = document.querySelector('.auth-buttons');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('show');
        authButtons.classList.toggle('show');
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                navMenu.classList.remove('show');
                authButtons.classList.remove('show');
            }
        });
    });

    // Feature cards animation
    const featureCards = document.querySelectorAll('.feature-card');
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const featureObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    featureCards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        featureObserver.observe(card);
    });

    // Forum stats counter animation
    const forumStats = document.querySelector('.forum-stats');
    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (forumStats) {
        statObserver.observe(forumStats);
    }

    function animateCounters() {
        const counters = document.querySelectorAll('.stat h3');
        const speed = 200; // The lower the slower
        
        counters.forEach(counter => {
            const target = +counter.innerText.replace('+', '');
            const count = +counter.innerText.replace('+', '');
            const increment = Math.ceil(target / speed);
            
            let currentCount = 0;
            
            const updateCount = () => {
                if (currentCount < target) {
                    currentCount += increment;
                    counter.innerText = currentCount + '+';
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = target + '+';
                }
            };
            
            updateCount();
        });
    }

    // Calendar events - mark past events
    const eventItems = document.querySelectorAll('.event-item');
    const currentDate = new Date();
    
    eventItems.forEach(event => {
        const dateElement = event.querySelector('.event-date');
        const day = parseInt(dateElement.querySelector('.day').textContent);
        const month = dateElement.querySelector('.month').textContent;
        
        // Simple check for past events (this is a simplified version)
        const eventDate = new Date(`${month} ${day}, 2023`);
        
        if (eventDate < currentDate) {
            event.style.opacity = '0.6';
            event.querySelector('.event-details h4').style.textDecoration = 'line-through';
        }
    });

    // Form validation for login/signup (example)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = this.querySelectorAll('input[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'var(--danger)';
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (isValid) {
                // Form is valid, proceed with submission
                this.submit();
            }
        });
    });

    // Theme preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (prefersDarkScheme.matches) {
        document.documentElement.style.setProperty('--light', '#2c3e50');
        document.documentElement.style.setProperty('--dark', '#f5f7fa');
    }

    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', showTooltip);
        el.addEventListener('mouseleave', hideTooltip);
    });

    function showTooltip(e) {
        const tooltipText = this.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    }

    function hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    console.log('AcademiaLink initialized successfully!');
});

// Additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timetimeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { debounce };
}
