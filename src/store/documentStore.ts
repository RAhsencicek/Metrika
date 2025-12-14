import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============== DOCUMENT TYPES ==============
// Backend-ready interfaces - API endpoints will return these structures

export type DocumentType = 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'TXT' | 'Other';
export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'failed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Document {
    id: string;
    name: string;
    type: DocumentType;
    size: number; // bytes
    sizeFormatted: string; // "2.4 MB"
    url: string; // Backend will provide actual file URL
    thumbnailUrl?: string;
    uploaderId: string;
    projectId?: string;
    uploadDate: string;
    lastModified: string;
    tags: string[];
    metadata?: Record<string, any>;
}

export interface Risk {
    id: string;
    description: string;
    level: RiskLevel;
    page?: number;
    section?: string;
}

export interface Finding {
    id: string;
    text: string;
    isPositive: boolean;
    page?: number;
}

export interface SuggestedAction {
    id: string;
    text: string;
    priority: 'low' | 'medium' | 'high';
    addedAsTask: boolean;
    taskId?: string;
}

export interface DocumentAnalysis {
    id: string;
    documentId: string;
    document: Document;
    status: AnalysisStatus;
    summary: string;
    findings: Finding[];
    risks: Risk[];
    suggestedActions: SuggestedAction[];
    tags: string[];
    analyzedAt: string;
    savedAt?: string;
    sharedWith?: string[]; // User IDs
    shareLink?: string;
    aiModel?: string; // For future: which AI model was used
    confidence?: number; // AI confidence score 0-100
}

// ============== STORE STATE ==============
interface DocumentState {
    documents: Document[];
    analyses: DocumentAnalysis[];
    currentAnalysis: DocumentAnalysis | null;
    isUploading: boolean;
    isAnalyzing: boolean;
    uploadProgress: number;
    error: string | null;

    // Document Actions
    setDocuments: (documents: Document[]) => void;
    addDocument: (document: Omit<Document, 'id' | 'uploadDate' | 'lastModified'>) => Document;
    updateDocument: (id: string, updates: Partial<Document>) => void;
    deleteDocument: (id: string) => void;
    getDocumentById: (id: string) => Document | undefined;

    // Analysis Actions
    setAnalyses: (analyses: DocumentAnalysis[]) => void;
    addAnalysis: (analysis: Omit<DocumentAnalysis, 'id'>) => DocumentAnalysis;
    updateAnalysis: (id: string, updates: Partial<DocumentAnalysis>) => void;
    deleteAnalysis: (id: string) => void;
    getAnalysisById: (id: string) => DocumentAnalysis | undefined;
    getAnalysisByDocumentId: (documentId: string) => DocumentAnalysis | undefined;
    setCurrentAnalysis: (analysis: DocumentAnalysis | null) => void;

    // Suggested Action -> Task
    markActionAsTask: (analysisId: string, actionId: string, taskId: string) => void;

    // Share functionality
    generateShareLink: (analysisId: string) => string;
    addShareRecipient: (analysisId: string, userId: string) => void;

    // Save functionality
    saveAnalysis: (analysisId: string) => void;

    // Upload state management (for future file upload integration)
    setUploading: (isUploading: boolean) => void;
    setUploadProgress: (progress: number) => void;
    setAnalyzing: (isAnalyzing: boolean) => void;
    setError: (error: string | null) => void;

    // Simulate file download (for now, will be replaced with actual download logic)
    downloadDocument: (documentId: string) => Promise<void>;

    // Future: AI Analysis trigger
    // This will be replaced with actual API call
    triggerAnalysis: (documentId: string) => Promise<DocumentAnalysis>;
}

// ============== MOCK DATA ==============
// This simulates what backend would return

const mockDocuments: Document[] = [
    {
        id: 'doc-1',
        name: 'SatisStratejisi_2023.pdf',
        type: 'PDF',
        size: 2516582, // ~2.4 MB
        sizeFormatted: '2.4 MB',
        url: '/documents/SatisStratejisi_2023.pdf',
        uploaderId: '1',
        projectId: '1',
        uploadDate: '2023-05-12T10:30:00Z',
        lastModified: '2023-05-12T10:30:00Z',
        tags: ['Strateji', 'Satış', '2023'],
    },
    {
        id: 'doc-2',
        name: 'PazarArastirmasi.docx',
        type: 'DOCX',
        size: 1258291, // ~1.2 MB
        sizeFormatted: '1.2 MB',
        url: '/documents/PazarArastirmasi.docx',
        uploaderId: '2',
        projectId: '1',
        uploadDate: '2023-05-05T14:20:00Z',
        lastModified: '2023-05-05T14:20:00Z',
        tags: ['Pazar', 'Araştırma'],
    },
    {
        id: 'doc-3',
        name: 'FinansalRapor_Q2.xlsx',
        type: 'XLSX',
        size: 524288, // ~512 KB
        sizeFormatted: '512 KB',
        url: '/documents/FinansalRapor_Q2.xlsx',
        uploaderId: '3',
        uploadDate: '2023-06-01T09:00:00Z',
        lastModified: '2023-06-01T09:00:00Z',
        tags: ['Finans', 'Q2', 'Rapor'],
    },
];

const mockAnalyses: DocumentAnalysis[] = [
    {
        id: 'analysis-1',
        documentId: 'doc-1',
        document: mockDocuments[0],
        status: 'completed',
        summary: 'Bu stratejik doküman, şirketin 2023 yılı için satış hedeflerini ve stratejilerini detaylandırmaktadır. Belgede, pazar analizi, hedef müşteri segmentleri, rekabet avantajları ve gelir tahminleri ele alınmaktadır. Özellikle KOBİ segmentinde %25 büyüme hedefi ve dijital pazarlama kanallarına %30 bütçe artışı öne çıkmaktadır.',
        findings: [
            { id: 'f1', text: 'Yeni ürün lansmanı için pazarlama stratejisi güçlü.', isPositive: true, page: 5 },
            { id: 'f2', text: 'Müşteri memnuniyetinde %15 artış hedefleniyor.', isPositive: true, page: 12 },
            { id: 'f3', text: 'Dijital dönüşüm yatırımları planlanmış.', isPositive: true, page: 18 },
        ],
        risks: [
            { id: 'r1', description: 'Finansal projeksiyon detayları bazı bölümlerde eksik.', level: 'high', page: 14 },
            { id: 'r2', description: 'Rekabet analizi verileri 2021 yılına ait, güncellenmeli.', level: 'critical', page: 8 },
            { id: 'r3', description: 'Kaynak planlaması belirsiz.', level: 'medium', page: 22 },
        ],
        suggestedActions: [
            { id: 'sa1', text: 'Finansal projeksiyonları revize et', priority: 'high', addedAsTask: false },
            { id: 'sa2', text: 'Rakip analizini Q3 verileriyle güncelle', priority: 'high', addedAsTask: false },
            { id: 'sa3', text: 'Kaynak planlaması detaylandırılmalı', priority: 'medium', addedAsTask: false },
        ],
        tags: ['KOBİ', 'Pazarlama', 'Bütçe Artışı', 'Satış Hedefi', 'Rekabet Analizi'],
        analyzedAt: '2023-05-12T11:00:00Z',
        savedAt: '2023-05-12T11:30:00Z',
        aiModel: 'gpt-4',
        confidence: 92,
    },
    {
        id: 'analysis-2',
        documentId: 'doc-2',
        document: mockDocuments[1],
        status: 'completed',
        summary: 'Pazar araştırması raporu, hedef pazardaki müşteri davranışlarını ve trendleri analiz etmektedir.',
        findings: [
            { id: 'f4', text: 'Hedef kitle doğru tanımlanmış.', isPositive: true },
            { id: 'f5', text: 'Anket sonuçları detaylı sunulmuş.', isPositive: true },
        ],
        risks: [
            { id: 'r4', description: 'Örneklem boyutu yetersiz olabilir.', level: 'medium' },
        ],
        suggestedActions: [
            { id: 'sa4', text: 'Daha geniş örneklem ile tekrar anket yap', priority: 'medium', addedAsTask: false },
        ],
        tags: ['Pazar Araştırması', 'Müşteri Analizi'],
        analyzedAt: '2023-05-05T15:00:00Z',
        aiModel: 'gpt-4',
        confidence: 88,
    },
];

// ============== STORE IMPLEMENTATION ==============
export const useDocumentStore = create<DocumentState>()(
    persist(
        (set, get) => ({
            documents: mockDocuments,
            analyses: mockAnalyses,
            currentAnalysis: mockAnalyses[0], // Default to first analysis for demo
            isUploading: false,
            isAnalyzing: false,
            uploadProgress: 0,
            error: null,

            // Document Actions
            setDocuments: (documents) => set({ documents }),

            addDocument: (documentData) => {
                const now = new Date().toISOString();
                const newDocument: Document = {
                    ...documentData,
                    id: `doc-${crypto.randomUUID()}`,
                    uploadDate: now,
                    lastModified: now,
                };

                set((state) => ({
                    documents: [...state.documents, newDocument],
                }));

                return newDocument;
            },

            updateDocument: (id, updates) =>
                set((state) => ({
                    documents: state.documents.map((doc) =>
                        doc.id === id
                            ? { ...doc, ...updates, lastModified: new Date().toISOString() }
                            : doc
                    ),
                })),

            deleteDocument: (id) =>
                set((state) => ({
                    documents: state.documents.filter((doc) => doc.id !== id),
                    analyses: state.analyses.filter((a) => a.documentId !== id),
                })),

            getDocumentById: (id) => get().documents.find((doc) => doc.id === id),

            // Analysis Actions
            setAnalyses: (analyses) => set({ analyses }),

            addAnalysis: (analysisData) => {
                const newAnalysis: DocumentAnalysis = {
                    ...analysisData,
                    id: `analysis-${crypto.randomUUID()}`,
                };

                set((state) => ({
                    analyses: [...state.analyses, newAnalysis],
                }));

                return newAnalysis;
            },

            updateAnalysis: (id, updates) =>
                set((state) => ({
                    analyses: state.analyses.map((analysis) =>
                        analysis.id === id ? { ...analysis, ...updates } : analysis
                    ),
                    currentAnalysis:
                        state.currentAnalysis?.id === id
                            ? { ...state.currentAnalysis, ...updates }
                            : state.currentAnalysis,
                })),

            deleteAnalysis: (id) =>
                set((state) => ({
                    analyses: state.analyses.filter((a) => a.id !== id),
                    currentAnalysis: state.currentAnalysis?.id === id ? null : state.currentAnalysis,
                })),

            getAnalysisById: (id) => get().analyses.find((a) => a.id === id),

            getAnalysisByDocumentId: (documentId) =>
                get().analyses.find((a) => a.documentId === documentId),

            setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

            // Mark action as converted to task
            markActionAsTask: (analysisId, actionId, taskId) =>
                set((state) => ({
                    analyses: state.analyses.map((analysis) =>
                        analysis.id === analysisId
                            ? {
                                ...analysis,
                                suggestedActions: analysis.suggestedActions.map((action) =>
                                    action.id === actionId
                                        ? { ...action, addedAsTask: true, taskId }
                                        : action
                                ),
                            }
                            : analysis
                    ),
                    currentAnalysis:
                        state.currentAnalysis?.id === analysisId
                            ? {
                                ...state.currentAnalysis,
                                suggestedActions: state.currentAnalysis.suggestedActions.map(
                                    (action) =>
                                        action.id === actionId
                                            ? { ...action, addedAsTask: true, taskId }
                                            : action
                                ),
                            }
                            : state.currentAnalysis,
                })),

            // Generate share link (mock - will be replaced with backend API)
            generateShareLink: (analysisId) => {
                const shareLink = `${window.location.origin}/share/analysis/${analysisId}`;
                set((state) => ({
                    analyses: state.analyses.map((a) =>
                        a.id === analysisId ? { ...a, shareLink } : a
                    ),
                    currentAnalysis:
                        state.currentAnalysis?.id === analysisId
                            ? { ...state.currentAnalysis, shareLink }
                            : state.currentAnalysis,
                }));
                return shareLink;
            },

            addShareRecipient: (analysisId, userId) =>
                set((state) => ({
                    analyses: state.analyses.map((a) =>
                        a.id === analysisId
                            ? { ...a, sharedWith: [...(a.sharedWith || []), userId] }
                            : a
                    ),
                })),

            // Save analysis
            saveAnalysis: (analysisId) =>
                set((state) => ({
                    analyses: state.analyses.map((a) =>
                        a.id === analysisId ? { ...a, savedAt: new Date().toISOString() } : a
                    ),
                    currentAnalysis:
                        state.currentAnalysis?.id === analysisId
                            ? { ...state.currentAnalysis, savedAt: new Date().toISOString() }
                            : state.currentAnalysis,
                })),

            // Upload state management
            setUploading: (isUploading) => set({ isUploading }),
            setUploadProgress: (uploadProgress) => set({ uploadProgress }),
            setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
            setError: (error) => set({ error }),

            // Download document - Actually downloads the file
            downloadDocument: async (documentId) => {
                const doc = get().getDocumentById(documentId);
                if (!doc) {
                    throw new Error('Doküman bulunamadı');
                }

                return new Promise((resolve) => {
                    setTimeout(async () => {
                        const link = window.document.createElement('a');

                        // Check if we have a data URL (from uploaded files)
                        if (doc.url.startsWith('data:')) {
                            link.href = doc.url;
                            link.download = doc.name;
                        } else {
                            // For mock documents, use the real txt files in public/documents
                            // Map document names to their txt file paths
                            const txtFileMap: Record<string, string> = {
                                'SatisStratejisi_2023.pdf': '/documents/SatisStratejisi_2023.txt',
                                'PazarArastirmasi.docx': '/documents/PazarArastirmasi.txt',
                                'FinansalRapor_Q2.xlsx': '/documents/FinansalRapor_Q2.txt',
                            };

                            const txtPath = txtFileMap[doc.name];

                            if (txtPath) {
                                // Download the real txt file
                                link.href = txtPath;
                                link.download = doc.name.replace(/\.[^/.]+$/, '') + '.txt';
                            } else {
                                // Fallback: create a sample content for unknown documents
                                const sampleContent = `
═══════════════════════════════════════════════════════════════════════════════
                              METRIKA DOKÜMAN YÖNETİMİ
═══════════════════════════════════════════════════════════════════════════════

Doküman Adı: ${doc.name}
Doküman Tipi: ${doc.type}
Boyut: ${doc.sizeFormatted}
Yükleme Tarihi: ${new Date(doc.uploadDate).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}

───────────────────────────────────────────────────────────────────────────────
                              DOKÜMAN İÇERİĞİ
───────────────────────────────────────────────────────────────────────────────

Bu doküman Metrika proje yönetim sisteminde oluşturulmuştur.

📊 İSTATİSTİKLER
- Toplam Sayfa: ~${Math.floor(doc.size / 3000) + 1}
- Kelime Sayısı: ~${Math.floor(doc.size / 6)}
- Karakter Sayısı: ~${doc.size}

🏷️ ETİKETLER
${doc.tags.length > 0 ? doc.tags.map(t => `• ${t}`).join('\n') : '• Henüz etiket eklenmemiş'}

───────────────────────────────────────────────────────────────────────────────
                              METRİKA - KURUMSAL PROJE YÖNETİMİ
                              © ${new Date().getFullYear()} Tüm Hakları Saklıdır
═══════════════════════════════════════════════════════════════════════════════
`;
                                const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
                                link.href = URL.createObjectURL(blob);
                                link.download = doc.name.replace(/\.[^/.]+$/, '') + '.txt';
                            }
                        }

                        // Append to body, click, and remove
                        window.document.body.appendChild(link);
                        link.click();
                        window.document.body.removeChild(link);

                        console.log(`[Download] ${link.download}`);
                        resolve();
                    }, 300);
                });
            },

            // Trigger AI Analysis (mock - will be replaced with actual AI API)
            triggerAnalysis: async (documentId) => {
                const document = get().getDocumentById(documentId);
                if (!document) {
                    throw new Error('Doküman bulunamadı');
                }

                set({ isAnalyzing: true, error: null });

                // In production, this will be:
                // const response = await fetch('/api/documents/analyze', {
                //     method: 'POST',
                //     body: JSON.stringify({ documentId }),
                // });
                // const analysis = await response.json();

                // Simulate AI analysis with delay
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            const newAnalysis: DocumentAnalysis = {
                                id: `analysis-${crypto.randomUUID()}`,
                                documentId,
                                document,
                                status: 'completed',
                                summary: `${document.name} dokümanı başarıyla analiz edildi. Bu bir simülasyon analizidir.`,
                                findings: [
                                    { id: crypto.randomUUID(), text: 'Doküman yapısı uygun.', isPositive: true },
                                ],
                                risks: [
                                    { id: crypto.randomUUID(), description: 'Dikkat edilmesi gereken noktalar mevcut.', level: 'low' },
                                ],
                                suggestedActions: [
                                    { id: crypto.randomUUID(), text: 'Dokümanı gözden geçir', priority: 'medium', addedAsTask: false },
                                ],
                                tags: document.tags,
                                analyzedAt: new Date().toISOString(),
                                aiModel: 'mock-ai',
                                confidence: 75,
                            };

                            set((state) => ({
                                analyses: [...state.analyses, newAnalysis],
                                currentAnalysis: newAnalysis,
                                isAnalyzing: false,
                            }));

                            resolve(newAnalysis);
                        } catch (error) {
                            set({ isAnalyzing: false, error: 'Analiz başarısız oldu' });
                            reject(error);
                        }
                    }, 2000); // Simulate 2 second analysis time
                });
            },
        }),
        {
            name: 'metrika-document-storage',
        }
    )
);
