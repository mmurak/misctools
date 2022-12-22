// Most of the codes are copied from the sample section found in https://www.kirilv.com/canvas-confetti/
class RandomCongrats {
    constructor() {
        this.pattern = [
//            this.normal,
            this.realistic,
            this.star,
            this.fireworks,
            this.schoolPride,
        ];
    }
    do(p) {
        if (p == 0) {
            let r = Math.trunc(Math.random() * this.pattern.length);
            this.pattern[r]();
        } else {
            this.pattern[p - 1]();
        }
    }
    normal() {
        confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
        });
    }
    realistic() {
        _fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        _fire(0.2, {
            spread: 60,
        });
        _fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });
        _fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });
        _fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
        function _fire(particleRatio, opts) {
            let count = 300;
            let defaults = {
                origin: {y: 0.7 }
            };
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }));
        }
    }
    fireworks() {
        const duration = 5 * 1000;
        const stopDaytime = Date.now() + duration;
        const defaults = {startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const interval = setInterval(function() {
            const timeLeft = stopDaytime - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: _randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: _randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
        function _randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }
    }
    schoolPride() {
        const end = Date.now() + (5 * 1000);
        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                shapes: [ 'star', 'square', 'square', 'square' ],
                colors: ['#ffcc00', '#0000ff']
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                shapes: [ 'star', 'square', 'square', 'square' ],
                colors: ['#ffcc00', '#0000ff']
            });
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
    star() {
        setTimeout(_shoots, 0);
        setTimeout(_shoots, 100);
        setTimeout(_shoots, 200);
        function _shoots() {
            let defaults = {
                spread: 360,
                ticks: 50,
                gravity: 0,
                decay: 0.94,
                startVelocity: 30,
                shapes: ['star'],
                colors: ['3498db', '82e0aa', 'f9e79f', 'a569bd', 'e74c3c']
            };
            confetti({
                ...defaults,
                particleCount: 40,
                scalar: 1.2,
            });
            confetti({
                ...defaults,
                particleCount: 10,
                scalar: 0.75,
            });
        }
    }
}
