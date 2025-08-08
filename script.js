document.addEventListener('DOMContentLoaded', () => {
            const modeSelection = document.getElementById('modeSelection');
            const gameContainer = document.getElementById('gameContainer');
            const board = document.getElementById('board');
            const cells = document.querySelectorAll('.cell');
            const currentPlayerDisplay = document.getElementById('currentPlayer');
            const playerXDisplay = document.getElementById('playerX');
            const playerODisplay = document.getElementById('playerO');
            const winnerDisplay = document.getElementById('winnerDisplay');
            const botModeBtn = document.getElementById('botModeBtn');
            const friendModeBtn = document.getElementById('friendModeBtn');
            const resetBtn = document.getElementById('resetBtn');
            const backBtn = document.getElementById('backBtn');
            
            let currentPlayer = 'X';
            let gameMode = '';
            let gameActive = true;
            let boardState = ['', '', '', '', '', '', '', '', ''];
            
            const winningCombinations = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                [0, 4, 8], [2, 4, 6]             // diagonals
            ];
            
            // Event listeners
            botModeBtn.addEventListener('click', () => {
                gameMode = 'bot';
                startGame();
            });
            
            friendModeBtn.addEventListener('click', () => {
                gameMode = 'friend';
                startGame();
            });
            
            resetBtn.addEventListener('click', resetGame);
            backBtn.addEventListener('click', returnToMenu);
            
            cells.forEach(cell => {
                cell.addEventListener('click', handleCellClick);
            });
            
            function startGame() {
                modeSelection.style.display = 'none';
                gameContainer.style.display = 'flex';
                resetGame();
            }
            
            function handleCellClick(e) {
                const clickedCell = e.target;
                const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
                
                if (boardState[clickedCellIndex] !== '' || !gameActive) {
                    return;
                }
                
                // Play the move
                boardState[clickedCellIndex] = currentPlayer;
                clickedCell.textContent = currentPlayer;
                clickedCell.classList.add(currentPlayer.toLowerCase(), 'pop-in');
                
                if (checkWin()) {
                    endGame(false);
                    return;
                }
                
                if (checkDraw()) {
                    endGame(true);
                    return;
                }
                
                swapPlayer();
                
                // Bot move if playing against bot
                if (gameMode === 'bot' && gameActive && currentPlayer === 'O') {
                    setTimeout(() => {
                        makeBotMove();
                    }, 600);
                }
            }
            
            function checkWin() {
                return winningCombinations.some(combination => {
                    return combination.every(index => {
                        return boardState[index] === currentPlayer;
                    });
                });
            }
            
            function checkDraw() {
                return boardState.every(cell => cell !== '');
            }
            
            function endGame(draw) {
                gameActive = false;
                
                if (draw) {
                    winnerDisplay.textContent = 'Game Ended in a Draw!';
                    winnerDisplay.className = 'winner-display winner-draw';
                } else {
                    winnerDisplay.textContent = `Player ${currentPlayer} Wins!`;
                    winnerDisplay.className = `winner-display winner-${currentPlayer.toLowerCase()}`;
                }
                winnerDisplay.style.display = 'block';
            }
            
            function swapPlayer() {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                updatePlayerDisplay();
            }
            
            function updatePlayerDisplay() {
                currentPlayerDisplay.textContent = `${gameMode === 'bot' && currentPlayer === 'O' ? 'Bot' : 'Player'} ${currentPlayer}'s Turn`;
                
                playerXDisplay.classList.toggle('active', currentPlayer === 'X');
                playerODisplay.classList.toggle('active', currentPlayer === 'O');
            }
            
            function makeBotMove() {
                // Improved AI using MiniMax algorithm
                function minimax(newBoard, player) {
                    const availableSpots = newBoard.map((cell, index) => cell === '' ? index : -1)
                                                   .filter(index => index !== -1);

                    // Check terminal states
                    if (checkWinner(newBoard, 'O')) return {score: 10};
                    if (checkWinner(newBoard, 'X')) return {score: -10};
                    if (availableSpots.length === 0) return {score: 0};

                    const moves = [];
                    for (let i = 0; i < availableSpots.length; i++) {
                        const move = {};
                        move.index = availableSpots[i];
                        newBoard[move.index] = player;

                        if (player === 'O') {
                            const result = minimax(newBoard, 'X');
                            move.score = result.score;
                        } else {
                            const result = minimax(newBoard, 'O');
                            move.score = result.score;
                        }

                        newBoard[move.index] = '';
                        moves.push(move);
                    }

                    let bestMove;
                    if (player === 'O') {
                        let bestScore = -Infinity;
                        for (let i = 0; i < moves.length; i++) {
                            if (moves[i].score > bestScore) {
                                bestScore = moves[i].score;
                                bestMove = i;
                            }
                        }
                    } else {
                        let bestScore = Infinity;
                        for (let i = 0; i < moves.length; i++) {
                            if (moves[i].score < bestScore) {
                                bestScore = moves[i].score;
                                bestMove = i;
                            }
                        }
                    }

                    return moves[bestMove];
                }

                // Helper function for minimax
                function checkWinner(board, player) {
                    return winningCombinations.some(combination => {
                        return combination.every(index => {
                            return board[index] === player;
                        });
                    });
                }

                // Get best move using minimax
                const newBoard = [...boardState];
                const move = minimax(newBoard, 'O');
                const bestMove = move.index;
                
                // Make the move
                if (bestMove !== -1) {
                    boardState[bestMove] = 'O';
                    cells[bestMove].textContent = 'O';
                    cells[bestMove].classList.add('o', 'pop-in');
                    
                    if (checkWin()) {
                        endGame(false);
                        return;
                    }
                    
                    if (checkDraw()) {
                        endGame(true);
                        return;
                    }
                    
                    swapPlayer();
                }
            }
            
            function resetGame() {
                currentPlayer = 'X';
                gameActive = true;
                boardState = ['', '', '', '', '', '', '', '', ''];
                
                cells.forEach(cell => {
                    cell.textContent = '';
                    cell.className = 'cell';
                });
                
                winnerDisplay.style.display = 'none';
                updatePlayerDisplay();
            }
            
            function returnToMenu() {
                gameContainer.style.display = 'none';
                modeSelection.style.display = 'flex';
                resetGame();
            }
        });