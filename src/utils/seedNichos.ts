import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

const NICHOS_DATA = [
  {
    nome_nicho: "Advocacia",
    prompt_inicial: "Você é um assistente de IA especializado em advocacia. Qual a sua dúvida jurídica?",
    slug: "advocacia"
  },
  {
    nome_nicho: "Psicologia",
    prompt_inicial: "Você é um assistente de IA para psicólogos. Como posso ajudar com questões de saúde mental?",
    slug: "psicologia"
  },
  {
    nome_nicho: "Odontologia",
    prompt_inicial: "Você é um assistente de IA para clínicas odontológicas. Qual a sua dúvida sobre saúde bucal ou agendamentos?",
    slug: "odontologia"
  },
  {
    nome_nicho: "Imobiliária",
    prompt_inicial: "Você é um assistente de IA para o setor imobiliário. Como posso ajudar a encontrar o imóvel ideal ou tirar dúvidas sobre o mercado?",
    slug: "imobiliaria"
  },
  {
    nome_nicho: "Concessionária",
    prompt_inicial: "Você é um assistente de IA para concessionárias de veículos. Qual a sua dúvida sobre carros, financiamento ou serviços?",
    slug: "concessionaria"
  },
  {
    nome_nicho: "Clínicas",
    prompt_inicial: "Você é um assistente de IA para clínicas médicas. Como posso ajudar com informações sobre especialidades, agendamentos ou exames?",
    slug: "clinicas"
  }
];

export async function seedNichos() {
  try {
    const nichosRef = collection(db, 'nichos');
    const q = query(nichosRef, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('Seeding nichos...');
      for (const nicho of NICHOS_DATA) {
        await addDoc(nichosRef, nicho);
      }
      console.log('Nichos seeded successfully!');
      return true;
    } else {
      console.log('Nichos already exist, skipping seed.');
      return false;
    }
  } catch (error) {
    console.error('Error seeding nichos:', error);
    return false;
  }
}
