import { Component, input, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TreeNodeComponent } from './tree-node.component';
import { Page } from '../../core/models';

@Component({
  selector: 'app-page-tree',
  standalone: true,
  imports: [RouterLink, TreeNodeComponent],
  template: `
    <div class="space-y-0.5">
      @for (page of pages(); track page.id) {
        <app-tree-node
          [node]="page"
          [active]="activeId() === page.id"
          [activeId]="activeId()"
          [expanded]="expandedIds().includes(page.id)"
          [expandedIds]="expandedIds()"
          (toggle)="toggleNode(page.id)"
          (childToggle)="toggleNode($event)"
        />
      }
    </div>
  `,
})
export class PageTreeComponent {
  readonly pages = input<Page[]>([]);
  readonly activeId = input<string>('');
  readonly expandedIds = input<string[]>([]);

  toggleNode(id: string): void {
    // Parent handles expansion state
  }
}
