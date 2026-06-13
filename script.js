// EcoLavoura - Projeto Bianck
// Jogo educativo para o Agrinho 2026
// HTML + CSS + JavaScript puro

const canvas = document.getElementById("gameCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const pontosElemento = document.getElementById("pontos");
const saudeElemento = document.getElementById("saude");
const tempoElemento = document.getElementById("tempo");

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

let pontos = 0;
let saude = 100;
let tempo = 60;
let jogoAtivo = false;
let itens = [];
let intervaloTempo = null;
let intervaloItens = null;
let animacaoId = null;

const tiposItens = [
  {
    nome: "Plástico",
    cor: "#e53935",
    icone: "🧴",
    pontos: 10,
    dano: 8,
    velocidade: 1.7
  },
  {
    nome: "Lixo",
    cor: "#5f6368",
    icone: "🗑️",
    pontos: 8,
    dano: 7,
    velocidade: 1.9
  },
  {
    nome: "Óleo",
    cor: "#263238",
    icone: "🛢️",
    pontos: 14,
    dano: 12,
    velocidade: 1.4
  },
  {
    nome: "Agrotóxico irregular",
    cor: "#8e24aa",
    icone: "⚠️",
    pontos: 18,
    dano: 15,
    velocidade: 1.3
  },
  {
    nome: "Garrafa",
    cor: "#1e88e5",
    icone: "🍾",
    pontos: 9,
    dano: 6,
    velocidade: 2
  }
];

const perguntas = [
  {
    pergunta: "Qual atitude ajuda a proteger o solo da lavoura?",
    opcoes: [
      "Fazer queimadas frequentes",
      "Usar plantio direto e cobertura vegetal",
      "Jogar lixo no campo",
      "Retirar toda a vegetação"
    ],
    resposta: 1,
    explicacao: "O plantio direto e a cobertura vegetal ajudam a reduzir a erosão e protegem o solo."
  },
  {
    pergunta: "Por que a água deve ser preservada no campo?",
    opcoes: [
      "Porque a produção rural depende dela",
      "Porque não tem relação com a agricultura",
      "Porque pode ser desperdiçada sem problema",
      "Porque só é importante na cidade"
    ],
    resposta: 0,
    explicacao: "A água é essencial para as plantas, animais, pessoas e para toda a produção rural."
  },
  {
    pergunta: "O que representa uma prática sustentável no agro?",
    opcoes: [
      "Produzir destruindo o ambiente",
      "Equilibrar produção e preservação ambiental",
      "Aumentar o lixo na lavoura",
      "Usar recursos naturais sem controle"
    ],
    resposta: 1,
    explicacao: "A sustentabilidade busca produzir com responsabilidade, cuidando dos recursos naturais."
  },
  {
    pergunta: "Qual resíduo pode contaminar o solo e a água?",
    opcoes: [
      "Adubo orgânico bem usado",
      "Óleo descartado incorretamente",
      "Cobertura vegetal",
      "Compostagem"
    ],
    resposta: 1,
    explicacao: "O óleo descartado de forma incorreta pode contaminar o solo, rios e nascentes."
  },
  {
    pergunta: "Como a tecnologia pode ajudar no campo?",
    opcoes: [
      "Aumentando o desperdício",
      "Monitorando água, solo e produção",
      "Substituindo todo cuidado ambiental",
      "Eliminando a necessidade de preservar"
    ],
    resposta: 1,
    explicacao: "Sensores, dados e monitoramento ajudam o produtor a tomar decisões melhores."
  }
];

let perguntaAtual = 0;
let pontosQuiz = 0;
let respondeuPergunta = false;

function atualizarPainel() {
  if (pontosElemento) pontosElemento.textContent = pontos;
  if (saudeElemento) saudeElemento.textContent = saude;
  if (tempoElemento) tempoElemento.textContent = tempo;
}

function limparCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, larguraCanvas, alturaCanvas);
}

function desenharFundo() {
  if (!ctx) return;

  ctx.fillStyle = "#bdefff";
  ctx.fillRect(0, 0, larguraCanvas, alturaCanvas * 0.45);

  ctx.fillStyle = "#75c76a";
  ctx.fillRect(0, alturaCanvas * 0.45, larguraCanvas, alturaCanvas * 0.25);

  ctx.fillStyle = "#8b5a2b";
  ctx.fillRect(0, alturaCanvas * 0.7, larguraCanvas, alturaCanvas * 0.3);

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(760, 55, 35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(90, 70, 24, 0, Math.PI * 2);
  ctx.arc(120, 62, 30, 0, Math.PI * 2);
  ctx.arc(150, 72, 24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2f80ed";
  ctx.fillRect(0, 250, larguraCanvas, 18);

  ctx.fillStyle = "#3da64a";
  for (let x = 20; x < larguraCanvas; x += 45) {
    ctx.fillRect(x, 330, 25, 8);
    ctx.fillRect(x + 8, 355, 25, 8);
    ctx.fillRect(x + 16, 380, 25, 8);
  }

  ctx.fillStyle = "#17351f";
  ctx.font = "18px Arial";
  ctx.fillText("Clique nos resíduos para proteger água, solo e plantas.", 20, 32);
}

function criarItem() {
  if (!jogoAtivo) return;

  const tipo = tiposItens[Math.floor(Math.random() * tiposItens.length)];

  const item = {
    x: Math.random() * (larguraCanvas - 80) + 40,
    y: -40,
    tamanho: Math.floor(Math.random() * 12) + 34,
    nome: tipo.nome,
    cor: tipo.cor,
    icone: tipo.icone,
    pontos: tipo.pontos,
    dano: tipo.dano,
    velocidade: tipo.velocidade + Math.random() * 0.8
  };

  itens.push(item);
}

function desenharItem(item) {
  if (!ctx) return;

  ctx.fillStyle = item.cor;
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.tamanho / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = `${item.tamanho - 6}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(item.icone, item.x, item.y + 1);

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function atualizarItens() {
  itens.forEach((item) => {
    item.y += item.velocidade;
  });

  const itensRestantes = [];

  itens.forEach((item) => {
    if (item.y > alturaCanvas + 30) {
      saude -= item.dano;
      if (saude < 0) saude = 0;
    } else {
      itensRestantes.push(item);
    }
  });

  itens = itensRestantes;
}

function desenharTelaInicial() {
  if (!ctx) return;

  desenharFundo();

  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.fillRect(170, 95, 510, 210);

  ctx.strokeStyle = "#237a3b";
  ctx.lineWidth = 4;
  ctx.strokeRect(170, 95, 510, 210);

  ctx.fillStyle = "#145327";
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";
  ctx.fillText("EcoLavoura", larguraCanvas / 2, 150);

  ctx.font = "20px Arial";
  ctx.fillText("Missão Lavoura Sustentável", larguraCanvas / 2, 190);

  ctx.font = "17px Arial";
  ctx.fillText("Clique em Iniciar jogo para começar.", larguraCanvas / 2, 230);
  ctx.fillText("Remova os resíduos antes que prejudiquem a lavoura.", larguraCanvas / 2, 260);

  ctx.textAlign = "left";
}

function desenharFimDeJogo() {
  if (!ctx) return;

  desenharFundo();

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.fillRect(150, 80, 550, 260);

  ctx.strokeStyle = "#237a3b";
  ctx.lineWidth = 4;
  ctx.strokeRect(150, 80, 550, 260);

  ctx.fillStyle = "#145327";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";

  if (saude <= 0) {
    ctx.fillText("A lavoura precisa de ajuda!", larguraCanvas / 2, 140);
  } else {
    ctx.fillText("Missão finalizada!", larguraCanvas / 2, 140);
  }

  ctx.font = "20px Arial";
  ctx.fillText(`Pontuação final: ${pontos}`, larguraCanvas / 2, 190);
  ctx.fillText(`Saúde da lavoura: ${saude}`, larguraCanvas / 2, 225);

  if (pontos >= 180 && saude >= 60) {
    ctx.fillText("Resultado: Guardião Sustentável do Campo", larguraCanvas / 2, 270);
  } else if (pontos >= 100) {
    ctx.fillText("Resultado: Protetor da Lavoura", larguraCanvas / 2, 270);
  } else {
    ctx.fillText("Resultado: Continue cuidando do meio ambiente", larguraCanvas / 2, 270);
  }

  ctx.textAlign = "left";
}

function animarJogo() {
  if (!ctx) return;

  limparCanvas();
  desenharFundo();

  if (jogoAtivo) {
    atualizarItens();

    itens.forEach((item) => {
      desenharItem(item);
    });

    if (saude <= 0 || tempo <= 0) {
      finalizarJogo();
      return;
    }

    atualizarPainel();
    animacaoId = requestAnimationFrame(animarJogo);
  } else {
    desenharFimDeJogo();
  }
}

function iniciarJogo() {
  if (!ctx) return;

  pontos = 0;
  saude = 100;
  tempo = 60;
  itens = [];
  jogoAtivo = true;

  atualizarPainel();

  if (intervaloTempo) clearInterval(intervaloTempo);
  if (intervaloItens) clearInterval(intervaloItens);
  if (animacaoId) cancelAnimationFrame(animacaoId);

  intervaloTempo = setInterval(() => {
    if (!jogoAtivo) return;

    tempo -= 1;

    if (tempo < 0) tempo = 0;

    atualizarPainel();

    if (tempo <= 0) {
      finalizarJogo();
    }
  }, 1000);

  intervaloItens = setInterval(() => {
    criarItem();
  }, 850);

  animarJogo();
}

function finalizarJogo() {
  jogoAtivo = false;

  if (intervaloTempo) clearInterval(intervaloTempo);
  if (intervaloItens) clearInterval(intervaloItens);
  if (animacaoId) cancelAnimationFrame(animacaoId);

  atualizarPainel();
  desenharFimDeJogo();
}

function reiniciarJogo() {
  iniciarJogo();
}

function verificarCliqueCanvas(evento) {
  if (!jogoAtivo || !canvas) return;

  const rect = canvas.getBoundingClientRect();
  const escalaX = canvas.width / rect.width;
  const escalaY = canvas.height / rect.height;

  const mouseX = (evento.clientX - rect.left) * escalaX;
  const mouseY = (evento.clientY - rect.top) * escalaY;

  for (let i = itens.length - 1; i >= 0; i--) {
    const item = itens[i];
    const distancia = Math.hypot(mouseX - item.x, mouseY - item.y);

    if (distancia <= item.tamanho / 2) {
      pontos += item.pontos;
      itens.splice(i, 1);
      atualizarPainel();
      return;
    }
  }
}

function carregarPergunta() {
  if (!perguntaQuiz || !opcoesQuiz || !feedbackQuiz || !progressoQuiz || !pontosQuizElemento) return;

  const pergunta = perguntas[perguntaAtual];
  respondeuPergunta = false;

  progressoQuiz.textContent = `Pergunta ${perguntaAtual + 1} de ${perguntas.length}`;
  pontosQuizElemento.textContent = pontosQuiz;
  perguntaQuiz.textContent = pergunta.pergunta;
  feedbackQuiz.textContent = "";
  feedbackQuiz.className = "feedback";
  opcoesQuiz.innerHTML = "";

  pergunta.opcoes.forEach((opcao, indice) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = opcao;
    botao.className = "opcao-quiz";

    botao.addEventListener("click", () => {
      responderPergunta(indice);
    });

    opcoesQuiz.appendChild(botao);
  });

  if (btnProxima) btnProxima.disabled = true;
}

function responderPergunta(indiceEscolhido) {
  if (respondeuPergunta) return;

  const pergunta = perguntas[perguntaAtual];
  const botoes = document.querySelectorAll(".opcao-quiz");

  respondeuPergunta = true;

  botoes.forEach((botao, indice) => {
    botao.disabled = true;

    if (indice === pergunta.resposta) {
      botao.classList.add("correta");
    }

    if (indice === indiceEscolhido && indiceEscolhido !== pergunta.resposta) {
      botao.classList.add("errada");
    }
  });

  if (indiceEscolhido === pergunta.resposta) {
    pontosQuiz += 10;
    feedbackQuiz.textContent = `Resposta correta! ${pergunta.explicacao}`;
    feedbackQuiz.className = "feedback sucesso";
  } else {
    feedbackQuiz.textContent = `Resposta incorreta. ${pergunta.explicacao}`;
    feedbackQuiz.className = "feedback erro";
  }

  pontosQuizElemento.textContent = pontosQuiz;

  if (btnProxima) btnProxima.disabled = false;
}

function proximaPergunta() {
  if (!respondeuPergunta) return;

  perguntaAtual += 1;

  if (perguntaAtual >= perguntas.length) {
    finalizarQuiz();
    return;
  }

  carregarPergunta();
}

function finalizarQuiz() {
  if (!perguntaQuiz || !opcoesQuiz || !feedbackQuiz || !progressoQuiz || !btnProxima) return;

  progressoQuiz.textContent = "Quiz finalizado";
  perguntaQuiz.textContent = `Você fez ${pontosQuiz} pontos no Quiz Sustentável.`;
  opcoesQuiz.innerHTML = "";

  if (pontosQuiz >= 40) {
    feedbackQuiz.textContent = "Excelente! Você entende muito bem a importância da sustentabilidade no campo.";
    feedbackQuiz.className = "feedback sucesso";
  } else {
    feedbackQuiz.textContent = "Continue estudando. O futuro sustentável depende de boas escolhas.";
    feedbackQuiz.className = "feedback erro";
  }

  btnProxima.disabled = true;
}

function reiniciarQuiz() {
  perguntaAtual = 0;
  pontosQuiz = 0;
  respondeuPergunta = false;
  carregarPergunta();
}

function configurarEventos() {
  if (canvas) {
    canvas.addEventListener("click", verificarCliqueCanvas);
  }

  if (btnIniciar) {
    btnIniciar.addEventListener("click", iniciarJogo);
  }

  if (btnReiniciar) {
    btnReiniciar.addEventListener("click", reiniciarJogo);
  }

  if (btnProxima) {
    btnProxima.addEventListener("click", proximaPergunta);
  }

  if (btnReiniciarQuiz) {
    btnReiniciarQuiz.addEventListener("click", reiniciarQuiz);
  }
}

function iniciarProjeto() {
  atualizarPainel();

  if (ctx) {
    desenharTelaInicial();
  }

  configurarEventos();
  carregarPergunta();
}

document.addEventListener("DOMContentLoaded", iniciarProjeto);