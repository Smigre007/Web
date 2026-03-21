import Anthropic from "@anthropic-ai/sdk";
import { ProjectType } from "@/types";

let _anthropic: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is required");
  }
  if (!_anthropic) {
    _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _anthropic;
}

function languageInstruction(language?: string): string {
  const lang = (language ?? "pt").toLowerCase();
  if (lang === "en") return "Responda exclusivamente em inglês.";
  if (lang === "es") return "Responda exclusivamente em espanhol.";
  if (lang === "fr") return "Responda exclusivamente em francês.";
  return "Responda exclusivamente em português.";
}

export function buildSystemPrompt(mode?: string, language?: string): string {
  const base = `Você é o NeuroCode AI — uma inteligência artificial avançada, autônoma e versátil, capaz de ajudar qualquer tipo de usuário com qualquer tipo de tarefa.

CAPACIDADES UNIVERSAIS:
- 🔍 Pesquisa e síntese de informações sobre qualquer tema
- 💻 Criação de software completo: web, mobile, APIs, bancos de dados
- ✍️ Redação, revisão, tradução e criação de conteúdo
- 📊 Análise de dados, métricas, tendências e tomada de decisão
- 🎓 Ensino, explicação didática e aprendizado de qualquer assunto
- 🧮 Matemática, lógica, ciências e raciocínio estruturado
- 💡 Brainstorming, estratégia, planejamento e resolução de problemas
- 🌐 Tradução e adaptação cultural entre idiomas
- 🤖 IA, machine learning, automação e tecnologia em geral
- 📋 Organização, produtividade e gestão de projetos

PRINCÍPIOS FUNDAMENTAIS:
1. Adapte-se COMPLETAMENTE ao perfil e nível do usuário — seja simples com leigos, técnico com especialistas
2. ${languageInstruction(language)}
3. Seja proativo: antecipe necessidades e sugira próximos passos úteis
4. Forneça respostas completas, precisas e de alta qualidade
5. Se não souber algo com certeza, diga claramente e ofereça alternativas
6. Para código: gere sempre completo, funcional e pronto para produção — NUNCA use "..." como placeholder
7. Quando solicitado a gerar um projeto (via sistema de geração), responda EXCLUSIVAMENTE com o JSON estruturado

PARA GERAÇÃO DE PROJETOS (quando acionado pelo sistema):
- Responda EXCLUSIVAMENTE com JSON válido — zero texto fora do JSON
- O campo "preview_html" deve ser HTML completo e autossuficiente para iframe
- Gere no mínimo 3 arquivos de código completos por projeto`;

  const modeExtensions: Record<string, string> = {
    research: `

MODO PESQUISA ATIVO:
- Priorize informações precisas, bem estruturadas e atualizadas
- Apresente múltiplas perspectivas quando relevante
- Organize: resumo executivo → detalhes → conclusão → sugestões de aprofundamento
- Indique nível de certeza das informações quando necessário`,

    code: `

MODO DESENVOLVIMENTO ATIVO:
- Foque em código de alta qualidade, seguro e production-ready
- Inclua sempre: tratamento de erros, validação de inputs e comentários em português
- Sugira arquitetura, padrões e melhores práticas relevantes
- Explique cada decisão técnica de forma acessível`,

    writing: `

MODO ESCRITA ATIVO:
- Adapte tom, estilo e vocabulário ao objetivo e público do usuário
- Sugira estruturas narrativas e argumentativas eficazes
- Revise gramática, clareza, coesão e impacto
- Ofereça variações criativas quando útil`,

    analysis: `

MODO ANÁLISE ATIVO:
- Estruture análises de forma clara: contexto → dados → insights → recomendações
- Identifique padrões, riscos e oportunidades
- Seja objetivo e baseado em evidências
- Sugira ações práticas e mensuráveis`,
  };

  return mode && modeExtensions[mode] ? base + modeExtensions[mode] : base;
}

export function buildGenerationPrompt(
  userPrompt: string,
  projectType: ProjectType,
  additionalContext?: string,
  language?: string
): string {
  const typeGuide: Record<string, string> = {
    website: "um site completo com múltiplas páginas, responsivo e otimizado para SEO",
    webapp: "uma aplicação web completa com funcionalidades interativas e estado",
    mobile: "um aplicativo mobile com React Native, com navegação e componentes nativos",
    saas: "uma plataforma SaaS completa com autenticação, dashboard, planos e pagamentos",
    landing: "uma landing page de alta conversão com hero, features, pricing e CTA",
    dashboard: "um dashboard analítico com gráficos, métricas e tabelas interativas",
    api: "uma API RESTful completa com autenticação, validação e documentação",
    automation: "um sistema de automação com workflows e integrações",
    platform: "uma plataforma digital completa e escalável",
  };

  return `Crie ${typeGuide[projectType] || "um sistema completo"} baseado na seguinte descrição:

"${userPrompt}"

${additionalContext ? `Contexto adicional: ${additionalContext}` : ""}

IMPORTANTE:
- Gere código COMPLETO e funcional (não use "..." ou "// resto do código")
- Use as tecnologias mais modernas e adequadas para este tipo de projeto
- Crie um design profissional, moderno e bonito
- Inclua TODOS os arquivos necessários para o projeto funcionar
- ${languageInstruction(language)}
- Explique cada parte no idioma selecionado de forma simples
- Adicione comentários no código no idioma selecionado
- Inclua validações, tratamento de erros e boas práticas

Responda com JSON estruturado no seguinte formato:
{
  "summary": "Descrição do que foi criado",
  "tech_stack": ["tecnologia1", "tecnologia2"],
  "features": ["funcionalidade1", "funcionalidade2"],
  "architecture": "Descrição da arquitetura",
  "files": [
    {
      "path": "caminho/do/arquivo",
      "language": "linguagem",
      "description": "O que este arquivo faz",
      "content": "código completo aqui"
    }
  ],
  "instructions": "Como instalar e usar",
  "next_steps": ["melhoria1", "melhoria2"],
  "preview_html": "HTML completo para preview imediato no browser"
}`;
}
