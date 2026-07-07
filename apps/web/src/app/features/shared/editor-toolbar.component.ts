import { Component, output } from '@angular/core';

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  template: `
    <div class="flex flex-wrap items-center gap-1 p-2 bg-secondary-50 dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700">
      <button (click)="action.emit('bold')" class="toolbar-btn" title="Bold (Ctrl+B)"><strong>B</strong></button>
      <button (click)="action.emit('italic')" class="toolbar-btn" title="Italic (Ctrl+I)"><em>I</em></button>
      <span class="w-px h-5 bg-secondary-300 dark:bg-secondary-600 mx-1"></span>
      <button (click)="action.emit('h1')" class="toolbar-btn" title="Heading 1">H1</button>
      <button (click)="action.emit('h2')" class="toolbar-btn" title="Heading 2">H2</button>
      <button (click)="action.emit('h3')" class="toolbar-btn" title="Heading 3">H3</button>
      <span class="w-px h-5 bg-secondary-300 dark:bg-secondary-600 mx-1"></span>
      <button (click)="action.emit('ul')" class="toolbar-btn" title="Unordered list">UL</button>
      <button (click)="action.emit('ol')" class="toolbar-btn" title="Ordered list">OL</button>
      <button (click)="action.emit('code')" class="toolbar-btn" title="Code block">&lt;/&gt;</button>
      <button (click)="action.emit('link')" class="toolbar-btn" title="Insert link">🔗</button>
    </div>
  `,
  styles: `
    .toolbar-btn {
      @apply px-2.5 py-1 text-xs font-medium rounded 
             text-secondary-600 dark:text-secondary-400 
             hover:bg-secondary-200 dark:hover:bg-secondary-700 
             hover:text-secondary-800 dark:hover:text-secondary-200 
             transition-colors;
    }
  `,
})
export class EditorToolbarComponent {
  readonly action = output<string>();
}
