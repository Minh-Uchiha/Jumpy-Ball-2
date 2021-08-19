import { changeColor } from "./main.js"

const btn_setting = document.querySelector('i.settings')
const setting = document.querySelector('.manual.settings')
const btn_blue = document.querySelector('.manual.settings .blue')
const btn_red = document.querySelector('.manual.settings .red')
const btn_yellow = document.querySelector('.manual.settings .yellow')

export function openSettings() {
    btn_setting.addEventListener('click', () => {
        gsap.to( setting, {
            transform: 'translateY(0)',
            opacity: 1
        })
    })
}

export function chooseColors() {
    btn_blue.addEventListener('click', () => {
        changeColor(0)
        gsap.to( setting, {
            transform: 'translateY(100vh)',
            opacity: 0
        })
    })
    
    btn_red.addEventListener('click', () => {
        changeColor(1)
        gsap.to( setting, {
            transform: 'translateY(100vh)',
            opacity: 0
        })
    })

    btn_yellow.addEventListener('click', () => {
        changeColor(2)
        gsap.to( setting, {
            transform: 'translateY(100vh)',
            opacity: 0
        })
    })
}