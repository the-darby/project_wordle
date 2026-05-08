const targetWord = "GHOST";
const keyboard = document.getElementById("keyboard");
let currentRow = 0;
let currentTile = 0;
let isGameOver = false;

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

function handleInput(key) {
	if (isGameOver) {
		return;
	}
	const normalizedKey = key.toUpperCase();
	if (normalizedKey === "⌫" || normalizedKey === "BACKSPACE") {
		console.log("Deleting letter");
	} else if (normalizedKey === "ENTER") {
		console.log("Checking guess");
	} else if (/^[A-Z]$/.test(normalizedKey)) {
		console.log(`Adding letter: ${normalizedKey}`);
	}
}



document.addEventListener("keydown", (event) => {
	if (event.key === "Enter") event.preventDefault();
	handleInput(event.key);
});

keyboard.addEventListener("click", (event) => {
	if (event.target.tagName === "BUTTON") {
		handleInput(event.target.id);
	}
});

