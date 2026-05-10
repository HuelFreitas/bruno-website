export const STORAGE_KEYS = {
  DATA: "guardcan:data:v1",
  SESSION: "guardcan:session",
};

export const MAX_EVIDENCE_COUNT = 10;

export const companyAvailability = [
  { value: "08:00", label: "08:00 - 10:00", description: "Inspeções matinais com dupla K9" },
  { value: "10:00", label: "10:00 - 12:00", description: "Janela ideal para auditorias em docas" },
  { value: "13:30", label: "13:30 - 15:30", description: "Equipe disponível após pausa operacional" },
  { value: "16:00", label: "16:00 - 18:00", description: "Turno avançado para operações urgentes" },
];

export const defaultState = {
  users: [
    {
      id: "client-porto",
      role: "client",
      name: "Marina Porto",
      email: "marina@portosafemar.com",
      company: "Porto Safe Mar",
    },
    {
      id: "operator-santos",
      role: "operator",
      name: "Carlos Silva",
      email: "carlos.silva@guardcan.com",
      certification: "Condutor K9 Nível III",
    },
  ],
  requests: [
    {
      id: "req-001",
      clientId: "client-porto",
      assignedOperatorId: "operator-santos",
      title: "Inspeção preventiva em navio mercante",
      port: "Porto de Santos",
      vessel: "MSC Aurora",
      cargo: "Contêineres refrigerados",
      scheduledFor: "2025-10-15T08:00:00",
      description:
        "Solicitação de inspeção preventiva com equipe K9 especializada em cargas sensíveis e perecíveis.",
      status: "in-progress",
      tags: ["prevenção", "contêiner", "perecíveis"],
      createdAt: "2025-10-01T08:30:00.000Z",
      updatedAt: "2025-10-08T14:45:00.000Z",
      timeline: [
        {
          id: "event-001",
          timestamp: "2025-10-01T08:30:00.000Z",
          actor: { id: "client-porto", name: "Marina Porto", role: "client" },
          title: "Solicitação enviada",
          description: "Cliente registrou inspeção preventiva para navio MSC Aurora.",
          category: "request",
        },
        {
          id: "event-002",
          timestamp: "2025-10-02T11:15:00.000Z",
          actor: { id: "operator-santos", name: "Carlos Silva", role: "operator" },
          title: "Operação confirmada",
          description: "Equipe K9 escalada para a missão. Check-list pré-embarque iniciado.",
          category: "operation",
        },
        {
          id: "event-003",
          timestamp: "2025-10-08T14:45:00.000Z",
          actor: { id: "operator-santos", name: "Carlos Silva", role: "operator" },
          title: "Inspeção em andamento",
          description: "Primeira varredura concluída, sem ocorrências até o momento.",
          category: "operation",
        },
      ],
      report: null,
    },
    {
      id: "req-002",
      clientId: "client-porto",
      assignedOperatorId: null,
      title: "Auditoria extraordinária",
      port: "Terminal de Aracruz",
      vessel: "Blue Atlantic",
      cargo: "Graneis sólidos",
      scheduledFor: "2025-11-03T13:30:00",
      description:
        "Auditoria solicitada após alerta da Receita Federal para cargas de alto risco.",
      status: "pending",
      tags: ["auditoria", "alto risco"],
      createdAt: "2025-10-04T09:12:00.000Z",
      updatedAt: "2025-10-04T09:12:00.000Z",
      timeline: [
        {
          id: "event-004",
          timestamp: "2025-10-04T09:12:00.000Z",
          actor: { id: "client-porto", name: "Marina Porto", role: "client" },
          title: "Solicitação aberta",
          description: "Cliente registrou auditoria extraordinária no terminal de Aracruz.",
          category: "request",
        },
      ],
      report: null,
    },
  ],
};
