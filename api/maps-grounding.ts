import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
});

export interface GroundedMapPlace {
  title: string;
  uri: string;
  snippet?: string;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    zoneName = 'المعادي، القاهرة',
    lat = 29.9602,
    lng = 31.2569,
    orderVolume = 28,
    activeDrivers = 1,
    neededDrivers = 4,
    customQuery = '',
  } = req.body || {};

  const latitude = typeof lat === 'number' && !Number.isNaN(lat) ? lat : 30.0444;
  const longitude = typeof lng === 'number' && !Number.isNaN(lng) ? lng : 31.2357;

  const prompt = customQuery
    ? `أنت مستشار تشغيل أسطول توصيل أزياء سريعة في القاهرة لمنصة VOGUE FAST. منطقة التركيز الحالية: ${zoneName} (الإحداثيات: ${latitude}, ${longitude}). سؤال المدير: ${customQuery}. استخدم بيانات خرائط جوجل الفعلية لاقتراح معالم حقيقية وشوارع تجارية ومواقف انتظار مناسبة للدراجات النارية والطيارين في هذه المنطقة.`
    : `أنت مستشار تشغيل وتوسع أسطول توصيل أزياء سريعة (VOGUE FAST) في القاهرة.
نحن نحلل منطقة "${zoneName}" في القاهرة (حجم الطلبات الحالي: ${orderVolume} طلب، عدد الطيارين النشطين: ${activeDrivers}، العجز المطلوب توظيفه فوراً: +${neededDrivers} طيارين).
باستخدام خرائط جوجل (Google Maps Grounding) حول الإحداثيات (${latitude}, ${longitude}):
1. حدد أهم 3 إلى 4 شوارع تجارية أو مولات أو مناطق تسوق أزياء وبراندات ملابس تشهد أعلى كثافة طلبات في "${zoneName}".
2. اقترح أفضل نقاط التمركز والانتظار (Staging & Parking Hubs) لكباتن الدراجات النارية والاسكوتر بالقرب من هذه الشوارع لتقليل زمن الاستلام لأقل من 8 دقائق.
3. قدم نصيحة تشغيلية سريعة لمدير الأسطول حول كيفية استقطاب وتعيين طيارين جدد في منطقة "${zoneName}".
اكتب الإجابة باللغة العربية بشكل منظم ومختصر وعملي.`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY_NOT_SET');
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude,
            },
          },
        },
      },
    });

    const text = response.text || '';
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundedPlaces: GroundedMapPlace[] = [];
    const seenUris = new Set<string>();

    for (const chunk of rawChunks as any[]) {
      if (chunk?.maps?.uri) {
        const uri = String(chunk.maps.uri);
        if (!seenUris.has(uri)) {
          seenUris.add(uri);
          const reviewSnippets = chunk.maps?.placeAnswerSources?.reviewSnippets;
          const firstSnippet =
            Array.isArray(reviewSnippets) && reviewSnippets.length > 0
              ? String(reviewSnippets[0]?.text || reviewSnippets[0]?.reviewText || '')
              : undefined;
          groundedPlaces.push({
            title: String(chunk.maps.title || zoneName),
            uri,
            snippet: firstSnippet,
          });
        }
      }
    }

    // Ensure at least a direct Google Maps search link for the zone is included alongside grounded chunks
    if (groundedPlaces.length === 0) {
      groundedPlaces.push({
        title: `خريطة ${zoneName} - المراكز التجارية ومناطق التمركز`,
        uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(zoneName + ' القاهرة')}`,
      });
    }

    return res.status(200).json({
      zoneName,
      coordinates: { lat: latitude, lng: longitude },
      analysis: text,
      places: groundedPlaces,
      model: 'gemini-3.8-flash',
      grounded: true,
    });
  } catch (error: any) {
    const fallbackPlaces: GroundedMapPlace[] = [
      {
        title: `استكشاف المراكز التجارية في ${zoneName} عبر Google Maps`,
        uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('محلات ملابس ومولات في ' + zoneName)}`,
      },
      {
        title: `نقاط تمركز الدراجات والشوارع الرئيسية - ${zoneName}`,
        uri: `https://www.google.com/maps/@${latitude},${longitude},15z`,
      },
    ];

    const fallbackText = `تحليل الكثافة والتمركز الميداني لمنطقة **${zoneName}**:
- **مؤشر الطلب مقابل التغطية**: تسجل المنطقة **${orderVolume} طلب** مقابل **${activeDrivers} طيار نشط**، مما يستدعي استقطاب وتوظيف **+${neededDrivers} طيارين** فوراً لتغطية ذروة الطلبات المسائية.
- **نقاط التمركز المقترحة (Staging Hubs)**: يُنصح بتوجيه الطيارين للتمركز قرب الشوارع التجارية الرئيسية ومحاور الخروج السريعة في ${zoneName} لضمان استلام الطلبات من البراندات خلال 6–8 دقائق.
- **توصية التوظيف**: تفعيل مكافأة التواجد في منطقة الذروة (+15 ج.م لكل توصيلة خلال ساعات الذروة) لجذب الكباتن من المناطق المجاورة.`;

    return res.status(200).json({
      zoneName,
      coordinates: { lat: latitude, lng: longitude },
      analysis: fallbackText,
      places: fallbackPlaces,
      model: 'gemini-3.8-flash',
      grounded: false,
      notice:
        error?.message === 'GEMINI_API_KEY_NOT_SET'
          ? 'يمكنك إضافة مفتاح GEMINI_API_KEY في الإعدادات لتفعيل الاستعلام اللحظي المباشر من Gemini Maps Grounding.'
          : undefined,
    });
  }
}
