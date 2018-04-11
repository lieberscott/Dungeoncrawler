var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// React & Redux libraries setup
var _React = React,
    Component = _React.Component;
var _Redux = Redux,
    createStore = _Redux.createStore;
var _ReactRedux = ReactRedux,
    Provider = _ReactRedux.Provider;
var _ReactRedux2 = ReactRedux,
    connect = _ReactRedux2.connect;
var _Redux2 = Redux,
    combineReducers = _Redux2.combineReducers;


var grid = void 0;
var rows = 80;
var cols = 80;

var rSpot = void 0;
var cSpot = void 0;

var startHealth = 106;

/****************
// ^^^^^^^
// React & Redux Libraries Setup and global variables
//
//
//
// createGrid() function for setup
// 
*****************/

var createGrid = function createGrid(level) {
  var totalRooms = 0;
  grid = []; // full grid
  var rooms = []; // array of top-right corners of rooms, to be connected by arteries
  for (var _i = 0; _i < rows; _i++) {
    grid.push([]);
    for (var _j = 0; _j < cols; _j++) {
      grid[_i][_j] = {
        dark: true,
        floor: false, // why have both floor and wall? wall for background color, floor for placement of other items
        health: false, // health square, blue
        player: false, // player square, orange
        monster: false, // monster square, red, black
        next: false, // move to next board, purple
        weapon: false, // weapon square, yellow
        wall: true // wall, brick
      };
    }
  }

  var attempts = level * 30 + 30; // number of rooms will tend to increase as level goes up
  for (var _i2 = 0; _i2 < attempts; _i2++) {
    // create rooms
    var row = Math.floor(Math.random() * (rows - 4)) + 4; // 2 cell buffer min all around
    var col = Math.floor(Math.random() * (cols - 4)) + 4; // 2 cell buffer min all around
    var hyt = Math.floor(Math.random() * 7) + 5; // rows per room: between 5 and 12
    var len = Math.floor(Math.random() * 5) + 5; // cols per room: between 5 and 10
    if (row + hyt > rows - 4 || col + len > cols - 4) {
      continue;
    } else if (grid[row][col].floor || grid[row + hyt][col].floor || grid[row][col + len].floor || grid[row + hyt][col + len].floor) {
      continue;
    } else {
      rooms.push({ h: row, w: col });
      for (var _j2 = 0; _j2 < hyt; _j2++) {
        for (var k = 0; k < len; k++) {
          grid[row + _j2][col + k].wall = false;
          grid[row + _j2][col + k].floor = true;
        }
      }
    }
  }

  for (var l = 0; l < rooms.length - 1; l++) {
    // create arteries
    var minH = Math.min(rooms[l].h, rooms[l + 1].h);
    var maxH = Math.max(rooms[l].h, rooms[l + 1].h);
    var minW = Math.min(rooms[l].w, rooms[l + 1].w);
    var maxW = Math.max(rooms[l].w, rooms[l + 1].w);
    for (var m = minH; m <= maxH; m++) {
      grid[m][rooms[l].w].wall = false;
      grid[m][rooms[l].w].floor = true;
    }
    for (var n = minW; n <= maxW; n++) {
      grid[rooms[l + 1].h][n].wall = false;
      grid[rooms[l + 1].h][n].floor = true;
    }
  }

  var health = 0; // health generator
  while (health < 12) {
    var healthRow = Math.floor(Math.random() * rows);
    var healthCol = Math.floor(Math.random() * cols);
    if (grid[healthRow][healthCol].floor) {
      grid[healthRow][healthCol].health = true;
      grid[healthRow][healthCol].floor = false;
      health++;
    }
  }

  var monst = 0;
  var rand = Math.floor(Math.random() * level * 20) + level * 20; // Level 1: 20 - 40; Level 4: 80 - 160
  if (level == 4) {
    while (monst < 1) {
      var monstRow = Math.floor(Math.random() * rows);
      var monstCol = Math.floor(Math.random() * cols);
      if (grid[monstRow][monstCol].floor) {
        grid[monstRow][monstCol].boss = true;
        grid[monstRow][monstCol].monster = rand;
        grid[monstRow][monstCol].floor = false;
        monst++;
      }
    }
  } else {
    while (monst < 7) {
      var _monstRow = Math.floor(Math.random() * rows);
      var _monstCol = Math.floor(Math.random() * cols);
      if (grid[_monstRow][_monstCol].floor) {
        grid[_monstRow][_monstCol].monster = rand;
        grid[_monstRow][_monstCol].floor = false;
        monst++;
      }
    }
  }

  var weapon = 0; // weapon generator
  while (weapon < 4) {
    var weaponRow = Math.floor(Math.random() * rows);
    var weaponCol = Math.floor(Math.random() * cols);
    if (grid[weaponRow][weaponCol].floor) {
      grid[weaponRow][weaponCol].weapon = true;
      grid[weaponRow][weaponCol].floor = false;
      weapon++;
    }
  }

  var next = 0; // next board generator
  while (next < 1) {
    var nextRow = Math.floor(Math.random() * rows);
    var nextCol = Math.floor(Math.random() * cols);
    if (grid[nextRow][nextCol].floor) {
      grid[nextRow][nextCol].next = true;
      grid[nextRow][nextCol].floor = false;
      next++;
    }
  }

  var play = 0; // player generator
  while (play < 1) {
    var playRow = Math.floor(Math.random() * rows);
    var playCol = Math.floor(Math.random() * cols);
    if (grid[playRow][playCol].floor) {
      grid[playRow][playCol].player = true;
      grid[playRow][playCol].floor = false;
      rSpot = playRow;
      cSpot = playCol;
      play++;

      for (i = rSpot - 4; i <= rSpot + 4; i++) {
        for (j = cSpot - 4; j <= cSpot + 4; j++) {
          grid[i][j].dark = false;
        }
      }
    }
  }
  return grid;
};

/**********************
// ^^^^^^^
// createGrid() function for setup
//
//
//
// initStates, Reducers, and store
// 
**********************/

var initPlayerState = {
  health: startHealth,
  level: 1,
  weapons_numb: 0,
  weapons: [{ weapon: "Knuckles", strength: 7 }, { weapon: "Sling shot", strength: 8 }, { weapon: "Brass Knuckles", strength: 15 }, { weapon: "Stick", strength: 16 }, { weapon: "Nunchucks", strength: 17 }, { weapon: "Dagger", strength: 18 }, { weapon: "Chain", strength: 19 }, { weapon: "Bo", strength: 20 }, { weapon: "Tomahawk", strength: 21 }, { weapon: "Byakko", strength: 23 }, { weapon: "Machete", strength: 25 }, { weapon: "Axe", strength: 26 }, { weapon: "Mace", strength: 28 }, { weapon: "Naginata", strength: 30 }, { weapon: "Crossbow", strength: 33 }, { weapon: "Flamethrower", strength: 40 }, { weapon: "Katana Sword", strength: 45 }]
};

var playerReducer = function playerReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initPlayerState;
  var action = arguments[1];

  var newState = void 0;
  switch (action.type) {
    case "health":
      // picking up health box or fighting monster
      newState = _extends({}, state, {
        health: state.health + action.score // action.score could be + or -
      });
      return newState;
      break;
    case "weapon":
      newState = _extends({}, state, {
        weapons_numb: state.weapons_numb + 1
      });
      return newState;
      break;
    case "LEVEL":
      newState = _extends({}, state, {
        level: state.level + 1
      });
      return newState;
      break;
    case "RESTART":
      newState = _extends({}, state, {
        health: startHealth,
        level: 1,
        monster: 1,
        weapons_numb: 0
      });
      return newState;
      break;
    default:
      return state;
      break;
  }
};

var initBoardState = {
  grid: createGrid(1), // input is the level
  row: rSpot,
  col: cSpot
};

var boardReducer = function boardReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initBoardState;
  var action = arguments[1];

  var newState = void 0;
  switch (action.type) {
    case "ArrowUp":
      newState = _extends({}, state, {
        row: state.row - 1,
        grid: action.grid
      });
      return newState;
      break;
    case "ArrowRight":
      newState = _extends({}, state, {
        col: state.col + 1,
        grid: action.grid
      });
      return newState;
      break;
    case "ArrowDown":
      newState = _extends({}, state, {
        row: state.row + 1,
        grid: action.grid
      });
      return newState;
      break;
    case "ArrowLeft":
      newState = _extends({}, state, {
        col: state.col - 1,
        grid: action.grid
      });
      return newState;
      break;
    case "UPDATE":
      newState = _extends({}, state, {
        grid: action.grid
      });
      return newState;
      break;
    case "UPDATE_LOC":
      newState = _extends({}, state, {
        row: action.row,
        col: action.col
      });
      return newState;
      break;
    default:
      return state;
      break;
  }
};

var combinedReducers = combineReducers({ board: boardReducer, player: playerReducer });

var store = createStore(combinedReducers);

/**********************
// ^^^^^^^
// initStates, Reducers, and store
//
//
//
// App
// 
**********************/

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, props));

    _this.state = {
      darkness: true,
      monster: false,
      won: false
    };
    _this.reset = _this.reset.bind(_this);
    _this.toggleDarkness = _this.toggleDarkness.bind(_this);
    return _this;
  }

  _createClass(App, [{
    key: "reset",
    value: function reset() {
      this.setState({
        darkness: true,
        monsterdead: false, // changes to true when Level 4 monster beaten
        won: false // in case reset is used after win
      });
      var newLevel = createGrid(1);
      this.props.update(newLevel);
      this.props.updateLocation(rSpot, cSpot);
      this.props.restart();
    }
  }, {
    key: "toggleDarkness",
    value: function toggleDarkness() {
      var toggledArray = handleToggle(this.props.board.grid, this.state.darkness, this.props.board.row, this.props.board.col);
      this.props.update(toggledArray);
      this.setState({
        darkness: !this.state.darkness
      });
    }
  }, {
    key: "onKeyPressed",
    value: function onKeyPressed(e) {
      e.preventDefault();
      var legal = legalMove(this.props.board.grid, this.props.board.row, this.props.board.col, e.key); // legalMove() checks if it's a legal move
      if (legal) {
        var item = checkElements(this.props.board.grid, this.props.board.row, this.props.board.col, e.key)[0]; // checkElements() returns, e.g. ["health"], etc.
        if (item == "monster") {
          if (this.props.player.level == 4) {
            var beatLastMonst = checkLastMonst(this.props.board.grid, this.props.board.row, this.props.board.col, e.key);
            if (beatLastMonst) {
              // last monster defeated
              this.setState({
                monsterdead: true
              });
            }
          }
          var arr = handleMonster(this.props.board.grid, this.props.player.weapons[this.props.player.weapons_numb].strength, this.props.board.row, this.props.board.col, e.key, item);
          this.props.update(arr);

          this.props.reduceHealth(this.props.player.level);
        } else if (item == "next") {
          if (this.props.player.level == 4) {
            if (this.state.monsterdead) {
              this.setState({
                won: true
              });
            }
          } else {
            var newLevel = createGrid(this.props.player.level + 1);
            this.props.update(newLevel);
            this.props.updateLocation(rSpot, cSpot);
            this.props.levelUp();
            this.setState({
              darkness: true // needs to be set to true because grid generation automatically includes darkness
            });
          }
        } else {
          this.props.move(this.props.board.grid, this.props.board.row, this.props.board.col, e.key, item, this.state.darkness);
          this.props.addItemScore(item); // currently adding 10 to floor, need to change this
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return React.createElement(
        "div",
        { tabIndex: "0", onKeyDown: function onKeyDown(e) {
            return _this2.onKeyPressed(e);
          } },
        React.createElement(Title, null),
        React.createElement(Top, { toggleDarkness: function toggleDarkness() {
            return _this2.toggleDarkness();
          } }),
        React.createElement("br", null),
        this.state.won ? React.createElement(End, { result: "won", reset: function reset() {
            return _this2.reset();
          } }) : null,
        this.props.player.health <= 0 ? React.createElement(End, { result: "lost", reset: function reset() {
            return _this2.reset();
          } }) : null,
        React.createElement(
          "table",
          null,
          React.createElement(
            "tbody",
            null,
            this.props.board.grid.map(function (row) {
              return React.createElement(
                "tr",
                null,
                " ",
                row.map(function (cell) {
                  return React.createElement(Cell, { cell: cell });
                }),
                " "
              );
            })
          )
        )
      );
    }
  }]);

  return App;
}(React.Component);

var mapAppStateToProps = function mapAppStateToProps(state) {
  return {
    board: state.board,
    player: state.player
  };
};

var mapAppDispatchToProps = function mapAppDispatchToProps(dispatch) {
  return {
    addItemScore: function addItemScore(item) {
      dispatch(_addItemScore(item));
    },
    levelUp: function levelUp() {
      dispatch(_levelUp());
    },
    move: function move(arr, row, col, dir, item, dark) {
      var newArr = movePlayer(arr, row, col, dir, item, dark);
      dispatch(_move(newArr, dir));
    },
    reduceHealth: function reduceHealth(level) {
      var damage = level * -15;
      dispatch(_reduceHealth(damage));
    },
    restart: function restart() {
      dispatch(_restart());
    },
    update: function update(arr) {
      dispatch(_update(arr));
    },
    updateLocation: function updateLocation(row, col) {
      // new rSpot, cSpot after reaching next level
      dispatch(_updateLocation(row, col));
    }
  };
};

function _addItemScore(item) {
  return {
    type: item,
    score: 10
  };
}

function _levelUp() {
  return {
    type: "LEVEL"
  };
}

function _move(arr, dir) {
  return {
    type: dir,
    grid: arr
  };
}

function _reduceHealth(damage) {
  return {
    type: "health",
    score: damage
  };
}

function _restart() {
  return {
    type: "RESTART"
  };
}

function _update(arr) {
  // update without moving player (for monster fight or toggleDarkness)
  return {
    type: "UPDATE",
    grid: arr
  };
}

function _updateLocation(row, col) {
  return {
    type: "UPDATE_LOC",
    row: row,
    col: col
  };
}

App = connect(mapAppStateToProps, mapAppDispatchToProps)(App);

/**********************
// ^^^^^^^
// App
//
//
//
// Cell, Title, Top, End
// 
**********************/

var Cell = function Cell(props) {
  return React.createElement("td", { className: props.cell.dark ? "dark" : props.cell.wall ? "wall" : props.cell.health ? "health" : props.cell.boss ? "boss" : props.cell.monster ? "monster" : props.cell.weapon ? "weapon" : props.cell.next ? "next" : props.cell.player ? "player" : "floor" });
};

var Title = function Title(props) {
  return React.createElement(
    "div",
    { className: "center" },
    React.createElement(
      "div",
      { className: "title" },
      "ReactJS Roguelike Dungeoncrawler Game"
    ),
    React.createElement(
      "div",
      { className: "subhead" },
      "Kill the monster in Dungeon 4"
    ),
    React.createElement("br", null)
  );
};

var Top = function (_React$Component2) {
  _inherits(Top, _React$Component2);

  function Top(props) {
    _classCallCheck(this, Top);

    var _this3 = _possibleConstructorReturn(this, (Top.__proto__ || Object.getPrototypeOf(Top)).call(this, props));

    _this3.state = {};
    return _this3;
  }

  _createClass(Top, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "flex-container" },
        React.createElement(
          "div",
          { className: "prop" },
          "Dungeon: ",
          this.props.player.level
        ),
        React.createElement(
          "div",
          { className: "prop" },
          "Health: ",
          this.props.player.health > 0 ? this.props.player.health : "0"
        ),
        React.createElement(
          "div",
          { className: "prop" },
          "Weapon: ",
          this.props.player.weapons[this.props.player.weapons_numb].weapon
        ),
        React.createElement(
          "div",
          { className: "prop" },
          "Damage: ",
          this.props.player.weapons[this.props.player.weapons_numb].strength
        ),
        React.createElement(
          "button",
          { className: "button", onClick: this.props.toggleDarkness },
          "Toggle Darkness"
        )
      );
    }
  }]);

  return Top;
}(React.Component);

var mapTopStateToProps = function mapTopStateToProps(state) {
  return {
    player: state.player
  };
};

var mapTopDispatchToProps = function mapTopDispatchToProps(dispatch) {
  return {
    move: function move(arr, row, col, dir, item, dark) {
      var newArr = movePlayer(arr, row, col, dir, item, dark);
      dispatch(_move(newArr, dir));
    }
  };
};

Top = connect(mapTopStateToProps, mapTopDispatchToProps)(Top);

var End = function End(props) {
  return React.createElement(
    "div",
    { className: "popup" },
    React.createElement(
      "div",
      { className: "popup-inner center" },
      props.result == "won" ? "You won! Congratulations!" : "",
      props.result == "lost" ? "You lost. Better luck next time" : "",
      React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { className: "button", onClick: props.reset },
          "Reset"
        )
      )
    )
  );
};

/**********************
// ^^^^^^^
// Cell, Title, Top, End
//
//
//
// legalMove(), checkElements(), movePlayer(), handleMonster(), checkLastMonst(), handleToggle()
// 
**********************/

var legalMove = function legalMove(arr, oldRow, oldCol, dir) {
  switch (dir) {
    case "ArrowUp":
      return !arr[oldRow - 1][oldCol].wall;
      break;
    case "ArrowRight":
      return !arr[oldRow][oldCol + 1].wall;
      break;
    case "ArrowDown":
      return !arr[oldRow + 1][oldCol].wall;
      break;
    case "ArrowLeft":
      return !arr[oldRow][oldCol - 1].wall;
      break;
    default:
    // return undefined;
  }
};

var checkElements = function checkElements(arr, oldRow, oldCol, dir) {
  var keys = void 0;
  var filtered = void 0;
  switch (dir) {
    case "ArrowUp":
      keys = Object.keys(arr[oldRow - 1][oldCol]);
      filtered = keys.filter(function (key) {
        return arr[oldRow - 1][oldCol][key];
      });
      return filtered;
      break;
    case "ArrowRight":
      keys = Object.keys(arr[oldRow][oldCol + 1]);
      filtered = keys.filter(function (key) {
        return arr[oldRow][oldCol + 1][key];
      });
      return filtered;
      break;
    case "ArrowDown":
      keys = Object.keys(arr[oldRow + 1][oldCol]);
      filtered = keys.filter(function (key) {
        return arr[oldRow + 1][oldCol][key];
      });
      return filtered;
      break;
    case "ArrowLeft":
      keys = Object.keys(arr[oldRow][oldCol - 1]);
      filtered = keys.filter(function (key) {
        return arr[oldRow][oldCol - 1][key];
      });
      return filtered;
      break;
  }
};

var movePlayer = function movePlayer(arr, oldRow, oldCol, dir, item, dark) {
  switch (dir) {
    case "ArrowUp":
      arr[oldRow][oldCol].floor = true;
      arr[oldRow][oldCol].player = false;
      arr[oldRow - 1][oldCol][item] = false;
      arr[oldRow - 1][oldCol].player = true;
      if (dark) {
        for (var _i3 = oldCol - 4; _i3 <= oldCol + 4; _i3++) {
          arr[oldRow + 4][_i3].dark = true;
          arr[oldRow - 5][_i3].dark = false;
        }
      }
      return arr;
      break;
    case "ArrowRight":
      arr[oldRow][oldCol].floor = true;
      arr[oldRow][oldCol].player = false;
      arr[oldRow][oldCol + 1][item] = false;
      arr[oldRow][oldCol + 1].player = true;
      if (dark) {
        for (var _i4 = oldRow - 4; _i4 <= oldRow + 4; _i4++) {
          arr[_i4][oldCol - 4].dark = true;
          arr[_i4][oldCol + 5].dark = false;
        }
      }
      return arr;
      break;
    case "ArrowDown":
      arr[oldRow][oldCol].floor = true;
      arr[oldRow][oldCol].player = false;
      arr[oldRow + 1][oldCol][item] = false;
      arr[oldRow + 1][oldCol].player = true;
      if (dark) {
        for (var _i5 = oldCol - 4; _i5 <= oldCol + 4; _i5++) {
          arr[oldRow - 4][_i5].dark = true;
          arr[oldRow + 5][_i5].dark = false;
        }
      }
      return arr;
      break;
    case "ArrowLeft":
      arr[oldRow][oldCol].floor = true;
      arr[oldRow][oldCol].player = false;
      arr[oldRow][oldCol - 1][item] = false;
      arr[oldRow][oldCol - 1].player = true;
      if (dark) {
        for (var _i6 = oldRow - 4; _i6 <= oldRow + 4; _i6++) {
          arr[_i6][oldCol + 4].dark = true;
          arr[_i6][oldCol - 5].dark = false;
        }
      }
      return arr;
      break;
  }
};

var handleMonster = function handleMonster(arr, weap, playerRow, playerCol, dir, item) {
  switch (dir) {
    case "ArrowUp":
      arr[playerRow - 1][playerCol].monster -= weap; // some math that works
      if (arr[playerRow - 1][playerCol].monster <= 0) {
        arr[playerRow - 1][playerCol].monster = false;
        arr[playerRow - 1][playerCol].floor = true;
      }
      return arr;
      break;
    case "ArrowRight":
      arr[playerRow][playerCol + 1].monster -= weap;
      if (arr[playerRow][playerCol + 1].monster <= 0) {
        arr[playerRow][playerCol + 1].monster = false;
        arr[playerRow][playerCol + 1].floor = true;
      }
      return arr;
      break;
    case "ArrowDown":
      arr[playerRow + 1][playerCol].monster -= weap;
      if (arr[playerRow + 1][playerCol].monster <= 0) {
        arr[playerRow + 1][playerCol].monster = false;
        arr[playerRow + 1][playerCol].floor = true;
      }
      return arr;
      break;
    case "ArrowLeft":
      arr[playerRow][playerCol - 1].monster -= weap;
      if (arr[playerRow][playerCol - 1].monster <= 0) {
        arr[playerRow][playerCol - 1].monster = false;
        arr[playerRow][playerCol - 1].floor = true;
      }
      return arr;
      break;
  }
};

var checkLastMonst = function checkLastMonst(arr, row, col, dir) {
  switch (dir) {
    case "ArrowUp":
      return arr[row - 1][col].monster;
      break;
    case "ArrowRight":
      return arr[row][col + 1].monster;
      break;
    case "ArrowDown":
      return arr[row + 1][col].monster;
      break;
    case "ArrowLeft":
      return arr[row][col - 1].monster;
      break;
  }
};

var handleToggle = function handleToggle(arr, dark, row, col) {
  for (var _i7 = 0; _i7 < rows; _i7++) {
    for (var _j3 = 0; _j3 < cols; _j3++) {
      arr[_i7][_j3].dark = !dark;
    }
  }

  if (!dark) {
    // if switching from light to dark
    for (i = row - 4; i <= row + 4; i++) {
      for (j = col - 4; j <= col + 4; j++) {
        arr[i][j].dark = false;
      }
    }
  }
  return arr;
};

/**********************
// ^^^^^^^
// legalMove(), checkElements(), movePlayer(), handleMonster(), checkLastMonst(), handleToggle()
//
//
//
// 
// 
**********************/

var app = window.document.getElementById("app");

// Provider wraps our app
ReactDOM.render(React.createElement(
  Provider,
  { store: store },
  React.createElement(App, null)
), app);