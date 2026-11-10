(function () {
  "use strict";

  const form = document.querySelector("#diagnostico-form");
  if (!form || !window.CortinasDiagnosticRules) return;

  const steps = [...form.querySelectorAll("[data-step]")];
  const previousButton = form.querySelector("[data-previous]");
  const nextButton = form.querySelector("[data-next]");
  const finishButton = form.querySelector("[data-finish]");
  const errorMessage = form.querySelector("[data-form-error]");
  const count = document.querySelector("[data-step-count]");
  const progress = document.querySelector("[data-progress]");
  const progressFill = document.querySelector("[data-progress-fill]");
  const progressCaption = document.querySelector("[data-progress-caption]");
  const contactStep = document.querySelector("[data-contact-step]");
  const whatsappLink = document.querySelector("[data-whatsapp-link]");
  const recommendation = document.querySelector("[data-recommendation]");
  const recommendationTitle = document.querySelector("[data-recommendation-title]");
  const recommendationCopy = document.querySelector("[data-recommendation-copy]");
  const recommendationReasons = document.querySelector("[data-recommendation-reasons]");
  const recommendationNote = document.querySelector("[data-recommendation-note]");
  const editButtons = document.querySelectorAll("[data-edit]");
  const whatsappNumber = "5515996113859";
  let currentStep = 0;
  document.documentElement.classList.add("js");

  const choiceLabels = {
    segment: {
      "servicos-locais": "Serviços locais",
      comercio: "Comércio ou loja",
      "alimentacao-eventos": "Alimentação ou eventos",
      "beleza-saude": "Beleza ou saúde",
      "profissional-b2b": "Serviço profissional ou B2B",
      outro: "Outro tipo de negócio"
    },
    audience: {
      "pessoas-regiao": "Pessoas e famílias da região",
      empresas: "Empresas ou equipes",
      eventos: "Organizadores de festas ou eventos",
      "publico-especifico": "Público com uma necessidade específica",
      "a-definir": "Ainda precisa definir"
    },
    goal: {
      "pedir-orcamento": "Pedir um orçamento",
      agendar: "Agendar ou marcar uma conversa",
      "fazer-pedido": "Fazer um pedido ou comprar",
      "conhecer-trabalho": "Conhecer o trabalho e os serviços",
      "a-definir": "Ainda não tem certeza"
    },
    channel: {
      whatsapp: "WhatsApp",
      "redes-sociais": "Redes sociais",
      "telefone-presencial": "Telefone ou atendimento presencial",
      site: "Site ou formulário",
      "sem-canal": "Ainda não tem um caminho definido"
    },
    challenge: {
      "oferta-confusa": "As pessoas não entendem bem a oferta",
      "pouca-visibilidade": "É difícil encontrar ou conhecer o negócio",
      "perguntas-repetidas": "Há dúvidas repetidas antes de fechar",
      "poucos-pedidos": "Quer organizar a chegada de pedidos",
      "nao-sei": "Ainda não identificou o principal obstáculo"
    },
    offerStatus: {
      definida: "Sim, há uma oferta principal",
      varias: "Há opções e precisa escolher",
      "nao-definida": "Ainda não definiu uma oferta"
    },
    materials: {
      autorizados: "Tem materiais próprios que pode autorizar",
      "parte-pendente": "Tem materiais, mas precisa confirmar permissões",
      "sem-materiais": "Ainda não tem materiais prontos"
    },
    complexity: {
      "pagina-unica": "Uma página com apresentação e botão de contato",
      catalogo: "Catálogo ou várias categorias de produtos",
      "agenda-pagamento": "Agenda, pagamento ou pedido online",
      "integracoes-automacao": "Integrações ou automações de atendimento",
      "nao-sei": "Ainda não sabe o que será necessário"
    },
    followUp: {
      "eu-acompanho": "A própria pessoa vai acompanhar as mensagens",
      "equipe-definida": "Uma pessoa da equipe já está responsável",
      "sem-responsavel": "Ainda não definiu quem vai responder",
      "capacidade-incerta": "Precisa entender se consegue atender mais pedidos"
    }
  };

  function showStep(index) {
    currentStep = index;
    steps.forEach((step, stepIndex) => {
      step.hidden = stepIndex !== index;
    });
    const questionNumber = index + 1;
    count.innerHTML = `${String(questionNumber).padStart(2, "0")} <span>/ ${steps.length}</span>`;
    progress.setAttribute("aria-valuenow", String(questionNumber));
    progressFill.style.width = `${(questionNumber / steps.length) * 100}%`;
    progressCaption.textContent = `Pergunta ${questionNumber} de ${steps.length}`;
    previousButton.disabled = index === 0;
    previousButton.hidden = index === 0;
    nextButton.hidden = index === steps.length - 1;
    finishButton.hidden = index !== steps.length - 1;
    errorMessage.hidden = true;
    steps[index].querySelector("input, textarea")?.focus({ preventScroll: true });
  }

  function isCurrentStepValid() {
    const controls = [...steps[currentStep].querySelectorAll("input, textarea")];
    const radioGroups = new Set(controls.filter(control => control.type === "radio").map(control => control.name));
    const radiosAreValid = [...radioGroups].every(name =>
      controls.some(control => control.type === "radio" && control.name === name && control.checked)
    );
    const textControls = controls.filter(control => control.type !== "radio");
    const invalidTextControl = textControls.find(control => {
      control.setCustomValidity("");
      const valid = control.checkValidity() && control.value.trim().length > 0;
      if (!valid) control.setCustomValidity("Preencha este campo antes de continuar.");
      return !valid;
    });
    const textControlsAreValid = !invalidTextControl;

    if (!radiosAreValid || !textControlsAreValid) {
      errorMessage.hidden = false;
      if (invalidTextControl) invalidTextControl.reportValidity();
      else steps[currentStep].querySelector('input[type="radio"]')?.focus();
      return false;
    }

    errorMessage.hidden = true;
    return true;
  }

  function getAnswers() {
    const answers = Object.fromEntries(new FormData(form).entries());
    answers.priorityOffer = String(answers.priorityOffer || "").trim();
    return answers;
  }

  function buildMessage(answers, result) {
    const labels = [
      ["segment", "Tipo de negócio"],
      ["priorityOffer", "Oferta que quer destacar"],
      ["audience", "Público"],
      ["goal", "Objetivo"],
      ["channel", "Canal atual"],
      ["challenge", "Principal dificuldade"],
      ["offerStatus", "Oferta prioritária"],
      ["materials", "Materiais autorizados"],
      ["complexity", "Necessidade da solução"],
      ["followUp", "Responsável pelos pedidos"]
    ];
    const details = labels.map(([key, label], index) => {
      const answer = choiceLabels[key]?.[answers[key]] || answers[key];
      return `${index + 1}. ${label}: ${answer}`;
    });
    const routeLabels = {
      "site-express": "conversar sobre o Site Express",
      "escopo-personalizado": "avaliar um escopo personalizado",
      diagnostico: "fazer um diagnóstico antes da proposta"
    };
    return [
      "Olá! Respondi ao diagnóstico da Cortinas IA e gostaria de conversar.",
      "",
      ...details,
      "",
      `Indicação inicial: ${routeLabels[result.route]}.`,
      "Sei que a indicação é preliminar e quero confirmar o escopo com a equipe."
    ].join("\n");
  }

  function showRecommendation(result) {
    recommendationTitle.textContent = result.title;
    recommendationCopy.textContent = result.copy;
    recommendationReasons.replaceChildren(...result.reasons.map(reason => {
      const item = document.createElement("li");
      item.textContent = reason;
      return item;
    }));
    recommendationNote.textContent = result.note;
    recommendation.hidden = false;
    recommendation.focus();
  }

  previousButton.addEventListener("click", () => {
    if (currentStep > 0) showStep(currentStep - 1);
  });

  nextButton.addEventListener("click", () => {
    if (isCurrentStepValid()) showStep(currentStep + 1);
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!isCurrentStepValid()) return;

    const answers = getAnswers();
    const result = window.CortinasDiagnosticRules.recommend(answers);
    const message = buildMessage(answers, result);
    whatsappLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    form.hidden = true;
    document.querySelector("[data-form-actions]").hidden = true;
    document.querySelector(".privacy-note").hidden = true;
    contactStep.hidden = false;
    contactStep.scrollIntoView({ behavior: "smooth", block: "center" });
    contactStep.querySelector("a").focus({ preventScroll: true });

    whatsappLink.addEventListener("click", () => {
      showRecommendation(result);
    }, { once: true });
  });

    editButtons.forEach(button => {
      button.addEventListener("click", () => {
        recommendation.hidden = true;
        contactStep.hidden = true;
        form.hidden = false;
        document.querySelector("[data-form-actions]").hidden = false;
        document.querySelector(".privacy-note").hidden = false;
        showStep(steps.length - 1);
      });
    });

    showStep(0);
})();
