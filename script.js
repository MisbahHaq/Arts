// ================================
// GLOBAL VARIABLES & SETUP
// ================================
gsap.registerPlugin(ScrollTrigger, Observer);
gsap.defaults({ ease: "power1.inOut", duration: 1.5 });

// Add webflow-loaded class immediately
document.documentElement.classList.add('webflow-loaded');

// ================================
// SLIDESHOW SYSTEM
// ================================
class Slideshow {
    constructor(DOM_el, autoplayDirection = -1) {
        this.DOM = {
            el: DOM_el,
            slides: [...DOM_el.querySelectorAll(".slide")],
            slidesInner: [...DOM_el.querySelectorAll(".slide")].map(slide => slide.querySelector(".slide__img"))
        };
        this.current = 0;
        this.slidesTotal = this.DOM.slides.length;
        this.isAnimating = false;
        this.autoplayDirection = autoplayDirection;

        // Set initial state
        this.DOM.slides[this.current].classList.add("slide--current");

        // Start autoplay
        this.interval = setInterval(() => this.navigate(this.autoplayDirection), 4000);
    }

    navigate(direction) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        clearInterval(this.interval);

        const previous = this.current;
        this.current = (this.current + direction + this.slidesTotal) % this.slidesTotal;

        const currentSlide = this.DOM.slides[previous];
        const upcomingSlide = this.DOM.slides[this.current];

        // GSAP timeline for animations
        gsap.timeline({
            defaults: {
                duration: 1.25,
                ease: "expo.inOut"
            },
            onStart: () => {
                gsap.set(upcomingSlide, { zIndex: 99 });
                this.DOM.slides[this.current].classList.add("slide--current");
                updateNavigationIndicator(this.current);
            },
            onComplete: () => {
                gsap.set(upcomingSlide, { zIndex: 1 });
                this.DOM.slides[previous].classList.remove("slide--current");
                this.isAnimating = false;
                this.interval = setInterval(() => this.navigate(this.autoplayDirection), 8000);
            }
        })
            .fromTo(currentSlide, { yPercent: 0 }, { yPercent: -100 * direction }, 0)
            .fromTo(upcomingSlide, { yPercent: 100 * direction }, { yPercent: 0 }, 0);
    }

    next() {
        this.navigate(1);
    }

    prev() {
        this.navigate(-1);
    }

    goTo(index) {
        if (this.isAnimating || index === this.current) return;
        this.isAnimating = true;
        clearInterval(this.interval);

        const previous = this.current;
        this.current = index;

        const currentSlide = this.DOM.slides[previous];
        const upcomingSlide = this.DOM.slides[this.current];

        gsap.timeline({
            defaults: {
                duration: 1.25,
                ease: "expo.inOut"
            },
            onStart: () => {
                gsap.set(upcomingSlide, { zIndex: 99 });
                this.DOM.slides[this.current].classList.add("slide--current");
                updateNavigationIndicator(this.current);
            },
            onComplete: () => {
                gsap.set(upcomingSlide, { zIndex: 1 });
                this.DOM.slides[previous].classList.remove("slide--current");
                this.isAnimating = false;
                this.interval = setInterval(() => this.navigate(this.autoplayDirection), 8000);
            }
        })
            .fromTo(currentSlide, { yPercent: 0 }, { yPercent: -100 }, 0)
            .fromTo(upcomingSlide, { yPercent: 100 }, { yPercent: 0 }, 0);
    }
}

// ================================
// NAVIGATION INDICATOR
// ================================
function updateNavigationIndicator(activeIndex) {
    const indicators = document.querySelectorAll('.slide_dynamic-number');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === activeIndex);
    });
}

// ================================
// INTRO ANIMATION
// ================================
function initIntroAnimation() {
    // Skip intro animation for faster loading
    gsap.set('.intro', { display: 'none' });
    gsap.set('.fixed-logo-top', { autoAlpha: 1 });
    // Start slideshows immediately
    startSlideshows();
}

// ================================
// MENU SYSTEM
// ================================
function initMenu() {
    const menuButton = document.querySelector('.menu-button');
    const menuBlur = document.querySelector('.menu-blur');
    const isMobile = window.innerWidth <= 767;
    const menuElement = isMobile ? document.querySelector('.left-navbar') : document.querySelector('.nav-menu');
    const menuStaggerElements = document.querySelectorAll('.menu-stagger');
    const menuOpen = document.querySelector('.menu-open');
    const menuClose = document.querySelector('.menu-close');

    let menuTimeline;
    let isMenuOpen = false;

    // Create menu animation timeline
    menuTimeline = gsap.timeline({ paused: true });

    menuTimeline
        .to(menuOpen, { y: '-100%', duration: 0.5 })
        .to(menuClose, { y: '0%', duration: 0.5 }, '<');

    if (!isMobile) {
        menuTimeline
            .to(menuElement, { x: 0, duration: 0.5 }, '<')
            .to(menuBlur, { opacity: 1, duration: 0.5 }, '<');
    }

    menuTimeline
        .from(menuStaggerElements, {
            y: 30,
            autoAlpha: 0,
            duration: 1,
            stagger: 0.03,
        }, '<');

    // Menu button click handler
    if (menuButton) {
        menuButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    // Menu blur click handler
    if (menuBlur && !isMobile) {
        menuBlur.addEventListener('click', closeMenu);
    }

    function openMenu() {
        isMenuOpen = true;
        menuElement.classList.add('active');
        if (!isMobile) {
            menuBlur.classList.add('active');
        }
        menuTimeline.play();
        if (!isMobile) {
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMenu() {
        if (!isMenuOpen) return;
        isMenuOpen = false;
        menuElement.classList.remove('active');
        if (!isMobile) {
            menuBlur.classList.remove('active');
        }
        menuTimeline.reverse();
        if (!isMobile) {
            document.body.style.overflow = '';
        }
    }

    // Escape key handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });

    // Handle menu stagger animations
    menuTimeline.eventCallback('onComplete', () => {
        menuStaggerElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate');
            }, index * 50);
        });
    });
}

// ================================
// SLIDESHOW INITIALIZATION
// ================================
let mainSlideshow;
let invertedSlideshow;

function startSlideshows() {
    const slidesContainer = document.querySelector('.slides');
    const invertedSlidesContainer = document.querySelector('.inverted-slides');

    if (slidesContainer && invertedSlidesContainer) {
        mainSlideshow = new Slideshow(slidesContainer, 1);
        invertedSlideshow = new Slideshow(invertedSlidesContainer, -1);

        initNavigationControls();
    }
}

// ================================
// NAVIGATION CONTROLS
// ================================
function initNavigationControls() {
    // Navigation indicators
    const indicators = document.querySelectorAll('.slide_dynamic-number');
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (mainSlideshow) {
                mainSlideshow.goTo(index);
            }
        });
    });

    // Observer for wheel and touch events
    Observer.create({
        type: "wheel,touch,pointer",
        onDown: () => {
            if (mainSlideshow && invertedSlideshow) {
                mainSlideshow.prev();
                invertedSlideshow.next();
            }
        },
        onUp: () => {
            if (mainSlideshow && invertedSlideshow) {
                mainSlideshow.next();
                invertedSlideshow.prev();
            }
        },
        wheelSpeed: 1,
        tolerance: 10
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && mainSlideshow) {
            mainSlideshow.prev();
            if (invertedSlideshow) invertedSlideshow.next();
        } else if (e.key === 'ArrowRight' && mainSlideshow) {
            mainSlideshow.next();
            if (invertedSlideshow) invertedSlideshow.prev();
        }
    });
}

// ================================
// SMOOTH SCROLLING (LENIS)
// ================================
function initSmoothScrolling() {
    if (window.innerWidth <= 767) return;

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
    });

    lenis.on('scroll', () => {
        // Scroll-triggered animations can be added here
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// ================================
// RESPONSIVE BEHAVIOR
// ================================
function handleResponsive() {
    function checkScreenSize() {
        const isMobile = window.innerWidth <= 767;
        const isTablet = window.innerWidth <= 991;

        // Handle mobile menu visibility
        const mobileMenu = document.querySelector('.home_mobile-menu');
        const navLogoLink = document.querySelector('.nav-logo-link');
        const fixedLogo = document.querySelector('.fixed-logo-top');

        if (mobileMenu) {
            mobileMenu.style.display = isMobile ? 'block' : 'none';
        }

        if (navLogoLink) {
            navLogoLink.style.display = isMobile ? 'none' : 'flex';
        }

        if (fixedLogo) {
            fixedLogo.style.opacity = isMobile ? '1' : '0';
        }
    }

    // Check on load and resize
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
}

// ================================
// PERFORMANCE OPTIMIZATIONS
// ================================
function optimizePerformance() {
    // Preload images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
        img.decoding = 'async';
    });

    // Set current slideshow images to eager loading
    const currentSlides = document.querySelectorAll('.slide--current .slide__img');
    currentSlides.forEach(img => {
        img.loading = 'eager';
    });

    // Optimize GSAP animations
    gsap.config({
        force3D: true,
        nullTargetWarn: false
    });

    // Memory cleanup for slideshows when page is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (mainSlideshow) clearInterval(mainSlideshow.interval);
            if (invertedSlideshow) clearInterval(invertedSlideshow.interval);
        } else {
            if (mainSlideshow) {
                mainSlideshow.interval = setInterval(() => mainSlideshow.navigate(mainSlideshow.autoplayDirection), 4000);
            }
            if (invertedSlideshow) {
                invertedSlideshow.interval = setInterval(() => invertedSlideshow.navigate(invertedSlideshow.autoplayDirection), 4000);
            }
        }
    });
}

// ================================
// INITIALIZATION
// ================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('The Only Agency - Initializing...');

    // Initialize all systems
    initSmoothScrolling();
    initMenu();
    handleResponsive();
    optimizePerformance();

    // Start intro animation
    initIntroAnimation();

    // Initialize navigation indicators
    updateNavigationIndicator(0);

    console.log('The Only Agency - Initialized successfully!');
});

// ================================
// ERROR HANDLING
// ================================
window.addEventListener('error', function (e) {
    console.error('The Only Agency - Error:', e.error);
});

// ================================
// UTILITY FUNCTIONS
// ================================
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

// ================================
// EXPORT FOR TESTING
// ================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Slideshow,
        initIntroAnimation,
        initMenu,
        startSlideshows
    };
}