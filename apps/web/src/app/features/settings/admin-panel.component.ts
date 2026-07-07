import { Component, inject, signal } from '@angular/core';
import { OrgService } from '../../core/services/org.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';
import { MemberListComponent } from './member-list.component';
import { ErrorStateComponent } from '../shared/error-state.component';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [MemberListComponent, ErrorStateComponent, SkeletonLoaderComponent],
  template: `
    <div class="max-w-3xl space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Admin Panel</h1>
        <p class="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Manage organization members</p>
      </div>

      <div class="bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 shadow-sm">
        <div class="px-5 py-4 border-b border-secondary-200 dark:border-secondary-700">
          <h2 class="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Members ({{ members().length }})</h2>
        </div>
        <div class="p-5">
          @if (loading()) {
            <app-skeleton-loader />
          } @else if (error()) {
            <app-error-state [message]="error()" (retry)="loadMembers()" />
          } @else {
            <app-member-list
              [members]="members()"
              [editable]="true"
              (promote)="promoteMember($event)"
              (confirmRemove)="removeMember($event)"
            />
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminPanelComponent {
  private orgService = inject(OrgService);
  private authService = inject(AuthService);

  protected readonly members = signal<User[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.loadMembers();
  }

  protected loadMembers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.orgService.getMembers().subscribe({
      next: (members) => { this.members.set(members); this.loading.set(false); },
      error: (e) => { this.error.set(e.message); this.loading.set(false); },
    });
  }

  protected promoteMember(member: User): void {
    this.orgService.updateMemberRole(member.id, 'editor').subscribe({
      next: (updated) => {
        this.members.update(members =>
          members.map(m => m.id === updated.id ? updated : m)
        );
      },
    });
  }

  protected removeMember(userId: string): void {
    this.orgService.removeMember(userId).subscribe({
      next: () => {
        this.members.update(members => members.filter(m => m.id !== userId));
      },
    });
  }
}
