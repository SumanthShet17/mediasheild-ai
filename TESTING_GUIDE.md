# MediaShield AI - Complete Testing & Deployment Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd c:\Users\shrey\mediasheild-ai
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
This launches Vite on `http://localhost:5173/`

### 3. Access the Application
- **Demo Mode**: `http://localhost:5173/?mode=demo`
- **Test Suite**: `http://localhost:5173/?mode=test`

---

## 📋 API Keys Configuration

The application uses Google APIs. Your current `.env` file has:
```
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
VITE_GOOGLE_CLOUD_API_KEY=YOUR_GOOGLE_CLOUD_VISION_API_KEY_HERE
VITE_MAPS_API_KEY=YOUR_MAPS_API_KEY_HERE
```

Set these values in your local `.env` before running the app.

---

## 🧪 Testing Guide

### Phase 1: Demo Mode Testing

#### 1.1 Content DNA Pipeline Test
1. Navigate to `http://localhost:5173/?mode=demo`
2. Scroll to **"🧬 1. Content DNA Pipeline"**
3. Upload one of the test images:
   - `test-images/original_cricket.png`
   - `test-images/original_football.png`
   - Or any sports image
4. Watch the progress bar:
   - ✅ Computing perceptual hashes (client-side, instant)
   - ✅ Analyzing with Cloud Vision (calls Google APIs)
   - ✅ Gemini AI analyzing content (calls Google Gemini)
   - ✅ Generating content embedding (768-dim vector)
   - ✅ Signing content credential (C2PA-compatible)
5. Review the results:
   - Asset metadata (ID, filename, size, timestamp)
   - Three perceptual hashes (pHash, dHash, aHash)
   - Gemini analysis (sport type, teams, content type, risk level)
   - Vision results (logos, OCR text, labels, web matches)
   - Embedding vector
   - C2PA credential

#### 1.2 Threat Classification Test
1. In Demo Mode, scroll to **"🔍 2. Threat Classification"**
2. Upload `test-images/original_cricket.png` as Original Image
3. Upload `test-images/pirated_cricket.png` as Suspect Image
4. Click **"⚡ Classify Threat"**
5. Review the results:
   - Match status (yes/no)
   - Similarity score (0-100%)
   - Modification type detected
   - Commercial intent assessment
   - Severity rating (critical/high/medium/low)
   - Recommended action (immediate_dmca/investigate/monitor/ignore)

#### 1.3 DMCA Generator Test
1. Scroll to **"📄 3. AI-Powered DMCA Generator"**
2. Click **"📝 Generate Sample DMCA"**
3. Review the generated notice:
   - Professional header with reference ID
   - Copyrighted work identification
   - Infringing URL
   - Evidence of ownership
   - Legal statements
4. Click **"📋 Copy to Clipboard"** to copy the full notice

#### 1.4 Propagation Analysis Test
1. Scroll to **"🌐 4. Propagation Intelligence"**
2. Click **"🔎 Analyze Sample Propagation"**
3. Review the intelligence summary:
   - Content spread summary
   - Distribution channels
   - Super-spreader accounts
   - Temporal patterns
   - Geographic concentration
   - Risk assessment
   - Recommended actions

#### 1.5 Credential Verification Test
1. Upload an image in Content DNA Pipeline
2. Scroll to **"🔐 5. Credential Verification"**
3. Click **"✅ Verify Last DNA Credential"**
4. Verify the credential:
   - Authentic status
   - Hash match
   - Chain of custody

---

### Phase 2: Test Suite Mode

Navigate to `http://localhost:5173/?mode=test`

#### 2.1 API Status Check
1. Click **"API Status"** tab
2. Click **"Run API Status Test"**
3. Verify all API keys are configured:
   - ✅ Gemini API Key
   - ✅ GCP API Key
   - ✅ Maps API Key
4. Check API connectivity tests

#### 2.2 Hash Algorithm Tests
1. Click **"Hash Tests"** tab
2. Upload a test image
3. Click **"Test Hash Algorithms"**
4. Review results:
   - pHash (Perceptual, most robust)
   - dHash (Difference, gradient-based)
   - aHash (Average, fastest)
   - Execution time for each
5. **Expected**: All should complete in <1 second

#### 2.3 Similarity Scoring Tests
1. Click **"Similarity Tests"** tab
2. Click **"Run Similarity Tests"**
3. Review mathematical correctness:
   - Hamming Similarity (identical hashes = 100%)
   - Cosine Similarity (identical vectors = 1.0)
   - Composite Score (weighted average)
4. **Expected**: Math checks should pass (✅)

#### 2.4 Embedding Tests
1. Click **"Embedding Tests"** tab
2. Click **"Test Text Embeddings"**
3. Review results:
   - 768-dimensional vectors generated
   - Embedding similarity between similar texts >50%
4. **Expected**: Both tests pass

#### 2.5 Vision API Tests
1. Click **"Vision Tests"** tab
2. Upload a sports image
3. Click **"Test Vision API"**
4. Review detected data:
   - Logos (brand logos in image)
   - Labels (what's in the image)
   - OCR text
   - Web entities
   - Similar images found online
   - Pages containing the image
5. **Expected**: Response time <2 seconds

#### 2.6 Gemini API Tests
1. Click **"Gemini Tests"** tab
2. Upload a sports image
3. Click **"Test Gemini API"**
4. Review analysis:
   - Sport type (cricket, football, etc.)
   - Teams detected
   - Players visible
   - Content type (photo, screenshot, broadcast, etc.)
   - Value assessment (high/medium/low)
   - Piracy risk (high/medium/low)
   - Semantic tags
5. **Expected**: Response time <3 seconds, all fields populated

#### 2.7 Integration Tests
1. Click **"Integration Tests"** tab
2. Click **"Run Full Integration Test"**
3. Verify:
   - Credential signing & verification (should PASS)
   - Tamper detection (should PASS - modified data detected)
4. **Expected**: Both tests pass ✅

#### 2.8 Full Pipeline Test
1. Click **"DNA Pipeline"** tab
2. Upload a sports image
3. Click **"Run Full Pipeline"**
4. Monitor progress through all 5 stages
5. Review complete Content DNA output:
   - All hashes computed
   - Vision analysis complete
   - Gemini analysis complete
   - Embedding generated
   - Credential signed
6. **Expected**: Total execution time <10 seconds

#### 2.9 View Test Log
1. Click **"Test Log"** tab
2. See all executed tests with timestamps
3. Can download log as text file for debugging

---

## 🐛 Troubleshooting

### Issue: "API Key not configured"
**Solution**: Verify `.env` file exists and has `VITE_GEMINI_API_KEY` set
```bash
cat c:\Users\shrey\mediasheild-ai\.env
```

### Issue: "Gemini API error (400)"
**Possible causes**:
- API key is invalid or expired
- Image format is not supported
- Prompt is malformed

**Solution**: 
- Get new API key from https://aistudio.google.com/apikey
- Ensure image is JPG/PNG format
- Check console for detailed error message

### Issue: "Cloud Vision API error"
**Possible causes**:
- API is not enabled in GCP project
- API key doesn't have Vision permissions

**Solution**:
- Go to https://console.cloud.google.com
- Enable "Cloud Vision API"
- Regenerate API key with proper scopes

### Issue: Slow response times
**Normal behavior**: First API call takes longer (cold start)
**Expected**: Subsequent calls are faster

**Optimization tips**:
- Use cached results when possible
- Batch multiple images
- Use Gemini Flash for faster responses

### Issue: "CORS" errors
**Possible cause**: Browser security policy
**Solution**: Errors shouldn't occur with proper API keys

### Issue: Mock data showing instead of real results
**Check**: Is `VITE_USE_MOCK_MODE=true` in .env?
**Solution**: Set it to false or remove it, use real API keys

---

## 📊 Performance Baselines

### Expected Response Times

| Operation | Time | Notes |
|-----------|------|-------|
| pHash computation | <100ms | Client-side, no API |
| dHash computation | <100ms | Client-side, no API |
| aHash computation | <100ms | Client-side, no API |
| Vision API call | 1-2s | Logos, labels, OCR, web |
| Gemini analysis | 2-5s | Detailed content analysis |
| Embedding generation | 2-4s | Two API calls (describe + embed) |
| Full pipeline | 8-12s | All operations combined |
| Threat classification | 3-6s | Gemini compares two images |
| DMCA generation | 2-4s | Gemini creates notice |

### Data Size Expectations

| Data | Size | Notes |
|------|------|-------|
| Image upload (typical) | 1-5 MB | JPEG/PNG sports photos |
| Perceptual hash | 16 hex chars | Fixed size |
| Embedding vector | 768 floats | ~3KB in memory |
| Vision response | 10-50 KB | Logos, labels, web results |
| Gemini response | 5-20 KB | Structured JSON analysis |

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```
Creates optimized `dist/` folder

### Run Production Build Locally
```bash
npm run preview
```

### Deploy to Cloud Run (GCP)
The repository includes Docker setup:
```bash
# Member 3 will handle this
./deploy.sh
```

---

## ✅ Final Verification Checklist

- [ ] Dev server runs without errors
- [ ] Demo mode displays all 5 sections
- [ ] Test suite has all tests available
- [ ] API Status test passes
- [ ] Hash tests complete in <1 second
- [ ] Similarity tests show correct math
- [ ] Embedding tests generate 768-dim vectors
- [ ] Vision API detects logos/labels
- [ ] Gemini API analyzes sport type correctly
- [ ] Credential signing and verification work
- [ ] Full pipeline completes without errors
- [ ] Test log can be downloaded
- [ ] Can switch between Demo and Test modes
- [ ] All error messages are clear and helpful
- [ ] Response times are reasonable (<15 seconds for full pipeline)

---

## 📞 Support

### Testing with Test Images
Located in `test-images/`:
- `original_cricket.png` - Original sports image
- `original_football.png` - Original football image
- `pirated_cricket.png` - Modified version for comparison

### Getting Help
1. Check browser console (F12) for JavaScript errors
2. Review test log for detailed error messages
3. Check .env file for proper API key configuration
4. Visit https://aistudio.google.com/apikey to validate Gemini key
5. Visit https://console.cloud.google.com for GCP key issues

---

## 🎯 What Each Page Shows

### Demo Page (AI Engine Demo)
- Live Content DNA fingerprinting
- Threat classification (original vs pirated)
- DMCA generation
- Propagation analysis
- Credential verification

### Test Suite Page
- Individual API connectivity tests
- Hash algorithm performance tests
- Similarity scoring verification
- Embedding quality checks
- Vision API detection tests
- Gemini API analysis tests
- Tamper detection verification
- Full pipeline end-to-end test
- Complete execution log

---

## 📝 Notes

- All data is processed in real-time
- No data is stored (stateless)
- Images are sent to Google APIs for analysis
- Results are displayed immediately
- Each run generates new timestamps and IDs

Generated: April 24, 2026
Version: 1.0.0
