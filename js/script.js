const canvas = document.getElementById("canvasJogo");
const ctx = canvas.getContext("2d");

const pontosElemento = document.getElementById("pontos");
const saudeElemento = document.getElementById("saude");
const tempoElemento = document.getElementById("tempo");
const mensagemJogo = document.getElementById("mensagemJogo");

const btnIniciar = document.getElementById("btnIniciar");
const btnReiniciar = document.getElementById("btnReiniciar");

const perguntaQuiz = document.getElementById("perguntaQuiz");
const opcoesQuiz = document.getElementById("opcoesQuiz");
const feedbackQuiz = document.getElementById("feedbackQuiz");
const progressoQuiz = document.getElementById("progressoQuiz");
const pontosQuizElemento = document.getElementById("pontosQuiz");
const btnProxima = document.getElementById("btnProxima");
const btnReiniciarQuiz = document.getElementById("btnReiniciarQuiz");

let larguraCanvas = 850;
let alturaCanvas = 420;

let itens = [];
let pontos = 0;
let saude = 100;
let tempo = 45;
let jogoAtivo = false;
let intervaloTempo = null;
let velocidadeBase = 1.8;

let perguntaAtual = 0;
let pontosQuiz = 0;
let respondeu = false;

const perguntas = [
  {
    pergunta: "Qual prática ajuda a proteger o solo contra erosão?",
    opcoes: [
      "Deixar o solo descoberto",
      "Usar cobertura vegetal",
      "Retirar toda a vegetação",
      "Jogar resíduos na lavoura"
    ],
    correta: 1
  },
  {
    pergunta: "Por que monitorar a umidade do solo é importante?",
    opcoes: [
      "Para irrigar com mais consciência e evitar desperdício",
      "Para gastar mais água",
      "Para prejudicar as plantas",
      "Para aumentar a erosão"
    ],
    correta: 0
  },
  {
    pergunta: "O que representa uma produção agrícola sustentável?",
    opcoes: [
      "Produzir sem cuidar do ambiente",
      "Equilibrar produção, solo, água e preservação",
      "Desmatar todas as áreas verdes",
      "Usar recursos naturais sem controle"
    ],
    correta: 1
  },
  {
    pergunta: "Qual atitude ajuda a preservar nascentes?",
    opcoes: [
      "Remover mata ciliar",
      "Jogar lixo perto da água",
      "Manter vegetação ao redor",
      "Compactar o solo ao redor"
    ],
    correta: 2
  },
  {
    pergunta: "Como a tecnologia pode ajudar o produtor rural?",
    opcoes: [
      "Gerando dados para tomar melhores decisões",
      "Substituindo totalmente a natureza",
      "Aumentando desperdício",
      "Impedindo o plantio"
    ],
    correta: 0
  }
];

function ajustarCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  larguraCanvas = canvas.width;
  alturaCanvas = canvas.height;
}

function numeroAleatorio(min, max) {
  return Math.random() * (max - min) + min;
}

function escolherAleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function criarItem() {
  const tipo = escolherAleatorio(["residuo", "natureza"]);

  const residuos = ["🧴", "🛍️", "🥤", "📦"];
  const natureza = ["🌱", "🌳", "💧", "🌾"];

  return {
    x: numeroAleatorio(35, larguraCanvas - 35),
    y: numeroAleatorio(-300, -40),
    tamanho: numeroAleatorio(28, 42),
    velocidade: numeroAleatorio(velocidadeBase, velocidadeBase + 2.2),
    tipo: tipo,
    emoji: tipo === "residuo" ? escolherAleatorio(residuos) : escolherAleatorio(natureza)
  };
}

function criarItensIniciais() {
  itens = [];

  for (let i = 0; i < 12; i++) {
    itens.push(criarItem());
  }
}

function desenharFundo() {
  const gradiente = ctx.createLinearGradient(0, 0, 0, alturaCanvas);
  gradiente.addColorStop(0, "#9ee6a7");
  gradiente.addColorStop(1, "#2e7d32");

  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, larguraCanvas, alturaCanvas);

  ctx.fillStyle = "rgba(93, 64, 55, 0.35)";

  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 130, alturaCanvas - 30, 90, 28, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.font = "bold 18px Arial";
  ctx.fillText("Clique nos resíduos. Preserve água, solo e plantas!", 20, 32);
}

function desenharItens() {
  itens.forEach(function (item, indice) {
    ctx.font = item.tamanho + "px Arial";
    ctx.fillText(item.emoji, item.x, item.y);

    if (jogoAtivo) {
      item.y += item.velocidade;
    }

    if (item.y > alturaCanvas + 40) {
      if (item.tipo === "residuo" && jogoAtivo) {
        saude -= 5;
      }

      itens[indice] = criarItem();
    }
  });
}

function desenharTelaInicial() {
  desenharFundo();

  ctx.fillStyle = "rgba(13, 63, 36, 0.82)";
  ctx.fillRect(0, 0, larguraCanvas, alturaCanvas);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 30px Arial";
  ctx.fillText("Missão Lavoura Sustentável", larguraCanvas / 2, alturaCanvas / 2 - 30);

  ctx.font = "18px Arial";
  ctx.fillText("Clique em iniciar para proteger a lavoura.", larguraCanvas / 2, alturaCanvas / 2 + 8);

  ctx.textAlign = "left";
}

function animarJogo() {
  if (!jogoAtivo) {
    desenharTelaInicial();
    requestAnimationFrame(animarJogo);
    return;
  }

  desenharFundo();
  desenharItens();
  atualizarPainel();

  if (saude <= 0) {
    finalizarJogo("A lavoura perdeu sua saúde. Tente novamente com mais atenção aos resíduos.");
  }

  if (tempo <= 0) {
    finalizarJogo("Tempo encerrado! Sua pontuação final foi " + pontos + ".");
  }

  requestAnimationFrame(animarJogo);
}

function atualizarPainel() {
  pontosElemento.textContent = pontos;
  saudeElemento.textContent = Math.max(saude, 0);
  tempoElemento.textContent = tempo;
}

function iniciarJogo() {
  pontos = 0;
  saude = 100;
  tempo = 45;
  velocidadeBase = 1.8;
  jogoAtivo = true;

  mensagemJogo.textContent = "Jogo iniciado! Clique nos resíduos para proteger a lavoura.";

  criarItensIniciais();
  atualizarPainel();

  clearInterval(intervaloTempo);

  intervaloTempo = setInterval(function () {
    if (!jogoAtivo) {
      return;
    }

    tempo--;
    velocidadeBase += 0.03;
  }, 1000);
}

function finalizarJogo(mensagem) {
  jogoAtivo = false;
  clearInterval(intervaloTempo);
  mensagemJogo.textContent = mensagem;
  atualizarPainel();
}

function reiniciarJogo() {
  jogoAtivo = false;
  pontos = 0;
  saude = 100;
  tempo = 45;
  velocidadeBase = 1.8;

  clearInterval(intervaloTempo);
  criarItensIniciais();
  atualizarPainel();

  mensagemJogo.textContent = "Clique em iniciar para começar novamente.";
}

canvas.addEventListener("click", function (evento) {
  if (!jogoAtivo) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const mouseX = evento.clientX - rect.left;
  const mouseY = evento.clientY - rect.top;

  itens.forEach(function (item, indice) {
    const distancia = Math.hypot(mouseX - item.x, mouseY - item.y);

    if (distancia < 34) {
      if (item.tipo === "residuo") {
        pontos += 10;
        mensagemJogo.textContent = "Muito bem! Você removeu um resíduo da lavoura.";
      } else {
        pontos -= 5;
        saude -= 8;
        mensagemJogo.textContent = "Atenção! Esse item era importante para a natureza.";
      }

      itens[indice] = criarItem();
      atualizarPainel();
    }
  });
});

function carregarPergunta() {
  respondeu = false;
  feedbackQuiz.textContent = "";
  opcoesQuiz.innerHTML = "";

  const item = perguntas[perguntaAtual];

  progressoQuiz.textContent = "Pergunta " + (perguntaAtual + 1) + " de " + perguntas.length;
  pontosQuizElemento.textContent = pontosQuiz;
  perguntaQuiz.textContent = item.pergunta;

  item.opcoes.forEach(function (opcao, indice) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = opcao;

    botao.addEventListener("click", function () {
      responderQuiz(indice, botao);
    });

    opcoesQuiz.appendChild(botao);
  });
}

function responderQuiz(indiceEscolhido, botaoClicado) {
  if (respondeu) {
    return;
  }

  respondeu = true;

  const item = perguntas[perguntaAtual];
  const botoes = opcoesQuiz.querySelectorAll("button");

  botoes.forEach(function (botao, indice) {
    botao.disabled = true;

    if (indice === item.correta) {
      botao.classList.add("correta");
    }
  });

  if (indiceEscolhido === item.correta) {
    pontosQuiz++;
    pontosQuizElemento.textContent = pontosQuiz;
    feedbackQuiz.textContent = "Resposta correta! Excelente atitude sustentável.";
    feedbackQuiz.style.color = "#1f8a45";
  } else {
    botaoClicado.classList.add("errada");
    feedbackQuiz.textContent = "Resposta incorreta. Observe a alternativa correta destacada.";
    feedbackQuiz.style.color = "#b42318";
  }
}

function proximaPergunta() {
  if (perguntaAtual < perguntas.length - 1) {
    perguntaAtual++;
    carregarPergunta();
    return;
  }

  perguntaQuiz.textContent = "Quiz finalizado!";
  opcoesQuiz.innerHTML = "";
  feedbackQuiz.style.color = "#1f8a45";
  feedbackQuiz.textContent = "Você fez " + pontosQuiz + " ponto(s) de " + perguntas.length + ".";
}

function reiniciarQuiz() {
  perguntaAtual = 0;
  pontosQuiz = 0;
  carregarPergunta();
}

btnIniciar.addEventListener("click", iniciarJogo);
btnReiniciar.addEventListener("click", reiniciarJogo);
btnProxima.addEventListener("click", proximaPergunta);
btnReiniciarQuiz.addEventListener("click", reiniciarQuiz);

window.addEventListener("resize", function () {
  ajustarCanvas();
  criarItensIniciais();
});

ajustarCanvas();
criarItensIniciais();
atualizarPainel();
carregarPergunta();
animarJogo();
