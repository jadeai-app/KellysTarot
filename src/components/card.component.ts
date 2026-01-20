
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarotCard } from '../services/tarot.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full cursor-pointer perspective-1000 group select-none">
      <div class="relative w-full h-full transform-style-3d shadow-2xl rounded-xl group-hover:scale-[1.02] group-hover:-translate-y-1 transition-all duration-300"
           [class.rotate-y-180]="revealed() && !animateFlip()"
           [class.animate-flip-reveal]="revealed() && animateFlip()">
        
        <!-- CARD BACK -->
        <div class="absolute w-full h-full backface-hidden rounded-xl bg-[#140b24] overflow-hidden shadow-inner border border-[#D4AF37]/30 z-0">
           <div class="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
           <div class="absolute inset-1.5 border-[2px] border-[#D4AF37]/60 rounded-lg"></div>
           
           <div class="absolute inset-0 flex items-center justify-center">
             <div class="w-24 h-24 md:w-40 md:h-40 border border-[#D4AF37]/20 rounded-full flex items-center justify-center animate-[spin_25s_linear_infinite]">
               <div class="w-16 h-16 md:w-30 md:h-30 border border-[#D4AF37]/30 rounded-full rotate-45"></div>
             </div>
             <div class="absolute w-8 h-8 md:w-12 md:h-12 bg-[#D4AF37]/10 rounded-full backdrop-blur-sm border border-[#D4AF37]/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
               <span class="text-sm md:text-2xl opacity-80 text-[#D4AF37]">✦</span>
             </div>
           </div>
        </div>

        <!-- CARD FRONT -->
        <div class="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl bg-[#F5F1E8] text-[#2D1B4E] overflow-hidden border-[4px] border-[#D4AF37] flex flex-col shadow-2xl">
           <div class="absolute inset-1 border border-[#2D1B4E]/20 rounded-lg pointer-events-none z-20"></div>

           <!-- Art Section -->
           <div class="h-[70%] w-full relative overflow-hidden border-b-4 border-[#D4AF37] bg-slate-200">
              <div class="absolute inset-0 transition-transform duration-1000" 
                   [style.background]="getGradient(card())"></div>
              
              <div class="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/canvas-orange.png')] mix-blend-multiply"></div>

              <div class="absolute inset-0 flex items-center justify-center transition-transform duration-1000"
                   [class.rotate-180]="card().isReversed">
                 <span class="font-cinzel text-6xl md:text-9xl text-white opacity-95 drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] transform scale-110 group-hover:scale-125 transition-transform duration-1000">
                    {{ getSuitIcon(card().suit) }}
                 </span>
              </div>

              @if(getRomanNumeral(card().id); as roman) {
                <div class="absolute top-2 md:top-3 w-full flex justify-center z-10">
                   <div class="bg-[#1a0f2e]/90 backdrop-blur-md px-2 py-0.5 md:px-3 rounded-full border border-[#D4AF37] shadow-lg">
                      <span class="text-[#D4AF37] font-cinzel text-[9px] md:text-xs font-bold tracking-widest">{{ roman }}</span>
                   </div>
                </div>
              }
           </div>

           <!-- Text Section -->
           <div class="h-[30%] bg-[#F5F1E8] flex flex-col items-center justify-center p-1.5 md:p-3 relative text-center z-10">
              <h3 class="font-cinzel font-extrabold text-sm md:text-xl leading-tight text-[#2D1B4E] uppercase tracking-wide mb-1 px-1 line-clamp-2">
                {{ card().title }}
              </h3>
              
              <div class="flex items-center justify-center gap-1.5 w-full opacity-70">
                 <div class="h-[1px] bg-[#2D1B4E] w-2 md:w-4"></div>
                 <p class="font-lato text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-[#2D1B4E] whitespace-nowrap">{{ card().traditionalName }}</p>
                 <div class="h-[1px] bg-[#2D1B4E] w-2 md:w-4"></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
    .perspective-1000 { perspective: 1000px; }
    .transform-style-3d { transform-style: preserve-3d; }
    @keyframes flip-reveal-3d {
      0% { transform: rotateY(0deg) scale(1); }
      30% { transform: rotateY(90deg) scale(1.25) translateZ(80px); }
      100% { transform: rotateY(180deg) scale(1); }
    }
    .animate-flip-reveal {
      animation: flip-reveal-3d 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
  `]
})
export class CardComponent {
  card = input.required<TarotCard>();
  revealed = input<boolean>(false);
  animateFlip = input<boolean>(false);

  getGradient(card: TarotCard): string {
    const gradients = [
      'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
      'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    ];
    if (card.suit === 'Major') {
       return 'radial-gradient(circle at top right, #4B0082, #1a0f2e)'; 
    }
    return gradients[card.id % gradients.length] || gradients[0];
  }

  getSuitIcon(suit: string): string {
    switch(suit) {
      case 'Major': return '❂'; 
      case 'Cups': return '🜄'; 
      case 'Swords': return '🜁'; 
      case 'Wands': return '🜂'; 
      case 'Pentacles': return '🜃'; 
      default: return '★';
    }
  }

  getRomanNumeral(id: number): string {
    if (id > 21) return ''; 
    const romans = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
    return romans[id] || '';
  }
}
