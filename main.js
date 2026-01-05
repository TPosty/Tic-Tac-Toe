const player_one_name = document.querySelector(".player_one_name");
const player_two_name = document.querySelector(".player_two_name");
const start_game_button = document.querySelector(".start_game_button");
const setup_page_container = document.querySelector(".setup_page");
const board_container = document.querySelector(".board_container");
const player_display_name_turn = document.querySelector(".current_player_name");

function Cell() {
    let current_marker = "";

    const set_marker = (new_marker) => {
        current_marker = new_marker;
    };

    const get_marker = () => current_marker;

    return {
        set_marker,
        get_marker,
    };
}

function Gameboard() {
    // Gameboard will control and actually set the gameboard itself. It SHOULD NOT control anything else such as turns, etc.

    // What are things that a gameboard does?
    // Keeps track of the board state
    // Places a tile in the board array
    // Keeps track of the board state (i.e. if there is a winner or match on the board anywhere)

    const ROWS = 3;
    const COLS = 3;
    let gameboard = [];

    for (let i = 0; i < ROWS; i++) {
        gameboard.push([]);
        for (let j = 0; j < COLS; j++) {
            gameboard[i].push(Cell());
        }
    }

    const place_marker = (row, col, marker) => {
        const error_message_text = document.querySelector(".error_message");

        if (gameboard[row][col].get_marker() == "") {
            error_message_text.textContent = "";
            gameboard[row][col].set_marker(marker);
            return true;
        } else {
            error_message_text.textContent = "Invalid move!";
            return false;
        }
    };

    const reset_gameboard = () => {
        gameboard = [];
        for (let i = 0; i < ROWS; i++) {
            gameboard.push([]);
            for (let j = 0; j < COLS; j++) {
                gameboard[i].push(Cell());
            }
        }
    };

    const get_current_gameboard = () => gameboard;

    const print_current_gameboard = () => {
        console.log(
            gameboard.map((row) => row.map((cell) => cell.get_marker()))
        );
    };

    const winningCombos = [
        [
            [0, 0],
            [0, 1],
            [0, 2],
        ],
        [
            [1, 0],
            [1, 1],
            [1, 2],
        ],
        [
            [2, 0],
            [2, 1],
            [2, 2],
        ],
        [
            [0, 0],
            [1, 0],
            [2, 0],
        ],
        [
            [0, 1],
            [1, 1],
            [2, 1],
        ],
        [
            [0, 2],
            [1, 2],
            [2, 2],
        ],
        [
            [0, 0],
            [1, 1],
            [2, 2],
        ],
        [
            [0, 2],
            [1, 1],
            [2, 0],
        ],
    ];

    const check_win_and_draw = () => {
        for (let i = 0; i < winningCombos.length; i++) {
            const tokens = [];

            for (let j = 0; j < winningCombos[i].length; j++) {
                const [row, col] = winningCombos[i][j];
                const token = get_current_gameboard()[row][col].get_marker();
                tokens.push(token);
            }
            if (
                tokens.every(
                    (token) => token && token === tokens[0] && token !== " "
                )
            ) {
                return {
                    status: "win",
                    player: tokens[0],
                };
            }
        }

        const board = get_current_gameboard();
        const is_draw = board.every((row) =>
            row.every((cell) => cell.get_marker() != "")
        );

        if (is_draw) {
            return { status: "draw" };
        }

        return {
            status: "playing",
        };
    };

    return {
        get_current_gameboard,
        place_marker,
        print_current_gameboard,
        check_win_and_draw,
        reset_gameboard,
    };
}

function GameState(gameboard) {
    // Gamestate is the turns, players, etc for the entire game
    let current_game_state = "initialize";

    const players = [
        {
            name: "",
            marker: "X",
            score: 0,
        },
        {
            name: "",
            marker: "O",
            score: 0,
        },
    ];

    let winning_player_name = "";

    let active_player = players[0];

    const switch_active_player = () => {
        active_player = active_player === players[0] ? players[1] : players[0];
    };

    const get_active_player = () => active_player;
    const set_player_names = (player_one_name, player_two_name) => {
        players[0].name = player_one_name;
        players[1].name = player_two_name;
    };

    const set_current_game_state = (new_state) => {
        current_game_state = new_state;
    };
    const get_game_state = () => current_game_state;

    const initialize_game = (player_one_name, player_two_name) => {
        if (players[0].score == 0 && players[1].score == 0) {
            set_player_names(
                player_one_name || "Player one",
                player_two_name || "Player two"
            );
        }

        try {
            setup_page_container.classList.add("hidden");
            player_display_name_turn.textContent =
                get_active_player().name + "'s turn!";
            screen_controller.initializeBoardOnScreen();
        } catch {}

        set_current_game_state("playing");
    };

    const reset_game = () => {
        gameboard.reset_gameboard();
        active_player = players[0];
        initialize_game();
    };

    const play_round = (row, col) => {
        const placed_marker = active_player.marker;

        if (!gameboard.place_marker(row, col, active_player.marker)) {
            return;
        }

        current_game_state = gameboard.check_win_and_draw().status;

        if (current_game_state == "win") {
            winning_player_name = get_active_player().name;
            get_active_player().score++;
            player_display_name_turn.textContent =
                winning_player_name + " has won!";
            return {
                status: "win",
                marker: placed_marker,
            };
        }

        if (current_game_state == "draw") {
            player_display_name_turn.textContent = "The match ended in a draw!";
            return {
                status: "draw",
                marker: placed_marker,
            };
        }

        switch_active_player();
        player_display_name_turn.textContent =
            get_active_player().name + "'s turn!";
        return {
            status: "placed",
            marker: placed_marker,
        };
    };

    const get_all_players = () => players;

    let screen_controller = ScreenController(
        gameboard,
        (row, col) => play_round(row, col),
        get_all_players(),
        reset_game,
        get_active_player()
    );

    return {
        play_round,
        get_game_state,
        initialize_game,
        set_player_names,
        get_all_players,
    };
}

function ScreenController(
    board,
    marker_placed,
    players,
    restart_game,
    get_active_player
) {
    const gameboard = board;
    let player_one_score_text = document.querySelector(".player_one_score");
    let player_two_score_text = document.querySelector(".player_two_score");
    const score_container = document.querySelector(".score_container");

    const initializeBoardOnScreen = () => {
        // Initialize the scoreboard on the screen
        player_one_score_text.textContent = `Player one (${players[0].name}): ${players[0].score}`;
        player_two_score_text.textContent = `Player two (${players[1].name}): ${players[1].score}`;
        // Initialize the actual gameboard on the screen
        board_container.innerHTML = "";
        for (let i = 0; i < gameboard.get_current_gameboard().length; i++) {
            const section = document.createElement("div");
            section.style.display = "flex";
            board_container.appendChild(section);

            for (
                let j = 0;
                j < gameboard.get_current_gameboard()[i].length;
                j++
            ) {
                const cell = gameboard.get_current_gameboard()[i][j];
                const square = document.createElement("div");
                square.classList.add("cell");
                section.appendChild(square);

                square.textContent = cell.get_marker();
            }
        }

        const cells = document.querySelectorAll(".cell");
        let board_locked = false;
        cells.forEach((cell, index) => {
            cell.addEventListener("click", () => {
                const row = Math.floor(index / 3);
                const col = index % 3;

                if (board_locked) {
                    return;
                }

                const { status, marker } = marker_placed(row, col);

                switch (status) {
                    case "placed":
                        cell.textContent = marker;
                        break;
                    case "draw":
                        if (cell.textContent == "") {
                            cell.textContent = marker;
                            board_locked = true;
                            break;
                        } else {
                            return;
                        }
                    case "win":
                        player_one_score_text.textContent = `Player one (${players[0].name}): ${players[0].score}`;
                        player_two_score_text.textContent = `Player two (${players[1].name}): ${players[1].score}`;
                        if (cell.textContent == "") {
                            cell.textContent = marker;
                            board_locked = true;
                            break;
                        } else {
                            return;
                        }
                }
            });
        });

        const game_reset_button = document.querySelector(".game_reset_button");
        game_reset_button.addEventListener("click", () => {
            restart_game();

            cells.forEach((cell) => {
                cell.textContent = "";
            });
        });
    };

    return { initializeBoardOnScreen };
}

const GameLoop = () => {
    const gameboard = Gameboard();
    const game_state = GameState(gameboard);

    start_game_button.addEventListener("click", () => {
        let player_one_name_text = player_one_name.value;
        let player_two_name_text = player_two_name.value;
        game_state.initialize_game(player_one_name_text, player_two_name_text);
    });

    // while (game_state.get_game_state() != "win") {
    //     game_state.play_round();
    // }
};

GameLoop();
