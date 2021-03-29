let i = 2 // 0 и 1 не являются простыми числами
while (i < 100) {
    if (i % 1 == 0 && i & i == 0) {
        console.log(i)
        i++
    }
}