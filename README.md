# Serverless Wordle Project

This is my first personal project I embarked on during my backend programming studies on [boot.dev](https://www.boot.dev), being a big fan of puzzle games I wanted to recreate the games on the New York Times app, and decided to get my feet wet with a Wordle clone. The result is a fully automated, serverless web app that recreates the core mechanics of Wordle.

>*aside: I didn't set out to do so much front end learning in this project, but here we are, and I'm planning on learning more to add some smooth animations and less obtrusive alerts.*

If you would like to play the game, you can find instructions to play it locally below or hosted on GitHub Pages [here](https://the-darby.github.io/project_wordle/). Every day there is a new word selected from a curated list `word_list.txt` which you can find in the repo. Below you'll find more information on how the code works. Any suggestions on how to improve the game, feel free to submit a PR. If you find a legitimate word that triggers a "Not in word list" alert, create an issue, and I'll add it to the `allowed_words.txt` list!

---

## File Structure

```text
├── .github/workflows/
│   └── daily_word.yml   # The GitHub Actions automation recipe
├── index.html           # Barebones game board template
├── style.css            # Animations, colors, and grids
├── script.js            # Game logic and state management
├── word_list.txt        # The dictionary of solution words
├── allowed_words.txt    # The dictionary of valid 5-letter words allowed as guesses
├── daily_update.py      # The Python backend script
└── daily_word.json      # The auto-generated target word (Updated daily)
```

## How to Play

### Rules of the Game

- Each guess must be a valid five-letter word.
- The color of a tile will change to show you how close your guess was.
- If the tile turns green, the letter is in the word and it is in the correct spot.
- If the tile turns yellow, the letter is in the word, but it is not in the correct spot.
- If the tile turns gray, the letter is not in the word.
- A new puzzle is released each day at midnight (UTC).

### Playing Locally

To run locally, pull down this repo and run it on a local server from the root directory.
Be sure that Python 3.11+ is installed

- Use `python daily_update.py` to get a new word
- Then `python3 -m http.server 8000`
- Open your browser to `http:localhost:8000`

The game functions with either the UI keyboard or your device keyboard

---

## How the Code Works

The game elements are all dynamically rendered to the DOM with JS, the board tiles and keyboard are initialized, guesses are validated and routed, with tiles and keys CSS class list dynamically updated. The python is strictly for accessing the word list to update the daily word JSON file and fetched by the JS script. I designed it this way to make use of GitHub Workflow, allowing it to be an automated, serverless web app.


### The Tech Stack

- JS for game logic and dynamic rendering of HTML elements and CSS classes
- HTML (bare bones) and CSS for animation, styles, and grids
- Python for word picking logic to update JSON
- GitHub Workflow Actions for spinning up a VM to run python script on timer, with (admittedly limited) validation script and updating the repo

### The Flow

We'll use the GitHub workflow automation as a starting point and move into the rendering of the UI and game logic.


#### Automated Daily Word Update
1. The YAML runs a GitHub workflow action that spins up a new VM, get's the repo and installs Python 3.11 to run the `daily_update.py` script.
2. The `daily_update.py` script reads and splits the lines of the `word_list.txt` file of 5-letter answer words, to create a word bank. It then randomly chooses a word from the word bank, and creates a dictionary with the word to push to the `daily_word.json` as a json object.
     ```python
     #Read and split words in word_list.txt
     with open(FILE_PATH, "r") as file:
        #Set word list to word_bank
        word_bank = file.read().splitlines()
     
    if word_bank:
        #Random word choice
        daily_target = random.choice(word_bank).upper()

        #Create dictionary for JSON object
        output_data = {
            "word": daily_target,
            "date_generated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        }

        #Overwrite daily_word.json with new word object
        with open("daily_word.json", "w") as outfile:
            json.dump(output_data, outfile, indent=4)
     ```
4. After the python script runs, the YAML verifies that the only file changed is `daily_word.json` if successfully validated, it pushes the update to the repo.
     ```YAML
     # Security check to ensure only the JSON file changed
    UNEXPECTED_FILES=$(git status --porcelain | grep -v "daily_word.json" || true)
    if [ -n "$UNEXPECTED_FILES" ]; then
      exit 1 # Crash to prevent rogue commits
    fi
     ```
6. In `script.js` the daily word is fetched from the JSON, and set to a variable for validation checks in the gameplay
    ```javascript
    function loadDailyWord() {
    	fetch("daily_word.json")
    		.then(response => {
    			if (!response.ok) throw new Error("file not found");
    			return response.json();
    		})
    		.then(data => {
    			targetWord = data.word;
    			console.log("Daily word loaded");
    		})
    		.catch(error => {
    			console.error("Error loading daily word:", error);
    			targetWord = "ERROR";
    		});
    }
    
    loadDailyWord();
    ```

### Game Engine
1. The list of allowed guess words is fetched from `allowed_words.txt` and set to an array
    ```javascript
    function loadDictionary() {
    	fetch("word_list.txt")
    		.then(response => response.text())
    		.then(data => {
    			validWords = data.split("\n").map(word => word.trim().toUpperCase());
    		});
    }
    
    loadDictionary();
    ```
2. The play board is dynamically rendered as a 5x6 grid of tiles in the DOM with individual id's to be targeted by CSS classes
    ```javascript
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
    ```
3. The UI keyboard is then dynamically rendered with an array of key letters separated by QWERTY rows as separate arrays to build a keyboard. The text content and id of the key is assigned it's value in the array, as well as the class list "key" for styling. Each key is assigned to a row, and each row is appended to the keyboard `<div>` and rendered to the DOM.
    ```javascript
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
    ```
4. The event listeners allow for input on the device keyboard or the UI keyboard and trigger a router function `handleInput()` router.
    ```javascript
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
    ```
5. This handler function `handelInput` is used to determine the event input's intent. On any letter, it triggers `addLetter()`, on input from the delete key or the UI key "", it calls `deleteLetter()`, and on input from the return key or "ENTER" on the UI keyboard calls `checkGuess()` to begin the 5-letter word validation.
    ```javascript
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
    ```
6. The functions `addLetter()` and `deleteLetter()` similarly pull the element of the target tile by using the current row and current column, add or clear the text content of the element, and update the column pointer.
      ```javascript
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
      ```
7. The `checkGuess()` function is used as a state management orchestrator. The initial guard prevents anything other than 5 letter guesses to be used, the text content of the tiles in the row is concatenated into a string and set to `guess`, and passed to `isValidWord()` to triggers an alert if `guess` is not a valid 5-letter word. With a valid word, `guess` is passed to both `colorBoardAndKeyboard()` to begin stylizing the board with letter matching agains `targetWord`, and `evaluateGameStatus` to determine if the game is still won/lost. If the game is still ongoing, `currentRow` is incremented and `currentTile` reset to zero to allow for the next guess word.
    ```javascript
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
    ```
    `isValidWord()` simply checks the `validWords` array for the `guess` word and returns a boolean.
    ```javascript
    function isValidWord(guess) {
    	return validWords.includes(guess);
    }
    ```

#### Coloring the Board & Double Letters Issues

This was the biggest challenge in development because of the possible edge cases and keeping track of letters that were in the `targetWord`, their states being relative to position *and* inclusion, while also updating the UI keyboard and individual tiles appropriately. To address the edge cases of double letters in both the players guess and the target word, I decided to track the letter counts in `targetWord` in an object, use two separate passes for coloring green and yellow tiles for 'correct' and 'present' letters (respectively), and store the results in an array to use for updating the tile's class list in CSS that only upgrades the class from 'absent' -> 'present' -> 'correct' so other tiles would not be mistakenly represented. Here's the breakdown of `colorBoardAndKeyboard`:

1. We start with an empty object, and a loop to store each letter count in a key: value pair in the object
    ```javascript
    function colorBoardAndKeyboard(guess) {
    	let letterCount = {};
    	for (let letter of targetWord) {
    		if (letterCount[letter]) {
    			letterCount[letter] += 1;
    		} else {
    			letterCount[letter] = 1;
    		}
    	}
    ```
2. Next is an array that starts with each letter assumed to be 'absent' and an initial pass over `guess` to see if individual index values match to label the 'correct' letter placements in `guess` and subtract from the `targetWord` letter counts.
    ```javascript
    	let tileColors = ["absent", "absent", "absent", "absent", "absent"];
    	for (let i = 0; i < 5; i++) {
    		if (guess[i] === targetWord[i]) {
    			tileColors[i] = "correct";
    			letterCount[guess[i]] -= 1;
    		}
    	}
    ```
3. A second pass skips over 'correct' tiles, and with the condition of having a non-zero value in the letter count, marks only the appropriate amount of double letters 'present' in the tiles of `guess`.
    ```javascript
    	for (let i = 0; i < 5; i++) {
    		if (tileColors[i] === "correct") {
    			continue;
    		}
    		if (letterCount[guess[i]] > 0) {
    			tileColors[i] = "present";
    			letterCount[guess[i]] -= 1;
    		}
    	}
    
    ```
4. The tiles' class list is updated by id
    ```javascript
    	for (let i = 0; i < 5; i++) {
    		let tile = document.getElementById(`tile-${currentRow}-${i}`);
    		tile.classList.add(tileColors[i]);
    
    ```
5. To keep the keyboard UI keys consistent through gameplay and prevent following guesses or double letters from downgrading a 'correct' key to a 'present' key (green to yellow), there is a set of conditions that only allow a key to upgrade it's class, and sets the appropriate class list in CSS for the UI key.
    ```javascript
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
    ```

#### Ending the Game

The function `evaluateGameStatus()` follows in `checkGuess` to provide win/loss end of game. In my rudimentary clone, I'm using simple alerts with a timeout to allow `colorBoardAndKeyboard()` to finish coloring the tiles before the game is ended. If `guess` matches the `targetWord` the game is won, if `currentRow` is at it's max (index 5 for a total of 6 rows) then the game is lost and the answer is displayed in the alert.
    ```javascript
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
    ```

---

If you read all the way through this, thank you for taking the time. This is my first project from scratch and feedback is always appreciated (particularly if you have pointers on the strategy I used for building this clone). For all you Wordlers out there, I hope this meets your basic expectations of the game, and feel free to submit suggestions for improvements.
