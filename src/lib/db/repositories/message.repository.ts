const messages = new Map<string, Record<string, unknown>>();

export class MessageRepository {
  async findById(id: string) {
    return messages.get(id) ?? null;
  }

  async findByConversationId(
    conversationId: string,
    limit: number,
    offset: number
  ) {
    return [...messages.values()]
      .filter((m) => m.conversationId === conversationId)
      .sort(
        (a, b) =>
          new Date(a.createdAt as string).getTime() -
          new Date(b.createdAt as string).getTime()
      )
      .slice(offset, offset + limit);
  }

  async countByConversationId(conversationId: string) {
    return [...messages.values()].filter(
      (m) => m.conversationId === conversationId
    ).length;
  }

  async create(input: {
    conversationId: string;
    userId: string;
    role: string;
    content: string;
  }) {
    const id = crypto.randomUUID();
    const now = new Date();
    const msg = {
      id,
      conversationId: input.conversationId,
      userId: input.userId,
      role: input.role.toUpperCase(),
      content: input.content,
      createdAt: now,
      tokensUsed: null as number | null,
      model: null as string | null,
      provider: null as string | null,
      thinkingSteps: null as unknown,
      metadata: null as unknown,
    };
    messages.set(id, msg);
    return msg;
  }

  async delete(id: string) {
    messages.delete(id);
  }
}
