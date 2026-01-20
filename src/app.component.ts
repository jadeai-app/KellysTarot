
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

  // State Signals
  currentState = signal<AppState>('home');
  selectedSpread = signal<SpreadType>('single');
  question = signal<string>('');
  deck = signal<TarotCard[]>([]);
  selectedCards = signal<TarotCard[]>([]);
  revealedCards = signal<Set<number>>(new Set());
  
  // Explore Mode Signals
  searchQuery = signal<string>('');
  activeFilter = signal<string>('All');
  filters = ['All', 'Major', 'Wands', 'Cups', 'Swords', 'Pentacles'];

  filteredExploreDeck = computed(() => {
    const deck = this.tarotService.getDeck();
    const query = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();

    return deck.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(query) || 
                            card.keywords.some(k => k.toLowerCase().includes(query));
      const matchesFilter = filter === 'All' ? true : 
                            filter === 'Major' ? card.suit === 'Major' :
                            card.suit === filter;
      return matchesSearch && matchesFilter;
    });
  });

  viewingCard = signal<TarotCard | null>(null);
  isZoomed = signal<boolean>(false);

  // Reading & Display
  aiInterpretation = signal<string>('');
  displayedInterpretation = signal<string>(''); // For typewriter effect
  isLoadingAI = signal<boolean>(false);
  isReadingComplete = signal<boolean>(false);
  
  // Animation States
  isShuffling = signal<boolean>(false); 
  shuffleProgress = signal<number>(0);
  shakeIntensity = signal<number>(0); 
  isGridReshuffling = signal<boolean>(false);
  
  // Particles for shuffle effect
  shuffleParticles = signal<{id: number, angle: number, distance: number, rotation: number}[]>([]);

  // Computed
  maxCards = computed(() => this.selectedSpread() === 'single' ? 1 : 3);
  cardsRemaining = computed(() => this.maxCards() - this.selectedCards().length);
  canProceedFromSelection = computed(() => this.cardsRemaining() === 0);

  constructor() {
    this.deck.set(this.tarotService.getDeck());
  }

  // Haptic Helper
  private vibrate(pattern: number | number[] = 10) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  selectSpread(type: SpreadType) {
    this.vibrate(15);
    this.selectedSpread.set(type);
    // Smooth transition
    setTimeout(() => this.currentState.set('question'), 100);
  }

  exploreCards() {
    this.vibrate(10);
    this.currentState.set('explore');
    this.searchQuery.set('');
    this.activeFilter.set('All');
  }

  setFilter(filter: string) {
    this.vibrate(5);
    this.activeFilter.set(filter);
  }

  openCardDetail(card: TarotCard) {
    this.vibrate(10);
    this.viewingCard.set(card);
    this.isZoomed.set(false);
  }

  closeCardDetail() {
    this.vibrate(10);
    this.viewingCard.set(null);
    this.isZoomed.set(false);
  }

  toggleZoom(event: Event) {
    event.stopPropagation();
    this.vibrate(10);
    this.isZoomed.update(z => !z);
  }

  goBack() {
    this.vibrate(10);
    switch (this.currentState()) {
      case 'explore': this.currentState.set('home'); break;
      case 'question': this.currentState.set('home'); break;
      case 'shuffle': this.currentState.set('question'); break;
      case 'select': this.currentState.set('shuffle'); break; 
      case 'reading': this.currentState.set('home'); break;
      default: this.currentState.set('home'); break;
    }
  }

  startShuffle() {
    this.vibrate(20);
    this.currentState.set('shuffle');
    this.shuffleProgress.set(0);
    this.isShuffling.set(false);
    this.shakeIntensity.set(0);
    this.shuffleParticles.set([]);
  }

  interactShuffle() {
    if (this.shuffleProgress() >= 100) return;

    this.vibrate(8); // Crisp tick feedback

    // Trigger visual shake
    this.isShuffling.set(true);
    this.shakeIntensity.update(v => v + 1);
    
    // Spawn Particles
    const particleCount = 3;
    const newParticles = Array.from({length: particleCount}).map(() => ({
      id: Math.random(),
      angle: Math.random() * 360,
      distance: 100 + Math.random() * 150,
      rotation: (Math.random() - 0.5) * 90
    }));
    
    this.shuffleParticles.update(curr => [...curr, ...newParticles]);
    
    // Cleanup particles after animation
    setTimeout(() => {
      this.shuffleParticles.update(curr => curr.slice(particleCount));
    }, 700);
    
    // Reset shake class trigger after animation duration
    setTimeout(() => this.isShuffling.set(false), 200);

    // Increase progress non-linearly for "momentum" feel
    const increment = Math.max(8, 20 - (this.shuffleProgress() * 0.15)); 
    
    this.shuffleProgress.update(p => {
        const newP = p + increment;
        return newP > 100 ? 100 : newP;
    });

    if (this.shuffleProgress() >= 100) {
      this.vibrate([10, 30, 10]); // Success pattern
      // Complete shuffle after short delay for impact
      setTimeout(() => {
        this.deck.set(this.tarotService.shuffle(this.tarotService.getDeck()));
        this.currentState.set('select');
      }, 600);
    }
  }

  reshuffleGrid() {
    this.vibrate(15);
    this.isGridReshuffling.set(true);
    
    // Animation delay
    setTimeout(() => {
      this.deck.set(this.tarotService.shuffle(this.tarotService.getDeck()));
      this.vibrate([5, 5, 5]);
      
      setTimeout(() => {
        this.isGridReshuffling.set(false);
      }, 300); // Fade back in
    }, 400); // Fade out duration
  }

  onCardSelect(card: TarotCard) {
    if (this.cardsRemaining() > 0 && !this.selectedCards().includes(card)) {
      this.vibrate(15);
      this.selectedCards.update(cards => [...cards, card]);
      
      // Auto-proceed if max cards selected
      if (this.cardsRemaining() === 0) {
        setTimeout(() => this.revealReading(), 800);
      }
    }
  }

  async revealReading() {
    this.currentState.set('reading');
    this.isLoadingAI.set(true);

    // Dramatic reveal sequence with improved timing
    for (let i = 0; i < this.selectedCards().length; i++) {
      await new Promise(r => setTimeout(r, 500)); // Faster 500ms delay between cards
      this.vibrate(20); // Vibrate on reveal
      this.revealedCards.update(set => {
        const newSet = new Set(set);
        newSet.add(this.selectedCards()[i].id);
        return newSet;
      });
    }

    // Call AI
    const result = await this.tarotService.getAIInterpretation(
      this.selectedCards(), 
      this.question(), 
      this.selectedSpread()
    );
    
    this.aiInterpretation.set(result);
    this.isLoadingAI.set(false);
    this.vibrate([10, 50, 10]); // Result ready vibration
    
    this.typewriterEffect(result);
  }

  typewriterEffect(text: string) {
    let i = 0;
    this.displayedInterpretation.set('');
    this.isReadingComplete.set(false);

    // Variable speed for natural feeling (faster chunks)
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        // Larger chunks for performance
        const chunk = text.slice(i, i + 5);
        this.displayedInterpretation.update(curr => curr + chunk);
        i += 5;
      } else {
        clearInterval(typeInterval);
        this.isReadingComplete.set(true);
        this.displayedInterpretation.set(text);
      }
    }, 15);
  }

  reset() {
    this.vibrate(10);
    // Reset flow
    this.question.set('');
    this.selectedCards.set([]);
    this.revealedCards.set(new Set());
    this.aiInterpretation.set('');
    this.displayedInterpretation.set('');
    this.isReadingComplete.set(false);
    this.shuffleProgress.set(0);
    this.viewingCard.set(null);
    this.shuffleParticles.set([]);
    this.currentState.set('home');
    this.isZoomed.set(false);
  }

  getPositionName(index: number): string {
    if (this.selectedSpread() === 'single') return 'The Guidance';
    // For 3 cards
    const names = ['The Foundation', 'The Challenge', 'The Outcome'];
    return names[index] || `Card ${index + 1}`;
  }
}
