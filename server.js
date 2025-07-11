// server.js (updated to end game when cars run out)

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

let gameStates = {};
const cars = [{ name: "Toyota Hilux", startPrice: 3300000, minBid: 200000, engine: "2.8L Diesel", bhp: 201, fuel: "Diesel" },
    { name: "Aston Martin Vantage", startPrice: 20000000, minBid: 1000000, engine: "4.0L Petrol", bhp: 503, fuel: "Petrol" },
    { name: "Hyundai Elite i20", startPrice: 600000, minBid: 200000, engine: "1.2L Petrol", bhp: 82, fuel: "Petrol" },
    { name: "Toyota Fortuner", startPrice: 5000000, minBid: 500000, engine: "2.7L Petrol", bhp: 164, fuel: "Petrol" },
    { name: "Ferrari F8 Tributo", startPrice: 35000000, minBid: 1000000, engine: "3.9L Petrol", bhp: 710, fuel: "Petrol" },
    { name: "Land Rover Range Rover Evoque", startPrice: 5000000, minBid: 1000000, engine: "2.0L Petrol", bhp: 237, fuel: "Petrol" },
    { name: "Skoda Karoq", startPrice: 1500000, minBid: 200000, engine: "1.5L Petrol", bhp: 148, fuel: "Petrol" },
    { name: "BMW M4", startPrice: 10000000, minBid: 1000000, engine: "3.0L Petrol", bhp: 425, fuel: "Petrol" },
    { name: "Mercedes-Benz GLA", startPrice: 3000000, minBid: 500000, engine: "2.0L Petrol", bhp: 181, fuel: "Petrol" },
    { name: "Koenigsegg Agera", startPrice: 20000000, minBid: 1000000, engine: "5.0L Petrol", bhp: 1341, fuel: "Petrol" },
    { name: "Mahindra Thar", startPrice: 2000000, minBid: 200000, engine: "2.0L Petrol", bhp: 150, fuel: "Petrol" },
    { name: "Toyota RAV4", startPrice: 2500000, minBid: 500000, engine: "2.0L Petrol", bhp: 203, fuel: "Petrol" },
    { name: "Porsche Cayman", startPrice: 8000000, minBid: 1000000, engine: "2.7L Petrol", bhp: 275, fuel: "Petrol" },
    { name: "Honda CR-V", startPrice: 2500000, minBid: 500000, engine: "2.0L Petrol", bhp: 154, fuel: "Petrol" },
    { name: "Audi R8", startPrice: 20000000, minBid: 1000000, engine: "5.2L Petrol", bhp: 610, fuel: "Petrol" },
    { name: "Ford EcoSport", startPrice: 800000, minBid: 200000, engine: "1.5L Petrol", bhp: 121, fuel: "Petrol" },
    { name: "Lamborghini Huracan", startPrice: 25000000, minBid: 1000000, engine: "5.2L Petrol", bhp: 610, fuel: "Petrol" },
    { name: "Tesla model s plaid", startPrice: 15000000, minBid:1000000, engine: "100kw Motor", bhp: 670, fuel: "EV" },
    { name: "Mercedes-AMG GT", startPrice: 15000000, minBid: 1000000, engine: "4.0L Petrol", bhp: 469, fuel: "Petrol" },
    { name: "Volkswagen T-Roc", startPrice: 1500000, minBid: 200000, engine: "1.5L Petrol", bhp: 148, fuel: "Petrol" },
    { name: "Mini Cooper S ", startPrice: 4500000, minBid: 200000, engine: "2.8L Diesel", bhp: 201, fuel: "Diesel" },
    { name: "Nissan GT-R", startPrice: 15000000, minBid: 1000000, engine: "3.8L Petrol", bhp: 565, fuel: "Petrol" },
    { name: "Hyundai Creta", startPrice: 1400000, minBid: 200000, engine: "1.6L Petrol", bhp: 121, fuel: "Petrol" },
    { name: "Pagani Huayra", startPrice: 25000000, minBid: 1000000, engine: "6.0L Petrol", bhp: 789, fuel: "Petrol" },
    { name: "MG Hector", startPrice: 1600000, minBid: 200000, engine: "1.5L Petrol", bhp: 141, fuel: "Petrol", type: "Hybrid" },
    { name: "Toyota 86", startPrice: 4000000, minBid: 200000, engine: "2.0L Petrol", bhp: 200, fuel: "Petrol" },
    { name: "Kia Seltos", startPrice: 1000000, minBid: 200000, engine: "1.5L Petrol", bhp: 113, fuel: "Petrol" },
    { name: "Ford Mustang", startPrice: 6000000, minBid: 500000, engine: "5.0L Petrol", bhp: 444, fuel: "Petrol" },
    { name: "BMW X2", startPrice: 3500000, minBid: 500000, engine: "2.0L Petrol", bhp: 192, fuel: "Petrol" },
    { name: "Jeep Compass", startPrice: 1500000, minBid: 200000, engine: "1.4L Petrol", bhp: 160, fuel: "Petrol" },
    { name: "Audi A1", startPrice: 1500000, minBid: 200000, engine: "1.4L Petrol", bhp: 122, fuel: "Petrol" },
    { name: "Maruti Suzuki Swift", startPrice: 500000, minBid: 200000, engine: "1.2L Petrol", bhp: 82, fuel: "Petrol" },
    { name: "Skoda Kodiaq", startPrice: 3500000, minBid: 500000, engine: "2.0L Diesel", bhp: 150, fuel: "Diesel" },
    { name: "Land Rover Range Rover Sport", startPrice: 15000000, minBid: 1000000, engine: "5.0L Petrol", bhp: 510, fuel: "Petrol" },
    { name: "Volkswagen Polo", startPrice: 600000, minBid: 200000, engine: "1.2L Petrol", bhp: 74, fuel: "Petrol" },
    { name: "McLaren 570S", startPrice: 20000000, minBid: 1000000, engine: "3.8L Petrol", bhp: 562, fuel: "Petrol" },
    { name: "Renault Duster", startPrice: 800000, minBid: 200000, engine: "1.5L Petrol", bhp: 104, fuel: "Petrol" },
    { name: "Mercedes-Benz A-Class", startPrice: 2500000, minBid: 500000, engine: "1.4L Petrol", bhp: 161, fuel: "Petrol" },
    { name: "Toyota Yaris", startPrice: 800000, minBid: 200000, engine: "1.5L Petrol", bhp: 106, fuel: "Petrol" },
    { name: "Ferrari 488 GTB", startPrice: 30000000, minBid: 1000000, engine: "3.9L Petrol", bhp: 661, fuel: "Petrol" },
    { name: "Honda HR-V", startPrice: 1800000, minBid: 200000, engine: "1.8L Petrol", bhp: 141, fuel: "Petrol" },
    { name: "Lamborghini Aventador", startPrice: 30000000, minBid: 1000000, engine: "6.5L Petrol ", bhp: 759, fuel: "Petrol" },
    { name: "Porsche 911", startPrice: 15000000, minBid: 1000000, engine: "3.0L Petrol", bhp: 379, fuel: "Petrol" },
    { name: "Ford Endeavour", startPrice: 2800000, minBid: 500000, engine: "2.2L Diesel", bhp: 158, fuel: "Diesel" },
    { name: "Audi Q2", startPrice: 2500000, minBid: 500000, engine: "2.0L Petrol", bhp: 190, fuel: "Petrol" },
    { name: "Hyundai Tucson", startPrice: 1800000, minBid: 200000, engine: "2.0L Diesel", bhp: 182, fuel: "Diesel" },
    { name: "Bugatti Chiron", startPrice: 25000000, minBid: 1000000, engine: "8.0L Petrol", bhp: 1479, fuel: "Petrol" },
    { name: "Mahindra XUV700", startPrice: 3000000, minBid: 200000, engine: "2.2L Diesel", bhp: 140, fuel: "Diesel" },
    { name: "Bentley Continental GT", startPrice: 25000000, minBid: 1000000, engine: "6.0L Petrol", bhp: 626, fuel: "Petrol" },
    { name: "Mercedes G-Wagon", startPrice: 16000000, minBid: 1000000, engine: "4.0L V8", bhp: 416, fuel: "Petrol" },
    { name: "BMW 1 Series", startPrice: 2000000, minBid: 500000, engine: "1.5L Petrol", bhp: 136, fuel: "Petrol" },
    { name: "Defender", startPrice: 15000000, minBid: 1000000, engine: "3.5l Diesel", bhp: 300, fuel: "Diesel" },
    { name: "Jaguar F-Type", startPrice: 12000000, minBid: 1000000, engine: "5.0L Petrol", bhp: 550, fuel: "Petrol" },
    { name: "Chevrolet Corvette", startPrice: 10000000, minBid: 1000000, engine: "6.2L Petrol", bhp: 460, fuel: "Petrol" },
    { name: "Dodge Challenger", startPrice: 8000000, minBid: 1000000, engine: "6.2L Petrol", bhp: 707, fuel: "Petrol" },
    { name: "Maserati GranTurismo", startPrice: 15000000, minBid: 1000000, engine: "4.7L Petrol", bhp: 460, fuel: "Petrol" },
    { name: "Audi Q3", startPrice: 3500000, minBid: 500000, engine: "2.0L Petrol", bhp: 184, fuel: "Petrol" },
    { name: "Volkswagen Tiguan", startPrice: 2800000, minBid: 500000, engine: "2.0L Diesel", bhp: 143, fuel: "Diesel" },
    { name: "BMW X1", startPrice: 3500000, minBid: 500000, engine: "2.0L Petrol", bhp: 192, fuel: "Petrol" },
    { name: "Mercedes-Benz GLB", startPrice: 3000000, minBid: 500000, engine: "2.0L Petrol", bhp: 221, fuel: "Petrol" },
    { name: "Land Rover Discovery", startPrice: 7000000, minBid: 1000000, engine: "2.0L Petrol", bhp: 237, fuel: "Petrol" }];

function logToAdmin(gameId, message) {
    io.to(`admin-${gameId}`).emit('logUpdate', message);
}

function getCleanGameState(gameId) {
    const gs = gameStates[gameId];
    if (!gs) return null;
    const result = {
        players: {},
        currentCarIndex: gs.currentCarIndex,
        currentBidPrice: gs.currentBidPrice,
        topBidder: gs.topBidder,
        cars: gs.cars,
        auctionActive: gs.auctionActive
    };
    for (const [name, p] of Object.entries(gs.players)) {
        result.players[name] = {
            name: p.name,
            money: p.money,
            garage: p.garage
        };
    }
    return result;
}

function updateAdmin(gameId) {
    const clean = getCleanGameState(gameId);
    if (clean) io.to(`admin-${gameId}`).emit('adminGameState', clean);
}

function startGameAuction(gameId) {
    const gameState = gameStates[gameId];
    if (!gameState || gameState.auctionActive) return;
    gameState.auctionActive = true;
    loadCarToAuction(gameId, gameState.cars[gameState.currentCarIndex]);
}

function resetAuctionTimer(gameId) {
    const gameState = gameStates[gameId];
    if (!gameState) return;
    gameState.timeLeft = 15;
    io.to(gameId).emit('auctionTimerUpdate', gameState.timeLeft);
    if (gameState.auctionTimer) clearInterval(gameState.auctionTimer);
    gameState.auctionTimer = setInterval(() => {
        gameState.timeLeft--;
        io.to(gameId).emit('auctionTimerUpdate', gameState.timeLeft);
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.auctionTimer);
            auctionTimeout(gameId);
        }
    }, 1000);
}

function loadCarToAuction(gameId, car) {
    const gameState = gameStates[gameId];
    if (!gameState) return;
    gameState.currentBidPrice = car.startPrice;
    gameState.topBidder = "None";
    gameState.topBidderSocketId = null;
    io.to(gameId).emit('carUpdate', {
        carName: car.name,
        engine: car.engine,
        bhp: car.bhp,
        fuel: car.fuel,
        currentPrice: gameState.currentBidPrice,
        topBidder: gameState.topBidder
    });
    resetAuctionTimer(gameId);
    updateAdmin(gameId);
}

function endGame(gameId) {
    const gameState = gameStates[gameId];
    if (!gameState) return;
    clearInterval(gameState.auctionTimer);
    gameState.auctionActive = false;
    io.to(gameId).emit('auctionEnded', {
        players: getCleanGameState(gameId).players
    });
    logToAdmin(gameId, "🏁 Auction ended. All cars sold or skipped.");
    updateAdmin(gameId);
}

function auctionTimeout(gameId) {
    const gameState = gameStates[gameId];
    if (!gameState) return;
    if (gameState.topBidder !== "None") {
        const winningPlayer = gameState.players[gameState.topBidder];
        if (winningPlayer) {
            winningPlayer.money -= gameState.currentBidPrice;
            winningPlayer.garage.push({
                car: gameState.cars[gameState.currentCarIndex],
                price: gameState.currentBidPrice
            });
            io.to(gameState.topBidderSocketId).emit('playerMoneyUpdate', winningPlayer.money);
            io.to(gameState.topBidderSocketId).emit('playerGarageUpdate', winningPlayer.garage);
            logToAdmin(gameId, `✅ ${gameState.cars[gameState.currentCarIndex].name} sold to ${gameState.topBidder} for $${gameState.currentBidPrice.toLocaleString()}`);
        }
    }
    updateAdmin(gameId);
    nextCar(gameId);
}

function nextCar(gameId) {
    const gameState = gameStates[gameId];
    if (!gameState) return;
    gameState.currentCarIndex++;
    if (gameState.currentCarIndex >= gameState.cars.length) {
        endGame(gameId);
    } else {
        loadCarToAuction(gameId, gameState.cars[gameState.currentCarIndex]);
    }
}



io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinGame', ({ playerName, gameId }) => {
        if (!playerName || !gameId) return socket.emit('loginError', 'Invalid name or game ID.');

        if (!gameStates[gameId]) {
            gameStates[gameId] = {
                players: {},
                currentCarIndex: 0,
                currentBidPrice: 0,
                topBidder: "None",
                topBidderSocketId: null,
                auctionTimer: null,
                timeLeft: 15,
                auctionActive: false,
                hostId: socket.id,
                cars: [...cars]
            };
            socket.emit('isHost', true);
        } else {
            socket.emit('isHost', false);
        }

        const gameState = gameStates[gameId];

        gameState.players[playerName] = gameState.players[playerName] || {
            name: playerName,
            money: 100000000,
            garage: [],
            socketId: socket.id
        };
        gameState.players[playerName].socketId = socket.id;

        socket.join(gameId);
        socket.gameId = gameId;
        socket.playerName = playerName;

        socket.emit('initialGameState', {
            playerMoney: gameState.players[playerName].money,
            playerGarage: gameState.players[playerName].garage,
            currentCar: gameState.cars[gameState.currentCarIndex],
            currentPrice: gameState.currentBidPrice,
            topBidder: gameState.topBidder,
            timeLeft: gameState.timeLeft,
            auctionActive: gameState.auctionActive
        });

        io.to(gameId).emit('playerListUpdate', Object.values(gameState.players).map(p => p.name));
        updateAdmin(gameId);

        if (gameState.auctionActive) {
            loadCarToAuction(gameId, gameState.cars[gameState.currentCarIndex]);
        }
    });

    socket.on('startGame', (gameId) => {
        const gameState = gameStates[gameId];
        if (gameState && socket.id === gameState.hostId && !gameState.auctionActive) {
            startGameAuction(gameId);
            io.to(gameId).emit('auctionStarted');
        } else {
            socket.emit('error', 'Only host can start or auction already started.');
        }
    });

    socket.on('bidUp', ({ playerName, gameId }) => {
        const gameState = gameStates[gameId];
        const player = gameState?.players?.[playerName];
        const currentCar = gameState?.cars?.[gameState.currentCarIndex];
        if (!gameState || !player || !currentCar || !gameState.auctionActive) return;

        const newPrice = gameState.currentBidPrice + currentCar.minBid;
        if (player.money < newPrice) return socket.emit('error', 'Insufficient funds');

        gameState.currentBidPrice = newPrice;
        gameState.topBidder = playerName;
        gameState.topBidderSocketId = socket.id;

        io.to(gameId).emit('bidUpdate', {
            currentPrice: gameState.currentBidPrice,
            topBidder: gameState.topBidder
        });
        updateAdmin(gameId);
        resetAuctionTimer(gameId);
    });

    socket.on('adminJoin', ({ gameId }) => {
        if (!gameStates[gameId]) return socket.emit('error', 'Invalid Game ID');
        socket.join(`admin-${gameId}`);
        socket.emit('adminGameState', getCleanGameState(gameId));
        console.log(`Admin joined game ${gameId}`);
    });

    socket.on('kickPlayer', ({ gameId, playerName }) => {
        const gameState = gameStates[gameId];
        if (!gameState?.players[playerName]) return;

        const targetSocketId = gameState.players[playerName].socketId;
        delete gameState.players[playerName];
        io.to(gameId).emit('playerListUpdate', Object.values(gameState.players).map(p => p.name));
        updateAdmin(gameId);

        if (targetSocketId) {
            io.to(targetSocketId).emit('error', 'You were kicked by admin');
            io.sockets.sockets.get(targetSocketId)?.disconnect(true);
        }

        logToAdmin(gameId, `❌ Player ${playerName} was kicked.`);
    });

    socket.on('disconnect', () => {
        const gameId = socket.gameId;
        const playerName = socket.playerName;
        if (!gameId || !gameStates[gameId]) return;

        const gameState = gameStates[gameId];
        delete gameState.players[playerName];

        if (socket.id === gameState.hostId) {
            clearInterval(gameState.auctionTimer);
            gameState.auctionActive = false;
            io.to(gameId).emit('hostDisconnected', 'Host left. Game ended.');
            delete gameStates[gameId];
        } else {
            io.to(gameId).emit('playerListUpdate', Object.values(gameState.players).map(p => p.name));
            if (Object.keys(gameState.players).length === 0) {
                clearInterval(gameState.auctionTimer);
                delete gameStates[gameId];
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

