import Swiper, {Navigation, EffectCreative} from "swiper";
import {createPopper} from '@popperjs/core';
import {Modal} from 'bootstrap';
import request from 'oc-request';
import IMask from 'imask';

// Get real vh

(function () {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    window.addEventListener('resize', () => {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, {passive: true});
}());

// Phone mask

const phoneInputs = document.querySelectorAll('input[type=tel]');

phoneInputs.forEach((el) => {
    IMask(el, {
        mask: '+{38} (000) 000-00-00'
    });
});

// Cases carousel

const sliderCases = new Swiper('#cases-slider', {
    modules: [Navigation, EffectCreative],
    navigation: {
        nextEl: '.cases__next',
        prevEl: '.cases__prev'
    },
    effect: "creative",
    creativeEffect: {
        prev: {
            translate: [-18, 14, -20],
            opacity: 0.5
        },
        next: {
            translate: ["calc(100% + 30px)", 0, 0],
        },
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
            spaceBetween: 30,
        }
    }
});

// Contact form

const contactsForms = document.querySelectorAll('.form');

if (contactsForms) {
    contactsForms.forEach((el) => {
        el.addEventListener('submit', function (e) {
            e.preventDefault();

            request.sendForm(el, 'emptyForm::onFormSubmit', {
                success: (result) => {
                    el.reset();
                    const thanksModalOb = Modal.getOrCreateInstance(document.getElementById('thanksModal'));
                    thanksModalOb.show();
                },
            });
        });
    });
}

// Change language

document.querySelector(".header__lang").addEventListener("click", (e) => {
    request.sendData('onSwitchLocale', {
        data: {
            locale: e.target.dataset.locale
        },
    });
});