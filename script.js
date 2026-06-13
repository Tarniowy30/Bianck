// EcoLavoura - JavaScript do jogo e do quiz
// Projeto Agrinho 2026 - HTML, CSS e JavaScript separados

document.addEventListener("DOMContentLoaded", function () {
  // ELEMENTOS DO JOGO
  const canvas = document.getElementById("telaJogo");
  const ctx = canvas.getContext("2d");

  const pontosEl = document.getElementById("pontos");
  const saudeEl = document.getElementById("saude");
  const tempoEl = document.getElementById("tempo");
  const mensagemJogo = document.getElementById("mensagemJogo");

  const btnIniciar = document.getElementById("btnIniciar");
  const btnReiniciar = document.getElementById("btnReiniciar");

  // ELEMENTOS DO QUIZ
  const perguntaAtualEl = document.getElementById("perguntaAtual");
  const totalPerguntasEl = document.getElementById("totalPerguntas");
  const pontosQuizEl = document.getElementById("pontosQuiz");
  const perguntaTextoEl = document.getElementById("perguntaTexto");
  const opcoesQuizEl = document.getElementById("opcoesQuiz");
  const feedbackQuizEl = document.getElementById("feedbackQuiz");
  const btnProxima = document.getElementById("btnProxima");
  const btnReiniciarQuiz = document.getElementById("btnReiniciarQuiz");

  // VARIÁVEIS DO JOGO
  let pontos = 0;
  let saude = 100;
  let tempo = 45;
  let jogoAtivo = false;
  let itens = [];
  let intervaloTempo = null;
  let animacao = null;
  let ultimoItem = 0;

  // TIPOS DE ITENS DO JOGO
  const tiposItens = [
    {
      nome: "Garrafa plástica",
      emoji: "🧴",
      tipo: "residuo",
      pontos: 10,
      dano: 8,
      mensagem: "Boa ação! Você removeu um resíduo da lavoura."
    },
    {
      nome: "Lata descartada",
      emoji: "🥫",
      tipo: "residuo",
      pontos: 10,
      dano: 8,
      mensagem: "Muito bem! O descarte correto protege o solo."
    },
    {
      nome: "Saco de lixo",
      emoji: "🗑️",
      tipo: "residuo",
      pontos: 12,
      dano: 10,
      mensagem: "Ótimo! Menos lixo no campo significa mais sustentabilidade."
    },
    {
      nome: "Abelha",
      emoji: "🐝",
      tipo: "natural",
      pontos: -8,
      dano: 10,
      mensagem: "Cuidado! As abelhas ajudam na polinização."
    },
    {
      nome: "Folha",
      emoji: "🍃",
      tipo: "natural",
      pontos: -6,
      dano: 8,
      mensagem: "Cuidado! As plantas fazem parte do equilíbrio ambiental."
    },
    {
      nome: "Gota de água",
      emoji: "💧",
      tipo: "natural",
      pontos: -6,
      dano: 8,
      mensagem: "Cuidado! A água deve ser preservada."
    },
    {
      nome: "Sensor agrícola",
      emoji: "📡",
      tipo: "tecnologia",
      pontos: 15,
      cura: 5,
      mensagem: "Tecnologia no campo! Você ganhou pontos e recuperou saúde."
    }
  ];

  // ATUALIZA O PAINEL DO JOGO
  function atualizarPainel() {
    pontosEl.textContent = pontos;
    saudeEl.textContent = Math.max(saude, 0) + "%";
    tempoEl.textContent = tempo + "s";
  }

  // MOSTRA MENSAGENS DO JOGO
  function mostrarMensagem(texto, tipo) {
    mensagemJogo.textContent = texto;
    mensagemJogo.className = "mensagem";

    if (tipo === "sucesso") {
      mensagemJogo.classList.add("sucesso");
    }

    if (tipo === "erro") {
      mensagemJogo.classList.add("erro");
    }
  }

  // DESENHA O CENÁRIO DO JOGO
  function desenharCenario() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Céu
    const gradienteCeu = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradienteCeu.addColorStop(0, "#bfdbfe");
    gradienteCeu.addColorStop(1, "#ecfeff");
    ctx.fillStyle = gradienteCeu;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sol
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(80, 70, 35, 0, Math.PI * 2);
    ctx.fill();

    // Nuvens
    desenharNuvem(210, 75);
    desenharNuvem(650, 90);

    // Campo
    ctx.fillStyle = "#166534";
    ctx.fillRect(0, 280, canvas.width, 170);

    // Linhas da lavoura
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 3;

    for (let y = 310; y < canvas.height; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(220, y - 18, 650, y + 18, canvas.width, y);
      ctx.stroke();
    }

    // Plantinhas
    ctx.font = "24px Arial";
    for (let x = 35; x < canvas.width; x += 75) {
      ctx.fillText("🌱", x, 390);
    }

    for (let x = 70; x < canvas.width; x += 90) {
      ctx.fillText("🌾", x, 430);
    }
  }

  // DESENHA NUVEM
  function desenharNuvem(x, y) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 8, 28, 0, Math.PI * 2);
    ctx.arc(x + 55, y, 22, 0, Math.PI * 2);
    ctx.arc(x + 28, y + 12, 28, 0, Math.PI * 2);
    ctx.fill();
  }

  // CRIA UM ITEM CAINDO
  function criarItem() {
    const sorteado = tiposItens[Math.floor(Math.random() * tiposItens.length)];

    const item = {
      nome: sorteado.nome,
      emoji: sorteado.emoji,
      tipo: sorteado.tipo,
      pontos: sorteado.pontos,
      dano: sorteado.dano || 0,
      cura: sorteado.cura || 0,
      mensagem: sorteado.mensagem,
      x: Math.random() * (canvas.width - 80) + 40,
      y: -40,
      raio: 28,
      velocidade: Math.random() * 1.8 + 1.5
    };

    itens.push(item);
  }

  // DESENHA ITEM
  function desenharItem(item) {
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.arc(item.x, item.y, item.raio + 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillText(item.emoji, item.x, item.y);
  }

  // ATUALIZA OS ITENS
  function atualizarItens() {
    for (let i = itens.length - 1; i >= 0; i--) {
      itens[i].y += itens[i].velocidade;

      if (itens[i].y > canvas.height + 40) {
        if (itens[i].tipo === "residuo") {
          saude -= itens[i].dano;
          mostrarMensagem("Um resíduo ficou na lavoura. A saúde do campo diminuiu.", "erro");
        }

        itens.splice(i, 1);
      }
    }
  }

  // LOOP DO JOGO
  function loopJogo(tempoAtual) {
    if (!jogoAtivo) {
      return;
    }

    desenharCenario();

    if (tempoAtual - ultimoItem > 850) {
      criarItem();
      ultimoItem = tempoAtual;
    }

    atualizarItens();

    for (let i = 0; i < itens.length; i++) {
      desenharItem(itens[i]);
    }

    atualizarPainel();

    if (saude <= 0) {
      finalizarJogo("A lavoura perdeu a saúde. Reinicie e tente novamente.", "erro");
      return;
    }

    animacao = requestAnimationFrame(loopJogo);
  }

  // INICIA O JOGO
  function iniciarJogo() {
    pontos = 0;
    saude = 100;
    tempo = 45;
    itens = [];
    jogoAtivo = true;
    ultimoItem = 0;

    btnIniciar.disabled = true;

    atualizarPainel();
    mostrarMensagem("Jogo iniciado! Clique nos resíduos e preserve a natureza.", "sucesso");

    clearInterval(intervaloTempo);

    intervaloTempo = setInterval(function () {
      tempo--;
      atualizarPainel();

      if (tempo <= 0) {
        finalizarJogo("Missão concluída! Sua pontuação final foi: " + pontos + " pontos.", "sucesso");
      }
    }, 1000);

    cancelAnimationFrame(animacao);
    animacao = requestAnimationFrame(loopJogo);
  }

  // FINALIZA O JOGO
  function finalizarJogo(texto, tipo) {
    jogoAtivo = false;

    clearInterval(intervaloTempo);
    cancelAnimationFrame(animacao);

    btnIniciar.disabled = false;

    mostrarMensagem(texto, tipo);
    atualizarPainel();
  }

  // REINICIA O JOGO
  function reiniciarJogo() {
    jogoAtivo = false;
    pontos = 0;
    saude = 100;
    tempo = 45;
    itens = [];

    clearInterval(intervaloTempo);
    cancelAnimationFrame(animacao);

    btnIniciar.disabled = false;

    atualizarPainel();
    desenharCenario();
    mostrarMensagem("Clique em iniciar para começar.", "");
  }

  // CLIQUE NO CANVAS
  canvas.addEventListener("click", function (evento) {
    if (!jogoAtivo) {
      return;
    }

    const retangulo = canvas.getBoundingClientRect();
    const escalaX = canvas.width / retangulo.width;
    const escalaY = canvas.height / retangulo.height;

    const mouseX = (evento.clientX - retangulo.left) * escalaX;
    const mouseY = (evento.clientY - retangulo.top) * escalaY;

    for (let i = itens.length - 1; i >= 0; i--) {
      const item = itens[i];
      const distancia = Math.hypot(mouseX - item.x, mouseY - item.y);

      if (distancia <= item.raio + 12) {
        if (item.tipo === "residuo") {
          pontos += item.pontos;
          mostrarMensagem(item.mensagem, "sucesso");
        }

        if (item.tipo === "natural") {
          pontos = Math.max(0, pontos + item.pontos);
          saude -= item.dano;
          mostrarMensagem(item.mensagem, "erro");
        }

        if (item.tipo === "tecnologia") {
          pontos += item.pontos;
          saude = Math.min(100, saude + item.cura);
          mostrarMensagem(item.mensagem, "sucesso");
        }

        itens.splice(i, 1);
        atualizarPainel();
        return;
      }
    }
  });

  btnIniciar.addEventListener("click", iniciarJogo);
  btnReiniciar.addEventListener("click", reiniciarJogo);

  // QUIZ
  const perguntas = [
    {
      pergunta: "Qual atitude ajuda a proteger o solo na agricultura?",
      opcoes: [
        "Jogar resíduos na lavoura",
        "Usar cobertura vegetal e evitar erosão",
        "Retirar toda vegetação do terreno",
        "Desperdiçar água na irrigação"
      ],
      correta: 1,
      explicacao: "A cobertura vegetal ajuda a proteger o solo contra erosão e perda de nutrientes."
    },
    {
      pergunta: "Por que as matas ciliares são importantes?",
      opcoes: [
        "Porque protegem rios e nascentes",
        "Porque aumentam a poluição",
        "Porque eliminam a necessidade de água",
        "Porque impedem qualquer produção agrícola"
      ],
      correta: 0,
      explicacao: "As matas ciliares protegem as margens dos rios e ajudam a preservar a água."
    },
    {
      pergunta: "Como a tecnologia pode ajudar o campo?",
      opcoes: [
        "Aumentando desperdícios",
        "Substituindo todo cuidado ambiental",
        "Monitorando solo, clima e uso de recursos",
        "Eliminando o planejamento"
      ],
      correta: 2,
      explicacao: "Sensores, dados e programação ajudam o produtor a tomar decisões melhores."
    },
    {
      pergunta: "O que deve ser feito com resíduos no campo?",
      opcoes: [
        "Jogar no rio",
        "Deixar espalhado",
        "Queimar em qualquer lugar",
        "Separar e encaminhar para descarte correto"
      ],
      correta: 3,
      explicacao: "O descarte correto evita contaminação do solo, da água e dos alimentos."
    },
    {
      pergunta: "O que significa equilíbrio entre produção e meio ambiente?",
      opcoes: [
        "Produzir sem cuidar da natureza",
        "Produzir com responsabilidade e preservar recursos naturais",
        "Não produzir alimentos",
        "Usar mais recursos do que a natureza consegue repor"
      ],
      correta: 1,
      explicacao: "O agro sustentável une produtividade com cuidado ambiental."
    }
  ];

  let perguntaAtual = 0;
  let pontosQuiz = 0;
  let respondeu = false;

  totalPerguntasEl.textContent = perguntas.length;

  function carregarPergunta() {
    respondeu = false;

    const pergunta = perguntas[perguntaAtual];

    perguntaAtualEl.textContent = perguntaAtual + 1;
    pontosQuizEl.textContent = pontosQuiz;
    perguntaTextoEl.textContent = pergunta.pergunta;
    feedbackQuizEl.textContent = "Escolha uma alternativa.";
    feedbackQuizEl.className = "feedback";
    btnProxima.disabled = true;

    opcoesQuizEl.innerHTML = "";

    for (let i = 0; i < pergunta.opcoes.length; i++) {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "opcao-quiz";
      botao.textContent = pergunta.opcoes[i];

      botao.addEventListener("click", function () {
        responderPergunta(i);
      });

      opcoesQuizEl.appendChild(botao);
    }
  }

  function responderPergunta(indiceEscolhido) {
    if (respondeu) {
      return;
    }

    respondeu = true;

    const pergunta = perguntas[perguntaAtual];
    const botoes = document.querySelectorAll(".opcao-quiz");

    for (let i = 0; i < botoes.length; i++) {
      botoes[i].disabled = true;

      if (i === pergunta.correta) {
        botoes[i].classList.add("correta");
      }

      if (i === indiceEscolhido && indiceEscolhido !== pergunta.correta) {
        botoes[i].classList.add("errada");
      }
    }

    if (indiceEscolhido === pergunta.correta) {
      pontosQuiz += 10;
      feedbackQuizEl.textContent = "Resposta correta! " + pergunta.explicacao;
      feedbackQuizEl.className = "feedback sucesso";
    } else {
      feedbackQuizEl.textContent = "Resposta incorreta. " + pergunta.explicacao;
      feedbackQuizEl.className = "feedback erro";
    }

    pontosQuizEl.textContent = pontosQuiz;
    btnProxima.disabled = false;
  }

  function proximaPergunta() {
    if (perguntaAtual < perguntas.length - 1) {
      perguntaAtual++;
      carregarPergunta();
    } else {
      perguntaTextoEl.textContent = "Quiz finalizado!";
      opcoesQuizEl.innerHTML = "";
      feedbackQuizEl.textContent =
        "Sua pontuação final foi " +
        pontosQuiz +
        " de " +
        perguntas.length * 10 +
        " pontos.";
      feedbackQuizEl.className = "feedback sucesso";
      btnProxima.disabled = true;
    }
  }

  function reiniciarQuiz() {
    perguntaAtual = 0;
    pontosQuiz = 0;
    carregarPergunta();
  }

  btnProxima.addEventListener("click", proximaPergunta);
  btnReiniciarQuiz.addEventListener("click", reiniciarQuiz);

  // INICIALIZAÇÃO
  desenharCenario();
  atualizarPainel();
  carregarPergunta();
});