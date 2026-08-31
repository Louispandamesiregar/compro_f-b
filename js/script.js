document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.overlay');
    const navLinks = document.querySelectorAll('.nav-menu a');

    function toggleMenu() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // 3. Intersection Observer for Scroll Animations
    const fadeElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // 4. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = header.offsetHeight;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 5. Interactive Accordion (About Us Section)
    const accordionBtns = document.querySelectorAll('.accordion-btn');
    const tabMedias = document.querySelectorAll('.tab-media');
    let currentTab = 0;
    let tabInterval;
    const tabDuration = 5000; // 5 seconds per tab

    function activateTab(index) {
        // Remove active class from all
        accordionBtns.forEach(btn => {
            btn.classList.remove('active');
            // Remove animating class to reset animation
            const fill = btn.querySelector('.progress-bar-fill');
            if (fill) {
                fill.classList.remove('animating');
                // Trigger reflow to restart animation
                void fill.offsetWidth; 
            }
        });
        
        tabMedias.forEach(media => media.classList.remove('active'));

        // Add active class to selected
        if (accordionBtns[index]) {
            accordionBtns[index].classList.add('active');
            const fill = accordionBtns[index].querySelector('.progress-bar-fill');
            if (fill) {
                fill.classList.add('animating');
            }
        }
        
        if (tabMedias[index]) {
            tabMedias[index].classList.add('active');
        }

        currentTab = index;
    }

    function nextTab() {
        let nextIndex = currentTab + 1;
        if (nextIndex >= accordionBtns.length) {
            nextIndex = 0; // Loop back to start
        }
        activateTab(nextIndex);
    }

    function startAutoTab() {
        stopAutoTab(); // Clear any existing
        if (accordionBtns.length > 0) {
            // Add animating class to first tab initially
            const firstFill = accordionBtns[0].querySelector('.progress-bar-fill');
            if (firstFill) firstFill.classList.add('animating');
            
            tabInterval = setInterval(nextTab, tabDuration);
        }
    }

    function stopAutoTab() {
        if (tabInterval) clearInterval(tabInterval);
    }

    // Handle Clicks
    accordionBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            stopAutoTab(); // Stop auto-cycling when user interacts
            activateTab(index);
        });
    });

    // Start on load if elements exist
    if (accordionBtns.length > 0) {
        startAutoTab();
    }

    // 6. Product Carousel (Infinite Loop)
    const carouselTrack = document.querySelector('.carousel-track');
    if (carouselTrack) {
        const trackContainer = document.querySelector('.carousel-track-container');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        // Clone cards for infinite loop (prepend + append a full copy)
        const originalCards = Array.from(carouselTrack.children);
        const totalOriginal = originalCards.length;

        // Clone and append
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            carouselTrack.appendChild(clone);
        });
        // Clone and prepend
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            clone.classList.add('clone');
            carouselTrack.insertBefore(clone, carouselTrack.firstChild);
        });

        const allCards = Array.from(carouselTrack.children);
        const totalCards = allCards.length; // originalCards * 3

        // Start at the 2nd card of the middle (original) set
        // Prepended clones = totalOriginal cards, so middle set starts at index totalOriginal
        // We want the 2nd card (index 1) of middle set => totalOriginal + 1
        let currentIndex = totalOriginal + 1;
        let carouselAutoInterval;
        const carouselAutoDuration = 4000;
        let isTransitioning = false;

        function getCardOffset(index) {
            const gap = parseFloat(window.getComputedStyle(carouselTrack).gap) || 16;
            let offset = 0;
            for (let i = 0; i < index; i++) {
                offset += allCards[i].offsetWidth + gap;
            }
            return offset;
        }

        function positionCarousel(animate) {
            if (!animate) {
                carouselTrack.classList.add('no-transition');
            } else {
                carouselTrack.classList.remove('no-transition');
            }

            // Update active class
            allCards.forEach((card, i) => {
                card.classList.toggle('active', i === currentIndex);
            });

            // Calculate translate to center the active card
            const containerWidth = trackContainer.offsetWidth;
            const activeCard = allCards[currentIndex];
            if (!activeCard) return;
            const activeWidth = activeCard.offsetWidth;
            const offset = getCardOffset(currentIndex);
            const centerShift = (containerWidth / 2) - (activeWidth / 2);
            const translateX = -(offset - centerShift);

            carouselTrack.style.transform = `translateX(${translateX}px)`;

            if (!animate) {
                // Force reflow so the no-transition takes effect
                void carouselTrack.offsetHeight;
            }
        }

        function handleTransitionEnd() {
            isTransitioning = false;
            // If we've scrolled into the appended clones, jump back to originals
            if (currentIndex >= totalOriginal * 2) {
                currentIndex = currentIndex - totalOriginal;
                positionCarousel(false);
            }
            // If we've scrolled into the prepended clones, jump forward to originals
            if (currentIndex < totalOriginal) {
                currentIndex = currentIndex + totalOriginal;
                positionCarousel(false);
            }
        }

        carouselTrack.addEventListener('transitionend', handleTransitionEnd);

        function goToNext() {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            positionCarousel(true);
        }

        function goToPrev() {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex--;
            positionCarousel(true);
        }

        function startCarouselAuto() {
            stopCarouselAuto();
            carouselAutoInterval = setInterval(goToNext, carouselAutoDuration);
        }

        function stopCarouselAuto() {
            if (carouselAutoInterval) clearInterval(carouselAutoInterval);
        }

        nextBtn.addEventListener('click', () => {
            stopCarouselAuto();
            goToNext();
            startCarouselAuto();
        });

        prevBtn.addEventListener('click', () => {
            stopCarouselAuto();
            goToPrev();
            startCarouselAuto();
        });

        // Click on card to make it active
        allCards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index === currentIndex || isTransitioning) return;
                stopCarouselAuto();
                isTransitioning = true;
                currentIndex = index;
                positionCarousel(true);
                startCarouselAuto();
            });
        });

        // Resize handler
        window.addEventListener('resize', () => {
            positionCarousel(false);
        });

        // Ensure proper layout once all assets/images are fully loaded on GitHub Pages
        window.addEventListener('load', () => {
            positionCarousel(false);
            startCarouselAuto();
        });

        // Initial position (no animation) + start auto-scroll
        positionCarousel(false);
        startCarouselAuto();
    }
});
