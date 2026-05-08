const targetWord = "GHOST";
const keyboard = document.getElementById("keyboard");
let validWords = [];
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;

function loadDictionary() {
	fetch("word_list.txt")
		.then(response => response.text())
		.then(data => {
			validWords = data.split("\n").map(word => word.trim().toUpperCase());
		});
}

loadDictionary();


function initializeBoard() {
	const board = document.getElementById("board");
	for (let row = 0; row < 6; row++) {
		for (let col = 0; col < 5; col++) {
			const tile = document.createElement('div');
			tile.classList.add("tile");
			tile.id = `tile-${row}-${col}`;
			board.appendChild(tile);
		}
	}
}

initializeBoard();


function initializeKeyboard() {
	const keys = [
		['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
		['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
		['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
	];

	keys.forEach((letterArray) => {
		const row = document.createElement('div');
		row.classList.add("keyboard-row");

		letterArray.forEach((letter, index) => {
			const btn = document.createElement("button");
			btn.textContent = letter;
			btn.classList.add("key");
			btn.id = `${letter}`;

			if (letter === "ENTER") {
				btn.classList.add("large");
			}
			row.appendChild(btn);
		});
		keyboard.appendChild(row);
	});
}

initializeKeyboard();


function addLetter(letter) {
	if (currentTile < 5) {
		const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
		tile.textContent = letter;
		currentTile++;
	}
}

function deleteLetter() {
	if (currentTile > 0) {
		currentTile--;
		const tile = document.getElementById(`tile-${currentRow}-${currentTile}`);
		tile.textContent = "";
	}
}


function handleInput(key) {
	if (isGameOver) {
		return;
	}
	const normalizedKey = key.toUpperCase();
	if (normalizedKey === "⌫" || normalizedKey === "BACKSPACE") {
		deleteLetter();
	} else if (normalizedKey === "ENTER") {
		checkGuess();
	} else if (/^[A-Z]$/.test(normalizedKey)) {
		addLetter(normalizedKey);
	}
}


function getCurrentGuessString() {
	let guess = "";
	for (let i = 0; i < 5; i++) {
		let tile = document.getElementById(`tile-${currentRow}-${i}`);
		guess += tile.textContent;
	}
	return guess;
}

function isValidWord(guess) {
	return validWords.includes(guess);
}

function colorBoardAndKeyboard(guess) {
	let letterCount = {};
	for (let letter of targetWord) {
		if (letterCount[letter]) {
			letterCount[letter] += 1;
		} else {
			letterCount[letter] = 1;
		}
	}
	let tileColors = ["absent", "absent", "absent", "absent", "absent"];
	for (let i = 0; i < 5; i++) {
		if (guess[i] === targetWord[i]) {
			tileColors[i] = "correct";
			letterCount[guess[i]] -= 1;
		}
	}
	for (let i = 0; i < 5; i++) {
		if (tileColors[i] === "correct") {
			continue;
		}
		if (letterCount[guess[i]] > 0) {
			tileColors[i] = "present";
			letterCount[guess[i]] -= 1;
		}
	}

	for (let i = 0; i < 5; i++) {
		let tile = document.getElementById(`tile-${currentRow}-${i}`);
		tile.classList.add(tileColors[i]);

		let key = document.getElementById(guess[i]);
		if (tileColors[i] === "correct") {
			key.classList.remove("present");
			key.classList.remove("absent");
			key.classList.add("correct");
		} else if (tileColors[i] === "present" && !key.classList.contains("correct")) {
			key.classList.remove("absent");
			key.classList.add("present");
		} else if (
			tileColors[i] === "absent" &&
			!key.classList.contains("correct") &&
			!key.classList.contains("present")
		) {
			key.classList.add("absent");
		}
	}

}

function evaluateGameStatus(guess) {
	if (guess === targetWord) {
		isGameOver = true;
		setTimeout(() => {
			alert("You won!");
		}, 100);
	} else if (currentRow === 5) {
		isGameOver = true;
		setTimeout(() => {
			alert("Game Over! The word was " + targetWord);
		}, 100);
	}
}


function checkGuess() {
	if (currentTile !== 5) {
		return;
	}

	const guess = getCurrentGuessString();

	if (!isValidWord(guess)) {
		alert("Not in word list!");
		return;
	}

	colorBoardAndKeyboard(guess);
	evaluateGameStatus(guess);
	
	if (!isGameOver) {
		currentRow++;
		currentTile = 0;
	}

}



document.addEventListener("keydown", (event) => {
	if (event.key === "Enter") event.preventDefault();
	if (!isGameOver) {
		handleInput(event.key);
	}
});

keyboard.addEventListener("click", (event) => {
	if (event.target.tagName === "BUTTON") {
		if (!isGameOver) {
			handleInput(event.target.id);
		}
	}
});


