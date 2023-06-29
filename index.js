import { generate, wordList } from "./random-words.js";
import { wordLibrary } from "./english.js";
/* 
1. Import filenya tulis kaya yang diatas.
2. di radnomw-words/index.js, import seednya matiin 
*/

// console.log(generate({ minLength: 5, maxLength: 5 }));

let row = 0,
  column = 0,
  inputWord = [],
  winStreak = 0;

let keyboardLock = false;

let generateAnswer = generate({ minLength: 5, maxLength: 5 });
console.log(generateAnswer);

let collectiveAnswer = generateAnswer.split("");

// function checkWord(inputWord, correctWord) {
//   const result = [];
//   for (const [index, input] of inputWord.split("").entries()) {
//     for (const [indexC, inputC] of correctWord.split("").entries()) {
//       if (input === inputC && index === indexC) {
//         result.push("green");
//         break;
//       } else if (input === inputC) {
//         result.push("yellow");
//         break;
//       } else if (indexC === 4) {
//         result.push("gray");
//       }
//     }
//   }
//   return result;
// }

function checkWord(inputWord, correctWord) {
  const pendingResult = [];
  const correctArray = correctWord.split("");
  for (const [index, input] of inputWord.split("").entries()) {
    if (input === correctArray[index]) {
      pendingResult.push("green");
      correctArray[index] = "taken";
    } else {
      pendingResult.push(input);
    }
  }
  for (const [index, pending] of pendingResult.entries()) {
    if (pending === "green") continue;
    for (let i = 0; i < 5; i++) {
      if (pending === correctArray[i] && correctArray[i] !== "taken") {
        correctArray[i] = "taken";
        pendingResult[index] = "yellow";
        break;
      } else if (i === 4) {
        pendingResult[index] = "gray";
      }
    }
  }
  return pendingResult;
}

function checkWin(input) {
  const check = new Set([...input]);
  return !check.has("gray") && !check.has("yellow") ? true : false;
}

/*

word : sayah
guess: nanas


guess[index] === word[index] ? green : guess[index]

["n",g,"n",g,"s"]

check semua yang bukan green  ---> if word[index] !== g


["n",...,"n",...,"s"]

word : [s, a, y, a, h]

n -> s a y a h = gray
n -> s a y a h = gray
s -> s = kuning -> a y a h


*/

const hintBtn = document.querySelector(".btn-hint");

const looseScreen = document.querySelector(".loose");
const winScreen = document.querySelector(".win");

const keys = document.querySelectorAll(".keyboard-key");
const inputRow = document.querySelectorAll(".row");
const mainGrid = document.querySelector(".grid");

const playAgain = document.querySelectorAll(".btn-again");

for (const key of keys) {
  key.addEventListener("click", () => {
    const letter = key.className.split("").slice(-1)[0];

    if (letter === "B") {
      backSpace();
      return;
    }

    if (letter === "E") {
      enter();
      return;
    }

    enterLetter(letter);
  });
}

const allowedKeys = /[a-z]/;

window.addEventListener("keydown", (event) => {
  if (allowedKeys.test(event.key) && event.key.length === 1)
    enterLetter(event.key);
  if (event.key === "Backspace") backSpace();
  if (event.key === "Enter") enter();
});

function enterLetter(input) {
  if (keyboardLock) return;

  if (column === 5) return;

  inputRow[row].querySelector(`.column-${column} .column-front`).textContent =
    input.toUpperCase();
  inputRow[row].querySelector(`.column-${column} .column-back`).textContent =
    input.toUpperCase();

  popAnimation(
    inputRow[row].querySelector(`.column-${column} .column-front`),
    "popout",
    1000
  );

  if (column <= 4) column++;
  if (inputWord.length <= 4) inputWord.push(input);

  console.log(inputWord, column);
}

function backSpace() {
  if (keyboardLock) return;

  if (column === 0) return;
  inputRow[row].querySelector(
    `.column-${column - 1} .column-front`
  ).textContent = "";
  inputRow[row].querySelector(
    `.column-${column - 1} .column-back`
  ).textContent = "";

  inputWord.splice(inputWord.length - 1, 1);
  if (column > 0) column--;
  console.log(inputWord);
}

function enter() {
  if (keyboardLock) return;
  if (!checkValid(inputWord.join(""))) {
    popAnimation(mainGrid, "not-found", 1000);
    return;
  }

  if (inputWord.length !== 5) return;
  const result = checkWord(inputWord.join(""), generateAnswer);
  console.log(inputWord.join(""));
  console.log(result);

  const resultSet = new Set(result);
  if (!resultSet.has("gray") && !resultSet.has("yellow")) {
    winStreak++;
    document.querySelector(".streak").textContent = winStreak;
    setTimeout(() => {
      winScreen.classList.add("open");
    }, 1250);
  }
  flipAnimation(result);

  colorKeyboard(result, inputWord);

  storeCorrectAnswer(inputWord, result, collectiveAnswer);

  console.log(collectiveAnswer);

  if (row === 5) {
    setTimeout(() => {
      lostGame(generateAnswer);
    }, 1250);
    return;
  }
}

function popAnimation(element, className, duration) {
  element.classList.add(className);
  setTimeout(() => {
    element.classList.remove(className);
  }, duration);
}

// console.log([1, 2, 3].splice(-1, 1));
// inputRow[0].querySelector(".row-front").textContent = "B";

/*

1. Click "B";
2. get the string "b";
3. check the current row; -> 1
4. check the current column (detect column with "active" class) -> 1
5. change the word to the input
6. move active class to the next element

*/

function flipAnimation(result) {
  let index = 0;
  keyboardLock = true;
  const animate = setInterval(() => {
    const flippedEl = inputRow[row].querySelector(`.column-${index}`);

    if (result[index] === "gray")
      flippedEl.querySelector(".column-back").style.backgroundColor = "#a4aec4";
    if (result[index] === "yellow")
      flippedEl.querySelector(".column-back").style.backgroundColor = "#f3c237";

    flippedEl.classList.add("flipped");
    if (index === 4) {
      row++;
      column = 0;
      inputWord = [];
      clearInterval(animate);
      keyboardLock = false;
    }
    index++;
  }, 150);
}

function colorKeyboard(color, answer) {
  setTimeout(() => {
    for (const key of keys) {
      const letter = key.className.split("").slice(-1)[0];
      answer.forEach((current, index) => {
        if (letter === current && color[index] === "gray") {
          key.style.backgroundColor = "#a4aec4";
          key.style.color = "white";
        }
        if (letter === current && color[index] === "green") {
          key.style.backgroundColor = "#79b851";
          key.style.color = "white";
        }
        if (letter === current && color[index] === "yellow") {
          key.style.backgroundColor = "#f3c237";
          key.style.color = "white";
        }
      });
    }
  }, 1000);
}

// for (const key of keys) {
//   key.classList.add("green");
// }

/* .keyboard-key.green {
  background-color: #79b851;
  color: white;
}

.keyboard-key.yellow {
  background-color: #f3c237;
  color: white;
}

.keyboard-key.gray {
  background-color: #a4aec4;
  color: white;
} */

function checkValid(input) {
  for (const word of wordLibrary) {
    if (input.toLowerCase() === word) return true;
  }
}

function init() {
  console.log("reset game");
  row = 0;
  column = 0;
  inputWord = [];

  for (const key of keys) {
    key.style.backgroundColor = " #e3ebef";
    key.style.color = "initial";
  }

  for (let row = 0; row < 6; row++) {
    for (let column = 0; column < 5; column++) {
      // console.log(row, column);
      inputRow[row].querySelector(
        `.column-${column} .column-front`
      ).textContent = "";
      inputRow[row].querySelector(
        `.column-${column} .column-back`
      ).textContent = "";
      inputRow[row]
        .querySelector(`.column-${column}`)
        .classList.remove("flipped");
      inputRow[row].querySelector(
        `.column-${column} .column-back`
      ).style.backgroundColor = "#79b851";
    }
  }
  generateAnswer = generate({ minLength: 5, maxLength: 5 });

  collectiveAnswer = generateAnswer.split("");
  console.log(generateAnswer);

  winScreen.classList.remove("open");
  looseScreen.classList.remove("open");
}

playAgain.forEach((current) => {
  current.addEventListener("click", () => {
    init();
  });
});

// Store every correct answer
// function storeCorrectAnswer(newAns) {
//   newAns.forEach((current, index) => {
//     if (current === "green" || current === "yellow")
//       collectiveAnswer[index] = "taken";
//   });
// }

const testdata = ["g", "u", "i", "d", "e"];

function storeCorrectAnswer(answer, colorData, collected) {
  colorData.forEach((current, index) => {
    if (current === "gray") return;

    const i = collected.indexOf(answer[index]);
    collected[i] = "taken";
  });

  // console.log(collectiveAnswer);
}

// storeCorrectAnswer(
//   ["h", "e", "i", "g", "g"],
//   ["gray", "yellow", "green", "yellow", "gray"],
//   testdata
// );
// Lost

function lostGame(answer) {
  const theAnswerWas = document.querySelector(".loose-word");
  winStreak = 0;

  theAnswerWas.textContent = `"${answer.toUpperCase()}"`;
  looseScreen.classList.add("open");
}

hintBtn.addEventListener("click", () => {
  const answerArr = generateAnswer.split("");

  const canShowHint = [];

  collectiveAnswer.forEach((current, index) => {
    if (current !== "taken") canShowHint.push(index);
  });

  const randomIndex =
    canShowHint[Math.floor(Math.random() * canShowHint.length)];
  const randomHint = answerArr[randomIndex];
  collectiveAnswer[randomIndex] = "taken";

  for (const key of keys) {
    if (key.className.split("").slice(-1)[0] === randomHint) {
      key.style.backgroundColor = "#f3c237";
      key.style.color = "white";
      popAnimation(key, "hinted", 1000);
    }
  }
});
