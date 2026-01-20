
import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarotService, TarotCard, SpreadType } from './services/tarot.service';
import { CardComponent } from './components/card.component';
import { MarkdownPipe } from './pipes/markdown.pipe';

type AppState = 'home' | 'question' | 'shuffle' | 'select' | 'reading' | 'explore';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, MarkdownPipe],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private tarotService = inject(TarotService);

  currentState = signal<AppState>('home');
  selectedSpread = signal<SpreadType>('single');
  question = signal<string>('');
  deck = signal<TarotCard[]>([]);
  selectedCards = signal<TarotCard[]>([]);
  revealedCards = signal<Set<number>>(new Set());
  
  searchQuery = signal<string>('');
  activeFilter = signal<string>('All');
  filters = ['All', 'Major', 'Wands', 'Cups', 'Swords', 'Pentacles'];

  viewingCard = signal<TarotCard | null>(null);
  isZoomed = signal<boolean>(false);

  aiInterpretation = signal<string>('');
  displayedInterpretation = signal<string>('');
  isLoadingAI = signal<boolean>(false);
  isReadingComplete = signal<boolean>(false);
  
  isShuffling = signal<boolean>(false); 
  shuffleProgress = signal<number>(0);
  shakeIntensity = signal<number>(0); 
  isGridReshuffling = signal<boolean>(false);
  shuffleParticles = signal<{id: number, angle: number, distance: number, rotation: number}[]>([]);

  maxCards = computed(() => this.selectedSpread() === 'single' ? 1 : 3);
  cardsRemaining = computed(() => this.maxCards() - this.selectedCards().length);

  constructor() {
    this.deck.set(this.tarotService.getDeck());
  }

  private vibrate(pattern: number | number[] = 10) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  selectSpread(type: SpreadType) {
    this.vibrate(15);
    this.selectedSpread.set(type);
    setTimeout(() => this.currentState.set('question'), 100);
  }

  exploreCards() {
    this.vibrate(10);
    this.currentState.set('explore');
  }

  goBack() {
    this.vibrate(10);
    this.currentState.set('home');
  }

  startShuffle() {
    this.vibrate(20);
    this.currentState.set('shuffle');
    this.shuffleProgress.set(0);
  }

  interactShuffle() {
    if (this.shuffleProgress() >= 100) return;
    this.vibrate(8);
    this.isShuffling.set(true);
    this.shuffleProgress.update(p => Math.min(100, p + 15));
    setTimeout(() => this.isShuffling.set(false), 200);

    if (this.shuffleProgress() >= 100) {
      this.vibrate([10, 30, 10]);
      setTimeout(() => {
        this.deck.set(this.tarotService.shuffle(this.tarotService.getDeck()));
        this.currentState.set('select');
      }, 600);
    }
  }

  onCardSelect(card: TarotCard) {
    if (this.cardsRemaining() > 0 && !this.selectedCards().includes(card)) {
      this.vibrate(15);
      this.selectedCards.update(cards => [...cards, card]);
      if (this.cardsRemaining() === 0) {
        setTimeout(() => this.revealReading(), 800);
      }
    }
  }

  async revealReading() {
    this.currentState.set('reading');
    this.isLoadingAI.set(true);

    const cards = this.selectedCards();
    
    // Reveal and Generate Images
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      this.vibrate(20);
      
      this.revealedCards.update(set => {
        const newSet = new Set(set);
        newSet.add(card.id);
        return newSet;
      });

      // Async image generation - trigger immediately
      this.tarotService.generateCardImage(card).then(url => {
        this.selectedCards.update(currentCards => 
          currentCards.map(c => c.id === card.id ? { ...c, imageUrl: url } : c)
        );
      });

      await new Promise(r => setTimeout(r, 600));
    }

    const result = await this.tarotService.getAIInterpretation(
      this.selectedCards(), 
      this.question(), 
      this.selectedSpread()
    );
    
    this.aiInterpretation.set(result);
    this.isLoadingAI.set(false);
    this.typewriterEffect(result);
  }

  typewriterEffect(text: string) {
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        this.displayedInterpretation.set(text.slice(0, i + 3));
        i += 3;
      } else {
        clearInterval(interval);
        this.isReadingComplete.set(true);
      }
    }, 10);
  }

  reset() {
    this.vibrate(10);
    this.question.set('');
    this.selectedCards.set([]);
    this.revealedCards.set(new Set());
    this.aiInterpretation.set('');
    this.displayedInterpretation.set('');
    this.currentState.set('home');
  }

  getPositionName(index: number): string {
    if (this.selectedSpread() === 'single') return 'Current Vibe';
    const names = ['The Foundation', 'The Challenge', 'The Outcome'];
    return names[index] || `Card ${index + 1}`;
  }
}
