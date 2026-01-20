import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

export interface TarotCard {
  id: number;
  title: string;
  traditionalName: string;
  suit: 'Major' | 'Cups' | 'Swords' | 'Wands' | 'Pentacles';
  keywords: string[];
  meaning: string;
  isReversed: boolean;
  imageUrl?: string;
}

export type SpreadType = 'single' | 'three' | 'celtic';

declare var process: {
  env: {
    API_KEY: string
  }
};

@Injectable({
  providedIn: 'root'
})
export class TarotService {
  private deck: TarotCard[] = [
    { id: 0, title: "The Yolo", traditionalName: "The Fool", suit: "Major", keywords: ["Leap", "Chaos", "Zero Fucks"], meaning: "You are standing on the precipice of something stupidly magnificent, clutching a backpack full of dreams and absolutely zero plans. This is the energy of jumping before you look, texting them back immediately, and buying the plane ticket on a credit card you haven't paid off. The universe is handing you a blank check—don't ruin it by trying to be responsible.", isReversed: false },
    { id: 1, title: "God Mode", traditionalName: "The Magician", suit: "Major", keywords: ["Manifesting", "Skill", "Cheat Codes"], meaning: "You have enabled the developer console for your life. This isn't just luck; it's skill, audacity, and a little bit of delusion. You have all the tools to manipulate reality on the table. Stop asking for permission and just execute the code. You are the main character right now.", isReversed: false },
    { id: 2, title: "The Receipts", traditionalName: "The High Priestess", suit: "Major", keywords: ["Intuition", "Secrets", "Screenshots"], meaning: "She knows everything. She has the screenshots, the timestamps, and the intuition of a federal investigator. Stop looking for answers in the external world or your ex's likes. The call is coming from inside the house. Trust your gut; it’s the only thing not lying to you.", isReversed: false },
    { id: 3, title: "Mother (Complimentary)", traditionalName: "The Empress", suit: "Major", keywords: ["Creation", "Fertility", "Serving"], meaning: "You are serving looks, life, and abundance. This is peak creative energy wrapped in a silk robe. Whether you're birthing a business, an art project, or literally a human, you are glowing. Eat the cake, buy the expensive moisturizer, and sit on the velvet couch. Nature is your CEO right now.", isReversed: false },
    { id: 4, title: "The Zaddy", traditionalName: "The Emperor", suit: "Major", keywords: ["Structure", "Control", "Daddy Issues"], meaning: "It is time to build the empire and stop playing in the sandbox. This energy is rigid, structured, and unapologetically in charge. You need boundaries, not suggestions. Stand up straight, fix your posture, and take command of the situation before someone less competent does it for you.", isReversed: false },
    { id: 5, title: "The Gatekeeper", traditionalName: "The Hierophant", suit: "Major", keywords: ["Tradition", "Systems", "Bureaucracy"], meaning: "Sometimes you have to follow the rules, even if they were written by people who still pay for cable. This card represents institutions, mentors, and the 'tried and true' path. Respect the process, even if it feels outdated. Learn the rules so you can break them effectively later.", isReversed: false },
    { id: 6, title: "The Trauma Bond", traditionalName: "The Lovers", suit: "Major", keywords: ["Union", "Choice", "Mirroring"], meaning: "It’s not just about romance; it's a mirror reflecting your core values back at you. Every relationship is a vote for the person you want to become. The chemistry is undeniable, but make sure you aren't just falling in love with your own reflection or projecting your issues onto a pretty face.", isReversed: false },
    { id: 7, title: "Full Send", traditionalName: "The Chariot", suit: "Major", keywords: ["Willpower", "Victory", "Momentum"], meaning: "No brakes, all gas. Get in the car, we're going to win. This is about controlling the chaos through sheer force of will. You have opposing forces pulling you in different directions (like your brain and your loins), and your job is to harness them both to drive forward. Focus or crash.", isReversed: false },
    { id: 8, title: "The Bad B*tch", traditionalName: "Strength", suit: "Major", keywords: ["Courage", "Patience", "Soft Power"], meaning: "True strength isn't about how loud you can scream; it's about how gently you can hold your own demons without flinching. You are taming the lion not with a whip, but with confidence and compassion. It’s the velvet glove over the iron fist.", isReversed: false },
    { id: 9, title: "Do Not Disturb", traditionalName: "The Hermit", suit: "Major", keywords: ["Solitude", "Introspection", "Offline"], meaning: "It is time to withdraw and upgrade your operating system. The answers are not in your DMs. Go into the cave. Light your own lantern. Get comfortable with the sound of your own heartbeat. Turn your phone off; if it's important, they'll leave a voicemail (which you won't check).", isReversed: false },
    { id: 10, title: "The Algorithm", traditionalName: "Wheel of Fortune", suit: "Major", keywords: ["Karma", "Luck", "RNG"], meaning: "The universe is spinning the block. One minute you're viral, the next you're shadowbanned. Whatever is happening right now is temporary. Get ready for a pivot because fate is shuffling the deck and you are not the dealer. Try not to get dizzy.", isReversed: false },
    { id: 11, title: "F*ck Around & Find Out", traditionalName: "Justice", suit: "Major", keywords: ["Truth", "Consequence", "Balance"], meaning: "Cause meets effect. The scales are balancing, and the bill is finally due. If you've been moving with integrity, you're good. If you've been shady, well... good luck. This is objective truth. The audit is here.", isReversed: false },
    { id: 12, title: "The Kink", traditionalName: "The Hanged Man", suit: "Major", keywords: ["Surrender", "Wait", "Perspective"], meaning: "Stop pushing against a door that says 'pull'. The only way to win this game right now is to stop playing by the old rules. Hang tight, change your angle, and let the blood rush to your head for a new perspective. Embrace the pause, you masochist.", isReversed: false },
    { id: 13, title: "Ego Death", traditionalName: "Death", suit: "Major", keywords: ["Ending", "Transition", "Rebirth"], meaning: "Relax, you aren't literally dying. But the version of you that accepted mediocrity? She's cooked. This is the funeral of who you used to be. The caterpillar has to dissolve to become the butterfly. Clear the cache so you can install the update.", isReversed: false },
    { id: 14, title: "The Chill Pill", traditionalName: "Temperance", suit: "Major", keywords: ["Balance", "Patience", "Alchemy"], meaning: "Don't force the reaction. Blend the extremes until the chemistry is just right. It's about moderation and finding the goldilocks zone. You can't rush alchemy. Peace often feels like boredom to a nervous system addicted to drama.", isReversed: false },
    { id: 15, title: "The Toxic Ex", traditionalName: "The Devil", suit: "Major", keywords: ["Addiction", "Obsession", "Chains"], meaning: "You know exactly what this is. It's the chains you forged yourself because they felt like jewelry at the time. You are voluntarily staying in a cage where the door is wide open because the devil you know feels safer than the freedom you don't. Wake up.", isReversed: false },
    { id: 16, title: "The Dumpster Fire", traditionalName: "The Tower", suit: "Major", keywords: ["Crash", "Disaster", "Awakening"], meaning: "The foundation was rot and the structure was unsafe, so the universe threw a lightning bolt at it. Let it burn. It feels like a disaster, but it's a liberation from a prison you didn't know you were in. Don't try to rebuild the same shaky tower.", isReversed: false },
    { id: 17, title: "The Thirst Trap", traditionalName: "The Star", suit: "Major", keywords: ["Hope", "Healing", "Renewal"], meaning: "The storm is over, and you are looking absolutely radiant. You're naked, vulnerable, and glowing with renewed purpose. This is the calm after the destruction. You are the main character again, but this time with a skincare routine and a better attitude.", isReversed: false },
    { id: 18, title: "The Gaslight", traditionalName: "The Moon", suit: "Major", keywords: ["Illusion", "Anxiety", "Dreams"], meaning: "Trust your intuition, not your eyes, because the lighting is tricky right now. Things are shadowy and shapes are shifting. You might be projecting your fears onto reality. Don't be afraid of the wild things, just don't follow them into the woods without a flashlight.", isReversed: false },
    { id: 19, title: "Big D*ck Energy", traditionalName: "The Sun", suit: "Major", keywords: ["Joy", "Success", "Vitality"], meaning: "It's all good. The lights are green, the music is loud, and you are vibrating at a frequency that annoys sad people. This is pure, unadulterated joy. Everything you touch turns to gold right now. Soak it up.", isReversed: false },
    { id: 20, title: "The Group Chat Leak", traditionalName: "Judgement", suit: "Major", keywords: ["Rebirth", "Absolution", "Wake Up"], meaning: "Everything is coming to light. The trumpet is sounding. This is your final performance review. Forgive yourself, shed the old skin, and answer the call to a higher vibration. Are you going to ascend, or keep playing small?", isReversed: false },
    { id: 21, title: "Level Up", traditionalName: "The World", suit: "Major", keywords: ["Completion", "Wholeness", "Travel"], meaning: "Cycle complete. You won the game. Take a victory lap, acknowledge how far you've come, and prepare to start the next level at zero again. The world is literally at your feet. Dance in the center of the universe and feel the closure.", isReversed: false }
  ];

  private ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  constructor() {}

  getDeck(): TarotCard[] {
    return [...this.deck];
  }

  shuffle(deck: TarotCard[]): TarotCard[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.map(card => ({
      ...card,
      isReversed: Math.random() < 0.3
    }));
  }

  async generateCardImage(card: TarotCard): Promise<string> {
    try {
      const prompt = `A mystical and divine tarot card illustration of "${card.traditionalName}". Highly detailed occult symbolism, gold filigree borders, ethereal glowing cosmic energy background. Intricate line art, professional oracle deck aesthetic, 4k, surreal spiritual art. Keywords: ${card.keywords.join(', ')}.`;
      
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4',
        },
      });

      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
      console.error("Image generation failed:", error);
      // Fallback seed-based image
      return `https://picsum.photos/seed/tarot-${card.id}/600/900`;
    }
  }

  async getAIInterpretation(cards: TarotCard[], question: string, spread: SpreadType): Promise<string> {
    try {
      const getPositionLabel = (i: number) => {
        if (spread === 'single') return 'The Energy';
        if (spread === 'three') {
           const labels = ['The Roots (Past)', 'The Current (Present)', 'The Potential (Future)'];
           return labels[i] || `Position ${i+1}`;
        }
        return `Position ${i+1}`;
      };

      const cardList = cards.map((c, i) => 
        `${getPositionLabel(i)}: ${c.title} (${c.traditionalName}) - ${c.isReversed ? 'Reversed' : 'Upright'}. Meaning: ${c.meaning}`
      ).join('\n');

      const systemInstruction = `You are a mystical, deep, and slightly witty tarot reader. Provide a reading for: "${question || 'A general guidance check'}". Spread: ${spread.toUpperCase()}. Use Markdown headers and emojis.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Cards drawn:\n${cardList}\n\nProvide a reading.`,
        config: {
          systemInstruction: systemInstruction
        }
      });

      return response.text;
    } catch (error) {
      console.error("AI Error:", error);
      return "The mystical connection is weak. Please try again.";
    }
  }
}