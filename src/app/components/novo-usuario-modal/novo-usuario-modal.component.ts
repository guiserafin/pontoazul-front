import { ChangeDetectionStrategy, Component, output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-novo-usuario-modal',
  imports: [ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './novo-usuario-modal.component.html',
  styleUrl: './novo-usuario-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NovoUsuarioModalComponent {
  private readonly formBuilder = new FormBuilder().nonNullable;

  readonly close = output<void>();
  readonly submit = output<{ name: string; email: string; cpf: string; isAdmin: boolean }>();

  protected readonly isSubmitting = signal(false);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    isAdmin: [false],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]]
  });

  protected readonly nameControl = this.form.controls.name;
  protected readonly emailControl = this.form.controls.email;
  protected readonly isAdminControl = this.form.controls.isAdmin;
  protected readonly cpfControl = this.form.controls.cpf;

  protected readonly isAdmin = computed(() => this.isAdminControl.value);

  constructor() {

  }

  canSubmit() {
    return this.form.valid && !this.isSubmitting();
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.getRawValue();
    this.submit.emit(formValue);
  }
}
