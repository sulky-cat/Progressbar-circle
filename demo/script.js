import ProgressBar from "./../src/ProgressBar.js";

/**
 * min +
 * max +
 * current +
 * clockwise +
 * angle +
 * 
 * animation duration +
 * animation trigger +
 * animation cb +
 * animation timeFunc https://gizma.com/easing/ +
 * 
 * text +
 * text formatText +
 */

// Example 1 Стандартное поведените
const ex_1_render = document.querySelector('.ex-1')
new ProgressBar(ex_1_render)
// Example 2 Без анимации
const ex_2_render = document.querySelector('.ex-2')
new ProgressBar(ex_2_render, {
   animation: false,
})
// Example 3 Без циф
const ex_3_render = document.querySelector('.ex-3')
new ProgressBar(ex_3_render, {
   text: false,
   max: 10,
   current: 9
})
// Example 4 Отрицательный диапазон
const ex_4_render = document.querySelector('.ex-4')
new ProgressBar(ex_4_render)
// Example 5 Другие настрйоки анимации
const ex_5_render = document.querySelector('.ex-5')
const ex_5_cb = document.createElement('div')
ex_5_cb.classList.add('test')
ex_5_cb.innerHTML = 'Вывод callback функции. Current: <span></span>'
ex_5_render.parentElement.append(ex_5_cb)
new ProgressBar(ex_5_render, {
   min: 0,
   max: 100,
   current: 77,
   animation: {
      duration: 3000,
      timeFunc: (time, current, duration, min) => {
         // easeInOutQuad https://gizma.com/easing/#easeInOutQuad
         time /= duration / 2;
         if (time < 1) return current / 2 * time * time + min;
         time--;
         return -current / 2 * (time * (time - 2) - 1) + min;
      },
      cb: (current) => {
         ex_5_cb.children[0].innerHTML = current.toFixed(2)
      },
   }
})
// Example 6 Анимация по триггеру
const ex_6_render = document.querySelector('.ex-6')
document.querySelector('.section_button_ex-6').onclick = () => ex_6.animation({})
const ex_6 = new ProgressBar(ex_6_render, {
   current: 45,
   animation: { trigger: true }
})
// Example 7 Другой угол начала + направление
const ex_7_render = document.querySelector('.ex-7')
new ProgressBar(ex_7_render, {
   current: 6,
   angle: 0,
   max: 6,
   clockwise: false,
   animation: {
      timeFunc: function (time, cur, dur, min) {
         const step = time / dur * cur
         return Math.ceil(step)
      }
   }
})
// Example 8 Другой угол начала + направление
const ex_8_render = document.querySelector('.ex-8')
new ProgressBar(ex_8_render, {
   current: 99,
})
// Example 9 Форматирование текста
const ex_9_render = document.querySelector('.ex-9')
const ex_9 = new ProgressBar(ex_9_render, {
   max: 30,
   current: 27,
   text: {
      formatText: (cur) => `${cur}/${ex_9.max}`
   }
})
ex_9.svg.insertAdjacentHTML('beforeend', `
<defs>
    <linearGradient id="grad" x1="0" y1="0" x2="100%" y2="100%">
        <stop stop-color="steelblue" offset="0" />
        <stop stop-color="red" offset="100%" />
    </linearGradient>
</defs>
`)
// Example 9 Форматирование текста
const ex_10_render = document.querySelector('.ex-10')
const ex_10 = new ProgressBar(ex_10_render, {
   max: 5,
   animation: {
      trigger: true,
   }
})
ex_10.animation({
   current: 3,
   duration: 1000,
}).then(() => {
   ex_10.renderElement.insertAdjacentHTML('afterbegin', '<p>Конец выполнения</p>')
})