import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client server-side using GEMINI_API_KEY from environment
const rawApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const hasValidKey = rawApiKey && rawApiKey !== 'MY_GEMINI_API_KEY' && rawApiKey.trim().length > 10;

let aiClient: GoogleGenAI | null = null;
if (hasValidKey) {
  aiClient = new GoogleGenAI({
    apiKey: rawApiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

/**
 * AI Council Chat Endpoint — True Dynamic Multi-Turn Orchestration
 * No scripted dialogue, no canned fallback responses.
 */
app.post('/api/council/chat', async (req, res) => {
  try {
    const { prompt, advisorId, gameState, chatHistory, customApiKey } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ success: false, error: 'PROMPT_REQUIRED', messageKu: 'پەیامی سەرۆک بەتاڵە.' });
    }

    // Determine active client (environment key or optional client-supplied key for testing)
    let activeAi = aiClient;
    if (!activeAi && customApiKey && typeof customApiKey === 'string' && customApiKey.trim().length > 10) {
      activeAi = new GoogleGenAI({
        apiKey: customApiKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }

    if (!activeAi) {
      return res.status(503).json({
        success: false,
        error: 'API_KEY_REQUIRED',
        messageKu: 'کلیلی Gemini API لە ژینگەی سێرڤەردا نەدۆزرایەوە. تکایە کلیل لە تابلۆی نهێنییەکان (Secrets) زیاد بکە بۆ دەستپێکردنی گفتوگۆی ڕاستەوخۆ لەگەڵ ئەنجومەن.'
      });
    }

    const stats = gameState?.stats || {};
    const turn = gameState?.turn || 1;
    const sessionId = gameState?.currentSessionId || 'session-turn-1';
    const rollingSummary = gameState?.rollingSummaryKu || 'دەستپێکی کۆبوونەوەی ئەنجومەن.';
    const currentTopic = gameState?.currentTopicKu || 'قەیرانی وزە و بازرگانی دەرەکی';
    const advisors = gameState?.advisors || {};

    // Build concise dossiers for all 6 continuing characters
    const advisorsInfo = Object.entries(advisors)
      .map(([id, adv]: [string, any]) => {
        const agenda = adv.privateAgenda || {};
        const mems = (adv.memories || []).slice(-3).map((m: any) => `• وەرزی ${m.turn}: ${m.summaryKu}`).join('\n');
        return `[وەزیر: ${adv.nameKu} (${adv.roleKu}) | ناسنامە: ${id}]
- کەسایەتی و شێوازی قسەکردن: ${adv.personalityKu}
- پێگەی گشتی: ${adv.agendaKu}
- متمانە بە سەرۆک: ${adv.trustInPresident || 70}/100 | ڕێز لە بڕیارەکان: ${adv.respectForJudgment || 70}/100
- ئامانجی تایبەت: ${agenda.personalObjectiveKu || 'پاراستنی پێگەی دەوڵەت'}
- ئامانجی دامەزراوەیی: ${agenda.institutionalObjectiveKu || 'پەرەپێدانی وەزارەت'}
- نیگەرانی و ترسی شاراوە: ${agenda.privateConcernKu || 'نییە'}
- هێڵە سوورەکان (سازش ناکات لەسەری): ${(agenda.redLinesKu || []).join('، ')}
- ئەو ڕاستییانەی دەیزانێت: ${(agenda.knownFactsKu || []).join('، ')}
- گومانە نهێنییەکانی: ${(agenda.suspicionsKu || []).join('، ')}
- یادەوەرییەکانی ئەم دواییەی:
${mems || 'یادەوەری سەرەتایی'}`;
      })
      .join('\n\n');

    // Build clean chronological transcript of recent chat turns (up to 12 turns)
    const recentMessages = Array.isArray(chatHistory) ? chatHistory.slice(-12) : [];
    const formattedTranscript = recentMessages
      .map((msg: any) => {
        const speaker = msg.speakerNameKu || (msg.sender === 'player' ? 'سەرۆک کۆمار' : msg.sender);
        return `[${speaker}]: ${msg.textKu}`;
      })
      .join('\n');

    // System instruction constructing the multi-turn dynamic meeting orchestrator
    const systemInstruction = `تۆ مێشکی بەڕێوەبەری کۆبوونەوەی ئەنجومەنی وەزیرانی کۆماری ئارڤێنیت (The Sovereign Table AI Council Orchestrator) لە کاتی گفتوگۆ لەگەڵ جەنابی سەرۆک کۆمار.

دۆخی ڕاستەقینەی جیهانی یاری (Ground Truth):
- وەرزی ئێستا: ${turn} لە ١٢ (هەڵبژاردنی چارەنووسساز دوای ${13 - turn} وەرزی تر)
- خەزێنە: $${stats.treasuryBillion || 48.5}B ملیار دۆلار | قەرز: $${stats.debtBillion || 120}B ملیار دۆلار
- ڕێژەی هەڵئاوسان: ${stats.inflationPct || 6.8}٪ | ڕێژەی بێکاری: ${stats.unemploymentPct || 7.4}٪ | گەشەی GDP: +${stats.gdpGrowthPct || 2.1}٪
- یەدەگی وزە: ${stats.energyReservesPct || 48}٪ | یەدەگی خۆراک: ${stats.foodReservesPct || 65}٪ | ئامادەیی سوپا: ${stats.militaryReadinessPct || 65}٪
- ڕای گشتی: ${stats.publicApprovalPct || 46}٪ | سەقامگیری هاوپەیمانی: ${stats.governmentStabilityPct || 52}٪ (زۆرینەی پەرلەمان ١٠١ کورسییە)
- بابەت و کرۆکی ئێستای کۆبوونەوەکە: ${currentTopic}
- پوختەی مێژوویی پێشوو: ${rollingSummary}

پڕۆفایلی شەش ئەندامە بەردەوامەکەی ئەنجومەن (Six Persistent Character Profiles):
${advisorsInfo}

ڕێساکانی بەڕێوەبردنی گفتوگۆی زیندوو (Mandatory Rules):
1. دیاریکردنی قسەکەرەکان (Selective Speakers - هەرگیز هەموو ٦ وەزیرەکە بەیەکەوە قسە ناکەن!):
   - تەنها ١ یان ٢ (یان زۆرترین ٣) وەزیری پەیوەندیدار دیاریبکە بۆ وەڵامدانەوە.
   - ئەگەر سەرۆک ناوی وەزیرێکی دیاریکراوی هێنا یان ڕووی کردە ئەو (Target: "${advisorId || 'all'}"), پێویستە ئەو وەزیرە یەکەم بێت کە وەڵامی ورد و ڕاستەوخۆ دەداتەوە. دواتر ئەگەر ناکۆکییەکی توند هەبوو، تەنها یەک وەزیری تر دەتوانێت ڕەخنە یان تێبینی بگرێت.
   - ئەگەر پرسیارەکە ئاراستەی هەموو ئەنجومەن کرا، تەنها ئەو ١-٢ وەزیرەی بوارەکەیان پەیوەستە با قسە بکەن؛ ئەوانی تر بێدەنگ دەمێننەوە.
2. کوردیی سۆرانی تەواو پاراو و ڕەسەن:
   - هەموو وەڵامەکان بە کوردیی سۆرانییەکی بەهێز، دیپلۆماسی، سیاسەتی سەردەمیانە و بێهەڵە دەبن.
   - هەرگیز دەستپێکی ساختە یان دەستەواژەی دوبارە بەکارمەهێنە (وەک «جەنابی سەرۆک ئەمە زۆر گرنگە»). ڕاستەوخۆ بڕۆ ناو ناواخنی وەڵامەکە!
   - درێژی قسەکان جیاوازە: تێبینییەکی بەپەلە یان دەستپێشخەری دەکرێت ١-٢ رستە بێت؛ شیکارییەکی ورد دەکرێت درێژتر بێت.
3. بەردەوامی فرە-خولگەیی (Multi-Turn Continuity & Accurate Memory):
   - گوێ لە ترانسکرێپتی پێشوو بگرە. ئەگەر سەرۆک وتی «ئەی پێشتر نەتووت...»، «بۆچوونت گۆڕاوە»، یان ناوی وەزیرێکی تری هێنا، بە وردی ئاماژە بەوە بدە کە لە کۆبوونەوەکەدا وتراوە.
   - ئەگەر شتێک لە بیرەوەری یان ترانسکرێپتدا نەبوو، وەزیر بە ڕاشکاوی دان بەوەدا دەنێت («من لە بیرم نییە شتێکی لەو جۆرەم وتبێت جەنابی سەرۆک» یان «ئەم ئامارە لە راپۆرتەکەماندا نییە»).
   - ئەگەر سەرۆک تەنها بیری لێدەکاتەوە یان پەشیمان بووەوە («من تەنها بیرم لێدەکردەوە»، «بڕیارم نەداوە»)، بە بڕیار لێکی مەدەرەوە و دانی پێدابنێ کە ئەمە ڕاوێژە نەک فەرمان.
4. سەربەخۆیی بۆچوون و ململانێی سیاسی (Independent Viewpoints):
   - وەزیرەکان کۆپی سەرۆک نین؛ هێڵی سوور و بەرژەوەندی تایبەتیان هەیە و دەتوانن ناکۆک بن، هۆشداری بدەن، مەرج دابنێن، یان پرسیاری ئاڵۆز لە سەرۆک بکەن.
5. جیاکردنەوەی بڕیار لە قسەکردن (Decisions Separate from Dialogue):
   - قسەی وەزیر بۆخۆی ئامارەکانی یاری ناگۆڕێت.
   - بەڵام ئەگەر گفتوگۆکە گەیشتە پێشنیارێکی ڕوون و کرداری، دەتوانیت لە فۆرماتی "actionableProposal" دایبنێیت تاوەکو سەرۆک بە فەرمی دەنگی لەسەر بدات.
6. گۆڕانکاری متمانە و یادەوەری (Trust & Memories):
   - ئەگەر قسەی سەرۆک کاریگەرییەکی ماناداری لەسەر متمانە هەبوو، تۆماری بکە لە trustUpdates.
   - یادەوەری نوێ تۆماربکە بۆ ئەو وەزیرانەی قسەیان کردووە.`;

    const userPrompt = `ترانسکرێپتی دوایین ئاڵوگۆڕەکانی ئەم کۆبوونەوەیە:\n${formattedTranscript || '(کۆبوونەوە تازە دەستیپێکردووە)'}\n\nپەیام و قسەی نوێی سەرۆک کۆمار:\n«${prompt}»\n\nئێستا وەک ئەنجومەنی وەزیران وەڵام بدەرەوە بەپێی یاساکانی سەرەوە بە زمانی کوردیی سۆرانی لە قاڵبی JSON.`;

    const generateWithRetry = async (attempts = 2): Promise<any> => {
      for (let i = 0; i < attempts; i++) {
        try {
          return await activeAi.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  dialogue: {
                    type: Type.ARRAY,
                    description: 'لیستی قسەی ١ بۆ ٣ وەزیری دیاریکراو',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        advisorId: { type: Type.STRING },
                        speakerNameKu: { type: Type.STRING },
                        textKu: { type: Type.STRING }
                      },
                      required: ['advisorId', 'speakerNameKu', 'textKu']
                    }
                  },
                  actionableProposal: {
                    type: Type.OBJECT,
                    description: 'پێشنیاری فەرمی دەوڵەت ئەگەر لە وتووێژەکەدا گەیشتنە پێشنیارێکی کۆنکرێت',
                    properties: {
                      titleKu: { type: Type.STRING },
                      proposedBy: { type: Type.STRING },
                      summaryKu: { type: Type.STRING },
                      costBillion: { type: Type.NUMBER },
                      effects: {
                        type: Type.OBJECT,
                        properties: {
                          treasuryBillion: { type: Type.NUMBER },
                          publicApprovalPct: { type: Type.NUMBER },
                          energyReservesPct: { type: Type.NUMBER },
                          militaryReadinessPct: { type: Type.NUMBER },
                          governmentStabilityPct: { type: Type.NUMBER },
                          inflationPct: { type: Type.NUMBER }
                        }
                      },
                      reasoningKu: { type: Type.STRING }
                    },
                    required: ['titleKu', 'proposedBy', 'summaryKu', 'reasoningKu']
                  },
                  trustUpdates: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        advisorId: { type: Type.STRING },
                        metric: { type: Type.STRING },
                        delta: { type: Type.NUMBER },
                        reasonKu: { type: Type.STRING }
                      },
                      required: ['advisorId', 'metric', 'delta', 'reasonKu']
                    }
                  },
                  newMemories: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        advisorId: { type: Type.STRING },
                        summaryKu: { type: Type.STRING },
                        playerStanceKu: { type: Type.STRING },
                        promiseOrWarningKu: { type: Type.STRING },
                        unresolvedQuestionKu: { type: Type.STRING }
                      },
                      required: ['advisorId', 'summaryKu']
                    }
                  },
                  meetingSummaryUpdateKu: { type: Type.STRING }
                },
                required: ['dialogue']
              }
            }
          });
        } catch (err: any) {
          if (i === attempts - 1) throw err;
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    };

    const response = await generateWithRetry(2);

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.dialogue || !Array.isArray(parsed.dialogue) || parsed.dialogue.length === 0) {
      return res.status(502).json({
        success: false,
        error: 'INVALID_AI_STRUCTURE',
        messageKu: 'مۆدێلی AI نەیتوانی قسەکەرەکان لە قاڵبی پێویستدا دابڕێژێت. تکایە دووبارە پەیامەکەت بنێرەوە.'
      });
    }

    let normalizedProposal = null;
    if (parsed.actionableProposal && parsed.actionableProposal.titleKu) {
      normalizedProposal = {
        id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        titleKu: parsed.actionableProposal.titleKu,
        proposedBy: parsed.actionableProposal.proposedBy || 'council',
        turnProposed: Number(gameState?.turn) || 1,
        summaryKu: parsed.actionableProposal.summaryKu,
        costBillion: parsed.actionableProposal.costBillion,
        statChanges: parsed.actionableProposal.effects || parsed.actionableProposal.statChanges || {},
        status: 'pending_confirmation',
        reasoningKu: parsed.actionableProposal.reasoningKu
      };
    }

    return res.json({
      success: true,
      dialogue: parsed.dialogue,
      responses: parsed.dialogue,
      actionableProposal: normalizedProposal,
      trustUpdates: parsed.trustUpdates || [],
      newMemories: parsed.newMemories || [],
      meetingSummaryUpdateKu: parsed.meetingSummaryUpdateKu || null
    });
  } catch (err: any) {
    console.error('Council chat execution failed:', err);
    return res.status(500).json({
      success: false,
      error: 'GEMINI_CALL_FAILED',
      messageKu: `هەڵە لە پەیوەندی بە ژیریی دەستکرد (Gemini): ${err.message || 'وەڵام نەگەیشت'}. تکایە کلیل یان پەیوەندی تۆڕ بپشکنە و دووبارە هەوڵبدەرەوە.`
    });
  }
});

/**
 * Foreign Diplomacy Negotiation Endpoint
 */
app.post('/api/diplomacy/negotiate', async (req, res) => {
  try {
    const { countryId, treatyType, terms, gameState, customApiKey } = req.body;

    const country = gameState?.countries?.[countryId];
    const countryName = country?.nameKu || countryId;
    const leaderName = country?.leaderKu || 'سەرکردەی دەوڵەت';
    const relations = country?.relationsWithArven || 0;

    let activeAi = aiClient;
    if (!activeAi && customApiKey && typeof customApiKey === 'string' && customApiKey.trim().length > 10) {
      activeAi = new GoogleGenAI({
        apiKey: customApiKey.trim(),
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
    }

    if (activeAi) {
      try {
        const response = await activeAi.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Country: ${countryName}
Leader: ${leaderName}
Current Relations with Arven Republic: ${relations} (-100 to +100)
Proposed Treaty: ${treatyType}
Terms: ${JSON.stringify(terms || {})}

Write a diplomatic response in Kurdish Sorani (کوردیی سۆرانی) representing this foreign leader.
Determine if they accept, reject, or present a counter-proposal based on real interests.
Format JSON:
{
  "outcome": "accepted" | "rejected" | "counteroffer",
  "statementKu": "وتەی دیپلۆماسی سەرکردەی بیانی بە کوردیی سۆرانی",
  "counterTermsKu": "مەرجی جێگرەوە ئەگەر هەبێت",
  "relationChange": number
}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                outcome: { type: Type.STRING },
                statementKu: { type: Type.STRING },
                counterTermsKu: { type: Type.STRING },
                relationChange: { type: Type.NUMBER }
              },
              required: ['outcome', 'statementKu', 'relationChange']
            }
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        if (parsed.outcome && parsed.statementKu) {
          return res.json({ success: true, ...parsed });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini diplomacy call failed, falling back:', geminiErr?.message);
      }
    }

    // Deterministic fallback based on country relations
    let outcome = 'counteroffer';
    let statementKu = `بەڕێز سەرۆک کۆماری ئارڤێن، ئێمە دەستپێشخەرییەکەتان بەرز دەنرخێنین بەڵام پێویستمان بە گرەنتی زیاترە بۆ سەلامەتی بەرژەوەندییەکانمان.`;
    let relationChange = 4;

    if (relations > 30) {
      outcome = 'accepted';
      statementKu = `بە خۆشحاڵییەوە پەیماننامەکەتان قبوڵ دەکەین. ئەمە هەنگاوێکی مێژووییە بۆ بەهێزکردنی ئاشتی و گەشەی نێوان هەردوو دەوڵەت.`;
      relationChange = 12;
    } else if (relations < -20) {
      outcome = 'rejected';
      statementKu = `ئارڤێن لە پێگەیەکدا نییە مەرجی خۆی بسەپێنێت. داواکارییەکەتان لەم بارودۆخەی ئێستادا بێسوودە و رەتدەکرێتەوە.`;
      relationChange = -5;
    }

    return res.json({
      success: true,
      outcome,
      statementKu,
      counterTermsKu: outcome === 'counteroffer' ? 'داوای کەمکردنەوەی ٥٪ باجی گومرگی لە بەندەری لۆریان دەکەین.' : undefined,
      relationChange
    });
  } catch (err: any) {
    console.error('Diplomacy error:', err);
    return res.status(500).json({ success: false, error: 'DIPLOMACY_FAILED', messageKu: 'شکست لە پرۆسەی دیپلۆماسی.' });
  }
});

// Dev vs Prod Vite middleware configuration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`The Sovereign Table server running on http://0.0.0.0:${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
