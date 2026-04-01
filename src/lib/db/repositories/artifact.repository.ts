type ArtifactRecord = {
  id: string;
  conversationId: string;
  artifactType: string;
  title: string | null;
  language: string | null;
  currentVersion: number;
  createdAt: Date;
  updatedAt: Date;
  versions: Array<Record<string, unknown>>;
};

const artifacts = new Map<string, ArtifactRecord>();

export class ArtifactRepository {
  async getArtifactVersion(id: string, version?: number) {
    const art = artifacts.get(id);
    if (!art) return null;
    const v = version ?? art.currentVersion;
    const ver = art.versions.find(
      (x) => (x as { version: number }).version === v
    );
    return ver ?? null;
  }

  async findByConversationId(conversationId: string) {
    return [...artifacts.values()].filter(
      (a) => a.conversationId === conversationId
    );
  }

  async create(input: {
    conversationId: string;
    artifactType: string;
    title?: string;
    language?: string;
    content: string;
    userId: string;
  }) {
    const id = crypto.randomUUID();
    const now = new Date();
    const ver = {
      id: crypto.randomUUID(),
      artifactId: id,
      version: 1,
      content: input.content,
      sizeBytes: Buffer.byteLength(input.content, 'utf8'),
      storagePath: null as string | null,
      createdAt: now,
    };
    const art: ArtifactRecord = {
      id,
      conversationId: input.conversationId,
      artifactType: input.artifactType,
      title: input.title ?? null,
      language: input.language ?? null,
      currentVersion: 1,
      createdAt: now,
      updatedAt: now,
      versions: [ver],
    };
    artifacts.set(id, art);
    return art;
  }

  async updateArtifact(id: string, content: string) {
    const art = artifacts.get(id);
    if (!art) return null;
    const now = new Date();
    const nextVer = art.currentVersion + 1;
    const ver = {
      id: crypto.randomUUID(),
      artifactId: id,
      version: nextVer,
      content,
      sizeBytes: Buffer.byteLength(content, 'utf8'),
      storagePath: null as string | null,
      createdAt: now,
    };
    art.versions.push(ver);
    art.currentVersion = nextVer;
    art.updatedAt = now;
    return art;
  }

  async delete(id: string) {
    artifacts.delete(id);
  }

  async listVersions(artifactId: string) {
    const art = artifacts.get(artifactId);
    return art?.versions ?? [];
  }
}
