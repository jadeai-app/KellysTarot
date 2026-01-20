
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
    { id: 21, title: "Level Up", traditionalName: "The World", suit: "Major", keywords: ["Completion", "Wholeness", "Travel"], meaning: "Cycle complete. You won the game. Take a victory lap, acknowledge how far you've come, and prepare to start the next level at zero again. The world is literally at your feet. Dance in the center of the universe and feel the closure.", isReversed: false },
    { id: 22, title: "The Love Bomb", traditionalName: "Ace of Cups", suit: "Cups", keywords: ["New Love", "Overflow", "Emotion"], meaning: "Open your heart valve because it's gonna get wet. This is a raw, unfiltered surge of emotional potential. New love, spiritual insights, or creative juices are overflowing. It feels intense because it is. Don't bring a thimble to a waterfall.", isReversed: false },
    { id: 23, title: "The Simp", traditionalName: "Two of Cups", suit: "Cups", keywords: ["Partnership", "Unity", "Attraction"], meaning: "Reciprocal energy at its finest. It's a meet-cute for your soul. Whether romantic or platonic, this connection is balanced and mutually filling. You're both obsessed with each other. It's disgusting. I love it.", isReversed: false },
    { id: 24, title: "The Pregame", traditionalName: "Three of Cups", suit: "Cups", keywords: ["Community", "Party", "Friendship"], meaning: "Pop the champagne. This is about your squad, your tribe, and the people who knew you before you had eyebrows. It's celebration, gossip, and pure communal joy. Hoes before bros, always.", isReversed: false },
    { id: 25, title: "Left on Read", traditionalName: "Four of Cups", suit: "Cups", keywords: ["Apathy", "Boredom", "FOMO"], meaning: "You're sitting in front of a feast acting like you're starving. The universe is offering you a cup and you're too busy staring at your navel to notice. It's emotional stagnation and missed opportunities due to a bad attitude. Check your spam folder.", isReversed: false },
    { id: 26, title: "Sad Girl Hour", traditionalName: "Five of Cups", suit: "Cups", keywords: ["Grief", "Loss", "Regret"], meaning: "There is spilled milk everywhere and you are sobbing over it. Yes, three cups are knocked over, but two are still standing right behind you. It's okay to grieve, but don't live in the wreckage forever. Play your sad playlist, then get up.", isReversed: false },
    { id: 27, title: "Throwback Thursday", traditionalName: "Six of Cups", suit: "Cups", keywords: ["Past", "Childhood", "Memories"], meaning: "You're scrolling through photos from 2016. It's sweet, innocent, and comforting, but remember: you can't live in a memory. Visit the past to retrieve a piece of your heart, then come back to the present. Don't text your ex.", isReversed: false },
    { id: 28, title: "Delusionville", traditionalName: "Seven of Cups", suit: "Cups", keywords: ["Choices", "Illusion", "Fantasy"], meaning: "You have too many tabs open in your brain. Everything looks shiny, but half of these options are smoke and mirrors. You need to pick a lane before you crash. Stop fantasizing about potential and start prioritizing reality.", isReversed: false },
    { id: 29, title: "The Irish Goodbye", traditionalName: "Eight of Cups", suit: "Cups", keywords: ["Leaving", "Walking Away", "Growth"], meaning: "It's fine, but it's not enough anymore. You're packing up your emotional baggage and walking into the unknown. It's scary to leave stability, but your soul is starving here. Don't look back.", isReversed: false },
    { id: 30, title: "The Humble Brag", traditionalName: "Nine of Cups", suit: "Cups", keywords: ["Wish", "Satisfaction", "Smug"], meaning: "You got what you wanted, and you look good with it. It is a card of indulgence, pleasure, and getting exactly what you asked for. Sit back, cross your arms, and enjoy the banquet. #Blessed.", isReversed: false },
    { id: 31, title: "Cottagecore Fantasy", traditionalName: "Ten of Cups", suit: "Cups", keywords: ["Happiness", "Family", "Bliss"], meaning: "Rainbows, picket fences, and emotional perfection. It's the 'happily ever after' scene. Your relationships are harmonious, your heart is full, and everything is aligning perfectly. It's almost too wholesome.", isReversed: false },
    { id: 32, title: "The Softboi", traditionalName: "Page of Cups", suit: "Cups", keywords: ["Message", "Crush", "Creative"], meaning: "A sweet, slightly immature emotional message is coming. It's a fish in a cup—unexpected and delightful. Trust your intuition and be open to vulnerability, even if it feels a little cringe.", isReversed: false },
    { id: 33, title: "Romeo with a Podcast", traditionalName: "Knight of Cups", suit: "Cups", keywords: ["Charmer", "Dreamer", "Proposal"], meaning: "He's sliding into your DMs with a poem. This energy is romantic, artistic, and leads with the heart. He loves the *idea* of love, but he might just be in love with the sound of his own voice. Verify the actions match the vibes.", isReversed: false },
    { id: 34, title: "The Trauma Dump", traditionalName: "Queen of Cups", suit: "Cups", keywords: ["Intuition", "Care", "Depth"], meaning: "She feels everything, and she's going to tell you about it. This is emotional intelligence at its peak, but boundaries are required. Listen to your heart, nurture your creative self, and don't let anyone gaslight your feelings.", isReversed: false },
    { id: 35, title: "Emotional Support Zaddy", traditionalName: "King of Cups", suit: "Cups", keywords: ["Balance", "Diplomacy", "Control"], meaning: "He has mastered the ocean of emotion. He is calm in a crisis and offers safe harbor. This is about emotional maturity—feeling deeply but acting wisely. Be the rock, not the wave.", isReversed: false },
    { id: 36, title: "The Hot Take", traditionalName: "Ace of Swords", suit: "Swords", keywords: ["Clarity", "Truth", "Breakthrough"], meaning: "A breakthrough idea that cuts through the BS like a laser. The truth might hurt, but it will set you free. Grab the sword of intellect and sever the confusion. Post it.", isReversed: false },
    { id: 37, title: "Denial is a River", traditionalName: "Two of Swords", suit: "Swords", keywords: ["Indecision", "Block", "Denial"], meaning: "You know the answer, you just don't like it. Indecision is a decision in itself. You are blocking your own heart to protect yourself. Take the blindfold off and face the music.", isReversed: false },
    { id: 38, title: "Emotional Damage", traditionalName: "Three of Swords", suit: "Swords", keywords: ["Pain", "Betrayal", "Sorrow"], meaning: "Literally three swords in a heart. It sucks. Someone hurt you, or you hurt yourself. Feel the pain, cry it out, but don't leave the swords in there. Pull them out so the wound can heal.", isReversed: false },
    { id: 39, title: "Burnout Recovery", traditionalName: "Four of Swords", suit: "Swords", keywords: ["Rest", "Recovery", "Pause"], meaning: "You are mentally fried. Lay down, put your phone on airplane mode, and do absolutely nothing. This isn't laziness; it's necessary maintenance. If you don't rest now, your body will force you to later.", isReversed: false },
    { id: 40, title: "Toxic Victory", traditionalName: "Five of Swords", suit: "Swords", keywords: ["Conflict", "Ego", "Winning"], meaning: "You won the argument, but everyone hates you now. Was it worth it? This is a hollow victory fueled by ego. Sometimes being right is less important than being kind. Check your pride.", isReversed: false },
    { id: 41, title: "Baggage Claim", traditionalName: "Six of Swords", suit: "Swords", keywords: ["Transition", "Moving On", "Relief"], meaning: "You're getting into the boat and leaving the choppy waters behind. You're taking your baggage with you, but you're heading toward peace. It's a somber transition, but a necessary one.", isReversed: false },
    { id: 42, title: "The Finesse", traditionalName: "Seven of Swords", suit: "Swords", keywords: ["Deception", "Strategy", "Sneaky"], meaning: "Someone is being shady, and it might be you. This is the card of getting away with something, or trying to. Are you being strategic, or are you just lying? Check your pockets and your integrity.", isReversed: false },
    { id: 43, title: "The Self-Own", traditionalName: "Eight of Swords", suit: "Swords", keywords: ["Trapped", "Victim", "Fear"], meaning: "You are tied up and surrounded by swords, but if you wiggle a little, the ropes fall off. The prison is in your mind. You are playing the victim in a situation you have the power to leave. Stop it.", isReversed: false },
    { id: 44, title: "The Doomscroll", traditionalName: "Nine of Swords", suit: "Swords", keywords: ["Anxiety", "Nightmare", "Guilt"], meaning: "The monsters are mostly in your head, feeding on your 3 AM panic. You're looping worst-case scenarios that haven't happened yet. Get out of your head and touch some grass.", isReversed: false },
    { id: 45, title: "Rock Bottom", traditionalName: "Ten of Swords", suit: "Swords", keywords: ["Betrayal", "End", "Melodrama"], meaning: "You have ten swords in your back. You are dead. The good news? You can't get any dead-er. The worst is over. There is nowhere to go but up from here. Dust yourself off, drama queen.", isReversed: false },
    { id: 46, title: "The Stalker Account", traditionalName: "Page of Swords", suit: "Swords", keywords: ["Curiosity", "Gossip", "Truth"], meaning: "You're digging for info, asking questions, and lurking on a profile you shouldn't be. It's intellectual curiosity with a side of immaturity. Use the info wisely, and don't like a photo from 2018.", isReversed: false },
    { id: 47, title: "Keyboard Warrior", traditionalName: "Knight of Swords", suit: "Swords", keywords: ["Hasty", "Direct", "Aggressive"], meaning: "He's charging in with the truth and zero tact. Fast talk, fast action, and potential for collateral damage. Make sure your brain is engaged before your mouth (or fingers) starts moving.", isReversed: false },
    { id: 48, title: "The B*tch (Complimentary)", traditionalName: "Queen of Swords", suit: "Swords", keywords: ["Direct", "Perceptive", "Independent"], meaning: "She cuts through the BS with a smile. She is unbiased, intellectual, and takes no prisoners. Use your head, speak your truth clearly, and don't apologize for being smart.", isReversed: false },
    { id: 49, title: "Mansplaining (Expert)", traditionalName: "King of Swords", suit: "Swords", keywords: ["Authority", "Truth", "Logic"], meaning: "Head over heart, always. He judges based on facts, not feelings. If you need to make a decision, strip away the emotion and look at the data. Be fair, be cold, be right.", isReversed: false },
    { id: 50, title: "The D*ck Pic", traditionalName: "Ace of Wands", suit: "Wands", keywords: ["Passion", "Spark", "Creation"], meaning: "A burst of creative adrenaline and pure fire. It is phallic, energetic, and demands attention. This is the 'aha!' moment or the sudden urge to create. Do something with it before it burns out.", isReversed: false },
    { id: 51, title: "World Domination (Pending)", traditionalName: "Two of Wands", suit: "Wands", keywords: ["Future", "Decisions", "Discovery"], meaning: "You've got the world in your hands, but you're still standing in the castle. Are you going to stay safe, or go explore? It's time to make a decision about your next big move. The map is not the territory.", isReversed: false },
    { id: 52, title: "Waiting on the Plug", traditionalName: "Three of Wands", suit: "Wands", keywords: ["Expansion", "Foresight", "Waiting"], meaning: "Your ships are coming in. You've done the work, sent the emails, and now you're waiting for the results. Think big, expand your horizons, and prepare for your empire to grow.", isReversed: false },
    { id: 53, title: "The Pinterest Board", traditionalName: "Four of Wands", suit: "Wands", keywords: ["Community", "Home", "Celebration"], meaning: "Stability and celebration. You've reached a milestone and it's time to throw a party. It's a happy home, a successful launch, or a wedding. Enjoy the harmony.", isReversed: false },
    { id: 54, title: "The Comment Section", traditionalName: "Five of Wands", suit: "Wands", keywords: ["Conflict", "Competition", "Hassle"], meaning: "Everyone is yelling and nobody is listening. It's chaotic, competitive energy. It's not a war, it's just a hassle. Pick your battles, or better yet, don't engage in the drama at all.", isReversed: false },
    { id: 55, title: "The Clout", traditionalName: "Six of Wands", suit: "Wands", keywords: ["Victory", "Recognition", "Success"], meaning: "You're riding high on a horse and everyone is cheering. You won. Take the compliment, accept the award, and let your ego have a little snack. You earned the spotlight.", isReversed: false },
    { id: 56, title: "The Clapback", traditionalName: "Seven of Wands", suit: "Wands", keywords: ["Defense", "Challenge", "Stand"], meaning: "You're on top of the hill, but everyone wants to knock you down. Stand your ground. You have the high ground for a reason. Don't let the haters intimidate you.", isReversed: false },
    { id: 57, title: "The DM Slide", traditionalName: "Eight of Wands", suit: "Wands", keywords: ["Speed", "Action", "News"], meaning: "Things are moving fast. Like, really fast. Incoming texts, news, and travel. Don't blink. The arrows are in the air and they are going to land all at once. Go with the flow.", isReversed: false },
    { id: 58, title: "Running on Spite", traditionalName: "Nine of Wands", suit: "Wands", keywords: ["Resilience", "Grit", "Exhaustion"], meaning: "You're bandaged, tired, and paranoid, but you're still standing. You are so close to the end. Don't give up now. Guard your boundaries one last time and then you can rest.", isReversed: false },
    { id: 59, title: "The Burnout", traditionalName: "Ten of Wands", suit: "Wands", keywords: ["Burden", "Stress", "Overload"], meaning: "Carrying the whole world on your back? You're almost at the finish line, but your knees are buckling. You said 'yes' to too many things. Put some of the sticks down or delegate.", isReversed: false },
    { id: 60, title: "The Hype Man", traditionalName: "Page of Wands", suit: "Wands", keywords: ["Enthusiasm", "Discovery", "Free Spirit"], meaning: "New creative news is coming. It's an energetic, enthusiastic messenger who wants to try everything. Say yes to the adventure, even if you don't have a plan.", isReversed: false },
    { id: 61, title: "The F*ckboy", traditionalName: "Knight of Wands", suit: "Wands", keywords: ["Passion", "Impulsive", "Adventure"], meaning: "He's here for a good time, not a long time. High energy, super sexy, and very easily distracted. Enjoy the ride, but don't expect him to help you move furniture.", isReversed: false },
    { id: 62, title: "The Influencer", traditionalName: "Queen of Wands", suit: "Wands", keywords: ["Confidence", "Charisma", "Social"], meaning: "She walks into the room and everyone looks. She is confident, radiant, and knows her worth. Channel your inner lioness. Be bold, be loud, and be seen.", isReversed: false },
    { id: 63, title: "The Cult Leader", traditionalName: "King of Wands", suit: "Wands", keywords: ["Leader", "Vision", "Charisma"], meaning: "He doesn't just have an idea; he builds the company. This is big picture leadership energy. Inspire others to follow your lead. You have the charisma to pull this off.", isReversed: false },
    { id: 64, title: "The Bag", traditionalName: "Ace of Pentacles", suit: "Pentacles", keywords: ["Money", "Offer", "Asset"], meaning: "A tangible new opportunity is dropping in your lap. This isn't a dream; it's a seed you can plant. Secure the asset. This is the foundation of future wealth.", isReversed: false },
    { id: 65, title: "Gig Economy", traditionalName: "Two of Pentacles", suit: "Pentacles", keywords: ["Balance", "Juggling", "Adaptable"], meaning: "You're juggling bills, work, and a social life. You're making it work, but don't drop the ball. Stay flexible and go with the flow of resources. Balance is an active verb, not a state of being.", isReversed: false },
    { id: 66, title: "Group Project Trauma", traditionalName: "Three of Pentacles", suit: "Pentacles", keywords: ["Teamwork", "Skill", "Mastery"], meaning: "Don't do it alone. Find the people who are good at the things you suck at. Collaboration builds the cathedral. Get feedback and respect the craftsmanship.", isReversed: false },
    { id: 67, title: "Scarcity Mindset", traditionalName: "Four of Pentacles", suit: "Pentacles", keywords: ["Hoarding", "Control", "Scarcity"], meaning: "You're holding onto your money (or feelings) so tight you're strangling them. Security is good, but stagnation is bad. You have the power to spend energy to make energy. Let go a little.", isReversed: false },
    { id: 68, title: "The Broke Era", traditionalName: "Five of Pentacles", suit: "Pentacles", keywords: ["Loss", "Poverty", "Isolation"], meaning: "Feeling left out in the cold. You feel spiritually or financially bankrupt. But look up—there is usually a lit window nearby. Help is available if you swallow your pride and ask.", isReversed: false },
    { id: 69, title: "The Sugar Daddy", traditionalName: "Six of Pentacles", suit: "Pentacles", keywords: ["Generosity", "Charity", "Sharing"], meaning: "Money is flowing. Are you the one giving or receiving? Either way, keep the flow moving. Generosity creates abundance. Just make sure the scales stay balanced.", isReversed: false },
    { id: 70, title: "Passive Income?", traditionalName: "Seven of Pentacles", suit: "Pentacles", keywords: ["Patience", "Investment", "Harvest"], meaning: "You planted the seeds, now you're watching the dirt. It's boring, but it's working. Don't dig them up to see if they're growing. Trust the timing of your investment.", isReversed: false },
    { id: 71, title: "The 9 to 5", traditionalName: "Eight of Pentacles", suit: "Pentacles", keywords: ["Work", "Detail", "Craft"], meaning: "Head down, headphones on, getting sh*t done. This is about mastering your craft through repetition. It's not glamorous, but it pays off. Keep hammering away.", isReversed: false },
    { id: 72, title: "The Trust Fund", traditionalName: "Nine of Pentacles", suit: "Pentacles", keywords: ["Luxury", "Independence", "Self-Made"], meaning: "You are self-sufficient, wealthy, and admiring your garden. You don't need anyone else to pay your bills. Enjoy the fruits of your labor in your silk robe. You made this.", isReversed: false },
    { id: 73, title: "Generational Wealth", traditionalName: "Ten of Pentacles", suit: "Pentacles", keywords: ["Legacy", "Wealth", "Family"], meaning: "This isn't just rent money; this is inheritance money. It's long-term stability and legacy. You are building something that will outlast you. Family and finance are intertwined.", isReversed: false },
    { id: 74, title: "The Intern", traditionalName: "Page of Pentacles", suit: "Pentacles", keywords: ["Studious", "New Job", "Practical"], meaning: "A small but solid offer is here. It's time to learn a new skill or start a new job. Be reliable, take notes, and show up on time. The ambition is grounded.", isReversed: false },
    { id: 75, title: "Slow Money", traditionalName: "Knight of Pentacles", suit: "Pentacles", keywords: ["Routine", "Reliable", "Slow"], meaning: "He's not fast, but he never stops. He is methodical, reliable, and boringly effective. Progress might feel slow, but it is unstoppable. Trust the routine.", isReversed: false },
    { id: 76, title: "Trad Wife Aesthetic", traditionalName: "Queen of Pentacles", suit: "Pentacles", keywords: ["Nurturing", "Practical", "Comfort"], meaning: "She works hard and keeps a cozy home. She knows the value of a dollar and a good meal. Nurture your resources and take care of your body. Practical magic.", isReversed: false },
    { id: 77, title: "The CEO", traditionalName: "King of Pentacles", suit: "Pentacles", keywords: ["Wealth", "Business", "Success"], meaning: "He has the Midas touch. He sits on a throne of solid assets. This is peak financial success and business acumen. Make the deal, secure the bag, and enjoy the empire.", isReversed: false },
  ];

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

  async getAIInterpretation(cards: TarotCard[], question: string, spread: SpreadType): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const getPositionLabel = (i: number) => {
        if (spread === 'single') return 'The Guidance';
        if (spread === 'three') {
           const labels = ['The Foundation (Roots/Past)', 'The Challenge (Current Friction)', 'The Outcome (Future Potential)'];
           return labels[i] || `Position ${i+1}`;
        }
        return `Position ${i+1}`;
      };

      const cardList = cards.map((c, i) => 
        `${getPositionLabel(i)}: ${c.title} (${c.traditionalName}) - ${c.isReversed ? 'Reversed (Internal/Blocked Energy)' : 'Upright'}. Core Meaning: ${c.meaning}`
      ).join('\n');

      let synthesisInstruction = "Analyze the narrative arc between the cards. How do they interact? Don't just list meanings—weave a story.";
      
      if (spread === 'three') {
        synthesisInstruction = "CRITICAL: This is a Trinity Spread (Past/Present/Future flow). Synthesize the cards into a story: How does the Foundation *cause* the Challenge? How does overcoming the Challenge *unlock* the Outcome? Connect the dots explicitly.";
      }

      const systemPrompt = `Act as a mystical, highly intuitive, and slightly edgy tarot reader for a modern audience.
      
      Query Context: "${question || 'General Life Check-in'}"
      Spread Type: ${spread.toUpperCase()}
      
      Cards Drawn:
      ${cardList}
      
      Your Goal: Provide a profound, "vibe-based" reading. Don't be generic. Be specific, piercing, and empowering.
      
      Format (Markdown):
      ## ✧ The Vibe Check
      (A 2-sentence summary of the overall energy).

      ## ✧ The Deep Dive
      (${synthesisInstruction})

      ## ✧ The Divine Assignment
      (Two bullet points: Real, actionable advice).

      Keep tone: Mystical but grounded, empathetic but firm. Max 350 words.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
      });

      return response.text;

    } catch (error) {
      console.error("AI Error:", error);
      return "The cosmic frequency is static (API Error). Try again.";
    }
  }
}
