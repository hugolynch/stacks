document.addEventListener("DOMContentLoaded", () => {
    // get board (DOM) elements
    const container = document.getElementById("game-container");
    const currentWordDisplay = document.getElementById("current-word");
    const submitButton = document.getElementById("submit-word");
    const feedback = document.getElementById("feedback");

    // fetch word list
    let wordList = new Set();
    fetch("wordlist.txt")
        .then(response => response.text())
        .then(data => {
            wordList = new Set(data.split("\n").map(word => word.trim().toUpperCase()));
            console.log("Wordlist loaded:", wordList.size, "words");
        })
        .catch(err => console.error("Error loading wordlist:", err));

    // generate tile map
    const tileBag = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ**"
        .split('');
    const layers = [
        { size: 4, class: 'layer-4x4', offset: 0 },
        { size: 3, class: 'layer-3x3', offset: 1 },
        { size: 2, class: 'layer-2x2', offset: 2 }
    ];
    const tileMap = new Map(); // Map to store tiles by their coordinates
    layers.forEach((layer, z) => {
        for (let y = layer.offset; y < (layer.size * 2) + layer.offset; y += 2) {
            for (let x = layer.offset; x < (layer.size * 2) + layer.offset; x += 2) {
                const letter = tileBag.length > 0
                    ? tileBag.splice(Math.floor(Math.random() * tileBag.length), 1)[0]
                    : '*';
                const coords = [
                    [x, y, z],
                    [x + 1, y, z],
                    [x, y + 1, z],
                    [x + 1, y + 1, z]
                ];
                for (const coord of coords) {
                    tileMap.set(JSON.stringify(coord), letter);
                }
            }
        }
    });

    // set up game board
    let currentWord = "";
    let history = [];
    const board = [];
    for (const [coords, letter] of tileMap) {
        const [x, y, z] = JSON.parse(coords);
        // skip non top-left coords of a tile
        if (x % 2 !== (z % 2) || y % 2 !== (z % 2)) {
            continue;
        }
    
        // generate the layer div if it does not already exist
        if (board[z] === undefined) {
            const layer = document.createElement('div');
            layer.className = 'layer';
            board[z] = layer;
        }

        // create the tile
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.letter = letter;
        tile.dataset.selected = false;
        // we could generate these two sets at runtime based on "primary" (top-left) coords instead
        tile.dataset.coords = JSON.stringify([
            [x,y,z],
            [x+1,y,z],
            [x,y+1,z],
            [x+1,y+1,z],
        ]);
        if (z > 0) {
            tile.dataset.parents = JSON.stringify([
                [x,y,z-1],
                [x+1,y,z-1],
                [x,y+1,z-1],
                [x+1,y+1,z-1],
            ]);
        }
        tile.style = `grid-row-start: ${x+1}; grid-column-start: ${y+1};`;
        tile.addEventListener('click', (e) => {
            // check if tile is currently available (i.e. has no parents on board)
            const target = e.currentTarget;
            // this code is gross & inefficient but it works ig:
            // if there exists any tile whose primary coords ([x,y,z])
            // or secondary coords ([x+1,y,z], [x,y+1,z], [x+1,y+1,z])
            // match a parent coord for this tile, it is blocked\
            const parentCoords = JSON.parse(target.dataset.parents || '[]');
            for (const child of document.getElementsByClassName('tile')) {
                const childCoords = JSON.parse(child.dataset.coords);
                // ugly hack since [0,0,0] != [0,0,0] in js,
                // so instead we check that for some (parent coord, child coord) combo,
                // x, y, and z are equal
                if (parentCoords.some(pc => childCoords.some(cc => {
                    return pc[0]===cc[0] && pc[1]===cc[1] && pc[2]===cc[2];
                }))) {
                    // if so, the tile is blocked so we stop here
                    return;
                }
                if (childCoords[0][0] === 1 && childCoords[0][1] === 1 && childCoords[0][2] === 0) {
                    console.log(JSON.stringify(childCoords)+' is ok');
                }
            }

            // if tile is selected, deselect it and remove letter from word
            if (target.dataset.selected !== 'false') {
                target.dataset.selected = false;
                // remove the letter from the tile's position in the history
                // (this accounts for cases where the same letter occurs twice in a word)
                const i = history.findIndex(t => t === target);
                currentWord = currentWord.slice(0, i) + currentWord.slice(i + 1)
                history.splice(i, 1);
            // else (if tile is not selected), select it and add letter to word
            } else {
                target.dataset.selected = true;
                currentWord += target.dataset.letter;
                history.push(target);
            }

            // update displayed word
            currentWordDisplay.textContent = currentWord;
        });
        // add corner divs to the tile
        const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
        for (const quadrant of corners) {
            const corner = document.createElement('div');
            corner.className = `corner ${quadrant}`;
            corner.textContent = letter;
            tile.appendChild(corner);
        }
        // append tile to board layer
        board[z].appendChild(tile);
    }
    // draw each layer on the board
    for (const layer of board) {
        // prepend so last layer is rendered at the bottom
        container.prepend(layer);
    }

    // handle submit button
    const wordListUl = document.getElementById("word-list");
    let totalScore = 0; // Initialize total score
    submitButton.addEventListener("click", () => {
        const upperWord = currentWord.toUpperCase();
    
        function generateWildcardPermutations(word) {
            const wildcards = [];
            for (let i = 0; i < word.length; i++) {
                if (word[i] === "*") wildcards.push(i);
            }
    
            if (wildcards.length === 0) {
                return [word];
            }
    
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const permutations = [];
    
            function substitute(current, index) {
                if (index === wildcards.length) {
                    permutations.push(current.join(""));
                    return;
                }
    
                const pos = wildcards[index];
                for (const letter of letters) {
                    current[pos] = letter;
                    substitute(current, index + 1);
                }
                current[pos] = "*";
            }
    
            substitute(word.split(""), 0);
            return permutations;
        }
    
        const possibleWords = generateWildcardPermutations(upperWord);
        const isValidWord = possibleWords.some(word => wordList.has(word));
        if (isValidWord) {
            feedback.textContent = `"${currentWord}" is a valid word!`;
            feedback.style.color = "green";
    
            // Calculate and display word score
            const wordScore = calculateWordScore(currentWord.toUpperCase());
            totalScore += wordScore;

            // add word to word list
            const listItem = document.createElement("li");
            listItem.textContent = `${currentWord.toUpperCase()} (${wordScore})`;
            wordListUl.appendChild(listItem);
    
            // Update total score display
            const totalScoreDisplay = document.getElementById("total-score");
            totalScoreDisplay.textContent = `Score: ${totalScore}`;
    
            // delete used tiles
            document.querySelectorAll('.tile[data-selected="true"]')
                .forEach(t => t.remove());
        } else {
            feedback.textContent = `"${currentWord}" is not a valid word.`;
            feedback.style.color = "red";
    
            // deselect used tiles
            document.querySelectorAll('.tile[data-selected="true"]')
                .forEach(t => t.dataset.selected = false); 
        }
    
        // reset current word
        currentWord = "";
        currentWordDisplay.textContent = "";
        history = [];
    });
    function calculateWordScore(word) {
        // Exclude wildcard tiles (*) from word length for scoring
        const length = word.replace(/\*/g, '').length;
        const scores = {
            1: 0, 2: 1, 3: 3, 4: 5, 5: 8, 6: 12, 7: 17, 8: 23,
            9: 30, 10: 38, 11: 47, 12: 57, 13: 68, 14: 80, 15: 93, 16: 107
        };
        return scores[length] || 0;
    }

    // handle backspace + clear buttons
    const backspaceButton = document.getElementById("backspace-button");
    const clearButton = document.getElementById("clear-button");
    // Backspace functionality
    backspaceButton.addEventListener("click", () => {
        if (currentWord.length > 0) {
            // Remove the last letter from currentWord
            currentWord = currentWord.slice(0, -1);
            // Update the display
            currentWordDisplay.textContent = currentWord;

            // deselect last selected tile
            const last = history.pop();
            if (last) {
                last.dataset.selected = false;
            }
        }
    });
    // Clear functionality
    clearButton.addEventListener("click", () => {
        // Reset currentWord and display
        currentWord = "";
        currentWordDisplay.textContent = "";

        // deselect used tiles
        document.querySelectorAll('.tile[data-selected="true"]')
            .forEach(t => t.dataset.selected = false);
        history = [];
    });
});