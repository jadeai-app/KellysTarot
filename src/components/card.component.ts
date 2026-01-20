
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
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
           <!-- Holographic Sheen Layer -->
           <div class="absolute inset-0 z-30 opacity-10 group-hover:opacity-30 pointer-events-none transition-opacity duration-700 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:250%_100%] animate-[holo-sheen_3s_linear_infinite]"></div>
           
           <!-- Art Section -->
           <div class="h-[75%] w-full relative overflow-hidden border-b-2 border-[#D4AF37]/50 bg-[#030205]">
              @if (card().imageUrl) {
                <img [src]="card().imageUrl" 
                     class="w-full h-full object-cover transition-transform duration-1000"
                     [class.rotate-180]="card().isReversed"
                     [alt]="card().title">
              } @else {
                <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#1a0f2e] to-black">
                   <span class="text-4xl md:text-6xl text-[#D4AF37] opacity-40 animate-pulse">✦</span>
                   <span class="text-[10px] uppercase tracking-widest text-[#D4AF37]/40">Materializing...</span>
                </div>
              }
              
              <!-- Traditional Roman Numeral Badge -->
              @if(getRomanNumeral(card().id); as roman) {
                <div class="absolute top-2 w-full flex justify-center z-10">
                   <div class="bg-black/60 backdrop-blur-md px-3 py-0.5 rounded-full border border-[#D4AF37]/50">
                      <span class="text-[#D4AF37] font-cinzel text-[10px] font-bold tracking-widest">{{ roman }}</span>
                   </div>
                </div>
              }
           </div>

           <!-- Text Section -->
           <div class="h-[25%] bg-[#F5F1E8] flex flex-col items-center justify-center p-3 text-center z-10">
              <h3 class="font-cinzel font-extrabold text-sm md:text-lg leading-tight text-[#2D1B4E] uppercase tracking-wide mb-1 px-1">
                {{ card().title }}
              </h3>
              <div class="flex items-center justify-center gap-2 opacity-60">
                 <div class="h-px w-4 bg-[#2D1B4E]"></div>
                 <p class="font-lato text-[9px] font-bold uppercase tracking-widest text-[#2D1B4E]">{{ card().traditionalName }}</p>
                 <div class="h-px w-4 bg-[#2D1B4E]"></div>
              </div>
              @if (card().isReversed) {
                <span class="text-[8px] font-bold text-red-800 uppercase tracking-widest mt-1">Reversed</span>
              }
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
      30% { transform: rotateY(90deg) scale(1.15) translateZ(50px); }
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

  getRomanNumeral(id: number): string {
    if (id > 21) return ''; 
    const romans = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
    return romans[id] || '';
  }
}
