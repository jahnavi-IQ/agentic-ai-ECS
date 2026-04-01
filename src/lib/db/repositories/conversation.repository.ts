const conversations = new Map<string, Record<string, unknown>>();

function statusFromFilter(s: string): string {
  const map: Record<string, string> = {
    active: 'ACTIVE',
    archived: 'ARCHIVED',
    deleted: 'DELETED',
  };
  return map[s.toLowerCase()] ?? 'ACTIVE';
}

export class ConversationRepository {
  async findById(id: string) {
    return conversations.get(id) ?? null;
  }

  async findByUserId(
    userId: string,
    status: string,
    limit: number,
    offset: number
  ) {
    const target = statusFromFilter(status);
    const list = [...conversations.values()]
      .filter((c) => c.userId === userId && c.status === target)
      .sort(
        (a, b) =>
          new Date(b.updatedAt as string).getTime() -
          new Date(a.updatedAt as string).getTime()
      )
      .slice(offset, offset + limit);
    return list;
  }

  async countByUserId(userId: string) {
    return [...conversations.values()].filter((c) => c.userId === userId)
      .length;
  }

  async healthCheck() {
    /* stub — no DB wired */
  }

  async create(input: {
    userId: string;
    title: string;
    metadata?: unknown;
  }) {
    const id = crypto.randomUUID();
    const now = new Date();
    const conv = {
      id,
      userId: input.userId,
      title: input.title,
      messageCount: 0,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      metadata: input.metadata ?? null,
    };
    conversations.set(id, conv);
    return conv;
  }

  async update(id: string, input: { title?: string; status?: string }) {
    const c = conversations.get(id);
    if (!c) return null;
    if (input.title !== undefined) c.title = input.title;
    if (input.status !== undefined) {
      c.status = String(input.status).toUpperCase();
    }
    c.updatedAt = new Date();
    return c;
  }

  async delete(id: string) {
    conversations.delete(id);
  }
}
