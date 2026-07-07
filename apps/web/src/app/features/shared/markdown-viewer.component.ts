import { Component, input, computed } from '@angular/core';
import { marked } from 'marked';

@Component({
  selector: 'app-markdown-viewer',
  standalone: true,
  template: `
    <div class="prose prose-secondary dark:prose-invert max-w-none" [innerHTML]="renderedHtml()"></div>
  `,
  styles: `
    :host { display: block; }
  `,
})
export class MarkdownViewerComponent {
  readonly content = input<string>('');

  protected renderedHtml = computed(() => {
    const md = this.content() || '';
    try {
      return marked.parse(md, { breaks: true, gfm: true }) as string;
    } catch {
      return '<p class="text-danger-500">Error rendering markdown</p>';
    }
  });
}
