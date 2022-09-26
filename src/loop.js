const A = [0, 1, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8, 9, 10, 11]
// remake "A" array using for 3 for loop

const arr = []

for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 6; j++) {
    for (let k = 0; k < 9; k++) {
      arr.push(j + k)
    }
  }
}

console.log(arr)
