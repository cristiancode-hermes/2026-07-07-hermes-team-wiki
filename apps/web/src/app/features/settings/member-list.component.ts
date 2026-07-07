import { Component, inject, input, output, signal } from '@angular/core';
import { User } from '../../core/models';
import { AvatarComponent } from '../shared/avatar.component';
import { BadgeComponent, BadgeVariant } from '../shared/badge.component';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [AvatarComponent, BadgeComponent, ConfirmModalComponent],
  template: `
    <div class="divide-y divide-secondary-100 dark:divide-secondary-700">
      @for (member of members(); track member.id) {
        <div class="flex items-center justify-between py-3">
          <div class="flex items-center gap-3">
            <app-avatar [name]="member.name" size="sm" />
            <div>
              <p class="text-sm font-medium text-secondary-900 dark:text-secondary-100">{{ member.name }}</p>
              <p class="text-xs text-secondary-500">{{ member.email }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <app-badge [variant]="roleVariant(member.role)">{{ member.role }}</app-badge>

            @if (editable()) {
              @if (member.role !== 'admin') {
                <button
                  (click)="promote.emit(member)"
                  class="px-2 py-1 text-xs rounded border border-secondary-300 dark:border-secondary-600 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700"
                >
                  Make Editor
                </button>
              }
              <button
                (click)="removeTarget.set(member)"
                class="px-2 py-1 text-xs rounded border border-danger-300 dark:border-danger-700 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
              >
                Remove
              </button>
            }
          </div>
        </div>
      }
    </div>

    @if (removeTarget(); as target) {
      <app-confirm-modal
        [isOpen]="true"
        title="Remove Member"
        [message]="'Are you sure you want to remove ' + target.name + ' from the organization?'"
        confirmLabel="Remove"
        variant="danger"
        (confirm)="confirmRemove.emit(target.id); removeTarget.set(null)"
        (cancel)="removeTarget.set(null)"
      />
    }
  `,
})
export class MemberListComponent {
  readonly members = input.required<User[]>();
  readonly editable = input(false);
  readonly promote = output<User>();
  readonly confirmRemove = output<string>();
  protected readonly removeTarget = signal<User | null>(null);

  protected roleVariant(role: string): BadgeVariant {
    switch (role) {
      case 'admin': return 'primary';
      case 'editor': return 'success';
      default: return 'secondary';
    }
  }
}
