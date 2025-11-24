import { ChangeDetectionStrategy, Component, output, input, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-perfil-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil-modal.component.html',
  styleUrl: './perfil-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilModalComponent {
  private readonly formBuilder = new FormBuilder().nonNullable;

  readonly userName = input.required<string>();
  readonly userEmail = input.required<string>();
  readonly close = output<void>();
  readonly submit = output<{ novaSenha: string; confirmarSenha: string }>();

  protected readonly isSubmitting = signal(false);

  protected readonly form = this.formBuilder.group({
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required]]
  });

  protected readonly novaSenhaControl = this.form.controls.novaSenha;
  protected readonly confirmarSenhaControl = this.form.controls.confirmarSenha;

  senhasIguais() {
    const nova = this.novaSenhaControl.value;
    const confirmar = this.confirmarSenhaControl.value;
    return nova === confirmar;
  }

  canSubmit() {
    return this.form.valid && this.senhasIguais() && !this.isSubmitting();
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
    if (this.form.invalid || !this.senhasIguais()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form.getRawValue();
    this.submit.emit(formValue);
  }
}
