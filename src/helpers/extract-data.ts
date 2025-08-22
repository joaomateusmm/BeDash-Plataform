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

  console.log(`📝 Total de linhas encontradas: ${lines.length}`);

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
  
  console.log(`🔍 Procurando múltiplos clientes na linha...`);
  
  // Estratégia: Dividir por telefones para separar clientes
  // Padrão de telefone: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  const phoneRegex = /\(\d{2}\)\s*\d{4,5}[-\s]?\d{4}/g;
  const phoneMatches = Array.from(line.matchAll(phoneRegex));
  
  console.log(`📞 ${phoneMatches.length} telefones encontrados`);
  
  if (phoneMatches.length === 0) {
    console.log(`❌ Nenhum telefone encontrado na linha`);
    return clients;
  }
  
  // Para cada telefone, extrair o cliente correspondente
  phoneMatches.forEach((phoneMatch, index) => {
    const phone = phoneMatch[0];
    const phoneIndex = phoneMatch.index!;
    const cleanPhone = phone.replace(/\D/g, '');
    
    console.log(`\n🔍 === PROCESSANDO TELEFONE ${index + 1}: ${phone} ===`);
    
    // Determinar o início do contexto deste cliente
    let contextStart = 0;
    if (index > 0) {
      // Se não é o primeiro, começar após o telefone anterior
      contextStart = phoneMatches[index - 1].index! + phoneMatches[index - 1][0].length;
    }
    
    // Determinar o fim do contexto deste cliente
    let contextEnd = line.length;
    if (index < phoneMatches.length - 1) {
      // Se não é o último, terminar antes do próximo telefone
      contextEnd = phoneMatches[index + 1].index!;
    }
    
    const clientContext = line.substring(contextStart, phoneIndex + phone.length);
    console.log(`📄 Contexto do cliente: "${clientContext}"`);
    
    // Encontrar email no contexto
    const emailMatch = clientContext.match(/[\w\.-]+@[\w\.-]+\.\w+/);
    if (!emailMatch) {
      console.log(`❌ Nenhum email encontrado no contexto`);
      return;
    }
    
    const email = emailMatch[0].toLowerCase();
    console.log(`📧 Email encontrado: ${email}`);
    
    // Extrair nome: pegar texto antes do email, removendo o telefone anterior (se houver)
    const beforeEmail = clientContext.substring(0, clientContext.indexOf(email)).trim();
    
    // Limpar o texto e extrair apenas as palavras que parecem nome
    const cleanText = beforeEmail
      .replace(/\(\d{2}\)\s*\d{4,5}[-\s]?\d{4}/g, '') // Remover telefones
      .replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '') // Remover emails
      .replace(/[^\w\sáéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]/g, ' ') // Manter apenas letras e espaços
      .replace(/\s+/g, ' ')
      .trim();
    
    // Pegar as últimas 2-3 palavras como nome (nome e sobrenome)
    const words = cleanText.split(' ').filter(word => 
      word.length > 1 && 
      !/^\d+$/.test(word) && // Não é número
      !['com', 'www', 'http', 'https'].includes(word.toLowerCase()) // Não é parte de URL
    );
    
    const nameWords = words.slice(-2); // Pegar as últimas 2 palavras
    
    if (nameWords.length < 2) {
      console.log(`❌ Nome insuficiente: "${nameWords.join(' ')}"`);
      return;
    }
    
    const name = nameWords.join(' ');
    const gender = detectGenderIntelligently(name, '');
    
    const client: ExtractedClient = {
      nome: name,
      email: email,
      telefone: cleanPhone,
      sexo: gender,
    };
    
    console.log(`✨ CLIENTE ${index + 1} EXTRAÍDO:`, client);
    clients.push(client);
  });
  
  return clients;
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
    console.log(`🚻 Gênero FEMININO detectado por contexto explícito`);
    return "female";
  }
  if (explicitMale && !explicitFemale) {
    console.log(`🚻 Gênero MASCULINO detectado por contexto explícito`);
    return "male";
  }

  // 2. ANÁLISE INTELIGENTE DO PRIMEIRO NOME
  const firstName = nameLower.split(" ")[0];

  // Base de dados expandida de nomes brasileiros
  const femaleNames = [
    "maria",
    "ana",
    "francisca",
    "antonia",
    "adriana",
    "juliana",
    "márcia",
    "fernanda",
    "patricia",
    "aline",
    "sandra",
    "camila",
    "amanda",
    "bruna",
    "jessica",
    "leticia",
    "juliane",
    "luciana",
    "michele",
    "carla",
    "andrea",
    "cristiane",
    "vanessa",
    "marcia",
    "daniela",
    "gabriela",
    "rafaela",
    "tatiane",
    "simone",
    "monica",
    "alessandra",
    "carolina",
    "renata",
    "viviane",
    "sabrina",
    "claudia",
    "rosangela",
    "eliane",
    "fatima",
    "rosa",
    "aparecida",
    "solange",
    "regina",
    "celia",
    "sonia",
    "marta",
    "vera",
    "helena",
    "sueli",
    "angela",
    "marisa",
    "beatriz",
    "larissa",
    "priscila",
    "kelly",
    "bianca",
    "ingrid",
    "silvana",
    "michele",
    "luana",
    "roberta",
    "suzana",
    "jéssica",
    "débora",
    "cláudia",
    "mônica",
    "patrícia",
    "catarina",
    "célia",
    "flávia",
    "lúcia",
    "márcia",
    "sílvia",
    "tânia",
    "valéria",
    "isabel",
    "jane",
    "lilian",
    "raquel",
    "rita",
    "terezinha",
    "irene",
    "roseane",
    "denise",
    "edna",
    "cristina",
    "elizabete",
    "joana",
    "neuza",
    "rosana",
    "cleide",
    "conceição",
    "creusa",
    "dalva",
    "divina",
    "diva",
    "glória",
    "iracema",
    "ivone",
    "josefa",
    "jussara",
    "leila",
    "laura",
    "luiza",
    "luisa",
    "magda",
    "marlene",
    "miriam",
    "neide",
    "nilza",
    "norma",
    "olga",
    "palmira",
    "rita",
    "rute",
    "salete",
    "shirley",
    "suely",
    "teresinha",
    "vilma",
    "zilda",
  ];

  const maleNames = [
    "josé",
    "joão",
    "antonio",
    "francisco",
    "carlos",
    "paulo",
    "pedro",
    "lucas",
    "luiz",
    "marcos",
    "luis",
    "rafael",
    "daniel",
    "marcelo",
    "bruno",
    "eduardo",
    "gabriel",
    "leonardo",
    "guilherme",
    "arthur",
    "alexandre",
    "gustavo",
    "andré",
    "felipe",
    "ricardo",
    "adriano",
    "fábio",
    "márcio",
    "rodrigo",
    "fernando",
    "sérgio",
    "mário",
    "nelson",
    "wilson",
    "roberto",
    "antônio",
    "manoel",
    "raimundo",
    "josé",
    "sebastião",
    "geraldo",
    "joão",
    "valdeci",
    "valdemir",
    "wagner",
    "walter",
    "william",
    "adenilson",
    "adilson",
    "alan",
    "alberto",
    "alcides",
    "aldo",
    "alessandro",
    "alex",
    "alfredo",
    "amauri",
    "anderson",
    "angelo",
    "artur",
    "benedito",
    "bento",
    "bernardo",
    "cesar",
    "cícero",
    "claudio",
    "cleber",
    "cristiano",
    "davi",
    "diego",
    "douglas",
    "edson",
    "emerson",
    "everton",
    "fabiano",
    "fabricio",
    "flavio",
    "francisco",
    "frederico",
    "gilberto",
    "giovanni",
    "heitor",
    "henrique",
    "hugo",
    "igor",
    "israel",
    "ivan",
    "jair",
    "jean",
    "jefferson",
    "jeferson",
    "jorge",
    "juliano",
    "julio",
    "junior",
    "leandro",
    "leonardo",
    "luciano",
    "marcelo",
    "márcio",
    "marco",
    "marcus",
    "matheus",
    "mauricio",
    "mauro",
    "miguel",
    "nilton",
    "osmar",
    "otavio",
    "patrick",
    "reginaldo",
    "renato",
    "ricardo",
    "robson",
    "roger",
    "ronald",
    "samuel",
    "sidnei",
    "tiago",
    "valdir",
    "vinicius",
    "vitor",
    "wellington",
  ];

  // Verificar se é nome feminino
  if (femaleNames.includes(firstName)) {
    console.log(`🚻 Nome FEMININO identificado: ${firstName}`);
    return "female";
  }

  // Verificar se é nome masculino
  if (maleNames.includes(firstName)) {
    console.log(`🚻 Nome MASCULINO identificado: ${firstName}`);
    return "male";
  }

  // 3. ANÁLISE DE TERMINAÇÕES DE NOME
  if (firstName.endsWith("a") && !["garcia", "costa", "silva"].includes(firstName)) {
    console.log(`🚻 Nome FEMININO por terminação em 'a': ${firstName}`);
    return "female";
  }

  // 4. FALLBACK: tentar pelo nome completo
  const fullNameWords = nameLower.split(" ");
  for (const word of fullNameWords) {
    if (femaleNames.includes(word)) {
      console.log(`🚻 Nome FEMININO encontrado no nome completo: ${word}`);
      return "female";
    }
    if (maleNames.includes(word)) {
      console.log(`🚻 Nome MASCULINO encontrado no nome completo: ${word}`);
      return "male";
    }
  }

  // 5. ÚLTIMO RECURSO: usar terminações
  console.log(`🚻 Usando análise de terminações para: ${firstName}`);
  return firstName.endsWith("a") ? "female" : "male";
}

// ================================
// FUNÇÕES DE COMPATIBILIDADE (antigas funções mantidas caso sejam usadas em outro lugar)
// ================================

export function detectClientDataInText(text: string): boolean {
  const emailPattern = /[\w\.-]+@[\w\.-]+\.\w+/;
  const phonePattern = /\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/;
  
  return emailPattern.test(text) && phonePattern.test(text);
}

export function inferGenderFromName(name: string): "male" | "female" {
  return detectGenderIntelligently(name, "");
}

export function formatClientsForAI(clients: ExtractedClient[]): string {
  return clients
    .map((client, index) => 
      `${index + 1}. ${client.nome} (${client.sexo}) - ${client.email} - ${client.telefone}`
    )
    .join("\n");
}
