/* PLANEJAMENTO das rotas
GET /aulas       consultar lista de aulas
POST /aulas      criar uma nova aula
DELETE /aulas/:id deletar uma aula
*/

const express = require("express");
const fs = require("fs");

const app = express();

const port = 3000;

app.use(express.json());

// npm i cors
const cors = require("cors")
app.use(cors())

// Lê o histórico do último ID
const historico = fs.readFileSync("historico.json", "utf-8");

const dadosHistoricos = JSON.parse(historico);

let ultimoId = dadosHistoricos.ultimoId;

// Lê as aulas cadastradas
const dadosAulas = fs.readFileSync("aulas.json", "utf-8");

const aulas = JSON.parse(dadosAulas);


// Função para salvar o último ID
function salvarHistoricoId() {
    const dados = {
        ultimoId: ultimoId
    };

    fs.writeFileSync(
        "historico.json",
        JSON.stringify(dados, null, 2)
    );
}


// GET /aulas
app.get ("/horario/:dia", (req,res) =>{
    const dia = req.params.dia
    try{
        const aulas = JSON.parse(fs.readFileSync("aulas.json", "utf8"))
        const horario_dia = aulas.filter((aula) => aula.dia == dia )
        const ordena_horario = horario_dia.sort((a,b) => a.ordem - b.ordem)

        res.status(200).json(ordena_horario)

    } catch (erro) {
        res.status(500).json({erro: erro.message})
    }
})


// POST /aulas
app.post("/aulas", (req, res) => {
    const novaAula = req.body;

    ultimoId++;

    novaAula.id = ultimoId;

    aulas.push(novaAula);

    fs.writeFileSync(
        "aulas.json",
        JSON.stringify(aulas, null, 2)
    );

    salvarHistoricoId();

    res.status(201).json(novaAula);
});


// DELETE /aulas/:id
app.delete("/aulas/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const index = aulas.findIndex(aula => aula.id === id);

    if (index !== -1) {
        aulas.splice(index, 1);

        fs.writeFileSync(
            "aulas.json",
            JSON.stringify(aulas, null, 2)
        );

        res.status(200).json({
            message: "Aula deletada com sucesso"
        });

    } else {
        res.status(404).json({
            message: "Aula não encontrada"
        });
    }
});


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});