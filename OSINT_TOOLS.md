# 🔍 Centro de Inteligência SYNX - Estrutura Separada

O sistema foi reorganizado para separar a consulta de dados brutos (Logs) da investigação analítica (OSINT).

## 📂 1. Módulo Synx Search (Logs & Credenciais)
**Foco:** Extração massiva de dados de vazamentos.
- **URL Search:** Busca credenciais por domínio/URL.
- **Password Lookup:** Encontra contas vinculadas a uma senha específica.
- **IP Intelligence:** Rastreia logs de stealers e informações de IP.
- **IP Geolocation:** Localização geográfica técnica.

---

## 🕸️ 2. Módulo OSINT Intelligence (Teia de Vínculos)
**Foco:** Investigação de pessoas e construção de grafo relacional.

### Sub-Módulos de API:
1. **Username/Email (Social Scan):** Busca em 50+ redes sociais.
2. **Phone OSINT:** Inteligência sobre números de telefone e vínculos (WhatsApp/Telegram).
3. **Mail OSINT:** Reconhecimento profundo de e-mail e infraestrutura.
4. **Deep Recon:** Busca em 3000+ sites (Maigret) e bases Darknet.

### Funcionalidade "Teia de Aranha":
- **Análise de Vínculos:** Gera um grafo interativo conectando o alvo central a todas as descobertas.
- **Filtros Táticos:** Separação visual por Pessoa, Social, Telefone e Vazamento.

---

## 🛡️ Segurança de API
- **Proxy Integrado:** Todas as chamadas para `api.leaksights.com` e motores locais passam pelo `/api/proxy`.
- **Zero Leak:** Seus tokens e parâmetros de busca nunca são expostos no navegador.

---

## 🚀 Como Expandir
Para adicionar novas APIs ao módulo OSINT, basta registrar a ferramenta no arquivo `src/lib/synx-data.ts` dentro do array `osintTools`. O painel criará o sub-módulo visual automaticamente.
