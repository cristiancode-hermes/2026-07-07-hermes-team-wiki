import { Component, input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [NgStyle],
  template: `
    <div
      class="inline-flex items-center justify-center rounded-full font-medium select-none shrink-0"
      [class]="sizeClass()"
      [ngStyle]="bgStyle()"
      [attr.title]="name()"
    >
      @if (src()) {
        <img [src]="src()" [alt]="name()" class="rounded-full w-full h-full object-cover" />
      } @else {
        <span class="text-white">{{ initials() }}</span>
      }
    </div>
  `,
})
export class AvatarComponent {
  readonly src = input<string | undefined>();
  readonly name = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected sizeClass = () => {
    switch (this.size()) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'lg': return 'w-10 h-10 text-base';
      default: return 'w-8 h-8 text-sm';
    }
  };

  protected bgStyle = () => {
    const colors = [
      '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
      '#f43f5e', '#f97316', '#eab308', '#22c55e',
      '#14b8a6', '#06b6d4', '#3b82f6', '#6b7280',
    ];
    const hash = this.name().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return { backgroundColor: colors[hash % colors.length] };
  };

  protected initials = (): string => {
    return this.name()
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
}
