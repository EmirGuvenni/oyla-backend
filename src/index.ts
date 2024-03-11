import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import config from './config';
import { authMiddleware } from './middleware/auth.middleware';
import registerEvents from './providers/event-registrar';
import { roomRouter } from './router/room';
import { userRouter } from './router/user';

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(userRouter);
app.use(roomRouter);

httpServer.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

const io = new Server(httpServer);

io.use(authMiddleware);

registerEvents(io, 'events');
