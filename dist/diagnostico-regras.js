(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CortinasDiagnosticRules = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function recommend(answers) {
    const reasons = [];

    if (answers.offerStatus !== "definida") {
      reasons.push("A oferta principal ainda precisa ser escolhida ou organizada.");
    }
    if (answers.audience === "a-definir") {
      reasons.push("Vale definir primeiro quem mais se beneficia do que você oferece.");
    }
    if (answers.goal === "a-definir") {
      reasons.push("O objetivo da página ainda precisa ficar claro.");
    }
    if (answers.complexity === "nao-sei") {
      reasons.push("Ainda é necessário entender o que a solução precisa incluir.");
    }
    if (answers.followUp === "sem-responsavel" || answers.followUp === "capacidade-incerta") {
      reasons.push("É importante confirmar quem vai acompanhar os pedidos e a capacidade de atendimento.");
    }

    if (reasons.length > 0) {
      return {
        route: "diagnostico",
        title: "Vale fazer um diagnóstico antes de definir a proposta.",
        copy: "Algumas decisões de oferta, público, escopo ou atendimento ainda precisam de clareza. Uma conversa de diagnóstico ajuda a escolher uma prioridade realista antes de recomendar uma página ou automação.",
        reasons: reasons.slice(0, 3),
        note: "A resposta não impede um projeto. Ela indica que o próximo passo é entender melhor o contexto, sem assumir disponibilidade ou resultado."
      };
    }

    if (["catalogo", "agenda-pagamento", "integracoes-automacao"].includes(answers.complexity)) {
      return {
        route: "escopo-personalizado",
        title: "Seu caso pode precisar de um escopo personalizado.",
        copy: "A necessidade parece envolver mais do que uma página direta. Antes de propor, vale mapear conteúdo, ferramentas, integrações, custos e quem vai manter o fluxo.",
        reasons: ["Você indicou catálogo, agenda, pagamento ou automações.", "Esses itens precisam de uma avaliação específica antes de definir a solução."],
        note: "A recomendação é preliminar. Não confirma preço, prazo, fornecedor ou viabilidade técnica."
      };
    }

    const reasonsForExpress = [
      "Você já tem uma oferta principal para apresentar.",
      "O objetivo e o público estão definidos.",
      "Uma página com contato direto parece atender ao primeiro passo."
    ];

    return {
      route: "site-express",
      title: "O Site Express parece uma boa rota para conversar.",
      copy: "Pelas suas respostas, uma página objetiva para apresentar sua oferta e facilitar o contato pode ser um começo adequado. A equipe confirma o escopo antes de qualquer proposta.",
      reasons: reasonsForExpress,
      note: answers.materials === "autorizados"
        ? "Os materiais autorizados podem ajudar a começar o planejamento. A equipe ainda confirma o que será usado."
        : "Materiais não precisam estar todos prontos para esta indicação; qualquer foto, avaliação ou dado só pode ser usado depois de autorizado."
    };
  }

  return { recommend };
});
