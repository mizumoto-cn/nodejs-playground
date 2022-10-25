// in js we write
// const head = ([x]) => x;
// in typescript we write
const head = ([x]: number[]): number => x

const tail = ([,...xs]: number[]): number[] => xs

const product = ([x, ...xs]: number[]): number => {
  if (x === undefined) return 1
  return x * product(xs)
}    

console.log(product([1, 2, 3, 4, 5]))
console.log(head([1, 2, 3, 4, 5]))
console.log(tail([1, 2, 3, 4, 5]))

const qsort = ([x, ...xs]: number[]): number[] => {
    if (x === undefined) return []
    return [
        ...qsort(xs.filter(y => y <= x)),
        x,
        ...qsort(xs.filter(y => y > x))
    ]
}

console.log(qsort([1, 3, 5, 2, 4, 6]))