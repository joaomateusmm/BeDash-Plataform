// Helper para extrair dados estruturados de planilhas com IA SUPER INTELIGENTE
export interface ExtractedClient {
  nome: string;
  email: string;
  telefone: string;
  sexo?: "male" | "female";
}

export function extractClientsFromText(text: string): ExtractedClient[] {
  console.log("📊 🧠 EXTRAÇÃO INTELIGENTE DE CLIENTES - INICIADA");
  const clients: ExtractedClient[] = [];

  // Normalizar texto mantendo acentos e tabs
  const normalizedText = text
    .replace(/[^\w\s@.,\-+()áéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  console.log(
    `📝 Texto normalizado (primeiros 300 chars): ${normalizedText.substring(0, 300)}...`,
  );

  // NOVA ESTRATÉGIA: Processar linha por linha (formato tabular)
  const lines = normalizedText
    .split(/\n|\r\n|\r/)
    .filter((line) => line.trim().length > 10);

  console.log(`� Total de linhas encontradas: ${lines.length}`);

  lines.forEach((line, index) => {
    console.log(`\n🔍 === PROCESSANDO LINHA ${index + 1} ===`);
    console.log(`📝 Linha: "${line}"`);

    // DETECTAR SE A LINHA CONTÉM MÚLTIPLOS CLIENTES
    const multipleClients = extractMultipleClientsFromSingleLine(line);

    if (multipleClients.length > 0) {
      multipleClients.forEach((client, clientIndex) => {
        // Verificar duplicatas por email
        const isDuplicate = clients.some(
          (existing) => existing.email === client.email,
        );
        if (!isDuplicate) {
          clients.push(client);
          console.log(
            `✅ Cliente ${clientIndex + 1} da linha ${index + 1} adicionado: ${client.nome} (${client.sexo}) - ${client.email}`,
          );
        } else {
          console.log(`⚠️ Cliente duplicado ignorado: ${client.email}`);
        }
      });
    } else {
      console.log(`❌ Linha ${index + 1} não contém dados válidos de cliente`);
    }
  });

  console.log(
    `\n🎉 EXTRAÇÃO CONCLUÍDA: ${clients.length} clientes extraídos de ${lines.length} linhas processadas`,
  );
  return clients;
}

// NOVA FUNÇÃO: Extrair múltiplos clientes de uma única linha
function extractMultipleClientsFromSingleLine(line: string): ExtractedClient[] {
  const clients: ExtractedClient[] = [];

  // Usar regex para encontrar padrões: Nome + Email + Telefone
  // Padrão: Nome (pode ter espaços e acentos) + email + telefone
  const clientPattern =
    /([A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇa-záéíóúâêîôûàèìòùãõç\s]{2,40}?)\s*([\w\.-áéíóúâêîôûàèìòùãõç]+@[\w\.-]+\.\w+)\s*(\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4})/g;

  const matches = Array.from(line.matchAll(clientPattern));

  console.log(`� ${matches.length} padrões cliente encontrados na linha`);

  matches.forEach((match, index) => {
    const [fullMatch, rawName, email, phone] = match;

    console.log(`\n🔍 === PROCESSANDO CLIENTE ${index + 1} ===`);
    console.log(`📝 Match completo: "${fullMatch}"`);
    console.log(`👤 Nome bruto: "${rawName}"`);
    console.log(`📧 Email: "${email}"`);
    console.log(`📞 Telefone bruto: "${phone}"`);

    // Limpar o nome
    const cleanName = rawName
      .trim()
      .replace(/\s+/g, " ")
      .replace(/^[^\w\sáéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]+/, "")
      .replace(/[^\w\sáéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]+$/, "");

    // Verificar se o nome é válido (pelo menos 2 palavras)
    const nameWords = cleanName.split(" ").filter((word) => word.length > 0);
    if (nameWords.length < 2) {
      console.log(`❌ Nome inválido (menos de 2 palavras): "${cleanName}"`);
      return;
    }

    // Pegar apenas as 2 primeiras palavras (nome e sobrenome)
    const finalName = nameWords.slice(0, 2).join(" ");

    // Limpar telefone
    const cleanPhone = phone.replace(/\D/g, "");

    // Detectar gênero
    const gender = detectGenderIntelligently(finalName, "");

    const client: ExtractedClient = {
      nome: finalName,
      email: email.toLowerCase(),
      telefone: cleanPhone,
      sexo: gender,
    };

    console.log(`✨ CLIENTE ${index + 1} LIMPO:`, client);
    clients.push(client);
  });

  // Se não encontrou com regex, tentar método alternativo
  if (clients.length === 0) {
    console.log(`⚠️ Regex não funcionou, tentando método alternativo...`);
    return extractMultipleClientsAlternative(line);
  }

  return clients;
}

// Método alternativo caso a regex principal falhe
function extractMultipleClientsAlternative(line: string): ExtractedClient[] {
  const clients: ExtractedClient[] = [];

  // Dividir por email como separador e processar cada segmento
  const emailPattern = /[\w\.-áéíóúâêîôûàèìòùãõç]+@[\w\.-]+\.\w+/gi;
  const emails = Array.from(line.matchAll(emailPattern));

  if (emails.length === 0) return clients;

  // Para cada email, extrair o contexto ao redor
  emails.forEach((emailMatch, index) => {
    const email = emailMatch[0].toLowerCase();
    const emailIndex = emailMatch.index!;

    // Determinar o início e fim do contexto deste cliente
    let contextStart = 0;
    let contextEnd = line.length;

    // Se não é o primeiro email, começar após o email anterior
    if (index > 0) {
      const prevEmailIndex =
        emails[index - 1].index! + emails[index - 1][0].length;
      contextStart = prevEmailIndex;
    }

    // Se não é o último email, terminar antes do próximo email
    if (index < emails.length - 1) {
      contextEnd = emails[index + 1].index!;
    }

    const context = line.substring(contextStart, contextEnd);
    console.log(`🔍 Contexto para ${email}: "${context}"`);

    // Extrair telefone do contexto
    const phoneMatch = context.match(/\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/);
    if (!phoneMatch) {
      console.log(`❌ Nenhum telefone no contexto de ${email}`);
      return;
    }

    const cleanPhone = phoneMatch[0].replace(/\D/g, "");

    // Extrair nome: pegar palavras antes do email no contexto
    const beforeEmailInContext = context.substring(0, context.indexOf(email));
    const nameWords = beforeEmailInContext
      .replace(/[^\w\sáéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]/g, " ")
      .replace(/\d+/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .slice(-2); // Pegar as últimas 2 palavras

    if (nameWords.length < 2) {
      console.log(`❌ Nome insuficiente para ${email}`);
      return;
    }

    const name = nameWords.join(" ");
    const gender = detectGenderIntelligently(name, "");

    const client: ExtractedClient = {
      nome: name,
      email: email,
      telefone: cleanPhone,
      sexo: gender,
    };

    console.log(`✨ CLIENTE ALTERNATIVO ${index + 1}:`, client);
    clients.push(client);
  });

  return clients;
}

// NOVA FUNÇÃO OTIMIZADA PARA FORMATO TABULAR
function extractClientFromLine(line: string): ExtractedClient | null {
  console.log(`🧠 Analisando linha: "${line}"`);

  // ETAPA 1: Encontrar EMAIL (sempre presente e único por linha)
  const emailMatch = line.match(/[\w\.-áéíóúâêîôûàèìòùãõç]+@[\w\.-]+\.\w+/i);
  if (!emailMatch) {
    console.log(`❌ Nenhum email encontrado na linha`);
    return null;
  }

  const email = emailMatch[0].toLowerCase();
  console.log(`📧 Email identificado: ${email}`);

  // ETAPA 2: Encontrar TELEFONE
  const phoneMatch = line.match(/\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/);
  if (!phoneMatch) {
    console.log(`📞 Nenhum telefone encontrado na linha`);
    return null;
  }

  const phone = phoneMatch[0];
  const cleanPhone = phone.replace(/\D/g, "");
  console.log(`� Telefone identificado: ${phone} -> ${cleanPhone}`);

  // ETAPA 3: Extrair NOME (tudo antes do email, excluindo lixo)
  const beforeEmail = line.substring(0, line.indexOf(emailMatch[0])).trim();
  console.log(`📝 Texto antes do email: "${beforeEmail}"`);

  const name = extractNameFromTabularLine(beforeEmail, phone);

  if (!name) {
    console.log(`👤 Nenhum nome válido encontrado`);
    return null;
  }

  // ETAPA 4: Detectar GÊNERO
  const gender = detectGenderIntelligently(name, "");

  const result = {
    nome: name,
    email: email,
    telefone: cleanPhone,
    sexo: gender,
  };

  console.log(`✨ CLIENTE EXTRAÍDO DA LINHA:`, result);
  return result;
}

// FUNÇÃO OTIMIZADA PARA EXTRAIR NOMES DE FORMATO TABULAR
function extractNameFromTabularLine(
  text: string,
  phone: string,
): string | null {
  console.log(`� Extraindo nome de texto tabular: "${text}"`);

  // Remover telefone se estiver misturado
  let cleanText = text.replace(phone, "").trim();

  // Remover caracteres especiais e múltiplos espaços
  cleanText = cleanText
    .replace(/[^\w\s\-áéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Lista de palavras que NÃO são nomes (expandida com TODOS os estados brasileiros)
  const stopWords = [
    "adicione",
    "estes",
    "clientes",
    "cliente",
    "nome",
    "email",
    "telefone",
    "phone",
    "masculino",
    "feminino",
    "homem",
    "mulher",
    "male",
    "female",
    "sexo",
    "dados",
    "lista",
    "cadastro",
    "informacoes",
    "informações",
    "estado",
    "uf",
    // TODOS OS ESTADOS BRASILEIROS (siglas)
    "am",
    "ac",
    "al",
    "ap",
    "ba",
    "ce",
    "df",
    "es",
    "go",
    "ma",
    "mt",
    "ms",
    "mg",
    "pa",
    "pb",
    "pr",
    "pe",
    "pi",
    "rj",
    "rn",
    "rs",
    "ro",
    "rr",
    "sc",
    "sp",
    "se",
    "to",
    // Estados por extenso mais comuns
    "amazonas",
    "acre",
    "alagoas",
    "amapa",
    "bahia",
    "ceara",
    "goias",
    "maranhao",
    "mato",
    "grosso",
    "minas",
    "gerais",
    "para",
    "paraiba",
    "parana",
    "pernambuco",
    "piaui",
    "janeiro",
    "grande",
    "norte",
    "sul",
    "rondonia",
    "roraima",
    "santa",
    "catarina",
    "paulo",
    "sergipe",
    "tocantins",
  ];

  // Dividir em palavras e filtrar
  const words = cleanText.split(/\s+/).filter((word) => {
    const wordLower = word.toLowerCase();
    return (
      word.length >= 2 &&
      !stopWords.includes(wordLower) &&
      !/^\d+$/.test(word) && // não é só números
      !/^[()@,.\-_]+$/.test(word) && // não é só símbolos
      /^[a-záéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]+$/i.test(word) // só letras válidas
    );
  });

  if (words.length === 0) {
    console.log(`❌ Nenhuma palavra válida encontrada após filtros`);
    return null;
  }

  // Para formato tabular, pegar TODAS as palavras válidas como nome
  // (não usar slice(-4) como antes, pois pode cortar nomes)
  const name = words.join(" ").trim();

  // Validar se parece um nome real (pelo menos 2 palavras OU nome conhecido)
  if (name.split(" ").length >= 2 || isKnownName(name.split(" ")[0])) {
    console.log(`👤 Nome extraído: "${name}"`);
    return name;
  }

  console.log(`❌ Nome rejeitado (muito curto ou inválido): "${name}"`);
  return null;
}

// Função auxiliar para verificar se é um nome conhecido
function isKnownName(firstName: string): boolean {
  const knownNames = [
    "maria",
    "ana",
    "joão",
    "josé",
    "carlos",
    "paulo",
    "pedro",
    "francisco",
    "marcos",
    "rafael",
    "daniel",
    "bruno",
    "felipe",
    "ricardo",
    "andré",
    "gabriel",
    "lucas",
    "fernando",
    "rodrigo",
    "gustavo",
    "leonardo",
    "fernanda",
    "juliana",
    "adriana",
    "sandra",
    "regina",
    "mônica",
    "patricia",
    "vanessa",
    "beatriz",
    "roberta",
    "camila",
    "gabriela",
    "amanda",
    "renata",
    "cláudia",
    "thiago",
    "patrícia",
  ];

  return knownNames.includes(firstName.toLowerCase());
}

// FUNÇÃO INTELIGENTE PARA EXTRAIR NOMES (mantida para compatibilidade)
function extractNameFromText(text: string, phone: string): string | null {
  // Redirecionar para a nova função otimizada
  return extractNameFromTabularLine(text, phone);
}

// FUNÇÃO SUPER INTELIGENTE PARA DETECTAR GÊNERO
function detectGenderIntelligently(
  name: string,
  context: string,
): "male" | "female" {
  console.log(`🚻 Detectando gênero para: "${name}"`);

  const nameLower = name.toLowerCase();
  const contextLower = context.toLowerCase();

  // 1. INDICADORES EXPLÍCITOS NO CONTEXTO (mais confiáveis)
  const explicitFemale = /\b(mulher|feminino|female|f)\b/i.test(contextLower);
  const explicitMale = /\b(homem|masculino|male|m)\b/i.test(contextLower);

  if (explicitFemale && !explicitMale) {
    console.log(`🚻 Sexo EXPLÍCITO detectado: FEMININO (contexto)`);
    return "female";
  }
  if (explicitMale && !explicitFemale) {
    console.log(`🚻 Sexo EXPLÍCITO detectado: MASCULINO (contexto)`);
    return "male";
  }

  // 2. ANÁLISE INTELIGENTE DO PRIMEIRO NOME
  const firstName = nameLower.split(" ")[0];

  // Base de dados expandida de nomes brasileiros
  const definiteFemaleNames = [
    "maria",
    "ana",
    "francisca",
    "antonia",
    "adriana",
    "juliana",
    "márcia",
    "fernanda",
    "débora",
    "roseli",
    "raimunda",
    "sandra",
    "regina",
    "lúcia",
    "angela",
    "mônica",
    "patricia",
    "isabel",
    "isabela",
    "vera",
    "sonia",
    "carla",
    "rose",
    "cristina",
    "simone",
    "denise",
    "fatima",
    "fátima",
    "rejane",
    "claudia",
    "cláudia",
    "luciana",
    "vanessa",
    "silvia",
    "sílvia",
    "beatriz",
    "roberta",
    "leticia",
    "letícia",
    "camila",
    "michele",
    "amanda",
    "aline",
    "gabriela",
    "andrea",
    "andréa",
    "viviane",
    "eliana",
    "solange",
    "rita",
    "edna",
    "elizabete",
    "terezinha",
    "aparecida",
    "cleide",
    "rita",
    "rosana",
    "rosângela",
    "marta",
    "lilian",
    "lívia",
    "larissa",
    "kelly",
    "karina",
  ];

  const definiteMaleNames = [
    "josé",
    "joão",
    "antonio",
    "antônio",
    "francisco",
    "carlos",
    "paulo",
    "pedro",
    "lucas",
    "luis",
    "luís",
    "marcos",
    "rafael",
    "daniel",
    "marcelo",
    "bruno",
    "eduardo",
    "felipe",
    "raimundo",
    "roberto",
    "manoel",
    "manuel",
    "sérgio",
    "sergio",
    "jorge",
    "fernando",
    "fábio",
    "fabio",
    "andré",
    "andre",
    "diego",
    "ricardo",
    "alexandre",
    "rodrigo",
    "gustavo",
    "leandro",
    "thiago",
    "mateus",
    "gabriel",
    "vinícius",
    "vinicius",
    "leonardo",
    "renan",
    "caio",
    "guilherme",
    "renato",
    "igor",
    "william",
    "wellington",
    "wagner",
    "valdeci",
    "valdir",
    "victor",
    "vitor",
    "washington",
  ];

  if (definiteFemaleNames.includes(firstName)) {
    console.log(`🚻 Nome FEMININO identificado: ${firstName}`);
    return "female";
  }

  if (definiteMaleNames.includes(firstName)) {
    console.log(`🚻 Nome MASCULINO identificado: ${firstName}`);
    return "male";
  }

  // 3. ANÁLISE POR TERMINAÇÕES (com mais inteligência)
  if (
    firstName.endsWith("a") &&
    !firstName.endsWith("ista") &&
    firstName.length > 3
  ) {
    console.log(
      `🚻 Terminação feminina detectada: ${firstName} (termina com 'a')`,
    );
    return "female";
  }

  // 4. PADRÕES BRASILEIROS ESPECÍFICOS
  if (/^(josé|joão|pedro|paulo|carlos|marcos|rafael|daniel)/.test(firstName)) {
    console.log(`🚻 Padrão masculino brasileiro: ${firstName}`);
    return "male";
  }

  if (/^(maria|ana|sandra|claudia|patricia|monica)/.test(firstName)) {
    console.log(`🚻 Padrão feminino brasileiro: ${firstName}`);
    return "female";
  }

  // 5. DEFAULT: masculino (estatisticamente mais provável se não conseguir determinar)
  console.log(
    `🤷 Gênero não determinado para "${firstName}" - usando padrão masculino`,
  );
  return "male";
}

// ================================
// FUNÇÕES DE COMPATIBILIDADE (antigas funções mantidas caso sejam usadas em outro lugar)
// ================================

export function detectClientDataInText(text: string): boolean {
  const hasEmail = /[\w\.-]+@[\w\.-]+\.\w+/i.test(text);
  const hasPhone = /\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/.test(text);
  const hasNames =
    /\b[A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ][a-záéíóúâêîôûàèìòùãõç]+(\s+[A-ZÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ][a-záéíóúâêîôûàèìòùãõç]+)*\b/.test(
      text,
    );

  return hasEmail && hasPhone && hasNames;
}

export function inferGenderFromName(name: string): "male" | "female" {
  return detectGenderIntelligently(name, "");
}

export function formatClientsForAI(clients: ExtractedClient[]): string {
  if (clients.length === 0) return "Nenhum cliente encontrado.";

  return clients
    .map(
      (client, index) =>
        `${index + 1}. ${client.nome} - ${client.email} - ${client.telefone} - Sexo: ${client.sexo === "male" ? "Masculino" : "Feminino"}`,
    )
    .join("\n");
}
