import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY
});

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|bmp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.use(express.json());

// Cleanup temporary files
const cleanupTempFiles = (files) => {
  files.forEach(file => {
    if (file && fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
      } catch (e) {
        console.warn('Could not delete temp file:', file);
      }
    }
  });
};

// STAGE 1: Analyze Image for Defects
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  let tempFiles = [req.file?.path].filter(Boolean);
  
  try {
    console.log('🔍 Stage 1: Analysis request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath).toString('base64');
    const mimeType = req.file.mimetype;

    console.log('📊 Analyzing image for defects...');
    
    const analysisPrompt = `
    You are a professional photo restoration expert. Analyze this image comprehensively to identify defects AND catalog all elements present.
    
    CRITICAL: This analysis will be used to validate that restoration does NOT add any new elements. Be thorough and precise.
    
    Return a JSON object with this exact structure:
    {
      "defects": [
        {
          "type": "SCRATCHES",
          "severity": "LOW|MEDIUM|HIGH",
          "description": "Description of scratches",
          "estimatedFixTime": "QUICK|MODERATE|COMPLEX"
        },
        {
          "type": "DUST_SPOTS",
          "severity": "LOW|MEDIUM|HIGH",
          "description": "Description of dust spots",
          "estimatedFixTime": "QUICK|MODERATE|COMPLEX"
        },
        {
          "type": "FADED_COLORS",
          "severity": "LOW|MEDIUM|HIGH",
          "description": "Description of color fading",
          "estimatedFixTime": "QUICK|MODERATE|COMPLEX"
        },
        {
          "type": "NOISE_GRAIN",
          "severity": "LOW|MEDIUM|HIGH",
          "description": "Description of noise/grain",
          "estimatedFixTime": "QUICK|MODERATE|COMPLEX"
        },
        {
          "type": "TEARS_FOLDS",
          "severity": "LOW|MEDIUM|HIGH",
          "description": "Description of tears/folds",
          "estimatedFixTime": "QUICK|MODERATE|COMPLEX"
        },
        {
          "type": "WATER_DAMAGE",
          "severity": "LOW|MEDIUM|HIGH",
          "description": "Description of water damage",
          "estimatedFixTime": "QUICK|MODERATE|COMPLEX"
        }
      ],
      "overallCondition": "POOR|FAIR|GOOD|EXCELLENT",
      "recommendations": ["array", "of", "recommendations"],
      "colorAnalysis": {
        "saturationLevel": "LOW|NORMAL|HIGH",
        "contrastLevel": "LOW|NORMAL|HIGH",
        "whiteBalance": "COOL|NEUTRAL|WARM",
        "colorCast": "NONE|BLUE|YELLOW|RED|GREEN"
      },
      "elementInventory": {
        "people": [
          {
            "count": 1,
            "description": "Brief description of person(s) - age, gender, position, clothing if visible",
            "facialFeatures": "Description of visible facial features, expressions, hair"
          }
        ],
        "objects": [
          {
            "type": "Object type (e.g., furniture, vehicle, building)",
            "description": "Detailed description including color, size, position",
            "count": 1
          }
        ],
        "backgroundElements": [
          {
            "type": "Background element type (e.g., sky, wall, landscape)",
            "description": "Description of background features",
            "prominentFeatures": ["list", "of", "key", "features"]
          }
        ],
        "composition": {
          "framing": "Description of how image is framed/cropped",
          "perspective": "Description of camera angle/perspective",
          "keyElements": ["list", "of", "most", "prominent", "elements"]
        }
      }
    }
    
    IMPORTANT RULES:
    - Only include defect types that are actually present in the image
    - Be extremely detailed in elementInventory - this is critical for validation
    - List ALL visible people, objects, and background elements
    - Note specific details like clothing colors, object positions, facial expressions
    - Be precise and factual in your analysis
    - The elementInventory will be used to ensure restoration doesn't add anything new
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          inlineData: {
            data: imageData,
            mimeType: mimeType,
          },
        },
        { text: analysisPrompt },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      }
    });

    let analysisResult;
    try {
      // Extract JSON from response
      const responseText = response.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      analysisResult = {
        defects: [],
        overallCondition: "UNKNOWN",
        recommendations: ["Unable to parse detailed analysis"],
        colorAnalysis: {
          saturationLevel: "UNKNOWN",
          contrastLevel: "UNKNOWN",
          whiteBalance: "UNKNOWN",
          colorCast: "UNKNOWN"
        }
      };
    }

    console.log('✅ Analysis completed');
    
    // Don't delete the file yet - we'll use it in stage 2
    res.json({
      success: true,
      analysis: analysisResult,
      imageId: path.basename(imagePath),
      message: 'Image analysis completed successfully'
    });
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
    cleanupTempFiles(tempFiles);
    
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image',
      details: error.message
    });
  }
});

// STAGE 2: Custom Restoration based on user selection
app.post('/api/restore', upload.single('image'), async (req, res) => {
  let tempFiles = [req.file?.path].filter(Boolean);
  
  try {
    console.log('🔧 Stage 2: Restoration request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Parse FormData fields (they come as strings)
    let defectsToFix = [];
    try {
      if (req.body.defectsToFix) {
        defectsToFix = typeof req.body.defectsToFix === 'string' 
          ? JSON.parse(req.body.defectsToFix) 
          : req.body.defectsToFix;
      }
    } catch (e) {
      console.warn('Could not parse defectsToFix:', e);
    }
    
    const enhanceColors = req.body.enhanceColors === 'true' || req.body.enhanceColors === true;
    const preserveOriginal = req.body.preserveOriginal !== 'false';
    
    // Parse analysisData if it's a string
    let analysis = null;
    if (req.body.analysisData) {
      try {
        analysis = typeof req.body.analysisData === 'string' 
          ? JSON.parse(req.body.analysisData) 
          : req.body.analysisData;
      } catch (e) {
        console.warn('Could not parse analysis data:', e);
      }
    }

    // If no defects specified, use default comprehensive restoration
    const effectiveDefects = Array.isArray(defectsToFix) && defectsToFix.length > 0 
      ? defectsToFix 
      : ['SCRATCHES', 'DUST_SPOTS', 'FADED_COLORS', 'NOISE_GRAIN'];

    console.log('Using defects:', effectiveDefects);

    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath).toString('base64');
    const mimeType = req.file.mimetype;

    // Build restoration prompt based on user selections
    let restorationPrompt = "You are a professional photo restoration expert. Restore this image with the following requirements:\n\n";
    
    if (effectiveDefects.includes('SCRATCHES')) {
      restorationPrompt += "- Remove all scratches and surface abrasions completely\n";
    }
    if (effectiveDefects.includes('DUST_SPOTS')) {
      restorationPrompt += "- Remove dust spots, speckles, and small imperfections\n";
    }
    if (effectiveDefects.includes('FADED_COLORS')) {
      restorationPrompt += "- Restore faded colors to their original vibrancy\n";
    }
    if (effectiveDefects.includes('NOISE_GRAIN')) {
      restorationPrompt += "- Reduce noise and grain while preserving details\n";
    }
    if (effectiveDefects.includes('TEARS_FOLDS')) {
      restorationPrompt += "- Repair tears, folds, and creases seamlessly\n";
    }
    if (effectiveDefects.includes('WATER_DAMAGE')) {
      restorationPrompt += "- Fix water damage, stains, and discoloration\n";
    }
    
    if (enhanceColors) {
      restorationPrompt += "- Enhance overall color balance and saturation naturally\n";
    }
    
    // Add element inventory to prompt if available
    if (analysis && analysis.elementInventory) {
      restorationPrompt += `\n\nELEMENT INVENTORY - PRESERVE EXACTLY THESE ELEMENTS:\n`;
      if (analysis.elementInventory.people && analysis.elementInventory.people.length > 0) {
        restorationPrompt += `People present: ${JSON.stringify(analysis.elementInventory.people)}\n`;
      }
      if (analysis.elementInventory.objects && analysis.elementInventory.objects.length > 0) {
        restorationPrompt += `Objects present: ${JSON.stringify(analysis.elementInventory.objects)}\n`;
      }
      if (analysis.elementInventory.backgroundElements && analysis.elementInventory.backgroundElements.length > 0) {
        restorationPrompt += `Background elements: ${JSON.stringify(analysis.elementInventory.backgroundElements)}\n`;
      }
      restorationPrompt += `Composition: ${JSON.stringify(analysis.elementInventory.composition)}\n`;
    }

    // Add color restoration guidance (prefer using analysis colorAnalysis if present)
    if (analysis && analysis.colorAnalysis) {
      restorationPrompt += `\n\nCOLOR RESTORATION TARGETS (from analysis):\n`;
      restorationPrompt += `- saturationLevel: ${analysis.colorAnalysis.saturationLevel}\n`;
      restorationPrompt += `- contrastLevel: ${analysis.colorAnalysis.contrastLevel}\n`;
      restorationPrompt += `- whiteBalance: ${analysis.colorAnalysis.whiteBalance}\n`;
      restorationPrompt += `- colorCast: ${analysis.colorAnalysis.colorCast}\n`;
      restorationPrompt += `\nCOLOR RESTORATION INSTRUCTIONS:\n`;
      restorationPrompt += `- Restore faded colors to look natural and historically accurate (avoid oversaturation)\n`;
      restorationPrompt += `- Correct any color cast while keeping skin tones and fabric colors believable\n`;
      restorationPrompt += `- Improve contrast gently to recover detail (avoid HDR/over-sharpened look)\n`;
      restorationPrompt += `- Do NOT introduce new colors/patterns/details that weren't present (e.g., no new nail polish, no new clothing buttons)\n`;
    } else if (enhanceColors) {
      restorationPrompt += `\n\nCOLOR RESTORATION INSTRUCTIONS:\n`;
      restorationPrompt += `- Restore and rebalance colors naturally (avoid oversaturation)\n`;
      restorationPrompt += `- Maintain realistic skin tones and original material colors\n`;
      restorationPrompt += `- Do NOT introduce new colors/patterns/details that weren't present\n`;
    }
    
    restorationPrompt += `
    
    CRITICAL RESTORATION RULES - VIOLATION OF THESE WILL CAUSE VALIDATION FAILURE:
    1. DO NOT add ANY new elements that were not in the original image (no new people, objects, or background elements)
    2. DO NOT change facial features, expressions, or positions of people
    3. DO NOT alter the composition, framing, or perspective
    4. DO NOT add decorative elements, text, or symbols not in original
    5. DO NOT change the number of people or objects
    6. Preserve all original textures, patterns, and details
    7. Maintain historical accuracy and authenticity
    8. Only repair defects and restore original colors/tones - do not "beautify" or stylize beyond restoration
    9. Keep exact same framing and crop
    10. Return ONLY the restored image data - no text or annotations
    
    REMEMBER: This restoration will be validated against the original. Any added elements will be detected and cause failure.
    `;

    console.log('🔄 Performing restoration with selected options:', defectsToFix);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          inlineData: {
            data: imageData,
            mimeType: mimeType,
          },
        },
        { text: restorationPrompt },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 2048,
      }
    });

    // Extract restored image
    let restoredBase64 = "";
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          restoredBase64 = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!restoredBase64) {
      throw new Error('Failed to generate restored image');
    }

    console.log('✅ Restoration completed');
    
    // Save restored image temporarily for validation
    const restoredBuffer = Buffer.from(restoredBase64.split(',')[1], 'base64');
    const restoredPath = path.join(__dirname, 'uploads', `restored-${Date.now()}.png`);
    fs.writeFileSync(restoredPath, restoredBuffer);
    tempFiles.push(restoredPath);

    res.json({
      success: true,
      restoredImage: restoredBase64,
      restoredPath: path.basename(restoredPath),
      originalPath: path.basename(imagePath),
      message: 'Image restored successfully'
    });
    
  } catch (error) {
    console.error('❌ Restoration error:', error);
    cleanupTempFiles(tempFiles);
    
    res.status(500).json({
      success: false,
      error: 'Failed to restore image',
      details: error.message
    });
  }
});

// STAGE 3: Cross-Validation
app.post('/api/validate', async (req, res) => {
  try {
    console.log('✅ Stage 3: Validation request received');
    
    const { originalPath, restoredPath } = req.body;
    
    if (!originalPath || !restoredPath) {
      return res.status(400).json({ error: 'Both original and restored image paths are required' });
    }

    const originalFullPath = path.join(__dirname, 'uploads', originalPath);
    const restoredFullPath = path.join(__dirname, 'uploads', restoredPath);
    
    if (!fs.existsSync(originalFullPath) || !fs.existsSync(restoredFullPath)) {
      return res.status(404).json({ error: 'Image files not found' });
    }

    // Perceptual (human) validation — do NOT use pixel-level diff (restoration will change pixels).
    console.log('🤖 Performing perceptual content validation...');
    const originalBase64 = fs.readFileSync(originalFullPath).toString('base64');
    const restoredBase64 = fs.readFileSync(restoredFullPath).toString('base64');
    
    // Get analysis data if provided for element comparison
    const { analysisData } = req.body;
    let elementInventory = null;
    if (analysisData) {
      try {
        const analysis = typeof analysisData === 'string' ? JSON.parse(analysisData) : analysisData;
        elementInventory = analysis.elementInventory;
      } catch (e) {
        console.warn('Could not parse analysis data for validation:', e);
      }
    }
    
    let validationPrompt = `
You are a professional image validation expert. Compare these two images:
- Image 1: Original
- Image 2: Restored

Goal: validate "what a human perceives" when comparing the images.
Restoration WILL change pixels; ignore pixel-level differences. Focus only on perceptual/semantic content.

CRITICAL: The restored image must NOT introduce new elements or new details that weren't present.
Examples of unacceptable additions/changes:
- Adding a new button to clothing
- Adding nail polish / changing nail color
- Adding jewelry, logos, patterns, text, symbols
- Adding new objects in background (birds, trees, signs, etc.)

Allowed restoration changes:
- Removing scratches/dust/tears/water stains
- Denoising
- Color correction / contrast improvements
These should NOT be flagged as “added elements”.

Return a JSON object with this exact structure:
{
  "hasAddedElements": "YES/NO",
  "hasRemovedElements": "YES/NO",
  "hasAlteredFaces": "YES/NO",
  "hasChangedComposition": "YES/NO",
  "fidelityScore": 0-100,
  "elementComparison": {
    "peopleCount": { "original": 0, "restored": 0, "match": true },
    "objectsCount": { "original": 0, "restored": 0, "match": true },
    "addedElements": ["human-noticeable new elements/details"],
    "removedElements": ["human-noticeable missing elements/details"],
    "alteredElements": ["human-noticeable changes (NOT defect removal), e.g., added button, changed nail color"]
  },
  "fineGrainedAttributeChanges": [
    {
      "area": "hands|nails|clothing|face|hair|background|other",
      "change": "short description of change",
      "severity": "LOW|MEDIUM|HIGH"
    }
  ],
  "issuesFound": ["list of issues"],
  "validationPassed": "YES/NO"
}

Rules:
- If you detect ANY added element or added detail (even small, like nail paint or a button), set hasAddedElements="YES" and validationPassed="NO".
- If you detect missing elements, set hasRemovedElements="YES" and validationPassed="NO".
- If composition changed (crop/rotation/perspective), validationPassed="NO".
- If faces were altered (features/expression/shape), validationPassed="NO".
- Be strict, but do NOT confuse defect removal/color correction with added elements.
`;
    
    // Add element inventory to prompt if available for more precise comparison
    if (elementInventory) {
      validationPrompt += `\n\nELEMENT INVENTORY FROM ORIGINAL ANALYSIS - VERIFY ALL ARE PRESENT:\n`;
      validationPrompt += JSON.stringify(elementInventory, null, 2);
      validationPrompt += `\n\nCompare the restored image against this inventory. All elements listed above must be present, and NO new elements should exist.`;
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          inlineData: {
            data: originalBase64,
            mimeType: 'image/png',
          },
        },
        {
          inlineData: {
            data: restoredBase64,
            mimeType: 'image/png',
          },
        },
        { text: validationPrompt },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 2048, // Increased for detailed element comparison
      }
    });

    let validationResult;
    try {
      const responseText = response.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      validationResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      
      // Ensure elementComparison exists
      if (!validationResult.elementComparison) {
        validationResult.elementComparison = {
          peopleCount: { original: 0, restored: 0, match: true },
          objectsCount: { original: 0, restored: 0, match: true },
          addedElements: [],
          removedElements: [],
          alteredElements: []
        };
      }
      
      // Ensure arrays exist
      if (!Array.isArray(validationResult.elementComparison.addedElements)) {
        validationResult.elementComparison.addedElements = [];
      }
      if (!Array.isArray(validationResult.elementComparison.removedElements)) {
        validationResult.elementComparison.removedElements = [];
      }
      if (!Array.isArray(validationResult.elementComparison.alteredElements)) {
        validationResult.elementComparison.alteredElements = [];
      }
      if (!Array.isArray(validationResult.issuesFound)) {
        validationResult.issuesFound = [];
      }
      if (!Array.isArray(validationResult.fineGrainedAttributeChanges)) {
        validationResult.fineGrainedAttributeChanges = [];
      }
      
      // Convert fidelityScore to number if it's a string
      if (typeof validationResult.fidelityScore === 'string') {
        validationResult.fidelityScore = parseInt(validationResult.fidelityScore) || 0;
      }
      
    } catch (e) {
      console.error('Validation parse error:', e);
      validationResult = {
        hasAddedElements: "UNKNOWN",
        hasRemovedElements: "UNKNOWN",
        hasAlteredFaces: "UNKNOWN",
        hasChangedComposition: "UNKNOWN",
        fidelityScore: 0,
        elementComparison: {
          peopleCount: { original: 0, restored: 0, match: false },
          objectsCount: { original: 0, restored: 0, match: false },
          addedElements: ["Validation analysis failed"],
          removedElements: [],
          alteredElements: []
        },
        fineGrainedAttributeChanges: [],
        issuesFound: ["Validation analysis failed - could not parse response"],
        validationPassed: "NO"
      };
    }

    // 3. Cleanup temp files
    cleanupTempFiles([originalFullPath, restoredFullPath]);

    // 4. Enhanced final validation decision with element comparison
    const hasAddedElements = validationResult.hasAddedElements === "YES" || 
                            (validationResult.elementComparison && 
                             validationResult.elementComparison.addedElements && 
                             validationResult.elementComparison.addedElements.length > 0);
    
    const hasRemovedElements = validationResult.hasRemovedElements === "YES" ||
                              (validationResult.elementComparison &&
                               validationResult.elementComparison.removedElements &&
                               validationResult.elementComparison.removedElements.length > 0);
    
    const peopleCountMatch = validationResult.elementComparison?.peopleCount?.match !== false;
    const objectsCountMatch = validationResult.elementComparison?.objectsCount?.match !== false;
    
    const validationPassed = 
      validationResult.validationPassed === "YES" &&
      !hasAddedElements && // No added elements
      validationResult.hasAlteredFaces === "NO" && // No altered faces
      validationResult.hasChangedComposition === "NO" && // No composition changes
      peopleCountMatch && // People count matches
      objectsCountMatch && // Objects count matches
      (validationResult.fidelityScore >= 70); // Minimum fidelity score

    console.log('✅ Validation completed:', {
      validationPassed,
      fidelityScore: validationResult.fidelityScore
    });

    // Build detailed message
    let message = validationPassed 
      ? 'Image validation passed - Restoration is accurate' 
      : 'Image validation failed - Issues detected';
    
    if (hasAddedElements && validationResult.elementComparison?.addedElements?.length > 0) {
      message += `. Added elements detected: ${validationResult.elementComparison.addedElements.join(', ')}`;
    }
    if (hasRemovedElements && validationResult.elementComparison?.removedElements?.length > 0) {
      message += `. Removed elements: ${validationResult.elementComparison.removedElements.join(', ')}`;
    }
    if (!peopleCountMatch) {
      message += `. People count mismatch: Original=${validationResult.elementComparison?.peopleCount?.original || '?'}, Restored=${validationResult.elementComparison?.peopleCount?.restored || '?'}`;
    }
    if (!objectsCountMatch) {
      message += `. Objects count mismatch: Original=${validationResult.elementComparison?.objectsCount?.original || '?'}, Restored=${validationResult.elementComparison?.objectsCount?.restored || '?'}`;
    }

    res.json({
      success: true,
      validation: {
        contentValidation: validationResult,
        elementComparison: validationResult.elementComparison || {
          peopleCount: { original: 0, restored: 0, match: true },
          objectsCount: { original: 0, restored: 0, match: true },
          addedElements: [],
          removedElements: [],
          alteredElements: []
        },
        overallResult: validationPassed ? "PASSED" : "FAILED",
        confidenceScore: Math.min(validationResult.fidelityScore || 0, 100)
      },
      message
    });
    
  } catch (error) {
    console.error('❌ Validation error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to validate images',
      details: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '3-Stage Restoration API is running',
    stages: ['ANALYSIS', 'RESTORATION', 'VALIDATION'],
    model: 'Gemini 2.5 Flash Pro'
  });
});

// Cleanup endpoint (optional - for manual cleanup)
app.post('/api/cleanup', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  try {
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        if (Date.now() - fs.statSync(filePath).mtimeMs > 3600000) { // Older than 1 hour
          fs.unlinkSync(filePath);
        }
      });
    }
    res.json({ success: true, message: 'Cleanup completed' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`✅ 3-Stage Restoration API running at http://localhost:${port}`);
  console.log(`🔑 Using Gemini 2.5 Flash Pro`);
  console.log(`📊 Workflow: Analysis → Custom Restoration → Validation`);
});