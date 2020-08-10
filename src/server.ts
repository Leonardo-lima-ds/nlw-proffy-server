import express from 'express';
import cors from 'cors';
import routes from './routes';

const PORT = 3333;
const app = express();

app.use(
    express.json(),
    cors(),
    routes,
);

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});