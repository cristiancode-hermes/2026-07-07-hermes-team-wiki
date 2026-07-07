import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorToolbarComponent } from './editor-toolbar.component';
import { MarkdownViewerComponent } from './markdown-viewer.component';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [FormsModule, EditorToolbarComponent, MarkdownViewerComponent],
  template: `
    <div class="border border-secondary-300 dark:border-secondary-600 rounded-lg overflow-hidden">
      <app-editor-toolbar (action)="handleToolbar($event)" />
      <div class="flex flex-col lg:flex-row">
        <textarea
          [ngModel]="value()"
          (ngModelChange)="value.set($event)"
          class="w-full lg:w-1/2 min-h-[400px] p-4 font-mono text-sm bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 border-r border-secondary-200 dark:border-secondary-700 focus:outline-none resize-y"
          placeholder="Write your markdown here..."
        ></textarea>
        <div class="w-full lg:w-1/2 min-h-[400px] p-4 bg-white dark:bg-secondary-800 overflow-auto">
          <app-markdown-viewer [content]="value()" />
        </div>
      </div>
    </div>
  `,
})
export class MarkdownEditorComponent {
  readonly value = model<string>('');

  handleToolbar(action: string): void {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = this.value().substring(start, end);
    let replacement = '';
    let cursorOffset = 0;

    switch (action) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        cursorOffset = selected ? 0 : -'bold text'.length - 4;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        cursorOffset = selected ? 0 : -'italic text'.length - 2;
        break;
      case 'h1':
        replacement = `\n# ${selected || 'Heading 1'}\n`;
        cursorOffset = selected ? 0 : -'Heading 1\n'.length - 3;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Heading 2'}\n`;
        cursorOffset = selected ? 0 : -'Heading 2\n'.length - 4;
        break;
      case 'h3':
        replacement = `\n### ${selected || 'Heading 3'}\n`;
        cursorOffset = selected ? 0 : -'Heading 3\n'.length - 5;
        break;
      case 'ul':
        replacement = `\n- ${selected || 'list item'}\n`;
        cursorOffset = selected ? 0 : -'list item\n'.length - 3;
        break;
      case 'ol':
        replacement = `\n1. ${selected || 'list item'}\n`;
        cursorOffset = selected ? 0 : -'list item\n'.length - 4;
        break;
      case 'code':
        replacement = selected.includes('\n')
          ? `\n\`\`\`\n${selected || 'code block'}\n\`\`\`\n`
          : `\`${selected || 'code'}\``;
        cursorOffset = selected ? 0 : -'code'.length - 2;
        break;
      case 'link':
        replacement = `[${selected || 'link text'}](url)`;
        cursorOffset = selected ? -'(url)'.length : -'link text](url)'.length - 2;
        break;
      default:
        return;
    }

    const newValue = this.value().substring(0, start) + replacement + this.value().substring(end);
    this.value.set(newValue);

    setTimeout(() => {
      const pos = start + replacement.length + cursorOffset;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  }
}
