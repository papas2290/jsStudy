/*
Задать температуру в градусах по Цельсию.
Вывести в alert соответствующую температуру в градусах по Фаренгейту.
Подсказка: расчёт идёт по формуле: Tf = (9 / 5) * Tc + 32,
где Tf – температура по Фаренгейту, Tc – температура по Цельсию 
*/

'use strict'
let Tc = Number(prompt('Введите температуру по цельсию: '))
let Tf
Tf = (9 / 5) * Tc + 32
alert('Температура по Фаренгейту: ' + Tf)
