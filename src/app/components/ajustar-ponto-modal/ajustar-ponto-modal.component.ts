import { ChangeDetectionStrategy, Component, output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-ajustar-ponto-modal',
  imports: [ReactiveFormsModule, NgxMaskDirective],
  templateUrl: './ajustar-ponto-modal.component.html',
  styleUrl: './ajustar-ponto-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AjustarPontoModalComponent {
  private readonly formBuilder = new FormBuilder().nonNullable;

  readonly close = output<void>();
  readonly submit = output<{ data: string; hora: string; justificativa: string }>();

  protected readonly isSubmitting = signal(false);
  protected readonly futureDateTimeError = signal(false);

  protected readonly form = this.formBuilder.group({
    data: ['', [Validators.required , Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/)]],
    hora: ['', [Validators.required , Validators.pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/)]],
    justificativa: ['', [Validators.required, Validators.maxLength(100)]]
  });

  protected readonly dataControl = this.form.controls.data;
  protected readonly horaControl = this.form.controls.hora;
  protected readonly justificativaControl = this.form.controls.justificativa;

  protected canSubmit = false;

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

    // Valida se não é data/hora futura
    if (!this.validateDateTime()) {
      this.futureDateTimeError.set(true);
      return;
    }

    this.futureDateTimeError.set(false);
    const formValue = this.form.getRawValue();
    this.submit.emit(formValue);
  }

  private validateDateTime(): boolean {
    const data = this.dataControl.value;
    const hora = this.horaControl.value;

    if (!data || !hora) {
      return false;
    }

    // Parse da data no formato DD/MM/YYYY
    const dataParts = data.split('/');
    if (dataParts.length !== 3) {
      return false;
    }

    const dia = parseInt(dataParts[0], 10);
    const mes = parseInt(dataParts[1], 10) - 1; // Mês é 0-indexed
    const ano = parseInt(dataParts[2], 10);

    // Parse da hora no formato HH:MM
    const horaParts = hora.split(':');
    if (horaParts.length !== 2) {
      return false;
    }

    const horas = parseInt(horaParts[0], 10);
    const minutos = parseInt(horaParts[1], 10);

    // Valida se são números válidos
    if (isNaN(dia) || isNaN(mes) || isNaN(ano) || isNaN(horas) || isNaN(minutos)) {
      return false;
    }

    // Valida ranges básicos
    if (dia < 1 || dia > 31 || mes < 0 || mes > 11 || ano < 1900 || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
      return false;
    }

    // Cria o objeto Date com horário de Brasília
    const dataHoraInformada = new Date(ano, mes, dia, horas, minutos);
    const agora = new Date();

    // Verifica se a data/hora é no futuro

    return dataHoraInformada <= agora;
  }

  private checkFutureDateTime(): void {
    const data = this.dataControl.value;
    const hora = this.horaControl.value;

    // Só valida se ambos os campos estiverem preenchidos e válidos
    if (data && hora && this.dataControl.valid && this.horaControl.valid) {
      const isValid = this.validateDateTime();
      this.futureDateTimeError.set(!isValid);
    } else {
      this.futureDateTimeError.set(false);
    }
  }

  onFieldChange(): void {
    this.checkFutureDateTime();
    if (this.form.valid && !this.futureDateTimeError()) {
      this.canSubmit = true;
    }
  }
}
