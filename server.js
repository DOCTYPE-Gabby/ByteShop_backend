import 'dotenv/config';
import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
import publicRoutes from "./routes/public.js"
import adminRoute from "./routes/admin.js"
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

app.use('/api', publicRoutes)
app.use('/api', adminRoute)

app.use((req, res)=> {
    res.status(404).sendFile(path.join(__dirname, '404.html'))
});
app.listen(port, ()=>{
    console.log("servidor rodando na porta 3000")
})