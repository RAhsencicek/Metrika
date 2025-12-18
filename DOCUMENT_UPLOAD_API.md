# Metrika - Doküman Yükleme API Entegrasyonu

## 📌 Genel Bakış

DocumentUploadModal artık **gerçek backend API'ye** dosya yükleme yapacak şekilde yapılandırılmıştır.

## 🔧 Yapılandırma

### 1. Backend URL'yi Ayarlayın

Projenizin kök dizininde bir `.env` dosyası oluşturun:

```env
VITE_API_URL=http://localhost:3000
```

Veya production için:
```env
VITE_API_URL=https://api.metrika.com
```

### 2. Backend Endpoint'leri

Backend'inizde aşağıdaki endpoint'leri implement etmelisiniz:

#### 📤 Dosya Yükleme

**Endpoint:** `POST /api/documents/upload`

**Headers:**
- `Authorization: Bearer {token}` (opsiyonel, eğer authentication kullanıyorsanız)

**Body (multipart/form-data):**
- `file`: File - Yüklenecek dosya
- `fileName`: string - Dosya adı
- `fileType`: string - Doküman tipi ('PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT', 'Other')
- `uploaderId`: string - Yükleyen kullanıcının ID'si
- `projectId`: string (opsiyonel) - İlgili proje ID'si

**Response (200 OK):**
```json
{
  "id": "doc-uuid-here",
  "name": "SatisStratejisi_2023.pdf",
  "type": "PDF",
  "size": 2516582,
  "url": "https://s3.amazonaws.com/bucket/documents/doc-uuid-here.pdf",
  "uploadDate": "2023-12-17T14:30:00Z"
}
```

**Error Response (400/500):**
```json
{
  "message": "Hata açıklaması buraya"
}
```

#### 🧠 AI Analiz Tetikleme

**Endpoint:** `POST /api/documents/{documentId}/analyze`

**Headers:**
- `Authorization: Bearer {token}` (opsiyonel)
- `Content-Type: application/json`

**Response (200 OK):**
```json
{
  "id": "analysis-uuid",
  "documentId": "doc-uuid",
  "status": "completed",
  "summary": "Doküman özeti...",
  "findings": [
    {
      "id": "finding-uuid",
      "text": "Bulgu metni",
      "isPositive": true,
      "page": 5
    }
  ],
  "risks": [
    {
      "id": "risk-uuid",
      "description": "Risk açıklaması",
      "level": "high",
      "page": 10
    }
  ],
  "suggestedActions": [
    {
      "id": "action-uuid",
      "text": "Önerilen aksiyon",
      "priority": "high",
      "addedAsTask": false
    }
  ],
  "tags": ["tag1", "tag2"],
  "analyzedAt": "2023-12-17T14:35:00Z",
  "aiModel": "gpt-4",
  "confidence": 92
}
```

#### 🗑️ Doküman Silme

**Endpoint:** `DELETE /api/documents/{documentId}`

**Headers:**
- `Authorization: Bearer {token}` (opsiyonel)

**Response (200 OK):**
```json
{
  "message": "Doküman başarıyla silindi"
}
```

## 📝 Kullanım

### Frontend'de Kullanım

```tsx
import DocumentUploadModal from './components/DocumentUploadModal';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Doküman Yükle
      </button>
      
      <DocumentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadComplete={(documentId) => {
          console.log('Yüklendi:', documentId);
          // İstediğiniz işlemi yapın
        }}
      />
    </>
  );
}
```

## 🔐 Authentication

Eğer backend'inizde authentication varsa, token'ı `localStorage`'a kaydedin:

```typescript
localStorage.setItem('authToken', 'your-jwt-token-here');
```

API servisi (`src/services/documentApi.ts`) otomatik olarak bu token'ı request header'larına ekleyecektir.

## 🎯 Özellikler

✅ **Gerçek dosya yükleme** - Backend API'ye FormData ile dosya gönderimi  
✅ **Progress tracking** - XMLHttpRequest ile gerçek zamanlı yükleme ilerlemesi  
✅ **Hata yönetimi** - Network hataları, timeout'lar ve server hataları için detaylı hata mesajları  
✅ **Çoklu dosya** - Aynı anda birden fazla dosya yükleme desteği  
✅ **AI Analizi** - Yüklenen dokümanlar için opsiyonel AI analizi  
✅ **Proje ilişkilendirme** - Dokümanları projelere bağlama  
✅ **File type validation** - Sadece desteklenen dosya tiplerinin yüklenmesi  
✅ **Size limit** - 25MB dosya boyutu limiti (backend'de de kontrol edilmeli)

## 🧪 Development/Test Modu

Backend henüz hazır değilse, API servisi mock veri döndürecek şekilde geçici olarak yapılandırılabilir:

```typescript
// src/services/documentApi.ts içinde

export async function uploadDocument(request, onProgress) {
  // Geçici mock response (backend hazır olana kadar)
  return new Promise((resolve) => {
    // Fake progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (onProgress) onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve({
          id: `doc-${crypto.randomUUID()}`,
          name: request.fileName,
          type: request.fileType,
          size: request.file.size,
          url: URL.createObjectURL(request.file),
          uploadDate: new Date().toISOString(),
        });
      }
    }, 100);
  });
}
```

## 📚 Backend Örnek Implementasyon (Node.js/Express)

```javascript
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ 
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  storage: multer.memoryStorage() 
});

app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    const { fileName, fileType, uploaderId, projectId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Dosya bulunamadı' });
    }

    // Dosyayı S3, GCS veya local storage'a yükle
    const documentId = uuidv4();
    const fileUrl = await uploadToStorage(file, documentId);

    // Database'e kaydet
    const document = await saveDocumentToDb({
      id: documentId,
      name: fileName,
      type: fileType,
      size: file.size,
      url: fileUrl,
      uploaderId,
      projectId,
    });

    res.json({
      id: document.id,
      name: document.name,
      type: document.type,
      size: document.size,
      url: document.url,
      uploadDate: document.uploadDate,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Yükleme hatası' });
  }
});

app.post('/api/documents/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    
    // AI analizi yap (OpenAI, Claude, vb.)
    const analysis = await performAIAnalysis(id);
    
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Analiz hatası' });
  }
});
```

## 🚀 Deployment Checklist

- [ ] `.env` dosyasında production API URL'sini ayarlayın
- [ ] Backend'de CORS ayarlarını yapın
- [ ] File upload limitlerini backend ve frontend'de senkronize edin
- [ ] Authentication/Authorization implement edin
- [ ] Rate limiting ekleyin (DDoS koruması)
- [ ] File type validation'ı backend'de de yapın
- [ ] Virus scanning ekleyin (ClamAV vb.)
- [ ] Logging ve monitoring ekleyin
- [ ] CDN kullanarak büyük dosyaları serve edin

## 🐛 Troubleshooting

### "Network error during upload"
- Backend'in çalıştığından emin olun
- CORS ayarlarını kontrol edin
- .env dosyasındaki API URL'yi kontrol edin

### "Invalid server response"
- Backend response formatının doğru olduğundan emin olun
- Backend console loglarını kontrol edin

### Progress bar güncellenmiyor
- XMLHttpRequest'in progress eventi desteklenmiyor olabilir
- Backend'de chunked transfer encoding kullanın

## 📞 Destek

Herhangi bir sorunla karşılaşırsanız:
1. Browser console'u kontrol edin
2. Network tab'ı kontrol edin (F12 > Network)
3. Backend loglarına bakın
4. Bu dökümanı tekrar okuyun 😊
