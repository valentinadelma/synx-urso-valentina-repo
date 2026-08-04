import type { ReactNode } from "react";

/* Module + tool catalogue — content, ids and endpoints preserved verbatim. */

export interface ModuleSummary {
  id: string;
  title: string;
  description: string;
  color: string;
  link: string;
}

export const modules: ModuleSummary[] = [
  {
    id: "analise",
    title: "Análise de Dados",
    description: "Utilitários para análise de Dados",
    color: "#8b5cf6",
    link: "#",
  },
  {
    id: "ferramentas",
    title: "Ferramentas Úteis",
    description: "Ferramentas úteis",
    color: "#3b82f6",
    link: "#",
  },
  {
    id: "documentos",
    title: "Gestão de Documentos",
    description: "Documentos modelo e manuais",
    color: "#10b981",
    link: "#",
  },
  {
    id: "sistemas",
    title: "Sistemas/Aplicativos",
    description: "Sistemas e aplicativos SYNX",
    color: "#d4af37",
    link: "#",
  },
  {
    id: "investigacao",
    title: "Apoio a Investigação",
    description: "Apoio a Investigação",
    color: "#06b6d4",
    link: "#",
  },
  {
    id: "contatos",
    title: "Contatos Úteis",
    description: "Contatos diversos",
    color: "#f43f5e",
    link: "#",
  },
];

export interface ModuleContentItem {
  title: string;
  description: string;
  tags?: string[];
  link: string;
}

export interface ModuleDetail {
  title: string;
  description: string;
  color: string;
  content: ModuleContentItem[];
}

export const moduleDetails: Record<string, ModuleDetail> = {
  analise: {
    title: "Análise de Dados",
    description: "Utilitários para análise de Dados",
    color: "#8b5cf6",
    content: [
      {
        title: "Captura de evidências digitais",
        description:
          "Ferramenta de captura de evidências digitais (desenvolvida pelo Gaeco Londrina - Cabo Marcelo); Vídeo demonstrativo disponível no módulo Documentos",
        tags: ["evidencias_digitais"],
        link: "#",
      },
      {
        title: "Plotagem de ERB",
        description:
          "Sistema de Plotagem de ERB (Desenvolvido pelo Sgt Tiago - Gaeco Cascavel)",
        tags: ["erb"],
        link: "#",
      },
      {
        title: "Plotagem de ERB",
        description: "Sistema de plotagem de ERB (Polícia Civil de Santa Catarina)",
        tags: ["erb"],
        link: "#",
      },
      {
        title: "Processamento de dados de WhatsApp",
        description:
          "Ferramenta de processamento para tratar as respostas da empresa WhatsApp LLC acerca das mensagens e chamadas do aplicativo WhatsApp solicitadas judicialmente.",
        tags: ["whatsapp"],
        link: "#",
      },
      {
        title: "Processamento de mensagens VIVO, CLARO E TIM",
        description:
          "Ferramenta de processamento de chamadas e mensagens projetado para as empresas Vivo, Claro e Tim, que torna o resultado mais amigável ao usuário a partir do arquivo Excel do extrato das chamadas/mensagens. Esta ferramenta exibe as localizações aproximadas de cada ligação, permitindo uma análise mais clara e detalhada das comunicações realizadas pelo alvo.",
        tags: ["msg"],
        link: "#",
      },
    ],
  },
  ferramentas: {
    title: "Ferramentas Úteis",
    description: "Ferramentas úteis",
    color: "#3b82f6",
    content: [
      {
        title: "Pandora",
        description: "Sistema integrado de apoio a investigação",
        link: "#",
      },
      {
        title: "Simba",
        description: "Sistema de investigação de movimentação bancária",
        link: "#",
      },
    ],
  },
  documentos: {
    title: "Gestão de Documentos",
    description: "Documentos modelo e manuais",
    color: "#10b981",
    content: [],
  },
  sistemas: {
    title: "Sistemas/Aplicativos",
    description: "Sistemas e aplicativos GAECO",
    color: "#d4af37",
    content: [],
  },
  investigacao: {
    title: "Apoio a Investigação",
    description: "Apoio a Investigação",
    color: "#06b6d4",
    content: [],
  },
  contatos: {
    title: "Contatos Úteis",
    description: "Contatos diversos",
    color: "#f43f5e",
    content: [],
  },
};

/* --- SYNX Search API config (unchanged) --- */

export const API_BASE = "https://api.leaksights.com";
export const API_TOKEN =
  "HxhjbZO3pYQR1OtOHdX6gBXFolrKjL4DABeLnQs8gnoqdrfTIa";

export interface SearchTool {
  id: string;
  endpoint: string;
  param: string;
  label: string;
  description: string;
  placeholder: string;
  icon: string;
}

// Synx Search - Focado em Logs e URL (Leaksights API)
export const synxSearchTools: SearchTool[] = [
  {
    id: "url",
    endpoint: "/osint/url",
    param: "text",
    label: "URL Search",
    description: "Search leaked credentials by URL.",
    placeholder: "example.com",
    icon: "🔗",
  },
  {
    id: "password",
    endpoint: "/osint/password",
    param: "text",
    label: "Password Lookup",
    description: "Find accounts by password",
    placeholder: "password123",
    icon: "🔑",
  },
  {
    id: "ip",
    endpoint: "/osint/ip",
    param: "text",
    label: "IP Intelligence",
    description: "IP stealer logs & info",
    placeholder: "1.1.1.1",
    icon: "🌐",
  },
  {
    id: "ipgeo",
    endpoint: "/osint/ipgeo",
    param: "text",
    label: "IP Geolocation",
    description: "Geolocate an IP",
    placeholder: "8.8.8.8",
    icon: "🌍",
  },
];

// OSINT - Focado em Recon e Análise de Vínculos
export const osintTools: SearchTool[] = [
  {
    id: "username",
    endpoint: "/osint/username",
    param: "text",
    label: "Username/Email",
    description: "Search leaked accounts & social profiles",
    placeholder: "john@gmail.com",
    icon: "👤",
  },
  {
    id: "phone",
    endpoint: "/osint/phone",
    param: "text",
    label: "Phone OSINT",
    description: "Intelligence on phone numbers",
    placeholder: "+5511999999999",
    icon: "📱",
  },
  {
    id: "mailosint",
    endpoint: "/osint/mailosint",
    param: "text",
    label: "Mail OSINT",
    description: "Deep email recon",
    placeholder: "user@gmail.com",
    icon: "📧",
  },
  {
    id: "username2",
    endpoint: "/osint/username2",
    param: "text",
    label: "Deep Recon",
    description: "Deep dumps & darknet",
    placeholder: "target_user",
    icon: "👥",
  },
];

export const searchTools = [...synxSearchTools, ...osintTools];

export type ModuleIconKey = ReactNode;
