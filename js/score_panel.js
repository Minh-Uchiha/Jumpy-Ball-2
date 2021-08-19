const panel = document.querySelector('.score_panel')
const panel_score = document.querySelector('.points h2')
const canvas_score = document.querySelector('.score p')

export function updateScoreCanvas( score ) {
    canvas_score.innerText = score;
}

export function showPanel( score ) {
    panel.style.display = 'flex';
    panel_score.innerText = score;
}
