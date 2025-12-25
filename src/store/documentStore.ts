import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

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

// Custom action type for user-defined actions (notes about the document)
export interface CustomAction {
    id: string;
    text: string;
    priority: 'low' | 'medium' | 'high';
    addedAsTask: boolean;
    taskId?: string;
    createdAt: string;
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
    customActions: CustomAction[]; // User's own actions/notes about the document
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
    isLoading: boolean;
    uploadProgress: number;
    error: string | null;

    // API Actions
    fetchDocuments: (params?: { projectId?: string; type?: string }) => Promise<void>;
    fetchAnalyses: () => Promise<void>;
    fetchDocumentById: (id: string) => Promise<Document | null>;

    // Document Actions
    setDocuments: (documents: Document[]) => void;
    addDocument: (document: Omit<Document, 'uploadDate' | 'lastModified'> & { id?: string }) => Document;
    updateDocument: (id: string, updates: Partial<Document>) => void;
    deleteDocument: (id: string) => void;
    getDocumentById: (id: string) => Document | undefined;
    getDocumentsByProject: (projectId: string) => Document[]; // Yeni: Proje bazlı filtreleme

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

    // Custom Actions (user's own actions/notes)
    addCustomAction: (analysisId: string, action: Omit<CustomAction, 'id' | 'createdAt' | 'addedAsTask'>) => CustomAction;
    removeCustomAction: (analysisId: string, actionId: string) => void;
    markCustomActionAsTask: (analysisId: string, actionId: string, taskId: string) => void;

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

    // AI Analysis trigger
    triggerAnalysis: (documentId: string) => Promise<DocumentAnalysis>;
}

// ============== HELPER: Format file size ==============
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// ============== STORE IMPLEMENTATION ==============
export const useDocumentStore = create<DocumentState>()(
    persist(
        (set, get) => ({
            documents: [],
            analyses: [],
            currentAnalysis: null,
            isUploading: false,
            isAnalyzing: false,
            isLoading: false,
            uploadProgress: 0,
            error: null,

            // API Actions
            fetchDocuments: async (params) => {
                set({ isLoading: true, error: null });
                try {
                    const queryParams = new URLSearchParams();
                    if (params?.projectId) queryParams.set('projectId', params.projectId);
                    if (params?.type) queryParams.set('type', params.type);

                    const queryString = queryParams.toString();
                    const endpoint = `/documents${queryString ? `?${queryString}` : ''}`;

                    const response = await api.get<any[]>(endpoint);

                    // Map backend response to frontend Document interface
                    const documents: Document[] = response.map(doc => {
                        // Parse size - backend may send as number or string
                        const sizeNum = typeof doc.size === 'string'
                            ? parseInt(doc.size.replace(/[^\d]/g, '')) || 0
                            : (doc.size || 0);

                        // Get type from extension if not provided
                        const docType = doc.type || (doc.name?.split('.').pop()?.toUpperCase() || 'Other');

                        return {
                            id: doc.id || doc._id,
                            name: doc.name || 'Untitled',
                            type: docType as DocumentType,
                            size: sizeNum,
                            sizeFormatted: doc.sizeFormatted || doc.size || formatFileSize(sizeNum),
                            url: doc.url || doc.path || '',
                            thumbnailUrl: doc.thumbnailUrl,
                            uploaderId: doc.uploaderId || doc.uploader || '',
                            projectId: doc.projectId || doc.project || undefined,
                            uploadDate: doc.uploadDate || doc.createdAt || new Date().toISOString(),
                            lastModified: doc.lastModified || doc.updatedAt || doc.createdAt || new Date().toISOString(),
                            tags: doc.tags || [],
                            metadata: doc.metadata,
                        };
                    });

                    set({ documents, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Dokümanlar alınamadı';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            fetchAnalyses: async () => {
                set({ isLoading: true, error: null });
                try {
                    const analyses = await api.get<DocumentAnalysis[]>('/analyses');
                    set({ analyses, isLoading: false });
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Analizler alınamadı';
                    set({ error: errorMessage, isLoading: false });
                }
            },

            fetchDocumentById: async (id: string) => {
                try {
                    const doc = await api.get<Document>(`/documents/${id}`);
                    return doc;
                } catch (error) {
                    console.error('Document fetch error:', error);
                    return null;
                }
            },

            // Document Actions
            setDocuments: (documents) => set({ documents }),

            addDocument: (documentData) => {
                const now = new Date().toISOString();
                const newDocument: Document = {
                    ...documentData,
                    id: documentData.id || `doc-${crypto.randomUUID()}`, // Use provided ID or generate new one
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

            getDocumentsByProject: (projectId) => get().documents.filter((doc) => doc.projectId === projectId),

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

            // Add custom action to analysis
            addCustomAction: (analysisId, actionData) => {
                const newAction: CustomAction = {
                    ...actionData,
                    id: `custom-${crypto.randomUUID()}`,
                    createdAt: new Date().toISOString(),
                    addedAsTask: false,
                };

                set((state) => ({
                    analyses: state.analyses.map((analysis) =>
                        analysis.id === analysisId
                            ? {
                                ...analysis,
                                customActions: [...analysis.customActions, newAction],
                            }
                            : analysis
                    ),
                    currentAnalysis:
                        state.currentAnalysis?.id === analysisId
                            ? {
                                ...state.currentAnalysis,
                                customActions: [...state.currentAnalysis.customActions, newAction],
                            }
                            : state.currentAnalysis,
                }));

                return newAction;
            },

            // Remove custom action from analysis
            removeCustomAction: (analysisId, actionId) =>
                set((state) => ({
                    analyses: state.analyses.map((analysis) =>
                        analysis.id === analysisId
                            ? {
                                ...analysis,
                                customActions: analysis.customActions.filter((a) => a.id !== actionId),
                            }
                            : analysis
                    ),
                    currentAnalysis:
                        state.currentAnalysis?.id === analysisId
                            ? {
                                ...state.currentAnalysis,
                                customActions: state.currentAnalysis.customActions.filter((a) => a.id !== actionId),
                            }
                            : state.currentAnalysis,
                })),

            // Mark custom action as converted to task
            markCustomActionAsTask: (analysisId, actionId, taskId) =>
                set((state) => ({
                    analyses: state.analyses.map((analysis) =>
                        analysis.id === analysisId
                            ? {
                                ...analysis,
                                customActions: analysis.customActions.map((action) =>
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
                                customActions: state.currentAnalysis.customActions.map(
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
                                customActions: [],
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
            // Don't persist documents/analyses arrays - always fetch fresh from API
            partialize: () => ({}),
        }
    )
);
