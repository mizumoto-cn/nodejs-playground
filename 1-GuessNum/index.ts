const isBrowser:boolean = typeof window === 'object'

function showMessage (msg:string):void{
    if (isBrowser){
        alert(msg)
    } else {
        console.log(msg)
    }
}

async function showAndInput(msg:string):Promise<string | null>{
    if (isBrowser){
        return prompt(msg)
    } else {
        return new Promise((resolve, reject) => {
            const readline = require('readline').createInterface({
                input: process.stdin,
                output: process.stdout
            })
            readline.question(msg, (answer: string) => {
                readline.close()
                resolve(answer)
            })
        })
    }
}

async function main(): Promise<void>{
    showMessage('Guess a number between 1 and 100')
    const num: number = Math.floor(Math.random() * 100) + 1
    while (true){
        let answer = await showAndInput('Enter your guess: ')
        if (answer === null){
            continue
        }
        const guess:number = parseInt(answer)
        if (guess === num){
            showMessage('You guessed it!')
            break
        } else if (guess < num){
            showMessage('Too low')
        } else {
            showMessage('Too high')
        }
    }
}

main()
