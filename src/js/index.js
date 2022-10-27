import marquee from 'vanilla-marquee'
import AOS from 'aos'
import * as basicScroll from 'basicscroll'

// Parallax when scrolling

document.querySelectorAll('[data-parallax]').forEach((elem) => {

    const _from = elem.getAttribute("data-from") || '0px';
    const _to = elem.getAttribute("data-to") || '200px';

    basicScroll.create({
        elem: elem,
        from: 'top-middle',
        to: 'bottom-top',
        direct: true,
        props: {
            '--ty': {
                from: _from,
                to: _to
            }
        }
    }).start()

});

// AOS

AOS.init({
    startEvent: 'load',
    disable: 'mobile',
    once: true
});

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

const marqueeEl = document.querySelector('.marquee');
if (marqueeEl) {
    new marquee(marqueeEl, {
        duplicated: true,
        duration: 15000,
        gap: 0,
        startVisible: true,
        // recalcResize: true
    });
}

// Toggle panels

const isInViewport = function (start, end) {
    const startEl = start.getBoundingClientRect();
    const endEl = end.getBoundingClientRect();
    return (
        startEl.top <= 0 && endEl.top >= 0
    );
};

const section_2 = document.querySelector('#section-2');
const section_6 = document.querySelector('#section-6');

if (section_2 && section_6) {
    window.addEventListener('scroll', function (event) {
        if (isInViewport(section_2, section_6)) {
            document.body.classList.add('panel-visible');
        } else {
            document.body.classList.remove('panel-visible');
        }
    }, false);
}

(function () {
    let buttons = document.getElementsByClassName('store-button');
    for(var i = 0; i < buttons.length; i++){
        buttons[i].onclick = function() {
            alert("Coming soon™.");
            return false;
        }
    }
})();