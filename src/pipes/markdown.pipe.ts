
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    // Basic Markdown parsing for bold and headers
    let html = value
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-cinzel text-[#D4AF37] mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-cinzel text-[#D4AF37] mt-6 mb-3">$1</h2>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-[#D4AF37] font-bold">$1</strong>')
      // Lists
      .replace(/^\d\. (.*$)/gim, '<div class="ml-4 mb-1 flex"><span class="mr-2 text-[#D4AF37]">•</span> $1</div>')
      // Line breaks
      .replace(/\n/gim, '<br>');

    return html;
  }
}
