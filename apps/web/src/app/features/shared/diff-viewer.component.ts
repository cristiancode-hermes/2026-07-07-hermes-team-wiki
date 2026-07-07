import { Component, input } from '@angular/core';

@Component({
  selector: 'app-diff-viewer',
  standalone: true,
  template: `
    <div class="font-mono text-sm border border-secondary-200 dark:border-secondary-700 rounded-lg overflow-hidden">
      @if (oldContent() === newContent()) {
        <div class="p-4 text-center text-secondary-500 dark:text-secondary-400">No changes</div>
      } @else {
        <div class="divide-y divide-secondary-200 dark:divide-secondary-700">
          @for (line of diffLines(); track $index) {
            <div class="flex">
              <span class="w-12 shrink-0 text-right pr-3 py-0.5 text-secondary-400 dark:text-secondary-500 select-none border-r border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900">
                {{ line.oldLine || '' }}
              </span>
              <span class="w-12 shrink-0 text-right pr-3 py-0.5 text-secondary-400 dark:text-secondary-500 select-none border-r border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900">
                {{ line.newLine || '' }}
              </span>
              <span class="flex-1 px-3 py-0.5 whitespace-pre-wrap break-all" [class]="lineClass(line.type)">
                {{ line.content }}
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DiffViewerComponent {
  readonly oldContent = input<string>('');
  readonly newContent = input<string>('');

  protected diffLines = () => {
    const oldLines = (this.oldContent() || '').split('\n');
    const newLines = (this.newContent() || '').split('\n');
    const result: Array<{ type: 'same' | 'added' | 'removed'; content: string; oldLine?: number; newLine?: number }> = [];

    const maxLen = Math.max(oldLines.length, newLines.length);
    let oldIdx = 0;
    let newIdx = 0;

    for (let i = 0; i < maxLen; i++) {
      if (i < oldLines.length && i < newLines.length) {
        if (oldLines[i] === newLines[i]) {
          result.push({ type: 'same', content: oldLines[i], oldLine: ++oldIdx, newLine: ++newIdx });
        } else {
          result.push({ type: 'removed', content: oldLines[i], oldLine: ++oldIdx });
          result.push({ type: 'added', content: newLines[i], newLine: ++newIdx });
        }
      } else if (i < oldLines.length) {
        result.push({ type: 'removed', content: oldLines[i], oldLine: ++oldIdx });
      } else {
        result.push({ type: 'added', content: newLines[i], newLine: ++newIdx });
      }
    }

    return result;
  };

  protected lineClass = (type: string) => {
    switch (type) {
      case 'added': return 'bg-success-50 dark:bg-success-900/20 text-success-800 dark:text-success-300';
      case 'removed': return 'bg-danger-50 dark:bg-danger-900/20 text-danger-800 dark:text-danger-300';
      default: return 'text-secondary-700 dark:text-secondary-300';
    }
  };
}
