import { Component, signal, computed, inject, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarotService, TarotCard, SpreadType } from './services/tarot.service';
import { CardComponent } from './components/card.component';
import { MarkdownPipe } from './pipes/markdown.pipe';

type AppState = 'home' | 'question' | 'shuffle' | 'select' | 'reading' | 'explore' | 'camera';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, MarkdownPipe],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private tarotService = inject(TarotService);

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

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
  isGridReshuffling = signal<boolean>(false);

  // Camera Signals
  isCameraActive = signal<boolean>(false);
  cameraError = signal<string | null>(null);
  capturedImage = signal<string | null>(null);

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
    this.currentState.set('question');
  }

  exploreCards() {
    this.vibrate(10);
    this.currentState.set('explore');
  }

  goBack() {
    this.vibrate(10);
    this.stopCamera();
    this.currentState.set('home');
  }

  startShuffle() {
    this.vibrate(20);
    this.currentState.set('shuffle');
    this.shuffleProgress.set(0);
  }

  async openCamera() {
    this.vibrate(15);
    this.currentState.set('camera');
    this.cameraError.set(null);
    this.isCameraActive.set(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = stream;
      }
    } catch (err) {
      this.cameraError.set('Camera access denied or unavailable.');
      this.isCameraActive.set(false);
    }
  }

  stopCamera() {
    this.isCameraActive.set(false);
    if (this.videoElement && this.videoElement.nativeElement.srcObject) {
      const stream = this.videoElement.nativeElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }

  captureAndAnalyze() {
    this.vibrate([10, 50, 10]);
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      this.capturedImage.set(dataUrl);
      this.stopCamera();
      this.performPhysicalReading(dataUrl);
    }
  }

  async performPhysicalReading(imageData: string) {
    this.currentState.set('reading');
    this.isLoadingAI.set(true);
    
    const shuffled = this.tarotService.shuffle(this.tarotService.getDeck());
    const cards = shuffled.slice(0, 3); // Pick 3 relevant cards for a physical scan
    this.selectedCards.set(cards);

    for (let i = 0; i < cards.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      this.revealedCards.update(set => new Set(set).add(cards[i].id));
      this.tarotService.generateCardImage(cards[i]).then(url => {
        this.selectedCards.update(curr => curr.map(c => c.id === cards[i].id ? { ...c, imageUrl: url } : c));
      });
    }

    const result = await this.tarotService.getAIInterpretation(cards, `Physical card analysis from camera scan. ${this.question()}`, 'three');
    this.aiInterpretation.set(result);
    this.isLoadingAI.set(false);
    this.typewriterEffect(result);
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

  reshuffleGrid() {
    this.isGridReshuffling.set(true);
    this.vibrate(15);
    setTimeout(() => {
      this.deck.set(this.tarotService.shuffle(this.deck()));
      this.isGridReshuffling.set(false);
    }, 400);
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
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      await new Promise(r => setTimeout(r, 600));
      this.vibrate(20);
      this.revealedCards.update(set => new Set(set).add(card.id));
      this.tarotService.generateCardImage(card).then(url => {
        this.selectedCards.update(curr => curr.map(c => c.id === card.id ? { ...c, imageUrl: url } : c));
      });
    }
    const result = await this.tarotService.getAIInterpretation(this.selectedCards(), this.question(), this.selectedSpread());
    this.aiInterpretation.set(result);
    this.isLoadingAI.set(false);
    this.typewriterEffect(result);
  }

  typewriterEffect(text: string) {
    let i = 0;
    this.displayedInterpretation.set('');
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
    this.isReadingComplete.set(false);
    this.capturedImage.set(null);
  }

  getPositionName(index: number): string {
    if (this.selectedSpread() === 'single') return 'The Energy';
    const names = ['The Foundation', 'The Challenge', 'The Outcome'];
    return names[index] || `Card ${index + 1}`;
  }

  filteredExploreDeck() {
    const query = this.searchQuery().toLowerCase();
    const filter = this.activeFilter();
    return this.deck().filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(query) || 
                            card.traditionalName.toLowerCase().includes(query) ||
                            card.keywords.some(k => k.toLowerCase().includes(query));
      const matchesFilter = filter === 'All' || card.suit === filter;
      return matchesSearch && matchesFilter;
    });
  }

  setFilter(filter: string) {
    this.vibrate(10);
    this.activeFilter.set(filter);
  }

  openCardDetail(card: TarotCard) {
    this.vibrate(15);
    this.viewingCard.set(card);
  }

  closeCardDetail() {
    this.vibrate(5);
    this.viewingCard.set(null);
    this.isZoomed.set(false);
  }

  toggleZoom(e: Event) {
    e.stopPropagation();
    this.vibrate(10);
    this.isZoomed.update(z => !z);
  }

  shuffleParticles = computed(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i * 30) + (this.shuffleProgress() * 2),
      distance: 100 + (this.shuffleProgress() * 1.5),
      rotation: this.shuffleProgress() * 3
    }));
  });
}