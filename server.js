const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
const PORT = 3000;

// username -> socket.id, for real-time delivery of friend/match events
const onlineUsers = new Map();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Initialize lowdb databases
const usersDb = new Low(new JSONFile(path.join(__dirname, 'users.json')), { users: [] });
const sessionsDb = new Low(new JSONFile(path.join(__dirname, 'sessions.json')), { sessions: [] });

// Helper function to generate session token
function generateToken() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// API Routes

// Helper: make sure legacy user records have a social object
function ensureSocial(user) {
    if (!user.social) {
        user.social = { friends: [], incoming: [], outgoing: [] };
    }
    return user.social;
}

function authenticate(req, res) {
    const token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ error: 'Authorization token required' });
        return null;
    }
    const session = sessionsDb.data.sessions.find(s => s.token === token);
    if (!session) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return null;
    }
    const user = usersDb.data.users.find(u => u.id === session.userId);
    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return null;
    }
    return user;
}

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = usersDb.data.users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'Username already taken' });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'Email already registered' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with default game data
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            gameData: {
                level: 1,
                xp: 0,
                coins: 0,
                gems: 0,
                ownedTowers: ["scout", "sniper"],
                goldenTowers: [],
                loadout: ["scout", "sniper"],
                dailyRewards: {
                    lastClaimDate: null,
                    streak: 0,
                    claimedToday: false
                },
                quests: {
                    active: [],
                    completed: []
                },
                questProgress: {
                    matchesWon: 0,
                    wavesReached: 0,
                    enemiesDefeated: 0,
                    bossesDefeated: 0,
                    towersPlaced: 0,
                    towersUpgraded: 0
                }
            },
            social: {
                friends: [],
                incoming: [],
                outgoing: []
            }
        };

        usersDb.data.users.push(newUser);
        await usersDb.write();

        // Generate session token
        const token = generateToken();
        const session = {
            token,
            userId: newUser.id,
            username: newUser.username,
            createdAt: new Date()
        };

        sessionsDb.data.sessions.push(session);
        await sessionsDb.write();

        res.json({
            success: true,
            token,
            user: {
                username: newUser.username,
                email: newUser.email,
                gameData: newUser.gameData
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = usersDb.data.users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate session token
        const token = generateToken();
        const session = {
            token,
            userId: user.id,
            username: user.username,
            createdAt: new Date()
        };

        sessionsDb.data.sessions.push(session);
        await sessionsDb.write();

        res.json({
            success: true,
            token,
            user: {
                username: user.username,
                email: user.email,
                gameData: user.gameData
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout user
app.post('/api/logout', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        sessionsDb.data.sessions = sessionsDb.data.sessions.filter(s => s.token !== token);
        await sessionsDb.write();

        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user data (authenticated)
app.get('/api/user', async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const session = sessionsDb.data.sessions.find(s => s.token === token);
        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const user = usersDb.data.users.find(u => u.id === session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            username: user.username,
            email: user.email,
            gameData: user.gameData
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Save game data (authenticated)
app.post('/api/save', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const { gameData } = req.body;

        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        if (!gameData) {
            return res.status(400).json({ error: 'Game data is required' });
        }

        const session = sessionsDb.data.sessions.find(s => s.token === token);
        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const userIndex = usersDb.data.users.findIndex(u => u.id === session.userId);
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        usersDb.data.users[userIndex].gameData = gameData;
        await usersDb.write();

        res.json({ success: true });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify session
app.get('/api/verify', async (req, res) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const session = sessionsDb.data.sessions.find(s => s.token === token);
        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        res.json({ valid: true, username: session.username });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- FRIENDS API ---

// Get friends list, incoming requests, and outgoing requests
app.get('/api/friends', async (req, res) => {
    const user = authenticate(req, res);
    if (!user) return;
    const social = ensureSocial(user);

    const friends = social.friends.map(username => ({
        username,
        online: onlineUsers.has(username)
    }));

    res.json({ friends, incoming: social.incoming, outgoing: social.outgoing });
});

// Send a friend request
app.post('/api/friends/request', async (req, res) => {
    const user = authenticate(req, res);
    if (!user) return;
    const { username } = req.body;

    if (!username) return res.status(400).json({ error: 'Username is required' });
    if (username === user.username) return res.status(400).json({ error: "You can't add yourself" });

    const target = usersDb.data.users.find(u => u.username === username);
    if (!target) return res.status(404).json({ error: 'User not found' });

    const social = ensureSocial(user);
    const targetSocial = ensureSocial(target);

    if (social.friends.includes(username)) return res.status(400).json({ error: 'Already friends' });
    if (social.outgoing.includes(username)) return res.status(400).json({ error: 'Request already sent' });

    // If they already requested us, auto-accept instead of double-requesting
    if (social.incoming.includes(username)) {
        social.incoming = social.incoming.filter(u => u !== username);
        targetSocial.outgoing = targetSocial.outgoing.filter(u => u !== user.username);
        social.friends.push(username);
        targetSocial.friends.push(user.username);
        await usersDb.write();

        const targetSocketId = onlineUsers.get(username);
        if (targetSocketId) io.to(targetSocketId).emit('friend:accepted', { from: user.username });

        return res.json({ success: true, autoAccepted: true });
    }

    social.outgoing.push(username);
    targetSocial.incoming.push(user.username);
    await usersDb.write();

    const targetSocketId = onlineUsers.get(username);
    if (targetSocketId) io.to(targetSocketId).emit('friend:request', { from: user.username });

    res.json({ success: true });
});

// Accept a friend request
app.post('/api/friends/accept', async (req, res) => {
    const user = authenticate(req, res);
    if (!user) return;
    const { username } = req.body;

    const target = usersDb.data.users.find(u => u.username === username);
    if (!target) return res.status(404).json({ error: 'User not found' });

    const social = ensureSocial(user);
    const targetSocial = ensureSocial(target);

    if (!social.incoming.includes(username)) {
        return res.status(400).json({ error: 'No pending request from this user' });
    }

    social.incoming = social.incoming.filter(u => u !== username);
    targetSocial.outgoing = targetSocial.outgoing.filter(u => u !== user.username);
    social.friends.push(username);
    targetSocial.friends.push(user.username);
    await usersDb.write();

    const targetSocketId = onlineUsers.get(username);
    if (targetSocketId) io.to(targetSocketId).emit('friend:accepted', { from: user.username });

    res.json({ success: true });
});

// Decline a friend request (works for either side of a pending request)
app.post('/api/friends/decline', async (req, res) => {
    const user = authenticate(req, res);
    if (!user) return;
    const { username } = req.body;

    const target = usersDb.data.users.find(u => u.username === username);
    const social = ensureSocial(user);

    social.incoming = social.incoming.filter(u => u !== username);
    social.outgoing = social.outgoing.filter(u => u !== username);

    if (target) {
        const targetSocial = ensureSocial(target);
        targetSocial.incoming = targetSocial.incoming.filter(u => u !== user.username);
        targetSocial.outgoing = targetSocial.outgoing.filter(u => u !== user.username);
    }

    await usersDb.write();
    res.json({ success: true });
});

// Remove an existing friend
app.post('/api/friends/remove', async (req, res) => {
    const user = authenticate(req, res);
    if (!user) return;
    const { username } = req.body;

    const target = usersDb.data.users.find(u => u.username === username);
    const social = ensureSocial(user);
    social.friends = social.friends.filter(u => u !== username);

    if (target) {
        const targetSocial = ensureSocial(target);
        targetSocial.friends = targetSocial.friends.filter(u => u !== user.username);
        const targetSocketId = onlineUsers.get(username);
        if (targetSocketId) io.to(targetSocketId).emit('friend:removed', { from: user.username });
    }

    await usersDb.write();
    res.json({ success: true });
});

// --- REAL-TIME (SOCKET.IO) ---

// Authenticate each socket connection using the same session tokens as the REST API
io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    const session = sessionsDb.data.sessions.find(s => s.token === token);
    if (!session) return next(new Error('Invalid or expired token'));

    socket.username = session.username;
    next();
});

io.on('connection', (socket) => {
    onlineUsers.set(socket.username, socket.id);
    console.log(`${socket.username} connected (real-time)`);

    // Relay a match challenge to a friend
    socket.on('match:invite', ({ toUsername }) => {
        const targetSocketId = onlineUsers.get(toUsername);
        if (targetSocketId) {
            io.to(targetSocketId).emit('match:invite', { fromUsername: socket.username });
        }
    });

    // Relay the accept/decline response back to the challenger, and kick off the match if accepted
    socket.on('match:respond', ({ toUsername, accept }) => {
        const targetSocketId = onlineUsers.get(toUsername);
        if (!targetSocketId) return;

        io.to(targetSocketId).emit('match:response', { fromUsername: socket.username, accept });

        if (accept) {
            // toUsername is the original challenger -> they host the shared board.
            // socket.username is the one who just accepted -> they join as guest.
            const matchId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            io.to(targetSocketId).emit('match:start', { matchId, opponent: socket.username, isHost: true });
            socket.emit('match:start', { matchId, opponent: toUsername, isHost: false });
        }
    });

    // Generic real-time relay for in-progress match activity (feed messages, misc events)
    socket.on('match:event', ({ toUsername, data }) => {
        const targetSocketId = onlineUsers.get(toUsername);
        if (targetSocketId) {
            io.to(targetSocketId).emit('match:event', { fromUsername: socket.username, data });
        }
    });

    // Host -> guest: authoritative shared-board snapshot (towers, enemies, cash, hp, wave...)
    socket.on('match:state', ({ toUsername, state }) => {
        const targetSocketId = onlineUsers.get(toUsername);
        if (targetSocketId) {
            io.to(targetSocketId).emit('match:state', { state });
        }
    });

    // Guest -> host: requested action against the shared board (place/upgrade/sell tower, etc.)
    socket.on('match:action', ({ toUsername, action }) => {
        const targetSocketId = onlineUsers.get(toUsername);
        if (targetSocketId) {
            io.to(targetSocketId).emit('match:action', { fromUsername: socket.username, action });
        }
    });

    socket.on('disconnect', () => {
        if (onlineUsers.get(socket.username) === socket.id) {
            onlineUsers.delete(socket.username);
        }
        console.log(`${socket.username} disconnected`);
    });
});

// Start server
httpServer.listen(PORT, () => {
    console.log(`Tower Defense Server running on http://localhost:${PORT}`);
});
