import marquee from 'vanilla-marquee'

// Get real vh

(function () {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    window.addEventListener('resize', () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, {passive: true});
}());

// Marquee

new marquee(document.querySelector('.marquee'), {
    duplicated: true,
    duration: 15000,
    gap: 0,
    startVisible: true,
    recalcResize: true
})