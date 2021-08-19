const btn_play = document.querySelector('.manual header button')
const manual = document.querySelector('.manual')
const btn_home = document.querySelector('i.home')

export function startGame() {
    btn_play.addEventListener('click', () => {
        gsap.to(manual, {
            duration: 1,
            transform: 'translateY(100vh)',
            opacity: 0
        })
    })
}

export function showManual() {
    btn_home.addEventListener('click', () => {
        gsap.to(manual, {
            duration: 1,
            transform: 'translateY(0vh)',
            opacity: 1
        })
    })
}