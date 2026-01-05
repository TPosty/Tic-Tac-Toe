const player_one_name = document.querySelector(".player_one_name");
const player_two_name = document.querySelector(".player_two_name");
const start_game_button = document.querySelector(".start_game_button");
const setup_page_container = document.querySelector(".setup_page");
const board_container = document.querySelector(".board_container");

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
    const gameboard = [];

    for (let i = 0; i < ROWS; i++) {
        gameboard.push([]);
        for (let j = 0; j < COLS; j++) {
            gameboard[i].push(Cell());
        }
    }

    const place_marker = (row, col, marker) => {
        if (gameboard[row][col].get_marker() == "") {
            gameboard[row][col].set_marker(marker);
            return true;
        } else {
            return false;
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

        return {
            status: "playing",
        };
    };

    return {
        get_current_gameboard,
        place_marker,
        print_current_gameboard,
        check_win_and_draw,
    };
}

function GameState(gameboard) {
    // Gamestate is the turns, players, etc for the entire game
    let current_game_state = "initialize";
    const players = [
        {
            name: "",
            marker: "X",
        },
        {
            name: "",
            marker: "O",
        },
    ];

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
        set_player_names(player_one_name, player_two_name);

        try {
            setup_page_container.classList.add("hidden");

            screen_controller.initializeBoardOnScreen();
        } catch {}

        set_current_game_state("playing");
    };

    const play_round = (row, col) => {
        current_game_state = gameboard.check_win_and_draw().status;
        console.log(current_game_state);

        if (gameboard.place_marker(row, col, active_player.marker)) {
            switch_active_player();

            return {
                success: true,
                marker: get_active_player().marker,
            };
        } else {
            alert("cannot place!");
            return false;
        }
    };

    let screen_controller = ScreenController(gameboard, (row, col) =>
        play_round(row, col)
    );

    return {
        play_round,
        get_game_state,
        initialize_game,
        set_player_names,
    };
}

function ScreenController(board, marker_placed) {
    const gameboard = board;

    const initializeBoardOnScreen = () => {
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
        cells.forEach((cell, index) => {
            cell.addEventListener("click", () => {
                const row = Math.floor(index / 3);
                const col = index % 3;

                const { success, marker } = marker_placed(row, col);

                if (success) {
                    cell.textContent = marker;
                }
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
