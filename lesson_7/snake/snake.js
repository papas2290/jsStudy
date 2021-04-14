'use strict'

const settings = {
    rowsCount: 21,  // количество строк.
    colsCount: 21,  // количество колонок.
    speed: 2,   // скорость змейки. 
    winFoodCount: 50  // длина змейки.
}

//  Объект конфига игры, содержащий методы получения настроек и проверки этих настроек.
const config = {
    settings,

    // Инициализация настроек игры.
    init(userSettings) {
        // Записываем переданные настройки в те, которые будут использоваться.
        Object.assign(this.settings, userSettings)
    },

    // Отдает количество строк в игре.
    getRowsCount() {
        return this.settings.rowsCount
    },

    // Отдает количество колонок в игре.
    getColsCount() {
        return this.settings.colsCount
    },

    // Отдает скорость змейки в игре.
    getSpeed() {
        return this.settings.speed
    },

    // Отдает количество еды, которое надо съесть для победы.
    getWinFoodCount() {
        return this.settings.winFoodCount
    },

    // Проверка значений настроек игры.
    // Результат валидации в виде объекта с ошибками.
    validate() {

        const result = {
            // true, если настройки валидны, иначе false.
            isvalid: true, // Объект DTO с результатами валидации.
            errors: [] // массив со всеми ошибками настроек.
        }

        if (this.settings.rowsCount < 10 || this.settings.rowsCount > 30) {
            result.isvalid = false
            result.errors.push('Неверные настройки, значение rowsCount должно быть в диапазоне [10, 30].')
        }

        if (this.settings.colsCount < 10 || this.colsCount > 30) {
            result.isvalid = false
            result.errors.push('Неверные настройки, значение rowsCount должно быть в диапазоне [10, 30].')
        }

        if (this.settings.speed < 1 || this.settings.speed > 10) {
            result.isvalid = false
            result.errors.push('Неверные настройки, значение speed должно быть в диапазоне [1, 10].')
        }

        if (this.settings.winFoodCount < 5 || this.settings.winFoodCount > 50) {
            result.isvalid = false
            result.errors.push('Неверные настройки, значение winLength должно быть в диапазоне [5, 50].')
        }

        return result
    }
}

//  Объект карты с методами отображения и создания игрового поля.
const map = {
    cells: null, // Объект, содержащий все ячейки игры.
    usedCalls: null, // Массив содержащий все занятые ячейки игры.

    // Метод инициализирует и выводит карту для игры.
    init(rowsCount, colsCount) {
        // Контейнер, где будут наши ячейки, первоначально его очистим.
        const table = document.getElementById('game')
        table.innerHTML = ""
        // Объект-хранилище всех клеток пока пустой.
        this.cells = {}
        // Массив со всеми занятыми элементами на карте пока тоже пустой.
        this.usedCalls = []
        // Цикл запустится столько раз, сколько у нас количество строк.
        for (let row = 0; row < rowsCount; row++) {
            // Создаем строку, добавляем ей класс, после добавляем ее в таблицу.
            const tr = document.createElement('tr')
            tr.classList.add('row')
            table.appendChild(tr)
            // Цикл запустится столько раз, сколько у нас количество колонок.
            for (let col = 0; col < colsCount; col++) {
                // Создаем ячейку, добавляем ячейке класс cell.
                const td = document.createElement('td')
                td.classList.add('cell')
                // Записываем в объект всех ячеек новую ячейку.
                this.cells[`x${col.toString()}_y${row.toString()}`] = td
                // Добавляем ячейку в строку.
                tr.appendChild(td)

            }
        }
    },

    // Отображает все объекты на карте.
    // snakePointsArray - Массив с точками змейки.
    // foodPoint - Точка еды.
    render(snakePointsArray, foodPoint) {
        // Чистим карту от предыдущего рендера, всем занятым ячейкам оставляем только класс cell.
        for (const cell of this.usedCalls) {
            cell.className = 'cell'
        }
        // Очищаем массив с занятыми ячейками, при отображении сейчас его соберем заново.
        this.usedCalls = []
        // Отображаем змейку.
        snakePointsArray.forEach(point, idx => {
            // Получаем элемент ячейки змейки по точке point.
            const snakeCell = this.cells[`x${point.x}_y${point.y}`]
            // Если первый элемент массива, значит это голова, иначе тело.
            snakeCell.classList.add(idx === 0 ? 'snakeHead' : 'snakeBody')
            // Добавляем элемент ячейки змейки в массив занятых точек на карте.
            this.usedCalls.push(snakeCell)
        });
        // Получаем элемент ячейки с едой по точке foodPoint.
        const foodCell = this.cells[`x${foodPoint.x}_y${foodPoint.y}`]
        // Отображаем еду.
        foodCell.classList.add('food')
        // Добавляем элемент ячейки еды в массив занятых точек на карте.
        this.usedCalls.push(foodCell)
    },
}

// Объект змейки.
// body - Массив с точками тела змейки.
// direction - направление, куда пользователь направил змейку.
// lastStepDirection - направление, куда сходила змейка прошлый раз.
// maxX - максимальная позиция змейки на карте по оси X
// maxY - максимальная позиция змейки на карте по оси Y

const snake = {
    body: null,
    direction: null,
    lastStepDirection: null,
    maxX: null,
    maxY: null,

    // Инициализирует змейку, откуда она будет начинать и ее направление.
    // startBody - Начальная позиция змейки.
    // direction Начальное направление игрока.
    // maxX Максимальная позиция змейки по оси X.
    //  maxY Максимальная позиция змейки по оси Y.
    init(startBody, direction, maxX, maxY) {
        this.body = startBody
        this.direction = direction
        this.lastStepDirection = direction
        this.maxX = maxX
        this.maxY = maxY
    },

    // Отдает массив со всеми точками змейки.
    getBody() {
        return this.body
    },

    // Отдает прошлое направление змейки.

    getLastStepDirection() {
        return thi.lastStepDirection
    },

    // Проверяет содержит ли змейка переданную точку.
    // point Точка, которую проверяем.
    // true, если змейка содержит переданную точку, иначе false.
    isOnPoint(point) {
        return thi.body.some(snakePoint => snakePoint.x === point.x && snakePoint.y === point.y)
    },

    // Двигает змейку на один шаг.
    makeStep() {
        // Записываем направление движения, которое сейчас произойдет как направление прошлого шага.
        thi.lastStepDirection = this.direction
        // Вставляем следующую точку в начало массива.
        this.body.unshift(this.getNextStepHeadPoint())
        // удаляем последний лишний элемент
        this.body.pop()
    },

    // Добавляет в конец тела змейки копию последнего элемента змейки.
    growUp() {
        // Получаем индекс последней точки в массиве точек змейки (последний элемент this.body).
        const lastBodyIdx = this.body.length - 1
        //  получаем последнюю точку змейки
        const lastBodyPoint = this.body[lastBodyIdx]
        // Клонируем последнюю точку змейки (делаем копию).
        const lastBodyPointClone = Object.assign({}, lastBodyPoint)
        // Добавляем копию в наш массив this.body.
        this.body.push(lastBodyPointClone)
    },

    // Отдает точку, где будет голова змейки если она сделает шаг.
    getNextStepHeadPoint() {
        // Получаем в отдельную переменную голову змейки.
        const firstPoint = this.body[0]
        // Возвращаем точку, где окажется голова змейки в зависимости от направления.
        switch (this.direction) {
            case 'up':
                return { x: firstPoint.x, y: firstPoint.y !== 0 ? firstPoint.y - 1 : this.maxY }
            case 'rigth':
                return { x: firstPoint.x !== this.maxX ? firstPoint.x + 1 : 0, y: firstPoint.y }
            case 'down':
                return { x: firstPoint.x, y: firstPoint.y !== this.maxY ? firstPoint.y + 1 : 0 }
            case 'left':
                return { x: firstPoint.x !== 0 ? firstPoint.x - 1 : this.maxX, y: firstPoint.y }
        }
    },

    // Устанавливает направление змейки.
    // direction Направление змейки.
    setDirection(direction) {
        this.direction = direction
    }
}

// Объект еды.
// x Координата X еды.
// y Координата Y еды.
const food = {
    x: null,
    y: null,
    // Отдает координаты еды.
    getCoordinates() {
        return {
            x: this.x,
            y: this.y,
        }
    },

    // Устанавливает координаты для еды.
    // Определяет соответствует ли точка на которой находится еда той точке что была передана.
    // point Точка, для проверки соответствия точке еды.
    // true, если точки совпали, иначе false.
    isOnPoint(point) {
        return this.x === point.x && this.y === point.y
    }
}

// Статус игры.
// condition Статус игры.
const status = {
    condition: null,

    // Устанавливает статус в "playing".
    setPlaying() {
        this.condition = 'playing';
    },

    // Устанавливает статус в "stopped"
    setStopped() {
        this.condition = 'stopped';
    },

    // Устанавливает статус в "finished".
    setFinished() {
        this.condition = 'finished';
    },

    // Проверяет является ли статус "playing"
    // true, если статус "playing", иначе false.
    isPlaying() {
        return this.condition === 'playing';
    },

    // Проверяет является ли статус "stopped".
    // true, если статус "stopped", иначе false.
    isStopped() {
        return this.condition === 'stopped';
    }
}

// Объект счетчика. Подсчитывает очки пользователя.
// count Очки пользователя.
// countEl DOM-элемент для вставки числа отображающего количество очков пользователя.

const score = {
    count: null,
    countEl: null,

    // Инициализацирует счетчик.
    init() {
        this.countEl = document.getElementById('score-count')
        this.drop()
    },

    // Инкрементирует счетчик.
    increment() {
        this.count++
        this.render()
    },

    // Сбрасывает счетчик.
    drop() {
        this.count = 0
        this.render()
    },

    // Отображает количество очков пользователю.
    render() {
        this.countEl.textContent = this.count
    }
}

// Объект игры.
/**
 * settings Настройки игры.
 * map Объект отображения.
 * snake Объект змейки.
 * food Объект еды.
 * status Статус игры.
 * score Счетчик игры.
 * tickInterval Номер интервала игры.
 * **/

const game = {
    config,
    map,
    snake,
    food,
    status,
    score,
    tickInterval: null,

    // Инициализация игры.
    init(userSettings) {
        // Инициализируем настройки игры.
        this.config.init(userSettings)
        // Получаем результат валидации настроек.
        const validation = this.config.validate()
        // Если настройки игры неверные - сообщаем об ошибках и выходим из метода, игру не запускаем.
        if (!validation.isValid) {
            for (const err of validation.errors) {
                console.error(err)
            }
            return;
        }
        // Инициализируем карту.
        this.map.init(this.config.getRowsCount(), this.config.getColsCount())
        // Инициализируем счетчик.
        this.score.init()
        // Устанавливаем обработчики событий.
        this.setEventHandlers()
        // Ставим игру в начальное положение.
        this.reset()
    },

    // Ставит игру в начальное положение.
    reset() {
        // Ставим статус игры в "остановлена".
        this.stop()
        // Сбрасываем счетчик.
        this.score.drop()
        // Инициализируем змейку.
        this.snake.init(this.getStartSnakeBody(), 'up', this.config.getColsCount() - 1, this.config.getRowsCount() - 1);
        // Ставим еду на карту в случайную пустую ячейку.
        this.food.setCoordinates(this.getRandomFreeCoordinates())
        // Отображаем все что нужно для игры.
        this.render()
    },

    // Ставим статус игры в "играем".
    play() {
        // Ставим статус в 'playing'.
        this.status.setPlaying()
        // Ставим интервал шагов змейки.
        this.tickInterval = setInterval(() => this.tickHandler(), 1000 / this.config.getSpeed())
        // Меняем название кнопки в меню на "Стоп" и делаем ее активной.
        this.setPlayButton('Стоп')
    },

    // Ставим статус игры в "стоп".
    stop() {
        // Ставим статус в 'stopped'.
        this.status.setStopped()
        // Убираем интервал шагов змейки.
        clearInterval(this.tickInterval)
        // Меняем название кнопки в меню на "Старт" и делаем ее активной.
        this.setPlayButton('Старт')
    },

    // Ставим статус игры в "финиш".
    finish() {
        // Ставим статус в 'finished'.
        this.status.setFinished()
        // Убираем интервал шагов змейки.
        clearInterval(this.tickInterval)
        // Меняем название кнопки в меню на "Игра закончена" и делаем ее неактивной.
        this.setPlayButton('Игра закончена', true);
    },

    // Обработчик события тика игры, когда змейка должна перемещаться.
    tickHandler() {
        // Если следующий шаг невозможен, то ставим игру в статус завершенный.
        if (!this.canMakeStep()) {
            return this.finish()
        }
        // Если следующий шаг будет на еду, то заходим в if.
        if (this.food.isOnPoint(this.snake.getNextStepHeadPoint())) {
            // Прибавляем к змейке ячейку.
            this.snake.growUp()
            // Инкрементируем счетчик.
            this.score.increment()
            // Ставим еду в свободную ячейку.
            this.food.setCoordinates(this.getRandomFreeCoordinates())
            // Если выиграли, завершаем игру.
            if (this.isGameWon()) {
                this.finish()
            }
        }
        // Перемещаем змейку.
        this.snake.makeStep()
        // Отрисовываем что получилось после шага.
        this.render()
    },

    // Меняем кнопку с классом playButton.
    /*
    textContent Текст кнопки
    [isDisabled = false] Необходимо ли заблокировать кнопку.
    */
    setPlayButton(textContent, isDisabled = false) {
        // Находим кнопку.
        const playButton = document.getElementById('playButton')
        // Меняем текст внутри кнопки на переданный.
        playButton.textContent = textContent
        // Если необходимо запретить нажатие кнопку - ставим класс disabled, иначе убираем класс disabled.
        isDisabled ? playButton.classList.add('disabled') : playButton.classList.remove('disabled')
    },

    // Возвращает начальную позицию змейки в центре карты.
    // {{x: int, y: int}[]} Точка начальной позиции змейки.
    getStartSnakeBody() {
        return [{
            x: Math.floor(this.config.getColsCount() / 2),
            y: Math.floor(this.config.getRowsCount() / 2)
        }]
    },

    // Ставит обработчики события.
    setEventHandlers() {
        // При клике на кнопку с классом playButton вызвать функцию this.playClickHandler.
        document.getElementById('playButton').addEventListener('click', () => this.playClickHandler())
        // При клике на кнопку с классом newGameButton вызвать функцию this.newGameClickHandler.
        document.getElementById('newGameButton').addEventListener('click', event => this.newGameClickHandler(event))
        // При нажатии кнопки, если статус игры "играем", то вызываем функцию смены направления у змейки.
        document.addEventListener('keydown', event => this.keyDownHandler(event))
    },

    // Отображает все для игры, карту, еду и змейку.
    render() {
        this.map.render(this.snake.getBody(), this.food.getCoordinates())
    },

    // Отдает случайную не занятую точку на карте.
    getRandomFreeCoordinates() {
        // Занятые точки на карте.
        const exclude = [this.food.getCoordinates(), ...this.snake.getBody()]
        // Пытаемся получить точку ничем не занятую на карте.
        while (true) {
            // Случайно сгенерированная точка.
            const rndPoint = {
                x: Math.floor(Math.random() * this.config.getColsCount()),
                y: Math.floor(Math.random() * this.config.getRowsCount()),
            };
            // Если точка ничем не занята, то возвращаем ее из функции.
            if (!exclude.some(exPoint => rndPoint.x === exPoint.x && rndPoint.y === exPoint.y)) {
                return rndPoint
            }
        }
    },

    // Обработчик события нажатия на кнопку playButton.
    playClickHandler() {
        // Если сейчас статус игры "играем", то игру останавливаем, если игра остановлена, то запускаем.
        if (this.status.isPlaying()) {
            this.stop()
        } else if (this.status.isStopped()) {
            this.play()
        }
    },

    // Обработчик события нажатия на кнопку "Новая игра"
    newGameClickHandler() {
        // Ставим игру в начальное положение.
        this.reset()
    },

    // Обработчик события нажатия кнопки клавиатуры.
    keyDownHandler(event) {
        // Если статус игры не "играем", значит обрабатывать ничего не нужно.
        if (!this.status.isPlaying()) {
            return
        }
        // Получаем направление змейки, больше мы не обрабатываем других нажатий.
        const direction = this.getDirectionByCode(event.code)
        // Змейка не может повернуть на 180 градусов, поэтому делаем проверку, можем ли мы назначить направление.
        if (this.canSetDirection(direction)) {
            this.snake.setDirection(direction)
        }
    },

    // Отдает направление змейки в зависимости от переданного кода нажатой клавиши.
    // code Код нажатой клавиши
    getDirectionByCode(code) {
        switch (code) {
            case 'KeyW':
            case 'ArrowUp':
                return 'up'
            case 'KeyD':
            case 'ArrowRight':
                return 'right'
            case 'KeyS':
            case 'ArrowDown':
                return 'down'
            case 'KeyA':
            case 'ArrowLeft':
                return 'left'
            default:
                return ''
        }
    },

    // Определяет можно ли назначить переданное направление змейке.
    // direction Направление, которое проверяем.
    // true, если направление можно назначить змейке, иначе false.
    canSetDirection(direction) {
        // Получаем прошлое направление змейки.
        const lastStepDirection = this.snake.getLastStepDirection()
        // Если прошлое направление змейки не противоположное от direction, возвращаем true.
        return direction === 'up' && lastStepDirection !== 'down' ||
            direction === 'right' && lastStepDirection !== 'left' ||
            direction === 'down' && lastStepDirection !== 'up' ||
            direction === 'left' && lastStepDirection !== 'right'
    },

    // Проверяем произошла ли победа, судим по очкам игрока (длине змейки).
    // true, если игрок выиграл игру, иначе false.
    isGameWon() {
        return this.snake.getBody().length > this.config.getWinFoodCount()
    },

    // Проверяет возможен ли следующий шаг.
    // true если следующий шаг змейки возможен, false если шаг не может быть совершен.
    canMakeStep() {
        // Змейка может сделать шаг если следующая точка не на теле змейки.
        return !this.snake.isOnPoint(this.snake.getNextStepHeadPoint())
    },
}

// При загрузке страницы инициализируем игру.
window.onload = game.init({ speed: 5 })
